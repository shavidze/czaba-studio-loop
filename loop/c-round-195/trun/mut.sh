#!/bin/bash
# C round 195 — T-RUN on scratch copies only (never edits store/).
S=/home/runner/czaba-project/store; T=/home/runner/czaba-project/tmp/studio-real-loop/c-round-195/trun; ST=/home/runner/czaba-project/tmp/studio-real-loop/b-round-194/r195-granted-start; cd "$S" || exit 1
run(){ STORE_THEME_TOKENS_ROOT=$1 npx vitest run app/lib/__tests__/store-theme-tokens.test.ts --reporter=verbose 2>&1 | sed 's/\x1b\[[0-9;]*m//g' > "$2.log"; echo "pass=$(grep -cE '^ +✓ ' "$2.log") fail=$(grep -cE '^ +× ' "$2.log")"; grep -E '^ +× ' "$2.log" | sed -E 's/^ +× (.*)$/    RED: \1/' | cut -c1-200; }
rm -rf "$T/start" "$T/end"; mkdir -p "$T/start" "$T/end"; cp -r "$S/app" "$T/start/app"; cp -r "$S/app" "$T/end/app"
for f in components/chat/GuestForm.tsx components/recordings/SfxSoundLibrary.tsx components/recordings/SfxSceneBuilder.tsx components/recordings/SfxVideoSync.tsx components/recordings/SfxQuickEdit.tsx; do cp "$ST/app/$f" "$T/start/app/$f"; done
mut(){ n=$1; f=$2; from=$3; to=$4; rm -rf "${T:?}/${n:?}"; mkdir -p "$T/$n"; cp -r "$T/end/app" "$T/$n/app"; python3 - "$T/$n/app/$f" "$from" "$to" <<'PY'
import sys;p,a,b=sys.argv[1:];s=open(p).read();assert s.count(a)>=1,(p,a);s=s.replace(a,b,1);open(p,'w').write(s)
PY
echo "$n ($f): $(run "$T/$n" "$T/$n")"; }
echo "TREE(live): $(run "$S" "$T/tree")"; echo "START(r194 copy): $(run "$T/start" "$T/start")"; echo "END-COPY: $(run "$T/end" "$T/end")"
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
mut m15 routes/store.tsx "export default function" "const fieldClass = 'border border-outline';
function M15Probe() { return <input className={fieldClass} />; }
export default function"
mut m16 components/chat/GuestForm.tsx "'border-outline-strong focus:border-brand'," "'border-outline focus:border-brand',"
mut m17 components/recordings/SfxSceneBuilder.tsx "border border-outline-strong bg-background" "border border-outline bg-background"
mut m18 routes/hire-us.tsx "<Form method" "<section className=\"border border-outline\">x</section>
<Form method"
# extra C probes
mut m19 routes/hire-us.tsx "<Form method" "<textarea onChange={(e) => e} rows={3}
  className={\`\${'a'} border border-outline\`} />
<Form method"
