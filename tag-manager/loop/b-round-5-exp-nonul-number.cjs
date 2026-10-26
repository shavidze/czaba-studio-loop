const fs=require('fs');const path=require('path');
const {File,CombinedTag,InfoTag}=require(path.resolve(process.argv[2],'node_modules/node-taglib-sharp'));
const wav=fs.readFileSync(path.resolve(process.argv[2],'tests/fixtures/sample.wav'));
function sub(id,b){const pad=b.length%2?Buffer.from([0]):Buffer.alloc(0);const h=Buffer.alloc(8);h.write(id,0,'ascii');h.writeUInt32LE(b.length,4);return Buffer.concat([h,b,pad]);}
const subs=[sub('IBPM',Buffer.from('120')),sub('ICRD',Buffer.from('2024')),sub('ITRK',Buffer.from('7')),sub('IGNR',Buffer.from('Foley')),sub('ITST',Buffer.from('120'))];
const body=Buffer.concat([Buffer.from('INFO'),...subs]);const lh=Buffer.alloc(8);lh.write('LIST',0);lh.writeUInt32LE(body.length,4);
const out=Buffer.concat([wav,lh,body]);out.writeUInt32LE(out.length-8,4);
const p='/tmp/b-r6/num2.wav';fs.writeFileSync(p,out);
const f=File.createFromPath(p);const t=f.tag;
console.log(JSON.stringify({bpm:t.beatsPerMinute,year:t.year,track:t.track,genres:t.genres}));
const it=t.tags.filter(x=>x instanceof InfoTag)[0];
console.log(JSON.stringify({ITST:it.getValuesAsStrings('ITST'),n:Number(it.getValuesAsStrings('ITST')[0])}));
f.dispose();
