#!/usr/bin/env bash
# usage: [S=<store or scratch root>] bash claims-458.sh ; prints K1..K14, read-only
set -u
L=/home/runner/czaba-project/tmp/studio-real-loop
B=$L/b-round-457
S="${S:-/home/runner/czaba-project/store}"
cd "$S" || exit 2
SS=app/lib/__tests__/helpers/style-scan.ts
LT=app/lib/__tests__/store-live-teal.test.ts
echo "K1 head=$(git rev-parse --short HEAD) gate457=$(python3 -I -c "import json;print(json.load(open('$L/gates/gate-round-457.json'))['status'])") gate455commit=$(python3 -I -c "import json;print(json.load(open('$L/gates/gate-round-455.json'))['commit'][:7])")"
echo "K2 dirty=$(git status --short --untracked-files=all | wc -l)"
echo "K3 sibling_pairs=$(for f in $(find app -name '*.ts' -not -path '*/__tests__/*' | sed 's/\.ts$//'); do [ -f "$f/index.ts" ] && echo "$f"; done | tr '\n' ' ')"
echo "K4 forms: $(python3 -I $B/walker-forms.py "$S" | head -1)"
echo "K5 vite: $(grep -c "VITE './u'=file './u/'=file './u/index'=dir" $B/probe/vite-resolution.txt)"
echo "K6 resolve_fn=$(grep -c 'function resolveSpecifier(importer: string, specifier: string): string | null' $SS) files_fn=$(grep -cE '^function (scriptFileFor|scriptFilesFor)\(' $SS) form_type=$(grep -c "export type SpecifierForm = 'module' | 'directory' | 'index';" $SS) string_aware=$(grep -c 'function withoutCommentsOutsideStrings' $SS)"
echo "K7 lt9_q_row=$(grep -c ").toEqual(\['./q'\]);" $LT) lt10=$(grep -c "it('LT10:" $LT) lookahead_w=$(grep -c '(?!\[\\\\w-\])`' $LT) lookahead_alnum=$(grep -c '(?!\[A-Za-z0-9-\])`' $LT)"
echo "K8 expect live-teal=$(grep -o 'expect(' $LT | wc -l) glow=$(grep -o 'expect(' app/lib/__tests__/store-glow-shadow.test.ts | wc -l) gradient=$(grep -o 'expect(' app/lib/__tests__/store-gradient-text.test.ts | wc -l) sweep=$(grep -o 'expect(' app/lib/__tests__/store-teal-sweep.test.ts | wc -l)"
echo "K9 doc299_l4=$(sed -n 4p docs/implementation/2026/quarter-IV/299-store-2b-3c-2-shared-rule-reader.md 2>/dev/null) | doc298_l4=$(sed -n 4p docs/implementation/2026/quarter-IV/298-saba-b-14-store-seek-thumb.md) | doc299_only_adds=$(grep -c 'can only add matches\|მხოლოდ დამთხვევებს ამატებს' docs/implementation/2026/quarter-IV/299-store-2b-3c-2-shared-rule-reader.md 2>/dev/null)"
echo "K10 protected_untouched=$(git status --short -- 'app/routes/studio.$productId.tsx' app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/styles app/components app/root.tsx vitest.config.ts package.json | wc -l)"
echo "K11 delta_sha=$(cd $B && sha256sum -c sketch-458-delta.sha256 2>&1 | tr '\n' ' ') tree457_files=$(sha256sum -c $L/b-round-456/sketch-files-sha256.txt 2>/dev/null | grep -c ': OK$') sketch458_files=$(sha256sum -c $B/sketch-files-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K12 mutants_lines=$(wc -l < $B/mutants/mutants.txt) red=$(grep -c ' RED ' $B/mutants/mutants.txt) green=$(grep -c 'GREEN' $B/mutants/mutants.txt) reached_v3=$(grep -c '^R ' $B/probe/sweep-fix-v3.txt) same_as_v2=$(diff <(grep '^R ' $L/b-round-456/probe/sweep-fix-v2.txt) <(grep '^R ' $B/probe/sweep-fix-v3.txt) >/dev/null && echo yes || echo no)"
echo "K13 covering=$(grep -oE '[0-9]+ passed' $B/precheck-covering.log | tr '\n' ' ') full=$(grep -oE '[0-9]+ passed|^rc [0-9]+' $B/precheck-full.txt | tr '\n' ' ') lint=$(grep -oE 'Found [0-9]+ warnings' $B/precheck-lint.log) tsc=$(tail -1 $B/precheck-typecheck.log) biome=$(tail -1 $B/precheck-biome-scoped.log) apply=$(cat $B/apply-check.txt)"
M=0; for f in b-round-457/sketch-458-delta.patch.txt b-round-457/sketch-458-delta.sha256 b-round-457/sketch-files-sha256.txt b-round-457/sketch-review.md b-round-457/grants-458.txt b-round-457/covering-458.txt b-round-457/run-mutants.sh b-round-457/mutants/mutants.txt b-round-457/probe/sweep-fix-v3.txt b-round-457/probe/vite-resolution.txt b-round-457/probe/probe-457-on-sketch458.txt b-round-457/mutants/SUPERSEDED-mutants-single-arm-before-fixture.txt b-round-457/checkpoint-request-addendum.md b-round-457/walker-forms.py b-round-457/expect-counts.txt b-round-457/precheck-full.txt b-round-456/probe/zz-sweep-v2.test.ts a-round-457/zz-a457-probe.test.ts b-round-453/probe/c12-run/c12-from-c448.cjs b-round-448/probe/warm.cjs tools/l57-check.py; do [ -f "$L/$f" ] || { echo "MISSING $f"; M=$((M+1)); }; done
echo "K14 missing=$M"
