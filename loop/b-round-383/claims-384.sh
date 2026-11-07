#!/usr/bin/env bash
# Round 384 claims. Run from the loop root: bash b-round-383/claims-384.sh
L=/home/runner/czaba-project/tmp/studio-real-loop; S=/home/runner/czaba-project/store; cd "$S" || exit 1
AC=app/contexts/ArrangementContext.tsx
DOC=docs/implementation/2026/quarter-IV/248-perf-decoded-buffer-cache.md
k() { echo "== $1"; }
k K1-gate383; python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-383.json'));print(g['status'],g.get('reason'))"; git rev-parse --short HEAD
k K2-status; git status --short --untracked-files=all | wc -l; git status --short --untracked-files=all
k K3-helper; grep -n "const storeSourcePeaks = useCallback\|setSourcePeaks((previous)" $AC || echo MISSING
k K4-helper-callers; grep -n "storeSourcePeaks(source.id, peaks)\|storeSourcePeaks(sourceId, peaks)" $AC || echo MISSING
k K5-reset; grep -n "decodedBuffers.deleteMany(collectionSourceIds)" $AC || echo MISSING; echo "clear-calls:"; grep -c "decodedBuffers.clear(" $AC
k K6-rows; grep -c "it('DC8" app/lib/arrangement/__tests__/decoded-buffer-cache.test.ts; grep -c "it('EV10" app/lib/arrangement/__tests__/decoded-buffer-eviction-ui.test.tsx
k K7-doc-l4; sed -n 4p $DOC
k K8-token-route-order; grep -n "status: 400\|status: 401" app/routes/api.studio-token.ts || echo MISSING
k K9-c383-auth-400; python3 -I -c "
import json
for f in ['c-round-382/auth.json','c-round-383/auth.json']:
  d=json.load(open('$L/'+f)); print(f, [x['api']['status'] for x in d])"; grep -n "studio-token" "$L/c-round-382/auth.mjs" "$L/c-round-383/auth.mjs"; grep -c "no-token 401 verified" "$L/c-round-382.json"
k K10-c383-evidence; for f in heap-dev-1.json heap-dev-2.json heap-mutant-2.json b2.json exp383.json auth.json unit.log heap-retainers.mjs; do [ -f "$L/c-round-383/$f" ] && echo "ok $f" || echo "MISSING $f"; done
k K11-c383-no-progress-l57; for f in progress.json l57-check.txt; do [ -f "$L/c-round-383/$f" ] && echo "present $f" || echo "absent $f"; done; python3 -I -c "
import json;d=json.load(open('$L/c-round-383.json'));print('l57 fields present:', [x for x in ['manifestPaths','missingPaths','countMismatches','claimCheckMinutes','mutantRedOnSketch'] if x in d])"
k K12-c383-b2; python3 -I -c "import json;print(json.dumps(json.load(open('$L/c-round-383/b2.json')))[:600])"
k K13-a383-evidence; for f in heap-self.json sweep-grep.txt covering-hits.txt mutants/run-mutants-383.sh mutants/unit-run.txt; do [ -f "$L/a-round-383/$f" ] && echo "ok $f" || echo "MISSING $f"; done; wc -l < "$L/a-round-383/covering-hits.txt"
k K14-tools; for f in b-round-334/vitest.perf-lib.config.mjs b-round-382/probe/heap-retainers.mjs tools/l57-check.py b-round-381/fixture-grants-382.txt a-round-383/cdemo-sha-before.txt; do [ -f "$L/$f" ] && echo "ok $f" || echo "MISSING $f"; done
k K15-protected; sha256sum -c --quiet "$L/b-round-318/protected-sha256.txt" && echo rc0
k K16-frozen-r384; wc -l < "$L/b-round-383/r384-frozen-sha256.txt"; sha256sum -c --quiet "$L/b-round-383/r384-frozen-sha256.txt" && echo rc0; cat "$L/b-round-383/grants-384.txt"
k K17-frozen-r383-still; sha256sum -c --quiet "$L/b-round-382/r383-frozen-sha256.txt" && echo rc0
k K18-regression-lessons; python3 -I -c "import json;print(json.load(open('$L/regression-last.json'))['date'])"; wc -l < "$L/lessons.md"
k K19-retro-last; python3 -I -c "import json;b=json.load(open('$L/backlog.json'));r=b['retro_runs'][-1];print(r['round'],r['window'])"
k K20-library-stop; grep -n "previewPlay\|previewStop" app/lib/arrangement/strings.ts
