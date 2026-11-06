import sys,os
L='/home/runner/czaba-project/tmp/studio-real-loop'
done=L+'/b-round-362/update-feature-status.done'
if os.path.exists(done): sys.exit('already applied')
p=L+'/feature-status.md'; s=open(p).read().split('\n')
assert s[2].startswith('განახლდა: 2026-11-06 · ავტორი: B (round 361 → round 362 დაგეგმვა')
s[2]=s[2].replace('B (round 361 → round 362 დაგეგმვა, D-29z1172…D-29z1177)','B (round 362 → round 363 დაგეგმვა, D-29z1178…D-29z1183)')
i=next(k for k,l in enumerate(s) if l.startswith('  - **Round 362 = PERF-10b-ii-a — მუშავდება (D-29z1177).**'))
assert s[i+1].startswith('  შემდეგი (D-29z1176):')
new=[
'  - **Round 362 = PERF-10b-ii-a — მზადაა (D-29z1178).** C round 362 PASS, `browserVerified`/`realVerified` true (`c-round-362.json`): PERF 95/95, 0 NEW; Play/Stop 28 → 11 (×3, 1× და 6×), clip click 42 → 38; C-ის mutant (state span Transport-ის body-ში) წითელია 29 > 11; PLAY-STOP ორივე viewport-ზე; G362-AUTH. Gate 362 გამოქვეყნდა `9da8daa`. B-R356-PLAYBACK-SETTER და GATE361-L2 დაიხურა.',
'  - **Round 362-ის შენიშვნები (D-29z1179):** UC7-ის ფორმულირება მიღებულია (აზრი სწორია); doc 234-ის მოძველებული mermaid სწორდება round 363-ში; context-ის error ტექსტი (A-R362-REVIEW-PLAYBACK-CTX-ERROR-TEXT) → `deferred_low_polish`, ფიქსის ადგილი PERF-11; PS4-ის reach შენიშვნა — ქმედების გარეშე; reviewer-ის Transport leaves-ის ფაილის წინადადება სიგნალად (SIG-R362-TRANSPORT-LEAVES-FILE); marker-ის playing ტექსტის browser-ში მიუწვდომლობა — მიღებული დაფარვის ზღვარი (IM24).',
'  - **Round 363 = PERF-10b-ii-b — მუშავდება (D-29z1180…D-29z1182; PERF-10-ის ბოლო, მე-5 ეტაპი).** B-მ HEAD-ზე memo-ს მოხსნის mutant-ები გაუშვა: PeakPath უკვე დაცულია (DP43–DP48), DetailPlayhead/DetailWaveform/RangeReadout — არა (`b-round-362/mutants-head/summary.txt`). ემატება RB-MEMO1–3 (`render-budget.test.tsx`; B-ის sketch-ზე თითო mutant მხოლოდ თავის row-ს აწითლებს). GATE320-S3: ყველა ხაზზე range-ის drag HEAD-ზე არ არსებობს (მხოლოდ Ctrl+Shift+L), ამიტომ perf harness-ს ემატება ხაზის ფონზე range drag-ის 12 `record` row. doc 234 → Completed.',
'  შემდეგი (D-29z1183): round 363 → REGRESSION (თუ დაგეგმვა 2026-11-08-ზე ან შემდეგაა) → PERF-9 → PERF-11 … PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED. RETRO 368-ზე ან STUDIO-PERFORMANCE-ის ბოლოს. PERF-10-ის საზღვარზე root-ს არქიტექტურული checkpoint-ის მოთხოვნა განახლდა (`b-round-362/root-request-arch-checkpoint.md`, არ ბლოკავს).',
]
s[i+1]='  ძველი (round 362-ის დაგეგმვა): '+s[i+1].lstrip()
s[i+1:i+1]=new
j=next(k for k,l in enumerate(s) if l.startswith('| STUDIO-PERFORMANCE | **მუშავდება ('))
s[j]=s[j].replace('| STUDIO-PERFORMANCE | **მუშავდება (','| STUDIO-PERFORMANCE | **მუშავდება (D-29z1182: PERF-10b-ii-a მზადაა, round 362, `9da8daa`; round 363 = PERF-10b-ii-b, PERF-10-ის ბოლო ეტაპი; შემდეგ PERF-9.)** ძველი: **მუშავდება (',1)
open(p,'w').write('\n'.join(s)); open(done,'w').write('ok\n'); print('ok')
