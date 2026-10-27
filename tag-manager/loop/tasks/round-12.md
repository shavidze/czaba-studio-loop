# CURRENT TASK — Round 12: finish round 11 (TM-B15 scope item 4: STATE_MANAGEMENT.md Save flow, C-R11-01) — BLOCKED until the user unblocks `.claude/**` edits

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-26

## Status: BLOCKED on the user
**Do not start A until one of these is true** (root/loop runner checks it before starting A):
- **(a)** The user has applied `tmp/tag-manager-loop/a-round-11/state-management.patch` in the repository with `git apply`, **without committing** (root publishes rounds 11–12 after C). A's phase is then empty: A only confirms the diff and writes `a-round-12.md`, and C runs the acceptance below.
- **(b)** The user has allowed the agent harness to edit `.claude/primitives/STATE_MANAGEMENT.md`, for example by accepting workspace trust for `/home/runner/czaba-project/czaba-tag-manager` or adding an allow rule that covers `.claude/**` edits in headless mode. A then makes the edit with the normal Edit tool.

**A must not route around the guard.** That means no `git apply`, `sed`, `cat >`, `python` or any other Bash write to `.claude/**`. If the Edit tool is refused again, A stops, records the denial in `a-round-12.md` and reports BLOCKED. This matches what A rightly did in round 11.

## Why this round
- Round 11 (TM-B15, D-21): **C taskStatus BLOCKED**, realVerified=true for R11-1…R11-7, all PASS. Code, test and `docs/learning/data-flow.md` are verified, including the real app with ffprobe and music-metadata (partial failure, retry, all failed, regressions). `gate-round-11.json`: skipped (C BLOCKED). Nothing was published.
- The only gap is **scope item 4 / R11-8**: `.claude/primitives/STATE_MANAGEMENT.md` `### Save flow` still says batch always calls `setEditingMetadata({})`. The harness refused A's Edit as a "sensitive file" (`a-round-11-result.json` `permission_denials`). Round 3 edited `.claude/primitives/WAV_METADATA.md` with no denial (`a-round-3-result.json` `permission_denials: []`), so the environment changed (B-R11-01). The 14 allow entries in `.claude/settings.local.json` are ignored because the workspace is not trusted (`agent-stderr.log`), and none of them covers `.claude/**` edits.
- Scope item 4 is not dropped. Dropping it would shrink scope, and only the user can decide that.

## Baseline
- HEAD `35ed18b9211f0da3d7c23e10af5b431d6f33540f`, **not clean**. Round 11's verified, uncommitted work must be present and byte-identical to `c-round-11/end-hash.txt` (policy rule 6, preserve partial work):
  - `M src/renderer/src/components/metadata-editor/MetadataPanel.tsx`, sha256 `4a38993a071e416e25f831a32d83d1e5155b3ea007c21bd41ec35e59941f1114`
  - `M docs/learning/data-flow.md`, sha256 `8ca2766a7e04239af5481d807788b105e3a352099b58c1c49cb573fb9c129a0a`
  - `?? tests/renderer/components/metadata-panel-batch-save.test.ts`, sha256 `68b1447d3ad8008450a323806b6860349c0d99c6bc9586f7f569473b808dc58e`
  - `.claude/primitives/STATE_MANAGEMENT.md` before the edit: sha256 `2ae7cb9413a9929455b9f115f3f860d12988ab47bc91f5c1ab6874f3b590f41f` (identical to `35ed18b`). In case (a) it may already carry the patch.
- If HEAD differs, any of the three hashes differs, or other paths are dirty, stop and report. Exception: if HEAD is a single commit on top of `35ed18b` whose only diff is `.claude/primitives/STATE_MANAGEMENT.md` and that diff matches the patch, treat it as path (a) and continue. R12-1 and R12-2 still diff against `35ed18b`. Do not revert or redo round 11's files.
- Frozen (byte-identical): everything except the one owned file. This includes the three round-11 files above (they stay as C verified them), all of `src/**`, `tests/**`, `docs/**`, `.github/**`, configs, every other `.claude/**` file (in particular `.claude/primitives-map.json` and `.claude/settings*.json`), and the protected files `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`.

## Scope (unchanged from round 11 scope item 4, D-21)
1. **`.claude/primitives/STATE_MANAGEMENT.md`, the `### Save flow` block only.** Make exactly the content of `a-round-11/state-management.patch`:
   ```
   -Batch:   writeMetadataBatch(modifiedFields only) → readBatch → skipSync=true → updateAll → setEditingMetadata({})
   +Batch:   writeMetadataBatch(modifiedFields only) → readBatch → skipSync=true → updateAll → failed empty ? setEditingMetadata({}) : keep edits
   +Batch failed non-empty (D-21): editingMetadata, modifiedFields, isDirty kept → Save stays enabled, retry writes to all selected files
   ```
   Nothing else in the file changes, and nothing else in `.claude/**` changes.
2. A writes `a-round-12.md` (Georgian, English technical terms). It records which unblock path was used, (a) or (b), the `git diff 35ed18b -- .claude/primitives/STATE_MANAGEMENT.md` output, and the verifyCommand result.

**Explicitly NOT in this round:**
- Any change to the three round-11 files. A-R11-02 (the `data-flow.md:115/:140` wording) is a separate docs signal.
- A-R11-01 (main `emptyMetadata` on read fail).
- C-R1-03 (`TESTING.md`), even though it is also `.claude/**`. It needs its own round.
- Any source, test or package change.

## File ownership (nothing else may change)
| May modify | Why |
|---|---|
| `.claude/primitives/STATE_MANAGEMENT.md` | D-21: the `### Save flow` Batch line must match `MetadataPanel.tsx` (C-R11-01) |

Logs and notes go to `a-round-12/` (A) and `c-round-12/` (C) in the loop folder.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R12-1 docs (= R11-8 remainder) | `git diff 35ed18b -- .claude/primitives/STATE_MANAGEMENT.md`; diff it against `a-round-11/state-management.patch` | The diff is limited to the `### Save flow` code block: the Batch line plus one D-21 line, with content equal to the patch. It matches `MetadataPanel.tsx` (reset only when `failed` is empty; edits, `modifiedFields` and `isDirty` kept otherwise; retry writes to all selected files). |
| R12-2 ownership + round-11 files intact | `git status --porcelain --untracked-files=all`; `git diff --quiet 35ed18b -- . ':!src/renderer/src/components/metadata-editor/MetadataPanel.tsx' ':!docs/learning/data-flow.md' ':!.claude/primitives/STATE_MANAGEMENT.md'`; `sha256sum` of the three round-11 files against `c-round-11/end-hash.txt` | Exactly 3 modified paths plus 1 untracked path (the new test). The three hashes equal the Baseline values. No other `.claude/**` file differs from `35ed18b`. |
| R12-3 gate | Clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0` once | Exit 0. Biome 0 errors (9 warnings, as on `35ed18b`). Typecheck 0. Renderer **112/112**, main **62/62**, E2E **7/7**; `--retries=0` 7/7. |
| R12-4 guard respected | Read `a-round-12.md` and A's result `permission_denials` | The edit was made with Edit (path b) or by the user (path a). There was no Bash write to `.claude/**`. If Edit was denied, the round is BLOCKED, not FAIL. |

**R11-5…R11-7 (real app) are not re-driven.** No source file changes this round, and R12-2 proves the three source/test/docs files are byte-identical to what C drove in round 11 (`c-round-11/r11-*.png`, `r11-normal-result.json`). If R12-2 shows any change to them, C re-runs R11-1…R11-7 in full instead.

**What realVerified means here:** R12-1…R12-4 are real local checks. Together with C R11 (R11-1…R11-7) they complete round 11's acceptance. Root can then publish rounds 11–12 together, after its verify and review. Windows packaging is not part of this round.

## What could break (C re-checks)
- An accidental change to another `.claude/**` file, or to `.claude/primitives-map.json`, which the user-level primitives hook reads (R12-2).
- An unintended touch to round-11 files while resolving the block (R12-2 hashes).
- Nothing at runtime: the primitive is agent documentation. R12-3 shows the gate is still green.

## Next (orientation only)
1. After round 12 passes, root publishes rounds 11–12. That closes TM-B15, C-R8-01 and C-R11-01.
2. Root links a `Check` Actions run on `35ed18b` or later. If it is green, TM-T0-CI, TM-T0, TM-T0-CI-FU and TM-B14 close.
3. Low items with no decision needed:
   - RR-R5-02 (`file-row-display.ts` `typeof` guard);
   - RR-R1-04/05 (`create-fixtures.ts`);
   - RR-R10-01/02 + A-R10-01 (E2E launch error polish);
   - A-R11-02 (docs);
   - A-R11-01 (needs a reproduction first).
4. If the user allows `.claude/**` edits: C-R1-03 (`TESTING.md:129` stale).
5. The Saba question batch is unchanged:
   - D-07 (TM-T1-MIG);
   - D-10 + TM-B11;
   - D-12/TM-B08 + B-R6-01;
   - TM-T1-DUP (RR-R3-01);
   - D-15 + RR-R5-01;
   - B-R7-02/RR-R8-04;
   - TM-B05, TM-B06, RR-R1-07, RR-R3-05;
   - TM-T2-DATA.
