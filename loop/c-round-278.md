# C round 278 — SYS-5 stage 2 (final): independent verification

**Verdict: PASS.** browserVerified = realVerified = **true**. Every browser row ran in real Chromium (Playwright) on `http://127.0.0.1:5173/studio-lab`, at 1440×900 and 1280×720, in fresh anonymous contexts. Gate rows are not claimed.

**Tree:** HEAD `42872cf` plus A's uncommitted work: 17 `M` and 3 `??`, all §5 paths. The frozen manifest check returns rc 0, and it still returns rc 0 after C's run. C changed no source.

**Evidence:** `c-round-278/` (scripts `c278.cjs`, `c278-smoke.cjs`, `ringshot.cjs`, `ringpx.cjs`, `loadingprobe.cjs`, `analyze-look.py`; JSON results; screenshots; mutant logs; `checkpoint.md`).

## Environment incident (C-caused, repaired, no product impact)
- **What happened.** For HEAD comparisons C started a second dev server for `42872cf` on :5174, with `node_modules` symlinked. That server re-optimised the shared `node_modules/.vite/deps` cache, so the root server on :5173 returned `504 Outdated Optimize Dep` (`pako.js`), and `/studio/middle-east` rendered blank.
- **Repair.** C stopped :5174 and restarted :5173 with the same command plus `--force` (log: `c-round-278/dev-5173-restart.log`). After that both routes rendered normally.
- **Second HEAD server.** C then ran HEAD again on :5174 with its own `cacheDir` (`/tmp/c278-head-vitecache`, set in the scratch copy's config, not the store's). The store cache's `_metadata.json` timestamp stayed unchanged (23:00:10) for that run, and :5174 is stopped now.
- **Invalid results and reruns.** The first `auth@1440` run (blank page, timeout) and the first `c278-auth-wait` runs are environment-invalid; they are kept as files. The valid auth result is `c278-auth.json`. The smoke runs had finished before the cache broke.
- **Lesson candidate for B:** "a second Vite server for HEAD needs its own `cacheDir`; never share `node_modules/.vite`."

## Scope, claims, tests
| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS | `sha256sum -c b-round-277-r278-tree-sha256.txt` rc 0. `git status`: 20 entries, all §5 paths (3 `??`: `studio-soft-disabled.ts`, `studio-soft-disabled.test.tsx`, doc 207) |
| HUNK-SCOPE | PASS | C applied `b-round-277/sketch.diff` to a `git archive 42872cf` copy and compared it with `cmp`. These are byte-identical to the sketch: the 4 source files, the new helper, the 3 perf specs and 5 test files (mode-toggle, library-row-strings, drag-feedback, transport-centre, strings). `metronome-ui`, `library-preview` and `self-disabling-focus` differ only by added lines (+53 / +130 / +56). The one `<` line in metronome-ui is the `../tempo` import, merged to add `TEMPO_INVALID_MESSAGE`. `held-enter-add` changes 1/0 lines, exactly the granted line. Doc 206 changes 3/3 lines: l.4 is byte-exact `**სტატუსი:** Completed (C round 278 PASS)`, and l.9 and l.65 now say 278 |
| CLAIMS | PASS | `claims.sh` on a clean `42872cf` archive gives output identical to `b-round-277/claims-output-at-42872cf.txt` (`diff` empty; `c-round-278/claims-head.txt`) |
| SWEEP | PASS | On A's tree, SW-A finds 47 files. The consumer filter leaves 9, each granted (§5) or ruled (§7/K16): navigation-strings l.434 is Loop and perf is a fader or export. SW-B leaves 3 hits, all ruled: fader-style l.426, strings.test l.420, navigation-strings l.231 (`sweep-a-tree.txt`) |
| TESTS-TARGETED | PASS | The 14 §6.3 files: 14 files, 195/195 (`targeted-vitest.log`) |
| TEST-CHANGES | PASS | The sketch test edits are byte-identical. A's added rows only add assertions. The one row-text deviation, LPA4, adds a status assertion and so is stronger (A's report) |
| MUTANTS (C re-run, scratch copy outside `store/`) | PASS | **G** (guard removed in the wrapper): SD2, SD2b, SDU2, SDU4, LPA1 and LPA4 go red (`mutant-G.log`). **UI12** (metronome spreads `softDisabledButtonProps`): UI12, UI13 and UI14 go red, 3 failed / 11 passed (`mutant-UI12.log`) |

## Browser behaviour (both viewports, identical results)
| Row | 1440×900 | 1280×720 | Measured |
|---|---|---|---|
| B-TAB-2 | PASS | PASS | **Forward Tab ×140:** Metronome is a stop with `aria-disabled="true"`, `:focus-visible`, and a `1px solid` brass ring (`rgb(201,164,106)/0.8`). **Video track active:** from the video header, Add is reached at Tab 63 with `aria-disabled="true"` and focus-visible. **Backward from End:** Shift+Tab reaches Metronome at 68 and Add (soft-disabled) at 78. At HEAD, the metronome was never reached (B's K14) |
| B-AX-2 | PASS | PASS | **Metronome:** `button`, name `Metronome`, description `Metronome — set a BPM first`, `disabled:true`, `focusable:true`. **Add (video):** `button`, name `Add`, description `Add — make an audio track active first`, `disabled:true`, `focusable:true` |
| B-NOOP-2 | PASS | PASS | **Metronome (focused by Tab), Enter:** `aria-pressed` stays `false` and the status is unchanged. **Add (video), Tab + Enter:** status, clip count and Undo title are unchanged. **Mouse click on Add:** the same three are unchanged, and focus stays on the video header button (not Add, not BODY) |
| B-VARIANT-X | PASS | PASS | **`120` without Enter, then mouse-click Metronome:** field `120`, `aria-pressed="true"`, no `aria-disabled`, and the status is exactly `Metronome is on — 120 BPM, 4/4: …Not included in the export.` (= HEAD in K15). **`abc`:** status `Tempo must be 20–999 BPM (e.g. 90 or 92.5) — not changed.`, `aria-pressed="false"`, `aria-disabled="true"`, focus on the toggle (HEAD: BODY) |
| B-ADD-TITLES | PASS | PASS | **1.5 s hover (`:hover` true):** on the audio track with a sound selected, the title is `Add to the active track at the insert marker`; on the video track it is `Add — make an audio track active first`. Headless Chromium paints no native tooltip, so the observable part is the title attribute plus the hover state |
| LPA3 reachability (data) | — | — | **Loading:** reachable in the demo. During the first ~1.5 s after load, Preview reads `aria-disabled="true"` with `Preview — wait for the sound to load`, and Add reads `Add — wait for the sound to load`; Preview's cursor is `not-allowed` (`loadingprobe.json`). **After that,** all 9 sources are preloaded, and clicking 6 of them showed no loading state. **No-sound and failed:** not reachable in the demo, a sound is selected from the start. Those states are covered by jsdom LPA3, which C confirmed in the targeted run |
| B-ADD-ENABLE | PASS | PASS | Video track active, Tab to Add, then a mouse click on the Music header button. After that, Add has no `aria-disabled` and its title is the available text. Shift+Tab ×22 returns to Add; Enter adds exactly 1 clip (0 → 1) |
| B-CURSOR | PASS | PASS | Soft-disabled Split, Delete, Loop, Metronome and Add (video): computed `cursor` is `not-allowed`, with `:hover` true. Fit and Add on the audio track: `pointer`. **Closes C-R276-01** |
| B-DELETE-NAME | PASS | PASS | **Empty:** name `Delete`, description `Delete — select a clip or make a time selection first (Delete)`. **Clip selected:** name `Delete — the selected clip; leaves a gap`, description `Delete clip — leaves a gap (Delete)`. **Range:** the name is the range hint (`Delete time selection — leaves a gap (Delete / Backspace). Cut Time closes the gap: Ctrl+Shift+X`), and the description is the same text |
| B-PERF-PREDICATE | PASS | PASS | **Polled every 100 ms from load:** new = false while Add is `aria-disabled="true"`, true once Add is available and the wave is drawn (about 1.45 s, slightly before the status says "Demo collection ready"). **Video track:** new **false**, old **true** (vacuous; recorded as data). **Audio track:** new true. The script's own automatic `pass` flag was too strict ("false until the status says ready"); C judged the row against the task text. Raw data: `c278-new-…json` `perf@*` |
| B-HANDOFF-REG | PASS | PASS | **Delete handoff:** the clip is deleted and focus lands on Undo with the ring; Enter brings the clip back. **Undo handoff:** focus lands on Redo |
| STUDIO-SMOKE-278 | PASS | PASS | Play/Stop `false>true>false`; the playhead advances and then holds; live RMS > 0.001. **Exported WAV:** sha256 `1fea093b…f94` equals the expected value; 16.0 s, 0 NaN (`c278-smoke.json`) |

## Look
| Row | Result | Measured |
|---|---|---|
| V-LOOK-2 | PASS (both) | **Measured with B's `avg()` method, ΔE2000 against B's HEAD values and against C's own HEAD run (identical):** Metronome mean 1.57, brightest 1.76, left edge 1.57; Add (video) mean 2.83, brightest 2.31, left edge 1.88. All are ≤ 3. Boxes 77×16 and 128×34, ±0 |
| V-HOVER-2 | PASS (Metronome, Add) | Hover and press backgrounds equal the rest value, `oklab(… / 0.05)`, for the soft-disabled Metronome and Add (video). **Preview:** its soft-disabled state exists only during the ~1.5 s first load, so hover was not measured; its cursor in that state is `not-allowed` (data) |
| V-HOVER-ENABLED-2 | PASS (both) | Measured against an isolated HEAD server: rest, hover, press and press-transform are identical to HEAD for Metronome off (0.05/0.08/0.12), Metronome on (0.2/0.2/0.2), Preview and Add (0.05/0.08/0.12). Press transform is `matrix(0.98…)` at HEAD and new |
| V-PRESS-2 | PASS (both) | A mousedown held on the soft-disabled Add gives `transform: none`, and on the soft-disabled Metronome as well |
| V-RING-2 | PASS (both) | **Metronome:** outline `1px solid` brass /0.8, offset −2 px (inset); the button's effective opacity is 1, and only the `SPAN` child is at 0.5. **Ring contrast:** zoomed ×4 pixel column (`ringpx-metro.json`): ring `167,137,90` against the inner fill `32,30,28` is **5.04:1**, against the outer background `22,20,18` it is **5.57:1**. **Add (video):** effective opacity 1, the child svg is at 0.4, and the ring `165,135,88` against the background is **5.43:1**. The first automatic outer-scan value for the Metronome (1.0 to 1.15) was a method error, because the ring is inset; the zoom screenshot `new-ring-metro-zoom-*.png` shows the full ring |
| SCREEN-BUDGET | PASS (both) | Persistent text outside the timeline is identical to HEAD (line keys / text nodes, and identical text lists). 1440 empty: 61/89 vs 61/89; 1440 with a clip: 67/107 vs 67/107. 1280 empty: 51/81 vs 51/81; 1280 with a clip: 62/91 vs 62/91 |

## Guards and docs
| Row | Result | Measured |
|---|---|---|
| C-R276-02-KEEP | PASS (both) | Type `9` in the BPM field (no Enter), then mouse-click the soft-disabled Split. Focus stays in the field, the draft stays `9`, and the status is unchanged |
| G278-AUTH | PASS (both) | **Anonymous `/studio-lab`:** the workspace loads with the badge "Demo collection — no sign-in required", and `auth_user` is null. **`/studio/middle-east` signed out:** "Sign in required", 0 `audio[src]`, no workspace. **`/api/studio-token`:** no header → 401 `Please sign in…`; a fake bearer → 500 `Unable to prepare Studio access`. No token in either response, and no 200 token response from the page. Premium auth is not bypassed |
| DOC-206-207 | PASS | Doc 206: l.4 is byte-exact and l.9/l.65 say 278; nothing else changed (3/3). Doc 207: l.4 is byte-exact; the 7 TEMPLATE headings are present in order. Every cited row ID (SDU1–4, UI1/2/6/11–14, LPA1–5, SD7–9, HA5) exists in its test file |
| gate | not claimed | Full vitest, typecheck, build, Biome, `npm run verify` and `test:e2e:smoke` belong to the root gate |

## CZABA requirement vs Ableton conformance (separate)
| Point | CZABA requirement | Ableton conformance |
|---|---|---|
| Unavailable controls stay focusable (WAI-ARIA APG) | met (B-TAB-2, B-AX-2) | not applicable (an APG pattern, not a Live behaviour) |
| Metronome can be unavailable without a BPM | met (title reachable by keyboard and AT) | **deliberate deviation**: Live always has a Set tempo, §19.4; Saba's decision "never invent 120 BPM" |
| Live's treatment of unavailable controls | — | **unconfirmed** (LIVE-MEAS-SYS5-DISABLED still open) |
| Variant X (a click-away commits the draft, and the same click toggles) | met, equal to HEAD (K15) | **unconfirmed**; no Live source was found |

## Findings for B (non-blocking, no bug at Medium or above)
- **C-R278-NOTE-02 (info): the Metronome's focus ring is inset, unlike the transport ring.**
  - **What C measured:** the Metronome ring is drawn inside the button (`outline-offset: -2px`). This comes from `STUDIO_FOCUS_RING_INSET_CLASS`, which was already there at HEAD `42872cf`. The tempo row is `h-5 overflow-hidden` and would clip an outer ring. The transport buttons use +2 px (`c276-new.json`).
  - **Width:** 1 px for both. SABA-B-4's text says 1.5 px. This is the shared token as it was before; this round did not change it.
  - **Contrast:** ≥ 5:1. Not a round-278 bug. B may reconcile it with the SABA-B-4 wording.
- **Dev server replaced:** C's restart replaced the :5173 server process. The original PIDs 3185/3198/3199 are gone; the new ones are 7627/7641/7642, started with the same command plus `--force`.
- **C-R278-ENV-01 (info, C-process):** a HEAD comparison server must use its own Vite `cacheDir`. A shared `node_modules/.vite` breaks the root dev server (504 Outdated Optimize Dep). Proposed lesson for "What to probe first (C)" / the harness notes.
- **C-R278-NOTE-01 (info):** the Preview soft-disabled state is reachable in the demo only during about 1.5 s after the first load (loading). No-sound and failed cannot be reached in the demo. V-HOVER-2 for Preview stays covered only by tokens and jsdom. Not a bug.
- **Carried from A (Low, for B):**
  - the code-reviewer's metronome-guard spy test candidate;
  - the unused `(event)` parameters;
  - Signal 1: two `aria-disabled` patterns, with the `keepMouseFocus` option proposal.
- **Root-pre-push items:** none is touched by this round.

## Outcome (per §11)
C PASS. If the gate publishes, SYS-5 can be **მზადაა** (stages 1 and 2). This closes ROOT-R66-L3 (the disabled-reason half), C-R130-ADD-DISABLED-NO-REASON, C-R276-01 (B-CURSOR), C-R276-02 (row kept, KEEP verified), A-R276-REVIEW-DELETE-NAME and A-R276-ARCH-GUARD-IN-HELPER. It is not a release.
