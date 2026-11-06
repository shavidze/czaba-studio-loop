#!/usr/bin/env bash
# Round 370 claims (L29 + L56). Run from the loop root: bash b-round-369/claims-370.sh
S=${STORE:-/home/runner/czaba-project/store}
L=$(pwd)
echo "K1 gate369: $(python3 -I -c "import json;d=json.load(open('gates/gate-round-369.json'));print(d['status'],d['head'][:7])")"
echo "K2 head: $(git -C $S rev-parse --short=7 HEAD) status-lines: $(git -C $S status --short --untracked-files=all | wc -l)"
echo "K3 root.tsx framer import lines: $(grep -c "^import { AnimatePresence } from 'framer-motion';" $S/app/root.tsx) PageTransition import: $(grep -c "^import { PageTransition } from '~/components/animations';" $S/app/root.tsx) AnimatePresence block: $(grep -c '<AnimatePresence mode="wait">' $S/app/root.tsx) isStudioPage def: $(grep -c "const isStudioPage = location.pathname.startsWith('/studio');" $S/app/root.tsx)"
echo "K4 ChatContext value import: $(grep -c "^import \* as signalR from '@microsoft/signalr';" $S/app/contexts/ChatContext.tsx) files importing signalr in app: $(grep -rl '@microsoft/signalr' $S/app | wc -l)"
echo "K5 tests naming ChatProvider|PageTransition|AnimatePresence|page-transition-wrapper (app, e2e, perf): $(grep -rlE 'ChatProvider|PageTransition|AnimatePresence|page-transition-wrapper' $S/app --include='*.test.*' $S/e2e $S/perf 2>/dev/null | wc -l)"
echo "K6 app.css wrapper rules: $(grep -c '^\.page-transition-wrapper' $S/app/styles/app.css)"
echo "K7 auth.ts static firebase import: $(grep -c "^import { getIdToken, initFirebase, signInWithGooglePopup } from './firebase.client';" $S/app/lib/auth.ts) auth.ts protected: $(grep -c 'app/lib/auth.ts' b-round-318/protected-sha256.txt)"
echo "K8 res.js encoded rows mode at HEAD: $(python3 -I -c "
import json
r={x['id']:x['mode'] for x in json.load(open('$S/perf/budgets.resources.json'))}
print(r['res.js.studio-lab.encoded-bytes'],r['res.js.home.encoded-bytes'],r['res.js.studio-guard.encoded-bytes'])")"
echo "K9 connect call sites: $(grep -cE 'await connect\(\);|connectRef\.current\(\);' $S/app/contexts/ChatContext.tsx)"
echo "K10 protected: $(cd $S && sha256sum -c --quiet $L/b-round-318/protected-sha256.txt 2>&1 | wc -l) failing lines"
echo "K11 doc 237 free: $(ls $S/docs/implementation/2026/quarter-IV/ | grep -c '^237-') last: $(ls $S/docs/implementation/2026/quarter-IV/ | sort | tail -1)"
echo "K12 frozen: $(cd $S && sha256sum -c --quiet $L/b-round-369/r370-frozen-sha256.txt 2>&1 | wc -l) failing lines, entries $(wc -l < b-round-369/r370-frozen-sha256.txt)"
echo "K13 useSmoothScroll starts Lenis rAF: $(grep -c 'requestAnimationFrame(raf);' $S/app/hooks/useSmoothScroll.ts)"
echo "K14 sketch HEAD/sketch bytes: $(grep -E 'res\.js\.studio-lab\.encoded-bytes' b-round-369/perf-res-head.log | sed 's/\x1b\[[0-9;]*m//g' | awk '{print $4}') / $(grep -E 'res\.js\.studio-lab\.encoded-bytes' b-round-369/perf-res-sketch-final.log | sed 's/\x1b\[[0-9;]*m//g' | awk '{print $4, $NF}')"
echo "K15 mutant perf red rows: $(grep -E 'encoded-bytes.*FAIL' b-round-369/mutants/mutant-MU-CHAT-STATIC-perf.log | wc -l)"
echo "K16 mutant unit red: CHAT $(grep -c '×' b-round-369/mutants/mutant-MU-CHAT-STATIC.log) NO-KEY $(grep -c '×' b-round-369/mutants/mutant-MU-RT-NO-KEY.log) STUDIO-MOTION $(grep -c '×' b-round-369/mutants/mutant-MU-RT-STUDIO-MOTION.log) IMPORT-OUTSIDE-TRY $(grep -c '×' b-round-369/mutants/mutant-MU-CHAT-IMPORT-OUTSIDE-TRY.log) ALWAYS-CONNECTED $(grep -c '×' b-round-369/mutants/mutant-MU-CHAT-ALWAYS-CONNECTED.log) STORE-PLAIN $(grep -c '×' b-round-369/mutants/mutant-MU-RT-STORE-PLAIN.log)"
echo "K17 paint medians: $(grep -E '^(head|sketch)' b-round-369/probe/paint-final.log | awk '{print $1, "fcp-dcl", $8}' | tr '\n' ';')"
for f in b-round-369/sketch.patch.txt b-round-369/sketch-review.md b-round-369/sketch-covering.log b-round-369/sketch-typecheck.log b-round-369/sketch-biome.log b-round-369/probe/js-head.json b-round-369/probe/js-sketch-final.json b-round-369/probe/paint-final.log b-round-369/root-request-perf11b-firebase-lazy.md b-round-369/perf-res-head.log b-round-369/perf-res-sketch-final.log b-round-369/sketch-root.tsx.txt b-round-369/lessons-diff.txt b-round-369/sketch-chat-shuffle.log b-round-369/perf-res-sketch-v1.log b-round-369/probe/paint-run1.log b-round-369/sketch-v1.patch.txt b-round-369/sketch-v1-to-final.diff.txt b-round-369/r370-frozen-sha256.txt b-round-369/claims-370-sketch-output.txt b-round-369/retro-369-before-370.md b-round-369/lessons-before-370.md b-round-369/sketch-dispatched.sha256 b-round-369/mutants/mutant-MU-CHAT-STATIC.log b-round-369/mutants/mutant-MU-CHAT-IMPORT-OUTSIDE-TRY.log b-round-369/mutants/mutant-MU-CHAT-ALWAYS-CONNECTED.log b-round-369/mutants/mutant-MU-RT-NO-KEY.log b-round-369/mutants/mutant-MU-RT-STORE-PLAIN.log b-round-369/mutants/mutant-MU-RT-STUDIO-MOTION.log b-round-369/mutants/mutant-MU-CHAT-STATIC-perf.log; do test -f $f && echo "K18 ok $f" || echo "K18 MISSING $f"; done
echo "K19 lessons lines: $(wc -l < lessons.md)"
echo "K20 regression-last: $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K21 tasks/round-369.md sha256: $(sha256sum tasks/round-369.md | cut -c1-16)"
echo "K22 tests that read root.tsx: $(grep -l "root.tsx" $S/app/lib/__tests__/self-hosted-fonts.test.ts $S/app/lib/__tests__/store-focus-ring.test.ts | wc -l)"
