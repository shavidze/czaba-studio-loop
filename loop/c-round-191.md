# C — Round 191 verification (SABA-B-3: quiet fader look, one focus ring)

**Verdict: PASS; one Low (C-R191-01); LOOK-191 partial. `browserVerified=true`, `realVerified=true`.** The SABA-B-3 bug is gone: there is no filled brass box, double ring, growing thumb, brass thumb or colour-changing track in any state, on any of the six controls, at either viewport. Behaviour, audio, layout and the rest of the Studio match HEAD `338564e` exactly. **One LOOK-191 sub-criterion is not met:** "thumb vs the adjacent track ≥ 3:1". The ivory thumb on the brass fill measures **1.82:1**, so LOOK-191 stays out of `passed`. That is not one of the SABA-B-3 FAIL conditions written in advance (§4 Outcomes). Under the task's own rule "New Lows go to `deferred_low_polish`", it is routed as a Low design call for B and Saba, not as an A fix-up. All other rows pass. One info note covers the native Pan/Zoom pressed shade.

All measurements: real Playwright Chromium on the shared `:5173`, plus a **HEAD reference server** on `:5174`. That server ran a `git archive HEAD` copy in `c-round-191/head/` with its own vite `cacheDir`, and was stopped at the end. Pixel reads used DPR 2 and `--disable-lcd-text`. Tools and evidence are in `c-round-191/`. A's tools and numbers were not reused for any verdict; C wrote its own probe (`tools/press.cjs`, `tools/evalpress.cjs`).

## SCOPE-191 — PASS
- Start and end: HEAD `338564e`. The frozen list (1013) is OK from the store root at both ends. A's `end-sha256.txt` is OK (9/9) at both ends.
- `git status`: exactly the 6 granted ` M` files + 3 `??`. `app/styles/`: 0 changes.

## PRESS-191 (SABA-B-3 core) — PASS (with info I1)
`tools/press.cjs` has two modes:
- **session:** setup is a library drop, a group created with Ctrl+G, the detail panel opened and a clip selected. Then 6 controls × rest / pointer-down held 200 ms / mid-drag / released / keyboard (Shift+Tab, Tab, ArrowLeft), plus a lower keyboard value.
- **fresh:** one fresh context per control, then pointer-down and release.

Each run covers 1440×900 and 1280×720. Analysis is geometric: the distance from each pixel to the control's pill shape (for Pan, the 48×16 virtual box). The parent colour is the 8-px-outside sample (left / right / top / bottom) that matches the rest-state gap.

Results, tree:
- **No filled box.** On all 4 sessions plus 2 fresh runs: brass inside the box outside the 4 px track = 0, and brass beyond the ring = 0 in every state. HEAD, by contrast, shows 1108 / 978 brass px inside Pan's box and a second band (`outer` 16 / 368) on Pan and Zoom (`press/head-*`).
- **Ring if and only if `:focus-visible`.** There is a ring in every state with `fv=true` and none with `fv=false`, with 0 mismatches.
  - On a fresh page, a mouse press shows the ring (`fv=true`) on track Volume, Pan and Master.
  - Group Volume and Clip Gain show `fv=false` after the setup clicks, and so does Zoom (native, no hook). That is R69-conform.
  - All six show the ring under keyboard focus.
- **One ring, ≤ 2 css px.** Every band is 4 device px. The ring covers 100 % of the straight top/bottom columns.
- **Gap.** The minimum parent-colour run between the box and the ring is 4 device px. It is 3 device px on half-pixel-positioned boxes (group header at y = 442.5), where the ring edge is anti-aliased. Either way the gap is ≥ 1 css px, including at the thumb's x column (trace, for example `…xBBBx...IIII…`).
- **The ring does not cross the thumb.** Thumb pixels outside the pill = 0 in every state.
- **Level thumbs pressed vs rest.** The size is the same (30 device px diameter in every state) and the mean colour is within 0.1.
- **Pan, with reset disabled (Pan = C) and enabled (Pan = 1L):** the reset button's `::before` outline is brass 2px @ 2px in both cases, and the Pan input's own outline is `none`.
- **I1 (info):** Pan's thumb shade changes while it is pressed: (215,204,180) vs rest (210,205,196), a blue difference of 16 > 8. Zoom's pressed and hover shades are also native. HEAD gives the same values within 0.4 per channel (`out/press-eval.json` → `panzoom`). This is Chromium's native range styling, kept by R70. It is not the box bug and not a change from HEAD, but PRESS's "thumb colour within 8" clause and R70 conflict for Pan/Zoom. B rules.

Evidence: `press/{tree,head}-{1440,1280}-session/`, `press/tree-{1440,1280}-fresh/`, `out/press-eval.json`, montages `press/m-1440-*.png`, logs `logs/press-*.log`.

## LOOK-191 (R68) — FAIL on one sub-criterion (C-R191-01, Low)
Both viewports, identical results:

| Check | Measured | Result |
|---|---|---|
| Unfilled track colour | `outline-hover` (46,42,38) | — |
| Track vs parent | Δ 24 on `surface` (1.29:1); Δ 17 on the group header's `elevated` (1.22:1) | ≥ 10 → pass |
| Fill | brass (201,164,106); starts at the box's left edge (Δ 0); ends at the thumb centre −0.5…0 css px | pass |
| Fill vs unfilled | 6.1:1 | pass |
| Thumb | ivory, 30 device px = 15 css px; HEAD native also 30 device px | pass |
| Thumb vs unfilled track | 11.1:1 | pass |
| Thumb vs parent | 13.5–14.4:1 | pass |
| **Thumb vs brass fill (the adjacent track on the left)** | **1.82:1** | **< 3:1, fail** |
| Ring vs parent | 7.88:1 (`surface`), 7.42:1 (`elevated`) | pass |
| Disabled Clip Gain (detail open, no clip) | `disabled`, opacity 0.5, title "Select a clip first"; dimmed brass (112,92,62) fill up to the dimmed thumb at fraction 0.7143 (`out/clipgain-disabled.json`, `shots/clipgain-disabled-*.png`) | pass |

Both values were checked: the default (track and group 0 dB, Master 0 dB, Clip Gain 0) and lower values (keyboard −0.9 / −4.5, drag −12 / −13 / −16.8).

## PANZOOM-191 (R70) — PASS
- At rest, Pan and Zoom have 0 changed px. They are unmasked in STUDIO-RV at both viewports, and their thumb and track pixels equal HEAD.
- When pressed or focused, the only addition is the single ring (when `fv`). HEAD had the double band.

## BEHAVIOUR-191 — PASS
`tools/beh.cjs` ran the same script on the tree (`:5173`) and on HEAD (`:5174`) at 1440 and 1280. The JSON results are **byte-identical** (`out/beh-517{3,4}-{1440,1280}.json`). At 1440:
- **Track Volume:** a −40 px drag gives −23.3; Shift+drag gives −2.3; one Ctrl+Z goes back to 0, redo gives −23.3. Undo was checked as undo → redo → undo; it was not checked against a different earlier action, and the undo label is "Undo: Volume".
- **Group Volume:** −50 / Shift −5.
- **Master:** −27.5 / Shift −2.5.
- **Clip Gain:** −35 / Shift −3.5.
- **Pan:** −50, and Shift also −50. Pan has no `fineDivisor` by design; HEAD behaves the same.
- **Zoom** is native, the same as HEAD.
- **Double-click** resets every control to its default; arrows step ±0.1 / ±0.5 / ±1.
- **Mute/Solo** on Music toggle false → true → false.

## AUDIO-191 — PASS
`tools/audio.cjs`: Playwright Chromium with an AnalyserNode tap on every AudioDestinationNode connection (`tapInit` from lib122). The demo is dropped on Music and played; each window is 2.5 s. The tree and HEAD read the same windows at the same timeline positions (`out/audio-517{3,4}.json`):

| Step | Tree | HEAD |
|---|---|---|
| Master 0 dB | −8.53 / −7.23 dBFS | the same |
| Master dragged to −20.5 dB | **−26.59** dBFS | −26.55 |
| Master dragged back to 0 | −4.48 dBFS | −4.52 |
| Music Volume dragged to −∞ | **peak 0** (only Music plays) | 0 |
| Double-click reset | −1.56 dBFS | −1.56 |

Same direction and magnitude as HEAD.

## LAYOUT-191 — PASS
84 rect comparisons per run, tree vs HEAD at the same app state (`out/press-eval.json` → `layout`), all within ± 1 px:
- input x and width;
- the M/S buttons, the volume, Master and zoom readouts, the Pan reset button;
- lane, header, group, Master-bar and detail rects;
- the vertical centre of every fader.

Only the three `h-1` level inputs changed height (4 → 16), which K1 allows.

## STUDIO-RV-191 — PASS
`tools/rv.cjs` compared rest screenshots against `c-round-190/shots/c190-{W}-1/rest-full.png`. The mask is each level fader's input box ∪ 15 px thumb + 4 px: 4 lane volumes and Master; Clip Gain's panel is closed at rest.
- 1440: **0 changed px outside the mask** (11146 inside).
- 1280: **0 changed px outside the mask** (7841 inside).

Session checks: 0 console errors, 0 hydration messages, 0 forbidden requests, 0 auth headers, anonymous (`auth_user` null, 0 cookies, demo badge present). New baseline: `c-round-191/shots/c191-{1440,1280}-1/rest-full.png`.

## STORE-AFTER-191 — PASS
- C started the mock (`node mock-api/server.mjs`, log `c-round-191/mock.log`) and stopped it at the end; `:5199` is closed.
- `/`, `/store` and `/products/middle-east` at 1440, 1280 and 375, compared with `c-round-190/shots/store-after/`: **0 changed px outside the masked hero on all 9 non-scrolled shots** (`out/diff191.json`).
- The scrolled home shots differ in the same scroll-triggered sections as round 190's own diff. This is pre-existing and not part of the row.

## G191-3 — PASS
`out/g191-3.json`:
- `/studio-lab`: `auth_user` null, 0 cookies, workspace and demo badge present.
- `/studio/middle-east` at 1440 and 1280: "Sign in required", 0 `audio[src]`, no workspace.
- `studio-token`: 401 without a header; 403 with `Bearer fake` (mock-backed), with no Set-Cookie and 0 cookies afterwards.
- Page traffic: 0 forbidden requests and 0 Authorization headers. Premium auth is **not** bypassed.

## T-RUN-191 — PASS
Every run used scratch copies under `c-round-191/trun/` with `node_modules` symlinked. `app/` was never touched.
- T1 + T2 on the tree: **15/15** green.
- On the start copies (the HEAD grants = `b-round-190/r191-granted-start`, checked with `cmp`): **FS1, FS2, FS3, FS4 and FS6 red**; FS0, FS5 and FS7 green.
- Mutants on Master unless stated:

| Mutant | Red | Required |
|---|---|---|
| m1 (`ring-2 ring-brand` back) | FS1, DXA1 | FS1 ✓ |
| m2 (style removed) | FS2, FS3, FS4 | FS2 ✓ |
| m3 (inverted fill) | FS2, FS3 | ✓ |
| m4 (brass thumb token) | DXA1 | ✓ |
| m5 (level recipe on Pan) | FS5 | ✓ |

- **Neighbour sanity:** the 22 suites (B's 18 + the 4 Pan suites) in the tree copy: **339/339 green**. The full suite is the gate's job.

Logs: `logs/trun-*.log`, `logs/neighbours.log`.

## AN-REVIEW-191 — PASS
- The diff adds no hex, `rgb(` or inline colour, and no `as`, `any` or `@ts-ignore`. The only inline `style` carries `--studio-fader-fill`, a unitless fraction. No `.css` file changed.
- The changed lines are only `className` / `style` and imports. `ref`, handlers, `min`/`max`/`step`/`value`, ARIA, `title` and `data-testid` are untouched. Fill and `value` use the same expression on all four faders (`clipGainMaxDb`, `trackVolumeSliderDb(...)`, `master.gainDb`).
- The T2 diff has 2 hunks: `expectNeutralThumb` and DXA1 only.
- D1 (doc 157):
  - It is in Georgian, with status `In Progress (awaiting C round 191)`.
  - R68–R71 are recorded, with rejected alternatives for R70 and the Pan wrapper.
  - The cause is labelled **confirmed** (K0 toggles), and the focus heuristic is labelled an inference.
  - The Safari/Firefox/High-Contrast TODO is present.
- **Nit:** the file list says "FS0–FS6", but FS7 exists.

## PX-NET / REG-HYD — PASS
Every C session: 0 pageerror, 0 hydration messages, 0 forbidden or remote non-font requests, and 0 Authorization headers. The only console noise is the expected cart/`ERR_CONNECTION` noise.

## Hygiene (root note)
- The scratch vitest runs (`c-round-191/trun/*`) and the `:5174` HEAD server used the store's `node_modules` through a symlink, so `node_modules/.vite` (an ignored cache) may have been written.
- The frozen list, `end-sha256.txt` and `git status` confirm that no project file changed.

## Not run / limits
- Hover was not measured; the task marks it info.
- Touch was not run in the browser. It is covered only by the green `fader-touch` unit suite.
- Safari, Firefox and real Windows High Contrast → TECH-LEAD-MANUAL.
- The tight-lane minimum height is A's evidence only; it is not a C row.

## Findings for B
- **C-R191-01 (Low, LOOK-191; a design call Saba will see):** "the adjacent track" in the row is ambiguous, so here are both numbers:
  - thumb vs brass fill: **1.82:1** (fails 3:1);
  - thumb vs the unfilled graphite track: **11.1:1** (passes).

  At the default value (track and group at 0 dB = max), the thumb's only adjacent track is brass. Any fix touches the ivory-thumb / brass-fill look Saba specified (R68), so it is a design decision, not a pure a11y defect. Steps: `/studio-lab` at 1440×900 or 1280×720 → any level fader at rest → sample the thumb (≈ 236,230,218) and the fill next to it (201,164,106). Evidence: `out/press-eval.json` (`look`), `press/tree-*-session/*-rest.png`. The thumb still contrasts 11–14:1 with the unfilled track and the parent background. Options for B/Saba: a dark thumb edge, or accept the 1.82:1 as part of R68.
- **C-R191-I1 (info):** the native Pan/Zoom pressed shade is identical to HEAD; the PRESS "thumb colour within 8" clause conflicts with R70.
- **C-R191-I2 (info):** doc 157 lists FS0–FS6, but FS7 exists.
- Signals carried forward: GLOBAL-FOCUS-VISIBLE-UNLAYERED (there are two unlayered rules: `app.css:379` and `base/utilities.css:79`), and the reviewer's note on Pan's ring being owned by the reset button.

**Ableton parity:** not applicable (task §5). No Ableton claim is made.
**Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
