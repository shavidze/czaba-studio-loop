#!/usr/bin/env bash
# B round 450 -> 451 claims (SYS-R450-STORE-STYLE-SCAN). Each line: K#<TAB>value.
# STORE_ROOT defaults to the store; B's sketch output: STORE_ROOT=/tmp/b451-scratch.
S=${STORE_ROOT:-/home/runner/czaba-project/store}; L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-450
cd "$S" || exit 2
echo -e "K1\tgate449-commit $(python3 -I -c "import json;print(json.load(open('$L/gates/gate-round-449.json'))['commit'][:7])") gate450-status $(python3 -I -c "import json;print(json.load(open('$L/gates/gate-round-450.json'))['status'])")"
echo -e "K2\thead $(git rev-parse --short=7 HEAD)"
echo -e "K3\tmanifest-lines $(wc -l < $B/r451-tree-sha256.txt) manifest-rc $(sha256sum -c --quiet $B/r451-tree-sha256.txt >/dev/null 2>&1; echo $?) protected-rc $(sha256sum -c --quiet $L/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?)"
echo -e "K4\tdirty-outside-grants $(git status --porcelain --untracked-files=all | awk '{print $2}' | grep -vxF -f $B/grants-451.txt | wc -l)"
echo -e "K5\tcss-files $(find app -name '*.css' | sort | tr '\n' ' ')"
CLIP='background-clip *:[^;}]*text|text-fill-color'
for f in app/styles/app.css app/styles/base/utilities.css app/styles/studio.css app/styles/pages/studio.css app/assets/fonts/fonts.css; do echo -e "K6\tcss-clip-lines $f $(grep -ciE "$CLIP" $f)"; done
echo -e "K7\ttsx-clip-lines $(grep -rnE 'bg-clip-text|\[(-webkit-)?background-clip:text\]|WebkitBackgroundClip|backgroundClip|WebkitTextFillColor' app perf --include=*.ts --include=*.tsx | grep -v __tests__ | cut -d: -f1,2 | tr '\n' ' ')"
echo -e "K8\tcinema-refs $(grep -rlw CinemaCurtainLoader app perf --include=*.ts --include=*.tsx | grep -v __tests__ | sort | tr '\n' ' ')"
echo -e "K9\tzero-offset-glow-candidates $(grep -rnE 'shadow-\[0_0_|drop-shadow\(0 0|boxShadow|box-shadow: *0 0 ' app perf --include=*.ts --include=*.tsx | grep -v __tests__ | cut -d: -f1,2 | tr '\n' ' ')"
echo -e "K10\tnm2-glow-var $(grep -c 'const glow = heading' app/lib/__tests__/studio-naming.test.tsx) header-footer-text-glow-asserts $(grep -c 'text-glow' app/lib/__tests__/store-header-footer.test.tsx)"
echo -e "K11\thelper-exists $(test -f app/lib/__tests__/helpers/style-scan.ts && echo present || echo absent) style-scan-importers $(grep -rl 'helpers/style-scan' app perf 2>/dev/null | sort | tr '\n' ' ')"
echo -e "K12\trows $(grep -ohE "it\('(GT|TS)[0-9]+b?" app/lib/__tests__/store-gradient-text.test.ts app/lib/__tests__/store-teal-sweep.test.ts | sed "s/it('//" | tr '\n' ' ')"
echo -e "K13\tsketch-sha256 $(sha256sum $B/sketch-451.patch.txt | cut -c1-16) review-names-sha $(grep -c "$(sha256sum $B/sketch-451.patch.txt | cut -d' ' -f1)" $B/sketch-review.md 2>/dev/null || echo absent)"
echo -e "K14\tmutants-sketch $(tr '\n' ';' < $B/mutants.txt)"
echo -e "K15\tmutants-head $(grep -E '^(BASE|N)' $B/head-mutants/mutants.txt | tr '\n' ';')"
echo -e "K16\tgolden equal=$(python3 -I -c "import json;d=json.load(open('$B/golden/golden-sketch.json'));print(d['equal'],d['sizes'])")"
echo -e "K17\tgolden-extra $(python3 -I -c "import json;d=json.load(open('$B/golden/golden-sketch.json'));print(json.dumps(d['extra'],separators=(',',':')))")"
echo -e "K18\tprecheck typecheck-$(tail -1 $B/precheck-typecheck.log) lint-$(tail -1 $B/precheck-lint.log) lint-warnings $(grep -oE 'Found [0-9]+ warnings' $B/precheck-lint.log)"
echo -e "K19\tprecheck-full $(tr -s ' ' < $B/precheck-full.log | tr '\n' ' ')"
echo -e "K20\tgate449-covering $(sed 's/\x1b\[[0-9;]*m//g' $L/gates/round-449/verify.log | grep -aE '✓ app/lib/__tests__/(store-teal-sweep|store-gradient-text|studio-naming)' | tr -s ' ' | tr '\n' ';') gate449-totals $(sed 's/\x1b\[[0-9;]*m//g' $L/gates/round-449/verify.log | grep -aE '^ +(Test Files|Tests) ' | tr -s ' ' | tr '\n' ' ')"
echo -e "K21\tdoc-next $(ls docs/implementation/2026/quarter-IV | grep -c '^295-') last $(ls docs/implementation/2026/quarter-IV | sort | tail -1)"
echo -e "K22\tin-progress-stage-docs $(grep -rln 'In Progress (stage' docs/implementation | wc -l)"
echo -e "K23\t$(cd $L && python3 -I tools/find-ids.py . A-R449-REVIEW-GT1-TSX TL-R449-L3-SCAN-ROOTS A-R447-REVIEW-L2 A-R447-REVIEW-L3 TL-R449-L4-PARSER-QUOTES A-R449-REVIEW-L-FILL-REGEX A-R449-REVIEW-L-TEST-HYGIENE SYS-R450-STORE-STYLE-SCAN | cut -c1-90 | tr '\n' ';')"
for a in sketch-451.patch.txt sketch-451.sha256 sketch-review.md mutants.py sketch-451-delta-v2-v3.patch.txt sketch-451-delta-v3-v4.patch.txt grants-451.txt covering-451.txt r451-tree-sha256.txt run-mutants.sh mutants.txt head-mutants/mutants.txt golden/style-scan-golden.test.ts golden/golden-sketch.json precheck-typecheck.log precheck-lint.log precheck-full.log precheck-full-raw.log; do echo -e "K24\t$a $(test -f $B/$a && echo present || echo absent)"; done
echo -e "K25\tl58 $(cd $L && python3 -I tools/l58-check.py current-task.md >/dev/null 2>&1; echo rc=$?)"
echo -e "K26\tregression-last $(cat $L/regression-last.json | python3 -I -c 'import json,sys;print(json.load(sys.stdin)["date"])')"
echo -e "K27\tdead-module-importers timeline $(grep -rlE "components/audio/Timeline['\"]|['\"]\./Timeline['\"]|\{[^}]*\bTimeline\b[^}]*\}[[:space:]]*from[[:space:]]*['\"][^'\"]*components/audio['\"]" app --include=*.ts --include=*.tsx | grep -v __tests__ | grep -vE 'components/audio/(index\.ts|Timeline\.tsx)$' | wc -l) email $(grep -rlE "['\"](~/|\.\.?/[^'\"]*)?lib/email\.server['\"]|['\"]\./email\.server['\"]" app --include=*.ts --include=*.tsx | grep -v __tests__ | grep -vE 'lib/email\.server\.ts$' | wc -l)"
echo -e "K28\troot-barrel $(grep -c "export \* from './audio'" app/components/index.ts) root-barrel-importers $(grep -rlE "from ['\"](~/components|\.\./components|\.\./\.\./components)['\"]" app --include=*.ts --include=*.tsx | grep -v __tests__ | wc -l)"
echo -e "K29\tsketch-files-manifest-rc $(sha256sum -c --quiet $B/sketch-files-sha256.txt >/dev/null 2>&1; echo $?) lines $(wc -l < $B/sketch-files-sha256.txt)"
echo -e "K30\texpect-counts $(for f in app/lib/__tests__/store-teal-sweep.test.ts app/lib/__tests__/store-gradient-text.test.ts app/lib/__tests__/studio-naming.test.tsx; do echo -n "$(basename $f)=$(grep -c 'expect(' $f) "; done) b-file $(tr '\n' ';' < $B/expect-counts.txt)"
echo -e "K31\tcovering-sketch $(tr -s ' ' < $B/precheck-covering.log | tr '\n' ';')"
echo -e "K32\t$(cat $B/apply-check.txt)"
echo -e "K33\tauth-baseline $(test -f $L/c-round-450/auth-smoke.json && echo present || echo absent)"
