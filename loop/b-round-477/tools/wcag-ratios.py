def lum(h):
    h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    c=[x/12.92 if x<=0.04045 else ((x+0.055)/1.055)**2.4 for x in c]
    return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]
def ratio(a,b):
    la,lb=sorted([lum(a),lum(b)],reverse=True); return (la+0.05)/(lb+0.05)
P=[('brand','#c9a46a','background','#0e0d0c'),('brand-foreground','#0e0d0c','brand','#c9a46a'),('brand','#c9a46a','surface','#161412'),('brand-hover','#d9b87f','background','#0e0d0c'),('foreground','#ece6da','background','#0e0d0c'),('foreground','#ece6da','surface','#161412'),('muted','#a39b8e','background','#0e0d0c'),('muted','#a39b8e','surface','#161412'),('dim','#928a7d','background','#0e0d0c'),('dim','#928a7d','surface','#161412')]
for a,ah,b,bh in P:
    r=ratio(ah,bh); print(f'{a} {ah.upper()} on {b} {bh.upper()}\t{r:.2f}:1\t{"AAA" if r>=7 else "AA" if r>=4.5 else "AA-large" if r>=3 else "FAIL"}')
