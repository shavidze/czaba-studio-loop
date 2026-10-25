# code-reviewer (real subagent, round 156) — summary of findings, score 8.5/10

- Critical: none.
- **Medium — ST-TP1 checked the code against itself** (`joinParts(parts) === ws.X`, which can't fail after S1). **Addressed:** ST-TP1 now also asserts literal strings for both range samples and both selectedClipTitle samples. Re-run: 576/576, Biome/typecheck/lint clean.
- Low — TH11 counts source occurrences only, and the drop-ghost span and the VideoDock gap span have no DOM span/class check. Their text is covered by `marker-snap` l.374, `grid-snap-loop-drop` l.272 and `render-budget` l.450–454. **Not addressed:** the DOM tests for those sites would go in files A does not own or exceed T3's WSU3–5 scope. Passed to B; C's MONO-STYLE rows (c)/(f) check them in the browser.
- Low — WSU3 uses `startsWith`. **Not changed:** B's spec requires a prefix check, and `all-lane-clipboard` l.515 locks the full sentence.
- Low — mono glyphs are wider, so a short clip may clip its badge sooner (`whitespace-nowrap`). It is visual only → C's LAYOUT-FIT row.
- Info: JSX whitespace and dashes were checked by code point (correct). React keys are stable. The VideoDock imperative `textContent` update is unaffected. Types are OK. The a11y impact is negligible.
- Info (pre-existing, not this diff): the selected-clip `title` falls back to `sourceId` while the visible line shows only `selectedTitle`, so they differ when the clip has no title.
- Optional suggestions, not applied: `readonly` fields on `StudioTimeTextPart`; a named `ArrangementTimeTextProps`.

## Architecture note (verbatim)
Signal 3 (repeated costly change), `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx:408-481`: the theme test now keeps per-file class-string count tables, so every class tweak in the arrangement components means editing them. **Keep for now:** it's the established pattern in this file and it's cheap. If it keeps growing, the planner could schedule one bounded task to replace source counting with DOM assertions per site.
- Reviewer scope limit: the reviewer had no shell, so it read the current files rather than `git diff`, and it did not review doc 125.
- m145 re-run after the ST-TP1 fix: 6 red, ST-TP1 included (`mutations/m145-rerun.json`).
