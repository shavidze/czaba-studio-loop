#!/usr/bin/env bash
# Round 389 REGRESSION part 1 claims (L29 + L56). Run from the loop root.
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}; R=b-round-388
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-388.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
echo "K3 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K4 $(cd $S && sha256sum -c $L/$R/r389-tree-sha256.txt 2>/dev/null | grep -vc ': OK$') $(wc -l < $R/r389-tree-sha256.txt)"
echo "K5 $(python3 -I -c "import json;d=json.load(open('regression-last.json'));print(d['date'],d['round'])")"
echo "K6 $(curl -s -o /dev/null -w '%{http_code}' --max-time 3 http://127.0.0.1:5199/api/products) $(curl -s -o /dev/null -w '%{http_code}' --max-time 30 http://127.0.0.1:5173/studio-lab)"
echo "K7 $(git -C $S log -1 --format=%h -- perf) $(ls $S/perf/*.perf.spec.ts | wc -l)"
echo "K8 $(grep -c -F 'if (!isPlayingRef.current) {' $S/app/contexts/ArrangementContext.tsx) $(grep -c -F 'resyncLoopRef.current();' $S/app/contexts/ArrangementContext.tsx) $(grep -c -F "return result === 'late';" $S/app/contexts/ArrangementContext.tsx)"
echo "K9 $(grep -c -F 'scheduleFailed' $S/app/contexts/ArrangementContext.tsx) $(grep -c -F 'startGraphOrStop' $S/app/contexts/ArrangementContext.tsx)"
echo "K10 $(for f in tasks/round-388.md tasks/round-340.md tasks/round-341.md tasks/round-342.md tasks/round-301.md c-round-340.md c-round-341.md c-round-342.md c-round-388.md c-round-388.json c-round-387/meter-freeze.mjs c-round-387/meter-control.mjs b-round-386/probe/m2-flow.mjs b-round-385/probe/resync-throw.mjs c-round-388/auth-smoke.mjs c-round-386/export-wav.mjs c-round-382/lib.mjs c-round-382/playrefuse.mjs c-round-384/evict.mjs c-round-384/heap-1440.mjs c-round-368/export-trunc.mjs c-round-365/cache.mjs c-round-359/settings-probe.mjs c-round-358/follow-probe.mjs c-round-358/marker-probe.mjs c-round-358/narrow-probe.mjs c-round-362/playstop.mjs c-round-364/bg.mjs c-round-375/master.mjs c-round-376/browser.mjs c-round-377/probe-range.mjs c-round-378/smoke378.mjs c-round-350/video-behaviour-probe.mjs c-round-347/faders.mjs c-round-346/visual.mjs c-round-345/flow.cjs b-round-338/group-probe.mjs b-round-334/vitest.perf-lib.config.mjs mock-api/server.mjs b-round-318/protected-sha256.txt $R/r389-tree-sha256.txt $R/claims-389.sh; do test -e $f || echo MISSING:$f; done; echo checked)"
