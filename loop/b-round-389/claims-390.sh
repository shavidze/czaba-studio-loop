#!/usr/bin/env bash
# Round 390 REGRESSION part 2 claims (L29 + L56). Run from the loop root.
# HEAD is unchanged since round 389 (gate 389 skipped), so the round-389 frozen tree is reused.
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-388.json'));b=json.load(open('gates/gate-round-389.json'));print(a['status'],a['commit'][:7],b['status'])")"
echo "K2 $(git -C $S rev-parse --short HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
echo "K3 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K4 $(cd $S && sha256sum -c $L/b-round-388/r389-tree-sha256.txt 2>/dev/null | grep -vc ': OK$') $(wc -l < b-round-388/r389-tree-sha256.txt)"
echo "K5 $(python3 -I -c "import json;d=json.load(open('regression-last.json'));print(d['date'],d['round'])")"
echo "K6 $(curl -s -o /dev/null -w '%{http_code}' --max-time 3 http://127.0.0.1:5199/api/products) $(curl -s -o /dev/null -w '%{http_code}' --max-time 30 http://127.0.0.1:5173/studio-lab)"
echo "K7 $(python3 -I -c "import json;c=json.load(open('c-round-389.json'));print(c['taskStatus'],len(c['passed']),len(c['failed']),c['browserVerified'],c['realVerified'])")"
echo "K8 $(ls c-round-389/perf-results/*.json | wc -l) $(grep -c 'interact.harness.drag-lane-live\"\|interact.harness.drag-group-live\"' c-round-389/perf-results/latest-interactions.json)"
echo "K9 $(python3 -I -c "import json;d=json.load(open('c-round-389/export-det.json'));print(d['clips'],d['equal'])") $(test -f c-round-389/export-1440-czaba-studio-lab.wav && echo wav1440)"
echo "K10 $(for f in tasks/round-389.md tasks/round-340.md tasks/round-341.md tasks/round-342.md tasks/round-301.md tasks/round-258.md c-round-340.md c-round-341.md c-round-342.md c-round-389.md c-round-389.json \
 c-round-301/tools/jdiff.py c-round-301/tools/rp301/rp301.cjs c-round-301/tools/narrow/rg22n.cjs c-round-301/tools/price c-round-301/t258 \
 c-round-341/tools/run-batch1.sh c-round-341/tools/run-batch2.sh c-round-341/tools/run-batch3.sh c-round-341/tools/run-batch4.sh c-round-341/tools/pk-video-sound.cjs c-round-341/tools/journey/journey301.cjs c-round-341/out/fonts \
 c-round-342/tools/rp/rp-c301-01.cjs c-round-342/tools/rp/rp-fold-selection.cjs c-round-342/tools/rp/rp-status-race.cjs c-round-342/tools/rp/rp-c331-01.cjs c-round-342/tools/g340-auth.cjs c-round-342/out/posctl.json c-round-342/out/rg22n.json c-round-342/out/rp301.json \
 c-round-308/posctl-probe.cjs c-round-300/journey.cjs c-round-389/tools/journey.cjs c-round-389/tools/flow.cjs c-round-389/tools/video-behaviour-probe.mjs c-round-389/tools/export-wav.mjs c-round-389/tools/auth-smoke.mjs \
 c-round-389/tools/export-det.mjs c-round-311/run-wk.sh c-round-311/head-r2-proxy.mjs c-round-311/browser-probe-311.cjs c-round-284/shots c-round-301/t258/tools/run-store.sh \
 c-round-342/out/rp-c301-01.json c-round-342/out/rp-fold-selection.json c-round-342/out/rp-status-race.json c-round-342/out/rp-c331-01.json \
 mock-api/server.mjs b-round-318/protected-sha256.txt b-round-388/r389-tree-sha256.txt b-round-389/claims-390.sh; do test -e $f || echo MISSING:$f; done; echo checked)"
