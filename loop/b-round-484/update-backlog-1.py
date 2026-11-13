import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'
mark=os.path.join(L,'b-round-484/update-backlog-1.done')
if os.path.exists(mark): sys.exit('already applied')
p=os.path.join(L,'backlog.json'); b=json.load(open(p,encoding='utf-8'))
by='2026-11-13 B round 484 -> 485 planning'
b['decisions_log_b'].append({"id":"D-29z1723","date":"2026-11-13","by":by,"decision":"Round 484 result (C evidence only): REGRESSION-2026-11-13 part 2 remainder C taskStatus PASS, 8 passed lines, 0 failed, 0 inconclusive, 0 notRun, 0 bugs, browserVerified=true, realVerified=true (c-round-484.json); L57 OK (B re-run). Gate 484 skipped (no real changes), head 751e30e, so the baseline stays 751e30e (gate 481 published). Per D-29z1722: every remainder row has an allowed result and no Medium+ finding -> REGRESSION-2026-11-13 done (parts: 482 PASS bV true, 483 PASS bV false, 484 PASS bV true remainder); regression-last.json = {date 2026-11-13, round 484}; next due on or after 2026-11-16. C-R425-02 stays Low: the R-FOLLOW-OFFSET attribution shows a run-to-run scroll offset of at most 4 px vs round 389, not a layout width delta; its cause (follow-scroll quantisation) is a HYPOTHESIS, not tested. C-R425-01 unchanged (Low)."})
for r in b['regression_rounds']:
    if r.get('id')=='REGRESSION-2026-11-13':
        r['status']='done (D-29z1723): part 1 C round 482 PASS (browserVerified true), part 2 C round 483 PASS (browserVerified false), remainder C round 484 PASS (browserVerified true, 0 bugs); regression-last.json = 2026-11-13 / 484; next due on or after 2026-11-16 | '+r['status']
for f in b['open_findings']+b.get('deferred_low_polish',[]):
    if f.get('id')=='C-R425-02':
        f['attribution_d29z1723']='C round 484 R-FOLLOW-OFFSET-ATTR: offset vs round 389 within +-4 px, varies run to run (1440: 0/+2/+4; 1280: -2/+3/+3); clientWidth/laneHeaderWidth/scrollerLeft/scrollWidth identical in all 6 runs; playhead content position equal; cause hypothesis only (follow-scroll quantisation). Stays Low.'
rs=b.get('rounds')
if isinstance(rs,list):
    for r in rs:
        if isinstance(r,dict) and r.get('round') in (484,'484'):
            r['status']='C PASS (browserVerified true, 0 bugs); gate 484 skipped (no real changes) (D-29z1723)'
b['version']=b['version']+1; b['updated']='2026-11-13'
json.dump(b,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
json.dump({"date":"2026-11-13","round":484,"note":"REGRESSION-2026-11-13 ran in rounds 482-484 on 751e30e: part 1 C round 482 PASS (browserVerified true); part 2 C round 483 PASS (browserVerified false); remainder C round 484 PASS (0 bugs, browserVerified/realVerified true). Updated by B at round 485 planning (D-29z1723). Next regression due on or after 2026-11-16"},open(os.path.join(L,'regression-last.json'),'w'),indent=1)
open(mark,'w').write('ok\n'); print('v',b['version'])
