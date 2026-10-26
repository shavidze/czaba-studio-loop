#!/bin/bash
# C round 193 — T-RUN mutants on scratch copies of the end tree (never store/).
S=/home/runner/czaba-project/store; T=/home/runner/czaba-project/tmp/studio-real-loop/c-round-193/trun; cd "$S" || exit 1
red(){ STORE_THEME_TOKENS_ROOT=$1 npx vitest run app/lib/__tests__/store-theme-tokens.test.ts --reporter=verbose 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E "^ (×|✓) " | sed -E 's/^ (.) .*> (ST[0-9]).*/\1\2/' | tr '\n' ' '; }
mut(){ n=$1; f=$2; from=$3; to=$4; rm -rf "${T:?}/${n:?}"; mkdir -p "$T/$n"; cp -r "$T/end/app" "$T/$n/app"; python3 - "$T/$n/app/$f" "$from" "$to" <<'PY'
import sys;p,a,b=sys.argv[1:];s=open(p).read();assert s.count(a)>=1,(p,a);s=s.replace(a,b,1);open(p,'w').write(s)
PY
echo "$n ($f: '$from' -> '$to'): $(red "$T/$n")"; }
echo "START: $(red "$T/start")"; echo "END-COPY: $(red "$T/end")"
mut m1 styles/app.css "--color-brand: #c9a46a;" "--color-brand: hsl(175, 85%, 46%);"
mut m2 styles/app.css "$M2_FROM" "$M2_TO"
mut m3 styles/app.css "--color-secondary: #cfc7ba;" "--color-secondary: hsl(220, 10%, 70%);"
mut m4 components/ui/Button.tsx "'bg-buy text-brand-foreground'" "'bg-buy text-foreground'"
mut m5 routes/hire-us.tsx "bg-brand hover:bg-brand/90 text-brand-foreground" "bg-brand hover:bg-brand/90 text-foreground"
mut m6 styles/app.css "--color-buy: #c9a46a;" "--color-buy: #006AFF;"
mut m7 components/product/PurchaseHeader.tsx "bg-buy text-brand-foreground" "bg-buy text-foreground"
mut m8 components/ui/Modal.tsx "'bg-destructive text-brand-foreground hover:bg-destructive/90'" "'bg-destructive text-foreground hover:bg-destructive/90'"
mut m9 components/marketing/LeadMagnetPopup.tsx "'CONTINUE'" "'Continue'"
