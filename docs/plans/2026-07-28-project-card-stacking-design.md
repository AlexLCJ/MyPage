# Project Card Stacking

## Goal

Make the three project cards visibly overlap as the user scrolls, with later
cards covering earlier cards while preserving a small exposed edge for depth.

## Structure

All cards are direct sticky children of one shared stack container. This keeps
earlier cards constrained by the complete project sequence instead of by an
individual short wrapper. Each card uses a progressively larger sticky top
offset and z-index, so card 02 sits above card 01 and card 03 sits above both.

The shared scroll progress gently scales earlier cards toward the requested
target scale as the next card approaches. Extra bottom space lets the final card
reach its sticky position before the shared container releases the stack.
Shallow landscape screens continue to use a natural non-sticky list because the
full card cannot fit safely within those viewports.
