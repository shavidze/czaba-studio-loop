const fs=require('fs');const path=require('path');
const {File,CombinedTag,Id3v2Tag}=require(path.resolve(process.argv[2],'node_modules/node-taglib-sharp'));
const p='/tmp/b-r6/guard.wav';fs.copyFileSync(path.resolve(process.argv[2],'tests/fixtures/sample.wav'),p);
const f=File.createFromPath(p);
const fake=Id3v2Tag.fromEmpty();
let ok=true;try{Object.defineProperty(f,'tag',{get:()=>fake,configurable:true});}catch(e){ok=false;console.log('defineProperty failed',e.message);}
console.log(JSON.stringify({defined:ok,isCombined:f.tag instanceof CombinedTag,protoTagIsGetter:!!Object.getOwnPropertyDescriptor(Object.getPrototypeOf(f),'tag')||'inherited'}));
f.dispose();
