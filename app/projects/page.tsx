import type { Metadata } from "next";
import Link from "next/link";
import styles from "../research/page.module.css";

export const metadata: Metadata = {
  title: "Projects -- Changjun Li",
  description:
    "Selected AI product systems by Changjun Li, including AI-native education and JVM bytecode protection platforms.",
};

export default function ProjectsPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.backLink} href="/#projects">
          <span aria-hidden="true">←</span> Back to works
        </Link>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Selected Projects · Product Systems</p>
          <h1>Projects</h1>
          <p className={styles.summary}>
            AI-native education workflows and modular JVM protection, designed
            from product architecture through delivery.
          </p>
        </div>
      </header>

      <section className={styles.gallery} aria-label="Project overview plate">
        <figure className={styles.plate}>
          <div className={styles.imageFrame}>
            {/* Keep the supplied overview plate complete and uncropped. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/work/research-ai-products.png"
              width="1632"
              height="833"
              alt="Zhiping Xuetang AI education platform and Grunteon JVM protection platform overview"
              loading="eager"
            />
          </div>
          <figcaption className={styles.caption}>
            <span className={styles.number}>01</span>
            <span className={styles.captionText}>
              <strong>Applied AI Systems</strong>
              <span>AI-native education and JVM protection platforms</span>
            </span>
          </figcaption>
        </figure>
      </section>
    </main>
  );
}
