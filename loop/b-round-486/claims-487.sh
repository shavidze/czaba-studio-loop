#!/usr/bin/env bash
# Round 487 claims (B planning 2026-11-13). ROOT=<store copy> LOOP=<loop root> may be overridden.
S=${ROOT:-/home/runner/czaba-project/store}
LP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LP/b-round-486
F=app/routes/account.tsx
T=app/lib/__tests__/account-profile-name.test.tsx
H=app/components/arrangement/studio-repeat-safe.ts
cd "$S" || exit 2
echo "K1 HEAD $(git rev-parse --short HEAD 2>/dev/null)"
echo "K2 status-lines $(git status --short --untracked-files=all | wc -l)"
git status --short --untracked-files=all | sed 's/^/K2   /'
echo "K3 frozen-manifest-rc $(sha256sum -c --quiet $B/r487-tree-sha256.txt >/dev/null 2>&1; echo $?) entries $(wc -l < $B/r487-tree-sha256.txt)"
sha256sum -c --quiet $B/r487-tree-sha256.txt 2>/dev/null | sed 's/^/K3   /'
echo "K4 protected-rc $(sha256sum -c --quiet $LP/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K5 p-onClick-name $(grep -c '<p$' $F) handleNameClick-uses $(grep -c 'onClick={handleNameClick}' $F) click-to-add-name $(grep -c "'Click to add name'" $F) name-button-ref $(grep -c 'ref={nameButtonRef}' $F) labelledby $(grep -c 'aria-labelledby={`${nameLabelId} ${nameValueId}`}' $F) input-labels $(grep -cE 'aria-label="(First|Last) name"' $F) icon-labels $(grep -cE 'aria-label="(Save name|Cancel name edit)"' $F) escape-guard $(grep -c "e.key === 'Escape' && !nameSaveInFlightRef.current" $F) repeat-helper-uses $(grep -c 'preventRepeatedEnterKeyDown' $F)"
echo "K6 biome-lint-diagnostics $F: $(npx biome check "$F" 2>&1 | grep -oE 'lint/[a-zA-Z0-9/]+' | sort | tr '\n' ' ')"
echo "K7 app.css focus-rule $(grep -c 'outline-offset: var(--focus-offset, 2px);' app/styles/app.css) pointer-suppress $(grep -c 'html\[data-focus-source="pointer"\] :focus-visible {' app/styles/app.css) button-active-scale $(grep -c '^button:active:not(:disabled):not(\[aria-disabled="true"\]),' app/styles/app.css) button-cursor $(grep -c '^button { cursor:pointer }' app/styles/app.css)"
echo "K8 SWEEP account.tsx strings in test roots (app/**/__tests__, perf, e2e): $(grep -rlE "Click to add name|routes/account'|routes/account\.tsx|Full Name|handleNameClick|Save name|Cancel name edit" app perf e2e --include=*.ts --include=*.tsx --include=*.mjs 2>/dev/null | grep -E '__tests__|perf/|e2e/' | sort | tr '\n' ';')"
echo "K9 shared held-Enter helper $(grep -c 'export function preventRepeatedEnterKeyDown' $H) HS1-helper-path $(grep -c "HELPER_PATH = 'app/components/arrangement/studio-repeat-safe.ts'" app/lib/arrangement/__tests__/held-enter-source-scan.test.ts) store-route-importers $(grep -rl 'studio-repeat-safe' app/routes | wc -l)"
echo "K10 auth name fallback to email $(grep -c "\`\${profile.firstName || ''} \${profile.lastName || ''}\`.trim() || profile.email" app/lib/auth.ts) updateProfile-PUT $(grep -c "return this.request<UserProfile>('/api/auth/profile', {" app/services/api/client.ts) RequireAuth-uses-isInitializing $(grep -c 'if (isInitializing) {' app/components/auth/RequireAuth.tsx) ctx-updateProfile-sets-isLoading $(grep -c 'setIsLoading(true);' app/contexts/AuthContext.tsx)"
echo "K11 RequireAuth sign-in-required $(grep -c 'Sign in required' app/components/auth/RequireAuth.tsx)"
echo "K12 doc-315 $(ls docs/implementation/2026/quarter-IV | grep -c '^315-') test-file $(test -f $T && echo 1 || echo 0) last-doc $(ls docs/implementation/2026/quarter-IV | sort | tail -1 | cut -c1-3)"
for a in current-task-before-487.md sketch-487.patch.txt sketch-487.sha256 sketch-487/$F sketch-487/$T sketch-487-v1.patch.txt sketch-487-v2.patch.txt sketch-487-v3.patch.txt head-account.tsx sketch-covering.log sketch-tsc.log precheck-full.log precheck-full-v1.log mutants.py mutants/mutants-summary.txt sketch-review.md l50-hits.txt probe/profile-probe.mjs probe/noname-probe.mjs probe/extra-487.mjs probe/pxdiff.mjs probe/pxdiff-region.mjs probe/head-named.json probe/head-empty.json probe/noname-head.json probe/v1/sketch-named-envinvalid-1.err probe/headctl/head-named.json probe/headctl/head-empty.json probe/headctl/pxdiff-control.txt probe/v4/sketch-named.json probe/v4/sketch-empty.json probe/v4/noname-sketch.json probe/v4/pxdiff-region.txt probe/v4/pxdiff-full.txt probe/v4/sketch-named-ring-1440x900.png probe/v4/sketch-named-ring-1280x720.png probe/v4/sketch-named-ring-375x812.png probe/x/x-head.json probe/x/x-sketch.json probe/x/x-mutant-no-select-no-press.json probe/x/x-mutant-no-trigger-guard.json r487-tree-sha256.txt checkpoint.md claims-487-planning-output.txt claims-487-sketch-output.txt claims-487-sketch-delta.txt; do echo "K13 $a $(test -f $B/$a && echo exists || echo MISSING)"; done
for m in M0-HEAD-FILE M1-NO-RESTORE-ON-CANCEL M2-NO-RESTORE-ON-SAVE M3-NO-REPEAT-GUARD-INPUT M4-NO-INFLIGHT-GUARD M5-NO-FOCUS-ON-VALIDATION M6-NO-FOCUS-ON-API-FAIL M7-NO-LABELLEDBY M8-NO-INPUT-LABELS M9-NO-TRIGGER-REPEAT-GUARD M10-INFLIGHT-NOT-RESET M11-NO-TYPE-BUTTON M12-NO-SAVE-LABEL M13-ESCAPE-DURING-SAVE; do echo "K13m $m $(grep "^$m " $B/mutants/mutants-summary.txt | sed 's/^[^ ]* //')"; done
echo "K14 sketch-sha $(sha256sum $B/sketch-487.patch.txt | cut -c1-64) pinned $(cut -c1-64 $B/sketch-487.sha256)"
echo "K15 sketch-files-equal-store $(cd $B/sketch-487 && for f in $(find . -type f | sort); do cmp -s "$f" "$S/$f" && echo "$f"; done | wc -l) of $(cd $B/sketch-487 && find . -type f | wc -l)"
echo "K16 archive-486 $(cmp -s $LP/tasks/round-486.md $B/current-task-before-487.md && echo equal || echo DIFF)"
echo "K17 $(cd $LP && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K18 ids:"; (cd $LP && python3 -I tools/find-ids.py . B-R486-PROFILE-NAME-KEYBOARD B-R480-ORDER-CARD-KEYBOARD B-R486-FOCUS-OFFSET-GUARD A-R486-REVIEW-L1-OC-TEST-GAPS B-R487-PROFILE-EDITOR-NARROW-OVERFLOW SABA-B-17-ENTRANCE-3-4S) | sed 's/^/K18   /'
echo "K19 regression-last $(python3 -c "import json;d=json.load(open('$LP/regression-last.json'));print(d['date'],d['round'])")"
echo "K20 ports 5173:$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5173/studio-lab) 5199:$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5199/api/products 2>/dev/null)"
echo "K21 gate-486 $(python3 -c "import json;d=json.load(open('$LP/gates/gate-round-486.json'));print(d['status'],d['commit'][:7])")"
echo "K22 narrow editor width: input w-40 count $(grep -c 'py-1 w-40' $F) editor-row-classes $(grep -c '<div className="flex items-center gap-3">' $F)"
echo "K23 entrance timing ENTRANCE_MIN_TOTAL_MS $(grep -oE 'ENTRANCE_MIN_TOTAL_MS = [0-9]+' app/components/loading/EntranceCover.tsx) ENTRANCE_MAX_TOTAL_MS $(grep -oE 'ENTRANCE_MAX_TOTAL_MS = [0-9]+' app/components/loading/EntranceCover.tsx)"
for m in named empty; do for st in rest hover editing; do for vp in 1440x900 1280x720 375x812; do echo "K13p headctl/head-$m-$st-$vp.png $(test -f $B/probe/headctl/head-$m-$st-$vp.png && echo exists || echo MISSING) v4/sketch-$m-$st-$vp.png $(test -f $B/probe/v4/sketch-$m-$st-$vp.png && echo exists || echo MISSING)"; done; done; done
echo "K24 L50 hits $F: $(grep -cE 'onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)' $F) undo-redo $(grep -cE 'undo\(\)|redo\(\)' $F)"
