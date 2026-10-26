import json,sys
p='backlog.json'
b=json.load(open(p,encoding='utf-8'))
TAG='2026-10-26 B round 198 -> 199 planning (D-29z164)'
ids={f.get('id') for f in b['open_findings']}|{f.get('id') for f in b['deferred_low_polish']}
assert 'C-R198-01' not in ids and 'C-R198-02' not in ids, 'already applied'
for f in b['open_findings']:
    if f.get('id')=='C-R196-02':
        f['status']='closed_by_c_r198: C round 198 PASS browserVerified=true realVerified=true (FOCUS-REVEAL-198 tree 0/0 hidden vs ref 6/6; CHROME-FOCUS/POINTER/SIDE/RING-KEY/REST-198 PASS); published 980cfbe (gate 198) ('+TAG+')'
    if f.get('id')=='SABA-B-4':
        f['status']=str(f.get('status'))+' | stage 1 complete incl. R91 focus reveal (C round 198 PASS, published 980cfbe); stage 2 (store pages) next after REGRESSION 199 and RETRO ('+TAG+')'
b['open_findings'].append({"id":"ARCH-R198-FOCUS-REGION","severity":"info","status":"signal_recorded_not_scheduled (code-reviewer Architecture note, round 198: Signal 3 weak - scroller/chrome focus region touched rounds 196-198, R89 reverted; verdict keep: logic in lib/focus-reveal.ts, component only reads/writes refs it owns; Signal 4 absent). Folded into the pending frontend-architect checkpoint request (b-round-197.md section 6).","evidence":"a-round-198.md l.113-116","origin":"A (code-reviewer)","added":TAG})
common={"deferred_reason":"user decision 2026-10-23: open Lows do not block; fixed in the polish pass before release; final acceptance requires each fixed and C-verified","added":TAG,"origin":"C"}
b['deferred_low_polish'].append(dict({"id":"C-R198-01","severity":"low","status":"deferred_low_polish","title":"a range slider partly under the sticky timeline chrome (6 of 16 px hidden) stays cut after mouse click + ArrowUp: no focus event on an already-focused element, so R91 does not reveal it; pre-existing (tree = ref)","evidence":"c-round-198/out/chrome/tree-1280/result.json and ref-1280/result.json step cut-video-volume-ArrowUp","repro":"/studio-lab 1280x720 rich scene -> scroller scrollTop 32 (Volume - Original video sound top 307 < chrome bottom 313) -> mouse-click the visible part of the slider -> ArrowUp","b_ruling":"Low, not Medium: the round-198 pre-written Medium clause targets keyboard focus landing (Tab stops); the control is not entirely hidden (WCAG 2.4.11 minimum met); same in ref HEAD 2505252, so not an R91 regression"},**common))
b['deferred_low_polish'].append(dict({"id":"C-R198-02","severity":"low","status":"deferred_low_polish","title":"Mute / Solo - Original video sound: focus ring bottom side clipped at 1280 (0 changed px rich after reveal, 18 px default, vs 80 px on other sides)","evidence":"c-round-198/out/focus/tree-1280-rich/f72.png, f73.png; out/focus/{tree,ref}-1280-default/result.json i40/i41","repro":"/studio-lab 1280x720 default or rich scene -> Tab to Mute / Solo - Original video sound","b_ruling":"pre-existing in the default scene (tree = ref = round 197); rich-scene pre-existence is C's inference, kept labelled as inference; a SABA-B-4 polish input"},**common))
for r in b['rounds']:
    if r.get('round')==198:
        r['status']='c_pass_published'
        r['result']='C round 198 PASS browserVerified=true realVerified=true, 12 rows, 0 blocked; gate 198 published 980cfbe; C-R196-02 closed; new Lows C-R198-01/02 deferred'
        r['b_rulings_d29z164']=['scopeDeviationsForB accepted as part of R91: the extra guard event.target === scroller || !scroller.contains(event.target) (reviewer H1, portaled marker menu) and the structural handler parameter type { target: Element }','pointerRowRuling: C reading accepted; range-slider ArrowUp variant -> C-R198-01 Low']
b['rounds'].append({"round":199,"task":"current-task.md","decision":"D-29z164","status":"dispatched","type":"REGRESSION","items":["REGRESSION sweep: SRW-01..24 + T12 V1 (RG-*), post-122 items (RV-EN, RV-TOKENS, RV-ICONS, RV-M, RV-SABA-1-2, RV-SABA-3-4, RV-REVEAL, RV-MARKER-ENTER), store (RS-1A..RS-2A, mock :5199), parked RP-METRO-MUTE/RP-SPACE-EMPTY/RP-VIDEO-MARKER, e2e smoke, G199-3","A: doc status lines only (156 l.4, 158 l.4, 159 l.4 + l.69)"],"note":"baseline HEAD 980cfbe, clean; frozen 1029 (b-round-198-r199-tree-sha256.txt); grants 3 docs (b-round-198-r199-grants.txt); start copies b-round-198/r199-granted-start/; planned 2026-10-26T23:40Z (regression-last 2026-10-24, 2 days; run per round-198 section 7 pre-committed outcome, no open Medium+, shared-infra change; C runs 2026-10-27)","added":TAG})
for path,scope in [("docs/implementation/2026/quarter-IV/156-store-1d-entrance-loader.md","line 4 status only"),("docs/implementation/2026/quarter-IV/158-store-2a-colour-tokens.md","line 4 status only"),("docs/implementation/2026/quarter-IV/159-saba-b-4-studio-focus-ring.md","lines 4 and 69 status only (stage 1 completed; item not completed)")]:
    b['narrow_grants'].append({"round":199,"decision":"D-29z164","path":path,"scope":scope,"justification":"REGRESSION round doc status sync (round-122 pattern); start copy b-round-198/r199-granted-start/"})
for e in b['post_current_stage_queue']:
    if e.get('id')=='STORE-REDESIGN':
        e['status']=e['status'].replace('round 198 C-R196-02; round 199 regression; round 200 RETRO;','round 198 C-R196-02 done (C PASS, published 980cfbe); round 199 REGRESSION (D-29z164); round 200 RETRO (or fix-up first if 199 finds Medium+);').replace('; regression round due at the first planning on/after 2026-10-27','')
        assert 'D-29z164' in e['status']
b['current_task']='round 199 REGRESSION sweep (phase 1 + T12 V1 + post-122 items + store), A doc status lines only (D-29z164)'
b['updated']=TAG
json.dump(b,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('ok',len(b['deferred_low_polish']))
