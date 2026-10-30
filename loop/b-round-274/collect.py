import json,os,glob,csv,sys
rows=[]
def cost(p):
    try:
        d=json.load(open(p)); return round(d.get('total_cost_usd',0),2), round(d.get('duration_api_ms',0)/3.6e6,2)
    except Exception: return None,None
for n in range(260,275):
    r={'round':n}
    for ph in 'abc':
        files=[f for f in glob.glob(f'{ph}-round-{n}-result*.json')]
        tc=0;th=0;att=0
        for f in files:
            c,h=cost(f)
            if c is not None: tc+=c;th+=h;att+=1
        r[ph+'_cost']=round(tc,2); r[ph+'_hours']=round(th,2); r[ph+'_attempts']=att
    try:
        c=json.load(open(f'c-round-{n}.json'))
        r['c_status']=c.get('taskStatus') or c.get('status') or c.get('verdict')
        r['browser']=c.get('browserVerified')
        bugs=c.get('bugs') or []
        sev={}
        for b in bugs:
            s=(b.get('severity') if isinstance(b,dict) else 'str') or '?'
            s=str(s).lower().split()[0]
            sev[s]=sev.get(s,0)+1
        r['bugs']=sev
        r['bug_ids']=[b.get('id') for b in bugs if isinstance(b,dict)]
    except Exception as e: r['c_status']='nojson'
    try:
        g=json.load(open(f'gates/gate-round-{n}.json')); r['gate']=g.get('status')
    except Exception: r['gate']=None
    rows.append(r)
json.dump(rows,open('b-round-274/rounds-260-274.json','w'),indent=1)
for r in rows: print(r['round'],r['c_status'],r.get('browser'),r.get('bugs'),r['gate'],r['a_cost'],r['b_cost'],r['c_cost'],r['a_attempts'],r['c_attempts'])
