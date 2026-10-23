# CURRENT TASK — Round 118: T12 stage 3b — group Volume in dB, and Shift fine drag on the track, group and Master Volume faders

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-23 (B planned ~21:05–21:50 UTC, `date -u`)
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules, the 2026-10-23 bug-gate decision and the root clarification. These rules take precedence over older text.
- **Previous task:** `tasks/round-117.md` (exact copy, `cmp` OK). Rationale: `b-round-117.md`. Decision record: **D-29z83** in `docs/technical/studio-real-workspace/plan.md`.
- **Round type:** one feature stage (T12 stage 3b), plus one doc fix-up that the gate-117 reviewer asked for (GATE117-S1).
- **Baseline: clean commit `9cb820b6f7e5f9f44d1c651954d30ebf4f83be9f`** (gate 117 `published`, rounds 116 + 117, both remotes). `git status --porcelain` is empty.
  - Frozen list: `tmp/studio-real-loop/b-round-117-r118-tree-sha256.txt`, 922 entries. That is every tracked file except the 8 granted tracked files in §2.
  - `sha256sum -c` gave OK at planning.

## 0. Why this round
- Round 117 C PASS + gate 117 published, so **T12 stage 3a is `c_pass_published`**. C-R116-01 and GATE-116-SKIPPED are closed.
- **The regression round is not due at this planning.** `regression-last.json` = 2026-10-21. B planned at 2026-10-23 ~21:05 UTC, which is 2 days; the rule needs 3 or more. The round-116 b-next said "the next planning on or after 2026-10-24 is the regression round", and that still holds. **The round 119 planning (on or after 2026-10-24) is the REGRESSION round.** Stage 4 follows it.
- No Critical, High or Medium finding is open and reproducible in the cloud. C-R6-02, C-R8-01 and A-R73-SAFARI-FLAG-FOCUS are Tech-Lead-only by the root clarification. The next scope in dependency order is therefore T12 V1 stage 3b.
- **Why one round, not two:** B's whole-tree grep (§2.1) shows that the pins this change inverts sit only in:
  - `track-group-mix-ui` (group lines);
  - `track-volume-db` TV11;
  - `clip-gain-fader` CF11.
  Every one of them is listed below. The Shift code change is one option per fader.

## 1. What changes (user-visible)
| # | Behaviour now | Behaviour after round 118 |
|---|---|---|
| 1 | The group row Volume fader is linear 0…1 (step 0.01), and its title/valuetext are `%` | It is in **dB**, the same scale as the lane fader: `min -60`, `max 0`, `step 0.1`. The slider minimum stores exactly `0` (`−∞ dB`). The title is `Volume <formatTrackVolumeDb>` (e.g. `Volume −15.0 dB`), and valuetext is `formatTrackVolumeDb` (e.g. `+0.0 dB`, `−∞ dB`). |
| 2 | Shift + drag on a lane, video lane, group or Master Volume fader gives the same value as a plain drag (pinned by CF11 / TV11) | Shift + drag is **10× finer** on those faders, the same as Clip Gain (stage 1, `fineDivisor 10`). Pressing or releasing Shift mid-drag re-anchors at the current value with no jump (existing hook behaviour). |
| 3 | Pan: Shift = plain | **Unchanged** (R5) |

## 2. A — files you own (everything else is frozen)
| File | Change |
|---|---|
| `app/components/arrangement/ArrangementGroupHeader.tsx` | R1–R4: group fader in dB, exact-return start capture, fine divisor |
| `app/components/arrangement/ArrangementLane.tsx` | R4 **only**: add the fine divisor option to `volumeFaderDrag` (one option line + import). Pan, readout and everything else unchanged |
| `app/components/arrangement/ArrangementMaster.tsx` | R4 **only**: add the fine divisor option to `masterFaderDrag` (one option line + import) |
| `app/lib/arrangement/fader.ts` | R4: add `export const FADER_SHIFT_FINE_DIVISOR = 10;`. `relativeFaderValue` unchanged |
| `app/lib/arrangement/__tests__/track-group-mix-ui.test.tsx` | §2.1 table only (the `trackVolumeFromDb` import already exists) |
| `app/lib/arrangement/__tests__/track-volume-db.test.tsx` | §2.1 table only (TV11) |
| `app/lib/arrangement/__tests__/clip-gain-fader.test.tsx` | §2.1 table only (CF11) |
| `app/lib/arrangement/__tests__/group-volume-db.test.tsx` | **new**: §3.2 tests GV1–GV9 |
| `docs/implementation/2026/quarter-IV/100-studio-track-volume-db.md` | GATE117-S1 only: l.4 status → „Round 117 — C PASS (`c-round-117.json`), გამოქვეყნდა `9cb820b`“; l.56 problem → mark it solved by C-R116-01 (round 117); l.70 → drop the `track-group-mix-ui` part and keep the `+0.0`/`0.0 dB` part (now the deferred Low LANE-MASTER-ZERO-SIGN) |
| `docs/implementation/2026/quarter-IV/101-studio-group-volume-db-shift-fine.md` | **new** implementation doc (TEMPLATE.md sections, Georgian) |

- `ArrangementDetailPanel.tsx` keeps its local `DETAIL_CLIP_GAIN_FINE_DIVISOR` and is frozen. Moving it to the shared constant is a nit for a later owner (GATE118-NIT-FINE-CONST). Do not edit it.
- **Expected end state:**
  - ` M` for the tracked files above that A actually changes, and `??` for the 2 new files. Nothing else.
  - `sha256sum -c --quiet b-round-117-r118-tree-sha256.txt` OK at the start and at the end.
- **Protected (unchanged; `git diff 9cb820b` on them empty):**
  - `app/routes/studio.$productId.tsx` `fa2cf0bc`
  - `app/routes/api.studio-token.ts` `13914809`
  - `app/lib/auth.ts` `56f5b76f`
  - `app/contexts/AuthContext.tsx` `bf9ee257`
  - everything in `global_forbidden_files` / `global_forbidden_actions` of `backlog.json`.
- **Unchanged and still linear:** context, model, groups, schedule, graph and export.
  - `previewGroupVolume` stores the raw float, and `setTrackGroupMix` only clamps it to [0, 1] (`groups.ts` l.121–124, B read).
  - So `trackVolumeFromDb(x)` is stored bitwise, and the slider minimum stores exactly `0`.
- **Forbidden actions:** commit, push, stash, checkout, reset, deploy, dev-server restart, `npm install`, `npm run check` (`--write`), `npm run format`.
- **Use the Edit tool for edits,** so the primitives hook fires.
- **Before editing, read:**
  - `.claude/primitives-map.json` and `.claude/prompts/studio-feature.md`;
  - `AUDIO_ARCHITECTURE.md`, `FORWARDREF_COMPONENT.md`, `AGENT_DISCOVERABLE_CODE.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`;
  - `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
  - `docs/implementation/TEMPLATE.md`.
- **Project rules:** TypeScript strict, no `any`, no `@ts-ignore`, no `as T` casts, semicolons, no code comments, Tailwind tokens only.

### 2.1 Granted test edits (exact, scale-only; line numbers are from `9cb820b`)
- `F(x)` means `trackVolumeFromDb(x)`.
- Everything not listed stays unchanged: every other line, title, step, pixel delta and pointer id, and the `expect(` / `it(` counts (except where a row says otherwise).
- Matchers stay exact (`toBe` / `toEqual`). No `toBeCloseTo`.

**`track-group-mix-ui.test.tsx`** (group-fader lines only; the lane and context lines are already dB or context-driven and stay):
| Line | Test | Now | New | Why |
|---|---|---|---|---|
| 410 | UM1 | `toEqual(['0', '1', '0.01'])` | `toEqual(['-60', '0', '0.1'])` | dB range |
| 412 | UM1 | `toBe('100%')` | `toBe('+0.0 dB')` | `formatTrackVolumeDb(1)` |
| 413 | UM1 | `toBe('Volume 100%')` | `toBe('Volume +0.0 dB')` | title |
| 463 | UM3 | `toBe(0.75)` | `toBe(F(-15))` | 0 dB − 25/100 × 60 |
| 469 | UM3 | `'0.74'` | `'-2.6'` | 20·log10 0.74 = −2.62 |
| 470 | UM3 | `toBe(0.74)` | `toBe(F(-2.6))` | — |
| 471 | UM3 | `toBe('74%')` | `toBe('−2.6 dB')` (U+2212) | — |
| 472 | UM3 | `toBe('Volume 74%')` | `toBe('Volume −2.6 dB')` | — |
| 474 | UM3 | `toBe(0.75)` | `toBe(F(-15))` | Undo back to the drag value |
| 478 | UM3 | `'0.6'` | `'-4.4'` | 0.6 → −4.44 |
| 482, 486 | UM3 | `toBe(0.6)` (group) | `toBe(F(-4.4))` | — |
| 488 | UM3 | `toBe(0.74)` | `toBe(F(-2.6))` | — |
| 493 | UM3 | `'0.4'` | `'-8'` | 0.4 → −7.96 |
| 495, 504, 510, 521, 524 | UM3 | `toBe(0.4)` (group) | `toBe(F(-8))` | cancel and Undo restore the exact stored value |
| 497 | UM3 | `toBe(0.6)` (group) | `toBe(F(-4.4))` | — |
| 502 | UM3 | `toBe(0.2)` | `toBe(F(-20))` | −8 dB − 20/100 × 60 |
| 571 | UM5 | `keyboardFader(groupFader(…), '0.5')` | `'-6'` | — |
| 573 | UM5 | `toBe(0.5)` (group) | `toBe(F(-6))` | — |
| 579 | UM5 | `stems: trackVolumeFromDb(-6) * 0.5,` | `stems: trackVolumeFromDb(-6) * trackVolumeFromDb(-6),` | same `reduce` order: `track.volume × G1 × G2 (= 1)` |
| 580 | UM5 | `sfx: 0.5,` | `sfx: trackVolumeFromDb(-6),` | `1 × G1 × 1` |
| 677 | UM9 | `'0.3'` | `'-10.5'` | 0.3 → −10.46 |
| 684 | UM9 | `toBe(0.3)` (group) | `toBe(F(-10.5))` | — |

- **Unchanged on purpose:**
  - l.513–518 and l.520 (`previewTrackVolume('stems', 0.6)`, `previewGroupVolume(groupId, 0.7)` and their `0.6`/`0.7` expectations): these are context-driven.
  - l.414 `min-w-12` and l.415–417 (the row adds no text, 28 px): R2 adds no visible text.
  - UM6 l.594 and UM9 l.692: they assert no group value.
- **STOP (exact match):** if UM5 l.579/l.580 do not match exactly (for example because a fake stores float32), A stops and reports the received value. A does not loosen the matcher.

**`track-volume-db.test.tsx` — TV11** (l.512–545):
| Line | Now | New |
|---|---|---|
| 512 | title `'TV11 must-not: group fader keeps %, Master keeps its drag, context previews stay linear, Shift equals plain'` | `'TV11: group fader in dB, Master keeps its drag, context previews stay linear, Shift is ten times finer'` |
| 528 | `expect(storedVolume(api, 'music')).toBe(plain);` | `expect(storedVolume(api, 'music')).toBe(F(S));`, where `S` is a literal: the plain drag's anchor dB − 1.2 (−20 px × 60 dB / 1000 px). Also add `expect(storedVolume(api, 'music')).not.toBe(plain);` (+1 `expect(`) |
| 535 | `toBe(0.75)` | `toBe(F(-15))` |
| 536 | `toBe('75%')` | `toBe('−15.0 dB')` |
| 537 | `toBe('Volume 75%')` | `toBe('Volume −15.0 dB')` |

- **TV11 pre-check, before editing (record, then continue):**
  - **The puzzle:** l.517–519 show the stored 0.72, slider `-2.9`, readout `−2.9`. But l.527 pins the plain −20 px result at `F(-16.4)`, which is −12 dB from **−4.4** (the fixture's 0.6). l.538 asserts the music readout `−4.4` after both drags are undone. Both suggest the drags saw 0.6, not the committed 0.72. The only action in between is the Master drag (l.520).
  - **A triangulates three values,** with a temporary local log that A removes and verifies by sha:
    1. `storedVolume(api, 'music')` right after the Master drag (after l.522);
    2. the lane slider `value` and readout at that moment;
    3. the anchor the plain drag uses (`readStoredValue()` at press).
  - **(a)** All three are −2.9 / 0.72, so B misread something. A writes `S` from that anchor and explains why l.527/l.538 hold.
  - **(b)** They differ, for example the Master gesture reverts a preceding committed lane volume, or the anchor is stale against the display. A does **not** stop and changes no app code for it:
    - A writes l.528 as `F(observed anchor − 1.2)` (still a valid Shift-fine pin) and keeps the `not.toBe(plain)` line;
    - A files the finding **A-R118-TV11-ANCHOR** in `a-round-118.md`, with the three observed values, the file and line, and a suggested severity (Medium if a committed value is lost);
    - A completes stage 3b. B schedules the fix in the next planning.
  - C repeats the triangulation in the browser as row **TV-ANCHOR** (§5).

**`clip-gain-fader.test.tsx` — CF11** (l.485–503; the fixture music volume 0.6 = −4.4 dB):
| Line | Now | New |
|---|---|---|
| 485 | title `'CF11 must-not: music Volume and Master give the same value with Shift as without'` | `'CF11: Shift makes music Volume and Master ten times finer'` |
| 498–500 | fine music `toBe(coarseVolume)` | `toBe(F(-5.9))` (−4.4 − 25 × 60 / 1000) |
| 501 | fine master `toBe(coarseMaster)` | `toBe(-1.2)` (−24 × 66 / 1320) |

- l.494–497, l.502 (undo chain) and the coarse half stay unchanged.
- **STOP:** if the received fine values differ from the formula, A reports the received values. A does not edit the expectations to match them.

## 3. A — behaviour rules and tests

### 3.1 Rules (D-29z83)
- **R1 — group fader scale.**
  - `value={trackVolumeSliderDb(volume)}`, with `min`/`max`/`step` = `TRACK_VOLUME_DB_MIN`/`MAX`/`STEP`.
  - `onChange` → `previewGroupVolume(group.id, trackVolumeFromDb(Number(value)))`.
  - Double-click → `previewGroupVolume(group.id, trackVolumeFromDb(TRACK_VOLUME_DB_DEFAULT))`, then commit. `F(0) === 1`, so the stored field is removed, as it is today.
  - The hook gets `min`/`max`/`step` in dB, and `readStoredValue` returns `trackVolumeSliderDb(stored)`.
  - The unused `TRACK_GROUP_VOLUME_STEP` / `TRACK_GROUP_VOLUME_DEFAULT` constants are removed.
- **R2 — group texts.**
  - `aria-valuetext={formatTrackVolumeDb(volume)}` and ``title={`Volume ${formatTrackVolumeDb(volume)}`}``.
  - **No visible readout is added** to the group row. B's rationale:
    - The SRW-17 contract (UM1) is that the group row adds no text and stays 28 px tall.
    - In the 224 px header the name has about 82 px at depth 0 today. A `w-10` readout would cut that to about 40 px at depth 0 and about 16 px at depth 2.
    - The group row never had a visible `%` readout. The dB value takes exactly the places the `%` had: the title and valuetext.
    - A visible group readout is a layout change. It is recorded as the signal **GROUP-VOLUME-VISIBLE-READOUT** for DESIGN-UX-REVIEW, not dropped.
- **R3 — exact return (the second copy of the lane pattern).**
  - Copy the lane's `volumeGestureStartRef` pattern (`ArrangementLane.tsx` l.395–415) into the group header.
  - At `beginGesture`, capture `{ volume, sliderDb }`. In `previewValue`, use `start.volume` when `start.sliderDb === sliderDb`; otherwise use `trackVolumeFromDb(sliderDb)`.
  - Result: a press without movement, or a move back to the start, keeps a non-grid stored value (for example a context-set 0.72) bitwise and writes no entry.
  - **Not implemented in this round:** the unanswered checkpoint addendum (ab) and the gate-117 Architecture note (a stored ↔ slider mapping in the hook). Do not change the hook's public shape.
- **R4 — Shift fine.**
  - Add `fineDivisor: FADER_SHIFT_FINE_DIVISOR` to `volumeFaderDrag` (lane; this covers the video lane too), `groupVolumeFaderDrag` and `masterFaderDrag`.
  - `useRelativeFaderDrag` already re-anchors when Shift changes mid-drag (l.80–85). It is frozen, because it is not in the table.
  - Keyboard steps stay 0.1 dB (lane, group) and the Master step is unchanged. Shift + Arrow is native browser behaviour and is not changed.
- **R5 — Pan stays without fine (must-not).**
  - Live §42.6 applies Shift to any dragged control, but T12 stage 3b is scoped to Volume faders.
  - Pan's ±50 integer steps make ×10 a different design question.
  - Recorded as the signal **PAN-SHIFT-FINE**.
- **R6 — audio path unchanged.** A group dB change previews live through the existing `previewVolumeTarget` path, with no new `createBufferSource`. Export follows the stored linear value.

### 3.2 New test file `group-volume-db.test.tsx` (meaningful, exact)
| ID | Asserts |
|---|---|
| GV1 | At mount, after Ctrl+G on stems + SFX: group fader `min -60`, `max 0`, `step 0.1`, `value '0'`, valuetext `+0.0 dB`, title `Volume +0.0 dB`. The row's text is the name only. |
| GV2 | Drag −25 px (w 100): stored `F(-15)` exactly, one `Volume` entry. Undo → field `undefined`. Redo → `F(-15)`. |
| GV3 | Drag past the left end: stored exactly `0`, valuetext `−∞ dB`, live member gains `stems 0`, `sfx 0`, `music 1`. Undo restores the previous value. |
| GV4 | Context-set group 0.72. Then (i) a press with no move, and separately (ii) a move away and back to the start px: stored stays `0.72` bitwise and `undoLabel` is unchanged. |
| GV5 | Keyboard: focus, ArrowDown + change `'-0.1'` + keyUp → `F(-0.1)`, one entry per key-up. Double-click → `undefined`, one entry. |
| GV6 | Shift drag −25 px on the group → `F(-1.5)`. Mid-drag Shift toggle, one pointer: a plain −10 px move gives `F(-6)`; then a **zero-delta** move at the same X with Shift held leaves `F(-6)` (no jump, no new preview); then, with Shift still held, a further −10 px gives `F(-6.6)`. |
| GV7 | Shift −20 px on the **video** lane Volume → `F(-1.2)` from 0 dB. Master Shift is covered by CF11. |
| GV8 | During playback, a group drag adds 0 `createBufferSource` calls, and the live gains equal `storedGains` (product rule). |
| GV9 | Must-not: a Pan Shift drag gives the same value as a plain drag. A Clip Gain Shift drag is still /10 (one assertion each). |

### 3.3 Mutations
A runs each one; each must turn the named test red. Restore after each and verify by sha256.
- **m1:** remove `fineDivisor` from the group hook call → GV6 red.
- **m2:** drop the R3 start capture (always `F(sliderDb)`) → GV4 red.
- **m3:** the group `onChange` writes `Number(value)` without the conversion → GV5 red.
- **m4:** remove `fineDivisor` from the lane → GV7 and TV11 red.

## 4. A — checks (speed rules)
- `npm run typecheck`, `npm run lint`, and a read-only `npx biome check` on every changed or new file.
- `npx vitest run` on these files: `group-volume-db`, `track-volume-db`, `track-group-mix-ui`, `clip-gain-fader`, `clip-gain-multi`, `fader-touch`, `fader-click`, `fader-guards`, `fader-focus-order`, `pan-release-recovery`, `gesture-guard`, `context-hygiene`, `pending-status`, `track-group-collapse-ui`, `track-groups-ui`, `track-group-mix`, `groups`, `master-ui`, `meter-ui`, `track-pan`, `track-layout`, `clip-gain`, `status-announcement-ui`, `self-disabling-focus`, `render-budget`, `fader`.
  - Every file in the list that exists must be green.
  - Report the counts, the TV11 pre-check outcome (a or b) and the m1–m4 results.
- No full suite and no `npm run verify` (the gate runs them).
- **The code-reviewer is required** (3+ files). Pass its Architecture note to B.
- **A's report `a-round-118.md`:**
  - start HEAD and frozen OK;
  - every changed test line as `old → new`;
  - `expect(`/`it(` counts before and after, per granted file;
  - the new test count;
  - the mutation results;
  - typecheck and lint results;
  - the reviewer verdict and Architecture note;
  - frozen OK at the end, and the end `git status`;
  - deviations;
  - the TV11 pre-check outcome.
- **A stops and reports (no edit; B rules) if:**
  - a needed test edit is outside §2.1;
  - an exact match fails;
  - another targeted test is red;

## 5. C — rows
Use real Playwright Chromium with a fresh context per session, at 1440×900 and 1280×720.
- **Setup** (the same as round 117): `demo-middle-east` on music @0, `demo-stem-pulse` on stems @2 s and `demo-soft-impact` on SFX @4 s, all from the library at the insert marker; Snap off; Stop state.
- **Group:** select the stems and SFX lanes, then Ctrl+G (`ჯგუფი 1`).
- **Shift drags:** a real mouse with `keyboard.down('Shift')` (the round-114 CG method).

| ID | Action | Expected (PASS) |
|---|---|---|
| **T118-TARGETED** | A's vitest list (§4) | Green, with the same counts as A |
| **AN-REVIEW** | `git diff 9cb820b` on the 3 granted tests and doc 100; read `group-volume-db.test.tsx` and doc 101 | Only §2.1 lines change: TV11 gains one `expect(`, the other counts are unchanged. Exact matchers only. GV1–GV9 exist and assert §3.2. Doc 100 changed only at l.4, l.56 and l.70 |
| **SOURCE-SCOPE** | `git status`, `sha256sum -c b-round-117-r118-tree-sha256.txt`, protected hashes | The §2 end state exactly. Frozen list OK. Protected hashes unchanged and `git diff 9cb820b` on them empty. The Lane and Master diffs are only the fine option + import |
| **GV-PRESENT** (both viewports) | load, then group | Group fader `-60/0/0.1`, value `0`, valuetext `+0.0 dB`, title `Volume +0.0 dB`. Row height 28 px, no new visible text, fader 48 px wide. The name button is not under 40 px wide at depth 0 |
| **GV-DRAG** (both) | group fader −20 px, then Ctrl+Z | Δ = `20/w × 60` ± (0.1 + `60/w`) dB, read from valuetext. One `Volume` entry (sentinel method). Ctrl+Z → `+0.0 dB`. The member lane readouts stay `+0.0` |
| **GV-INF** (both) | drag the group fader far left | valuetext `−∞ dB`. The stems/SFX meters stay silent during play |
| **SH-LANE / SH-GROUP / SH-MASTER** (both) | the same −40 px drag: plain, then Undo, then with Shift held from the press | Shift Δ = plain Δ / 10 ± one step (0.1 dB for lane and group; the Master step for Master). One entry each. Measure the music lane, the group and the Master |
| **SH-MID** (1440) | lane: plain −20 px, press Shift, −20 px more, release | No jump at the Shift press: at most one step between the last plain value and the first Shift value. The second half moves about 1/10 as far |
| **NB-PAN / NB-CLIP** (1440) | Pan with Shift vs plain; Clip Gain with Shift | Pan: equal. Clip Gain: still /10 |
| **G-GROUP-T3** (1440) | The round-116 G-T3 method, applied to the group. **Mute the music lane** (lane M) so only the group members sound. Export WAV with the group at 0 dB, then at −6.0 dB (ArrowLeft ×60 from `+0.0 dB` on the focused group fader; read `−6.0 dB`). **Control pair:** unmute music, press group **Mute** (UM2), export at group 0 dB and at −6.0 dB | Members: peak and RMS ratio (−6 vs 0) = `10^(−6/20)` = **0.501187 ± 0.5 %**. Control (music alone, group muted): ratio **1.000 ± 0.5 %** |
| **G-GROUP-INF** (1440) | Music lane muted, group at `−∞` (far left; read `−∞ dB`), export | Every sample exactly 0 (0 LSB). A residual with peak ≤ −120 dBFS is an observation for B (candidate Low). Above −120 dBFS = FAIL (Medium). The round-116 G-INF rule |
| **GV-PLAY** (1440) | play, and drag the group fader during play | The live drop shows on the meter. 0 new `createBufferSource` (the round-116 TV-PLAY method). The position keeps advancing |
| **G118-3** (alone, last) | `/studio-lab`; `/studio/middle-east`; `/api/studio-token?product=middle-east&file=stem1.wav` | Demo badge „დემო კოლექცია — ავტორიზაცია არ სჭირდება“. The product route shows "Sign in required", no workspace and 0 `audio[src]`. The token API returns **401**. Fake-Bearer 403: **BLOCKED (backend unavailable in cloud)** |
| **PX-NET / REG-HYD** | every session | 0 forbidden-host requests, 0 `Authorization` headers, 0 hydration errors, 0 `pageerror`, no console errors beyond the known cloud noise |
| **TV-ANCHOR** (1440) | Music lane: ArrowLeft ×29 on the focused lane fader from `+0.0` (read `−2.9 dB`), Tab away (commit). Drag the Master −24 px and release. Read the music readout. Then a plain −20 px drag on the music lane, read the new value | After the Master drag the music readout is still `−2.9`. The lane drag Δ is measured from `−2.9` (Δ formula of TV-DRAG). A revert or a stale anchor = finding (Medium if a committed value is lost). Compare with A-R118-TV11-ANCHOR. The UI path cannot reproduce TV11 exactly (context commit), so a PASS here does not close A-R118-TV11-ANCHOR by itself |
| **DOC-100/101** | read | Doc 100 l.4, l.56 and l.70 are fixed per §2. Doc 101 has the TEMPLATE sections |

- **Neighbours that could break:**
  - the lane Volume readout and exact Undo (TV rows from round 116): C re-touches TV-DRAG once at 1440;
  - group Mute/Solo: one click each, `aria-pressed` toggles;
  - the collapse/U focus rescue on the group fader: one U press with the group fader focused → focus moves to the group name, as in UM9.
- **Gate rows (C does not claim them):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Severity guide:** a wrong stored value, a wrong export ratio or an extra history entry = Medium. A text or format mismatch = Low.

## 6. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Group tracks have mixer controls (Volume) | Live 12 Reference Manual §18.3 "Group Tracks", https://www.ableton.com/en/live-manual/12/mixing/ (B capture `b-round-78/ableton-mixing-20261022.txt` l.92, 2026-10-22) | Confirmed: "they have mixer controls" | The group has a Volume fader (SRW-17) | GV-PRESENT |
| A group's Volume shows dB like a track's | not stated in the captures | **დაუდასტურებელი** (inferred from "similar to audio tracks") | The same dB scale and formatter as the lane (D-29z82 consistency) | GV-PRESENT, GV-DRAG |
| Range −∞…+6 dB | not in the saved captures | **დაუდასტურებელი** | −∞…0 dB, as for the lanes in 3a; signal TRACK-VOLUME-BOOST | GV-INF |
| Shift = finer resolution when dragging | §42.6 "Finer Resolution When Dragging: Shift" (capture `b-round-71/ableton-shortcuts-20261021.txt`, 2026-10-21; also §42.7 for envelopes) | Confirmed | ×10 on the lane, video lane, group and Master Volume faders | SH-* |
| The fine factor (how much finer) | not stated | **დაუდასტურებელი** | 10, the same as Clip Gain stage 1 | SH-* |
| Shift pressed mid-drag | not stated | **დაუდასტურებელი** | Re-anchor without a jump (existing hook) | SH-MID |
| Shift on Pan | §42.6 is generic to controls | Confirmed (generic) | **შეგნებული განსხვავება**: Pan is unchanged in 3b (R5); signal PAN-SHIFT-FINE | NB-PAN |
| Visible numeric volume | §18.1 extended mixer numeric field (capture l.48) | Confirmed (in the mixer, not the arrangement header) | The group shows dB in title/valuetext only (R2): **შეგნებული განსხვავება**; signal GROUP-VOLUME-VISIBLE-READOUT | GV-PRESENT |

- `ableton-notes-source.txt` stays **დაუდასტურებელი**. ABLETON-EXPERT-REVIEW covers it after T12 V1.
- C rates "CZABA requirement met" and "Ableton correspondence" separately.

## 7. Evidence and reporting
- **C writes** `c-round-118.md` and `c-round-118.json`, with the fields `taskStatus`, `passed`, `failed`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified` and `envStatus`. Evidence goes under `c-round-118/{tools,out,shots}/`. Write as you go.
- `browserVerified` is false only if a browser row that **can** run here was not run.
- Inconclusive rows are listed as inconclusive, never under `passed`.
- Consult only the read-only agents in your list. C makes no `store/` writes.

## 8. Outcome
- **C PASS:** T12 stage 3b → `c_pass`. Publication makes it `c_pass_published`.
- **Next planning (on or after 2026-10-24):** the **REGRESSION round**, then T12 stage 4 (the waveform shows clip gain + a view-only vertical zoom), then ABLETON-EXPERT-REVIEW.
- **C FAIL:** findings with severity. B plans the fix-up first (Medium and above).

## 9. Root / architecture (not A's work)
- **Checkpoint request:** addendum **(ac)** was appended to `b-round-91-checkpoint-request.md`. It covers:
  - the gate-117 reviewer's Architecture note (an optional stored ↔ slider mapping in `useRelativeFaderDrag`);
  - round 118's second copy of the start capture (the group).
  - It is non-blocking; round 118 copies the pattern instead of waiting.
- **Other gate-117 findings:**
  - S2 (non-linear taper feel) → signal TRACK-VOLUME-TAPER;
  - S3 (`volumeGestureStartRef` is never cleared) → deferred Low;
  - S5 (text below the slider floor) → acknowledged info.
