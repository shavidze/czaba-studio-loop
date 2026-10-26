// node crop.cjs in.png out.png x y w h (css px, DPR2)
const { decode } = require('./png.cjs'); const fs = require('fs'); const zlib = require('zlib');
const [i, o, x, y, w, h] = process.argv.slice(2); const A = decode(fs.readFileSync(i)); const X = +x * 2, Y = +y * 2, Wd = +w * 2, Hd = +h * 2;
const buf = Buffer.alloc((Wd * 3 + 1) * Hd); for (let r = 0; r < Hd; r++) { buf[r * (Wd * 3 + 1)] = 0; for (let c = 0; c < Wd; c++) { const p = A.px(Math.min(A.w - 1, X + c), Math.min(A.h - 1, Y + r)); buf.set(p, r * (Wd * 3 + 1) + 1 + c * 3); } }
const crc = (b) => { let c, t = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } let r = 0xffffffff; for (const v of b) r = t[(r ^ v) & 255] ^ (r >>> 8); return (r ^ 0xffffffff) >>> 0; };
const ch = (ty, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(ty), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
const ih = Buffer.alloc(13); ih.writeUInt32BE(Wd, 0); ih.writeUInt32BE(Hd, 4); ih[8] = 8; ih[9] = 2;
fs.writeFileSync(o, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), ch('IHDR', ih), ch('IDAT', zlib.deflateSync(buf)), ch('IEND', Buffer.alloc(0))]));
