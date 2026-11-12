#!/usr/bin/env bash
# Claims for round 461 (SABA-B-13 test hardening, A-R460-REVIEW-1/6/7). One line per claim. S defaults to the store tree.
S=${S:-/home/runner/czaba-project/store}; L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-460
T=app/lib/__tests__/store-entrance-loader.test.tsx
echo "K1 $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-460.json'));print(g['status'],g['commit'][:7])")"
echo "K2 base=$(git -C $S rev-parse --short=7 ffd0c7c) codeDiffVsBase=$(git -C $S diff --name-only ffd0c7c -- app/components app/root.tsx | wc -l)"
echo "K3 $(grep -c 'hydrateRoot' $S/$T) $(grep -c 'typeof window === .undefined.)' $S/app/components/loading/EntranceCover.tsx) $(grep -c "window.removeEventListener('\${ENTRANCE_TAKEOVER_EVENT}',off)" $S/app/components/loading/EntranceCover.tsx)"
echo "K4 $(grep -c 'trackBootCaptureListeners\|trackTakeoverListeners' $S/$T) $(grep -c "let notPrevented" $S/$T) $(grep -cF '<Links \/>\n' $S/$T)"
echo "K5 $(cd $B && sha256sum -c sketch-461.sha256 2>&1 | grep -c ': OK') review=$(grep -c "$(cut -c1-64 $B/sketch-461.sha256 | head -1)" $B/sketch-review.md 2>/dev/null)"
echo "K6 lines=$(wc -l < $B/mutants/mutants.txt) red=$(grep -c 'RED rc1' $B/mutants/mutants.txt) base=$(grep -c '^BASE.*GREEN' $B/mutants/mutants.txt) m5=$(grep '^M5' $B/mutants/mutants.txt | cut -f3,4)"
echo "K7 $(grep -E 'Tests ' $B/precheck-covering.log | tr -s ' ')|files=$(grep -E 'Test Files' $B/precheck-covering.log | tr -s ' ')|tsc=$(tail -1 $B/precheck-typecheck.log)|hydrNoise=$(grep -c 'Hydration failed' $B/precheck-covering-raw.log)"
echo "K8 $(cat $B/covering-461.txt | tr '\n' ' ')"
echo "K9 $(cd $L && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K10 $(for f in sketch-461.patch.txt sketch-461.sha256 sketch-461-files-sha256.txt sketch-461-delta-v1-v2.diff.txt sketch-461-delta-v2-v3.diff.txt v2-superseded/mutants-whole-v2/mutants.txt sketch-review.md mutants/mutants.py mutants/mutants.txt claims-461.sh covering-461.txt grants-461.txt precheck-covering.log precheck-covering-raw.log precheck-typecheck.log precheck-biome-file.log precheck-lint.txt apply-check.txt l29-planning.txt l58-check.txt claims-461-planning-output.txt claims-461-expected-after-A.txt; do test -f $B/$f && printf 'ok ' || printf "MISSING:$f "; done)"
echo "K11 $(test -f $L/b-round-459/probe/r1-repro.mjs && test -f $L/b-round-459/probe/frames.mjs && test -f $L/b-round-459/probe/serve-prod.sh && test -f $L/b-round-453/probe/c12-run/c12-from-c448.cjs && echo probes-ok)"
echo "K12 $(grep -c '^\*\*სტატუსი:\*\* Completed (C round 46[01] PASS)$' $S/docs/implementation/2026/quarter-IV/300-saba-b-13-store-entrance-cover.md)"
echo "K13 $(node -e "console.log(require('$S/node_modules/react-dom/package.json').version)")"
echo "K14 $(for f in c-round-460/r1-c.txt c-round-460/matrix/5191-1440-cpu1-fresh.json c-round-460/c15.json c-round-460/prot.mjs; do test -f $L/$f && printf 'ok ' || printf "MISSING:$f "; done)r1live=$(grep -c '"overlaySeen":true' $L/c-round-460/r1-c.txt)"
echo "K15 $(cat $B/precheck-lint.txt)"
echo "K16 $(cut -c1-40 $B/apply-check.txt)"
