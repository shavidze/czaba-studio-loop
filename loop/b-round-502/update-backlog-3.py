import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; B=f'{L}/b-round-502'
if os.path.exists(f'{B}/update-backlog-3.done'): sys.exit('already applied')
p=f'{L}/backlog.json'; b=json.load(open(p))
assert b['version']==499, b['version']
b['version']=500
WHO='2026-11-14 B round 502 -> 503 planning (closing check)'
t=("Correction to D-29z1810 (closing check): BC1b declares BC1B_TIMEOUT_MS = 20_000 (store-button-cleanup.test.tsx l.45), so its 2348/2562 ms covering-run times are 12-13 % of its timeout, not 51 % of a 5 s default; there is no L31 issue. task 501 (tasks/round-501.md) used the same wrong '5 s default'. store-button-cleanup.test.tsx stays out of the round-503 covering set for a different reason: it tests the unchanged Button.tsx (gate still runs it). Also fixed in the task text: the K19 sentence (other multi-stage docs listed), K29 now prints every target x viewport plus the computed transition (no cause claimed), ledger row 22 cites the patch for tab order, K35 counts builder calls (C8).")
assert not any(d['id']=='D-29z1811' for d in b['decisions_log_b'])
b['decisions_log_b'].append({'id':'D-29z1811','date':'2026-11-14','by':WHO,'decision':t})
g=[x for x in b['deferred_low_polish'] if x['id']=='GATE497-L5-BC1B-RENDER-COST'][0]
g['confirmedBy'][-1]=g['confirmedBy'][-1]+' [corrected D-29z1811: 20 s declared timeout, 12-13 %, no L31 issue; removed from covering because Button.tsx is unchanged]'
open(p,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
open(f'{B}/update-backlog-3.done','w').write('ok')
print('ok',b['version'])
