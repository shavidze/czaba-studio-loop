import json, os, sys
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
DONE='/home/runner/czaba-project/tmp/studio-real-loop/b-round-398/update-backlog.done'
if os.path.exists(DONE):
    sys.exit('already applied')
b=json.load(open(P))
assert b['version']==365, b['version']
BY='2026-11-08 B round 398 -> 399 planning'
b['version']=366
b['updated']=BY
b['current_task']="Round 399: PERF-14b-i: perf harnesses count clips from the model (data-clip-count) and reach targets that may be unmounted; interactions + resources migrated by Rule R (R-a..R-d), scale harness patch (M2 lane-area in-window, visible-gap self-check, build self-check), perf/lib/page.ts add-only helpers; every deterministic row equal at HEAD; specs complete on the virtualization sketch; docs 254 (stage 1 of 4) + 255 (current-task.md)"
# rounds
for r in b['rounds']:
    if r.get('round')==398:
        r['status']='done'
        r['result']="C PASS (c-round-398.json browserVerified/realVerified true, 0 bugs, L57 OK b-round-398/l57-check-c398.txt); gate 398 published c3ee1d6 on both remotes (D-29z1362)"
b['rounds'].append({"round":399,"task":"current-task.md","decision":"D-29z1362..D-29z1366","type":"PERF-14b-i: harness readiness for clip virtualization (perf/** + docs only, no app change)","status":"dispatched","note":"baseline c3ee1d6 clean; grants b-round-398/grants-399.txt (8 tracked + doc 255 new); frozen b-round-398/r399-frozen-sha256.txt (1285); harness patch b-round-398/sketch-399-harness.patch.txt sha 204e282a; lane sketch (14b-ii) b-round-398/sketch-14bii-lane.patch.txt sha 3d1fc4d8; claims b-round-398/claims-399.sh","added":BY})
# queue PERF-14 stages
def find_stage(o, sid):
    if isinstance(o,dict):
        if o.get('id')==sid: return o
        for v in o.values():
            r=find_stage(v,sid)
            if r is not None: return r
    elif isinstance(o,list):
        for v in o:
            r=find_stage(v,sid)
            if r is not None: return r
    return None
q=b['post_current_stage_queue']
p14=find_stage(q,'PERF-14'); p14a=find_stage(q,'PERF-14a'); p14b=find_stage(q,'PERF-14b')
assert p14 and p14a and p14b
p14a['status']="done (D-29z1362): C round 398 PASS, gate 398 published c3ee1d6"
p14b['status']="split (D-29z1364): 14b-i harness readiness (round 399) -> RETRO 400 -> 14b-ii virtualization"
p14b['stages_d29z1364']=[
 {"id":"PERF-14b-i","what":"perf harnesses count clips from the model and reach possibly-unmounted targets (Rule R: R-a model fact, R-b bring target into lane area outside measured windows, R-c distinct starts per mounted clip, R-d unchanged); scale harness patch (M2 lane-area in-window, visible-gap self-check, build self-check; all rows record); perf/lib/page.ts add-only modelClipCount/expectModelClipCount; deterministic rows equal at HEAD; interactions/resources/scale complete on the lane sketch (rc may be 1, failing asserts listed); docs 254 l.4 stage 1 of 4 + 255 stage 2 of 4","status":"dispatched round 399 (D-29z1365)"},
 {"id":"PERF-14b-ii","what":"clip virtualization in ArrangementLane from b-round-398/sketch-14bii-lane.patch.txt (lane useSyncExternalStore page window [page-1,page+2]; pins: clips under an active pointer press (capture handler + window pointerup/pointercancel) and lane-move sources; selected NOT pinned; VZ1-VZ7; WG2-WG5 pinOutsideClips, 0 assertions removed) + scale assert flips (b-round-398/sketch-14bii-budget-flips.patch.txt: page <=2000 x3, model ==200, zoom components-per-key <=60 1x/6x) + scroll components ceiling row (TL-R398-SK-L3) + re-rule of round-399 A5 failing-assert list. Before dispatch: fix TL-R398-SK-M1 (window blur unpin) and TL-R398-SK-L1 (unmount cleanup), re-run VZ + 7 mutants + full suite + delta review + perf on sketch","status":"not_started (after RETRO 400)","sketch_evidence":"b-round-398/perf-sketch-scale-run2.log (950/1532/1868, comps/key 42.4, scroll comps/step 116.5), perf-sketch-scale-mutant-no-filter.log, perf-sketch-scale-mutant-shifted-window.log, probe/sketch-frames-*.json (0 gap frames of ~455, select-all mounted 55/46, held pin 1), mutants/summary.txt 7/7 red, precheck-full-v1.log (only WG2-WG5 before the pin step), sketch-review.md"}
]
p14['status']="in_progress (D-29z1364): 4 stages 14a done (round 398) / 14b-i harness readiness (round 399) / 14b-ii virtualization (after RETRO 400) / 14c peak pyramid + canvas tiles. " + p14['status']
q14=find_stage(b,'Q-14B-PIN-SELECTED')
ruling="ruled (D-29z1364): do NOT pin selected clips; pin = clips under an active pointer press + lane-move sources. Evidence on B's sketch: clips have no focusable element (claims K10 = 0), app reaches clip DOM only via the pressed clip's envelope (K11), select-all keeps 55/46 mounted (probe/sketch-frames-*.json), a held group move of 200 selected clips applied through unmounted clips (same probe, status 'Move (200)')"
if q14 is not None:
    q14['status']=ruling
else:
    b['open_findings'].append({"id":"Q-14B-PIN-SELECTED","severity":"info","origin":"B round 397 consults","title":"PERF-14b pin set: selected clips or not","status":ruling,"added":BY})
# findings
b['open_findings'].append({"id":"TL-R398-SK-M1","severity":"medium","origin":"B sketch (tech-lead review)","evidence":"b-round-398/sketch-review.md","title":"PERF-14b-ii lane sketch: gesture pin cleared only on pointerup/pointercancel; touch/pen pointerId churn + window blur leaves a permanent pin and 2 listeners","status":"sketch_input (D-29z1364): not in app code; fix in sketch-14bii-lane before 14b-ii dispatch (add window blur unpin, remove all 3 listeners) with a row + mutant","added":BY})
b['open_findings'].append({"id":"TL-R398-SK-M2","severity":"medium","origin":"B sketch (tech-lead review)","evidence":"b-round-398/sketch-review.md; b-round-398/perf-sketch-studio-lab-interactions.log; perf-sketch-studio-lab-resources.log","title":"interactions and resources perf specs count mounted clips; abort under virtualization","status":"dispatched as round 399 PERF-14b-i (D-29z1365)","added":BY})
b['open_findings'].append({"id":"C-R398-SIGNAL-M2-M3","severity":"low","origin":"B spec","evidence":"c-round-398.json lows; a-round-398.md M2/M3","title":"scale in-window counted clips under the sticky header; zoom p95 == max with 10 keys","status":"ruled (D-29z1363): M2 lane area = scroller box minus measured track-header width (harness patch, round 399); M3 keep 10 keys, p95 rows stay record, PERF-14 target read on keydown-max-ms","added":BY})
b['deferred_low_polish'].append({"id":"TL-R398-SK-L1-L3","severity":"low","origin":"B sketch (tech-lead review)","evidence":"b-round-398/sketch-review.md","title":"L1 lane unmount mid-press keeps unpin listeners; L2 gap self-check assumes the Ctrl+D build; L3 scroll components per page step 57.75 -> 116.5","status":"scheduled inside PERF-14b-i (L2 sequence text) and PERF-14b-ii (L1 cleanup, L3 ceiling row) (D-29z1364)","added":BY})
b['deferred_low_polish'].append({"id":"C-R398-NOTE-FIRST-RUN-1440","severity":"low","origin":"environment","evidence":"c-round-398.json lows","title":"first count-browser.cjs run at 1440x900 exited with a Node error; reruns passed; dev-server cold start suspected","status":"deferred_low_polish (D-29z1363): environment, watch only","added":BY})
b['deferred_low_polish'].append({"id":"GATE398-L1-L5","severity":"low","origin":"gate 398 reviewer","evidence":"gates/round-398/review.md Suggestions 1-5","title":"scale spec: 30 s per-press timeout on a silent Ctrl+D; zoom symmetry self-check assumes no clamp; expect.poll as control flow; duplicated scroller walk; doc 254 cites tmp/ paths","status":"deferred_low_polish (D-29z1363): optional per reviewer; item 4 = architecture signal A-R398-ARCH-FIND-TIMELINE-SCROLLER","added":BY})
b['architecture_signals'].append({"id":"A-R398-ARCH-FIND-TIMELINE-SCROLLER","origin":"A round 398 code-reviewer + gate 398 reviewer","evidence":"a-round-398.md Architecture note; gates/round-398/review.md Architecture note","signal":"timeline-scroller walk duplicated in studio-lab-scale.perf.spec.ts (readScaleDom, setTimelineScroll); candidate perf/lib helper findTimelineScroller once a third caller appears (PERF-14b-i may add one: R-b scrolls)","status":"signal (D-29z1363), not scheduled","added":BY})
b['architecture_signals'].append({"id":"PERF-CAND-14-SCROLL-HYSTERESIS","origin":"B sketch (tech-lead review)","evidence":"b-round-398/sketch-review.md L3","signal":"lane page window re-renders on every page crossing; hysteresis (re-check only when the view leaves the inner page band) is a later candidate if scroll cost matters","status":"candidate (D-29z1364), not scheduled","added":BY})
D=[
 ("D-29z1362","PERF-14a done: C round 398 PASS (browserVerified/realVerified true, 0 bugs, L57 OK b-round-398/l57-check-c398.txt); gate 398 published c3ee1d6 on both remotes; baseline for round 399 = c3ee1d6 (context/head-sha.txt c93d926 is pre-commit)."),
 ("D-29z1363","C round 398 signals ruled: M2 in-window = lane area (scroller box minus measured track-header width); M3 keep 10 keys, wallclock zoom rows stay record, PERF-14 'zoom p95 < 50 ms' read on keydown-max-ms. C-R398-NOTE-FIRST-RUN-1440 and gate 398 Lows 1-5 to deferred_low_polish; scroller-walk duplication = architecture signal A-R398-ARCH-FIND-TIMELINE-SCROLLER."),
 ("D-29z1364","PERF-14b sketched and measured in full (b-round-398: lane window filter + press/lane-move pins; prod build 200 clips page 950/1532/1868 vs HEAD 4333/4303/4333; zoom comps/key 42.4 vs 638; 0 gap frames; 7/7 jsdom mutants red; tech-lead review no Crit/High). Under it the interactions and resources perf specs abort (count mounted clips), so 14b is split without dropping scope: 14b-i harness readiness (round 399) -> RETRO 400 -> 14b-ii virtualization. Q-14B-PIN-SELECTED ruled: selected clips not pinned; pins = active press + lane-move sources. PERF-14 now 4 stages."),
 ("D-29z1365","Round 399 = PERF-14b-i: Rule R (R-a model fact via lane data-clip-count, R-b bring a positional target into the lane area outside measured windows, R-c distinct starts per mounted clip, R-d unchanged) over the 66-hit perf grep; perf/lib/page.ts add-only helpers; scale harness patch; budgets notes only; every deterministic row equal to HEAD baselines (interactions 189 b-round-398/perf-head-interactions.json, resources 46 c-round-398, scale 17 b-round-398/perf-head-harness-scale.json); specs complete on the lane sketch (rc may be 1, failing asserts listed as 14b-ii input)."),
 ("D-29z1366","PERF-14 docs: doc 254 l.4 -> 'In Progress (stage 1 of 4; C round 398 PASS)'; new doc 255 'In Progress (stage 2 of 4; C round 399 PASS)' holds the migrated harness contract; earlier harness docs 231/232/233/234/240/247/248/252 are not edited (historical; doc 255 names them superseded for clip waits only)."),
]
for i,t in D:
    b['decisions_log_b'].append({"id":i,"date":"2026-11-08","by":BY,"decision":t})
json.dump(b,open(P,'w'),indent=1,ensure_ascii=False)
open(DONE,'w').write('ok\n')
print('applied v366')
