#!/usr/bin/env bash
# Round 484 claims (B planning 2026-11-13, REGRESSION-2026-11-13 part 2 remainder). ROOT/LOOP may be overridden. One line per claim.
# Id lookups go through tools/find-ids.py (backlog + archive). No root-consumed request file is an input.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-483
P=$B/probe
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD) gate481 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-481.json'));print(a['status'],a.get('commit','')[:7])") gate483 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-483.json'));print(a['status'],a['head'][:7])")"
echo "K2 status total $(git status --short --untracked-files=all | wc -l)"
sha256sum --quiet -c "$B/r484-tree-sha256.txt" >/dev/null 2>&1; echo "K3 tree $(wc -l < "$B/r484-tree-sha256.txt") rc $? same-as-483 $(diff -q <(sort -k2 "$B/r484-tree-sha256.txt") <(sort -k2 "$LOOP/b-round-482/r483-tree-sha256.txt") >/dev/null && echo yes || echo NO)"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K4 protected $(wc -l < "$LOOP/b-round-318/protected-sha256.txt") rc $?"
echo "K5 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])")"
echo "K6 c483 $(python3 -I -c "import json;c=json.load(open('$LOOP/c-round-483.json'));print(c['taskStatus'],len(c['passed']),len(c['failed']),len(c['bugs']),c['browserVerified'],c['realVerified'],'notRun',len(c['notRun']),'inconclusive',len(c['inconclusive']))")"
echo "K7 testids playhead-files $(grep -rl 'data-testid="arrangement-playhead"' app/components/arrangement | grep -v __tests__ | wc -l) track-header-files $(grep -rl 'data-testid="arrangement-track-header"' app/components/arrangement | grep -v __tests__ | wc -l) scroller-files $(grep -rl 'data-testid="arrangement-timeline-scroller"' app/components/arrangement | grep -v __tests__ | wc -l) lane-data-track-id $(grep -c 'data-track-id={track.id}' app/components/arrangement/ArrangementLane.tsx)"
echo "K8 workers alt $(test -f cloudflare/r2-worker.js && echo present || echo absent) proxy $(test -f workers/r2-proxy.js && echo present || echo absent) last-change $(git log -1 --format=%h -- cloudflare/r2-worker.js workers/r2-proxy.js)"
echo "K9 b-follow-attr $(python3 -I -c "
import json
for v in ('1440x900','1280x720'):
  d=json.load(open('$P/follow-attr-'+v+'.json'));a=d['play1']['attr'];print(v,a['clientWidth'],a['laneHeaderWidth'],a['scrollerLeft'],round(a['playheadXInScroller'],1),end=' ')
")"
echo "K10 b-cross-lanes $(python3 -I -c "
import json
for k in ('playing','stopped'):
  for w in ('1440','1280'):
    d=json.load(open('$P/cross-'+k+'-lanes-'+w+'.json'));m=d['mountedLanes'];print(k+w,sorted(set((x['lanes'],x['clips']) for x in m.values())),len(m),end=' ')
")"
echo "K11 b-alt-throw-equal-r414 $(cmp -s "$P/wk-alt-throw-1440.sum.txt" "$P/r414-alt-throw.sum.txt" && echo yes || echo NO) lines $(wc -l < "$P/wk-alt-throw-1440.sum.txt")"
for f in tasks/round-483.md tasks/round-425.md tasks/round-423.md tasks/round-414.md c-round-483.md c-round-483.json c-round-414.md \
 c-round-483/t389/tools/follow-probe.mjs c-round-483/tools/cross-playing.mjs c-round-483/tools/cross-stopped.mjs c-round-483/worker414/worker-server.mjs c-round-483/worker414/browser-probe.cjs c-round-483/worker414/summarize-414.py \
 c-round-483/t301/r295/c295.cjs c-round-483/t301/r295/c295.json c-round-483/out/rp-c301-01.json c-round-483/out/rp-c331-01.json c-round-483/out/rp-status-race.json c-round-483/out/rp-fold-selection.json c-round-483/tools/rp301/rp301.json c-round-483/out/b3/posctl.json c-round-483/out/escdrag-1440.json c-round-483/out/escdrag-1280.json \
 c-round-342/out/rp301.json c-round-342/out/rp-c301-01.json c-round-342/out/rp-c331-01.json c-round-342/out/rp-status-race.json c-round-342/out/rp-fold-selection.json c-round-342/out/posctl.json \
 c-round-414/wk-alt-throw-1440.json c-round-414/wk-alt-short-1440.json c-round-483/worker414/wk-proxy-throw-1440.sum.txt c-round-483/worker414/wk-proxy-short-1440.sum.txt c-round-483/out/cross-playing-1440.json c-round-483/t389/out c-round-425/t389/out \
 c-round-483/tools/c218-mp3-ready.cjs c-round-483/tools/warmup.cjs c-round-483/cmp2.py c-round-483/g483-auth.cjs c-round-483/out/escdrag-1440.json b-round-483/probe/cross-playing-lanes-1440.json b-round-483/probe/cross-stopped-lanes-1280.json \
 b-round-483/probe/follow-attr-probe.mjs b-round-483/probe/cross-playing-lanes.mjs b-round-483/probe/cross-stopped-lanes.mjs b-round-483/probe/follow-attr-1440x900.json b-round-483/probe/follow-attr-1280x720.json \
 b-round-483/probe/wk-alt-throw-1440.sum.txt b-round-483/probe/r414-alt-throw.sum.txt b-round-483/client-nav-planning-note.md b-round-483/r484-tree-sha256.txt b-round-483/checkpoint.md \
 c-round-390/tools/loaf.cjs c-round-390/out/loaf.json c-round-425/out/rp-c301-01.json c-round-425/out/rp-c331-01.json c-round-425/out/rp-status-race.json c-round-425/out/rp-fold-selection.json c-round-414/wk-alt-short-1440.json \
 b-round-483/probe/loaf/loaf.json b-round-483/probe/alt-vs-proxy.txt b-round-483/probe/cross-vs-r483.txt b-round-483/probe/parked-vs-425-all.json b-round-483/probe/parked-vs-342.json b-round-483/probe/wk-alt-short-1440.sum.txt b-round-483/probe/r414-alt-short.sum.txt \
 mock-api/server.mjs b-round-318/protected-sha256.txt tools/l57-check.py tools/l58-check.py tools/find-ids.py; do test -e "$LOOP/$f" || echo "K12 MISSING $f"; done; echo "K12 artifacts checked"
echo "K13 archive-483 $(cmp -s "$LOOP/tasks/round-483.md" "$B/current-task-before-484.md" && echo identical || echo differs)"
python3 -I "$LOOP/tools/find-ids.py" "$LOOP" C-R425-01-RVM-COLD-DEV-EMPTY C-R425-02-FOLLOW-SCROLL-OFFSET GATE479-M1-ROUTE-ANNOUNCE B-R480-ORDER-CARD-KEYBOARD | sed 's/^/K14 /'
echo "K15 regression-entry $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));n=[x for x in b['regression_rounds'] if x['id']=='REGRESSION-2026-11-13'][0];print(n['status'][:60])")"
echo "K16 backlog-v $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print(b['version'], b['decisions_log_b'][-1]['id'])")"
echo "K17 l58 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md 2>&1 | tail -1)"
echo "K18 ports 5199 $(curl -s -o /dev/null -w '%{http_code}' --max-time 3 http://127.0.0.1:5199/api/products) 5173 $(curl -s -o /dev/null -w '%{http_code}' --max-time 30 http://127.0.0.1:5173/studio-lab)"
echo "K19 stem-lanes-answer $(grep -ciE '^\*\*?(saba|answer)' "$LOOP/user-review/AGREE-STEM-LANES.md")"
echo "K20 auth-recipe $(curl -s -o /dev/null -w '%{http_code}' --max-time 60 'http://127.0.0.1:5173/api/studio-token?product=middle-east&file=mix.wav') $(curl -s -o /dev/null -w '%{http_code}' --max-time 60 http://127.0.0.1:5173/api/studio-token)"
echo "K21 c295-history r390 $(grep -c '"loafPass": false' "$LOOP/c-round-390/t301/r295/c295.json") r425 $(grep -c '"loafPass": true' "$LOOP/c-round-425/t301/r295/c295.json") r483 $(grep -c '"loafPass": false' "$LOOP/c-round-483/t301/r295/c295.json")"
echo "K22 b-loaf-provoked $(python3 -I -c "
import json
for r in json.load(open('$P/loaf/loaf.json')): print(r['vp'],len(r['afterBusyRaf']),min((len(e['scripts']) for e in r['afterBusyRaf']),default=0),end=' ')
")"
echo "K23 b-alt-short-vs-r414 $(diff "$P/r414-alt-short.sum.txt" "$P/wk-alt-short-1440.sum.txt" | grep -c '^[<>]') alt-vs-proxy-lines $(grep -c '^[<>]' "$P/alt-vs-proxy.txt") coverTwice $(grep -c coverTwice "$P/alt-vs-proxy.txt") audioSeek $(grep -c audioSeek "$P/alt-vs-proxy.txt")"
echo "K24 b-cross-vs-r483 $(cat "$P/cross-vs-r483.txt" | head -1)"
echo "K25 b-parked $(python3 -I -c "
import json
a=json.load(open('$P/parked-vs-425-all.json'));b=json.load(open('$P/parked-vs-342.json'))
print('vs425',{k:v[0] for k,v in sorted(a.items())},'vs342',{k:v[0] for k,v in sorted(b.items())})
")"
