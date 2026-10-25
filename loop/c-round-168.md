# C round 168 — V-3c-4b verification (Lane / Group header button surfaces)

**Verdict: PASS** — 0 bugs. browserVerified = realVerified = true. Every C row that can run in the cloud was run in real Playwright Chromium on `http://127.0.0.1:5173/studio-lab` at 1440×900 and 1280×720. One sub-check is BLOCKED (fake-Bearer 403: backend unavailable in cloud).

Tools, raw output and screenshots: `c-round-168/` (`tools/`, `out/`, `shots/`). d6.cjs copied unchanged, sha256 `3abc88fe…` checked.

## Rows

| Row | Result | Evidence |
|---|---|---|
| T168-TARGETED | PASS — 251/251 on A's 12 files (A: 251/251). LSU7, UM11 and TH10 are present and green. | `out/vitest-c168.json` |
| SOURCE-SCOPE | PASS — HEAD `1fef377`. Frozen 980 OK at start and end. A's `end-sha256.txt` 7/7 OK. `git status` = 6 ` M` grants + doc 137 `??`. Protected diff vs `1fef377` is empty. Full tree hash at end = C start snapshot, so nothing changed during C's phase. | `start-tree-sha256.txt` |
| AN-REVIEW | PASS — see below | `git diff 1fef377` |
| SURF-V3C4B | PASS, both viewports, S0–S4 | `out/surf/surf-{1440,1280}-1.json`, `out/an-surf-1.json` (0 findings) |
| BOX-V3C4B | PASS — max Δ **0.000 px** on every site in every state at both viewports, compared with B's `before.box` (S2 from `v3c4b-probe-S2.json`) | `out/an-surf-1.json` |
| CONTRAST-V3C4B | PASS — no enabled control is below 4.5:1 | table below |
| RV1-V3C4B | PASS — 0 missing and 0 added keys, max box Δ 0 in S0/S1/S2 at both viewports. The failing contrast set equals the reference set. The only contrast changes are the converted lane buttons and the import button. | `out/rv1-v3c4b.json`, `tools/cmp-d6-168.cjs` |
| FUNC-SMOKE-V3C4B | PASS, both viewports, with real mouse clicks at the centre and `elementFromPoint` hit = true everywhere | `out/func/func{,2}-{1440,1280}-1.json` |
| G168-3 | PASS: `/studio-lab` is anonymous (auth_user null, 0 cookies) and shows the demo badge. `/studio/middle-east` shows "Sign in required" with no workspace and 0 `audio[src]` at 1440 and 1280. `GET /api/studio-token` returns 401. Fake-Bearer 403: **BLOCKED** (backend unavailable in cloud). | `out/g168-3.json`, `shots/g168-3-*` |
| PX-NET / REG-HYD | PASS — every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror, 0 font errors. The only noise is the expected cart traffic. | `net` fields |

**Invalid run (replaced once, as allowed):** the first `d6.cjs 1440 1` was the cold-Vite first load. It showed a hydration warning and "Invalid hook call", the known ENV-FIRST-LOAD-LUCIDE case. The log is kept in `out/d6-1440.log`. The replacement run is valid (`out/d6-1440-r2attempt.log`, net ok). d6 writes a fixed filename, so `d6-1440-r1.json` is the replacement.

## AN-REVIEW (C read the diff itself)
- **ArrangementLane:** L1–L3 exactly as specified.
  - The base gains SURF + MOTION and `rounded-md`, and `h-6 w-6` stay adjacent.
  - The off string is `text-muted hover:text-foreground`.
  - The on strings are the old strings plus only the R2 appends.
- **L4 import buttons:** R6 exactly. `hover:bg-brand/10` is removed. `bg-foreground/5`, hover 8 % and press 12 % are added, plus MOTION. There is no `border-transparent` and no `font-medium`. The flex, size and padding tokens are unchanged.
- **L5:** radius only.
- **ArrangementGroupHeader:**
  - G1: SURF + MOTION come after `leading-none`, and the TH10 substring is still contiguous.
  - G2/G3: as specified. The mixed Solo string is byte-identical.
  - G4: radius only, and the input keeps `border-brand`.
- **Arbitrary values:** the only ones are the 4 MOTION tokens.
- **Unchanged:** no text, aria, title, `before:content`, handler, size, gap or padding change.
- **Tests:**
  - `studio-theme-obsidian.test.tsx` changes exactly one value (l.448).
  - The other two test files are add-only (0 removed lines).
  - `expect(` counts: lane-strings-ui 45→64, track-group-mix-ui 131→155, studio-theme-obsidian 76→76.
- **Docs:** doc 136 changes only l.4 and l.135 (the allowed TODO). Doc 137 exists with all template sections and status `In Progress (awaiting C round 168)`.

## SURF / CONTRAST (rest → hover → press; identical at 1440 and 1280)
| Site | State | Border | Radius | Rest bg (eff) | Text contrast rest / hover / press | Transition |
|---|---|---|---|---|---|---|
| Lane Mute/Solo off (music, sfx) | S0–S4 | 1px transparent | 8px | rgb(33,31,28) (B before 22,20,18) | 5.98 / 12.35 / 10.93 | background-color, color · 0.18s · cubic-bezier(0.2, 0.8, 0.2, 1) |
| Lane Mute on / Solo on (music) | S1 | 1px rgb(201,164,106) | 8px | rgb(201,164,106) | 8.32 / 8.32 / 8.32 (on-fill kept) | same |
| Video import full (S0, 107×22) / compact (S1, 20×20) | S0/S1 | 1px rgb(201,164,106) brand | 8px | rgb(33,31,28) | 7.05 / 6.58 / 5.82 | same |
| Group Mute/Solo off | S1–S4 | 1px transparent | 8px | rgb(40,37,33) (B 29,26,23) | 5.57 / 11.46 / 10.11 | same |
| Group Mute on (S1), Group Solo on (S3) | | 1px rgb(201,164,106) | 8px | rgb(201,164,106) | 8.32 / 8.32 / 8.32 (on-fill kept) | same |
| Group Solo mixed | S2 | 1px brand | 8px | own transparent; eff rgb(29,26,23); bg-image = B's before (`linear-gradient(to right in oklab, rgb(201,164,106) 50%, transparent 50%)`) | 13.94 / 11.46 / 10.11 | same |
| Lane fold / name / pan reset | all | 0 | 8px | equal to B before (22,20,18) | 6.68 / 14.78 / 6.68, equal to B | unchanged global |
| Group fold / name | S1–S3 | 0 | 8px | equal to B before (29,26,23 / 63,54,39 selected) | 6.30 / 9.57, equal to B | unchanged global |
| Group rename input | S4 | 1px rgb(201,164,106) | 8px | rgb(14,13,12) | 15.62, equal to B | unchanged |

- **Mixed Solo pixel samples** (screenshot, button at 0.88 / 0.2): rest right rgb(29,26,23), equal to `1fef377`; rest left rgb(201,164,106); on hover the right side is **rgb(45,41,38)**, the 8 % fill. Both viewports.
- **Reduced motion** (`reducedMotion: 'reduce'`, matchMedia true): `transition-property: none` on lane Mute and Solo, sfx Mute, group Mute and group Solo, at both viewports. The import button is also `none` in that context. At 1280 the group row makes that the compact button, so an extra context without a group checked the **full** button ("Your own video", 107 px): `none` at both viewports (`out/extra-{1440,1280}.json`).
- **Fill vs its own surface** (informational, not pass/fail): 1.12 (lane) and 1.13 (group), as B predicted.
- **4× crops:** `shots/surf/crop4x-{1440,1280}-1-*` (lane header S0/S1, import S0/S1, group header S1/S2/S3).
- **Releasing the press off the button** did not change any state (aria-pressed after release equals rest).

## FUNC-SMOKE (real output tap on AudioDestination; identical outcome at both viewports)
- **Lane Mute (demo on Music, playing):**
  - Mute: silent (peak < 0.001) after 86.9 ms at 1440 and 101.2 ms at 1280; `aria-pressed` false→true.
  - Unmute: peak 0.342 / 0.357; `aria-pressed` false.
- **Lane Solo:**
  - Solo on the empty SFX lane: silent after 79.6 / 97.6 ms.
  - Ctrl+click Solo on Music: peak 0.277 and both soloed.
  - Cleared: all false.
- **Group (demo on Stems, Music muted, group = Stems + SFX):**
  - Group Mute: silent after 83.7 / 92 ms, `data-mute=on`. Unmute: peak 0.322.
  - Solo on the Stems lane: group Solo `aria-pressed="mixed"`.
  - Click group Solo: `on` (peak 0.410). Click again: `off`.
- **Video import:**
  - Full button (S0, 107×22): file chooser opened; `clip-4s-vp9-opus.webm` → clip on the video lane, 0–4.008 s; the dock's active video has readyState 4 at 640×360.
  - Full-size first run also imported `beeps-6s-h264-aac.mp4` at 1440. At 1280 the video lane was already "tight" (compact button) because of the group row; this is pre-existing density behaviour, so `func2` repeated the full button in S0.
  - Compact button (20×20): the file chooser opens at both viewports.
  - Rendered frame (`tools/c168-extra.cjs`): after a full-button import and a seek to 1 s, a screenshot of the active dock video (160×90) has 86.6 % non-dark samples and 98 distinct colour buckets at both viewports, so a real frame is painted, not just a decodable video (`shots/func/extra-*-dock.png`).
- **Fold:** lane and group fold toggle `aria-expanded` true→false→true.
- **Name:**
  - Clicking Music makes it active (`aria-pressed=true`, "selected").
  - Ctrl+click SFX: both labels end in ", selected" and both have the `bg-brand/20` fill. The active track moves to SFX, because `aria-pressed` is the active-track flag.
- **Pan reset:** 5×ArrowRight gives `5R`. Clicking the readout gives `C`, the button becomes disabled, and focus returns to the slider.
- **Rename:** F2 → "Drums168" → Enter, and the group shows the new name. Ctrl+Z restores "Group 1" (status "Undo: Rename Group").

## Ableton parity
Not applicable. This is a CZABA brand decision (`visual-direction-a.md` § „ღილაკები და ზედაპირები“); no Live source is claimed. Mute, Solo, fold, rename and import behaviour are unchanged, as measured above.

## Notes for B (not bugs)
- **Q-R167-ON-HOVER confirmed in the browser:** Mute and Solo give no hover or press change when they are on (8.32 rest = hover = press). This is still Saba's question.
- **Borderless header buttons** (fold, name, pan reset, group fold and name) keep the unchanged global `transition` (150 ms, `ease-out`) under reduced motion. This existed before this round; it was not in scope and these classes were not changed apart from the radius. It is a candidate note for V-3c-5 or the motion audit.
- With a group row present, the 1280 video lane uses the compact import button ("tight" density). This existed before this round.
- **Gate rows** (not C's): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.
