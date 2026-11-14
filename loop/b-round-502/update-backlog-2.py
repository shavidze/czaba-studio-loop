import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; B=f'{L}/b-round-502'
if os.path.exists(f'{B}/update-backlog-2.done'): sys.exit('already applied')
p=f'{L}/backlog.json'; b=json.load(open(p))
assert b['version']==498, b['version']
WHO='2026-11-14 B round 502 -> 503 planning'
b['version']=499; b['updated']='2026-11-14'
b['current_task']=("Round 503: DPG-BUTTON-CLEANUP-2 stage 2b-3: A applies b-round-502/sketch-503.patch.txt (v2 sha 210ee872, tech-lead v1 APPROVE WITH CONDITIONS fixed, v2 APPROVE): cart.tsx Upgrade -> buildButtonClassName primary sm + min-h-11 shrink-0; recordings.$productId.tsx Create a scene -> primary md pill + mb-6 min-h-11; StudioShowcase Browse the Collection -> primary lg pill (scale removed); new store-button-cleanup-2b3.test.tsx B2B3-0..7; DESIGN_SYSTEM shape rows + two-shapes sentence; doc 323 l.4 -> Completed (C round 502 PASS); doc 324. C runs C0-C14 (current-task.md; cart/recordings rows -STUBBED)")
b['rounds'].append({'round':503,'task':'current-task.md','decision':'D-29z1809','type':'DPG-BUTTON-CLEANUP-2 stage 2b-3 (cart Upgrade, recordings Create a scene, StudioShowcase Browse the Collection) + doc 323 L28 status line','status':'dispatched','note':'baseline 882854e clean; sketch b-round-502/sketch-503.patch.txt v2 sha 210ee872; pre-check b-round-502/precheck-*.log (full 300/4353 rc0, build rc0); mutants M1-M16 OK; probes b-round-502/probe/'})
dec=[
 ('D-29z1809',"Round 503 = DPG-BUTTON-CLEANUP-2 stage 2b-3, the last three A2 sites (b-round-497/stage2-inventory.md), with product-designer's D-29z1804 mapping unchanged: cart Upgrade primary sm default + min-h-11 shrink-0 (104x32 -> 104x44; notice 64 -> 70 px and card 219 -> 225 at lg, 375 unchanged); recordings Create a scene primary md pill + mb-6 min-h-11 (131x44 kept, 12 px -> pill); StudioShowcase Browse the Collection primary lg pill (257x58 -> 241x48, hover/press scale removed: links have no :active scale). Plus the one-line doc 323 l.4 grant (B-R502-DOC323-L28-STATUS). Scanner 104/41 -> 100/38. Persistent screen text unchanged (L39). Purchase protection: className + import lines only; cart actions and C7 journey equal HEAD on the sketch (b-round-502/probe/nb-*). REGRESSION not due (next on/after 2026-11-16); RETRO 510."),
 ('D-29z1810',"Round 503 consults and rulings: tech-lead review 1 on v1 1a716032 APPROVE WITH CONDITIONS (Medium: three 'as Element' casts in the new test vs CLAUDE.md no type assertions; Lows: brittle toBe(1) builder count, DESIGN_SYSTEM two-shapes sentence, doc 324 card growth) all fixed in v2 (typed it.each tables instead of as const too); review 2 on v2 210ee872 APPROVE, no new findings (b-round-502/sketch-review.md). Reviewer Info 8 -> deferred Low TL-R503-CART-NOTICE-375-SQUEEZE. L31: BC1b reached 51 % of its 5 s timeout inside the parallel covering run (2562 ms) but 1037-1102 ms alone; store-button-cleanup.test.tsx tests the unchanged Button.tsx and is ruled out of the covering set (gate still runs it); confirmedBy on GATE497-L5-BC1B-RENDER-COST. No architecture checkpoint (three class swaps, three owners); SIG-R498-BUTTONLINK-WRAPPER and SIG-R501-SHARED-BUTTON-SCANNER decided at stage-2 close after 2e. Advisor available and consulted."),
]
for i,t in dec:
    assert not any(d['id']==i for d in b['decisions_log_b'])
    b['decisions_log_b'].append({'id':i,'date':'2026-11-14','by':WHO,'decision':t})
of=b['open_findings']; dl=b['deferred_low_polish']
def find(i):
    for k in (of,dl):
        for f in k:
            if f.get('id')==i: return f
    raise KeyError(i)
f=find('DPG-BUTTON-CLEANUP-2')
f['status']='in_progress (D-29z1807, D-29z1809): round 502 cart bugs closed; 2b-3 dispatched as round 503 (b-round-502/sketch-503.patch.txt v2); then 2c PurchaseHeader, 2d chat, 2e LeadMagnet, NONBRAND | '+f['status']
g=find('GATE497-L5-BC1B-RENDER-COST'); g.setdefault('confirmedBy',[]).append('B round 503 planning (D-29z1810): BC1b 2348/2562 ms inside the parallel covering run (51 % of 5 s), 1037-1102 ms alone (b-round-502/bc1b-alone.log); gate 502 2248 ms; removed from round-503 covering set')
d=find('B-R502-DOC323-L28-STATUS'); d['status']='dispatched round 503 (D-29z1809): sketch-503 writes l.4 = **სტატუსი:** Completed (C round 502 PASS); closes on C round 503 PASS | '+d['status']
new=[(dl,{'id':'TL-R503-CART-NOTICE-375-SQUEEZE','severity':'low','origin':'pre-existing','status':'deferred_low_polish (D-29z1810): layout change (stack the button under the text below sm) needs product-designer and, as a position move, Saba','title':'At 375 px the cart ownership notice text column is squeezed to 79 px and wraps to 3 lines beside the 104 px Upgrade button (HEAD and sketch)','evidence':'b-round-502/probe/head/head.json and sketch/sketch.json CART-UPGRADE 375 context.textCol w 79, ownLines 3; b-round-502/sketch-review.md review 1 Info 8'})]
for lst,e in new:
    assert not any(x.get('id')==e['id'] for x in dl+of), e['id']
    e['added']=WHO; lst.append(e)
q=[x for x in b['post_current_stage_queue'] if x['id']=='DPG-FIX'][0]
q['status']='in_progress (D-29z1809): round 502 cart bugs C PASS (published 882854e); round 503 = DPG-BUTTON-CLEANUP-2 2b-3; then 2c, 2d, 2e, NONBRAND, rest of P1, DP gate, P2; REGRESSION first when planned on/after 2026-11-16; RETRO 510 | '+q['status']
b['advisor_used_by_B']['round_503_planning']='available; consulted after orientation and at the closing check (2026-11-14)'
open(p,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
open(f'{B}/update-backlog-2.done','w').write('ok')
print('ok', b['version'])
