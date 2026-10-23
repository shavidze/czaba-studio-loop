const http = require('node:http');
const fs = require('node:fs');
const UA = { chrome: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36', bot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' };
const paths = ['/studio-lab', '/', '/products', '/about', '/studio/middle-east'];
const get = (p, ua) => new Promise((res) => { const t0 = Date.now(); let events = 0; http.get({ host: '127.0.0.1', port: 5173, path: p, headers: { 'user-agent': ua } }, (r) => { const c = []; r.on('data', (d) => { events++; c.push(d); }); r.on('end', () => res({ status: r.statusCode, ct: r.headers['content-type'], te: r.headers['transfer-encoding'], events, ms: Date.now() - t0, buf: Buffer.concat(c) })); }).on('error', (e) => res({ error: String(e) })); });
(async () => {
  const out = [];
  for (const p of paths) for (const [k, ua] of Object.entries(UA)) for (const run of [1, 2]) {
    const r = await get(p, ua);
    if (r.error) { out.push({ p, k, run, error: r.error }); continue; }
    const offs = []; for (let i = 0; i < r.buf.length; i++) if (r.buf[i] === 0) offs.push(i);
    const stripped = Buffer.from(r.buf.filter((b) => b !== 0));
    const fffd = (stripped.toString('utf8').match(/�/g) || []).length;
    const name = `body-${p.replace(/\W+/g, '_') || 'root'}-${k}-${run}.html`;
    fs.writeFileSync(name, r.buf);
    out.push({ p, k, run, status: r.status, ct: r.ct, te: r.te, events: r.events, bytes: r.buf.length, nul: offs.length, nulOffsets: offs, fffdAfterStrip: fffd, sha256Stripped: require('node:crypto').createHash('sha256').update(stripped).digest('hex') });
  }
  fs.writeFileSync('ssr-baseline-result.json', JSON.stringify({ head: '32a6b08', utc: new Date().toISOString(), out }, null, 1));
  for (const o of out) console.log(o.p, o.k, o.run, o.status, o.te, o.events, o.bytes, 'NUL', o.nul, 'fffd', o.fffdAfterStrip, (o.sha256Stripped || '').slice(0, 10), o.error || '');
})();
