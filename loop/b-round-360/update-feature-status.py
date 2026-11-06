import os, shutil, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'
p=os.path.join(L,'feature-status.md'); done=os.path.join(L,'b-round-360/update-feature-status.done')
if os.path.exists(done): sys.exit('already applied')
s=open(p,encoding='utf-8').read()
old_hdr='განახლდა: 2026-11-06 · ავტორი: B (round 359 → round 360 დაგეგმვა, D-29z1163…D-29z1166)'
assert s.count(old_hdr)==1
s=s.replace(old_hdr,'განახლდა: 2026-11-06 · ავტორი: B (round 360 → round 361 დაგეგმვა, D-29z1167…D-29z1171)')
old_r360='  - **Round 360 = PERF-10a-BUDGETS — მუშავდება (D-29z1165).**'
assert s.count(old_r360)==1
s=s.replace(old_r360,'  - **Round 360 = PERF-10a-BUDGETS — მზადაა (D-29z1167).** C round 360 PASS, `browserVerified`/`realVerified` true (`c-round-360.json`): PERF 93/93, 0 NEW; C-ის mutant (Ruler isPlaying-ზე) წითელია; VIDEO-FAIL-STOP-ის სამივე ვარიანტი და G360-AUTH PASS; gate 360 გამოქვეყნდა `93ea6c1`. ძველი ჩანაწერი:')
anchor='  შემდეგი (D-29z1166): round 360 → REGRESSION'
assert s.count(anchor)==1
new=('  - **Round 360-ის შენიშვნები (D-29z1168):** C-R360-NOTE-STALE (Low, budget-ების ფაილის სამი მოძველებული note) ამ რაუნდში სწორდება, რადგან round 361 იმავე ფაილს ფლობს; A-ის review-ის ორი Low მასშია გაერთიანებული.\n'
     '  - **PERF-10b დაიყო (D-29z1169):** 10b-i = აქტიური ხაზი (`activeTrackId`) selection store-ში; 10b-ii = Transport-ის play ღილაკი საკუთარ subscriber-ად (≤ 20), B-R356-PLAYBACK-SETTER, C-R320-01-ისა და GATE320-S3-ის row-ები. ახალი store არ ემატება.\n'
     '  - **Round 361 = PERF-10b-i — მუშავდება (D-29z1170).** clip-ზე click, რომელიც აქტიურ ხაზსაც ცვლის, 83 კომპონენტს არენდერებდა (იმავე ხაზზე მხოლოდ 15). B-ის sketch-ზე production-ში 42 (1× და 6×, ×3), სრული suite 3639/3639, mutant-ები MU-1…MU-6 წითელია. `interact.click.components` ხდება assert `<= 42`, `interact.click.commits` — `<= 2`. C ბრაუზერში ამოწმებს აქტიურ ხაზს, დაკეცილი ჯგუფის ჩარჩოს და paste-ს ახალ აქტიურ ხაზზე.\n'
     '  შემდეგი (D-29z1171): round 361 → REGRESSION (თუ დაგეგმვა 2026-11-08-ზე ან შემდეგაა) → PERF-10b-ii → PERF-9 → PERF-11 … PERF-15 → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED. RETRO 368-ზე ან STUDIO-PERFORMANCE-ის ბოლოს.\n'
     '  ძველი (round 360-ის დაგეგმვა): შემდეგი (D-29z1166): round 360 → REGRESSION')
s=s.replace(anchor,new)
old_row='| STUDIO-PERFORMANCE | **მუშავდება (D-29z1163…D-29z1166: C-R358-01 მზადაა, round 359, `a977b97`; round 360 = PERF-10a-BUDGETS; შემდეგ PERF-10b.)** ძველი:'
assert s.count(old_row)==1
s=s.replace(old_row,'| STUDIO-PERFORMANCE | **მუშავდება (D-29z1167…D-29z1171: PERF-10a-BUDGETS მზადაა, round 360, `93ea6c1`; round 361 = PERF-10b-i; შემდეგ PERF-10b-ii.)** ძველი: **მუშავდება (D-29z1163…D-29z1166: C-R358-01 მზადაა, round 359, `a977b97`; round 360 = PERF-10a-BUDGETS; შემდეგ PERF-10b.)** ძველი:')
open(p,'w',encoding='utf-8').write(s); open(done,'w').write('ok\n'); print('feature-status updated')
