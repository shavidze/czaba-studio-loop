#!/bin/bash
# Claims for round 473 (STORE-2c-1 doc fix-up, C-R472-01). Read-only. Run: bash b-round-472/claims-473.sh
L=/home/runner/czaba-project/tmp/studio-real-loop; S=/home/runner/czaba-project/store
DOC=docs/implementation/2026/quarter-IV/306-store-2c-1-font-family-tokens.md
T=app/lib/__tests__/self-hosted-fonts.test.ts
cd $S || exit 1
echo "K1 head $(git rev-parse --short HEAD) status-lines $(git status --short --untracked-files=all | wc -l) paths [$(git status --short --untracked-files=all | tr '\n' ' ')] tracked-diff-sha $(git diff | sha256sum | cut -c1-16)"
echo "K2 gate472 $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-472.json'));print(g['status'],g.get('reason'))") gate470 $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-470.json'));print(g['status'],g['commit'][:7])")"
echo "K3 app.css sha $(sha256sum app/styles/app.css | cut -c1-16) (must stay d3af7582d8199712)"
echo "K4 test sha $(sha256sum $T | cut -c1-16); sketch-472 reverse-check rc $(git apply -R --check $L/b-round-471/sketch-472.patch.txt >/dev/null 2>&1; echo $?)"
echo "K5 doc306 sha $(sha256sum $DOC | cut -c1-16) lines $(wc -l < $DOC) l.4 [$(sed -n 4p $DOC)]"
echo "K6 doc l.78 [$(sed -n 78p $DOC)]"
echo "K6 doc l.79 [$(sed -n 79p $DOC)]"
echo "K6 doc l.90 [$(sed -n 90p $DOC)]"
echo "K7 regression-last $(python3 -I -c "import json;print(json.load(open('$L/regression-last.json'))['date'])")"
sha256sum -c --quiet "$L/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K8 protected rc $?"
echo "K9 doc headings [$(grep -n '^## ' $DOC | cut -d: -f2- | tr '\n' '|')]"
echo "K10 doc stale-phrases whole-file: 'მთელ ფაილში' $(grep -c 'მთელ ფაილში' $DOC) 'obsidian ბლოკის ჩათვლით' $(grep -c 'obsidian ბლოკის ჩათვლით' $DOC) pending $(grep -ci pending $DOC) 'ელოდება' $(grep -c 'ელოდება' $DOC) 'C5 ამოწმებს' $(grep -c 'C5 ამოწმებს' $DOC)"
echo "K11 test consts [$(grep -oE '^const (TOKEN_FONT_FAMILIES|INSTRUMENT_SANS_STACK|STORE_THEME_FONT_TOKENS)' $T | tr '\n' ' ')] FN6 quote-style regex line $(grep -n 'Inter|Playfair Display' $T | head -1 | cut -d: -f1) [$(grep -F "['\"](?:Inter|Playfair Display)['\"]" $T | wc -l) match]"
echo "K12 lessons lines $(wc -l < $L/lessons.md)"
echo "K13 TestimonialsSection mounted in routes: $(grep -rln 'TestimonialsSection' app/routes | wc -l); unmounted by $(git log --format='%h %an %ad' --date=short -S TestimonialsSection -- app/routes | head -1)"
cd $L && python3 -I tools/l58-check.py current-task.md $L/b-round-472/l58-check.txt | tail -1
