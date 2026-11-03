#!/usr/bin/env bash
# B round 317 -> 318 claims (PERF-8a). Usage: bash claims-318.sh ; CLAIMS_STORE overrides store path.
L=/home/runner/czaba-project/tmp/studio-real-loop
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
cd "$S" || exit 1
echo "K1 gate317: $(python3 -I -c "import json;d=json.load(open('$L/gates/gate-round-317.json'));print(d['status'],d['commit'][:7])")"
echo "K2 head+status: $(git rev-parse --short HEAD) $(git status --short --untracked-files=all | wc -l)"
echo "K3 zustand in package.json: $(grep -c '"zustand": "5.0.16"' package.json) ; in lock: $(grep -c '"node_modules/zustand"' package-lock.json)"
echo "K4 'range' lines in ArrangementContext value memo/deps (^ {6}range,$): $(grep -cE '^ {6}range,$' app/contexts/ArrangementContext.tsx)"
echo "K5 latestRef.current.range reads: $(grep -c 'latestRef.current.range' app/contexts/ArrangementContext.tsx)"
echo "K6 workspaceRef/current .range in StudioWorkspace: $(grep -cE '\.range\b' app/components/arrangement/StudioWorkspace.tsx)"
echo "K7 useState range in provider: $(grep -c 'useState<TimeRange | null>(null)' app/contexts/ArrangementContext.tsx)"
echo "K8 protected: $(sha256sum -c $L/b-round-312/protected-sha256.txt 2>/dev/null | grep -c ': OK$') OK"
echo "K9 regression-last: $(python3 -I -c "import json;print(json.load(open('$L/regression-last.json'))['date'])")"
echo "K10 test files reading .range off the context: $(grep -rlE '(live\([a-zA-Z]+\)|api\.current|current|ctx|context|value)\??\.range\b' app --include='*.test.ts*' | wc -l)"
echo "K11 Lane clipRange line: $(grep -c 'const clipRange = isRangeInClip(clip) ? range : null;' app/components/arrangement/ArrangementLane.tsx)"
echo "K12 zustand imports in app/: $(grep -rlE "from 'zustand" app | wc -l)"
echo "K13 range-store module exists: $(test -f app/lib/arrangement/range-store.ts && echo 1 || echo 0)"
echo "K14 range budget rows in assert mode: $(python3 -I -c "
import json;b=json.load(open('perf/budgets.interactions.json'));rows=b if isinstance(b,list) else b.get('rows',b.get('budgets'))
print(sum(1 for r in rows if r['id'] in ('interact.drag.range.stopped.move-components-per-move','interact.drag.range.playing.move-components-per-move','interact.drag.range.playing.move-restarts') and r['mode']=='assert'))")"
echo "K15 detail-panel start/end layout effect present: $(grep -c 'setStartText(rangeInputText(onClipStart ?? clipStart));' app/components/arrangement/ArrangementDetailPanel.tsx)"
echo "K16 artifacts: $(n=0; for f in claims-318-head-output.txt range-test-files.txt expect-count.py expect-count-head.txt; do test -f $L/b-round-317/$f && n=$((n+1)); done; echo $n)"
