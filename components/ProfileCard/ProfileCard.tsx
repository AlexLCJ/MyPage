"use client";

import React, {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import "./ProfileCard.css";

type ProfileCardProps = {
  avatarUrl: string;
  iconUrl?: string;
  grainUrl?: string;
  innerGradient?: string;
  behindGlowEnabled?: boolean;
  behindGlowColor?: string;
  behindGlowSize?: string;
  className?: string;
  enableTilt?: boolean;
  enableMobileTilt?: boolean;
  mobileTiltSensitivity?: number;
  miniAvatarUrl?: string;
  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  contactText?: string;
  showUserInfo?: boolean;
  onContactClick?: () => void;
};

const DEFAULT_INNER_GRADIENT =
  "linear-gradient(145deg, rgba(24, 1, 31, 0.94) 0%, rgba(118, 33, 176, 0.78) 48%, rgba(190, 76, 0, 0.72) 100%)";

const ANIMATION_CONFIG = {
  INITIAL_DURATION: 1200,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
  DEVICE_BETA_OFFSET: 20,
  ENTER_TRANSITION_MS: 180,
} as const;

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(Math.max(value, min), max);

const round = (value: number, precision = 3) =>
  Number.parseFloat(value.toFixed(precision));

const adjust = (
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number,
) =>
  round(
    toMin +
      ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin),
  );

function ProfileCardComponent({
  avatarUrl,
  iconUrl,
  grainUrl,
  innerGradient,
  behindGlowEnabled = true,
  behindGlowColor,
  behindGlowSize,
  className = "",
  enableTilt = true,
  enableMobileTilt = false,
  mobileTiltSensitivity = 5,
  miniAvatarUrl,
  name = "Jack",
  title = "3D Creator",
  handle = "jackstudio",
  status = "Available for projects",
  contactText = "Contact",
  showUserInfo = true,
  onContactClick,
}: ProfileCardProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const enterTimerRef = useRef<number | null>(null);
  const leaveRafRef = useRef<number | null>(null);

  const tiltEngine = useMemo(() => {
    if (!enableTilt) return null;

    let rafId: number | null = null;
    let running = false;
    let lastTimestamp = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let initialUntil = 0;

    const setVariables = (x: number, y: number) => {
      const shell = shellRef.current;
      const wrapper = wrapRef.current;
      if (!shell || !wrapper) return;

      const width = shell.clientWidth || 1;
      const height = shell.clientHeight || 1;
      const percentX = clamp((100 / width) * x);
      const percentY = clamp((100 / height) * y);
      const centerX = percentX - 50;
      const centerY = percentY - 50;

      const variables: Record<string, string> = {
        "--pointer-x": `${percentX}%`,
        "--pointer-y": `${percentY}%`,
        "--background-x": `${adjust(percentX, 0, 100, 35, 65)}%`,
        "--background-y": `${adjust(percentY, 0, 100, 35, 65)}%`,
        "--pointer-from-center": `${clamp(
          Math.hypot(percentY - 50, percentX - 50) / 50,
          0,
          1,
        )}`,
        "--pointer-from-top": `${percentY / 100}`,
        "--pointer-from-left": `${percentX / 100}`,
        "--rotate-x": `${round(-(centerX / 5))}deg`,
        "--rotate-y": `${round(centerY / 4)}deg`,
      };

      Object.entries(variables).forEach(([property, value]) => {
        wrapper.style.setProperty(property, value);
      });
    };

    const step = (timestamp: number) => {
      if (!running) return;
      if (lastTimestamp === 0) lastTimestamp = timestamp;

      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      const tau = timestamp < initialUntil ? 0.6 : 0.14;
      const interpolation = 1 - Math.exp(-delta / tau);

      currentX += (targetX - currentX) * interpolation;
      currentY += (targetY - currentY) * interpolation;
      setVariables(currentX, currentY);

      const stillMoving =
        Math.abs(targetX - currentX) > 0.05 ||
        Math.abs(targetY - currentY) > 0.05;

      if (stillMoving) {
        rafId = requestAnimationFrame(step);
      } else {
        running = false;
        lastTimestamp = 0;
        rafId = null;
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      lastTimestamp = 0;
      rafId = requestAnimationFrame(step);
    };

    return {
      setImmediate(x: number, y: number) {
        currentX = x;
        currentY = y;
        setVariables(x, y);
      },
      setTarget(x: number, y: number) {
        targetX = x;
        targetY = y;
        start();
      },
      toCenter() {
        const shell = shellRef.current;
        if (!shell) return;
        this.setTarget(shell.clientWidth / 2, shell.clientHeight / 2);
      },
      beginInitial(duration: number) {
        initialUntil = performance.now() + duration;
        start();
      },
      getCurrent() {
        return {
          x: currentX,
          y: currentY,
          targetX,
          targetY,
        };
      },
      cancel() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        running = false;
        lastTimestamp = 0;
      },
    };
  }, [enableTilt]);

  const getOffsets = (event: PointerEvent, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const shell = shellRef.current;
      if (!shell || !tiltEngine) return;
      const { x, y } = getOffsets(event, shell);
      tiltEngine.setTarget(x, y);
    },
    [tiltEngine],
  );

  const handlePointerEnter = useCallback(
    (event: PointerEvent) => {
      const shell = shellRef.current;
      if (!shell || !tiltEngine) return;

      shell.classList.add("active", "entering");
      if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
      enterTimerRef.current = window.setTimeout(() => {
        shell.classList.remove("entering");
      }, ANIMATION_CONFIG.ENTER_TRANSITION_MS);

      const { x, y } = getOffsets(event, shell);
      tiltEngine.setTarget(x, y);
    },
    [tiltEngine],
  );

  const handlePointerLeave = useCallback(() => {
    const shell = shellRef.current;
    if (!shell || !tiltEngine) return;

    tiltEngine.toCenter();

    const checkSettled = () => {
      const { x, y, targetX, targetY } = tiltEngine.getCurrent();
      if (Math.hypot(targetX - x, targetY - y) < 0.6) {
        shell.classList.remove("active");
        leaveRafRef.current = null;
        return;
      }
      leaveRafRef.current = requestAnimationFrame(checkSettled);
    };

    if (leaveRafRef.current) cancelAnimationFrame(leaveRafRef.current);
    leaveRafRef.current = requestAnimationFrame(checkSettled);
  }, [tiltEngine]);

  const handleDeviceOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      const shell = shellRef.current;
      if (!shell || !tiltEngine || event.beta == null || event.gamma == null) {
        return;
      }

      const centerX = shell.clientWidth / 2;
      const centerY = shell.clientHeight / 2;
      tiltEngine.setTarget(
        clamp(
          centerX + event.gamma * mobileTiltSensitivity,
          0,
          shell.clientWidth,
        ),
        clamp(
          centerY +
            (event.beta - ANIMATION_CONFIG.DEVICE_BETA_OFFSET) *
              mobileTiltSensitivity,
          0,
          shell.clientHeight,
        ),
      );
    },
    [mobileTiltSensitivity, tiltEngine],
  );

  useEffect(() => {
    const shell = shellRef.current;
    if (!enableTilt || !tiltEngine || !shell) return;

    const pointerMove = handlePointerMove as EventListener;
    const pointerEnter = handlePointerEnter as EventListener;
    const pointerLeave = handlePointerLeave as EventListener;
    const deviceOrientation = handleDeviceOrientation as EventListener;

    shell.addEventListener("pointerenter", pointerEnter);
    shell.addEventListener("pointermove", pointerMove);
    shell.addEventListener("pointerleave", pointerLeave);

    const handleClick = () => {
      if (!enableMobileTilt || window.location.protocol !== "https:") return;
      const motionEvent = window.DeviceMotionEvent as typeof DeviceMotionEvent & {
        requestPermission?: () => Promise<PermissionState>;
      };

      if (typeof motionEvent?.requestPermission === "function") {
        motionEvent
          .requestPermission()
          .then((permission) => {
            if (permission === "granted") {
              window.addEventListener("deviceorientation", deviceOrientation);
            }
          })
          .catch(() => undefined);
      } else {
        window.addEventListener("deviceorientation", deviceOrientation);
      }
    };

    shell.addEventListener("click", handleClick);
    tiltEngine.setImmediate(
      shell.clientWidth - ANIMATION_CONFIG.INITIAL_X_OFFSET,
      ANIMATION_CONFIG.INITIAL_Y_OFFSET,
    );
    tiltEngine.toCenter();
    tiltEngine.beginInitial(ANIMATION_CONFIG.INITIAL_DURATION);

    return () => {
      shell.removeEventListener("pointerenter", pointerEnter);
      shell.removeEventListener("pointermove", pointerMove);
      shell.removeEventListener("pointerleave", pointerLeave);
      shell.removeEventListener("click", handleClick);
      window.removeEventListener("deviceorientation", deviceOrientation);
      if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
      if (leaveRafRef.current) cancelAnimationFrame(leaveRafRef.current);
      tiltEngine.cancel();
      shell.classList.remove("entering");
    };
  }, [
    enableMobileTilt,
    enableTilt,
    handleDeviceOrientation,
    handlePointerEnter,
    handlePointerLeave,
    handlePointerMove,
    tiltEngine,
  ]);

  const cardStyle = useMemo(
    () =>
      ({
        "--icon": iconUrl ? `url(${iconUrl})` : "none",
        "--grain": grainUrl ? `url(${grainUrl})` : "none",
        "--inner-gradient": innerGradient ?? DEFAULT_INNER_GRADIENT,
        "--behind-glow-color":
          behindGlowColor ?? "rgba(182, 0, 168, 0.62)",
        "--behind-glow-size": behindGlowSize ?? "55%",
      }) as CSSProperties,
    [
      behindGlowColor,
      behindGlowSize,
      grainUrl,
      iconUrl,
      innerGradient,
    ],
  );

  return (
    <div
      ref={wrapRef}
      className={`pc-card-wrapper ${className}`.trim()}
      style={cardStyle}
    >
      {behindGlowEnabled ? <div className="pc-behind" /> : null}
      <div ref={shellRef} className="pc-card-shell">
        <section className="pc-card" aria-label={`${name} profile card`}>
          <div className="pc-inside">
            <div className="pc-shine" />
            <div className="pc-glare" />
            <div className="pc-content pc-avatar-content">
              <img
                className="avatar"
                src={avatarUrl}
                alt={`${name} avatar`}
                draggable={false}
              />
              {showUserInfo ? (
                <div className="pc-user-info">
                  <div className="pc-user-details">
                    <div className="pc-mini-avatar">
                      <img
                        src={miniAvatarUrl || avatarUrl}
                        alt=""
                        aria-hidden="true"
                        draggable={false}
                      />
                    </div>
                    <div className="pc-user-text">
                      <div className="pc-handle">@{handle}</div>
                      <div className="pc-status">{status}</div>
                    </div>
                  </div>
                  <button
                    className="pc-contact-btn"
                    onClick={onContactClick}
                    type="button"
                  >
                    {contactText}
                  </button>
                </div>
              ) : null}
            </div>
            <div className="pc-content">
              <div className="pc-details">
                <h3>{name}</h3>
                <p>{title}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const ProfileCard = React.memo(ProfileCardComponent);

export default ProfileCard;
