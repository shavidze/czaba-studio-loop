# B round 350 → 351 planning

**Decision: CONTINUE.** Round 351 = PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 fix-up (`current-task.md`; archive of round 350's task: `tasks/round-350.md`).

## Inputs read
- `context/active-summary.md`; gate 350 = `skipped` ("C taskStatus FAIL"), so the baseline stays `7f56989` (gate 349, published). A's three round-350 files remain in the tree.
- `a-round-350.md`: STOP on A-MUTANT (DP71 is not red on M-B2), everything else PASS.
- `c-round-350.md` / `.json`: FAIL on C-R350-01 (Low, a B spec defect). `browserVerified`/`realVerified` are true. PERF, NAMES, BEHAVIOUR, RELEASE, PLAY-SYNC and G350-AUTH all passed.
- `lessons.md` (L10, L56, L57, L58).
- `backlog.json`: grepped by id only.

## Backlog updates from independent C evidence (v312 → v313, D-29z1118…D-29z1122)
- **Round 350 → `c_fail_spec`.** The code is C-verified, but the round failed on the mutant pair B named. PERF-DRAG-PREVIEW is **not done**.
- **C-R350-01 ruled (D-29z1119), option (a):**
  - M-B2 keeps the scope it really has: DP66 and DP67 turn red, DP71 stays green.
  - M-B2′ turns DP66, DP67 and DP71 red (the render half).
  - A-M5 turns DP71 red (the mutation half).
  - B re-ran control, M-B2, M-B2′ and A-M5 on scratch (`b-round-350/mutant-*.log`). The results equal A's and C's logs.
- **A-R350-REVIEW-SEEK-TEST** (reviewer Medium, a test gap) is closed in round 351 by DP72 (D-29z1120).
  - B's sketch: `b-round-350/sketch-dp72.patch.txt`.
  - The file passes 74/74 in 9.97 s. DP72 is also green on the HEAD dock.
  - Mutant M-B5 (the seek effect loses its preview subscription) turns it red.
- **To `deferred_low_polish` (D-29z1121):**
  - A-R350-REVIEW-CACHED-TRACKS;
  - A-R350-REVIEW-TEST-NITS;
  - C-R350-OBS-FADE-COVERS-TRIM (pre-existing at 1280×720: the fade-in handle covers the centre of the trim-left handle).
- **Architecture signal A-R350-ARCH-PREVIEW-READER:** keep the reader while it has one consumer and extract it when a second consumer appears. It joins ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE and is **not scheduled**. That checkpoint request is still open with root and does not block this round.
- **RETRO moves 351 → 352** (window 336–351). The ROOT-REQ-PERF-TIMEOUT deadline moves with it. Retro candidate RC-R350-MUTANT-PAIR-UNRUN.

## Round 351 in one paragraph
A applies B's DP72 patch to `drag-preview-render.test.tsx` and edits doc 232 (l.4 → `C round 351 pending`, plus the ruling text and the DP72 bullet). The dock stays byte-identical: sha256 `037f62fa…`, the same file C verified in round 350. C therefore cites the round-350 PERF, NAMES, BEHAVIOUR, RELEASE and PLAY-SYNC evidence by hash. This round C runs:
- CLAIMS and SOURCE-SCOPE (with the hash);
- READ and UNIT (74/74);
- the jsdom MUTANT rows (M-B2, M-B2′, A-M5, M-B5);
- the browser M-B2′ names probe, which round 350 never claimed;
- a NAMES smoke at 1440;
- G351-AUTH at both viewports;
- DOCS.

Claims: `b-round-350/claims-351.sh`, with saved planning and sketch outputs.

## Why not COMPLETE / BLOCKED
- **Not COMPLETE:**
  - PERF-DRAG-PREVIEW and the rest of STUDIO-PERFORMANCE are open;
  - STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and the phase-2 entries remain;
  - the deferred Lows are open.
- **Not BLOCKED:** nothing external is needed. The open Mediums are root, manual or awaiting_user only.
- **Purchase protection:** G350-AUTH passed at both viewports, and round 351 carries G351-AUTH.

## Advisor
The configured `advisor` tool was available and used twice: before writing (it confirmed ruling (a) and pushed DP72's red-proof and the browser half of the mutant) and before hand-off (it asked to re-run the carried mutants with DP72 present: control 7/7, M-B2 DP66/67, M-B2′ DP66/67/71, A-M5 DP71 — unchanged). No project subagent was consulted: this is a test and docs fix-up with no design or perf choice open.

## Ready for root
Nothing new to publish until C round 351 passes. Gate 350 was skipped, and the round-350 tree is carried into round 351.
