import json,sys,os
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
DONE='/home/runner/czaba-project/tmp/studio-real-loop/b-round-477/update-backlog-478.done'
if os.path.exists(DONE): sys.exit('already applied')
b=json.load(open(P))
by='2026-11-12 B round 477 -> 478 planning'
b['updated']=by
b['current_task']="Round 478: DPG-P0-3b (DPG-DOCS-UPDATE) - docs/design reference docs + Store direction-decision.md state live app.css @theme values; dated audits get a banner; residual 27 lines b-round-477/residual-478.tsv; docs only, no app/** change (current-task.md)"
b['decisions_log_b'] += [
 {"id":"D-29z1691","date":"2026-11-12","by":by,"decision":"Round 477 result: C PASS, browserVerified/realVerified true (c-round-477.json), gate 477 published 10791ac. DPG-P0-3a (DPG-SPOTLIGHT-FIX + DPG-LOGO header colour) C-verified, awaiting DP gate (DPG rule 4; not done). Closed on C evidence: GATE460-2 (C3 mutant M7 red on P4), A-R460-REVIEW-5 (C1 sketch sha256 incl. comment fix), portal guard C-R190-INFO I1 / A-R190-SIGNALS Medium #1 (C3 mutant M8 red on P1). SABA-B-16 stays open (asset unnamed). C notes (product hero white edge-light in image asset; brass Sign In button on product page) recorded as DP-gate inputs, not bugs."},
 {"id":"D-29z1692","date":"2026-11-12","by":by,"decision":"Round 478 = DPG-P0-3b (DPG-DOCS-UPDATE). Hue-range scan (b-round-477/tools/hue-scan.py) over docs/design + store docs/technical/store-redesign/direction-decision.md: 82 hit lines, ruled into 4 classes: (1) stale tokens/guidance -> rewrite (DESIGN_SYSTEM, style-guide, components/button, audit-design checklist, design-tokens.json, box-render l.110, awwwards snippets); (2) competitor facts keep (design-systems-reference SOUNDRAW); (3) dated audits/measurements keep body + exact banner (wcag-audit, design-audit, star-brand-audit, design-systems-reference) and wcag-audit gains a live-palette ratio section (b-round-477/wcag-section-478.md); (4) not old identity keep (box Gold l.54-55, DESIGN_SYSTEM history row 2.1). Residual 27 lines b-round-477/residual-478.tsv (content-compared). direction-decision.md --color-obsidian-*/--color-brass-* claim (5 hits) rewritten to real tokens. Docs 307-309 l.4 -> Completed (C round 478 PASS) (L28 final stage) + new doc 310."},
 {"id":"D-29z1693","date":"2026-11-12","by":by,"decision":"Out of round 478 by name: fonts -> DPG-FONT-RESOLVE (STORE-2c-2..4); --color-info/error reds -> DPG-COLOR-CONSOLIDATE (P1); .claude/** -> ROOT-REQ-DPG-PRIMITIVES-PATCH (root); 114 hue hit lines in docs outside docs/design (legacy Studio component docs describing frozen code, mermaid fills, other-industry prompt kits; b-round-477/scan/hue-docs-other.txt) -> signal SIG-R477-DOCS-OUTSIDE-DESIGN for the RETRO 480 staleness check; history records in docs/implementation, docs/bugs, docs/plans stay."},
 {"id":"D-29z1694","date":"2026-11-12","by":by,"decision":"Stated deviation from L56/L58 for round 478: no byte-equal sketch (A authors the Georgian prose). After-values are checker exits that read app.css at run time (residual-check.py, doc-token-check.py), each proven red on HEAD (K2 unexpected=55, K3 FAILS 134), green on a synthetic compliant tree (scan/syn-*.txt) and red on a one-value mutant (scan/syn-doc-token-mutant.txt FAILS 2). WCAG ratios are saved output of tools/wcag-ratios.py. RETRO 480 input: RC-R478-DOCS-NO-SKETCH (is the checker-proof form an acceptable L58 variant for prose rounds?)."}]
def setstatus(sec, i, st):
    for e in b[sec]:
        if e.get('id')==i: e['status']=st+' | '+e.get('status',''); return True
    return False
setstatus('deferred_low_polish','GATE460-2','closed (D-29z1691): C round 477 PASS (C3 mutant M7 red on P4, c-round-477/mutants), published 10791ac')
setstatus('deferred_low_polish','A-R460-REVIEW-5','closed (D-29z1691): C round 477 PASS (C1 sketch sha256 incl. entranceTimeline comment fix), published 10791ac')
setstatus('open_findings','C-R190-INFO','I1 portal guard closed (D-29z1691): row P1, C round 477 C3 mutant M8 red; I2/I3 unchanged')
setstatus('open_findings','A-R190-SIGNALS','Medium #1 portal unit test closed (D-29z1691): row P1, C round 477 C3 mutant M8 red; other signals unchanged')
setstatus('open_findings','SABA-B-16-LOGO-OLD-COLORS','open (D-29z1691): header logo + entrance wordmark brass C-verified round 477 (C7, published 10791ac); asset still unnamed (questions-round-467 Q3)')
b['architecture_signals'].append({"id":"SIG-R477-DOCS-OUTSIDE-DESIGN","status":"signal (D-29z1693): RETRO 480 staleness check input; not tasked","note":"114 hue (teal/cyan/orange) hit lines in docs outside docs/design at 10791ac: docs/technical/components/* (legacy Studio, frozen), diagrams (mermaid fills), docs/learning, docs/prompts (incl. other-industry kits); candidates that may steer agents: docs/technical/overview.md, docs/technical/components/ui-components.md, docs/prompts/modules/design-system.prompt.md","evidence":"b-round-477/scan/hue-docs-other.txt","added":by})
b['architecture_signals'].append({"id":"SIG-R477-DP-GATE-INPUTS","status":"DP-gate input (D-29z1691), not a bug","note":"C round 477: product-page hero image has a white edge-light baked into the asset; product page shows a brass Sign In button next to the brass logo (two-brass count for DP gate with C9 /store Collections)","evidence":"c-round-477.md Notes for B, C9","added":by})
b['retro_candidates'].append({"id":"RC-R478-DOCS-NO-SKETCH","added":by,"note":"Round 478 replaced the L56/L58 sketch with run-time checkers proven red/green/mutant on HEAD + synthetic tree (D-29z1694); RETRO 480 decides whether this is an accepted variant for prose-doc rounds"})
for r in b['rounds']:
    if r.get('round')==477: r['status']='C PASS (c-round-477.json, browserVerified true); gate published 10791ac (D-29z1691)'
b['rounds'].append({"round":478,"task":"current-task.md","decision":"D-29z1692","type":"DPG-P0-3b design reference docs (docs only)","status":"dispatched","note":"baseline HEAD 10791ac clean; claims b-round-477/claims-478.sh; residual b-round-477/residual-478.tsv"})
for e in b['post_current_stage_queue']:
    if isinstance(e,dict) and e.get('id')=='DPG-FIX':
        e['status']='in_progress (D-29z1692): P0-3a C PASS round 477 (published 10791ac, awaiting DP gate); P0-3b docs dispatched round 478 = last P0 stage; after it root re-runs the DP gate; next planning REGRESSION-2026-11-13 then RETRO 480 then P1 | '+e['status']
        e.setdefault('p0_3b_d29z1692',{"scope":"docs/design (11 files) + store docs/technical/store-redesign/direction-decision.md + docs 307-310","residual":"b-round-477/residual-478.tsv","checkers":"b-round-477/tools/","classes":"rewrite / competitor keep / dated banner / not-old-identity keep"})
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
open(DONE,'w').write('ok\n')
print('ok')
