#!/usr/bin/env bash
# Claims for current-task.md round 470 (SABA-B-15 stage 2b: shape fix C-R469-01 + discriminating control). Run: bash claims-470.sh
# Output must match claims-470-planning-output.txt except after A: K1 diff sha changes (sketch applied) and K4 --check fails (already applied).
S=/home/runner/czaba-project/store; L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-469
cd "$S" || exit 2
echo "K1 HEAD $(git rev-parse --short HEAD); status lines $(git status --short --untracked-files=all | wc -l); tracked diff sha256 $(git diff | sha256sum | cut -c1-16)"
echo "K1b round-469 diff (C's TREE) sha256 $(sha256sum $L/c-round-469/tree.diff | cut -c1-16)"
echo "K2 gate469 $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-469.json'));print(g['status'],g.get('reason'))")"
echo "K3 glow lines in tree: ProductSection $(grep -n 'bg-radial' app/components/home/ProductSection.tsx | cut -d: -f1 | tr '\n' ' ')StudioShowcase $(grep -n 'bg-radial' app/components/home/StudioShowcase.tsx | cut -d: -f1 | tr '\n' ' ')reflection blur-[40px] l.$(grep -n 'blur-\[40px\]' app/components/home/StudioShowcase.tsx | cut -d: -f1)"
git apply --check "$B/sketch-470.patch.txt" 2>&1 | head -2; echo "K4 sketch-470.patch.txt applies: rc ${PIPESTATUS[0]}; files $(grep '^+++ ' $B/sketch-470.patch.txt | awk '{print $2}' | sed 's#^b/##' | tr '\n' ' ')"
echo "K5 sketch sha256 $(sha256sum $B/sketch-470.patch.txt | cut -d' ' -f1)"
for f in sketch-470.patch.txt sketch-review.md tune-run.sh patches2.cjs edge-rows.cjs look-s0-profile.txt look-s4-profile.txt look-s6-profile.txt patches-s0.txt patches-s4.txt patches-s6.txt patches-s6.json look-s6.json s6-frozen-1.json s6-full-1.json head-full-1.json b-head-frozen-1.json b-tree-frozen-1.json s6-frames-summary.txt b-probe-summary.txt c469-reanalysis.txt s6-sp-unit.log pd-s4.md pd-s6.md sketch-470-s4.patch.txt built-css-classes-s6.txt; do
  test -f "$B/$f" && echo "K6 exists $f" || echo "K6 MISSING $f"
done
echo "K7 regression-last $(python3 -I -c "import json;print(json.load(open('$L/regression-last.json'))['date'])")"
sha256sum -c --quiet "$L/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K8 protected rc $?"
grep -E 'ratioToHead' "$B/look-s6-profile.txt" | awk '{print "K9 look s6", $1, $2, "ratioToHead", $7, "edgeJump top", $(NF-4), "bottom", $(NF-2)}'
python3 -I - "$B" <<'PY'
import json,sys
B=sys.argv[1]
for name in ('s0','s4','s6'):
    d=json.load(open(f'{B}/patches-{name}.json'))
    for k,r in d.items():
        h=r['head']['pts'];t=r[name]['pts'];x=r['hidden']['pts']
        dd=[abs(t[i][2]-h[i][2]) for i in range(len(h))]
        pk=max(range(len(h)),key=lambda i:h[i][2]-x[i][2])
        gh=h[pk][2]-x[pk][2]; gc=t[pk][2]-x[pk][2]
        br=[(t[i][2]-x[i][2])/(h[i][2]-x[i][2]) for i in range(len(h)) if h[i][2]-x[i][2]>=2]
        sg=[t[i][2]-h[i][2] for i in range(len(h)) if abs(t[i][2]-h[i][2])>=0.05]
        print(f'K9b patches {name} {k} max|cand-head| {max(dd):.2f} bright(>=2) n={len(br)} ratio {min(br):.2f}-{max(br):.2f} lean +{sum(v>0 for v in sg)}/-{sum(v<0 for v in sg)} peakPatch {h[pk][:2]} glowHead {gh:.2f} glowCand {gc:.2f}')
PY
python3 -I - "$L" <<'PY'
import json,glob,statistics as st,sys
L=sys.argv[1]
bands=[(360,900),(1800,2050)]
inb=lambda y:any(a<=y<=b for a,b in bands)
sets=[('HEAD frozen C469',f'{L}/c-round-469/data/c1-head-frozen*.json'),('HEAD frozen B470',f'{L}/b-round-469/b-head-frozen-1.json'),('TREE469 frozen C469',f'{L}/c-round-469/data/c2-tree-frozen*.json'),('TREE469 frozen B470',f'{L}/b-round-469/b-tree-frozen-1.json'),('s6 frozen B470',f'{L}/b-round-469/s6-frozen-1.json'),('s6 full B470',f'{L}/b-round-469/s6-full-1.json'),('HEAD full B470',f'{L}/b-round-469/head-full-1.json'),('HEAD frozen B467',f'{L}/b-round-467/probe/scroll-prod-9ba13ac-cpu1.json'),('HEAD frozen C468',f'{L}/c-round-468/scroll-head.json'),('HEAD frozen A468',f'{L}/a-round-468/scroll-head.json'),('FIX frozen C468',f'{L}/c-round-468/scroll-fix.json'),('FIX frozen A468',f'{L}/a-round-468/scroll-fix-*.json'),('sketch2 frozen B468',f'{L}/b-round-468/scroll-sketch2-frozen.json'),('sketch2 full B468',f'{L}/b-round-468/scroll-sketch2-full.json')]
for lab,pat in sets:
    for vp in ('1440x900','1280x720'):
        rows=[r for f in sorted(glob.glob(pat)) for r in json.load(open(f))['rows'] if r['path']=='/' and r['viewport']==vp]
        if not rows: print('K10 MISSING',lab,vp); continue
        p95=[r['p95'] for r in rows]; o=[r['movingOver33'] for r in rows]
        print(f"K10 {lab} / {vp} n={len(rows)} p95>=33.0 in {sum(1 for v in p95 if v>=33.0)} p95<=17.0 in {sum(1 for v in p95 if v<=17.0)} over33 median {st.median(o)} inBand {[sum(1 for s in r['slowFrames'] if inb(s[2])) for r in rows]} finalY {sorted(set(r['finalY'] for r in rows))} movingMin {min(r['movingFrames'] for r in rows)}")
PY
grep -E 'Tests|Test Files' "$B/s6-sp-unit.log" | sed 's/\x1b\[[0-9;]*m//g' | sed 's/^/K11 s6 unit /'
sed 's/^/K12 built CSS (saved from the tune build at planning) /' "$B/built-css-classes-s6.txt"
sha256sum "$L/b-round-467/probe/store-scroll-probe.cjs" "$L/b-round-468/store-scroll-probe-full.cjs" "$L/b-round-468/look-probe2.cjs" "$L/b-round-468/look-profile.cjs" | awk '{print "K13", substr($1,1,16), $2}'
cd "$L" && python3 -I tools/l58-check.py current-task.md | sed 's/^/K14 /'
echo "K15 lessons.md lines $(wc -l < $L/lessons.md)"
