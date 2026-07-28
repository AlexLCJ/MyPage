# Responsive Layout Repair

## Goal

Preserve the original dark editorial direction while making every section
reliable across wide, tall, narrow, and shallow browser proportions.

## Repair strategy

- Move the global reset into Tailwind's base layer so responsive spacing
  utilities are no longer overridden.
- Keep the standard full-screen hero for normal and portrait viewports, but use
  height-aware typography, portrait sizing, and spacing on shallow landscape
  screens.
- Restore biography wrapping at word boundaries while retaining the
  character-by-character opacity reveal.
- Disable sticky project stacking on shallow landscape screens where a card
  cannot fit within the available height; cards become a natural vertical list
  in that case.
- Validate both geometry and screenshots at phone, landscape phone, tablet,
  portrait laptop, standard desktop, and ultrawide dimensions.
