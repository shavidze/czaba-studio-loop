#!/usr/bin/env bash
# Round 481 claims (B planning 2026-11-12T23:14Z). STORE_ROOT=<copy> to run on a copy.
S=${STORE_ROOT:-/home/runner/czaba-project/store}
L=/home/runner/czaba-project/tmp/studio-real-loop/b-round-480
cd "$S" || exit 2
echo "K1 HEAD $(git rev-parse --short HEAD 2>/dev/null)"
echo "K2 orders href-music $(grep -c 'href="/music"' app/routes/account.orders.tsx) href-store $(grep -c 'href="/store"' app/routes/account.orders.tsx) browse-music-label $(grep -c 'Browse Music' app/routes/account.orders.tsx) router-Link $(grep -c '<Link' app/routes/account.orders.tsx)"
echo "K3 downloads href-music $(grep -c "'/music'" app/routes/account.downloads.tsx) (protected; unchanged)"
echo "K4 routes music:$(ls app/routes | grep -ci '^music') collections:$(ls app/routes | grep -ci '^collections') store:$(ls app/routes | grep -c '^store\.tsx$')"
echo "K5 test-file $(test -f app/lib/__tests__/account-orders-empty-state.test.tsx && echo exists || echo absent) AO-ids $(grep -oE "'AO[0-9]+" app/lib/__tests__/account-orders-empty-state.test.tsx 2>/dev/null | tr -d "'" | sort | tr '\n' ' ')"
for a in probe/orders-probe.mjs probe/ring-probe-head.json probe/orders-probe-head.json probe/orders-probe-sketch.json probe/orders-empty-head-1440x900.png probe/orders-empty-sketch-1440x900.png probe/orders-empty-sketch-1280x720.png sketch-481.patch.txt sketch-481.sha256 sketch-vitest-final.log sketch-tsc.log sketch-biome.log mutant-M1-music-href.log mutant-M2-router-link.log r481-frozen-sha256.txt checkpoint.md sketch-review.md; do echo "K6 $a $(test -f $L/$a && echo exists || echo MISSING)"; done
echo "K7 status-lines $(git status --short --untracked-files=all | wc -l)"
git status --short --untracked-files=all | sed 's/^/K7   /'
echo "K8 frozen-manifest-rc $(sha256sum -c --quiet $L/r481-frozen-sha256.txt >/dev/null 2>&1; echo $?) entries $(wc -l < $L/r481-frozen-sha256.txt)"
echo "K9 protected-rc $(sha256sum -c --quiet ../tmp/studio-real-loop/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K10 store-tree-vs-sketch $(cd $L/sketch-481 && for f in $(find . -type f | sort); do cmp -s "$f" "$S/$f" || echo "$f"; done | wc -l) files differ from B's sketch (HEAD 2: both sketch files)"
echo "K11 biome-warnings-orders $(npx biome check app/routes/account.orders.tsx 2>&1 | grep -oE 'Found [0-9]+ warnings?' || echo 'Found 0 warnings')"
