# Scroll Expand About Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the existing static About Me section with the supplied scroll-driven expanding-media interaction, while keeping ImageTrail unchanged and presenting Changjun Li's actual professional identity.

**Architecture:** Add a reusable client-side `ScrollExpand` component that measures a sticky stage and maps window scroll progress to frame clipping, media zoom, title exit, and content reveal. The home page owns the personalized About copy and composes it inside the component.

**Tech Stack:** Next.js, React, TypeScript, CSS, existing Framer Motion utilities elsewhere on the page.

---

### Task 1: Add the reusable ScrollExpand component

**Files:**
- Create: `components/ScrollExpand/ScrollExpand.tsx`
- Create: `components/ScrollExpand/ScrollExpand.css`

Implement the supplied scroll-progress behavior with typed props, reduced-motion support, responsive sizing, and Safari-compatible clip paths.

### Task 2: Replace the legacy About section

**Files:**
- Modify: `app/page.tsx`

Remove the old decorative assets and generic design-experience copy. Place `ScrollExpand` directly after ImageTrail and populate it with Changjun Li's AI product, research, and piano identity.

### Task 3: Add regression coverage and verify

**Files:**
- Modify: `tests/rendered-html.test.mjs`

Assert the new component, personal media, and copy are present, then run lint, build, rendering tests, and browser-based scroll checks.
