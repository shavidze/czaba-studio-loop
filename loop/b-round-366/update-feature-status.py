import sys, os
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = L + '/b-round-366/update-feature-status.done'
if os.path.exists(done):
    sys.exit('already applied')
p = L + '/feature-status.md'
s = open(p).read().split('\n')
old = 'B (round 365 → round 366 დაგეგმვა, D-29z1195…D-29z1200)'
assert old in s[2]
s[2] = s[2].replace(old, 'B (round 366 → round 367 დაგეგმვა, D-29z1201…D-29z1205)')
i = next(k for k, l in enumerate(s) if l.startswith('  - **Round 366 = PERF-9b-i — მუშავდება'))
assert s[i + 1].startswith('  შემდეგი (D-29z1200):')
s[i] = ('  - **Round 366 = PERF-9b-i — მზადაა (C round 366 PASS, `browserVerified` true, `realVerified` true; gate 366 გამოქვეყნდა `d53d113`; D-29z1201).** '
        'გაიარა: CLAIMS, SOURCE-SCOPE, PERF (7/7 assert, warm-ready-ratio 0.184, 3 sample), C-ის საკუთარი mutant (offline fallback-ის მოხსნა → `stem.blocked.ready` წითელი), '
        'PROBE 1440×900 და 1280×720, AUDIO (cold/warm/blocked დაკვრა, WAV sha256 იდენტური), G366-AUTH ორივე viewport-ზე, DOCS. blocked: fake-bearer 500 (fails closed, backend-only). '
        'A-მ sketch-ი code-reviewer-ის ორი Medium-ის გამო შეცვალა (B-ს არ ჰქონდა განჩინება) → RETRO 368 input B-R366-SKETCH-MEDIUMS-UNRULED. '
        'A-R366-REVIEW-* (10 Low, perf spec) → `deferred_low_polish` (D-29z1202). მტკიცებულება: `c-round-366.md`, `c-round-366.json`. '
        'ძველი ჩანაწერი: ' + s[i].split('**', 2)[2].strip())
new = [
    '  - **Round 367 = PERF-9b-ii — მუშავდება (D-29z1203).** SYS-R365-STEM-CACHE-HARDENING: `stem-cache.client.ts`-ის ჩაწერის დისციპლინა — IndexedDB-ის ჩაწერა სრულდება მხოლოდ transaction `complete`-ზე (`transactionDone`), '
    'abort/disabled-ის ხელახალი შემოწმება put-მდე, hit-ის 404/410 წაშლა პასუხს აღარ აყოვნებს და pending ჩაწერის შემდეგ სრულდება, clone/headers guard-ები, სესიის commit chain (budget-ის გადაჭარბება აღარ ხდება). '
    'ახალი row-ები SC22–SC29 (მათ შორის fake IndexedDB + OPFS-ით browser store-ის integrity — C-R365-OBS-INTEGRITY-ის unit ნახევარი). B-ის sketch v1-ში tech-lead-მა 2 High იპოვა; v2-ში ყველა განჩინებულია (`b-round-366/sketch-review.md`). '
    'B-ის pre-check: full suite 250 ფაილი / 3684 ტესტი, 13 mutant წითელი, production probe HEAD-სა და sketch-ზე ორივე viewport-ზე (truncate / delete-file / stale-etag — აღდგენა და დაკვრა), ორი mutant build წითელი. Doc 236 → Completed.',
    '  შემდეგი (D-29z1205): round 367 PERF-9b-ii → RETRO 368 (ფანჯარა 353–367) → REGRESSION (პირველი დაგეგმვა 2026-11-08-ზე ან შემდეგ, რომელიც RETRO არ არის) → PERF-11 → PERF-12…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule). Root-ს: ARCH-CHECKPOINT-PERF9-STEM-CACHE (არ ბლოკავს).',
]
s[i + 1] = '  ძველი (round 366-ის დაგეგმვა): ' + s[i + 1].lstrip()
s[i + 2:i + 2] = new
j = next(k for k, l in enumerate(s) if l.startswith('| STUDIO-PERFORMANCE | **მუშავდება ('))
s[j] = s[j].replace('| STUDIO-PERFORMANCE | **მუშავდება (', '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1203: PERF-9a და PERF-9b-i მზადაა (C rounds 365/366 PASS, gates `413218e`/`d53d113`); round 367 = PERF-9b-ii (stem cache-ის ჩაწერის დისციპლინა); PERF-9c — awaiting_user, PERF-9d — root | ', 1)
open(p, 'w').write('\n'.join(s))
open(done, 'w').write('ok\n')
print('ok')
