#!/usr/bin/env bash
# Round 514 claims (B round 513 -> 514 planning). Run: bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-513/claims-514.sh
# Each block prints its tag and output. C compares with b-round-513/claims-514-planning-output.txt.
# Only loop files that survive the job hand-over are read (no scratch/ or *.patch paths; L56).
L=/home/runner/czaba-project/tmp/studio-real-loop
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
B=$L/b-round-513
C=app/components/common/CookieConsent.tsx
T=app/components/common/__tests__/CookieConsent.test.tsx
cd "$S" || exit 1
echo "== K1 HEAD"; git rev-parse HEAD
echo "== K2 changed paths"; git status --short --untracked-files=all
echo "== K3 gate 513"; python3 -I -c "import json;d=json.load(open('$L/gates/gate-round-513.json'));print(d['status'],d['commit'])"
echo "== K4 c-round-513"; python3 -I -c "import json;d=json.load(open('$L/c-round-513.json'));print(d['taskStatus'],d['browserVerified'],d['realVerified'],d['bugs'],len(d['passed']))"
echo "== K5 banner sites at HEAD 4c85587"; git show 4c85587:$C | grep -nE 'const handle(Accept|Decline)|setIsVisible\(false\)|className="text-sm text-muted|size="sm"|<X size|absolute top-2 right-2 sm:hidden|<CookieConsent|className="fixed bottom-0'
echo "== K6 site header and banner mount order, header sticky class, logo link"; grep -nE '<Header |<Outlet />|<CookieConsent />' app/root.tsx; grep -nE '<header className="sticky top-0|<Link to="/" className' app/components/layout/Header.tsx
echo "== K7 IconButton sizes; global focus ring and pointer suppression"; grep -nE "sm: \{ button: 'w-8 h-8'|md: \{ button: 'w-10 h-10'" app/components/ui/IconButton.tsx; grep -nE '^:focus-visible|data-focus-source="pointer"' app/styles/app.css; grep -nE "addEventListener\('(pointerdown|keydown)'" app/lib/focus-source.ts
echo "== K8 banner renders only with a GA4 id"; grep -n 'GA4_MEASUREMENT_ID = ' app/lib/analytics.ts; git show 4c85587:$C | grep -n 'if (!GA4_MEASUREMENT_ID) return;'
echo "== K9 browser layout HEAD vs sketch (320/375/639/1280/1440)"; python3 -I -c "
import json
for n in ('head','sketch'):
    d=json.load(open('$B/probe/'+n+'/r514.json'))
    for l in d['layout']:
        c=l['close']; print(n,l['w'],'overlap',l['closeTextOverlap'],'gap',l['closeTextMinGapPx'],'bannerH',l['banner']['h'],'close',(c['w'],c['h'],c['display']))
h=json.load(open('$B/probe/head/r514.json'))['layout']; s=json.load(open('$B/probe/sketch/r514.json'))['layout']
for a,b in zip(h,s):
    if a['w']>=640: print('eqHEAD',a['w'],[k for k in ('banner','text','link','accept','decline','textLines') if a.get(k)!=b.get(k)])"
echo "== K10 browser focus after dismissal HEAD vs sketch"; python3 -I -c "
import json
for n in ('head','sketch'):
    d=json.load(open('$B/probe/'+n+'/r514.json'))
    print(n,'errors',len(d['errors']))
    for f in d['focus']:
        a=f['after']; print(n,f.get('w'),f.get('ctl'),f['entry'],f.get('key',''),a['tag'],(a['label'] or '')[:20],'fv',a['focusVisible'],'inVp',a['inViewport'],'sy',f.get('scrollBefore'),a['scrollY'],'gone',a['bannerGone'],list(f.get('consent',{}).values()),'prev',(f.get('prev') or {}).get('label'))
for n in ('head','sketch'):
    d=json.load(open('$B/probe/'+n+'/r514-studio.json')); print(n,'studio',d['studio'],'errors',len(d['errors']))"
echo "== K11 header not effectively sticky (C-R205-02 cause)"; sed -n 269,272p app/styles/app.css; test -f $B/probe/sticky.mjs && echo "probe/sticky.mjs present (HEAD: top -1500 at scrollY 1500)"
echo "== K12 sketch sha, applies at HEAD in a temp copy, equals the post-sketch pin; L58 + ledger"; sha256sum $B/sketch-514.patch.txt | cut -c1-64
TMP=$(mktemp -d) && (cd "$TMP" && git init -q && mkdir -p app/components/common/__tests__ && git -C "$S" show 4c85587:$C > $C && git -C "$S" show 4c85587:$T > $T && git apply "$B/sketch-514.patch.txt" && sha256sum -c --quiet "$B/r514-post-sketch-sha.txt" && echo "temp copy == post-sketch pin rc 0"); rm -rf "$TMP"
(cd $L && python3 -I tools/l58-check.py current-task.md | tail -1; python3 -I tools/ledger-check.py current-task.md | tail -1)
echo "== K13 sketch tsc and scoped biome"; tail -1 $B/precheck-tsc-sketch.log; echo "tsc log lines: $(wc -l < $B/precheck-tsc-sketch.log)"; tail -1 $B/sketch-biome.log
echo "== K14 mutants (each red on its named rows)"; python3 -I -c "
import json
d=json.load(open('$B/mut-logs/mutants-summary.json'))
for k,v in d.items(): print(k,v.get('rc'),[r.split(':')[0] for r in v.get('red',[])])"
echo "== K15 new rows against the HEAD product file"; grep -E '^\s*(✓|×) |Tests ' $B/r514-rows-on-head.log | sed -E 's/.*> //; s/ +[0-9]+ms$//' | cut -c1-60
echo "== K16 frozen pins"; sha256sum -c --quiet $B/r514-tree-sha256.txt && echo "tree rc 0 ($(wc -l < $B/r514-tree-sha256.txt) entries)"; sha256sum -c --quiet $L/b-round-318/protected-sha256.txt && echo "protected rc 0"; sha256sum -c --quiet $B/r514-pre-sha.txt && echo "pre-sha rc 0"
echo "== K17 covering set on the sketch"; cat $B/covering-files.txt; grep -hE 'Test Files|Tests ' $B/sketch-covering.log; echo "slowest: $(grep -oE '[0-9]+ms$' $B/sketch-covering.log | sort -n | tail -1)"
echo "== K18 lint and scanner on the sketch (HEAD 171 / 50)"; grep -h 'Found .* warnings' $B/sketch-lint.log; python3 -I -c "
import json
d=json.load(open('$B/scanner-sketch.json')); print('scanner',len(d),'cookie',sum('CookieConsent' in json.dumps(x) for x in d))"
echo "== K19 journey on the sketch"; python3 -I -c "
import json
for r in json.load(open('$B/probe/sketch-journey/journey.json')): print(r['viewport'],r['step1'],r['step2']['buttons'],r['step3']['buttons'],len(r['errors']))"
echo "== K20 findings and decisions in backlog v520"; python3 -I -c "
import json
b=json.load(open('$L/backlog.json')); print('version',b['version'])
ids=('B-R512-COOKIE-DISMISS-FOCUS-LOST','B-R512-COOKIE-CLOSE-OVERLAPS-TEXT','SABA-Q-513-CLOSE-AS-DECLINE','A-R183-COOKIE-BUTTON-TYPE','A-R183-REVIEW-FBQ-BRANCH','C-R205-02')
for n in ('open_findings','deferred_low_polish'):
    for f in b[n]:
        if f.get('id') in ids: print(n,f['id'],f['status'][:60])
print([d['id'] for d in b['decisions_log_b'][-3:]])"
echo "== K21 regression date"; cat $L/regression-last.json | python3 -I -c "import json,sys;d=json.load(sys.stdin);print(d['date'],d['round'])"
echo "== K22 artifacts"; for f in consult-product-designer.md sketch-review.md doc-ledger-template.md mutants-514.py covering-files.txt probe/r514-banner.mjs probe/n3-journey.mjs probe/sticky.mjs probe/head/r514.json probe/sketch/r514.json probe/head/r514-studio.json probe/sketch/r514-studio.json probe/sketch/banner-375.png probe/sketch/banner-320.png probe/head/banner-375.png probe/sketch-journey/journey.json r514-tree-sha256.txt r514-pre-sha.txt r514-post-sketch-sha.txt grants-tracked.txt; do test -f $B/$f && echo "ok $f" || echo "MISSING $f"; done; test -f $L/c-round-511/prot.mjs && echo "ok c-round-511/prot.mjs"; test -f $L/user-review/questions-round-513.md && echo "ok questions-round-513.md"
