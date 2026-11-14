import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; B=f'{L}/b-round-504'
if os.path.exists(f'{B}/update-backlog-1.done'): sys.exit('already applied')
p=f'{L}/backlog.json'; b=json.load(open(p))
assert b['version']==503, b['version']
b['version']=504; b['updated']='2026-11-14'
WHO='2026-11-14 B round 504 -> 505 planning'; ADD=WHO
def find(lst,i):
    r=[x for x in b[lst] if x.get('id')==i]; assert len(r)==1,(lst,i); return r[0]
d1=("Round 504 accepted from C evidence only: c-round-504.json PASS, browserVerified/realVerified true, 0 bugs, C0-C14 pass (owner states and purchase journeys -STUBBED, L36; one cold run replaced per L38); "
    "c-round-504/l57-check.txt; gate 504 published e3e9e49 (both remotes), review COMMIT OK. DPG-BUTTON-CLEANUP-2 stage 2c (PurchaseHeader, inventory A3) verified. "
    "PURCHASE-REAL-BACKEND-504 (blocked in cloud) is kept as open evidence under the new id PURCHASE-REAL-BACKEND.")
d2=("Round-504 follow-ups (L7): A-R504-CR-1 (redundant not.toContain('text-black') after exact toBe) and A-R504-CR-2 (B2C-5 click on the disabled button cannot fail independently; no mutant targets the click line) -> new deferred Lows. "
    "A-R504-CR-3 (Link mock passes only to/className/children) confirmedBy A-R503-CR-3-STUBCATALOG-DRIFT; A-R504-CR-4 (busy class carries cursor-pointer and cursor-not-allowed) and gate 504 Low 1 (cursor-not-allowed never shown) confirmedBy PD-R504-DISABLED-NO-REASON. "
    "Gate 504 Low 2 (whole-string pins, hand scanner) and the Architecture note (extract shared handRolledBrassActions scanner into app/lib/__tests__/helpers/) confirmedBy SIG-R501-SHARED-BUTTON-SCANNER (decided at the stage-2 close, not auto-scheduled). "
    "Gate 504 Low 3 (doc 325 'In Progress') is the multi-stage L28 contract (status flips to Completed when DPG-BUTTON-CLEANUP-2 closes), no id.")
for i,t in (('D-29z1817',d1),('D-29z1818',d2)):
    assert not any(d['id']==i for d in b['decisions_log_b'])
    b['decisions_log_b'].append({'id':i,'date':'2026-11-14','by':WHO,'decision':t})
r=[r for r in b['rounds'] if r.get('round')==504]; assert len(r)==1
r[0]['status']='C PASS (browserVerified/realVerified true, 0 bugs; owner states -STUBBED, PURCHASE-REAL-BACKEND blocked in cloud); gate 504 published e3e9e49 (both remotes)'
r[0]['result_note']='C0-C14 PASS (c-round-504.json); review COMMIT OK; D-29z1817/D-29z1818'
assert not any(x.get('id')=='PURCHASE-REAL-BACKEND' for x in b['open_findings'])
b['open_findings'].append({'id':'PURCHASE-REAL-BACKEND','severity':'info','origin':'B spec','status':'open_backend (D-29z1817): round 504 owner states (S1P/S1X/S2/S3) and the upgrade checkout journeys are -STUBBED (client path only); a real ownership/upgrade check needs the .NET backend (BLOCKED in cloud)','title':'PurchaseHeader owner/upgrade states and upgrade checkout with a real backend','evidence':'c-round-504.json blocked','added':ADD})
x=find('deferred_low_polish','A-R503-CR-3-STUBCATALOG-DRIFT'); x.setdefault('confirmedBy',[]).append('a-round-504.md CR-3: store-button-cleanup-2c.test.tsx Link mock passes only to/className/children (D-29z1818)')
x=find('deferred_low_polish','PD-R504-DISABLED-NO-REASON'); x.setdefault('confirmedBy',[]).append('a-round-504.md CR-4 and gates/round-504/review.md Low 1: disabled Unlock Premium never shows cursor-not-allowed (pointer-events-none) (D-29z1818)')
x=find('open_findings','SIG-R501-SHARED-BUTTON-SCANNER'); x.setdefault('confirmedBy',[]).append('gates/round-504/review.md Low 2 + Architecture note; a-round-504.md Architecture note (D-29z1818)')
new=[('A-R504-CR-1-REDUNDANT-TEXT-BLACK','info','A review','store-button-cleanup-2c.test.tsx B2C-3 not.toContain(text-black) is redundant after the exact class toBe','a-round-504.md CR-1 (test:210)'),
     ('A-R504-CR-2-DISABLED-CLICK-NO-MUTANT','low','A review','store-button-cleanup-2c.test.tsx B2C-5 click on the disabled Unlock Premium cannot fail independently of the disabled assertion; no mutant targets the click line alone (signal gap, not a behaviour gap)','a-round-504.md CR-2 (test:244-245)')]
for i,s,o,t,e in new:
    assert not any(x.get('id')==i for x in b['deferred_low_polish'])
    b['deferred_low_polish'].append({'id':i,'severity':s,'origin':o,'status':'deferred_low_polish (D-29z1818)','title':t,'evidence':e,'added':ADD})
open(p,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
open(f'{B}/update-backlog-1.done','w').write('ok'); print('ok',b['version'])
