const fs=require('fs');const zlib=require('zlib');
const src=fs.readFileSync(__dirname+'/flag-ring.cjs','utf8');const m=src.match(/function decodePng[\s\S]*?\n}\n/)[0];const decodePng=eval('('+m+')');
for (const st of ['selected','unselected']){const F=decodePng(fs.readFileSync(`flag/1440-${st}-focused.png`));const R=decodePng(fs.readFileSync(`flag/1440-${st}-rest.png`));
const out=[];for(let x=5;x<13;x++){let c=0;for(let y=8;y<48;y++){const a=F.px(x,y),b=R.px(x,y);if(a[0]!==b[0]||a[1]!==b[1]||a[2]!==b[2])c++;}out.push(`x${x}:${c} rest${JSON.stringify(R.px(x,28))}`);}console.log(st,out.join(' | '));}
