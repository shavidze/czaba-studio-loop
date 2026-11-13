#!/usr/bin/env bash
# Claims for task round 496. Run from anywhere. Prints "K# <value>" lines.
L=/home/runner/czaba-project/tmp/studio-real-loop; S=${1:-/home/runner/czaba-project/store}; B=$L/b-round-495
# Optional arg 1: a store tree (default the real store). Planning ran it on HEAD and on a sketch-applied copy.
cd "$S" || exit 1
echo "K1 head $(git rev-parse --short HEAD); gate495 $(python3 -c "import json;print(json.load(open('$L/gates/gate-round-495.json'))['status'])")"
echo "K2 status-lines $(git status --short --untracked-files=all | wc -l)"
echo "K3 css-rules $(grep -nE '^\.(btn-primary|btn-primary:hover|btn-primary:active|btn-icon|button|button-primary|button-primary:hover) \{' app/styles/app.css | cut -d: -f1 | tr '\n' ',')"
echo "K4 scan-total $(python3 -I $B/scan-button-classes.py app | tail -1); files $(python3 -I $B/scan-button-classes.py app | grep -v TOTAL | cut -d: -f1 | sort -u | wc -l)"
echo "K5 btn-secondary-css-rules $(grep -rn 'btn-secondary' app/styles | wc -l)"
echo "K6 button-tsx-single-element $(grep -c '<button' app/components/ui/Button.tsx) rounded-md-line $(grep -n "'font-semibold rounded-md'" app/components/ui/Button.tsx | cut -d: -f1)"
echo "K7 gs3-selectors $(grep -n 'PRIMARY_BUTTON_SELECTORS' app/lib/__tests__/store-glow-shadow.test.ts | cut -d: -f1 | tr '\n' ',')"
echo "K8 header $(grep -n '!hidden lg:!inline-block' app/components/layout/Header.tsx | cut -d: -f1) $(grep -n 'btn-primary w-full' app/components/layout/Header.tsx | cut -d: -f1) $(grep -n 'h-\[44px\]' app/components/layout/Header.tsx | cut -d: -f1) $(grep -n 'w-\[70px\] h-\[36px\]' app/components/layout/Header.tsx | cut -d: -f1)"
echo "K9 hero $(grep -n 'btn-primary group inline-flex items-center gap-2 px-8 py-4' app/components/home/HeroSection.tsx | cut -d: -f1)"
echo "K10 assetlisting-importers $(grep -rln 'AssetListingPage' app | grep -v 'components/product/AssetListingPage.tsx' | tr '\n' ',')"
echo "K11 e2e-text-locators $(grep -rln 'Discover the Collection' e2e | sort | tr '\n' ',') btn-in-tests $(grep -rlnE 'btn-primary|button-primary|btn-secondary' app e2e perf --include='*.test.*' --include='*.spec.*' 2>/dev/null | sort | tr '\n' ',') signin-e2e $(grep -rlnE 'Sign In' e2e perf --include='*.spec.*' 2>/dev/null | sort | tr '\n' ',')"
echo "K12 head-measure $(python3 -c "
import json;r={(x['id'],x['vp']):x for x in json.load(open('$B/measure/head.json'))}
print(r[('LOGIN','1440x900')]['rest']['box'], r[('HDR-SIGNIN','1440x900')]['rest']['borderTopLeftRadius'], r[('HERO','1440x900')]['rest']['paddingTop'], r[('NF-SECONDARY','1440x900')]['rest']['backgroundColor'], r[('HDR-SIGNIN','1023x800')]['rest']['display'])" | tr -d ' ')"
echo "K13 sketch-measure $(python3 -c "
import json;r={(x['id'],x['vp']):x for x in json.load(open('$B/measure/sketch.json'))}
print(r[('LOGIN','1440x900')]['rest']['box'], r[('HDR-SIGNIN','1440x900')]['rest']['borderTopLeftRadius'], r[('HDR-SIGNIN','1023x800')]['rest']['display'], r[('HDR-SIGNIN','1024x800')]['rest']['display'], r[('NF-SECONDARY','1440x900')]['hover']['color'])" | tr -d ' ')"
echo "K14 design-system $(grep -n '^### Buttons$\|^### IconButton$' docs/design/DESIGN_SYSTEM.md | cut -d: -f1 | tr '\n' ',') radius-md $(grep -n 'radius-md:    8px' docs/design/DESIGN_SYSTEM.md | cut -d: -f1)"
echo "K15 impl-last $(ls docs/implementation/2026/quarter-IV/ | sort | tail -1)"
for f in sketch-496.patch.txt sketch-496-appcss.patch.txt apply-sketch.py precheck-full.log mutants.txt measure/head.json measure/sketch.json measure/measure.mjs consult-product-designer.md consult-tech-lead.md sketch-review.md r496-tree-sha256.txt stage2-bg-brand-hits.txt scan-head.txt scan-mutant.txt typecheck.log lint.log scan-sketch.txt sketch-sha.txt l58-check.txt claims-496.sh mutants.sh measure/probe.mjs measure/head-probe.json measure/sketch2-probe.json measure/sketch-v1.json claims-496-sketch-output.txt update-backlog-2.py; do test -f "$B/$f" || echo "K16 MISSING $f"; done; echo "K16 artifacts checked"
echo "K17 sketch-sha $(cd $B && sha256sum -c --quiet sketch-sha.txt && echo ok) precheck $(sed 's/\x1b\[[0-9;]*m//g' $B/precheck-full.log | grep -E '^ *(Test Files|Tests) ' | tr -s ' ' | tr '\n' ';') $(tail -1 $B/precheck-full.log)"
echo "K18 lint-head $(npx biome lint app 2>&1 | grep -E 'Found [0-9]+ warnings') sketch $(grep -E 'Found [0-9]+ warnings' $B/lint.log)"
echo "K19 account-tsx-retired $(grep -cE 'btn-primary|button-primary|btn-secondary|btn-icon' app/routes/account.tsx)"
echo "K20 tailwind $(grep '"version"' node_modules/tailwindcss/package.json | tr -d ' ,')"
echo "K21 manifest $(wc -l < $B/r496-tree-sha256.txt) rc $(sha256sum -c --quiet $B/r496-tree-sha256.txt >/dev/null 2>&1; echo $?) protected-rc $(sha256sum -c --quiet $L/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K22 regression $(python3 -c "import json;print(json.load(open('$L/regression-last.json'))['date'])")"
echo "K23 backlog v$(python3 -c "import json;b=json.load(open('$L/backlog.json'));print(b['version'], b['decisions_log_b'][-1]['id'])")"
echo "K24 html-focus-pointer-rule $(grep -n 'html\[data-focus-source="pointer"\] :focus-visible' app/styles/app.css | cut -d: -f1)"
echo "K25 not-found-actions $(grep -n '^\.not-found-actions' app/styles/app.css | cut -d: -f1 | tr '\n' ',')"
echo "K26 direction-pill $(grep -n 'a brass pill' /home/runner/czaba-project/docs/technical/store-redesign/direction-decision.md | cut -d: -f1)"
echo "K27 star-brand-audit $(grep -n 'btn-primary' docs/design/star-brand-audit.md | cut -d: -f1 | tr '\n' ',')"
echo "K28 skeletons $(grep -cE 'h-12 bg-elevated rounded-full animate-pulse' app/components/layout/Header.tsx)"
