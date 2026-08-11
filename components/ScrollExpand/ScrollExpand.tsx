"use client";

import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";

import "./ScrollExpand.css";

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

const smoothstep = (edgeStart: number, edgeEnd: number, value: number) => {
  const progress = clamp(
    (value - edgeStart) / (edgeEnd - edgeStart || 1e-6),
    0,
    1,
  );

  return progress * progress * (3 - 2 * progress);
};

type ScrollExpandProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  src?: string;
  mediaType?: "image" | "video";
  poster?: string;
  alt?: string;
  title?: ReactNode;
  scrollHint?: ReactNode;
  startWidth?: number;
  startHeight?: number;
  startRadius?: number;
  endRadius?: number;
  mediaZoom?: number;
  scrollDistance?: number;
  holdDistance?: number;
  smoothing?: number;
  overlayScrim?: number;
  useWindowScroll?: boolean;
  enabled?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

type AnimationSettings = Pick<
  ScrollExpandProps,
  | "startWidth"
  | "startHeight"
  | "startRadius"
  | "endRadius"
  | "mediaZoom"
  | "scrollDistance"
  | "holdDistance"
  | "smoothing"
  | "overlayScrim"
  | "useWindowScroll"
  | "enabled"
>;

export default function ScrollExpand({
  src = "",
  mediaType = "image",
  poster = "",
  alt = "",
  title = "",
  scrollHint = "",
  startWidth = 42,
  startHeight = 58,
  startRadius = 24,
  endRadius = 0,
  mediaZoom = 1.35,
  scrollDistance = 1.2,
  holdDistance = 0.35,
  smoothing = 0.1,
  overlayScrim = 0.45,
  useWindowScroll = false,
  enabled = true,
  children,
  className = "",
  style,
  ...rest
}: ScrollExpandProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const propsRef = useRef<AnimationSettings>({
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    mediaZoom,
    scrollDistance,
    holdDistance,
    smoothing,
    overlayScrim,
    useWindowScroll,
    enabled,
  });

  useEffect(() => {
    propsRef.current = {
      startWidth,
      startHeight,
      startRadius,
      endRadius,
      mediaZoom,
      scrollDistance,
      holdDistance,
      smoothing,
      overlayScrim,
      useWindowScroll,
      enabled,
    };
  }, [
    enabled,
    endRadius,
    holdDistance,
    mediaZoom,
    overlayScrim,
    scrollDistance,
    smoothing,
    startHeight,
    startRadius,
    startWidth,
    useWindowScroll,
  ]);

  const applyProgress = useCallback((progress: number) => {
    const frame = frameRef.current;
    const media = mediaRef.current;
    if (!frame || !media) return;

    const settings = propsRef.current;
    const eased = smoothstep(0, 1, progress);
    const frameWidth =
      settings.startWidth! + (100 - settings.startWidth!) * eased;
    const frameHeight =
      settings.startHeight! + (100 - settings.startHeight!) * eased;
    const insetX = Math.max(0, (100 - frameWidth) / 2);
    const insetY = Math.max(0, (100 - frameHeight) / 2);
    const radius =
      settings.startRadius! +
      (settings.endRadius! - settings.startRadius!) * eased;
    const clipPath = `inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round ${radius}px)`;

    frame.style.clipPath = clipPath;
    frame.style.webkitClipPath = clipPath;
    media.style.transform = `scale(${settings.mediaZoom! + (1 - settings.mediaZoom!) * eased})`;

    if (scrimRef.current) {
      scrimRef.current.style.opacity = `${settings.overlayScrim! * eased}`;
    }

    if (titleRef.current) {
      const exitProgress = smoothstep(0.4, 0.88, progress);
      titleRef.current.style.opacity = `${1 - exitProgress}`;
      titleRef.current.style.transform = `translate3d(0, ${-28 * exitProgress}px, 0) scale(${1 + 0.06 * exitProgress})`;
    }

    if (hintRef.current) {
      const exitProgress = smoothstep(0, 0.12, progress);
      hintRef.current.style.opacity = `${1 - exitProgress}`;
      hintRef.current.style.transform = `translate3d(0, ${8 * exitProgress}px, 0)`;
    }

    if (overlayRef.current) {
      const enterProgress = smoothstep(0.68, 1, progress);
      overlayRef.current.style.opacity = `${enterProgress}`;
      overlayRef.current.style.transform = `translate3d(0, ${18 * (1 - enterProgress)}px, 0)`;
      overlayRef.current.style.pointerEvents =
        enterProgress > 0.85 ? "auto" : "none";
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!root || !track || !stage) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let animationFrame = 0;
    let current = 0;
    let target = 0;
    let stageHeight = 0;
    let running = false;

    const measure = () => {
      const settings = propsRef.current;
      stageHeight = settings.useWindowScroll
        ? window.innerHeight
        : root.clientHeight;
      if (stageHeight <= 0) return;

      stage.style.height = `${stageHeight}px`;
      track.style.height = `${stageHeight * (1 + Math.max(0, settings.scrollDistance!) + Math.max(0, settings.holdDistance!))}px`;

      const width = root.clientWidth || stageHeight;
      stage.style.setProperty(
        "--se-title-size",
        `${clamp(width * 0.075, 36, 118)}px`,
      );
    };

    const readProgress = () => {
      const settings = propsRef.current;
      if (!settings.enabled) return 1;

      const distance = stageHeight * Math.max(0.01, settings.scrollDistance!);
      if (settings.useWindowScroll) {
        return clamp(-track.getBoundingClientRect().top / distance, 0, 1);
      }

      return clamp(root.scrollTop / distance, 0, 1);
    };

    const tick = () => {
      const settings = propsRef.current;
      const response =
        settings.smoothing! <= 0
          ? 1
          : 1 - Math.exp(-1 / (60 * settings.smoothing!));
      current += (target - current) * response;

      if (Math.abs(target - current) < 0.0004) {
        current = target;
        running = false;
      }

      applyProgress(current);
      animationFrame = running ? requestAnimationFrame(tick) : 0;
    };

    const kick = () => {
      if (running) return;
      running = true;
      if (!animationFrame) animationFrame = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = readProgress();
      if (propsRef.current.smoothing! <= 0 || reduceMotion) {
        current = target;
        applyProgress(current);
        return;
      }
      kick();
    };

    const onResize = () => {
      measure();
      target = readProgress();
      current = target;
      applyProgress(current);
    };

    measure();
    target = readProgress();
    current = target;
    applyProgress(current);

    const scroller: Window | HTMLDivElement = useWindowScroll ? window : root;
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(onResize);
    resizeObserver?.observe(root);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      resizeObserver?.disconnect();
    };
  }, [applyProgress, useWindowScroll]);

  const media =
    mediaType === "video" ? (
      <video
        ref={(node) => {
          mediaRef.current = node;
        }}
        className="scroll-expand__media"
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
      />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={(node) => {
          mediaRef.current = node;
        }}
        className="scroll-expand__media"
        src={src}
        alt={alt}
        draggable={false}
      />
    );

  return (
    <div
      ref={rootRef}
      className={`scroll-expand ${useWindowScroll ? "" : "scroll-expand--scroller"} ${className}`.trim()}
      style={style}
      {...rest}
    >
      <div ref={trackRef} className="scroll-expand__track">
        <div ref={stageRef} className="scroll-expand__stage">
          <div ref={frameRef} className="scroll-expand__frame">
            {media}
            <div
              ref={scrimRef}
              className="scroll-expand__scrim"
              aria-hidden="true"
            />
            {children ? (
              <div ref={overlayRef} className="scroll-expand__overlay">
                {children}
              </div>
            ) : null}
          </div>

          {title ? (
            <div ref={titleRef} className="scroll-expand__title">
              {title}
            </div>
          ) : null}

          {scrollHint ? (
            <div ref={hintRef} className="scroll-expand__hint">
              <span aria-hidden="true" className="scroll-expand__hint-line" />
              <span>{scrollHint}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
