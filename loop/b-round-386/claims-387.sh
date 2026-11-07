#!/usr/bin/env bash
# usage: bash b-round-386/claims-387.sh [store-root]   (run from the loop root; default store-root ../../store relative to this file)
HERE="$(cd "$(dirname "$0")" && pwd)"
S="${1:-$HERE/../../../store}"
S="$(cd "$S" && pwd)"
L="$HERE"
C=app/contexts/ArrangementContext.tsx
G=app/lib/arrangement/graph.client.ts
cd "$S" || exit 1
echo "K1 HEAD: $(git rev-parse --short HEAD)"
echo "K2 status lines: $(git status --short --untracked-files=all | wc -l)"
echo "K3 graph.client releaseNodes hits: $(grep -c 'releaseNodes' $G); 'master.connect(ctx.destination)' hits: $(grep -c 'master.connect(ctx.destination)' $G); 'throw error;' hits: $(grep -c 'throw error;' $G)"
echo "K4 provider direct 'startGraph(' call lines (excl. definition):"; grep -n '  startGraph(\| startGraph(arrangement' $C | grep -v 'const startGraph' | sed 's/^/   /'
echo "K5 startPlaybackAt order: isPlayingRef=true at $(grep -n 'isPlayingRef.current = true' $C | cut -d: -f1 | tr '\n' ' '); start call: $(grep -n 'createPlaybackAnchor(from, startAt)' $C | cut -d: -f1 | tr '\n' ' ')"
echo "K6 try blocks inside pumpPlaybackAudio: $(grep -n -A10 'const pumpPlaybackAudio = useCallback' $C | grep -c 'try {')"
echo "K7 scheduleFailed in strings.ts: $(grep -c 'scheduleFailed' app/lib/arrangement/strings.ts); in provider: $(grep -c 'studioPlaybackStrings.scheduleFailed' $C)"
echo "K8 AR/SF row ids in app: $(grep -rhoE "it\('(AR[1-5]|SF([1-9]|10)):" app | sort | tr '\n' ' ')"
echo "K9 resyncAfterDecode catch kept: $(grep -n -A12 'const resyncAfterDecode = useCallback' $C | grep -c 'catch {')"
echo "K10 doc 250 files: $(ls docs/implementation/2026/quarter-IV | grep -c '^250-')"
echo "K11 perf/e2e importers of graph.client/applySchedule: $(grep -rlE 'graph\.client|applySchedule' perf e2e 2>/dev/null | wc -l)"
echo "K12 app test files importing graph.client/applySchedule: $(grep -rlE 'graph\.client|applySchedule' app --include='*.test.*' | wc -l)"
echo "K13 sketch sha256: $(sha256sum "$L/sketch-387.patch.txt" | cut -c1-64)"
echo "K14 git apply --check: $(git apply --check "$L/sketch-387.patch.txt" >/dev/null 2>&1; echo rc $?); -R --check: $(git apply -R --check "$L/sketch-387.patch.txt" >/dev/null 2>&1; echo rc $?)"
echo "K15 protected manifest: $(sha256sum -c --quiet "$L/../b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo rc $?)"
echo "K16 frozen manifest ($(wc -l < "$L/r387-frozen-sha256.txt") entries): $(sha256sum -c --quiet "$L/r387-frozen-sha256.txt" >/dev/null 2>&1; echo rc $?)"
echo "K17 cited artifacts:"
for f in probe/m2-partial-start.mjs probe/m2-flow.mjs probe/export-compare.mjs probe/m2-head-1440.json probe/m2-head-1280.json probe/flow-head-1440.json probe/flow-head-1280.json probe/flow-sketch-1440.json probe/flow-sketch-1280.json probe/m1-sketch-1440.json probe/m1-sketch-1280.json probe/export-sha256.txt sketch-387-v1.patch.txt precheck-full.log covering-387.txt grants-387.txt sketch-review.md mutants/mutate.py mutants/run-mutants-387.sh sketch-files/$G sketch-files/$C sketch-files/app/lib/arrangement/__tests__/apply-schedule-rollback.test.ts sketch-files/app/lib/arrangement/__tests__/schedule-failure-ui.test.tsx; do test -f "$L/$f" && echo "   ok $f" || echo "   MISSING $f"; done
echo "K18 mutant logs (red rows | restored):"
for f in "$L"/mutants/mutant-*.log; do echo "   $(basename "$f"): $(grep -oE '× (AR|SF)[0-9]+' "$f" | sed 's/× //' | tr '\n' ' ')| $(grep -c restored "$f")"; done
echo "K19 HEAD browser pageerrors (m2-head-1440 play1): $(python3 -I -c "import json;d=json.load(open('$L/probe/m2-head-1440.json'));print(len(d['play1']['errors']), d['play1']['leaked'], d['afterSpace']['leaked'])")"
echo "K20 sketch full suite: $(grep -E 'Test Files|Tests ' "$L/precheck-full.log" | tr -s ' ' | tr '\n' ' ')"
echo "K21 export sha HEAD vs sketch equal: $(awk '{print $1}' "$L/probe/export-sha256.txt" | sort -u | wc -l) distinct"
echo "K22 status clobber premise (MU-387-STATUS-SYNC red rows): $(grep -oE '× SF[0-9]+' "$L/mutants/mutant-MU-387-STATUS-SYNC.log" | tr '\n' ' ')"
