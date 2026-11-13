#!/usr/bin/env bash
# Round 488 claims (B planning 2026-11-13, fix-up of round 487). ROOT=<store copy> LOOP=<loop root> may be overridden.
S=${ROOT:-/home/runner/czaba-project/store}
LP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LP/b-round-487
F=app/routes/account.tsx
T=app/lib/__tests__/account-profile-name.test.tsx
D=docs/implementation/2026/quarter-IV/315-profile-name-keyboard.md
cd "$S" || exit 2
echo "K1 HEAD $(git rev-parse --short HEAD 2>/dev/null)"
echo "K2 status-lines $(git status --short --untracked-files=all | wc -l)"
git status --short --untracked-files=all | sed 's/^/K2   /'
echo "K3 frozen-manifest-except-account.tsx rc $(grep -v "  $F\$" $LP/b-round-486/r487-tree-sha256.txt | sha256sum -c --quiet >/dev/null 2>&1; echo $?)"
echo "K4 protected-rc $(sha256sum -c --quiet $LP/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K5 round-487 A tree (start of this round): $(sha256sum -c --quiet $B/a-tree-start.sha256 >/dev/null 2>&1 && echo equal || echo differs)"
sha256sum -c $B/a-tree-start.sha256 2>/dev/null | sed 's/^/K5   /'
echo "K6 guard name-editor-ref $(grep -c 'const nameEditorRef = useRef<HTMLDivElement>(null);' $F) guard-fn $(grep -c 'const isNameEditorFocusUnclaimed = () => {' $F) success-uses-guard $(grep -c 'restoreNameFocusRef.current = isNameEditorFocusUnclaimed();' $F) failure-uses-guard $(grep -c 'if (isNameEditorFocusUnclaimed()) {' $F) row-ref $(grep -c '<div ref={nameEditorRef} className="flex items-center gap-3">' $F) void-save $(grep -c 'void handleNameSave();' $F) modal-ref $(grep -c 'const passwordModalOpenRef = useRef(false);' $F) modal-guard $(grep -c 'if (passwordModalOpenRef.current) {' $F) open-handler $(grep -c 'onClick={openPasswordModal}' $F) close-handler $(grep -c 'onClose={closePasswordModal}' $F) direct-setter-calls $(grep -c 'setIsPasswordModalOpen(' $F)"
echo "K7 focus calls $(grep -c '\.focus(' $F) PN10-tests $(grep -cE "it\('PN10[b-z]? " $T) all-PN-tests $(grep -cE "it\('PN[0-9]+[a-z]? " $T)"
echo "K8 biome $F $T: $(npx biome check "$F" "$T" 2>&1 | grep -oE 'lint/[a-zA-Z0-9/]+' | sort | tr '\n' ' ')"
echo "K9 doc-315 exists $(test -f $D && echo 1 || echo 0) l4 [$(sed -n 4p $D 2>/dev/null)]"
for a in sketch-488.patch.txt sketch-488.sha256 sketch-488/$F sketch-488/$T sketch-488-covering.log sketch-488-biome.log sketch-tsc.log precheck-full-488.log mutants-488.py mutants/mutants-summary.txt sketch-review.md probe/inflight-488.mjs probe/inflight-488-v2.mjs probe/r487tree-inflight.json probe/sketch-inflight.json probe/r487tree-v2-inflight.json probe/sketch-v2-inflight.json probe/overlays-488.mjs probe/overlays-sketch.json sketch-488-v1.patch.txt sketch-488-v2.patch.txt sketch-488-v1/app/routes/account.tsx current-task-before-488.md a-tree-start.sha256; do echo "K10 artifact $a $(test -s $B/$a && echo exists || echo MISSING)"; done
echo "K11 sketch-sha $(sha256sum $B/sketch-488.patch.txt | cut -c1-64) pinned $(cut -c1-64 $B/sketch-488.sha256)"
echo "K12 sketch-files-equal-store $(cd $B/sketch-488 && for f in $(find . -type f | sort); do cmp -s "$f" "$S/$f" && echo "$f"; done | wc -l) of $(cd $B/sketch-488 && find . -type f | wc -l)"
echo "K13 archive-487 $(cmp -s $LP/tasks/round-487.md $B/current-task-before-488.md && echo equal || echo DIFF)"
echo "K14 $(cd $LP && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K15 regression-last $(python3 -c "import json;d=json.load(open('$LP/regression-last.json'));print(d['date'],d['round'])")"
echo "K16 gate-487 $(python3 -c "import json;d=json.load(open('$LP/gates/gate-round-487.json'));print(d['status'],d.get('reason'))")"
echo "K17 password link enabled during save (no disabled prop on it): $(grep -c 'Click to change password' $F)"
