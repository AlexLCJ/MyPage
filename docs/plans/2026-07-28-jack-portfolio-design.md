# Jack 3D Creator Portfolio

## Direction

Build a single-page, dark editorial portfolio that puts oversized typography
and 3D imagery first. The page follows the supplied section order and uses a
high-contrast black, cool-silver, white, and magenta palette. Motion supports
the work through staggered entrances, magnetic hover, scroll-driven image
tracks, progressive text reveal, and sticky project stacking.

## Structure

- Hero: navigation, headline, magnetic portrait, positioning copy, contact CTA.
- Work reel: two scroll-linked, opposing rows of animated project previews.
- About: decorative 3D objects, scroll-revealed biography, contact CTA.
- Services: five reusable service records on a white visual break.
- Projects: three reusable project records rendered as sticky, scaling cards.

All placeholder content is stored in small data collections near the top of the
page component so the owner’s name, biography, services, project metadata,
images, and contact details can be replaced without restructuring the layout.

## Quality

The page is mobile-first, keyboard accessible, supports reduced-motion
preferences, lazy-loads noncritical imagery, and keeps scroll transforms on the
compositor where practical. Validation consists of a production build and a
check that required sections, metadata, image assets, and interactions compile
without errors.
