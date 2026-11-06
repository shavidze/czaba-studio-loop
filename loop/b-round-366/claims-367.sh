#!/usr/bin/env bash
# B round 366 -> 367 claims (PERF-9b-ii stem-cache commit discipline). Run from anywhere. CLAIMS_STORE overrides the store path (scratch).
L=/home/runner/czaba-project/tmp/studio-real-loop
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
C=$S/app/lib/arrangement/stem-cache.client.ts
T=$S/app/lib/arrangement/__tests__/stem-cache.test.ts
DOC=$S/docs/implementation/2026/quarter-IV/236-perf-stem-cache-v2.md
echo "K1 $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-366.json'));print('g366',g['status'],g['commit'][:7])")"
if [ -d "$S/.git" ] && [ -z "${CLAIMS_STORE:-}" ]; then
  echo "K2 $(git -C $S rev-parse --short HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
  echo "K7 other-app-changes $(git -C $S status --short --untracked-files=all -- app | grep -v -e 'app/lib/arrangement/stem-cache.client.ts' -e 'app/lib/arrangement/__tests__/stem-cache.test.ts' | wc -l) perf-changes $(git -C $S status --short --untracked-files=all -- perf | wc -l) other-docs $(git -C $S status --short --untracked-files=all -- docs | grep -v '236-perf-stem-cache-v2.md' | wc -l) stem-cache.ts $(git -C $S status --short -- app/lib/arrangement/stem-cache.ts app/lib/arrangement/source-fetch.ts | wc -l)"
else
  echo "K2 scratch n/a"
  echo "K7 scratch n/a"
fi
echo "K3 requestToPromise-lines $(grep -c 'requestToPromise(' $C) readwrite $(grep -c "'readwrite'" $C) transactionDone $(grep -c 'transactionDone(' $C)"
echo "K4 abort-check-before-sweep $(grep -c 'if (signal?.aborted || disabled) {' $C) cancelled-checks $(grep -c 'cancelled()' $C)"
echo "K5 hit-deletes $(grep -c 'await store.delete(key).catch(() => undefined);' $C) await-pending-write $(grep -c 'await writes.get(key)?.catch(() => undefined);' $C)"
echo "K6 clone $(grep -c 'response.clone()' $C) content-type-set $(grep -c "headers.set('content-type', entry.record.contentType);" $C)"
echo "K8 sweep-once $(grep -c 'sweepPromise ??= activeStore.sweep(now()).catch(() => undefined);' $C) commit-chain $(grep -c 'commitChain' $C)"
echo "K9 integrity-size $(grep -c 'if (file.size !== record.size) {' $C) previous-file-removal $(grep -c 'await removeFile(previous.fileName);' $C)"
echo "K10 sc-rows $(grep -cE "^  it\('SC[0-9]+" $T) new-rows $(grep -cE "^  it\('SC2[2-9] " $T) describes $(grep -cE "^describe\('" $T)"
echo "K11 gate366-stem-cache-test $(sed 's/\x1b\[[0-9;]*m//g' $L/gates/round-366/verify.log | grep -m1 -oE 'stem-cache.test.ts \([0-9]+ tests\) [0-9]+ms')"
echo "K12 protected-ok $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K13 doc236-l4 $(sed -n '4p' $DOC) | pending $(grep -rl 'C round [0-9]* pending' $S/docs/implementation | wc -l) | stage-hits $(grep -rln 'In Progress (stage' $S/docs/implementation | sed "s#$S/##" | sort | tr '\n' ' ')| headings $(grep -c '^## ' $DOC)"
echo "K14 package.json-sha $(sha256sum $S/package.json | cut -c1-12) lock-sha $(sha256sum $S/package-lock.json | cut -c1-12) biome-includes $(grep -c '"includes": \["app/\*\*/\*.ts", "app/\*\*/\*.tsx"\]' $S/biome.json)"
echo "K15 preview-wiring $(grep -c 'fetchAndDecodeSource(url, ctx, signal, publicPreviewSourceFetch())' $S/app/data/studio-lab-demo.ts) store-name $(grep -c "const STORE_NAME = 'entries';" $C) db-name $(grep -c "STEM_CACHE_DB_NAME = 'czaba-stem-cache-v2'" $S/app/lib/arrangement/stem-cache.ts)"
echo "K16 artifacts-missing $(for f in b-round-366/sketch.patch.txt b-round-366/sketch-dispatched.sha256 b-round-366/sketch-typecheck.log b-round-366/sketch-biome.log b-round-366/sketch-covering.log b-round-366/precheck-full.log b-round-366/sketch-review.md b-round-366/sketch/mutant-M-SC22-ABORT-RESOLVES.log b-round-366/sketch/mutant-M-SC23-WRITE-REQUEST.log b-round-366/sketch/mutant-M-L3-EVICT.log b-round-366/sketch/mutant-M-L3-PUT.log b-round-366/sketch/mutant-M-L5-GONE.log b-round-366/sketch/mutant-M-L5-UNSTORABLE.log b-round-366/sketch/mutant-M-L6-CLONE.log b-round-366/sketch/mutant-M-L6-HEADERS.log b-round-366/sketch/mutant-M-SERIAL.log b-round-366/probe/stem-integrity-probe.mjs b-round-366/probe/head-1440x900.json b-round-366/probe/head-1280x720.json b-round-366/probe/sketch-1440x900.json b-round-366/probe/sketch-1280x720.json b-round-366/probe/mutant-nosize-1440x900.json b-round-366/probe/mutant-nohitrestore-1440x900.json b-round-366/probe/mutant-probe.sh b-round-366/probe/summarize.py b-round-366/sketch/mutant-summary.txt b-round-366/sketch/mutant-M-SC22-ONERROR-NULL.log b-round-366/sketch/mutant-M-SC28-NO-SIZE.log b-round-366/sketch/mutant-M-L5-BLOCKING.log b-round-366/sketch/mutant-M-IDLE-NO-DELETES.log b-round-366/probe/probe-summary.txt; do test -f $L/$f || echo -n "$f "; done; echo)"
echo "K17 idle-app-callers $(grep -rn '\.idle()' $S/app --include=*.ts --include=*.tsx | grep -v __tests__ | wc -l) export-transactionDone $(grep -c '^export function transactionDone' $C) fake-storage-helper $(grep -c '^function installFakeBrowserStorage' $T)"
