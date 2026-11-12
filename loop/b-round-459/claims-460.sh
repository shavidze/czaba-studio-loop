#!/usr/bin/env bash
# Claims for round 460 (SABA-B-13 fix-up, C-R459-01). One line per claim. S defaults to the store tree.
S=${S:-/home/runner/czaba-project/store}; L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-459
echo "K1 $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-458.json'));print(g['status'],g['commit'][:7])") | $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-459.json'));print(g['status'],'-',g['reason'])")"
echo "K2 $(git -C $S rev-parse --short=7 HEAD) dirty=$(git -C $S status --short --untracked-files=all | wc -l)"
echo "K3 v1=$(cd $S && sha256sum -c $L/b-round-458/sketch-files-sha256.txt 2>/dev/null | grep -c ': OK') v2c=$(cd $S && sha256sum -c $B/sketch-460-files-sha256.txt 2>/dev/null | grep -c ': OK')"
echo "K4 $(cd $L && sha256sum -c b-round-459/sketch-460.sha256 2>&1 | grep -c ': OK') review=$(grep -c "$(cut -c1-64 $B/sketch-460.sha256 | head -1)" $B/sketch-review.md 2>/dev/null)"
echo "K5 $(grep -c 'handshake\|__czabaEntrance' $S/app/components/loading/SpotlightLoader.tsx) $(grep -c '__czabaEntrance' $S/app/components/loading/EntranceCover.tsx) $(grep -c 'isEntrancePending' $S/app/components/loading/EntranceCover.tsx)"
echo "K6 lines=$(wc -l < $B/mutants/mutants.txt) red=$(grep -c ' RED ' $B/mutants/mutants.txt) base=$(grep -c '^BASE green' $B/mutants/mutants.txt)"
echo "K7 $(for p in 5190 5191 5192; do printf "%s:%s/%s " $p $(grep "^$p inject" $B/probe/r1/r1-b.txt | grep -c '"overlaySeen":true') $(grep -c "^$p inject" $B/probe/r1/r1-b.txt); done)"
echo "K8 $(grep -c '^\*\*სტატუსი:\*\* Completed (C round 459 PASS)$' $S/docs/implementation/2026/quarter-IV/300-saba-b-13-store-entrance-cover.md) $(grep -c 'C round 460 PASS' $S/docs/implementation/2026/quarter-IV/300-saba-b-13-store-entrance-cover.md)"
echo "K9 $(cd $L && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K10 $(for f in sketch-460-delta.patch.txt sketch-460-full.patch.txt sketch-460.sha256 sketch-460-files-sha256.txt sketch-review.md mutants.py mutants/mutants.txt claims-460.sh covering-460.txt precheck-covering.log precheck-typecheck.log precheck-lint.txt precheck-biome-files.txt probe/frames.mjs probe/console.mjs probe/serve-prod.sh probe/r1-repro.mjs probe/r1/r1-b.txt probe/matrix/summary.txt probe/matrix/table.py probe/matrix/table.txt probe/matrix/run-matrix.sh probe/matrix/reblack.py probe/matrix/run-rerender.sh probe/matrix/summary-rerender.txt probe/r1/r1-b-v2a.txt probe/matrix/v2a-partial/5192-1440-cpu1-inject.json claims-460-planning-output.txt claims-460-expected-after-A.txt probe/dev-console-v2c.txt; do test -f $B/$f && printf 1 || printf "0($f)"; done)"
echo "K11 $(python3 -I $B/probe/matrix/table.py $B/probe/matrix/summary.txt | awk '$1==5192 && ($4 ~ /^fresh/ || $4 ~ /^clientnav/){print $2"/"$3"/"$4, "remFC"$16, "remStart"$18, "logo"$22, "tag"$24, $28}' | tr '\n' ';')"
echo "K12 $(python3 -I -c "
import json
for l in open('$B/probe/matrix/summary-rerender.txt'):
    p = l.split(' ', 4)
    if len(p) < 5: continue
    d = json.loads(p[4]); fc = d['firstCovered']; rm = d['removedAt']
    print(p[0] + '/' + p[1] + '/' + p[2] + '/' + p[3], 'rep' + str(d['styleReplaced']), 'err' + str(d['hydrationErrors'] > 0), 'remFC' + str(None if fc is None or rm is None else rm - fc), 'gaps' + str(d['gapsWhileCovered']), 'logo' + str(d['logoFullMs']), 'hs' + str(d['handshakeState']), 'ov' + str(d['overlaySeen']))
" | tr '\n' ';')"
echo "K13 $(python3 -I $B/probe/matrix/table.py $B/probe/matrix/summary.txt | awk '$1==5192 && ($4 ~ /^click50/ || $4 ~ /^esc50/ || $4 ~ /^tab50/){print $2"/"$3"/"$4, "remInp"$NF}' | tr '\n' ';')"
echo "K14 $(grep -E 'Tests ' $B/precheck-covering.log | sed 's/\x1b\[[0-9;]*m//g' | tr -s ' ')|tsc_rc=$(tail -1 $B/precheck-typecheck.log)|$(grep -oE 'Found [0-9]+ warnings' $B/precheck-lint.txt)"
echo "K15 $(grep -oE 'lint/[a-zA-Z/]+' $B/precheck-biome-files.txt | sort | uniq -c | tr -s ' ' | tr '\n' ' ')"
echo "K16 $(grep -c 'StrictMode' $S/app/entry.client.tsx)"
echo "K17 $(grep -c '"hydration": 0' $B/probe/dev-console-v2c.txt)/$(grep -c '"hydration":' $B/probe/dev-console-v2c.txt)"
