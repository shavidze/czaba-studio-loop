import json, math
N=json.load(open('c278-new-tab_ax_noop_deletename_perf_handoff_look_hoverenabled_keep_budget.json'))['rows']
H=json.load(open('c278-head-lhb.json'))['rows']; H['look@1440x900']=json.load(open('c278-head-look_1440.json'))['rows']['look@1440x900']
B=json.load(open('../b-round-277/probe/sketch.json'))
def lab(c):
  def lin(u):
    u/=255; return u/12.92 if u<=0.04045 else ((u+0.055)/1.055)**2.4
  r,g,b=map(lin,c); X=(0.4124*r+0.3576*g+0.1805*b)/0.95047; Y=(0.2126*r+0.7152*g+0.0722*b); Z=(0.0193*r+0.1192*g+0.9505*b)/1.08883
  f=lambda t: t**(1/3) if t>0.008856 else 7.787*t+16/116
  return (116*f(Y)-16, 500*(f(X)-f(Y)), 200*(f(Y)-f(Z)))
def de2000(c1,c2):
  L1,a1,b1=lab(c1);L2,a2,b2=lab(c2)
  C1=math.hypot(a1,b1);C2=math.hypot(a2,b2);Cb=(C1+C2)/2;G=0.5*(1-math.sqrt(Cb**7/(Cb**7+25**7)))
  a1p=(1+G)*a1;a2p=(1+G)*a2;C1p=math.hypot(a1p,b1);C2p=math.hypot(a2p,b2)
  h1=math.degrees(math.atan2(b1,a1p))%360;h2=math.degrees(math.atan2(b2,a2p))%360
  dL=L2-L1;dC=C2p-C1p
  dh=0 if C1p*C2p==0 else (h2-h1 if abs(h2-h1)<=180 else (h2-h1-360 if h2-h1>180 else h2-h1+360))
  dH=2*math.sqrt(C1p*C2p)*math.sin(math.radians(dh/2))
  Lb=(L1+L2)/2;Cbp=(C1p+C2p)/2
  hb=h1+h2 if C1p*C2p==0 else ((h1+h2)/2 if abs(h1-h2)<=180 else ((h1+h2+360)/2 if h1+h2<360 else (h1+h2-360)/2))
  T=1-0.17*math.cos(math.radians(hb-30))+0.24*math.cos(math.radians(2*hb))+0.32*math.cos(math.radians(3*hb+6))-0.2*math.cos(math.radians(4*hb-63))
  dt=30*math.exp(-((hb-275)/25)**2);RC=2*math.sqrt(Cbp**7/(Cbp**7+25**7))
  SL=1+0.015*(Lb-50)**2/math.sqrt(20+(Lb-50)**2);SC=1+0.045*Cbp;SH=1+0.015*Cbp*T;RT=-math.sin(math.radians(2*dt))*RC
  return math.sqrt((dL/SL)**2+(dC/SC)**2+(dH/SH)**2+RT*(dC/SC)*(dH/SH))
def lum(c):
  def lin(u):
    u/=255; return u/12.92 if u<=0.04045 else ((u+0.055)/1.055)**2.4
  r,g,b=map(lin,c); return 0.2126*r+0.7152*g+0.0722*b
def cr(a,b):
  la,lb=sorted([lum(a),lum(b)],reverse=True); return (la+0.05)/(lb+0.05)
for vp in ['1440x900','1280x720']:
  n=N['look@'+vp]; h=H['look@'+vp]; bh=B['head@'+vp]
  for key,nk in [('metroLook','metroLook'),('addVideoLook','addLook')]:
    hv=bh[key]; cv=n[nk]; hh=h[nk]
    print(vp,key,'box new',cv['w'],cv['h'],'B-head',hv['w'],hv['h'], {m: round(de2000(hv[m],cv[m]),2) for m in ['mean','brightest','leftEdgeMid']}, 'vs C-head', {m: round(de2000(hh[m],cv[m]),2) for m in ['mean','brightest','leftEdgeMid']})
  print(vp,'hoverSoft',json.dumps(n['hoverSoft']))
  for rk in ['ringMetro','ringAdd']:
    r=n[rk]; px=r['px']; print(vp,rk,r['name'],r['focusVisible'],r['outlineStyle'],r['outlineWidth'],r['outlineColor'],'eff',r['effOpacity'],'child',r['childTag'],r['childOpacity'],'ringL',px['ringLeft'],'bgL',px['bgLeft'],'CR',round(cr(px['ringLeft'],px['bgLeft']),2),'ringT',px['ringTop'],'bgT',px['bgTop'],'CRt',round(cr(px['ringTop'],px['bgTop']),2))
  he=N['hoverenabled@'+vp]; hh=H['hoverenabled@'+vp]
  for k in ['metroOff','metroOn','preview','add']:
    print(vp,'enabled',k,'same' if {x:he[k][x] for x in ['restBg','hoverBg','pressBg','pressTransform']}=={x:hh[k][x] for x in ['restBg','hoverBg','pressBg','pressTransform']} else 'DIFF', he[k], '| head', hh[k])
  for s in ['empty','clip']:
    print(vp,'budget',s,'new',N['budget@'+vp][s]['lines'],N['budget@'+vp][s]['textNodes'],'head',H['budget@'+vp][s]['lines'],H['budget@'+vp][s]['textNodes'], N['budget@'+vp][s]['texts']==H['budget@'+vp][s]['texts'])
