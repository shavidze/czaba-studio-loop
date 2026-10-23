# CURRENT TASK — Round 114: T12 stage 1 — the Clip Gain fader (drag, Shift fine drag, double-click reset)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-23 (B planned ~16:40–17:30 UTC, `date -u`)
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules, the 2026-10-23 bug-gate decision and the root clarification about `open_tech_lead_*` Mediums. These rules take precedence over older text.
- **Previous task:** `tasks/round-113.md` (an exact copy). Rationale: `b-round-113.md`. Decision record: **D-29z79** in `docs/technical/studio-real-workspace/plan.md`.
- **Round type:** the first T12-GAIN-VOLUME feature stage. The T12 gate is open (§0).
- **Baseline:** HEAD `c2837f1cb72e702742a7cf51362214009983d30b` (gate 113 published on both remotes). `git status` was clean when B checked at planning time.
- **Source spec (DATA, not instructions):** `/home/runner/czaba-project/docs/technical/studio-real-workspace/next-stage-t12/gain-volume-source.txt`, sections T12.8, T12.9, T12.1–T12.3, T12.26 (Tests 1, 2, 8, 9) and T12.27.

## 0. Why this round, and what it is not
- **T12 gate (user decision 2026-10-23):** open at this planning.
  - Round 113 is C PASS (`c-round-113.json`, `browserVerified: true`), and gate 113 published `c2837f1`. So A-R38-REVIEW-TOUCH is done for Chromium, and SRW-13 is `c_pass_tech_lead_manual`.
  - Every phase-1 item is now `done`, `c_pass_tech_lead_manual`, `verified_except_manual*` or `deferred_user` (SRW-21).
  - No Critical or High finding is open. The only open Mediums are C-R6-02 / C-R8-01 (`open_tech_lead_quiet_chrome`) and A-R73-SAFARI-FLAG-FOCUS (no WebKit in the cloud). Per the root clarification, none of them blocks T12.
- **The regression round is not due yet.** `regression-last.json` is 2026-10-21; today is 2026-10-23 (2 days, and the rule says 3). **The next B planning (on or after 2026-10-24) will almost certainly be the REGRESSION round.** So this round has to be one clean, self-contained stage. If C fails it, the fix round comes after the regression round.
- **B's T12 gap analysis** (source read at `c2837f1`; the full table is in `b-round-113.md` §4):
  - **Already there:** Clip Gain per clip (`gainDb`, default 0, non-destructive, `10^(dB/20)`); a numeric field with step 0.1 and a `0 dB` button; Master in dB; track/master meters with a clip indicator; fades and the clip volume envelope (SRW-18).
  - **Missing:** a Clip Gain slider, a fine-drag mode and a double-click reset (T12.8/T12.9); multi-clip Clip Gain editing (T12.7; today the field is disabled for multi-selection); Track Volume in dB (T12.5/T12.24; today it is a linear 0–100 % fader); the waveform does not show the clip gain, and there is no waveform vertical zoom (T12.18/T12.19).
- **Stage order (D-29z79, dependency first):**
  1. **This round:** the single-clip Clip Gain fader.
  2. Multi-clip Clip Gain. It reuses this fader, and it needs that fader to exist first.
  3. Track Volume in dB, with Shift fine drag on the mixer faders.
  4. The waveform shows the clip gain, plus a view-only waveform vertical zoom.
  5. Later stages, in the T12.27 order.
- **Not in this round:** multi-clip, Track Volume dB, the waveform, Shift fine on the track/group/Master faders, envelopes, automation, crossfades, Utility. None of these is deferred; each has its own stage (`backlog.json` T12 `stages`).

## 1. B rulings for this round (D-29z79)
- **R1 — the control.** Add a `<input type="range">` Clip Gain fader inside the existing Clip Gain block of the detail panel (`data-testid="arrangement-detail-clip-gain-fader"`).
  - **Range:** `min = CLIP_GAIN_MIN_DB` (−60) and `max = CLIP_GAIN_MAX_DB` (+24). **Step 0.1:** that equals the storage precision of `normalizeClipGainDb`, so a typed value always lies on a step.
  - **Value:** `clip.gainDb ?? 0`. **aria-label:** `Clip Gain — fader`. **aria-valuetext:** the existing `formatMasterGainDb(value)`, so it reads `0.0 dB`, `+3.0 dB` or `−6.0 dB`.
  - **Tab order:** the number field, then the fader, then the `0 dB` button.
  - The numeric field and the `0 dB` button stay as they are.
- **R2 — drag.** Use the existing relative drag `useRelativeFaderDrag`. That gives the round-38 no-jump-on-press contract and the round-113 touch guard for free.
  - **Normal drag:** the full fader width covers 84 dB (`relativeFaderValue`, unchanged).
  - **Shift fine drag:** while `shiftKey` is held on a pointermove, the value per pixel is **10× smaller**.
  - **Pressing or releasing Shift mid-drag re-anchors** the drag at the current pointer x and the current previewed value. So the value does not jump at the toggle.
  - **Implementation:** an **opt-in** option on the hook (for example `fineDivisor?: number`). When the option is absent, every computed value stays the same (the `onPointerDown` body may be restructured, for example to make `startX`/`startValue` re-anchorable). Only the Clip Gain fader opts in this round, so the track, group and Master faders do not change.
- **R3 — history and audio.**
  - **During a drag:** the value previews live, both in the arrangement and in the audio. `gainDb` is excluded from `scheduleKey` (`ArrangementContext.tsx` l.507–510), so no audio source restarts.
  - **On pointerup / lost capture:** exactly **one** `Clip Gain` history entry.
  - **A press with no move** writes no entry.
  - **While another pointer gesture is active,** the press is refused with the existing gesture refusal text (same as the other faders).
  - **Keyboard** (native ArrowLeft/Right ±0.1 dB) follows the track Volume keyboard path exactly: preview on change, commit on keyup when no pointer gesture is active. A reports the resulting entry count per key press.
  - **Blur mid-drag** ends the drag the way track Volume does.
- **R4 — reset.**
  - **Double-click on the fader:** sets 0.0 dB with one entry. If the value is already 0.0, there is **no** entry.
  - The `0 dB` button keeps its behaviour, including its round-108 focus handoff.
  - No context menu. T12.8 says "double-click **or** Context Menu", and double-click alone meets it.
- **R5 — sync with the numeric field.**
  - **The field follows the fader.** It already re-reads `gainDb` (l.268–270).
  - **Typed but uncommitted text is committed first:** pressing the fader focuses it, the field blurs, and `commitClipGain('blur')` commits the text as its own entry. The drag then starts from the committed value. So *type −3 → drag* writes **two** entries. That is the intended order. Do not change `commitClipGain`.
  - **`readStoredValue` must read the live arrangement** (`getArrangement()` / the history ref), exactly as the track, Pan and Master faders already do (`ArrangementLane.tsx` l.368–371, `ArrangementMaster.tsx` l.136). It must **not** read render props. The blur commit happens synchronously inside `onPointerDown`, before any re-render; reading props would start the drag from the stale 0.0 and overwrite the −3.0.
- **R6 — disabled states.** The fader is disabled exactly when the field is: a video clip, a multi-selection, or no selection. It carries the same reason node (`title` + `aria-describedby`).
  - Multi-selection editing is **stage 2**. Do **not** enable it now.
- **R7 — context API.** Add preview, commit, begin-gesture and blur functions for clip gain, and pass them through `StudioWorkspace.tsx` to the panel. A picks **one** mechanism:
  - (a) a third `MixVolumeTarget` kind `'clip'` in the existing volume-target machine; or
  - (b) a small Master-style preview/commit pair.
  - **Hard constraint:** track, group and Master behaviour does not change, and their existing tests stay unchanged and green.
  - A states the choice and why. (The reviewer's ARCH-R81 trigger, "extract when a third target kind arrives", is a B/root checkpoint question, not a refactor in this round.)
- **R8 — layout.** At 1440×900 and 1280×720, with the detail panel open at its default height:
  - the fader and the `0 dB` button are fully visible;
  - there is no horizontal overflow in the Clip Gain block.
  - If the panel needs height, A uses the existing panel layout rules. No CSS file, Tailwind classes only, no hardcoded colours.
- **R9 — GATE113-S1 (Low, one-line grant).** In doc 097, change l.4 to „Round 113 — C PASS (`c-round-113.json`, gate 113 `c2837f1`).“. In the TODO, mark the TC rows done, and keep R38-T and TOUCH-DOUBLE-TAP-RESET open.

## 2. A — files you own (everything else is frozen)
| File | Change |
|---|---|
| `app/hooks/useRelativeFaderDrag.ts` | Opt-in fine mode (R2). The default path stays unchanged. |
| `app/contexts/ArrangementContext.tsx` | Clip-gain preview/commit/begin/blur (R3, R7), exposed on the context value. No other behaviour change. |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | The fader (R1, R4–R6, R8). |
| `app/components/arrangement/StudioWorkspace.tsx` | Pass the new props to `ArrangementDetailPanel` only. |
| `app/lib/arrangement/__tests__/clip-gain-fader.test.tsx` (**new**) | §3 |
| `docs/implementation/2026/quarter-IV/098-studio-clip-gain-fader.md` (**new**) | Implementation doc in Georgian, per `docs/implementation/TEMPLATE.md`. Status line on l.4: „Round 114 — C-ის შემოწმებას ელოდება (D-29z79; T12 ეტაპი 1).“ |
| `docs/implementation/2026/quarter-IV/097-studio-fader-touch-no-jump.md` | R9 only (the l.4 line and the TODO). |
| **Conditional:** `app/lib/arrangement/__tests__/{fader-focus-order,detail-panel-fit,detail-panel-reason,detail-panel-polish,self-disabling-focus,clip-gain}.test.tsx` | **Only** assertions that enumerate the Clip Gain block's controls, the detail panel's tab stops, or the block's measured layout, and only where the new fader truly changes them. List every changed line and the reason in the report. No other edits, and no weakening (no deleted assertion without a replacement of the same strength). If none needs a change, leave them untouched. |

- **A frozen test fails only because the new fader exists** (for example, a test that counts `input[type="range"]`, sliders or tab stops; B's grep found `querySelector('input[type="range"]')` first-match uses in `markers-ui` / `marker-edge-nav-ui`, and lane-scoped selectors in `fader-guards` / `track-layout`, which should be unaffected because the detail panel comes later in the DOM): **A stops and reports** the file, the line and the assertion. A does **not** edit it. B issues a grant or a ruling. The same applies if `npm run test:e2e:smoke` would change (A does not run it; the gate does).
- **Frozen:** `tmp/studio-real-loop/b-round-113-r114-tree-sha256.txt` holds 911 tracked files: every tracked file except the 11 paths above. A checks it at the start and at the end (`sha256sum -c --quiet`) and reports OK/FAIL. The two new files are the only allowed untracked files.
- **Expected end state:** `git status --short --untracked-files=all` shows the 4 app files and doc 097 as ` M`, any conditional test files A had to touch as ` M`, and the 2 new files as `??`.
- **Before editing, read:** `.claude/primitives-map.json`, then `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`; also `.claude/prompts/studio-feature.md`.
- **Project rules:** TypeScript strict, no `any`, no `@ts-ignore`, **no type assertions**, semicolons, Tailwind-first, no code comments.
- **Forbidden:** everything in `global_forbidden_files` / `global_forbidden_actions` of `backlog.json`, including the protected auth/purchase files. B checked their hashes at `c2837f1`:
  - `app/routes/studio.$productId.tsx` `fa2cf0bc`;
  - `app/routes/api.studio-token.ts` `13914809`;
  - `app/lib/auth.ts` `56f5b76f`;
  - `app/contexts/AuthContext.tsx` `bf9ee257`.
- **Also forbidden:** `model.ts`, `fader.ts`, `ArrangementLane.tsx`, `ArrangementMaster.tsx`, `ArrangementGroupHeader.tsx`, `ArrangementTransport.tsx`, and every existing test outside the conditional list. No commit, push, stash, checkout or deploy. No dev-server restarts. No `npm run check` (`--write`), and no `npm run format`.

## 3. A — tests and checks
**New `clip-gain-fader.test.tsx`.** Use the workspace harness pattern of `clip-gain.test.tsx` / `fader-click.test.tsx`, and mock `getBoundingClientRect` for the fader width.
- **CF1:** with a selected audio clip, the fader has min −60, max 24, step 0.1, value = `gainDb ?? 0`, aria-label `Clip Gain — fader` and aria-valuetext `0.0 dB`. At −6 it reads `−6.0 dB`, and at +3 `+3.0 dB`.
- **CF2:** a pointer drag of +25 px over 100 px moves the value by +21.0 dB (84 × 0.25), with **one** `Clip Gain` entry. Undo restores it. The field shows the same value.
- **CF3:** the same drag with `shiftKey: true` on every move gives +2.1 dB, with one entry.
- **CF4 (re-anchor):** +10 px without Shift (+8.4), then +10 px with Shift. The total is +9.2 ±0.1, and the move at the toggle changes the value by ≤ 0.9.
- **CF5:** a press with no move: the value is unchanged and there is no entry.
- **CF6:** a double-click from −6.0 gives 0.0 with one entry. A double-click at 0.0 writes no entry.
- **CF7:** ArrowRight on the focused fader (change + keyup) gives +0.1. Assert the entry count that R3 implies.
- **CF8:** the fader is disabled, with the matching reason id, for a video clip, a two-clip selection and no selection.
- **CF9:** type `-3` in the field without Enter, then a fader drag of +25 px. The result is two entries: `-3.0` committed first, then −3.0 + 21.0 = 18.0. The first Undo gives −3.0, the second gives 0.0.
- **CF10:** a press while another pointer gesture is active is refused: the refusal status shows, and there is no value change and no entry.
- **CF11 (must-not):** the music track **Volume** and **Master** drag with `shiftKey: true` gives the **same** value as without Shift. Only Clip Gain opts in.
- **CF12:** a drag during playback calls the graph's clip-gain setter and does **not** restart sources. Assert on the mocked graph handle or the existing schedule spy, following the existing playback tests.
- **Mutation proof** (in a scratch copy under `tmp/studio-real-loop/a-round-114/`, or a temporary local edit that you revert and report). Each of these must turn its test red:
  - (m1) ignoring Shift → CF3;
  - (m2) no re-anchor → CF4;
  - (m3) committing on every move → CF2 (entry count);
  - (m4) fine mode applied by default → CF11;
  - (m5) double-click at 0 writes an entry → CF6.
- **Honest limit:** jsdom has no native thumb. The real drag, Shift and layout are C's rows.

**Checks A runs (speed rules):**
- `npm run typecheck` and `npm run lint`.
- `npx vitest run` on `clip-gain-fader.test.tsx` **and** on `clip-gain`, `fader-click`, `fader-guards`, `fader-touch`, `fader-focus-order`, `pan-release-recovery`, `master-ui`, `track-group-mix-ui`, `self-disabling-focus`, `detail-panel-fit`, `detail-panel-reason`, `detail-panel-polish`, `pending-status`, `context-hygiene`, `gesture-guard`. All must be green. Report the counts.
- No full suite and no `npm run verify` (the gate runs them).
- **Code-reviewer:** 3+ files change, so ask the code-reviewer and pass its Architecture note to B in the report.

**A's report** (`a-round-114.md`):
- the start HEAD and status, and the R7 mechanism with the reason;
- the diff summary per file, and every conditional test line changed with its reason;
- the test names and counts, and the mutation results;
- typecheck/lint, and the frozen list at the start and at the end;
- the end status, the reviewer's score and notes, and any deviation.

## 4. C — rows (real browser, Playwright Chromium, a fresh context per session, 1440×900 and 1280×720)
**Layout:** music `demo-middle-east` @0 s, stems `demo-stem-pulse` @2 s and SFX `demo-soft-impact` @4 s, all added from the library at the insert marker. Snap off, Stop state, and the detail panel open at its default height. Select a clip by clicking its body.
- Read the value from the fader's `value` / `aria-valuetext` and from the field.
- Read the history from the Undo button's title and disabled state, and check it with Ctrl+Z as in round 113.
- Drag rows run 3 times at 1440 and once at 1280, unless the row says otherwise.

| ID | Action | Expected (PASS) |
|---|---|---|
| **CG-PRESENT** | Select the stems clip | The fader is visible, enabled, value 0, aria-valuetext `0.0 dB`. Tab order: field → fader → `0 dB`. |
| **CG-LAYOUT** (both viewports) | Measure the Clip Gain block | The fader and `0 dB` are fully inside the panel's visible box. The block's `scrollWidth ≤ clientWidth`. Screenshot. |
| **CG-NOJUMP** | A mouse press at 15 % from the far end, held 100 ms, released | The value is unchanged and the history is unchanged. |
| **CG-DRAG** | A mouse drag of +20 px | Δ = `20/w × 84` ± (0.1 + `84/w`). The field shows the same value. Exactly one new `Clip Gain` entry, and Ctrl+Z restores 0.0. |
| **CG-FINE** | The same drag with Shift held from before the press to after the release | Δ = `20/w × 8.4` ± (0.1 + `8.4/w`), and `Δ_fine ≤ Δ_drag / 5`. One entry. |
| **CG-FINE-TOGGLE** (1440 ×3) | +10 px, then Shift down, then +10 px, release | The total is `10/w × 84 + 10/w × 8.4` ± (0.2 + `84/w`). The value change across the toggle move is ≤ `84/w` + 0.1. |
| **CG-KEY** | Focus the fader and press ArrowRight ×3 | +0.3 dB. Report the entry count, which must equal A's CF7 rule. |
| **CG-DBL** | From −6.0 (set via the field), double-click the fader; then double-click again at 0.0 | 0.0 with one entry; the second double-click adds no entry. |
| **CG-SYNC** | Type `-3.5` in the field and press Enter | The fader value is −3.5 and aria-valuetext `−3.5 dB`. |
| **CG-PENDING-DRAG** (1440 ×1, 1280 ×1) | Type `-3` without Enter, then drag the fader +20 px | The final value is **−3.0 + Δ** (Δ as in CG-DRAG), not 0 + Δ. Two entries: the first Ctrl+Z returns to −3.0, the second to 0.0. |
| **CG-DISABLED** | A video clip (`beeps-6s-vp9-opus.webm`); stems + SFX multi-selected; nothing selected | The fader is disabled each time with the same reason text as the field. Multi-select stays disabled (stage 2). |
| **CG-TOUCH** (1440 ×1) | The round-113 CDP touch recipe on the Clip Gain fader | No change on touchStart; a relative change on moves; one entry. The Zoom positive control still jumps. |
| **CG-PLAY** (1440 ×3) | Play; drag the stems clip fader −40 px while it sounds; keep playing 1 s | The level drops audibly (track or master meter peak falls during the clip). **0** new `createBufferSource` calls between press and release (instrument `AudioContext.prototype.createBufferSource` before load). The playhead position is monotonic. |
| **G-T1** (T12.26 Test 1) | Export WAV of the stems clip alone (others muted), at Clip Gain 0.0 | Baseline file. Its peak and RMS are recorded. **Validity:** the baseline must have 0 samples at or over full scale (the export alert shows none and C's WAV scan agrees). Otherwise C uses the music clip instead. If no demo clip qualifies, C compares RMS over a non-clipping window and marks the peak ratio inconclusive (not PASS). This applies to G-T2/G-T8/G-NONDESTRUCT too. |
| **G-T2** (Test 2) | Set −6.0 dB with the fader or keyboard, then export again | Peak ratio and RMS ratio vs G-T1 = 0.5012 ±0.5 %. If the source peak is ≤ −4 dBFS, also run +3.0: ratio 1.4125 ±0.5 %, with no clipped samples. |
| **G-T8** (Test 8) | Stems at −6.0, music untouched; export both | The music clip's region (outside the stems span) matches its baseline within 1 LSB. |
| **G-T9** (Test 9) | Clip Gain 0.0 and a fade-out of 2 s on the stems clip; export | The last 10 ms of the clip are ≤ −60 dBFS RMS. The field and the fader still read 0.0. |
| **G-NONDESTRUCT** (T12.2) | Set −8.0, then reset with a fader double-click; export | Matches G-T1 within 1 LSB. |
| **NB-TRACK-SHIFT** | Music track Volume: drag −20 px with Shift held | The same Δ as round 113's MC-DRAG without Shift (Δ −0.19 ± 1 step at w 107). Track faders do not opt in. |
| **NB-MASTER** | Master drag −20 px | As round 113 MC-DRAG (Δ −13.5 dB ± 1 step), one entry. |
| **NB-RESET-BTN** | Focus `0 dB` from −6.0 and press Enter | 0.0, and focus moves to the field (round-108 contract). |
| **SOURCE-SCOPE** | `git status`, `git diff --stat c2837f1`, the frozen list | Only the §2 paths. Frozen list OK at start and end. Protected hashes unchanged. |
| **T114-TARGETED** | Re-run A's vitest file list (targeted files only, not the full suite) | Green, with the same counts as A's report. |
| **AN-REVIEW** | Read A's diff | Fine mode is opt-in. With the option undefined, the computed values are identical (CF11, NB-TRACK-SHIFT, NB-MASTER); the `onPointerDown` body may be restructured for the re-anchoring. `readStoredValue` reads the live arrangement; the R7 constraint holds; no type assertion; no CSS file; conditional test edits match A's list and do not weaken anything. |
| **PX-NET** | Every session | 0 requests to forbidden hosts (R2/r2-proxy/workers.dev, Shopify, Firebase auth, Brevo, studio-token), and 0 `Authorization` headers. |
| **REG-HYD** | Every session | 0 hydration errors, 0 `pageerror`, and no console errors besides the known cloud noise. |
| **G114-3** (alone, last) | `/studio-lab`; `/studio/middle-east`; `/api/studio-token?product=middle-east&file=stem1.wav` | The demo badge „დემო კოლექცია — ავტორიზაცია არ სჭირდება“. The product route shows "Sign in required", no workspace and 0 `audio[src]`. The token API returns **401**. The fake-Bearer 403 sub-check is **BLOCKED (backend unavailable in cloud)**. |
| **DOC-098 / DOC-097-L4** | Read both docs | Doc 098 follows the template, and its l.4 says the round is awaiting C, naming D-29z79. Doc 097 l.4 reads as in R9. |

- **Gate rows (not claimed by C):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Tolerances are fixed now:** no change after seeing a number. Harness validity: if the Zoom control does not jump in CG-TOUCH, that row is inconclusive, not PASS.
- **Neighbours that could break, and where they are checked:**
  - track and Master faders: NB-*, CF11;
  - the `0 dB` focus handoff: NB-RESET-BTN;
  - pending text: CG-PENDING-DRAG;
  - the detail panel layout: CG-LAYOUT;
  - audio scheduling: CG-PLAY.

## 5. Outcome
- **C PASS** → T12 stage 1 is `c_pass`. Next comes the REGRESSION round (if the next planning is on or after 2026-10-24); after that, T12 stage 2 (multi-clip Clip Gain, T12.7).
- **Any CG-DRAG / CG-FINE / CG-PLAY / G-T2 / G-NONDESTRUCT FAIL** → a new finding with C's severity. Data or audio-level errors are at least Medium. B writes the fix round after the regression round.
- **Layout-only FAIL** (CG-LAYOUT) → a finding rated by impact: hidden controls are Medium, cosmetic issues are Low.

## 6. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| A Gain slider in dB changes the clip gain | Live 12 Reference Manual §8.4.7 (saved by B on 2026-10-12, plan.md l.636; not re-opened this round, no web tool on this runner) | Confirmed (2026-10-12 capture) | A fader −60…+24 dB beside the existing field | CG-DRAG, G-T2 |
| Shift + drag gives finer resolution | Live 12 keyboard shortcuts §42.6 (https://www.ableton.com/en/live-manual/12/live-keyboard-shortcuts/, saved 2026-10-13, plan.md l.775) | Confirmed (2026-10-13 capture) for controls generally | 10× finer while Shift is held; re-anchored at the toggle (the toggle behaviour is a CZABA decision) | CG-FINE, CG-FINE-TOGGLE |
| Reset a parameter value: double-click or Delete | Live 12 §42.4 (same capture) | Confirmed for parameters; the Clip Gain slider is not named explicitly | Double-click → 0.0 dB. Delete on a focused range input stays a browser no-op (the existing deliberate difference, plan.md l.775) | CG-DBL |
| Multi-clip range display | §8.4.7 + §8.13 (2026-10-12) | Confirmed | Stage 2. This round keeps multi-select disabled | CG-DISABLED |
| No jump on press; touch guard | no Live source (D-29z3 is a CZABA decision; browser touch is not applicable) | not applicable | Inherited from rounds 38/113 | CG-NOJUMP, CG-TOUCH |

The T12 attachment's Ableton notes (`ableton-notes-source.txt`) were **not re-verified** in this round, so their status is **დაუდასტურებელი**. ABLETON-EXPERT-REVIEW covers them after T12.

C rates each row separately for "CZABA requirement met" and "Ableton correspondence" (დადასტურებული / შეგნებული განსხვავება / დაუდასტურებელი / არ ეხება).

## 7. Evidence and reporting
- **C writes:** `c-round-114.md` and `c-round-114.json`, with `taskStatus`, `passed`, `failed`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified` and `envStatus`. The evidence goes under `c-round-114/{tools,out,shots}/`.
- **Write the reports as you go.** A job can be stopped at its time limit.
- **Reporting rules:**
  - Report a new finding with a new ID and a severity.
  - `browserVerified` is false only if a browser row that **can** run here was not run.
  - The fake-Bearer 403 sub-check goes under `blocked` with "backend unavailable in cloud".
- Consult only the read-only agents in your list. No `store/` writes by C.
