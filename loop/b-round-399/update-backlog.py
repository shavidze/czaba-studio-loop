import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'
done=L+'/b-round-399/update-backlog.done'
if os.path.exists(done):
    sys.exit('already applied')
p=L+'/backlog.json'
b=json.load(open(p))
assert b['version']==366, b['version']
BY='2026-11-08 B round 399 -> 400 planning'
D='2026-11-08'
b['version']=367
b['updated']=BY
b['current_task']=("Round 400: PERF-14b-i completion: R-b' ruling for the Ctrl+D group copy (C-R399-01): copy reads live when mounted (HEAD path), "
 "else reveal next to the original outside measured windows with exact scroll restore and Follow restore; copyBefore falls back to the setup at-rest read (no scroll before t0); "
 "ownCopy null when unmounted (check (f) skipped, detail OwnCopyObserved); new check (g) Follow on at t0 while playing; B sketch b-round-399/sketch-400-group-copy.patch.txt applied byte-identical; "
 "doc 255 updated; full C row set (INTERACT/RES/SCALE HEAD+VIRT, PERF-LIB, BUDGET-SHAPE, NO-APP-CHANGE, AUTH, SOURCE-SCOPE, DOCS) (current-task.md)")
for r in b['rounds']:
    if r.get('round')==399:
        r['status']='c_fail_stop'
        r['result']=("C round 399 FAIL 'STOPPED - routed to B' (L22 short round): C-R399-01 Medium (origin B spec: R-b vs 'values equal HEAD' for the Ctrl+D copy); "
                     "SOURCE-SCOPE/NO-APP-CHANGE/AUTH PASS; INTERACT-HEAD/RES/SCALE/PERF-LIB/BUDGET-SHAPE/DOCS not run; browserVerified false; gate 399 skipped; A's diff kept in tree (b-round-399/a399-diff.patch.txt sha 5f3c1351) (D-29z1367)")
b['rounds'].append({"round":400,"task":"current-task.md","decision":"D-29z1367..D-29z1370",
  "type":"PERF-14b-i completion: R-b' group-copy ruling (perf/** + docs only, no app change)","status":"dispatched",
  "note":"baseline c3ee1d6 + A round-399 diff (unpublished, gate 399 skipped); grants b-round-399/grants-400.txt (interactions spec + doc 255); frozen b-round-399/r400-frozen-sha256.txt (1292); sketch b-round-399/sketch-400-group-copy.patch.txt sha 8d2e6579 -> spec sha f5869aec; claims b-round-399/claims-400.sh",
  "added":BY})
of=b['open_findings']
of.append({"id":"C-R399-01","severity":"medium","origin":"B spec (round-399 R-b conflicts with 'deterministic values equal HEAD'); A STOP confirmed by C",
  "evidence":"c-round-399.json; c-round-399/virt-interactions.json; a-round-399.md STOP; a-round-399/probe/follow-probe.txt",
  "title":"interactions group setup finds no Ctrl+D copy under virtualization; 24 group rows null, 13 asserts fail",
  "status":"dispatched as round 400 (D-29z1368): R-b' conditional reveal; B sketch run green on both trees (b-round-399/sketch/compare-head.txt 189/189 equal; interactions-virt problems [] x6, drag-group-live 1)",
  "added":BY})
of.append({"id":"C-R399-LOW-CLAIMS","severity":"low","origin":"B spec","evidence":"c-round-399.json lows; a-round-399.md A6",
  "title":"claims-399 section 7 did not list K20 perf/lib/page.ts 1->2 and K27 20->21",
  "status":"closed by B planning (D-29z1370): claims-400 planning output carries page.ts 2 and K27 21 as baseline facts","added":BY})
of.append({"id":"Q-14B-PIN-GROUP-MEMBERS","severity":"info","origin":"B round 399 sketch",
  "evidence":"b-round-399/sketch/group-virt.txt (OwnCopyObserved false on the lane sketch)",
  "title":"under the 14b-ii lane sketch the non-pressed members of a group move are unmounted mid-gesture when off the page window; harness check (f) is skipped there",
  "status":"14b-ii input (D-29z1368): decide at 14b-ii sketch review whether group-move members are pinned like lane-move sources; not app work now","added":BY})
for f in of:
    if f.get('id')=='TL-R398-SK-M2':
        f['status']="round 399 PERF-14b-i C FAIL (C-R399-01); re-dispatched as round 400 completion (D-29z1368) | "+f['status']
dl=b['deferred_low_polish']
dl.append({"id":"A-R399-REVIEW-LOWS","severity":"low","origin":"A round 399 code-reviewer","evidence":"a-round-399.md Reviewer",
  "title":"interactions R-c check could add mountedClips > count; expect.poll interval slower than toHaveCount; modelClipCount undercounts with a collapsed group and returns 0 with no lane (documented in doc 255)",
  "status":"deferred_low_polish (2026-10-23 bug gate); cheap to fold into 14b-ii if it owns the line","added":BY})
dl.append({"id":"A-R399-REVIEW-PLANNER-PATCH-LOWS","severity":"low","origin":"A round 399 code-reviewer (B scale harness patch)","evidence":"a-round-399.md Reviewer 'Planner-patch Lows'",
  "title":"scale gap check uses the Math.max lane count while the model row uses the sum; box.right includes scrollbar width; NaN data-clip-start weakens the gap check; in-window notes still open with 'intersects the timeline scroller's box'",
  "status":"deferred_low_polish; 14b-ii owns the scale spec and budgets (flips) and should fold these in","added":BY})
b['architecture_signals'].append({"id":"A-R399-RES-CLIPS1-DOM","origin":"A round 399","evidence":"a-round-399.md Signals; resources spec l.707",
  "signal":"res.harness.clips-1 still reads the DOM count after Add (its note was not in the D-29z1365 list); move to the model in 14b-ii if wanted","status":"signal (D-29z1370), not scheduled","added":BY})
b['architecture_signals'].append({"id":"A-R399-PATH-REWRITES-VIRT","origin":"A round 399 A5 + C round 399 + B round 399 sketch","evidence":"a-round-399/a5-interactions-summary.txt; b-round-399/sketch/summary-virt.txt",
  "signal":"interact.zoom.30.out.path-rewrites median 2 vs budget == 3 on the lane sketch; also zoom.30 components-per-key 128->41; re-rule input for 14b-ii","status":"14b-ii input (D-29z1370)","added":BY})
for s in b['architecture_signals']:
    if s.get('id')=='A-R398-ARCH-FIND-TIMELINE-SCROLLER':
        s['status']="signal; third caller now in the round-400 sketch (interactions readBesideClip getByTestId + querySelector of the scroller) (D-29z1370); still not scheduled, perf/lib frozen this round | "+s['status']
b['retro_candidates'].append({"id":"RC-R399-RULE-NOOP-AT-HEAD","decision":"D-29z1369","round":399,
  "note":"round-399 Rule R-b said 'always bring the target into view before the read' next to 'every deterministic value equals HEAD'; for the off-screen Ctrl+D copy (and Follow pausing on scroll while playing) the two could not both hold, and A stopped (C-R399-01, origin B spec). Candidate lesson for RETRO 401: a rule that adds an action before a measured step must be shown to be a no-op at HEAD on B's sketch run (or be conditional on the state that needs it), with the sketch log cited."})
sp=[x for x in b['post_current_stage_queue'] if x['id']=='STUDIO-PERFORMANCE'][0]
sp['status']=("in_progress (D-29z1369): round 399 PERF-14b-i C FAIL (C-R399-01, B spec); round 400 = PERF-14b-i completion (R-b' group-copy ruling); RETRO moves 400 -> 401 (window 385-400); then 14b-ii, 14c, PERF-15; regression due on/after 2026-11-10 | "+sp['status'])
st=[s for s in sp['stages'] if s.get('id')=='PERF-14'][0]
st['status']=("in_progress (D-29z1369): 14a done (398); 14b-i round 399 C FAIL (C-R399-01) -> round 400 completion; RETRO 401; 14b-ii virtualization; 14c | "+st['status'])
b['decisions_log_b'] += [
 {"id":"D-29z1367","date":D,"by":BY,"decision":"Round 399 result from independent evidence only: C FAIL 'STOPPED - routed to B' (c-round-399.json, browserVerified false, L22 short round). C-R399-01 Medium (origin B spec) open; C-R399-LOW-CLAIMS. PERF-14b-i -> ბაგია (not done). A's round-399 diff stays in the tree, unpublished (gate 399 skipped); its finished files are frozen at current hashes in b-round-399/r400-frozen-sha256.txt; A's own A4/A5 numbers remain unverified by C until round 400."},
 {"id":"D-29z1368","date":D,"by":BY,"decision":"STOP ruling (L10) for the Ctrl+D copy: R-b' replaces R-b for the copy only. Copy id, copy at-rest, copyReleased/copyReset (+ lane ids) are read live when the copy is mounted (HEAD path) and otherwise via a reveal next to the original (original right edge 8 px right of the lane-area left), exact scrollLeft restore and Follow restore, all outside measured windows; copyBefore falls back to the setup at-rest read (no scroll before t0 in either branch); ownCopy inside the gesture is null when unmounted (check (f) skipped, detail OwnCopyObserved) - (c) still proves the copy moved; new check (g) Follow on at t0 while playing. B ran it before dispatch (L58): plain tree 189/189 deterministic equal, problems [] x6, CopyReveals 0; lane sketch problems [] x6, all rows non-null, drag-group-live 1, only path-rewrites fails (b-round-399/sketch/). Sketch applied byte-identical (spec sha f5869aec); budgets frozen."},
 {"id":"D-29z1369","date":D,"by":BY,"decision":"Round 400 = PERF-14b-i completion (C bug first, L10); RETRO moves 400 -> 401 (window 385-400). Reason: the tree carries A's unverified round-399 diff, so a RETRO round has no clean publish boundary. One-round slip of the every-15-rounds rule; recorded. Lesson input RC-R399-RULE-NOOP-AT-HEAD for RETRO 401."},
 {"id":"D-29z1370","date":D,"by":BY,"decision":"Claims for round 400 carry K20 perf/lib/page.ts 2 and K27 21 as baseline (closes C-R399-LOW-CLAIMS). Recorded as 14b-ii inputs, not scheduled: A-R399-PATH-REWRITES-VIRT, A-R399-RES-CLIPS1-DOM, Q-14B-PIN-GROUP-MEMBERS; reviewer Lows to deferred_low_polish (A-R399-REVIEW-LOWS, A-R399-REVIEW-PLANNER-PATCH-LOWS). A-R398-ARCH-FIND-TIMELINE-SCROLLER notes a third caller; not scheduled (perf/lib frozen)."},
]
json.dump(b, open(p,'w'), ensure_ascii=False, indent=2)
open(done,'w').write('ok\n')
print('applied v367')
