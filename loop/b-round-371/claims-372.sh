#!/usr/bin/env bash
# Round 372 claims (L29 + L56). Run from the loop root: bash b-round-371/claims-372.sh
# STORE=<tree> runs the same commands on another tree (the sketch: STORE=/home/runner/b371-scratch).
S=${STORE:-/home/runner/czaba-project/store}
L=$(pwd)
T=$S/app/lib/arrangement/__tests__
G=b-round-371/grants-372.txt
echo "K1 gate371: $(python3 -I -c "import json;d=json.load(open('gates/gate-round-371.json'));print(d['status'],d['commit'][:7])")"
echo "K2 head: $(git -C $S rev-parse --short=7 HEAD 2>/dev/null) status-lines: $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 local status probes (files with 'api.current = useArrangement();' among the 16 granted tests): $(for f in $(grep '\.test\.tsx$' $G); do grep -l 'api.current = useArrangement();' $S/$f; done 2>/dev/null | wc -l)"
echo "K4 shared probe spreads useArrangement(): $(grep -c '\.\.\.useArrangement(),' $T/helpers/workspace-probe.ts) useWorkspaceStatusProbe exported: $(grep -c 'export function useWorkspaceStatusProbe' $T/helpers/workspace-probe.ts)"
echo "K5 files importing useWorkspaceProbe: $(grep -rl 'useWorkspaceProbe' $S/app --include='*.test.ts' --include='*.test.tsx' | wc -l) importing useWorkspaceStatusProbe: $(grep -rl 'useWorkspaceStatusProbe' $S/app --include='*.test.ts' --include='*.test.tsx' | wc -l)"
echo "K6 HEAD tsc with status fields removed (B, b-round-371/tsc-remove-status-files.txt): files $(wc -l < b-round-371/tsc-remove-status-files.txt) errors $(grep -c 'error TS' b-round-371/tsc-remove-status-fields.log)"
echo "K7 sketch tsc with status fields removed (B, b-round-371/tsc-sketch-removed-files.txt): $(tr -s ' ' < b-round-371/tsc-sketch-removed-files.txt | tr '\n' ';')"
echo "K8 app readers of status off the value (StudioWorkspace destructure + current.status, MarkerRow destructure): SW $(grep -cE '^    status(Key)?,$|current\.status\b' $S/app/components/arrangement/StudioWorkspace.tsx) MR $(grep -cE '^    status,$' $S/app/components/arrangement/ArrangementMarkerRow.tsx)"
echo "K9 status reducer + value fields in ArrangementContext.tsx: interface $(grep -cE '^  (status|statusSequence|statusKey): (string|number);$' $S/app/contexts/ArrangementContext.tsx) value-lines $(grep -cE '^      (status|statusSequence|statusKey),$' $S/app/contexts/ArrangementContext.tsx)"
echo "K10 protected: $(cd $S && sha256sum -c --quiet $L/b-round-318/protected-sha256.txt 2>&1 | wc -l) failing lines"
echo "K11 doc 239 free: $(ls $S/docs/implementation/2026/quarter-IV/ | grep -c '^239-') last: $(ls $S/docs/implementation/2026/quarter-IV/ | sort | tail -1)"
echo "K12 frozen: $(cd $S && sha256sum -c --quiet $L/b-round-371/r372-frozen-sha256.txt 2>&1 | wc -l) failing lines, entries $(wc -l < b-round-371/r372-frozen-sha256.txt)"
echo "K13 sketch files sha: $(cd $S && sha256sum -c --quiet $L/b-round-371/sketch-files-sha256.txt 2>/dev/null | wc -l) failing lines (0 = the 17 files equal B sketch)"
echo "K14 expect()/it() counts HEAD->sketch unchanged: $(awk '{split($3,a,"->"); split($5,b,"->"); if (a[1]!=a[2] || b[1]!=b[2]) bad++} END {print bad+0}' b-round-371/expect-counts.txt) differing files of $(wc -l < b-round-371/expect-counts.txt)"
echo "K15 precheck-full (sketch): $(sed 's/\x1b\[[0-9;]*m//g' b-round-371/precheck-full.log | grep -E '^ +(Test Files|Tests) ' | tr -s ' ' | tr '\n' ';') $(tail -1 b-round-371/precheck-full.log)"
echo "K16 sketch typecheck/biome: $(tail -1 b-round-371/sketch-typecheck.log) / $(tail -1 b-round-371/sketch-biome.log)"
for f in b-round-371/sketch.patch.txt b-round-371/sketch-dispatched.sha256 b-round-371/sketch-files-sha256.txt b-round-371/sketch-migrate.py b-round-371/remove-status-fields.py b-round-371/grants-372.txt b-round-371/r372-frozen-sha256.txt b-round-371/expect-counts.txt b-round-371/precheck-full.log b-round-371/tsc-remove-status-fields.log b-round-371/tsc-remove-status-files.txt b-round-371/tsc-sketch-removed-files.txt b-round-371/sketch-review.md b-round-371/migrated-pass.txt b-round-371/covering-372.txt b-round-371/slowest-17.txt b-round-371/mutants-MU-HELPER-EMPTY-STATUS.log b-round-371/mutant-MU-REVERT-ONE-PROBE-files.txt b-round-371/claims-372-output.txt b-round-371/claims-372-sketch-output.txt b-round-371/root-request-arch-checkpoint-status-store.md b-round-371/sketch-typecheck.log b-round-371/sketch-biome.log b-round-371/tsc-sketch-removed.log tasks/round-371.md; do echo "K17 exists $f: $(test -f $f && echo yes || echo MISSING)"; done
echo "K18 sketch patch sha: $(sha256sum b-round-371/sketch.patch.txt | cut -c1-16) dispatched: $(cut -c1-16 b-round-371/sketch-dispatched.sha256)"
echo "K19 lessons lines: $(wc -l < lessons.md)"
echo "K20 regression-last: $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K21 tasks/round-371.md sha256: $(sha256sum tasks/round-371.md | cut -c1-16)"
echo "K22 l57 c-round-371: $(python3 -I tools/l57-check.py c-round-371.json /tmp/l57-371-claims.txt >/dev/null 2>&1; echo rc $?)"
echo "K23 RS4 render-count row: $(grep -c "RS4: during a pointer gesture setTimeRange does not re-render useArrangement() consumers" $T/range-store.test.tsx)"
echo "K24 timeout: slowest test in the 17 sketch files (precheck-full): $(sed 's/\x1b\[[0-9;]*m//g' b-round-371/slowest-17.txt 2>/dev/null | head -1)"
