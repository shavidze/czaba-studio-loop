import os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'
p=os.path.join(L,'feature-status.md'); done=os.path.join(L,'b-round-358/update-feature-status.done')
if os.path.exists(done): sys.exit('already applied')
s=open(p,encoding='utf-8').read()
old_hdr='განახლდა: 2026-11-05 · ავტორი: B (round 357 → round 358 დაგეგმვა, D-29z1155…D-29z1158)'
assert s.count(old_hdr)==1
s=s.replace(old_hdr,'განახლდა: 2026-11-06 · ავტორი: B (round 358 → round 359 დაგეგმვა, D-29z1159…D-29z1162)')
anchor='  შემდეგი (D-29z1154): round 357 → REGRESSION'
assert s.count(anchor)==1
new=('  - **Round 358 = PERF-10a ხელახლა — მზადაა; PERF-10a მზადაა (D-29z1159).** C round 358 PASS, `browserVerified`/`realVerified` true (`c-round-358.json`): PERF 84/84, 0 NEW, Play/Stop-ის კომპონენტები 70 → 28; REMOUNT 7/7 HEAD-ის ტოლია; PLAY, FOLLOW და NARROW ორივე viewport-ზე, VIDEO-SYNC, VIDEO-FAIL-STOP (ვარიანტი 1) და G358-AUTH PASS. gate 358 გამოქვეყნდა `f269022` (რაუნდები 357–358). **C-R357-01 დაიხურა.** VIDEO-FAIL-STOP-ის ორი გაუშვებელი ვარიანტი PERF-10a-BUDGETS-ის C row-ებად გადადის. Play-ის row-ები `record` რჩება PERF-10a-BUDGETS-მდე.\n'
     '  - **C-R358-01 — ბაგია (Medium, D-29z1160).** ფანჯრის ვიწრო → ფართო ზომაზე StudioWorkspace თავიდან mount-დება: ხელით ჩაწერილი BPM (100) 120-ზე ბრუნდება და tempo-ს წინადადება სტატუსს ისევ ემატება. HEAD-ზეც ასეა (ძველი დეფექტი, არა round 358-ის). A-R357-TEMPO-SEED-REMOUNT-DUP მას შეუერთდა (Low → Medium). C-ის დაკვირვება „Next marker მარკერის გარეშე დაკვრას აჩერებს“ ბაგი არ არის: ღილაკი პროექტის ბოლოზე გადადის, სადაც დაკვრა სრულდება (`markers.ts:162`, D-29z1161).\n'
     '  - **Round 359 = C-R358-01-ის გასწორება — მუშავდება (D-29z1160).** tempo, grid, snap და metronome provider-ის საკუთარ store-ში ინახება (`workspace-session-store.ts`) და StudioWorkspace-ის ხელახალ mount-ს გადაურჩება; გვერდის reload ისევ ნაგულისხმევიდან იწყება. B-ის sketch: WS1–WS4 HEAD-ზე წითელია, sketch-ზე მწვანე; 79 ფაილი 1452/1452; M-S1…M-S5 წითელია; C-ის probe sketch-ზე 100 BPM-ს ინარჩუნებს ორივე viewport-ზე (`b-round-358/`). Envelope mode და waveform zoom ცალკე Low-ია (B-R359-VIEW-STATE-REMOUNT, deferred).\n'
     '  შემდეგი (D-29z1162): round 359 → REGRESSION (თუ დაგეგმვა 2026-11-08-ზე ან შემდეგაა) → PERF-10a-BUDGETS → PERF-10b → PERF-9 → PERF-11 … PERF-15 → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED. RETRO 368-ზე ან STUDIO-PERFORMANCE-ის ბოლოს.\n'
     '  ძველი (round 358-ის დაგეგმვა): ')
s=s.replace(anchor, new + anchor.lstrip(), 1)
old_row='| STUDIO-PERFORMANCE | **მუშავდება (D-29z1155…D-29z1158: round 357 PERF-10a — ბაგია, C-R357-01; round 358 = PERF-10a ხელახლა.)**'
assert s.count(old_row)==1
s=s.replace(old_row,'| STUDIO-PERFORMANCE | **მუშავდება (D-29z1159…D-29z1162: PERF-10a მზადაა, round 358, `f269022`; round 359 = C-R358-01 (Medium); შემდეგ PERF-10a-BUDGETS.)** ძველი: **მუშავდება (D-29z1155…D-29z1158: round 357 PERF-10a — ბაგია, C-R357-01; round 358 = PERF-10a ხელახლა.)**')
open(p,'w',encoding='utf-8').write(s); open(done,'w').write('ok\n'); print('ok')
