import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the finished portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(
    html,
    /<title>Changjun Li -- Double-Degree Student &amp; AI Researcher<\/title>/i,
  );
  assert.match(
    html,
    /aria-label="Hi, I(?:&#x27;|&apos;|')m Changjun Li"/i,
  );
  assert.match(html, /About Me/i);
  assert.match(html, /aria-label="Selected work"/i);
  assert.match(html, />Work<\/h2>/i);
  assert.match(html, /aria-label="Music and piano"/i);
  assert.match(html, /Sound/);
  assert.match(html, /in motion\./);
  assert.match(html, /assets\/image-trail\/4\.jpg/);
  assert.ok(
    html.indexOf('aria-label="Selected work"') <
      html.indexOf('aria-label="Music and piano"'),
    "Arts should render after Work on the home page",
  );
  assert.ok(
    html.indexOf('aria-label="Piano origin archive"') <
      html.indexOf('aria-label="Music and piano"'),
    "The admission archive should render before Sound in Motion",
  );
  assert.match(
    html,
    /aria-label="CQUPT Double-Degree Student, AI Researcher, AI Product Experience"/i,
  );
  assert.doesNotMatch(html, /Services/i);
  assert.doesNotMatch(html, /Nextlevel Studio/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("server-renders the research image archive", async () => {
  const response = await render("/research");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Research -- Changjun Li/i);
  assert.match(html, /Selected Research/i);
  assert.match(html, /Erlang Tianyan/i);
  assert.match(html, /Research Experience/i);
  assert.match(html, /research-erlang-tianyan\.png/i);
  assert.match(html, /research-experience\.png/i);
  assert.doesNotMatch(html, /Applied AI Systems/i);
  assert.doesNotMatch(html, /research-ai-products\.png/i);
  assert.ok(
    html.indexOf("research-experience.png") <
      html.indexOf("research-erlang-tianyan.png"),
    "Research Experience should render before Erlang Tianyan",
  );
});

test("server-renders the projects image archive", async () => {
  const response = await render("/projects");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Projects -- Changjun Li/i);
  assert.match(html, /Selected Projects/i);
  assert.match(html, /Applied AI Systems/i);
  assert.match(html, /research-ai-products\.png/i);
});

test("arts display control opens the optimized piano video", async () => {
  const artsSection = await readFile(
    new URL("../components/ArtsSection/ArtsSection.tsx", import.meta.url),
    "utf8",
  );

  assert.match(artsSection, /Play piano performance video/);
  assert.match(artsSection, />Display</);
  assert.match(artsSection, /assets\/arts\/piano-performance\.mp4/);
  assert.match(artsSection, /<video/);
  assert.match(artsSection, /controls/);
  assert.match(artsSection, /autoPlay/);
  await access(
    new URL("../public/assets/arts/piano-performance.mp4", import.meta.url),
  );
});

test("arts origin archive presents the 2014 piano admission letter", async () => {
  const artsSection = await readFile(
    new URL("../components/ArtsSection/ArtsSection.tsx", import.meta.url),
    "utf8",
  );

  assert.match(artsSection, /Arts — 02 \/ Piano/);
  assert.match(artsSection, /Before the code,/);
  assert.match(artsSection, /there was music\./);
  assert.match(artsSection, /Central Conservatory of Music/);
  assert.match(artsSection, /Open the 2014 piano admission letter/);
  assert.match(artsSection, /piano-admission-2014\.jpg/);
  assert.match(artsSection, /<ElasticMesh/);
  assert.match(artsSection, /interaction="hover"/);
  assert.match(artsSection, /aria-modal="true"/);
  assert.doesNotMatch(artsSection, /Admitted · Piano/);
  assert.doesNotMatch(artsSection, /View document/);
  assert.doesNotMatch(artsSection, /Musical practice themes/);
  assert.doesNotMatch(artsSection, /Document · 2014/);
  assert.doesNotMatch(artsSection, /Personal Archive/);
  await access(
    new URL("../public/assets/arts/piano-admission-2014.jpg", import.meta.url),
  );
});

test("elastic mesh turns the admission image into an interactive OGL surface", async () => {
  const elasticMesh = await readFile(
    new URL("../components/ElasticMesh/ElasticMesh.tsx", import.meta.url),
    "utf8",
  );
  const elasticStyles = await readFile(
    new URL(
      "../components/ElasticMesh/ElasticMesh.module.css",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(elasticMesh, /Renderer/);
  assert.match(elasticMesh, /Geometry/);
  assert.match(elasticMesh, /requestAnimationFrame/);
  assert.match(elasticMesh, /prefers-reduced-motion/);
  assert.match(elasticStyles, /touch-action:\s*pan-y/);
});

test("arts sections animate as the user scrolls", async () => {
  const artsSection = await readFile(
    new URL("../components/ArtsSection/ArtsSection.tsx", import.meta.url),
    "utf8",
  );
  const artsStyles = await readFile(
    new URL("../components/ArtsSection/ArtsSection.module.css", import.meta.url),
    "utf8",
  );

  assert.match(artsSection, /useScroll/);
  assert.match(artsSection, /useTransform/);
  assert.match(artsSection, /useReducedMotion/);
  assert.match(artsSection, /className=\{styles\.stageWipe\}/);
  assert.match(artsSection, /<motion\.figure/);
  assert.match(artsStyles, /\.originHalo/);
  assert.match(artsStyles, /@media \(prefers-reduced-motion: reduce\)/);
});

test("removes the disposable starter and keeps portfolio metadata", async () => {
  const [
    page,
    layout,
    globals,
    inlineLanyard,
    lanyardStyles,
    scrollExpand,
    scrollExpandStyles,
    shapeBlur,
    infiniteMenu,
    infiniteMenuStyles,
    researchPage,
    researchStyles,
    projectsPage,
    waves,
    packageJson,
  ] =
    await Promise.all([
      readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
      readFile(
        new URL(
          "../components/ContactExperience/InlineContactLanyard.tsx",
          import.meta.url,
        ),
        "utf8",
      ),
      readFile(
        new URL(
          "../components/ContactExperience/InlineContactLanyard.css",
          import.meta.url,
        ),
        "utf8",
      ),
      readFile(
        new URL("../components/ScrollExpand/ScrollExpand.tsx", import.meta.url),
        "utf8",
      ),
      readFile(
        new URL("../components/ScrollExpand/ScrollExpand.css", import.meta.url),
        "utf8",
      ),
      readFile(
        new URL("../components/ShapeBlur/ShapeBlur.tsx", import.meta.url),
        "utf8",
      ),
      readFile(
        new URL("../components/InfiniteMenu/InfiniteMenu.jsx", import.meta.url),
        "utf8",
      ),
      readFile(
        new URL("../components/InfiniteMenu/InfiniteMenu.css", import.meta.url),
        "utf8",
      ),
      readFile(new URL("../app/research/page.tsx", import.meta.url), "utf8"),
      readFile(
        new URL("../app/research/page.module.css", import.meta.url),
        "utf8",
      ),
      readFile(new URL("../app/projects/page.tsx", import.meta.url), "utf8"),
      readFile(
        new URL("../components/Waves/Waves.tsx", import.meta.url),
        "utf8",
      ),
      readFile(new URL("../package.json", import.meta.url), "utf8"),
    ]);

  assert.match(page, /function HeroSection/);
  assert.match(page, /function ImageTrailTransition/);
  assert.match(page, /function AboutSection/);
  assert.match(page, /function WorkSection/);
  assert.match(page, /useLayoutEffect/);
  assert.match(page, /window\.location\.hash/);
  assert.match(page, /window\.history\.scrollRestoration = "manual"/);
  assert.match(page, /window\.scrollTo\(0, 0\)/);
  assert.doesNotMatch(page, /function ServicesSection/);
  assert.doesNotMatch(page, /function ProjectsSection/);
  assert.doesNotMatch(page, /function ProjectCard/);
  assert.doesNotMatch(page, /const services|const projects/);
  assert.match(page, /InlineContactLanyard/);
  assert.match(page, /<Waves/);
  assert.match(page, /useState\(true\)/);
  assert.match(page, /TextPressure/);
  assert.match(page, /GradientText/);
  assert.match(page, /<EchoText/);
  assert.match(page, /text="MOVE TO REVEAL"/);
  assert.match(page, /<ScrollExpand/);
  assert.match(page, /<ShapeBlur/);
  assert.match(page, /className="contact-button-effect"/);
  assert.match(
    page,
    /<div className="contact-button-effect">[\s\S]*?<ShapeBlur[\s\S]*?<a\s+className="contact-button"/,
  );
  assert.match(page, /src="\/assets\/changjun-li-profile\.jpg"/);
  assert.match(page, /title="ABOUT ME"/);
  assert.match(page, /Studying intelligent systems\. Building useful AI\./);
  assert.match(page, /Double-Degree Student/);
  assert.match(page, /AI Researcher/);
  assert.match(page, /AI Product Experience/);
  assert.match(
    page,
    /Chongqing\s+University of Posts and Telecommunications/,
  );
  assert.match(page, /AI product manager intern/);
  assert.match(
    page,
    /<ImageTrail items=\{trailImages\} variant="6" \/>/,
  );
  assert.match(page, /id="projects"/);
  assert.match(page, /<InfiniteMenu items=\{workItems\} scale=\{1\.5\} \/>/);
  assert.match(page, /title: "Publication"/);
  assert.match(page, /title: "Research"/);
  assert.match(page, /title: "Projects"/);
  assert.match(page, /title: "Internship Experience"/);
  assert.match(page, /linkedin\.com\/in\/昌峻-李/);
  assert.match(page, /AI product management and fintech algorithm engineering/);
  assert.match(page, /multi-agent Text2SQL/);
  assert.doesNotMatch(page, /title: "Item 4"|https:\/\/google\.com/);
  assert.match(page, /image: "\/assets\/work\/publication\.png"/);
  assert.match(page, /image: "\/assets\/work\/research-cover\.png"/);
  assert.match(page, /image: "\/assets\/work\/research-ai-products\.png"/);
  assert.match(page, /scholar\.google\.com\/citations\?user=_3XFLicAAAAJ/);
  assert.match(page, /link: "\/research"/);
  assert.match(page, /link: "\/projects"/);
  assert.equal(
    page.match(/"\/assets\/image-trail\/[1-8]\.jpg"/g)?.length,
    8,
  );
  assert.doesNotMatch(page, /picsum\.photos/);
  assert.doesNotMatch(page, /function MarqueeRow|function MarqueeSection/);
  assert.doesNotMatch(page, /FallingText/);
  assert.match(page, /aria-expanded=/);
  assert.match(layout, /Changjun Li -- Double-Degree Student & AI Researcher/);
  assert.match(page, /\{ label: "Works", href: "#projects" \}/);
  assert.match(page, /\{ label: "Arts", href: "#arts" \}/);
  assert.match(page, /id="image-trail"/);
  assert.match(page, /<ArtsSection \/>/);
  assert.equal(page.match(/<ContactButton \/>/g)?.length, 1);
  assert.match(inlineLanyard, /李昌峻 · STUDENT & AI RESEARCHER/);
  assert.match(inlineLanyard, /contactHref=\{`mailto:\$\{email\}`\}/);
  assert.match(globals, /@layer base/);
  assert.match(globals, /max-height:\s*640px/);
  assert.doesNotMatch(globals, /\.project-card-stack/);
  assert.doesNotMatch(globals, /\.project-stack-card/);
  assert.doesNotMatch(globals, /\.project-media-grid/);
  assert.doesNotMatch(globals, /\.live-project-button/);
  assert.match(globals, /\.image-trail-section/);
  assert.match(lanyardStyles, /inset:\s*0/);
  assert.doesNotMatch(lanyardStyles, /520px|inline-lanyard-glow/);
  assert.match(waves, /requestAnimationFrame/);
  assert.match(waves, /prefers-reduced-motion/);
  assert.match(scrollExpand, /requestAnimationFrame/);
  assert.match(scrollExpand, /prefers-reduced-motion/);
  assert.match(scrollExpand, /webkitClipPath/);
  assert.match(scrollExpandStyles, /-webkit-clip-path/);
  assert.match(shapeBlur, /new THREE\.WebGLRenderer/);
  assert.match(shapeBlur, /u_shapeSize/);
  assert.match(shapeBlur, /shapeSize = 1\.2/);
  assert.match(shapeBlur, /shapeAspect = 1/);
  assert.match(shapeBlur, /uniform vec2 u_shapeSize/);
  assert.match(shapeBlur, /uniform vec2 u_shapeCenter/);
  assert.match(shapeBlur, /shapeAnchorX\?: number/);
  assert.match(shapeBlur, /pointerProjectionRight\?: number/);
  assert.match(shapeBlur, /pointerProjectionBottom\?: number/);
  assert.match(shapeBlur, /const isInsideSensor/);
  assert.match(
    shapeBlur,
    /material\.uniforms\.u_pixelRatio\.value = deviceRatio/,
  );
  assert.match(shapeBlur, /pointerX = Math\.min\(pointerX, projectedRight\)/);
  assert.match(shapeBlur, /pointerY = Math\.min\(pointerY, projectedBottom\)/);
  assert.match(infiniteMenu, /class InfiniteGridMenu/);
  assert.match(infiniteMenu, /new InfiniteGridMenu/);
  assert.match(infiniteMenu, /requestAnimationFrame/);
  assert.match(infiniteMenu, /sketch\?\.destroy\(\)/);
  assert.match(infiniteMenu, /aria-label="Drag to explore selected work"/);
  assert.match(infiniteMenu, /new URL\(activeItem\.link, window\.location\.href\)/);
  assert.match(infiniteMenu, /activeItem\?\.title === 'Internship Experience'/);
  assert.match(infiniteMenu, /<span>Internship<\/span>/);
  assert.match(infiniteMenu, /<span>Experience<\/span>/);
  assert.match(infiniteMenu, /vec2 blurRadius = texel \* 7\.0/);
  assert.match(infiniteMenu, /float monochrome = dot\(blurred\.rgb/);
  assert.doesNotMatch(infiniteMenu, /Internal route:/);
  assert.match(infiniteMenuStyles, /#infinite-grid-menu-canvas/);
  assert.match(
    infiniteMenuStyles,
    /\.face-description\s*\{[^}]*width:\s*min\(28vw, 23rem\)[^}]*max-width:\s*30ch/s,
  );
  assert.match(infiniteMenuStyles, /\.face-description\s*\{[^}]*color:\s*#8fd8ff/s);
  assert.match(infiniteMenuStyles, /\.face-description\s*\{[^}]*text-shadow:/s);
  assert.match(
    infiniteMenuStyles,
    /\.face-description\.active\s*\{[^}]*transform:\s*translateY\(-50%\)/s,
  );
  assert.match(researchPage, /research-erlang-tianyan\.png/);
  assert.match(researchPage, /research-experience\.png/);
  assert.doesNotMatch(researchPage, /research-ai-products\.png/);
  assert.match(researchPage, /Back to works/);
  assert.match(projectsPage, /research-ai-products\.png/);
  assert.match(projectsPage, /Applied AI Systems/);
  assert.match(projectsPage, /Back to works/);
  assert.match(researchStyles, /\.imageFrame img\s*\{[^}]*height:\s*auto/s);
  assert.match(
    globals,
    /\.work-section\s*\{[^}]*height:\s*100svh[^}]*min-height:\s*620px[^}]*background:\s*#0c0c0c/s,
  );
  assert.match(globals, /\.work-section__stage\s*\{[^}]*height:\s*100%/s);
  assert.match(page, /shapeAnchorX=\{0\.78\}/);
  assert.match(page, /shapeAnchorY=\{0\.25\}/);
  assert.match(page, /pointerProjectionRight=\{0\.04\}/);
  assert.match(page, /pointerProjectionBottom=\{0\.04\}/);
  assert.match(page, /circleSize=\{0\.22\}/);
  assert.match(page, /circleEdge=\{0\.42\}/);
  assert.match(
    globals,
    /\.contact-button-effect\s*\{[^}]*width:\s*22rem[^}]*height:\s*7rem/s,
  );
  assert.match(
    globals,
    /@media \(min-width:\s*768px\)[\s\S]*?\.contact-button-effect\s*\{[^}]*width:\s*28rem[^}]*height:\s*9rem/s,
  );
  assert.match(
    globals,
    /\.contact-button__shape\s*\{[^}]*width:\s*30rem[^}]*height:\s*14rem/s,
  );
  assert.match(
    globals,
    /@media \(min-width:\s*768px\)[\s\S]*?\.contact-button__shape\s*\{[^}]*width:\s*48rem[^}]*height:\s*18rem/s,
  );
  assert.match(globals, /\.contact-button\s*\{[^}]*border:\s*0/s);
  assert.match(globals, /\.contact-button\s*\{[^}]*overflow:\s*visible/s);
  assert.match(packageJson, /"framer-motion"/);
  assert.match(packageJson, /"gsap"/);
  assert.match(packageJson, /"lucide-react"/);
  assert.match(packageJson, /"@react-three\/fiber"/);
  assert.match(packageJson, /"@react-three\/rapier"/);
  assert.match(packageJson, /"meshline"/);
  assert.match(packageJson, /"gl-matrix"/);
  assert.doesNotMatch(packageJson, /matter-js/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(
    access(new URL("../app/_sites-preview", templateRoot)),
  );
  await access(
    new URL("public/assets/changjun-li-profile.jpg", templateRoot),
  );
  await Promise.all(
    Array.from({ length: 8 }, (_, index) =>
      access(
        new URL(
          `public/assets/image-trail/${index + 1}.jpg`,
          templateRoot,
        ),
      ),
    ),
  );
  await Promise.all(
    [
      "publication.png",
      "research-cover.png",
      "research-erlang-tianyan.png",
      "research-experience.png",
      "research-ai-products.png",
    ].map((filename) =>
      access(new URL(`public/assets/work/${filename}`, templateRoot)),
    ),
  );
  assert.doesNotMatch(page, /hero-portrait|changjun-li-3d-avatar/);
});
