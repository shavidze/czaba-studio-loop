#!/usr/bin/env bash
# usage: bash mutants-498.sh <tree-with-stage-2a-applied>   (each mutant must be RED)
set -u; T="$1"; cd "$T" || exit 2
TESTS="app/lib/__tests__/store-button-cleanup-2.test.tsx app/lib/__tests__/store-theme-tokens.test.ts"
run(){ id="$1"; f="$2"; py="$3"; cp "$f" /tmp/m498.bak
  python3 -I -c "import sys;p=sys.argv[1];s=open(p).read();o,n=sys.argv[2],sys.argv[3];assert s.count(o)>=1,'pattern missing';open(p,'w').write(s.replace(o,n,1))" "$f" "${py%%|||*}" "${py##*|||}" || { echo "$id APPLY-FAIL"; cp /tmp/m498.bak "$f"; return; }
  if npx vitest run $TESTS >/tmp/m498-$id.log 2>&1; then echo "$id GREEN(survived)"; else echo "$id RED"; fi
  cp /tmp/m498.bak "$f"; }
P="buildButtonClassName({ size: 'lg', shape: 'pill' })"
run N1 app/routes/checkout.cancel.tsx "to=\"/cart\" className={$P}|||to=\"/cart\" className=\"inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand text-background font-semibold rounded-md hover:bg-brand-hover transition-all\""
run N2 app/routes/checkout.success.tsx "variant: 'ghost',|||variant: 'secondary',"
run N3 app/routes/faq.tsx "className={$P}|||className={buildButtonClassName({ size: 'lg' })}"
run N4 app/routes/account.orders.tsx "className={$P}|||className=\"inline-block px-6 py-3 bg-brand text-brand-foreground font-medium rounded-lg hover:bg-brand/90 transition-colors\""
run N5 app/routes/checkout.cancel.tsx "to=\"/cart\" className={buildButtonClassName({ size|||to=\"/cart\" className={buildButtonClassName({ variant: 'ghost', size"
run N6 app/routes/faq.tsx "className={$P}|||className={buildButtonClassName({ size: 'md', shape: 'pill' })}"
run N7 app/routes/checkout.success.tsx "to=\"/account/downloads\"|||to=\"/account\""
run N8 app/routes/checkout.cancel.tsx "Continue Shopping|||Continue shopping"
run N9 app/styles/app.css "--color-brand-foreground: #0e0d0c;|||--color-brand-foreground: #0e0d0d;"
run N10 app/routes/checkout.success.tsx "setTimeout(() => setShowContent(true), 800)|||setTimeout(() => setShowContent(true), 900)"
run N11 app/routes/faq.tsx "<p className=\"text-muted mb-6\">|||<p className=\"text-muted mb-6 bg-brand\">"
