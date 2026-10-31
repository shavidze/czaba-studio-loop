#!/usr/bin/env bash
# Round 295 claims (run from store/). Output must equal b-round-294/claims-295-output.txt before A edits.
L=../tmp/studio-real-loop
echo "K1 HEAD $(git rev-parse --short HEAD); gate294 $(python3 -c "import json;g=json.load(open('$L/gates/gate-round-294.json'));print(g['status'], g['commit'][:7])")"
echo "K2 status lines $(git status --short --untracked-files=all | wc -l)"
echo "K3 frozen $(wc -l < $L/b-round-294-r295-tree-sha256.txt) rc $(sha256sum -c --quiet $L/b-round-294-r295-tree-sha256.txt >/dev/null 2>&1; echo $?)"
for f in app/routes/studio.\$productId.tsx app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/auth.ts app/contexts/AuthContext.tsx app/lib/firebase.client.ts app/services/api/client.ts; do echo "K4 $f $(grep -cF "  $f" $L/b-round-294-r295-tree-sha256.txt)"; done
C=app/lib/arrangement/demo-synth.client.ts
echo "K5 stall timer: clearTimeout(stallTimer) at l.$(grep -n 'window.clearTimeout(stallTimer);' $C | cut -d: -f1), setTimeout stall at l.$(grep -n 'stallTimer = window.setTimeout' $C | cut -d: -f1)"
echo "K6 metronome guard: $(grep -n 'onClick={guardSoftDisabledClick(onMetronomeToggle)}' app/components/arrangement/ArrangementTempoRow.tsx | cut -d: -f1); TempoRow imported by self-disabling-focus: $(grep -c "from '~/components/arrangement/ArrangementTempoRow'" app/lib/arrangement/__tests__/self-disabling-focus.test.tsx)"
Z=app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx
echo "K7 ZQ3: before at l.$(grep -n "const before = svg.querySelector('polyline')?.getAttribute('points');" $Z | cut -d: -f1); toBeTruthy on before: $(grep -c 'expect(before).toBeTruthy();' $Z)"
echo "K8 LoAF: spec check l.$(grep -n 'entry.scriptMax !== undefined' perf/studio-lab.perf.spec.ts | cut -d: -f1); scriptCount in perf/lib: $(grep -rc scriptCount perf/lib | awk -F: '{s+=$2} END {print s}'); loafScriptsProblem in perf: $(grep -rc loafScriptsProblem perf | awk -F: '{s+=$2} END {print s}')"
echo "K9 SWEEP new ids in test roots (app perf e2e): DW12 $(grep -rn 'DW12' app perf e2e | wc -l); SD10 $(grep -rn "SD10" app perf e2e | wc -l); LOAF1 $(grep -rn 'LOAF1' app perf e2e | wc -l)"
echo "K10 SWEEP harness.loaf-scripts readers: $(grep -rln 'harness.loaf-scripts' app perf e2e | sort | tr '\n' ' ')"
echo "K11 SWEEP files importing perf/lib/report: $(grep -rln "lib/report'\|'./report'" perf | sort | tr '\n' ' ')"
echo "K12 vitest include: $(grep -n 'include:' vitest.config.ts | tr -s ' ')"
echo "K13 lines: dsw $(wc -l < app/lib/arrangement/__tests__/demo-synth-worker.test.ts) sdf $(wc -l < app/lib/arrangement/__tests__/self-disabling-focus.test.tsx) cev $(wc -l < $Z) instr $(wc -l < perf/lib/instrumentation.ts) report $(wc -l < perf/lib/report.ts) rtest $(wc -l < perf/lib/report.test.ts) spec $(wc -l < perf/studio-lab.perf.spec.ts)"
echo "K14 docs starting 219: $(ls docs/implementation/2026/quarter-IV/ | grep -c '^219')"
echo "K15 B artifacts: $(for p in b-round-294/sketch-sys-vacuous-rows.diff b-round-294/sketch-tests.log b-round-294/sketch-perf-unit.log b-round-294/mutant-stall-timer.log b-round-294/mutant-metronome-wrapper.log b-round-294/mutant-zq3-no-polyline.log b-round-294/mutant-loaf-any-entry.log b-round-294/probe/loaf-result.json b-round-294/probe/tap-result.json b-round-294/backlog-before-295.json; do test -f $L/$p && echo -n 'ok '; done)"
