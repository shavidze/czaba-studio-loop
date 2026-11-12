#!/usr/bin/env bash
# Usage (from the loop root): [S=<store root>] bash b-round-463/claims-464.sh
# Prints one line per [K#] claim of current-task.md (round 464). Default S = the real store.
set -u
L=$(pwd); S=${S:-/home/runner/czaba-project/store}
C=$S/app/styles/app.css; T=$S/app/lib/__tests__/store-dead-css.test.ts
D303=docs/implementation/2026/quarter-IV/303-store-2b-3d-3-orphan-keyframes.md
echo "K1 gate463=$(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-463.json'));print(g['status'],g['commit'][:7])")"
echo "K2 storeHead=$(git -C "$S" rev-parse --short=7 HEAD)"
echo "K3 orphanKeyframes=$(grep -cE '^@keyframes (float|grain|fadeInUp|fadeOut) ' "$C") allKeyframes=$(grep -c '^@keyframes ' "$C") appCssLines=$(wc -l < "$C")"
echo "K4 animationConsumers float=$(grep -rnE --include=*.ts --include=*.tsx --include=*.css "(animation(-name)?[\"']?\s*:[^;]*[^A-Za-z0-9_-]float([^A-Za-z0-9_-]|$)|animate-\[?float)" "$S/app" | grep -v __tests__ | grep -vc '\.test\.') grain=$(grep -rnE --include=*.ts --include=*.tsx --include=*.css "(animation(-name)?[\"']?\s*:[^;]*[^A-Za-z0-9_-]grain([^A-Za-z0-9_-]|$)|animate-\[?grain)" "$S/app" | grep -v __tests__ | grep -vc '\.test\.') fadeInUp=$(grep -rnE --include=*.ts --include=*.tsx --include=*.css "(animation(-name)?[\"']?\s*:[^;]*[^A-Za-z0-9_-]fadeInUp([^A-Za-z0-9_-]|$)|animate-\[?fadeInUp)" "$S/app" | grep -v __tests__ | grep -vc '\.test\.') fadeOut=$(grep -rnE --include=*.ts --include=*.tsx --include=*.css "(animation(-name)?[\"']?\s*:[^;]*[^A-Za-z0-9_-]fadeOut([^A-Za-z0-9_-]|$)|animate-\[?fadeOut)" "$S/app" | grep -v __tests__ | grep -vc '\.test\.')"
echo "K5 premiumHeader=$(grep -c 'PREMIUM ANIMATIONS' "$C") filmGrainHeader=$(grep -c 'Film Grain Overlay' "$C")"
echo "K6 obsidianBlockSha=$(sed -n '/data-studio-theme="obsidian"/,/^}/p' "$C" | sha256sum | cut -c1-16)"
echo "K7 dc2TextRule=$(grep -c 'cssWithoutKeyframesHeaders' "$T") dc4=$(grep -c "it('DC4:" "$T") animatedNames=$(grep -c 'function animatedNames' "$T")"
echo "K8 doc303=$(test -f "$S/$D303" && echo present || echo absent)"
echo "K9 forbiddenStyles=$(python3 -I -c "import json;print('app/styles/**' in json.load(open('$L/backlog.json'))['global_forbidden_files'])")"
n=0; for f in sketch-464.patch.txt sketch-464.sha256 sketch-464-files-sha256.txt grants-464.txt covering-464.txt precheck-covering.log precheck-typecheck.log precheck-lint.log mutants/run-mutants.sh mutants/mutants.txt build-compare.py build-compare.txt build-compare-head-head.txt root-chunk-diff.py root-chunk-diff.txt pruned-list-464.txt probe/run1/dead-css-pages.json probe/nonvacuity/dead-css-pages.json c-r462-01-head-utilities.txt sketch-review.md; do test -f "$L/b-round-463/$f" && n=$((n+1)); done
echo "K10 artifacts=$n/20"
echo "K11 builtKeyframesRemoved=$(grep -c '^REMOVED' "$L/b-round-463/build-compare.txt") added=$(grep -oE 'added=[0-9]+' "$L/b-round-463/build-compare.txt") rootNonIdentifier=$(tail -1 "$L/b-round-463/root-chunk-diff.txt" | grep -oE 'non-identifier-changes=[0-9]+')"
echo "K12 c-r462-01=$(head -1 "$L/b-round-463/c-r462-01-head-utilities.txt")"
echo "K13 mutants=$(grep -c 'RED-' "$L/b-round-463/mutants/mutants.txt")/9 base=$(grep '^BASE' "$L/b-round-463/mutants/mutants.txt" | grep -c 'RED-')red"
echo "K14 keyframesInDoc302Todo=$(grep -cE 'float|grain|fadeInUp|fadeOut' "$S/docs/implementation/2026/quarter-IV/302-store-2b-3d-2-dead-store-css.md")"
echo "K15 tailwindSourceRules=$(grep -c '@source' "$C")"
echo "K16 jsAnimationStyle=$(grep -rnE --include=*.ts --include=*.tsx '\.animation(Name)?\s*=|animationName|animation:\s*`' "$S/app" | grep -v __tests__ | grep -vc '\.test\.')"
echo "K17 keyframes=$(grep -oE '^@keyframes [A-Za-z0-9_-]+' "$C" | awk '{print $2}' | tr '\n' ' ')"
for k in float grain fadeInUp fadeOut; do echo "K18 wordHits $k=$(grep -rlw --include=*.ts --include=*.tsx --include=*.css "$k" "$S/app" | grep -v __tests__ | grep -v '\.test\.' | grep -v 'styles/app.css$' | sed "s#^$S/##" | sort | tr '\n' ' ')"; done
echo "K19 dc2v3OnHead=$(grep -cE '^\+   "styles/app.css @keyframes (float|grain|fadeInUp|fadeOut)",' "$L/b-round-463/dc2-v3-on-head.log") of $(grep -cE '^\+   "styles/' "$L/b-round-463/dc2-v3-on-head.log")"
echo "K20 artifactsV3=$(for f in sketch-464-delta-v1-v2.diff.txt sketch-464-delta-v2-v3.diff.txt dc2-v3-on-head.log precheck-full.log css-v3-vs-v1.txt bundle-animation-grep.txt v1-superseded/sketch-464-v2.patch.txt l29-planning.txt; do test -f "$L/b-round-463/$f" && echo -n 1; done | wc -c)/8 twDocLeak=$(test -f "$L/a-round-463/tw-doc-leak.mjs" && echo present || echo absent) c8probe=$(test -f "$L/c-round-461/c8/probe.cjs" && echo present || echo absent)"
