import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; B=f'{L}/b-round-503'
if os.path.exists(f'{B}/update-backlog-1.done'): sys.exit('already applied')
p=f'{L}/backlog.json'; b=json.load(open(p))
assert b['version']==500, b['version']
b['version']=501; b['updated']='2026-11-14'
WHO='2026-11-14 B round 503 -> 504 planning'
ADD='2026-11-14 B round 503 -> 504 planning'
def find(lst,i):
    r=[x for x in b[lst] if x.get('id')==i]; assert len(r)==1,(lst,i); return r[0]
d1=("Round 503 accepted from C evidence only: c-round-503.json PASS, browserVerified/realVerified true, 0 bugs, C0-C14 pass (cart and recordings rows -STUBBED, L36); "
    "gate 503 published b806cad (both remotes), verify.log 300 files / 4353 tests, review COMMIT OK 9/10. DPG-BUTTON-CLEANUP-2 stage 2b-3 verified (C round 503); "
    "B-R502-DOC323-L28-STATUS closed by C11 (doc 323 l.4 byte-equal 'Completed (C round 502 PASS)'). CART-REAL-BACKEND-503 (blocked in cloud) folds into CART-REAL-BACKEND.")
d2=("Round-503 follow-ups (L7): A-R503-CR-1 (doc 324 l.4 says C round 503 PASS before C ran) is the L28 contract, now true - closed, no id kept open; "
    "A-R503-CR-2 (B2B3-6 builder count >= 1 weak; exact strings pinned by B2B3-1/3/5) info -> deferred; A-R503-CR-3 (StubCatalog recordings unknown[] can drift; satisfies) -> deferred Low; "
    "A-R503-CR-4 (doc 323 l.4 dropped the B-R502 ids) -> deferred Low. Gate 503 Low 1 (showcase scale removed) = documented deviation D3, no id; Low 2 (barrel import) confirmedBy on GATE498-L2-BARREL-IMPORT when present else info; "
    "Lows 3/4 (full-string pins, scanner limits) and the architecture note -> confirmedBy on SIG-R501-SHARED-BUTTON-SCANNER and SIG-R498-BUTTONLINK-WRAPPER; Low 5 (doc 324 stays In Progress until 2e) is the multi-stage L28 rule, no id. "
    "C info 'shared ring 1px vs SABA-B-4 1.5px' -> confirmedBy on INFO-C502-CHECKOUT-RING-1PX.")
for i,t in (('D-29z1812',d1),('D-29z1813',d2)):
    assert not any(d['id']==i for d in b['decisions_log_b'])
    b['decisions_log_b'].append({'id':i,'date':'2026-11-14','by':WHO,'decision':t})
x=find('deferred_low_polish','B-R502-DOC323-L28-STATUS'); x['status']='closed (D-29z1812): C round 503 C11 byte-equal; published b806cad | '+x['status']
x=find('open_findings','CART-REAL-BACKEND'); x['status']='open_backend (D-29z1812): round 503 rows also -STUBBED (CART-REAL-BACKEND-503 folded here) | '+x['status']
x=find('open_findings','INFO-C502-CHECKOUT-RING-1PX'); x.setdefault('confirmedBy',[]).append('c-round-503.json notes: shared ring measures solid 1px / offset 2px (D-29z1813)')
for i in ('SIG-R501-SHARED-BUTTON-SCANNER','SIG-R498-BUTTONLINK-WRAPPER'):
    x=find('open_findings',i); x.setdefault('confirmedBy',[]).append('gate 503 review Lows 3-4 + Architecture note; a-round-503.md Architecture note (D-29z1813)')
g=[x for x in b['deferred_low_polish'] if x.get('id')=='GATE498-L2-BARREL-IMPORT']
if g: g[0].setdefault('confirmedBy',[]).append('gate 503 review Low 2 (StudioShowcase barrel import) (D-29z1813)')
new=[('A-R503-CR-2-B2B3-6-WEAK-COUNT','info','B spec','B2B3-6 checks buildButtonClassName( count >= 1 per file only (exact class strings are pinned by B2B3-1/3/5)','a-round-503.md Info 2'),
     ('A-R503-CR-3-STUBCATALOG-DRIFT','low','B spec','store-button-cleanup-2b3.test.tsx StubCatalog (recordings: unknown[]) can drift from the API type; vi.mock factories are not type-checked (use satisfies)','a-round-503.md Info 3'),
     ('A-R503-CR-4-DOC323-IDS-DROPPED','low','B spec','doc 323 l.4 Completed line no longer names the three B-R502 bug ids (harder to grep)','a-round-503.md Info 4')]
for i,s,o,t,e in new:
    assert not any(x.get('id')==i for x in b['deferred_low_polish'])
    b['deferred_low_polish'].append({'id':i,'severity':s,'origin':o,'status':'deferred_low_polish (D-29z1813)','title':t,'evidence':e,'added':ADD})
open(p,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
open(f'{B}/update-backlog-1.done','w').write('ok'); print('ok',b['version'],'gate498',bool(g))
