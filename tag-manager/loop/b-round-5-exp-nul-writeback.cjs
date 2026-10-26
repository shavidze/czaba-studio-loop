const fs=require('fs');const path=require('path');
const {File,InfoTag}=require(path.resolve(process.argv[2],'node_modules/node-taglib-sharp'));
const p='/tmp/b-r6/nul2.wav';fs.copyFileSync('/tmp/b-r6/nul.wav',p);
let f=File.createFromPath(p);const c=f.tag.comment;const cat=f.tag.tags.filter(x=>x instanceof InfoTag)[0].getValuesAsStrings('ICAT');
f.tag.comment=c;f.tag.tags.filter(x=>x instanceof InfoTag)[0].setValuesFromStrings('ICAT',cat);f.save();f.dispose();
const b=fs.readFileSync(p);const i=b.lastIndexOf('INFO');let o=i+4;while(o<b.length-8){const id=b.toString('ascii',o,o+4);const s=b.readUInt32LE(o+4);if(!/^[A-Z0-9]{4}$/.test(id))break;console.log(id,s,JSON.stringify(b.toString('utf8',o+8,o+8+s)));o+=8+s+(s%2);}
f=File.createFromPath(p);console.log(JSON.stringify(f.tag.comment));f.dispose();
