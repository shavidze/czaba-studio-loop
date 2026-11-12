#!/usr/bin/env bash
# B round 474 -> 475 claims. Run from anywhere. Read-only for the store tree. CLAIMS_STORE=<tree> runs it on another tree (B ran it on the sketch-applied clone for the allowed deltas).
L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-474; S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
cd "$S" || exit 2
echo "K1 HEAD $(git rev-parse --short HEAD) status_lines $(git status --short --untracked-files=all | wc -l)"
echo "K2 sketch sha $(sha256sum $B/sketch-475.patch.txt | cut -c1-16) files $(grep -c '^diff --git' $B/sketch-475.patch.txt)"
git apply --check -p1 $B/sketch-475.patch.txt 2>/dev/null && echo "K2b apply-check-on-HEAD rc0" || echo "K2b apply-check-on-HEAD FAIL(expected after A applied: $(git apply -R --check -p1 $B/sketch-475.patch.txt 2>/dev/null && echo reverse-ok || echo reverse-fail))"
echo "K3 undefined var() reads at HEAD (resolver scan): $(tail -1 $B/scan/var-undefined-head.txt) | on sketch: $(tail -1 $B/scan/var-undefined-sketch.txt)"
echo "K3b live tree now: $(node $B/scan/var-undefined.mjs $S 2>/dev/null | tail -1)"
echo "K4 non-emitting colour utilities at HEAD: $(tail -1 $B/scan/tw-undefined-head.txt | cut -d' ' -f1-2) | on sketch: $(tail -1 $B/scan/tw-undefined-sketch.txt | cut -d' ' -f1-2)"
echo "K4b live tree now: $(node $B/scan/tw-undefined-ast.mjs $S 2>/dev/null | tail -1 | cut -d' ' -f1-2)"
echo "K5 root.tsx renders nav-loading-bar: $(grep -c 'className="nav-loading-bar"' app/root.tsx) (line $(grep -n 'className="nav-loading-bar"' app/root.tsx | cut -d: -f1))"
echo "K6 HEAD probe: badge bg $(python3 -I -c "import json;d=json.load(open('$B/probe/probe-head2.json'));print([b['bg'] for b in d['badges'] if b['t']=='Ambient'][0])") | nav bar bgImage $(python3 -I -c "import json;print(json.load(open('$B/probe/probe-head2.json'))['navBarInjected']['bgImage'])") | --radius-xs $(python3 -I -c "import json;print(json.load(open('$B/probe/probe-head.json'))['rootVars']['--radius-xs'])") | --color-black $(python3 -I -c "import json;print(json.load(open('$B/probe/probe-head.json'))['rootVars']['--color-black'])")"
echo "K7 HEAD probe text-primary consumers inherit foreground (1440/1280): $(python3 -I -c "
import json;d=json.load(open('$B/probe/probe-head4.json'))
print(' '.join(w+':'+str(all(x==d[w]['trigHover']['parent'] for x in [d[w]['trigHover']['c'],d[w]['input']['c'],d[w]['closeHover']['c'],d[w]['itemHover']['c']]+[c['c'] for c in d[w]['code4']])) for w in d))")"
echo "K8 mutants: $(grep -c 'rc=1 red=× ' $B/mutants/summary.txt) of $(grep -c '' $B/mutants/summary.txt) red"
echo "K9 protected diff vs 297f5ae: $(git diff --name-only 297f5ae -- app/routes/studio.\$productId.tsx app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/contexts/StudioContext.tsx app/contexts/AuthContext.tsx app/root.tsx app/components/studio public package.json package-lock.json .claude | wc -l)"
echo "K10 store-live-teal .code-4 pin line: $(grep -n "'  color: var(--color-text-primary);'," app/lib/__tests__/store-live-teal.test.ts | cut -d: -f1 | tr '\n' ' ')"
echo "K11 tailwindcss direct dependency: $(grep -c '"tailwindcss": "\^4' package.json); typescript direct: $(grep -c '"typescript":' package.json)"
echo "K12 precheck full suite on sketch: $(sed 's/\x1b\[[0-9;]*m//g' $B/precheck-full.log | grep -E '^ +(Test Files|Tests) ' | tr -s ' ' | tr '\n' ' ')"
echo "K12b precheck typecheck: $(tail -1 $B/precheck-typecheck.log)"
echo "K13 covering files: $(grep -c '' $B/covering-475.txt)"
echo "K14 UT2 duration on sketch (ms, describe timeout 30000): $(sed 's/\x1b\[[0-9;]*m//g' $B/precheck-full.log | grep -oE 'UT2: .* [0-9]+ms' | grep -oE '[0-9]+ms$')"
echo "K15 sketch probe: $(python3 -I -c "
import json;d=json.load(open('$B/probe/probe-sketch-card.json'));r=json.load(open('$B/probe/probe-sketch-rows.json'));c=json.load(open('$B/probe/probe-sketch-contrast.json'))
print(' '.join(w+':badge='+[b['bg'] for b in d[w]['badges'] if b['t']=='Ambient'][0]+',wrap='+r[w]['c7']['bg']+',scale='+str(r[w]['c8']['cardTransform'])+',nav='+r[w]['c9']['pending']['display']+',contrast_min='+str(min(x['ratioMedian'] for x in c[w])) for w in d))")"
echo "K16 docs in docs/design, .claude/primitives, docs/technical/architecture naming the changed reads: $(grep -rnE -e '--color-text-primary|--color-text-muted|--color-accent-hover|--primary-hue' docs/design .claude/primitives docs/technical/architecture | wc -l)"
echo "K17 dead files have no importer outside their barrel: $(for f in UserDropdown ArtistBioSection TestimonialsSection ChatWidget IconButton; do printf '%s=%s ' $f $(grep -rlE "\b$f\b" app --include=*.tsx --include=*.ts | grep -v __tests__ | grep -vE "/$f\.tsx$|/index\.ts$|components/chat/ChatWidget.tsx" | wc -l); done)"
echo "K19 docs/design/awwwards-improvements.md nav-loading-bar mentions: $(grep -c nav-loading-bar docs/design/awwwards-improvements.md)"
for f in sketch-475.patch.txt sketch-475-files-sha256.txt pd-p0-2.md scan/var-undefined.mjs scan/tw-undefined-ast.mjs scan/var-undefined-head.txt scan/var-undefined-sketch.txt scan/tw-undefined-head.txt scan/tw-undefined-sketch.txt mutants/summary.txt mutants/run-mutants.sh probe/probe-head.json probe/probe-head2.json probe/probe-head4.json probe/probe-sketch-card.json probe/probe-card-head.json probe/probe-card.mjs probe/probe-head4.mjs probe/probe-rows.mjs probe/probe-head-rows.json probe/probe-sketch-rows.json probe/probe-contrast.mjs probe/probe-head-contrast.json probe/probe-sketch-contrast.json probe/probe-sketch4.json probe/ctl-404-a.png probe/ctl-404-b.png probe/diffpng.mjs precheck-lint.log precheck-full.log precheck-typecheck.log covering-475.txt sketch-review.md; do test -f $B/$f && echo "K18 exists $f" || echo "K18 MISSING $f"; done
cd $L && python3 -I tools/l58-check.py current-task.md $B/l58-check.txt | tail -1
