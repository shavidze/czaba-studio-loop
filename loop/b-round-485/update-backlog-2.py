import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'
mark=os.path.join(L,'b-round-485/update-backlog-2.done')
if os.path.exists(mark): sys.exit('already applied')
p=os.path.join(L,'backlog.json'); b=json.load(open(p,encoding='utf-8'))
by='2026-11-13 B round 485 -> 486 planning'
sha=open(os.path.join(L,'b-round-485/sketch-486.sha256')).read().split()[0]
D=b['decisions_log_b']
D.append({"id":"D-29z1729","date":"2026-11-13","by":by,"decision":"Round 486 = B-R480-ORDER-CARD-KEYBOARD (oldest open loop-fixable Medium; 2026-10-23 bug gate) on baseline 0341229. Reproduced in Chromium at HEAD by B (b-round-485/probe/head.json: signed-in stub, 2 orders, both viewports, 0 card Tab stops). Sketch b-round-485/sketch-486.patch.txt sha256 "+sha+": WAI-ARIA APG Accordion (h3 > button type=button, aria-expanded, aria-controls=useId, panel always rendered with hidden, no role=region for up to 50 orders), inner elements -> spans with the same classes, [--focus-offset:-2px] (shared :focus-visible ring moved inside the overflow-hidden card), no radius -> 0 px diff vs HEAD collapsed and mouse-expanded at both viewports (probe/pxdiff.txt); Tab stops 12/13, Enter expands, Space collapses, focus kept (probe/sketch.json); AX name 'Order #1001 Paid Nov 1, 2026 $49.00 1 item' (probe/ax-sketch.json). Tests OC1-OC4 (new app/lib/__tests__/account-orders-card.test.tsx); 9 mutants red incl. the HEAD file (mutants/mutants-summary.txt); covering 5 files/68 tests; full suite on sketch 292 files/4263 tests rc 0; tsc rc 0; Biome on the route 2 -> 1 warning. tech-lead review APPROVE (sketch-review.md). Grants: the 2 sketch files + doc 314."})
D.append({"id":"D-29z1730","date":"2026-11-13","by":by,"decision":"Rulings for round 486: pressed header now gets the global unlayered button:active scale(0.98) (accepted, as ProductAccordion; app/styles forbidden); h3 accessible name includes status/date/price/count (APG, accepted); held Enter toggles per repeat, held Space once (native, record); hidden panel content stays in DOM (no focusables); OC-PIXEL 0 px wins over class-level readings. New Low B-R486-FOCUS-OFFSET-GUARD (tech-lead L1: the --focus-offset hook has no guard in store-focus-ring) -> deferred_low_polish. Architecture signal SIG-R486-DISCLOSURE-PRIMITIVE (extract a shared Disclosure/AccordionItem if a third copy appears; not scheduled). OWN-BACKEND row BLOCKED (backend unavailable in cloud); stubbed rows prove the client path only (L36)."})
D.append({"id":"D-29z1731","date":"2026-11-13","by":by,"decision":"Outcome after round 486 fixed in advance (current-task.md section 6): C PASS with browserVerified true -> B-R480-ORDER-CARD-KEYBOARD done for the client path (OWN-BACKEND stays open evidence, does not block); round 487 = DPG-BUTTON-CLEANUP unless planning is on or after 2026-11-16 (then REGRESSION). FAIL -> fix-up first. PARTIAL -> same round resumes. No architecture checkpoint requested: one route component, no accumulated owner risk."})
def fid(lst,i): return next((f for f in lst if f.get('id')==i),None)
f=fid(b['open_findings'],'B-R480-ORDER-CARD-KEYBOARD')
if f:
    f['evidence_kind']='reproduced in Chromium at HEAD 0341229 by B (b-round-485/probe/head.json, 0 card Tab stops at 1440x900 and 1280x720, signed-in stub); source + Biome as before'
dl=b['deferred_low_polish']
if not fid(dl,'B-R486-FOCUS-OFFSET-GUARD'):
    dl.append({"id":"B-R486-FOCUS-OFFSET-GUARD","severity":"low","origin":"B spec","status":"deferred_low_polish (D-29z1730)","title":"The --focus-offset hook of the shared :focus-visible rule (app.css) is used by a Store component for the first time ([--focus-offset:-2px] on the order card toggle); store-focus-ring has no allow-list for it, so any offset value could be copied","evidence":"b-round-485/sketch-review.md L1 (tech-lead)","fix":"document --focus-offset as the approved offset hook (DESIGN_TOKENS/FORWARDREF via root) and add an allow-list row to store-focus-ring.test.ts","added":by})
b['architecture_signals'].append({"id":"SIG-R486-DISCLOSURE-PRIMITIVE","added":by,"note":"tech-lead (round-486 sketch review): ProductAccordion and the account OrderCard now both implement the APG accordion (heading > button, aria-expanded/controls). Extract a shared Disclosure/AccordionItem primitive only if a third copy appears. Not scheduled."})
b['rounds'].append({"round":486,"task":"current-task.md","decision":"D-29z1729","type":"B-R480-ORDER-CARD-KEYBOARD (Medium fix)","status":"dispatched","note":"baseline HEAD 0341229 clean; claims b-round-485/claims-486.sh; frozen manifest b-round-485/r486-tree-sha256.txt (1397); sketch b-round-485/sketch-486.patch.txt; probes b-round-485/probe"})
b['current_task']='Round 486: B-R480-ORDER-CARD-KEYBOARD - My Orders card header becomes h3 > button (aria-expanded, aria-controls, hidden panel; APG Accordion), inset shared focus ring, 0 px visual change; tests OC1-OC4; doc 314; baseline 0341229 (current-task.md)'
for q in b.get('post_current_stage_queue',[]):
    pass
b['version']=b['version']+1; b['updated']='2026-11-13'
json.dump(b,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
open(mark,'w').write('ok\n'); print('v',b['version'])
