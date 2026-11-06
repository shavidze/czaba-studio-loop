import sys,os
L='/home/runner/czaba-project/tmp/studio-real-loop'
done=L+'/b-round-363/update-feature-status.done'
if os.path.exists(done): sys.exit('already applied')
p=L+'/feature-status.md'; s=open(p).read().split('\n')
assert 'B (round 362 → round 363 დაგეგმვა, D-29z1178…D-29z1183)' in s[2]
s[2]=s[2].replace('B (round 362 → round 363 დაგეგმვა, D-29z1178…D-29z1183)','B (round 363 → round 364 დაგეგმვა, D-29z1184…D-29z1188)')
i=next(k for k,l in enumerate(s) if l.startswith('  - **Round 363 = PERF-10b-ii-b — მუშავდება'))
assert s[i+1].startswith('  შემდეგი (D-29z1183):')
new=[
'  - **Round 363 = PERF-10b-ii-b — ბაგია (C FAIL, D-29z1184).** `c-round-363.json`: taskStatus FAIL, `browserVerified` true. გაიარა: RB-MEMO 13/13 და MU-P/MU-W/MU-R (თითო მხოლოდ თავის row-ზე წითელი), C-ის mutant, PERF 95/95 (264 row, 0 DIFF), BG-RANGE ორივე viewport-ზე, G363-AUTH. ჩავარდა: **C-R363-01 (Medium)** — perf-lib 39/40, DC-KINDS-ის regex ახალ `background-range` drag-ს არ იცნობს (წარმოშობა: B-ის spec, perf-lib sketch-ზე არ გაუშვია); **C-R363-02 (Medium)** — doc 234/168 არ დაიწერა (A-მ STOP გააკეთა). gate 363 გამოტოვდა; A-ის 3 ფაილი ხეში რჩება.',
'  - **Round 364 = PERF-10b-ii-b ხელახლა — მუშავდება (D-29z1185…D-29z1187; PERF-10-ის ბოლო ეტაპი).** ვარიანტი (a): `perf/lib/report.test.ts`-ის DC-KINDS regex-ს ემატება `background-range`, 16 → 18 (B-ის sketch: perf-lib 40/40, MU-K და MU-N წითელია, `b-round-363/`). reviewer-ის ორი Low: reset-ის შემოწმება `selectedBefore`-ს და clip-ის start/width-ს ადარებს, Insert Marker-ს კი name-bar click-ის წინ და შემდეგ (B-ის probe: marker უცვლელია, range-ის დროს დამალულია). doc 234 → `Completed (C round 364 PASS)`, doc 168-ის დამატებები. C: PERF-LIB, საკუთარი mutant, PERF (C363-თან შედარება), BG-RANGE + Insert Marker, G364-AUTH, DOCS.',
'  შემდეგი (D-29z1188): round 364 → REGRESSION (თუ დაგეგმვა 2026-11-08-ზე ან შემდეგაა) → PERF-9 → PERF-11 … PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED. RETRO 368-ზე ან STUDIO-PERFORMANCE-ის ბოლოს. არქიტექტურული checkpoint-ის მოთხოვნა ღიაა, არ ბლოკავს.',
]
s[i+1]='  ძველი (round 363-ის დაგეგმვა): '+s[i+1].lstrip()
s[i+1:i+1]=new
j=next(k for k,l in enumerate(s) if l.startswith('| STUDIO-PERFORMANCE | **მუშავდება ('))
s[j]=s[j].replace('| STUDIO-PERFORMANCE | **მუშავდება (','| STUDIO-PERFORMANCE | **მუშავდება (D-29z1187: round 363 PERF-10b-ii-b — C FAIL (C-R363-01/02, Medium); round 364 = ხელახლა, PERF-10-ის ბოლო ეტაპი; შემდეგ PERF-9.)** ძველი: **მუშავდება (',1)
open(p,'w').write('\n'.join(s)); open(done,'w').write('ok\n'); print('ok')
