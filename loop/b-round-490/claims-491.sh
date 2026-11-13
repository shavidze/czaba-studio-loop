#!/usr/bin/env bash
# Round 491 claims (B-R487-PROFILE-EDITOR-NARROW-OVERFLOW). Usage: bash claims-491.sh   (ROOT=<store tree> LOOP=<loop folder> may be overridden)
# Planning output on the clean store tree (HEAD 53ff249): claims-491-planning-output.txt; on B's sketch-applied scratch (/tmp/b491-scratch): claims-491-sketch-output.txt.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-490
A=app/routes/account.tsx
D15=docs/implementation/2026/quarter-IV/315-profile-name-keyboard.md
D17=docs/implementation/2026/quarter-IV/317-profile-editor-narrow-overflow.md
cd "$ROOT" || exit 1
echo "K1 gate490 $(python3 -I -c "import json;d=json.load(open('$LOOP/gates/gate-round-490.json'));print(d['status'],d['commit'][:7])")"
echo "K2 head $(git rev-parse --short=7 HEAD) dirty=$(git status --porcelain --untracked-files=all | wc -l) paths=$(git status --porcelain --untracked-files=all | awk '{print $1":"$2}' | sort | tr '\n' ' ')"
echo "K3 root-tsx-diff $(git diff --numstat 53ff249 -- app/root.tsx | wc -l) protected-diff $(git diff --numstat 53ff249 -- 'app/routes/studio.$productId.tsx' app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/contexts/AuthContext.tsx app/lib/auth.ts | wc -l) other-app-diff $(git diff --name-only 53ff249 -- app | grep -v "^$A$" | wc -l)"
echo "K4 inputs old=$(grep -c 'className="bg-transparent text-foreground text-lg border-b border-brand/50 py-1 w-40"' $A) new=$(grep -c 'className="min-w-0 bg-transparent text-foreground text-lg border-b border-brand/50 py-1 w-40"' $A) row=$(grep -c '<div ref={nameEditorRef} className="flex items-center gap-3">' $A) save-btn=$(grep -c 'className="p-1.5 text-brand hover:bg-brand/10 rounded transition-colors"' $A) cancel-btn=$(grep -c 'className="p-1.5 text-muted hover:bg-elevated rounded transition-colors"' $A) labels=$(grep -cE 'aria-label="(First name|Last name|Save name|Cancel name edit)"' $A)"
echo "K5 sketch-491-files $(cd "$B/sketch-491" && for f in $(find . -type f | sort); do cmp -s "$f" "$ROOT/$f" && echo -n "=" || echo -n "x"; done) patch=$(sha256sum "$B/sketch-491.patch.txt" | cut -c1-16) recorded=$(cut -c1-16 "$B/sketch-491.sha256") v1=$(sha256sum "$B/sketch-491-v1.patch.txt" | cut -c1-16)"
echo "K6 SWEEP class-pins app/**/__tests__ perf e2e: $(grep -rlnE 'border-brand/50 py-1|min-w-0 bg-transparent|py-1 w-40' app perf e2e --include='*.test.*' --include='*.spec.*' 2>/dev/null | wc -l) ; account.tsx readers: $(grep -rlE "account\.tsx|routes/account['\"]" app perf e2e --include='*.test.*' --include='*.spec.*' 2>/dev/null | sort | tr '\n' ' ')"
echo "K7 covering $(sed 's/\x1b\[[0-9;]*m//g' "$B/sketch-491-covering.log" | grep -E '^\s+(Test Files|Tests) ' | tr -s ' ' | tr '\n' ' ') $(grep -o 'rc=[0-9]*' "$B/sketch-491-covering.log")"
echo "K8 full-suite $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-full-491.log" | grep -E '^\s+(Test Files|Tests) ' | tr -s ' ' | tr '\n' ' ') $(grep -o '^rc [0-9]*' "$B/precheck-full-491.log")"
echo "K9 typecheck-sketch $(grep -c 'error TS' "$B/sketch-491-typecheck.log") biome $(npx biome check $A 2>&1 | grep -oE 'Found [0-9]+ (warning|error)s?' | tr '\n' ' ')"
echo "K10 docs d317-l4=$(sed -n 4p $D17 2>/dev/null) d317-headings=$(grep -c '^## ' $D17 2>/dev/null) d315-todo-old=$(grep -c 'დაგეგმილია round 489-ში' $D15) d315-fixed=$(grep -c 'გამოსწორდა round 491-ში (doc 317)' $D15) pending=$(grep -rl 'C round [0-9]* pending' docs/implementation | wc -l)"
echo "K11 probe-head $(python3 -I -c "
import json;d=json.load(open('$B/probe/headprod-narrow.json'))['rows']
print(' '.join(v+':'+'/'.join(b['hit'] for b in d[v]['editing']['buttons'])+':puts'+str(d[v]['mouseSave']['puts'])+(':tap'+str(d[v]['tapSave']['puts']) if 'tapSave' in d[v] else '') for v in d))")"
echo "K12 probe-sketch $(python3 -I -c "
import json;d=json.load(open('$B/probe/sketch-narrow.json'))['rows']
print(' '.join(v+':'+'/'.join(b['hit'] for b in d[v]['editing']['buttons'])+':puts'+str(d[v]['mouseSave']['puts'])+(':tap'+str(d[v]['tapSave']['puts']) if 'tapSave' in d[v] else '')+':inputsW'+'/'.join(str(i['box'][2]) for i in d[v]['editing']['inputs']) for v in d))") desk-eq=$(tr '\n' ' ' < "$B/probe/desk-eq.txt")"
echo "K13 mutants $(tr '\n' ';' < "$B/mutants/mutants-summary.txt" | sed 's/ Save name:[^;]*//g')"
echo "K14 l58 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md 2>&1 | tail -1)"
echo "K15 cited $(for f in b-round-490/sketch-491.patch.txt b-round-490/sketch-491.sha256 b-round-490/sketch-491-v1.patch.txt b-round-490/sketch-491-v1-to-v2.diff.txt b-round-490/sketch-review.md b-round-490/sketch-491-covering.log b-round-490/precheck-full-491.log b-round-490/sketch-491-typecheck.log b-round-490/sketch-491-biome.log b-round-490/probe/narrow-491.mjs b-round-490/probe/mut-491.mjs b-round-490/probe/serve-prod.sh b-round-490/probe/desk-eq.py b-round-490/probe/summ.py b-round-490/probe/headprod-narrow.json b-round-490/probe/sketch-narrow.json b-round-490/probe/head-narrow.json b-round-490/probe/desk-eq.txt b-round-490/probe/mutants-variant.json b-round-490/mutants/mutants-summary.txt b-round-490/checkpoint-request-entrance.md tasks/round-490.md b-round-490/current-task-before-491.md b-round-490/claims-491-planning-output.txt b-round-490/claims-491-sketch-output.txt b-round-490/probe/shots/headprod-editing-1440x900.png b-round-490/probe/shots/headprod-editing-1280x720.png b-round-490/probe/c6-check.py b-round-490/probe/c6-sketch.txt b-round-490/probe/c6-head.txt b-round-490/probe/mutants-variant.json b-round-490/k6-scanner-mutant.txt b-round-490/probe/env-downloads-401.txt; do test -f "$LOOP/$f" && echo -n 1 || echo -n "0($f)"; done)"
echo "K16 ids $(python3 -I "$LOOP/tools/find-ids.py" "$LOOP" B-R487-PROFILE-EDITOR-NARROW-OVERFLOW B-R488-PASSWORD-MODAL-DIALOG B-R491-NARROW-EDITOR-E2E-GUARD A-R490-REVIEW-NOCTRL-NEG-WHEEL | awk '{print $1":"($2=="NOT-FOUND"?"NOT-FOUND":"found")}' | tr '\n' ' ') tlm=$(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print(sum(1 for r in b['tech_lead_manual_checks'] if r.get('id')=='TLM-R491-PHONE-NAME-EDITOR'))")"
echo "K17 lessons lines=$(wc -l < "$LOOP/lessons.md")"
