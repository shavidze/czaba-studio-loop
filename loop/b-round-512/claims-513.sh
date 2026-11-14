#!/usr/bin/env bash
# Round 513 claims (B round 512 -> 513 planning). Run: bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-512/claims-513.sh
# Each block prints its tag and output. C compares with b-round-512/claims-513-planning-output.txt.
# Only loop files that survive the job hand-over are read (no scratch/, mut/, runs/ or *.patch paths; L56).
L=/home/runner/czaba-project/tmp/studio-real-loop
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
B=$L/b-round-512
C=app/components/common/CookieConsent.tsx
T=app/components/common/__tests__/CookieConsent.test.tsx
cd "$S" || exit 1
echo "== K1 HEAD"; git rev-parse HEAD
echo "== K2 changed paths"; git status --short --untracked-files=all
echo "== K3 gate 512"; python3 -I -c "import json;d=json.load(open('$L/gates/gate-round-512.json'));print(d['status'],d['commit'])"
echo "== K4 c-round-512"; python3 -I -c "import json;d=json.load(open('$L/c-round-512.json'));print(d['taskStatus'],d['browserVerified'],d['realVerified'],d['bugs'],len(d['passed']))"
echo "== K5 cookie banner sites at HEAD cbc5709"; git show cbc5709:$C | grep -nE '<button|bg-white text-black rounded-full|aria-label="Close"|sm:hidden|onClick=\{handle(Accept|Decline)\}|<X size'
echo "== K6 Button secondary/sm/pill and IconButton ghost/sm"; grep -nE "^  secondary: \[|'bg-elevated text-foreground'|'border border-outline'|'hover:bg-outline hover:border-outline-hover'|sm: 'px-3 py-1.5 text-sm gap-1.5'|pill: 'rounded-full'" app/components/ui/Button.tsx; grep -nE "^  ghost: \[|'bg-transparent text-muted'|sm: \{ button: 'w-8 h-8'|'rounded-lg'|title=\{label\}|aria-label=\{label\}" app/components/ui/IconButton.tsx
echo "== K7 banner renders only with a GA4 id"; grep -n 'GA4_MEASUREMENT_ID = ' app/lib/analytics.ts; git show cbc5709:$C | grep -n 'if (!GA4_MEASUREMENT_ID) return;'
echo "== K8 NONBRAND widened scanner (HEAD 51, sketch 50)"; python3 -I -c "
import json
for n in ('head','sketch'):
    d=json.load(open('$B/nonbrand-'+n+'.json')); print(n,len(d),[h['file']+':'+str(h['line']) for h in d if 'CookieConsent' in h['file']])"
echo "== K9 lint warnings (HEAD 174, sketch 171)"; grep -h 'Found .* warnings' $B/head-lint.log $B/sketch-lint.log
echo "== K10 tests that name CookieConsent or components/common"; cat $B/covering-grep.txt
echo "== K11 covering set at HEAD and on the sketch"; cat $B/covering-files.txt; grep -hE 'Test Files|Tests ' $B/head-covering.log $B/sketch-covering.log
echo "== K12 sketch sha, applies at HEAD in a temp copy, equals the post-sketch pin"; sha256sum $B/sketch-513.patch.txt | cut -c1-64
TMP=$(mktemp -d) && (cd "$TMP" && git init -q && mkdir -p app/components/common/__tests__ && git -C "$S" show cbc5709:$C > $C && git -C "$S" show cbc5709:$T > $T && git apply "$B/sketch-513.patch.txt" && sha256sum -c --quiet "$B/r513-post-sketch-sha.txt" && echo "temp copy == post-sketch pin rc 0"); rm -rf "$TMP"
(cd $L && python3 -I tools/l58-check.py current-task.md | tail -1; python3 -I tools/ledger-check.py current-task.md | tail -1)
echo "== K13 full suite on the product sketch (before the N3 rows)"; grep -E 'Test Files|Tests |^rc' $B/precheck-full.log; tail -1 $B/precheck-tsc.log; echo "dispatched sketch tsc: $(tail -1 $B/precheck-tsc-dispatched.log)"
echo "== K14 mutants (each red on its named row)"; python3 -I -c "
import json
d=json.load(open('$B/mut-logs/mutants-summary.json'))
for k,v in d.items(): print(k,v.get('rc'),[r.split(':')[0] for r in v.get('red',[])])"
echo "== K15 N3 rows against the HEAD product file"; grep -E '^\s*(✓|×) .*N3-|Tests ' $B/n3-rows-on-head.log | sed -E 's/ +[0-9]+ms$//'
echo "== K16 frozen pins"; sha256sum -c --quiet $B/r513-tree-sha256.txt && echo "tree rc 0 ($(wc -l < $B/r513-tree-sha256.txt) entries)"; sha256sum -c --quiet $L/b-round-318/protected-sha256.txt && echo "protected rc 0"; sha256sum -c --quiet $B/r513-pre-sha.txt && echo "pre-sha rc 0"
echo "== K17 browser probe HEAD vs sketch (GA4 env servers)"; python3 -I -c "
import json
for n in ('head','sketch'):
    r=json.load(open('$B/probe/'+n+'/n3.json'))
    for run in r['runs']:
        g=lambda c:(lambda x:None if x is None else (x['w'],x['h'],x['display'],x['bg'],x['color'],x['radius'],x['weight']))(run['rest'][c])
        print(n,run['viewport'],'D',g('Decline'),'A',g('Accept'),'X',g('Close'),'order',run['rest']['order'],'actions',{a:(v['consent'],v['focusAfter']['tag'],v['firstTabAfter']['name']) for a,v in run['actions'].items()},'errors',len(run['errors']))
    print(n,'studio',[(s['viewport'],s['path'],s['accept']) for s in r['studio']])"
echo "== K18 open CookieConsent findings"; python3 -I $L/tools/find-ids.py $L A-R183-COOKIE-BUTTON-TYPE A-R183-REVIEW-FBQ-BRANCH A-R183-COOKIE-INLINE-GRADIENT C-R183-N-CLOSE-0X0 SABA-Q-507-COOKIE-WEIGHT B-R512-COOKIE-DISMISS-FOCUS-LOST B-R512-COOKIE-PILL-LOW-SEPARATION B-R512-COOKIE-CLOSE-OVERLAPS-TEXT DPG-BUTTON-CLEANUP-2-NONBRAND
echo "== K19 docs naming cookie-banner button styles outside docs/implementation (expect only the genesis prompt module)"; grep -rlniE 'cookie banner|cookieconsent|handleAccept|accept.*decline' docs/design docs/technical/components .claude/primitives 2>/dev/null || echo none; grep -n 'onClick={handleAccept}' docs/prompts/modules/analytics.prompt.md
echo "== K20 c-round-512 L57 check"; tail -1 $L/c-round-512/l57-check.txt
echo "== K21 regression due date"; cat $L/regression-last.json | python3 -I -c "import json,sys;print(json.load(sys.stdin)['date'])"
echo "== K22 IL4 pins the banner Privacy Link"; grep -n "IL4" app/lib/__tests__/store-internal-links.test.ts
echo "== K23 second design gate claims at HEAD"; grep -c '<a ' app/components/layout/Footer.tsx; grep -n "progressColor: 'hsl(175" app/components/studio/StudioTrack.tsx; grep -n 'hsl(340, 85%, 55%)' app/styles/app.css; grep -n -- '--premium-gold:' app/styles/base/utilities.css; grep -n -- '--color-blue-60' app/styles/app.css; grep -cE 'bg-neutral-800|bg-red-500|bg-yellow-500' app/components/home/StudioMockup.tsx; grep -n 'ENTRANCE_MIN_TOTAL_MS = ' app/components/loading/EntranceCover.tsx; grep -n '| `brand` |' .claude/primitives/DESIGN_TOKENS.md
echo "== K24 artifacts"; for f in $B/sketch-513.patch.txt $B/sketch-review.md $B/consult-product-designer.md $B/probe/n3-banner.mjs $B/probe/head/n3.json $B/probe/sketch/n3.json $B/mutants-513.py $B/mut-logs/mutants-summary.json $B/n3-rows-on-head.log $B/r513-tree-sha256.txt $B/r513-pre-sha.txt $B/r513-post-sketch-sha.txt $B/grants-tracked.txt $B/covering-files.txt $B/precheck-full.log $B/doc-ledger-template.md $B/precheck-tsc-dispatched.log $B/claims-513-sketch-output.txt $B/claims-513-allowed-delta.txt $B/probe/head/banner-375.png $B/probe/sketch/banner-375.png $L/c-round-511/prot.mjs $L/b-round-510/scan-nonbrand-motion.py $B/mutants-513.py; do test -f $f && echo "ok ${f#$L/}" || echo "MISSING $f"; done
echo "== K25 journey on the sketch (consent, banner buttons per step)"; python3 -I -c "
import json
for r in json.load(open('$B/probe/sketch-journey/journey.json')): print(r['viewport'],r['step1'],r['step2']['buttons'],r['step3']['buttons'],len(r['errors']))"; test -f $B/probe/n3-journey.mjs && echo "ok probe/n3-journey.mjs"
