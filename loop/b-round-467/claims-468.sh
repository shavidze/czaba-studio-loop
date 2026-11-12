#!/usr/bin/env bash
# Claims for current-task.md round 468 (SABA-B-15). Run from anywhere: bash claims-468.sh
S=/home/runner/czaba-project/store; L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-467
cd "$S" || exit 2
echo "K1 HEAD $(git rev-parse --short HEAD); status lines $(git status --short --untracked-files=all | wc -l)"
echo "K2 gate467 $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-467.json'));print(g['status'],g['commit'][:7])")"
echo "K3 useSmoothScroll duration-1.2 $(grep -c 'duration: 1.2' app/hooks/useSmoothScroll.ts) requestAnimationFrame $(grep -c 'requestAnimationFrame' app/hooks/useSmoothScroll.ts) cancelAnimationFrame $(grep -c 'cancelAnimationFrame' app/hooks/useSmoothScroll.ts) autoRaf $(grep -c 'autoRaf' app/hooks/useSmoothScroll.ts) reducedMotion $(grep -ci 'reduced' app/hooks/useSmoothScroll.ts)"
echo "K4 root.tsx useSmoothScroll() call lines: $(grep -n 'useSmoothScroll();' app/root.tsx | cut -d: -f1 | tr '\n' ' ')"
echo "K5 LeadMagnet key $(grep -c "STORAGE_KEY = 'czaba_lead_magnet'" app/hooks/useLeadMagnet.ts)"
echo "K6 app.css Lenis selectors l.1-24: $(sed -n '1,24p' app/styles/app.css | grep -c 'lenis')"
echo "K7 data-lenis-prevent sites: $(grep -rn 'data-lenis-prevent' app --include=*.tsx | grep -v __tests__ | sed -E 's/:([0-9]+):.*/:\1/' | tr '\n' ' ')"
echo "K8 lenis version $(python3 -I -c "import json;print(json.load(open('node_modules/lenis/package.json'))['version'])")"
echo "K9 SWEEP useSmoothScroll|lenis in test roots (app/**/__tests__, perf/**, e2e/**): $(grep -rlE 'useSmoothScroll|lenis' app --include=*.test.* perf e2e 2>/dev/null | tr '\n' ' ')"
echo "K10 importers of useSmoothScroll in app/**: $(grep -rln 'useSmoothScroll' app | grep -v __tests__ | sort | tr '\n' ' ')"
echo "K11 doc 305 free: $(ls docs/implementation/2026/quarter-IV/ | grep -c '^305-'); highest $(ls docs/implementation/2026/quarter-IV/ | sort | tail -1)"
echo "K12 regression-last $(python3 -I -c "import json;print(json.load(open('$L/regression-last.json'))['date'])")"
echo "K13 forbidden root.tsx/app/styles: $(python3 -I -c "import json;f=json.load(open('$L/backlog.json'))['global_forbidden_files'];print('app/root.tsx' in f,'app/styles/**' in f)")"
sha256sum -c --quiet "$L/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K14 protected rc $?"
echo "K15 probe sha: $(cd $B/probe && sha256sum -c store-scroll-probe.sha256 store-scroll-floor-probe.sha256 2>&1 | tr '\n' ' ')"
for f in probe/store-scroll-probe.cjs probe/scroll-prod-9ba13ac-cpu1.json probe/scroll-dev-9ba13ac-cpu1.json probe/HEAD-BUILD.txt probe/build-head.log probe/bisect-b.md probe/scroll-prod-lenis-off-cpu1.json probe/scroll-prod-header-noblur-cpu1.json probe/scroll-prod-hero-noblur-cpu1.json probe/scroll-prod-hero-noautoplay-cpu1.json probe/free-downloads-fullpage.png probe/free-downloads-content.json probe/store-scroll-floor-probe.cjs probe/scroll-prod-floor-allhidden-cpu1.json; do test -f "$B/$f" && echo "K16 exists $f" || echo "K16 MISSING $f"; done
python3 -I - "$B/probe" <<'PY'
import json,sys,os,statistics as st
P=sys.argv[1]
for f in ['scroll-prod-9ba13ac-cpu1.json','scroll-prod-lenis-off-cpu1.json','scroll-prod-header-noblur-cpu1.json','scroll-prod-hero-noblur-cpu1.json','scroll-prod-hero-noautoplay-cpu1.json','scroll-prod-floor-allhidden-cpu1.json']:
  d=json.load(open(os.path.join(P,f)))
  for path in ('/','/free-downloads'):
    for vp in ('1440x900','1280x720'):
      rs=[r for r in d['rows'] if r['path']==path and r['viewport']==vp]
      o=[r['movingOver33'] for r in rs]; m=[r['movingFrames'] for r in rs]; fy=sorted({r['finalY'] for r in rs})
      print(f"K17 {f} {path} {vp} over33 {o} median {st.median(o)} moving {min(m)}-{max(m)} finalY {fy}")
PY
python3 -I - "$B/probe/scroll-dev-9ba13ac-cpu1.json" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
names=sorted({(s['src'],s['fn']) for r in d['rows'] if r['path']=='/' for l in r['loaf'] for s in l['scripts']})
print("K18 dev / LoAF script attribution:", names)
PY
echo "K19 l58: $(python3 -I $L/tools/l58-check.py $L/current-task.md 2>&1 | tail -1)"
for n in lenis-off header-noblur hero-noblur hero-noautoplay; do f=$B/probe/$n.diff.txt; git -C "$S" apply --check "$f" >/dev/null 2>&1; echo "K20 $n apply-check rc $? files $(grep -c '^+++ ' "$f") changed-lines $(grep -cE '^[-+][^-+]' "$f")"; done
echo "K21 loop folder git toplevel: $(git -C "$L" rev-parse --show-toplevel 2>/dev/null || echo none)"
python3 -I - "$B/probe/scroll-prod-9ba13ac-cpu1.json" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
ys=sorted(y for r in d['rows'] if r['path']=='/' for (_,_,y) in r['slowFrames'])
print("K22 HEAD / slow-frame scrollY values:", ys)
PY
