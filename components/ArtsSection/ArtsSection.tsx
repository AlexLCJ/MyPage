"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Play, X } from "lucide-react";
import ElasticMesh from "@/components/ElasticMesh/ElasticMesh";
import RippleDistortion from "@/components/RippleDistortion/RippleDistortion";
import styles from "./ArtsSection.module.css";

export default function ArtsSection() {
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const originRef = useRef<HTMLElement>(null);
  const performanceRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const { scrollYProgress: originProgress } = useScroll({
    target: originRef,
    offset: ["start end", "end start"],
  });
  const { scrollYProgress: performanceProgress } = useScroll({
    target: performanceRef,
    offset: ["start end", "end start"],
  });

  const originStoryX = useTransform(
    originProgress,
    [0, 0.24, 0.72, 1],
    prefersReducedMotion ? [0, 0, 0, 0] : [-54, 0, 0, -18],
  );
  const originStoryY = useTransform(
    originProgress,
    [0, 0.24, 0.72, 1],
    prefersReducedMotion ? [0, 0, 0, 0] : [82, 0, -12, -48],
  );
  const originStoryOpacity = useTransform(
    originProgress,
    [0, 0.14, 0.26, 0.9, 1],
    prefersReducedMotion ? [1, 1, 1, 1, 1] : [0, 0.45, 1, 1, 0.45],
  );
  const originDocumentY = useTransform(
    originProgress,
    [0, 0.26, 0.72, 1],
    prefersReducedMotion ? [0, 0, 0, 0] : [138, 0, -10, -84],
  );
  const originDocumentScale = useTransform(
    originProgress,
    [0, 0.26, 0.72, 1],
    prefersReducedMotion ? [1, 1, 1, 1] : [0.88, 1, 1, 1.035],
  );
  const originDocumentOpacity = useTransform(
    originProgress,
    [0, 0.14, 0.28, 0.9, 1],
    prefersReducedMotion ? [1, 1, 1, 1, 1] : [0, 0.55, 1, 1, 0.5],
  );
  const originDocumentClip = useTransform(
    originProgress,
    [0, 0.14, 0.28],
    prefersReducedMotion
      ? [
          "inset(0% 0% 0% 0% round 0rem)",
          "inset(0% 0% 0% 0% round 0rem)",
          "inset(0% 0% 0% 0% round 0rem)",
        ]
      : [
          "inset(18% 0% 18% 0% round 1.1rem)",
          "inset(8% 0% 8% 0% round 0.55rem)",
          "inset(0% 0% 0% 0% round 0rem)",
        ],
  );
  const originHaloRotate = useTransform(
    originProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [-18, 72],
  );
  const originHaloScale = useTransform(
    originProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [1, 1, 1] : [0.82, 1, 1.12],
  );

  const performanceIntroX = useTransform(
    performanceProgress,
    [0, 0.24, 0.74, 1],
    prefersReducedMotion ? [0, 0, 0, 0] : [-74, 0, 0, -24],
  );
  const performanceIntroY = useTransform(
    performanceProgress,
    [0, 0.24, 0.74, 1],
    prefersReducedMotion ? [0, 0, 0, 0] : [84, 0, -8, -44],
  );
  const performanceIntroOpacity = useTransform(
    performanceProgress,
    [0, 0.14, 0.27, 0.9, 1],
    prefersReducedMotion ? [1, 1, 1, 1, 1] : [0, 0.5, 1, 1, 0.48],
  );
  const performanceFigureY = useTransform(
    performanceProgress,
    [0, 0.28, 0.72, 1],
    prefersReducedMotion ? [0, 0, 0, 0] : [148, 0, -10, -88],
  );
  const performanceFigureScale = useTransform(
    performanceProgress,
    [0, 0.28, 0.72, 1],
    prefersReducedMotion ? [1, 1, 1, 1] : [0.87, 1, 1, 1.025],
  );
  const performanceFigureOpacity = useTransform(
    performanceProgress,
    [0, 0.15, 0.3, 0.9, 1],
    prefersReducedMotion ? [1, 1, 1, 1, 1] : [0, 0.58, 1, 1, 0.5],
  );
  const performanceFigureClip = useTransform(
    performanceProgress,
    [0, 0.14, 0.3],
    prefersReducedMotion
      ? [
          "inset(0% 0% 0% 0%)",
          "inset(0% 0% 0% 0%)",
          "inset(0% 0% 0% 0%)",
        ]
      : [
          "inset(0% 0% 100% 0%)",
          "inset(0% 0% 42% 0%)",
          "inset(0% 0% 0% 0%)",
        ],
  );
  const stageWipeClip = useTransform(
    performanceProgress,
    [0, 0.12, 0.3],
    prefersReducedMotion
      ? [
          "inset(0% 0% 0% 100%)",
          "inset(0% 0% 0% 100%)",
          "inset(0% 0% 0% 100%)",
        ]
      : [
          "inset(0% 0% 0% 0%)",
          "inset(0% 0% 0% 28%)",
          "inset(0% 0% 0% 100%)",
        ],
  );

  useEffect(() => {
    if (!isAdmissionOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsAdmissionOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAdmissionOpen]);

  return (
    <>
      <section
        ref={originRef}
        id="arts"
        className={styles.originSection}
        aria-labelledby="origin-title"
        aria-label="Piano origin archive"
      >
        <span id="origin" className={styles.originAnchor} aria-hidden="true" />
        <motion.div
          className={styles.originHalo}
          aria-hidden="true"
          style={{ rotate: originHaloRotate, scale: originHaloScale }}
        />

        <motion.div
          className={styles.originStory}
          style={{
            x: originStoryX,
            y: originStoryY,
            opacity: originStoryOpacity,
          }}
        >
          <p className={styles.originYear}>2014</p>
          <h2 id="origin-title" className={styles.originTitle}>
            <motion.span
              initial={prefersReducedMotion ? false : { x: "-10%" }}
              whileInView={{ x: 0 }}
              viewport={{ once: false, amount: 0.45 }}
              transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
            >
              Before the code,
            </motion.span>
            <motion.span
              className={styles.originOutline}
              initial={prefersReducedMotion ? false : { x: "12%" }}
              whileInView={{ x: 0 }}
              viewport={{ once: false, amount: 0.45 }}
              transition={{
                duration: 1.05,
                delay: 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              there was music.
            </motion.span>
          </h2>
          <p className={styles.originCopy}>
            An admission letter from the Central Conservatory of Music Piano
            Academy at Gulangyu—the paper record of where a lifelong
            relationship with the piano began.
          </p>
          <dl className={styles.originFacts}>
            <div>
              <dt>Discipline</dt>
              <dd>Piano</dd>
            </div>
            <div>
              <dt>Archive</dt>
              <dd>Admission</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>2014</dd>
            </div>
          </dl>
        </motion.div>

        <motion.figure
          className={styles.admissionFigure}
          style={{
            y: originDocumentY,
            scale: originDocumentScale,
            opacity: originDocumentOpacity,
            clipPath: originDocumentClip,
          }}
        >
          <button
            className={styles.admissionButton}
            type="button"
            onClick={() => setIsAdmissionOpen(true)}
            aria-label="Open the 2014 piano admission letter"
          >
            <ElasticMesh
              image="/assets/arts/piano-admission-2014.jpg"
              ariaLabel="2014 admission letter from the Central Conservatory of Music Piano Academy at Gulangyu"
              showGrid={false}
              borderRadius={8}
              stiffness={0.052}
              damping={0.19}
              grabRadius={0.58}
              pull={0.36}
              wobble={5.2}
              tilt={8}
              shading={0.46}
              resolution={29}
              interaction="hover"
            />
          </button>
          <figcaption>
            <span>Original document</span>
            <span>The beginning, kept on paper.</span>
          </figcaption>
        </motion.figure>
      </section>

      <section
        ref={performanceRef}
        id="performance"
        className={styles.section}
        aria-labelledby="arts-title"
        aria-label="Music and piano"
      >
        <motion.div
          className={styles.stageWipe}
          aria-hidden="true"
          style={{ clipPath: stageWipeClip }}
        />

        <motion.div
          className={styles.intro}
          style={{
            x: performanceIntroX,
            y: performanceIntroY,
            opacity: performanceIntroOpacity,
          }}
        >
          <p className={styles.kicker}>Arts — 02 / Piano</p>
          <h2 id="arts-title">
            <motion.span
              initial={prefersReducedMotion ? false : { x: "-14%" }}
              whileInView={{ x: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
            >
              Sound
            </motion.span>
            <motion.span
              className={styles.indent}
              initial={prefersReducedMotion ? false : { x: "16%" }}
              whileInView={{ x: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{
                duration: 1.05,
                delay: 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              in motion.
            </motion.span>
          </h2>
          <p className={styles.summary}>
            Away from systems and research, music is where I listen, practise,
            and think in a different rhythm.
          </p>
        </motion.div>

        <motion.figure
          className={styles.figure}
          style={{
            y: performanceFigureY,
            scale: performanceFigureScale,
            opacity: performanceFigureOpacity,
            clipPath: performanceFigureClip,
          }}
        >
          <div className={styles.imageFrame}>
            {isVideoVisible ? (
              <>
                <video
                  className={styles.video}
                  src="/assets/arts/piano-performance.mp4"
                  poster="/assets/image-trail/4.jpg"
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  aria-label="Changjun Li piano performance video"
                />
                <button
                  className={styles.closeButton}
                  type="button"
                  onClick={() => setIsVideoVisible(false)}
                  aria-label="Close piano performance video"
                >
                  <X aria-hidden="true" size={15} strokeWidth={1.8} />
                  <span>Close</span>
                </button>
              </>
            ) : (
              <>
                <RippleDistortion
                  src="/assets/image-trail/4.jpg"
                  ariaLabel="Changjun Li performing piano on stage"
                  brushSize={190}
                  strength={0.18}
                  swirl={0.72}
                  rings={4}
                  spread={4.2}
                  fade={2.7}
                  spacing={13}
                  dispersion={0.06}
                  glint={0.18}
                  tint="#ffb178"
                  tintAmount={0.08}
                  grayscale={false}
                  quality="medium"
                  trigger="both"
                  clickStrength={1.45}
                />
                <button
                  className={styles.displayButton}
                  type="button"
                  onClick={() => setIsVideoVisible(true)}
                  aria-label="Play piano performance video"
                >
                  <Play
                    className={styles.playIcon}
                    aria-hidden="true"
                    size={13}
                    strokeWidth={1.8}
                    fill="currentColor"
                  />
                  <span>Display</span>
                </button>
              </>
            )}
          </div>
          <figcaption className={styles.caption}>
            <span>Performance study</span>
            <span>Chongqing · Piano</span>
            <span>Personal archive / 04</span>
          </figcaption>
        </motion.figure>
      </section>

      {isAdmissionOpen ? (
        <div
          className={styles.archiveOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="2014 piano admission letter"
          onClick={() => setIsAdmissionOpen(false)}
        >
          <button
            className={styles.archiveCloseButton}
            type="button"
            onClick={() => setIsAdmissionOpen(false)}
            aria-label="Close admission letter"
            autoFocus
          >
            <X aria-hidden="true" size={18} strokeWidth={1.7} />
            <span>Close archive</span>
          </button>
          <figure
            className={styles.archiveDocument}
            onClick={(event) => event.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/arts/piano-admission-2014.jpg"
              width="2400"
              height="1800"
              alt="Enlarged 2014 piano admission letter"
            />
            <figcaption>
              Original admission document · Press Esc or click outside to close
            </figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
}
