import json, sys
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b=json.load(open(P, encoding='utf-8'))
assert b['version']==490, b['version']
BY='2026-11-13 B round 497 -> 498 planning'
def find(lst, i):
    for x in lst:
        if x.get('id')==i: return x
    return None
of=b['open_findings']; dl=b['deferred_low_polish']
def pre(x, s): x['status']=s+' | '+x.get('status','')
# closes on C evidence (c-round-497.json passed C2/C6/C10/C11, browserVerified true)
for i in ['B-R496-404-BROWSE-STORE-UNSTYLED','A-R496-CR-GS3-GUARD','A-R496-CR-BC1-PIN']:
    x=find(of,i); assert x, i; pre(x,'closed (D-29z1782): C round 497 PASS (C2/C6 resp. C10/C11), browserVerified true; published 5d12c75')
for i in ['A-R496-CR-BC3-SELF-DERIVED','A-R496-CR-BC4-NEAR-VACUOUS']:
    x=find(dl,i); assert x, i; pre(x,'closed (D-29z1782): C round 497 PASS C10/C11 (BC3 closest, BC4 absent tokens), published 5d12c75')
x=find(dl,'A-R496-CR-SIGNED-IN-SKELETON-SHIFT'); assert x
x.setdefault('confirmedBy',[]); x['confirmedBy']+=['C497-HDR-HEIGHT-SIGNED-IN (C round 497 C15: signed-in header 75 vs signed-out 81 px at 1440/1280, c-round-497/extra.json)','GATE497-L1 (gate 497 review finding 1)']
pre(x,'deferred_low_polish (D-29z1783): confirmed by C15 and gate 497 L1; linked to SABA-Q-496-BUTTONS Q2')
x=find(dl,'A-R496-CR-LINK-DISABLED-VISUAL-ONLY'); assert x
x.setdefault('confirmedBy',[]); x['confirmedBy'].append('GATE497-L3 (gate 497 review finding 3)')
d=find(of,'DPG-BUTTON-CLEANUP-2'); assert d
pre(d,'in_progress (D-29z1784): split into 2a (round 498, status-page CTA links: checkout.cancel, checkout.success, faq, account.orders), 2b route/section CTAs, 2c PurchaseHeader purchase path, 2d chat, 2e LeadMagnet keep-list restyle; NONBRAND follow-up; inventory b-round-497/stage2-inventory.md (121 hits / 52 solid at 5d12c75)')
d['evidence']='b-round-497/stage2-inventory.md, b-round-497/scan-head.json (supersedes b-round-495/stage2-bg-brand-hits.txt)'
d['substages_d29z1784']={'2a':'round 498: checkout.cancel 43/50, checkout.success 187/194, faq 169, account.orders 238 -> primary/ghost lg pill (sketch b-round-497/sketch-498-v3.patch.txt)','2b':'store 355, recordings.$productId 190, cart 162, ErrorBoundary 46, EmptyState 63/70, hire-us 279 (ST5 pin), free-downloads 284, NewsletterSection 84, StudioShowcase 155','2c':'PurchaseHeader 191/231/293 (purchase path; click-still-works + purchase protection rows)','2d':'GuestForm 96, ChatInput 82, ChatButton 20 (IconButton candidates)','2e':'LeadMagnetPopup 187/279 (keep-list: restyle only)','not_buttons':'selected-state paints (SIG-R498-SELECTED-STATE-PAINTS) and fills/bars/badges: out of item 7','protected':'ROOT-REQ-DPG-BUTTONS-PROTECTED','studio':'components/arrangement out of the Store block'}
new_of=[
 {'id':'DPG-BUTTON-CLEANUP-2-NONBRAND','severity':'medium','origin':'B spec','status':'scheduled (D-29z1784): after DPG-BUTTON-CLEANUP-2 2a-2e; record count, needs a mutant-proven scanner at its planning','title':'Hand-rolled buttons without a brand fill (30 <button|Link|a> with padding+rounded literal classes in 18 Store files) also bypass Button.tsx (Saba DPG item 7)','evidence':'b-round-497/other-handrolled-count.txt','added':BY},
 {'id':'PD-R498-404-SECONDARY-ALIGN','severity':'low','origin':'B spec','status':'scheduled (D-29z1783): own stage after DPG-BUTTON-CLEANUP-2 (product-designer: one secondary treatment, ghost lg pill); confirmedBy GATE497-L4','title':'404 Browse Store is a quiet text link while paired secondaries become ghost lg pills','evidence':'b-round-497/consult-product-designer.md (b); gates/round-497/review.md finding 4','added':BY,'confirmedBy':['GATE497-L4']},
 {'id':'ROOT-REQ-DPG-BUTTONS-PROTECTED','severity':'info','origin':'B spec','status':'open_root (D-29z1784): root/Saba apply the stage-2 mapping outside the loop; does not block','title':'Protected studio.$productId.tsx (440/471/521) and account.downloads.tsx (261) hold hand-rolled bg-brand buttons','evidence':'b-round-497/stage2-inventory.md class E','added':BY},
 {'id':'SIG-R498-SELECTED-STATE-PAINTS','severity':'info','origin':'B spec','status':'signal (D-29z1784): input to DPG-COLOR-CONSOLIDATE; a Button selected API would be a new contract','title':'Selected-state chips/toggles paint bg-brand by hand (store filters, StemControl, RecordingCatalogRow, FXSoundPreviewGrid, VersionSelector)','evidence':'b-round-497/stage2-inventory.md class B','added':BY},
 {'id':'SIG-R498-BUTTONLINK-WRAPPER','severity':'info','origin':'gate reviewer','status':'signal (D-29z1785): architecture note, not scheduled; tech-lead: keep inline, consider a Remix-Link-only ButtonLink after stage 2 (orders stays a plain <a>)','title':'10 link callers of buildButtonClassName, 9 with { size: lg, shape: pill }','evidence':'gates/round-497/review.md Architecture note; b-round-497/sketch-review.md','added':BY},
 {'id':'INFO-B497-C15-UNMEASURED-ASSERT','severity':'info','origin':'B spec','status':'recorded (D-29z1783): L58 recurrence; RETRO 510 counter','title':'Task 497 C15 asserted signed-in header height = signed-out +-1 px without B running it on the sketch (75 vs 81 measured by C)','evidence':'c-round-497.json rowsNotPassed','added':BY},
 {'id':'SABA-Q-498-HERO-CTA-SIZE','severity':'info','origin':'gate reviewer','status':'awaiting_user (D-29z1783): user-review/questions-round-498.md Q1; default as built','title':'Hero CTA shrank 56 -> 48 px (px-8 py-4 -> lg) in stage 1; confirm (GATE497-L2)','evidence':'gates/round-497/review.md finding 2','added':BY},
]
for n in new_of:
    assert not find(of,n['id']); of.append(n)
new_dl=[
 {'id':'GATE497-L5-BC1B-RENDER-COST','severity':'low','origin':'gate reviewer','status':'deferred_low_polish (D-29z1783)','title':'BC1b renders 288 Buttons under a 20 s timeout; class checks could call buildButtonClassName without rendering','evidence':'gates/round-497/review.md finding 5; a-round-497/covering.log BC1b 1142 ms','added':BY},
 {'id':'A-R498-TL-B2-2-TIMER-PIN','severity':'low','origin':'B spec','status':'deferred_low_polish (D-29z1785): kept on purpose (HEAD 800 ms reveal); N10 RED intended','title':'B2-2 advances exactly 800 ms, so a reveal-timing change fails it','evidence':'b-round-497/sketch-review.md','added':BY},
]
for n in new_dl:
    assert not find(dl,n['id']); dl.append(n)
# DPG queue entry
for e in b['post_current_stage_queue']:
    if e['id']=='DPG-FIX':
        e['status']='in_progress (D-29z1784): DPG-BUTTON-CLEANUP stage 1 C PASS round 497 (published 5d12c75, awaits DP gate); round 498 = DPG-BUTTON-CLEANUP-2 stage 2a; then 2b-2e, NONBRAND, PD-R498-404-SECONDARY-ALIGN, rest of DPG P1; REGRESSION first when planned on/after 2026-11-16; RETRO 510 | '+e['status']
        e['button_cleanup_d29z1773']['stage1_result']='C PASS round 497, browserVerified true, published 5d12c75 (D-29z1782)'
        e['button_cleanup_d29z1773']['stage2_split']='D-29z1784: b-round-497/stage2-inventory.md'
b['rounds'][-1]['status']='C PASS (D-29z1782): browserVerified true; gate 497 published 5d12c75'
b['rounds'].append({'round':498,'task':'current-task.md','decision':'D-29z1784','type':'DPG-BUTTON-CLEANUP-2 stage 2a (status-page CTA links -> buildButtonClassName)','status':'dispatched','note':'baseline 5d12c75 clean; sketch b-round-497/sketch-498-v3.patch.txt sha 90786f20'})
b['current_task']='Round 498: DPG-BUTTON-CLEANUP-2 stage 2a: A applies b-round-497/sketch-498-v3.patch.txt (checkout.cancel/success, faq, account.orders CTA links -> primary/ghost lg pill via buildButtonClassName; new store-button-cleanup-2.test.tsx; ST5 orders block; DESIGN_SYSTEM Buttons; doc 320 prose); C runs C0-C13 in the browser (current-task.md)'
b['baseline']['head_round_497']='5d12c75e88fea6bc2b25f8472930ca3ffeccf0f1'
b['advisor_used_by_B']['round_498_planning']='available; used after orientation and at the closing check (2026-11-13)'
D=[
 ('D-29z1782','Round 497 accepted on C evidence: c-round-497.json taskStatus PASS, browserVerified/realVerified true; gate 497 published 5d12c75 (both remotes). Closed B-R496-404-BROWSE-STORE-UNSTYLED (C2/C6), A-R496-CR-GS3-GUARD, A-R496-CR-BC1-PIN (C10/C11) and Lows A-R496-CR-BC3-SELF-DERIVED, A-R496-CR-BC4-NEAR-VACUOUS. DPG-BUTTON-CLEANUP stage 1 C-verified; item not done until stage 2 and the DP gate.'),
 ('D-29z1783','C15 + gate 497 findings: C497-HDR-HEIGHT-SIGNED-IN and GATE497-L1 -> confirmedBy A-R496-CR-SIGNED-IN-SKELETON-SHIFT (L7, deferred); GATE497-L3 -> confirmedBy A-R496-CR-LINK-DISABLED-VISUAL-ONLY; GATE497-L4 -> PD-R498-404-SECONDARY-ALIGN; GATE497-L2 -> SABA-Q-498-HERO-CTA-SIZE (questions-round-498.md Q1, default as built, L44); GATE497-L5-BC1B-RENDER-COST deferred; INFO-B497-C15-UNMEASURED-ASSERT (L58 recurrence, RETRO 510 counter).'),
 ('D-29z1784','DPG-BUTTON-CLEANUP-2 inventory redone at 5d12c75 (scan-brand.py token-level, mutant-proven; 121 hits / 52 solid; b-round-497/stage2-inventory.md). Split 2a (round 498: four status-page CTA groups, one mapping rule), 2b route/section CTAs, 2c PurchaseHeader, 2d chat, 2e LeadMagnet keep-list restyle; DPG-BUTTON-CLEANUP-2-NONBRAND (30 non-brand hand-rolled, record count) so item 7 is not narrowed; protected -> ROOT-REQ-DPG-BUTTONS-PROTECTED; selected-state paints and fills are not buttons (SIG-R498-SELECTED-STATE-PAINTS); Studio arrangement out of the Store block. account.tsx untouched in 2a, so the D-29z1771 hold wins and the two L8 rows stay deferred. Order after 498: 2b (REGRESSION first if planned on/after 2026-11-16), 2c, 2d, 2e, NONBRAND, PD-R498-404-SECONDARY-ALIGN, then DPG P1 remainder, DP gate, P2; RETRO 510.'),
 ('D-29z1785','Stage 2a consults: product-designer primary -> primary/lg/pill, partners -> ghost/lg/pill (b-round-497/consult-product-designer.md). tech-lead v1 APPROVE-WITH-CHANGES (ST5 token equality, ST5 title, B2-2 fake timers) -> v3 APPROVE (sketch-review.md, sha 90786f20). B2-2 800 ms pin kept (A-R498-TL-B2-2-TIMER-PIN, N10 intended). Pre-check: biome/tsc rc 0; covering 9 files 120/120; full 296/4322 rc 0; build CSS bundle equal to gate 497; mutants N1-N10 RED; browser HEAD vs sketch at 1440/1280/375. Architecture note: SIG-R498-BUTTONLINK-WRAPPER (keep inline; no checkpoint request: small isolated change, one owner).'),
]
for i,t in D:
    assert not find(b['decisions_log_b'],i)
    b['decisions_log_b'].append({'id':i,'date':'2026-11-13','by':BY,'decision':t})
b['version']=491; b['updated']='2026-11-13'
json.dump(b, open(P,'w',encoding='utf-8'), ensure_ascii=False, indent=2)
open('/home/runner/czaba-project/tmp/studio-real-loop/b-round-497/update-backlog.done','w').write('v491\n')
print('ok')
