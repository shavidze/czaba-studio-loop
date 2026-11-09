#!/usr/bin/env bash
# Round 419 claims (SYS-R369-STEM-CACHE-WRITE-COORDINATOR). ROOT/LOOP may be overridden. Prints one line per claim.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-418
S=app/lib/arrangement/stem-cache.client.ts
T=app/lib/arrangement/__tests__/stem-cache.test.ts
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD)"
echo "K2 status $(git status --short --untracked-files=all | awk '{print $1}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')total $(git status --short --untracked-files=all | wc -l)"
echo "K2b status-outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-419.txt" | wc -l)"
sha256sum --quiet -c "$B/r419-frozen-sha256.txt" >/dev/null 2>&1; echo "K3 frozen $(wc -l < "$B/r419-frozen-sha256.txt") rc $?"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K4 protected rc $? granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-419.txt")"
if git apply --check "$B/sketch-419.patch.txt" 2>/dev/null; then echo "K5 sketch-applies yes"; else echo "K5 sketch-applies no"; fi
echo "K6 last-doc $(ls docs/implementation/2026/quarter-IV/ | sort | tail -1) doc270-l4 $(sed -n 4p docs/implementation/2026/quarter-IV/270-sys-stem-cache-write-coordinator.md 2>/dev/null || echo absent)"
echo "K7 gate418 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-418.json'));print(a['status'],a['commit'][:7])")"
echo "K8 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])")"
echo "K9 head-code writes-map $(grep -c 'const writes = new Map<string, PendingStemWrite>();' $S) deletes-set $(grep -c 'const deletes = new Set<Promise<void>>();' $S) integrity-remove-key $(grep -cx '        await remove(key);' $S) victim-loop-unchecked $(grep -A1 -x '    for (const victim of victims) {' $S | grep -cx '      await activeStore.delete(victim.key);') name-no-counter $(grep -cF 'fileName: `${at.toString(36)}-${Math.random()' $S) x-injected $(grep -c "x-injected')).toBeNull()" $T) rows-SC $(grep -cE "^  it\('SC[0-9]+ " $T) demo-import $(grep -c 'publicPreviewSourceFetch' app/data/studio-lab-demo.ts)"
echo "K10 sketch-code operations $(grep -c 'operations' $S) removeIfCurrent $(grep -c 'removeIfCurrent' $S) invalid-state $(grep -c "'InvalidStateError'" $S) fileCount $(grep -c 'fileCount' $S) open-flag $(grep -c 'pending.open' $S) keys-empty $(grep -cF 'expect([...served.headers.keys()]).toEqual([]);' $T) holdNextGetFile $(grep -c 'holdNextGetFile' $T)"
echo "K11 sketch-sha $(sha256sum "$B/sketch-419.patch.txt" | cut -c1-16)"
for f in sketch-419.patch.txt sketch-419.sha256 make-sketch-src.py make-sketch-test.py sketch-review.md precheck-full.log precheck-typecheck.log precheck-lint.log precheck-biome2.log precheck-a2.log precheck-loaded.log mutants/run.py mutants/summary.txt probe/stem-integrity-probe.mjs probe/summarize.py probe/compare.py probe/run-probe.sh probe/out/head/1440x900.json probe/out/head/1280x720.json probe/out/sketch/1440x900.json probe/out/sketch/1280x720.json probe/compare-head-vs-sketch.txt precheck-testdiff.txt r419-frozen-sha256.txt grants-419.txt current-task-before-419.md; do test -f "$B/$f" || echo "K12 MISSING $f"; done; echo "K12 artifacts checked"
echo "K13 archive-418 $(cmp -s "$LOOP/tasks/round-418.md" "$B/current-task-before-419.md" && echo identical || echo differs)"
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
ids = ['A-R368-REVIEW-L1', 'B-R367-TL3-1-JOIN-MICROTASK-GAP', 'A-R367-REVIEW-L-c', 'A-R367-REVIEW-L-d', 'A-R367-REVIEW-L-e',
       'GATE368-L1-REMOVEFILE-SAME-NAME', 'A-R368-REVIEW-L3', 'A-R367-REVIEW-L-g', 'GATE368-L3-QUEUED-BUFFER-RETENTION']
for i in ids:
    f = pool.get(i)
    print('K14', i, (str(f.get('severity')) + ' ' + str(f.get('status'))[:40] if f else 'NOT-FOUND'))
st = [t for t in b.get('systemic_tasks', []) if isinstance(t, dict) and t.get('id') == 'SYS-R369-STEM-CACHE-WRITE-COORDINATOR']
print('K15 sys-r369', st[0].get('status')[:40] if st else 'NOT-FOUND', 'backlog-v', b.get('version'))
PY
echo "K16 browser-compare $(tail -1 "$B/probe/compare-head-vs-sketch.txt") rows $(grep -cE '^(EQUAL|DIFF) ' "$B/probe/compare-head-vs-sketch.txt")"
echo "K17 mutants $(wc -l < "$B/mutants/summary.txt") sketch-line $(grep -c '^SKETCH: red none' "$B/mutants/summary.txt")"
echo "K18 precheck full $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-full.log" | grep -E '^ +Tests ' | tr -s ' ') rc $(tail -1 "$B/precheck-full.log")"
echo "K19 l58 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md | tail -1)"
