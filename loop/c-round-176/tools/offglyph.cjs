// scan off-state M/S buttons (grey letter on dark fill; no brass token possible) in default-LCD screenshots, same R-B>=45 rule
const fs=require('fs'),path=require('path');const {decode}=require('./png.cjs');
const out={};
for(const [run,shot,offs] of [['c176-1440-2','on-track-mute-rest',['track-solo-music-while-mute-on']],['c176-1440-2','on-track-solo-rest',['track-mute-sfx-while-solo-on']],['c176-1280-1','on-track-mute-rest',['track-solo-music-while-mute-on']],['c176-1280-1','on-track-solo-rest',['track-mute-sfx-while-solo-on']],['c176-1440-3-nolcd','on-track-mute-rest',['track-solo-music-while-mute-on']]]){
 const j=require(path.resolve(run+'.json'));const img=decode(fs.readFileSync(path.join('..','shots',run,shot+'.png')));
 for(const o of offs){const b=j.rows.off[o].box;let n=0,br=0;const s=[];for(let Y=Math.ceil((b[1]+1)*2);Y<Math.floor((b[1]+b[3]-1)*2);Y++)for(let X=Math.ceil((b[0]+1)*2);X<Math.floor((b[0]+b[2]-1)*2);X++){const c=img.px(X,Y);n++;if(c[0]-c[2]>=45){br++;if(s.length<5)s.push(c)}}
 out[`${run}/${shot}/${o}`]={box:b,n,brass:br,samples:s};}
}
fs.writeFileSync('offglyph-scan.json',JSON.stringify(out,null,1));for(const [k,v] of Object.entries(out))console.log(k,v.brass+'/'+v.n,JSON.stringify(v.samples));
