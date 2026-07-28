"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import styles from "./GradientText.module.css";

type GradientDirection = "horizontal" | "vertical" | "diagonal";

type GradientTextProps = {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  direction?: GradientDirection;
  pauseOnHover?: boolean;
  yoyo?: boolean;
  showBorder?: boolean;
  ariaLabel?: string;
};

const defaultColors = ["#5227ff", "#ff9ffc", "#b497cf"];

export default function GradientText({
  children,
  className = "",
  colors = defaultColors,
  animationSpeed = 8,
  direction = "horizontal",
  pauseOnHover = false,
  yoyo = true,
  showBorder = false,
  ariaLabel,
}: GradientTextProps) {
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const animationDuration = Math.max(animationSpeed, 0.1) * 1000;

  useAnimationFrame((time) => {
    if (isPaused || prefersReducedMotion) {
      lastTimeRef.current = null;
      return;
    }

    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      return;
    }

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    elapsedRef.current += deltaTime;

    if (yoyo) {
      const fullCycle = animationDuration * 2;
      const cycleTime = elapsedRef.current % fullCycle;

      progress.set(
        cycleTime < animationDuration
          ? (cycleTime / animationDuration) * 100
          : 100 -
              ((cycleTime - animationDuration) / animationDuration) *
                100,
      );
      return;
    }

    progress.set((elapsedRef.current / animationDuration) * 100);
  });

  useEffect(() => {
    elapsedRef.current = 0;
    lastTimeRef.current = null;
    progress.set(0);
  }, [animationSpeed, progress, yoyo]);

  const backgroundPosition = useTransform(progress, (position) => {
    if (direction === "vertical") return `50% ${position}%`;
    return `${position}% 50%`;
  });
  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) setIsPaused(true);
  }, [pauseOnHover]);
  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) setIsPaused(false);
  }, [pauseOnHover]);
  const palette = colors.length > 0 ? colors : defaultColors;
  const gradientAngle =
    direction === "horizontal"
      ? "to right"
      : direction === "vertical"
        ? "to bottom"
        : "to bottom right";
  const gradientColors = [...palette, palette[0]].join(", ");
  const gradientStyle = {
    backgroundImage: `linear-gradient(${gradientAngle}, ${gradientColors})`,
    backgroundSize:
      direction === "horizontal"
        ? "300% 100%"
        : direction === "vertical"
          ? "100% 300%"
          : "300% 300%",
    backgroundRepeat: "repeat",
  } as const;
  const containerClassName = [
    styles.container,
    showBorder ? styles.withBorder : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.div
      className={containerClassName}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role={ariaLabel ? "group" : undefined}
      aria-label={ariaLabel}
    >
      {showBorder ? (
        <motion.div
          className={styles.gradientOverlay}
          style={{ ...gradientStyle, backgroundPosition }}
        />
      ) : null}
      <motion.div
        className={styles.textContent}
        style={{ ...gradientStyle, backgroundPosition }}
        aria-hidden={ariaLabel ? "true" : undefined}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
