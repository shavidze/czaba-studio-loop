import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; B=f'{L}/b-round-505'
if os.path.exists(f'{B}/update-backlog-506b.done'): sys.exit('already applied')
p=f'{L}/backlog.json'; b=json.load(open(p))
assert b['version']==507, b['version']
b['version']=508
WHO='2026-11-14 B round 505 -> 506 planning (closing check)'
def find(lst,i):
    r=[x for x in b[lst] if x.get('id')==i]; assert len(r)==1,(lst,i); return r[0]
d=("Closing check (advisor): (1) the red CONTINUE had no Saba/spec decision: b5d623f (2025-12-17) painted all three popup actions bg-[#E63946]; later token work moved FREE DOWNLOAD/BACK TO SITE to brand and mapped CONTINUE to destructive; decisions_log_b, archive/decisions-archived.json, DESIGN_SYSTEM.md and docs/technical/store-redesign/ hold no ruling (doc 158 S6 is a STORE-2a contrast history row) -> brass default stands, Saba asked once. "
   "(2) B-R506-LM-EMAIL-NO-LABEL evidence corrected: the probe's activeOnEmail name is its own aria-label||placeholder fallback; Chromium's AX tree (CDP getPartialAXTree, b-round-505/probe/ax-email-head.out) names the field 'Enter your email address' from the placeholder source, and Playwright getByRole finds 1 -> Low stands (jsdom/dom-accessibility-api shows Name '' because it ignores placeholder). "
   "(3) INFO-C505-C3-OFFSET-UNMEASURED closed on C's own data: c-round-505/after/after.json has offset 2px x6 (Start Chat and Send, 3 viewports); round 506 C3 only views two round-505 focus crops (record-only). "
   "(4) pre-ruled Lows #8-#11 added to the task (whole-class pins, source-text reads, copied mock fixture, B2E-3/B2E-5 jsdom realism = A-R505-CR-1 class) so a predictable reviewer re-raise is not an unruled Medium; b-round-505/doc-ledger.md written (L26).")
assert not any(x['id']=='D-29z1827' for x in b['decisions_log_b'])
b['decisions_log_b'].append({'id':'D-29z1827','date':'2026-11-14','by':WHO,'decision':d})
x=find('deferred_low_polish','B-R506-LM-EMAIL-NO-LABEL'); x['evidence']='b-round-505/probe/ax-email-head.out (Chromium AX name from placeholder; getByRole count 1); b-round-505/consult-product-designer.md Q4 #1 (D-29z1827)'
x=find('open_findings','INFO-C505-C3-OFFSET-UNMEASURED'); x['status']='closed (D-29z1827): c-round-505/after/after.json offset 2px x6; crops viewed as a record row in round 506 C3 | '+x['status']
open(p,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
open(f'{B}/update-backlog-506b.done','w').write('ok'); print('ok',b['version'])
