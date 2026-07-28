# Jack — 3D Creator

A responsive, motion-rich 3D creator portfolio built as a reusable personal
site framework.

## What is included

- Full-screen hero with magnetic portrait interaction
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

The hero name, introduction, and about copy are also in the same file. Global
colors, typography, button styles, and responsive refinements are in
`app/globals.css`.

## Run locally

```bash
npm install
npm run dev
```

Use `npm run build` for a production build and `npm test` for the rendered-page
checks.
