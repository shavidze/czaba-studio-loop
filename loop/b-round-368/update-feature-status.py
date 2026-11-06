# B round 368 -> 369: feature-status.md update. Run once from the loop root.
import pathlib, sys
P = pathlib.Path('feature-status.md')
DONE = pathlib.Path('b-round-368/update-feature-status.done')
if DONE.exists():
    sys.exit('already applied')
s = P.read_text()
old_head = 'განახლდა: 2026-11-06 · ავტორი: B (round 367 → round 368 დაგეგმვა, D-29z1206…D-29z1209)'
assert s.count(old_head) == 1
s = s.replace(old_head, 'განახლდა: 2026-11-06 · ავტორი: B (round 368 → round 369 დაგეგმვა, D-29z1210…D-29z1216)')
lines = s.split('\n')
i = next(k for k, l in enumerate(lines) if l.startswith('  - **Round 368 = PERF-9b-ii ხელახალი დავალება — მუშავდება (D-29z1208).**'))
assert lines[i + 1].startswith('  შემდეგი (D-29z1209):')
lines[i] = ('  - **Round 368 = PERF-9b-ii ხელახალი დავალება — მზადაა (C round 368 PASS, `browserVerified` true, `realVerified` true; gate 368 გამოქვეყნდა `29f4b4d`; D-29z1210).** '
            'გაიარა: CLAIMS, SOURCE-SCOPE, UNIT (stem-cache 35/35, source-fetch 6/6), DEDUP (P1/P2 storedA=true, putCalls=2), C-ის საკუთარი mutant (SC31 წითელი), '
            'INTEGRITY და VALIDATOR 1440×900 და 1280×720, PLAYBACK-EXPORT (sha იდენტური), G368-AUTH ორივე viewport-ზე, DOCS (`c-round-368.json`). '
            '**PERF-9b-ii — მზადაა; PERF-9-ის cloud ნაწილი (9a, 9b-i, 9b-ii) დასრულდა;** 9c — awaiting_user, 9d — root. '
            'დაიხურა C-R367-DEDUP-CANCELLED-WRITE (Medium), C-R367-STATUS-LINE-PREMATURE, C-R367-MUTANT-DELETE-SKIPS-PENDING-GREEN, A-R367-REVIEW-L-ABF, A-R365-REVIEW-L3…L6, C-R365-OBS-INTEGRITY. '
            'A-R368-REVIEW-L1 — Low (deploy race, თვითონ აღდგება), GATE368-L1/L3 და A-R368-REVIEW-L3 → `deferred_low_polish` (D-29z1211).')
lines[i + 1] = ('  შემდეგი (D-29z1216): **round 369 = RETRO 369** (ფანჯარა 353–368) → REGRESSION (პირველი დაგეგმვა 2026-11-08-ზე ან შემდეგ) '
                '→ SYS-R369-STEM-CACHE-WRITE-COORDINATOR (მხოლოდ თუ root-ის ARCH-CHECKPOINT-PERF9-STEM-CACHE დაამტკიცებს) → PERF-11 → PERF-12…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM '
                '→ STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule). Root-ს: ARCH-CHECKPOINT-PERF9-STEM-CACHE ახლა ვადაშია (`b-round-368/root-request-arch-checkpoint.md`, არ ბლოკავს).')
j = next(k for k, l in enumerate(lines) if l.startswith('| RETRO 353 |'))
lines.insert(j + 1, '| RETRO 369 | **მოწმდება** (D-29z1212…D-29z1216) — round 369 (ფანჯარა 353–368, 16 რაუნდი): `retros/retro-369.md`, `lessons.md` (60 ხაზი; l.3, L30, L58), '
                    '`user-review/screen-review-369.md` (ახალი კანდიდატი არ არის; SR-353-4 = SR-290-1/2-ის დუბლიკატი), სისტემური SYS-R369-STEM-CACHE-WRITE-COORDINATOR (პირობითი). '
                    'C ამოწმებს RT-* row-ებს, RT-SCREEN-ს, G369-AUTH-სა და STUDIO-SMOKE-369-ს ორივე viewport-ზე. |')
P.write_text('\n'.join(lines))
DONE.write_text('ok\n')
print('ok')
