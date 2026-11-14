#!/usr/bin/env bash
# Round 517 claims (L29/L56). Run: bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-516/claims-517.sh
LOOP=/home/runner/czaba-project/tmp/studio-real-loop
S=/home/runner/czaba-project/store
cd "$S" || exit 2
strip() { sed 's/\x1b\[[0-9;]*m//g'; }
echo "K1 HEAD: $(git rev-parse --short HEAD)"
echo "K2 tree:"; git status --short --untracked-files=all
echo "K3 post-sketch pin: $(sha256sum -c --quiet $LOOP/b-round-515/r516-post-sketch-sha.txt >/dev/null 2>&1 && echo rc0 || echo FAIL)"
echo "K4 frozen1: $(sha256sum -c --quiet $LOOP/b-round-515/r516-tree-sha256.txt >/dev/null 2>&1 && echo rc0 || echo FAIL) protected: $(sha256sum -c --quiet $LOOP/b-round-318/protected-sha256.txt >/dev/null 2>&1 && echo rc0 || echo FAIL)"
echo "K5 latest docs: $(ls docs/implementation/2026/quarter-IV/ | sort | tail -2 | tr '\n' ' ')"
echo "K6 UT2 declared timeout: $(grep -n "describe('Store undefined tokens (DPG-P0-2)', { timeout: 30_000 }" app/lib/__tests__/store-undefined-tokens.test.ts | cut -d: -f1)"
echo "K7 vitest config testTimeout hits: $(grep -c 'testTimeout' vitest.config.ts)"
echo "K8 other declared timeouts in covering files: $(for f in $(cat $LOOP/b-round-515/covering-files.txt); do grep -l 'timeout' "$f"; done | tr '\n' ' ')"
echo "K9 slowest 3 in B sketch covering log (ms, sorted):"; strip < $LOOP/b-round-515/sketch-covering.log | grep -oE '> [A-Za-z0-9-]+:.* [0-9]+ms$' | awk '{print $NF" "$2}' | sort -n -k1 | tail -3
echo "K10 UT2 in C round 516 covering log: $(strip < $LOOP/c-round-516/covering.log | grep -oE 'UT2: .* [0-9]+ms$' | grep -oE '[0-9]+ms$')"
echo "K11 l57 tool: $(test -f $LOOP/tools/l57-check.py && echo present)"
echo "K12 gate 516: $(python3 -I -c "import json;print(json.load(open('$LOOP/gates/gate-round-516.json'))['status'])")"
echo "K13 regression-last: $(python3 -I -c "import json;print(json.load(open('$LOOP/regression-last.json'))['date'])")"
echo "K14 artifacts:"; for p in tasks/round-516.md c-round-516/mut-logs/mutants-summary.json b-round-515/mut-logs/mutants-summary.json b-round-515/probe/n4-probe.mjs b-round-515/probe/sketch/n4.json b-round-515/covering-files.txt b-round-515/mutants-516.py c-round-511/prot.mjs c-round-516/n4/n4.json; do test -f $LOOP/$p && echo "  ok $p" || echo "  MISSING $p"; done
echo "K15 subscribe fetch: $(grep -c "fetch('/api/subscribe'" app/hooks/useLeadMagnet.ts)"
echo "K16 popup copy literals (sketch tree):"; for s in 'Get Your' 'Tracks, Sound Effects & More' 'FREE DOWNLOAD' 'CONTINUE TO' 'CLAIM YOUR OFFER' "'CONTINUE'" "We've sent your free mystery pack to your email!" 'BACK TO SITE'; do echo "  $(grep -cF "$s" app/components/marketing/LeadMagnetPopup.tsx) $s"; done
echo "K17 offers copy literals:"; for s in 'Give the Gift of Sound' 'Browse Gift Cards' 'The Complete Collection' 'View Collection'; do echo "  $(grep -cF "$s" app/components/home/SpecialOffersSection.tsx) $s"; done
echo "K18 DESIGN_TOKENS teal line: $(grep -c '#13D9CC (Teal)' .claude/primitives/DESIGN_TOKENS.md)"
echo "K19 finding ids:"; cd $LOOP && python3 -I tools/find-ids.py . C-R516-01 C-R516-02 B-R505-UT2-TIMEOUT-HEADROOM | cut -c1-90
echo "K20 L58 checker on current-task: $(python3 -I tools/l58-check.py current-task.md >/dev/null 2>&1; echo rc$?)"
