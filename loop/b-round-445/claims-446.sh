#!/usr/bin/env bash
# Round 446 claims (STORE-2b-1: LeadMagnet route exclusion). One line per claim.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-445
H=app/hooks/useLeadMagnet.ts
T=app/lib/__tests__/store-lead-magnet-routes.test.tsx
Q=docs/implementation/2026/quarter-IV
strip() { sed 's/\x1b\[[0-9;]*m//g' "$1"; }
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD | cut -c1-7) gate445 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-445.json'));print(a['status'],a['commit'][:7])")"
echo "K2 status total $(git status --short --untracked-files=all | wc -l) outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-446.txt" | wc -l)"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; K3RC=$?; echo "K3 protected rc $K3RC root-tsx-changed $(git diff --name-only HEAD -- app/root.tsx | wc -l) authmodal-modal-changed $(git diff --name-only HEAD -- app/components/auth/AuthModal.tsx app/components/ui/Modal.tsx | wc -l)"
eq=0; while read p; do cmp -s "$p" "$B/sketch-files/$p" && eq=$((eq+1)); done < "$B/sketch-paths.txt"; echo "K4 tree-equals-sketch $eq/$(wc -l < "$B/sketch-paths.txt")"
if git apply --check -p1 "$B/sketch-446.patch.txt" 2>/dev/null; then echo "K5 sketch-applies yes"; else echo "K5 sketch-applies no"; fi
echo "K6 sketch-sha $(sha256sum "$B/sketch-446.patch.txt" | cut -c1-16) expected $(cut -c1-16 "$B/sketch-446.sha256")"
echo "K7 hook deps-isLoggedIn-only $(grep -c '}, \[isLoggedIn\]);' $H) deps-with-route $(grep -c '}, \[isLoggedIn, isExcludedRoute\]);' $H) useLocation $(grep -c 'useLocation' $H) excluded-fn $(grep -c 'export function isLeadMagnetExcludedPath' $H)"
echo "K8 hook timer $(grep -c 'const SHOW_DELAY_MS = 8000;' $H) scroll $(grep -c 'const SCROLL_THRESHOLD = 40;' $H) maxviews $(grep -c 'const MAX_VIEWS_PER_DAY = 10;' $H) mouseleave $(grep -c "addEventListener('mouseleave'" $H)"
echo "K9 scrolllock-callers $(grep -rn "useScrollLock(" app --include=*.tsx | grep -v __tests__ | sed "s/:.*useScrollLock(/ /" | tr "\n" ";") popup-mount-root $(grep -c '<LeadMagnetPopup isLoggedIn={isAuthenticated} />' app/root.tsx) studio-guard $(grep -c "location.pathname.startsWith('/studio')" app/root.tsx) popup-uses-hook $(grep -c 'useLeadMagnet(isLoggedIn)' app/components/marketing/LeadMagnetPopup.tsx)"
echo "K10 routes $(ls app/routes | grep -cE '^(products\.\$handle|cart|checkout\.success|checkout\.cancel)\.tsx$')"
echo "K11 sweep-callers $(grep -rlE 'useLeadMagnet|isLeadMagnetExcludedPath' app perf e2e --include=*.ts --include=*.tsx 2>/dev/null | sort | tr '\n' ' ')"
echo "K12 rows LMR1 $(grep -c "'LMR1 " $T 2>/dev/null || echo 0) LMR2-12 $(for r in 2 3 4 5 6 7 8 9 10 11 12; do grep -c "'LMR$r " $T 2>/dev/null || echo 0; done | tr '\n' ',') SL $(grep -c "'SL[12] " $T 2>/dev/null || echo 0)"
echo "K13 mutants $(wc -l < "$B/mutants/results.jsonl") red $(python3 -I -c "import json;print(sum(1 for l in open('$B/mutants/results.jsonl') if json.loads(l)['rc']!=0 and json.loads(l)['failedRows']))")"
echo "K14 full-on-sketch $(strip "$B/logs/precheck-full.log" | grep -oE 'Test Files +[0-9]+ passed' | grep -oE '[0-9]+') files $(strip "$B/logs/precheck-full.log" | grep -oE 'Tests +[0-9]+ passed' | grep -oE '[0-9]+') tests"
echo "K15 typecheck-errors $(grep -c 'error TS' "$B/logs/typecheck-sketch.log") lint '$(grep -oE 'Found [0-9]+ warnings' "$B/logs/lint-sketch.log")'"
echo "K16 probe head $(python3 -I "$B/probe/summarize.py" "$B/probe/head-1440.json" "$B/probe/head-1280-375.json") sketch $(python3 -I "$B/probe/summarize.py" "$B/probe/sketch-all.json")"
echo "K17 doc291 $(ls $Q/291-*.md 2>/dev/null | wc -l) l4 '$(sed -n 4p $Q/291-*.md 2>/dev/null)'"
echo "K18 archive445 $(test -f "$LOOP/tasks/round-445.md" && cmp -s "$LOOP/tasks/round-445.md" "$B/task-445-before.md" && echo present-equal || echo bad)"
echo "K19 c445 $(python3 -I -c "import json;c=json.load(open('$LOOP/c-round-445.json'));print(c['taskStatus'],c['browserVerified'],len(c['bugs']))")"
n=0; for f in sketch-446.patch.txt sketch-446.sha256 sketch-paths.txt grants-446.txt sketch-review.md mutants/run-mutants.py mutants/results.jsonl probe/lm-routes.cjs probe/summarize.py probe/head-1440.json probe/head-1280-375.json probe/sketch-all.json probe/sketch-server.sh logs/precheck-full.log logs/typecheck-sketch.log logs/lint-sketch.log logs/biome-scoped-sketch.log l57-check-c445.txt sketch-446-v1.patch.txt probe/sketch-header.json logs/l50-focus-origins.txt logs/lmr13-on-head.txt logs/head-server-none-mode.txt; do test -f "$B/$f" && n=$((n+1)); done; echo "K20 artifacts $n/23"
echo "K21 l58 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md 2>&1 | tail -1)"
echo "K22 in-progress-docs $(grep -rln 'In Progress (stage' docs/implementation | wc -l) pending $(grep -rn 'C round [0-9]* pending' docs/implementation | wc -l)"
echo "K23 scrolllock-restore-calls $(grep -c 'window.scrollTo(0, parseInt' app/hooks/useScrollLock.ts) restore-guarded $(grep -c 'if (scrollY && restoreScrollOnUnlockRef.current) {' app/hooks/useScrollLock.ts)"
echo "K24 pd-review $(test -f /home/runner/czaba-project/docs/technical/studio-real-workspace/product-design-review-2026-10-31.md && grep -c 'F4 — Medium' /home/runner/czaba-project/docs/technical/studio-real-workspace/product-design-review-2026-10-31.md) q3-default $(grep -c 'LeadMagnet (keep-list)' /home/runner/czaba-project/docs/technical/studio-real-workspace/product-design-review-2026-10-31.md)"
echo "K25 lmr13 $(grep -c "'LMR13 " $T 2>/dev/null || echo 0) lmr13-on-head $(grep -c 'LMR13-ON-HEAD-HOOK PASS' "$B/logs/lmr13-on-head.txt") back $(python3 -I -c "
import json
r=json.load(open('$B/probe/sketch-all.json'))+json.load(open('$B/probe/sketch-header.json'))
o=[]
for x in r:
    c=x['case'].split()[0]
    if c=='BACK': o.append(f\"BACK@{x['W']}:y{x['scrollYAfterBack']},{x['active']},vc{x['viewCount']},{x['reopenStep']},dismissedFalse={'\\\"dismissed\\\":false' in (x['lm'] or '')}\")
    if c=='BACKCTL': o.append(f\"CTL@{x['W']}:y{x['scrollYAfterBack']},{x['active']}\")
    if c in ('BACKH','BACKHCTL'): o.append(f\"{c}@{x['W']}:{x['active']['tag'] if x['active'] else None}:{x['active']['name'] if x['active'] else None}\")
print(' '.join(o))")"
echo "K26 l50 $(tail -1 "$B/logs/l50-focus-origins.txt")"
echo "K27 head-server-none $(tr '\n' ' ' < "$B/logs/head-server-none-mode.txt")"
