# Contact Lanyard Interaction

## Purpose

Replace the hero navigation's direct email link with a memorable contact
interaction. Clicking `CONTACT` opens a full-screen dialog containing a
physics-driven React Bits lanyard. The attached pass uses the React Bits
ProfileCard visual language and keeps Jack's current placeholder identity until
the portfolio is personalized.

## Component structure

- `ContactModal` owns the dialog, focus restoration, body scroll lock, lazy
  loading, close interactions, and email fallback.
- `Lanyard` owns the Three.js canvas, Rapier physics, rope joints, draggable hit
  target, model, band texture, and the 3D-to-DOM attachment point.
- `ProfileCard` owns the card artwork, profile fields, holographic treatment,
  avatar, availability state, and email button.
- `Home` owns the open state. Only the navigation `CONTACT` entry opens the
  dialog; the existing CTA buttons continue to use direct email links.

The ProfileCard is rendered through Drei's `Html` bridge as part of the
lanyard's rigid body. Its visual dimensions and invisible drag plane match, so
the complete card can be grabbed rather than only the smaller GLB surface. The
underlying model card face becomes transparent while the metal clip remains
visible.

## Responsive and accessibility behavior

The dialog scales from 320px mobile widths through wide desktop screens. Header
and footer stay outside the canvas, while the card and rope remain centered
inside a clipped stage. Users can close with the close button, Escape, or the
backdrop. Opening locks page scroll and moves focus to the close button; closing
restores the previous focus. The 3D bundle is dynamically loaded only after the
dialog is requested.

## Verification

Validate production build and rendered HTML tests. Visually verify 320×568,
390×844, 550×715, 1280×720, and 1440×900. Confirm the whole card reports a grab
cursor, the pass swings under physics, and all three close paths work.
