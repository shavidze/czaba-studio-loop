#!/usr/bin/env bash
# B round 475 -> 476 claims. Read-only for the store tree. CLAIMS_STORE=<tree> runs it on another tree (B ran it on the sketch-applied scratch for the allowed deltas).
L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-475; S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
cd "$S" || exit 2
SL=app/components/loading/SpotlightLoader.tsx; EC=app/components/loading/EntranceCover.tsx; HD=app/components/layout/Header.tsx; ET=app/lib/__tests__/store-entrance-loader.test.tsx; HT=app/lib/__tests__/store-header-footer.test.tsx
echo "K1 status_lines $(git status --short --untracked-files=all | wc -l)"
echo "K2 sketch sha $(sha256sum $B/sketch-476.patch.txt | cut -c1-16) files $(grep -c '^diff --git' $B/sketch-476.patch.txt)"
git apply --check -p1 $B/sketch-476.patch.txt 2>/dev/null && echo "K2b apply-check rc0" || echo "K2b apply-check FAIL ($(git apply -R --check -p1 $B/sketch-476.patch.txt 2>/dev/null && echo reverse-ok || echo reverse-fail))"
echo "K3 loader white/black literals: rgba255=$(grep -c 'rgba(255,255,255' $SL) rgba000=$(grep -c 'rgba(0,0,0' $SL) hash000=$(grep -c "'#000'" $SL) bg-black=$(grep -c 'bg-black' $SL) bg-white=$(grep -c 'bg-white' $SL) brand-rgb=$(grep -o 'rgba(var(--color-brand-rgb)' $SL | wc -l) Math.random=$(grep -c 'Math.random' $SL)"
echo "K4 loader wordmark class: $(grep -c 'text-5xl md:text-7xl font-bold text-foreground' $SL)/$(grep -c 'text-5xl md:text-7xl font-bold text-brand' $SL) (foreground/brand)"
echo "K5 cover css: color-black=$(grep -c 'background:var(--color-black)' $EC) color-background=$(grep -c 'background:var(--color-background)' $EC)"
echo "K6 header wordmark: foreground=$(grep -c 'tracking-tighter text-foreground' $HD) brand=$(grep -c 'tracking-tighter text-brand' $HD)"
echo "K7 cover pin in E1: $(grep -n "background:var(--color-" $ET | cut -c1-90)"
echo "K8 new row ids present: P=$(grep -cE "^  it\('P[1-4] " $ET) N3c=$(grep -c "it('N3c " $HT); E21 already taken: $(grep -c "it('E21 " $ET)"
echo "K9 protected diff vs edeba5a: $(git diff --name-only edeba5a -- app/routes/studio.\$productId.tsx app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/contexts app/root.tsx app/components/studio app/styles public package.json package-lock.json .claude | wc -l)"
echo "K10 footer wordmark (unchanged): $(grep -c 'text-2xl font-extrabold text-brand' app/components/layout/Footer.tsx)"
echo "K11 hue scan app/: $(python3 -I $L/b-round-473/scan/hue-scan-v2.py app /tmp/claims476-hue.txt | tail -1)"
echo "K12 precheck full suite on sketch: $(sed 's/\x1b\[[0-9;]*m//g' $B/precheck-full.log | grep -E '^ +(Test Files|Tests) ' | tr -s ' ' | tr '\n' ' ')$(tail -1 $B/precheck-full.log)"
echo "K12b precheck typecheck/lint: $(grep -c 'error' $B/precheck-typecheck.log) error lines; lint $(tail -1 $B/precheck-lint.log | cut -c1-60)"
echo "K13 covering files: $(grep -c '' $B/covering-476.txt); covering run: $(sed 's/\x1b\[[0-9;]*m//g' $B/precheck-covering.log | grep -E '^ +(Test Files|Tests) ' | tr -s ' ' | tr '\n' ' ')"
echo "K14 mutants: $(grep -c ' RED ' $B/mutants/b-run/summary.txt) of $(grep -c '' $B/mutants/b-run/summary.txt) red"
echo "K15 probe (1440/1280): $(python3 -I -c "
import json
for t in ('head','sketch'):
    d=json.load(open('$B/probe/probe-'+t+'.json'))
    print(t+':'+' '.join(w+'[cover='+','.join(sorted({str(c['before']) for c in d[w]['cover'] if c['before']}))+' overlay='+d[w]['hold']['overlayBg']+' word='+d[w]['hold']['word']['color']+' box='+'x'.join(map(str,d[w]['hold']['word']['box'][2:]))+' body='+d[w]['after']['bodyBg']+' logo='+d[w]['after']['logo']['color']+']' for w in ('1440','1280')))
" | tr '\n' ' ')"
echo "K16 wordmark contrast median (head/sketch): $(python3 -I -c "
import json;d=json.load(open('$B/probe/contrast-wordmark.json'));print(' '.join(k+'='+str(v['ratioMedian'])+'/'+str(v['ratioLightest']) for k,v in d.items()))")"
echo "K17 entrance test file duration on sketch: $(sed 's/\x1b\[[0-9;]*m//g' $B/precheck-covering.log | grep -oE 'store-entrance-loader.test.tsx \([0-9]+ tests\) [0-9]+ms')"
echo "K20 font-serif token: $(grep -n "^  --font-serif:" app/styles/app.css | cut -c1-90)"
echo "K18 docs/design hue hits: $(tail -1 $B/scan/docs-design-counts.txt); .claude: $(python3 -I $L/b-round-473/scan/hue-scan-v2.py .claude /tmp/claims476-claude.txt | tail -1)"
for f in sketch-476.patch.txt sketch-476-files-sha256.txt sketch-review.md pd-p0-3a.md root-primitives-patch.md covering-476.txt precheck-covering.log precheck-full.log precheck-typecheck.log precheck-lint.log mutants/mutants.py mutants/b-run/summary.txt probe/probe-entrance.mjs probe/contrast-wordmark.mjs probe/probe-head.json probe/probe-sketch.json probe/contrast-wordmark.json probe/head-hold-1440.png probe/sketch-hold-1440.png probe/sketch-store-header-1440.png probe/warm.mjs scan/docs-design-counts.txt ../b-round-458/probe/entrance-timing.mjs; do test -f $B/$f && echo "K19 exists $f" || echo "K19 MISSING $f"; done
cd $L && python3 -I tools/l58-check.py current-task.md $B/l58-check.txt | tail -1
