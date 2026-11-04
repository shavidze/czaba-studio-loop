# A round 331: PERF-DRAG-PREVIEW stage c2a (selected-clip readers)

**Status:** A scope complete; C verifies. No commit/push. No browser or perf run by A (task: C runs them).

## Changed files (git status: exactly 5 M, 0 untracked)
- `app/lib/arrangement/preview-store.ts` (patch)
- `app/components/arrangement/StudioWorkspace.tsx` (patch)
- `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` (patch, DP25–DP28)
- `app/lib/arrangement/__tests__/preview-store.test.ts` (patch, PS-ROLES, PS-LIST)
- `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` (§1.3 by hand + reviewer doc fixes)

The four code files are byte-identical to `b-round-330/sketch/sketch.patch.txt` (applied with `git apply`; no rows strengthened; `git apply -R --check` run after the final doc edit: REVERSE-OK; `git diff --quiet` on `ArrangementDetailPanel.tsx`: unchanged; see `a-round-331/scope.txt`). `ArrangementDetailPanel.tsx`, overview, lanes, context, `perf/**` and protected files untouched.

## A rows
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS | PASS: identical to `claims-331-planning-output.txt` | `a-round-331/claims-before.txt` |
| A-IMPL | PASS: patch applied cleanly; doc 232 edited per §1.3 | git diff |
| A-CLAIMS-AFTER | PASS: differs from the sketch output only at K2 `1e5f552 5`, K11 (new l.4), K12 `1 1 1 1`, K13 `11`; K10 and K15 (16) unchanged | `a-round-331/claims-after.txt` (rerun after the final doc edit) |
| A-SCOPE | PASS: 5 modified, 0 untracked | `a-round-331/scope.txt` |
| A-TYPE | PASS rc 0 | `a-round-331/typecheck.log` |
| A-LINT | PASS: `npm run lint` rc 0 (205 warnings, pre-existing repo-wide); K15 = 16; `npx biome check` on the 4 code files clean | `lint.log`, `biome.log` |
| A-UNIT | PASS: 17 covering files, 247/247 | `a-round-331/unit.log` |
| A-MUTANT | PASS: 7/7 killed on the expected rows (DP25; DP25; DP26; DP26+PS-LIST+PS-ROLES; DP27+DP28+PS-ROLES; DP27; DP27), `restored: true`, on scratch `/home/runner/a331-scratch` | `a-round-331/mutants-a.txt` |
| A-REVIEW | DONE: code-reviewer subagent ran on the 5 files as a static read (it had no shell and ran no tests or git diff), score 8/10, no Critical/High | below |

L31 timing: no test over 50 % of its timeout. Slowest are CP12a, 9983 ms of a 30 s file timeout (33 %); render-budget, 2926 ms of 15 s; LSU9 / WSU1, about 1.8 s of the default 5 s (36 %). New rows: DP25 149 ms, DP26 220, DP27 585, DP28 519, PS-ROLES 10, PS-LIST 1.

## Data-safety check (A, before review)
The held clip object can keep stale `fadeIn`/`fadeOut`/`envelope` values. Every detail-panel action reads only shown fields: `setClipGain(selection.clip.id, …)`, range from `trackId`/`start`/`duration`, and group `clipIds`/`gainDb`. None writes the clip object back, so there is no data-loss path today. The reviewer confirmed this independently.

## code-reviewer findings and handling
- **A-R331-REVIEW-STALE-CLIP**, origin A code-reviewer. **Medium, latent:** no reproducible failure, and no current reader of the ignored fields. Not fixed; the fix is outside ownership. **Question for B:** whether the root clarification for non-reproducible Mediums applies, so this need not block the stage. `ArrangementDetailSelection.clip` exposes the held stale object as a full `ArrangementClip`. A future spread-based write-back or a fade-aware reader would silently use old values, and DP27 only catches displayed fields. This is the existing signal SIG-R331-DETAIL-PICK (D-29z967). **B: keep it open.** It is the only route to a write-back regression.
- **Low, fixed in the doc:** the doc said the equality "follows this record exactly", but `SELECTED_CLIP_FIELD_ROLES` is not used at runtime. Its sync with the equality is enforced by the tests (compile-time `Record`, the `-?` variant maps, PS-ROLES, DP27). The doc now says so. The other option, deriving the equality from the record, would change patch lines that the mutant anchors depend on, so it goes to B as an optional hardening.
- **Low, fixed in the doc:** the earlier useShallow/MU-NO-SHALLOW entry now notes that the detail selector moved to `useEqualityStableSelector` and that MU-NO-SHALLOW now covers the lane hook only.
- **Low, fixed in the doc:** the Solution text now separates the two rows. DP25 proves the reference stays stable (0 renders). DP27 proves the markup does not depend on the ignored fields.
- **Low, not fixed (proposal for B):** the test `FakeAudioBuffer` returns zeros, so DP27/DP28 cannot see a future waveform that depends on a fade or the envelope. A non-zero peak fixture would make the markup comparison meaningful.
- **Low, not fixed (proposal for B):** DP27 covers single selection only. Group and video branches are not exercised; group derives only shown fields today. DP28 has no render-count assert.
- **Architecture note (to B, not an in-round refactor):** keep `useEqualityStableSelector` local for now (2 callers). Proposal: when c2b lands, add an optional `isEqual` to `useArrangementPreview(selector, isEqual?)` in `ArrangementContext.tsx` and move the lane hook onto the same path. Acceptance: DP1, DP25–DP28 and PS-* stay green, and the `useArrangement()` shape does not change. Linked to the D-29z968 "extract if c2b needs it" clause.

## Known gaps
- A ran no browser, perf or full suite (per the task and the speed rules). DRAG-NAMES, PERF, FADE/TRIM/MOVE/GROUP-SHOWN, D-ROWS and G331-AUTH are C's. Full vitest, build and verify belong to the gate.
- The doc 232 TODO line for "stage c" still lists c2 as remaining in its old wording. The new c2b, SIG-R331-DETAIL-PICK and PERF-CAND-FADE-BUDGET bullets precede it.

## Exact next C checks
1. `bash b-round-330/claims-331.sh` must equal `a-round-331/claims-after.txt`.
2. SOURCE-SCOPE: `git apply -R --check b-round-330/sketch/sketch.patch.txt` passes with no test-hunk differences; `git diff --quiet -- app/components/arrangement/ArrangementDetailPanel.tsx`; protected 11/11.
3. UNIT ×3 and MUTANT plus C's own mutant on C's scratch.
4. Browser: DRAG-NAMES (fade [14×4], move [22,2,22,2,107,2,22,2]), FADE-SHOWN, TRIM-SHOWN, MOVE-HINT, GROUP-SHOWN (watch the group gain range text after commit), D-ROWS (DIFFS 0, WAV sha), G331-AUTH. Both viewports, A at :5173 vs HEAD `1e5f552`.
5. PERF: production build, interactions spec alone; compare with `perf-rowcmp.py`.
6. DOCS: l.4 byte-exact, K12 `1 1 1 1`, c2a section, 7 headings, cited ids exist.

## Scope completed
All A rows in §2.1 passed: A-CLAIMS, A-IMPL, A-CLAIMS-AFTER, A-SCOPE, A-TYPE/A-LINT, A-UNIT, A-MUTANT, A-REVIEW. No C row or whole-backlog item is claimed.
