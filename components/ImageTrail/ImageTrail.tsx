"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./ImageTrail.module.css";

type Point = {
  x: number;
  y: number;
};

type TrailImage = {
  element: HTMLDivElement;
  inner: HTMLDivElement;
  rect: DOMRect;
};

type ImageTrailProps = {
  items: string[];
  className?: string;
  variant?: "1" | "6";
};

const lerp = (start: number, end: number, amount: number) =>
  (1 - amount) * start + amount * end;

const getDistance = (first: Point, second: Point) =>
  Math.hypot(first.x - second.x, first.y - second.y);

const mapSpeed = (
  speed: number,
  minValue: number,
  maxValue: number,
  maxSpeed: number,
) =>
  minValue +
  (maxValue - minValue) * Math.min(speed / maxSpeed, 1);

export default function ImageTrail({
  items,
  className = "",
  variant = "1",
}: ImageTrailProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || items.length === 0) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (reducedMotion.matches) return;

    const images = Array.from(
      container.querySelectorAll<HTMLDivElement>("[data-trail-image]"),
    ).flatMap((element): TrailImage[] => {
      const inner = element.querySelector<HTMLDivElement>(
        "[data-trail-image-inner]",
      );

      return inner
        ? [{ element, inner, rect: element.getBoundingClientRect() }]
        : [];
    });

    if (images.length === 0) return;

    let frame = 0;
    let imagePosition = 0;
    let zIndex = 1;
    let hasStarted = false;
    let pointerPosition: Point = { x: 0, y: 0 };
    let previousPosition: Point = { x: 0, y: 0 };
    let cachedPosition: Point = { x: 0, y: 0 };

    const getLocalPosition = (event: PointerEvent): Point => {
      const rect = container.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const showNextImage = () => {
      zIndex += 1;
      imagePosition = (imagePosition + 1) % images.length;

      const image = images[imagePosition];
      const startX = cachedPosition.x - image.rect.width / 2;
      const startY = cachedPosition.y - image.rect.height / 2;
      const endX = pointerPosition.x - image.rect.width / 2;
      const endY = pointerPosition.y - image.rect.height / 2;
      const speed = getDistance(pointerPosition, cachedPosition);

      gsap.killTweensOf([image.element, image.inner]);

      if (variant === "6") {
        const scale = mapSpeed(speed, 0.3, 2, 200);
        const brightness = mapSpeed(speed, 0, 1.3, 70);
        const blur = mapSpeed(speed, 20, 0, 90);
        const grayscale = mapSpeed(speed, 6, 0, 90);

        gsap
          .timeline()
          .fromTo(
            image.element,
            {
              opacity: 1,
              scale: 0,
              zIndex,
              x: startX,
              y: startY,
            },
            {
              duration: 0.8,
              ease: "power3.out",
              opacity: 1,
              scale,
              filter: `grayscale(${grayscale * 100}%) brightness(${brightness * 100}%) blur(${blur}px)`,
              x: endX,
              y: endY,
            },
            0,
          )
          .fromTo(
            image.inner,
            { scale: 2 },
            { duration: 0.8, ease: "power3.out", scale: 1 },
            0,
          )
          .to(
            image.element,
            {
              duration: 0.4,
              ease: "power3.in",
              opacity: 0,
              scale: 0.2,
            },
            0.45,
          );
        return;
      }

      gsap
        .timeline()
        .fromTo(
          image.element,
          {
            opacity: 1,
            scale: 0.82,
            zIndex,
            x: startX,
            y: startY,
          },
          {
            duration: 0.38,
            ease: "power1.out",
            opacity: 1,
            scale: 1,
            x: endX,
            y: endY,
          },
          0,
        )
        .fromTo(
          image.inner,
          { scale: 1.18, filter: "brightness(135%)" },
          {
            duration: 0.42,
            ease: "power1.out",
            scale: 1,
            filter: "brightness(100%)",
          },
          0,
        )
        .to(
          image.element,
          {
            duration: 0.5,
            ease: "power3.in",
            opacity: 0,
            scale: 0.22,
          },
          0.46,
        );
    };

    const render = () => {
      cachedPosition = {
        x: lerp(cachedPosition.x, pointerPosition.x, 0.1),
        y: lerp(cachedPosition.y, pointerPosition.y, 0.1),
      };

      if (getDistance(pointerPosition, previousPosition) > 72) {
        showNextImage();
        previousPosition = { ...pointerPosition };
      }

      frame = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerPosition = getLocalPosition(event);

      if (!hasStarted) {
        hasStarted = true;
        previousPosition = { ...pointerPosition };
        cachedPosition = { ...pointerPosition };
        frame = window.requestAnimationFrame(render);
      }
    };

    const handleResize = () => {
      images.forEach((image) => {
        gsap.set(image.element, { opacity: 0, scale: 1, x: 0, y: 0 });
        image.rect = image.element.getBoundingClientRect();
      });
    };

    container.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(frame);
      container.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      images.forEach(({ element, inner }) => {
        gsap.killTweensOf([element, inner]);
      });
    };
  }, [items, variant]);

  return (
    <div
      ref={containerRef}
      className={`${styles.trail} ${className}`.trim()}
      aria-hidden="true"
    >
      {items.map((url, index) => (
        <div
          className={styles.image}
          data-trail-image
          key={`${url}-${index}`}
        >
          <div
            className={styles.imageInner}
            data-trail-image-inner
            style={{ backgroundImage: `url(${url})` }}
          />
        </div>
      ))}
    </div>
  );
}
