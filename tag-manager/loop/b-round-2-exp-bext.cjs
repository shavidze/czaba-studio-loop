const fs=require("fs");const crypto=require("crypto");
const {File:TagFile,CombinedTag,InfoTag}=require("node-taglib-sharp");
function chunk(id,payload){const h=Buffer.alloc(8);h.write(id,0,"ascii");h.writeUInt32LE(payload.length,4);const pad=payload.length%2?Buffer.alloc(1):Buffer.alloc(0);return Buffer.concat([h,payload,pad]);}
const sr=44100,n=4410;const fmt=Buffer.alloc(16);fmt.writeUInt16LE(1,0);fmt.writeUInt16LE(1,2);fmt.writeUInt32LE(sr,4);fmt.writeUInt32LE(sr*2,8);fmt.writeUInt16LE(2,12);fmt.writeUInt16LE(16,14);
const data=Buffer.alloc(n*2);for(let i=0;i<n;i++)data.writeInt16LE(Math.floor(Math.sin(2*Math.PI*440*i/sr)*16000),i*2);
const bext=Buffer.alloc(602);bext.write("sSPEED=025.000-ND",0,"ascii");
const ixml=Buffer.from('<?xml version="1.0"?><BWFXML><PROJECT>X</PROJECT></BWFXML>',"ascii");
const body=Buffer.concat([Buffer.from("WAVE"),chunk("fmt ",fmt),chunk("bext",bext),chunk("iXML",ixml),chunk("data",data)]);
const hdr=Buffer.alloc(8);hdr.write("RIFF");hdr.writeUInt32LE(body.length,4);fs.writeFileSync("rec.wav",Buffer.concat([hdr,body]));
function parse(b){const out=[];let o=12;while(o+8<=b.length){const id=b.toString("ascii",o,o+4),sz=b.readUInt32LE(o+4);out.push({id,o,sz,p:b.subarray(o+8,o+8+sz)});o+=8+sz+(sz%2);}return out;}
function info(b){const m={};for(const c of parse(b))if(c.id==="LIST"&&c.p.toString("ascii",0,4)==="INFO"){let o=4;while(o+8<=c.p.length){const id=c.p.toString("ascii",o,o+4),sz=c.p.readUInt32LE(o+4);m[id]=c.p.subarray(o+8,o+8+sz).toString("hex");o+=8+sz+(sz%2);}}return m;}
const sha=b=>crypto.createHash("sha256").update(b).digest("hex").slice(0,16);
const before=parse(fs.readFileSync("rec.wav"));
function write(p,meta){const f=TagFile.createFromPath(p);try{const t=f.tag;if(meta.comment!==undefined)t.comment=meta.comment;const custom=Object.entries(meta).filter(([k])=>k!=="comment");if(custom.length){let it=t.tags.filter(x=>x instanceof InfoTag);if(!it.length){t.title=t.title??"";it=t.tags.filter(x=>x instanceof InfoTag);}for(const[k,v]of custom)it[0].setValuesFromStrings(k,[v]);}f.save();}finally{f.dispose();}}
write("rec.wav",{ICAT:"DOORWood",IKEY:"door, slam",comment:"მძიმე კარი"});
const a=fs.readFileSync("rec.wav");const after=parse(a);
for(const id of["bext","iXML","data"]){const x=before.find(c=>c.id===id),y=after.find(c=>c.id===id);console.log(id,sha(x.p),y?sha(y.p):"MISSING",y&&x.p.equals(y.p));}
console.log("chunks",after.map(c=>c.id+":"+c.sz).join(" "));
const inf=info(a);console.log("INFO",JSON.stringify(inf));console.log("ICMT utf8?",Buffer.from(inf.ICMT||"","hex").toString("utf8"));
write("rec.wav",{ICAT:""});console.log("after clear",JSON.stringify(info(fs.readFileSync("rec.wav"))));
