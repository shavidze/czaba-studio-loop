#!/usr/bin/env bash
# Round 297 claims (run from store/). Before A edits, output must equal b-round-296/claims-297-output.txt.
# After A's change, allowed deltas = b-round-296/claims-297-after-sketch.txt plus K2/K3 as listed in current-task.md.
L=${CLAIMS_LOOP:-../tmp/studio-real-loop}
echo "K1 HEAD $(git rev-parse --short HEAD); gate296 $(python3 -c "import json;g=json.load(open('$L/gates/gate-round-296.json'));print(g['status'], g['commit'][:7])")"
echo "K2 status lines $(git status --short --untracked-files=all | wc -l)"
echo "K3 frozen $(wc -l < $L/b-round-296-r297-tree-sha256.txt) rc $(sha256sum -c --quiet $L/b-round-296-r297-tree-sha256.txt >/dev/null 2>&1; echo $?)"
for f in app/routes/studio.\$productId.tsx app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/auth.ts app/contexts/AuthContext.tsx app/lib/firebase.client.ts app/services/api/client.ts; do echo "K4 $f $(grep -cF "  $f" $L/b-round-296-r297-tree-sha256.txt)"; done
R=app/routes/studio-lab.tsx
echo "K5 route: prop wiring $(grep -c 'initialSelectedSourceId={previewSourceId}' $R); isWide guard $(grep -c 'if (!isWide || previewSourceId === null' $R); settle line $(grep -c 'previewFocusSettledRef.current = true;' $R); lines $(wc -l < $R)"
echo "K6 demo collection export at l.$(grep -n 'export const studioLabDemoCollection' app/data/studio-lab-demo.ts | cut -d: -f1); first demo source $(grep -n "id: 'demo-" app/data/studio-lab-demo.ts | head -1 | tr -s ' ')"
echo "K7 NG9 hydration filter (muted tolerance) in narrow-gate: $(grep -c "args\[1\] !== 'muted'" app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx)"
echo "K8 doc 220 l.4: $(sed -n 4p docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md)"
echo "K9 SWEEP new ids (app perf e2e): LH $(grep -rnE '\bLH[0-9]+' app perf e2e | wc -l); hydrate test file exists $(test -f app/lib/arrangement/__tests__/studio-link-hydrate-ui.test.tsx && echo 1 || echo 0); studio-lab-demo vi.mock sites $(grep -rln "vi.mock('~/data/studio-lab-demo'" app | wc -l)"
echo "K10 lines: link-ui $(wc -l < app/lib/arrangement/__tests__/studio-link-ui.test.tsx) doc220 $(wc -l < docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md)"
echo "K11 B artifacts: $(for p in b-round-296/sketch-studio-link-hydrate-ui.test.tsx.txt b-round-296/sketch-covering-run.log b-round-296/sketch-tsc.log b-round-296/mutant-e-no-prop.log b-round-296/mutant-f-no-iswide.log b-round-296/mutant-g-no-settle.log b-round-296/probe/fv.cjs b-round-296/backlog-before-297.json; do test -f $L/$p && echo -n 'ok ' || echo -n "MISSING:$p "; done)"
