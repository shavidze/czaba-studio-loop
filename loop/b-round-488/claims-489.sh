#!/usr/bin/env bash
# Round 489 claims (SABA-B-17). Usage: bash claims-489.sh   (ROOT=<store tree> LOOP=<loop folder> may be overridden)
# Each line: K# <value>. Planning output on the store tree: claims-489-planning-output.txt; on B's sketch scratch: claims-489-sketch-output.txt.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-488
EC=$ROOT/app/components/loading/EntranceCover.tsx
SL=$ROOT/app/components/loading/SpotlightLoader.tsx
T=$ROOT/app/lib/__tests__/store-entrance-loader.test.tsx
D=$ROOT/docs/implementation/2026/quarter-IV/316-saba-b-17-entrance-duration.md
cd "$ROOT" || exit 1
echo "K1 gate488 $(python3 -I -c "import json;d=json.load(open('$LOOP/gates/gate-round-488.json'));print(d['status'],d['commit'][:7])")"
echo "K2 head $(git rev-parse --short=7 HEAD) dirty=$(git status --porcelain --untracked-files=all | wc -l)"
echo "K3 entrance-constants $(grep -oE 'ENTRANCE_(MIN_TOTAL|MAX_TOTAL|FAILSAFE|EXIT|OVERLAY_EXIT)_MS = [0-9]+' "$EC" | tr '\n' ';')"
echo "K4 loader-constants $(grep -oE '(LOGO_AFTER_TAKEOVER|HOLD_AFTER_TAKEOVER|EXIT_AFTER_TAKEOVER_MIN)_MS = [0-9]+|(SPOTLIGHT|LOGO_FADE|LOGO_TRACKING|TAGLINE_FADE)_DURATION = [0-9.]+' "$SL" | tr '\n' ';')"
echo "K5 sweep-importers $(grep -rlE 'ENTRANCE_[A-Z_]+|entranceTimeline|EXIT_AFTER_TAKEOVER_MIN_MS|components/loading/(EntranceCover|SpotlightLoader)' app perf e2e 2>/dev/null | sort | tr '\n' ' ')"
echo "K6 sweep-old-literals $(grep -rnE '\b(1450|1900)\b' app/lib/__tests__ app/components/loading perf e2e 2>/dev/null | grep -ciE 'entrance|spotlight|TOTAL')"
echo "K7 root-tsx-diff $(git diff --numstat 73f994d -- app/root.tsx | wc -l)"
echo "K8 boot-listeners keydown=$(grep -o "addEventListener('keydown'" "$EC" | wc -l) click=$(grep -o "addEventListener('click'" "$EC" | wc -l) scroll-template-add=$(grep -c "addEventListener('\${type}',scroll,{capture:true,passive:false})" "$EC") scroll-template-remove=$(grep -c "removeEventListener('\${type}',scroll,true)" "$EC") skip-events=$(grep -c "ENTRANCE_SCROLL_SKIP_EVENTS = \['wheel', 'touchmove'\] as const" "$EC")"
echo "K9 other-keys-test $(grep -c "for (const key of \['a', 'ArrowDown', 'Shift'\])" "$T") e8b=$(grep -c "for (const key of \['a', 'ArrowDown', 'Shift', 'Enter'\])" "$T")"
echo "K10 lenis $(grep -o '"version": "[^"]*"' node_modules/lenis/package.json) window-target=$(grep -c 'eventsTarget = wrapper' node_modules/lenis/dist/lenis.mjs) wheel-bubble=$(grep -c 'addEventListener("wheel", this.onWheel, listenerOptions)' node_modules/lenis/dist/lenis.mjs) opts=$(grep -c 'var listenerOptions = { passive: false };' node_modules/lenis/dist/lenis.mjs)"
echo "K11 smoke-goto-root $(grep -cE "goto\('/'\)" e2e/agent-system-smoke.spec.ts) e2e-goto-root=$(cat e2e/*.ts | grep -cE "goto\('/'\)")"
echo "K12 doc316 $(test -f "$D" && echo exists l4=$(sed -n 4p "$D" | md5sum | cut -c1-8) || echo absent)"
echo "K13 test-rows $(for r in "'L3 stays on screen for the 3500 ms minimum" "S1 a %s gesture" "S2 the scroll-skip" "E6 the timeline counts from the first cover frame: 3500" "E6b a takeover" "E8c a %s before hydration" "E8d after the takeover"; do grep -c "$r" "$T"; done | tr '\n' ' ')"
echo "K14 sketch-files $(cd "$B/sketch-489" && for f in $(find . -type f | sort); do cmp -s "$f" "$ROOT/$f" && echo -n "=" || echo -n "x"; done) patch=$(sha256sum "$B/sketch-489.patch.txt" | cut -c1-16)"
echo "K15 biome-loading $(npx biome check app/components/loading/ 2>&1 | grep -oE 'Found [0-9]+ (warning|error)s?' | tr '\n' ' ')"
echo "K16 l58 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md 2>&1 | tail -1)"
echo "K17 cited $(for f in sketch-489.patch.txt sketch-489.sha256 sketch-489-files.sha256 sketch-review.md mutants-489.py mutants/mutants-summary.txt precheck-full-489.log pd-consult.md checkpoint-request-account.md probe/frames489.mjs probe/run-matrix.sh probe/table.py probe/serve-prod489.sh probe/head/f-1440-cpu1.json probe/head/f-1440-cpu1-net3g.json probe/head/f-1440-cpu1-wheel.json probe/head-matrix/summary.jsonl probe/sketch/summary.jsonl probe/head-matrix/table.txt probe/sketch/table.txt probe/sketch-all-modes/table.txt probe/head-matrix-all-modes/table.txt probe/rec/saba-b-17-entrance-after-1440-2000.png probe/css-compare.txt probe/record.mjs probe/rec/saba-b-17-entrance-before-1440.webm probe/rec/saba-b-17-entrance-after-1440.webm sketch-489-covering.log sketch-489-v1-to-v2.diff.txt sketch-489-v2-to-v3.diff.txt claims-489-planning-output.txt claims-489-sketch-output.txt; do test -f "$B/$f" && echo -n 1 || echo -n "0($f)"; done)"
echo "K18 mutants $(grep -c ' red=' "$B/mutants/mutants-summary.txt") none=$(grep -c 'red=NONE' "$B/mutants/mutants-summary.txt") badanchor=$(grep -c 'BAD-ANCHOR' "$B/mutants/mutants-summary.txt")"
echo "K19 full-suite $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-full-489.log" | grep -E '^\s+(Test Files|Tests) ' | tr -s ' ' | tr '\n' ' ') $(grep -o 'rc=[0-9]*' "$B/precheck-full-489.log")"
echo "K20 css-compare $(cat "$B/probe/css-compare.txt" 2>/dev/null | tr '\n' ' ')"
echo "K21 ids $(python3 -I "$LOOP/tools/find-ids.py" "$LOOP" SABA-B-17-ENTRANCE-3-4S B-R489-ENTRANCE-SLOW-FIRST-VISIT-EXPIRED B-R489-ENTRANCE-WHEEL-SCROLLS-UNDER-COVER B-R489-ENTRANCE-SCROLL-KEYS-UNDER-COVER | awk '{print $1":"($2=="NOT-FOUND"?"NOT-FOUND":"found")}' | tr '\n' ' ')"
echo "K22 lesson $(grep -c 'example number' "$LOOP/lessons.md") lines=$(wc -l < "$LOOP/lessons.md")"
echo "K23 barrels $(grep -n "SpotlightLoader\|EntranceCover" app/components/loading/index.ts app/components/common/index.ts | tr '\n' ' ') index-route=$(grep -c "SpotlightLoader" app/routes/_index.tsx)"
echo "K24 covering $(sed 's/\x1b\[[0-9;]*m//g' "$B/sketch-489-covering.log" | grep -E '^\s+(Test Files|Tests) ' | tr -s ' ' | tr '\n' ' ') $(grep -o 'rc=[0-9]*' "$B/sketch-489-covering.log")"
echo "K25 l2-aria-hidden $(grep -c "expect(overlay?.getAttribute('aria-hidden')).toBe('true');" "$T")"
