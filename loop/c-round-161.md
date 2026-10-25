# C round 161: V-3c-1 library icons. Verdict **PASS** (browserVerified = realVerified = true)

Verifier: C · Date: 2026-10-25 · Task: `current-task.md` (D-29z126) · Evidence: `c-round-161/` · JSON: `c-round-161.json`

Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session (B's probe preparation for each box state), at 1440×900 and 1280×720. **Fonts:** <ul><li>The 12 c161 sessions: fonts ready (all three families loaded), 9/9 Google Fonts responses 200, 0 failures.</li><li>The 2 d6 sessions went through `openStudio`'s `fontsWait`, but the unchanged `d6.cjs` does not save the response statuses. Their 0 px deltas against the round-160 reference are consistent with identical font rendering.</li><li>`g161-3` is not a measurement and does not wait for fonts.</li></ul> C did not edit app source; source hashes were identical at C start and C end (`out/c-start-sha256.txt` = `out/c-end-sha256.txt`).

## Rows
| Row | Result | Evidence |
|---|---|---|
| T161-TARGETED | PASS: the 18 files gave 334/334, the same as A. LI1, LI2, LI3 and LG1 are present and green. | `out/vitest.json` |
| SOURCE-SCOPE | PASS: <ul><li>HEAD is `aeba543`.</li><li>The frozen 968 files are OK at start and at end.</li><li>The 12 paths equal `a-round-161/end-sha256.txt` at start and end.</li><li>`git status` shows the 11 grants as ` M` plus doc 130 as `??`.</li><li>`git diff --name-only aeba543` lists only the 11 grants, so the protected list is empty.</li><li>`c-round-160/out/d6/*` mtimes are unchanged (09:35:59).</li></ul> | `out/c-end-sha256.txt` |
| AN-REVIEW | PASS: <ul><li>The components change only L0–L5 and P0–P2. The class tokens are only prefixed or inserted; there are no surface, colour or border changes.</li><li>`strings.ts` changes exactly the 6 R4 values. `previewWaveLabel` is wrapped by Biome, but its value is byte-equal.</li><li>`expect(` counts: strings 520→523, row-strings-ui 72→95, preview 35→35, held-enter 46→46, collection 49→49, load-status 50→50, purchased 31→31. Nothing dropped.</li><li>Removed lines are only glyph texts. The extra l.399 change in `collection.test` (`toContain('＋')` → `toContain('(Enter or Add)')`) is a 1:1 replacement and is not weaker.</li><li>Doc 129 changes only l.4.</li><li>Doc 130 has the date, status and project lines and all TEMPLATE sections. Its TODO lists the 3 frozen titles plus HA6.</li><li>There is no `style=`, hex value or arbitrary `[…]`.</li></ul> | `git diff aeba543` |
| ICON-V3C1 | PASS at both viewports, in all 5 states (table below). 0 failing icon checks (`out/ana-*.json`). | `out/c161-{1440,1280}.json` |
| RV1-V3C1 | PASS: S0/S1/S2 have 111/122/131 elements at 1440 and 103/121/130 at 1280, the same as the round-160 reference. After the single rename `button:＋ Add#1 → button:Add#1` (applied in each state), no key is missing or added and there are no collisions. **Max delta 0 px** in every state, including the 14 library and preview keys. | `out/rv1-v3c1.json`, `out/d6/` |
| LIB-STATES-BOX | PASS: compared against B's `lib-states-before.json` at 0.01 px. S0 47/47, search 33/33, playing 48/48, rail 2/2 elements, with 0 missing, 0 added, and **max delta 0.000** at both viewports. <ul><li>(a) Expand is 32×32 and the rail is 40 px wide.</li><li>(b) Clear is 24×24 and the input is 264×30.</li><li>(c) The toggle and Add are each 128×34, and the marker is 110×16.</li><li>(d) The fold button stays 16 px wide (h 57.5 / 41). Folding hides `Music2, SFX2` and unfolding restores all 4 folders. After re-unfolding, every box equals the pre-fold box (max 0).</li></ul> | `out/ana-*.json` |
| FUNC-SMOKE-LIB | PASS at both viewports (list below) | `func` in `out/c161-*.json` |
| READY-STATUS | PASS: the status reads exactly `Demo collection ready. Choose a track and add a sound (Enter or Add).` at both viewports. | same |
| G161-3 | PASS for the 3 runnable sub-rows; fake-Bearer BLOCKED. <ul><li>`/studio-lab` is anonymous: workspace and demo badge shown, `auth_user` null, 0 cookies.</li><li>`/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`, at 1440 and 1280.</li><li>`GET /api/studio-token` returns 401 `Please sign in to access Studio.`</li><li>The fake-Bearer 403 is **BLOCKED** (backend unavailable in cloud).</li></ul> | `out/g161-3.json`, `shots/g161-3-*` |
| PX-NET / REG-HYD | PASS: every valid session (6 per viewport, 2 d6, 1 gate) had 0 forbidden requests, 0 Authorization headers, 0 hydration messages and 0 pageerror. Only the expected cart noise appeared. | `net` in each JSON |

**Invalid runs:** C made a warm-up load (not a measurement) before any row. It hit **ENV-FIRST-LOAD-LUCIDE**: "Invalid hook call" plus a `useState` pageerror on the first cold Vite load after the new lucide imports. It was replaced once, and every later session was clean (`out/invalid-runs.txt`).

## ICON-V3C1 (1440 and 1280 identical)
| Site | lucide class | Box | stroke-width | stroke = color (rest → hover) | Centre Δ | Text | CDP name |
|---|---|---|---|---|---|---|---|
| Collapse | `lucide-chevron-left` | 12×12 | 2 | muted rgb(163,155,142) → foreground rgb(236,230,218) | 0/0 | `` | Collapse library |
| Expand (rail) | `lucide-chevron-right` | 12×12 | 2 | muted → foreground | 0/0 | `` | Expand library |
| Search clear | `lucide-x` | 12×12 | 2 | muted → foreground | 0/0 | `` | Clear search |
| Collection fold | `lucide-chevron-down` / `lucide-chevron-right` when folded | 10×10 | 2.4 | muted → foreground | 0/0 | `` | `<collection> — Fold` / `— Unfold` |
| Preview toggle | `lucide-play` idle / `lucide-square` playing | 12×12 | 2 | brand rgb(201,164,106); while playing the class is `text-accent` (the accent token computes to the same rgb) | icon first, then label | Preview / Stop | Preview / Stop |
| Add | `lucide-plus` | 12×12 | 2 | brand (hover changes only the bg) | icon first | Add | Add |
| Row marker | `lucide-play` | 10×10 | 2.4 | brand | icon first | Playing | — |

- Each site has exactly 1 svg, with `aria-hidden="true"`.
- All hover reads were confirmed with `elementFromPoint` (22/22 hits per viewport). No cookie banner was present.
- There is no `▶◀×▾▸■＋` in the library text or in its `aria-label`/`title` attributes in any state.
- The wave slider's name ends with `Space = play/stop` (DOM and CDP).

## FUNC-SMOKE-LIB (identical at 1440 and 1280)
- **Collapse/Expand:** the rail is 40 px and focus goes to Expand. Expand restores the 288 px panel and focus goes to Collapse.
- **Search clear:** typing `so` leaves 1 option. Clear empties the query and the × disappears. 9 options return, and focus is on the search input.
- **Fold:** the 4 folders become 2 and come back after unfolding.
- **Preview:** the real output tap peak was **0.1266** (140 samples; the tap signal fired). The slider moved 0 → 2 s, and the toggle showed `Stop` with the square icon. The demo-hero-music row showed `Playing` with the play icon. Stop showed `Preview` again, and the marker disappeared.
- **Add:** with Music active, clicking Add made 0 clips into 1 (`music@0`). The Undo title became `Undo: Add — CZABA hero — საჯარო preview`. One Ctrl+Z went back to 0 clips (Undo disabled again), and Redo gave 1 again, so it is a single history entry.
- **Range Delete:** a clip-body drag made the range 1–2 s, and Delete then set the status to exactly `Deleted 00:01.000 — 00:02.000 on the Music track; the gap remains.` (no ⌫). The clips became `music@0+1 music@2+148.372`, so the gap remains.

## Screenshots (`c-round-161/shots/`)
- **Library states:** `lib-{S0-expanded,search-typed,preview-playing,collapsed-rail,folded}-c161-{1440,1280}.png`.
- **d6:** `D6-S{0,1,2}-{1440,1280}.png`.
- **Other:** `func-end-*` and `g161-3-*`.

## Ableton
Not applicable. This is a CZABA brand decision (`visual-direction-a.md` § „იკონები“), with behaviour, focus and shortcuts unchanged. The R2 icon choices are CZABA's, not Ableton claims.

## Notes for B (no findings)
- **brand = accent:** both compute to rgb(201,164,106) in the Studio scope, so Stop and Preview are visually the same colour except for the accent border/hover classes. This is pre-existing and unchanged this round. It matters only if V-3c-4 or the polish pass wants Stop to stand out.
- **R5 signal confirmed:** the accessible names are `Preview`/`Stop` (inside the region `Preview`) and `Add`. This is for the polish pass, not a finding.
- **Repeated icon recipe:** the reviewer's architecture note (R2'' recipe repeated at 10 sites) is passed on as A reported it. It is not acted on.
- **Not run (per task §4):** ICON-V3B, SURFACE-STYLE, CASCADE-SCOPE, CONTRAST-V3A and the V-2 rows. The gate rows belong to root.
