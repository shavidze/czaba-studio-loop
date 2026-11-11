# Round 455: SABA-B-14 — the Store player's seek thumb stays on the brass fill edge

**Planned by:** B, at the round 454 → 455 planning, 2026-11-11 (`b-round-454.md`).
- **Advisor:** available, and consulted after orientation and before writing.
- **Archive:** the round-454 task is saved as `tasks/round-454.md`, a byte-identical copy made before this file was rewritten.
- **Baseline:** gate 454 is `published` with commit `2e26962` [K1]. The store tree is at `2e26962` and clean at planning [K2].
- **Regression:** not due. The last ran 2026-11-10, round 425; the next is due on or after 2026-11-13.
- **Next RETRO:** round 465.

## Why this round
- **Round 454 is closed.** C round 454 returned PASS on C1–C10, with `browserVerified` and `realVerified` true and 0 bugs. Gate 454 published `2e26962`, so STORE-2b-3c-1 is done (D-29z1615).
- **Saba reported two Store bugs on 2026-11-11.** Both are Medium because Saba saw them himself (bug gate 2026-10-23). They are recorded at this planning (L42, D-29z1616):
  - **SABA-B-14**, the subject of this round: the white seek thumb on the Store audio player runs ahead of the brass progress fill.
  - **SABA-B-13**: the Store entrance animation needs a minimum display time. It is the next STORE-2b stage after 2b-3c-2, because it needs a design consult and a reference section first.
- **This round goes before STORE-2b-3c-2** (D-29z1617). 2b-3c-2 is a test-only helper round, and a Medium bug that Saba saw on a mounted screen comes first. 2b-3c-2 becomes round 456. Nothing is dropped.

## What B measured at HEAD (real Chromium, `/products/pulse-loop-kit`, the mock API, a 150 s preview, track 464 px)
- **Probe:** `b-round-454/probe/seek-probe.mjs`. It wraps `window.Audio` to reach the preview element, which is not in the DOM (INFO-B454-PREVIEW-AUDIO-ELEMENT).
- **Method:** pause at 10 times between 0.4 s and 149.6 s. For each one:
  - The **thumb centre** is the middle of the white pixels on the track row.
  - The **fill edge** is the last brass pixel, read with the thumb hidden by an injected style.
- **HEAD result:** the thumb leads the fill by 4–7 px early in the track and lags it by 4–5 px near the end. The largest gap is 7 px at both viewports [K11]. The files are `probe/seek-5173-1440.txt` and `probe/seek-5173-1280.txt`.
- **Two causes, both measured:**
  1. **Whole-second snapping.** The progress `<input type="range">` has no `step` [K3], so it uses the default step of 1. Its value, and so the thumb, snaps to whole seconds: at currentTime 3.6 the value is 4. The gradient fill uses the exact fractional time (`progressPercentage` [K4]).
  2. **Thumb inset.** The 12 px thumb [K5] has its centre travel from 6 px to width − 6 px, while the fill stop runs from 0 to 100 % of the width.
- **Root's guess ("a CSS transition delay") is not the cause.** The fill is an inline gradient with no transition, and the thumb and the fill update in the same render.
- **The volume slider** in the same player has the same inset, but not the snapping (it has `step="0.01"` [K3]). It gets the same fill.
- **Other Store ranges are out of scope.** The four `recordings/*` files with `type="range"` each have at least as many `step=` attributes as ranges, use `accent-*` classes, and have no `linear-gradient` [K12]. Their fill is the browser's own accent fill, which the browser keeps under the thumb. Only `AudioPlayer.tsx` paints its own fill gradient (`linear-gradient(to right` outside the Studio folders: that file only, 2 hits) [K13].
- **Studio sliders are not touched.** They are separate Arrangement components.

## What changes (user-visible)
- **The fill follows the thumb.** While a preview plays, the brass fill ends exactly at the centre of the white thumb, at every point in the track, at both viewports, and the thumb moves smoothly instead of in 1 s jumps. The volume slider's fill also ends at its thumb centre.
- **The keyboard stays as it was.** Every arrow key, with or without Shift, Alt, Ctrl or Meta, still seeks ±1 s, now from the exact time. For example, 10.4 → 11.4, where HEAD rounded first and went 10.4 → 11.
  - **At HEAD,** B measured that every modified ArrowRight goes +1 s [K16], and that Alt+ArrowLeft seeks −1 s without navigating back [K15]. Both are the native range behaviour with step 1.
  - **The sketch keeps that:** it gives +1.0 s and −1 s, and stays on the page.
  - **The seek is clamped** to 0 and to the duration.
  - **PageUp/PageDown (10 %), Home and End stay native.**
- **Screen readers.** The position is announced as `m:ss of m:ss` (`aria-valuetext`). Without it, a fractional value would be read out as, for example, "10.4".
- **Nothing else moves.** The player's layout, colours, sizes and every other control are unchanged. No new persistent element is added, so the screen budget (L39) does not apply.

## Reference
- **There is no Ableton reference.** This is the Store player, not the Studio.
- **WAI-ARIA APG, "Media Seek Slider Example"** (`https://www.w3.org/WAI/ARIA/apg/patterns/slider/examples/slider-seek/`, read 2026-11-11):
  - The arrows move one step and Page Up/Down move larger steps.
  - Home and End go to the minimum and maximum.
  - `aria-valuetext` gives a user-friendly time instead of the raw number.

  **Deviation:** APG's Page step is 15 steps; ours stays the native 10 % (the HEAD behaviour, unchanged). The reason: this round fixes a visual desync and does not redesign keyboard steps.
- **Established practice:** the fill ends under the thumb centre. That is the visual contract Saba asked for ("they should move together"). **No other source was fetched;** B does not claim any other product's exact geometry.
- **`product-designer` is not consulted.** This is a fix-up, not a new feature.
- **`tech-lead` reviewed the sketch:** APPROVE (`b-round-454/sketch-review.md`).

## Why we missed it (Saba-found issue rule)
- **Which phase should have caught it:** the B spec of STORE-1b (round 187). That round fixed the fill colour (the undefined `--color-primary`) and C checked that the fill was visible. No row compared the fill edge with the thumb, and nobody looked at the range's `step`.
- **Why it was missed:** the rows were colour rows taken from a still screenshot at one position. The 1 s snapping only shows while playing, and the inset only shows away from the middle.
- **Rule:** L61 gains a "painted range fill" clause in this planning (no new line; the lessons file stays at 60 lines). C checks that the clause exists (row C8).

## Ruling lines (L4)
- **`step="any"` versus the arrow step:** the key handler wins for ArrowLeft, ArrowRight, ArrowUp and ArrowDown with any modifier. Every other key is native.
  - **Why modifiers are included:** with `step="any"`, a native arrow moves 1 % of the range. B's first sketch excluded Alt, Ctrl and Meta and measured +1.5 s for them, a regression against HEAD's +1 s (`probe/extra-5181-*` before the fix, recorded in `sketch-review.md`).
- **Fill helper:** the volume slider uses the same helper. Its rendered fill moves by up to 6 px, by design, so that it also ends at its thumb centre. That is the only visual change outside the progress bar.
- **The changed assertion in `audio-preview-player.test.tsx`:** the K1 `_REGRESSION` row "draws the played and set parts with var(--color-brand)" changes its two `toContain` strings from `var(--color-brand) 25%` / `70%` to the calc form. Its intent (the brand token, the fraction) stays, and no assertion is lost.
- **Non-finite durations:** previews are finite files. With an infinite duration, `aria-valuetext` would read "… of 0:00", the fill would stay at 0 and `max` would fall back to the native default, the same as at HEAD (this is `tech-lead`'s reasoning, not measured). This is not a row.

## 1. Changes
A applies `b-round-454/sketch-455.patch.txt` with sha256 `c3feb71895df31ec00d1d17cc6483129d04d00d12f789ca30d40173bc25a28c3`. `tech-lead` reviewed this exact sha (`sketch-review.md`, review 2) [K17]. The per-file hashes are in `b-round-454/sketch-files-sha256.txt`.
- **`app/components/audio/AudioPlayer.tsx`:**
  - adds `AUDIO_PLAYER_THUMB_PX = 12` and `AUDIO_PLAYER_KEY_STEP_SECONDS`;
  - exports `audioPlayerRangeFill(fraction)`, which clamps to 0..1, prints a non-finite value as 0, and sets the edge to `calc(6px + f * (100% - 12px))`;
  - replaces `progressPercentage` with `progressFraction`;
  - adds `handleProgressKeyDown`;
  - on the progress input, adds `step="any"`, `onKeyDown` and `aria-valuetext`;
  - makes both inputs use the helper.
- **`app/lib/__tests__/audio-preview-player.test.tsx`:**
  - the K1 assertion moves to the calc form;
  - a new describe "the seek thumb stays on the brass fill edge (SABA-B-14)" adds ST1, ST2, ST3, ST3b, ST3c, ST4, ST5, ST6, ST7 and ST8. ST5: Alt/Ctrl/Meta+ArrowRight seek +1 s; PageUp, PageDown, Home and End are not handled.
- **`docs/implementation/2026/quarter-IV/298-saba-b-14-store-seek-thumb.md`** (new): written by A, in Georgian, with the `docs/implementation/TEMPLATE.md` headings in order.
  - l.3 is exactly `**თარიღი:** 2026-11-11`.
  - l.4 is exactly `**სტატუსი:** In Progress (SABA-B-14, round 455)`.
  - The word `pending` appears nowhere (L28).

  The doc must contain:
  - the two measured causes, with the HEAD numbers from this task;
  - the keyboard ruling and the volume-fill ruling;
  - the `aria-valuetext` reason;
  - the ST ids;
  - the Firefox Tech Lead row (TLM-R455-FIREFOX-SEEK-THUMB);
  - the "Why we missed it" line.

**Grants:** exactly `b-round-454/grants-455.txt` (the 3 paths above). No other file. `app/styles/app.css` is **not** granted: the thumb CSS stays as it is (12 px wide [K5]), and ST8 pins that width.

## 2. A: steps
1. Read `lessons.md` (the A part), the primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`, and `.claude/prompts/new-test.md`.
2. Run `bash b-round-454/claims-455.sh > a-round-455/claims-before.txt 2> a-round-455/claims-before.err`. It must equal `b-round-454/claims-455-planning-output.txt`, and stderr must be empty. On a mismatch, STOP and report it.
3. Check and apply the patch. Make **no hand edits** to the 2 code files (C3 pins their hashes).
   - Run `sha256sum -c b-round-454/sketch-455.sha256`.
   - In the store, run `git apply <loop>/b-round-454/sketch-455.patch.txt`.
   - Then run `sha256sum -c b-round-454/sketch-files-sha256.txt` from the store root: 2 OK.
4. Write doc 298 as in §1.
5. Run the checks for the changed code only (speed rules):
   - `npm run typecheck`: rc 0.
   - `npm run lint`: rc 0, with the warning count equal to HEAD's.
   - `npx biome check app/components/audio/AudioPlayer.tsx app/lib/__tests__/audio-preview-player.test.tsx`: 5 warnings, all the pre-existing `useButtonType`, the same as HEAD [K18]; no format diff.
   - `npx vitest run $(cat <loop>/b-round-454/covering-455.txt)`: 6 files / 73 tests green.
   - **Mutants:**
     - Make a scratch with `git clone --shared` at `2e26962`, apply the patch, **commit it in the scratch only**, and symlink `node_modules`.
     - Run `bash b-round-454/run-mutants.sh <scratch> a-round-455/mutants/mutants.txt`.
     - The output must equal `b-round-454/mutants/mutants.txt` (14 lines: BASE green, M1–M13 red). The script also writes one log per mutant, `mutant-<id>.log`, next to the output.
   - The code-reviewer is only needed for 3 or more changed files. 3 paths are changed, so run it, and pass its Architecture note to B without acting on it.
6. **Browser (A's own check, not C's rows):**
   - Use the tree's dev server `:5173` and the mock API `:5199` (start it detached with `setsid node <loop>/mock-api/server.mjs` if it is down).
   - Warm the server twice.
   - Run `node <loop>/b-round-454/probe/seek-probe.mjs http://127.0.0.1:5173 <w> <h> a-round-455/seek-<w>.json a-round-455/shots` at 1440 900 and 1280 720. Each run must print `MAX_ABS_LEAD_PX` ≤ 1.00. B measured 0.00.
   - Run `key-probe.mjs http://127.0.0.1:5173 none`. Its output must equal `b-round-454/probe/key-sketch.txt` in every key and value.
7. Run `claims-455.sh` again. Its output must equal `b-round-454/claims-455-sketch-output.txt`. That file is the script's own output on a clone with the sketch applied and a doc 298 present. It differs from the planning output only in K2, K3, K4, K6, K8 and K13. stderr must be empty.
8. `git status --short --untracked-files=all` must show only the 3 grants.
9. Write `a-round-455.md`: the changed files, each step with its real result and log path, the reviewer's findings with ids, and the known gaps.

## 3. C: acceptance rows
**Setup:**
- Real Chromium (Playwright).
- Copy `b-round-454/probe/*.mjs` into `c-round-455/` before changing anything (L60).
- **Servers:**
  - The tree: dev `:5173`.
  - The mock API: `:5199`.
  - The HEAD control: `bash b-round-448/probe/serve-tree.sh start <c-round-455>/head 5182 /home/runner/czaba-project/store 2e26962`. Stop it afterwards.
- Warm each server twice with `node b-round-448/probe/warm.cjs <base> / /products/pulse-loop-kit /studio-lab /studio/middle-east`.
- Run probes one at a time, never during a vitest run (L38).

| Row | Action | Pass |
|---|---|---|
| C1 SOURCE-SCOPE | `git status --untracked-files=all` | Only the 3 `grants-455.txt` paths. `app/styles/**`, `app/contexts/AudioContext.tsx`, `app/components/recordings/**`, `app/components/arrangement/**`, `app/root.tsx` and the protected routes are unchanged |
| C2 CLAIMS | `S=<a git clone --shared at 2e26962, with the store `node_modules` symlinked> bash b-round-454/claims-455.sh`, then `bash b-round-454/claims-455.sh` on the tree | The clone equals `claims-455-planning-output.txt`; the tree equals `claims-455-sketch-output.txt`, which differs from the planning output only in K2/K3/K4/K6/K8/K13; stderr empty. Also run L29's grep over this task |
| C3 APPLY | `sha256sum -c b-round-454/sketch-files-sha256.txt` in the store | 2 OK |
| C4 THUMB-ON-FILL (the bug) | `seek-probe.mjs` on HEAD `:5182` and on the tree `:5173`, at 1440×900 and 1280×720 | **HEAD (control):** `MAX_ABS_LEAD_PX` ≥ 4 at both viewports (B: 7.00) and `value` integer while playing. **Tree:** \|lead\| ≤ 1 px at all 10 paused samples (0.4 s … 149.6 s) at both viewports (B: 0.00); while playing, `step` is `any` and `value` is fractional. Keep the crops of the 3.6 s and 149.6 s samples from both trees |
| C4b PLAYING VISUAL | On the tree, let the preview play for 3 s at each viewport and take 6 crops of the player track about 0.5 s apart | In every crop, the brass fill ends under the thumb: no brass visible beyond the thumb's right edge, and no grey gap between the fill and the thumb's left edge. Attach the crops |
| C5 KEYBOARD | `key-probe.mjs <base> none` and `altleft-probe.mjs <base>` on HEAD and on the tree | **Tree** `key-probe` equals `b-round-454/probe/key-sketch.txt`: arrows ±1.0 s from 10.4, clamped at 0 and at the end; PageUp/PageDown 10 %; Home 0; End = duration; valuetext `2:30 of 2:30`. **HEAD** equals `key-head.txt` (the control differs). **Alt+ArrowLeft:** both stay on `/products/pulse-loop-kit`; HEAD ct 9, tree ct 9.4 (B: `altleft-*.txt`) |
| C5b VOLUME, HOVER, DRAG, MODIFIED ARROWS | `extra-probe.mjs <base> <w> <h> <out.json>` on HEAD and on the tree at 1440×900 and 1280×720 | **Volume** (clicks at 0.05/0.35/0.7/0.95): tree `VOLUME_MAX_ABS_LEAD_PX` ≤ 1 (B: 0.00), HEAD ≥ 4 (B: 5.00, control); `MUTE [0,0.7]` on both. **Hover** at 30.3 s: tree \|leadPx\| ≤ 1 with `thumbWidthPx` 14 (the hover scale; B: 0), HEAD 3. **Drag** 20 → 60 % while paused: tree `ctMinusValue` 0, `paused` true, \|leadPx\| ≤ 1 (B: 0, `ctFraction` 0.6026). **Modified arrows** (Shift, Alt, Control, Meta + ArrowRight from 10.4): tree ct 11.4 for all four, HEAD 11 for all four; the URL is unchanged. B: `probe/extra-{5173,5181}-*.txt` |
| C6 COVERING + MUTANTS | `npx vitest run $(cat b-round-454/covering-455.txt)`; then `run-mutants.sh` on a C scratch (`git clone --shared` at `2e26962` + A's diff applied **and committed**; absolute OUT) | 6 files / 73 tests green; `mutants.txt` equals `b-round-454/mutants/mutants.txt` (14 lines) |
| C7 STUDIO + PURCHASE PROTECTION | From inside `c-round-455/`: `node <copy of b-round-453/probe/c12-run/c12-from-c448.cjs> <base> <tag> > c12-<tag>.json` on HEAD and on the tree | At 1440 and 1280: `/studio-lab` has 1 clip, goes to Playing with `posPlay` > 0 and then Stopped, and `stopHeld` is true; anonymous `/studio/middle-east` shows "Sign in required" with `audioSrc` 0 and `media` 0. Equal to HEAD except `url` and `posPlay` |
| C8 DOCS + LESSON | doc 298; `lessons.md` | Doc 298: l.4 exact; the TEMPLATE headings in order; no `pending`; ST1–ST8 (with ST3b and ST3c) cited and present in the test file; the two causes and the Firefox TLM row present. `lessons.md`: 60 lines or fewer, and line L61 matches `grep -ic "painted range fill"` (B: 1) |
| C9 L57 | `python3 -I tools/l57-check.py c-round-455.json c-round-455/l57-check.txt` | rc 0 |

**Notes for C:**
- **Gate rows** (full vitest, typecheck, build, Biome, verify) are marked `gate` and are not claimed by C. B's run on the dispatched sketch gave 284 files / 4148 tests, rc 0 (`b-round-454/precheck-full-raw.log`). Build rc 0 on the first sketch (`precheck-build.log`); the delta is TS logic and tests only.
- **Not testable in the cloud:** Firefox `step="any"` and the moz-range-thumb inset (reasoned by `tech-lead`, not measured). This is Tech Lead row TLM-R455-FIREFOX-SEEK-THUMB, deadline RETRO 465.
- **BLOCKED (backend unavailable in the cloud):** none expected. The Store player runs on the mock API.
- **`c-round-455.json`:** write all the L57 fields, and give every finding an `origin`. Set `mutantRedOnSketch` = `b-round-454/mutants/mutants.txt` and `affectedChecksRunOnSketch` = `b-round-454/precheck-covering.log`, `b-round-454/probe/seek-5181-*.txt` and `b-round-454/probe/extra-5181-*.txt`.

**Neighbours that could break:**
- **Every page with the sticky player.** C4 runs on the product page, the buyer's journey: product → play → player.
- **The player's other buttons:** C5b covers mute.
- **Track skip at the end.** ArrowRight at the end seeks to the duration and fires `ended`, the same as HEAD. C5's End row reads the value only.
- **The Studio and purchase protection:** C8.

## 4. Claims
Run `bash b-round-454/claims-455.sh` (it also runs `tools/l58-check.py`). The planning output is `b-round-454/claims-455-planning-output.txt`. The output on a clone with the sketch applied is `b-round-454/claims-455-sketch-output.txt` (run with `S=/tmp/b455-claims`). Both stderr files are empty.

| Tag | Claim | Expected at planning |
|---|---|---|
| K1 | gate 454 status and commit | `published 2e26962` |
| K2 | store HEAD, dirty count | `2e26962 dirty=0` |
| K3 | `step=` in AudioPlayer.tsx | `1  step="0.01"\|` (volume only; the progress range has none) |
| K4 | `progressPercentage` count; `onKeyDown`/`aria-valuetext` count | `2 0` |
| K5 | width of the 4 player thumb rules in app.css | `width:12px;` × 4 |
| K6 | old assertion `var(--color-brand) 25%` in the test | `1` |
| K7 | patch sha OK; review exists; mutant lines; red lines | `…: OK review 14 13` |
| K8 | doc 298 exists | `0` |
| K9 | SpotlightLoader total and session key (for SABA-B-13, not this round) | `SPOTLIGHT_ENTRANCE_TOTAL_MS = 1150 1` |
| K10 | cited `b-round-454/` files exist (23) | `11111111111111111111111` |
| K11 | max lead per probe file (HEAD 1440, HEAD 1280, sketch 1440, sketch 1280) | `7.00 7.00 0.00 0.00` |
| K12 | per `recordings/` file with `type="range"`: ranges, `step=`, `accent-`, `linear-gradient` counts; root imports from recordings | `RecordingCatalogRow:r1,s1,a1,g0 SfxQuickEdit:r3,s5,a4,g0 SfxSceneBuilder:r4,s8,a5,g0 SfxVideoSync:r1,s2,a3,g0 root=0` |
| K13 | `.tsx` files painting `linear-gradient(to right` outside `arrangement/` and `studio/`; hits in AudioPlayer.tsx | `app/components/audio/AudioPlayer.tsx 2` |
| K14 | HEAD vs sketch volume max lead and hover lead (1440) | `5.00`, hover `3` / `0.00`, hover `0` |
| K15 | Alt+ArrowLeft with history, HEAD then sketch | both stay on `/products/pulse-loop-kit`; ct `9` / `9.4` |
| K16 | Alt+ArrowRight from 10.4, HEAD then sketch | `11` / `11.4` |
| K17 | L58 check; dispatched sha named in `sketch-review.md` | `L58 OK 3` |
| K18 | Biome diagnostics on the 2 code files (rule counts; `format` lines) | ` 5 lint/a11y/useButtonType 0` |

## 5. After this round
- **Round 456:** STORE-2b-3c-2. It covers the style-scan helper's fail-open forms with a golden test, A-R454-REVIEW-M-DEAD-UNCHECKED (the reachability check for the "dead" CSS allow-list), and the related Lows.
- **REGRESSION-2026-11-13:** it takes precedence if round 456 is planned on or after 2026-11-13.
- **Then:**
  1. **SABA-B-13** (the entrance minimum display time; `product-designer` consult and reference section first);
  2. **2b-3d**, then **2b-4** and **STORE-2c…5**;
  3. the **design-philosophy acceptance gate** (root, after STORE-2b);
  4. **ARCH-SPLIT**, **REVIEW-RECOMMENDATIONS** and **T12-ADVANCED**;
  5. **phase 2**, under the skip rule.
