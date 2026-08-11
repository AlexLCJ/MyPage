# InfiniteMenu Work Section

The new Work section sits directly after About and keeps the existing navigation contract by using `id="projects"`. Its visible area matches the homepage at one full viewport height, with the same 620px minimum height, and contains the supplied WebGL2 `InfiniteMenu` at `scale={1.5}`. Publication, Research, and Projects use local portfolio artwork and real destinations; the remaining fourth item stays available for later replacement.

The menu remains the only visible interface in this section: drag rotates the spherical grid, release snaps to the nearest item, and the active item reveals its title, description, and outbound arrow. The implementation is isolated under `components/InfiniteMenu` so the hero, ImageTrail, About section, contact behavior, and navigation styling remain unchanged.
