#!/usr/bin/env bash
# B round 473 -> 474 claims. Run from anywhere. Read-only.
L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-473; S=/home/runner/czaba-project/store
cd "$S" || exit 2
echo "K1 HEAD $(git rev-parse --short HEAD) status_lines $(git status --short --untracked-files=all | wc -l)"
echo "K2 sketch sha $(sha256sum $B/sketch-474.patch.txt | cut -c1-16) changed_lines $(grep -c '^[-+][^-+]' $B/sketch-474.patch.txt)"
git -c core.quotepath=off apply --check -p1 $B/sketch-474.patch.txt 2>/dev/null && echo "K2b apply-check-on-HEAD rc0" || echo "K2b apply-check-on-HEAD FAIL(expected after A applied: $(git apply -R --check -p1 $B/sketch-474.patch.txt 2>/dev/null && echo reverse-ok || echo reverse-fail))"
echo "K3 hue-scan HEAD-commit app: $(tail -1 $B/scan/app-counts-head.txt) | sketch: $(tail -1 $B/scan/app-counts-sketch.txt)"
echo "K3b sketch residue files: $(grep -v TOTAL $B/scan/app-counts-sketch.txt | awk '{print $2"="$1}' | tr '\n' ' ')"
echo "K4 precheck: $(sed 's/\x1b\[[0-9;]*m//g' $B/precheck-covering.log | grep -E '^ +Tests ' | tr -s ' ')"
echo "K4b failing ids: $(sed 's/\x1b\[[0-9;]*m//g' $B/precheck-covering.log | grep -oE '^ FAIL .*> (LT[0-9]+|TS[0-9]+|ST[0-9]+)' | grep -oE '(LT|TS|ST)[0-9]+$' | sort -u | tr '\n' ' ')"
echo "K5 createDisplayVersions 'stems' mentions: $(awk '/export function createDisplayVersions/,/^}/' app/lib/product-utils.ts | grep -c stems); PlayStemsButton gate: $(grep -c 'selectedVersion?.stems && selectedVersion.stems.length > 0' app/components/product/ProductDetailPage.tsx)"
echo "K6 decorative token readers: $(grep -rn --include=*.tsx --include=*.ts --include=*.css -E -e '--color-(crystal|premium)-|(bg|text|border|from|to|via|ring|shadow|fill|stroke|outline|decoration)-(crystal|premium)-' app | grep -v __tests__ | grep -v '^app/styles/app.css' | wc -l)"
echo "K7 gradient/glow/video-sync token readers: $(grep -rnE 'var\(--(gradient-(primary|card|hero|accent|glow)|color-glow-(primary|secondary)|color-video-sync)|(bg|text|from|to|via|border|shadow)-(glow-(primary|secondary)|video-sync)' app --include=*.tsx --include=*.ts --include=*.css | grep -v __tests__ | wc -l)"
echo "K8 teal hits StemControl/StemsPlayerModal at HEAD: $(git show HEAD:app/components/audio/StemControl.tsx | grep -c teal-500)/$(git show HEAD:app/components/audio/StemsPlayerModal.tsx | grep -c teal-500)"
echo "K9 scanner mutants caught: $(grep -c '' $B/scan/mut-lines.txt) of 6; brass/grey/orange controls flagged: $(grep -c '^m.css:7' $B/scan/mut-lines.txt)"
echo "K10 protected diff vs 58fc56e: $(git diff --name-only 58fc56e -- app/routes/studio.\$productId.tsx app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/contexts/StudioContext.tsx app/contexts/AuthContext.tsx app/root.tsx app/components/studio public package.json .claude | wc -l)"
echo "K11 undefined-token refs at HEAD (stage P0-2 input): primary-hue $(grep -c 'primary-hue' app/styles/app.css) radius-xs $(grep -c 'radius-xs' app/styles/app.css) radius_full $(grep -c 'radius_full' app/styles/app.css) text-primary $(grep -c -- '--color-text-primary' app/styles/app.css)"
for f in sketch-474.patch.txt sketch-474-files-sha256.txt precheck-covering.log scan/hue-scan-v2.py scan/app-counts-head.txt scan/app-counts-sketch.txt scan/mut-lines.txt scan/docs-counts.txt scan/claude-counts.txt dpg-inventory.md covering-474.txt st3-count-sketch.txt sketch-review.md; do test -f $B/$f && echo "K12 exists $f" || echo "K12 MISSING $f"; done
echo "K13 live-tree hue scan app/ (planning 41, after A 20): $(python3 -I $B/scan/hue-scan-v2.py $S/app /dev/null | tail -1)"
echo "K13b live-tree teal grep outside __tests__ (planning 27, after A 9 = StudioTrack 1 + studio.css 4 + pages/studio.css 4): $(grep -rnE --include=*.css --include=*.tsx --include=*.ts -e 'teal-[0-9]|cyan-[0-9]|rgba?\(19[ ,]+217|hsla?\(17[0-9]|#(13d9cc|14b8a6|0d9488|2dd4bf|5eead4|0f766e)' app | grep -v __tests__ | wc -l)"
echo "K14 DESIGN_TOKENS.md teal lines: $(grep -nE '#13D9CC|Teal \+ Orange' .claude/primitives/DESIGN_TOKENS.md | cut -d: -f1 | tr '\n' ' ')"
echo "K15 HEAD app.css 'rgba(19, 217, 204' occurrences: $(git show HEAD:app/styles/app.css | grep -o 'rgba(19, 217, 204' | wc -l); hsl(175 occurrences: $(git show HEAD:app/styles/app.css | grep -oE 'hsla?\(175' | wc -l); hue-scan app.css at a8599a2 (pre-2b-3): $(git show a8599a2:app/styles/app.css > /tmp/k15-a8599a2.css && mkdir -p /tmp/k15d && mv /tmp/k15-a8599a2.css /tmp/k15d/app.css && python3 -I $B/scan/hue-scan-v2.py /tmp/k15d /dev/null | tail -1; rm -rf /tmp/k15d)"
echo "K16 ST3 checked-key pin at HEAD: $(grep -c 'expect(checkedKeys).toHaveLength(26)' app/lib/__tests__/store-theme-tokens.test.ts); sketch count: $(cat $B/st3-count-sketch.txt)"
echo "K17 brand tokens: $(grep -nE '^\s*--color-brand(-hover|-rgb)?:' app/styles/app.css | head -3 | sed 's/ *\/\*.*//' | tr -s ' ' | tr '\n' ' ')"
echo "K18 LT7 lower bound at HEAD: $(grep -c 'toBeGreaterThanOrEqual(5)' app/lib/__tests__/store-live-teal.test.ts)"
echo "K19 docs naming the 15 changed tokens (docs/design, .claude/primitives, docs/technical/architecture): $(grep -rnE -e 'color-crystal-|color-premium-(amber|gold|rose)|color-glow-(primary|secondary)|color-video-sync|gradient-(primary|card|hero|accent|glow)' docs/design .claude/primitives docs/technical/architecture | wc -l)"
echo "K20 widened forms in non-test app/ (oklch/hwb, arbitrary rgb/hsl classes): $(grep -rnE --include=*.css --include=*.ts --include=*.tsx -e 'oklch\(|hwb\(|-\[(hsla?|rgba?|oklch|hwb)\(' app | grep -v __tests__ | wc -l)"
echo "K21 covering files: $(grep -c '' $B/covering-474.txt)"
cd $L && python3 -I tools/l58-check.py current-task.md $B/l58-check.txt | tail -1
