import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; B=f'{L}/b-round-503'
if os.path.exists(f'{B}/update-backlog-2.done'): sys.exit('already applied')
p=f'{L}/backlog.json'; b=json.load(open(p))
assert b['version']==501, b['version']
b['version']=502
WHO='2026-11-14 B round 503 -> 504 planning'; ADD=WHO
def find(lst,i):
    r=[x for x in b[lst] if x.get('id')==i]; assert len(r)==1,(lst,i); return r[0]
d14=("Round 504 = DPG-BUTTON-CLEANUP-2 stage 2c (inventory A3, PurchaseHeader). Mapping by product-designer (b-round-503/consult-product-designer.md): "
     "Go to Downloads <Link> -> buildButtonClassName({ size: 'lg', className: 'min-w-[160px] whitespace-nowrap' }); Upgrade to Premium and Unlock Premium <button> -> "
     "<Button type=\"button\" size=\"lg\" className=\"min-w-[160px] whitespace-nowrap\"> (Unlock keeps disabled={isDisabled} and its own Processing... children; no isLoading); "
     "default 8px shape (card/notice action), primary brass (not accent; follows SABA-Q-502-UPGRADE-VARIANT if Saba answers accent). Buy Now bg-buy and the other siblings untouched (NONBRAND). "
     "Sketch v2 c776999d (b-round-503/sketch-504.patch.txt), new test store-button-cleanup-2c.test.tsx B2C-0..9, DESIGN_SYSTEM default row + two-shapes sentence, doc 325. "
     "Measured HEAD :5173 vs sketch :5174 (b-round-503/probe/): radius 12->8, 50->48 when alone (52 beside a bordered sibling), cards <= 2 px shorter, Upgrade text black -> rgb(14,13,12), contrast 8.32/10.28, siblings diff none, card focusables/overflow equal; "
     "journeys: Go to Downloads -> /account/downloads, Upgrade selects Premium, Unlock 1 checkout POST on single and double click, anonymous Buy Now 0 POSTs; busy now pointer-events none + rest brass (D5). Scanner 100/38 -> 96/35.")
d15=("Round 504 consults and review: product-designer ruled Q1-Q5 (default shape, lg, primary, <Button disabled>, C rows). tech-lead v1 ce4b1105 APPROVE (no Medium; optional Low B2C-5 title fixed in v2; "
     "M13 type=button mutant added); delta review v2 c776999d APPROVE (b-round-503/sketch-review.md). Pre-check on v2: tsc rc 0, lint 179, Biome rc 0, covering 6/79 (slowest 392 ms), full 301/4363 rc 0, build rc 0, mutants M1-M13 OK. "
     "New deferred: PD-R504-DISABLED-NO-REASON (info), TL-R504-STALE-UPGRADE-COMMENT (info); tech-lead Low 5 (untyped vi.mock partials) confirmedBy A-R503-CR-3-STUBCATALOG-DRIFT; NONBRAND gains the PurchaseHeader in-card siblings -> 8 px note. No architecture checkpoint (one owner).")
for i,t in (('D-29z1814',d14),('D-29z1815',d15)):
    assert not any(d['id']==i for d in b['decisions_log_b'])
    b['decisions_log_b'].append({'id':i,'date':'2026-11-14','by':WHO,'decision':t})
b['current_task']=("Round 504: DPG-BUTTON-CLEANUP-2 stage 2c (PurchaseHeader): A applies b-round-503/sketch-504.patch.txt (v2 sha c776999d, tech-lead v1 APPROVE, v2 APPROVE): "
    "Go to Downloads -> buildButtonClassName primary lg + min-w-[160px] whitespace-nowrap; Upgrade to Premium and Unlock Premium -> <Button type=button size=lg> (Unlock disabled={isDisabled}, Processing... kept); "
    "new store-button-cleanup-2c.test.tsx B2C-0..9; DESIGN_SYSTEM default row + sentence; doc 325. C runs C0-C14 (current-task.md; owner rows -STUBBED, purchase journeys J1-J5)")
q=[x for x in b['post_current_stage_queue'] if x.get('id')=='DPG-FIX'][0]
q['status']=('in_progress (D-29z1814): round 503 2b-3 C PASS (published b806cad); round 504 = DPG-BUTTON-CLEANUP-2 2c PurchaseHeader; then 2d, 2e, NONBRAND, rest of P1, DP gate, P2; '
             'REGRESSION first when planned on/after 2026-11-16; RETRO 510 | '+q['status'])
x=find('open_findings','DPG-BUTTON-CLEANUP-2-NONBRAND'); x['note_d29z1815']='includes the PurchaseHeader in-card siblings (Open in Studio, Downloads, Add to Cart, Buy Now radius) -> 8 px default shape, so the purchase card is one system again (product-designer, round 504 consult)'
x=find('open_findings','SABA-Q-502-UPGRADE-VARIANT'); x['note_d29z1814']='if Saba rules accent, the PurchaseHeader "Upgrade to Premium" (round 504, brass primary) follows in the same round'
x=find('deferred_low_polish','A-R503-CR-3-STUBCATALOG-DRIFT'); x.setdefault('confirmedBy',[]).append('round 504 sketch review (tech-lead v1 Low 5): store-button-cleanup-2c.test.tsx vi.mock factories are untyped partials (D-29z1815)')
new=[('PD-R504-DISABLED-NO-REASON','info','B spec',"Button's disabled builder output adds pointer-events-none, which hides cursor-not-allowed and any title; PurchaseHeader isDisabled also covers !isSupportedVersion and isAddingToCart, so a disabled purchase button never tells why (not a regression: no reason was shown at HEAD either)",'b-round-503/consult-product-designer.md Q4'),
     ('TL-R504-STALE-UPGRADE-COMMENT','info','pre-existing','PurchaseHeader.tsx keeps the stale JSX comment {/* Upgrade Now - Brand color */} above Unlock Premium (and the "Buy Now - Commerce Blue" comment although bg-buy renders brass); comment-only cleanup for NONBRAND or COPY','b-round-503/sketch-review.md Review 1 #9')]
for i,s,o,t,e in new:
    assert not any(x.get('id')==i for x in b['deferred_low_polish'])
    b['deferred_low_polish'].append({'id':i,'severity':s,'origin':o,'status':'deferred_low_polish (D-29z1815)','title':t,'evidence':e,'added':ADD})
open(p,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
open(f'{B}/update-backlog-2.done','w').write('ok'); print('ok',b['version'])
