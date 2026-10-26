# A — Round 7 ანგარიში: TM-B12 (D-17, RR-R6-01) + RR-R6-02 pin

Baseline: HEAD `d52354da08ca15692338c254f43cd6b9a1d2774e`, working tree clean at start (verified).

## შეცვლილი ფაილები (only owned paths)
```
 M src/main/ipc/metadata.ts
 M tests/main/riff-info-nul.test.ts
?? tests/main/metadata-write-guard.test.ts
```
- `src/main/ipc/metadata.ts` — `writeTagsToFile` only. Inside `if (customFields.length > 0)` after the title workaround, `if (infoTags.length > 0) { loop }` → `if (infoTags.length === 0) { throw new Error('RIFF INFO tag is not available; custom fields were not written'); }` + unchanged loop (de-indented one level). The per-field `try/catch` and its pre-existing `// InfoTag write failed for this field` line are kept byte-identical except for indentation. No new comments, no `any`/`@ts-*`/`biome-ignore`, no new export/constant. Read path, `getRiffInfoTags`, `stripRiffNulTerminator`, `STANDARD_PROP_MAP`, handlers, error mapping and channels are untouched.
- `tests/main/metadata-write-guard.test.ts` (new, 4 tests (a)–(d) per task).
- `tests/main/riff-info-nul.test.ts` — added only case (i) `ICRD "2024\0"` → `year === 2024`, at the end of the TM-B10 describe; (a)–(h) unchanged.

## Deviation from task text (fact)
- The batch channel is **`meta:write-batch`** (`src/main/ipc/channels.ts:8`), not `meta:writeBatch`. The first red run failed (c) with `No handler for channel: meta:writeBatch`; I corrected the test to the real channel. C should use `meta:write-batch` in mutations/scripts.

## ტესტები, რეალურად გაშვებული
1. **Red** (untouched `metadata.ts`, `git diff --quiet -- src/` verified): `npx vitest run --config vitest.config.main.ts tests/main/metadata-write-guard.test.ts tests/main/riff-info-nul.test.ts` → exit 1, **2 failed | 11 passed (13)**.
   - (a) × `promise resolved "undefined" instead of rejecting`
   - (c) × `expected { succeeded: 2, failed: [] } to deeply equal { succeeded: 1, failed: [ … ] }`
   - (b) ✓, (d) ✓, riff-info-nul 9/9 ✓ (incl. (i) — **pin test, green before the fix**, taglib already parses `"2024\0"` as 2024; it tests library behaviour, not `src/`).
   - Log: `a-round-7/red-before-fix.log`.
2. **Green** (same command after fix) → exit 0, **13/13**. Log: `a-round-7/green-after-fix.log`.
3. **Full verifyCommand** after `rm -rf out test-results playwright-report tests/fixtures/*.wav`: `{ npx --yes tsx@4 tests/fixtures/create-fixtures.ts && npm run check && xvfb-run -a npm run test:e2e; }` → **exit 0**. Biome: 0 errors, 9 warnings (all in renderer files, none in `metadata.ts`; `npx biome lint` on `metadata.ts` and on the `d52354d` version both clean). Typecheck (node/web/test) passed as part of `check`. Renderer **107/107**, Main **55/55** (50 + 5 new), E2E **7/7**. Log: `a-round-7/verify.log`.
4. **E2E `--retries=0`**: `xvfb-run -a npx playwright test --retries=0` → **7 passed**. Log: `a-round-7/e2e-retries0.log`.
5. **Self mutation check** (in `/tmp/a-r7-mut`, copy + node_modules symlink, guard test file only):
   - M1 (restore `if (infoTags.length > 0)`): (a),(c) fail → killed.
   - M2 (guard moved before `if (customFields.length > 0)`, i.e. before the title workaround): (b) fails → killed; (d) still passed in this placement.
   - M3 (throw after `file.save()`): (a),(c) fail → killed.
   - M4 (`fields`→`field` in message): (a),(c) fail → killed.
6. **code-reviewer subagent**: no blocking defects. Low: (i) only pins library behaviour (expected — task defines it as a pin). Info: in (a) the bytes check alone would not catch the old code, but `saveCalls() === 0` does (test red on HEAD, confirmed). No change needed.

## Known gaps
- Real-app checks R7-4 / R7-5 (Electron UI single/batch save, ffprobe + music-metadata independent read, read-only batch failure toast) were **not run by A** — C's job.
- The guard branch is unreachable for real node-taglib-sharp WAV files (tag is always `CombinedTag`); proven only via the overridden-tag spy test (as task's honesty note says).
- Per-field silent `catch` (RR-R6-04/05) remains, as scoped.
- **Signal for B (fact + hypothesis, not acted on):** in M2 the guard was placed *before* the title workaround (`getRiffInfoTags(file.tag).length === 0` → throw, before `if (customFields.length > 0)`), yet (d) on a fresh `sample.wav` (no LIST/INFO) still passed. Fact: on that path `getRiffInfoTags` was non-empty before the title workaround ran. Hypothesis: node-taglib-sharp's RiffFile always provides an InfoTag in its CombinedTag on open, so the title workaround may be redundant for library-opened WAVs. This contradicts the task's assumption "the title workaround still creates the InfoTag". C: in R7-2 M2 with this placement, expect only (b) to fail, not (d).
- `red-before-fix.log` was regenerated after the channel-name correction; it shows the real red (`succeeded: 2, failed: []`), not the earlier false red "No handler for channel".

## Next checks for C
- R7-1: red set-up with `git show d52354d:src/main/ipc/metadata.ts` + both test files; expect exactly 2 failed (a),(c) / 11 passed; then green 13/13 on real tree.
- R7-2: M1–M4 as above (use `meta:write-batch`).
- R7-3: full verifyCommand from clean state + `--retries=0`; expect 107 / 55 / 7.
- R7-4, R7-5: real app under `xvfb-run`, raw INFO dump + ffprobe + music-metadata.
- R7-6: `git diff --quiet d52354d -- . ':!src/main/ipc/metadata.ts' ':!tests/main/metadata-write-guard.test.ts' ':!tests/main/riff-info-nul.test.ts'`.

## Acceptance status (A's own runs; C verifies)
- R7-1: A-side red/green run as specified — passed (realVerified for unit level).
- R7-2: A self-check, all four mutations killed — C must re-run independently.
- R7-3: verifyCommand exit 0 + E2E retries=0 7/7 — passed in A's run.
- R7-4, R7-5: **not run by A** (realVerified=false for A).
- R7-6: `git status` shows only the three owned paths — passed in A's run.

No commits, pushes, installs or deploys.
