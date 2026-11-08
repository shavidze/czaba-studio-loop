#!/usr/bin/env bash
# Round 417 claims. ROOT/LOOP may be overridden. Prints one line per claim.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-416
T=app/lib/arrangement/__tests__
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD)"
echo "K2 status $(git status --short --untracked-files=all | awk '{print $1}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')total $(git status --short --untracked-files=all | wc -l)"
echo "K2b status-outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-417.txt" | wc -l)"
sha256sum --quiet -c "$B/r417-frozen-sha256.txt" >/dev/null 2>&1; echo "K3 frozen $(wc -l < "$B/r417-frozen-sha256.txt") rc $?"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K4 protected rc $? granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-417.txt")"
if git apply --check "$B/sketch-417.patch.txt" 2>/dev/null; then echo "K5 sketch-applies yes"; else echo "K5 sketch-applies no"; fi
echo "K6 last-doc $(ls docs/implementation/2026/quarter-IV/ | sort | tail -1) doc268-l4 $(sed -n 4p docs/implementation/2026/quarter-IV/268-sys-clock-determinism.md 2>/dev/null || echo absent)"
echo "K7 gates $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-415.json'));b=json.load(open('$LOOP/gates/gate-round-416.json'));print('415',a['status'],a['commit'][:7],'416',b['status'],b['head'][:7])")"
echo "K8 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])")"
C=app/contexts/ArrangementContext.tsx
echo "K9 lookahead $(grep -c '^const PLAYBACK_LOOKAHEAD = 0.05;' $C) endstop $(grep -c 'if (!loopScheduleRef.current && current >= end) {' $C) pump $(grep -c 'window.setInterval(pumpPlaybackAudio, AUDIO_PUMP_INTERVAL_MS)' $C) dock-perf $(grep -c 'runPlayingStep(clock, performance.now());' app/components/arrangement/ArrangementVideoDock.tsx) helper-clock $(grep -c 'return Date.now() / 1000 - fakeClock.base;' $T/helpers/fake-web-audio.ts) env-helper-users $(grep -l createWorkspaceTestEnvironment $T/*.test.ts* | wc -l)"
echo "K10 rows EN10-window $(grep -c 'toBeLessThan(2.75)' $T/marker-edge-nav-ui.test.tsx) EN10-exact $(grep -c 'getLivePosition()).toBe(2.25)' $T/marker-edge-nav-ui.test.tsx) SF11-sleep150 $(grep -c 'setTimeout(resolve, 150)' $T/schedule-failure-ui.test.tsx) SF11-stub-assert $(grep -c 'window.setInterval(() => undefined, 1_000)).toBe(0)' $T/schedule-failure-ui.test.tsx) VDS3-fake $(grep -c "toFake: \['Date', 'performance'\]" $T/video-dock-strings-ui.test.tsx) IM24-tail16 $(grep -c 'toEqual(\[2, 6, 10, 16, 16\])' $T/insert-marker-ui.test.tsx) IM24-endstop $(grep -c 'toEqual(\[2, 6, 10, 16\])' $T/insert-marker-ui.test.tsx) BW5-elapsed $(grep -c 'expect(elapsed).toBeLessThan(100)' $T/tempo-window.test.ts) BW5-reads $(grep -c 'windowReads.count).toBeLessThanOrEqual(1_000)' $T/tempo-window.test.ts)"
echo "K11 sketch-sha $(sha256sum "$B/sketch-417.patch.txt" | cut -c1-16)"
for f in sketch-417.patch.txt sketch-417.sha256 make-sketch.py sketch-run.log precheck-typecheck.log precheck-lint.log mutants/run.py mutants/summary.txt mutants/reasons.txt probe/vds3-advance.md r417-frozen-sha256.txt grants-417.txt current-task-before-417.md; do test -f "$B/$f" || echo "K12 MISSING $f"; done; echo "K12 artifacts checked"
echo "K13 archive-416 $(cmp -s "$LOOP/tasks/round-416.md" "$B/current-task-before-417.md" && echo identical || echo differs)"
python3 -I - "$LOOP" <<'EOF'
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
ids = ['GATE148-S2-VDS3-WALLCLOCK', 'GATE77-S4-EN10-CLOCK', 'ROOT-R70-L4-BW5-WALLCLOCK', 'C-R326-01',
       'A-R388-REVIEW-L4-SF11-REAL-CLOCK', 'A-R415-REVIEW-L1-CALLSITE-FLAG', 'C-R416-CLAIMS-K22-ARCHIVE']
for i in ids:
    f = pool.get(i)
    print('K14', i, (str(f.get('status'))[:40] if f else 'NOT-FOUND'))
st = [t for t in b.get('systemic_tasks', []) if isinstance(t, dict) and t.get('id') == 'SYS-CLOCK-DETERMINISM']
print('K15 sys-clock', st[0].get('status')[:40] if st else 'NOT-FOUND', 'backlog-v', b.get('version'))
EOF
