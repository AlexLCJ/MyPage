"use client";

import {
  type CSSProperties,
  type HTMLAttributes,
  useEffect,
  useRef,
} from "react";
import { Geometry, Mesh, Program, Renderer, Texture } from "ogl";
import styles from "./ElasticMesh.module.css";

const DISTANCE = 4.6;
const FIT = 0.82;

const vertexShader = `
precision highp float;
attribute vec2 aGrid;
attribute vec2 uv;
attribute vec3 aOffset;
attribute vec3 aNormal;

uniform float uAspect;
uniform float uTilt;
uniform float uDist;
uniform float uFit;

varying vec2 vUv;
varying vec3 vNormal;
varying float vDepth;

void main() {
  vUv = uv;

  vec2 base = vec2((aGrid.x * 2.0 - 1.0) * uAspect, 1.0 - aGrid.y * 2.0);
  vec3 p = vec3(base + aOffset.xy, aOffset.z);

  float ct = cos(uTilt);
  float st = sin(uTilt);
  float ry = p.y * ct - p.z * st;
  float rz = p.y * st + p.z * ct;
  p.y = ry;
  p.z = rz;

  float perspective = uDist / (uDist - p.z);
  vec2 clip = vec2(p.x / uAspect, p.y) * perspective * uFit;

  vNormal = aNormal;
  vDepth = aOffset.z;
  gl_Position = vec4(clip, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

varying vec2 vUv;
varying vec3 vNormal;
varying float vDepth;

uniform sampler2D tMap;
uniform float uHasImage;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uHighlight;
uniform float uShading;
uniform vec2 uRes;
uniform float uRadius;
uniform float uGrid;
uniform float uGridDensity;
uniform float uGridOpacity;
uniform vec3 uGridColor;

void main() {
  vec3 base;
  if (uHasImage > 0.5) {
    base = texture2D(tMap, vUv).rgb;
  } else {
    base = mix(uColor1, uColor2, clamp(vUv.y, 0.0, 1.0));
  }

  vec3 normal = normalize(vNormal);
  vec3 light = normalize(vec3(-0.35, 0.55, 0.78));
  vec3 view = vec3(0.0, 0.0, 1.0);
  vec3 halfVector = normalize(light + view);

  float diffuse = clamp(dot(normal, light), 0.0, 1.0);
  float specularRaw = pow(clamp(dot(normal, halfVector), 0.0, 1.0), 26.0);
  float specularFlat = pow(clamp(halfVector.z, 0.0, 1.0), 26.0);
  float specular = clamp(
    (specularRaw - specularFlat) / (1.0 - specularFlat),
    0.0,
    1.0
  );
  float ambientOcclusion = clamp(1.0 + vDepth * 0.45, 0.65, 1.25);

  vec3 lit = base * (1.0 - uShading * 0.28);
  lit += base * diffuse * uShading * 0.55;
  lit *= ambientOcclusion;
  lit += uHighlight * specular * uShading * 0.25;

  if (uGrid > 0.5) {
    vec2 grid = vUv * uGridDensity;
    vec2 width = uGridDensity / max(uRes, vec2(1.0));
    vec2 delta = abs(fract(grid - 0.5) - 0.5) / max(width * 1.5, vec2(1e-4));
    float line = 1.0 - clamp(min(delta.x, delta.y), 0.0, 1.0);
    lit = mix(
      lit,
      uGridColor,
      line * uGridOpacity * (0.45 + diffuse * 0.55)
    );
  }

  vec2 point = (vUv - 0.5) * uRes;
  vec2 halfResolution = uRes * 0.5;
  float radius = min(uRadius, min(halfResolution.x, halfResolution.y));
  vec2 rounded = abs(point) - (halfResolution - radius);
  float signedDistance = length(max(rounded, 0.0))
    + min(max(rounded.x, rounded.y), 0.0)
    - radius;
  float alpha = 1.0 - smoothstep(-1.25, 1.25, signedDistance);
  if (alpha <= 0.002) discard;

  gl_FragColor = vec4(lit, alpha);
}
`;

type Interaction = "hover" | "drag";

type ElasticMeshProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "style"
> & {
  image?: string;
  ariaLabel?: string;
  color1?: string;
  color2?: string;
  highlight?: string;
  showGrid?: boolean;
  gridDensity?: number;
  gridOpacity?: number;
  gridColor?: string;
  borderRadius?: number;
  stiffness?: number;
  damping?: number;
  grabRadius?: number;
  pull?: number;
  wobble?: number;
  tilt?: number;
  shading?: number;
  resolution?: number;
  interaction?: Interaction;
  enabled?: boolean;
  className?: string;
  style?: CSSProperties;
};

type ElasticConfig = {
  color1: string;
  color2: string;
  highlight: string;
  showGrid: boolean;
  gridDensity: number;
  gridOpacity: number;
  gridColor: string;
  borderRadius: number;
  stiffness: number;
  damping: number;
  grabRadius: number;
  pull: number;
  wobble: number;
  tilt: number;
  shading: number;
  interaction: Interaction;
  enabled: boolean;
};

const hexToRgb = (hex: string) => {
  const clean = (hex || "").replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((character) => character + character)
          .join("")
      : clean;
  const value = Number.parseInt(full || "000000", 16);

  return [
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  ];
};

export default function ElasticMesh({
  image = "",
  ariaLabel = "Interactive elastic image",
  color1 = "#5227ff",
  color2 = "#b19eef",
  highlight = "#ffffff",
  showGrid = true,
  gridDensity = 20,
  gridOpacity = 0.28,
  gridColor = "#ffffff",
  borderRadius = 25,
  stiffness = 0.05,
  damping = 0.2,
  grabRadius = 0.6,
  pull = 0.4,
  wobble = 5,
  tilt = 14,
  shading = 0.5,
  resolution = 25,
  interaction = "hover",
  enabled = true,
  className = "",
  style,
  ...rest
}: ElasticMeshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef<ElasticConfig>({
    color1,
    color2,
    highlight,
    showGrid,
    gridDensity,
    gridOpacity,
    gridColor,
    borderRadius,
    stiffness,
    damping,
    grabRadius,
    pull,
    wobble,
    tilt,
    shading,
    interaction,
    enabled,
  });

  useEffect(() => {
    propsRef.current = {
      color1,
      color2,
      highlight,
      showGrid,
      gridDensity,
      gridOpacity,
      gridColor,
      borderRadius,
      stiffness,
      damping,
      grabRadius,
      pull,
      wobble,
      tilt,
      shading,
      interaction,
      enabled,
    };
  }, [
    borderRadius,
    color1,
    color2,
    damping,
    enabled,
    grabRadius,
    gridColor,
    gridDensity,
    gridOpacity,
    highlight,
    interaction,
    pull,
    shading,
    showGrid,
    stiffness,
    tilt,
    wobble,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const initialConfig = propsRef.current;
    const renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.setAttribute("aria-hidden", "true");
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const gridResolution = Math.max(6, Math.min(40, Math.round(resolution)));
    const nodeCount = gridResolution * gridResolution;
    const gridCoordinates = new Float32Array(nodeCount * 2);
    const textureCoordinates = new Float32Array(nodeCount * 2);
    const offsets = new Float32Array(nodeCount * 3);
    const normals = new Float32Array(nodeCount * 3);

    for (let row = 0; row < gridResolution; row += 1) {
      for (let column = 0; column < gridResolution; column += 1) {
        const index = row * gridResolution + column;
        const u = column / (gridResolution - 1);
        const v = row / (gridResolution - 1);
        gridCoordinates[index * 2] = u;
        gridCoordinates[index * 2 + 1] = v;
        textureCoordinates[index * 2] = u;
        textureCoordinates[index * 2 + 1] = v;
        normals[index * 3 + 2] = 1;
      }
    }

    const quadCount = (gridResolution - 1) * (gridResolution - 1);
    const indices = new Uint16Array(quadCount * 6);
    let triangleIndex = 0;
    for (let row = 0; row < gridResolution - 1; row += 1) {
      for (let column = 0; column < gridResolution - 1; column += 1) {
        const topLeft = row * gridResolution + column;
        const topRight = topLeft + 1;
        const bottomLeft = topLeft + gridResolution;
        const bottomRight = bottomLeft + 1;
        indices[triangleIndex++] = topLeft;
        indices[triangleIndex++] = bottomLeft;
        indices[triangleIndex++] = topRight;
        indices[triangleIndex++] = topRight;
        indices[triangleIndex++] = bottomLeft;
        indices[triangleIndex++] = bottomRight;
      }
    }

    const geometry = new Geometry(gl, {
      aGrid: { size: 2, data: gridCoordinates },
      uv: { size: 2, data: textureCoordinates },
      aOffset: { size: 3, data: offsets },
      aNormal: { size: 3, data: normals },
      index: { data: indices },
    });
    const texture = new Texture(gl, {
      generateMipmaps: false,
      flipY: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
    });
    const uniforms = {
      tMap: { value: texture },
      uHasImage: { value: 0 },
      uColor1: { value: hexToRgb(initialConfig.color1) },
      uColor2: { value: hexToRgb(initialConfig.color2) },
      uHighlight: { value: hexToRgb(initialConfig.highlight) },
      uGrid: { value: initialConfig.showGrid ? 1 : 0 },
      uGridDensity: { value: initialConfig.gridDensity },
      uGridOpacity: { value: initialConfig.gridOpacity },
      uGridColor: { value: hexToRgb(initialConfig.gridColor) },
      uShading: { value: initialConfig.shading },
      uRes: { value: [1, 1] },
      uRadius: { value: initialConfig.borderRadius },
      uAspect: { value: 1 },
      uTilt: { value: (initialConfig.tilt * Math.PI) / 180 },
      uDist: { value: DISTANCE },
      uFit: { value: FIT },
    };
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      transparent: true,
      cullFace: false,
      depthTest: false,
      depthWrite: false,
      uniforms,
    });
    const mesh = new Mesh(gl, { geometry, program, frustumCulled: false });

    let disposed = false;
    if (image) {
      const source = new window.Image();
      source.decoding = "async";
      source.crossOrigin = "anonymous";
      source.onload = () => {
        if (disposed) return;
        texture.image = source;
        uniforms.uHasImage.value = 1;
      };
      source.src = image;
    }

    const baseX = new Float32Array(nodeCount);
    const baseY = new Float32Array(nodeCount);
    const positions = new Float32Array(nodeCount * 3);
    const velocities = new Float32Array(nodeCount * 3);
    const accelerations = new Float32Array(nodeCount * 3);
    let aspect = 1;

    const refreshBase = () => {
      for (let index = 0; index < nodeCount; index += 1) {
        baseX[index] = (gridCoordinates[index * 2] * 2 - 1) * aspect;
        baseY[index] = 1 - gridCoordinates[index * 2 + 1] * 2;
      }
    };

    const resize = () => {
      const width = container.offsetWidth || 1;
      const height = container.offsetHeight || 1;
      renderer.setSize(width, height);
      aspect = width / height;
      uniforms.uAspect.value = aspect;
      uniforms.uRes.value = [width, height];
      refreshBase();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const pointer = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      active: false,
      targetActive: false,
    };

    const movePointerToPlane = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const mouseX = (clientX - rect.left) / rect.width;
      const mouseY = (clientY - rect.top) / rect.height;
      const clipX = mouseX * 2 - 1;
      const clipY = 1 - mouseY * 2;
      const tiltRadians = (propsRef.current.tilt * Math.PI) / 180;
      const cosine = Math.cos(tiltRadians);
      const sine = Math.sin(tiltRadians);
      const projected = clipY / (cosine * FIT * DISTANCE);
      const planeY = (projected * DISTANCE) / (1 + projected * sine);
      const perspective = DISTANCE / (DISTANCE - planeY * sine);
      pointer.targetX = (clipX * aspect) / (perspective * FIT);
      pointer.targetY = planeY;
    };

    const onMove = (event: MouseEvent) => {
      movePointerToPlane(event.clientX, event.clientY);
      if (propsRef.current.interaction === "hover") {
        pointer.targetActive = true;
      }
    };
    const onEnter = () => {
      if (propsRef.current.interaction === "hover") {
        pointer.targetActive = true;
      }
    };
    const onLeave = () => {
      pointer.targetActive = false;
    };
    const onDown = (event: MouseEvent) => {
      if (propsRef.current.interaction !== "drag") return;
      movePointerToPlane(event.clientX, event.clientY);
      pointer.x = pointer.targetX;
      pointer.y = pointer.targetY;
      pointer.targetActive = true;
    };
    const onUp = () => {
      if (propsRef.current.interaction === "drag") {
        pointer.targetActive = false;
      }
    };
    const onTouch = (event: TouchEvent) => {
      if (!event.touches.length) return;
      movePointerToPlane(event.touches[0].clientX, event.touches[0].clientY);
      pointer.targetActive = true;
    };

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);
    container.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    container.addEventListener("touchstart", onTouch, { passive: true });
    container.addEventListener("touchmove", onTouch, { passive: true });
    container.addEventListener("touchend", onLeave);

    const stepDuration = 1 / 120;
    const maximumSubsteps = 5;
    let accumulatedTime = 0;
    let previousTime = performance.now();

    const substep = () => {
      const config = propsRef.current;
      const retain = 1 - config.damping;
      const coupling = 0.06 + config.wobble * 0.032;
      const active = pointer.active && config.enabled && !reduceMotion;
      const radius = Math.max(0.08, config.grabRadius) * 1.4;
      const inverseRadius = 1 / radius;
      const force = config.pull * 0.009;

      for (let row = 0; row < gridResolution; row += 1) {
        for (let column = 0; column < gridResolution; column += 1) {
          const index = row * gridResolution + column;
          const offsetIndex = index * 3;
          const offsetX = positions[offsetIndex];
          const offsetY = positions[offsetIndex + 1];
          const offsetZ = positions[offsetIndex + 2];
          let accelerationX = -config.stiffness * offsetX;
          let accelerationY = -config.stiffness * offsetY;
          let accelerationZ = -config.stiffness * offsetZ;
          let neighborX = 0;
          let neighborY = 0;
          let neighborZ = 0;
          let neighborCount = 0;

          const addNeighbor = (neighbor: number) => {
            const neighborOffset = neighbor * 3;
            neighborX += positions[neighborOffset];
            neighborY += positions[neighborOffset + 1];
            neighborZ += positions[neighborOffset + 2];
            neighborCount += 1;
          };

          if (column > 0) addNeighbor(index - 1);
          if (column < gridResolution - 1) addNeighbor(index + 1);
          if (row > 0) addNeighbor(index - gridResolution);
          if (row < gridResolution - 1) addNeighbor(index + gridResolution);

          accelerationX += coupling * (neighborX - neighborCount * offsetX);
          accelerationY += coupling * (neighborY - neighborCount * offsetY);
          accelerationZ += coupling * (neighborZ - neighborCount * offsetZ);

          if (active) {
            const deltaX = pointer.x - (baseX[index] + offsetX);
            const deltaY = pointer.y - (baseY[index] + offsetY);
            const distance = Math.hypot(deltaX, deltaY);
            const normalizedDistance = distance * inverseRadius;
            if (normalizedDistance < 1) {
              const bump = 1 - normalizedDistance * normalizedDistance;
              accelerationZ += force * bump * bump * 6;
              if (distance > 1e-4) {
                const pinch =
                  normalizedDistance *
                  (1 - normalizedDistance) *
                  (1 - normalizedDistance) *
                  6.75;
                const direction = (force * pinch * 1.6) / distance;
                accelerationX += deltaX * direction;
                accelerationY += deltaY * direction;
              }
            }
          }

          accelerations[offsetIndex] = accelerationX;
          accelerations[offsetIndex + 1] = accelerationY;
          accelerations[offsetIndex + 2] = accelerationZ;
        }
      }

      for (let index = 0; index < nodeCount; index += 1) {
        const offsetIndex = index * 3;
        velocities[offsetIndex] =
          (velocities[offsetIndex] + accelerations[offsetIndex]) * retain;
        velocities[offsetIndex + 1] =
          (velocities[offsetIndex + 1] + accelerations[offsetIndex + 1]) *
          retain;
        velocities[offsetIndex + 2] =
          (velocities[offsetIndex + 2] + accelerations[offsetIndex + 2]) *
          retain;

        positions[offsetIndex] = Math.max(
          -1.2,
          Math.min(1.2, positions[offsetIndex] + velocities[offsetIndex]),
        );
        positions[offsetIndex + 1] = Math.max(
          -1.2,
          Math.min(
            1.2,
            positions[offsetIndex + 1] + velocities[offsetIndex + 1],
          ),
        );
        positions[offsetIndex + 2] = Math.max(
          -1.2,
          Math.min(
            1.2,
            positions[offsetIndex + 2] + velocities[offsetIndex + 2],
          ),
        );
      }
    };

    const commit = () => {
      for (let row = 0; row < gridResolution; row += 1) {
        for (let column = 0; column < gridResolution; column += 1) {
          const index = row * gridResolution + column;
          const offsetIndex = index * 3;
          const leftIndex = column > 0 ? index - 1 : index;
          const rightIndex = column < gridResolution - 1 ? index + 1 : index;
          const downIndex = row > 0 ? index - gridResolution : index;
          const upIndex = row < gridResolution - 1 ? index + gridResolution : index;

          const leftX = baseX[leftIndex] + positions[leftIndex * 3];
          const leftY = baseY[leftIndex] + positions[leftIndex * 3 + 1];
          const leftZ = positions[leftIndex * 3 + 2];
          const rightX = baseX[rightIndex] + positions[rightIndex * 3];
          const rightY = baseY[rightIndex] + positions[rightIndex * 3 + 1];
          const rightZ = positions[rightIndex * 3 + 2];
          const downX = baseX[downIndex] + positions[downIndex * 3];
          const downY = baseY[downIndex] + positions[downIndex * 3 + 1];
          const downZ = positions[downIndex * 3 + 2];
          const upX = baseX[upIndex] + positions[upIndex * 3];
          const upY = baseY[upIndex] + positions[upIndex * 3 + 1];
          const upZ = positions[upIndex * 3 + 2];
          const tangentXX = rightX - leftX;
          const tangentXY = rightY - leftY;
          const tangentXZ = rightZ - leftZ;
          const tangentYX = upX - downX;
          const tangentYY = upY - downY;
          const tangentYZ = upZ - downZ;
          let normalX = tangentXY * tangentYZ - tangentXZ * tangentYY;
          let normalY = tangentXZ * tangentYX - tangentXX * tangentYZ;
          let normalZ = tangentXX * tangentYY - tangentXY * tangentYX;

          if (normalZ < 0) {
            normalX *= -1;
            normalY *= -1;
            normalZ *= -1;
          }
          const length = Math.hypot(normalX, normalY, normalZ) || 1;
          normals[offsetIndex] = normalX / length;
          normals[offsetIndex + 1] = normalY / length;
          normals[offsetIndex + 2] = normalZ / length;
          offsets[offsetIndex] = positions[offsetIndex];
          offsets[offsetIndex + 1] = positions[offsetIndex + 1];
          offsets[offsetIndex + 2] = positions[offsetIndex + 2];
        }
      }

      geometry.attributes.aOffset.needsUpdate = true;
      geometry.attributes.aNormal.needsUpdate = true;
    };

    let animationFrame = 0;
    const frame = (now: number) => {
      animationFrame = window.requestAnimationFrame(frame);
      const config = propsRef.current;
      uniforms.uShading.value = config.shading;
      uniforms.uRadius.value = config.borderRadius;
      uniforms.uTilt.value = (config.tilt * Math.PI) / 180;
      uniforms.uColor1.value = hexToRgb(config.color1);
      uniforms.uColor2.value = hexToRgb(config.color2);
      uniforms.uHighlight.value = hexToRgb(config.highlight);
      uniforms.uGrid.value = config.showGrid ? 1 : 0;
      uniforms.uGridDensity.value = config.gridDensity;
      uniforms.uGridOpacity.value = config.gridOpacity;
      uniforms.uGridColor.value = hexToRgb(config.gridColor);

      let delta = (now - previousTime) / 1000;
      previousTime = now;
      if (delta > 0.25) delta = 0.25;
      const interpolation =
        1 - Math.exp(-Math.max(delta, 1e-4) / 0.06);
      pointer.x += (pointer.targetX - pointer.x) * interpolation;
      pointer.y += (pointer.targetY - pointer.y) * interpolation;
      pointer.active = pointer.targetActive;

      accumulatedTime += delta;
      let substeps = 0;
      while (
        accumulatedTime >= stepDuration &&
        substeps < maximumSubsteps
      ) {
        substep();
        accumulatedTime -= stepDuration;
        substeps += 1;
      }
      if (accumulatedTime > stepDuration) accumulatedTime = 0;

      commit();
      renderer.render({ scene: mesh });
    };

    container.appendChild(canvas);
    animationFrame = window.requestAnimationFrame(frame);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      container.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      container.removeEventListener("touchstart", onTouch);
      container.removeEventListener("touchmove", onTouch);
      container.removeEventListener("touchend", onLeave);
      if (canvas.parentElement === container) container.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [image, resolution]);

  return (
    <div
      ref={containerRef}
      className={`${styles.root} ${className}`.trim()}
      role="img"
      aria-label={ariaLabel}
      style={style}
      {...rest}
    />
  );
}
