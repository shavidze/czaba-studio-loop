#!/usr/bin/env bash
# Usage: TREE=<copy of A's store tree, node_modules symlinked> OUT=<abs dir> [MODE=unit|browser|all] bash run-mutants-382.sh
# Each mutant edits one anchored text on the copy, runs its covering command, records the red evidence, restores.
# unit:    MU-EV-* (14) -> app/lib/arrangement/__tests__/decoded-buffer-eviction-ui.test.tsx (vitest); expected red: the EV row named per mutant.
#          MU-13B-BOUND-OFF, MU-13B-DECODE-PROBE-OFF -> perf lib vitest (scratch config); expected red: PL3/PL6, PL5.
# browser: MU-13B-NO-DECODE-WRAP, MU-13B-STRONG-REFS -> PERF-RES (playwright perf, builds; run alone);
#          expected problem strings are grepped from test-results/perf/latest-resources.json.
set -u
: "${TREE:?}"; : "${OUT:?}"; MODE="${MODE:-all}"; mkdir -p "$OUT"
LOOP="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$TREE" || exit 1
EV_CMD="npx vitest run app/lib/arrangement/__tests__/decoded-buffer-eviction-ui.test.tsx"
PL_CMD="npx vitest run --config $LOOP/b-round-334/vitest.perf-lib.config.mjs"
PERF_CMD="npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts"
REPORT="test-results/perf/latest-resources.json"
CTX=app/contexts/ArrangementContext.tsx
PCM=perf/lib/pcm-live.ts
apply() {
  python3 -I - "$1" "$2" "$3" <<'PY'
import sys
p,a,b=sys.argv[1:4]
s=open(p).read()
n=s.count(a)
if n!=1:
    print(f"ANCHOR COUNT {n}"); sys.exit(3)
open(p,'w').write(s.replace(a,b))
PY
}
run_unit() {
  id=$1 file=$2 cmd=$3 expect=$6
  cp "$file" "$OUT/$id.orig"
  if ! apply "$file" "$4" "$5"; then echo "$id anchor-missing" | tee -a "$OUT/summary.txt"; cp "$OUT/$id.orig" "$file"; return; fi
  $cmd > "$OUT/$id.log" 2>&1; vrc=$?
  red=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/$id.log" | grep -E '^ +(×|✗|FAIL) ' | sed 's/^ *//' | sort -u | tr '\n' '|')
  hit=$(printf '%s' "$red" | grep -c -F "$expect" || true)
  echo "$id rc=$vrc expect='$expect' expect-red=$hit red=[$red]" | tee -a "$OUT/summary.txt"
  cp "$OUT/$id.orig" "$file"
}
run_browser() {
  id=$1 expect1=$4
  cp "$PCM" "$OUT/$id.orig"
  if ! apply "$PCM" "$2" "$3"; then echo "$id anchor-missing" | tee -a "$OUT/summary.txt"; cp "$OUT/$id.orig" "$PCM"; return; fi
  rm -f "$REPORT"
  $PERF_CMD > "$OUT/$id.log" 2>&1; prc=$?
  [ -f "$REPORT" ] && cp "$REPORT" "$OUT/$id.latest-resources.json"
  found1=$(grep -c -F "$expect1" "$OUT/$id.latest-resources.json" 2>/dev/null || echo 0)
  log1=$(grep -c -F "$expect1" "$OUT/$id.log" 2>/dev/null || echo 0)
  echo "$id rc=$prc expect1='$expect1' json-hits=$found1 log-hits=$log1" | tee -a "$OUT/summary.txt"
  cp "$OUT/$id.orig" "$PCM"
}
: > "$OUT/summary.txt"
cp "$CTX" "$OUT/pristine.ArrangementContext.tsx"
cp "$PCM" "$OUT/pristine.pcm-live.ts"
if [ "$MODE" = unit ] || [ "$MODE" = all ]; then
  run_unit MU-EV-NO-EVICT "$CTX" "$EV_CMD" \
    '              evictable: collection.canReloadSource?.(source) === true,
            });
            decodedBuffers.evict();
' '              evictable: collection.canReloadSource?.(source) === true,
            });
' 'EV1'
  run_unit MU-EV-NO-DEDUPE "$CTX" "$EV_CMD" \
    '        if (inFlight) {' '        if (inFlight && id === "never") {' 'EV2'
  run_unit MU-EV-PLAY-NO-REFUSE "$CTX" "$EV_CMD" \
    '      if (awaiting.length > 0) {' '      if (awaiting.length < 0) {' 'EV3'
  run_unit MU-EV-NO-CLIPS-PIN-RECOMPUTE "$CTX" "$EV_CMD" \
    "        decodedBuffers.setPinned('clips', ids);
" '' 'EV4'
  run_unit MU-EV-EXPORT-NO-AWAIT "$CTX" "$EV_CMD" \
    '      await raceArrangementExportAbort(ensureDecoded(awaiting), controller.signal);' \
    '      void ensureDecoded(awaiting);' 'EV5: export waits'
  run_unit MU-EV-EXPORT-PIN-LEAK "$CTX" "$EV_CMD" \
    "      decodedBuffers.setPinned('export', []);
" '' 'EV5: a cancelled export'
  run_unit MU-EV-FAIL-SILENT "$CTX" "$EV_CMD" \
    '            (error: unknown) => {
              if (signal.aborted) {' '            (error: unknown) => {
              if (signal.aborted || error !== null) {' 'EV6'
  run_unit MU-EV-EXPORT-FAIL-SILENT "$CTX" "$EV_CMD" \
    '      return failed ? librarySourceFailedMessage(failed.title) : null;' \
    '      return failed ? null : null;' 'EV6: an export whose re-decode fails'
  run_unit MU-EV-NO-ABORT-CHECK "$CTX" "$EV_CMD" \
    '            (buffer) => {
              if (signal.aborted) {' '            (buffer) => {
              if (signal.aborted && buffer === null) {' 'EV7'
  run_unit MU-EV-PIN-EVERY-UPDATE "$CTX" "$EV_CMD" \
    '      if (next.present.clips !== pinnedClipsRef.current) {' '      if (next.present.clips !== null) {' 'EV8'
  run_unit MU-EV-NO-PLAYING-RESYNC "$CTX" "$EV_CMD" \
    '              if (decodedBuffers.has(id) && present.clips.some((clip) => clip.sourceId === id)) {' \
    '              if (decodedBuffers.has(id) && present.clips.length < 0) {' 'EV3: while already playing'
  run_unit MU-EV-REPLACED-EXPORT-RELEASES "$CTX" "$EV_CMD" \
    '      if (exportPinOwnerRef.current !== controller) {' \
    '      if (exportPinOwnerRef.current === undefined) {' 'EV5: a replaced export'
  run_unit MU-EV-PREVIEW-NO-STOP-RELEASE "$CTX" "$EV_CMD" \
    '    releasePreviewPin();
  }, [releasePreviewPin]);' '  }, [releasePreviewPin]);' 'EV9: a preview plays'
  run_unit MU-EV-PREVIEW-NO-SUPERSEDE "$CTX" "$EV_CMD" \
    '          if (previewRequestRef.current !== sourceId) {' \
    '          if (previewRequestRef.current === undefined) {' 'EV9: a superseded preview'
  run_unit MU-13B-BOUND-OFF "$PCM" "$PL_CMD" \
    '  if (count < bounds.placed || count > bounds.library) {' '  if (count < 0) {' 'PL3'
  run_unit MU-13B-DECODE-PROBE-OFF "$PCM" "$PL_CMD" \
    "  if (probes.filter((kind) => kind === 'decode').length !== 1) {" '  if (probes.length < 0) {' 'PL5'
fi
if [ "$MODE" = browser ] || [ "$MODE" = all ]; then
  run_browser MU-13B-NO-DECODE-WRAP \
    '  proto.decodeAudioData = trackedDecode;
' '' \
    'pcm registry did not count its decode probe'
  run_browser MU-13B-STRONG-REFS \
    '    refs.push({ ref: new WeakRef(buffer), origin });' \
    '    refs.push({ ref: { deref: () => buffer }, origin });' \
    'pcm registry kept a dropped probe'
fi
ok=1
cmp -s "$CTX" "$OUT/pristine.ArrangementContext.tsx" || ok=0
cmp -s "$PCM" "$OUT/pristine.pcm-live.ts" || ok=0
if [ "$ok" = 1 ]; then echo restored | tee -a "$OUT/summary.txt"; else echo "NOT RESTORED" | tee -a "$OUT/summary.txt"; fi
