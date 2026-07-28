import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
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
  assert.match(html, /<title>Changjun Li（李昌峻）｜3D 创作者<\/title>/i);
  assert.match(html, /你好，我是李昌峻/i);
  assert.match(html, /关于我/i);
  assert.match(html, /服务/i);
  assert.match(html, /Nextlevel Studio/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("removes the disposable starter and keeps portfolio metadata", async () => {
  const [page, layout, globals, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /function HeroSection/);
  assert.match(page, /function MarqueeSection/);
  assert.match(page, /function AboutSection/);
  assert.match(page, /function ServicesSection/);
  assert.match(page, /function ProjectsSection/);
  assert.match(page, /InlineContactLanyard/);
  assert.match(page, /aria-expanded=/);
  assert.match(layout, /Changjun Li（李昌峻）｜3D 创作者/);
  assert.match(globals, /@layer base/);
  assert.match(globals, /max-height:\s*640px/);
  assert.match(globals, /\.project-card-stack/);
  assert.match(globals, /\.project-stack-card:not\(:last-child\)/);
  assert.match(globals, /\.project-media-grid/);
  assert.match(packageJson, /"framer-motion"/);
  assert.match(packageJson, /"lucide-react"/);
  assert.match(packageJson, /"@react-three\/fiber"/);
  assert.match(packageJson, /"@react-three\/rapier"/);
  assert.match(packageJson, /"meshline"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(
    access(new URL("../app/_sites-preview", templateRoot)),
  );
});
