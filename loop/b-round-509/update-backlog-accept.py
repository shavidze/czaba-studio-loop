import json, sys
P = sys.argv[1]
b = json.load(open(P))
assert b['version'] == 513, b['version']
BY = '2026-11-14 B round 509 -> 510 planning'
def find(lst, i):
    for x in lst:
        if isinstance(x, dict) and x.get('id') == i: return x
    raise KeyError(i)
def pre(x, s):
    x['status'] = s + ' | ' + str(x.get('status', ''))
of = b['open_findings']
s = find(of, 'B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD')
pre(s, 'closed for the cloud-verifiable path (D-29z1842): C round 509 PASS (browserVerified/realVerified true, 0 bugs; C1-C5, C8, C10-C12, C14 real browser/unit; C6, C7, C13 STUBBED per L36), published f5d1b9e; the real $0 order stays open as FREE-CHECKOUT-REAL-BACKEND (C9 BLOCKED, backend unavailable in cloud)')
pre(find(of, 'DPG-BUTTON-CLEANUP-2-NONBRAND'), 'in_progress (D-29z1842): ProductSidebar l.75 migrated and verified (C round 509 C1/C8: nonbrand scan 53, 0 in ProductSidebar; published f5d1b9e); N2-N9 and the StemsPlayerModal pair remain')
fc = find(of, 'FREE-CHECKOUT-REAL-BACKEND')
fc['confirmedBy'] = fc.get('confirmedBy', []) + ['gates/round-509/review.md finding 1 (Low, product risk): a $0 Stripe session may be rejected; test one real $0 order on staging before release, else hide the button behind a flag (D-29z1843)', 'A round 509 code-reviewer Medium = pre-ruled #4 (a-round-509.md deviation 4)']
am = find(of, 'B-R509-AUTHMODAL-NOT-A-DIALOG')
am['confirmedBy'] = am.get('confirmedBy', []) + ['c-round-509.md C2: role=dialog 0 after anonymous Get it free (pre-ruled #5 reproduced, D-29z1843)']
dl = b['deferred_low_polish']
dl += [
 {"id": "GATE509-L2-GETFREE-NO-ARIA-BUSY", "severity": "low", "origin": "gate reviewer", "status": "deferred_low_polish (D-29z1843): same as header Buy Now at HEAD, not a regression; fix with the header in one pass", "title": "Sidebar 'Get it free' (and header Buy Now) show 'Processing...' only visually: no aria-busy or live region", "evidence": "gates/round-509/review.md finding 2", "repro": "signed-in stub (b-round-503/probe/journey-504.mjs), hold checkout; read aria-busy on the button", "added": BY},
 {"id": "GATE509-L3-GETFREE-RENDER-IDENTITY", "severity": "low", "origin": "gate reviewer", "status": "deferred_low_polish (D-29z1843): no cost today (ProductSidebar not memoised); act only if the sidebar is memoised", "title": "ProductDetailPage builds a new getFree object every render and runBuyNow is not useCallback", "evidence": "gates/round-509/review.md finding 3", "repro": "read app/components/product/ProductDetailPage.tsx getFree, app/hooks/useBuyNowAction.ts runBuyNow", "added": BY},
 {"id": "GATE509-I4-BUYNOW-BFCACHE-STUCK", "severity": "low", "origin": "gate reviewer", "status": "deferred_low_polish (D-29z1843): pre-existing on the header; now on two buttons; browser check with the signed-in stub (pageshow persisted) at the next Store regression", "title": "After Back from Stripe, a bfcache-restored product page may keep isBuyingNow true (both Buy Now and Get it free stuck on Processing...)", "evidence": "gates/round-509/review.md finding 4", "repro": "signed-in stub, click Get it free, land on /__stripe-stub, press Back; read both buttons", "added": BY},
 {"id": "A-R509-CR-SIDEBAR-DISABLED-WHILE-PURCHASES-LOAD", "severity": "low", "origin": "A (code-reviewer)", "status": "deferred_low_polish (D-29z1843): intended by SF7 (header shows 'Checking purchase status...'); record only", "title": "Sidebar 'Get it free' is disabled while purchases load; header Buy Now is not", "evidence": "a-round-509.md code-reviewer pass 2", "repro": "stub usePurchases loading; read both buttons", "added": BY},
 {"id": "A-R509-CR-TEST-SELECTORS", "severity": "low", "origin": "A (code-reviewer)", "status": "deferred_low_polish (D-29z1843)", "title": "SF1/SF4 use querySelector('svg') and classList; SF4b 'enabled again' half only checks rendering (mock drives isBuyingNow)", "evidence": "a-round-509.md deviation 5", "repro": "read app/lib/__tests__/store-sidebar-free-r509.test.tsx SF1, SF4, SF4b", "added": BY},
]
b['architecture_signals'].append({"id": "SIG-R509-SELECTED-VERSION-OFFER", "added": BY, "note": "gate 509 + A round 509 code-reviewer (both keep now): useBuyNowAction owns the checkout trigger; ProductDetailPage computes showGetFree. If a third purchase surface or more selected-version rules appear (e.g. a $0 header label, SABA-Q-509-BUYNOW-FREE-LABEL), extract one useSelectedVersionOffer(product, selectedVersion) / resolvePurchaseOffer helper returning { price, isSellable, isOwned, showGetFree }; acceptance SF5/SF7/SF9 stay green, ProductSidebar props unchanged. Signal only, not scheduled."})
for rd in b['rounds']:
    if rd.get('round') == 509:
        rd['status'] = 'C PASS (browserVerified/realVerified true, 0 bugs; C9 BLOCKED backend); gate 509 published f5d1b9e (both remotes)'
b['decisions_log_b'] += [
 {"id": "D-29z1842", "date": "2026-11-14", "by": BY, "decision": "Round 509 accepted from C evidence only: c-round-509.json taskStatus PASS, browserVerified/realVerified true, passed C0-C8 and C10-C14, C9 BLOCKED (backend unavailable in cloud), 0 bugs; gate-round-509.json published f5d1b9e on both remotes = baseline for round 510. B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD closed for the cloud-verifiable path (signed-in, owned and journey rows were STUBBED); FREE-CHECKOUT-REAL-BACKEND stays open and blocks final COMPLETE. tasks/round-509.md archived (byte copy). Reference fix: D-29z1840 and SABA-Q-509-* cite user-review/questions-round-508.md; the file that exists is user-review/questions-round-509.md."},
 {"id": "D-29z1843", "date": "2026-11-14", "by": BY, "decision": "Round 509 follow-ups (L7): gate finding 1 -> confirmedBy on FREE-CHECKOUT-REAL-BACKEND (no new id); gate findings 2-4 and A's two code-reviewer Lows deferred (GATE509-L2/L3/I4, A-R509-CR-*); both Architecture notes -> one signal SIG-R509-SELECTED-VERSION-OFFER (not scheduled); C2 pre-ruled #5 -> confirmedBy on B-R509-AUTHMODAL-NOT-A-DIALOG. A's deviation 0 (reads after coding), deviation 1 (B grep expectation false at HEAD) and deviation 2 (two task rows contradict) are RETRO 510 inputs."},
]
for q in ('SABA-Q-509-FREE-DELIVERY', 'SABA-Q-509-BUYNOW-FREE-LABEL'):
    x = find(of, q)
    x['status'] = x['status'].replace('questions-round-508.md', 'questions-round-509.md')
b['version'] = 514
b['updated'] = BY
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print('ok v514')
