import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; B=f'{L}/b-round-502'
if os.path.exists(f'{B}/update-backlog-1.done'): sys.exit('already applied')
p=f'{L}/backlog.json'; b=json.load(open(p))
assert b['version']==497, b['version']
WHO='2026-11-14 B round 502 -> 503 planning'
b['version']=498; b['updated']='2026-11-14'
r=[x for x in b['rounds'] if x['round']==502][0]
r['status']='C PASS (browserVerified/realVerified true, 0 bugs; cart rows -STUBBED, CART-REAL-BACKEND blocked in cloud); gate 502 published 882854e (both remotes)'
of=b['open_findings']; dl=b['deferred_low_polish']
def find(i):
    for k in (of,dl):
        for f in k:
            if f.get('id')==i: return f
    raise KeyError(i)
ev={'B-R502-CART-MOBILE-ITEMS-HIDDEN':'C round 502 C1 (375: column 155/482/339 px, HEAD 47/0), C2 removeClicked true, C7 journey equal sketch',
    'B-R502-CART-LG-SUMMARY-CLIPPED':'C round 502 C3 18/18 inView+hit, Tab reaches Checkout with ring at 1366x600',
    'B-R502-CART-WHEEL-NESTED-SCROLL':'C round 502 C4 st 366/186, lastVisible true; C5 below-lg wheel+touch equal sketch'}
for i,e in ev.items():
    f=find(i); f['status']=f'closed (D-29z1807): client path fixed, {e}; c-round-502.json PASS browserVerified true; published 882854e; real-backend half stays CART-REAL-BACKEND | '+f['status']
dec=[
 ('D-29z1807',"Round 502 accepted from C's evidence only: c-round-502.json PASS, browserVerified/realVerified true, 0 bugs, L57 OK (c-round-502/l57-check.txt); gate 502 published 882854e on both remotes (verify 299/299 files, build ok, review COMMIT OK 8.5/10). B-R502-CART-MOBILE-ITEMS-HIDDEN, -LG-SUMMARY-CLIPPED and -WHEEL-NESTED-SCROLL closed for the client path (rows were -STUBBED, L36); CART-REAL-BACKEND stays open_backend."),
 ('D-29z1808',"Round-502 follow-ups recorded (L7): A's reviewer Lows A-R502-CR-1..5 -> deferred_low_polish (CR-1 origin B spec: the task's own D1 ruling line overstated when the wheel reaches the window; CR-2 confirmedBy gate 502 Low 1; CR-5 confirmedBy gate 502 Low 2); gate 502 Info 4 (summary-column ring clipping) is answered by C3 (ring not cut at 1366x600) -> no id; gate 502 Info 5 (useSmoothScroll rAF loop not cancelled on destroy) -> GATE502-I5-LENIS-RAF-LEAK info, joined to SIG-R502-LENIS-NESTED-SCROLL-SITEWIDE's future sweep; C infos -> INFO-C502-CHECKOUT-RING-1PX (info; L15 engine rounding, SABA-B-4 spec 1.5 px; input to the focus-ring item) and C-R502-SUMMARY-CARD-WIDTH-375 (Low candidate, deferred). Gate architecture note 'none; keep' -> confirmedBy on SIG-R502-LENIS-NESTED-SCROLL-SITEWIDE (one bounded audit task proposed there, not scheduled before DPG P1). Doc 323 l.4 was dispatched as 'In Progress (...; C round 502 PASS)' for a single-round fix; L28 requires 'Completed (C round 502 PASS)' -> B-R502-DOC323-L28-STATUS (Low, origin B spec, same class as B-R455-DOC298-STATUS-LINE); one-line grant in round 503."),
]
for i,t in dec:
    assert not any(d['id']==i for d in b['decisions_log_b'])
    b['decisions_log_b'].append({'id':i,'date':'2026-11-14','by':WHO,'decision':t})
new=[
 (dl,{'id':'A-R502-CR-1-DOC323-D1-WORDING','severity':'low','origin':'B spec','status':'deferred_low_polish (D-29z1808)','title':'Doc 323 l.28 (D1) and the round-502 ruling line say a column at its end passes the wheel to the window at lg; an overflowing column has overscroll-contain, so only a non-overflowing column at lg or any column below lg passes it','evidence':'a-round-502.md code-reviewer Low 1'}),
 (dl,{'id':'A-R502-CR-2-BELOW-LG-WHEEL-FEEL','severity':'low','origin':'B spec','status':'deferred_low_polish (D-29z1808): owner = SIG-R502-LENIS-NESTED-SCROLL-SITEWIDE sweep','title':'Below lg the cart columns carry data-lenis-prevent-wheel though they do not scroll, so the wheel there is native (unsmoothed) while the rest of the page is Lenis-smoothed (ruled D1)','evidence':'a-round-502.md Low 2','confirmedBy':['gate 502 review Low 1']}),
 (dl,{'id':'A-R502-CR-3-CML4-TOP-REGEX','severity':'low','origin':'B spec','status':'deferred_low_polish (D-29z1808)','title':'CML4 regex /(^|:)(sticky|top-\\d+)$/ misses top-[96px], top-px, top-1/2 (sticky still caught)','evidence':'a-round-502.md Low 3'}),
 (dl,{'id':'A-R502-CR-4-CML-ORDER','severity':'low','origin':'B spec','status':'deferred_low_polish (D-29z1808)','title':'cart-mobile-layout.test.ts declares CML4 before CML3 (cosmetic)','evidence':'a-round-502.md Low 4'}),
 (dl,{'id':'A-R502-CR-5-CML2-ATTR-ORDER','severity':'low','origin':'B spec','status':'deferred_low_polish (D-29z1808)','title':'CML2 matches only when data-lenis-prevent-wheel directly follows className (fails loudly on reorder or cn())','evidence':'a-round-502.md Low 5','confirmedBy':['gate 502 review Low 2']}),
 (dl,{'id':'C-R502-SUMMARY-CARD-WIDTH-375','severity':'low','origin':'pre-existing','status':'deferred_low_polish (D-29z1808): candidate; measure the boxes before fixing (screenshot only)','title':'At 375 px the cart Order Summary card looks ~8 px wider than the item cards (343 vs 335 px in the screenshot)','evidence':'c-round-502.json notes'}),
 (dl,{'id':'B-R502-DOC323-L28-STATUS','severity':'low','origin':'B spec','status':'scheduled round 503 (D-29z1808): one-line grant l.4 -> Completed (C round 502 PASS)','title':'Doc 323 l.4 published as In Progress (...; C round 502 PASS) for a single-round fix; L28 form is Completed (C round 502 PASS)','evidence':'docs/implementation/2026/quarter-IV/323-cart-mobile-items-hidden.md l.4 at 882854e'}),
 (of,{'id':'GATE502-I5-LENIS-RAF-LEAK','severity':'info','origin':'pre-existing','status':'info (D-29z1808): joins the SIG-R502-LENIS-NESTED-SCROLL-SITEWIDE sweep (useSmoothScroll owner)','title':'useSmoothScroll requestAnimationFrame loop is not cancelled in cleanup; after lenis.destroy() it keeps calling raf on a destroyed instance','evidence':'gates/round-502/review.md Info 5'}),
 (of,{'id':'INFO-C502-CHECKOUT-RING-1PX','severity':'info','origin':'pre-existing','status':'info (D-29z1808): shared focus-ring style; Chromium paints the 1.5px outline as 1px (L15 engine rounding); input to any later focus-ring revisit, no task','title':'Cart Checkout focus ring reads outline solid 1px / offset 2px vs SABA-B-4 text 1.5px','evidence':'c-round-502.json notes'}),
]
for lst,e in new:
    assert not any(d.get('id')==e['id'] for d in dl+of), e['id']
    e['added']=WHO; lst.append(e)
s=find('SIG-R502-LENIS-NESTED-SCROLL-SITEWIDE'); s.setdefault('confirmedBy',[]).append('gate 502 architecture note: bounded audit task (prevent option vs allowNestedScroll), not scheduled before DPG P1 (D-29z1808)')
open(p,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
open(f'{B}/update-backlog-1.done','w').write('ok')
print('ok', b['version'])
