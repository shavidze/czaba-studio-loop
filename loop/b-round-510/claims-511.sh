#!/usr/bin/env bash
# Round 511 claims (B round 510 -> 511 planning). Run: bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-510/claims-511.sh
# Each block prints its tag and the command output. C compares with b-round-510/claims-511-planning-output.txt.
L=/home/runner/czaba-project/tmp/studio-real-loop
S=/home/runner/czaba-project/store
B=$L/b-round-510
cd "$S" || exit 1
echo "== K1 HEAD"; git rev-parse HEAD
echo "== K2 changed paths (git status --short --untracked-files=all | wc -l)"; git status --short --untracked-files=all | wc -l
echo "== K3 gates"; python3 -I -c "import json;[print(n, json.load(open('$L/gates/gate-round-%d.json'%n)).get('status'), json.load(open('$L/gates/gate-round-%d.json'%n)).get('commit', json.load(open('$L/gates/gate-round-%d.json'%n)).get('head'))) for n in (509,510)]"
echo "== K4 c-round-510"; python3 -I -c "import json;d=json.load(open('$L/c-round-510.json'));print(d['taskStatus'],d['browserVerified'],d['realVerified'],[b['id'] for b in d['bugs']])"
echo "== K5 PurchaseHeader N2 sites at HEAD"; grep -nE 'border border-brand/30 text-brand font-medium rounded-lg|border border-accent/30 text-accent font-medium rounded-lg|^\s+<button$|<motion.button|group px-5 py-3 border rounded-lg font-medium|group px-6 py-3 bg-buy' app/components/product/PurchaseHeader.tsx
echo "== K6 Button default shape and buy variant"; grep -nE "default: 'rounded-md'|'bg-buy text-brand-foreground'|isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none'|'hover:bg-outline hover:border-outline-hover'" app/components/ui/Button.tsx
echo "== K7 radius tokens"; grep -nE -- '--radius-(md|lg):' app/styles/app.css
echo "== K8 nonbrand scan at HEAD (old and motion-widened) + scanner mutant"; python3 -I $L/b-round-506/scan-nonbrand.py . /tmp/k8-old.json | head -1; python3 -I -c "import json;[print(h['file'],h['line']) for h in json.load(open('/tmp/k8-old.json')) if 'product/' in h['file']]"; python3 -I $B/scan-nonbrand-motion.py . /tmp/k8-new.json | head -1; python3 -I -c "import json;[print(h['file'],h['line'],h['tag']) for h in json.load(open('/tmp/k8-new.json')) if h['tag'].startswith('motion')]"; cat $B/scan-motion-mutant.txt; rm -f /tmp/k8-old.json /tmp/k8-new.json
echo "== K9 stems producers (app, non-test) and the PlayStems render condition"; grep -rnE "stems\s*[:=]" app --include=*.ts --include=*.tsx | grep -v __tests__ | grep -vE "components/studio|arrangement|StudioContext|studio-lab|routes/studio" ; grep -n "selectedVersion?.stems && selectedVersion.stems.length > 0" app/components/product/ProductDetailPage.tsx; grep -c "stems" app/lib/product-utils.ts
echo "-- K9b MOCK_PRODUCT_DETAIL (has version stems) value importers outside app/data (expect none)"; grep -rn "MOCK_PRODUCT_DETAIL" app --include=*.ts --include=*.tsx | grep -v __tests__ | grep -v "^app/data/" || echo "none"
echo "== K10 PlayStems history"; git log -S"PlayStemsButton" --format="%h %ad %s" --date=short --reverse | head -1
echo "== K11 openStemsPlayer callers (non-test)"; grep -rn "openStemsPlayer(" app --include=*.tsx --include=*.ts | grep -v __tests__
echo "== K12 price guard in the shared hook"; grep -n "if (price === undefined) return;" app/hooks/useBuyNowAction.ts
echo "== K13 scratch full suite on the sketch"; cat $B/precheck-full.log
echo "== K14 covering at HEAD"; cat $B/head-covering.log
echo "== K15 lint at HEAD"; grep -E "Found [0-9]+ warnings" $B/head-lint.log
echo "== K16 frozen pins"; sha256sum -c --quiet $B/r511-tree-sha256.txt && echo "tree rc 0 ($(wc -l < $B/r511-tree-sha256.txt) entries)"; sha256sum -c --quiet $L/b-round-318/protected-sha256.txt && echo "protected rc 0"; sha256sum -c --quiet $B/r511-pre-sha.txt && echo "pre-sha rc 0"
echo "== K17 sketch sha and checkers"; sha256sum $B/sketch-511-purchaseheader.patch.txt | cut -c1-64; cd $L && python3 -I tools/l58-check.py current-task.md | tail -1; python3 -I tools/ledger-check.py current-task.md | tail -1; grep -c "L57 OK" c-round-510/l57-check.txt; cd "$S"
echo "== K18 probes (HEAD and sketch): STEMS Play Stems count, radius, same-row heights"; python3 -I -c "
import json
for lab in ('head','sketch'):
  d=json.load(open('$B/probe/%s/%s-states.json'%(lab,lab)))
  for r in d:
    m=r['m']; ks=[k for k,v in m.items() if isinstance(v,list)]
    vis=lambda k:[x for x in m[k] if x['w']>0][-1]
    print(lab,r['id'],r['vp'],'playStems',m['playStems'],'hidden0x0',sum(1 for k in ks for x in m[k] if x['w']==0),' | '.join('%s %sx%s r%s fw%s'%(k,vis(k)['w'],vis(k)['h'],vis(k)['radius'],vis(k)['fontWeight']) for k in ks))
"
echo "== K19 action probes (HEAD and sketch)"; for lab in head sketch; do python3 -I -c "
import json
for r in json.load(open('$B/probe/$lab/$lab-actions.json')):
  b=r.get('busy') or {}; ic=r.get('inCart') or {}; k=r.get('keyboard') or {}; a=r.get('after') or {}
  print('$lab',r['sc'],r['vp'],'posts',len(r['posts']),'busy',b.get('text'),b.get('disabled'),b.get('w'),b.get('pointerEvents'),'inCart',ic.get('radius'),ic.get('color'),'kbd',r.get('tabReached'),k.get('fv'),k.get('outline'),'unknown',a.get('focused'),a.get('opacity'),a.get('cursor'),'err',len(r['errors']))
"; done
echo "== K20 artifacts"; for f in r511-post-sketch-sha.txt nonbrand-motion-sketch.json probe/sketch/sketch-A1-1280-busy.png contrast.txt sketch-511-purchaseheader.patch.txt sketch-review.md test-contract-511.md test-contract-511-v1.md grants-511.txt covering-files-head.txt consult-product-designer.md probe/n2-states.mjs probe/n2-actions.mjs retro-510-before-errata.md retro-510-errata.diff.txt; do test -f $B/$f && echo "ok $f" || echo "MISSING $f"; done
echo "== K21 DESIGN_SYSTEM.md lines naming Add to Cart / Buy Now as primary"; grep -n 'variant="primary" (Add to Cart, Buy Now)\|\*\*Use for:\*\* Add to Cart, Buy Now' docs/design/DESIGN_SYSTEM.md
echo "== K22 HEAD_BUY_NOW_CLASS uses"; grep -n "HEAD_BUY_NOW_CLASS" app/lib/__tests__/store-button-cleanup-2c.test.tsx
echo "== K23 post-sketch pin"; cat $B/r511-post-sketch-sha.txt; (cd /home/runner/b510-scratch 2>/dev/null && sha256sum -c --quiet $B/r511-post-sketch-sha.txt && echo "scratch matches") || echo "scratch absent (fresh machine) - pin file stands"
echo "== K24 research grep (button terms)"; grep -rniE "outline button|secondary button|ghost button|add to cart|buy now" /home/runner/czaba-project/docs/technical/store-redesign/research/ | cut -c1-140
