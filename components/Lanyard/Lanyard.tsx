"use client";

import {
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Canvas,
  extend,
  type ThreeElement,
  type ThreeEvent,
  useFrame,
} from "@react-three/fiber";
import {
  Environment,
  Html,
  Lightformer,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
  type RigidBodyProps,
  useRopeJoint,
  useSphericalJoint,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";

import cardGLB from "./card.glb";
import lanyardTexture from "./lanyard.png";
import "./Lanyard.css";

extend({ MeshLineGeometry, MeshLineMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
  }
}

const BLANK_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const defaultLanyardTexture =
  typeof lanyardTexture === "string"
    ? lanyardTexture
    : (lanyardTexture as { src: string }).src;

const FRONT_UV_RECT = { x: 0, y: 0, width: 0.5, height: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, width: 0.5, height: 0.757 };

type LanyardProps = {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: "cover" | "contain";
  lanyardImage?: string | null;
  lanyardWidth?: number;
  profileContent?: ReactNode;
};

export default function Lanyard({
  position = [0, 0, 20],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = "cover",
  lanyardImage = null,
  lanyardWidth = 1,
  profileContent,
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );

  useEffect(() => {
    const updateMobileState = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", updateMobileState);
    return () => window.removeEventListener("resize", updateMobileState);
  }, []);

  const cameraPosition: [number, number, number] = isMobile
    ? [position[0], position[1], Math.max(position[2], 20.5)]
    : position;

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position: cameraPosition, fov }}
        dpr={[1, isMobile ? 1.35 : 1.8]}
        gl={{
          alpha: transparent,
          antialias: !isMobile,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(
            new THREE.Color(0x000000),
            transparent ? 0 : 1,
          );
        }}
      >
        <ambientLight intensity={Math.PI} />
        <Physics
          gravity={gravity}
          timeStep={isMobile ? 1 / 30 : 1 / 60}
        >
          <Band
            isMobile={isMobile}
            frontImage={frontImage}
            backImage={backImage}
            imageFit={imageFit}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
            profileContent={profileContent}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="#d7e2ea"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="#b600a8"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={8}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

type BandProps = {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: "cover" | "contain";
  lanyardImage?: string | null;
  lanyardWidth?: number;
  profileContent?: ReactNode;
};

type LanyardRigidBody = RapierRigidBody & {
  lerped?: THREE.Vector3;
};

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  imageFit = "cover",
  lanyardImage = null,
  lanyardWidth = 1,
  profileContent,
}: BandProps) {
  const band = useRef<
    THREE.Mesh<
      InstanceType<typeof MeshLineGeometry>,
      InstanceType<typeof MeshLineMaterial>
    >
  >(null!);
  const fixed = useRef<RapierRigidBody>(null!);
  const jointOne = useRef<LanyardRigidBody>(null!);
  const jointTwo = useRef<LanyardRigidBody>(null!);
  const jointThree = useRef<RapierRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);

  const pointerPosition = new THREE.Vector3();
  const angularVelocity = new THREE.Vector3();
  const rotation = new THREE.Vector3();
  const direction = new THREE.Vector3();

  const segmentProps: RigidBodyProps = {
    type: "dynamic",
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  const getLerpedPosition = (body: LanyardRigidBody) => {
    if (!body.lerped) {
      body.lerped = new THREE.Vector3().copy(body.translation());
    }
    return body.lerped;
  };

  const { nodes, materials } = useGLTF(cardGLB) as unknown as {
    nodes: {
      card: THREE.Mesh;
      clip: THREE.Mesh;
      clamp: THREE.Mesh;
    };
    materials: {
      base: THREE.MeshStandardMaterial;
      metal: THREE.MeshStandardMaterial;
    };
  };

  const sourceBandTexture = useTexture(
    lanyardImage || defaultLanyardTexture,
  );
  const frontTexture = useTexture(frontImage || BLANK_PIXEL);
  const backTexture = useTexture(backImage || BLANK_PIXEL);
  const bandTexture = useMemo(() => {
    const texture = sourceBandTexture.clone();
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
  }, [sourceBandTexture]);

  const cardMap = useMemo(() => {
    const baseMap = materials.base.map;
    if (!baseMap || (!frontImage && !backImage)) return baseMap;

    const baseImage = baseMap.image as HTMLImageElement;
    if (!baseImage?.width || !baseImage?.height) return baseMap;

    const canvas = document.createElement("canvas");
    canvas.width = baseImage.width;
    canvas.height = baseImage.height;
    const context = canvas.getContext("2d");
    if (!context) return baseMap;

    context.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

    const drawFitted = (
      image: CanvasImageSource & { width: number; height: number },
      rect: typeof FRONT_UV_RECT,
    ) => {
      const x = rect.x * canvas.width;
      const y = rect.y * canvas.height;
      const width = rect.width * canvas.width;
      const height = rect.height * canvas.height;
      const fit = imageFit === "contain" ? Math.min : Math.max;
      const imageScale = fit(width / image.width, height / image.height);
      const drawnWidth = image.width * imageScale;
      const drawnHeight = image.height * imageScale;

      context.save();
      context.beginPath();
      context.rect(x, y, width, height);
      context.clip();
      context.drawImage(
        image,
        x + (width - drawnWidth) / 2,
        y + (height - drawnHeight) / 2,
        drawnWidth,
        drawnHeight,
      );
      context.restore();
    };

    if (frontImage && frontTexture.image) {
      drawFitted(
        frontTexture.image as CanvasImageSource & {
          width: number;
          height: number;
        },
        FRONT_UV_RECT,
      );
    }

    if (backImage && backTexture.image) {
      drawFitted(
        backTexture.image as CanvasImageSource & {
          width: number;
          height: number;
        },
        BACK_UV_RECT,
      );
    }

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [
    backImage,
    backTexture.image,
    frontImage,
    frontTexture.image,
    imageFit,
    materials.base.map,
  ]);

  const [curve] = useState(() => {
    const ropeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
    ]);
    ropeCurve.curveType = "chordal";
    return ropeCurve;
  });
  const [dragged, setDragged] = useState<false | THREE.Vector3>(false);
  const [hovered, setHovered] = useState(false);
  const initialSpacing = isMobile ? 0.3 : 0.5;

  useRopeJoint(fixed, jointOne, [
    [0, 0, 0],
    [0, 0, 0],
    1,
  ]);
  useRopeJoint(jointOne, jointTwo, [
    [0, 0, 0],
    [0, 0, 0],
    1,
  ]);
  useRopeJoint(jointTwo, jointThree, [
    [0, 0, 0],
    [0, 0, 0],
    1,
  ]);
  useSphericalJoint(jointThree, card, [
    [0, 0, 0],
    [0, 1.45, 0],
  ]);

  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = dragged ? "grabbing" : "grab";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [dragged, hovered]);

  useEffect(
    () => () => {
      document.body.style.cursor = "auto";
      if (cardMap && cardMap !== materials.base.map) {
        cardMap.dispose();
      }
      bandTexture.dispose();
    },
    [bandTexture, cardMap, materials.base.map],
  );

  useFrame((state, delta) => {
    if (dragged) {
      pointerPosition
        .set(state.pointer.x, state.pointer.y, 0.5)
        .unproject(state.camera);
      direction
        .copy(pointerPosition)
        .sub(state.camera.position)
        .normalize();
      pointerPosition.add(
        direction.multiplyScalar(state.camera.position.length()),
      );

      [card, jointOne, jointTwo, jointThree, fixed].forEach((body) => {
        body.current?.wakeUp();
      });

      card.current?.setNextKinematicTranslation({
        x: pointerPosition.x - dragged.x,
        y: pointerPosition.y - dragged.y,
        z: pointerPosition.z - dragged.z,
      });
    }

    if (!fixed.current || !band.current) return;

    [jointOne, jointTwo].forEach((joint) => {
      const lerped = getLerpedPosition(joint.current);
      const distance = Math.max(
        0.1,
        Math.min(1, lerped.distanceTo(joint.current.translation())),
      );
      lerped.lerp(
        joint.current.translation(),
        delta * (minSpeed + distance * (maxSpeed - minSpeed)),
      );
    });

    curve.points[0].copy(jointThree.current.translation());
    curve.points[1].copy(getLerpedPosition(jointTwo.current));
    curve.points[2].copy(getLerpedPosition(jointOne.current));
    curve.points[3].copy(fixed.current.translation());
    band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));

    angularVelocity.copy(card.current.angvel());
    rotation.copy(card.current.rotation());
    card.current.setAngvel(
      {
        x: angularVelocity.x,
        y: angularVelocity.y - rotation.y * 0.25,
        z: angularVelocity.z,
      },
      true,
    );
  });

  const releaseCard = (event: ThreeEvent<PointerEvent>) => {
    (event.target as Element).releasePointerCapture(event.pointerId);
    setDragged(false);
  };

  const grabCard = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    (event.target as Element).setPointerCapture(event.pointerId);
    setDragged(
      new THREE.Vector3()
        .copy(event.point)
        .sub(pointerPosition.copy(card.current.translation())),
    );
  };

  return (
    <>
      <group position={[0, 5.4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody
          ref={jointOne}
          {...segmentProps}
          position={[initialSpacing, 0, 0]}
          type="dynamic"
        >
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          ref={jointTwo}
          {...segmentProps}
          position={[initialSpacing * 2, 0, 0]}
          type="dynamic"
        >
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          ref={jointThree}
          {...segmentProps}
          position={[initialSpacing * 3, 0, 0]}
          type="dynamic"
        >
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          ref={card}
          {...segmentProps}
          position={[initialSpacing * 4, 0, 0]}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[0.8, 1.125, 0.02]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={
              profileContent ? undefined : () => setHovered(true)
            }
            onPointerOut={
              profileContent ? undefined : () => setHovered(false)
            }
            onPointerUp={profileContent ? undefined : releaseCard}
            onPointerDown={profileContent ? undefined : grabCard}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                color="#ffffff"
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.85}
                metalness={0.72}
                transparent={Boolean(profileContent)}
                opacity={profileContent ? 0 : 1}
                depthWrite={!profileContent}
              />
            </mesh>
            <mesh
              geometry={nodes.clip.geometry}
              material={materials.metal}
              material-roughness={0.3}
            />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>

          {profileContent ? (
            <>
              <mesh
                position={[0, -0.6, 0.04]}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onPointerUp={releaseCard}
                onPointerDown={grabCard}
              >
                <planeGeometry args={[2.45, 3.42]} />
                <meshBasicMaterial
                  transparent
                  opacity={0}
                  depthWrite={false}
                  colorWrite={false}
                />
              </mesh>
              <Html
                transform
                distanceFactor={2.8}
                position={[0, -0.6, 0.065]}
                wrapperClass="lanyard-profile"
                pointerEvents="none"
              >
                {profileContent}
              </Html>
            </>
          ) : null}
        </RigidBody>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap={1}
          map={bandTexture}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}

useGLTF.preload(cardGLB);
