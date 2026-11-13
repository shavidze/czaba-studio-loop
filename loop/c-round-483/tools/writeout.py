import json,os,subprocess
L='/home/runner/czaba-project/tmp/studio-real-loop'
rows=json.load(open(f'{L}/c-round-483/rows-status.json'))
env=json.load(open(f'{L}/env-status.json'))
passed=[r['id'] for r in rows if r['s'].startswith('PASS')]
failed=[r['id'] for r in rows if r['s']=='FAIL']
inc=[r['id']+': '+r.get('note','') for r in rows if r['s'] in('INCONCLUSIVE','NOT-RUN')]
blocked=[r['id']+': '+r.get('note','') for r in rows if r['s']=='BLOCKED']
carried=[r['id']+': '+r.get('note','') for r in rows if r['s']=='CARRIED']
rec=[r['id'] for r in rows if r['s']=='RECORDED']
notrun=[r for r in rows if r['s']=='NOT-RUN']
bugs=json.load(open(f'{L}/c-round-483/bugs.json')) if os.path.exists(f'{L}/c-round-483/bugs.json') else []
meta=json.load(open(f'{L}/c-round-483/meta.json'))
status=meta['taskStatus']
j=dict(taskStatus=status,bugs=bugs,passed=passed,failed=failed,inconclusive=inc,blocked=blocked,carried=carried,recorded=rec,gate=meta['gate'],
 observations=meta['observations'],invalidRuns=meta['invalidRuns'],lookups=meta['lookups'],browserVerified=meta['browserVerified'],realVerified=meta['browserVerified'],
 stopSignal=meta['stopSignal'],envStatus=env,harness=meta['harness'],evidence='c-round-483/out/')
json.dump(j,open(f'{L}/c-round-483.json','w'),indent=1)
md=['# C round 390 — REGRESSION-2026-11-08 part 2','',f'**taskStatus {status}**; browserVerified {meta["browserVerified"]}.','',meta['summary'],'','| Row | Result | Evidence / note |','|---|---|---|']
for r in rows: md.append(f"| {r['id']} | {r['s']} | {r.get('note','')} {('`'+r['ev']+'`') if r.get('ev') else ''} |")
md+=['','## Bugs']+([f"- {b['id']} ({b['severity']}): {b['actual']} — {b['evidence']}" for b in bugs] or ['none'])
md+=['','## Observations']+['- '+o for o in meta['observations']]
open(f'{L}/c-round-483.md','w').write('\n'.join(md)+'\n')
