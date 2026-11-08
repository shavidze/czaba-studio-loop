#!/usr/bin/env bash
# Round 418 claims (SYS-R416-PREVIEW-CONTROLLER). ROOT/LOOP may be overridden. Prints one line per claim.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-417
C=app/contexts/ArrangementContext.tsx
P=app/lib/arrangement/preview.client.ts
T=app/lib/arrangement/__tests__/library-preview-stream.test.tsx
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD)"
echo "K2 status $(git status --short --untracked-files=all | awk '{print $1}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')total $(git status --short --untracked-files=all | wc -l)"
echo "K2b status-outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-418.txt" | wc -l)"
sha256sum --quiet -c "$B/r418-frozen-sha256.txt" >/dev/null 2>&1; echo "K3 frozen $(wc -l < "$B/r418-frozen-sha256.txt") rc $?"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K4 protected rc $? granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-418.txt")"
if git apply --check "$B/sketch-418.patch.txt" 2>/dev/null; then echo "K5 sketch-applies yes"; else echo "K5 sketch-applies no"; fi
echo "K6 last-doc $(ls docs/implementation/2026/quarter-IV/ | sort | tail -1) doc269-l4 $(sed -n 4p docs/implementation/2026/quarter-IV/269-sys-preview-controller.md 2>/dev/null || echo absent)"
echo "K7 gate417 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-417.json'));print(a['status'],a['commit'][:7])")"
echo "K8 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])")"
echo "K9 head-code requestRef $(grep -c 'previewRequestRef' $C) stop-before-owner $(grep -A1 -x '        stopLibraryPreview();' $C | grep -c 'const owner = collectionControllerRef.current;') sync-fallback $(grep -cx '          startLibraryPreviewRef.current(sourceId, atSeconds);' $C) seek-active $(grep -c '          active.restartArmedStall();' $P) raw-read $(grep -c '          const at = element.currentTime;' $P) stall-raw-read $(grep -c 'if (active === preview && element.currentTime === armedAt) {' $P) new-url-stop $(grep -c '^      stopActive();$' $P)"
echo "K10 sketch-code token $(grep -c 'previewTokenRef' $C) microtask $(grep -c 'queueMicrotask(() => {' $C) setErrorHandler $(grep -c 'setErrorHandler' $P) readTime $(grep -c 'readTime()' $P) rows-PC $(grep -cE "^  it\('PC[0-9]+ " $T) rows-PS $(grep -cE "^  it\('PS[0-9]+ " $T) await-error-act $(grep -c 'await act(async () => {' $T)"
echo "K11 sketch-sha $(sha256sum "$B/sketch-418.patch.txt" | cut -c1-16)"
for f in sketch-418.patch.txt sketch-418.sha256 make-sketch-src.py make-sketch-test.py sketch-review.md precheck-full.log precheck-typecheck.log precheck-lint.log precheck-biome3.log precheck-loaded.log mutants/run.py mutants/summary.txt probe/rows-418.mjs probe/compare.py probe/compare-head-vs-sketch.txt r418-frozen-sha256.txt grants-418.txt current-task-before-418.md; do test -f "$B/$f" || echo "K12 MISSING $f"; done; echo "K12 artifacts checked"
echo "K13 archive-417 $(cmp -s "$LOOP/tasks/round-417.md" "$B/current-task-before-418.md" && echo identical || echo differs)"
python3 -I - "$LOOP" <<'PY'
import json, sys, os
loop = sys.argv[1]
b = json.load(open(loop + '/backlog.json'))
pool = {}
for key in ('open_findings', 'deferred_low_polish'):
    v = b.get(key, [])
    for f in (v if isinstance(v, list) else v.get('items', [])):
        if isinstance(f, dict) and 'id' in f:
            pool.setdefault(f['id'], f)
arch = loop + '/archive/findings-archived.json'
if os.path.exists(arch):
    a = json.load(open(arch))
    for f in (a if isinstance(a, list) else a.get('findings', a.get('items', []))):
        if isinstance(f, dict) and 'id' in f:
            pool.setdefault(f['id'], f)
ids = ['GATE393-L3-FALLBACK-REENTRY', 'A-R394-REVIEW-L3-REENTRANT-SYNC-THROW', 'A-R395-REVIEW-L1-SEEK-REENTRANT',
       'GATE395-L1-CURRENTTIME-READ', 'A-R392-REVIEW-L2-STALE-CALL-STOPS-PREVIEW', 'A-R392-REVIEW-L3-SUPERSESSION-BY-ID',
       'A-R393-REVIEW-L3-URL-SWITCH-ROWS', 'C-R417-L58-SKETCH-REVIEW-MISSING', 'A-R417-REVIEW-M1-BW5-READCOUNT-HOIST']
for i in ids:
    f = pool.get(i)
    print('K14', i, (str(f.get('severity')) + ' ' + str(f.get('status'))[:40] if f else 'NOT-FOUND'))
st = [t for t in b.get('systemic_tasks', []) if isinstance(t, dict) and t.get('id') == 'SYS-R416-PREVIEW-CONTROLLER']
print('K15 sys-preview', st[0].get('status')[:40] if st else 'NOT-FOUND', 'backlog-v', b.get('version'))
PY
echo "K16 browser-compare $(tail -1 "$B/probe/compare-head-vs-sketch.txt") cells $(grep -cE '^(EQUAL|DIFF) ' "$B/probe/compare-head-vs-sketch.txt")"
echo "K17 mutants $(wc -l < "$B/mutants/summary.txt") sketch-line $(grep -c '^SKETCH: red none' "$B/mutants/summary.txt")"
echo "K18 precheck full $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-full.log" | grep -E '^ +Tests ' | tr -s ' ') rc $(tail -1 "$B/precheck-full.log")"
echo "K19 l58 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md | tail -1)"
