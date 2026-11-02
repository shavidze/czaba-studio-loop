#!/usr/bin/env bash
# Run from store/. Claims for round 303 (NAME-AND-HINT-b). Output compared verbatim by A and C.
LOOP=../tmp/studio-real-loop
echo "K1 HEAD: $(git rev-parse --short HEAD)"
echo "K2 status lines: $(git status --short --untracked-files=all | wc -l)"
git diff --quiet HEAD -- 'app/routes/studio.$productId.tsx' app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/__tests__/download-routes.test.ts app/lib/auth.ts app/contexts/AuthContext.tsx app/entry.server.tsx; echo "K3 protected diff rc: $?"
echo "K4 frozen entries: $(wc -l < $LOOP/b-round-302-r303-tree-sha256.txt) failures: $(sha256sum -c $LOOP/b-round-302-r303-tree-sha256.txt 2>/dev/null | grep -vc ': OK$')"
echo "K5 clipAdded setStatus sites: $(grep -c 'studioLibraryStrings.clipAdded(' app/contexts/ArrangementContext.tsx)"
echo "K6 nameBarHint hits in app (non-test): $(grep -rn 'nameBarHint\|name bar to move' app --include=*.ts --include=*.tsx | grep -v __tests__ | wc -l)"
echo "K7 seed append (function-form) in StudioWorkspace: $(grep -c 'workspaceRef.current.setStatus((current) =>' app/components/arrangement/StudioWorkspace.tsx)"
echo "K8 insertMarkerStatusKind exact-equality branches: $(grep -c 'text === studioPlaybackStrings' app/lib/arrangement/playback-start.ts)"
echo "K9 name bar title: $(grep -n 'moveTitle:' app/lib/arrangement/strings.ts)"
echo "K10 body title: $(grep -n 'rangeBodyTitle:' app/lib/arrangement/strings.ts)"
echo "K11 demo first source: $(grep -m1 -o "id: 'demo-[a-z-]*'" app/data/studio-lab-demo.ts)"
echo "K12 status output: $(grep -c 'data-testid="arrangement-status"' app/components/arrangement/StudioWorkspace.tsx)"
echo "K13 last impl doc: $(ls docs/implementation/2026/quarter-IV | tail -1); 221 l.4: $(sed -n 4p docs/implementation/2026/quarter-IV/221-name-and-hint.md)"
echo "K14 sketch collisions: $(grep -c ' FAIL ' $LOOP/b-round-302/sketch-arrangement-run.log 2>/dev/null) lines; $(sed 's/\x1b\[[0-9;]*m//g' $LOOP/b-round-302/sketch-arrangement-run.log | grep -E '^ *Tests ' | tr -s ' ')"
echo "K15 video add status writes via report(): $(grep -c 'studioVideoStrings.added(' app/contexts/ArrangementContext.tsx)"
for f in sketch.patch.txt sketch-ArrangementContext.tsx.txt sketch-strings.ts.txt sketch-arrangement-run.log sketch-covering-run.log covering-files.txt covering-new-file.txt probe-status.mjs probe-status.json probe-fullmix-1280.png probe-fullmix-1440.png; do test -f $LOOP/b-round-302/$f && echo "K16 $f ok" || echo "K16 $f MISSING"; done
echo "K17 addSourceToActiveTrack call sites (non-test):"; grep -rn 'addSourceToActiveTrack(' app --include=*.tsx --include=*.ts | grep -v __tests__
