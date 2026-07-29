"use client";

import { type CSSProperties, useEffect, useRef } from "react";

import "./Waves.css";

class Grad {
  constructor(
    public x: number,
    public y: number,
    public z: number,
  ) {}

  dot2(x: number, y: number) {
    return this.x * x + this.y * y;
  }
}

class Noise {
  private readonly grad3 = [
    new Grad(1, 1, 0),
    new Grad(-1, 1, 0),
    new Grad(1, -1, 0),
    new Grad(-1, -1, 0),
    new Grad(1, 0, 1),
    new Grad(-1, 0, 1),
    new Grad(1, 0, -1),
    new Grad(-1, 0, -1),
    new Grad(0, 1, 1),
    new Grad(0, -1, 1),
    new Grad(0, 1, -1),
    new Grad(0, -1, -1),
  ];

  private readonly p = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7,
    225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6,
    148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35,
    11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171,
    168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158,
    231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55,
    46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73,
    209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188,
    159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250,
    124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206,
    59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213,
    119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43,
    172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232,
    178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210,
    144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
    49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121,
    50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24,
    72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
  ];

  private readonly perm = new Array<number>(512);
  private readonly gradP = new Array<Grad>(512);

  constructor(seed = 0) {
    this.seed(seed);
  }

  private seed(value: number) {
    let seed = value;
    if (seed > 0 && seed < 1) seed *= 65536;
    seed = Math.floor(seed);
    if (seed < 256) seed |= seed << 8;

    for (let index = 0; index < 256; index += 1) {
      const permutation =
        index & 1
          ? this.p[index] ^ (seed & 255)
          : this.p[index] ^ ((seed >> 8) & 255);

      this.perm[index] = permutation;
      this.perm[index + 256] = permutation;
      this.gradP[index] = this.grad3[permutation % 12];
      this.gradP[index + 256] = this.grad3[permutation % 12];
    }
  }

  private fade(value: number) {
    return value * value * value * (value * (value * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, amount: number) {
    return (1 - amount) * a + amount * b;
  }

  perlin2(inputX: number, inputY: number) {
    let x = inputX;
    let y = inputY;
    let cellX = Math.floor(x);
    let cellY = Math.floor(y);

    x -= cellX;
    y -= cellY;
    cellX &= 255;
    cellY &= 255;

    const n00 = this.gradP[cellX + this.perm[cellY]].dot2(x, y);
    const n01 = this.gradP[cellX + this.perm[cellY + 1]].dot2(x, y - 1);
    const n10 = this.gradP[cellX + 1 + this.perm[cellY]].dot2(x - 1, y);
    const n11 = this.gradP[cellX + 1 + this.perm[cellY + 1]].dot2(
      x - 1,
      y - 1,
    );
    const amount = this.fade(x);

    return this.lerp(
      this.lerp(n00, n10, amount),
      this.lerp(n01, n11, amount),
      this.fade(y),
    );
  }
}

type WavePoint = {
  x: number;
  y: number;
  wave: { x: number; y: number };
  cursor: { x: number; y: number; vx: number; vy: number };
};

type MouseState = {
  x: number;
  y: number;
  lx: number;
  ly: number;
  sx: number;
  sy: number;
  v: number;
  vs: number;
  a: number;
  set: boolean;
};

type WavesConfig = {
  lineColor: string;
  waveSpeedX: number;
  waveSpeedY: number;
  waveAmpX: number;
  waveAmpY: number;
  xGap: number;
  yGap: number;
  friction: number;
  tension: number;
  maxCursorMove: number;
};

type WavesProps = Partial<WavesConfig> & {
  backgroundColor?: string;
  style?: CSSProperties;
  className?: string;
};

export default function Waves({
  lineColor = "rgba(113, 137, 154, 0.22)",
  backgroundColor = "transparent",
  waveSpeedX = 0.0125,
  waveSpeedY = 0.005,
  waveAmpX = 32,
  waveAmpY = 16,
  xGap = 12,
  yGap = 32,
  friction = 0.925,
  tension = 0.005,
  maxCursorMove = 100,
  style,
  className = "",
}: WavesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const boundingRef = useRef({ width: 0, height: 0, left: 0, top: 0 });
  const noiseRef = useRef(new Noise(0.314159));
  const linesRef = useRef<WavePoint[][]>([]);
  const mouseRef = useRef<MouseState>({
    x: -10,
    y: 0,
    lx: 0,
    ly: 0,
    sx: 0,
    sy: 0,
    v: 0,
    vs: 0,
    a: 0,
    set: false,
  });
  const configRef = useRef<WavesConfig>({
    lineColor,
    waveSpeedX,
    waveSpeedY,
    waveAmpX,
    waveAmpY,
    friction,
    tension,
    maxCursorMove,
    xGap,
    yGap,
  });
  const frameIdRef = useRef<number | null>(null);

  useEffect(() => {
    configRef.current = {
      lineColor,
      waveSpeedX,
      waveSpeedY,
      waveAmpX,
      waveAmpY,
      friction,
      tension,
      maxCursorMove,
      xGap,
      yGap,
    };
  }, [
    lineColor,
    waveSpeedX,
    waveSpeedY,
    waveAmpX,
    waveAmpY,
    friction,
    tension,
    maxCursorMove,
    xGap,
    yGap,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    contextRef.current = context;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const setSize = () => {
      boundingRef.current = container.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(
        1,
        Math.floor(boundingRef.current.width * pixelRatio),
      );
      canvas.height = Math.max(
        1,
        Math.floor(boundingRef.current.height * pixelRatio),
      );
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.lineWidth = 1;
    };

    const setLines = () => {
      const { width, height } = boundingRef.current;
      const { xGap: horizontalGap, yGap: verticalGap } = configRef.current;
      const outerWidth = width + 200;
      const outerHeight = height + 30;
      const totalLines = Math.ceil(outerWidth / horizontalGap);
      const totalPoints = Math.ceil(outerHeight / verticalGap);
      const xStart = (width - horizontalGap * totalLines) / 2;
      const yStart = (height - verticalGap * totalPoints) / 2;

      linesRef.current = Array.from(
        { length: totalLines + 1 },
        (_, lineIndex) =>
          Array.from({ length: totalPoints + 1 }, (_, pointIndex) => ({
            x: xStart + horizontalGap * lineIndex,
            y: yStart + verticalGap * pointIndex,
            wave: { x: 0, y: 0 },
            cursor: { x: 0, y: 0, vx: 0, vy: 0 },
          })),
      );
    };

    const movePoints = (time: number) => {
      const mouse = mouseRef.current;
      const noise = noiseRef.current;
      const config = configRef.current;

      linesRef.current.forEach((points) => {
        points.forEach((point) => {
          const move =
            noise.perlin2(
              (point.x + time * config.waveSpeedX) * 0.002,
              (point.y + time * config.waveSpeedY) * 0.0015,
            ) * 12;

          point.wave.x = Math.cos(move) * config.waveAmpX;
          point.wave.y = Math.sin(move) * config.waveAmpY;

          const dx = point.x - mouse.sx;
          const dy = point.y - mouse.sy;
          const distance = Math.hypot(dx, dy);
          const influence = Math.max(175, mouse.vs);

          if (distance < influence) {
            const strength = 1 - distance / influence;
            const force = Math.cos(distance * 0.001) * strength;
            point.cursor.vx +=
              Math.cos(mouse.a) *
              force *
              influence *
              mouse.vs *
              0.00065;
            point.cursor.vy +=
              Math.sin(mouse.a) *
              force *
              influence *
              mouse.vs *
              0.00065;
          }

          point.cursor.vx += -point.cursor.x * config.tension;
          point.cursor.vy += -point.cursor.y * config.tension;
          point.cursor.vx *= config.friction;
          point.cursor.vy *= config.friction;
          point.cursor.x += point.cursor.vx * 2;
          point.cursor.y += point.cursor.vy * 2;
          point.cursor.x = Math.min(
            config.maxCursorMove,
            Math.max(-config.maxCursorMove, point.cursor.x),
          );
          point.cursor.y = Math.min(
            config.maxCursorMove,
            Math.max(-config.maxCursorMove, point.cursor.y),
          );
        });
      });
    };

    const moved = (point: WavePoint, withCursor = true) => ({
      x:
        Math.round(
          (point.x +
            point.wave.x +
            (withCursor ? point.cursor.x : 0)) *
            10,
        ) / 10,
      y:
        Math.round(
          (point.y +
            point.wave.y +
            (withCursor ? point.cursor.y : 0)) *
            10,
        ) / 10,
    });

    const drawLines = () => {
      const currentContext = contextRef.current;
      if (!currentContext) return;

      const { width, height } = boundingRef.current;
      currentContext.clearRect(0, 0, width, height);
      currentContext.beginPath();
      currentContext.strokeStyle = configRef.current.lineColor;

      linesRef.current.forEach((points) => {
        let current = moved(points[0], false);
        currentContext.moveTo(current.x, current.y);

        points.forEach((point, index) => {
          const isLast = index === points.length - 1;
          current = moved(point, !isLast);
          currentContext.lineTo(current.x, current.y);

          if (isLast) {
            const last = moved(points[points.length - 1], false);
            currentContext.moveTo(last.x, last.y);
          }
        });
      });

      currentContext.stroke();
    };

    const tick = (time: number) => {
      const mouse = mouseRef.current;
      mouse.sx += (mouse.x - mouse.sx) * 0.1;
      mouse.sy += (mouse.y - mouse.sy) * 0.1;

      const dx = mouse.x - mouse.lx;
      const dy = mouse.y - mouse.ly;
      const distance = Math.hypot(dx, dy);
      mouse.v = distance;
      mouse.vs += (distance - mouse.vs) * 0.1;
      mouse.vs = Math.min(100, mouse.vs);
      mouse.lx = mouse.x;
      mouse.ly = mouse.y;
      mouse.a = Math.atan2(dy, dx);

      container.style.setProperty("--x", `${mouse.sx}px`);
      container.style.setProperty("--y", `${mouse.sy}px`);

      movePoints(time);
      drawLines();

      if (!reduceMotion) {
        frameIdRef.current = window.requestAnimationFrame(tick);
      }
    };

    const updateMouse = (clientX: number, clientY: number) => {
      const mouse = mouseRef.current;
      const bounds = boundingRef.current;
      mouse.x = clientX - bounds.left;
      mouse.y = clientY - bounds.top;

      if (!mouse.set) {
        mouse.sx = mouse.x;
        mouse.sy = mouse.y;
        mouse.lx = mouse.x;
        mouse.ly = mouse.y;
        mouse.set = true;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      updateMouse(event.clientX, event.clientY);
    };

    const handleResize = () => {
      setSize();
      setLines();
      if (reduceMotion) tick(performance.now());
    };

    const resizeObserver = new ResizeObserver(handleResize);
    setSize();
    setLines();
    resizeObserver.observe(container);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    frameIdRef.current = window.requestAnimationFrame(tick);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      if (frameIdRef.current !== null) {
        window.cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`waves ${className}`.trim()}
      style={{ backgroundColor, ...style }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="waves-canvas" />
    </div>
  );
}
