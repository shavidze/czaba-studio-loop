#!/usr/bin/env bash
# B round 367 -> 368 claims (PERF-9b-ii re-dispatch: join pending same-key writes). Run from anywhere. CLAIMS_STORE overrides the store path (scratch).
L=/home/runner/czaba-project/tmp/studio-real-loop
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
C=$S/app/lib/arrangement/stem-cache.client.ts
T=$S/app/lib/arrangement/__tests__/stem-cache.test.ts
DOC=$S/docs/implementation/2026/quarter-IV/236-perf-stem-cache-v2.md
echo "K1 $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-367.json'));h=json.load(open('$L/gates/gate-round-366.json'));print('g367',g['status'],'g366',h['status'],h['commit'][:7])")"
if [ -d "$S/.git" ] && [ -z "${CLAIMS_STORE:-}" ]; then
  echo "K2 $(git -C $S rev-parse --short HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
  echo "K7 other-app-changes $(git -C $S status --short --untracked-files=all -- app | grep -v -e 'app/lib/arrangement/stem-cache.client.ts' -e 'app/lib/arrangement/__tests__/stem-cache.test.ts' | wc -l) perf-changes $(git -C $S status --short --untracked-files=all -- perf | wc -l) other-docs $(git -C $S status --short --untracked-files=all -- docs | grep -v '236-perf-stem-cache-v2.md' | wc -l) stem-cache.ts $(git -C $S status --short -- app/lib/arrangement/stem-cache.ts app/lib/arrangement/source-fetch.ts | wc -l)"
  echo "K18 app-diff-vs-full-sketch $(git -C $S diff -- app | cmp -s - $L/b-round-367/sketch.patch.txt && echo equal || echo differs) app-diff-vs-r366-sketch $(git -C $S diff -- app | cmp -s - $L/b-round-366/sketch.patch.txt && echo equal || echo differs)"
else
  echo "K2 scratch n/a"
  echo "K7 scratch n/a"
  echo "K18 scratch n/a"
fi
echo "K3 requestToPromise-lines $(grep -c 'requestToPromise(' $C) readwrite $(grep -c "'readwrite'" $C) transactionDone $(grep -c 'transactionDone(' $C) commit-chain $(grep -c 'commitChain' $C) cancelled-checks $(grep -c 'cancelled()' $C)"
echo "K5 writes-has $(grep -c 'writes.has(key)' $C) join-push $(grep -c 'pending.signals.push(init.signal);' $C) abandoned-fn $(grep -c 'isStemWriteAbandoned(' $C) every $(grep -c 'signals.every((signal) => signal?.aborted === true)' $C) pending-done-wait $(grep -c 'writes.get(key)?.done ?? Promise.resolve()' $C) signal-param $(grep -c 'signal: AbortSignal | null | undefined,' $C)"
echo "K10 sc-rows $(grep -cE "^  it\('SC[0-9]+" $T) new-rows $(grep -cE "^  it\('SC3[0-3] " $T) describes $(grep -cE "^describe\('" $T) sc22-title-narrowed $(grep -c 'with no event it stays pending (the error-event order is SC23)' $T)"
echo "K11 gate366-stem-cache-test $(sed 's/\x1b\[[0-9;]*m//g' $L/gates/round-366/verify.log | grep -m1 -oE 'stem-cache.test.ts \([0-9]+ tests\) [0-9]+ms')"
echo "K12 protected-ok $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K13 doc236-l4 $(sed -n '4p' $DOC) | pending $(grep -rl 'C round [0-9]* pending' $S/docs/implementation | wc -l) | stage-hits $(grep -rln 'In Progress (stage' $S/docs/implementation | sed "s#$S/##" | sort | tr '\n' ' ')| headings $(grep -c '^## ' $DOC) | sc22-credit $(grep -c 'SC22, SC23' $DOC) | sc30-33-named $(grep -oE 'SC3[0-3]' $DOC | sort -u | tr '\n' ' ')"
echo "K14 package.json-sha $(sha256sum $S/package.json | cut -c1-12) lock-sha $(sha256sum $S/package-lock.json | cut -c1-12)"
echo "K16 artifacts-missing $(for f in b-round-367/sketch.patch.txt b-round-367/sketch-delta.patch.txt b-round-367/sketch-dispatched.sha256 b-round-367/sketch-typecheck.log b-round-367/sketch-biome.log b-round-367/sketch-covering.log b-round-367/precheck-full.log b-round-367/sketch-review.md b-round-367/mutants/mutant-summary.txt b-round-367/mutants/round367-client-vs-v3-tests.log b-round-367/dedup-probe-v3.log b-round-367/mutate.py b-round-367/v2-stem-cache.client.ts.txt b-round-367/probe/sketch-1440x900.json b-round-367/probe/sketch-1280x720.json b-round-366/probe/stem-integrity-probe.mjs b-round-366/probe/summarize.py; do test -f $L/$f || echo -n "$f "; done; echo)"
echo "K17 idle-app-callers $(grep -rn '\.idle()' $S/app --include=*.ts --include=*.tsx | grep -v __tests__ | wc -l) export-transactionDone $(grep -c '^export function transactionDone' $C)"
echo "K19 sketch-sha $(sha256sum $L/b-round-367/sketch.patch.txt | cut -c1-12) delta-sha $(sha256sum $L/b-round-367/sketch-delta.patch.txt | cut -c1-12)"
