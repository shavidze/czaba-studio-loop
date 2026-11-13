#!/usr/bin/env bash
# Round 482 claims (B planning 2026-11-12T23:47Z, REGRESSION-2026-11-13 part 1). STORE_ROOT=<copy> to run on a copy.
S=${STORE_ROOT:-/home/runner/czaba-project/store}
LOOP=/home/runner/czaba-project/tmp/studio-real-loop
L=$LOOP/b-round-481
cd "$S" || exit 2
echo "K1 HEAD $(git rev-parse --short HEAD 2>/dev/null)"
echo "K2 status-lines $(git status --short --untracked-files=all | wc -l)"
echo "K3 frozen-manifest-rc $(sha256sum -c --quiet $L/r482-tree-sha256.txt >/dev/null 2>&1; echo $?) entries $(wc -l < $L/r482-tree-sha256.txt)"
echo "K4 protected-rc $(sha256sum -c --quiet $LOOP/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K5 regression-last $(tr -d '\n' < $LOOP/regression-last.json | grep -oE '"date":"[0-9-]+","round":[0-9]+')"
echo "K6 gate-481 $(grep -oE '"status": "[a-z]+"' $LOOP/gates/gate-round-481.json) $(grep -oE '"commit": "[0-9a-f]{7}' $LOOP/gates/gate-round-481.json)"
echo "K7 perf-last-change $(git log -1 --format=%h -- perf/)"
echo "K8 strings clip-origin $(grep -c "sourceOffsetLabel: 'Clip origin'" app/lib/arrangement/strings.ts) from $(grep -c "rangeFromLabel: 'From'" app/lib/arrangement/strings.ts) to $(grep -c "rangeToLabel: 'To'" app/lib/arrangement/strings.ts)"
echo "K9 footer-Link $(grep -c '<Link' app/components/layout/Footer.tsx) link-focus $(test -f app/lib/link-focus.ts && echo exists || echo absent)"
echo "K10 entrance-bg-token $(grep -c 'background:var(--color-background)' app/components/loading/EntranceCover.tsx)"
echo "K11 font-sans-instrument $(grep -c "^  --font-sans: 'Instrument Sans'" app/styles/app.css)"
echo "K12 home-blur-glows $(cat app/components/home/ProductSection.tsx app/components/home/StudioShowcase.tsx | grep -c 'blur(1[02]0px)')"
echo "K13 orders-href-store $(grep -c 'href="/store"' app/routes/account.orders.tsx) downloads-href-music $(grep -c "'/music'" app/routes/account.downloads.tsx)"
echo "K14 repeat-safe-importers $(grep -ln 'studio-repeat-safe' app/components/arrangement/*.tsx | wc -l)"
echo "K15 hue-scan $(python3 -I $LOOP/b-round-473/scan/hue-scan-v2.py $S/app /tmp/hue-482-$$.txt | tail -1) equal-474 $(diff -q <(sort $LOOP/c-round-474/hue-scan.txt) <(sort /tmp/hue-482-$$.txt) >/dev/null && echo yes || echo NO)"
rm -f /tmp/hue-482-$$.txt
cd "$LOOP" || exit 2
for a in \
 c-round-426/probe/held-enter-2a.mjs c-round-426/probe/compare.py c-round-426/probe/sketch \
 c-round-427/probe/held-enter-2bi.mjs c-round-427/probe/compare.py c-round-427/probe/sketch \
 c-round-428/probe/held-enter-2bii.mjs c-round-428/probe/compare.py c-round-428/probe/sketch \
 c-round-429/b428copy/probe/held-enter-s5.mjs c-round-429/b428copy/probe/compare.py c-round-429/b428copy/probe/sketch \
 c-round-430/probe/spin-probe.mjs c-round-430/probe/compare.py c-round-430/probe/after \
 c-round-431/probe/radio-probe.mjs c-round-431/probe/radio-extra-probe.mjs c-round-431/probe/compare-radio.py c-round-431/probe/compare-extra.py c-round-431/probe/after c-round-431/probe/after-extra \
 c-round-432/probe/progress-probe.mjs c-round-432/probe/compare-progress.py c-round-432/probe/after \
 c-round-433/probe/clear-probe.mjs c-round-433/probe/compare-clear.py c-round-433/probe/after \
 c-round-434/probe/scrollbar-probe.mjs c-round-434/probe/compare-scrollbar.py c-round-434/probe/after \
 b-round-435/probe/copy-probe.mjs c-round-436/probe/copy-probe.json \
 b-round-436/probe/vis-probe.mjs b-round-436/probe/summarize.py c-round-437/vis/summary.txt b-round-436/probe/narrow-probe.mjs \
 b-round-441/probe/ime-sites.mjs b-round-441/probe/compare.py b-round-442/probe/ime-held.mjs b-round-442/probe/compare-held.py b-round-442/probe/plain-held.mjs b-round-442/probe/compare-plain.py \
 b-round-443/probe/ime-stage2.mjs b-round-443/probe/compare.py b-round-443/probe/focus-targets.mjs b-round-443/probe/compare-c7.py \
 b-round-444/probe/held-escape-video.mjs b-round-444/probe/compare-video.py \
 c-round-445/sites.json c-round-445/held.json c-round-445/stage2.json c-round-445/head-merged.json c-round-444/c7-tree.json c-round-443/plain-tree.json \
 b-round-445/probe/lm-routes.cjs c-round-446/tree-all.json \
 c-round-474/browser.mjs c-round-474/browser.json \
 b-round-474/probe/probe-rows.mjs c-round-475/rows.json c-round-475/card.json \
 b-round-454/probe/seek-probe.mjs \
 b-round-475/probe/probe-entrance.mjs c-round-477/probe-c477.json c-round-477/journey.mjs b-round-458/probe/entrance-timing.mjs \
 b-round-478/probe/nav-probe-sketch.mjs c-round-479/nav.json \
 c-round-481/c481.mjs c-round-481/c481-out.json \
 b-round-467/probe/store-scroll-probe.cjs b-round-468/store-scroll-probe-full.cjs b-round-468/look-probe2.cjs b-round-468/look-profile.cjs \
 b-round-470/type-probe.cjs \
 c-round-448/hire-us-page.cjs \
 c-round-424/perf-results b-round-334/vitest.perf-lib.config.mjs \
 c-round-389/tools/journey.cjs c-round-389/tools/auth-smoke.mjs c-round-386/export-wav.mjs \
 mock-api/server.mjs tools/l57-check.py \
 b-round-481/hue-scan-751e30e.txt b-round-481/r482-tree-sha256.txt b-round-481/checkpoint.md \
 tasks/round-481.md tasks/round-423.md tasks/round-425.md \
 b-round-474/probe/probe-card.mjs c-round-445/plain-tree.json c-round-430/probe/head c-round-431/probe/head \
 b-round-481/probe/store-colour-482.mjs b-round-481/probe/compare-store-colour.py b-round-481/probe/store-colour-751e30e.json b-round-481/probe/rows-751e30e.json b-round-481/probe/card-751e30e.json b-round-481/probe/ime-sites.json b-round-481/probe/p430/sketch b-round-481/probe/p426/sketch ; do
  echo "K16 $a $(test -e $a && echo exists || echo MISSING)"
done
echo "K17 smoke-script $(grep -c '"test:e2e:smoke"' /home/runner/czaba-project/store/package.json) perf-script $(grep -c '"test:perf"' /home/runner/czaba-project/store/package.json)"
