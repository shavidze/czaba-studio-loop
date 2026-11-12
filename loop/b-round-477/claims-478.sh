#!/usr/bin/env bash
# Round 478 claims (DPG-P0-3b). Run from anywhere. Prints one "Kn <value>" line per claim.
L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-477; S=${STORE_ROOT:-/home/runner/czaba-project/store}
cd "$S" || exit 2
D=docs/design; Q=docs/implementation/2026/quarter-IV
DATED="$D/design-audit.md $D/star-brand-audit.md $D/design-systems-reference.md $D/wcag-audit.md"
echo "K1 HEAD $(git rev-parse --short=7 HEAD)"
echo "K2 $(python3 -I $B/tools/residual-check.py . $B/residual-478.tsv | tail -1)"
echo "K3 $(python3 -I $B/tools/doc-token-check.py . | tail -1)"
echo "K4 obsidian-brass-token-names $(grep -cE -- '--color-(obsidian|brass)-' docs/technical/store-redesign/direction-decision.md)"
for f in tools/hue-scan.py tools/residual-check.py tools/doc-token-check.py tools/wcag-ratios.py residual-478.tsv banner-478.txt c4-computed-head.json wcag-ratios.txt wcag-section-478.md scan/syn-doc-token.txt scan/syn-residual.txt scan/syn-doc-token-mutant.txt scan/hue-docs-other.txt; do test -f $B/$f && echo "K5 exists $f" || echo "K5 MISSING $f"; done
for n in 307 308 309 310; do f=$(ls $Q/$n-*.md 2>/dev/null | head -1); echo "K6 $n $( [ -n "$f" ] && sed -n 4p "$f" || echo ABSENT)"; done
f=$(ls $Q/310-*.md 2>/dev/null | head -1); if [ -n "$f" ]; then python3 -I - "$f" docs/implementation/TEMPLATE.md <<'PY'
import sys,re
h=[l.strip() for l in open(sys.argv[1],encoding='utf-8') if l.startswith('## ')]
t=[l.strip() for l in open(sys.argv[2],encoding='utf-8') if l.startswith('## ') and not l.startswith('## Prompt')]
it=iter(h); print('K7 template-headings-in-order', all(x in it for x in t))
PY
else echo "K7 template-headings-in-order ABSENT"; fi
echo "K8 arbitrary-class-candidates-added $(git diff -U0 -- docs | grep -E '^\+[^+]' | grep -cE '[a-z0-9]-\[[^]]+\]')"
echo "K9 non-docs-changes $(git status --short --untracked-files=all | grep -vcE '^.. docs/')"
for f in $DATED; do echo "K10 deletions $f $(git diff --numstat -- $f | awk '{print $2+0}')"; done
echo "K11 shadow-glow-token-in-app-css $(grep -c -- '--shadow-glow' app/styles/app.css)"
echo "K12 wcag-section-lines-present $(python3 -I -c "import sys;a=open('$D/wcag-audit.md',encoding='utf-8').read().split(chr(10));print(sum(1 for l in open('$B/wcag-section-478.md',encoding='utf-8').read().split(chr(10)) if l and l in a))") of $(grep -c . $B/wcag-section-478.md)"
BANNER="$(cat $B/banner-478.txt)"
for f in $DATED; do echo "K13 banner-line3 $f $( [ "$(sed -n 3p $f)" = "$BANNER" ] && echo yes || echo no)"; done
echo "K14 section $(grep -cx '## რატომ Obsidian & Brass?' $D/DESIGN_SYSTEM.md) sources $(grep -c 'docs/technical/store-redesign/direction-decision.md' $D/DESIGN_SYSTEM.md)/$(grep -c 'docs/design/brand-vision.md' $D/DESIGN_SYSTEM.md) blue-undertone $(grep -ci 'blue undertone' $D/DESIGN_SYSTEM.md) old-heading $(grep -c 'რატომ Teal' $D/DESIGN_SYSTEM.md)"
echo "K15 button-shadow-glow $(grep -c 'shadow-glow' $D/components/button.md)"
echo "K16 version-2.2-row $(grep -c '^| 2.2 | 2026-11-12 |' $D/DESIGN_SYSTEM.md)"
echo "K20 code-reading-docs $(grep -rlE 'readFileSync|readFile\(|readdirSync' app perf scripts 2>/dev/null | xargs grep -lE "['\"/]docs['\"/]" 2>/dev/null | wc -l)"
echo "K21 banner-hue-hits $(python3 -I $B/tools/hue-scan.py $B/banner-478.txt 2>/dev/null | grep -c .)"
echo "K22 georgian-colour-words $(grep -rcE 'ფირუზ|ნარინჯ|ცისფერ' docs/design docs/technical/store-redesign/direction-decision.md | awk -F: '{s+=$NF} END{print s+0}')"
echo "K23 inter-playfair-lines-docs-design $(git show 10791ac:docs/design/DESIGN_SYSTEM.md | grep -cE 'Inter|Playfair') $(git show 10791ac:docs/design/design-tokens.json | grep -cE 'Inter|Playfair')"
echo "K17 status-lines $(git status --short --untracked-files=all | wc -l)"
git status --short --untracked-files=all | sed 's/^/K17 /'
for spec in docs/design/DESIGN_SYSTEM.md:436 docs/design/DESIGN_SYSTEM.md:704 docs/design/DESIGN_SYSTEM.md:713 docs/design/DESIGN_SYSTEM.md:840 docs/design/DESIGN_SYSTEM.md:844 docs/design/DESIGN_SYSTEM.md:1408 docs/design/DESIGN_SYSTEM.md:1489 docs/design/style-guide.md:52 docs/design/DESIGN_SYSTEM.md:716 docs/design/DESIGN_SYSTEM.md:720 docs/design/DESIGN_SYSTEM.md:751 docs/design/DESIGN_SYSTEM.md:1014 docs/design/DESIGN_SYSTEM.md:1079 docs/design/DESIGN_SYSTEM.md:1536 docs/design/DESIGN_SYSTEM.md:1332 docs/design/style-guide.md:20 docs/design/style-guide.md:32 docs/design/style-guide.md:57 docs/design/style-guide.md:59 docs/design/audit-design.md:9 docs/design/audit-design.md:10 docs/design/audit-design.md:60 docs/design/audit-design.md:85 docs/design/box-render-specs.md:54 docs/design/box-render-specs.md:55 docs/design/box-render-specs.md:110 docs/design/awwwards-improvements.md:71 docs/design/brand-vision.md:27 docs/technical/store-redesign/direction-decision.md:23 docs/technical/store-redesign/direction-decision.md:48 docs/technical/store-redesign/direction-decision.md:56 docs/design/star-brand-audit.md:168; do f=${spec%%:*}; n=${spec##*:}; echo "K19 HEAD:$spec $(git show 10791ac:$f | sed -n ${n}p)"; done
python3 -I $L/tools/l58-check.py $L/current-task.md >/dev/null 2>&1; echo "K18 l58-check rc $?"
