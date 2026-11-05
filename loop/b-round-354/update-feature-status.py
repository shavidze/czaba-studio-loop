import pathlib, sys
P = pathlib.Path('feature-status.md')
DONE = pathlib.Path('b-round-354/update-feature-status.done')
if DONE.exists():
    sys.exit('already applied')
s = P.read_text(encoding='utf-8')
old_head = "  - **Round 354 = PERF-CAND-VIDEO-TRIM-FADE-COST ეტაპი 2 — მუშავდება (D-29z1138/D-29z1139).**"
new_head = "  - **Round 354 = PERF-CAND-VIDEO-TRIM-FADE-COST ეტაპი 2 — მზადაა (D-29z1140).** C round 354 PASS, `browserVerified`/`realVerified` true, 0 bug (`c-round-354.json`: PERF 82/82, 0 NEW, `durationMs` 478956; VIDEO-DRAG-SMOKE ორივე viewport-ზე; G354-AUTH); gate 354 გამოქვეყნდა `7219291`. fake-bearer row BLOCKED (mock :5199 გამორთულია) — backend-ის ღია მტკიცებულება. gate-ის Low-ები: GATE354-S1 → PERF-CAND-VIDEO-MOVE-BUDGET, GATE354-S2 ruled (D-29z1141). ძველი აღწერა:"
assert s.count(old_head) == 1
s = s.replace(old_head, new_head)
old_next = "  შემდეგი: round 354 → REGRESSION 2026-11-08-დან (ორ ნაწილად) → SYS-R353-DP-TEST-POLISH →"
assert s.count(old_next) == 1
add = ("  - **Round 355 = SYS-R353-DP-TEST-POLISH — მუშავდება (D-29z1142).** მხოლოდ ტესტი: `drag-preview-render.test.tsx`-ის DP69 (release-ზე overlay-ში 0 ჩანაწერი), DP70 (caption-ის ცარიელი check-ის ნაცვლად committed trimStart-ის gap Undo/Redo-ით), DP72 (მანძილი > 0.01, ზუსტი committed start, 20 ms-ის ნაცვლად fake `setTimeout`) და doc 232. B-ის sketch 74/74; ყოველ გამკაცრებულ assert-ს აქვს mutant, sketch-ზე წითელი და HEAD-ზე მწვანე (`b-round-354/sketch/mutant-summary.txt`). ხურავს A-R350-REVIEW-TEST-NITS, A-R352-REVIEW-COMMIT-EXACT, A-R352-REVIEW-DRAG-DISTANCE, A-R352-REVIEW-WINDOW-PRECONDITION C PASS-ის შემდეგ.\n"
       "  შემდეგი (D-29z1144): round 355 → PERF-CAND-VIDEO-MOVE-BUDGET (GATE354-S1-ის ჩათვლით) → PERF-CAND-MASTER-GROUP-FADER-PROPS (თუ ARCH checkpoint-მა უპასუხა; თუ არა — PERF-CAND-FADE-RELEASE-COMMITS ან PERF-9) → PERF-9 … PERF-15 → STEM-LANES → SYS-1…3 → STORE-2b…5. დაგეგმვა 2026-11-08-ზე ან შემდეგ ჯერ REGRESSION-ს უშვებს. parallel lane-ები (COPY-PD, SRW-21-PLAN) root-ისაა (D-29z1143).\n"
       "  ძველი (round 354-ის დაგეგმვა): ")
s = s.replace(old_next, add + old_next.lstrip(), 1)
P.write_text(s, encoding='utf-8')
DONE.write_text('ok\n')
print('ok')
