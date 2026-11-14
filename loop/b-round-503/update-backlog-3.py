import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; B=f'{L}/b-round-503'
if os.path.exists(f'{B}/update-backlog-3.done'): sys.exit('already applied')
p=f'{L}/backlog.json'; b=json.load(open(p))
assert b['version']==502, b['version']
b['version']=503
WHO='2026-11-14 B round 503 -> 504 planning (closing check)'
t=("Closing check (advisor): doc 325 had three lines false against the tree - 'docs 320-324' (323 is the cart-layout doc), 'B2C-1..7 render all four states' (five, incl. anonymous), "
   "'B2C-8 and B2C-9 read the file' (B2C-9 self-tests the scanner). Sketch v3 84cc9df3 corrects them (doc 325 text only; delta b-round-503/sketch-delta-v2-v3.diff.txt); tech-lead delta review v3 APPROVE. "
   "On v3: full 301/4363 rc 0, build rc 0, covering 6/79 (slowest 368 ms); check 4 list regenerated. Task text: S2 accent 'Downloads' sibling ruling line (locator matches 3, measured via cardInfo/row box), "
   "L47 removed from the applied list (J2 unmounts the clicked button at HEAD too; record-only), C7 equality wording, consult header reworded (condensed, not verbatim).")
assert not any(d['id']=='D-29z1816' for d in b['decisions_log_b'])
b['decisions_log_b'].append({'id':'D-29z1816','date':'2026-11-14','by':WHO,'decision':t})
r503=[r for r in b['rounds'] if r.get('round')==503]; assert len(r503)==1
r503[0]['status']='C PASS (browserVerified/realVerified true, 0 bugs; cart and recordings rows -STUBBED, CART-REAL-BACKEND blocked in cloud); gate 503 published b806cad (both remotes)'
r503[0]['result_note']='C0-C14 PASS (c-round-503.json); review COMMIT OK 9/10; D-29z1812/D-29z1813'
assert not any(r.get('round')==504 for r in b['rounds'])
b['rounds'].append({'round':504,'task':'current-task.md','decision':'D-29z1814','type':'DPG-BUTTON-CLEANUP-2 stage 2c (PurchaseHeader: Go to Downloads, Upgrade to Premium, Unlock Premium)','status':'dispatched',
  'note':'baseline b806cad clean; sketch b-round-503/sketch-504.patch.txt v3 sha 84cc9df3; pre-check b-round-503/precheck-*.log (full 301/4363 rc0, build rc0); mutants M1-M13 OK; probes b-round-503/probe/ (owner states -STUBBED, purchase journeys J1-J5)'})
b['current_task']=b['current_task'].replace('v2 sha c776999d, tech-lead v1 APPROVE, v2 APPROVE','v3 sha 84cc9df3, tech-lead v1/v2/v3 APPROVE')
assert '84cc9df3' in b['current_task']
open(p,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
open(f'{B}/update-backlog-3.done','w').write('ok'); print('ok',b['version'])
