#!/usr/bin/env bash
# B round 448 -> 449 claims (STORE-2b-3a gradient text). Run from anywhere. Each line: K#<TAB>value
# STORE_ROOT defaults to the store; for the sketch output run with STORE_ROOT=/tmp/b449-scratch.
S=${STORE_ROOT:-/home/runner/czaba-project/store}; L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-448
cd "$S" || exit 2
CLIP='(-webkit-)?background-clip: *text|-webkit-text-fill-color: *transparent'
CLS='(^|[^a-zA-Z0-9_-])(text-glow|hero-title-glow)([^a-zA-Z0-9_-]|$)'
OBS='[data-studio-theme="obsidian"],'
echo -e "K1\t$(python3 -I -c "import json;print(json.load(open('$L/gates/gate-round-448.json'))['commit'][:7])")"
echo -e "K2\t$(git rev-parse --short=7 HEAD)"
for f in app/styles/app.css app/styles/base/utilities.css app/styles/studio.css app/styles/pages/studio.css; do
  echo -e "K3\tclip-text $f $(grep -cE "$CLIP" $f)"; done
echo -e "K3b\tclip-text-selectors app.css $(awk -v obs="$OBS" 'index($0,obs)==1{exit} /\{/{sel=$0} /(-webkit-)?background-clip: *text|-webkit-text-fill-color: *transparent/{print sel}' app/styles/app.css | sed 's/ *{.*//' | sort | uniq -c | tr -s ' ' | tr '\n' ';')"
echo -e "K4\tclass-users $(grep -rlE "$CLS" app --include=*.ts --include=*.tsx --include=*.css | grep -v __tests__ | sort | while read f; do echo -n "$f:$(grep -oE "text-glow|hero-title-glow" "$f" | wc -l) "; done)"
for c in ArtistBioSection TestimonialsSection VideoShowcase PianoLoadingAnimation; do
  echo -e "K5\t$c-importers $(grep -rlw $c app --include=*.ts --include=*.tsx | grep -v __tests__ | grep -vE "/$c\.tsx$|components/(home|loading|common)/index\.ts$" | wc -l)"; done
echo -e "K5b\tproduct-detail-title-users $(grep -rlw 'product-detail-title' app --include=*.ts --include=*.tsx | grep -v __tests__ | wc -l)"
echo -e "K6\tgradient-text-token $(grep -rnoE --include=*.css --include=*.ts --include=*.tsx -e '--gradient-text([^a-zA-Z0-9_-]|$)' app | grep -v __tests__ | wc -l)"
echo -e "K7\tprimary-hue-defs $(grep -rnE --include=*.css -e '--primary-hue *:' app | wc -l)"
echo -e "K8\tobsidian-block-sha $(awk -v obs="$OBS" 'index($0,obs)==1{f=1} f' app/styles/app.css | sha256sum | cut -c1-16)"
echo -e "K9\ttests-naming-classes $(grep -rlE 'text-glow|hero-title-glow|gradient-text' app perf e2e --include=*.ts --include=*.tsx 2>/dev/null | grep -E '__tests__|^perf/|^e2e/' | sort | tr '\n' ' ')"
echo -e "K9b\tNM2-title $(grep -c 'with the glow on Studio' app/lib/__tests__/studio-naming.test.tsx)"
echo -e "K10\tprobe $(tail -1 $B/probe/gt-compare.txt) head-teal-min $(python3 -I -c "
import json;r=json.load(open('$B/probe/gt-head.json'))['rows'];print(min(v['pix']['tealInkFraction'] for v in r.values() if v.get('found')))") head-found $(python3 -I -c "
import json;r=json.load(open('$B/probe/gt-head.json'))['rows'];print(sum(1 for v in r.values() if v.get('found')))")"
echo -e "K11\tstudio-pixel $(python3 -I -c "
import json;d=json.load(open('$B/probe/studio-pixel.json'))['res'];print(' '.join(f'{w}:'+','.join(str(x['diffPx']) for x in v) for w,v in d.items()))")"
echo -e "K12\tsketch-sha256 $(sha256sum $B/sketch-449.patch.txt | cut -c1-16) review=$(test -f $B/sketch-review.md && grep -c "$(sha256sum $B/sketch-449.patch.txt | cut -d' ' -f1)" $B/sketch-review.md || echo absent)"
echo -e "K13\t$(tr '\n' ';' < $B/mutants.txt)"
echo -e "K14\tprecheck-typecheck error-TS-lines $(grep -c 'error TS' $B/precheck-typecheck.log) tsc-cmd $(grep -c 'tsc' $B/precheck-typecheck.log)"
echo -e "K14\tprecheck-build.log $(tail -1 $B/precheck-build.log 2>/dev/null || echo absent)"
echo -e "K14b\tprecheck-full $(sed 's/\x1b\[[0-9;]*m//g' $B/precheck-full.log | tr -s ' ' | tr '\n' ' ')"
echo -e "K14c\tprecheck-covering $(sed 's/\x1b\[[0-9;]*m//g' $B/precheck-covering.log | grep -aE '^ +(Test Files|Tests) ' | tr -s ' ' | tr '\n' ' ')"
echo -e "K14d\tprecheck-lint $(grep -oE 'Found [0-9]+ warnings' $B/precheck-lint.log | head -1) biome-scoped-sketch $(grep -oE 'Found [0-9]+ warnings' $B/precheck-biome-scoped.log) biome-scoped-head $(grep -oE 'Found [0-9]+ warnings' $B/precheck-biome-head.log)"
for a in sketch-449.patch.txt grants-449.txt covering-449.txt run-mutants.sh mutants.txt probe/gradient-text-probe.cjs probe/compare-gt.py probe/studio-pixel.cjs probe/serve-tree.sh probe/gt-head.json probe/gt-sketch.json probe/gt-sketch-1440.json probe/gt-compare.txt probe/studio-pixel.json probe/shots-head/HERO-1440.png probe/shots-sketch/HERO-1440.png probe/shots-sketch/LEADMAGNET-dialog-1440.png probe/lm-dialog.cjs probe/lm-dialog-sketch.json sketch-review.md sketch-449-delta-v2-v3.patch.txt v2-superseded/sketch-449-v2.patch.txt probe/warm.cjs probe/extras-probe.cjs probe/extras-sketch.json probe/extras-head.json probe/hero-replicates.txt probe/c12-run/c12-summary.txt probe/c12-run/c12-head.json probe/c12-run/c12-sketch.json; do echo -e "K15\t$a $(test -f $B/$a && echo present || echo absent)"; done
echo -e "K16\tdoc294 $(test -f docs/implementation/2026/quarter-IV/294-store-2b-3a-gradient-text.md && sed -n 4p docs/implementation/2026/quarter-IV/294-store-2b-3a-gradient-text.md || echo absent) prefix-294-files=$(ls docs/implementation/2026/quarter-IV | grep -c '^294-')"
echo -e "K17\ttestimonials-unmount-commit $(git log --format=%h -S TestimonialsSection -- app/routes/_index.tsx | head -1) netflix-sites $(grep -rlE 'Netflix Original' app --include=*.tsx | grep -v __tests__ | tr '\n' ' ')"
echo -e "K18\tforbidden-dirty $(git status --porcelain -- app/root.tsx app/components/studio app/styles/studio.css app/styles/pages app/routes/account.downloads.tsx 'app/routes/studio.$productId.tsx' app/routes/api.studio-token.ts app/contexts app/components/home/ArtistBioSection.tsx app/components/home/TestimonialsSection.tsx app/components/home/VideoShowcase.tsx | wc -l)"
echo -e "K19\tdirty-outside-grants $(git status --porcelain --untracked-files=all | awk '{print $2}' | grep -vxF -f $B/grants-449.txt | wc -l) dirty-in-grants $(git status --porcelain --untracked-files=all | awk '{print $2}' | grep -cxF -f $B/grants-449.txt)"
echo -e "K20\tl58 $(cd $L && python3 -I tools/l58-check.py current-task.md >/dev/null 2>&1; echo rc=$?)"
R='teal-[0-9]+|cyan-[0-9]+|emerald-[0-9]+|#(13d9cc|14b8a6|0d9488|2dd4bf|5eead4|0f766e)\b|rgba?\( ?(19|20|45|13)[ ,]+(217|184|212|148)[ ,]+(204|166|191|136)[^)]*\)|hsla?\( ?17[0-9][ ,][^)]*\)'
echo -e "K21\tteal-ts-tsx-total $(grep -rnoiE "$R" app perf --include=*.ts --include=*.tsx | grep -v __tests__ | wc -l) teal-store-css $(grep -oiE "$R" app/styles/app.css app/styles/base/utilities.css | wc -l)"
echo -e "K22\tleadmagnet-eyebrow $(grep -c 'tracking-\[0.5em\] uppercase' app/components/marketing/LeadMagnetPopup.tsx)"
echo -e "K23\tlm-dialog $(python3 -I -c "import json;print(json.load(open('$B/probe/lm-dialog-sketch.json'))['summary'])")"
echo -e "K24\tnew-test-rows $(grep -oE "it\('GT[0-9]+" app/lib/__tests__/store-gradient-text.test.ts 2>/dev/null | tr '\n' ' ' || echo absent)"
echo -e "K25\tstar-brand-audit-text-glow-lines $(grep -n 'text-glow' docs/design/star-brand-audit.md | cut -d: -f1 | tr '\n' ' ')"
echo -e "K26\tspec-l18-glow-gradients $(sed -n 18p /home/runner/czaba-project/docs/technical/store-redesign/store-redesign-spec.md | grep -c 'removal of glow and gradients')"
echo -e "K27\te2e-visits $(grep -lE "goto\(['\"]/(about)?['\"]" e2e/*.spec.ts 2>/dev/null | tr '\n' ' ')"
echo -e "K28\thero-replicates $(tr '\n' ';' < $B/probe/hero-replicates.txt)"
echo -e "K29\textras $(python3 -I -c "
import json
for t in ('sketch','head'):
    d=json.load(open('$B/probe/extras-'+t+'.json'));print(t,{k:(v['selected'],v['bluishFraction']) for k,v in d['selection'].items()},{k:(v['fill'],v['inkFraction'],v['forcedMediaMatches']) for k,v in d['forced'].items()},end=' ')")"
echo -e "K30\tc12 $(tr '\n' ' ' < $B/probe/c12-run/c12-summary.txt | cut -c1-900)"
