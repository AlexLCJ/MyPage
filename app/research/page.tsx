import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Research -- Changjun Li",
  description:
    "Erlang Tianyan, Changjun Li's head-mounted multimodal 3D reconstruction research platform.",
};

const researchPlates = [
  {
    number: "01",
    src: "/assets/work/research-experience.png",
    width: 1751,
    height: 850,
    alt: "Changjun Li research experience covering granular-ball learning, fuzzy multiscale decisions, image forgery detection, and 3D reconstruction",
    title: "Research Experience",
    detail: "Learning, uncertainty, image forensics, and spatial systems",
  },
  {
    number: "02",
    src: "/assets/work/research-erlang-tianyan.png",
    width: 1630,
    height: 825,
    alt: "Erlang Tianyan head-mounted 3D reconstruction platform overview",
    title: "Erlang Tianyan",
    detail: "Head-mounted multimodal 3D reconstruction platform",
  },
];

export default function ResearchPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.backLink} href="/#projects">
          <span aria-hidden="true">←</span> Back to works
        </Link>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Selected Research · 2024–2026</p>
          <h1>Research</h1>
          <p className={styles.summary}>
            A head-mounted platform combining LiDAR, depth cameras, IMU, and
            adaptive algorithms for reliable 3D reconstruction.
          </p>
        </div>
      </header>

      <section className={styles.gallery} aria-label="Research project plates">
        {researchPlates.map((plate) => (
          <figure className={styles.plate} key={plate.src}>
            <div className={styles.imageFrame}>
              {/* The original research plate must remain unprocessed and uncropped. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={plate.src}
                width={plate.width}
                height={plate.height}
                alt={plate.alt}
                loading={plate.number === "01" ? "eager" : "lazy"}
              />
            </div>
            <figcaption className={styles.caption}>
              <span className={styles.number}>{plate.number}</span>
              <span className={styles.captionText}>
                <strong>{plate.title}</strong>
                <span>{plate.detail}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </section>
    </main>
  );
}
