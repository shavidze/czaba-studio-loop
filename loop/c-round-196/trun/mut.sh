#!/bin/bash
# C round 196 — T-RUN on scratch copies only (never edits store/).
S=/home/runner/czaba-project/store; T=/home/runner/czaba-project/tmp/studio-real-loop/c-round-196/trun; ST=/home/runner/czaba-project/tmp/studio-real-loop/b-round-195/r196-granted-start
FILES="app/lib/arrangement/__tests__/studio-focus-ring.test.ts app/lib/__tests__/focus-source.test.tsx"
mk(){ rm -rf "${T:?}/$1"; mkdir -p "$T/$1"; cp -r "$S/app" "$T/$1/app"; cp "$S/vitest.config.ts" "$S/package.json" "$S/tsconfig.json" "$T/$1/"; ln -s "$S/node_modules" "$T/$1/node_modules"; }
run(){ (cd "$T/$1" && npx vitest run $FILES --reporter=verbose 2>&1 | sed 's/\x1b\[[0-9;]*m//g' > "$T/$1.log"); echo "$1: pass=$(grep -cE '^ +✓ ' "$T/$1.log") fail=$(grep -cE '^ +× ' "$T/$1.log") $(grep -E 'FAIL .*\[' "$T/$1.log" | head -2 | tr '\n' ' ')"; grep -E '^ +× ' "$T/$1.log" | sed -E 's/^ +× (.{0,90}).*$/    RED: \1/'; }
mut(){ n=$1; f=$2; from=$3; to=$4; mk "$n"; python3 - "$T/$n/$f" "$from" "$to" <<'PY'
import sys;p,a,b=sys.argv[1:];s=open(p).read();assert s.count(a)>=1,(p,a);s=s.replace(a,b,1);open(p,'w').write(s)
PY
run "$n"; }
mk tree; run tree
mk start; (cd "$ST" && find . -type f) | while read f; do cp "$ST/$f" "$T/start/$f"; done; for f in app/components/arrangement/studio-focus.ts app/lib/focus-source.ts; do rm -f "$T/start/$f"; done; run start
# m1: ring recipe back on a Lane button (fold button)
mut m1 app/components/arrangement/ArrangementLane.tsx 'text-sm leading-none text-muted hover:text-foreground ${STUDIO_FOCUS_RING_INSET_CLASS}' 'text-sm leading-none text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${STUDIO_FOCUS_RING_INSET_CLASS}'
mut m2 app/styles/app.css 'outline: 1.5px solid color-mix' 'outline: 2px solid color-mix'
mut m3 app/lib/focus-source.ts 'if (isFocusSourceModifierKey(event.key)) {' 'if (false && isFocusSourceModifierKey(event.key)) {'
mut m4 app/components/arrangement/studio-fader.ts 'size-3.5' 'size-3.75'
mut m5 app/lib/focus-source.ts '    delete root.dataset.focusSource;' ''
mut m6 app/components/arrangement/ArrangementLibrary.tsx 'w-4 shrink-0 text-muted hover:text-foreground ${STUDIO_FOCUS_RING_INSET_CLASS}' 'w-4 shrink-0 text-muted hover:text-foreground focus:border-brand ${STUDIO_FOCUS_RING_INSET_CLASS}'
# extra C probes: m7 Pan thumb via different token location (Zoom) back to accent-foreground; m8 pointer rule removed
mut m7 app/components/arrangement/ArrangementTransport.tsx 'className={`h-4 w-20 ${STUDIO_NEUTRAL_SLIDER_CLASS}`}' 'className={`h-4 w-20 accent-foreground ${STUDIO_NEUTRAL_SLIDER_CLASS}`}'
mut m8 app/styles/app.css 'html[data-focus-source="pointer"] :focus-visible' 'html[data-focus-source="mouse"] :focus-visible'
echo DONE
