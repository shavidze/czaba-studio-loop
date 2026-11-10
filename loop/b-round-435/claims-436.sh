#!/usr/bin/env bash
# Round 436 claims (COPY-PD-VIS stage 1: STUDIO-VIS-4 + SR-435-2 + STUDIO-VIS-6). ROOT/LOOP may be overridden. One line per claim.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-435
S=app/lib/arrangement/strings.ts
C=app/components/arrangement/ArrangementClip.tsx
P=app/components/arrangement/ArrangementDetailPanel.tsx
Q=docs/implementation/2026/quarter-IV
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD | cut -c1-7) gate435 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-435.json'));print(a['status'],a['head'][:7])")"
echo "K2 status total $(git status --short --untracked-files=all | wc -l) outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-436.txt" | wc -l)"
sha256sum --quiet -c "$B/r436-frozen-sha256.txt" >/dev/null 2>&1; echo "K3 frozen $(wc -l < "$B/r436-frozen-sha256.txt") rc $?"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K4 protected rc $? granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-436.txt")"
if git apply --check "$B/sketch-436.patch.txt" 2>/dev/null; then echo "K5 sketch-applies yes"; else echo "K5 sketch-applies no"; fi
echo "K6 last-doc $(ls $Q/ | sort | tail -1) doc283 $(ls $Q/283-* 2>/dev/null | wc -l)"
echo "K7 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])") today $(date -u +%F)"
echo "K8 strings old-label $(grep -c "sourceOffsetLabel: 'Source offset'," $S) old-footer $(grep -c "text: ' · source offset '," $S) old-from $(grep -c "rangeFromLabel: 'From, s'," $S) old-to $(grep -c "rangeToLabel: 'To, s'," $S) new-label $(grep -c "sourceOffsetLabel: 'Clip origin'," $S) new-footer $(grep -c "text: ' · clip origin '," $S) new-from $(grep -c "rangeFromLabel: 'From'," $S) new-to $(grep -c "rangeToLabel: 'To'," $S)"
echo "K8b aria start $(grep -c "rangeStartLabel: 'Time selection start (seconds)'," $S) end $(grep -c "rangeEndLabel: 'Time selection end (seconds)'," $S) panel-uses $(grep -c 'aria-label={studioDetailStrings.range\(Start\|End\)Label}' $P) panel-visible $(grep -c 'studioDetailStrings.range\(From\|To\)Label}' $P)"
echo "K8c clip-status old $(grep -c ', source offset ${formatArrangementTime(updated.sourceOffset)}' $C) new $(grep -c ', clip origin ${formatArrangementTime(updated.sourceOffset)}' $C)"
echo "K9 SWEEP-ui roots app perf e2e (non-test) source-offset $(grep -rniE 'source offset' app perf e2e 2>/dev/null | grep -v '/__tests__/' | wc -l) clip-origin $(grep -rniE 'clip origin' app perf e2e 2>/dev/null | grep -v '/__tests__/' | wc -l)"
echo "K9b SWEEP-tests roots app/**/__tests__ perf e2e old-literals $(grep -rnE "'Source offset'|source offset 00:|' · source offset '|'From, s'|'To, s'" app perf e2e 2>/dev/null | grep -E '/__tests__/|^perf/|^e2e/' | wc -l) files $(grep -rlE "'Source offset'|source offset 00:|' · source offset '|'From, s'|'To, s'" app perf e2e 2>/dev/null | grep -E '/__tests__/|^perf/|^e2e/' | wc -l) new-literals $(grep -rnE "'Clip origin'|clip origin 00:|' · clip origin '|'From'\]|'To'\]" app perf e2e 2>/dev/null | grep -E '/__tests__/|^perf/|^e2e/' | wc -l)"
echo "K10 sketch-sha $(sha256sum "$B/sketch-436.patch.txt" | cut -c1-16) recorded $(cut -c1-16 "$B/sketch-436.sha256") review-names $(grep -c "$(cat "$B/sketch-436.sha256")" "$B/sketch-review.md") diff-headers $(grep -c '^diff --git' "$B/sketch-436.patch.txt")"
for f in sketch-436.patch.txt sketch-436.sha256 sketch-review.md mutants/summary.txt mutants/run.py precheck-covering.log precheck-full.log precheck-typecheck.log precheck-lint.log covering-files.txt grants-436.txt r436-frozen-sha256.txt probe/copy-probe.mjs probe/compare-raw.txt probe/head/copy-probe.json probe/sketch/copy-probe.json screens/capture-base.mjs screens/compare.txt screens/head/screen435.json screens/sketch/screen435.json claims-436-sketch-output.txt claims-436-planning-vs-sketch.diff.txt current-task-before-436.md l57-check-c435.txt update-backlog.py update-backlog.done; do test -f "$B/$f" && printf 'ok ' || printf 'MISSING:%s ' "$f"; done | sed 's/^/K11 artifacts /'; echo
echo "K12 archive-435 $(cmp -s "$LOOP/tasks/round-435.md" "$B/current-task-before-436.md" && echo identical || echo differs)"
python3 -I "$LOOP/tools/find-ids.py" "$LOOP" STUDIO-VIS-4 STUDIO-VIS-6 STUDIO-VIS-7 STUDIO-VIS-10 SABA-LANE-RESIZE-HANDLE TL-R436-02-INLINE-STATUS TL-R436-03-LABEL-IN-NAME C-R425-01-RVM-COLD-DEV-EMPTY | sed 's/^/K13 /' | cut -c1-140
echo "K13b screen-candidates $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print([(x['id'],x['status'][:40]) for x in b['screen_review_candidates'] if x.get('id') in ('SR-435-1','SR-435-2')])")"
echo "K14 backlog-v $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print(b['version'], b['decisions_log_b'][-1]['id'])")"
echo "K15 probe $(cat "$B/probe/compare-raw.txt" | python3 -I -c "
import sys,json
for l in sys.stdin:
    s,k,j=l.split(' ',2); d=json.loads(j); print(s,k,d['from'],d['to'],d['fb']['w'],d['fb']['h'],d['sb']['w'],d['ob']['w'],'hits',sum(d['hits']),'footer-ofl',d['footer']['overflow'],'trim',d['trim'][0][:22],end=' | ')")"
echo "K16 mutants red $(grep -c '^M[0-9]-[a-z]* rc 1 red: [^n]' "$B/mutants/summary.txt") of $(grep -c '^M[0-9]' "$B/mutants/summary.txt") sketch $(grep '^sketch-green' "$B/mutants/summary.txt")"
echo "K17 covering $(wc -l < "$B/covering-files.txt") run $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-covering.log" | grep -E '^ +Tests ' | tr -s ' ')"
echo "K18 full $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-full.log" | grep -E '^ +(Test Files|Tests) ' | tr -s ' ' | tr '\n' ' ')$(tail -1 "$B/precheck-full.log")"
echo "K19 l58 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K20 c435 $(python3 -I -c "import json;c=json.load(open('$LOOP/c-round-435.json'));print(c['taskStatus'],len(c['bugs']),c['browserVerified'],c['realVerified'])")"
echo "K21 stem-lanes agree-answer $(grep -ciE "saba.s answer|approved by saba|^decision:" "$LOOP/user-review/AGREE-STEM-LANES.md" 2>/dev/null) q-retro-435-answers $(ls "$LOOP/user-review/" | grep -ciE 'retro-435.*(answer|decision)')"
echo "K24 screens $(head -2 "$B/screens/compare.txt" | tr '\n' ' ')"
echo "K25 stem-lanes-435-method $(cd "$LOOP" && bash b-round-434/claims-435.sh 2>/dev/null | grep "^K25")"
echo "K22 lessons lines $(wc -l < "$LOOP/lessons.md")"
echo "K23 lint $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-lint.log" | grep -E '^Found [0-9]+ warnings') typecheck $(tail -1 "$B/precheck-typecheck.log")"
