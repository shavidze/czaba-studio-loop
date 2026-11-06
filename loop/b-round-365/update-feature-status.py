import sys, os
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = L + '/b-round-365/update-feature-status.done'
if os.path.exists(done):
    sys.exit('already applied')
p = L + '/feature-status.md'
s = open(p).read().split('\n')
old = 'B (round 364 → round 365 დაგეგმვა, D-29z1189…D-29z1194)'
assert old in s[2]
s[2] = s[2].replace(old, 'B (round 365 → round 366 დაგეგმვა, D-29z1195…D-29z1200)')
i = next(k for k, l in enumerate(s) if l.startswith('  - **Round 365 = PERF-9a — მუშავდება'))
assert s[i + 1].startswith('  შემდეგი (D-29z1194):')
s[i] = ('  - **Round 365 = PERF-9a — მზადაა (C round 365 PASS, `browserVerified` true, `realVerified` true; gate 365 გამოქვეყნდა `413218e`; D-29z1195).** '
        'გაიარა: CLAIMS, SOURCE-SCOPE, UNIT (12 ფაილი, 194/194), C-ის საკუთარი ორი mutant, CS-COLD/WARM/BLOCKED/CLEAR ორივე viewport-ზე, CS-AUDIO (cache-იდან რეალური ხმა, export WAV-ის sha256 ერთნაირი), CS-LEGACY, ONE-FETCH, G365-AUTH, DOCS. '
        'blocked: SSR dev-log-ის ნახევარი (stdout არ იკითხება) და fake-bearer 500 (fails closed). A-ის ორი STOP-ის განჩინება: K11 = 12 მიღებულია; sweep-ის შეცდომა იგნორირდება (C-R365-INFO-01/02 დაიხურა). '
        'Reviewer-ის Low-ები L3–L6 და C-R365-OBS-INTEGRITY → `deferred_low_polish`, ერთად იხურება SYS-R365-STEM-CACHE-HARDENING-ით (= PERF-9b-ii). მტკიცებულება: `c-round-365.md`, `c-round-365.json`. '
        'ძველი ჩანაწერი: ' + s[i].split('**', 2)[2].strip())
new = [
    '  - **Round 366 = PERF-9b-i — მუშავდება (D-29z1197…D-29z1199).** ახალი perf spec (`perf/studio-lab-stem-cache.perf.spec.ts`, budgets 46 row, 7 assert) production build-ზე, CDP throttle-ით (40 ms, 1,250,000 B/s): cold → 2 ჩანაწერი cache-ში; ხელახლა გახსნა (HTTP cache გასუფთავებული) → 2 × 304, ქსელის body 0 ბაიტი, ready-ის შეფარდება ≤ 0.5 (B: 0.173, დატვირთვით 0.235); `*.mp3` დაბლოკილი → ready, ჩანაწერები რჩება. '
    'B-ის production pre-check-მა აჩვენა: DevTools-ის „Disable cache“ რეჟიმში სერვერი 304-ის ნაცვლად 200-ს აბრუნებს (B-R365-DEVTOOLS-NOCACHE-200, info, მომხმარებლის გზა არ არის); harness-ის host (remix-serve) production არ არის — production Vercel-ია (B-R365-HARNESS-HOST-HEADERS, root-ის კითხვა ROOT-Q-R365-VERCEL-STATIC-HEADERS). '
    'Doc 236 → stage 2 of 3. მტკიცებულება დაგეგმვისას: `b-round-365/perf-sketch/`, `b-round-365/probe/`, `b-round-365/sketch-review.md`.',
    '  შემდეგი (D-29z1200): round 366 PERF-9b-i → REGRESSION (თუ 367-ის დაგეგმვა 2026-11-08-ზე ან შემდეგაა), სხვა შემთხვევაში PERF-9b-ii (SYS-R365-STEM-CACHE-HARDENING) → RETRO 368 → PERF-11 … PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → ფაზა 2 (skip rule). PERF-9c — awaiting_user, PERF-9d — root.',
]
s[i + 1] = '  ძველი (round 365-ის დაგეგმვა): ' + s[i + 1].lstrip()
s[i + 2:i + 2] = new
j = next(k for k, l in enumerate(s) if l.startswith('| STUDIO-PERFORMANCE | **მუშავდება ('))
s[j] = s[j].replace('| STUDIO-PERFORMANCE | **მუშავდება (', '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1199: PERF-9a მზადაა (C round 365 PASS, gate `413218e`); round 366 = PERF-9b-i (stem cache-ის perf row-ები production build-ზე); შემდეგ PERF-9b-ii (hardening); PERF-9c — awaiting_user, PERF-9d — root | ', 1)
open(p, 'w').write('\n'.join(s))
open(done, 'w').write('ok\n')
print('ok')
