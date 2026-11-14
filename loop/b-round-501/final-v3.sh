set -x
L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-501; S=$B/probe/sketch
cd $L
timeout 900 env BASE=http://127.0.0.1:5174 node $B/probe/cart-states.mjs $S sketch > $S/states-run.log 2>&1
python3 -I $B/probe/compare-502.py $B/probe/head/head-cart.json $S/sketch-cart.json > $B/probe/compare-sketch.txt
timeout 200 env BASE=http://127.0.0.1:5174 node $B/probe/items-wheel.mjs > $S/sketch-items-wheel.json 2>&1
timeout 900 env BASE=http://127.0.0.1:5174 node $B/probe/cart-wheel.mjs $S sketch > $S/wheel-run.log 2>&1
timeout 600 env BASE=http://127.0.0.1:5174 node $B/probe/cart-actions.mjs $S sketch > $S/actions-run.log 2>&1
timeout 400 env BASE=http://127.0.0.1:5174 node $B/probe/cart-empty.mjs $S sketch > $S/empty-run.log 2>&1
# tree, checks
cd /home/runner/czaba-project/store && git apply --check $B/sketch-502.patch.txt && echo APPLY-CHECK-OK
(cd /tmp/b502 && sha256sum app/routes/cart.tsx app/lib/__tests__/cart-mobile-layout.test.ts docs/implementation/2026/quarter-IV/323-cart-mobile-items-hidden.md) > $B/r502-post-sketch-sha.txt
rm -rf /tmp/b502-apply && mkdir /tmp/b502-apply && git archive HEAD | tar -x -C /tmp/b502-apply && cd /tmp/b502-apply && git apply $B/sketch-502.patch.txt && sha256sum -c --quiet $B/r502-post-sketch-sha.txt && echo CHECK4-OK && sha256sum -c --quiet $B/r502-tree-sha256.txt && echo CHECK1-OK && ln -s /home/runner/czaba-project/store/node_modules node_modules
rm -rf /tmp/b502-mut/t && mkdir -p /tmp/b502-mut/t && cp -r /tmp/b502-apply/. /tmp/b502-mut/t/ && rm -rf $B/mutant-logs && python3 -I $B/mutants-502.py /tmp/b502-mut/t $B/mutant-logs
cd /tmp/b502-apply
npx tsc --noEmit > $B/precheck-tsc.log 2>&1; echo "tsc rc $?" >> $B/precheck-tsc.log
npx biome lint ./app > $B/precheck-lint.log 2>&1; echo "lint rc $?" >> $B/precheck-lint.log
npx biome check app/routes/cart.tsx app/lib/__tests__/cart-mobile-layout.test.ts > $B/precheck-biome.log 2>&1; echo "biome rc $?" >> $B/precheck-biome.log
npx vitest run --reporter=verbose $(cat $B/covering-files.txt) 2>&1 | sed 's/\x1b\[[0-9;]*m//g' > $B/precheck-covering.log
timeout 1500 npx vitest run > $B/precheck-full.log 2>&1; echo "rc $?" >> $B/precheck-full.log
timeout 900 npm run build > $B/precheck-build-sketch.log 2>&1; echo "rc $?" >> $B/precheck-build-sketch.log
echo ALL-DONE
