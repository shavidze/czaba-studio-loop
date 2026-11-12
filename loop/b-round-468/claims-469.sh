#!/usr/bin/env bash
# Claims for current-task.md round 469 (SABA-B-15 stage 2). Run from anywhere: bash claims-469.sh
# Output must match claims-469-planning-output.txt except K1 (status lines: 4 after A) and K9 (--check fails once the diff is applied). K6/K16 read 9ba13ac.
S=/home/runner/czaba-project/store; L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-468
cd "$S" || exit 2
echo "K1 HEAD $(git rev-parse --short HEAD); status lines $(git status --short --untracked-files=all | wc -l)"
echo "K2 gate468 $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-468.json'));print(g['status'],g.get('reason'),g['head'][:7])")"
echo "K3 HEAD glow lines: $(git show 9ba13ac:app/components/home/ProductSection.tsx | grep -n 'blur-\[1[02]0px\]' | cut -d: -f1 | tr '\n' ' ')ProductSection; $(git show 9ba13ac:app/components/home/StudioShowcase.tsx | grep -n 'blur-\[120px\]' | cut -d: -f1 | tr '\n' ' ')StudioShowcase"
for f in NewsletterSection SpecialOffersSection ProductSection StudioShowcase; do
  echo "K4 large blur (>=80px) hits at 9ba13ac components/home/$f.tsx: $(git show 9ba13ac:app/components/home/$f.tsx | grep -oE '(^|[^a-z-])blur-\[[0-9]+px\]' | grep -oE '[0-9]+' | awk '$1>=80' | wc -l)"
done
echo "K5 home route mounts: $(grep -nE '<(ProductSection|StudioShowcase|NewsletterSection|SpecialOffersSection)' app/routes/_index.tsx | sed -E 's/^([0-9]+):\s*<([A-Za-z]+).*/\2:\1/' | tr '\n' ' ')"
echo "K6 doc 305 free at 9ba13ac: $(git ls-tree --name-only 9ba13ac docs/implementation/2026/quarter-IV/ | sed 's#.*/##' | grep -c '^305-'); highest $(git ls-tree --name-only 9ba13ac docs/implementation/2026/quarter-IV/ | sed 's#.*/##' | sort | tail -1)"
echo "K7 regression-last $(python3 -I -c "import json;print(json.load(open('$L/regression-last.json'))['date'])")"
sha256sum -c --quiet "$L/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K8 protected rc $?"
git -c core.quotepath=off apply --check "$B/sketch-469.diff.txt" 2>&1 | head -3; echo "K9 sketch-469.diff.txt applies to the store tree: rc ${PIPESTATUS[0]}; files: $(grep '^+++ ' $B/sketch-469.diff.txt | awk '{print $2}' | sed 's#^b/##' | tr '\n' ' ')"
for f in sketch-469.diff.txt sketch2.diff.txt store-scroll-probe-full.cjs store-scroll-probe-full.sha256 look-probe.cjs look-probe2.cjs look-profile.cjs look2.json look2-profile.txt look-summary.txt scroll-sketch-frozen.json scroll-sketch2-frozen.json scroll-head-full.json scroll-sketch-full.json scroll-sketch2-full.json full-summary.txt sketch2-frames-summary.txt sketch2-full-slowframes.txt sp-sketch2.log sp-mutant-head.log vitest-sketch2-scans.log built-css-classes.txt pd-ruling.md; do
  test -f "$B/$f" && echo "K10 exists $f" || echo "K10 MISSING $f"
done
python3 -I - "$B" <<'PY'
import json,sys,os,statistics as st
B=sys.argv[1]
for f in ['scroll-sketch2-frozen.json','scroll-sketch-frozen.json','scroll-head-full.json','scroll-sketch-full.json','scroll-sketch2-full.json']:
  d=json.load(open(os.path.join(B,f)))
  for path in sorted({r['path'] for r in d['rows']}):
    for vp in ('1440x900','1280x720'):
      rs=[r for r in d['rows'] if r['path']==path and r['viewport']==vp]
      o=[r['movingOver33'] for r in rs]; m=[r['movingFrames'] for r in rs]; fy=sorted({r['finalY'] for r in rs}); mx=sorted({r['maxScroll'] for r in rs})
      print(f"K11 {f} {path} {vp} over33 {o} median {st.median(o)} moving {min(m)}-{max(m)} finalY {fy} maxScroll {mx}")
PY
grep -E 'sketch2? ' "$B/look2-profile.txt" | sed -E 's/ glows .*//' | sed 's/^/K12 /'
echo "K13 sp-sketch2 $(grep -oE 'Tests +[^(]+' $B/sp-sketch2.log | sed 's/\x1b\[[0-9;]*m//g' | tr -s ' ' | head -1); sp-mutant-head $(sed 's/\x1b\[[0-9;]*m//g' $B/sp-mutant-head.log | grep -oE 'Tests +[0-9]+ failed \| [0-9]+ passed' | head -1); scans $(sed 's/\x1b\[[0-9;]*m//g' $B/vitest-sketch2-scans.log | grep -oE '(Test Files|Tests) +[0-9]+ passed' | tr '\n' ' ')"
echo "K14 probe shas: $(cd $L/b-round-467/probe && sha256sum -c store-scroll-probe.sha256 2>&1 | tr '\n' ' ') $(cd $B && sha256sum -c store-scroll-probe-full.sha256 2>&1 | tr '\n' ' ')"
echo "K15 built CSS (sketch2): $(grep '^sketch2' $B/built-css-classes.txt | awk '{print $2"="$3}' | tr '\n' ' ')"
echo "K16 SWEEP old glow tokens in test roots at 9ba13ac: $(git grep -lE 'blur-\[1[02]0px\]|bg-brand/5 blur|bg-accent/5 blur|bg-brand/20 blur' 9ba13ac -- 'app/**/*.test.*' e2e perf 2>/dev/null | wc -l) files; importers of the 2 sections in tests at 9ba13ac: $(git grep -lE 'components/home/(ProductSection|StudioShowcase)' 9ba13ac -- 'app/**/*.test.*' | sed 's#^9ba13ac:##' | tr '\n' ' ')"
echo "K17 forbidden root.tsx/app/styles/useSmoothScroll: $(python3 -I -c "import json;f=json.load(open('$L/backlog.json'))['global_forbidden_files'];print('app/root.tsx' in f,'app/styles/**' in f)") useSmoothScroll duration-1.2 $(grep -c 'duration: 1.2' app/hooks/useSmoothScroll.ts)"
echo "K18 lessons lines $(wc -l < $L/lessons.md); L18 scroll clause $(grep -c 'Scroll frames (D-29z1648)' $L/lessons.md)"
