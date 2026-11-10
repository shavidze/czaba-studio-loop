#!/usr/bin/env bash
# Round 428 claims (SYS-2 stage 4 = 2b-ii-a: held Enter on the shortcut sheet, export dialog and narrow-screen buttons). ROOT/LOOP may be overridden. One line per claim.
# Id lookups go through tools/find-ids.py (backlog + archive). No root-consumed request file is an input.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-427
A=app/components/arrangement
WS=$A/StudioWorkspace.tsx; SH=$A/ArrangementShortcutSheet.tsx; NS=$A/StudioNarrowScreen.tsx; XD=$A/ArrangementExportDialog.tsx
FOUR="$WS $SH $NS $XD"
T=app/lib/arrangement/__tests__
D=docs/implementation/2026/quarter-IV/276-sys-held-enter-dialogs.md
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD) gate427 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-427.json'));print(a['status'],a['commit'][:7])")"
echo "K2 status $(git status --short --untracked-files=all | awk '{print $1}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')total $(git status --short --untracked-files=all | wc -l)"
echo "K2b status-outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-428.txt" | wc -l)"
sha256sum --quiet -c "$B/r428-frozen-sha256.txt" >/dev/null 2>&1; echo "K3 frozen $(wc -l < "$B/r428-frozen-sha256.txt") rc $?"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K4 protected rc $? granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-428.txt")"
if git apply --check "$B/sketch-428.patch.txt" 2>/dev/null; then echo "K5 sketch-applies yes"; else echo "K5 sketch-applies no"; fi
echo "K6 last-doc $(ls docs/implementation/2026/quarter-IV/ | sort | tail -1) doc276-l4 $(sed -n 4p $D 2>/dev/null || echo absent) doc274-l4 $(sed -n 4p docs/implementation/2026/quarter-IV/274-sys-held-enter-mixer.md) doc275-l4 $(sed -n 4p docs/implementation/2026/quarter-IV/275-sys-held-enter-panels.md)"
echo "K7 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])")"
echo "K8 inline-enter-repeat $(for f in $FOUR; do printf '%s=%s ' "$(basename $f .tsx)" "$(grep -c "event.key === 'Enter' && event.repeat" $f)"; done)helper-uses $(for f in $FOUR; do printf '%s=%s ' "$(basename $f .tsx)" "$(grep -c 'preventRepeatedEnterKeyDown' $f)"; done)"
echo "K8b inline-enter-repeat-app-perf $(grep -rn "event.key === 'Enter' && event.repeat" app perf --include=*.ts --include=*.tsx | grep -v __tests__ | awk -F: '{print $1}' | xargs -r -n1 basename | sort | uniq -c | tr -s ' ' | tr '\n' ' ')"
echo "K9 scan-4 $(python3 -I "$LOOP/b-round-425/button-guard-scan-enter.py" $FOUR | awk -F'\t' '{print $2}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')"
echo "K9b scan-folder $(python3 -I "$LOOP/b-round-425/button-guard-scan-enter.py" $A/*.tsx | awk -F'\t' '{print $2}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')"
echo "K9c left $(python3 -I "$LOOP/b-round-425/button-guard-scan-enter.py" $A/*.tsx | grep -vE 'ENTER-GUARD' | awk -F'\t' '{split($1,a,":"); print a[1]}' | xargs -n1 basename | sort | uniq -c | tr -s ' ' | tr '\n' ' ')"
echo "K9d closure-nonarrangement-button-files $(python3 -I "$B/tools/import-closure.py" "$ROOT" app/routes/studio-lab.tsx | grep -v '^app/components/arrangement/' | while read f; do n=$(grep -c '<button' "$f"); [ "$n" -gt 0 ] && printf '%s=%s ' "$f" "$n"; done)"
echo "K10 sketch-sha $(sha256sum "$B/sketch-428.patch.txt" | cut -c1-16) recorded $(cut -c1-16 "$B/sketch-428.sha256") review-names $(grep -c "$(cat "$B/sketch-428.sha256")" "$B/sketch-review.md" 2>/dev/null)"
for f in sketch-428.patch.txt sketch-428.sha256 sketch-review.md sketch-428-v1-fc3d0b63.patch.txt sketch-delta-fc3d0b63-to-final.patch.txt mutants/v1-fc3d0b63/summary.txt precheck-a2-v1.log precheck-full-v1.log tools/make-sketch-delta.py update-backlog.py precheck-typecheck.log precheck-lint.log precheck-biome7.log precheck-a2.log precheck-full.log covering-files.txt grants-428.txt r428-frozen-sha256.txt mutants/run.py mutants/summary.txt probe/held-enter-2bii.mjs probe/compare.py probe/compare.txt probe/compare-head-as-sketch.txt probe/g428-auth.cjs probe/auth-head/g428-auth.json update-backlog-2.py tools/make-sketch-src.py tools/make-sketch-tests.py tools/import-closure.py data/l50-focus-origins.txt l57-check-c427.txt; do test -f "$B/$f" && echo "K11 exists $f" || echo "K11 MISSING $f"; done
echo "K12 archive-427 $(cmp -s "$LOOP/tasks/round-427.md" "$B/current-task-before-428.md" && echo identical || echo differs)"
python3 -I "$LOOP/tools/find-ids.py" "$LOOP" SYS-2 A-R107-SWEEP-HELD-ENTER-TOOLBAR TL-R425-09-HM5-GESTURE-ROW A-R427-REVIEW-L3-HM5B-LOOSE INFO-C427-AUTH-TRANSIENT-FIRST-READ C-R301-01 | sed 's/^/K13 /'
echo "K14 backlog-v $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print(b['version'], b['decisions_log_b'][-1]['id'])")"
echo "K15 browser-compare $(tail -1 "$B/probe/compare.txt") head-defect-cells $(python3 -I -c "
import json,glob
print(sorted(json.load(open(f))['row'] for f in glob.glob('$B/probe/head/*.json') if json.load(open(f)).get('heldChanged')))")"
echo "K16 mutants $(wc -l < "$B/mutants/summary.txt") head-src $(grep -c '^MU-HEAD-SRC: red HN1,HQ1,HQ2,HX1,HX2 (5 failed | 42 passed (47))' "$B/mutants/summary.txt") single-row $(grep -cE '^MU-[A-Z-]+: red H[QNX][0-9] \(1 failed \| 46 passed \(47\)\)' "$B/mutants/summary.txt") footer $(grep -c '^MU-SHEET-FOOTER: red HQ1,HQ2 (2 failed' "$B/mutants/summary.txt") done $(grep -c '^MU-EXPORT-DONE: red HX2,HX3 (2 failed' "$B/mutants/summary.txt")"
echo "K17 rows HQ $(grep -cE "^    it\('HQ[0-9] " $T/shortcut-sheet-ui.test.tsx) HN $(grep -cE "^    it\('HN[0-9]: " $T/studio-narrow-gate-ui.test.tsx) HX $(grep -cE "^    it\('HX[0-9] " $T/export-cancel-ui.test.tsx) row-files $(grep -rlE "it\('(HQ|HN|HX)[0-9]" app perf --include=*.test.ts --include=*.test.tsx | wc -l)"
echo "K18 covering $(grep -c '^app/' "$B/covering-files.txt") a2 $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-a2.log" | grep -E '^ +Tests ' | tr -s ' ')"
echo "K19 l58 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K20 sheet-focus-return opener $(grep -c 'opener.focus();' $SH) fallback $(grep -c 'fallbackFocusRef.current?.focus();' $SH) fallback-is-footer $(grep -c 'fallbackFocusRef={shortcutButtonRef}' $WS) export-close-focus $(grep -c 'opener.focus();' $XD)"
echo "K21 c427 $(python3 -I -c "import json;c=json.load(open('$LOOP/c-round-427.json'));print(c['taskStatus'],len(c['bugs']),c['browserVerified'],c['realVerified'])")"
echo "K22 stem-lanes transcripts $(test -f "$LOOP/reference/youtube/STEM-LANES-transcripts.md" && echo present || echo absent) agree-answer $(grep -ciE "saba.s answer|approved by saba|^decision:" "$LOOP/user-review/AGREE-STEM-LANES.md")"
echo "K23 lessons lines $(wc -l < "$LOOP/lessons.md")"
echo "K24 onkeydown-near-targets footer $(sed -n '/onClick={() => setIsShortcutSheetOpen(true)}/,/<\/button>/p' $WS | grep -c onKeyDown) sheet-close $(sed -n '/onClick={onClose}/,/<\/button>/p' $SH | grep -c onKeyDown) send $(sed -n '/onClick={sendStudioLink}/,/<\/button>/p' $NS | grep -c onKeyDown) cancel $(sed -n '/onClick={cancelExport}/,/<\/button>/p' $XD | grep -c onKeyDown) done $(sed -n '/onClick={handleClose}/,/<\/button>/p' $XD | grep -c onKeyDown) primary $(sed -n '/includeWav: true/,/<\/button>/p' $XD | grep -c onKeyDown) spreads-in-target-buttons $( (sed -n '/onClick={() => setIsShortcutSheetOpen(true)}/,/<\/button>/p' $WS; sed -n '/onClick={onClose}/,/<\/button>/p' $SH; sed -n '/onClick={sendStudioLink}/,/<\/button>/p' $NS; sed -n '/onClick={cancelExport}/,/<\/button>/p' $XD; sed -n '/onClick={handleClose}/,/<\/button>/p' $XD; sed -n '/includeWav: true/,/<\/button>/p' $XD) | grep -c '{\.\.\.')"
echo "K25 precheck-full $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-full.log" | grep -E '^ +(Test Files|Tests) ' | tr -s ' ' | tr '\n' ' ')$(tail -1 "$B/precheck-full.log")"
echo "K26 modal-close-default $(grep -c 'showCloseButton = true' app/components/ui/Modal.tsx) export-passes-showclose $(grep -c 'showCloseButton' $XD) sheet-hides-close $(grep -c 'showCloseButton={false}' $SH) export-opener-guard $(sed -n '/onClick={onOpenExport}/,/<\/button>/p' $A/ArrangementTransport.tsx | grep -c 'onKeyDown={preventRepeatedEnterKeyDown}')"
echo "K27 cookie-ga4-gate $(grep -c 'if (!GA4_MEASUREMENT_ID) return;' app/components/common/CookieConsent.tsx) root-renders-on-studio $(grep -cE '^ +<(AuthModal|ToastContainer|CookieConsent) />' app/root.tsx)"
echo "K28 signals $(python3 -I -c "import json;b=json.load(open(\"$LOOP/backlog.json\"));print([s[\"id\"] for s in b[\"architecture_signals\"] if s.get(\"id\") in (\"SIG-R426-STUDIO-BUTTON-REPEAT-DEFAULT\",\"SIG-R427-HELD-ENTER-TEST-HELPER\")])")"
echo "K29 menus-ignore-repeat grid $(grep -c "if (!event.repeat) {" $A/ArrangementGridMenu.tsx) marker $(grep -c "if (!event.repeat) {" $A/ArrangementMarkerMenu.tsx)"
echo "K30 send-uses share $(grep -c 'navigator.share' $NS) clipboard $(grep -c 'navigator.clipboard' $NS)"
echo "K31 l50 $(grep -E '^(app|sketch)' "$B/data/l50-focus-origins.txt" | tr '\n' ' ')"
echo "K32 gate427-times $(sed 's/\x1b\[[0-9;]*m//g' "$LOOP/gates/round-427/verify.log" | grep -E 'shortcut-sheet-ui.test.tsx|studio-narrow-gate-ui.test.tsx|export-cancel-ui.test.tsx|✓ (SS2|NG5|CP12c|TC10)[: ]' | grep -oE '(shortcut-sheet-ui|studio-narrow-gate-ui|export-cancel-ui)\.test\.tsx \([0-9]+ tests\) [0-9]+ms|(SS2|NG5|CP12c|TC10)[: ].* [0-9]+ms$' | sed -E 's/^((SS2|NG5|CP12c|TC10))[: ].* ([0-9]+ms)$/\1 \3/' | tr '\n' ';')"
echo "K33 compare-head-as-sketch $(tail -1 "$B/probe/compare-head-as-sketch.txt") c-r301-confirmed $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print([('confirmedBy' in f and 'GMENU' in f['confirmedBy']) for f in b['deferred_low_polish'] if f.get('id')=='C-R301-01'])")"
echo "K34 auth-head $(python3 -I -c "import json;o=json.load(open('$B/probe/auth-head/g428-auth.json'));print('pass',o['pass'],'samples',[(k,[(s['at'],s['signIn'],s['workspace'],s['audioSrc']) for s in v['samples']]) for k,v in o['vp'].items()],'api',{k:v['status'] for k,v in o['api'].items()})")"
