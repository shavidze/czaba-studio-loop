#!/usr/bin/env bash
# Round 439 claims (SYS-R435 v4 re-do, test-only). ROOT/LOOP may be overridden. One line per claim.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-438
P=$LOOP/b-round-437
A=app/components/arrangement
T=app/lib/arrangement/__tests__
Q=docs/implementation/2026/quarter-IV
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD | cut -c1-7) gate438 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-438.json'));print(a['status'],a.get('reason',''))")"
echo "K2 status total $(git status --short --untracked-files=all | wc -l) outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-439.txt" | grep -v '/$' | wc -l)"
sha256sum --quiet -c "$P/r438-frozen-sha256.txt" >/dev/null 2>&1; K3RC=$?; echo "K3 frozen $(wc -l < "$P/r438-frozen-sha256.txt") rc $K3RC"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; K4RC=$?; echo "K4 protected rc $K4RC granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-439.txt")"
eqv3=0; eqv4=0; while read p; do cmp -s "$p" "$P/sketch-files/$p" && eqv3=$((eqv3+1)); cmp -s "$p" "$B/sketch-files/$p" && eqv4=$((eqv4+1)); done < "$B/sketch-paths.txt"; echo "K5 tree-equals-v3 $eqv3/8 tree-equals-v4 $eqv4/8"
if git apply --check -p1 "$B/sketch-439-delta.patch.txt" 2>/dev/null; then echo "K6 delta-applies yes"; else echo "K6 delta-applies no"; fi
echo "K7 doc285 $(ls $Q/285-* 2>/dev/null | wc -l) line4 [$(sed -n 4p $Q/285-sys-r435-source-scan-helper.md 2>/dev/null)] no-assertion-lost $(grep -c 'არცერთი assertion არ დაკარგულა' $Q/285-sys-r435-source-scan-helper.md 2>/dev/null) last-doc $(ls $Q/ | sort | tail -1)"
echo "K8 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])")"
echo "K9 any-tag-query $(grep -c 'export function scanAllJsxOpeningTags' $T/helpers/source-scan.ts) nf2-any-tag $(grep -c 'scanAllJsxOpeningTags(readSourceFiles())' $T/studio-number-field.test.ts) pg2-raw-guard $(grep -c 'text.match(/<progress\\b/g)' $T/studio-progress.test.ts) ss9 $(grep -c "it('SS9:" $T/source-scan.test.ts)"
echo "K10 wrapper-type-number-today $(python3 -I -c "
import re,os
hits=[]
for d,_,fs in os.walk('$A'):
    if '__tests__' in d: continue
    for f in fs:
        if f.endswith('.tsx'):
            s=open(os.path.join(d,f)).read()
            for m in re.finditer(r'<([A-Za-z][\w.]*)\b((?:[^<>]|=>)*?)type=[{\"\'\`]+number',s):
                if m.group(1)!='input': hits.append(f+':'+m.group(1))
print(len(hits),' '.join(hits))")"
for f in sketch-439.patch.txt sketch-439-delta.patch.txt sketch-439.sha256 sketch-paths.txt grants-439.txt covering-files.txt typecheck-sketch.log lint-sketch.log covering-sketch.log full-suite-sketch.log mutants/mutate.py mutants/helper-mutants.py mutants/head.jsonl mutants/v3.jsonl mutants/sketch.jsonl mutants/helper.jsonl sketch-review.md tech-lead-review-v4.md tech-lead-review-v41.md head-assertion-map.md doc285-edits.md doc285-expected.md l31-headroom.txt claims-439-expected-after-A.diff.txt sketch-files/app/lib/arrangement/__tests__/helpers/source-scan.ts ../b-round-437/probe/play-status.mjs ../b-round-436/probe/press-export-probe.mjs ../c-round-438/m17-new-m17.log; do test -f "$B/$f" && echo "K11 exists $f" || echo "K11 MISSING $f"; done
echo "K12 archive-438 $(cmp -s "$LOOP/tasks/round-438.md" "$B/current-task-before-439.md" && echo identical || echo differs)"
python3 -I "$LOOP/tools/find-ids.py" "$LOOP" SYS-R435-SOURCE-SCAN-HELPER C-R438-01-NF2-WRAPPER-TAG-NARROWING A-R438-REVIEW-L1-PG2-STRING-MARKUP A-R438-REVIEW-L2-DS4-SF2-TEXT-CONTAINMENT A-R438-REVIEW-L3-PARSE-DIAGNOSTICS SIG-R438-OTHER-SCANNERS 2>/dev/null | awk '{$2="";print "K13",$0}'
echo "K14 open-CHM $(python3 -I -c "
import json
b=json.load(open('$LOOP/backlog.json'))
o=[e['id'] for e in b['open_findings'] if str(e.get('severity','')).lower() in ('critical','high','medium') and not str(e.get('status','')).lower().startswith(('closed','done','resolved','fixed','wontfix','deferred_user','merged'))]
print(len(o),' '.join(sorted(o)))")"
echo "K15 backlog $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));d=b['decisions_log_b'];print('v'+str(b['version']),d[-1]['id'])")"
echo "K16 c438 $(python3 -I -c "import json;c=json.load(open('$LOOP/c-round-438.json'));print(c['taskStatus'],c['browserVerified'],len(c['bugs']))")"
echo "K17 review-names-shas $(grep -c "$(sed -n 1p "$B/sketch-439.sha256" | cut -c1-64)" "$B/sketch-review.md" 2>/dev/null) $(grep -c "$(sed -n 2p "$B/sketch-439.sha256" | cut -c1-64)" "$B/sketch-review.md" 2>/dev/null) $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md 2>/dev/null | tail -1)"
echo "K18 mutants $(python3 -I -c "
import json
for f in ('head','v3','sketch','helper'):
    rows=[json.loads(l) for l in open('$B/mutants/'+f+'.jsonl')]
    print(f, ' '.join(r['id'].split('-')[0]+':'+str(r['rc'])+':'+','.join(r.get('fails',r.get('red',[]))) for r in rows), end=' | ')
")"
echo "K19 full-sketch $(sed 's/\x1b\[[0-9;]*m//g' "$B/full-suite-sketch.log" | grep -E 'Test Files|Tests  |^rc ' | tr -s ' ' | tr '\n' ' ')"
echo "K20 lessons lines $(wc -l < "$LOOP/lessons.md")"
echo "K21 doc285-vs-expected $(cmp -s $Q/285-sys-r435-source-scan-helper.md "$B/doc285-expected.md" && echo identical || echo differs) stale-grep $(grep -cE 'SS1–SS8|23/23|round 438|a-round-438|b-round-437/mutants' $Q/285-sys-r435-source-scan-helper.md)"
