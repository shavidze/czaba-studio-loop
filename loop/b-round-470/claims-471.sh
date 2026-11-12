#!/bin/bash
# Claims for round 471 (STORE-2c-1). Read-only. Run: bash b-round-470/claims-471.sh
L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-470; S=/home/runner/czaba-project/store
cd $S || exit 1
echo "K1 head $(git rev-parse --short HEAD) status-lines $(git status --short --untracked-files=all | wc -l) diff-sha $(git diff | sha256sum | cut -c1-16)"
echo "K2 gate470 $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-470.json'));print(g['status'],g['commit'][:7])")"
echo "K3 app.css l.122 [$(sed -n 122p app/styles/app.css | xargs)] l.123 [$(sed -n 123p app/styles/app.css | xargs)] l.337 [$(sed -n 337p app/styles/app.css | xargs)]"
git apply --check $B/sketch-471.patch.txt >/dev/null 2>&1; echo "K4 sketch apply --check rc $?"
echo "K5 sketch sha $(sha256sum $B/sketch-471.patch.txt | cut -c1-16)"
for f in type-probe.cjs type-probe.json type-probe-summary.txt type-probe2.cjs type-probe2.json type-probe2-summary.txt glyph-and-crops.cjs glyph/glyph.json glyph/sketch-glyph.png sketch-vitest.log mutant-head-css.log pd-2c.md shots/sketch-375-_about.png; do test -f $B/$f && echo "K6 ok $f" || echo "K6 MISSING $f"; done
test -f $L/user-review/questions-round-470.md && echo "K6 ok questions-round-470.md" || echo "K6 MISSING questions-round-470.md"
echo "K7 regression-last $(python3 -I -c "import json;print(json.load(open('$L/regression-last.json'))['date'])")"
sha256sum -c --quiet "$L/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K8 protected rc $?"
echo "K9 instrument-sans weights $(grep -A3 "font-family: 'Instrument Sans'" app/assets/fonts/fonts.css | grep -o 'font-weight: [0-9]*' | sort -u | tr '\n' ' ') plex weights $(grep -A3 "font-family: 'IBM Plex Mono'" app/assets/fonts/fonts.css | grep -o 'font-weight: [0-9]*' | sort -u | tr '\n' ' ')"
echo "K10 obsidian l.1623 [$(sed -n 1623p app/styles/app.css)] l.1643 [$(sed -n 1643p app/styles/app.css | xargs)] l.1644 [$(sed -n 1644p app/styles/app.css | xargs)]"
echo "K11 sketch vitest [$(sed 's/\x1b\[[0-9;]*m//g' $B/sketch-vitest.log | grep -E '^ *Tests ' | xargs)] mutant [$(sed 's/\x1b\[[0-9;]*m//g' $B/mutant-head-css.log | grep -E '× FN' | cut -c1-12 | xargs)]"
python3 -I - "$B/type-probe.json" <<'EOF'
import json,sys
d=json.load(open(sys.argv[1])); h,s=d['head'],d['sketch']
ov=sum(1 for k in s if s[k]['scrollWidth']!=s[k]['clientWidth'])
bad=sorted({r for k in s for r in s[k]['fontResponses'] if r.startswith(('inter-','playfair-')) or not r.endswith((':200',':304'))})
plat=sorted({p for k in s for p in (s[k]['h1Platform'] or []) if not p.startswith('Instrument Sans')})
dh=[(k,round(s[k]['headings'][0]['height']-h[k]['headings'][0]['height'],1)) for k in s if s[k]['headings'] and h[k]['headings'] and s[k]['headings'][0]['height']!=h[k]['headings'][0]['height']]
mono=sorted({(k.split('x')[0]+k[k.index('/'):] , tuple(s[k]['monoPlatform'] or [])) for k in s if s[k]['monoCount']})
headfonts=sorted({k for k in h if not any(r.startswith('playfair-') for r in h[k]['fontResponses'])})
print('K12 pages', len(s), 'overflowX', ov, 'bad-or-old-font-responses', bad, 'non-instrument-h1', plat, 'first-heading-height-deltas', dh)
print('K12 mono-platform', sorted({x for _,t in mono for x in t}), 'pages', sorted({m[0] for m in mono}), 'head-pages-without-playfair', headfonts)
EOF
echo "K13 lessons lines $(wc -l < $L/lessons.md)"
echo "K14 font-serif uses (store, non-test) $(grep -rn 'font-serif' app --include=*.tsx | grep -v __tests__ | wc -l)"
python3 -I - "$B/type-probe2.json" <<'EOF2'
import json,sys
d=json.load(open(sys.argv[1])); h,s=d['head'],d['sketch']
grow=[];clip=0;ov=0;match=True;fam=set();cls=[]
for k in h:
  ea,eb=h[k]['els'],s[k]['els']
  match = match and len(ea)==len(eb) and all(x['tag']==y['tag'] and x['text']==y['text'] for x,y in zip(ea,eb))
  for x,y in zip(ea,eb):
    fam.add(y['family'])
    if y['clipped'] and not x['clipped']: clip+=1
    if y['lines']>x['lines'] and (x['tag'] in ('h1','h2','h3','h4') or (x['tag'] in ('a','button','span','label') and x['lines']==1)): grow.append((k,x['tag'],x['text'][:25],x['lines'],y['lines']))
  ov+= s[k]['overflowX']!=0
  cls.append((s[k]['cls'],h[k]['cls']))
lt=sorted({(k.split('x')[0],h[k]['longTitle']['lines'],s[k]['longTitle']['lines'],s[k]['longTitle']['h1Overflow']) for k in s if 'longTitle' in s[k]})
print('K15 matched', match, 'families', sorted(fam), 'newClipped', clip, 'overflowPages', ov, 'growths', grow)
print('K15 cls max sketch', max(c[0] for c in cls), 'max head', max(c[1] for c in cls), 'longTitle (vw,head,sketch,h1Overflow)', lt)
EOF2
python3 -I -c "import json;d=json.load(open('$B/glyph/glyph.json'));print('K16 glyph', {k:v['glyph'] for k,v in d.items()})"
