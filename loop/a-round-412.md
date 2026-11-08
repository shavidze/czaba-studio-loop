# A round 412 — PERF-15b-i fix-up (A-R411-REVIEW-M1)

**Status:** READY FOR C. No STOP.

## Changed this round
- `scripts/peaks/generate-demo-peaks.mjs`, `app/data/__tests__/studio-lab-demo.test.ts`: `b-round-411/sketch-412-delta.patch.txt` applied byte-for-byte (sha256 `833196f8…`, equal to `sketch-dispatched.sha256`). Not edited afterwards.
- `docs/implementation/2026/quarter-IV/264-perf-precomputed-peaks-demo.md`: edited as ruled.
  - l.4 is byte-exact `**სტატუსი:** In Progress (stage 2 of 3; C round 412 PASS)`.
  - l.17 cites v5 and v6.1 (`833196f8…`).
  - Generator bullets: fixed 44.1 kHz rate, `response.ok`, `finally`, writes after both decodes, and the `rate / 100` ↔ `PEAK_BUCKETS_PER_SECOND` note (L-b).
  - Bearer line reworded (L5).
  - Two Problem → Solution bullets: M1, and L3/L-c.
  - Regeneration wording is scoped to the runner's HeadlessChrome 143 build (L-f).
  - PS17 description updated.
  - A's checks are round 412.
  - The 13 `MU-` lines equal `b-round-411/mutants/summary.txt` (diff empty).
  - 0 lines say `C round 411`.
- Round 411's tree was kept (no revert). Doc 263 was not touched. The restore fallback was not needed: K2 was not total 0.

## Checks (logs in `a-round-412/`)
| # | Result |
|---|---|
| A1 | `claims-start.txt` is identical to `b-round-411/claims-412-planning-output.txt`. stderr 0 bytes |
| patch | `git apply --check` clean, then applied. Cumulative patch applied on `git archive HEAD` vs the working tree: 10/10 files identical (C's row 2 check, done as a self-check) |
| A2 | typecheck rc 0 (`typecheck.log`). lint rc 0 (`lint.log`). `npx biome check app/data/__tests__/studio-lab-demo.test.ts` rc 0 (`biome-test.log`) |
| A3 | `covering.txt` (24 files): 425/425, rc 0 (`covering.log`, `covering.json`, `slowest.txt`). Slowest test: render-budget, 1,719 ms of 15,000 ms (11 %). Detail-panel row: 1,393 ms of the 5,000 ms default (28 %). None above 50 % |
| A4 | `claims-end.txt`, stderr 0 bytes. The diff against planning (`claims-planning-vs-end.diff`) touches only K5 (`no`), K6 (l.4 = 412, mentions 20, mutant-lines 13), K7, K8 and K23 (0, because the bearer sentence moved from l.31 after the 3 inserted generator lines and was reworded). K7 and K8 equal `claims-412-sketch-output.txt`. K3, K9 and K10 are unchanged. Frozen: 1,300 entries, rc 0 (`frozen-end.txt`). Protected: rc 0 |
| status | 12 lines: 7 ` M` and 5 `??` (`status-end.txt`). The same paths as at the start |
| A5 | `code-reviewer` on the 2 delta files and doc 264: **no Medium or higher** (score 9/10). Findings below |

A did **not** regenerate any peaks or meta file, and ran no browser.

## Reviewer findings (A5)
- **Low, doc:** `npm run lint` does not cover `scripts/` (Biome `includes` is `app/**` only). → Fixed in doc 264: it says the generator is outside Biome and was checked by reading. The config change is for B/root (see below).
- **Low, doc:** the doc did not say which generator produced the committed files. → Fixed in doc 264: the committed files are the bytes B's reviewed sketch shipped (the exact generator revision is not sourced in `tasks/round-411.md`, so the doc does not claim one), and a v6.1 regeneration on this runner gives byte-identical output (B's K10; C repeats it in a scratch, row 6c). End claims re-run after this edit: the same 5 lines differ (K5, K6 with mentions 20, K7, K8, K23); K22 is still 1; `C round 411` count is 0; status has 12 lines.
- **Info, doc:** "no half-written set" holds for decode failures, not for write failures. → The doc wording is narrowed to "on a decode error".
- **Info, code (no change, patch is byte-for-byte):** the `ctx.sampleRate` check is a safety net. The 48 kHz cross-check in PS17 adds little beyond the meta-rate check (MU-412-REGEN-48K covers the real case).
- No Architecture note.

After the review, only doc 264 changed (doc fixes). No code changed after the review.

## Known gaps
- Mutants (row 6b), scratch regeneration (6c) and all browser rows (3, 4, 5, 7) are C's to run. A ran none of them.
- A did not run the full suite, build or verify; those are gate rows.

## Exact next C checks
Order (L59): row 6, then 4, then 3 and 5, then 1/2/7–11.
- **6a:** the same `covering.txt` run, 425/425.
- **6b:** `S=/tmp/c412-scratch OUT=<loop>/c-round-412/mutants FIX=<loop>/b-round-411/fixtures/regen-48k python3 -I b-round-411/mutants/run.py`. Pass: 13/13 RED, pristine before and after rc 0.
- **6c:** `node scripts/peaks/generate-demo-peaks.mjs` in the scratch with `:5173` up. Pass: the sha256 of the 3 files equals the tree's, and the scratch status has 0 lines.
- **Row 3:** compare the held vs ready `heights` (max |diff| ≤ 0.0001 per viewport).
- **Row 5b:** `peaks-probe-410.mjs`. It was not run in round 411.
- **Row 8:** the doc 264 checks (l.4, the 7 headings in order, 13 `MU-` lines, no `C round 411`).
- **Row 9:** the Reference row.
- **Row 10:** the ArrangementLibraryPreview diff is +1/−0.

## For B / root
- **Proposal (config, not in grants):** add `scripts/**/*.mjs` to Biome `includes`, or record that `scripts/` stays outside lint. `scripts/check-agents.mjs` has the same gap.
- No Architecture note from the reviewer. SIG-R411-PEAKS-URL-COPIES stays as B recorded it.

## Scope completed
Only §2 items 1–4 of the task. A4/A5 passed as written. Whether the B acceptance rows pass is C's call. PERF-15b-i is not self-marked done.
