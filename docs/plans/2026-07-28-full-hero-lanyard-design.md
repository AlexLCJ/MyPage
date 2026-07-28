# Full-Hero Contact Lanyard Design

## Goal

Replace the narrow contact-card container with a transparent, full-hero
interaction layer. Clicking `Contact` should reveal only the physical lanyard
and profile card. The card must be draggable across the entire first screen
without exposing a modal, panel, backdrop, or clipped side frame.

## Chosen approach

The React Three Fiber canvas fills the positioned Hero section while remaining
transparent. Navigation stays above the canvas so `Contact` can toggle the
experience, and Escape remains a keyboard fallback. The lanyard anchor is
calculated from the current 3D viewport: it begins toward the right on wide
screens and moves toward the center as the viewport narrows. The draggable
physics body is therefore free to travel across the full Hero rather than a
fixed 520-pixel region.

The card keeps the React Bits ProfileCard structure and the physical lanyard
model. Changjun Li's supplied portrait fills the card face with `object-cover`.
The main identity is English, with `李昌峻 · 3D CREATOR` as the smaller secondary
line. Decorative container glow, helper copy, loader, and close button are
removed so no surrounding frame is visible.

## Performance

The 3D module, GLB model, and profile image begin loading during browser idle
time. The visible transition is opacity-only. Canvas pixel density and the
environment-map resolution are capped, and the card's continuous holographic
background animation is disabled while attached to the moving 3D lanyard.

## Verification

- Confirm no visible outer contact container at desktop and mobile widths.
- Drag the card from the right side to the left edge and back.
- Confirm the card remains usable at 320, 390, 550, 768, and 1280 pixels.
- Confirm `Contact` and Escape close the experience.
- Run lint, tests, and a production build.
