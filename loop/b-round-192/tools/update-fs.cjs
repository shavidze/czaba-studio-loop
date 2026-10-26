const fs=require('fs');const P='feature-status.md';const lines=fs.readFileSync(P,'utf8').split('\n');
const rep=(i,from,to)=>{if(!lines[i].includes(from))throw new Error('miss '+i+' '+from);lines[i]=lines[i].replace(from,to);};
rep(2,'B (round 191 → round 192 დაგეგმვა, D-29z157)','B (round 192 → round 193 დაგეგმვა, D-29z158)');
if(!lines[87].startsWith('- **Round 191 (D-29z156)'))throw new Error('l88');
lines.splice(88,0,'- **Round 192 (D-29z157): STORE-2a — არ განხორციელდა (C FAIL, `browserVerified: false`).** A-მ K0.4-ის წესით სწორად შეაჩერა მუშაობა რედაქტირებამდე: brass/buy/destructive ფონზე ღია ტექსტი კიდევ 5 არადაცულ ადგილას იყო (PurchaseHeader Buy Now — K1-ის შემდეგ 4.05 → 1.88:1, LeadMagnet CONTINUE, ConfirmDialog, ChatButton, ForgetPassword-ის icon). C-მ სია დამოუკიდებლად დაადასტურა. მიზეზი — B-ის grant-ების არასრული ინვენტარი (RETRO-ს input `B-R192-PLANNING-GAP`); HEAD `caa09af` უცვლელია, gate 192 გამოტოვებულია. **შემდეგი: Round 193 (D-29z158) — STORE-2a ხელახლა**, იგივე 26 token და მუქი ტექსტი 9-ვე ადგილას (S1–S9; R76 — keep-list-ის CONTINUE მხოლოდ ტექსტის ფერს იცვლის); რეგრესია — 2026-10-27-ზე ან შემდეგ დაგეგმვისას (მოსალოდნელია Round 194) (`c-round-192.md`, `b-round-192.md`).');
const i=lines.findIndex(l=>l.startsWith('| STORE-REDESIGN |'));if(i<0)throw new Error('row');
lines[i]=lines[i].replace('— **მუშავდება** (Round 192)','— **მუშავდება** (Round 192 შეჩერდა K0.4-ზე, ცვლილების გარეშე → Round 193, D-29z158; + PurchaseHeader, LeadMagnet CONTINUE, ConfirmDialog, ChatButton, ForgetPassword icon)').replace('`current-task.md` (round 192)','`c-round-192.md`; `current-task.md` (round 193)');
if(!lines[i].includes('Round 193'))throw new Error('row not updated');
fs.writeFileSync(P,lines.join('\n'));console.log('ok');
