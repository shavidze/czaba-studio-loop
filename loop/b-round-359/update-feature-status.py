import os, shutil, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'
p=os.path.join(L,'feature-status.md'); done=os.path.join(L,'b-round-359/update-feature-status.done')
if os.path.exists(done): sys.exit('already applied')
shutil.copyfile(p, os.path.join(L,'b-round-359/feature-status-before-360.md'))
s=open(p,encoding='utf-8').read()
old_hdr='განახლდა: 2026-11-06 · ავტორი: B (round 358 → round 359 დაგეგმვა, D-29z1159…D-29z1162)'
assert s.count(old_hdr)==1
s=s.replace(old_hdr,'განახლდა: 2026-11-06 · ავტორი: B (round 359 → round 360 დაგეგმვა, D-29z1163…D-29z1166)')
anchor='  შემდეგი (D-29z1162): round 359 → REGRESSION'
assert s.count(anchor)==1
new=('  - **Round 359 = C-R358-01-ის გასწორება — მზადაა; C-R358-01 დაიხურა (D-29z1163).** C round 359 PASS, `browserVerified`/`realVerified` true (`c-round-359.json`): ორივე viewport-ზე ხელით ჩაწერილი 100 BPM, Snap off, 1/8 და metronome ფანჯრის resize-ს გადაურჩა; seed-ის წინადადება აღარ მეორდება; metronome-ის click-ები remount-ის შემდეგაც ისმის (8 = 8); reload ნაგულისხმევს აბრუნებს; PERF 84/84, 0 NEW. gate 359 გამოქვეყნდა `a977b97`. A-R357-TEMPO-SEED-REMOUNT-DUP მასთან ერთად დაიხურა.\n'
     '  - **Round 359-ის შენიშვნები (D-29z1164):** C-R359-01 (Low, ტესტის დაფარვა: 4 აღდგენილი ველი წითელი row-ის გარეშე), A-R359-REVIEW-METRONOME-REF-RENDER და A-R359-REVIEW-SESSION-READONLY (Low) → `deferred_low_polish`. B-R359-VIEW-STATE-REMOUNT (Env და waveform zoom resize-ზე ნაგულისხმევზე ბრუნდება) ბრაუზერით დადასტურდა, Low რჩება. FOLLOW-ის 5 px-იანი jitter ერთხელ (C-R359-OBS-FOLLOW-JITTER) info-ა.\n'
     '  - **Round 360 = PERF-10a-BUDGETS — მუშავდება (D-29z1165).** Play/Stop-ის ხუთი row (`interact.play.*`, 1×: commits `== 1`, კომპონენტები `<= 28`, `start()` `== 1`) და fade release-ის ოთხი row (audio და video, `<= 3`) `record`-იდან assert-ზე გადადის: 84 → 93. B-მა production-ში გაზომა sketch და ორი mutant (`b-round-359/perf-summary.txt`). C ბრაუზერში ამოწმებს ვიდეოს შეცდომით გაჩერების ორ დარჩენილ ვარიანტს: playhead კლიპამდე მიდის, და Follow paused-ის დროს.\n'
     '  შემდეგი (D-29z1166): round 360 → REGRESSION (თუ დაგეგმვა 2026-11-08-ზე ან შემდეგაა) → PERF-10b → PERF-9 → PERF-11 … PERF-15 → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED. RETRO 368-ზე ან STUDIO-PERFORMANCE-ის ბოლოს.\n'
     '  ძველი (round 359-ის დაგეგმვა): ')
s=s.replace(anchor, new + anchor.lstrip(), 1)
old_row='| STUDIO-PERFORMANCE | **მუშავდება (D-29z1159…D-29z1162: PERF-10a მზადაა, round 358, `f269022`; round 359 = C-R358-01 (Medium); შემდეგ PERF-10a-BUDGETS.)**'
assert s.count(old_row)==1
s=s.replace(old_row,'| STUDIO-PERFORMANCE | **მუშავდება (D-29z1163…D-29z1166: C-R358-01 მზადაა, round 359, `a977b97`; round 360 = PERF-10a-BUDGETS; შემდეგ PERF-10b.)** ძველი: **მუშავდება (D-29z1159…D-29z1162: PERF-10a მზადაა, round 358, `f269022`; round 359 = C-R358-01 (Medium); შემდეგ PERF-10a-BUDGETS.)**')
open(p,'w',encoding='utf-8').write(s); open(done,'w').write('ok\n'); print('ok')
