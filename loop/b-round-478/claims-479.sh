#!/usr/bin/env bash
# Round 479 claims (B planning 2026-11-12). STORE_ROOT=<copy> to run on a copy.
S=${STORE_ROOT:-/home/runner/czaba-project/store}
L=/home/runner/czaba-project/tmp/studio-real-loop/b-round-478
cd "$S" || exit 2
echo "K1 HEAD $(git rev-parse --short HEAD 2>/dev/null)"
echo "K2 footer-anchor-routes $(grep -c '<a href={ROUTES\.' app/components/layout/Footer.tsx) footer-to-routes $(grep -c 'to={ROUTES\.' app/components/layout/Footer.tsx)"
for pair in 'app/routes/privacy.tsx|/cookies' 'app/routes/terms.tsx|/license' 'app/routes/faq.tsx|/hire-us' 'app/components/common/CookieConsent.tsx|/privacy'; do f=${pair%%|*}; h=${pair##*|}; echo "K3 $f href=\"$h\" $(grep -c "href=\"$h\"" $f) to=\"$h\" $(grep -c "to=\"$h\"" $f)"; done
echo "K3 app/components/home/ProductSection.tsx href={viewAllLink} $(grep -c 'href={viewAllLink}' app/components/home/ProductSection.tsx) to={viewAllLink} $(grep -c 'to={viewAllLink}' app/components/home/ProductSection.tsx)"
echo "K4 routes license:$(ls app/routes | grep -ci '^license') collections.music:$(ls app/routes | grep -ci '^collections')"
echo "K5 link-focus.ts $(test -f app/lib/link-focus.ts && echo exists || echo absent) release-uses $(grep -rlw 'releaseLinkFocus' app --include=*.tsx 2>/dev/null | grep -v __tests__ | sort | tr '\n' ' ')"
for a in mutant-M5-no-modifier-guard.log probe/modifier-sketch.json probe/modifier-head.json sketch-479.patch.txt sketch-479.sha256 probe/nav-final-5174.json probe/nav-final-5173.json mutant-baseline-sources.log mutant-M1-cookieconsent-anchor.log mutant-M2-footer-support-anchor.log mutant-M3-helper-noop.log mutant-M4-faq-no-release.log sketch-vitest-final.log covering-candidates.txt; do echo "K6 $a $(test -f $L/$a && echo exists || echo MISSING)"; done
echo "K7 status-lines $(git status --short --untracked-files=all | wc -l)"
git status --short --untracked-files=all | sed 's/^/K7   /'
FORB='^(app/root\.tsx|app/contexts/(Studio|Auth|Audio)Context\.tsx|app/routes/(account\.downloads|api\.|studio\.\$productId)|app/components/studio/|app/lib/(auth|firebase|r2|sfx-)|app/styles/|public/|package(-lock)?\.json|\.claude/|app/types/studio\.ts|app/lib/__tests__/download-routes\.test\.ts)'
echo "K8 forbidden-touched $(git status --short --untracked-files=all | awk '{print $2}' | grep -cE "$FORB")"
echo "K9 sketch-vs-tree $(cd $L/sketch-479 && sha256sum -c ../sketch-479.sha256 --quiet 2>/dev/null | wc -l) mismatching-sketch-files-vs-own-hash (expect 0)"
echo "K10 store-tree-vs-sketch $(cd $L/sketch-479 && for f in $(find . -type f | sort); do cmp -s "$f" "$S/$f" || echo "$f"; done | wc -l) files differ from B's sketch (HEAD 11; A may differ in prose-free formatting only if justified)"
