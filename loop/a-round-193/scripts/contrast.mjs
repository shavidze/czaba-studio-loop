const hsl=(h,s,l)=>{s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return [f(0),f(8),f(4)].map(v=>Math.round(v*255));};
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const L=c=>{const [r,g,b]=c.map(v=>{v/=255;return v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4});return 0.2126*r+0.7152*g+0.0722*b;};
const cr=(a,b)=>{const x=L(a),y=L(b);return ((Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)).toFixed(2);};
const oldFg=hsl(220,10,94),newFg=hex('#ece6da'),dark=hex('#0e0d0c');
const pairs={'buy':[hex('#006aff'),hex('#c9a46a')],'destructive':[hsl(0,84,60),hex('#d2776a')],'brand':[hsl(175,85,46),hex('#c9a46a')]};
for(const [k,[o,n]] of Object.entries(pairs)) console.log(k,'before ivory',cr(oldFg,o),'after ivory',cr(newFg,n),'after brand-fg',cr(dark,n));
