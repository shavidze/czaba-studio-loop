#!/usr/bin/env bash
# Round 374 claims (L29 + L56). Run from the loop root: bash b-round-373/claims-374.sh
# STORE=<tree> runs the same commands on another tree. B's sketch output (claims-374-sketch-output.txt) came from
# STORE=b-round-373/scratch (cp -a of store/ at e69eba4 + sketch.patch.txt), removed after planning; recreate it with
# patch -p1 < b-round-373/sketch.patch.txt on a cp -a of store/ at e69eba4.
S=${STORE:-/home/runner/czaba-project/store}
B=b-round-373
C=$S/app/contexts/ArrangementContext.tsx
W=$S/app/components/arrangement/StudioWorkspace.tsx
M=$S/app/components/arrangement/ArrangementMaster.tsx
E=$S/app/components/arrangement/ArrangementExportDialog.tsx
T=$S/app/lib/arrangement/__tests__
echo "K1 gate373: $(python3 -I -c "import json;d=json.load(open('gates/gate-round-373.json'));print(d['status'],d['commit'][:7])")"
echo "K2 status-lines: $(git -C $S status --short --untracked-files=all 2>/dev/null | grep -v node_modules | wc -l)"
echo "K3 Master: wrapper 'export function ArrangementMaster()' $(grep -c '^export function ArrangementMaster() {$' $M) useArrangement() calls $(grep -c 'useArrangement()' $M) memo view $(grep -c '^export const ArrangementMasterView = memo(ArrangementMasterViewInner);$' $M) master read in render (master.mute/master.gainDb) $(grep -cE 'master\.(mute|gainDb)' $M)"
echo "K4 StudioWorkspace Master site: '<ArrangementMaster />' $(grep -c '<ArrangementMaster />' $W) '<ArrangementMasterView ' $(grep -c '<ArrangementMasterView ' $W)"
echo "K5 StudioWorkspace Export site: inline onClose $(grep -c 'onClose={() => setIsExportOpen(false)}' $W) closeExportDialog uses $(grep -c 'closeExportDialog' $W)"
echo "K6 ExportDialog: memo shell $(grep -c '^export const ArrangementExportDialog = memo(ArrangementExportDialogShell);$' $E) content fn $(grep -c '^function ArrangementExportDialogContent(' $E) exported fn form $(grep -c '^export function ArrangementExportDialog(' $E) useArrangement() calls $(grep -c 'useArrangement()' $E)"
echo "K7 Modal returns null when closed: $(grep -c 'if (!isOpen) return null;' $S/app/components/ui/Modal.tsx)"
echo "K8 context value master field: $(grep -c '^      master: arrangement.master,$' $C)"
echo "K9 hook error texts: literal single-quoted $(grep -cE "throw new Error\('use[A-Za-z]+ must be used within an ArrangementProvider'\)" $C) template \${hookName} $(grep -c '`${hookName} must be used within an ArrangementProvider`' $C) multi-line literal $(grep -cE "^      'use[A-Za-z]+ must be used within an ArrangementProvider',$" $C)"
echo "K10 SWEEP tests mounting the leaves (app/**/__tests__): '<ArrangementMaster />' files $(grep -rl '<ArrangementMaster />' $S/app --include=*.test.tsx | wc -l) '<ArrangementExportDialog' files $(grep -rl '<ArrangementExportDialog' $S/app --include=*.test.tsx | wc -l)"
echo "K11 setStatus non-refusal write line: $(grep -c '^      if (gestureRefusalPrefix(committed) === null) {$' $C)"
echo "K12 row ids: S5b-same-act $(grep -c "S5b-same-act" $T/pending-status.test.tsx) L8e $(grep -c "'L8e: " $T/context-hygiene.test.tsx) L8f $(grep -c "'L8f: " $T/context-hygiene.test.tsx) RB-LEAF1 $(grep -c "'RB-LEAF1 " $T/render-budget.test.tsx) RB-LEAF2 $(grep -c "'RB-LEAF2 " $T/render-budget.test.tsx)"
echo "K13 protected: $(cd $S && sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-318/protected-sha256.txt 2>&1 | wc -l) failing lines"
echo "K14 frozen: $(cd $S && sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/$B/r374-frozen-sha256.txt 2>&1 | wc -l) failing lines, entries $(wc -l < $B/r374-frozen-sha256.txt)"
echo "K15 sketch files sha: $(cd $S && sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/$B/sketch-files-sha256.txt 2>/dev/null | wc -l) failing lines (0 = the 7 files equal B sketch)"
echo "K16 doc 241 files: $(ls $S/docs/implementation/2026/quarter-IV/ | grep -c '^241-') doc238-l4: $(sed -n 4p $S/docs/implementation/2026/quarter-IV/238-perf-group-header-leaf.md)"
echo "K17 precheck-full (sketch): $(sed 's/\x1b\[[0-9;]*m//g' $B/precheck-full.log | grep -E '^ +(Test Files|Tests) ' | tr -s ' ' | tr '\n' ';')"
echo "K18 sketch typecheck/biome: $(tail -1 $B/sketch-typecheck.log) / $(tail -1 $B/sketch-biome.log)"
echo "K19 perf on sketch v1 (all specs): PASS $(grep -c ' PASS$' $B/perf-sketch.log) FAIL $(grep -c ' FAIL$' $B/perf-sketch.log) v2 interactions: PASS $(grep -c ' PASS$' $B/perf-sketch-v2.log) FAIL $(grep -c ' FAIL$' $B/perf-sketch-v2.log) v2 zoom.1 $(grep -E '^interact.zoom.1.components-per-key ' $B/perf-sketch-v2.log | tr -s ' ' | cut -d' ' -f4) zoom.1 $(grep -E '^interact.zoom.1.components-per-key ' $B/perf-sketch.log | tr -s ' ' | cut -d' ' -f4) zoom.30 $(grep -E '^interact.zoom.30.components-per-key ' $B/perf-sketch.log | tr -s ' ' | cut -d' ' -f4) start $(grep -E '^interact.play.start-components ' $B/perf-sketch.log | tr -s ' ' | cut -d' ' -f4) click $(grep -E '^interact.click.components ' $B/perf-sketch.log | tr -s ' ' | cut -d' ' -f4)"
echo "K20 patch sha: $(sha256sum $B/sketch.patch.txt | cut -c1-16) dispatched: $(cut -c1-16 $B/sketch-dispatched.sha256)"
echo "K21 mutants red: $(for m in MU-MASTER-NO-MEMO MU-MASTER-ACTIONS-FRESH MU-EXPORT-NO-SHELL MU-EXPORT-INLINE-ONCLOSE MU-HOOK-NAME-RANGE MU-NONREFUSAL-OUTSIDE-GESTURE-ONLY; do printf '%s=%s ' $m "$(sed 's/\x1b\[[0-9;]*m//g' $B/mutants/mutant-$m.log 2>/dev/null | grep -oE 'Tests +[0-9]+ failed' | grep -oE '[0-9]+' | head -1)"; done)"
echo "K22 expect/it counts: $(tr '\n' ';' < $B/expect-counts-374.txt)"
echo "K23 regression-last: $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])") lessons lines: $(wc -l < lessons.md)"
echo "K24 tasks/round-373.md sha256: $(sha256sum tasks/round-373.md | cut -c1-16)"
echo "K25 covering files: $(wc -l < $B/covering-374.txt)"
echo "K26 HEAD probe: zoom-in-key renders at 1440 $(python3 -I -c "import json;d=json.load(open('$B/probe/leaf-head.json'));s=d['1440x900']['steps']['zoom-in-key'];print('Master',s['ArrangementMaster'],'ExportDialog',s['ArrangementExportDialog'])")"
echo "K27 perf release components (sketch vs HEAD): $(grep -E '^interact.drag.move.stopped.release-commits ' $B/perf-sketch-vs-head.txt | cut -d' ' -f4-)"
for f in $B/sketch.patch.txt $B/sketch-dispatched.sha256 $B/sketch-files-sha256.txt $B/grants-374.txt $B/r374-frozen-sha256.txt $B/precheck-full.log $B/perf-sketch.log $B/perf-sketch-results/latest-interactions.json $B/perf-sketch-results/latest-resources.json $B/perf-sketch-vs-head.txt $B/mutants/run-mutant.sh $B/mutants/run-all-374.sh $B/covering-374.txt $B/expect-counts-374.txt $B/probe/leaf-probe.mjs $B/probe/leaf-head.json $B/probe/subtree-head.json $B/sketch-review.md $B/sketch-v1.patch.txt $B/sketch-v1-to-v2.interdiff.txt $B/perf-sketch-v2.log $B/consult-tech-lead.md $B/consult-perf.md $B/root-request-arch-checkpoint-leaf-plumbing.md $B/mutants/summary.txt $B/claims-374-output.txt $B/probe/lt12-probe-v2.mjs $B/probe/lt12-head-v2.json tasks/round-373.md; do echo "K28 exists $f: $(test -f $f && echo yes || echo MISSING)"; done
