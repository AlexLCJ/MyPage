"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./TextPressure.module.css";

type Point = {
  x: number;
  y: number;
};

type TextPressureProps = {
  text?: string;
  as?: "h1" | "div";
  fontFamily?: string;
  fontUrl?: string;
  width?: boolean;
  weight?: boolean;
  minWeight?: number;
  maxWeight?: number;
  italic?: boolean;
  alpha?: boolean;
  flex?: boolean;
  stroke?: boolean;
  scale?: boolean;
  textColor?: string;
  strokeColor?: string;
  className?: string;
  minFontSize?: number;
  ariaLabel?: string;
  ariaHidden?: boolean;
};

const distanceBetween = (a: Point, b: Point) => {
  const deltaX = b.x - a.x;
  const deltaY = b.y - a.y;

  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};

const getAttributeValue = (
  distance: number,
  maxDistance: number,
  minValue: number,
  maxValue: number,
) => {
  const value =
    maxValue -
    Math.abs((maxValue * distance) / Math.max(maxDistance, 1));

  return Math.max(minValue, value + minValue);
};

export default function TextPressure({
  text = "Compressa",
  as = "h1",
  fontFamily = "Roboto Flex",
  fontUrl = "https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000&display=swap",
  width = true,
  weight = true,
  minWeight = 200,
  maxWeight = 950,
  italic = true,
  alpha = false,
  flex = true,
  stroke = false,
  scale = false,
  textColor = "#ffffff",
  strokeColor = "#ff0000",
  className = "",
  minFontSize = 24,
  ariaLabel,
  ariaHidden = false,
}: TextPressureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const characterRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const pointerRef = useRef<Point>({ x: 0, y: 0 });
  const animatedPointerRef = useRef<Point>({ x: 0, y: 0 });
  const reducedMotionRef = useRef(false);

  const [fontSize, setFontSize] = useState(minFontSize);
  const [scaleY, setScaleY] = useState(1);
  const [lineHeight, setLineHeight] = useState(1);

  const characters = useMemo(() => Array.from(text), [text]);

  const centerPointer = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { left, top, width: containerWidth, height } =
      container.getBoundingClientRect();
    const visibleCharacters = characterRefs.current.filter(
      (character): character is HTMLSpanElement =>
        Boolean(character?.textContent?.trim()),
    );
    const firstCharacter = visibleCharacters[0];
    const lastCharacter =
      visibleCharacters[visibleCharacters.length - 1];
    const firstCharacterRect = firstCharacter?.getBoundingClientRect();
    const lastCharacterRect = lastCharacter?.getBoundingClientRect();
    const contentCenterX =
      !flex && firstCharacterRect && lastCharacterRect
        ? (firstCharacterRect.left + lastCharacterRect.right) / 2
        : left + containerWidth / 2;
    const center = {
      x: contentCenterX,
      y: top + height / 2,
    };

    pointerRef.current = center;
    animatedPointerRef.current = center;
  }, [flex]);

  const setSize = useCallback(() => {
    const container = containerRef.current;
    const title = titleRef.current;
    if (!container || !title) return;

    const { width: containerWidth, height: containerHeight } =
      container.getBoundingClientRect();
    const widthFittedFontSize =
      containerWidth / Math.max(characters.length / 2, 1);
    const nextFontSize = Math.max(
      Math.min(widthFittedFontSize, containerHeight),
      Math.min(minFontSize, containerHeight),
    );

    setFontSize(nextFontSize);
    setScaleY(1);
    setLineHeight(1);

    requestAnimationFrame(() => {
      const currentTitle = titleRef.current;
      if (!currentTitle || !scale) return;

      const { height: textHeight } = currentTitle.getBoundingClientRect();
      if (textHeight <= 0) return;

      const nextScaleY = containerHeight / textHeight;
      setScaleY(nextScaleY);
      setLineHeight(nextScaleY);
    });
  }, [characters.length, minFontSize, scale]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };
    };
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      pointerRef.current = { x: touch.clientX, y: touch.clientY };
    };

    centerPointer();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [centerPointer]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      reducedMotionRef.current = mediaQuery.matches;
    };

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const updateSize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSize();
        centerPointer();
      }, 80);
    };
    const resizeObserver = new ResizeObserver(updateSize);

    setSize();
    resizeObserver.observe(container);
    window.addEventListener("resize", updateSize);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, [centerPointer, setSize]);

  useEffect(() => {
    let frameId = 0;

    const animate = () => {
      const title = titleRef.current;
      const animatedPointer = animatedPointerRef.current;
      const pointer = pointerRef.current;

      if (!reducedMotionRef.current) {
        animatedPointer.x += (pointer.x - animatedPointer.x) / 15;
        animatedPointer.y += (pointer.y - animatedPointer.y) / 15;
      }

      if (title) {
        const titleRect = title.getBoundingClientRect();
        const maxDistance = titleRect.width / 2;

        characterRefs.current.forEach((character) => {
          if (!character) return;

          const characterRect = character.getBoundingClientRect();
          const characterCenter = {
            x: characterRect.x + characterRect.width / 2,
            y: characterRect.y + characterRect.height / 2,
          };
          const pointerDistance = reducedMotionRef.current
            ? maxDistance / 3
            : distanceBetween(animatedPointer, characterCenter);
          const characterWidth = width
            ? Math.floor(
                getAttributeValue(pointerDistance, maxDistance, 5, 200),
              )
            : 100;
          const characterWeight = weight
            ? Math.floor(
                getAttributeValue(
                  pointerDistance,
                  maxDistance,
                  minWeight,
                  maxWeight,
                ),
              )
            : 400;
          const characterItalic = italic
            ? getAttributeValue(
                pointerDistance,
                maxDistance,
                0,
                1,
              ).toFixed(2)
            : "0";
          const characterAlpha = alpha
            ? getAttributeValue(
                pointerDistance,
                maxDistance,
                0,
                1,
              ).toFixed(2)
            : "1";
          const variationSettings = `'wght' ${characterWeight}, 'wdth' ${characterWidth}, 'ital' ${characterItalic}`;

          if (
            character.style.fontVariationSettings !== variationSettings
          ) {
            character.style.fontVariationSettings = variationSettings;
          }
          if (character.style.opacity !== characterAlpha) {
            character.style.opacity = characterAlpha;
          }
        });
      }

      frameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frameId);
  }, [alpha, italic, maxWeight, minWeight, weight, width]);

  const fontImport = useMemo(
    () => (
      <style>{`@import url('${fontUrl.replaceAll("'", "\\'")}');`}</style>
    ),
    [fontUrl],
  );
  const titleClassName = [
    styles.title,
    flex ? styles.flex : "",
    stroke ? styles.stroke : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const customProperties = {
    "--text-pressure-color": textColor,
    "--text-pressure-font": `'${fontFamily}'`,
    "--text-pressure-line-height": lineHeight,
    "--text-pressure-scale-y": scaleY,
    "--text-pressure-size": `${fontSize}px`,
    "--text-pressure-stroke-color": strokeColor,
  } as CSSProperties;
  const renderedCharacters = characters.map((character, index) => (
    <span
      key={`${character}-${index}`}
      ref={(element) => {
        characterRefs.current[index] = element;
      }}
      className={styles.character}
      data-char={character}
      aria-hidden="true"
    >
      {character === " " ? "\u00a0" : character}
    </span>
  ));

  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={customProperties}
    >
      {fontImport}
      {as === "h1" ? (
        <h1
          ref={(element) => {
            titleRef.current = element;
          }}
          className={titleClassName}
          aria-label={ariaLabel ?? text}
        >
          {renderedCharacters}
        </h1>
      ) : (
        <div
          ref={(element) => {
            titleRef.current = element;
          }}
          className={titleClassName}
          aria-hidden={ariaHidden}
        >
          {renderedCharacters}
        </div>
      )}
    </div>
  );
}
