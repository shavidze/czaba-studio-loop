# B round 410 → 411 planning (2026-11-08)

## 1. Round 410 result (independent evidence)
- **C round 410: PASS.** 8 rows, 0 bugs, `browserVerified`/`realVerified` true (`c-round-410.json`, `c-round-410.md`). The fake-bearer row is blocked because the backend is unavailable in the cloud.
- **Gate 410 published `328db74`** on both remotes (`gates/gate-round-410.json`). That commit is the baseline HEAD for round 411.
- **PERF-15a is done (D-29z1431).** PERF-15 is not done.
- **INFO-B411-CONTEXT-STALE:** `context/head-sha.txt` and `context/active-summary.md` still say `9616d3a`; the gate file wins.
- **A's reviewer Lows:**
  - S1 and S2 are fixed in round 411.
  - S3, S4 and GATE410-L3 go to `deferred_low_polish`.
  - GATE410-L1 is the same finding as TL-R410-SK-3, already deferred.
  - GATE410-L2 is the same finding as TL-R411-L4 and goes to 15b-ii.
- **Architecture note (A and gate):** recorded as signal SIG-R410-PEAKS-ARBITRATION, not scheduled.
  - Both reviewers say "keep for now". The proposal is a pure peaks-tracker helper, after PERF-15b.
  - No new checkpoint request: the feature is mid-way, and ARCH-CHECKPOINT-PERF11C-III-BOUNDARY on `ArrangementContext.tsx` is still unanswered by root and non-blocking.

## 2. Next task: round 411 = PERF-15b-i (`current-task.md`; round 410 archived in `tasks/round-410.md`)
- **Why now:** C reported no bugs, and no Critical or High finding is open. The open Mediums are root, manual or `awaiting_user` only. PERF-15 is next in the dependency order.
- **Not due yet:** REGRESSION-2026-11-10 (`regression-last.json` = 2026-11-07), and RETRO at round 416.
- **Promise:** a demo music preview shows its real waveform, dimmed and not seekable, while the MP3 is still loading, and the Studio does not recompute it once it is ready.
- **Contract (D-29z1427):**
  - committed peaks files for the two demo MP3s, generated from a Chromium decode;
  - the in-repo generator and meta file;
  - demo `peaksUrl`;
  - `credentials: 'omit'` and the cancel on refused bodies;
  - the preview strip tooltip.
- **Option (a) over (b):** committed files were chosen instead of a URL that 404s. They make the promise real for users and allow an unstubbed browser row.
- **Split (D-29z1428):** 15b-ii covers the purchased adapter's `peaksUrl`, the streamed-bytes cap and a Firefox probe, and closes PERF-15. This is staging, not a scope cut.
- **Consults (D-29z1429):**
  - `product-designer`: keep the dimmed state and add the tooltip.
  - Reference: Live 12 manual 5.1.2 (`.asd` files): a match.
  - `tech-lead` on v2: APPROVE WITH LOWS (M1 and L2 fixed). On v4: APPROVE WITH LOWS (L6–L8 fixed). On v5: APPROVE.
- **Evidence on sketch v5** (sha `e9b149c4…`, 10 files; D-29z1430):
  - full vitest 264 files, 3,911/3,911;
  - covering 24 files, 425/425;
  - 10/10 mutants red;
  - browser at both viewports: HEAD shows 0 columns while the MP3 is held and runs 1 worker job per MP3; the sketch shows 96 dimmed columns with the tooltip and runs 0 jobs; the 404 and 8-bit fallbacks each run 1 job;
  - lane probe ok.
- **Artifacts:** everything is under `b-round-410/`. The claims are `claims-411.sh`, with the planning and sketch outputs and their diff.

## 3. Saba / root
- No new user decisions are needed, and no new root request.
- No dependency request: the generator uses the existing `@playwright/test` devDependency.

## 4. Ready for commit
Round 410 is already published. Round 411 is ready for A.

## 5. Decision
**CONTINUE.** Many scoped items remain (`b-next.json`), and nothing needs external input.
