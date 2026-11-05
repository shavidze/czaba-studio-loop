# B round 352 -> 353: feature-status.md update. Run once from the loop root.
import pathlib, sys
P = pathlib.Path('feature-status.md')
DONE = pathlib.Path('b-round-352/update-feature-status.done')
if DONE.exists():
    sys.exit('already applied')
s = P.read_text()
old_head = 'განახლდა: 2026-11-05 · ავტორი: B (round 351 → round 352 დაგეგმვა, D-29z1123…D-29z1126)'
assert s.count(old_head) == 1
s = s.replace(old_head, 'განახლდა: 2026-11-05 · ავტორი: B (round 352 → round 353 დაგეგმვა, D-29z1127…D-29z1134)')
lines = s.split('\n')
i = next(k for k, l in enumerate(lines) if l.startswith('  - **Round 352 = ეტაპი 1-ის fix-up 2 — მუშავდება'))
assert lines[i + 1].startswith('  შემდეგი: 352 fix-up 2')
lines[i] = ('  - **Round 352 = ეტაპი 1-ის fix-up 2 — მზადაა (D-29z1127).** C round 352 PASS, `browserVerified`/`realVerified` true, 0 bug '
            '(`c-round-352.json`: CLAIMS, SOURCE-SCOPE, READ, UNIT 74/74, MUTANT jsdom + browser M-B2′, NAMES smoke, G352-AUTH ორივე viewport, DOCS). '
            'gate 352 გამოქვეყნდა `a55543b`. **PERF-CAND-VIDEO-TRIM-FADE-COST ეტაპი 1 — მზადაა** (product row-ები C round 350, dock-ის hash-ით). '
            'დაიხურა C-R351-01, A-R350-REVIEW-SEEK-TEST, C-R350-01, A-R351-REVIEW-GLOBAL-SPY, A-R351-REVIEW-TRY-SPAN. A-ს სამი Low და gate 352-ის S1/S2 → `deferred_low_polish` (D-29z1128).')
lines[i + 1] = ('  შემდეგი: **round 353 = RETRO 353** (ფანჯარა 336–352) → round 354 = ეტაპი 2 (22 video row record → assert, მხოლოდ budget-ები; doc 232 l.4 L28-ის ფორმაზე) '
                '→ REGRESSION 2026-11-08-დან (ორ ნაწილად) → SYS-R353-DP-TEST-POLISH → PERF-CAND-MASTER-GROUP-FADER-PROPS → PERF-CAND-FADE-RELEASE-COMMITS → PERF-9 … PERF-15 '
                '→ SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5. PERF-DRAG-PREVIEW ჯერ არ არის მზადაა. '
                'Architecture checkpoint ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE root-ს ეთხოვა (D-29z1129, `b-round-352/root-request-arch-checkpoint.md`; არ ბლოკავს).')
j = next(k for k, l in enumerate(lines) if l.startswith('| RETRO 336 |'))
lines.insert(j + 1, '| RETRO 353 | **მოწმდება** (D-29z1130…D-29z1134) — round 353 (ფანჯარა 336–352, 17 რაუნდი): `retros/retro-353.md`, `lessons.md` (60 ხაზი; L28, L57, L58, l.3), '
                    '`tools/l57-check.py`, `user-review/screen-review-353.md` (SR-353-1…5, awaiting_user), სისტემური SYS-R353-DP-TEST-POLISH. C ამოწმებს RT-* row-ებს, RT-SCREEN-ს, G353-AUTH-სა და STUDIO-SMOKE-353-ს ორივე viewport-ზე. '
                    'შემდეგი: C PASS → round 354 = video ეტაპი 2. |')
P.write_text('\n'.join(lines))
DONE.write_text('ok\n')
print('ok')
