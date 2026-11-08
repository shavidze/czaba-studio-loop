#!/usr/bin/env bash
# B round 404 -> 405 claims (L29/L56). Run from anywhere: bash b-round-404/claims-405.sh
# Env ROOT = repository to check (default the real store); LOOP = loop folder.
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
ROOT=${ROOT:-/home/runner/czaba-project/store}
B=$LOOP/b-round-404
cd "$ROOT" || exit 2
T=app/lib/arrangement/__tests__
echo "K1 head $(git rev-parse HEAD)"
echo "K2 status-lines $(git status --short --untracked-files=all | wc -l)"
echo "K3 frozen-entries $(wc -l < $B/r405-frozen-sha256.txt) rc $(sha256sum -c --quiet $B/r405-frozen-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K4 protected rc $(sha256sum -c --quiet $LOOP/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?) granted-protected $(awk '{print $2}' $LOOP/b-round-318/protected-sha256.txt | grep -cxF -f $B/grants-405.txt)"
echo "K5 applies-on-tree $(git apply --check $B/sketch-405.patch.txt >/dev/null 2>&1 && echo yes || echo no)"
echo "K6 doc258-l4 $(sed -n 4p docs/implementation/2026/quarter-IV/258-sys-arrangement-actions-context.md)"
echo "K6b in-progress-stage-docs $(grep -rln 'In Progress (stage' docs/implementation | wc -l) pending-form $(grep -rn 'C round [0-9]* pending' docs/implementation | wc -l)"
echo "K7 old-name $(grep -c "'ArrangementMaster'" $T/master-ui.test.tsx $T/fader-pointer-preview.test.tsx | tr '\n' ' ')"
echo "K7b new-name $(grep -c "'ArrangementMasterViewInner'" $T/master-ui.test.tsx $T/fader-pointer-preview.test.tsx | tr '\n' ' ')"
echo "K8 SWEEP old-name-roots $(grep -rln "'ArrangementMaster'" app perf e2e 2>/dev/null | sort | tr '\n' ' ')"
echo "K9 master-ui-counts-clear $(grep -c 'renderLog.counts.clear();' $T/master-ui.test.tsx)"
echo "K10 gh5-group-ids $(grep -c 'groupHeaderIds' $T/selection-wrappers-render.test.tsx)"
echo "K11 library-param $(grep -A1 -n 'export function useArrangementLibraryActions' app/components/arrangement/ArrangementLibrary.tsx | tail -1 | sed 's/^[0-9]*-//')"
echo "K12 ac-rows $(grep -c "^  it('AC[0-9]" $T/actions-context.test.tsx) ac7 $(grep -c "it('AC7 " $T/actions-context.test.tsx)"
echo "K13 fp0 $(grep -c "it('FP0: " $T/fader-pointer-preview.test.tsx)"
echo "K14 master-view-inner $(grep -c '^function ArrangementMasterViewInner' app/components/arrangement/ArrangementMaster.tsx) memo $(grep -c 'memo(ArrangementMasterViewInner)' app/components/arrangement/ArrangementMaster.tsx)"
echo "K15 sketch-sha $(sha256sum < $B/sketch-405.patch.txt | cut -c1-16)"
for f in sketch-405.patch.txt grants-405.txt r405-frozen-sha256.txt mutants/run.py mutants/summary.txt precheck-full.log consult-tech-lead-stage2.md sketch-review.md current-task-before-405.md; do echo "K16 exists $f $(test -f $B/$f && echo 1 || echo 0)"; done
echo "K16b exists questions-unused-leaf-wrappers.md $(test -f $LOOP/user-review/questions-unused-leaf-wrappers.md && echo 1 || echo 0)"
echo "K17 mutants red $(grep -c ' RED rc' $B/mutants/summary.txt) survived $(grep -c 'SURVIVED' $B/mutants/summary.txt) site $(grep -c 'SITE-COUNT' $B/mutants/summary.txt) gap-green $(grep -c 'red \[\]$' $B/mutants/summary.txt)"
echo "K18 gate404 $(python3 -I -c "import json;d=json.load(open('$LOOP/gates/gate-round-404.json'));print(d['status'],d['commit'][:7])")"
echo "K19 regression-last $(python3 -I -c "import json;print(json.load(open('$LOOP/regression-last.json'))['date'])")"
echo "K20 archive-equal $(cmp -s $LOOP/tasks/round-404.md $B/current-task-before-405.md && echo 1 || echo 0)"
echo "K21 precheck-full $(grep -E 'Test Files|^\s*Tests' $B/precheck-full.log | sed 's/\x1b\[[0-9;]*m//g' | tr -s ' ' | tr '\n' ' ') $(grep -E '^rc ' $B/precheck-full.log)"
