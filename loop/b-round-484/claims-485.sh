#!/usr/bin/env bash
# Round 485 claims (B planning 2026-11-13). ROOT=<store copy> LOOP=<loop root> may be overridden.
S=${ROOT:-/home/runner/czaba-project/store}
LP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LP/b-round-484
cd "$S" || exit 2
echo "K1 HEAD $(git rev-parse --short HEAD 2>/dev/null)"
echo "K2 status-lines $(git status --short --untracked-files=all | wc -l)"
git status --short --untracked-files=all | sed 's/^/K2   /'
echo "K3 frozen-manifest-rc $(sha256sum -c --quiet $B/r485-tree-sha256.txt >/dev/null 2>&1; echo $?) entries $(wc -l < $B/r485-tree-sha256.txt)"
echo "K4 protected-rc $(sha256sum -c --quiet $LP/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K5 store-routes-without-meta: $(for r in app/routes/*.tsx; do grep -qE 'export (const|function) meta' "$r" || basename "$r"; done | tr '\n' ' ')"
echo "K6 RouteTransition-importers(app,perf,e2e): $(grep -rlE "RouteTransition" app perf e2e --include=*.ts --include=*.tsx --include=*.mjs 2>/dev/null | sort | tr '\n' ' ')"
echo "K7 root-header-gate $(grep -c '{!isStudioPage && <Header' app/root.tsx) root-routetransition $(grep -c '<RouteTransition pathname={location.pathname} isStudioPage={isStudioPage}>' app/root.tsx)"
echo "K8 releaseLinkFocus-call-sites $(grep -rn 'onClick={releaseLinkFocus}' app --include=*.tsx | grep -v __tests__ | wc -l) files $(grep -rl 'onClick={releaseLinkFocus}' app --include=*.tsx | grep -v __tests__ | wc -l)"
echo "K9 SWEEP data-route-announcer(app,perf,e2e,non-sketch) $(grep -rn 'data-route-announcer\|route-announcer' app perf e2e 2>/dev/null | grep -v 'app/components/animations/RouteAnnouncer.tsx\|app/components/animations/RouteTransition.tsx\|app/components/animations/__tests__/route-transition.test.tsx' | wc -l)"
echo "K10 SWEEP aria-live-selectors(app/**/__tests__,perf,e2e) $(grep -rnE "\[aria-live|getAllByRole\('status'\)|aria-live=\"polite\"\]" app perf e2e 2>/dev/null | grep -E '__tests__|perf/|e2e/' | wc -l)"
echo "K11 PageTransition-inner-key $(grep -c 'key={location.pathname}' app/components/animations/PageTransition.tsx) entry-client-StrictMode $(grep -c StrictMode app/entry.client.tsx 2>/dev/null; true)"
echo "K12 link-focus-target-check-at-HEAD $(grep -c "getAttribute('target')" app/lib/link-focus.ts) finally $(grep -c 'finally' app/lib/link-focus.ts)"
echo "K12b meta-exports-on-6-routes $(for r in cart search account account_.login account.orders 'account.reset.$id.$token'; do grep -c 'export const meta' "app/routes/$r.tsx"; done | tr '\n' ' ')"
echo "K13 doc-313 $(ls docs/implementation/2026/quarter-IV | grep -c '^313-')"
for a in probe/extra/head-1440x900.json probe/extra/head-1280x720.json probe/extra/sketch-1440x900.json probe/extra/sketch-1280x720.json probe/extra-probe.mjs probe/repeat-probe.mjs probe/repeat-sketch.json probe/mount-signal-debug.txt speakers-head.txt sketch-covering.log sketch-tsc.log sketch-biome.log claims-485-sketch-output.txt claims-485-sketch-delta.txt sketch-485.patch.txt sketch-485.sha256 sketch-485-v1.patch.txt sketch-485-v1.sha256 mutants/mutants-summary.txt sketch-review.md precheck-full.log mutants.py mutants/red-rows.txt probe/announce-probe.mjs probe/head-1440.json probe/head-1280.json probe/sketch-final-1440.json probe/sketch-final-1280.json r485-tree-sha256.txt checkpoint.md; do echo "K14 $a $(test -f $B/$a && echo exists || echo MISSING)"; done
echo "K15 sketch-files-equal-store $(cd $B/sketch-485 && for f in $(find . -type f | sort); do cmp -s "$f" "$S/$f" && echo "$f"; done | wc -l) of $(cd $B/sketch-485 && find . -type f | wc -l)"
echo "K16 archive-484 $(cmp -s $LP/tasks/round-484.md $B/current-task-before-485.md && echo equal || echo DIFF)"
echo "K17 $(cd $LP && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K18 ids:"; (cd $LP && python3 -I tools/find-ids.py . GATE479-M1-ROUTE-ANNOUNCE GATE479-L2-TABINDEX-FINALLY A-R479-L1-TARGET-BLANK A-R479-L3-DEFAULTPREVENTED-UNTESTED A-R479-L2-SLOW-LOADER-FOCUS B-R479-LEADMAGNET-TIMER-CLIENT-NAV B-R480-ORDER-CARD-KEYBOARD) | sed 's/^/K18   /'
echo "K19 regression-last $(python3 -c "import json;d=json.load(open('$LP/regression-last.json'));print(d['date'],d['round'])")"
echo "K21 account-layout-h1-Account $(grep -c '<h1 className="text-3xl font-bold text-foreground mb-8">Account</h1>' app/routes/account.tsx) leadmagnet-role-alert $(grep -c 'role="alert"' app/components/marketing/LeadMagnetPopup.tsx) studio-exit-link-to-root $(grep -c 'to="/"' app/components/arrangement/StudioWorkspace.tsx)"
echo "K22 perf-load-components-mode $(python3 -c "import json;print([r['mode'] for r in json.load(open('perf/budgets.json')) if r.get('id')=='load.components'] if isinstance(json.load(open('perf/budgets.json')),list) else 'n/a')" 2>/dev/null) perf/e2e-RouteTransition-or-wrapper-refs $(grep -rlE 'page-transition-wrapper|RouteTransition|data-route-announcer' perf e2e 2>/dev/null | wc -l)"
echo "K20 ports 5173:$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5173/studio-lab) 5199:$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5199/api/products 2>/dev/null)"
