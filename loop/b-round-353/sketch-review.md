# Sketch review — round 354 (PERF-CAND-VIDEO-TRIM-FADE-COST stage 2)

**Dispatched sketch:** `sketch/budgets.patch.txt` sha256 a37013a46acb825b7a60d59578385f17c7163c19b012c95e48f635f2a122b027; resulting `perf/budgets.interactions.json` sha256 c212eecfa1aa2c12682c59ec4e59f2623fbc20b72142f138f0a899e00f886788 (`sketch/budgets-dispatched.sha256`).
**Measured file:** the sketch and M-B2′ perf runs used `sketch/budgets-run1.sha256` (49d4c115031302bf63e25a418907fc228c1471042727126228beb14e863b7856); it differs from the dispatched file only in the 12 `note` strings (TL-R354-1). The harness does not read `note`. The M-B2 run used the dispatched file (`perf-mu-b2.sha256`).
**Doc patch:** `sketch/doc232.patch.txt` (sha256 in `sketch/doc232.sha256`), made by `sketch/apply-doc232.py`.

**Reviewer:** `tech-lead` (stands in for code-reviewer, which is not on B's consult list; ROOT-REQ-B-CONSULT-CODE-REVIEWER). It reviewed the run-1 patch.

| id | severity | finding | ruling |
|---|---|---|---|
| TL-R354-1 | Low | note text "three equal samples, 1x stopped/playing" wrong for single-state rows; "ceiling" odd on == rows | **fixed in the sketch**: three note forms (harness / == / <=) in `apply-budgets.py` |
| TL-R354-2 | Low | owner `PERF-CAND-VIDEO-TRIM-FADE-COST-2` is new | **fixed in the sketch**: doc 232 section 106 defines it |
| margin | info | one extra stopped window commit fails per-move trim (782/60 = 13.03) and fade (4-component commit) | ruled: correct signal (stopped has no clock; 59/60 commits in every stopped sample); C reads `windowCommits`/`componentsSum` before calling a regression |
| fade release | info | keep video-fade release-commits record | agreed (PERF-CAND-FADE-RELEASE-COMMITS) |

**Medium+:** none.

**Mutant logs (L58):** `perf-mu-b2prime.log` + `perf-mu-b2prime-results/latest-interactions.json` (16 red; RED lines in `perf-summary.txt`), `perf-mu-b2.log` + `perf-mu-b2-results/latest-interactions.json` (see `perf-summary.txt`). Control: `perf-sketch.log` (rc 0, 82/82).
