# tech-lead review of the round-507 sketch (B round 506 -> 507, 2026-11-14)

Reviewed: v1 `sketch-507-v1.patch.txt` (sha in `sketch-sha-history.txt`), applied tree /home/runner/b506-scratch. Read-only review.

**Verdict: APPROVE WITH CONDITIONS.** No finding at Medium or above.

## Findings and B's ruling for each
| # | Finding (Low) | Ruling |
|---|---|---|
| 1 | Doc 328 cites `b-round-506/mutants-507.txt`, which did not exist (only `mutants-507.py` and `mutant-logs/summary.txt`) | Fixed: `mutants-507.txt` is now written (a copy of the v2 run summary) and is a K12 artifact |
| 2 | "docs 320–327" includes 323, which is not a 2a–2e doc | Fixed in v2: "docs 320–322 და 324–327" |
| 3 | Doc 328 and DESIGN_SYSTEM say Close sits "on the title column"; `.audio-player` is fixed and Close is at the player's right edge | Fixed in v2: "player-ის მარჯვენა კიდესთან" in both |
| 4 | "ზომა იგივეა" holds only for the icon; the buttons grow 36 → 40 px | Fixed in v2: "ღილაკი 36 → 40px, icon-ის ზომა 20px უცვლელია" |
| 5 | The status line says "C round 507 PASS" before C runs | Pre-ruled Low #3 (L28 contract, the same as 2e/327) |
| 6 | Close goes from opacity 0.6 to 1, so it becomes more prominent | Intended: product-designer dropped `opacity-60` because it hurts contrast at rest (`consult-product-designer.md` §3). Recorded as D3 |
| — | The test's `useAudio` mock spreads `...audioMock.state` (dead; hides a regression that reads fields off the hook result) | Fixed in v2: the mock returns `audioMock` (`{ state, ... }`, like the real hook) |
| — | `as const` in the test (type-assertion rule) | Fixed in v2: typed `ReadonlyArray<IconControlRow>` / `ReadonlyArray<string>` |
| — | Doc 328's press entry does not mention the global `button:active` scale 0.98 | Fixed in v2: the Problem/Solution entry names it |
| — | `title` duplicates `aria-label` (NVDA may read it twice); IconButton sets no `type="button"` | Pre-ruled Lows #4 and #5 (shared IconButton pattern; the player is not inside a form) |
| — | N1-1's `tagName` check is close to vacuous; N1-3/N1-4 re-check IconButton internals | Pre-ruled Low #2 (the useful parts are the title, position, size and retired-token asserts; M3–M6 prove them) |

The delta v1 → v2 is in `sketch-delta-v1-v2.diff.txt`. After v2, B re-ran the following:
- mutants M0–M6 (all OK, `restored rc 0`);
- tsc rc 0 and lint 175 warnings;
- Biome on the 2 code/test files;
- covering: 8 files, 86 tests (two product-price files added after the K8 sweep);
- the full suite and the build (`precheck-full-raw-v2.log`, `precheck-build-sketch.log`).
