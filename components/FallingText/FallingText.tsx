"use client";

import {
  type CSSProperties,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Matter from "matter-js";
import styles from "./FallingText.module.css";

type FallingTextTrigger = "click" | "hover" | "auto" | "scroll";

type FallingTextProps = {
  className?: string;
  text?: string;
  highlightWords?: string[];
  highlightClass?: string;
  trigger?: FallingTextTrigger;
  backgroundColor?: string;
  wireframes?: boolean;
  gravity?: number;
  mouseConstraintStiffness?: number;
  fontSize?: string;
  wordSpacing?: string;
};

type TextLine = {
  id: string;
  words: Array<{
    id: string;
    refIndex: number;
    value: string;
  }>;
};

export default function FallingText({
  className = "",
  text = "",
  highlightWords = [],
  highlightClass = "",
  trigger = "auto",
  backgroundColor = "transparent",
  wireframes = false,
  gravity = 1,
  mouseConstraintStiffness = 0.2,
  fontSize = "1rem",
  wordSpacing = "0.25em",
}: FallingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [effectStarted, setEffectStarted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] =
    useState(false);
  const [layoutVersion, setLayoutVersion] = useState(0);

  const lines = useMemo<TextLine[]>(() => {
    const parsedLines = text
      .split("\n")
      .map((line) =>
        line
          .trim()
          .split(/\s+/)
          .filter(Boolean),
      )
      .filter((line) => line.length > 0);

    return parsedLines.map((line, lineIndex) => {
      const lineOffset = parsedLines
        .slice(0, lineIndex)
        .reduce(
          (total, previousLine) => total + previousLine.length,
          0,
        );

      return {
        id: `line-${lineIndex}`,
        words: line.map((word, wordIndex) => ({
          id: `${lineIndex}-${wordIndex}-${word}`,
          refIndex: lineOffset + wordIndex,
          value: word,
        })),
      };
    });
  }, [text]);
  const accessibleLabel = lines
    .map((line) => line.words.map(({ value }) => value).join(" "))
    .join(", ");
  const isInteractive = trigger === "click" || trigger === "hover";

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    if (trigger === "auto") {
      const frameId = requestAnimationFrame(() => {
        setEffectStarted(true);
      });
      return () => cancelAnimationFrame(frameId);
    }

    const container = containerRef.current;
    if (trigger !== "scroll" || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setEffectStarted(true);
        observer.disconnect();
      },
      { threshold: 0.1 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [prefersReducedMotion, trigger]);

  useEffect(() => {
    if (!effectStarted) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setLayoutVersion((version) => version + 1);
      }, 120);
    };

    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", onResize);
    };
  }, [effectStarted]);

  useEffect(() => {
    const container = containerRef.current;
    const canvasContainer = canvasContainerRef.current;
    if (
      !effectStarted ||
      prefersReducedMotion ||
      !container ||
      !canvasContainer
    ) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;
    if (width <= 0 || height <= 0) return;

    const {
      Bodies,
      Engine,
      Mouse,
      MouseConstraint,
      Render,
      Runner,
      World,
    } = Matter;
    const engine = Engine.create();
    engine.world.gravity.y = gravity;

    const render = Render.create({
      element: canvasContainer,
      engine,
      options: {
        width,
        height,
        background: backgroundColor,
        wireframes,
      },
    });
    const boundaryOptions = {
      isStatic: true,
      render: { fillStyle: "transparent" },
    };
    const floor = Bodies.rectangle(
      width / 2,
      height + 25,
      width,
      50,
      boundaryOptions,
    );
    const ceiling = Bodies.rectangle(
      width / 2,
      -25,
      width,
      50,
      boundaryOptions,
    );
    const leftWall = Bodies.rectangle(
      -25,
      height / 2,
      50,
      height,
      boundaryOptions,
    );
    const rightWall = Bodies.rectangle(
      width + 25,
      height / 2,
      50,
      height,
      boundaryOptions,
    );
    const wordBodies = wordRefs.current.flatMap((element) => {
      if (!element) return [];

      const rect = element.getBoundingClientRect();
      const x = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top + rect.height / 2;
      const body = Bodies.rectangle(x, y, rect.width, rect.height, {
        render: { fillStyle: "transparent" },
        restitution: 0.72,
        frictionAir: 0.012,
        friction: 0.2,
      });

      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 3,
        y: 0,
      });
      Matter.Body.setAngularVelocity(
        body,
        (Math.random() - 0.5) * 0.04,
      );

      element.style.position = "absolute";
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      element.style.transform = "translate(-50%, -50%)";

      return [{ body, element }];
    });
    const mouse = Mouse.create(container);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: mouseConstraintStiffness,
        render: { visible: false },
      },
    });
    render.mouse = mouse;

    World.add(engine.world, [
      floor,
      ceiling,
      leftWall,
      rightWall,
      mouseConstraint,
      ...wordBodies.map(({ body }) => body),
    ]);

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    let frameId = 0;
    const syncWords = () => {
      wordBodies.forEach(({ body, element }) => {
        element.style.left = `${body.position.x}px`;
        element.style.top = `${body.position.y}px`;
        element.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
      });
      frameId = requestAnimationFrame(syncWords);
    };
    syncWords();

    return () => {
      cancelAnimationFrame(frameId);
      Render.stop(render);
      Runner.stop(runner);
      Mouse.clearSourceEvents(mouse);
      World.clear(engine.world, false);
      Engine.clear(engine);
      render.canvas.remove();
      wordBodies.forEach(({ element }) => {
        element.removeAttribute("style");
      });
    };
  }, [
    backgroundColor,
    effectStarted,
    gravity,
    layoutVersion,
    mouseConstraintStiffness,
    prefersReducedMotion,
    wireframes,
  ]);

  const startEffect = () => {
    if (!prefersReducedMotion && !effectStarted && isInteractive) {
      setEffectStarted(true);
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    startEffect();
  };
  const containerClassName = [
    styles.container,
    isInteractive && !prefersReducedMotion ? styles.interactive : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const customProperties = {
    "--falling-text-font-size": fontSize,
    "--falling-text-word-spacing": wordSpacing,
  } as CSSProperties;

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      style={customProperties}
      onClick={isInteractive ? startEffect : undefined}
      onPointerEnter={trigger === "hover" ? startEffect : undefined}
      onKeyDown={isInteractive ? onKeyDown : undefined}
      tabIndex={isInteractive && !prefersReducedMotion ? 0 : undefined}
      role={isInteractive && !prefersReducedMotion ? "button" : undefined}
      aria-label={accessibleLabel}
    >
      <div className={styles.target} aria-hidden="true">
        {lines.map((line, lineIndex) => (
          <span key={line.id} className={styles.line}>
            {line.words.map(({ id, refIndex, value }) => {
              const highlighted = highlightWords.some((highlight) =>
                value.startsWith(highlight),
              );

              return (
                <span
                  key={id}
                  ref={(element) => {
                    wordRefs.current[refIndex] = element;
                  }}
                  className={[
                    styles.word,
                    highlighted ? highlightClass : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {value}
                </span>
              );
            })}
            {lineIndex < lines.length - 1 ? (
              <span className={styles.lineBreak} aria-hidden="true" />
            ) : null}
          </span>
        ))}
      </div>
      <div ref={canvasContainerRef} className={styles.canvas} />
    </div>
  );
}
