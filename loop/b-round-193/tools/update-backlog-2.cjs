const fs=require('fs');const P='backlog.json';const b=JSON.parse(fs.readFileSync(P,'utf8'));
const rr=b.regression_rounds.find(r=>r.id==='REGRESSION-ROUND-2026-10-27');
const s='STORE-2a field borders (if round 194 C PASS): one store text field per page (/ newsletter, /store search, /hire-us) border >= 3:1 vs surround; LeadMagnet placeholder >= 4.5:1';
if(!rr.scope_additions.includes(s))rr.scope_additions.push(s);rr.added_d29z159='2026-10-26 B round 193 -> 194 planning (D-29z159)';
fs.writeFileSync(P,JSON.stringify(b,null,1));console.log('ok',rr.scope_additions.length);
