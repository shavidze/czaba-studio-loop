import sys, subprocess, time, shutil, hashlib, json
F='/home/runner/czaba-project/store/app/components/loading/SpotlightLoader.tsx'
START=open(F).read()
H0=hashlib.sha256(START.encode()).hexdigest()
MG_I="initial={{ opacity: 0, scale: 0.3 }}"
MG_A="""animate={{
            opacity: showSpotlight ? 0.8 : 0,
            scale: showSpotlight ? 1 : 0.3,
          }}"""
SG_I="""initial={{ opacity: 0 }}
          animate={{
            opacity: showLogo ? 0.4 : 0,
          }}"""
LG_I="initial={{ opacity: 0, y: 30, scale: 0.9 }}"
LG_A="""animate={{
            opacity: showLogo ? 1 : 0,
            y: showLogo ? 0 : 30,
            scale: showLogo ? 1 : 0.9,
          }}"""
RL="""initial={{ opacity: 0, width: 0 }}
            animate={{
              opacity: phase === 'holding' || phase === 'exit' ? 1 : 0,
              width: phase === 'holding' || phase === 'exit' ? '100%' : 0,
            }}"""
TG="""initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: phase === 'holding' || phase === 'exit' ? 1 : 0,
              y: phase === 'holding' || phase === 'exit' ? 0 : 10,
            }}"""
V={
 'none':[],
 'mainglow-all':[(MG_I,"initial={{ opacity: 0.8, scale: 1 }}"),(MG_A,"animate={{ opacity: 0.8, scale: 1 }}")],
 'mainglow-scale':[(MG_I,"initial={{ opacity: 0, scale: 1 }}"),(MG_A,"animate={{ opacity: showSpotlight ? 0.8 : 0, scale: 1 }}")],
 'mainglow-opacity':[(MG_I,"initial={{ opacity: 0.8, scale: 0.3 }}"),(MG_A,"animate={{ opacity: 0.8, scale: showSpotlight ? 1 : 0.3 }}")],
 'secglow':[(SG_I,"initial={{ opacity: 0.4 }}\n          animate={{ opacity: 0.4 }}")],
 'logo':[(LG_I,"initial={{ opacity: 1, y: 0, scale: 1 }}"),(LG_A,"animate={{ opacity: 1, y: 0, scale: 1 }}")],
 'rule':[(RL,"initial={{ opacity: 1, width: '100%' }}\n            animate={{ opacity: 1, width: '100%' }}")],
 'tagline':[(TG,"initial={{ opacity: 1, y: 0 }}\n            animate={{ opacity: 1, y: 0 }}")],
}
names=sys.argv[1].split(','); W=sys.argv[2] if len(sys.argv)>2 else '375'; N=sys.argv[3] if len(sys.argv)>3 else '1'
res={}
try:
  for n in names:
    s=START
    for a,b in V[n]:
      assert a in s,(n,a[:40]); s=s.replace(a,b)
    open(F,'w').write(s); time.sleep(3)
    out=subprocess.run(['node','cls.cjs',W,'bisect-'+n,N,'fresh'],capture_output=True,text=True).stdout
    d=json.load(open('../out/cls-bisect-%s-%s.json'%(n,W)))
    rows=[]
    for r in d['fresh']:
      big=[(s['t'],s['v'],[x['n'][:45] for x in s['src']]) for s in r['shifts'] if s['v']>=0.005]
      rows.append({'cls':round(r['cls'],4),'ins':r['ins'],'big':big})
    res[n]=rows; print(n,json.dumps(rows))
finally:
  open(F,'w').write(START)
  assert hashlib.sha256(open(F).read().encode()).hexdigest()==H0; print('restored',H0[:8])
