#!/usr/bin/env bash
# Round 380 claims (PERF-12a). Run from the loop root: bash b-round-379/claims-380.sh
L=/home/runner/czaba-project/tmp/studio-real-loop; S=${S:-/home/runner/czaba-project/store}
cd "$S" || exit 1
echo "K1 gate379: $(python3 -I -c "import json;d=json.load(open('$L/gates/gate-round-379.json'));print(d['status'],d['commit'][:7])") HEAD $(git rev-parse --short=7 HEAD)"
echo "K2 status lines: $(git status --short --untracked-files=all | wc -l)"
echo "K3 slice copy line: $(grep -n 'getChannelData(index).slice()' app/lib/arrangement/graph.client.ts | cut -d: -f1 | tr '\n' ' ')"
echo "K4 render callers in ArrangementContext: $(grep -c 'await renderArrangementWav(' app/contexts/ArrangementContext.tsx)"
echo "K5 encodeArrangementWavOffMainThread outside tests: $(grep -rln 'encodeArrangementWavOffMainThread' app --include=*.ts --include=*.tsx | grep -v __tests__ | tr '\n' ' ')"
echo "K6 encodeArrangementWavInPlace outside tests: $(grep -rln 'encodeArrangementWavInPlace' app --include=*.ts --include=*.tsx | grep -v __tests__ | tr '\n' ' ')"
echo "K7 tests naming old functions or the worker module: $(grep -rlE 'encodeArrangementWavOffMainThread|encodeArrangementWavInPlace|export-wav\.worker' app perf e2e --include=*.ts --include=*.tsx 2>/dev/null | grep __tests__ | sort | tr '\n' ' ')"
echo "K8 test files with startRendering fakes and no copyFromChannel on the rendered object: $(for f in $(grep -rl 'startRendering' app --include=*.test.ts --include=*.test.tsx | sort); do grep -q 'fakeRenderedBuffer' $f || echo -n "$(basename $f) "; done)"
echo "K9 protected: $(sha256sum -c --quiet $L/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo rc=$?)"
echo "K10 frozen r380: $(sha256sum -c --quiet $L/b-round-379/r380-frozen-sha256.txt >/dev/null 2>&1; echo rc=$?) entries $(wc -l < $L/b-round-379/r380-frozen-sha256.txt)"
echo "K11 sketch files (stable set): $(sha256sum -c $L/b-round-379/sketch-files-stable-sha256.txt 2>/dev/null | grep -c ': OK$')/$(wc -l < $L/b-round-379/sketch-files-stable-sha256.txt)"
echo "K12 patch sha: $(cd $L/b-round-379 && sha256sum -c --quiet sketch-dispatched.sha256 >/dev/null 2>&1; echo rc=$?)"
echo "K13 B sketch runs: $(sed 's/\x1b\[[0-9;]*m//g' $L/b-round-379/sketch-vitest-render-v2.log | grep -E '^ +Tests ' | head -1 | xargs)"
echo "K14 backing-model probe rows: $(python3 -I -c "import json;print(len(json.load(open('$L/b-round-379/probe/backing-model-1440.json'))['rows']))")"
echo "K15 perf sketch export rows: $(grep -cE '^res\.export\.' $L/b-round-379/perf-res-sketch-v2.log)"
echo "K16 artifacts: $(for p in tasks/round-379.md b-round-379/sketch-src.patch.txt b-round-379/sketch-fakes.patch.txt b-round-379/sketch-budgets.patch.txt b-round-379/perf-res-sketch-v2-assert.log b-round-379/sketch-perf-lib.log b-round-379/mutants/sketch-perf-v2/perf-summary.txt b-round-379/sketch-v1-src.patch.txt b-round-379/sketch-v1-to-v2.interdiff.txt b-round-379/sketch-dispatched.sha256 b-round-379/sketch-files-stable-sha256.txt b-round-379/grants-380.txt b-round-379/r380-frozen-sha256.txt b-round-379/probe/backing-model.mjs b-round-379/probe/backing-model-1440.json b-round-379/probe/wav-bytes-380.mjs b-round-379/probe/wav-head-380.json b-round-379/probe/wav-sketch-380.json b-round-379/probe/wav-sketch-380-attempt1.log b-round-379/perf-res-sketch.log b-round-379/perf-res-sketch-v2.log b-round-379/sketch-vitest-render-v2.log b-round-379/mutants/run-mutants-380.sh b-round-379/mutants/run-perf-mutants-380.sh b-round-379/mutants/sketch-perf/perf-summary.txt b-round-379/sketch-review.md b-round-379/claims-380-output.txt b-round-379/claims-380-sketch-output.txt b-round-379/claims-380-allowed-delta.txt c-round-377/perf-resources.log b-round-318/protected-sha256.txt b-round-373/root-request-arch-checkpoint-leaf-plumbing.md tools/l57-check.py; do test -f $L/$p && echo -n "ok " || echo -n "MISSING:$p "; done)"
echo "K17 regression-last: $(python3 -I -c "import json;print(json.load(open('$L/regression-last.json'))['date'])") lessons $(wc -l < $L/lessons.md)"
echo "K18 res.export rows in budgets: $(grep -c '"id": "res.export' perf/budgets.resources.json)"
echo "K19 doc 246 free: $(ls docs/implementation/2026/quarter-IV/ | grep -c '^246-') ; last $(ls docs/implementation/2026/quarter-IV/ | sort | tail -1)"
