// node montage.cjs out.png scale a.png b.png ... — horizontal montage with nearest-neighbour upscale (uses png.cjs decode + zlib encode)
const { decode } = require('./png.cjs'); const fs = require('fs'); const zlib = require('zlib');
const [out, sc, ...files] = process.argv.slice(2); const S = +sc; const imgs = files.map((f) => decode(fs.readFileSync(f)));
const W = imgs.reduce((a, i) => a + i.w * S + 8, 0); const H = Math.max(...imgs.map((i) => i.h * S));
const buf = Buffer.alloc((W * 3 + 1) * H, 40); let ox = 0;
for (let y = 0; y < H; y++) buf[y * (W * 3 + 1)] = 0;
for (const im of imgs) { for (let y = 0; y < im.h * S; y++) for (let x = 0; x < im.w * S; x++) { const c = im.px(Math.floor(x / S), Math.floor(y / S)); const i = y * (W * 3 + 1) + 1 + (ox + x) * 3; buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; } ox += im.w * S + 8; }
const crc = (b) => { let c, t = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } let r = 0xffffffff; for (const x of b) r = t[(r ^ x) & 255] ^ (r >>> 8); return (r ^ 0xffffffff) >>> 0; };
const chunk = (ty, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(ty), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 2;
fs.writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(buf)), chunk('IEND', Buffer.alloc(0))]));
