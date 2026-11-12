#!/usr/bin/env bash
# Usage (from the loop root): [S=<store root>] bash b-round-465/claims-466.sh
# Prints one line per [K#] claim of current-task.md (round 466). Default S = the real store.
set -u
L=$(pwd); S=${S:-/home/runner/czaba-project/store}
H=$S/app/lib/__tests__/helpers/style-scan.ts; T=$S/app/lib/__tests__/store-teal-sweep.test.ts; B=b-round-465
D304=docs/implementation/2026/quarter-IV/304-store-2b-3c-2b-glow-scanner-forms.md
echo "K1 gate465=$(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-465.json'));print(g['status'],g['head'][:7])") gate464=$(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-464.json'));print(g['status'],g.get('commit','')[:7])")"
echo "K2 storeHead=$(git -C "$S" rev-parse --short=7 HEAD) statusLines=$(git -C "$S" status --short --untracked-files=all | wc -l)"
echo "K3 manifestEntries=$(wc -l < $L/b-round-464/r465-tree-sha256.txt) manifestRc=$(cd "$S" && sha256sum -c --quiet $L/b-round-464/r465-tree-sha256.txt >/dev/null 2>&1; echo $?) protectedRc=$(cd "$S" && sha256sum -c --quiet $L/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K4 headGlowBlur=$(grep -c 'const GLOW_BLUR = /(?:\[1-9\]|0?\\\.\\d\*\[1-9\]|var\\(|\\\$\\{)/.source;' "$H") headZeroLength=$(grep -c 'ZERO_LENGTH' "$H") headPrecheck=$(grep -c '/shadow/i' "$H") zeroPxForms=$(grep -c '0(?:px)?' "$H")"
echo "K5 importers=$(grep -rl 'countZeroOffsetGlowHits' "$S/app" "$S/perf" | sed "s#^$S/##" | sort | tr '\n' ' ')"
echo "K6 tsRows=$(grep -oE "it\('TS[0-9]+" "$T" | sed "s/it('//" | tr '\n' ' ')"
echo "K7 doc304=$(test -f "$S/$D304" && echo present || echo absent) lastDoc=$(ls "$S/docs/implementation/2026/quarter-IV/" | sort | tail -1)"
echo "K8 sketchApplies=$(git -C "$S" apply --check "$L/$B/sketch-466.patch.txt" 2>&1 && echo yes || echo no) sketchSha=$(sha256sum "$L/$B/sketch-466.patch.txt" | cut -c1-16) files=$(grep -c '^diff --git' "$L/$B/sketch-466.patch.txt")"
n=0; for f in sketch-466.patch.txt sketch-466.sha256 sketch-review.md mutants/run-mutants.sh mutants/summary.txt probe/glow-computed.mjs probe/glow-computed.json data/head-vs-sketch-counts.txt compare.test.ts.txt precheck-full.log precheck-full-raw.log precheck-typecheck.log precheck-lint.log build-compare.sh build-compare.txt build-compare-with-doc.txt doc-304-placeholder.md.txt update-backlog-466.py sketch-466-files-sha256.txt claims-466-planning-output.txt claims-466-planning.err claims-466-expected-after-A.txt data/head-fixture-leak.txt l29-planning.txt current-task-before-466.md feature-status-before-466.md; do test -f "$L/$B/$f" && n=$((n+1)) || echo "MISSING $B/$f"; done
echo "K9 artifacts=$n/26 twDocLeak=$(test -f $L/a-round-463/tw-doc-leak.mjs && echo present || echo MISSING) mutantLogs=$(ls $L/$B/mutants/mutant-*.log 2>/dev/null | wc -l)"
echo "K10 mutantsRed=$(grep -c ':: Tests [0-9]* failed' $L/$B/mutants/summary.txt)/$(wc -l < $L/$B/mutants/summary.txt)"
echo "K11 probe=$(grep -o '"allOk": [a-z]*' $L/$B/probe/glow-computed.json) rows=$(grep -c '"id"' $L/$B/probe/glow-computed.json)"
echo "K12 corpus=$(head -2 $L/$B/data/head-vs-sketch-counts.txt | tr '\n' ' ') differingFile=$(awk -F'\t' 'NR>2 && $2!=$3 {print $1}' $L/$B/data/head-vs-sketch-counts.txt)"
echo "K13 sketchSuite=$(grep -E 'Tests ' $L/$B/precheck-full.log | tr -s ' ') gate464Suite=$(sed 's/\x1b\[[0-9;]*m//g' $L/gates/round-464/verify.log | grep -E '^ *Tests ' | tr -s ' ')"
echo "K14 build=$(sed -n 2p $L/$B/build-compare.txt) withDoc=$(sed -n 2p $L/$B/build-compare-with-doc.txt)"
echo "K15 headFixtureLeak=$(ls $S/build/client/assets/app-*.css >/dev/null 2>&1 && echo 'store build present (ignore)' || echo 'see b-round-465/data/head-fixture-leak.txt') $(head -1 $L/$B/data/head-fixture-leak.txt 2>/dev/null)"
echo "K16 backlog=$(python3 -I -c "import json;b=json.load(open('$L/backlog.json'));print(b['version'],b['decisions_log_b'][-1]['id'])")"
echo "K17 ids: $(python3 -I tools/find-ids.py . A-R451-REVIEW-L2-ZERO-OFFSET-UNITS INFO-TL-R451-GLOW-CALC GATE452-L1-GLOW-REGEX-WHOLE-SOURCE B-R465-TEST-FIXTURE-CSS-LEAK | cut -c1-90 | tr '\n' ';')"
echo "K18 archivedTask=$(cmp -s tasks/round-465.md $B/current-task-before-466.md && echo equal || echo differ) regression=$(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K19 l58=$(python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K20 timeouts teal-sweep=$(sed 's/\x1b\[[0-9;]*m//g' $L/gates/round-464/verify.log | grep -oE 'store-teal-sweep.test.ts \([0-9]+ tests\) [0-9]+ms') live-teal=$(sed 's/\x1b\[[0-9;]*m//g' $L/gates/round-464/verify.log | grep -oE 'store-live-teal.test.ts \([0-9]+ tests\) [0-9]+ms')"
echo "K21 testFixtureSweep=$(grep -rlE "shadow-\[0rem|text-shadow:0em|0rem_2px" "$S/app" "$S/perf" "$S/docs" 2>/dev/null | wc -l)"
echo "K22 doc299line4=$(sed -n 4p "$S/docs/implementation/2026/quarter-IV/299-store-2b-3c-2-shared-rule-reader.md") inProgressHits=$(grep -rn 'In Progress (stage' "$S/docs/implementation" | wc -l)"
echo "K23 storeCorpus=$(cd "$S" && find app perf -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.css' -o -name '*.mjs' -o -name '*.js' \) | wc -l)"
