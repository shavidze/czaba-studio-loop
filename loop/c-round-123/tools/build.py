import json,os,glob
L='/home/runner/czaba-project/tmp/studio-real-loop'; C=L+'/c-round-123'
F=json.load(open(C+'/tools/findings.json')); K=json.load(open(C+'/tools/ka.json')); S=json.load(open(C+'/tools/state.json'))
env=json.load(open(L+'/env-status.json'))
areas=[a for a in ['P1','P2','P3','P4','P5','P6','P7','P8'] if os.path.exists(f'{C}/md/{a}.md')]
md=['# Ableton Expert Review — ნაწილი 1 (P1–P8)','',f'რაუნდი 123 · შემმოწმებელი C · თარიღი 2026-10-24 · baseline `608187f` · ბრაუზერი: Playwright Chromium (headless), `/studio-lab`, 1440×900 და 1280×720, ახალი context, credentials-ის გარეშე.','',
'**წყაროები:** Ableton Live 12 manual (ოფიციალური გვერდები, capture თარიღები სექციებში). Live-ის აპლიკაცია runner-ზე არ არის — Live-ში არაფერი დატესტილა; „დადასტურებული“ ნიშნავს manual-ის ტექსტთან (F) შესაბამისობას. წყაროს გარეშე ქცევა წერია როგორც „დაუდასტურებელი“.','',
'**შენიშვნა:** `ableton-arrangement-expert` agent-ის გამოძახება ამ runner-ზე ვერ მოხერხდა (subagent tool მიუწვდომელია); მისი role ფაილი წავიკითხე და ყველა დასკვნა ეყრდნობა მხოლოდ C-ის ბრაუზერში ნანახს და manual-ის ტექსტს.','',
'## 1. ვერდიქტი (წინასწარი, ნაწილი 1)','']
md+=S.get('verdict',['- (მზადდება)'])
md+=['','## 2. ბაგები','','| ID | severity | area | steps | expected (contract) | actual | evidence |','|---|---|---|---|---|---|---|']
for b in F['bugs']: k=K[b['id']]; md.append(f"| {b['id']} | {b['severity']} | {b['area']} | {k['steps']} | {k['expected']} | {k['actual']} | {b['evidence']} |")
if not F['bugs']: md.append('| — | | | | | | |')
md+=['','## 3. რეკომენდაციები (არაფერი ხორციელდება Saba-ს დასტურამდე — `user-review/ableton-decisions.md`)','','| ID | what | why | Live manual reference (F/?) | size (rounds) | priority | change |','|---|---|---|---|---|---|---|']
for r in F['recommendations']: k=K[r['id']]; md.append(f"| {r['id']} | {k['what']} | {k['why']} | {r['manual']} ({r['level']}) | {r['sizeRounds']} | {r['priority']} | {r['changes']} |")
md+=['','## 4. დანართი: სფეროების მატრიცა','']
for a in areas: md.append(open(f'{C}/md/{a}.md').read()); md.append('')
os.makedirs(L+'/user-review',exist_ok=True); open(L+'/user-review/ableton-review.md','w').write('\n'.join(md))
passed=S['passed']; 
j={"round":123,"taskStatus":S['taskStatus'],"browserVerified":S['browserVerified'],"realVerified":S['browserVerified'],"envStatus":env,"allRowsRan":S.get('allRowsRan',False),
 "areasDone":areas,"areasSpilled":[a for a in ['P1','P2','P3','P4','P5','P6','P7','P8'] if a not in areas],"passed":passed,"failed":[],"inconclusive":S.get('inconclusive',[]),"blocked":S.get('blocked',[]),
 "gate":["full vitest","typecheck","build","Biome","npm run verify"],"bugs":F['bugs'],"recommendations":F['recommendations'],"invalidRuns":S.get('invalidRuns',[]),"notesForB":S.get('notesForB',[]),"sourceScope":S.get('sourceScope',{}),"network":S.get('network',{})}
json.dump(j,open(L+'/c-round-123.json','w'),ensure_ascii=False,indent=1)
m=['# C — Round 123 report (ABLETON-EXPERT-REVIEW part 1)','',f"taskStatus **{j['taskStatus']}** · browserVerified {j['browserVerified']} · areas done {', '.join(areas)} · spilled {', '.join(j['areasSpilled']) or 'none'}",'','Main deliverable: `user-review/ableton-review.md` (Georgian). Evidence: `c-round-123/{tools,out,shots,manual,md}`.','']
m+=S.get('mdNotes',[])
m+=['','## Bugs']+[f"- {b['id']} ({b['severity']}, {b['area']}): {b['actual']} — {b['evidence']}" for b in F['bugs']]
m+=['','## Recommendations']+[f"- {r['id']} ({r['priority']}, {r['area']}): {r['what']}" for r in F['recommendations']]
m+=['','## Guard rows / passed']+[f'- {x}' for x in passed]+['','## Blocked']+[f'- {x}' for x in j['blocked']]+['','## Invalid runs']+[f'- {x}' for x in j['invalidRuns']]+['','## Notes for B']+[f'- {x}' for x in j['notesForB']]
open(L+'/c-round-123.md','w').write('\n'.join(m))
print('built',areas,len(F['bugs']),len(F['recommendations']))
