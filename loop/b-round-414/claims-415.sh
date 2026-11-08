#!/usr/bin/env bash
# Round 415 claims. ROOT/LOOP may be overridden. Prints one line per claim.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-414
T=app/lib/arrangement/__tests__
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD)"
echo "K2 status $(git status --short --untracked-files=all | awk '{print $1}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')total $(git status --short --untracked-files=all | wc -l)"
echo "K2b status-outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f <(sed 's/^ *//' "$B/grants-415.txt") | wc -l)"
sha256sum --quiet -c "$B/r415-frozen-sha256.txt" >/dev/null 2>&1; echo "K3 frozen $(wc -l < "$B/r415-frozen-sha256.txt") rc $?"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K4 protected rc $? granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f <(sed 's/^ *//' "$B/grants-415.txt"))"
if git apply --check "$B/sketch-415.patch.txt" 2>/dev/null; then echo "K5 sketch-applies yes"; else echo "K5 sketch-applies no"; fi
echo "K6 last-doc $(ls docs/implementation/2026/quarter-IV/ | sort | tail -1) doc267-l4 $(sed -n 4p docs/implementation/2026/quarter-IV/267-sys-fake-web-audio-helper.md 2>/dev/null || echo absent)"
if [ -f $T/helpers/fake-web-audio.ts ]; then python3 -I "$B/it-bodies.py" "$ROOT" WORKTREE | diff - "$B/it-bodies-head.txt" >/dev/null && echo "K7 it-bodies-equal-head yes" || echo "K7 it-bodies-equal-head no"; else echo "K7 it-bodies-equal-head (helper absent; HEAD) $(python3 -I "$B/it-bodies.py" "$ROOT" WORKTREE | diff - "$B/it-bodies-head.txt" >/dev/null && echo yes || echo no)"; fi
echo "K8 vitest-include $(grep -o "include: \[[^]]*\]" vitest.config.ts)"
echo "K9 metering-detect $(grep -c "typeof ctx.createAnalyser !== 'function' || typeof ctx.createChannelSplitter !== 'function'" app/contexts/ArrangementContext.tsx) pump-interval $(grep -c 'window.setInterval(pumpPlaybackAudio, AUDIO_PUMP_INTERVAL_MS)' app/contexts/ArrangementContext.tsx) optional-ramps $(grep -c 'setValueAtTime?.(\|linearRampToValueAtTime?.(' app/lib/arrangement/graph.client.ts)"
echo "K10 fake-copies $(grep -lE '^class FakeAudioContext|^class MeteredAudioContext|^class MeteredFailureAudioContext' $T/schedule-failure-ui.test.tsx $T/master-hold-tick.test.tsx $T/decoded-buffer-eviction-ui.test.tsx 2>/dev/null | wc -l) helper-users $(grep -l "helpers/fake-web-audio" $T/*.test.ts* 2>/dev/null | wc -l) workspace-env-users $(grep -l createWorkspaceTestEnvironment $T/*.test.ts* | wc -l)"
echo "K11 gate414 $(python3 -I -c "import json;d=json.load(open('$LOOP/gates/gate-round-414.json'));print(d['status'],d['commit'][:7])")"
echo "K12 sketch-sha $(sha256sum "$B/sketch-415.patch.txt" | cut -c1-16)"
echo "K13 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])")"
for f in sketch-415.patch.txt fake-web-audio.ts.txt it-bodies.py it-bodies-head.txt mutants/run.py mutants/summary.txt r415-frozen-sha256.txt grants-415.txt make-sketch.py; do test -f "$B/$f" || echo "K14 MISSING $f"; done; echo "K14 artifacts checked"
echo "K15 archive-414 $(cmp -s "$LOOP/tasks/round-414.md" "$B/current-task-before-415.md" && echo identical || echo differs)"
