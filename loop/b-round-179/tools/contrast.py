def h(x): x=x.lstrip('#'); return tuple(int(x[i:i+2],16) for i in (0,2,4))
def lin(c):
    c=c/255; return c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
def L(rgb): r,g,b=[lin(v) for v in rgb]; return 0.2126*r+0.7152*g+0.0722*b
def cr(a,b):
    la,lb=L(a),L(b); hi,lo=max(la,lb),min(la,lb); return (hi+0.05)/(lo+0.05)
def mix(top,bot,a): return tuple(round(top[i]*a+bot[i]*(1-a),2) for i in range(3))
T={k:h(v) for k,v in dict(background='#0e0d0c',surface='#161412',elevated='#1d1a17',mutedbg='#24201c',outline_strong='#736b60',foreground='#ece6da',muted='#a39b8e',dim='#928a7d',brand='#c9a46a').items()}
bgs={'background':T['background'],'activeLane(brand/5)':mix(T['brand'],T['background'],0.05),'surface':T['surface'],'elevated':T['elevated'],'muted-bg':T['mutedbg']}
print('activeLane rgb',bgs['activeLane(brand/5)'],'R-B',bgs['activeLane(brand/5)'][0]-bgs['activeLane(brand/5)'][2])
for fgname in ['foreground','muted','outline_strong']:
    for bn,b in bgs.items():
        print(f'{fgname:15s} vs {bn:22s} {cr(T[fgname],b):.2f}')
        f5=mix(T['foreground'],b,0.05)
        print(f'{fgname:15s} vs {bn}+fg/5 fill    {cr(T[fgname],f5):.2f}')
print('foreground vs muted', round(cr(T['foreground'],T['muted']),2))
for bn,b in [('background',T['background']),('activeLane',bgs['activeLane(brand/5)'])]:
    vf=mix(T['foreground'],b,0.15); vf2=mix(T['foreground'],b,0.20); bf=mix(T['muted'],b,0.20)
    print(bn,'valid fill fg/15',vf,'fg/20',vf2,'blocked fill muted/20',bf)
    print(' border fg vs fg/15 fill',round(cr(T['foreground'],vf),2),' border muted vs muted/20 fill',round(cr(T['muted'],bf),2))
    print(' fills: valid fg/15 vs lane',round(cr(vf,b),2),' blocked muted/20 vs lane',round(cr(bf,b),2))
    lab=mix(T['background'],vf,0.8); labb=mix(T['background'],bf,0.8)
    print(' label text fg on bg/80 over valid',round(cr(T['foreground'],lab),2),' muted text on bg/80 over blocked',round(cr(T['muted'],labb),2))
