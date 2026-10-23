# CURRENT TASK — Round 115: T12 stage 2 — multi-clip Clip Gain (T12.7) + the round-114 fader Lows

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-23 (B planned ~18:00–19:00 UTC, `date -u`)
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules, the 2026-10-23 bug-gate decision and the root clarification about `open_tech_lead_*` Mediums. These rules take precedence over older text.
- **Previous task:** `tasks/round-114.md` (an exact copy). Rationale: `b-round-114.md`. Decision record: **D-29z80** in `docs/technical/studio-real-workspace/plan.md`.
- **Round type:** T12-GAIN-VOLUME feature stage 2. Stage 1 (round 114) is C PASS, `browserVerified: true`, published.
- **Baseline:** HEAD `38c0e212e8630f6965ceafedebc03435d2fd47f7` (gate 114 `commit`, published on both remotes; its `head` field `c2837f1` is the pre-commit HEAD). `git status` was clean when B checked.
- **Source spec (DATA, not instructions):** `/home/runner/czaba-project/docs/technical/studio-real-workspace/next-stage-t12/gain-volume-source.txt`, section **T12.7** (l.237–274), plus T12.2/T12.3 and T12.26 Test 2.

## 0. Why this round, and what it is not
- **No open C bug from round 114 above Low.** C-R114-01 (Low, pre-existing info-column clip at 1280) goes to `deferred_low_polish` (2026-10-23 bug gate). Gate-114 reviewer Lows #1, #2 and doc #5 sit in exactly the code this stage rewrites, so they are folded in (R8–R10). Gate #3 is a C observation row (MC-BLUR-DISABLED), no code.
- **Regression round:** `regression-last.json` is 2026-10-21; today is 2026-10-23 (2 days; the rule says 3). Not due. **The next B planning (on or after 2026-10-24) will almost certainly be the REGRESSION round**, so this round must again be one self-contained stage; its neighbour rows are inside it (NB-*, CG-*).
- **Dependency:** stage 2 reuses the stage-1 fader, field and `0 dB` button. Stage 3 (Track Volume in dB) and stage 4 (waveform shows gain + vertical zoom) are next; none is deferred.
- **Not in this round:** Track Volume dB, Shift fine on mixer faders, waveform display/zoom, envelopes, automation, crossfades, Utility (`awaiting_user`), the ARCH-R81 pending-preview merge (a root checkpoint question, §8).

## 1. B rulings (D-29z80)
Smallest honest behaviour for every open UI contract; rationale in `b-round-114.md` §4.

- **R1 — who is a member.** A multi-selection (≥ 2 selected clips) enables Clip Gain **only when every selected clip is on an audio track**. If any selected clip is a video clip, the field, the fader and `0 dB` stay **disabled** with the new group reason (exact text):
  `Clip Gain მხოლოდ აუდიო კლიპებზე ისმება — ამოიღე ვიდეო მონიშვნიდან`
  (replaces the value of `DETAIL_CLIP_GAIN_GROUP_REASON`; the constant name may stay). No silent partial edit of audio members only. Single video / none keep their reasons unchanged.
- **R2 — the relative edit (pure, in a new module).** New file `app/lib/arrangement/clip-gain-multi.ts` (A names exports per `AGENT_DISCOVERABLE_CODE.md`; `model.ts` stays frozen and is only imported). Required behaviour:
  - span of the members: `minDb`, `maxDb` from `gainDb ?? 0`;
  - **shift:** `effectiveDelta = clamp(delta, CLIP_GAIN_MIN_DB − minDb, CLIP_GAIN_MAX_DB − maxDb)`; each member gets `normalizeClipGainDb(before + effectiveDelta)`. Because stored gains and the delta are on the 0.1 grid, **pairwise differences stay exact** (−6/−2/+1 shifted by +2 → −4/0/+3; by +30 → +17/+21/+24; by −70 → −60/−56/−53);
  - **set absolute:** every member gets `normalizeClipGainDb(value)`;
  - non-audio or unknown ids are ignored; an effective no-op returns the **same** arrangement object (no history entry downstream).
- **R3 — what the fader shows.** All members equal → exactly the stage-1 display (value, `aria-valuetext` `formatMasterGainDb`). Mixed → the thumb sits at **`maxDb`** (the anchor), and `aria-valuetext` is the range text. **Range text** (exact): `{formatMasterGainDb(minDb) without " dB"} … {formatMasterGainDb(maxDb)}`, e.g. `−6.0 … +1.0 dB`, `−60.0 … +24.0 dB`. It is rendered visibly in a node `data-testid="arrangement-detail-clip-gain-range"` **only** when mixed. No painted min/max indicator on the slider (would need custom CSS; the spec accepts the text form).
- **R4 — drag/keyboard in multi.** Same hook, same gesture contract as stage 1 (no jump on press, touch guard, Shift ×10 fine with re-anchor, one `Clip Gain` entry per drag, press-without-move = no entry, refusal during another gesture). `readStoredValue` = live `maxDb` of the members. **Every preview is computed from the gains at the start of the pending preview** (the "before" arrangement): `delta = value − beforeMax`, then R2 shift — never re-applied cumulatively to the live state. The hook stays unchanged (A may pass a computed `min`, e.g. `CLIP_GAIN_MIN_DB + (maxDb − minDb)`, so the hook's clamp equals R2's; R2 stays authoritative). Keyboard ArrowLeft/Right = ±0.1 delta for all members, committed as in stage 1 (one entry per key press, round-114 CG-KEY: 3 presses → 3 entries).
- **R5 — the numeric field in multi.** Equal values → shows the common value. Mixed → `value=""`, `aria-describedby` points at the range node (and `title` = range text). Typing a number and Enter/blur **sets every member to that absolute value** (one entry, R2 set). Escape restores the displayed text (`""` when mixed). The pending marker works as in stage 1 (any typed text ≠ displayed text). Typed-but-uncommitted text, then a fader press → the text commits first as its own entry, then the drag (two entries), exactly as stage 1 R5.
- **R6 — reset in multi.** Fader double-click and the `0 dB` button set **all** members to 0.0 with one entry; no entry when all are already 0.0. `0 dB` is disabled when all members are 0.0 (mirrors stage 1's `gainDb === undefined`). The round-108 focus handoff to the field stays.
- **R7 — status and audio.** After a multi commit the status names the count, e.g. `Clip Gain: 2 კლიპი — −4.0 … +3.0 dB.` (must contain `{N} კლიპი`; equal values show the single value). Live preview for every member during a drag; `gainDb` is outside `scheduleKey`, so **no source restart** (C counts `createBufferSource`). Undo/Redo restore all members at once.
- **R8 — GATE114-S1 (Low).** Clip ids are **captured at `beginGesture`** (single and multi): previews, commit and blur during an active gesture target the captured ids, even if the selection changes mid-drag. No repeated refusal status per move. When no gesture is active the current selection is used.
- **R9 — GATE114-S2 (Low).** The number field uses `DETAIL_CLIP_GAIN_STEP_DB` instead of the literal `0.1`.
- **R10 — GATE114-S5 (doc).** Doc 098: l.4 → „Round 114 — C PASS (`c-round-114.json`, gate 114 `38c0e21`).“; the file table says CF1–CF14.
- **R11 — context API.** Keep the stage-1 functions and their signatures (`setClipGain`, `previewClipGainFader`, `commitClipGainFader`, `beginClipGainFaderGesture`, `blurClipGainFader`) and their behaviour for one clip. Add the multi path by **one** mechanism of A's choice (new set-based functions, or the existing pending slot generalised to a member-set key). **Hard constraint:** track, group and Master volume behaviour and the stage-1 single-clip behaviour do not change; `clip-gain-fader.test.tsx` CF1–CF14 stay green with only the R1 grant edit (§2). A states the choice and why. Do not merge the Volume/Master/Clip Gain pending machines in this round (ARCH-R81 is a checkpoint question).
- **R12 — layout.** At 1440×900 and 1280×720, detail panel open at its default height, worst case `−60.0 … +24.0 dB`: the range text, the field, the fader and `0 dB` are fully inside the panel's visible box; **no new row** in the Clip Gain block (block height equal to the single-clip state ±1 px); block `scrollWidth ≤ clientWidth`. The range node may sit beside the label text or beside the field. The block may widen to at most `w-56` if needed (report it). Tailwind only, tokens only, no CSS file. If it cannot fit under these rules, A stops and reports with measurements; A does not add a row.

## 2. A — files you own (everything else is frozen)
| File | Change |
|---|---|
| `app/lib/arrangement/clip-gain-multi.ts` (**new**) | R2 pure helpers. |
| `app/contexts/ArrangementContext.tsx` | Multi preview/commit/begin/blur/set (R4–R7, R11); R8 capture. No other behaviour change. |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | R1, R3–R6, R8, R9, R12; `ArrangementDetailGroup` grows (member ids, `hasVideo`, `minDb`, `maxDb` — names A's). |
| `app/components/arrangement/StudioWorkspace.tsx` | The `detailGroup` memo computes the new fields; pass new props to `ArrangementDetailPanel`. Nothing else. |
| `app/lib/arrangement/__tests__/clip-gain-multi.test.tsx` (**new**) | §3 |
| `docs/implementation/2026/quarter-IV/099-studio-multi-clip-gain.md` (**new**) | Georgian, per `docs/implementation/TEMPLATE.md`. l.4: „Round 115 — C-ის შემოწმებას ელოდება (D-29z80; T12 ეტაპი 2).“ |
| `docs/implementation/2026/quarter-IV/098-studio-clip-gain-fader.md` | R10 only. |
| **Granted test edits (only these lines' intent):** | Each of these asserts "two **audio** clips → disabled with the old group reason". Replace the audio pair with a selection containing a video clip (same strength: disabled + exact new reason + linked `aria-describedby`/title), and update the reason constant to the R1 text. List every changed line in the report. |
| `app/lib/arrangement/__tests__/clip-gain-fader.test.tsx` | CF8 case l.429 `['m1','s1']` → e.g. `['m1','v1']`; l.34 constant text. |
| `app/lib/arrangement/__tests__/clip-gain.test.tsx` | l.782–783 `['a','c']` → e.g. `['a','v']`; l.59 constant text. |
| `app/lib/arrangement/__tests__/detail-panel-reason.test.tsx` | l.249 and l.336 `['m1','s1']` → a selection with `v1`; l.23 constant text. The middle-column placement assertions stay as they are for that selection. (l.328 only asserts the content node's scrollbar classes; no change needed.) |
| `app/lib/arrangement/__tests__/detail-panel-fit.test.tsx` | l.306 (F5) → a selection with `v1`; l.26 constant text. (l.329 asserts the group info column's lane names, not Clip Gain — not granted, must stay green as is.) |
| `app/lib/arrangement/__tests__/pending-status.test.tsx` | PM5 l.507 → a selection with `v1`. |

- **The enabled two-audio case** is asserted in the new test file (MG3+), not by weakening the granted files.
- **B checked the other tests** that touch the Clip Gain controls or multi-selection (`self-disabling-focus`, `fader-guards`, `fader-click`, `fader-focus-order`, `status-announcement-ui` SK3, `detail-panel-polish` l.394): none asserts "two audio clips → Clip Gain disabled"; `detail-panel-polish` l.394 selects two clips at 0 dB (equal → no range node). They are not granted and must stay green unchanged.
- **Any other frozen test fails** (for example a test that counts nodes in the detail panel and now sees the range node, or `status-announcement-ui`): **A stops and reports** file, line, assertion. A does not edit it; B rules. Same if `npm run test:e2e:smoke` would change (the gate runs it).
- **Frozen:** `tmp/studio-real-loop/b-round-114-r115-tree-sha256.txt`, 915 tracked files (every tracked file except the 9 tracked paths above). A runs `sha256sum -c --quiet` at the start and the end and reports OK/FAIL. The 3 new files are the only allowed untracked files.
- **Expected end state:** ` M` for the 3 app files, doc 098 and the granted tests A actually touched; `??` for the 3 new files.
- **Before editing, read:** `.claude/primitives-map.json`, `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `.claude/prompts/studio-feature.md`.
- **Project rules:** TypeScript strict, no `any`, no `@ts-ignore`, **no type assertions**, semicolons, Tailwind-first, no code comments.
- **Forbidden:** everything in `global_forbidden_files` / `global_forbidden_actions` of `backlog.json`, including the protected auth/purchase files (B checked at `38c0e21`): `app/routes/studio.$productId.tsx` `fa2cf0bc`, `app/routes/api.studio-token.ts` `13914809`, `app/lib/auth.ts` `56f5b76f`, `app/contexts/AuthContext.tsx` `bf9ee257`.
- **Also forbidden:** `model.ts`, `fader.ts`, `useRelativeFaderDrag.ts`, `ArrangementLane.tsx`, `ArrangementMaster.tsx`, `ArrangementGroupHeader.tsx`, `ArrangementTransport.tsx`, every other test. No commit, push, stash, checkout, deploy, dev-server restart, `npm run check` (`--write`) or `npm run format`.

## 3. A — tests and checks
**New `clip-gain-multi.test.tsx`** (pure tests + the workspace harness of `clip-gain-fader.test.tsx`; mock `getBoundingClientRect` for the fader width):
- **MG1 (pure shift):** −6/−2/+1 by +2 → −4/0/+3; by +30 → +17/+21/+24; by −70 → −60/−56/−53; differences exact; a video id and an unknown id are ignored; effective delta 0 (e.g. +5 when max is +24) returns the same object.
- **MG2 (pure set):** set −3 → all −3.0; set 0 → `gainDb` removed for all (stored only when ≠ 0, as `setClipGainDb`); all already at the value → same object.
- **MG3 (display):** two audio clips at −6/+1 selected → field `""`, range node text `−6.0 … +1.0 dB`, fader enabled, value `1` (max), `aria-valuetext` `−6.0 … +1.0 dB`, field `aria-describedby` = range node id. Both at −3 → field `-3.0`, no range node, `aria-valuetext` `−3.0 dB`.
- **MG4 (drag):** +25 px of 100 from −6/+1 → −6+21 / +1+21 → 15.0 / 22.0; **one** `Clip Gain` entry; one Undo restores −6.0/+1.0; Redo re-applies both. A two-move drag (+10 then +25 total) ends at the same values (no cumulative re-application).
- **MG5 (clamp):** drag far right (+200 px) → 17.0 / 24.0; far left → −60.0 / −53.0; difference 7.0 both times; then back to the start x in the same drag → −6.0 / +1.0.
- **MG6 (fine):** Shift drag +25 px → +2.1 each, one entry.
- **MG7 (keyboard):** ArrowRight (change + keyup) → +0.1 each, one entry per press.
- **MG8 (reset):** double-click from −6/+1 → 0/0, one entry; again → no entry. `0 dB` button: same, disabled when all 0; focus moves to the field when it held focus.
- **MG9 (field):** mixed, type `-3` + Enter → both −3.0, one entry. Escape after typing restores `""`. Type `-3` without Enter then drag +25 px → two entries (−3.0/−3.0, then 18.0/18.0); first Undo → −3.0/−3.0, second → −6.0/+1.0.
- **MG10 (video in selection):** `['m1','v1']` → field, fader and `0 dB` disabled with the exact R1 text, linked `aria-describedby` and `title`; a pointer drag and a double-click change nothing and write no entry.
- **MG11 (R8):** single clip: press on the fader, move, then `selectClip(other)` while held, move again, release → only the original clip changed; one entry; the status is not re-set to the refusal text on each move. Same for a two-clip member set switched to a single selection mid-drag.
- **MG12 (playback):** a multi drag during playback calls the graph's clip-gain setter for **both** ids and does not restart sources (existing schedule spy pattern, as CF12).
- **MG13 (must-not):** track Volume and Master drags give the same values as at baseline (reuse CF11's pattern); a single-clip selection still shows the stage-1 display and status.
- **Mutation proof** (scratch copy under `tmp/studio-real-loop/a-round-115/`, or a temporary local edit you revert and report). Each must turn its test red:
  - (m1) clamp each member independently instead of clamping the shared delta → MG1/MG5;
  - (m2) apply the delta to the live state on every preview (cumulative) → MG4 two-move case;
  - (m3) include video members → MG1/MG10;
  - (m4) commit on every move → MG4 entry count;
  - (m5) read the clip ids from the latest render during a gesture (revert R8) → MG11;
  - (m6) anchor at `minDb` instead of `maxDb` → MG3 (and MG5).
- **Honest limit:** jsdom has no native thumb, no layout. Real drag, Shift, layout and audio are C's rows.

**Checks A runs (speed rules):** `npm run typecheck`, `npm run lint`, and `npx vitest run` on `clip-gain-multi`, `clip-gain-fader`, `clip-gain`, `detail-panel-reason`, `detail-panel-fit`, `pending-status`, `fader-click`, `fader-guards`, `fader-touch`, `fader-focus-order`, `self-disabling-focus`, `status-announcement-ui`, `detail-panel-polish`, `master-ui`, `track-group-mix-ui`, `pan-release-recovery`, `context-hygiene`, `gesture-guard`. All green; report counts. No full suite, no `npm run verify` (gate). **Code-reviewer:** 3+ files change → ask it; pass its Architecture note to B.

**A's report** (`a-round-115.md`): start HEAD/status; the R11 mechanism and why; where the range node sits and the measured block width/height at both viewports (A's own Playwright probe is a sanity check, not C acceptance); diff summary per file; every granted test line changed and why; test names/counts and mutation results; typecheck/lint; frozen list start/end; end status; reviewer score, notes and Architecture note; deviations.

## 4. C — rows (real browser, Playwright Chromium, fresh context per session, 1440×900 and 1280×720)
**Layout:** music `demo-middle-east` @0 s, stems `demo-stem-pulse` @2 s, SFX `demo-soft-impact` @4 s, added from the library at the insert marker. Snap off, Stop state, detail panel open at default height. Set per-clip gains via the single-clip field (Enter), then multi-select stems + SFX by clicking the stems body and Shift/Ctrl-clicking the SFX body (record which modifier the app uses). Read values from each clip by selecting it alone (field) and from the multi display (range node, fader `value`, `aria-valuetext`). History from the Undo button title/disabled state and Ctrl+Z. Drag rows 3× at 1440 and 1× at 1280 unless stated. `w` = the fader's measured width.

| ID | Action | Expected (PASS) |
|---|---|---|
| **MC-PRESENT** | stems −6.0, SFX +1.0; multi-select both | Field, fader, `0 dB` enabled. Field empty; range node `−6.0 … +1.0 dB`; fader value 1, `aria-valuetext` `−6.0 … +1.0 dB`. Equal values (both −3.0) → field `-3.0`, no range node. |
| **MC-LAYOUT** (both viewports) | stems −60.0, SFX +24.0, multi-select | Range node, field, fader, `0 dB` fully inside the panel's visible box; block `scrollWidth ≤ clientWidth`; block height = single-clip state ±1 px. Screenshots. |
| **MC-DRAG** | from −6/+1, mouse drag +20 px | Each Δ = `20/w × 84` ± (0.1 + `84/w`), **same Δ for both**, difference exactly 7.0; exactly one `Clip Gain` entry; one Ctrl+Z restores −6.0/+1.0. |
| **MC-CLAMP** (1440 ×1, 1280 ×1) | from −6/+1 drag far right past the fader end; Ctrl+Z; drag far left | Right: SFX +24.0, stems +17.0. Left: stems −60.0, SFX −53.0. Difference 7.0 each time; one entry per drag. |
| **MC-FINE** | Shift held from before press to after release, +20 px | Each Δ = `20/w × 8.4` ± (0.1 + `8.4/w`), same for both, one entry. |
| **MC-KEY** | focus fader, ArrowRight ×3 | +0.3 each; 3 entries (round-114 rule). |
| **MC-DBL** | from −6/+1 double-click the fader; double-click again | 0.0/0.0, one entry; second adds none. |
| **MC-RESET-BTN** | from −6/+1 focus `0 dB`, Enter | 0.0/0.0, one entry, focus → field; `0 dB` then disabled. |
| **MC-FIELD** | mixed; type `-3` + Enter; then Escape test | Both −3.0, one entry. Typing then Escape restores the empty field, no entry. |
| **MC-PENDING-DRAG** (1440 ×1, 1280 ×1) | mixed; type `-3` without Enter; drag +20 px | Final each −3.0 + Δ; two entries; Ctrl+Z → −3.0/−3.0; Ctrl+Z → −6.0/+1.0. |
| **MC-VIDEO-MIX** | select stems + the video clip `beeps-6s-vp9-opus.webm` | Field, fader, `0 dB` disabled; reason text exactly R1; a drag and a double-click change nothing, no entry. |
| **MC-STATUS** | after MC-DRAG | Status contains `2 კლიპი`. |
| **MC-PLAY** (1440 ×3) | play; multi-drag stems+SFX −40 px while the stems clip sounds; keep playing 1 s | Level drops (track or master meter peak falls); **0** new `createBufferSource` between press and release (instrumented before load); playhead monotonic. |
| **MC-SELECT-MIDDRAG** (1440 ×1) | single stems clip: mouse down on fader, move +10 px, press Ctrl+A while held, move +10 px, release | Only the stems clip changed (SFX/music unchanged); one entry; status not flickering the refusal text. If Ctrl+A does not change the selection while the fader is focused, record it and mark the row **inconclusive** (MG11 covers it in jsdom), never PASS. |
| **MC-BLUR-DISABLED** (observe, GATE114-S3) | video clip present (as MC-VIDEO-MIX); single stems clip selected; focus the fader; hold ArrowRight (key repeat, no keyup) ~0.5 s; while still focused press **Ctrl+A** (all clips incl. video → the fader becomes disabled by R1 without a mouse blur); release; then make one unrelated edit and press Ctrl+Z | No value lost: the stems gain keeps the previewed value and Undo restores it in one step. Record when the `Clip Gain` entry appears. A lost value or missing entry is a finding (Medium); a late entry alone is the known Low. If Ctrl+A does not change the selection while the fader is focused, mark the row **inconclusive** (a mouse click blurs first and would pass trivially; do not substitute it). |
| **G-T2-MULTI** | baselines: export stems alone and SFX alone at 0.0 (others muted; G-T1 validity rule of round 114: no full-scale samples, else use music instead). Set stems −6.0, SFX −2.0; multi-select; drag **left** ~−20 px (no headroom dependency); read each stored value `g` alone; export each alone | Peak and RMS ratio vs its own baseline = `10^(g/20)` ±0.5 %; stored difference exactly 4.0; no clipped samples. (A positive case is optional and only if `baseline peak + g ≤ −1 dBFS`.) |
| **NB-SINGLE** | single stems clip: drag +20 px; double-click | Stage-1 behaviour unchanged (CG-DRAG / CG-DBL formulas of round 114). |
| **NB-TRACK-SHIFT / NB-MASTER** | as round 114 | Same values as round 114. |
| **SOURCE-SCOPE** | `git status`, `git diff --stat 38c0e21`, frozen list | Only §2 paths; frozen OK; protected hashes unchanged. |
| **T115-TARGETED** | re-run A's vitest list (targeted only) | Green, same counts as A. |
| **AN-REVIEW** | read A's diff | R2 in the new module (no `model.ts` change); previews computed from the before state; R8 capture; hook untouched; single-clip and track/Master paths unchanged; granted test edits match §2 and keep strength; no type assertion; no CSS file. |
| **PX-NET** | every session | 0 forbidden-host requests (R2/r2-proxy/workers.dev, Shopify, Firebase auth, Brevo, studio-token) and 0 `Authorization` headers. |
| **REG-HYD** | every session | 0 hydration errors, 0 `pageerror`, no console errors beyond the known cloud noise. |
| **G115-3** (alone, last) | `/studio-lab`; `/studio/middle-east`; `/api/studio-token?product=middle-east&file=stem1.wav` | Demo badge „დემო კოლექცია — ავტორიზაცია არ სჭირდება“; product route "Sign in required", no workspace, 0 `audio[src]`; token API **401**. Fake-Bearer 403 sub-check **BLOCKED (backend unavailable in cloud)**. |
| **DOC-099 / DOC-098** | read both | 099 follows the template, l.4 as §2; 098 l.4 and CF1–CF14 as R10. |

- **Gate rows (not claimed by C):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Tolerances are fixed now.** Harness validity: a G-T2-MULTI baseline with clipped samples is replaced per the rule or marked inconclusive.
- **Neighbours that could break and where they are checked:** single-clip fader (NB-SINGLE, MG13), track/Master (NB-*), detail layout (MC-LAYOUT), pending text (MC-PENDING-DRAG), scheduling (MC-PLAY), selection changes (MC-SELECT-MIDDRAG, MC-BLUR-DISABLED).

## 5. Outcome
- **C PASS** → T12 stage 2 `c_pass`. Next planning: the REGRESSION round (on or after 2026-10-24), then the bounded architecture checkpoint request (§8) and T12 stage 3.
- **MC-DRAG / MC-CLAMP / MC-PLAY / G-T2-MULTI / MC-VIDEO-MIX FAIL** → finding, at least Medium (data or audio level). **MC-LAYOUT:** hidden control = Medium, cosmetic = Low.

## 6. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Multi-clip selection shows the range of differing values | Live 12 Reference Manual §8.4.7 + §8.13 (B capture 2026-10-12, recorded in plan.md l.636; capture folder not on this runner; not re-opened, no web tool) | Confirmed (2026-10-12 record) | Range text `−6.0 … +1.0 dB` + `aria-valuetext`; no painted slider indicator | MC-PRESENT, MC-LAYOUT |
| Moving Gain keeps relative differences | User requirement T12.7 | Live behaviour **დაუდასტურებელი** | Shared delta, clamped so differences stay exact | MC-DRAG, MC-CLAMP |
| Typing a value with a multi-selection sets all | none found | **დაუდასტურებელი** | CZABA decision: absolute set for all members | MC-FIELD |
| Video in selection | none (CZABA single-video lane rule) | არ ეხება | Disabled with reason (no partial edit) | MC-VIDEO-MIX |
| Shift fine / double-click reset | §42.6 / §42.4 (2026-10-13 capture, plan.md l.775) | Confirmed for controls generally | Inherited from stage 1 | MC-FINE, MC-DBL |

`ableton-notes-source.txt` stays **დაუდასტურებელი**; ABLETON-EXPERT-REVIEW covers it after T12. C rates "CZABA requirement met" and "Ableton correspondence" separately.

## 7. Evidence and reporting
- **C writes:** `c-round-115.md` and `c-round-115.json` (`taskStatus`, `passed`, `failed`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`), evidence under `c-round-115/{tools,out,shots}/`. Write as you go.
- New findings get a new ID and a severity. `browserVerified` is false only if a browser row that **can** run here was not run. Inconclusive rows are listed as such, never under `passed`.
- Consult only the read-only agents in your list. No `store/` writes by C.

## 8. Root / architecture (not A's work)
Both round-114 reviewers name the post-stage-2 point for a bounded checkpoint: merge the three pending-preview machines (Volume / Master / Clip Gain) into one tagged `pendingPreviewRef` + one `flushPendingPreviews()` in `ArrangementContext` (ARCH-R81 trigger). Recorded as addendum (z) of `b-round-91-checkpoint-request.md`; the request goes to root at the next planning after this stage closes. It does not change this round's ownership.
