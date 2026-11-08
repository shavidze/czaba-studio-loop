Dispatched sketch sha256: 833196f8ccf086ab4e8f3a32b3084926578eee7b487f70a1dcf2da55f68cdea2 (sketch-412-delta.patch.txt, v5 -> v6.1, 2 files)

# Sketch review, round 412 (PERF-15b-i fix-up for A-R411-REVIEW-M1)

Reviewer: `tech-lead` (read-only; `code-reviewer` is not on B's consult list). Reviewed = dispatched (L58).

## Review 1: v6 (delta sha 2b0332f7c2e7701d99be568ef3747e2212171ba71a66a4215f2590f6ac1136f8, kept as `v6/sketch-412-delta-v6.patch.txt`)
Verdict: **APPROVE WITH LOWS**. M1 resolved: the generator pins a 44100 AudioContext and throws if Chromium does not honour it. PS17 reads the meta rate, ties the header `sample_rate` and `samples_per_pixel` to it (folds A-R411-REVIEW-L1), and keeps `toBe(44100)` as the only line that catches a 48 kHz regeneration (MU-412-REGEN-48K). No Medium+.
- L-a: the `otherRate` ternary has a dead branch -> **fixed in v6.1** (fixed 48000).
- L-b: `rate / 100` still hardcoded in the browser-side generator; PS17 now ties it to PEAK_BUCKETS_PER_SECOND -> ruled: kept, doc 264 says so.
- L-c: per-file writes are not all-or-nothing -> **fixed in v6.1** (all files written after every decode succeeds).
- L-d: `browser.close()` in finally can mask the original error -> ruled Low, kept (dev script).
- L-e: `ctx.close()` not in a finally inside evaluate -> ruled Low, kept (closed with the browser).
- L-f: byte identity is proved on this runner and Chromium build only (CPU SIMD paths may differ by 1 LSB elsewhere; lengths and rate unaffected, PS17 stays green) -> doc 264 wording item for A.

## Review 2: v6.1 delta re-review (dispatched sha above; v6 -> v6.1 = `git -C /tmp/b412 diff HEAD~1 HEAD`)
Verdict: **APPROVE WITH LOWS**. No new defect at Medium or above. L-a and L-c fixed. Note: `mutants/summary.txt` line 1 reads "TEST-VARIANT v6 (tree)"; that is the runner's label for "the tree's own test file", and the run used the v6.1 test (titles in the JSON reports). L-b, L-d, L-e, L-f open as Lows (ruled above).

## Ordering matrix
Not applicable: no concurrency or ordering contract changes (generator write order is single-threaded; no runtime file in the delta, K11 = 0).

## Evidence (v6.1, scratch /tmp/b412)
- regeneration byte-identical to the committed files: `sketch-logs/regen-v6-identity.txt`
- mutants 13/13 red, pristine rc 0 before/after, scratch 0 lines: `mutants/summary.txt`; on the v5 test MU-412-META-RATE-48K and MU-412-HEADER-RATE-48K survive: `mutants/on-v5-test/summary.txt`
- tsc / Biome / covering rc 0, covering 24 files 425/425: `sketch-logs/rc.txt`, `covering.json`
- full vitest on v6 (v6.1 changes only one PS17 assertion line and the generator): 264 files 3911/3911 rc 0: `sketch-logs/full.json`, `full.rc`
- cumulative patch (HEAD -> v6.1, 10 files) applied to `git archive HEAD` equals the scratch: `sketch-logs/cumulative-identity.txt`
