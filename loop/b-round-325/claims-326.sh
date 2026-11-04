#!/usr/bin/env bash
# Round 326 claims (L29 + L56). Run from the loop root. CLAIMS_STORE may override the store path.
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
IM=$S/app/lib/arrangement/__tests__/insert-marker-ui.test.tsx
ENV=$S/app/lib/arrangement/__tests__/helpers/workspace-test-environment.ts
CTX=$S/app/contexts/ArrangementContext.tsx
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-325.json'));print(a['status'],a['head'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
echo "K3 $(grep -c -F "vi.spyOn(Date, 'now')" $IM)"
echo "K4 $(grep -c -F 'playingVisits.push(Math.round(live(mounted.api).getLivePosition() * 1000) / 1000);' $IM) $(grep -c -F 'expect(playingVisits).toEqual([2, 6, 10, 16, 16]);' $IM)"
echo "K5 $(grep -c -F 'return Date.now() / 1000 - fakeClock.base;' $ENV)"
echo "K6 $(grep -c -F 'const PLAYBACK_LOOKAHEAD = 0.05;' $CTX)"
echo "K7 $(grep -c -F 'vi.restoreAllMocks();' $IM)"
echo "K8 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K9 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K10 $(grep -c 'expect(' $IM)"
echo "K11 $(cd $S && git diff --name-only HEAD -- app perf | sort | sha256sum | cut -c1-12) $(cd $S && git ls-files --others --exclude-standard app perf | sort | sha256sum | cut -c1-12)"
echo "K12 $(cd $S && git diff HEAD -- app perf ':!app/lib/arrangement/__tests__/insert-marker-ui.test.tsx' | sha256sum | cut -c1-12) $(cd $S && git ls-files --others --exclude-standard app perf | sort | xargs cat | sha256sum | cut -c1-12)"
echo "K13 $(sed -n 4p $D232)"
echo "K14 $(for f in tasks/round-325.md b-round-325/sketch/im24-fix.patch.txt b-round-325/sketch/mu-delay-60.patch.txt b-round-325/sketch/run-head-mu-delay-60.log b-round-325/sketch/run-fix-mu-delay-60.log b-round-325/sketch/run-fix-file-1.log b-round-325/sketch/run-fix-file-2.log b-round-325/sketch/run-fix-file-3.log b-round-325/sketch/summary.txt b-round-325/pointer-move-test-files.txt b-round-325/app-perf-changed-files.txt c-round-325/source-sha-end.txt gates/round-325/verify.log; do test -f $f || echo MISSING:$f; done; echo checked)"
echo "K15 $(grep -c -F "IM24 stopped Ctrl+Right steps from the insert marker; the none text names the origin by state" gates/round-325/verify.log) $(grep -c -F 'expected [ 2, 6, 10, 16, 16.001 ] to deeply equal [ 2, 6, 10, 16, 16 ]' gates/round-325/verify.log)"
echo "K16 $(cmp -s tasks/round-325.md b-round-325/before-current-task.md && echo archive-equal)"
echo "K17 $(grep -c '^## პრობლემები და გადაწყვეტები$' $D232) $(grep -c 'IM24' $D232)"
echo "K18 $(grep -c -E '^\s+advance\(' $IM) $(grep -c -F 'await waitFor' $IM)"
