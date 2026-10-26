import sys, re
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
lines=s.split('\n')
assert lines[2].startswith('განახლდა:')
lines[2]="განახლდა: 2026-10-26 · ავტორი: B (round 184 → round 185 დაგეგმვა, D-29z150) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`"
s='\n'.join(lines)
anchor="- **Round 183 (D-29z148): M4 — cookie banner Studio-ს აღარ ფარავს — მზადაა"
assert s.count(anchor)==1
new=("- **Round 184 (D-29z149): ROOT-RECON-GRID-HARNESS — მზადაა. VISUAL-A-OBSIDIAN — მზადაა (`awaiting_user` საკითხების გარდა).** C PASS, `browserVerified: true`, `realVerified: true`, ბაგი 0; gate 184 გამოქვეყნდა `3eb4cdb`. "
 "T184-TARGETED (3 ფაილი, 45/45; C-ის საკუთარი სახელების სია `cmp`-ით ემთხვევა baseline-ს; helper ტესტად არ გროვდება), SCOPE-184, AN-REVIEW-184 (მექანიკური dedent diff ცარიელია), MUT-184 (m312 — tsc შეცდომა სამივე suite-ში; m313 — 0 წითელი), STUDIO-RV-184 (0 px ორივე ზომაზე), G184-3, PX-NET/REG-HYD — PASS (`c-round-184.md`); fake-Bearer 403 — BLOCKED (backend unavailable in cloud). "
 "ინფო: m313-მა აჩვენა, რომ fake clock-ის მნიშვნელობა ამ suite-ებში არ მოწმდება (B-R184-FAKECLOCK-UNASSERTED, სიგნალი); 73 suite-ში ბლოკის ასლი რჩება (Architecture სიგნალი, checkpoint Q2). "
 "**Round 185 (D-29z150): STORE-REDESIGN STORE-0 — მუშავდება.** Mock backend loop-ის საქაღალდეში (`mock-api/server.mjs`, 127.0.0.1:5199), რომ C-მ store-ის გვერდები cloud-ში შეამოწმოს; შესყიდვის დაცვა: `/api/downloads` ყოველთვის 401 → studio-token fake Bearer = 403. რეგრესიის რაუნდი — 2026-10-27-დან პირველ დაგეგმვაზე (მოსალოდნელია Round 186).\n")
s=s.replace(anchor,new+anchor)
old="| ROOT-RECON-GRID-HARNESS | **მუშავდება** (Round 184, D-29z149; baseline 45/45, 20/14/11)"
assert s.count(old)==1
s=s.replace(old,"| ROOT-RECON-GRID-HARNESS | **მზადაა** (Round 184 C PASS `browserVerified`, `3eb4cdb`; `c-round-184.json`; 45/45, სახელები უცვლელი) — ადრე: **მუშავდება** (Round 184, D-29z149; baseline 45/45, 20/14/11)")
old="| VISUAL-A-OBSIDIAN | **მუშავდება** —"
assert s.count(old)==1
s=s.replace(old,"| VISUAL-A-OBSIDIAN | **მზადაა** (`awaiting_user` საკითხების გარდა; ბოლო ეტაპი ROOT-RECON-GRID-HARNESS — Round 184, `3eb4cdb`) —")
old="| STORE-REDESIGN | **არ დაწყებულა** ("
assert s.count(old)==1
s=s.replace(old,"| STORE-REDESIGN | **მუშავდება** — STORE-0 (mock API) Round 185-ში (D-29z150; `current-task.md`); STORE-1…5 **არ დაწყებულა**. ადრე: (")
open(p,'w',encoding='utf-8').write(s); print('ok')
