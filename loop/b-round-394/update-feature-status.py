import pathlib, sys
L = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop')
m = L / 'b-round-394/update-feature-status.done'
if m.exists(): print('already'); sys.exit(0)
p = L / 'feature-status.md'; lines = p.read_text().split('\n')
assert lines[2].startswith('განახლდა: 2026-11-07 · ავტორი: B (round 393 → round 394')
lines[2] = lines[2].replace('B (round 393 → round 394 დაგეგმვა, D-29z1342…D-29z1346)', 'B (round 394 → round 395 დაგეგმვა, D-29z1347…D-29z1350)')
i = 427
assert lines[i].startswith('  შემდეგი (D-29z1342…D-29z1346): **round 394 = PERF-13c-ii-a')
new = [
 '  - **Round 394 = PERF-13c-ii-a — ბაგია (C round 394 FAIL, `browserVerified` true; gate 394 გამოტოვდა, არ გამოქვეყნებულა; D-29z1347).** R1 (HOLD, click-ის გარეშე: fallback 8369/8362 ms), R2 (გარე pause → `Preview`), R3–R7, PERF-RES და AUTH ბრაუზერში გავიდა, მაგრამ ეს გამოუქვეყნებელ tree-ზეა და „მზადაა“ არ არის. **C-R394-01 (Medium):** HOLD-ის დროს wave-ზე click (`playing`-მდე) watchdog-ს სამუდამოდ თიშავს — toggle `Stop`-ზე რჩება (23.6 s, ორივე viewport). მტკიცებულება: `c-round-394/rows-R1.json` R1b.',
 '  შემდეგი (D-29z1347…D-29z1350): **round 395 = PERF-13c-ii-a-ს გასწორება — მუშავდება.** B-ის გადაწყვეტილება (D-29z1348, ვარიანტი a): იმავე URL-ზე seek უკვე armed ტაიმერს თავიდან იწყებს ახალი დროით და ახალს არ ქმნის (`progress`-ის წესი). B-ის sketch-ზე C-ის საკუთარმა R1b probe-მა fallback seek-იდან 8296/8300 ms-ში აჩვენა (`b-round-394/probe/rows-R1b.json`); mutant 15/15 წითელი. A-ის ორი Low (PS22 asserts, PS26 listener-ების მოხსნა) იმავე რაუნდში. REV-B393-M1-STALL, GATE393-M1-SYNC-THROW და A-R393-REVIEW-M1-EXTERNAL-PAUSE ღია რჩება gate 395-ის გამოქვეყნებამდე. შემდეგ: PERF-13c-ii-b → PERF-13d → PERF-14 → PERF-15; REGRESSION 2026-11-10-დან; RETRO 400.',
 '  ძველი: ' + lines[i].lstrip()[:0] + 'შემდეგი (D-29z1342…D-29z1346): round 394 = PERF-13c-ii-a …',
]
lines[i:i+1] = new
j = [k for k, l in enumerate(lines) if l.startswith('| STUDIO-PERFORMANCE | **მუშავდება (D-29z1342)')]
assert len(j) == 1
lines[j[0]] = lines[j[0]].replace('| STUDIO-PERFORMANCE | ', '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1347): PERF-13c-ii-a — ბაგია (round 394 C FAIL, C-R394-01 Medium); round 395 = გასწორება იმავე tree-ზე.** ძველი: ', 1)
p.write_text('\n'.join(lines)); m.write_text('done\n'); print('ok')
