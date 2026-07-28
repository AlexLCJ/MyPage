# Inline Contact Lanyard

## Purpose

Replace the hero navigation's direct email link with an interaction that stays
inside the page. Clicking `联系` drops a physics-driven React Bits lanyard from
the top of the hero. The page remains visible: there is no modal, backdrop,
dialog frame, or scroll lock.

## Component structure

- `InlineContactLanyard` owns the in-page entrance and exit animation, lazy
  loading, close interactions, and email fallback.
- `Lanyard` owns the Three.js canvas, Rapier physics, rope joints, draggable hit
  target, model, band texture, and the 3D-to-DOM attachment point.
- `ProfileCard` owns the card artwork, profile fields, holographic treatment,
  avatar, availability state, and email button.
- `Home` owns the open state. The navigation entry toggles the lanyard; the
  existing CTA buttons continue to use direct email links.

The ProfileCard is rendered through Drei's `Html` bridge as part of the
lanyard's rigid body. Its visual dimensions and invisible drag plane match, so
the complete card can be grabbed rather than only the smaller GLB surface. The
underlying model card face becomes transparent while the metal clip remains
visible.

The identity is `CHANGJUN LI` as the primary English card title, with
`李昌峻 · 3D CREATOR` below at a smaller size.

## Responsive and accessibility behavior

On desktop the lanyard drops on the right side below the contact navigation,
leaving the central portrait visible. On narrow screens it drops from the top
center and temporarily sits above the hero. Users can close it by toggling the
navigation entry, pressing Escape, or using the small close control. The 3D
bundle is dynamically loaded only after the lanyard is requested.

## Verification

Validate production build and rendered HTML tests. Visually verify 320×568,
390×844, 550×715, 1280×720, and 1440×900. Confirm the page remains visible,
the whole card reports a grab cursor, the pass swings under physics, and the
three close paths work.
