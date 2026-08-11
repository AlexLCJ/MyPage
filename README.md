# Changjun Li — Double-Degree Student & AI Researcher

A responsive, motion-rich personal portfolio for AI products, research, and
the arts.

## What is included

- Full-screen hero with magnetic portrait interaction
- Inline, physics-driven contact lanyard
- Two scroll-driven project reels
- Character-by-character biography reveal
- Reusable services and project data
- Sticky, scaling project cards
- Responsive layouts and reduced-motion support
- Site metadata and social sharing artwork

## Update the placeholder content

The main editable content is grouped near the top of `app/page.tsx`:

- `CONTACT_EMAIL`
- `marqueeImages`
- `services`
- `projects`

The hero name, introduction, Chinese navigation, and about copy are also in the
same file. Global
colors, typography, button styles, and responsive refinements are in
`app/globals.css`.

## Run locally

```bash
npm install
npm run dev
```

Use `npm run build` for a production build and `npm test` for the rendered-page
checks.
