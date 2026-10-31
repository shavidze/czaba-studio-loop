#!/usr/bin/env bash
# Round 292 claims (L29 + L56). Run from store/: bash ../tmp/studio-real-loop/b-round-291/claims-292.sh
L=../tmp/studio-real-loop
F=$L/b-round-291-r292-tree-sha256.txt
echo "K1 $(git rev-parse --short=7 HEAD) $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-291.json'));print(g['status'],g['commit'][:7])")"
echo "K2 $(git status --short --untracked-files=all | wc -l)"
echo "K3 $(wc -l < $F) $(sha256sum -c --quiet $F >/dev/null 2>&1; echo rc$?)"
echo "K4 $(for f in 'app/routes/studio.$productId.tsx' app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/__tests__/download-routes.test.ts app/lib/auth.ts app/contexts/AuthContext.tsx app/entry.server.tsx; do grep -cF "  $f" $F; done | tr '\n' ' ')"
echo "K5 $(wc -l < app/routes/studio-lab.tsx) $(grep -c 'StudioWorkspace' app/routes/studio-lab.tsx) $(grep -c 'useSyncExternalStore\|matchMedia' app/routes/studio-lab.tsx)"
echo "K6 $(grep -n "window.addEventListener('keydown', handleKeyDown)" app/components/arrangement/StudioWorkspace.tsx | cut -d: -f1) $(grep -n 'data-testid="arrangement-exit"' app/components/arrangement/StudioWorkspace.tsx | cut -d: -f1)"
echo "K7 $(grep -n "'components/arrangement/StudioWorkspace.tsx': 1," app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx | cut -d: -f1) $(grep -n "name: 'h1'" app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx | cut -d: -f1)"
echo "K8 $(grep -n "^describe('library row status strings (V-0.5a)'" app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx | cut -d: -f1) $(grep -n "it('LRS4:" app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx | cut -d: -f1) $(grep -c 'timeout' app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx)"
echo "K9 $(sed 's/\x1b\[[0-9;]*m//g' $L/gates/round-291/verify.log | grep -E 'LRS4' | grep -oE '[0-9]+ms$')"
echo "K10 $(grep -n "'demo-middle-east': '/middle-east.mp3'" app/data/studio-lab-demo.ts | cut -d: -f1) $(grep -c "title: 'Middle East — public preview'" app/data/studio-lab-demo.ts)"
echo "K11 $(ls docs/implementation/2026/quarter-IV/ | sort | tail -1 | cut -c1-3) $(ls docs/implementation/2026/quarter-IV/ | grep -c '^218')"
echo "K12 $(test -e app/components/arrangement/StudioNarrowScreen.tsx && echo exists || echo absent) $(test -e app/hooks/useStudioWideViewport.ts && echo exists || echo absent) $(grep -rln 'matchMedia' app --include=*.ts --include=*.tsx | grep -v __tests__ | wc -l)"
echo "K13 $(grep -n "':focus-visible {\|^:focus-visible {" app/styles/app.css | cut -d: -f1 | head -1) $(grep -n 'body:has(\[data-studio-theme="obsidian"\])' app/styles/app.css | cut -d: -f1) $(grep -rn 'data-studio-theme=' app --include=*.tsx | grep -v __tests__ | wc -l)"
echo "K14 $(grep -rln "routes/studio-lab'" app --include=*.test.tsx | sort | tr '\n' ' ')"
echo "K15 $(grep -n 'export function useArrangement(): ArrangementContextValue' app/contexts/ArrangementContext.tsx | cut -d: -f1) $(grep -nE '^\s+(isPlaying: boolean|togglePlayback: \(\) => void);' app/contexts/ArrangementContext.tsx | cut -d: -f1 | tr '\n' ' ')"
echo "K16 $(for p in b-round-291/sketch-route-theme.diff b-round-291/sketch-useStudioWideViewport.ts.txt b-round-291/sketch-StudioNarrowScreen.tsx.txt b-round-291/probe/narrow-head.json b-round-291/probe/narrow-sketch.json b-round-291/probe/desk-diff.json b-round-291/probe/desk-5173-1280x720.png b-round-291/probe/desk-5173-1440x900.png b-round-291/probe/head-390x844.png b-round-291/probe/sketch-390-scheme-dark.png b-round-291/probe/narrow-sketch.cjs b-round-291/probe/desk-diff.cjs b-round-291/sketch-tests.log b-round-291/claims-292-output.txt b-round-291/l50-hits.txt; do test -f $L/$p || echo MISSING $p; done; echo done)"
echo "K17 $(python3 -I -c "import json;d=json.load(open('$L/b-round-291/probe/narrow-head.json'));print(d['390x844']['overlaps'],d['390x844']['mediaRequests'].__len__())") $(python3 -I -c "import json;d=json.load(open('$L/b-round-291/probe/desk-diff.json'));print(d['1280x720'],d['1440x900'])")"
echo "K18 $(grep -c "'Demo collection ready\." app/lib/arrangement/collection.ts) $(grep -c '>Sign in required<' app/components/auth/RequireAuth.tsx) $(grep -c 'data-playing=' app/components/arrangement/ArrangementTransport.tsx)"
