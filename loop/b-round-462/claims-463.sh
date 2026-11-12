#!/usr/bin/env bash
# Usage (from the loop root): [S=<store root>] bash b-round-462/claims-463.sh
# Prints one line per [K#] claim of current-task.md (round 463). Default S = the real store.
set -u
L=$(pwd); S=${S:-/home/runner/czaba-project/store}
D301=docs/implementation/2026/quarter-IV/301-store-2b-3d-1-dead-store-modules.md
D302=docs/implementation/2026/quarter-IV/302-store-2b-3d-2-dead-store-css.md
echo "K1 gate462=$(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-462.json'));print(g['status'],g['commit'][:7])")"
echo "K2 storeHead=$(git -C "$S" rev-parse --short=7 HEAD)"
echo "K3 lines app.css=$(wc -l < "$S/app/styles/app.css") utilities.css=$(wc -l < "$S/app/styles/base/utilities.css")"
echo "K4 inventory=$(python3 -I "$L/b-round-462/css-inventory.py" "$S" /tmp/claims463-inv.json)"
echo "K5 prunedList=$(wc -l < "$L/b-round-462/pruned-list.txt") keyframes=$(grep -c '@keyframes' "$L/b-round-462/pruned-list.txt")"
echo "K6 obsidianBlockSha=$(sed -n '/data-studio-theme="obsidian"/,/^}/p' "$S/app/styles/app.css" | sha256sum | cut -c1-16)"
echo "K7 doc301UtilityLiterals=$(grep -cE 'h-\[400px\]|origin-top|shadow-teal-500/50|w-\[3px\]|left-\[15%\]|right-\[15%\]' "$S/$D301")"
echo "K8 doc302=$(test -f "$S/$D302" && echo present || echo absent)"
echo "K9 liveTealDeadEntries=$(grep -c "reason: 'dead (STORE-2b-3d)'" "$S/app/lib/__tests__/store-live-teal.test.ts") deadCssTest=$(test -f "$S/app/lib/__tests__/store-dead-css.test.ts" && echo present || echo absent)"
echo "K10 gtKey sendOrderPaidEmail=$(grep -c 'sendOrderPaidEmail:' "$S/app/lib/__tests__/store-gradient-text.test.ts") sendOrderEmail=$(grep -c 'sendOrderEmail:' "$S/app/lib/__tests__/store-gradient-text.test.ts")"
echo "K11 forbiddenStyles=$(python3 -I -c "import json;print('app/styles/**' in json.load(open('$L/backlog.json'))['global_forbidden_files'])") emailServerForbidden=$(python3 -I -c "import json;f=json.load(open('$L/backlog.json'))['global_forbidden_files'];print(any(x in ('app/lib/email.server.ts','app/lib/email*') for x in f))")"
n=0; for f in sketch-463.patch.txt sketch-463.sha256 sketch-463-files-sha256.txt css-inventory.py css-prune.py edit-tests.py css-inventory-head.json pruned-list.txt build-compare.txt root-chunk-diff.txt probe/dead-css-pages.cjs probe/run1/dead-css-pages.json probe/nonvacuity/dead-css-pages.json mutants/mutants.sh mutants/mutants.txt precheck-full.log precheck-typecheck.log precheck-lint.log covering-463.txt sketch-review.md precheck-covering.log build-compare-explained.txt root-chunk-diff.py doc-class-literals.py grants-463.txt; do test -f "$L/b-round-462/$f" && n=$((n+1)) || echo "K12 missing $f"; done
echo "K12 artifacts=$n/25"
echo "K13 testimonialsArtistBio=$(ls "$S/app/components/home/TestimonialsSection.tsx" "$S/app/components/home/ArtistBioSection.tsx" 2>/dev/null | wc -l)"
echo "K14 boxShadowTransitions=$(cat "$S/app/styles/app.css" "$S/app/styles/base/utilities.css" | grep -c 'transition[^;]*box-shadow')"
echo "K15 glowPulse=$(grep -c 'glow-pulse' "$S/app/styles/app.css") trackCardBrandShadow=$(grep -c 'rgba(var(--color-brand-rgb), 0.6)' "$S/app/styles/app.css")"
echo "K16 doc301CitesLiveGrep=$(grep -c 'b-round-461/css-removed-live-grep.txt' "$S/$D301") liveGrepFile=$(test -f "$L/b-round-461/css-removed-live-grep.txt" && echo present || echo absent)"
