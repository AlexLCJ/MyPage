"use client";

import {
  type CSSProperties,
  type ReactNode,
  useLayoutEffect,
  useState,
} from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import InlineContactLanyard from "@/components/ContactExperience/InlineContactLanyard";
import ArtsSection from "@/components/ArtsSection/ArtsSection";
import EchoText from "@/components/EchoText/EchoText";
import GradientText from "@/components/GradientText/GradientText";
import ImageTrail from "@/components/ImageTrail/ImageTrail";
import InfiniteMenu from "@/components/InfiniteMenu/InfiniteMenu";
import ScrollExpand from "@/components/ScrollExpand/ScrollExpand";
import ShapeBlur from "@/components/ShapeBlur/ShapeBlur";
import TextPressure from "@/components/TextPressure/TextPressure";
import Waves from "@/components/Waves/Waves";

const CONTACT_EMAIL = "AlexCJLi@163.com";

const trailImages = [
  "/assets/image-trail/1.jpg",
  "/assets/image-trail/2.jpg",
  "/assets/image-trail/3.jpg",
  "/assets/image-trail/4.jpg",
  "/assets/image-trail/5.jpg",
  "/assets/image-trail/6.jpg",
  "/assets/image-trail/7.jpg",
  "/assets/image-trail/8.jpg",
];

const workItems = [
  {
    image: "/assets/work/publication.png",
    link: "https://scholar.google.com/citations?user=_3XFLicAAAAJ&hl=zh-CN",
    title: "Publication",
    description:
      "A JCR Q1 study combining granular-ball computing with BiLSTM forecasting across nine financial datasets.",
  },
  {
    image: "/assets/work/research-cover.png",
    link: "/research",
    title: "Research",
    description:
      "Rough sets, image forensics, financial forecasting, and head-mounted 3D reconstruction.",
  },
  {
    image: "/assets/work/research-ai-products.png",
    link: "/projects",
    title: "Projects",
    description:
      "AI-native education workflows and a modular JVM bytecode protection platform.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1781242629922-6f39cc3671cd?q=80&w=600&h=600&fit=crop&sat=-100&auto=format",
    link: "https://www.linkedin.com/in/昌峻-李/",
    title: "Internship Experience",
    description:
      "AI product management and fintech algorithm engineering—Qwen knowledge graphs, multi-agent Text2SQL, and customer analytics.",
  },
];

type FadeInProps = {
  as?: "div" | "nav";
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  style?: CSSProperties;
  x?: number;
  y?: number;
};

function FadeIn({
  as = "div",
  children,
  className,
  delay = 0,
  duration = 0.7,
  style,
  x = 0,
  y = 30,
}: FadeInProps) {
  const MotionElement = as === "nav" ? motion.nav : motion.div;

  return (
    <MotionElement
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      transition={{
        delay,
        duration,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      style={style}
    >
      {children}
    </MotionElement>
  );
}

function ContactButton() {
  return (
    <div className="contact-button-effect">
      <ShapeBlur
        className="contact-button__shape"
        variation={0}
        shapeSize={0.54}
        shapeAspect={3.15}
        shapeAnchorX={0.78}
        shapeAnchorY={0.25}
        pointerProjectionRight={0.04}
        pointerProjectionBottom={0.04}
        roundness={0.31}
        borderSize={0.0275}
        circleSize={0.22}
        circleEdge={0.42}
      />
      <a
        className="contact-button"
        href={`mailto:${CONTACT_EMAIL}`}
        aria-label="Contact Changjun Li by email"
      >
        <span className="contact-button__label">
          <span>Contact Me</span>
          <ArrowUpRight aria-hidden="true" size={17} strokeWidth={2} />
        </span>
      </a>
    </div>
  );
}

function HeroSection({
  isContactOpen,
  onContactToggle,
  onContactClose,
}: {
  isContactOpen: boolean;
  onContactToggle: () => void;
  onContactClose: () => void;
}) {
  const navigationItems = [
    { label: "About", href: "#about" },
    { label: "Works", href: "#projects" },
    { label: "Arts", href: "#arts" },
    { label: "Contact", onClick: onContactToggle },
  ];

  return (
    <section
      id="top"
      className="hero-section relative flex h-screen min-h-[620px] flex-col overflow-x-clip bg-[#0C0C0C]"
    >
      <Waves
        className="hero-waves"
        lineColor="#b8b8b8"
        backgroundColor="#0C0C0C"
        waveSpeedX={0.015}
        waveSpeedY={0.006}
        waveAmpX={30}
        waveAmpY={14}
        xGap={14}
        yGap={30}
        friction={0.92}
        tension={0.006}
        maxCursorMove={80}
      />

      <FadeIn
        as="nav"
        className="hero-nav relative z-[70] flex justify-between px-6 pt-6 text-sm font-medium tracking-wider text-[#D7E2EA] md:px-10 md:pt-8 md:text-lg lg:text-[1.4rem]"
        y={-20}
      >
        {navigationItems.map((item) =>
          item.href ? (
            <a
              key={item.label}
              href={item.href}
              className="transition-opacity duration-200 hover:opacity-70"
            >
              {item.label}
            </a>
          ) : (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className="cursor-pointer border-0 bg-transparent font-[inherit] tracking-[inherit] text-[inherit] transition-opacity duration-200 hover:opacity-70"
              aria-expanded={isContactOpen}
              aria-controls="inline-contact-lanyard"
            >
              {item.label}
            </button>
          ),
        )}
      </FadeIn>

      <div className="hero-heading-wrap relative z-20 mt-6 overflow-hidden sm:mt-4 md:-mt-5">
        <FadeIn delay={0.15} y={40}>
          <div className="hero-text-pressure-stack">
            <div className="hero-text-pressure hero-text-pressure-intro">
              <TextPressure
                text="Hi, I'm"
                ariaLabel="Hi, I'm Changjun Li"
                flex={false}
                alpha={false}
                stroke={false}
                width
                weight
                minWeight={320}
                maxWeight={1000}
                italic={false}
                scale={false}
                textColor="#AAB8C2"
                className="hero-text-pressure-line-title"
                minFontSize={28}
              />
            </div>
            <div className="hero-text-pressure hero-text-pressure-name">
              <TextPressure
                as="div"
                text="Changjun Li"
                ariaHidden
                flex
                alpha={false}
                stroke={false}
                width
                weight
                minWeight={320}
                maxWeight={1000}
                italic={false}
                scale={false}
                textColor="#AAB8C2"
                className="hero-text-pressure-line-title"
                minFontSize={28}
              />
            </div>
          </div>
        </FadeIn>
      </div>

      <div className="hero-bottom-bar relative z-20 mt-auto flex items-end justify-start gap-8 px-6 pb-7 sm:pb-8 md:px-10 md:pb-10">
        <FadeIn delay={0.35} y={20}>
          <GradientText
            className="hero-roles"
            colors={[
              "#dce8f0",
              "#8fd8ff",
              "#8d7cff",
              "#f07acb",
              "#dce8f0",
            ]}
            animationSpeed={5.5}
            direction="horizontal"
            pauseOnHover
            yoyo={false}
            showBorder={false}
            ariaLabel="CQUPT Double-Degree Student, AI Researcher, AI Product Experience"
          >
            <span className="hero-role-lines">
              <span className="hero-role-line">
                CQUPT <strong>Double-Degree</strong> Student
              </span>
              <span className="hero-role-line">
                <strong>AI Researcher</strong>
              </span>
              <span className="hero-role-line">
                AI Product <strong>Experience</strong>
              </span>
            </span>
          </GradientText>
        </FadeIn>
      </div>
      <div id="inline-contact-lanyard">
        <InlineContactLanyard
          email={CONTACT_EMAIL}
          isOpen={isContactOpen}
          onClose={onContactClose}
        />
      </div>
    </section>
  );
}

function ImageTrailTransition() {
  return (
    <section
      id="image-trail"
      className="image-trail-section"
      aria-label="Interactive photo trail"
    >
      <p className="image-trail-prompt">
        <EchoText
          text="MOVE TO REVEAL"
          echoes={10}
          lag={0.2}
          offset={28}
          direction="right"
          fade={0.7}
          blur={2}
          tint="#8fd8ff"
          mode="both"
          cursorRadius={520}
          duration={900}
          ease="ease-out"
          fontSize="clamp(2.8rem, 8vw, 7rem)"
          fontWeight={800}
          color="#d7e2ea"
        />
      </p>
      <ImageTrail items={trailImages} variant="6" />
    </section>
  );
}

function AboutSection() {
  return (
    <section
      id="about"
      className="bg-[#0C0C0C]"
      aria-label="About Changjun Li"
    >
      <ScrollExpand
        className="about-scroll-expand"
        src="/assets/changjun-li-profile.jpg"
        alt="Black and white portrait of Changjun Li"
        title="ABOUT ME"
        scrollHint="Scroll to expand"
        startWidth={44}
        startHeight={62}
        startRadius={28}
        mediaZoom={1.18}
        scrollDistance={1.15}
        holdDistance={0.42}
        smoothing={0.09}
        overlayScrim={0.68}
        useWindowScroll
        aria-label="Scroll to reveal more about Changjun Li"
      >
        <div className="about-scroll-expand__content">
          <p className="about-scroll-expand__eyebrow">
            CQUPT · Double Degree · Class of 2027
          </p>
          <h2 className="about-scroll-expand__heading">
            Studying intelligent systems. Building useful AI.
          </h2>
          <div className="about-scroll-expand__copy">
            <p>
              I&apos;m Changjun Li, a double-degree student at Chongqing
              University of Posts and Telecommunications, studying Intelligent
              Science and Technology alongside Mathematics and Applied
              Mathematics. My path also includes applied AI research and
              hands-on AI product work.
            </p>
            <p>
              I&apos;ve published research on financial time-series forecasting
              and worked as an AI product manager intern, building an
              enterprise knowledge graph and a multi-agent Text2SQL pipeline.
            </p>
          </div>
          <ul className="about-scroll-expand__roles" aria-label="Roles">
            <li>Double-Degree Student</li>
            <li>AI Researcher</li>
            <li>AI Product Experience</li>
          </ul>
          <div className="about-scroll-expand__action">
            <ContactButton />
          </div>
        </div>
      </ScrollExpand>
    </section>
  );
}

function WorkSection() {
  return (
    <section
      id="projects"
      className="work-section"
      aria-label="Selected work"
    >
      <h2 className="sr-only">Work</h2>
      <div className="work-section__stage">
        <InfiniteMenu items={workItems} scale={1.5} />
      </div>
    </section>
  );
}

export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(true);

  useLayoutEffect(() => {
    if (window.location.hash) return;

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const resetToTop = () => window.scrollTo(0, 0);
    resetToTop();
    const frame = window.requestAnimationFrame(resetToTop);
    window.addEventListener("pageshow", resetToTop);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pageshow", resetToTop);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  return (
    <main className="site-shell overflow-x-clip bg-[#0C0C0C]">
      <HeroSection
        isContactOpen={isContactOpen}
        onContactToggle={() => setIsContactOpen((current) => !current)}
        onContactClose={() => setIsContactOpen(false)}
      />
      <ImageTrailTransition />
      <AboutSection />
      <WorkSection />
      <ArtsSection />
    </main>
  );
}
