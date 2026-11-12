#!/bin/bash
# Claims for round 472 (STORE-2c-1 fix-up, C-R471-01). Read-only. Run from anywhere: bash b-round-471/claims-472.sh
L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-471; B0=$L/b-round-470; S=/home/runner/czaba-project/store
DOC=docs/implementation/2026/quarter-IV/306-store-2c-1-font-family-tokens.md
cd $S || exit 1
echo "K1 head $(git rev-parse --short HEAD) status-lines $(git status --short --untracked-files=all | wc -l) paths [$(git status --short --untracked-files=all | tr '\n' ' ')] tracked-diff-sha $(git diff | sha256sum | cut -c1-16)"
echo "K2 gate471 $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-471.json'));print(g['status'],g.get('reason'))") gate470 $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-470.json'));print(g['status'],g['commit'][:7])")"
echo "K3 app.css sha $(sha256sum app/styles/app.css | cut -c1-16) (HEAD+sketch-471 = d3af7582d8199712) l.122-124 [$(sed -n 122,124p app/styles/app.css | xargs)] l.338 [$(sed -n 338p app/styles/app.css | xargs)]"
git apply --check $B/sketch-472.patch.txt >/dev/null 2>&1; echo "K4 sketch-472 apply --check rc $?"
echo "K5 sketch-472 sha $(sha256sum $B/sketch-472.patch.txt | cut -c1-16)"
for f in sketch-472.patch.txt sketch-review.md mutants.sh mutants-summary.txt sketch-vitest.log sketch-tsc.log mutant-obsidian-sans-georgia-siblings.log l58-check-round471.txt; do test -f $B/$f && echo "K6 ok $f" || echo "K6 MISSING $f"; done
for f in type-probe.cjs type-probe2.cjs glyph-and-crops.cjs type-probe-summary.txt type-probe2-summary.txt; do test -f $B0/$f && echo "K6 ok b-round-470/$f" || echo "K6 MISSING b-round-470/$f"; done
echo "K7 regression-last $(python3 -I -c "import json;print(json.load(open('$L/regression-last.json'))['date'])")"
sha256sum -c --quiet "$L/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K8 protected rc $?"
echo "K9 doc306 sha $(sha256sum $DOC | cut -c1-16) l.4 [$(sed -n 4p $DOC)] M1-open-lines $(grep -c 'B-ს გადაწყვეტილებას ელოდება' $DOC)"
echo "K10 obsidian l.1624 [$(sed -n 1624p app/styles/app.css)] l.1644 [$(sed -n 1644p app/styles/app.css | xargs)] l.1645 [$(sed -n 1645p app/styles/app.css | xargs)]"
echo "K11 mutants $(grep -c ' rc 1 ' $B/mutants-summary.txt) red, $(grep -c ' rc 0 ' $B/mutants-summary.txt) green: [$(awk '{print $1":"$3}' $B/mutants-summary.txt | tr '\n' ' ')] sketch-cover [$(sed 's/\x1b\[[0-9;]*m//g' $B/sketch-vitest.log | grep -E '^ *Tests ' | xargs)] siblings [$(sed 's/\x1b\[[0-9;]*m//g' $B/mutant-obsidian-sans-georgia-siblings.log | grep -oE '× (ST4|TH2)' | xargs)]"
echo "K12 b-round-470 browser claims stand for TREE app.css: $(grep -c . $B0/type-probe-summary.txt) summary lines; app.css unchanged since that sketch (K3 sha)"
echo "K13 lessons lines $(wc -l < $L/lessons.md)"
echo "K14 font-serif uses (store, non-test) $(grep -rn 'font-serif' app --include=*.tsx | grep -v __tests__ | wc -l); artist-title rule [$(grep -n 'artist-title' app/styles/app.css | head -2 | tr '\n' ' ')]"
echo "K15 Georgian script in store UI source (non-comment, routes+components, excl. studio/tests) $(grep -rnP '[\x{10A0}-\x{10FF}]' app/routes app/components --include=*.tsx | grep -v __tests__ | grep -vP ':\s*(//|\*|\{/\*|/\*)' | grep -v 'studio' | wc -l)"
cd $L && python3 -I tools/l58-check.py current-task.md $B/l58-check.txt | tail -1
