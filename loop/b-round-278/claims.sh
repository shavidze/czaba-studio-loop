#!/usr/bin/env bash
# Run from store/ at HEAD 873d835 (or on a clean archive of it). Output must equal claims-output-at-873d835.txt.
set -u
echo "== K1 fixed waits in perf/**"; grep -nE "waitForTimeout\(" perf/*.ts perf/lib/*.ts
echo "== K2 idleSettleMs constants"; grep -nE "const idleSettleMs" perf/*.ts
echo "== K3 hardcoded lane"; grep -nE "emptyLanePoint\(" perf/*.ts
echo "== K4 sequence text names the Stems lane"; grep -nE "empty Stems lane click" perf/*.ts
echo "== K5 fixture tracks"; grep -nE "^  (music|stems|sfx): " perf/lib/app-labels.ts
echo "== K6 export observer / timeOrigin / pollLoop / try"; grep -nE "new MutationObserver|const timeOrigin =|const pollLoop =|^  try \{|was not released" perf/studio-lab-resources.perf.spec.ts
echo "== K7 waitForQuiet cap returns like quiet"; grep -nE "now - start >= cap|if \(quiet\) return nowIn" perf/lib/page.ts
echo "== K8 perf timeout"; grep -nE "timeout: 15 \* 60 \* 1000" playwright.perf.config.ts
echo "== K9 vitest include"; grep -nE "include:" vitest.config.ts
echo "== K10 budgets notes naming the settle and the 2 s window"; grep -cE "1 s settle|2 s after the Add|2000" perf/budgets.json
echo "== K11 last implementation doc"; ls docs/implementation/2026/quarter-IV | tail -1
echo "== K12 docs that describe these waits"; grep -lnE "idleSettleMs|waitForQuiet|hook-live|emptyLanePoint|mem-polls" docs/implementation/2026/quarter-IV/*.md | sort
echo "== SW-A identifiers this round renames or removes, roots perf app e2e"; grep -rnE "emptyLanePoint|idleSettleMs|waitForQuiet\b" perf app e2e --include=*.ts --include=*.tsx | grep -v "^perf/studio-lab" | grep -v "^perf/lib/page.ts" ; echo "(end SW-A)"
echo "== K13 1a hook-live window"; grep -nE "waitForTimeout\(2000\)" perf/studio-lab.perf.spec.ts
echo "== K14 collection ready copy and prefix-append"; grep -nE "export function workspaceCollectionCopy|return \`\\\$\{settled\} \\\$\{current.slice|ready:$" app/lib/arrangement/collection.ts
echo "== K15 doc 168 hygiene ruling on the 1a 2000 ms wait"; grep -nE "2000" docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md
echo "== K16 idleSettleMs uses"; grep -nE "idleSettleMs" perf/*.ts
echo "== K17 status testid"; grep -rn 'data-testid="arrangement-status"' app/components | wc -l
