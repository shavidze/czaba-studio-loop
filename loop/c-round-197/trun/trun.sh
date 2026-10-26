set -u
T=/home/runner/czaba-project/tmp/studio-real-loop/c-round-197/trun
STORE=/home/runner/czaba-project/store
REF=/home/runner/czaba-project/tmp/studio-real-loop/c-round-197/ref
FILES="app/lib/arrangement/__tests__/studio-focus-ring.test.ts app/lib/arrangement/__tests__/markers-ui.test.tsx app/lib/arrangement/__tests__/focus-reveal-ui.test.tsx"
mk() { rm -rf $T/$1; mkdir -p $T/$1; (cd $2 && tar cf - --exclude=node_modules --exclude=ref-vite-cache app vite.config.ts vitest.config.ts tsconfig.json package.json) | tar xf - -C $T/$1; ln -s $STORE/node_modules $T/$1/node_modules; sed -i '/cacheDir:/d' $T/$1/vite.config.ts; }
run() { (cd $T/$1 && timeout 600 npx vitest run $FILES --reporter=verbose > $T/$1.log 2>&1); echo "$1: $(grep -E '^\s+Tests ' $T/$1.log | head -1)"; grep -E '^\s+(×|✗|FAIL)|^ FAIL' $T/$1.log | sed 's/^/    /' | head -12; }
mk tree $STORE; run tree
mk start $REF; for f in $FILES; do cp $STORE/$f $T/start/$f; done; run start
F=app/components/arrangement/ArrangementMarkerRow.tsx
mk m10 $STORE; sed -i 's/pr-1 pl-1 active:cursor-grabbing ${STUDIO_FOCUS_RING_EDGE_CLASS}/pr-1 pl-1 active:cursor-grabbing ${STUDIO_FOCUS_RING_INSET_CLASS}/' $T/m10/$F; cmp -s $T/m10/$F $STORE/$F && echo "m10 NOT APPLIED"; run m10
mk m12 $STORE; sed -i "s/'h-4 truncate rounded-sm border px-1 text-xs leading-4'/'h-4 truncate rounded-sm border px-1 text-xs leading-4 group-focus-visible:outline'/" $T/m12/$F; cmp -s $T/m12/$F $STORE/$F && echo "m12 NOT APPLIED"; run m12
mk m13 $STORE; sed -i "s/left-0 -z-1 h-full w-px/left-0 h-full w-px/" $T/m13/$F; cmp -s $T/m13/$F $STORE/$F && echo "m13 NOT APPLIED"; run m13
mk m14 $STORE; sed -i 's/items-center pr-1 pl-1/items-center pl-1/' $T/m14/$F; cmp -s $T/m14/$F $STORE/$F && echo "m14 NOT APPLIED"; run m14
mk m15 $STORE; sed -i 's/top-0 isolate flex/top-0 flex/' $T/m15/$F; cmp -s $T/m15/$F $STORE/$F && echo "m15 NOT APPLIED"; run m15
mk m16 $STORE; sed -i "s/'\[--focus-offset:-1px\]'/'[--focus-offset:-2px]'/" $T/m16/app/components/arrangement/studio-focus.ts; cmp -s $T/m16/app/components/arrangement/studio-focus.ts $STORE/app/components/arrangement/studio-focus.ts && echo "m16 NOT APPLIED"; run m16
mk m2 $STORE; sed -i '380s/outline: 1.5px solid/outline: 2px solid/' $T/m2/app/styles/app.css; cmp -s $T/m2/app/styles/app.css $STORE/app/styles/app.css && echo "m2 NOT APPLIED"; run m2
echo TRUNDONE
