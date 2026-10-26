const B='http://127.0.0.1:5199';
const out=[];let fail=0;
const ok=(c,m)=>{out.push((c?'PASS ':'FAIL ')+m);if(!c)fail++;};
const j=async(p,o)=>{const r=await fetch(B+p,o);const t=await r.text();return {s:r.status,b:t?JSON.parse(t):null,h:r.headers};};
const all=(await j('/api/products?pageSize=100')).b;
ok(all.success===true&&Object.keys(all).sort().join()==='data,success','envelope');
ok(Object.keys(all.data).sort().join()==='items,pageNumber,pageSize,totalCount','paged 4 keys');
const it=all.data.items;
ok(it.length===8&&all.data.totalCount===8,'8 products');
const cnt=c=>it.filter(p=>p.category===c).length;
ok(cnt('Track')===5&&cnt('SFX')===2&&cnt('Loop')===1,'5/2/1');
ok(it.filter(p=>!p.isActive).length===1&&it.find(p=>!p.isActive).category==='SFX','1 inactive SFX');
ok(it.some(p=>p.handle==='middle-east'),'middle-east');
const withV=it.filter(p=>p.variants?.some(v=>v.name==='Premium'&&v.audioMetadata?.includesStems));
ok(withV.length>=2,'>=2 tracks with premium stems variants: '+withV.map(p=>p.handle));
ok(it.some(p=>p.isNew)&&it.some(p=>p.isPremium),'isNew & isPremium');
ok(it.every(p=>p.audioPreviewUrl==='/middle-east.mp3'||p.audioPreviewUrl==='/videos/hero/hero-music.mp3'),'preview urls');
ok(it.every(p=>/^\/images\/packs\/(\d\.(png|jpg)|cover\.jpg)$/.test(p.imageUrl)),'image urls');
ok(new Set(it.map(p=>p.createdAt)).size===8,'distinct createdAt');
ok(!JSON.stringify(all).match(/https?:/),'no remote url');
ok(it.every(p=>p.vendor==='CZABA'),'vendor');
const def=(await j('/api/products')).b.data; ok(def.pageSize===20&&def.pageNumber===1,'defaults');
const asc=def.items.map(p=>p.createdAt); ok(asc.join()===[...asc].sort().join(),'default asc');
const d=(await j('/api/products?sortDesc=true')).b.data.items.map(p=>p.createdAt); ok(d.join()===[...d].sort().reverse().join(),'desc');
const cap=(await j('/api/products?pageSize=500')).b.data; ok(cap.pageSize===100,'cap 100');
const sfx=(await j('/api/products?category=sfx')).b.data; ok(sfx.totalCount===2,'category ci');
const p2=(await j('/api/products?category=SFX&pageSize=1&page=2')).b.data; ok(p2.items.length===1&&p2.totalCount===2&&p2.pageNumber===2,'paging');
const s=(await j('/api/products?search=PIANO')).b.data; ok(s.totalCount===1&&s.items[0].handle==='harbour-lights','search desc ci');
const s2=(await j('/api/products?search=oud')).b.data; ok(s2.totalCount===1,'search tags');
const g=(await j('/api/products?genre=electronic')).b.data; ok(g.totalCount===2,'genre');
ok((await j('/api/products?isNew=true')).b.data.totalCount===2,'isNew');
ok((await j('/api/products?isPremium=true')).b.data.totalCount===1,'isPremium');
const h=await j('/api/products/handle/middle-east'); ok(h.s===200&&h.b.success&&h.b.data.variants.length===2,'handle');
const hn=await j('/api/products/handle/nope'); ok(hn.s===404&&JSON.stringify(hn.b)==='{"success":false,"message":"Product not found"}','handle 404 body');
const id=await j('/api/products/3'); ok(id.s===200&&id.b.data.id===3,'by id');
const c=await j('/api/cart'); ok(c.s===200&&JSON.stringify(c.b.data)==='{"id":null,"items":[],"itemCount":0,"subtotal":0,"discountAmount":0,"giftCardAmount":0,"total":0}','empty cart');
for (const [m,p] of [['POST','/api/cart/items'],['PUT','/api/cart/items/1'],['DELETE','/api/cart/items/1'],['POST','/api/cart/coupon'],['POST','/api/cart/gift-card'],['POST','/api/cart/checkout']]){const r=await j(p,{method:m});ok(r.s===501&&r.b.message==='Cart changes are not available in the CZABA mock API.'&&r.b.success===false,`${m} ${p} 501`);}
for (const p of ['/api/auth/login','/api/auth/register','/api/auth/social','/api/auth/refresh','/api/auth/forgot-password','/api/auth/reset-password']){const r=await j(p,{method:'POST',headers:{Authorization:'Bearer fake'}});ok(r.s===401&&r.b.message==='Sign-in is not available in the CZABA mock API.'&&r.b.success===false,`${p} 401`);}
{const r=await j('/api/auth/profile',{headers:{Authorization:'Bearer fake'}});ok(r.s===401&&r.b.success===false,'profile 401');}
for (const p of ['/api/downloads','/api/downloads/5','/api/downloads/5/file','/api/orders','/api/orders/1','/api/payments/x','/api/sfx-library','/api/products/1/recordings','/api/products/x/recordings/a','/api/gift-cards/redeem','/api/sfx-scenes','/api/chat/history']) for (const m of ['GET','POST']) {const r=await j(p,{method:m,headers:{Authorization:'Bearer fake',Origin:'http://127.0.0.1:5173'}});ok(r.s===401&&r.b.success===false&&r.b.message==='Please sign in to continue.'&&!r.h.get('set-cookie'),`${m} ${p} 401`);}
const hl=await j('/__mock/health'); ok(hl.s===200&&hl.b.ok===true&&hl.b.products===8&&hl.b.port===5199&&!('success' in hl.b),'health');
for (const p of ['/hubs/chat/negotiate','/nope','/api','/api/products/handle/a/b']){const r=await j(p);ok(r.s===404&&JSON.stringify(r.b)==='{"success":false,"message":"Not found"}',`404 ${p}`);}
console.log(out.join('\n'));console.log(fail?`FAILED ${fail}`:`ALL ${out.length} PASS`);process.exit(fail?1:0);
