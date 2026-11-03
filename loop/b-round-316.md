# B round 316 → 317 planning

**Date:** 2026-11-03
**Baseline:** HEAD `c136dfd` plus A's round-316 tree (40 entries). Gate 316 was `skipped`, so the baseline commit is unchanged.
**Decision:** CONTINUE → round 317 = PERF-7 fix-up for C-R316-01.

**Advisor:** available, and consulted after orientation. Its advice was adopted:
- keep `b-round-315/fonts-src` as the record and write a corrected set in `b-round-316/fonts-src`;
- grant the minimum (4 woff2 + 4 pins + doc 229);
- re-measure `/store` pixels and run a full byte sweep before dispatch;
- add the BYTE-IDENTITY and FONT-BYTES rows;
- record B's unevidenced "moves by itself" attribution;
- add L29/L37 clauses instead of new lines;
- PERF-7 stays in progress.

## 1. Round 316 ruled (D-29z855)
- **C round 316: FAIL.** 13 rows PASS; FONT-PIXEL FAIL on **C-R316-01** (Medium, origin B). `browserVerified` and `realVerified` are true.
- **Gate 316:** `skipped` (C taskStatus FAIL). Nothing was published.
- **PERF-7:** in progress, not done (feature-status: ბაგია for round 316, მუშავდება for round 317).
- **Archive:** `tasks/round-316.md` is a byte copy of the old `current-task.md`.
- **Evidence used:** `c-round-316.json`, `c-round-316.md`, `gates/gate-round-316.json`. B re-ran the byte and pixel checks for the finding itself (§2); B did not re-run C's other rows.

## 2. C-R316-01, confirmed independently (D-29z856)
- **Byte sweep** (`b-round-316/byte-identity-317.py`, pinned Chrome UA): the 3 HEAD Google CSS URLs give 83 faces, which map 1:1 onto our 25 files.
  - **Before the fix:** 21/25 identical. The 4 Playfair files differ.
  - **After re-fetching the `/s/playfairdisplay/v40/` files:** 25/25 identical, 0 kit URLs.
- **Root cause:** B's round-315 `playfair.css` contained 16 `/l/font?kit=` URLs. The Inter and Studio CSS had none.
- **Corrected manifest:** `b-round-316/fonts-src/manifest.json` (16 URLs replaced, 0 kit).
- **B's error:** in round 315, B called the 2,015 px `/store` HEAD-vs-HEAD band a band that "moves by itself". That was unevidenced. C's control was 0 px, and B's re-run today is also 0 px. C's explanation (B's control load caught Playfair before it swapped in) is recorded as an inference.

## 3. Round 317 scope and B's pre-check (D-29z857)
**Scope:**
- `cp` the 4 Playfair woff2 files;
- `cp` the test sketch, which changes only the 4 sha strings;
- doc 229: l.4 becomes round 317, plus one Problem → Solution entry and the two new row names.

Nothing else changes: not `fonts.css`, the notices, TL10 or the round-316 grants.

**Pre-check on `/tmp/b317s`:**

| Check | Result |
|---|---|
| sha check | 25 OK |
| 3 covering files | 87/87 |
| Mutants | equal to round 316 (12 red, restored 17 passed) |
| MU-KIT-BACK (old kit file put back) | FN3 red |
| HEAD and fix production builds | rc 0 |
| `/store` and `/studio-lab` pixels | 0 px HEAD vs fix at 1440 and 1280, with 0 px HEAD-vs-HEAD controls |
| `/` pixels | inconclusive (the hero animates) |
| woff2 body sha256 per route on 4 routes (`probe/font-bytes-summary.txt`) | equal HEAD (gstatic) vs fix (our origin) |

**Claims:** `b-round-316/claims-317.sh` K1–K15, with the head and sketch outputs. K15 checks `tree-316-sha256.txt`, the content hashes of the 40 paths as A left them (C's SOURCE-SCOPE expects 34 OK and 6 FAILED after A). A-REVIEW is required and short (6 paths).

## 4. Bookkeeping (D-29z858)
**Backlog v276:**
- round 316 is `c_fail`, and round 317 is added as `dispatched`;
- the PERF-7 stage and STUDIO-PERFORMANCE statuses are updated;
- added to `open_findings`: C-R316-01 (open, fix in round 317), A-R316-REVIEW-P4 (signal) and INFO-B315-CONTROL-ATTRIBUTION;
- added to `deferred_low_polish`: A-R316-REVIEW-P1 and P2 (fix home STORE-2c).

**`lessons.md`:** L29 gains the mirrored-bytes clause and L37 the control-pair clause. It stays at 59 lines.

**Backups:** `b-round-316/{backlog-before-317.json, feature-status-before-317.md, lessons-before-317.md, b-next-before-317.json}`.

**Schedule:**
- REGRESSION is not due: `regression-last` is 2026-11-02, so the next falls on or after 2026-11-05.
- RETRO is at round 320.
- No architecture checkpoint: one small owner set, no structural risk.
- No consult this round: it is a mechanical byte fix that both C and B measured.

## 5. Next
After C PASS and gate 317, PERF-7 is done. Round 318 is REGRESSION if its planning falls on or after 2026-11-05. Otherwise it is PERF-8, with the zustand `root-deps-request.json` filed at that dispatch.

**Commit readiness:** not yet. The 40 paths are commit-ready only after C PASS of round 317 and the gate. Root checks the woff2 files against `b-round-316/fonts-src/fonts-sha256.txt`.
