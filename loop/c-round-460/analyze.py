import json,glob,os
R={}
for f in sorted(glob.glob('matrix/519*.json')):
    b=os.path.basename(f)[:-5]; p=b.split('-'); R[b]=json.load(open(f))['summary']
def g(port,w,cpu,mode): return R.get(f'{port}-{w}-cpu{cpu}-{mode}')
fails=[]
def chk(name,ok,info=''):
    print(('OK  ' if ok else 'FAIL'),name,info)
    if not ok: fails.append(name)
for w in (1440,1280):
  for cpu in (1,4):
    t=g(5191,w,cpu,'fresh'); h=g(5190,w,cpu,'fresh')
    chk(f'C5 tree fresh {w} cpu{cpu}', t['firstPaintedLum']<=3 and t['firstCovered']<=t['fp'] and t['gapsWhileCovered']==0, f"lum {t['firstPaintedLum']} fc {t['firstCovered']} fp {t['fp']} gaps {t['gapsWhileCovered']}")
    chk(f'C5 HEAD fresh {w} cpu{cpu}', h['firstPaintedLum']>=6 and h['firstCovered']>h['fp'], f"lum {h['firstPaintedLum']} fc {h['firstCovered']} fp {h['fp']}")
    for m in ('reload','rm'):
        s=g(5191,w,cpu,m); chk(f'C7 {m} {w} cpu{cpu}', not s['anyBlackSample'] and s['blackFrames']==0 and s['finalState'] is None, f"{s['anyBlackSample']} {s['blackFrames']} {s['finalState']}")
    for m in ('blockjs','delayjs'):
        s=g(5191,w,cpu,m); d=s['removedAt']-s['firstCovered']
        chk(f'C8 {m} {w} cpu{cpu}', 1200<=d<=1500 and (m!='delayjs' or (s['finalState']=='expired' and s['logoFullMs']==0)), f"d {d} state {s['finalState']} logo {s['logoFullMs']}")
    for m in ('esc50','tab50','click50'):
        s=g(5191,w,cpu,m); lim=200 if cpu==1 else 400
        ok=s['logoFullMs']==0 and s['finalState'] in ('skipped','live') and s['removedMinusInput'] is not None and s['removedMinusInput']<=lim and (m!='tab50' or s['finalFocus']=='A') and (m!='click50' or s['url']=='/')
        chk(f'C9 {m} {w} cpu{cpu}', ok, f"rmi {s['removedMinusInput']} state {s['finalState']} focus {s['finalFocus']} url {s['url']} logo {s['logoFullMs']}")
    for m in ('fresh','clientnav'):
        s=g(5191,w,cpu,m); d=s['removedAt']-s['firstCovered']; ds=s['removedAt']-float(s['dataStart']) if s['dataStart'] else None
        if cpu==1: ok= s['finalState']=='live' and 1400<=d<=1700 and s['logoFullMs']>=600 and s['tagFullMs']>=400
        else: ok= ds<=2000 and d>=1400 and s['logoFullMs']>0 and s['tagFullMs']>0
        chk(f'C6 {m} {w} cpu{cpu}', ok, f"d {d} ds {ds} logo {s['logoFullMs']} tag {s['tagFullMs']} state {s['finalState']}")
    s=g(5191,w,cpu,'arrive'); h=g(5190,w,cpu,'arrive'); d=s['removedAt']-s['firstCovered']
    chk(f'C10 arrive {w} cpu{cpu}', s['logoFullMs']>0 and h['logoFullMs']>0 and d>=1300 and s['finalState'] is None, f"d {d} logo {s['logoFullMs']} head {h['logoFullMs']} state {s['finalState']}")
    s=g(5191,w,cpu,'inject'); d=s['removedAt']-s['firstCovered']
    valid=s['styleReplaced'] and s['hydrationErrors']>0
    lim=1900 if cpu==1 else 2000
    ok=valid and s['overlaySeen'] and s['firstPaintedLum']<=3 and s['gapsWhileCovered']==0 and s['handshakeState']=='live' and 1400<=d<=lim and (cpu==4 and s['logoFullMs']>0 or cpu==1 and s['logoFullMs']>=600)
    chk(f'C12 inject {w} cpu{cpu}', ok, f"valid {valid} d {d} lum {s['firstPaintedLum']} gaps {s['gapsWhileCovered']} hs {s['handshakeState']} logo {s['logoFullMs']} seen {s['overlaySeen']}")
    s=g(5191,w,cpu,'delayinject'); d=s['removedAt']-s['firstCovered']; valid=s['styleReplaced'] and s['hydrationErrors']>0
    chk(f'C13 delayinject {w} cpu{cpu}', valid and s['handshakeState']=='expired' and s['logoFullMs']==0 and not s['overlaySeen'] and d<=1500, f"valid {valid} hs {s['handshakeState']} d {d} logo {s['logoFullMs']} seen {s['overlaySeen']} se {s['styleReplaced']} he {s['hydrationErrors']}")
for k,s in R.items():
    if '-r' in k.split('cpu')[1]:
        print('REP',k,{x:s.get(x) for x in ('finalState','logoFullMs','tagFullMs','removedMinusInput','styleReplaced','hydrationErrors','handshakeState','overlaySeen','gapsWhileCovered','firstPaintedLum')}, (s['removedAt']-s['firstCovered']) if s['removedAt'] and s['firstCovered'] else None)
print('FAILS',fails)
