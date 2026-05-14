Original prompt: Dale

## Notes
- Focus: keep the album page turn visually closer to the reference video.
- Current known gap: right-turn still feels too projected to the left; left-turn is closer.

## TODO
- Tighten the next-page turn origin so it reads as starting from the spine.
- Re-check the result with Playwright screenshots.

## Updates
- Reduced the right-turn spine offset and softened the next-page keyframes so the page stays closer to the lomo.
- Validated with `npm.cmd --workspace @albumsl/web run typecheck` and `npm.cmd --workspace @albumsl/web run lint`.
- Added a dev-only `qaPreview=1` path so Playwright can inspect the album in an authenticated preview without Firebase.
- Captured a real album screenshot and confirmed the page is now visible in QA.
- Point 1 pass: retuned the next/right page turn so the sheet is anchored to the real spine width, removed horizontal drift in the keyframes, and extended the React fallback timeout beyond the CSS animation duration.
- Point 2 pass: shifted the spread toward warmer paper stock, flatter printed slots, less glossy badges, and more editorial labels instead of pill-like UI chips.
- Point 3 pass: added per-spread editorial themes with different titles, info-card copy, footer labels, and page color treatments.
- Point 4 pass: strengthened the in-flight page curl with a paper slab overlay, stronger edge highlights, retained drop-shadows inside animation keyframes, and slower mid-rotation so the sheet stays visible longer.
- Point 1 follow-up pass: increased page thickness cues with layered spine shadows, page-stack lines, a narrower curl slab, and stronger white paper edge during the turn.
- Occlusion pass: added target-spread shadow sweep, temporary still-page dimming, and front/back face lighting so the turn casts weight over the page underneath.
- Fine-tune pass: softened the occlusion and back-face lighting so the turn keeps the weight but stops feeling over-dark.
- Cleanup pass: removed the decorative backdrop arc from the album screen because it did not serve the album composition.
- Cleanup pass 2: removed the entire "Otras figuritas" section from AlbumPage because the user said it does not belong in the album screen.
- Cleanup pass 3: removed the public Dashboard and Catalog screens, their routes, and nav links; login now lands on /album.
- Layout pass: simplified the authenticated header to brand + cerrar sesion only, removed the bottom dock, and softened the album screen backdrop for a cleaner composition.
