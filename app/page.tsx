"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import InlineContactLanyard from "@/components/ContactExperience/InlineContactLanyard";
import GradientText from "@/components/GradientText/GradientText";
import TextPressure from "@/components/TextPressure/TextPressure";
import Waves from "@/components/Waves/Waves";

const CONTACT_EMAIL = "hello@changjunli.design";

const marqueeImages = [
  "https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif",
  "https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif",
  "https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif",
  "https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif",
  "https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif",
  "https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif",
  "https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif",
  "https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif",
  "https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif",
  "https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif",
  "https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif",
  "https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif",
  "https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif",
  "https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif",
  "https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif",
  "https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif",
  "https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif",
  "https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif",
  "https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif",
  "https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif",
  "https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif",
];

const services = [
  {
    number: "01",
    name: "3D Modeling",
    description:
      "Creation of detailed objects, characters, or environments tailored to specific client needs, ideal for games, products, and visualizations.",
  },
  {
    number: "02",
    name: "Rendering",
    description:
      "High-quality, photorealistic renders that showcase designs with custom lighting, textures, and materials to bring concepts to life.",
  },
  {
    number: "03",
    name: "Motion Design",
    description:
      "Dynamic animations and motion graphics that add energy and storytelling to brands, products, and digital experiences.",
  },
  {
    number: "04",
    name: "Branding",
    description:
      "Crafting cohesive visual identities — from logos to full brand systems — that communicate a clear and memorable presence.",
  },
  {
    number: "05",
    name: "Web Design",
    description:
      "Designing clean, modern, and conversion-focused websites with attention to layout, typography, and user experience.",
  },
];

const projects = [
  {
    number: "01",
    category: "Client",
    name: "Nextlevel Studio",
    images: [
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png&w=1280&q=85",
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png&w=1280&q=85",
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png&w=1280&q=85",
    ],
  },
  {
    number: "02",
    category: "Personal",
    name: "Aura Brand Identity",
    images: [
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png&w=1280&q=85",
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png&w=1280&q=85",
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png&w=1280&q=85",
    ],
  },
  {
    number: "03",
    category: "Client",
    name: "Solaris Digital",
    images: [
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png&w=1280&q=85",
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png&w=1280&q=85",
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png&w=1280&q=85",
    ],
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
    <a
      className="contact-button"
      href={`mailto:${CONTACT_EMAIL}`}
      aria-label="Contact Changjun Li by email"
    >
      <span>Contact Me</span>
      <ArrowUpRight aria-hidden="true" size={18} strokeWidth={2.2} />
    </a>
  );
}

function LiveProjectButton({
  href,
  projectName,
}: {
  href: string;
  projectName: string;
}) {
  return (
    <a
      className="live-project-button"
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`View the ${projectName} project`}
    >
      <span>Live Project</span>
      <ArrowUpRight aria-hidden="true" size={18} strokeWidth={2} />
    </a>
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
    { label: "Price", href: "#services" },
    { label: "Projects", href: "#projects" },
    { label: "Contact", onClick: onContactToggle },
  ];

  return (
    <section
      id="top"
      className="hero-section relative flex h-screen min-h-[620px] flex-col overflow-x-clip bg-[#0C0C0C]"
    >
      <Waves
        className="hero-waves"
        lineColor="rgba(123, 151, 171, 0.24)"
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

      <div className="hero-bottom-bar relative z-20 mt-auto flex items-end justify-between gap-8 px-6 pb-7 sm:pb-8 md:px-10 md:pb-10">
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
            ariaLabel="Enterprise AI Product Manager, Researcher, Amateur Pianist"
          >
            <span className="hero-role-lines">
              <span className="hero-role-line">
                Enterprise <strong>AI</strong> Product Manager
              </span>
              <span className="hero-role-line">
                <strong>Researcher</strong>
              </span>
              <span className="hero-role-line">
                Amateur <strong>Pianist</strong>
              </span>
            </span>
          </GradientText>
        </FadeIn>
        <FadeIn delay={0.5} y={20}>
          <ContactButton />
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

function MarqueeRow({
  images,
  direction,
  offset,
}: {
  images: string[];
  direction: "left" | "right";
  offset: number;
}) {
  const translate = direction === "right" ? offset - 200 : -(offset - 200);
  const tripledImages = [...images, ...images, ...images];

  return (
    <div className="overflow-hidden">
      <div
        className="flex w-max gap-3"
        style={{
          transform: `translate3d(${translate}px, 0, 0)`,
          willChange: "transform",
        }}
      >
        {tripledImages.map((src, index) => (
          <img
            key={`${src}-${index}`}
            src={src}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="h-[270px] w-[420px] shrink-0 rounded-2xl object-cover"
          />
        ))}
      </div>
    </div>
  );
}

function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const updateOffset = () => {
      const section = sectionRef.current;
      if (!section) return;

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      setOffset(
        (window.scrollY - sectionTop + window.innerHeight) * 0.3,
      );
    };

    updateOffset();
    window.addEventListener("scroll", updateOffset, { passive: true });
    window.addEventListener("resize", updateOffset);

    return () => {
      window.removeEventListener("scroll", updateOffset);
      window.removeEventListener("resize", updateOffset);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="flex flex-col gap-3 overflow-hidden bg-[#0C0C0C] pb-10 pt-24 sm:pt-32 md:pt-40"
      aria-label="Selected project motion previews"
    >
      <MarqueeRow
        images={marqueeImages.slice(0, 11)}
        direction="right"
        offset={offset}
      />
      <MarqueeRow
        images={marqueeImages.slice(11)}
        direction="left"
        offset={offset}
      />
    </section>
  );
}

function AnimatedCharacter({
  character,
  index,
  total,
  progress,
}: {
  character: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const end = Math.min(start + 1 / total + 0.08, 1);
  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  return (
    <span className="relative inline" aria-hidden="true">
      <span className="invisible">{character}</span>
      <motion.span className="absolute inset-0" style={{ opacity }}>
        {character}
      </motion.span>
    </span>
  );
}

function AnimatedText({ text }: { text: string }) {
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: paragraphRef,
    offset: ["start 0.8", "end 0.2"],
  });

  return (
    <p
      ref={paragraphRef}
      className="w-full max-w-[560px] text-center text-[clamp(1rem,2vw,1.35rem)] font-medium leading-relaxed text-[#D7E2EA]"
      aria-label={text}
    >
      {Array.from(text).map((character, index) => (
        <AnimatedCharacter
          key={`${character}-${index}`}
          character={character}
          index={index}
          total={text.length}
          progress={scrollYProgress}
        />
      ))}
    </p>
  );
}

function AboutSection() {
  const aboutText =
    "With more than five years of experience in design, I focus on branding, web design, and user experience. I truly enjoy working with businesses that aim to stand out and present their best image. Let's build something incredible together!";

  const decorations = [
    {
      src: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png",
      alt: "Metallic moon decoration",
      className:
        "absolute left-[1%] top-[4%] w-[120px] sm:left-[2%] sm:w-[160px] md:left-[4%] md:w-[210px]",
      delay: 0.1,
      x: -80,
    },
    {
      src: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png",
      alt: "Abstract 3D decoration",
      className:
        "absolute bottom-[8%] left-[3%] w-[100px] sm:left-[6%] sm:w-[140px] md:left-[10%] md:w-[180px]",
      delay: 0.25,
      x: -80,
    },
    {
      src: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png",
      alt: "Metallic block decoration",
      className:
        "absolute right-[1%] top-[4%] w-[120px] sm:right-[2%] sm:w-[160px] md:right-[4%] md:w-[210px]",
      delay: 0.15,
      x: 80,
    },
    {
      src: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png",
      alt: "Abstract 3D sculpture",
      className:
        "absolute bottom-[8%] right-[3%] w-[130px] sm:right-[6%] sm:w-[170px] md:right-[10%] md:w-[220px]",
      delay: 0.3,
      x: 80,
    },
  ];

  return (
    <section
      id="about"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0C0C0C] px-5 py-20 sm:px-8 md:px-10"
    >
      {decorations.map((decoration) => (
        <FadeIn
          key={decoration.src}
          className={`${decoration.className} pointer-events-none z-0`}
          delay={decoration.delay}
          duration={0.9}
          x={decoration.x}
          y={0}
        >
          <img
            src={decoration.src}
            alt={decoration.alt}
            loading="lazy"
            className="h-auto w-full select-none object-contain"
            draggable={false}
          />
        </FadeIn>
      ))}

      <div className="relative z-10 flex w-full flex-col items-center">
        <div className="flex w-full flex-col items-center gap-10 sm:gap-14 md:gap-16">
          <FadeIn delay={0} y={40}>
            <h2 className="hero-heading text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight">
              About Me
            </h2>
          </FadeIn>
          <AnimatedText text={aboutText} />
        </div>
        <div className="mt-16 sm:mt-20 md:mt-24">
          <ContactButton />
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section
      id="services"
      className="rounded-t-[40px] bg-white px-5 py-20 text-[#0C0C0C] sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"
    >
      <FadeIn y={40}>
        <h2 className="mb-16 text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight sm:mb-20 md:mb-28">
          Services
        </h2>
      </FadeIn>

      <div className="mx-auto max-w-5xl border-t border-[rgba(12,12,12,0.15)]">
        {services.map((service, index) => (
          <FadeIn
            key={service.number}
            delay={index * 0.1}
            y={36}
            className="grid grid-cols-[minmax(84px,0.34fr)_1fr] gap-5 border-b border-[rgba(12,12,12,0.15)] py-8 sm:grid-cols-[minmax(140px,0.38fr)_1fr] sm:gap-8 sm:py-10 md:py-12"
          >
            <span className="text-[clamp(3rem,10vw,140px)] font-black leading-none tracking-tight">
              {service.number}
            </span>
            <div className="flex flex-col justify-center gap-3 sm:gap-4">
              <h3 className="text-[clamp(1rem,2.2vw,2.1rem)] font-medium uppercase leading-tight">
                {service.name}
              </h3>
              <p className="max-w-2xl text-[clamp(0.85rem,1.6vw,1.25rem)] font-light leading-relaxed opacity-60">
                {service.description}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  index,
  totalCards,
  stackProgress,
}: {
  project: (typeof projects)[number];
  index: number;
  totalCards: number;
  stackProgress: MotionValue<number>;
}) {
  const targetScale = 1 - (totalCards - 1 - index) * 0.03;
  const scaleStep = 1 / Math.max(totalCards - 0.4, 1);
  const scaleStart = 0.18 + index * scaleStep;
  const scaleEnd = Math.min(scaleStart + scaleStep * 0.82, 1);
  const scale = useTransform(
    stackProgress,
    [scaleStart, scaleEnd],
    [1, targetScale],
  );

  return (
    <motion.article
      id={`project-${project.number}`}
      data-project-card={project.number}
      className="project-stack-card project-card-sticky sticky overflow-hidden rounded-[40px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 text-[#D7E2EA] sm:rounded-[50px] sm:p-6 md:rounded-[60px] md:p-8"
      style={
        {
          scale,
          zIndex: index + 1,
          "--card-offset": `${index * 28}px`,
        } as unknown as MotionStyle
      }
    >
      <div className="mb-4 grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-2 sm:mb-6 sm:grid-cols-[auto_0.65fr_1.3fr_auto] sm:gap-6 md:mb-8 md:gap-8">
        <span className="row-span-2 text-[clamp(3rem,8vw,116px)] font-black leading-none tracking-tight sm:row-span-1">
          {project.number}
        </span>
        <p className="self-end text-xs font-light uppercase tracking-[0.24em] opacity-60 sm:self-center sm:text-sm md:text-base">
          {project.category}
        </p>
        <h3 className="col-start-2 text-[clamp(1.15rem,2.5vw,2.6rem)] font-medium uppercase leading-none sm:col-auto">
          {project.name}
        </h3>
        <div className="col-span-2 mt-2 sm:col-span-1 sm:mt-0 sm:justify-self-end">
          <LiveProjectButton
            href={project.images[2]}
            projectName={project.name}
          />
        </div>
      </div>

      <div className="project-media-grid grid grid-cols-[0.4fr_0.6fr] gap-2 sm:gap-3 md:gap-4">
        <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
          <img
            src={project.images[0]}
            alt={`${project.name} project detail one`}
            loading="lazy"
            decoding="async"
            className="project-image-small h-[clamp(130px,16vw,230px)] w-full rounded-[28px] object-cover sm:rounded-[40px] md:rounded-[50px]"
          />
          <img
            src={project.images[1]}
            alt={`${project.name} project detail two`}
            loading="lazy"
            decoding="async"
            className="project-image-large h-[clamp(160px,22vw,340px)] w-full rounded-[28px] object-cover sm:rounded-[40px] md:rounded-[50px]"
          />
        </div>
        <img
          src={project.images[2]}
          alt={`${project.name} project main visual`}
          loading="lazy"
          decoding="async"
          className="project-image-main h-full min-h-0 w-full rounded-[28px] object-cover sm:rounded-[40px] md:rounded-[50px]"
        />
      </div>
    </motion.article>
  );
}

function ProjectsSection() {
  const stackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      id="projects"
      className="relative z-10 -mt-10 rounded-t-[40px] bg-[#0C0C0C] px-4 pb-16 pt-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-6 sm:pt-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pb-24 md:pt-32"
    >
      <FadeIn y={40}>
        <h2 className="hero-heading mb-16 text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight sm:mb-20 md:mb-28">
          Project
        </h2>
      </FadeIn>

      <div
        ref={stackRef}
        className="project-card-stack mx-auto max-w-[1480px]"
      >
        {projects.map((project, index) => (
          <ProjectCard
            key={project.number}
            project={project}
            index={index}
            totalCards={projects.length}
            stackProgress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(true);

  return (
    <main className="site-shell overflow-x-clip bg-[#0C0C0C]">
      <HeroSection
        isContactOpen={isContactOpen}
        onContactToggle={() => setIsContactOpen((current) => !current)}
        onContactClose={() => setIsContactOpen(false)}
      />
      <MarqueeSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
    </main>
  );
}
