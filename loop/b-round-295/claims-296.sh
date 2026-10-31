#!/usr/bin/env bash
# Round 296 claims (run from store/). Before A edits, output must equal b-round-295/claims-296-output.txt.
# After A's change, allowed deltas = b-round-295/claims-296-after-sketch.txt (the same script on B's sketch-applied scratch copy) plus K2/K3/K14 as listed in current-task.md section 6.
L=${CLAIMS_LOOP:-../tmp/studio-real-loop}
echo "K1 HEAD $(git rev-parse --short HEAD); gate295 $(python3 -c "import json;g=json.load(open('$L/gates/gate-round-295.json'));print(g['status'], g['commit'][:7])")"
echo "K2 status lines $(git status --short --untracked-files=all | wc -l)"
echo "K3 frozen $(wc -l < $L/b-round-295-r296-tree-sha256.txt) rc $(sha256sum -c --quiet $L/b-round-295-r296-tree-sha256.txt >/dev/null 2>&1; echo $?)"
for f in app/routes/studio.\$productId.tsx app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/auth.ts app/contexts/AuthContext.tsx app/lib/firebase.client.ts app/services/api/client.ts; do echo "K4 $f $(grep -cF "  $f" $L/b-round-295-r296-tree-sha256.txt)"; done
X=app/contexts/ArrangementContext.tsx
echo "K5 provider prop initialSelectedSourceId: $(grep -c 'initialSelectedSourceId' $X); default selection line: $(grep -n 'collection.sources\[0\]?.id ?? null' $X | cut -d: -f1 | tr '\n' ' ')"
R=app/routes/studio-lab.tsx
echo "K6 studio-lab useSearchParams: $(grep -c 'useSearchParams' $R); exit focus effect: $(grep -c "arrangement-exit" $R); preview focus: $(grep -c 'data-source-id' $R)"
S=app/components/product/ProductSidebar.tsx
echo "K7 sidebar artist link at l.$(grep -n "by {product.vendor || 'CZABA'}" $S | cut -d: -f1); 'Try it in the Studio' in app: $(grep -rn 'Try it in the Studio' app | wc -l); product-studio-link testid: $(grep -rn 'product-studio-link' app | wc -l)"
for t in studio-theme-obsidian ssr-layout-effect studio-narrow-gate-ui default-track-names-ssr; do echo "K8 $t useSearchParams mock: $(grep -c 'useSearchParams' app/lib/arrangement/__tests__/$t.test.tsx)"; done
echo "K9 SWEEP new ids (app perf e2e): LK $(grep -rnE '\bLK[0-9]+' app perf e2e | wc -l); studio-lab-links refs $(grep -rln 'studio-lab-links' app | sort | tr '\n' ' ')"
echo "K10 first demo source: $(grep -n "id: 'demo-" app/data/studio-lab-demo.ts | head -1 | tr -s ' ')"
echo "K11 SWEEP importers of routes/studio-lab: $(grep -rln "routes/studio-lab'" app | sort | tr '\n' ' ')"
echo "K12 SWEEP non-test ArrangementProvider render sites: $(grep -rln '<ArrangementProvider' app | grep -v __tests__ | sort | tr '\n' ' ')"
echo "K13 lines: ctx $(wc -l < $X) route $(wc -l < $R) sidebar $(wc -l < $S) obs $(wc -l < app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx) ssr $(wc -l < app/lib/arrangement/__tests__/ssr-layout-effect.test.tsx) ng $(wc -l < app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx) dtn $(wc -l < app/lib/arrangement/__tests__/default-track-names-ssr.test.tsx)"
echo "K16 redo keys: $(grep -c "keys: \['Ctrl+Shift+Z', 'Ctrl+Y'\]" app/lib/arrangement/shortcuts.ts); clip root attr data-clip-id: $(grep -c 'data-clip-id={clip.id}' app/components/arrangement/ArrangementClip.tsx)"
echo "K14 docs starting 220: $(ls docs/implementation/2026/quarter-IV/ | grep -c '^220')"
echo "K15 B artifacts: $(for p in b-round-295/sketch-studio-link-a.diff b-round-295/sketch-covering-run.log b-round-295/collision-before-mocks.log b-round-295/mutant-a-no-focus.log b-round-295/mutant-b-no-initial.log b-round-295/mutant-c-plain-object.log b-round-295/mutant-d-link-always.log b-round-295/probe/journey.cjs b-round-295/probe/journey-sketch.json b-round-295/probe/journey-sketch2.json b-round-295/probe/journey-head.json b-round-295/backlog-before-296.json; do test -f $L/$p && echo -n 'ok ' || echo -n "MISSING:$p "; done)"
