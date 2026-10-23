// C r109: does a Uint8Array / string / Buffer write reach the stripper as Buffer (Node version check)
const { Transform } = require('node:stream');
const mk = () => new Transform({ transform(c, e, cb) { if (!Buffer.isBuffer(c)) { cb(new TypeError('not buffer')); return; } const o = Buffer.from(c.filter((b) => b !== 0)); cb(null, o.length ? o : undefined); } });
const run = (chunks) => new Promise((res) => { const s = mk(); const out = []; s.on('data', (d) => out.push(d)); s.on('error', (e) => res({ err: String(e) })); s.on('end', () => res({ out: Buffer.concat(out).toString('utf8') })); for (const c of chunks) s.write(c); s.end(); });
(async () => {
  console.log(process.version);
  console.log('u8', await run([new Uint8Array([0x61, 0, 0x62])]));
  console.log('u8view', await run([new Uint8Array(new ArrayBuffer(8), 2, 3).fill(0x63)]));
  console.log('str', await run(['a\u0000b']));
})();
