const f=process.argv[2];const j=require(require('path').resolve(f));
const lum=([r,g,b])=>{const q=c=>{c/=255;return c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4};return 0.2126*q(r)+0.7152*q(g)+0.0722*q(b)};
const cr=(a,b)=>{const x=lum(a),y=lum(b);return +((Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)).toFixed(2)};
const P=s=>{const m=/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/.exec(s||'');return m?[+m[1],+m[2],+m[3]]:null};
console.log('error',j.error||null,'noLcd',j.noLcd,'fonts',j.fonts,'mixed',JSON.stringify(j.setup.mixed),'net',JSON.stringify(require('../tools/lib122.cjs').netOk(j.net)));
for(const [k,v] of Object.entries(j.rows.on)){if(v.error){console.log(k,v.error);continue}
 for(const st of ['rest','hover','press']){const s=v[st];const top=s.scan1.top[0][0];
  const lh=s.leftHalf&&s.leftHalf.top[0][0];
  console.log(k.padEnd(17),st.padEnd(5),'bg',s.bg.padEnd(22),'bd',s.border,'col',s.color,'comp',s.composite.join(','),'under',s.under.join(','),'pr',s.pressed,'hov',s.hover,'act',s.active,'fv',s.focus,'| brass s1',s.scan1.brass+'/'+s.scan1.n,'s3',s.scan3.brass+'/'+s.scan3.n,
  lh? `| half ${lh} vsHdr ${cr(lh,s.under)} letterOnHalf ${cr(P(s.color),lh)}` : `| fill vsHdr ${cr(s.composite,s.under)} letter ${cr(P(s.color),s.composite)}`);}
}
const off=j.rows.off;for(const [k,v] of Object.entries(off)) console.log('off',k.padEnd(32),v.bg,v.border,v.color,'comp',v.composite.join(','),'pr',v.pressed);
const s=j.rows.sep;if(s.hover)console.log('sep',s.hover.bg,'comp',s.hover.composite.join(','),'under',s.hover.under.join(','),'scan',s.scan.brass+'/'+s.scan.n,'cr',s.crVsUnder,'drag',JSON.stringify(s.drag));
