import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; B=f'{L}/b-round-500'
if os.path.exists(f'{B}/update-backlog-2.done'): sys.exit('already applied')
p=f'{L}/backlog.json'; b=json.load(open(p))
assert b['version']==494, b['version']
WHO='2026-11-14 B round 500 -> 501 planning'
b['version']=495; b['updated']='2026-11-14'
b['current_task']=("Round 501: DPG-BUTTON-CLEANUP-2 stage 2b-2: A applies b-round-500/sketch-501.patch.txt (sha 13624731, tech-lead v3 APPROVE): "
 "free-downloads Download -> Button primary lg pill type=button aria-expanded; NewsletterSection Subscribe -> Button primary lg h-14 submit disabled while busy; "
 "hire-us Send Message -> Button primary lg fullWidth submit, Loader2 spinner; ST5 hire-us pin; new store-button-cleanup-2b2.test.tsx B2B2-0..7; DESIGN_SYSTEM shape rows; doc 322. "
 "C runs C0-C14 in the browser (current-task.md)")
b['rounds'].append({'round':501,'task':'current-task.md','decision':'D-29z1799','type':'DPG-BUTTON-CLEANUP-2 stage 2b-2 (free-downloads Download, newsletter Subscribe, hire-us Send Message)','status':'dispatched','note':'baseline 462570e clean; sketch b-round-500/sketch-501.patch.txt sha 13624731; pre-check full 298/4337 rc0, build rc0, mutants M1-M20,M26-M28,M30 RED'})
dec=[
 ('D-29z1799',"Stage 2b-2 scope = inventory row A2 sites free-downloads 284 'Download', NewsletterSection 84 'Subscribe', hire-us 279 'Send Message' + ST5 pin. Mapping by product-designer (b-round-500/consult-product-designer.md): standalone CTA pill (FD primary lg pill type=button + aria-expanded); form submits default shape (NL primary lg className h-14 to equal the 56 px field; HU primary lg fullWidth); disabled={isSubmitting} with unchanged busy copy (no isLoading); HU white hand-drawn spinner -> Loader2 (dark text colour); both spinners motion-reduce:animate-none. 'Send Download Link' (bg-foreground pill) stays in NONBRAND. Scanner 109/44 -> 104/41."),
 ('D-29z1800',"Consults round 501: product-designer mapping; tech-lead adversarial review v1 b489d495 CHANGES-REQUIRED (Medium: B2B2-6 regex blind to the HEAD shape with an arrow onClick before className; Lows: `as unknown`, doc 322 overclaims, icon order/identity + FD form membership unpinned) -> fixed in v2 (brace-aware openingTags + hasSolidBrass, one <Button per file, B2B2-7 scanner self-test, RemixState type, expectIconThenLabel, FD form null, doc deltas; mutants M20, M26-M28, M30 added, all RED); v2 baa0445a CHANGES-REQUIRED on doc 322 D1/D5 shadow-sm wording only -> v3 136247312c APPROVE (dispatched). Spinner pixel size left to C browser rows (reviewer agreed). Info aria-controls -> TL-R501-FD-ARIA-CONTROLS deferred. No architecture checkpoint (small, one owner; SIG-R498-BUTTONLINK-WRAPPER re-evaluated at 2b-3)."),
 ('D-29z1801',"Two product-designer questions to Saba (user-review/questions-round-501.md), awaiting_user, non-blocking: SABA-Q-501-INPUT-RADIUS (newsletter + Hire Us fields to rounded-md; default yes in a later inputs stage) and SABA-Q-501-SEND-LINK-VARIANT ('Send Download Link' -> secondary in NONBRAND; default yes)."),
]
for i,t in dec:
    b['decisions_log_b'].append({'id':i,'date':'2026-11-14','by':WHO,'decision':t})
of=b['open_findings']; dl=b['deferred_low_polish']
f=[x for x in of if x.get('id')=='DPG-BUTTON-CLEANUP-2'][0]
f['status']='in_progress (D-29z1799): 2b-2 dispatched round 501 (sketch-501 sha 13624731); then 2b-3, 2c-2e, NONBRAND | '+f['status']
f.setdefault('substages_d29z1789',{})['2b-2']='round 501 dispatched: FD Download primary lg pill + aria-expanded; NL Subscribe primary lg h-14; HU Send Message primary lg fullWidth + Loader2; ST5 rewritten; scanner 104/41'
for i,t,ev in [('SABA-Q-501-INPUT-RADIUS',"Should the newsletter and Hire Us inputs move to rounded-md to match their default-shape submit buttons? (default yes, later inputs stage)",'user-review/questions-round-501.md Q1'),('SABA-Q-501-SEND-LINK-VARIANT',"Should NONBRAND turn free-downloads 'Send Download Link' (white bg-foreground pill) into Button secondary? (default yes)",'user-review/questions-round-501.md Q2')]:
    assert not any(x.get('id')==i for x in of)
    of.append({'id':i,'severity':'info','origin':'B spec','status':'awaiting_user (D-29z1801); non-blocking','title':t,'evidence':ev,'added':WHO})
assert not any(x.get('id')=='TL-R501-FD-ARIA-CONTROLS' for x in dl)
dl.append({'id':'TL-R501-FD-ARIA-CONTROLS','severity':'low','origin':'B spec','status':'deferred_low_polish (D-29z1800): pre-ruled Low #1 of task 501','title':"free-downloads 'Download' gets aria-expanded but no aria-controls pointing at the revealed email form (optional in the disclosure pattern; useId later)",'evidence':'b-round-500/sketch-review.md review 1 item 5','added':WHO})
open(p,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
open(f'{B}/update-backlog-2.done','w').write('ok')
print('ok', b['version'])
