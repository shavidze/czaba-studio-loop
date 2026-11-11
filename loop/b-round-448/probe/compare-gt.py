import json,sys
h=json.load(open(sys.argv[1]))['rows']; s={}
for f in sys.argv[2:-1]: s.update({k:v for k,v in json.load(open(f))['rows'].items() if v.get('found')})
out=[];ok=True
for k,hv in sorted(h.items()):
    sv=s.get(k)
    if not hv.get('found') or not sv: out.append(f"{k} MISSING head={hv.get('found')} sketch={bool(sv)}"); ok=False; continue
    same=hv['spanBox']==sv['spanBox'] and hv['parentBox']==sv['parentBox'] and hv['lines']==sv['lines']
    inkClose=sv['pix']['coreInk'] is not None and all(abs(a-b)<=8 for a,b in zip(sv['pix']['coreInk'],[236,230,218]))
    good=sv['fill']=='rgb(236, 230, 218)' and sv['backgroundImage']=='none' and sv['pix']['tealInkFraction']<=0.01 and sv['pix']['coreContrast']>=4.5 and inkClose
    headTeal=hv['fill']=='rgba(0, 0, 0, 0)' and 'gradient' in (hv['backgroundImage'] or '') and hv['pix']['tealInkFraction']>=0.2
    ok&=same and good and headTeal
    out.append(f"{k} boxSame={same} sketchOK={good} headTealGradient={headTeal} head(fill={hv['fill']},teal={hv['pix']['tealInkFraction']}) sketch(fill={sv['fill']},ink={sv['pix']['coreInk']},teal={sv['pix']['tealInkFraction']},cr={sv['pix']['coreContrast']})")
out.append(f"ROWS {len(h)} ALL_OK {ok}")
print('\n'.join(out))
