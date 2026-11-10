#!/usr/bin/env bash
# Round 429 claims (SYS-2 stage 5 = 2b-ii-b). ROOT/LOOP may be overridden. One line per claim. Id lookups via tools/find-ids.py.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-428
A=app/components/arrangement
MR=$A/ArrangementMarkerRow.tsx; LM=$A/ArrangementLibraryMenu.tsx
T=app/lib/arrangement/__tests__
Q=docs/implementation/2026/quarter-IV
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD) gate428 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-428.json'));print(a['status'],a['commit'][:7])")"
echo "K2 status $(git status --short --untracked-files=all | awk '{print $1}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')total $(git status --short --untracked-files=all | wc -l)"
echo "K2b status-outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-429.txt" | wc -l)"
sha256sum --quiet -c "$B/r429-frozen-sha256.txt" >/dev/null 2>&1; echo "K3 frozen $(wc -l < "$B/r429-frozen-sha256.txt") rc $?"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K4 protected rc $? granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-429.txt")"
if git apply --check "$B/sketch-429.patch.txt" 2>/dev/null; then echo "K5 sketch-applies yes"; else echo "K5 sketch-applies no"; fi
echo "K6 last-doc $(ls $Q/ | sort | tail -1) | doc274 $(sed -n 4p $Q/274-sys-held-enter-mixer.md) | doc275 $(sed -n 4p $Q/275-sys-held-enter-panels.md) | doc276 $(sed -n 4p $Q/276-sys-held-enter-dialogs.md) | doc277 $(sed -n 4p $Q/277-sys-held-enter-closing.md 2>/dev/null || echo absent) | doc272 $(sed -n 4p $Q/272-*.md)"
echo "K6b in-progress-stage-docs $(grep -rln 'In Progress (stage' docs/implementation | xargs -r -n1 basename | sort | tr '\n' ' ')"
echo "K7 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])")"
echo "K8 inline-enter-repeat-literal $(grep -rn "event.key === 'Enter' && event.repeat" app perf --include=*.ts --include=*.tsx | grep -v __tests__ | awk -F: '{print $1}' | xargs -r -n1 basename | sort | uniq -c | tr -s ' ' | tr '\n' ' ')total $(grep -rn "event.key === 'Enter' && event.repeat" app perf --include=*.ts --include=*.tsx | grep -v __tests__ | wc -l)"
echo "K8b helper-uses MarkerRow $(grep -c 'preventRepeatedEnterKeyDown' $MR) LibraryMenu $(grep -c 'preventRepeatedEnterKeyDown' $LM) app-total $(grep -rn 'preventRepeatedEnterKeyDown' app --include=*.tsx --include=*.ts | grep -v __tests__ | wc -l)"
echo "K9 delegated-menu-form $(for f in ArrangementGridMenu ArrangementMarkerMenu ArrangementDetailPanel ArrangementLibrary ArrangementGroupHeader; do printf '%s=%s ' $f "$(grep -c "if (!event.repeat) {" $A/$f.tsx)"; done)"
echo "K9c button-scan-arrangement $(python3 -I "$LOOP/b-round-425/button-guard-scan-enter.py" $A/*.tsx | awk -F'\t' '{print $2}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')unguarded $(python3 -I "$LOOP/b-round-425/button-guard-scan-enter.py" $A/*.tsx | grep -v ENTER-GUARD | awk -F'\t' '{split($1,a,":"); print a[1]":"$2}' | xargs -n1 basename | sort | uniq -c | tr -s ' ' | tr '\n' ' ')"
echo "K9d closure $(python3 -I "$LOOP/b-round-427/tools/import-closure.py" "$ROOT" app/routes/studio-lab.tsx | wc -l) non-arrangement-button-files $(python3 -I "$LOOP/b-round-427/tools/import-closure.py" "$ROOT" app/routes/studio-lab.tsx | grep -v '^app/components/arrangement/' | while read f; do n=$(grep -c '<button' "$f"); [ "$n" -gt 0 ] && printf '%s=%s ' "$(basename $f)" "$n"; done)ui-imports-in-studio $(grep -rhoE "import \{[^}]*\} from '~/components/ui'" $A app/routes/studio-lab.tsx | sort | uniq -c | tr -s ' ' | tr '\n' ' ')openers-in-closure $(python3 -I "$LOOP/b-round-427/tools/import-closure.py" "$ROOT" app/routes/studio-lab.tsx | grep -cE 'RequireAuth|layout/Header|PurchaseHeader|routes/cart|routes/account|AuthModal')"
echo "K10 sketch-sha $(sha256sum "$B/sketch-429.patch.txt" | cut -c1-16) recorded $(cut -c1-16 "$B/sketch-429.sha256") review-names $(grep -c "$(cat "$B/sketch-429.sha256")" "$B/sketch-review.md") diff-headers $(grep -c '^diff --git' "$B/sketch-429.patch.txt")"
for f in sketch-429.patch.txt sketch-429.sha256 sketch-review.md sketch-429-v1-4a52f823.patch.txt sketch-delta-4a52f823-to-final.patch.txt mutants/run.py mutants/summary.txt mutants/hk1-params.txt mutants-v1-4a52f823/summary.txt precheck-a2.log precheck-full.log precheck-typecheck.log precheck-lint.log precheck-biome5.log covering-files.txt grants-429.txt r429-frozen-sha256.txt probe/held-enter-s5.mjs probe/compare.py probe/compare.txt probe/g429-auth.cjs probe/auth-head/g428-auth.json data/l50-focus-origins.txt data/saba-b-12-native-controls-grep.txt tools/make-sketch-src.py tools/make-sketch-tests.py update-backlog.py update-backlog-2.py mutants/hk1-params.sh data/l31-timing.txt data/studio-lab-import-closure.txt; do test -f "$B/$f" && printf 'ok ' || printf 'MISSING:%s ' "$f"; done | sed 's/^/K11 artifacts /'; echo
echo "K12 archive-428 $(cmp -s "$LOOP/tasks/round-428.md" "$B/current-task-before-429.md" && echo identical || echo differs)"
python3 -I "$LOOP/tools/find-ids.py" "$LOOP" SYS-2 A-R107-SWEEP-HELD-ENTER-TOOLBAR SABA-B-12 A-R428-REVIEW-L1-HQ1-VALUE-ASSERT INFO-C428-SPACE-ON-FOCUSED-BUTTON INFO-C428-AUTH-SECOND-VITE | sed 's/^/K13 /' | cut -c1-160
echo "K14 backlog-v $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print(b['version'], b['decisions_log_b'][-1]['id'])")"
echo "K15 browser-compare $(tail -1 "$B/probe/compare.txt") head-defect-cells $(python3 -I -c "
import json,glob
print(sorted(json.load(open(f))['row'] for f in glob.glob('$B/probe/head/*.json') if json.load(open(f)).get('heldChanged')))")"
echo "K16 mutants lines $(wc -l < "$B/mutants/summary.txt") head-src $(grep -c '^MU-HEAD-SRC: red HS1 (1 failed | 59 passed (60))' "$B/mutants/summary.txt") one-red $(grep -cE '^MU-[A-Z-]+: red H[KS][0-9] \(1 failed \| 59 passed \(60\)\)$' "$B/mutants/summary.txt")"
echo "K17 rows HK-markers $(grep -oE "'HK[0-9]" $T/markers-ui.test.tsx 2>/dev/null | sort | uniq -c | tr -s ' ' | tr '\n' ' ')HK-link $(grep -oE "'HK[0-9]" $T/studio-link-view-in-store-ui.test.tsx 2>/dev/null | sort | uniq -c | tr -s ' ' | tr '\n' ' ')HS $(grep -oE "'HS[0-9]" $T/held-enter-source-scan.test.ts 2>/dev/null | sort | uniq -c | tr -s ' ' | tr '\n' ' ')"
echo "K18 covering $(wc -l < "$B/covering-files.txt") a2 $(grep -E '^ +Tests ' "$B/precheck-a2.log" | tr -s ' ')"
echo "K19 l58 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K20 authmodal-openers $(grep -rn "openModal(" app --include=*.tsx --include=*.ts | grep -v __tests__ | grep -v 'components/auth/AuthModal.tsx' | awk -F: '{print $1}' | sort -u | tr '\n' ' ')studio-lab-requireauth $(grep -c RequireAuth app/routes/studio-lab.tsx)"
echo "K20b header-hidden-on-studio $(grep -c "const isStudioPage = location.pathname.startsWith('/studio');" app/root.tsx) $(grep -c '{!isStudioPage && <Header cartCount={cartCount} />}' app/root.tsx)"
echo "K21 toast-callers $(grep -rln "onToast?.(\|showToast(" app --include=*.tsx --include=*.ts | grep -v __tests__ | sort | tr '\n' ' ')arrangement-toast $(grep -rln "useToast\|showToast" $A | wc -l)"
echo "K22 c428 $(python3 -I -c "import json;c=json.load(open('$LOOP/c-round-428.json'));print(c['taskStatus'],len(c['bugs']),c['browserVerified'],c['realVerified'])")"
echo "K23 stem-lanes transcripts $(test -f "$LOOP/reference/youtube/STEM-LANES-transcripts.md" && echo present || echo absent) agree-answer $(grep -ciE "saba.s answer|approved by saba|^decision:" "$LOOP/user-review/AGREE-STEM-LANES.md")"
echo "K24 lessons lines $(wc -l < "$LOOP/lessons.md")"
echo "K25 precheck-full $(grep -E '^ +(Test Files|Tests) ' "$B/precheck-full.log" | tr -s ' ' | tr '\n' ' ')"
echo "K26 gate428-times $(sed 's/\x1b\[[0-9;]*m//g' "$LOOP/gates/round-428/verify.log" | grep -E '(markers-ui|studio-link-view-in-store-ui)\.test\.tsx \(' | grep -oE '[a-z-]+\.test\.tsx \([0-9]+ tests\) [0-9]+ms' | tr '\n' ' ')describe-timeouts markers-ui $(grep -c "{ timeout: 15000 }" $T/markers-ui.test.tsx) studio-link $(grep -c "{ timeout: 15_000 }" $T/studio-link-view-in-store-ui.test.tsx)"
echo "K27 l50 $(grep -E '^(app|sketch-source-lines)' "$B/data/l50-focus-origins.txt" | tr '\n' ' ')"
echo "K28 auth-head $(python3 -I -c "import json;o=json.load(open('$B/probe/auth-head/g428-auth.json'));print('pass',o['pass'],[(k,[(s['at'],s['signIn'],s['workspace'],s['audioSrc']) for s in v['samples']]) for k,v in o['vp'].items()],{k:v['status'] for k,v in o['api'].items()})")"
echo "K29 mock-api $(test -f "$LOOP/mock-api/server.mjs" && echo present || echo absent)"
echo "K30 hk1-params $(bash "$B/mutants/hk1-params.sh" "$B/mutants" | tr '\n' ' ')"
echo "K31 l31 $(tail -1 "$B/data/l31-timing.txt") $(sed -n 2p "$B/data/l31-timing.txt")"
echo "K32 gate428-review $(grep -cE '^[0-9]+\. \*\*Low' "$LOOP/gates/round-428/review.md") lows $(grep -ciE '\*\*(medium|high|critical)' "$LOOP/gates/round-428/review.md") medium-plus"
