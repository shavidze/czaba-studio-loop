#!/usr/bin/env bash
# B round 466 -> 467 claims. Usage: bash <abs>/b-round-466/claims-467.sh  (read-only; runs from anywhere)
set -u
L=/home/runner/czaba-project/tmp/studio-real-loop; S=/home/runner/czaba-project/store; B=$L/b-round-466
cd $S || exit 1
echo "K1 gate466: $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-466.json'));print(g['status'],'|',g['reason'])")"
echo "K2 HEAD: $(git rev-parse --short HEAD); status: $(git status --short --untracked-files=all | tr '\n' ';')"
echo "K3 r465 manifest FAILED: $(sha256sum -c $L/b-round-464/r465-tree-sha256.txt 2>/dev/null | grep -c FAILED) ($(sha256sum -c $L/b-round-464/r465-tree-sha256.txt 2>/dev/null | grep FAILED | cut -d: -f1 | tr '\n' ' ')); protected rc: $(sha256sum -c --quiet $L/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K4 466 post-image: $(sha256sum -c $L/b-round-465/sketch-466-files-sha256.txt 2>&1 | tr '\n' ' ')"
echo "K5 sketch-467 sha: $(sha256sum $B/sketch-467.patch.txt | cut -c1-16); pinned: $(cut -c1-16 $B/sketch-467.sha256); files: $(grep -c '^diff --git' $B/sketch-467.patch.txt); apply-check: $(git apply --check $B/sketch-467.patch.txt 2>&1 && echo ok)"
echo "K6 TS8 title now: $(grep -n "it('TS8" app/lib/__tests__/store-teal-sweep.test.ts)"
echo "K7 pre-check + countWhole: $(grep -n 'shadow/i.test(source)' app/lib/__tests__/helpers/style-scan.ts) | $(grep -n 'source.matchAll(new RegExp' app/lib/__tests__/helpers/style-scan.ts)"
echo "K8 artifacts: $(for f in sketch-467.patch.txt sketch-467.sha256 sketch-467-files-sha256.txt mutants/run-mutants.sh mutants/summary.txt build-compare.txt data/head-vs-sketch-counts.txt precheck-tw-doc-leak.txt precheck-covering-3x.txt precheck-typecheck.log precheck-lint.log precheck-delete-lines-vitest.log precheck-doc-rows.txt sketch-review.md; do test -f $B/$f && printf 'ok ' || printf "MISSING:$f "; done)"
echo "K9 mutants: $(wc -l < $B/mutants/summary.txt) lines, failed $(grep -c 'failed' $B/mutants/summary.txt); M14: $(grep M14 $B/mutants/summary.txt)"
echo "K10 build: $(tr '\n' ' ' < $B/build-compare.txt)"
echo "K11 corpus: $(head -2 $B/data/head-vs-sketch-counts.txt | tr '\n' ' '); cmp465: $(cmp -s $B/data/head-vs-sketch-counts.txt $L/b-round-465/data/head-vs-sketch-counts.txt && echo equal || echo differ)"
echo "K12 doc l4: 299=$(sed -n 4p docs/implementation/2026/quarter-IV/299-store-2b-3c-2-shared-rule-reader.md) | 304=$(sed -n 4p docs/implementation/2026/quarter-IV/304-store-2b-3c-2b-glow-scanner-forms.md)"
echo "K13 archive: $(cmp -s $L/tasks/round-466.md $B/current-task-before-467.md && echo equal || echo differ)"
echo "K14 regression-last: $(cat $L/regression-last.json | cut -c1-40)"
echo "K15 backlog: $(python3 -I -c "import json;b=json.load(open('$L/backlog.json'));print(b['version'],b['decisions_log_b'][-1]['id'])")"
echo "K16 doc leak: $(tail -1 $B/precheck-tw-doc-leak.txt)"
echo "K17 covering 3x: $(tr -s ' ' < $B/precheck-covering-3x.txt | tr '\n' ';')"
echo "K18 typecheck/biome: $(grep -c 'error' $B/precheck-typecheck.log) error lines; $(tail -1 $B/precheck-lint.log)"
echo "K19 importers: $(grep -rlE 'countZeroOffsetGlowHits' app perf --include=*.ts --include=*.tsx | sort | tr '\n' ' ')"
echo "K20 l58: $(cd $L && python3 -I tools/l58-check.py current-task.md | tail -1)"
