# B round 442 → 443 planning (2026-11-11)

**Advisor:** available; consulted after orientation and before writing (it asked for explicit rulings, fact-vs-hypothesis, a stricter comparator, a sketch-measured fix and backlog-from-C-evidence; all applied). **Consults:** `tech-lead` sketch review (approve, 0 Medium+) → `b-round-442/sketch-review.md`.

## Inputs read
`context/active-summary.md`, `current-task.md` (round 442, archived byte-identical to `tasks/round-442.md`), `a-round-442.md` (STOP on A-R442-REVIEW-M1), `c-round-442.md`/`.json` (PASS, browserVerified true, 1 unverified Medium), `gates/gate-round-442.json` (published `4aa3c82`), `gates/round-442/review.md`, `lessons.md`, backlog by id.

## Acceptance from evidence
- Round 442 (SYS-3 stage 1): C PASS on C1–C7, C9, C10 with real Chromium IME probe ALL OK (18 cells) and an in-job HEAD control; gate published `4aa3c82`. ROOT-R65-L5 and A-R165-IME-ENTER closed (D-29z1573). SYS-3 stays in progress (stage 2 + the fix-up).
- No browser row of round 442 was skipped except optional C8 (jsdom rows covered) → nothing to re-schedule for browserVerified.

## Ruling on the STOP (L10/L11)
C-R442-M1 / A-R442-REVIEW-M1 → **Medium, contract level** (D-29z1574). B probe on `4aa3c82` (`b-round-442/probe/ime-held.mjs`, `compare-held.py`): composing key → IME commit → 3 auto-repeat keys → HEAD `NOT ALL OK (8 of 18 failing)` (Tempo Enter/Escape, Marker Escape, Clip Gain Escape at both viewports). Real-IME delivery of that sequence is a hypothesis → TLM-SYS3-IME-PLATFORMS gains a held-key step. Reviewer Lows L1/L2 attached.

## Round 443 (dispatched)
SYS-3 stage 1 fix-up. Sketch v2 `b-round-442/sketch-443.patch.txt` (sha `6b68ac9e…`): 3 handlers ignore `event.repeat` (preventDefault kept); tests IME6/IME7 + IME1 status. B evidence on v2: 7/7 mutants red, round-441 covering set 60 files / 1118 rc 0, typecheck + scoped Biome rc 0; browser sketch `ALL OK (18 cells)` (v1; v1→v2 changed only the test). Claims `b-round-442/claims-443.sh` (K1–K20, planning output saved). tech-lead delta review of v2: approve, 0 Medium+ (`sketch-review.md`), `tools/l58-check.py` L58 OK. On a v2 sketch server (dir in `probe/sketch-server-dir.txt`, /tmp): held-IME probe `ALL OK (18 cells)` (one cold-start cell replaced), round-442 stage-1 probe `ALL OK (18 cells)`, plain held keys tree vs HEAD `ALL SAME (18 cells)` (`probe/compare-*-v2.txt`, `compare-plain-planning.txt`). Lint: 205 warnings on HEAD and sketch. Sketch scratch tree moved out of the loop folder (`scratch-dir.txt`).

## Backlog (v428 → v429)
D-29z1573…D-29z1575. New: C-R442-M1-HELD-KEY-UNRULED (scheduled 443), A-R442-REVIEW-L1/L2 (scheduled 443), GATE442-L1-KEYCODE-229-NOTE and GATE442-I3-PARENT-LISTENER-TRY-FINALLY (`deferred_low_polish`), TL-R443-G3-PLAIN-HELD-ROWS (SYS-3 stage 2), signal SIG-R442-INLINE-EDITOR-KEYS (architecture_signals, not scheduled), retro candidate RETRO450-Q-STOP-THEN-PUBLISH (A STOP on an unruled Medium was followed by C PASS and publication before B ruled).

## Architecture checkpoint
No new request. SYS-3 changes are small guards in stable handlers; the inline-editor key-helper idea (SIG-R442) is decided at SYS-3 stage 2. The standing frontend-architect checkpoint before ARCH-SPLIT (via root) is unchanged.

## Order (D-29z1575)
443 fix-up → SYS-3 stage 2 → REGRESSION-2026-11-13 (first if due) → STORE-REDESIGN 2b…5 → ARCH-SPLIT → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase 2 (skip rule). RETRO at round 450.

## Not COMPLETE / not BLOCKED
Large scope remains (see `b-next.json` `remaining`). Every round-443 row runs in the cloud; nothing needs external input.
