#!/usr/bin/env bash
# usage: [STORE_ROOT=<repo>] bash claims-453.sh   (run from anywhere; prints K1..K16)
set -u
S=${STORE_ROOT:-/home/runner/czaba-project/store}
L=/home/runner/czaba-project/tmp/studio-real-loop
cd "$S" || exit 1
echo "K1 gate452: $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-452.json'));print(g['status'],g['commit'][:7])")"
echo "K2 head: $(git rev-parse --short HEAD)"
echo "K3 tokens-in-app.css:"; grep -n -E -- '--shadow-glow(-accent)?([^-a-z]|$)' app/styles/app.css
echo "K4 shadow-glow utility users (app, excl __tests__):"; grep -rn -E '(^|[^-a-zA-Z0-9_])shadow-glow([^-a-zA-Z0-9_]|$)' app --include=*.ts --include=*.tsx --include=*.css | grep -v __tests__ | cut -d: -f1,2 | sort
echo "K5 importers:"
echo " ChatWidget outside chat/: $(grep -rln 'ChatWidget' app --include=*.ts --include=*.tsx | grep -v '^app/components/chat/' | grep -v __tests__ | tr '\n' ' ')"
echo " IconButton outside ui/: $(grep -rln 'IconButton' app --include=*.ts --include=*.tsx | grep -v '^app/components/ui/' | grep -v __tests__ | tr '\n' ' ')"
echo " VideoShowcase outside home/: $(grep -rln 'VideoShowcase' app --include=*.ts --include=*.tsx | grep -v '^app/components/home/' | grep -v __tests__ | tr '\n' ' ')"
echo " AssetListingPage outside product/ and types: $(grep -rln 'AssetListingPage' app --include=*.ts --include=*.tsx | grep -v '^app/components/product/' | grep -v '^app/types/' | grep -v __tests__ | tr '\n' ' ')"
echo " GlobalPlayhead importers: $(grep -rln 'GlobalPlayhead' app --include=*.tsx | grep -v '^app/components/studio/' | tr '\n' ' ')"
echo " ChatInput/GuestForm mount: $(grep -rln -E 'ChatWindow' app/routes | tr '\n' ' ')"
echo "K6 primary rules:"; for sel in '.btn-primary' '.btn-primary:hover' '.btn-primary:active' '.button-primary' '.button-primary:hover'; do n=$(grep -n -x -F "$sel {" app/styles/app.css | cut -d: -f1); echo " $sel @$n: $(awk -v s="$n" 'NR>s && /^}/ {exit} NR>s {gsub(/^ +/,""); printf "%s ", $0}' app/styles/app.css)"; done
echo " consumers btn-primary: $(grep -rln -E '(^|[^-a-z])btn-primary([^-a-z]|$)' app --include=*.tsx | grep -v __tests__ | tr '\n' ' ')"
echo " consumers button-primary: $(grep -rln -E '(^|[^-a-z])button-primary([^-a-z]|$)' app --include=*.tsx | grep -v __tests__ | tr '\n' ' ')"
echo "K7 theme-tokens primary pin: $(grep -n "'shadow-sm" app/lib/__tests__/store-theme-tokens.test.ts | cut -c1-160)"
echo "K8 obsidian block sha: $(awk '/^\[data-studio-theme="obsidian"\],$/ {f=1} f {print} f && /^}/ {exit}' app/styles/app.css | sha256sum | cut -c1-16)"
echo "K9 special-offer-card/track-card TSX consumers: $(grep -rln -E 'special-offer-card|track-card([^-a-z]|$)' app --include=*.ts --include=*.tsx | grep -v __tests__ | wc -l)"
echo " rules: $(grep -n -E '^\.(special-offer-card|track-card):hover \{' app/styles/app.css | tr '\n' ' ')"
echo "K10 doc 296: $(ls docs/implementation/2026/quarter-IV/ | grep -c '^296-') files"
echo "K11 forbidden app/styles/**: $(python3 -I -c "import json;print('app/styles/**' in json.load(open('$L/backlog.json'))['global_forbidden_files'])")"
echo "K12 later-stage glows (unchanged by 453):"; grep -n -E 'rgba\(19, 217, 204|hsl\(175, 85%, 50%, 0.4\)|rgba\(var\(--color-brand-rgb\), 0\.[3468]\)' app/styles/app.css app/styles/base/utilities.css | cut -c1-90
grep -n 'shadow-\[0_0_20px_rgba(var(--color-brand-rgb)' app/components/product/PurchaseHeader.tsx | cut -c1-60
echo "K13 ui/Button default variant: $(grep -n "variant = 'primary'" app/components/ui/Button.tsx | cut -c1-60)"
echo "K14 brand tokens: $(grep -n -E '^  --color-brand(-hover|-foreground)?:' app/styles/app.css | head -3 | tr '\n' ' ')"
echo "K15 status (outside/inside grants):"; G=$L/b-round-452/grants-453.txt
git status --porcelain --untracked-files=all | awk '{print $2}' > /tmp/k15.$$; echo " outside $(grep -v -x -F -f "$G" /tmp/k15.$$ | wc -l) inside $(grep -x -F -f "$G" /tmp/k15.$$ | wc -l)"; grep -v -x -F -f "$G" /tmp/k15.$$ | head -5; rm -f /tmp/k15.$$
echo "K16 covering tests: $(cat $L/b-round-452/covering-453.txt | tr '\n' ' ')"
echo "K17 zero-offset glow hits per app TS/TSX file (D-29z1604-c inventory; helper countZeroOffsetGlowHits read from the canonical store, scanning STORE_ROOT/app):"
echo " $(cd /home/runner/czaba-project/store && STORE_ROOT=$S npx vite-node $L/b-round-452/k17-inventory.ts 2>/dev/null)"
echo "K18 PurchaseHeader justAdded glow: $(grep -c "justAdded ? 'shadow-\[0_0_20px" app/components/product/PurchaseHeader.tsx)  store.tsx Hover Glow Effect: $(grep -c 'Hover Glow Effect' app/routes/store.tsx)  BRAND_COLOR: $(grep -n "^const BRAND_COLOR" app/routes/store.tsx)"
echo "K19 ui/Button users (files rendering <Button, app excl __tests__): $(cd "$S" && grep -rln '<Button\b' app --include=*.tsx | grep -v __tests__ | sort | tr '\n' ' ')"
