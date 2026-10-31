#!/usr/bin/env bash
# Round 281 claims (L29). Run from store/ (or a clean `git archive 145f6c1` copy). Each block prints "== K#" then its output.
set -u
echo "== K1 HEAD"; git rev-parse --short HEAD 2>/dev/null || echo "(archive)"
echo "== K2 waitForCollectionReady body"; grep -n -A10 '^export async function waitForCollectionReady' perf/lib/page.ts
echo "== K3 waitForCollectionReady callers (roots app perf e2e)"; grep -rn 'waitForCollectionReady(' app perf e2e
echo "== K4 load step and catch path"; grep -n "let step = 'load'\|aborted at \${step}" perf/studio-lab.perf.spec.ts perf/studio-lab-interactions.perf.spec.ts
echo "== K5 demo failed copy"; grep -n -A4 '^  failed: (count) =>' app/lib/arrangement/collection.ts | head -5
echo "== K6 status testid render"; grep -rn 'data-testid="arrangement-status"' app --include=*.tsx | grep -v __tests__
echo "== K7 ready pattern"; grep -n -A2 '^export const perfCollectionReadyPattern' perf/lib/app-labels.ts
echo "== K8 emptyLanePointAfterClip throws and return"; grep -n "found.ownTrack\|return { x: found.point.x" perf/studio-lab-interactions.perf.spec.ts
echo "== K9 click-live detail keys"; grep -n -A7 "put('interact.harness.click-live'" perf/studio-lab-interactions.perf.spec.ts
echo "== K10 PerfSample detail type"; grep -n 'detail?: Record' perf/lib/report.ts
echo "== K11 perf outside vitest and biome (L30)"; grep -n "include" vitest.config.ts biome.json | grep -n "app/\*\*"
echo "== K12 doc 208 round-281 TODO"; grep -n 'round 281' docs/implementation/2026/quarter-IV/208-perf-harness-state-waits.md
echo "== K13 In Progress (stage"; grep -rn 'In Progress (stage' docs/implementation | wc -l
echo "== K14 last doc number"; ls docs/implementation/2026/quarter-IV | tail -1
echo "== K15 'Stems lane' click texts"; grep -n 'empty Stems lane' perf/studio-lab-interactions.perf.spec.ts perf/budgets.interactions.json | cut -c1-120
echo "== K16 resources spec ready wait (no waitForCollectionReady)"; grep -c 'waitForCollectionReady' perf/studio-lab-resources.perf.spec.ts
echo "== SW-A new names (roots app perf e2e; HEAD expect 0)"; grep -rnE 'perfCollectionFailedPattern|perfCollectionSettledPattern|countedTemplatePattern|EmptyLanePoint|emptyLaneTrackId|clipTrackId' app perf e2e | wc -l
echo "== SW-B consumers of the ready pattern / status testid in tests (roots app perf e2e)"; grep -rln "perfCollectionReadyPattern\|arrangement-status" app perf e2e | sort
echo "== SW-C consumers of click-live detail keys (roots app perf e2e)"; grep -rln 'faderDisabledBeforeClick' app perf e2e | sort
echo "== K17 three copies of the library ready predicate"; grep -n "polling: 'raf', timeout: 90000" perf/*.ts
echo "== K18 measure-load signatures"; grep -n "^async function measureLoad" perf/*.ts
echo "== K19 resources predicate returns a boolean, caller ignores it"; sed -n '/^async function measureLoadReady(page: Page): Promise<void> {/,/^}/p' perf/studio-lab-resources.perf.spec.ts | grep -n "await page.waitForFunction\|wave !== null;"
echo "== K20 doc 169 names measureLoadReady in its approach"; grep -n 'measureLoadReady' docs/implementation/2026/quarter-IV/169-perf-resources-baseline.md
echo "== SW-D new helper names (roots app perf e2e; HEAD expect 0)"; grep -rnE 'waitForLibraryReady|LibraryReadyState' app perf e2e | wc -l
