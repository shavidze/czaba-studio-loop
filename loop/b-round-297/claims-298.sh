#!/usr/bin/env bash
# Round 298 claims (run from store/). Before A edits, output must equal b-round-297/claims-298-output.txt.
# After A's change, allowed deltas = b-round-297/claims-298-after-sketch.txt (K5, K6, K8, K10) plus K2/K3 as listed in current-task.md.
L=${CLAIMS_LOOP:-../tmp/studio-real-loop}
T=app/lib/arrangement/__tests__
H=$T/studio-link-hydrate-ui.test.tsx
N=$T/studio-link-hydrate-ssr-ui.test.tsx
D=docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md
echo "K1 HEAD $(git rev-parse --short HEAD 2>/dev/null); gate297 $(python3 -c "import json;g=json.load(open('$L/gates/gate-round-297.json'));print(g['status'], g['commit'][:7])")"
echo "K2 status lines $(git status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 frozen $(wc -l < $L/b-round-297-r298-tree-sha256.txt) rc $(sha256sum -c --quiet $L/b-round-297-r298-tree-sha256.txt >/dev/null 2>&1; echo $?)"
for f in app/routes/studio.\$productId.tsx app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/auth.ts app/contexts/AuthContext.tsx app/lib/firebase.client.ts app/services/api/client.ts; do echo "K4 $f $(grep -cF "  $f" $L/b-round-297-r298-tree-sha256.txt)"; done
echo "K5 hydrate-ui: LH rows $(grep -oE "it\('LH[0-9]+" $H | tr '\n' ' '); hydrationWarnings helper $(grep -c 'function hydrationWarnings' $H); old regex $(grep -c "/hydrat|did not match|didn't match/i" $H); mountedRouteUnmounts $(grep -c 'mountedRouteUnmounts' $H)"
echo "K6 ssr file exists $(test -f $N && echo 1 || echo 0); LH rows $(test -f $N && grep -oE "it\('LH[0-9]+" $N | tr '\n' ' '); narrowed regex $(test -f $N && grep -c '/did not match|Expected server HTML|Hydration failed/i' $N || echo 0); SWEEP refs to studio-link-hydrate-ssr in app perf e2e $(grep -rl 'studio-link-hydrate-ssr' app perf e2e 2>/dev/null | wc -l)"
echo "K7 react-dom $(node -e "console.log(require('react-dom/package.json').version)"); dedupe flag decl $(grep -c '^var didWarnInvalidHydration = false;' node_modules/react-dom/cjs/react-dom.development.js)"
echo "K8 doc 220: l.4 $(sed -n 4p $D); 'STUDIO-LINK-b (რაუნდი 297)' $(grep -c 'STUDIO-LINK-b (რაუნდი 297)' $D); 'hydration warning-ის გარეშე' $(grep -c 'hydration warning-ის გარეშე' $D); GATE297-S5-VIDEO-MUTED-SSR $(grep -c 'GATE297-S5-VIDEO-MUTED-SSR' $D)"
echo "K9 video dock bare muted JSX lines $(grep -cE '^\s+muted$' app/components/arrangement/ArrangementVideoDock.tsx); NG9 muted tolerance $(grep -c "args\[1\] !== 'muted'" $T/studio-narrow-gate-ui.test.tsx)"
echo "K10 lines: hydrate-ui $(wc -l < $H) ssr $(test -f $N && wc -l < $N || echo 0) doc220 $(wc -l < $D)"
echo "K11 B artifacts: $(for p in b-round-297/sketch-studio-link-hydrate-ssr-ui.test.tsx.txt b-round-297/sketch-studio-link-hydrate-ui.test.tsx.txt b-round-297/sketch-220-studio-link-deep-link.md.txt b-round-297/sketch.patch b-round-297/sketch-covering-run.log b-round-297/sketch-tsc.log b-round-297/mutant-h-option-mismatch.py b-round-297/mutant-h-option-mismatch.log b-round-297/mutant-h-at-head-file.log b-round-297/mutant-e-no-prop.log b-round-297/mutant-g-no-settle.log b-round-297/vacuity-identity-order.log b-round-297/mutant-i-spy-before-render.log b-round-297/product-designer-studio-link-b.md; do test -f $L/$p && echo -n 'ok ' || echo -n "MISSING:$p "; done)"
