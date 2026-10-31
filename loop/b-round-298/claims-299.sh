#!/usr/bin/env bash
# Round 299 claims (run from store/). Before A edits, output must equal b-round-298/claims-299-output.txt.
# After A's change, allowed deltas = b-round-298/claims-299-after-sketch.txt (K5, K6, K8, K9, K10) plus K1/K2/K3 as listed in current-task.md.
L=${CLAIMS_LOOP:-../tmp/studio-real-loop}
T=app/lib/arrangement/__tests__
H=$T/studio-link-hydrate-ui.test.tsx
N=$T/studio-link-hydrate-ssr-ui.test.tsx
G=$T/studio-narrow-gate-ui.test.tsx
V=app/components/arrangement/ArrangementVideoDock.tsx
D=docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md
R=node_modules/react-dom/cjs/react-dom.development.js
echo "K1 HEAD $(git rev-parse --short HEAD 2>/dev/null); gate298 $(python3 -c "import json;g=json.load(open('$L/gates/gate-round-298.json'));print(g['status'], g['commit'][:7])")"
echo "K2 status lines $(git status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 frozen $(wc -l < $L/b-round-298-r299-tree-sha256.txt) rc $(sha256sum -c --quiet $L/b-round-298-r299-tree-sha256.txt >/dev/null 2>&1; echo $?)"
for f in app/routes/studio.\$productId.tsx app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/auth.ts app/contexts/AuthContext.tsx app/lib/firebase.client.ts app/services/api/client.ts; do echo "K4 $f $(grep -cF "  $f" $L/b-round-298-r299-tree-sha256.txt)"; done
echo "K5 hydrate-ui: LH rows $(grep -oE "it\('LH[0-9]+" $H | tr '\n' ' '); push-before-act $(grep -A1 'mountedRouteUnmounts.push(unmount);' $H | grep -c 'await act')"
echo "K6 ssr: LH rows $(grep -oE "it\('LH[0-9]+" $N | tr '\n' ' '); full regex $(grep -c 'Extra attributes from the server|Did not expect server HTML' $N); muted tolerance $(grep -c "!== 'muted'" $N); le1 $(grep -c 'toBeLessThanOrEqual(1)' $N); push-before-act $(grep -A1 'mountedRouteUnmounts.push(unmount);' $N | grep -c 'await act')"
echo "K7 react-dom $(node -e "console.log(require('react-dom/package.json').version)"); flag sets $(grep -c 'didWarnInvalidHydration = true;' $R); emitters: did-not-match $(grep -c "did not match. Server" $R) extra-attr $(grep -c "error('Extra attributes from the server" $R) did-not-expect $(grep -c "error('Did not expect server HTML" $R) expected $(grep -c "error('Expected server HTML" $R) hydration-failed $(grep -c "Hydration failed because" $R)"
echo "K8 doc 220: l.4 $(sed -n 4p $D); 'STUDIO-LINK-b (რაუნდი 299)' $(grep -c 'STUDIO-LINK-b (რაუნდი 299)' $D); 'STUDIO-LINK-b (რაუნდი 300)' $(grep -c 'STUDIO-LINK-b (რაუნდი 300)' $D); '9 ფაილი, 89 ტესტი' $(grep -c '9 ფაილი, 89 ტესტი' $D); 'row-ის ჩავარდნის შემთხვევაშიც' $(grep -c 'row-ის ჩავარდნის შემთხვევაშიც' $D); C-R298-01 $(grep -c 'C-R298-01' $D)"
echo "K9 video dock: bare muted JSX lines $(grep -cE '^\s+muted$' $V); suppressHydrationWarning in app $(grep -rl 'suppressHydrationWarning' app --include=*.tsx | wc -l); NG9 muted tolerance $(grep -c "args\[1\] !== 'muted'" $G); NG9 full regex $(grep -c 'Extra attributes from the server|Did not expect server HTML' $G); muted shim calls: ssr $(grep -c 'applyBrowserParsedMutedState(container);' $N) narrow-gate $(grep -c 'applyBrowserParsedMutedState(container);' $G) hydrate-ui $(grep -c 'applyBrowserParsedMutedState' $H); jsdom muted-from-attribute $(node -e "const {JSDOM}=require('jsdom');const d=new JSDOM('<div></div>');const c=d.window.document.querySelector('div');c.innerHTML='<video muted=\\'\\'></video>';const v=c.firstChild;console.log('attr',v.hasAttribute('muted'),'muted',v.muted,'defaultMuted',v.defaultMuted)")"
echo "K10 lines: hydrate-ui $(wc -l < $H) ssr $(wc -l < $N) narrow-gate $(wc -l < $G) dock $(wc -l < $V) doc220 $(wc -l < $D)"
echo "K11 B artifacts: $(for p in sketch-studio-link-hydrate-ssr-ui.test.tsx.txt sketch-studio-link-hydrate-ui.test.tsx.txt sketch-studio-narrow-gate-ui.test.tsx.txt sketch-220-studio-link-deep-link.md.txt sketch.patch.txt sketch-covering-run.log sketch-tsc.log run-mutant.sh edit-doc220.py mutant-x-extra-attr.py mutant-y-extra-node.py mutant-r-no-shim-ssr.py mutant-r2-no-shim-ng9.py mutant-v-dock-extra-attr.py mutant-e-no-prop.py mutant-g-no-settle.py mutant-i-spy-before-render.py vacuity-identity-order.py mutant-x.log mutant-y.log mutant-h.log mutant-r.log mutant-r2.log mutant-v.log mutant-e.log mutant-g.log mutant-i.log mutant-vacuity.log mutant-control-x-at-head.log mutant-control-v-at-head.log; do test -f $L/b-round-298/$p && echo -n 'ok ' || echo -n "MISSING:$p "; done)"
