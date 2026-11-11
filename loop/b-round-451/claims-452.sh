#!/usr/bin/env bash
# B round 451 -> 452 claims (SYS-R450-STORE-STYLE-SCAN re-dispatch, sketch v5). Each line: K#<TAB>value.
# STORE_ROOT defaults to the store. B's outputs: planning = store (A's round-451 v4 tree); sketch = STORE_ROOT=/tmp/b452-atree (A's tree + v5 delta + doc 295 l.4 = 452).
S=${STORE_ROOT:-/home/runner/czaba-project/store}; L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-451; G=app/lib/__tests__/store-gradient-text.test.ts
cd "$S" || exit 2
echo -e "K1\tgate449-commit $(python3 -I -c "import json;print(json.load(open('$L/gates/gate-round-449.json'))['commit'][:7])" 2>/dev/null || python3 -I -c "import json;print(json.load(open('$L/gates/gate-round-449.json'))['reason'].split()[1][:7])") gate450-status $(python3 -I -c "import json;print(json.load(open('$L/gates/gate-round-450.json'))['status'])") gate451-status $(python3 -I -c "import json;print(json.load(open('$L/gates/gate-round-451.json'))['status'])")"
echo -e "K2\thead $(git rev-parse --short=7 HEAD)"
echo -e "K3\tmanifest-lines $(wc -l < $B/r452-tree-sha256.txt) manifest-rc $(sha256sum -c --quiet $B/r452-tree-sha256.txt >/dev/null 2>&1; echo $?) protected-rc $(sha256sum -c --quiet $L/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?)"
echo -e "K4\tdirty-outside-grants $(git status --porcelain --untracked-files=all | awk '{print $2}' | grep -vxF -f $B/grants-452.txt | wc -l)"
echo -e "K5\tbarrel-files $(python3 -I -c "
import re,sys
s=open('$G').read(); i=s.index('const BARREL_FILES'); j=s.index('];',i)
print(' '.join(re.findall(r\"'([^']+)'\", s[i:j])))")"
echo -e "K6\thead-barrel-files $(git show a8599a2:$G | python3 -I -c "
import re,sys
s=sys.stdin.read(); i=s.index('const BARREL_FILES'); j=s.index('];',i)
print(' '.join(re.findall(r\"'([^']+)'\", s[i:j])))")"
echo -e "K7\tgt5b-own-barrels $(grep -c 'const ownBarrels = deadModuleBarrelFiles(dead);' $G) gt5b-uses-shared $(awk '/it\(.GT5b:/,/^  }\);/' $G | grep -c 'BARREL_FILES')"
echo -e "K8\tscope-sweep $(python3 -I $B/scope-sweep.py <(git show a8599a2:app/lib/__tests__/store-teal-sweep.test.ts) <(git show a8599a2:$G) app/lib/__tests__/store-teal-sweep.test.ts $G | grep -vE '^  ' | tr '\n' ';')"
echo -e "K9\tbarrel-as-words $(cat app/components/home/index.ts app/components/loading/index.ts app/components/common/index.ts app/components/index.ts app/components/audio/index.ts | grep -cwE 'as') known-hit-test $(cat $B/k9-known-hit.txt)"
echo -e "K10\troot-barrel $(grep -c "export \* from './audio'" app/components/index.ts) audio-barrel-timeline $(grep -c "export { Timeline } from './Timeline'" app/components/audio/index.ts)"
echo -e "K11\tlegacy-css $(for f in app/styles/studio.css app/styles/pages/studio.css; do echo -n "$f $(test -f $f && echo present || echo absent) clip-lines $(grep -ciE 'background-clip *:[^;}]*text|text-fill-color' $f) "; done)"
echo -e "K12\trows $(grep -ohE "it\('(GT|TS)[0-9]+b?" app/lib/__tests__/store-gradient-text.test.ts app/lib/__tests__/store-teal-sweep.test.ts | sed "s/it('//" | tr '\n' ' ')"
echo -e "K13\tdelta-sha256 $(sha256sum $B/sketch-452-delta-v4-v5.patch.txt | cut -c1-16) file $(cut -c1-16 $B/sketch-452.sha256) review-names-sha $(grep -c "$(sha256sum $B/sketch-452-delta-v4-v5.patch.txt | cut -d' ' -f1)" $B/sketch-review.md 2>/dev/null || echo absent) full-sha256 $(sha256sum $B/sketch-452-full-v5.patch.txt | cut -c1-16) review-names-full $(grep -c "$(sha256sum $B/sketch-452-full-v5.patch.txt | cut -d' ' -f1)" $B/sketch-review.md 2>/dev/null || echo absent)"
echo -e "K14\tmutants-sketch-lines $(wc -l < $B/mutants.txt) $(tr '\n' ';' < $B/mutants.txt)"
echo -e "K15\tmutants-head-lines $(wc -l < $B/head-mutants/mutants.txt) $(grep -E '^(BASE|N)' $B/head-mutants/mutants.txt | tr '\n' ';')"
echo -e "K16\tmutants-v4 $(tr '\n' ';' < $B/v4-mutants/mutants.txt)"
echo -e "K17\tgolden equal=$(python3 -I -c "import json;d=json.load(open('$B/golden/golden-sketch-v5.json'));print(d['equal'],d['sizes'])")"
echo -e "K18\tprecheck typecheck-$(tail -1 $B/precheck-typecheck.log) lint-$(tr '\n' ' ' < $B/precheck-lint.log)"
echo -e "K19\tprecheck-full $(tr -s ' ' < $B/precheck-full.log | tr '\n' ' ')"
echo -e "K20\tcovering-sketch $(tr -s ' ' < $B/precheck-covering.log | tr '\n' ';')"
echo -e "K21\tdoc295 $(ls docs/implementation/2026/quarter-IV | grep -c '^295-') last $(ls docs/implementation/2026/quarter-IV | sort | tail -1) l4 $(sed -n 4p docs/implementation/2026/quarter-IV/295-sys-r450-store-style-scan.md 2>/dev/null)"
echo -e "K22\tin-progress-stage-docs $(grep -rln 'In Progress (stage' docs/implementation | wc -l) pending-form $(grep -rlE 'C round [0-9]+ pending' docs/implementation | wc -l)"
echo -e "K23\t$(cd $L && python3 -I tools/find-ids.py . A-R451-REVIEW-M1-GT5-BARREL-SCOPE A-R449-REVIEW-GT1-TSX TL-R449-D2-BARREL-ALIAS A-R451-REVIEW-L1-SCRIPT-CSS-MULTILINE A-R451-REVIEW-L2-ZERO-OFFSET-UNITS A-R451-REVIEW-L3-REREAD SYS-R450-STORE-STYLE-SCAN | cut -c1-80 | tr '\n' ';')"
for a in sketch-452-delta-v4-v5.patch.txt sketch-452.sha256 sketch-452-full-v5.patch.txt sketch-452-full.sha256 sketch-review.md mutants.py run-mutants.sh mutants.txt head-mutants/mutants.txt v4-mutants/mutants.txt grants-452.txt r452-tree-sha256.txt sketch-files-sha256.txt expect-counts.txt apply-check.txt scope-sweep.md scope-sweep.py golden/golden-sketch-v5.json precheck-typecheck.log precheck-lint.log precheck-covering.log precheck-full.log; do echo -e "K24\t$a $(test -f $B/$a && echo present || echo absent)"; done
echo -e "K25\tl58 $(cd $L && python3 -I tools/l58-check.py current-task.md >/dev/null 2>&1; echo rc=$?)"
echo -e "K26\tregression-last $(python3 -I -c "import json;print(json.load(open('$L/regression-last.json'))['date'])")"
echo -e "K27\tdead-module-importers timeline $(grep -rlE "components/audio/Timeline['\"]|['\"]\./Timeline['\"]|\{[^}]*\bTimeline\b[^}]*\}[[:space:]]*from[[:space:]]*['\"][^'\"]*components/audio['\"]" app --include=*.ts --include=*.tsx | grep -v __tests__ | grep -vE 'components/audio/(index\.ts|Timeline\.tsx)$' | wc -l) email $(grep -rlE "['\"](~/|\.\.?/[^'\"]*)?lib/email\.server['\"]|['\"]\./email\.server['\"]" app --include=*.ts --include=*.tsx | grep -v __tests__ | grep -vE 'lib/email\.server\.ts$' | wc -l)"
echo -e "K29\tsketch-files-manifest-rc $(sha256sum -c --quiet $B/sketch-files-sha256.txt >/dev/null 2>&1; echo $?) lines $(wc -l < $B/sketch-files-sha256.txt) v4-manifest-rc $(sha256sum -c --quiet $L/b-round-450/sketch-files-sha256.txt >/dev/null 2>&1; echo $?)"
echo -e "K30\texpect-counts $(for f in app/lib/__tests__/store-teal-sweep.test.ts app/lib/__tests__/store-gradient-text.test.ts app/lib/__tests__/studio-naming.test.tsx; do echo -n "$(basename $f)=$(grep -c 'expect(' $f) "; done) b-file $(tr '\n' ';' < $B/expect-counts.txt)"
echo -e "K31\tgate449-covering $(sed 's/\x1b\[[0-9;]*m//g' $L/gates/round-449/verify.log | grep -aE '✓ app/lib/__tests__/(store-teal-sweep|store-gradient-text|studio-naming)' | tr -s ' ' | tr '\n' ';')"
echo -e "K32\t$(tr '\n' ';' < $B/apply-check.txt)"
echo -e "K33\tauth-baseline $(test -f $L/c-round-451/auth-smoke.json && echo present || echo absent)"
