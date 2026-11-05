#!/usr/bin/env bash
# Round 340 REGRESSION claims (L29 + L56). Run from the loop root.
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}; R=b-round-339
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-339.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
echo "K3 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K4 $(cd $S && sha256sum -c $L/$R/r340-tree-sha256.txt 2>/dev/null | grep -vc ': OK$') $(wc -l < $R/r340-tree-sha256.txt)"
echo "K5 $(python3 -I -c "import json;d=json.load(open('regression-last.json'));print(d['date'],d['round'])")"
echo "K6 $(curl -s -o /dev/null -w '%{http_code}' --max-time 3 http://127.0.0.1:5199/api/products) $(curl -s -o /dev/null -w '%{http_code}' --max-time 30 http://127.0.0.1:5173/studio-lab)"
echo "K7 $(python3 -I -c "import json;d=json.load(open('c-round-339/perf-results/latest-interactions.json'));print(len(d['rows']),sum(1 for r in d['rows'] if r.get('mode')=='assert'))") $(git -C $S log -1 --format=%h -- perf)"
echo "K8 $(grep -c -F 'previewArrangement(next);' $S/app/components/arrangement/ArrangementClip.tsx) $(grep -c -F 'export function createArrangementClipLaneDragStore' $S/app/lib/arrangement/clip-lane-drag-store.ts)"
echo "K9 $(for f in tasks/round-339.md tasks/round-301.md c-round-301.md c-round-301.json c-round-301/perf/latest.json c-round-301/perf/latest-interactions.json c-round-301/perf/latest-resources.json b-round-224/scripts/equiv-check-b2.py b-round-329/perf-rowcmp.py mock-api/server.mjs c-round-338/smoke338.mjs c-round-338/probe-head-1440.json b-round-337/cross-lane-probe.mjs b-round-338/group-probe.mjs c-round-339/g339-auth.cjs b-round-318/protected-sha256.txt $R/r340-tree-sha256.txt $R/current-task-c4-ii-draft.md; do test -e $f || echo MISSING:$f; done; echo checked)"
