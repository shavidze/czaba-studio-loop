#!/usr/bin/env bash
# Round 301 claims. Run from anywhere: bash b-round-300/claims-301.sh
L=/home/runner/czaba-project/tmp/studio-real-loop; S=/home/runner/czaba-project/store
cd "$S" || exit 2
echo "K1 HEAD $(git rev-parse HEAD)"
echo "K2 status-lines $(git status --short --untracked-files=all | wc -l)"
git diff --quiet HEAD -- 'app/routes/studio.$productId.tsx' app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/__tests__/download-routes.test.ts app/lib/auth.ts app/contexts/AuthContext.tsx app/entry.server.tsx; echo "K3 protected-diff-rc $?"
echo "K4 georgian-chars-in-demo $(grep -cP '[\x{10A0}-\x{10FF}]' app/data/studio-lab-demo.ts)"
echo "K5 narrow-classes $(grep -c 'max-\[900px\]:hidden\|min-\[900px\]:hidden' app/routes/studio-lab.tsx)"
echo "K6 perf-last-commit $(git log -1 --format=%h -- perf/)"
for f in latest.json latest-interactions.json latest-resources.json; do test -f "$L/c-round-285/perf/$f" && echo "K7 oracle $f present" || echo "K7 oracle $f MISSING"; done
echo "K8 regression-last $(cat $L/regression-last.json | python3 -I -c 'import json,sys;j=json.load(sys.stdin);print(j["date"],j["round"])')"
for f in tasks/round-199.md tasks/round-258.md c-round-258/tools c-round-300/rows.cjs c-round-300/journey.cjs c-round-292/c292.cjs c-round-276/c276.cjs c-round-278/c278.cjs c-round-282/worker-probe.cjs c-round-282/export-probe-c282.cjs c-round-286/product-probe.cjs mock-api/server.mjs b-round-224/scripts/equiv-check-b2.py b-round-300-r301-tree-sha256.txt; do test -e "$L/$f" && echo "K9 exists $f" || echo "K9 MISSING $f"; done
echo "K10 sheet-row $(grep -c 'library-view-in-store' app/lib/arrangement/shortcuts.ts)"
echo "K11 mock-5199 $(curl -s -o /dev/null -w '%{http_code}' --max-time 3 http://127.0.0.1:5199/api/products || true)"
echo "K12 master-in-footer-file $(grep -ln 'ArrangementMaster' app/components/arrangement/*.tsx | xargs -n1 basename | tr '\n' ' ')"
echo "K13 menu-contextmenu-prevent $(grep -c 'onContextMenu' app/components/arrangement/ArrangementLibraryMenu.tsx) draggable-attr $(grep -c 'draggable' app/components/arrangement/ArrangementLibraryMenu.tsx)"
echo "K14 export-path-commits-since-282 $(git log --oneline 54a3fcc..HEAD -- app/lib/arrangement/demo-synth.ts app/lib/arrangement/demo-synth.client.ts app/lib/arrangement/demo-synth.worker.ts app/lib/arrangement/export-wav.ts app/lib/arrangement/export-wav.client.ts app/lib/arrangement/export-wav.worker.ts app/lib/arrangement/graph.client.ts app/lib/arrangement/render-window.ts app/workers | wc -l)"
echo "K15 demo-file-commits-since-282 $(git log --format=%h 54a3fcc..HEAD -- app/data/studio-lab-demo.ts | tr '\n' ' ')"
