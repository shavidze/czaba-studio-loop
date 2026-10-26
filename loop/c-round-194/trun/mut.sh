#!/bin/bash
# C round 194 — T-RUN on scratch copies (never store/). start = round-193 tree (13 grants from start copies), end = current tree.
S=/home/runner/czaba-project/store; T=/home/runner/czaba-project/tmp/studio-real-loop/c-round-194/trun; R=/home/runner/czaba-project/tmp/studio-real-loop/c-round-194/ref; cd "$S" || exit 1
red(){ STORE_THEME_TOKENS_ROOT=$1 npx vitest run app/lib/__tests__/store-theme-tokens.test.ts --reporter=verbose 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E "^ +(×|✓) " | sed -E 's/^ +(.) .*> (ST[0-9a-z]+)[^>]*$/\1\2/' | sort | uniq -c | tr -s ' \n' ' '; }
rm -rf "$T/start" "$T/end"; mkdir -p "$T/start" "$T/end"; cp -r "$R/app" "$T/start/app"; cp -r "$S/app" "$T/end/app"
mut(){ n=$1; f=$2; from=$3; to=$4; rm -rf "${T:?}/${n:?}"; mkdir -p "$T/$n"; cp -r "$T/end/app" "$T/$n/app"; python3 - "$T/$n/app/$f" "$from" "$to" <<'PY'
import sys;p,a,b=sys.argv[1:];s=open(p).read();assert s.count(a)>=1,(p,a);s=s.replace(a,b,1);open(p,'w').write(s)
PY
echo "$n ($f): $(red "$T/$n")"; }
echo "TREE(live): $(red "$S")"; echo "START: $(red "$T/start")"; echo "END-COPY: $(red "$T/end")"
mut m10 components/marketing/LeadMagnetPopup.tsx "placeholder:text-brand-foreground/60" "placeholder:text-dim"
mut m11 routes/store.tsx "border border-outline-strong text-foreground placeholder:text-dim" "border border-outline text-foreground placeholder:text-dim"
mut m12 components/ui/Input.tsx "'border-2 border-outline-strong'," "'border-2 border-outline',"
mut m13 routes/hire-us.tsx "<Form method" "<input className=\"border border-outline\" />
<Form method"
# probe: GuestForm-like pattern (token at tag+14) in a scratch copy of hire-us; and the real GuestForm.tsx stays bare in END-COPY
mut m14 routes/hire-us.tsx "<Form method" "<input
 a1
 a2
 a3
 a4
 a5
 a6
 a7
 a8
 a9
 a10
 a11
 a12
 a13
 className=\"border border-outline\" />
<Form method"
