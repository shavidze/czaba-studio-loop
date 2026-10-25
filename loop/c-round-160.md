# C round 160: V-3b transport icons. Verdict **PASS** (browserVerified = realVerified = true)

Verifier: C · Date: 2026-10-25 · Task: `current-task.md` (D-29z125) · Evidence: `c-round-160/` · JSON: `c-round-160.json`

Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session, at 1440×900 and 1280×720. Every valid session waited for `document.fonts.ready`, and all Google Fonts responses were 200. C did not edit app source.

## Rows
| Row | Result | Evidence |
|---|---|---|
| T160-TARGETED | PASS: the 25 files gave 386/386, the same as A. TS1–TS6 are present and green. | `out/vitest.json` |
| SOURCE-SCOPE | PASS: <ul><li>HEAD is `ad0df77`.</li><li>The frozen 969 files are OK at start and end.</li><li>The end hashes for the 10 paths equal `a-round-160/end-sha256.txt` at start and end.</li><li>Status is 9 ` M` + 1 `??`.</li><li>The protected diff is empty, and no changed path matches auth, Modal, Toast, cookie, obsidian, download-routes or doc 127.</li><li>No source changed during C's phase.</li></ul> | `out/c-end-sha256.txt` |
| AN-REVIEW | PASS: <ul><li>The component diff is I0–I6 only.</li><li>`strings.ts` changes exactly 3 values; l.157 `⌫ Deleted …` is unchanged.</li><li>`expect(` counts: strings 520→520, transport-surface 42→56, self-disabling 47→47, navigation 65→65, grid-snap 149→149, delete-selection 84→85, so nothing dropped.</li><li>The removed test lines are only glyph prefixes and the old TS6.</li><li>Doc 128 has the 3 D4 edits (the status line is l.4, as A reported). Doc 129 has every TEMPLATE section.</li><li>There is no `style=`, hex value or arbitrary `[…]`.</li></ul> | `git diff ad0df77` |
| ICON-V3B | PASS at both viewports (table below) | `out/c160-{1440,1280}.json` |
| RV1-V3B | PASS: in S0, S1 and S2 at both viewports, no key is missing or added after the renames, there are no collisions, and no delta is over 1 px. The largest delta is 1.0 (Delete w). | `out/rv1-v3b.json` |
| SURFACE-SPOT | PASS: <ul><li>Split and Loop at rest are `oklab(0.926355 0.00167474 0.0172472 / 0.05)`; hover is `/ 0.08`; pressed is `/ 0.12`. These equal round 159.</li><li>When disabled at idle, hover keeps 0.05.</li><li>Motion: `background-color, color` / `0.18s` / `cubic-bezier(0.2, 0.8, 0.2, 1)`.</li><li>Under reduced motion, `transition-property` is `none`.</li><li>The Loop-on fill `oklab(0.739187 0.0181313 0.0853184 / 0.2)` survives hover and press.</li></ul> | same |
| FUNC-SMOKE-7 | PASS at both viewports (list below) | same |
| BRACE-HINT | PASS: the strip reads exactly `Loop: make a time selection and press Loop (Ctrl+L)` at both viewports. | same |
| G160-3 | PASS for anon/protected/401; fake-Bearer BLOCKED. In JSON this is split into 3 passed sub-rows + 1 blocked: <ul><li>`/studio-lab` is anonymous, with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required" with no workspace and 0 `audio[src]`, at 1440 and 1280.</li><li>`GET /api/studio-token` returns 401.</li><li>The fake-Bearer 403 is **BLOCKED** (backend unavailable in cloud).</li></ul> | `out/g160-3.json`, `shots/g160-3-*` |
| PX-NET / REG-HYD | PASS: every valid session had 0 forbidden requests, 0 Authorization headers, 0 hydration messages and 0 pageerror. Only the expected cart noise appeared. | `netOk` in each JSON |

**Invalid runs:** the first d6 pair (both viewports at once, the first load after the lucide imports) hit **ENV-FIRST-LOAD**: a hydration error plus "Invalid hook call" on a cold Vite. Each was replaced once, and all later sessions were clean. Files: `out/d6-*-r0-INVALID-envfirstload.*`.

## ICON-V3B (both viewports gave identical results)
| Button | lucide class | Box (px) | stroke-width | stroke = color (idle / range) | Text | CDP name (idle / range) |
|---|---|---|---|---|---|---|
| Back to start | `lucide-arrow-left-to-line` | 12×12 | 2 | rgb(236,230,218) both | `` | Back to start |
| Undo | `lucide-undo-2` (+ alias `lucide-undo2`) | 12×12 | 2 | yes | Undo / `Undo: Delete clip` | Undo / `Undo: Delete clip`; after a gain edit `Undo: Clip Gain` |
| Redo | `lucide-redo-2` | 12×12 | 2 | yes | Redo | Redo / `Redo: Clip Gain` after Undo |
| Split | `lucide-scissors` | 12×12 | 2 | yes | Split | Split |
| Delete | `lucide-delete` | 20×20 | 1.2 | idle foreground; with a range **accent rgb(201,164,106)** = color | Delete | `Delete — the selected clip; leaves a gap` / the range hint `Delete time selection — leaves a gap (Delete / Backspace). Cut Time closes the gap: Ctrl+Shift+X` |
| Loop | `lucide-repeat` | 12×12 | 2 | yes (accent when Loop is on) | Loop | Loop |
| Zoom back | `lucide-undo-2` | 10×10 | 2.4 | yes | Zoom | Zoom |

- Each button has exactly 1 svg, with `aria-hidden="true"`, and the icon comes before its label.
- There are no `↤↶↷✂⌫↻↩` characters anywhere in the transport.
- Play and Zoom to selection each still have one 16×16 svg with stroke-width 1.5.
- Follow and Fit have no svg.

## RV1-V3B: transport row S0 deltas (dx/dy/dw/dh, d6 0.5 px rounding)
| Key | 1440 | 1280 |
|---|---|---|
| Play | 0/0/0/0 | 0/0/0/0 |
| Back to start | 0/0/+0.5/0 | 0/0/+0.5/0 |
| Undo | +0.5/0/0/0 | +0.5/0/0/0 |
| Redo | +0.5/0/0/0 | +0.5/0/0/0 |
| Split | +0.5/0/+0.5/0 | +0.5/0/+0.5/0 |
| Delete | +0.5/0/**−1.0**/0 | +0.5/0/**−1.0**/0 |
| Loop | −0.5/0/+0.5/0 | −0.5/0/+0.5/0 |
| Follow / zoom slider / Zoom to selection / Zoom back / Fit / Export | 0/0/0/0 | 0/0/0/0 (second row at y=81 at 1280, as in the reference) |

- **Element counts:** S0/S1/S2 have 111/122/131 elements at 1440 and 103/121/130 at 1280, the same as the reference.
- **Renames:** 5 renames applied per state. Undo appears as either `↶Undo` (S0) or `↶Undo: Group Tracks` (S1/S2), never both.
- **Delete w −1.0 is a rounding effect; the raw delta is −0.8.** C compared raw boxes: round 159 `c159-*.json` S0 at 0.1 px against round 160 `c160-*.json` S0 at 0.01 px, idle with fonts ready. This matches B's probe.

| Button (raw, both viewports identical) | dx | dw |
|---|---|---|
| Back to start | 0 | +0.3 |
| Undo / Redo | +0.3 | 0 |
| Split | +0.3 | +0.3 |
| Delete | +0.5 | **−0.8** |
| Loop | −0.3 | +0.3 |
| Follow / Zoom to selection / Zoom back | +0.03 / +0.1 / +0.1 | 0 / 0 / −0.1 |
| Play / Fit / Export | 0 | 0 |

The real maximum is **0.8 px**, within ±1 px. Heights and y are unchanged.

## FUNC-SMOKE-7 (identical at 1440 and 1280)
- **Play:** the real output tap peak was **0.1266** (110 samples), and the playhead moved 0 → 1.781 s. Space then stopped playback, and the position stayed constant.
- **Back to start:** the position went from `00:01.802` to `00:00.000`, and the playhead `aria-valuenow` became 0.
- **Undo/Redo:** Clip Gain went 0.0 → 6.0. Undo then showed `Undo: Clip Gain` and went back to 0.0, with Redo showing `Redo: Clip Gain`. Redo went back to 6.0.
- **Split:** on the selected music clip at 1.5 s, 3 clips became 4 (`music@0+1.5 music@1.5+148.872`), and the status read `Clip split at 00:01.500.`
- **Delete:** on the selected SFX clip, 4 clips became 3. The other clip starts were unchanged, so a gap is left. Focus moved to `Undo: Delete clip`, and the status read `Clip deleted; the gap remains.`
- **Range Delete** (extra neighbour check, 1440, `out/rdel-1440.json`): the status reads `⌫ Deleted 00:03.000 — 00:05.000 on the Music track; the gap remains.` (aria-live polite, unchanged string, kept for V-3c). Focus moved to `Undo: Delete time selection`.
- **Loop:** with the range 3–5 it turned on (`aria-pressed=true`), one brace appeared, and the times read `Loop 00:03.000 — 00:05.000`.
- **Zoom back:** zoom went 40 → 275.4 (1440) or 227.4 (1280) px/s via Zoom to selection, then back to 40 px/s.

## Screenshots (`c-round-160/shots/`)
- **Transport, both viewports:** `transport-rest-*` (at rest), `transport-range-*` (with a range), `transport-loop-on-*` (Loop on), `transport-hover-split-*` (hovering Split).
- **d6 states:** `D6-S{0,1,2}-*`.
- **Auth gate:** `g160-3-*`.
- **What they show:** the icons sit before their labels, and Delete is accent-outlined with a range. At 1280 the right group wraps to a second row as before; d6 deltas there are 0.

## Ableton
Not applicable. This is a CZABA brand decision (`visual-direction-a.md`), with behaviour, shortcuts and labels unchanged. `ArrowLeftToLine` is CZABA's choice (R8), not an Ableton claim.

## Notes for B (no findings)
- **TS6 read by C:** lines 377–453 assert the 7 lucide classes, the size tokens, stroke-width, `gap-0.75`/`gap-0.5` without `gap-1`, `gap-1` + `w-28` on Undo/Redo, and the 7-glyph loop, as B specified.
- **A11Y-R160-ZOOMBACK-NAME:** confirmed in the browser. Zoom back's name is `Zoom`, next to the slider `Zoom (px/s)`. Signal only (R11).
- **A reviewer Low:** the `describe` title at `transport-surface-ui.test.tsx:207` still says V-3a. It is test text only, so it can be cleaned up in V-3c or the polish pass.
- **m160:** A and its reviewer say this is an equivalent mutant (lucide renders `aria-hidden="true"` by default); C did not re-run the mutations. Use m160b in future lists.
- **Not run (per task):** the full SURFACE-STYLE table, CASCADE-SCOPE, CONTRAST-V3A and the V-2 rows. The gate rows belong to root.
