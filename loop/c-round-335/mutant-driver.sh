L=/home/runner/czaba-project/tmp/studio-real-loop/c-round-335
cd /tmp/c335s; S=perf/studio-lab-interactions.perf.spec.ts
run(){ name=$1; rm -rf test-results/perf build; timeout 1800 npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > $L/mutants/$name.log 2>&1; echo "rc=$?" > $L/mutants/$name.status; cp test-results/perf/latest-interactions.json $L/mutants/$name-results.json 2>/dev/null; }
sed -i 's/await page.mouse.move(grab.x + d, target.y, { steps: 1 });/await page.mouse.move(grab.x + d, grab.y, { steps: 1 });/; s/await page.mouse.move(grab.x + 2 \* d, target.y, { steps: s });/await page.mouse.move(grab.x + 2 * d, grab.y, { steps: s });/' $S
diff /tmp/c335-spec.orig $S > $L/mutants/MU-LANE-NO-CROSS.diff; run MU-LANE-NO-CROSS
cp /tmp/c335-spec.orig $S
sed -i 's/await page.mouse.move(grab.x + 2 \* d, grab.y, { steps: 1 });/await page.mouse.move(grab.x + 2 * d, target.y, { steps: 1 });/; s/await page.mouse.move(grab.x + 3 \* d, grab.y, { steps: s });/await page.mouse.move(grab.x + 3 * d, target.y, { steps: s });/' $S
diff /tmp/c335-spec.orig $S > $L/mutants/MU-C335-NO-BACK.diff; run MU-C335-NO-BACK
cp /tmp/c335-spec.orig $S; cmp /tmp/c335-spec.orig $S && echo restored > $L/mutants/restored.txt
echo done > $L/mutants/all.done
