#!/usr/bin/env bash
# Round 438 claims (SYS-R435-SOURCE-SCAN-HELPER, test-only). ROOT/LOOP may be overridden. One line per claim.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-437
A=app/components/arrangement
T=app/lib/arrangement/__tests__
Q=docs/implementation/2026/quarter-IV
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD | cut -c1-7) gate437 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-437.json'));print(a['status'],a['commit'][:7])")"
echo "K2 status total $(git status --short --untracked-files=all | wc -l) outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-438.txt" | grep -v '/$' | wc -l)"
sha256sum --quiet -c "$B/r438-frozen-sha256.txt" >/dev/null 2>&1; K3RC=$?; echo "K3 frozen $(wc -l < "$B/r438-frozen-sha256.txt") rc $K3RC"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; K4RC=$?; echo "K4 protected rc $K4RC granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-438.txt")"
if git apply --check -p1 "$B/sketch-438.patch.txt" 2>/dev/null; then echo "K5 sketch-applies yes"; else echo "K5 sketch-applies no"; fi
echo "K6 last-doc $(ls $Q/ | sort | tail -1) doc285 $(ls $Q/285-* 2>/dev/null | wc -l)"
echo "K7 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])")"
echo "K8 arrangement-subdirs $(find $A -mindepth 1 -type d | wc -l) tsx-top $(ls $A/*.tsx | wc -l)"
echo "K9 readdir-scanners $(grep -l 'readdirSync' $T/studio-number-field.test.ts $T/studio-radio.test.ts $T/studio-progress.test.ts $T/studio-search-field.test.ts $T/studio-dialog-scrollbar.test.tsx $T/held-enter-source-scan.test.ts 2>/dev/null | wc -l) helper $(test -f $T/helpers/source-scan.ts && echo present || echo absent)"
echo "K10 old-patterns NUMBER_INPUT $(grep -c 'const NUMBER_INPUT = /type=' $T/studio-number-field.test.ts) RADIO_TYPE $(grep -c 'const RADIO_TYPE = /\\btype=' $T/studio-radio.test.ts) LITERAL_TYPE-az $(grep -c "const LITERAL_TYPE = /\\\\btype=\[\"'\]\[a-z\]+" $T/studio-radio.test.ts) REPEAT-no-lookbehind $(grep -c 'const REPEAT = String.raw`\[' $T/held-enter-source-scan.test.ts)"
echo "K11 SWEEP-spread-input roots $A spread-attr-owners $(cd "$ROOT" && node -e "
const fs=require('fs');const p=require('path');const d='$A';let o=[];
for(const f of fs.readdirSync(d).filter(f=>f.endsWith('.tsx'))){const s=fs.readFileSync(p.join(d,f),'utf8');const re=/<input(?=[\s/>])/g;let m;while((m=re.exec(s))){const e=s.indexOf('/>',m.index);const t=s.slice(m.index,e);if(/^\s*\{\.\.\.\w+\}\s*$/m.test(t))o.push(f+':'+s.slice(0,m.index).split('\n').length)}}
console.log(o.join(' '))") mixfader-omit-type $(grep -c "'type' | 'value'" $A/ArrangementMixFader.tsx) markerrow-object-spread $(grep -c '{ ...current, draft }' $A/ArrangementMarkerRow.tsx)"
echo "K12 number-class-via inputClass-template $(grep -c 'disabled:text-dim \${STUDIO_NUMBER_FIELD_CLASS}`;' $A/ArrangementDetailPanel.tsx) prop-inputClass $(grep -c 'inputClass: string;' $A/ArrangementDetailPanel.tsx) number-tags $(grep -c 'type="number"' $A/ArrangementDetailPanel.tsx)"
echo "K13 tags radio $(grep -c 'type="radio"' $A/ArrangementExportDialog.tsx) progress $(grep -c '<progress' $A/ArrangementExportDialog.tsx) search $(grep -l 'type="search"' $A/*.tsx | xargs -n1 basename | tr '\n' ' ')modal $(grep -l '<Modal' $A/*.tsx | xargs -n1 basename | tr '\n' ' ')"
echo "K14 doc282-point7 $(grep -c 'DS4-ის არე' $Q/282-saba-b-12-dialog-scrollbar.md) studio-legacy-modal $(grep -c '<Modal' app/components/studio/ExportDialog.tsx)"
for f in sketch-438.patch.txt sketch-paths.txt grants-438.txt r438-frozen-sha256.txt covering-files.txt typecheck-sketch.log full-suite-sketch.log mutants/mutate.py mutants/helper-mutants.py mutants/head.jsonl mutants/sketch.jsonl mutants/helper.jsonl sketch-review.md sketch-438.sha256 tech-lead-review-v1.md probe/play-status.json probe/play-status.mjs tech-lead-review-v2.md tech-lead-review-v3.md l31-headroom.txt sketch-files/app/lib/arrangement/__tests__/helpers/source-scan.ts lint-sketch.log covering-sketch.log ../b-round-436/probe/press-export-probe.mjs ../b-round-436/probe/sketch-press/press-export.json ../user-review/note-round-438-play-after-decode.md; do test -f "$B/$f" && echo "K15 exists $f" || echo "K15 MISSING $f"; done
echo "K16 archive-437 $(cmp -s "$LOOP/tasks/round-437.md" "$B/current-task-before-438.md" && echo identical || echo differs)"
python3 -I "$LOOP/tools/find-ids.py" "$LOOP" SYS-R435-SOURCE-SCAN-HELPER STUDIO-VIS-7 STUDIO-VIS-10 SABA-LANE-RESIZE-HANDLE C-R437-01 A-R429-REVIEW-SCAN-NEGATED-REPEAT A-R430-REVIEW-NF2-TYPE-BOUNDARY A-R430-REVIEW-NF2-SIDE-EFFECT-IMPORT A-R430-REVIEW-NF2-CLASSNAME-CONST A-R431-REVIEW-L1-RD2-SPREAD-AFTER-TYPE A-R431-REVIEW-L2-RD2-DATA-TYPE A-R431-REVIEW-L3-RD2-DATETIME-LOCAL A-R432-REVIEW-RV432-5-PG2-SPREAD A-R433-REVIEW-SF2-SCANNER-BLIND-SPOTS GATE434-S2-DS4-SOURCE-SCAN-SCOPE GATE431-REVIEW-L3-STRING-COUNT-PINS 2>/dev/null | awk '{$2="";print "K17",$0}'
echo "K18 open-CHM $(python3 -I -c "
import json
b=json.load(open('$LOOP/backlog.json'))
o=[e['id'] for e in b['open_findings'] if str(e.get('severity','')).lower() in ('critical','high','medium') and not str(e.get('status','')).lower().startswith(('closed','done','resolved','fixed','wontfix','deferred_user','merged'))]
print(len(o),' '.join(sorted(o)))")"
echo "K19 backlog $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));d=b['decisions_log_b'];print('v'+str(b['version']),d[-1]['id'])")"
echo "K20 lessons lines $(wc -l < "$LOOP/lessons.md") L61-old-wording $(grep -c "pointer capture keeps" "$LOOP/lessons.md")"
echo "K26 saba stem-lanes-answer $(grep -ciE "saba.s answer|approved by saba|^decision:" "$LOOP/user-review/AGREE-STEM-LANES.md" 2>/dev/null) q-retro-435-answers $(ls "$LOOP/user-review/" | grep -ciE "retro-435.*(answer|decision)") play-after-decode-answer $(ls "$LOOP/user-review/" | grep -ciE "play-after-decode.*(answer|decision)") direction $(test -f /home/runner/czaba-project/docs/technical/store-redesign/direction-decision.md && echo present || echo absent)"
echo "K22 c437 $(python3 -I -c "import json;c=json.load(open('$LOOP/c-round-437.json'));print(c['taskStatus'],c['browserVerified'],len(c['bugs']))") l57 $(tail -1 "$LOOP/c-round-437/l57-check.txt")"
echo "K23 decode-refusal $(grep -c 'const awaiting = clipSourcesAwaitingDecode(arrangement);' app/contexts/ArrangementContext.tsx) sourceDecoding $(grep -c 'studioLibraryStrings.sourceDecoding(title)' app/contexts/ArrangementContext.tsx)"
echo "K21 review-names-sha $(grep -c "$(cut -c1-64 "$B/sketch-438.sha256")" "$B/sketch-review.md" 2>/dev/null) $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md 2>/dev/null | tail -1)"
echo "K24 mutants $(python3 -I -c "
import json
for f in ('head','sketch','helper'):
    rows=[json.loads(l) for l in open('$B/mutants/'+f+'.jsonl')]
    print(f, ' '.join(r['id'].split('-')[0]+':'+str(r['rc'])+':'+','.join(r.get('fails',r.get('red',[]))) for r in rows), end=' | ')
")"
echo "K25 full-sketch $(sed 's/\x1b\[[0-9;]*m//g' "$B/full-suite-sketch.log" | grep -E 'Test Files|Tests  |^rc ' | tr -s ' ' | tr '\n' ' ')"
