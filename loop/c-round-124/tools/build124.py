import json,os,re
L='/home/runner/czaba-project/tmp/studio-real-loop'; C=L+'/c-round-124'
F=json.load(open(C+'/tools/findings.json')); S=json.load(open(C+'/tools/state.json')); env=json.load(open(L+'/env-status.json'))
Q=['Q1','Q2','Q3','Q4','Q5','Q6']
areas=[a for a in Q if os.path.exists(f'{C}/md/{a}.md')]
part1=open(C+'/ableton-review-part1.md').read()
i1=part1.index('## 1. ვერდიქტი'); i2=part1.index('## 2. ბაგები'); i3=part1.index('## 3. რეკომენდაციები'); i4=part1.index('## 4. დანართი')
head=part1[:i1].replace('# Ableton Expert Review — ნაწილი 1 (P1–P8)','# Ableton Expert Review — ნაწილები 1–2 (P1–P8, Q1–Q7)',1)
head=head.rstrip()+'\n\nნაწილი 2 (Q1–Q7): რაუნდი 124 · შემმოწმებელი C · თარიღი 2026-10-24 · baseline `608187f` · იგივე გარემო (Playwright Chromium headless, `/studio-lab`, 1440×900 და 1280×720, ახალი context, credentials-ის გარეშე). ნაწილი 2-ის მტკიცებულებები: `c-round-124/{tools,out,shots,manual,md}`.\n\n'
if S.get('verdict'):
    sec1='## 1. საბოლოო ვერდიქტი (ნაწილები 1–2)\n\n'+'\n'.join(S['verdict'])+'\n\n'
else:
    sec1=part1[i1:i2].rstrip()+'\n- **ნაწილი 2 მიმდინარეობს (რაუნდი 124):** დასრულებული სფეროები: '+', '.join(areas)+'.\n\n'
sec2=part1[i2:i3].rstrip()+'\n'
for b in F['bugs']: sec2+=f"| {b['id']} | {b['severity']} | {b['area']} | {b['steps_ka']} | {b['expected_ka']} | {b['actual_ka']} | {b['evidence']} |\n"
sec2+=('' if F['bugs'] else '\nნაწილი 2 (Q1–Q6): ახალი ბაგი არ აღმოჩნდა; ცნობილი signal-ები შესაბამის მატრიცაშია ციტირებული.\n')
sec3=part1[i3:i4].rstrip()+'\n'
for r in F['recommendations']: sec3+=f"| {r['id']} | {r['what_ka']} | {r['why_ka']} | {r['manual']} ({r['level']}) | {r['sizeRounds']} | {r['priority']} | {r['changes']} |\n"
if S.get('questions'): sec3+='\n### საბას გადასაწყვეტი კითხვები\n\n'+'\n'.join(S['questions'])+'\n'
sec4=part1[i4:].rstrip()+'\n\n'
for a in areas: sec4+=open(f'{C}/md/{a}.md').read().rstrip()+'\n\n'
idx=''
if S.get('index'):
    idx='## 5. ინდექსი (ყველა ABL-B და ABL-R, ნაწილები 1–2)\n\n| ID | area | severity / priority | მოკლედ |\n|---|---|---|---|\n'+'\n'.join(S['index'])+'\n'
open(L+'/user-review/ableton-review.md','w').write(head+sec1+sec2+'\n'+sec3+'\n'+sec4+idx)
done=areas+(['Q7'] if S.get('verdict') else [])
j={"round":124,"taskStatus":S['taskStatus'],"browserVerified":S['browserVerified'],"realVerified":S['browserVerified'],"envStatus":env,"allRowsRan":S.get('allRowsRan',False),
 "areasDone":done,"areasSpilled":[a for a in Q+['Q7'] if a not in done],"passed":S['passed'],"failed":[],"inconclusive":S.get('inconclusive',[]),"blocked":S.get('blocked',[]),
 "gate":["full vitest","typecheck","build","Biome","npm run verify"],
 "bugs":[{k:v for k,v in b.items() if not k.endswith('_ka')} for b in F['bugs']],
 "recommendations":[{k:v for k,v in r.items() if not k.endswith('_ka')} for r in F['recommendations']],
 "reviewComplete":S.get('reviewComplete',False),"invalidRuns":S.get('invalidRuns',[]),"notesForB":S.get('notesForB',[]),"sourceScope":S.get('sourceScope',{}),"network":S.get('network',{}),"expertAgent":"unavailable on this runner (no subagent tool); role file used as checklist"}
json.dump(j,open(L+'/c-round-124.json','w'),ensure_ascii=False,indent=1)
m=['# C — Round 124 report (ABLETON-EXPERT-REVIEW part 2)','',f"taskStatus **{j['taskStatus']}** · browserVerified {j['browserVerified']} · areas done {', '.join(done)} · spilled {', '.join(j['areasSpilled']) or 'none'} · reviewComplete {j['reviewComplete']}",'','Main deliverable: `user-review/ableton-review.md` (Georgian, part 1 kept intact; backup `c-round-124/ableton-review-part1.md`). Evidence: `c-round-124/{tools,out,shots,manual,md}`.','']
m+=S.get('mdNotes',[])
m+=['','## Bugs']+[f"- {b['id']} ({b['severity']}, {b['area']}): {b['actual']} — {b['evidence']}" for b in F['bugs']]
m+=['','## Recommendations']+[f"- {r['id']} ({r['priority']}, {r['area']}): {r['what']}" for r in F['recommendations']]
m+=['','## Passed']+[f'- {x}' for x in j['passed']]+['','## Gate (not claimed)']+[f'- {x}' for x in j['gate']]+['','## Blocked']+[f'- {x}' for x in j['blocked']]+['','## Invalid runs']+[f'- {x}' for x in j['invalidRuns']]+['','## Notes for B']+[f'- {x}' for x in j['notesForB']]
open(L+'/c-round-124.md','w').write('\n'.join(m)+'\n')
json.dump({"done":["SOURCE-SCOPE-start"]+done+[x for x in ['G124-3','SOURCE-SCOPE-end'] if x in j['passed']],"next":S.get('next','')},open(C+'/progress.json','w'))
print('built',done,len(F['bugs']),len(F['recommendations']))
