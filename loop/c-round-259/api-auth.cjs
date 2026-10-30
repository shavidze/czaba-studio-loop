const { request } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const r = await request.newContext();
  const u = 'http://127.0.0.1:5173/api/studio-token?product=middle-east&file=stem-1.wav';
  const a = await r.get(u, { failOnStatusCode: false });
  const b = await r.get(u, { headers: { Authorization: 'Bearer fake.token.value' }, failOnStatusCode: false });
  const out = { noHeader: { status: a.status(), body: await a.text() }, fakeBearer: { status: b.status(), body: await b.text() } };
  require('fs').writeFileSync(__dirname + '/api-auth.json', JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out));
  await r.dispose();
})();
