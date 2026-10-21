# B — Round 44 → Round 45 planning (D-29z10)

Dispatcher: B · 2026-10-15 · planning artifacts only (no app source touched). Two B sessions: the first wrote the archive, backups, gates, backlog v47 and `current-task.md` (checkpoint `b-round-44-checkpoint.md`); the second (after the root publication pause, `root-r44-publication-note.txt`) inspected that partial work, did not redo it, reconciled it with root commit `ca85109`, and wrote plan/feature-status/this report/`b-next.json`.

## 1. Inputs read

- `tasks/round-44.md` — archived round-44 task (copy of `current-task.md`, sha `1d8bdbe6…`, identical to `current-task.before-b-round-44.md`; not overwritten on restart).
- `a-round-44.md`, `c-round-44.md`, `c-round-44.json`, `backlog.json` (v46 → v47), `feature-status.md`, `plan.md`, `agent-workflow.md`, `b-round-43.md`.
- `publication-checkpoint.json` (has `round43Checkpoint`; no `round44Checkpoint` yet), `root-pre-push-review.md` (2026-10-07: M1–M3, L1–L4, L6–L8 closed, L5 accepted — nothing open from it), `checkpoint-r44-push.log`, `root-r44-publication-note.txt`.
- Source (read-only): the 7 bare `useLayoutEffect(` sites, `ArrangementLibrary.tsx` l.549, `app/routes/studio-lab.tsx`, `app/hooks/`, `vitest.config.ts`.

**Pre-revision backups:** `current-task.before-b-round-44.md`, `feature-status.before-b-round-44.md`, `b-next.before-b-round-44.json`, `backlog.before-b-round-44.json`, `plan.before-b-round-44.md`. Scripts: `b-round-44/*.py`.

## 2. Round 44 result — backlog changes (only from C evidence)

C: `taskStatus: PASS`, `bugs: []`; passed G44-1/2/3, R44-S, R44-U, R44-TR (PLAY/END/LOOP/SEEK/PREVIEW), R44-REG (VOL-DBL/VOL-PLAY/VOL-KEY/MUTE/MASTER/DEL), R44-Doc.

| ID | Change | Evidence |
|---|---|---|
| R9-REVIEWER-M1-L8 | closed | R44-S (diff, grep 0, C git-history check), R44-U L8a + mutation (d), R44-TR |
| PREVIEW-VOLUME-IDENTITY | closed | R44-U PV1–PV8, mutations a–h; REG-VOL-DBL, REG-VOL-PLAY (0 entries, 0 new sources) |
| ROOT-ROUND43-CHECKPOINT-RECORD | closed (root record) | `publication-checkpoint.json` → `round43Checkpoint` |
| SETTRACKMIX-NAN-IDENTITY | new, Low, open | `a-round-44.md` §5 (code-reviewer, pre-existing), `c-round-44.md` §8 |
| ROOT-ROUND44-CHECKPOINT | new, root, in progress | root commit `ca85109` = exactly the 3 paths at C's shas; 13:24 TCzaba `ca85109`, shavidze `2c0f800` (push log still growing) |

SRW-13 stage 4c is done. SRW-13 stays `in_progress_bug_open` (polish rounds 45/46; C-R27-01 and C-R41-01 with the Tech Lead). Harness rules added from C/A round 44: playhead inside the loop explicitly; 2 px marker-span ruler clicks; `$B wait N` does not delay.

## 3. Round 45 — what and why

No Critical/High/security/data-loss bug is open, so the next item in the plan order is the polish row. It mixes no-behaviour hygiene with one focus-management change; per the workflow (one feature or ≤ 3 tightly related bugs) it is split:
- **Round 45:** SSR-LAYOUT-EFFECT-WARN + LIB-SEP-REASON + 5 doc notes. None changes behaviour.
- **Round 46:** EXPORT-DIALOG-FOCUS-RESTORE alone (it changes focus timing under a 19-case suite).
- **Round 47:** SRW-14 stage 1 (FB-13 grid model, Snap, divisions, clip move first) with an Ableton source table via gstack `/browse`.

**Measurement (B, 13:05):** one `curl /studio-lab` adds exactly 7 SSR warnings (`b-round-44/ssr-warn-sample.txt`): ArrangementProvider 1, StudioWorkspace 1, ArrangementDetailPanel 2, ArrangementDetailContentInner 3. These map 1:1 to the 7 bare sites; `usePositionWriterEffect` already uses the isomorphic pattern and does not warn.

**Contract choices (smallest honest behaviour):**
- Shared `app/hooks/useIsomorphicLayoutEffect.ts` instead of 7 local aliases (7 sites / 3 files is not one-off). `app/hooks/index.ts` not edited (`useRelativeFaderDrag` precedent).
- `usePositionWriterEffect` deliberately untouched (playhead/meter writers; a rename is not worth re-verification). Two identical expressions in one file accepted.
- The SSR test needs `window` undefined; `vitest.config.ts` is jsdom and frozen, so a narrow round-45 grant for one `// @vitest-environment node` line. B checked: no `setupFiles` in the config; no existing test imports the route; the route imports no CSS/asset. SSR2 markers confirmed in the live dev SSR: `data-testid="arrangement-ruler"`, `data-testid="arrangement-detail-panel"`.
- LIB-SEP-REASON: same suppression rule, technical reason, no other byte changes.
- Doc notes: three in-place fixes (doc 036 ×2, doc 035 l.4 status/l.26 string) and three dated notes (035, 034, 015). The 015 note reflects the user's 2026-10-11 Delete/gap contract (SRW-24).

C's acceptance (R45-S/U/SSR/REG/Doc, G45-1..3) and neighbouring risks (detail-panel start/text/resize, zoom-back scroll, refusal status, hydration, library separator, playback smoke) are in `current-task.md` §4.

**Ableton:** all three rows "not applicable" (React SSR, lint text, docs). No Live claim is made.

## 4. Baseline

- B gates 13:09 (`b-round-44/gates.txt`): HEAD `2c0f800`, 3 uncommitted round-44 paths at C shas, 391 OK, protected 4/4, tsc 0, vitest 77/1351, `/studio-lab` 200, `node.exe` 22.
- 13:24 re-check: root committed `ca85109` (exactly the 3 paths, shas `623f381e/63b5dbe5/5dadac1f`), tree clean, `b-round-44-tree-sha256.txt` **386 OK**, all 8 snapshot shas match. The task allows both starting points; (b) is now the expected one and is stated first.

## 5. Scope integrity

- No scope reduced or labelled deferred. Rounds 46/47 are queued, not deferred. Full order after 47: SRW-14 later stages → SRW-15 (bars/beats/tempo grid only; never audio stretch) → SRW-16..20 → R26-M1, L3-REMOVED-TRACK-TAPS, A-R34-REVIEW-RESIDUALS, SETTRACKMIX-NAN-IDENTITY → SRW-21 adapter → full regression + root review → T12.
- Out of scope (unchanged): plugins/effects, pitch, multiple video layers, audio time-stretch.
- Protected auth/purchase files: forbidden in §3.3; C checks 4 by sha. `/studio-lab` stays demo-only and anonymous (G45-3).
- Root items carried: ROOT-ROUND44-CHECKPOINT, GSTACK-ACL, `.kilo/`, smoke (root only), SRW-21 loader, Lenis, CRLF auth Biome errors, `frontend-architect.md` grant, Modal focus gap, GA scroll, fake Bearer → 500, CDP allowlist, charset, dev-server/browse-daemon/load. `root-pre-push-review.md` has no remaining open finding.

## 6. Decision

**CONTINUE.** Not COMPLETE: SRW-13 polish, SRW-14..20 (FB-06/07/09..13), SRW-21, Tech Lead items (C-R27-01, C-R23-01/C-R38-01, C-R41-01, manual checks), full regression and root review, then T12 remain. Not BLOCKED: nothing external is required for round 45. No Critical/High open; purchase protection preserved (C round 44 G44-2/G44-3).

**Checkpoint readiness:** round 44 is C PASS and already committed by root (`ca85109`); round 45 becomes checkpoint-ready only after C PASS.

## 7. Advisor

Available. Called in session 1 (before planning) and in session 2 after orientation. Session-2 advice applied: reconcile with `ca85109` (task baseline note, backlog trail, ROOT-ROUND44-CHECKPOINT kept open), verify the node-env pragma against `setupFiles` (clean), give A concrete SSR2 markers (done), fix the stale feature-status line, align `b-next.json` remaining with backlog v47. A final advisor review is called after these artifacts are written.

## 8. Post-write review (advisor, final call)

- **SSR test recipe:** checked that rendering `<StudioLabRoute />` bare cannot throw on a missing root provider. `all-lane-clipboard.test.tsx` l.14–20 mocks only `Link` and renders `StudioWorkspace` under `ArrangementProvider` alone; grep for `useToast`/`useAuth`/`useCart`/`useAnalytics` in `app/components/arrangement/` and `ArrangementContext.tsx` → 0. Added this precedent to `current-task.md` §2.3 Setup.
- **`backlog.advisor_used_by_B`:** round-44 entry appended (two sessions, three calls).
- Otherwise confirmed: `b-next.json` matches backlog v47 (3 dropped, 2 added, 68 remaining); `plan.md` CRLF restored; feature-status stale line fixed. Decision unchanged: **CONTINUE**.
