# Sketch review: round 421 SYS-R418-PREVIEW-LIFECYCLE (L58)

- **Dispatched sketch:** `b-round-420/sketch-421.patch.txt`
- **Reviewed sha256:** `8d5fc47d2751da293a0d69814d20ecc4262cd52082112a04e879e0fb6df972ad` (= `sketch-421.sha256`; the file has not changed since the review).
- **Reviewer:** `tech-lead`, read-only, on its own copy `/tmp/b421-review` (`git archive` of HEAD `6609dfa` with this patch applied). `code-reviewer` is not on B's consult list.
- **Evidence on the same sha:**
  - mutants: `mutants/summary.txt`, 7 lines;
  - full suite: `precheck-full.log`, 264 files, 3951/3951, rc 0;
  - covering files: `precheck-a2.log`, 14 files, 286/286;
  - typecheck, lint and biome: `precheck-typecheck.log` rc 0, `precheck-lint.log` rc 0 with 205 warnings and 1 info, `precheck-biome3.log` rc 0;
  - loaded replicate: `precheck-loaded.log`, 49/49, with 2 busy loops;
  - browser, HEAD vs sketch: `probe/compare-head-vs-sketch.txt`, ALL EQUAL over 16 cells, including the new R11 re-render row.
- **Earlier sketches:** none. This is the first and only sketch.

## Verdict
**Verdict: approve** (tech-lead, 2026-11-09). No Critical, High or Medium findings.

The reviewer checked every dependency of the collection effect:
- `collection` is the only one whose identity can change, and in `/studio-lab` it is a module constant.
- The other nine come from `useState` or `useCallback([])` chains, and `resyncAfterDecode` was already a dependency at HEAD.

So an ordinary re-render (zoom, selection, playback, a status write) never runs the teardown. The browser row R11 confirms this: the preview keeps playing through two Snap toggles and two zoom steps.

## Reviewer findings and B rulings
| Id | Sev | Finding | B ruling |
|---|---|---|---|
| TL-R421-01 | Low | PL4 (unmount) passes at HEAD for another reason: after unmount, the player ref and the collection controller are both cleared, so the queued fallback stops at the refusal branch. No row can prove that unmount bumps the token | **Accepted as a lock row.** The title already says "lock … no observable effect by design". The bump on unmount is the same code line as the collection-change bump, so MU-COLLECTION-NO-STOP covers that line through PL1 and PL2. Closes TL-R418-L1 and GATE418-L4 on the "defence + same line" basis (D-29z1469). Not changed in this sketch |
| TL-R421-02 | Low | PL3 has two guards (the abort and the token), so it stays green under MU-COLLECTION-NO-STOP | **Accepted as a lock row.** The task table names it as a lock and says it has two guards. Not changed |
| TL-R421-03 | Low | PL5 re-renders only with the same collection object | **Covered** by browser row R11 (Snap and zoom state changes while the preview plays; equal to HEAD). Not changed |
| TL-R421-04 | Low | PL7 depends on jsdom honouring `element.currentTime = 3` | MU-TICK-FALLBACK-START turns PL7 red, so the assert can fail. No action |
| TL-R421-05 | Low | The change needs an implementation doc | Already in the task: doc 271, which A writes |

## What the host decides (recorded for C)
- In `/studio-lab` the collection never changes, so the new stop trigger cannot be reached in the browser. PL1–PL3 (jsdom) prove it, and browser row R11 proves its negative: ordinary re-renders do not stop the preview.
- In shipping browsers the `currentTime` getter does not throw (tech-lead, round 418). PL6, PL7 and PL8 are defences.

## Ordering matrix (L58)
This round adds one incoming event kind: **G**, a collection change or provider unmount. It is a teardown and runs synchronously.

| In flight | Outcome when G arrives | Row |
|---|---|---|
| B: buffer preview | stopped by `stopLibraryPreview` (no token-dependent branch) | x-unch: same stop path as X (R6, PS6) |
| S: stream preview | stopped, element released, id cleared | PL1 |
| D: decode preview | settles to nothing (abort + token) | PL3 (lock) |
| F: fallback queued | microtask sees a stale token and returns | PL2 (collection), PL4 (unmount, lock) |
| X, K, P, U | synchronous; never in flight | sync |

The 8 × 8 matrix of round 418 (`b-round-417/sketch-review.md`) is otherwise unchanged. Its one deferred cell, **F × U** (TL-R418-L1), is now PL4. **Cell count:** 4 named + 4 sync for the new G column.
