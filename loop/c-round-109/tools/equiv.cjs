const fs=require('fs'),c=require('crypto');
const B=JSON.parse(fs.readFileSync(process.argv[2])).out, C=JSON.parse(fs.readFileSync(process.argv[3])).out;
const rows=C.map(o=>{const b=B.find(x=>x.p===o.p&&x.k===o.k&&x.run===o.run);const name=`body-${o.p.replace(/\W+/g,'_')||'root'}-${o.k}-${o.run}.html`;const raw=fs.readFileSync(name);const rawSha=c.createHash('sha256').update(raw).digest('hex');
return {p:o.p,k:o.k,run:o.run,status:o.status,ct:o.ct,te:o.te,events:o.events,bytes:o.bytes,bBytes:b.bytes,nul:o.nul,bNul:b.nul,rawNulRecount:raw.filter(x=>x===0).length,rawShaEqBStripped:rawSha===b.sha256Stripped,fffd:o.fffdAfterStrip}});
console.log(JSON.stringify(rows,null,0).replace(/},/g,'},\n'));fs.writeFileSync('../out/nul-equiv.json',JSON.stringify(rows,null,1));
