"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
varying vec2 v_texcoord;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  v_texcoord = uv;
}
`;

const fragmentShader = /* glsl */ `
varying vec2 v_texcoord;

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform vec2 u_shapeSize;
uniform vec2 u_shapeCenter;
uniform float u_roundness;
uniform float u_borderSize;
uniform float u_circleSize;
uniform float u_circleEdge;

#ifndef PI
#define PI 3.1415926535897932384626433832795
#endif
#ifndef TWO_PI
#define TWO_PI 6.2831853071795864769252867665590
#endif
#ifndef VAR
#define VAR 0
#endif

vec2 coord(in vec2 point) {
  point = point / u_resolution.xy;
  if (u_resolution.x > u_resolution.y) {
    point.x *= u_resolution.x / u_resolution.y;
    point.x += (u_resolution.y - u_resolution.x) / u_resolution.y / 2.0;
  } else {
    point.y *= u_resolution.y / u_resolution.x;
    point.y += (u_resolution.x - u_resolution.y) / u_resolution.x / 2.0;
  }
  point -= 0.5;
  point *= vec2(-1.0, 1.0);
  return point;
}

#define st0 coord(gl_FragCoord.xy)
#define mx coord(u_mouse * u_pixelRatio)

float sdRoundRect(vec2 point, vec2 bounds, float radius, vec2 center) {
  vec2 distance = abs(point - center) * 4.2 - bounds + vec2(radius);
  return min(max(distance.x, distance.y), 0.0) + length(max(distance, 0.0)) - radius;
}

float sdCircle(in vec2 point, in vec2 center) {
  return length(point - center) * 2.0;
}

float sdPoly(in vec2 point, in float width, in int sides) {
  float angle = atan(point.x, point.y) + PI;
  float sector = TWO_PI / float(sides);
  float distance = cos(floor(0.5 + angle / sector) * sector - angle) * length(max(abs(point), 0.0));
  return distance * 2.0 - width;
}

float aastep(float threshold, float value) {
  float width = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
  return smoothstep(threshold - width, threshold + width, value);
}

float fill(float value, float size, float edge) {
  return 1.0 - smoothstep(size - edge, size + edge, value);
}

float strokeAA(float value, float size, float width, float edge) {
  float aaWidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678;
  float distance = smoothstep(size - edge - aaWidth, size + edge + aaWidth, value + width * 0.5)
    - smoothstep(size - edge - aaWidth, size + edge + aaWidth, value - width * 0.5);
  return clamp(distance, 0.0, 1.0);
}

void main() {
  vec2 point = st0 + 0.5;
  vec2 mouse = mx * vec2(1.0, -1.0) + 0.5;
  float mouseField = fill(sdCircle(point, mouse), u_circleSize, u_circleEdge);
  float shape;

  if (VAR == 0) {
    shape = sdRoundRect(point, u_shapeSize, u_roundness, u_shapeCenter);
    shape = strokeAA(shape, 0.0, u_borderSize, mouseField) * 4.0;
  } else if (VAR == 1) {
    shape = fill(sdCircle(point, vec2(0.5)), 0.6, mouseField) * 1.2;
  } else if (VAR == 2) {
    shape = strokeAA(sdCircle(point, vec2(0.5)), 0.58, 0.02, mouseField) * 4.0;
  } else {
    shape = fill(sdPoly(point - vec2(0.5, 0.45), 0.3, 3), 0.05, mouseField) * 1.4;
  }

  gl_FragColor = vec4(vec3(1.0), shape);
}
`;

type ShapeBlurProps = {
  className?: string;
  variation?: 0 | 1 | 2 | 3;
  pixelRatioProp?: number;
  shapeSize?: number;
  shapeAspect?: number;
  shapeAnchorX?: number;
  shapeAnchorY?: number;
  pointerProjectionRight?: number;
  pointerProjectionBottom?: number;
  roundness?: number;
  borderSize?: number;
  circleSize?: number;
  circleEdge?: number;
};

export default function ShapeBlur({
  className = "",
  variation = 0,
  pixelRatioProp = 2,
  shapeSize = 1.2,
  shapeAspect = 1,
  shapeAnchorX,
  shapeAnchorY,
  pointerProjectionRight,
  pointerProjectionBottom,
  roundness = 0.4,
  borderSize = 0.05,
  circleSize = 0.3,
  circleEdge = 0.5,
}: ShapeBlurProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let active = true;
    let animationFrame = 0;
    let previousTime = performance.now() * 0.001;

    const mouse = new THREE.Vector2();
    const dampedMouse = new THREE.Vector2();
    const resolution = new THREE.Vector2();
    const shapeBounds = new THREE.Vector2(
      shapeSize * shapeAspect,
      shapeSize,
    );
    const shapeCenter = new THREE.Vector2(0.5, 0.5);
    const shapeCenterCss = new THREE.Vector2();
    const shapeHalfSizeCss = new THREE.Vector2();
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera();
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_mouse: { value: dampedMouse },
        u_resolution: { value: resolution },
        u_pixelRatio: { value: pixelRatioProp },
        u_shapeSize: { value: shapeBounds },
        u_shapeCenter: { value: shapeCenter },
        u_roundness: { value: roundness },
        u_borderSize: { value: borderSize },
        u_circleSize: { value: circleSize },
        u_circleEdge: { value: circleEdge },
      },
      defines: { VAR: variation },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const quad = new THREE.Mesh(geometry, material);
    scene.add(quad);

    const resize = () => {
      if (!active) return;

      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      const deviceRatio = Math.min(window.devicePixelRatio, pixelRatioProp, 2);

      renderer.setPixelRatio(deviceRatio);
      renderer.setSize(width, height, false);
      material.uniforms.u_pixelRatio.value = deviceRatio;
      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
      quad.scale.set(width, height, 1);
      resolution.set(width, height).multiplyScalar(deviceRatio);

      if (shapeAnchorX === undefined || shapeAnchorY === undefined) {
        shapeCenter.set(0.5, 0.5);
      } else {
        shapeCenter.set(
          0.5 + width / (2 * height) - shapeAnchorX,
          1 - shapeAnchorY,
        );
      }

      shapeCenterCss.set(
        shapeAnchorX === undefined ? width / 2 : shapeAnchorX * height,
        shapeAnchorY === undefined ? height / 2 : shapeAnchorY * height,
      );
      shapeHalfSizeCss.set(
        (shapeBounds.x * height) / 4.2,
        (shapeBounds.y * height) / 4.2,
      );

      if (mouse.lengthSq() === 0) {
        mouse.copy(shapeCenterCss);
        dampedMouse.copy(mouse);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = mount.getBoundingClientRect();
      let pointerX = event.clientX - bounds.left;
      let pointerY = event.clientY - bounds.top;
      const isInsideSensor =
        pointerX >= 0 &&
        pointerX <= bounds.width &&
        pointerY >= 0 &&
        pointerY <= bounds.height;

      if (isInsideSensor) {
        if (pointerProjectionRight !== undefined) {
          const projectedRight =
            shapeCenterCss.x +
            shapeHalfSizeCss.x +
            pointerProjectionRight * bounds.height;
          pointerX = Math.min(pointerX, projectedRight);
        }

        if (pointerProjectionBottom !== undefined) {
          const projectedBottom =
            shapeCenterCss.y +
            shapeHalfSizeCss.y +
            pointerProjectionBottom * bounds.height;
          pointerY = Math.min(pointerY, projectedBottom);
        }
      }

      mouse.set(pointerX, pointerY);
    };

    const render = (now: number) => {
      if (!active) return;

      const time = now * 0.001;
      const delta = Math.min(0.1, Math.max(0, time - previousTime));
      previousTime = time;
      dampedMouse.x = THREE.MathUtils.damp(
        dampedMouse.x,
        mouse.x,
        8,
        delta,
      );
      dampedMouse.y = THREE.MathUtils.damp(
        dampedMouse.y,
        mouse.y,
        8,
        delta,
      );
      renderer.render(scene, camera);

      if (!reduceMotion) {
        animationFrame = requestAnimationFrame(render);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reduceMotion) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(resize);
    resizeObserver?.observe(mount);
    animationFrame = requestAnimationFrame(render);

    return () => {
      active = false;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      resizeObserver?.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [
    borderSize,
    circleEdge,
    circleSize,
    pixelRatioProp,
    pointerProjectionBottom,
    pointerProjectionRight,
    roundness,
    shapeAspect,
    shapeAnchorX,
    shapeAnchorY,
    shapeSize,
    variation,
  ]);

  return (
    <div
      ref={mountRef}
      className={className}
      aria-hidden="true"
      role="presentation"
    />
  );
}
