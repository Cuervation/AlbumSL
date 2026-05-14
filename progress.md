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
- QA pack preview: `/open-pack?qaPreview=1` now starts with an always-available daily pack and a mocked open result, so testing does not depend on backend availability.
- Modal-first pack flow: `OpenPackPage` now renders as a centered modal with backdrop, one primary "Abrir sobre" action, and results inside the same modal.
- Reveal pass: the modal opening now has a short reveal sequence before the results appear, so the pack reads more like an actual opening instead of an instant swap.
- Point 3 pass: the pack result is now held back briefly and then revealed from the real open-pack response, so the backend result lands inside the modal with a staged entrance.
- Point 4 pass: the modal now supports "Abrir otro sobre" from the same result state when another pack is available, reusing the same reveal flow without leaving the modal.
- Visual polish pass: reorganized the pack modal into a cleaner hero/status/stage layout, hid the initial open CTA after reveal, compacted the result grid to five balanced cards, and moved the next-pack CTA into the result summary.
- Point 2 pass: the five figuritas now enter with staggered timing and travel offsets so the reveal reads as cards coming out of the sobre instead of appearing all at once.
- Point 1 pass: gave the sobre a more physical opening with pre-tension, a stronger flap swing, a torn mouth/seam, burst glow/sparks, and a slightly longer staged opening before the figuritas reveal.
- Point 2 refinement pass: tightened sticker flight origins and arcs so the first three cards launch higher and settle with a stronger overshoot before landing in the grid.
- Point 3 pass: tightened the mobile pack experience with one-column hero flow, smaller stage, stacked summary actions, and a two-up compact sticker grid on small screens.
- Point 4 pass: final QA visual cleanup removed the topbar from the pack experience so the modal reads cleanly on mobile and the reference composition is not interrupted by shell chrome.
