# CURRENT TASK — Round 210: PERF-FADER-a re-dispatch: finish the fast pointer drags for track, group, master Volume and Pan (SABA-B-5 part 1)

Decisions: **D-29z183** (C-R209-01 gesture-guard grant), **D-29z184** (WINDOW threshold vs the harness clamp), **D-29z185** (draft-clear order kept), **D-29z186** (C-R209-03 accepted delta + FP13), **D-29z187** (review Mediums mandatory, red-proof method). Round 209's rulings **D-29z179…D-29z182 stay in force unchanged**. Planned by B on 2026-10-27. Dispatcher: B. Implementer: A. Verifier: C.

**Read first:**
- `lessons.md` (L10, L11, L12, L23, L26, L28 apply).
- **`tasks/round-209.md` — the round-209 task. Its §1 (rulings), §2 (owned files, L23 ruling per hit, the 48 budget flips, FP1–FP12, self-checks), §3 (C rows) and §4 (adjacent behaviour) are binding for this round**, except where this file changes them below.
- `a-round-209.md` (A's STOP, implementation notes, L23 table, perf results, code-reviewer findings) and `c-round-209.md` / `c-round-209.json` (C's FAIL, findings C-R209-01/02/03, the real-browser probe table).

## Baseline and resume (no revert, no redo)
- **Commit:** still `f535ab3`. Gate 209 was **skipped** (C taskStatus FAIL); nothing was published.
- **Resume from the current working tree.** A's round-209 partial work (4 modified sources, 5 modified granted tests, 4 new files) is the starting point. Do not revert it and do not re-implement it. Continue from `a-round-209.md` "Exact next steps".
- **Frozen:** the 1,030 files in `b-round-209-r210-tree-sha256.txt` (round 209's list minus `gesture-guard.test.tsx`). From the store root: `sha256sum -c --quiet <loop>/b-round-209-r210-tree-sha256.txt` (B checked: OK on the current tree).
- **Grants:** `b-round-209-r210-grants.txt` (20 = round 209's 19 + `app/lib/arrangement/__tests__/gesture-guard.test.tsx`, see D-29z183). Start hashes (all at `f535ab3`): `b-round-209-r210-granted-start-sha256.txt`. Start copies: `b-round-208/r209-granted-start/` for the 19, `b-round-209/r210-granted-start/` for gesture-guard.
- **New files:** `b-round-209-r210-new-files.txt` (the same 5). Doc 165 is still to be created (number 165 is free; 164 is the last doc).
- **Protected / frozen as in round 209:** auth and purchase files, `app/components/studio/**`, `app/styles/**`, `.claude/**`, `CLAUDE.md`, `package.json`, `biome.json`, `tsconfig*.json`, `playwright*.config.ts`, `app/routes/**`, `StudioWorkspace.tsx`, `app/hooks/useRelativeFaderDrag.ts`, every clip-gain source and test file.

## 0. Why this round
- Round 209 C **FAIL (incomplete)**: A stopped correctly (L11) on a frozen test that reads the model mid-gesture. B now rules (L10). C's own real-browser probe of the implemented part already looks right (all four faders: 1 component max per move, 0 source starts during the drag, 1 release commit, Ctrl+Z restores, cancel/blur restore with 0 commits). It is recorded as evidence for the rulings and is **not** a PASS.
- **SABA-B-5 (Medium)** remains open until this round passes C with `browserVerified: true`.
- **Reference first:** not applicable (performance round; behaviour stays the same and INVARIANTS-210 checks it against the baseline build).

## 1. Rulings (new; round 209's §1 still holds)
**D-29z183 — C-R209-01 (gesture-guard l.447).** Grant `app/lib/arrangement/__tests__/gesture-guard.test.tsx`, **the l.447 hunk only**, re-expressed exactly as A proposed under the round-209 L23 ruling. Replace
`expect(trackVolume(api, 'sfx')).toBe(trackVolumeFromDb(-10.5));`
with
`expect(volume.value).toBe('-10.5'); expect(volume.getAttribute('aria-valuetext')).toBe('−10.5 dB'); expect(trackVolume(api, 'sfx')).toBe(1);`
The row's title, id and every other line stay. The live-gain third check does not apply (not playing), the same as the master-ui ruling. B checked: every other `trackVolume(api, …)` read in this file comes after a pointerup, a blur, a window blur or a pointercancel, so this is the only hit (A's covering run in round 209 agrees: 1 failure in 2,184). If A finds another, STOP (L11).

**D-29z184 — WINDOW threshold.** The "≥ 100 window commits per drag" criterion of WINDOW applies **only to C's run that starts below max** (C measured ≥ 101 there in round 209). For drags that start at max (the harness path, I-208-b clamp) and for Pan (its 1-step grid repeats values), the criterion is: every move that changes the stepped value commits (no thumb lag: the sampled `aria-valuetext` follows each change), and moves that do not change the value may commit nothing. The component counts (max, per-move, release) must agree with the harness ±2. The harness is not changed.

**D-29z185 — draft-clear order (A's reviewer Low).** Keep the round-209 §1.4 order: take and clear the override and draft, then call `applyEdit` once. LIVE-DISPLAY-210 checks there is no visible snap-back after release. Recorded; no change.

**D-29z186 — C-R209-03 accepted delta.** At `f535ab3`, a native Pan `change` that arrived after a stolen claim (lane cleanup still armed) set a display-only `panDraft` with **no** audio and no model change: the thumb showed a value that was not playing. Now `previewTrackPan` refuses it (`panGestureRef.current?.trackId !== trackId`, `ArrangementContext.tsx` l.2799) and no draft shows, so display, audio and model agree. This is an **accepted behaviour delta**, not "unchanged". It must be tested: **FP13** (below). Doc 165 lists it as a behaviour change.

**D-29z187 — code-reviewer Mediums are mandatory; red-proof method.**
- **FP14** (pan cancel rows, review Medium 1): for each of pointercancel (→ `cancelTrackPan`), fader blur mid-drag (→ `handlePanBlur`) and a stolen claim, the live `setTrackPan` value returns to the stored pan, the draft store has no pan entry for that track, the leaf shows the stored pan, and no history entry is written.
- **FP9 extended** (review Medium 2): the group fader's pending path (keyboard ArrowUp/Down and double-click reset with no pointer gesture) gives the same values, labels and `syncPlayback` behaviour as at the start copy.
- **Red-proof:** the start-copy run uses the start copy plus `mix-draft-store.ts` and a minimal `useArrangementMixDraftStore` export (or a probe that guards the hook), so rows fail on their assertions, not on imports. FP1–FP8 and FP10 must be red on that copy. FP9, FP11, FP12, FP13 and FP14 each get a **named mutant** (state which line is mutated and the failing assertion). Report both. **FP13 builds the state with fired events** (`pointerDown` on the Pan slider → `pointerDown` on a clip header, which steals the claim → `fireEvent.change` on the Pan slider), and **its named mutant is the guard at `ArrangementContext.tsx` l.2799** (`panGestureRef.current?.trackId !== trackId`): removing it must turn FP13 red. If FP13 stays green under that mutant (the change never reaches `previewTrackPan`, e.g. an upstream early return), report which path short-circuits it and assert that path instead; do not ship a row that passes for the wrong reason.
- The remaining reviewer Lows (`takeMixOverride(kind)`, two owners of the pan-draft clear, the `withMixOverride` export, test-count details) are recorded as signals. A may change `takeMixOverride` to take a kind only if it is a small local change in an owned file; it is not required.

**STOP (L11)** as in round 209: if ≤ 3 per move, or a rule above, cannot be met without editing a frozen file, or a granted test asserts the opposite of a rule and cannot be re-expressed.

## 2. A — what is left to do (files: the 20 grants + 5 new files; everything else frozen)
1. `gesture-guard.test.tsx`: the D-29z183 hunk only.
2. `fader-pointer-preview.test.tsx`: add **FP13** (stolen claim → a native Pan `change` → no draft, no `setTrackPan` write, model unchanged, no entry) and **FP14**; extend **FP9** with the group pending path.
3. `perf/budgets.json`: flip the 48 rows (`fader.{track,group,master,pan}.{stopped,playing}` at 1× and `.6x`: `move-components-max` and `move-components-per-move` → `assert <= 3`; `release-commits` → `assert >= 1`). Clip-gain rows stay `record`; wall-clock rows stay `record`. Update the `harness.move-window-live` note: it survives because each value-changing move commits the leaf.
4. Doc 163: the D-29z181 lines exactly as in `tasks/round-209.md` §1 (l.4 exact text; l.16, 18, 24–31, 74, 83, 151; one TODO line pointing to doc 165).
5. New doc 165 (`docs/implementation/2026/quarter-IV/165-fader-pointer-preview.md`, TEMPLATE.md, Georgian with English terms): status line conditional "C round 210 check pending" (L28); cites only tests that exist (L26: FP1–FP14, MD1–MD5 by id); lists the D-29z186 delta and the before/after numbers (C round 208 → A's runs).
6. Self-checks (not the full suite):
   - `npm run typecheck`; Biome on the owned paths (0 errors/warnings);
   - `npx vitest run` on the 2 new files, the 13 granted test files and the frozen neighbours `clip-gain.test.tsx`, `clip-gain-waveform.test.tsx`, `clip-gain-multi.test.tsx`, plus one covering run of `app/lib/arrangement/__tests__ app/components` (all green; round 209 had 2183/2184);
   - `npm run test:perf` **twice**, sequential, nothing else building; both exit 0 with every assert passing, including the 48 flipped rows (JSONs under `a-round-210/`);
   - the red-proof (D-29z187);
   - the code-reviewer on the **final** delta, its Architecture note carried verbatim.
7. Report `a-round-210.md`: every hunk added this round in a granted test (old → new), the red-proof table, the perf before/after table, and the `sha256sum -c` result with its real exit code.

## 3. C — rows
**Setup and rows: as `tasks/round-209.md` §3**, with every `209` read as `210` (evidence under `c-round-210/`), and these changes:
- **SCOPE-210:** also checks that the only change in `gesture-guard.test.tsx` vs `b-round-209/r210-granted-start/` is the D-29z183 hunk, and that every edited hunk in a granted test is on A's round-209 L23 table or its round-210 additions. Frozen list = `b-round-209-r210-tree-sha256.txt` (1,030).
- **WINDOW-210:** per D-29z184 (≥ 100 window commits only for the below-max run; harness agreement ±2 on the component counts).
- **AUDIO-210:** (a), (b) loop wrap mid-drag and (c) Space mid-drag all run (round 209 did not run (b)/(c)).
- **GROUP-210:** pointercancel **and** a group-fader blur mid-drag (round 209 ran only the track blur).
- **INVARIANTS-210:** needs the baseline `f535ab3` build in a separate worktree under `c-round-210/` (not built in round 209). Add the **pan** cancel triggers (pointercancel, blur) to the baseline comparison.
- **PAN-DELTA-210 (new, D-29z186):** the stolen-claim → native Pan `change` state. If C can reach it in the browser, record baseline vs now (baseline expected: thumb moves with no audio change; now: the thumb stays at the stored pan, audio unchanged). If it cannot be reached by real input, say so with what was tried, and rely on FP13 (AN-REVIEW reads it). Either outcome is acceptable; an unreported attempt is not.
- **AN-REVIEW-210:** also reads FP13, FP14 and the extended FP9, and checks that doc 165 cites only existing rows.
- **Info for later (not a row):** while playing, the graph is rebuilt after pointerup and after Ctrl+Z (C round 209 note; pre-existing, perf-plan §1.5). Record it if seen; it is PERF-2+ material, not a fail of this round.

**`browserVerified`:** PERF-RUN, WINDOW, LIVE-DISPLAY, AUDIO, GROUP, INVARIANTS, EXPORT, VISUAL, PAN-DELTA (the attempt) and G210-3 can all run in the cloud. If any did not run, the flag is false and SABA-B-5 part 1 is not done.

**Product / Ableton:** CZABA requirement SABA-B-5 (fast fader drag) for these four faders. Ableton conformance: not applicable.

## 4. Adjacent behaviour that could break
As `tasks/round-209.md` §4 (meters, group mix, status after commit only, touch scroll, pending flush order, `readStoredValue` returns the committed value, perf run under 12 min), plus: the Pan reset button (`disabled` follows the stored pan while its text shows the draft, unchanged from baseline).

## 5. Publication
After C PASS, root runs the gate. Commit message: "perf(studio): PERF-FADER-a pointer fader preview without history churn (SABA-B-5 part 1)". Root amends doc 165 l.4 (L28).

## 6. After this round (not in scope)
PERF-FADER-b (clip gain, single + members; WG4 ruling at its planning), then the frontend-architect checkpoint on the `ArrangementContext.tsx` volume machine (requested after PERF-FADER-b), PERF-1b, PERF-2…16, SYS-1…3, STORE-2b…5 (paused), REVIEW-RECOMMENDATIONS, T12-ADVANCED. Regression round due on or after 2026-10-30. RETRO at round 215 or at the end of STUDIO-PERFORMANCE.
