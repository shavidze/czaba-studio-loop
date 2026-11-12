#!/usr/bin/env bash
# B round 476 -> 477 claims. Read-only for the store tree. CLAIMS_STORE=<tree> runs it on another tree.
# Round 477 re-dispatches round 476 (DPG-P0-3a) on the preserved tree: edeba5a + sketch-476 applied + doc 309.
L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-475; B6=$L/b-round-476; S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
cd "$S" || exit 2
SL=app/components/loading/SpotlightLoader.tsx; EC=app/components/loading/EntranceCover.tsx; HD=app/components/layout/Header.tsx; ET=app/lib/__tests__/store-entrance-loader.test.tsx; HT=app/lib/__tests__/store-header-footer.test.tsx
DOC=docs/implementation/2026/quarter-IV/309-dpg-p0-3a-entrance-logo-brass.md
echo "K1 HEAD $(git rev-parse --short=7 HEAD) status_lines $(git status --short --untracked-files=all | wc -l)"
git status --short --untracked-files=all | sed 's/^/K1 path /'
echo "K2 sketch files sha256 -c: $(sha256sum -c $B/sketch-476-files-sha256.txt 2>&1 | grep -c ': OK$') OK of $(grep -c '' $B/sketch-476-files-sha256.txt)"
git apply -R --check -p1 $B/sketch-476.patch.txt 2>/dev/null && echo "K2b sketch reverse-check rc0 (sketch is applied)" || echo "K2b sketch reverse-check FAIL"
echo "K3 loader literals: rgba255=$(grep -c 'rgba(255,255,255' $SL) rgba000=$(grep -c 'rgba(0,0,0' $SL) hash000=$(grep -c "'#000'" $SL) bg-black=$(grep -c 'bg-black' $SL) brand-rgb=$(grep -o 'rgba(var(--color-brand-rgb)' $SL | wc -l) Math.random=$(grep -c 'Math.random' $SL)"
echo "K4 loader wordmark brand: $(grep -c 'text-5xl md:text-7xl font-bold text-brand' $SL)"
echo "K5 cover css color-background: $(grep -c 'background:var(--color-background)' $EC)"
echo "K6 header wordmark brand: $(grep -c 'tracking-tighter text-brand' $HD)"
echo "K8 row ids: P=$(grep -cE "^  it\('P[1-4] " $ET) N3c=$(grep -c "it('N3c " $HT)"
echo "K9 protected diff vs edeba5a: $(git diff --name-only edeba5a -- app/routes/studio.\$productId.tsx app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/contexts app/root.tsx app/components/studio app/styles public package.json package-lock.json .claude | wc -l)"
echo "K10 footer wordmark (unchanged): $(grep -c 'text-2xl font-extrabold text-brand' app/components/layout/Footer.tsx)"
echo "K21 R1 overlay in tree: inline=$(grep -c "style={{ backgroundColor: 'var(--color-background)' }}" $SL) child=$(grep -c '<div className="absolute inset-0 bg-background" />' $SL)"
echo "K22 R1 same structure at HEAD: inline=$(git show edeba5a:$SL | grep -c "style={{ backgroundColor: '#000' }}") child=$(git show edeba5a:$SL | grep -c '<div className="absolute inset-0 bg-black" />')"
echo "K23 doc 309 l.4: $(sed -n 4p $DOC)"
echo "K24 doc 309 names D-29z1688: $(grep -c 'D-29z1688' $DOC)"
echo "K11 hue scan app/: $(python3 -I $L/b-round-473/scan/hue-scan-v2.py app /tmp/claims477-hue.txt | tail -1)"
echo "K14 B mutants: $(grep -c ' RED ' $B/mutants/b-run/summary.txt) of $(grep -c '' $B/mutants/b-run/summary.txt) red"
for f in sketch-476.patch.txt sketch-476-files-sha256.txt sketch-review.md pd-p0-3a.md covering-476.txt precheck-covering.log mutants/mutants.py mutants/b-run/summary.txt probe/probe-entrance.mjs probe/contrast-wordmark.mjs probe/probe-head.json probe/probe-sketch.json probe/contrast-wordmark.json probe/warm.mjs ../b-round-458/probe/entrance-timing.mjs; do test -f $B/$f && echo "K19 exists $f" || echo "K19 MISSING $f"; done
cd $L && python3 -I tools/l58-check.py current-task.md $B6/l58-check.txt | tail -1
