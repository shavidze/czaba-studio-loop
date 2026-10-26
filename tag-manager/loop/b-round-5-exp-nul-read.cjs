const fs=require('fs');const path=require('path');
const {File,CombinedTag,InfoTag}=require(path.resolve(process.argv[2],'node_modules/node-taglib-sharp'));
const wav=fs.readFileSync(path.resolve(process.argv[2],'tests/fixtures/sample.wav'));
function sub(id,b){const pad=b.length%2?Buffer.from([0]):Buffer.alloc(0);const h=Buffer.alloc(8);h.write(id,0,'ascii');h.writeUInt32LE(b.length,4);return Buffer.concat([h,b,pad]);}
const subs=[sub('ICMT',Buffer.from('heavy door\0')),sub('INAM',Buffer.from('\0\0')),sub('ICAT',Buffer.from('DOORWood\0')),sub('IKEY',Buffer.from('door, slam\0')),sub('IART',Buffer.from('Rec\0'))];
const body=Buffer.concat([Buffer.from('INFO'),...subs]);const lh=Buffer.alloc(8);lh.write('LIST',0);lh.writeUInt32LE(body.length,4);
const out=Buffer.concat([wav,lh,body]);out.writeUInt32LE(out.length-8,4);
const p='/tmp/b-r6/nul.wav';fs.writeFileSync(p,out);
const f=File.createFromPath(p);const t=f.tag;
console.log(JSON.stringify({title:t.title,comment:t.comment,performers:t.performers}));
const it=t.tags.filter(x=>x instanceof InfoTag)[0];
console.log(JSON.stringify({ICAT:it.getValuesAsStrings('ICAT'),IKEY:it.getValuesAsStrings('IKEY')}));
f.dispose();
