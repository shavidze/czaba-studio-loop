#!/usr/bin/env bash
# Usage: run-mutant.sh <MUTANT_ID> <spec-file>
# Builds /tmp/c279-mut/<id> from git archive 873d835 + A's perf diff + the mutant, then runs the one spec alone.
set -u
ID="$1"
SPEC="$2"
STORE=/home/runner/czaba-project/store
LOOP=/home/runner/czaba-project/tmp/studio-real-loop
OUT="$LOOP/c-round-279/mutants/$ID"
DIR="/tmp/c279-mut/$ID"
rm -rf "$DIR"
mkdir -p "$DIR" "$OUT"
git -C "$STORE" archive 873d835 | tar -x -C "$DIR"
ln -s "$STORE/node_modules" "$DIR/node_modules"
cd "$DIR"
git apply --unsafe-paths -p1 "$LOOP/c-round-279/c-perf.diff" 2>"$OUT/apply.err" || patch -p1 < "$LOOP/c-round-279/c-perf.diff" >>"$OUT/apply.err" 2>&1
PAGE=perf/lib/page.ts
LABELS=perf/lib/app-labels.ts
RES=perf/studio-lab-resources.perf.spec.ts
INT=perf/studio-lab-interactions.perf.spec.ts
case "$ID" in
  MU-READY) sed -i "s/workspaceCollectionCopy('demo').ready)/workspaceCollectionCopy('demo').empty)/" "$LABELS" ;;
  MU-CAP) sed -i 's/quietFor: quietMs,/quietFor: 10000,/' "$PAGE" ;;
  MU-PLAY) sed -i 's/{ timeout: 15000 }).toBe(true);/{ timeout: 15000 }).toBe(false);/' "$PAGE" ;;
  MU-LANE) sed -i 's/for (const lane of lanes.slice(lanes.indexOf(ownLane) + 1)) {/for (const lane of [ownLane]) {/' "$INT" ;;
  MU-OBS-1) sed -i "s/^    observerInstalled = true;/    observerInstalled = true;\n    throw new Error('MU-OBS-1');/" "$RES" ;;
  MU-OBS-2)
    sed -i "/^  let t1: number | null = null;\$/{n;s/^  try {\$/  try {\n    throw new Error('MU-OBS-2');/}" "$RES"
    sed -i 's/if (observerInstalled \&\& !released) {/if (!released) {/' "$RES"
    ;;
  MU-OBS-3) sed -i "/^  let t1: number | null = null;\$/{n;s/^  try {\$/  try {\n    throw new Error('MU-OBS-3');/}" "$RES" ;;
  *) echo "unknown mutant $ID"; exit 2 ;;
esac
for f in "$PAGE" "$LABELS" "$RES" "$INT"; do diff -u "$STORE/$f" "$DIR/$f"; done > "$OUT/mutant.diff"
echo "mutant diff lines: $(wc -l < "$OUT/mutant.diff")"
( time CI=true npx playwright test --config playwright.perf.config.ts "$SPEC" ) > "$OUT/run.log" 2>&1
echo "rc $?" >> "$OUT/run.log"
cp -f test-results/perf/latest*.json "$OUT/" 2>/dev/null
echo done "$ID"
