# C round 516: NONBRAND N4 (Home) — verdict FAIL (incomplete round)

Evidence: `c-round-516/` (n4/n4.json + screenshots, covering.log, mut-logs/, scanner.json, c3c7.json, claims.out). JSON: `c-round-516.json`.

## Summary
The code works in the real browser; the round is incomplete. A stopped on a covering-time clause (UT2 2,907 ms > 2,500 ms), so doc 334, the doc ledger and the code-reviewer step were never done. C8 fails and the round can't PASS.

## Rows
| Row | Result | Evidence |
|---|---|---|
| C0 | Frozen 1/2/4 rc 0; 3 tracked + 1 new test = 4 paths. Doc 334 (5th) missing | git status |
| C1 links | PASS at 375/1280/1440: 186×50 and 170×50, radius 8px, weight 600, w-fit, hover bg rgb(36,33,30) (1280/1440), keyboard ring present. Only y offsets differ from B's probe (≤0.5 px; mock API was up) | n4/n4.json, offers-*.png |
| C2 Close | PASS: 48×48, centre 40/40, glyph 24, contrast 7.06, title "Close", active on open, ring on keyboard, hover bg rgb(29,26,23), click closes, focus returns to "Browse Gift Cards" as in B, 0 page errors. Pressed scale recorded (0.9875) | n4.json, popup-*.png |
| C3 journey | PASS at 1440 and 1280, 0 page errors | c3c7.json, extra/c3-*.png |
| C4 copy | Only jsdom N4-2/B2E-6 (green). No separate browser copy diff | covering.log |
| C5 | 16 files/194 tests pass; N4-1/2/3×3/B2E-6 present. **UT2 2,907 ms > 2,500 ms** (A's STOP reproduced). Mutants M1–M12 all red, same as B | covering.log, mut-logs |
| C6 | `<button` 0; `buildButtonClassName(` 2; scanner 48, 0 SpecialOffers. Lint not rerun | scanner.json |
| C7 | `/studio-lab` demo opens with no credentials ("CZABA Studio — Demo collection"); `/studio/middle-east`, `/account/downloads` "Sign in required", no download link; `/api/studio-token` 401 with no Bearer, 403 with fake Bearer | c3c7.json |
| C8 | **FAIL**: doc 334 and ledger absent | — |
| C9 | claims-516.sh rc 0; `l57-check.py` named in the task does not exist, so not verified | claims.out |

## Bugs for B
- **C-R516-01 (Medium):** incomplete round; re-dispatch A for doc 334, ledger and code-reviewer only (applied sketch stays).
- **C-R516-02 (Low):** B's 2,500 ms clause and K13 "1,532 ms" are wrong; UT2 is a pre-existing 2.3–2.9 s repo scan. B should rule: per-test bound for UT2 or exempt by name. Also `l57-check.py` is missing from b-round-515.

## Gate rows (not claimed)
Full vitest, build, Biome-all, verify, e2e smoke, lint 171 (A's log).
