import sys, os
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = L + '/b-round-364/update-feature-status.done'
if os.path.exists(done):
    sys.exit('already applied')
p = L + '/feature-status.md'
s = open(p).read().split('\n')
old = 'B (round 363 → round 364 დაგეგმვა, D-29z1184…D-29z1188)'
assert old in s[2]
s[2] = s[2].replace(old, 'B (round 364 → round 365 დაგეგმვა, D-29z1189…D-29z1194)')
i = next(k for k, l in enumerate(s) if l.startswith('  - **Round 364 = PERF-10b-ii-b ხელახლა — მუშავდება'))
assert s[i + 1].startswith('  შემდეგი (D-29z1188):')
new = [
    '  - **Round 364 = PERF-10b-ii-b ხელახლა — მზადაა (C round 364 PASS, `browserVerified` true, `realVerified` true; gate 364 გამოქვეყნდა `df4e5b1`; D-29z1189).** გაიარა: CLAIMS, SOURCE-SCOPE, PERF-LIB 40/40, C-ის საკუთარი mutant (DC-KINDS წითელი), RB-MEMO 13/13, PERF (264 row, 95/95, 0 DIFF), BG-RANGE + Insert Marker ორივე viewport-ზე, G364-AUTH, DOCS. **PERF-10 მზადაა** (10a, 10a-BUDGETS, 10b-i, 10b-ii-a, 10b-ii-b). დაიხურა C-R363-01, C-R363-02, C-R320-01, A-R362-DOC-STALE-MERMAID. ახალი Low-ები (C-R364-01, A-R364-REVIEW-SELECTED-BEFORE, A-R364-REVIEW-MARKER-PRE-DRAG) → `deferred_low_polish`, გამოსწორების ადგილი PERF-9b (D-29z1190). მტკიცებულება: `c-round-364.md`, `c-round-364.json`, `gates/gate-round-364.json`.',
    '  - **Round 365 = PERF-9a — მუშავდება (D-29z1191…D-29z1193).** `/studio-lab`-ის ორი საჯარო preview (`/middle-east.mp3`, `/videos/hero/hero-music.mp3`) ინახება მუდმივ cache-ში: ფაილი OPFS-ში, ინდექსი IndexedDB-ში (`czaba-stem-cache-v2`). ხელახლა გახსნისას იგზავნება პირობითი მოთხოვნა (ETag/Last-Modified); 304-ზე ხმა cache-იდან მოდის (body 0 ბაიტი), ქსელის შეცდომაზე ან 5xx-ზე — cache-იდან; LRU ბიუჯეტი min(256 MB, quota-ს 10 %). B-ის HEAD probe: dev-ზე მეორე გახსნისას middle-east მთლიანად (4 MB) ხელახლა იტვირთებოდა. B-ის sketch (tech-lead-ის review-ის შემდეგ 4 Medium + 4 Low გასწორებულია sketch-შივე): tsc 0, covering 165/165, სრული suite scratch-ზე, ბრაუზერში cold → შენახვა, reopen → 304, mp3 დაბლოკილი → მაინც ready, გასუფთავება → cold. შეძენილი stem-ები cache-ში არ შედის (PERF-9c, Saba-ს კითხვა SABA-Q-PERF4-STUDIO-CACHE); ძველი `audio-cache.ts` და skill doc — დაცული ფაილები (PERF-9d, root request). ეკრანზე არაფერი იცვლება. `current-task.md`, `b-round-364/`.',
    '  შემდეგი (D-29z1194): round 365 PERF-9a → PERF-9b → REGRESSION (თუ დაგეგმვა 2026-11-08-ზე ან შემდეგაა) → PERF-11 … PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → ფაზა 2 (skip rule). RETRO — 368-ზე.',
]
s[i + 1] = '  ძველი (round 364-ის დაგეგმვა): ' + s[i + 1].lstrip()
s[i + 1:i + 1] = new
j = next(k for k, l in enumerate(s) if l.startswith('| STUDIO-PERFORMANCE | **მუშავდება ('))
s[j] = s[j].replace('| STUDIO-PERFORMANCE | **მუშავდება (', '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1193: PERF-10 მზადაა (C round 364 PASS, gate `df4e5b1`); round 365 = PERF-9a (stem cache v2, საჯარო preview-ები); შემდეგ PERF-9b; PERF-9c — awaiting_user, PERF-9d — root | ', 1)
open(p, 'w').write('\n'.join(s))
open(done, 'w').write('ok\n')
print('ok')
