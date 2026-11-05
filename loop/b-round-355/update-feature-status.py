import pathlib, sys, shutil
P = pathlib.Path('feature-status.md')
DONE = pathlib.Path('b-round-355/update-feature-status.done')
if DONE.exists():
    sys.exit('already applied')
shutil.copyfile(P, 'b-round-355/feature-status-before-356.md')
s = P.read_text(encoding='utf-8')

old_hdr = 'განახლდა: 2026-11-05 · ავტორი: B (round 353 → round 354 დაგეგმვა, D-29z1135…D-29z1139)'
assert s.count(old_hdr) == 1
s = s.replace(old_hdr, 'განახლდა: 2026-11-05 · ავტორი: B (round 355 → round 356 დაგეგმვა, D-29z1145…D-29z1148)')

old_head = '  - **Round 355 = SYS-R353-DP-TEST-POLISH — მუშავდება (D-29z1142).**'
assert s.count(old_head) == 1
s = s.replace(old_head, '  - **Round 355 = SYS-R353-DP-TEST-POLISH — მზადაა (D-29z1145).** C round 355 PASS, `browserVerified`/`realVerified` true, 0 bug (`c-round-355.json`: UNIT 74/74, MUTANT M-B1-LATE/FX-SHORTDRAG/M-B9 B-ის ტოლი, C-ის OWN-1/OWN-2, FAKE-TIMER-LEAK ორი shuffle, STUDIO-SMOKE-355 და G355-AUTH ორივე viewport-ზე); gate 355 გამოქვეყნდა `6588f08`. fake-bearer row BLOCKED (mock :5199 გამორთულია). gate-ის Low-ები GATE355-L1/L2/L3 → deferred_low_polish, L4 info, L5 და Architecture note → სიგნალები (D-29z1146). ძველი აღწერა:')

old_next = '  შემდეგი (D-29z1144): round 355 →'
assert s.count(old_next) == 1
add = ('  - **Round 356 = PERF-CAND-VIDEO-MOVE-BUDGET — მუშავდება (D-29z1147).** მხოლოდ budget-ები და doc 232: `interact.drag.video.stopped.move-components-per-move` `<= 24` → `<= 10`; video move-ის ორი max row `record` → `<= 13` / `<= 12`; 19 assert note-იდან მოძველებული „Record until …“ წინადადება იშლება (GATE354-S1, კლასით). assert row-ები 82 → 84. B-ის sketch და M-B2 mutant-ის production perf: `b-round-355/perf-summary.txt`.\n'
       '  შემდეგი (D-29z1148): round 356 → PERF-CAND-MASTER-GROUP-FADER-PROPS (თუ ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE-მა უპასუხა; თუ არა — PERF-CAND-FADE-RELEASE-COMMITS ან PERF-9) → PERF-9 … PERF-15 → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED. დაგეგმვა 2026-11-08-ზე ან შემდეგ ჯერ REGRESSION-ს უშვებს; RETRO 368-ზე ან STUDIO-PERFORMANCE-ის ბოლოს.\n'
       '  ძველი (round 355-ის დაგეგმვა): ')
s = s.replace(old_next, add + old_next.lstrip(), 1)
P.write_text(s, encoding='utf-8')
DONE.write_text('ok\n')
print('ok')
