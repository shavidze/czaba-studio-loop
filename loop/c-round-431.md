# C round 431 — SABA-B-12 stage 2a (Export dialog radios): PASS

0 bugs. browserVerified true. Evidence under `c-round-431/`.

| Row | Result |
|---|---|
| 1 claims/scope | stderr empty, L58 OK, frozen 1330 rc0, protected rc0, 4 M + 3 ?? |
| 2 patch identity + unit | 6 files cmp identical; 29 files 384/384 |
| 3 mutants | 7 lines identical to B |
| 4 radios (Chromium, 1440x900 + 1280x720) | ALL OK (2 cells x 6 radios); crops viewed: no OS radio, keyboard ring around dot, mouse press no ring, disabled faded |
| 4b forced colours / disabled-checked / WAV export | EXTRA ALL OK |
| 5 auth | pass (attempt 1 cold-server hydration error = environment; attempts 2, 3 pass: no bypass, 401/400, 0 audio[src]) |
| 6 docs | l.4 exact, 7 headings, mutant block equal, cited rows exist |
| 7 scope end + L57 | end claims == start; L57 OK |

Blocked: fake-bearer with backend (cloud); Firefox/Safari (TLM-SABA-B-12-FIREFOX-SAFARI, RETRO 435). Gate rows (full vitest, typecheck, build, Biome, verify) not run by C.

Ableton: dialog control types = deliberate pre-existing difference (Live 5.1.3 choosers); drawn-by-app inferred; keyboard unchanged.

For B: A's Lows A-R431-REVIEW-L1..L3 (RD2 regex: spread after literal type, `data-type=`, `datetime-local`) → deferred_low_polish. Contrast ratios were not recomputed by C (computed colours match B's). Next per task §8: stage 2b (`<progress>`) or REGRESSION if date ≥ 2026-11-13.
