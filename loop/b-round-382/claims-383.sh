#!/usr/bin/env bash
# Round 383 claims. Run from the loop root: bash b-round-382/claims-383.sh
L=$(pwd); S=$L/../../store; cd "$S" || exit 1
AC=app/contexts/ArrangementContext.tsx
k() { echo "== $1"; }
k K1; python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-382.json'));print(g['status'],g.get('reason'))"; git rev-parse --short HEAD
k K2; git status --short --untracked-files=all | wc -l; git status --short --untracked-files=all
k K3-updater-sites; grep -n "setSourcePeaks((previous)" $AC || echo MISSING
k K4-updater-at-HEAD; git show HEAD:$AC | grep -n "setSourcePeaks((previous)" || echo MISSING
k K5-onPeaks-sites; grep -n "requestSourcePeaks(buffer" $AC || echo MISSING
k K6-reset; grep -n "const resetDecodedBuffers\|decodedBuffers.clear()" $AC || echo MISSING
k K7-video-set; grep -n "evictable: false" $AC || echo MISSING
k K8-cache-api; grep -n "^    [a-zA-Z]*: (" app/lib/arrangement/decoded-buffer-cache.ts; grep -c "deleteMany" app/lib/arrangement/decoded-buffer-cache.ts
k K9-ev-rows; grep -on "it('E[V][0-9]*" app/lib/arrangement/__tests__/decoded-buffer-eviction-ui.test.tsx | awk -F"'" '{print $2}' | sort | uniq -c
k K10-doc248-l4; sed -n 4p docs/implementation/2026/quarter-IV/248-perf-decoded-buffer-cache.md; grep -n "Stop" docs/implementation/2026/quarter-IV/248-perf-decoded-buffer-cache.md | head -3
k K11-stopPlayback-no-preview; awk "/const stopPlayback = useCallback/{f=1} f{print; n++} n>40{exit}" $AC | grep -c -i "preview"; echo HEAD:; git show HEAD:$AC | awk "/const stopPlayback = useCallback/{f=1} f{print; n++} n>40{exit}" | grep -c -i "preview"
k K12-heap-evidence; for f in heap-ready2.json heap-ready3-ctx.json heap-preview.json preview-stop-check.json preview-stop-check-lib.json source-release-exp.out heap-retainers.mjs; do [ -f "$L/b-round-382/probe/$f" ] && echo "ok $f" || echo "MISSING $f"; done
k K13-heap-numbers; python3 -I -c "
import json
d=json.load(open('$L/b-round-382/probe/heap-ready2.json')); print('ready live', d['liveReady'])
n=[b for b in d['audioBuffers'] if b['node'].startswith('native:')]; print('native', len(n), 'via cache', sum(any('decodedBuffers' in p for p in b['path']) for b in n), 'via baseQueue', sum(any('baseQueue' in p for p in b['path']) for b in n))
r=json.load(open('$L/b-round-382/probe/preview-stop-check.json')); print('transport-stop stops', r['stops'], 'live', r['live'])
r=json.load(open('$L/b-round-382/probe/preview-stop-check-lib.json')); print('library-stop stops', r['stops'], 'live', r['live'], 'afterAdd', r['afterAdd'], 'afterUndo', r['afterUndo'])"
k K14-ctx-vars; python3 -I -c "import json;print([v['vars'] for v in json.load(open('$L/b-round-382/probe/heap-ready3-ctx.json'))])"
k K15-protected; sha256sum -c --quiet "$L/b-round-318/protected-sha256.txt" && echo rc0
k K16-frozen; wc -l < "$L/b-round-382/r383-frozen-sha256.txt"; sha256sum -c --quiet "$L/b-round-382/r383-frozen-sha256.txt" && echo rc0
k K17-regression; cat "$L/regression-last.json" | python3 -I -c "import json,sys;print(json.load(sys.stdin)['date'])"; wc -l < "$L/lessons.md"
k K18-library-stop-button; grep -n "previewPlay\|previewStop" app/lib/arrangement/strings.ts; grep -rln "previewStop" app/components/studio | grep -v __tests__
