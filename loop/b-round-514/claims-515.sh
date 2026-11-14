#!/usr/bin/env bash
# Round 515 claims (B round 514 -> 515 planning). Run: bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-514/claims-515.sh
# Each block prints its tag and output. C compares with b-round-514/claims-515-planning-output.txt.
# Only loop files that survive the job hand-over are read (L56).
L=/home/runner/czaba-project/tmp/studio-real-loop
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
B=$L/b-round-514
C=app/components/common/CookieConsent.tsx
T=app/components/common/__tests__/CookieConsent.test.tsx
BASE=b7cb61fab51f38dcf0015e1a8ef3cda47a9542fd
cd "$S" || exit 1
echo "== K1 HEAD"; git rev-parse HEAD
echo "== K2 changed paths"; git status --short --untracked-files=all
echo "== K3 gate 514"; python3 -I -c "import json;d=json.load(open('$L/gates/gate-round-514.json'));print(d['status'],d['commit'])"
echo "== K4 c-round-514"; python3 -I -c "import json;d=json.load(open('$L/c-round-514.json'));print(d['taskStatus'],d['browserVerified'],d['realVerified'],[b['id']+':'+b['severity'] for b in d['bugs']],len(d['passed']))"
echo "== K5 focus sites at HEAD $BASE"; git show $BASE:$C | grep -nE 'function focusAfterCookieDismiss|const candidates|^    previous,|handleBannerFocus|onBlur|focusBeforeBannerRef.current =|preventScroll'
echo "== K6 fallback selectors at HEAD"; git show $BASE:$C | grep -nE "'header a\[href"
echo "== K7 gate 514 review findings"; grep -nE '^1\. \*\*Medium|^2\. \*\*Low|^3\. \*\*Low|^4\. \*\*Low' $L/gates/round-514/review.md | cut -c1-90
echo "== K8 browser r515 probe HEAD vs sketch (P1 email, P2 no-focus click, P3 hire-us textarea/select)"; python3 -I -c "
import json
for n in ('head','sketch'):
    d=json.load(open('$B/probe/'+n+'/r515.json')); print(n,'errors',len(d['errors']))
    for r in d['rows']:
        a=r.get('after') or {}; b=r.get('before') or {}
        print(n,r['row'],r['w'],a.get('tag'),(a.get('text') or '')[:12],'fv',a.get('focusVisible'),'sy',b.get('scrollY'),a.get('scrollY'),'gone',a.get('bannerGone'),'value',r.get('value'),r.get('error','')[:40])"
echo "== K9 round-514 probe on the final sketch equals round-514 sketch values"; python3 -I -c "
import json
def rows(f):
    t=open(f).read(); return json.loads(t[t.index('{\"layout\"'):t.rindex('}')+1])
a=rows('$L/b-round-513/probe/sketch.log'); b=rows('$B/probe/sketch-r514.log')
fa=[(r.get('w'),r.get('c'),r['e'],r['a']) for r in a['focus']]; fb=[(r.get('w'),r.get('c'),r['e'],r['a']) for r in b['focus']]
print('focus rows',len(fb),'identical',fa==fb,'layout identical',a['layout']==b['layout'],'BODY',sum('BODY' in r['a'] for r in b['focus']),'errors',b['errors'])"
echo "== K10 banner renders only with a GA4 id"; grep -n 'GA4_MEASUREMENT_ID = ' app/lib/analytics.ts; git show $BASE:$C | grep -n 'if (!GA4_MEASUREMENT_ID) return;'
echo "== K11 sketch sha, applies at HEAD in a temp copy, equals the post-sketch pin; L58 + ledger"; sha256sum $B/sketch-515.patch.txt | cut -c1-64
TMP=$(mktemp -d) && (cd "$TMP" && mkdir -p app/components/common/__tests__ && git -C "$S" show $BASE:$C > $C && git -C "$S" show $BASE:$T > $T && git init -q && git apply "$B/sketch-515.patch.txt" && sha256sum -c --quiet "$B/r515-post-sketch-sha.txt" && echo "apply+post-pin rc 0"); rm -rf "$TMP"
(cd $L && python3 -I tools/l58-check.py current-task.md | tail -1; python3 -I tools/ledger-check.py current-task.md | tail -1)
echo "== K12 sketch tsc and scoped biome"; tail -1 $B/precheck-tsc-sketch.log; tail -1 $B/sketch-biome.log
echo "== K13 mutants (each red on its named rows)"; python3 -I -c "
import json
d=json.load(open('$B/mut-logs/mutants-summary.json'))
for k,v in d.items(): print(k,v['rc'],v['failedRows'])"
echo "== K14 rows against the HEAD product file"; grep -E '^(R51[45]-[A-Z][0-9]|.*Tests )' $B/r515-rows-on-head.log | sed -E 's/ +[0-9]+ms$//' | cut -c1-70
echo "== K15 frozen pins"; sha256sum -c --quiet $B/r515-tree-sha256.txt && echo "tree rc 0 ($(wc -l < $B/r515-tree-sha256.txt) entries)"; sha256sum -c --quiet $L/b-round-318/protected-sha256.txt && echo "protected rc 0"; sha256sum -c --quiet $B/r515-pre-sha.txt && echo "pre-sha rc 0"
echo "== K16 covering set on the sketch"; cat $B/covering-files.txt; grep -hE 'Test Files|Tests |^rc=' $B/sketch-covering.log; echo "slowest: $(grep -oE '[0-9]+ms$' $B/sketch-covering.log | sort -n | tail -1)"
echo "== K17 lint and scanner on the sketch (HEAD 171 / 50)"; grep -h 'Found .* warnings' $B/sketch-lint.log; python3 -I -c "
import json
d=json.load(open('$B/scanner-sketch.json')); print('scanner',len(d),'cookie',sum('CookieConsent' in json.dumps(x) for x in d))"
echo "== K18 journey on the sketch"; python3 -I -c "
import json
t=open('$B/probe/sketch-journey.log').read(); j=json.loads(t[t.index('[{'):t.rindex('}]')+2])
for r in j: print(r['viewport'],r['step1'],r['step2']['buttons'],r['step3']['buttons'],len(r['errors']))"
echo "== K19 fields on /hire-us and checkbox inventory"; grep -nE '<select|<textarea|type="email"|<input$' app/routes/hire-us.tsx; grep -rln 'type="checkbox"' app --include=*.tsx | grep -v __tests__
echo "== K20 findings and decisions in backlog"; python3 -I -c "
import json
b=json.load(open('$L/backlog.json')); print('version',b['version'])
ids=('B-R512-COOKIE-DISMISS-FOCUS-LOST','B-R512-COOKIE-CLOSE-OVERLAPS-TEXT','GATE514-M1-POINTER-FIELD-KEYBOARD','C-R514-01','GATE514-L2-STALE-REF','GATE514-L3-HEADER-SELECTOR','A-R514-R2-HEADER-BUTTON-ROW','A-R514-R3-F8-BODY')
for n in ('open_findings','deferred_low_polish'):
    for f in b[n]:
        if f.get('id') in ids: print(n,f['id'],f['status'][:70])
print([d['id'] for d in b['decisions_log_b'][-3:]])"
echo "== K21 regression date"; python3 -I -c "import json;d=json.load(open('$L/regression-last.json'));print(d['date'],d['round'])"
echo "== K23 site header renders on every non-/studio route; banner hides on /studio (same prefix)"; grep -nE "const isStudioPage = |!isStudioPage && <Header|<CookieConsent />" app/root.tsx; git show $BASE:$C | grep -nE "const isStudioRoute = "
echo "== K24 full vitest on the sketch (B pre-check, not an A/C row)"; grep -hE "Test Files|Tests |^rc=" $B/precheck-full.log
echo "== K22 artifacts"; for f in consult-product-designer.md sketch-review.md doc-ledger-template.md mutants-515.py covering-files.txt l50-focus-origins.txt probe/r515-focus.mjs probe/r514-banner.mjs probe/n3-journey.mjs probe/head/r515.json probe/sketch/r515.json probe/sketch-r514/r514.json probe/sketch-journey.log r515-rows-on-head.log mut-logs/mutants-summary.json precheck-full.log; do test -f $B/$f && echo "ok $f" || echo "MISSING $f"; done
