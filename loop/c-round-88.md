# C round 88: independent verification of R87-PROGRESS-BELOW-FOLD-1280 (sticky footer, D-29z53)

Verifier: C · 2026-10-22 · Target: `http://127.0.0.1:5173/studio-lab`. Real Playwright Chromium, real `page.mouse` and keyboard, viewports 1440×900 and 1280×720. Every session was a new anonymous context. Source was read-only. C made no commit, push or deploy.

## Verdict: **FAIL**, one medium bug (an old keyboard-trap bug that these rows exposed)
- **taskStatus FAIL.** `browserVerified = true`, `realVerified = true`. Every browser row that can run in the cloud ran at both viewports.
- **The sticky footer (F1) and the focus guard (F2) work.**
  - At 1280×720 the status, label, bar and busy button were HR-VISIBLE in every sample of every phase (render, wav, load, mp3).
  - The panel never scrolled by itself.
  - The old 12 px cut of the export button at 1280 is gone.
  - The guard scrolls a covered radio into view and never covers a focused control.
- **What fails is two B rows: PX-KEYS-R and the "focus never leaves the dialog" part of FOCUS-NOT-OBSCURED (state 2).**
  - During a render, keyboard focus escapes the modal to the page behind it. This happens when the checked format is WAV (the default) or MP3.
  - The trap code is byte-identical to the round-87 snapshot. So this is **not caused by F1/F2**. It is an existing trap bug that round 88's rows exposed.
  - Round 87's PX-KEYS passed only because its range MP3 render had already ended when the 3rd Tab was pressed (`scope-range` was enabled again at that point).

## Bug for B

### R88-FOCUS-ESCAPE-RENDER, medium (old bug, not a regression of round 88)
- **Steps:**
  1. Open `/studio-lab` anonymously.
  2. Drop the demo music (0.35 s), stem (2 s) and sfx (4 s).
  3. Focus the toolbar `Export` button and press Enter.
  4. Tab to the format radio. Keep WAV, or press ArrowDown for MP3.
  5. Tab to the export button and press Enter.
  6. While the render runs, press Tab three times.
- **Expected:** focus stays inside the dialog (round-87/88 PX-KEYS rule, and the FOCUS-NOT-OBSCURED "focus never leaves the dialog" rule).
- **Actual, at both viewports:**
  - Tab 1 goes to X and Tab 2 goes to the checked format radio.
  - **Tab 3 goes to `BODY`, and Tab 4 to `arrangement-exit`**, a link on the page behind the modal. Further Tabs reach `Master Mute` and `Master Volume`.
- **Variants:**

  | Variant | Checked format | Result |
  |---|---|---|
  | V1: round-87 recipe (range 4–9 s) | MP3 | escapes |
  | V4: project scope | MP3 | escapes |
  | V5: 5M project | WAV (default) | escapes |
  | V3: project scope | WAV + MP3 | wraps back to X, stays inside |
  | V2: 101.7 s project | WAV | render ended before Tab 2, so inconclusive |

- **Evidence:**
  - `c-round-88/keys88-1440x900.json`, `keys88-1440x900V5.json`, `keys88-1280x720.json`;
  - `v88-*-A.json` PX-KEYS-R `during[2]`, and `v88-*` FOCUS-render;
  - screenshots `shots/keys-arrangement-export-format-{mp3,wav,both}-*.png` and `shots/focus-render-*.png`.
- **What the code shows** (an inference from reading the code, matching the observations):
  - During a render, the scope radios, Close and the busy button are all disabled. The format radios are never disabled.
  - `exportDialogFocusableElements` returns [X, wav, mp3, both], and the trap wraps only when `active === last` (`format-both`).
  - Native Tab treats a radio group as one stop, so Tab from a checked `wav` or `mp3` radio leaves the group and the modal.
  - A possible fix (B's call): wrap on the last *Tab stop* rather than the last element, or keep a sentinel or the trap focusable.
- **Why round 87 passed:** round 87's PX-KEYS ran after earlier MP3 exports in the same session.
  - The encoder was already cached, so the short range render had finished by Tab 3. `scope-range` can only take focus when `isRendering` is false.
  - C's V1 reran the same recipe as the *first* MP3 of its session. The encoder load phase kept the render running, and Tab 3 escaped.
  - That is a reproducible condition for a regression test.
- **Consequence:** this happens with default settings (WAV). A keyboard user reaches `arrangement-exit` (navigates away) and `Master Mute`/`Master Volume` behind a busy modal in the middle of an export. Space or Enter there acts on the workspace. The fix's acceptance should cover these controls.
- **Ableton:** not applicable (a CZABA modal accessibility defect).

## Acceptance rows

| ID | Result | Evidence (1440×900 / 1280×720) |
|---|---|---|
| VIS-IDLE | PASS | **101.702 s and 5M, at scrollTop 0:** Close and the export button are HR-VISIBLE (in box and hit-tested). scrollTop is unchanged after 1 s.<br>**1440:** panel 103.6–796.6, clientHeight 691 = scrollHeight 691, footer 708.6–779.6, buttons 725.6–763.6.<br>**1280:** panel 36.4–684.4, clientHeight 646, scrollHeight 691 (the body still overflows), footer 612.4–683.4, buttons 629.4–667.4, which is inside the 683.4 limit. The old 12 px cut is closed. The footer's computed position is `sticky` |
| VIS-RENDER (primary) | PASS | **Every MutationObserver sample, in every phase, had the status, label, `<progress>` and busy button HR-VISIBLE:**<br>• 5M WAV: render 20/20, wav 101/101;<br>• 5M MP3 on a fresh page: render 20/20, wav 101/101, load 2/2, mp3 8/8;<br>• 101.702 s WAV: 20/20, 101/101;<br>• 1440 WAV + MP3: render, wav and mp3, all OK.<br>**Rects during render at 1280:** status 529–549, label 565–581, bar 597–605, busy 629–667, in a panel 36–684 (clientHeight 646, scrollHeight 791).<br>**scrollTop before the click was 0, and every sample during the export was 0** (no self-scroll). Exact done messages; downloads `czaba-studio-lab.wav`, `.mp3`, and `.wav,.mp3` |
| VIS-SCROLL | PASS at 1280; does not apply at 1440 | **1280:** I wheeled the panel during a 5M WAV render. 23 rAF samples at scrollTop 0, 60, 120, **145 (= the maximum, scrollHeight − clientHeight)** and 65. In every sample, label, bar and busy were HR-VISIBLE, and all 3 hit points across the footer were footer descendants. At the bottom, the last non-footer element ends at 480, above the footer top at 496 (nothing covered). Screenshot `scroll-bottom-render-1280x720.png`.<br>**1440:** the panel does not overflow during a render (791 = 791), so a wheel cannot scroll it. All 26 samples were at scrollTop 0 with the footer fully hit. Reported as not applicable, not as a FAIL |
| VIS-DONE | PASS | **101.702 s WAV.** Message `WAV შეიქმნა: 01:41.702, 24-bit · 48 kHz · stereo.` Warning `გადატვირთვა: პიკი +1.7 dBFS — 470 sample შეიზღუდა 0 dBFS-ზე. შეამცირე Master მინიმუმ 1.8 dB-ით და გაიმეორე ექსპორტი.` Both are the same as round 87.<br>**HR-VISIBLE at scrollTop 0:**<br>• 1440: status 679.5–699.5, warning 715.5–755.5;<br>• 1280: status 537–557, warning 573–613, footer 520–683 |
| VIS-ERROR | PASS | unpkg aborted (`ffmpeg-core.js`). The exact load-failure `role=alert` is shown, and Close is enabled; both are HR-VISIBLE. Positions: alert 697.5–737.5 and Close 753.5–791.5 at 1440; 573–613 and 629–667 at 1280. No progress bar or label, 0 downloads. Unrouted afterwards |
| VIS-VIDEO (1280) | PASS | With the synthetic `beeps-6s-vp9-opus.webm` clip, the idle dialog has scrollHeight 727 and clientHeight 646, and Close and Export are HR-VISIBLE. The video option is disabled with the unchanged reason. During the WAV render, render 20/20 and wav 101/101 samples were HR-VISIBLE, and scrollTop stayed 0. `czaba-studio-lab.wav` downloaded |
| FOCUS-NOT-OBSCURED | **FAIL** (the "not obscured" part passes) | **Idle** (Tab around, plus Arrow through the radio groups) **and done-with-warning:** every focused element outside the footer had bottom ≤ footer top. Focus stayed inside the dialog. The Tab order was X → checked format → checked scope → Close → Export, as in round 87.<br>**The guard fired at 1280 (done state):** scope radio, scrollTop 0 → 27, bottom 511.5 < footer top 520. ArrowDown on the scope group with no enabled sibling also scrolled the panel natively (33/44/45), and nothing was covered.<br>**During a 5M MP3 render:** Tab 1 → X, Tab 2 → format-mp3, neither covered. **Tab 3 → BODY, then page links: focus left the dialog** (R88-FOCUS-ESCAPE-RENDER) |
| PX-PHASES-R | PASS | Order render → wav → load → mp3, no re-entry. Distinct values: render 20, wav 101, mp3 7. The load phase has no `value` (2 records). 0 decreases, and label = floor(value × 100) in every record. The bar is absent before the click and after done and never takes focus. Statuses match round 87 |
| PX-KEYS-R | **FAIL** | Enter opens Export. ArrowDown gives MP3, Tab reaches `MP3-ის ექსპორტი`, Enter starts the export. `.mp3` downloads with the exact message. The `<progress>` never took focus. Escape after done returns focus to Export. **But the 3rd Tab during the render left the dialog (BODY)** at both viewports |
| PX-WAV5-R (1280) | PASS | 14 611 488 frames, 24-bit, 48 kHz, 2 ch, NaN 0, exact message. **Max rAF gap 55.2 ms.** Top 5: 55.2, 42.7, 38.2, 38.0, 36.3. Band PASS (≤ 150) |
| PX-NET | PASS | 0 unpkg requests before the first MP3 click in every session (WAV-only sessions make none at all). Afterwards only `@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.{js,wasm}`. Workers are same-origin: `export-wav.worker.ts` and `node_modules/@ffmpeg/ffmpeg/.../worker.js`. Per-session NET: 0 studio-token, R2 or download requests from the pages, 0 auth headers |
| REG-HYD | PASS | Every session: 0 hydration or `useLayoutEffect` warnings, 0 non-noise errors. In the induced unpkg-abort sessions the only console lines were the expected cart and `ERR_CONNECTION_REFUSED` noise |
| G88-3 | PASS (one sub-check BLOCKED) | Anonymous `/studio/middle-east` shows "Sign in required" with 0 workspace (both viewports). `/api/studio-token?product=middle-east&file=stem1.wav` anonymous → **401** `Please sign in to access Studio.` The header link opens `/studio-lab` with the workspace and the demo badge. `localStorage` holds no auth. **Fake Bearer → 500** `Unable to prepare Studio access`: **BLOCKED, backend unavailable in cloud** |
| T88-TARGETED | PASS | C re-ran A's `targeted-list.txt`: **51 files / 919 tests passed** (`c-round-88/targeted-c.log`). This is not the full suite |
| SOURCE-UNCHANGED | PASS | HEAD `971141d`. 7 M + 11 ?? (18 lines) at start and end. Frozen list 505/505 at start and end. Dialog `24e53071`, test `5d6d30e4`, doc `605915b0`, `Modal.tsx` `741c2341`, `ffmpeg.ts` `0995ae78` and StudioContext `caa388e7` match A's end hashes. Protected auth and route files are the same at start and end (`start-hashes.txt`) |

**Gate rows** (not claimed by C): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke, and the production MP3 bundle (PROD-MP3-UNVERIFIED).

## Observations for B (not bugs this round)
- At 1280 the idle body still overflows by 45 px (691 vs 646). The footer hides that overflow, and HR-VISIBLE holds. Near the maximum scroll the footer rises by up to 16 px (ModalBody `py-4`), which matches reviewer edge case 4.
- The headless `<progress>` fill colour is green in screenshots. This is known (R87-T).
- During a render the format radios stay enabled, and they are the only enabled controls left. Changing the format mid-render was not tested and was not in scope.

## Ableton match
Not applicable this round (§4). Layout and focus in CZABA's own dialog: no Ableton claim is made.

## Artifacts
- **Tools:** `c-round-88/tools/lib88.cjs`, `vis88.cjs` (sessions A–F), `keys88.cjs`, `g88.cjs` and `tok88.cjs` (built on the round-87 harness).
- **Data:** `v88-1440x900-A.json`, `v88-1440x900-BCE.json`, `v88-1280x720-ABCDEF.json`, `keys88-*.json`, `g88-*.json`, `token-api.json`.
- **Screenshots:** `shots/`.
- No downloaded media is left behind; exports were deleted after measurement.
