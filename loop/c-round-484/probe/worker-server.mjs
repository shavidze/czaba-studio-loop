// B round 310 -> 311 probe (copy of b-round-309/probe/worker-server.mjs): adds R2_STRICT=1 (a range value that is not a safe integer throws TypeError, an inference about real R2, not a doc quote) and R2_SWAP=1 (the second get inside one request sees a new object version).
// Previous header: B round 309 -> 310 probe (extends b-round-308/probe/worker-server.mjs): per-request R2 op counts (heads, gets, cancels) and R2_OOB=throw|short.
// Original header: B round 308 -> 309 probe: serve a Cloudflare Worker module through node:http with an in-memory R2 fake.
// Usage: node worker-server.mjs <workerModulePath> <port> <logFile>
// The fake follows the R2 Workers API reference (checked 2026-11-03,
// https://developers.cloudflare.com/r2/api/workers/workers-api-reference/):
// get(key, { onlyIf: Headers, range: Headers }); a failed precondition returns an object with body undefined;
// httpEtag is the quoted etag. An invalid or unsatisfiable range throws (inference, not a doc quote).
import http from 'node:http';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const [workerPath, portArg, logFile] = process.argv.slice(2);
const worker = (await import(pathToFileURL(workerPath).href)).default;

function makeWav(seconds) {
  const rate = 48000;
  const frames = rate * seconds;
  const data = Buffer.alloc(frames * 2);
  for (let i = 0; i < frames; i++) data.writeInt16LE(Math.round(Math.sin((2 * Math.PI * 220 * i) / rate) * 8000), i * 2);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

const wav = makeWav(60);
const wav2 = Buffer.concat([wav.subarray(0, wav.length - 2), Buffer.from([1, 2])]);
const objects = new Map([
  ['mall/Preview/preview.wav', wav],
  ['mall/cover.jpg', Buffer.from('fake-jpeg-bytes-for-probe')],
]);
const etagOf = (buf) => crypto.createHash('md5').update(buf).digest('hex');

function parseRange(value, size) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(value || '');
  if (!m || (m[1] === '' && m[2] === '')) throw new Error('invalid range');
  if (m[1] === '') return { suffix: Number(m[2]) };
  const offset = Number(m[1]);
  if (offset >= size) throw new Error('range not satisfiable');
  if (m[2] === '') return { offset };
  return { offset, length: Math.min(Number(m[2]), size - 1) - offset + 1 };
}

const R2_BUCKET = {
  async head(key) {
    const buf = objects.get(key);
    if (!buf) return null;
    const etag = etagOf(buf);
    return { key, size: buf.length, etag, httpEtag: `"${etag}"`, uploaded: new Date('2026-11-01T00:00:00Z') };
  },
  async get(key, options, version = 1) {
    const buf = version === 2 && key === 'mall/Preview/preview.wav' ? wav2 : objects.get(key);
    if (process.env.R2_STRICT === '1' && options?.range && !(options.range instanceof Headers) && [options.range.offset, options.range.length, options.range.suffix].some((v) => v !== undefined && !Number.isSafeInteger(v))) throw new TypeError('R2 range value is not a safe integer');
    if (!buf) return null;
    const etag = etagOf(buf);
    const meta = { key, size: buf.length, etag, httpEtag: `"${etag}"`, uploaded: new Date('2026-11-01T00:00:00Z') };
    const cond = options?.onlyIf;
    if (cond instanceof Headers) {
      const inm = cond.get('If-None-Match');
      const im = cond.get('If-Match');
      if (inm && inm.split(',').map((s) => s.trim()).some((t) => t === meta.httpEtag || t === '*' || t === `W/${meta.httpEtag}`)) return meta;
      if (im && !im.split(',').map((s) => s.trim()).some((t) => t === meta.httpEtag || t === '*')) return meta;
    }
    let range;
    let slice = buf;
    if (options?.range instanceof Headers) {
      const r = options.range.get('Range');
      if (r) range = parseRange(r, buf.length);
    } else if (options?.range) range = options.range;
    if (range && range.offset !== undefined && range.offset >= buf.length) {
      if (OOB === 'throw') throw new Error('range not satisfiable');
      return { ...meta, range, body: new Blob([]).stream() };
    }
    if (range) {
      const offset = range.suffix !== undefined ? Math.max(0, buf.length - range.suffix) : range.offset ?? 0;
      const length = range.length ?? buf.length - offset;
      slice = buf.subarray(offset, offset + length);
    }
    return { ...meta, range, body: new Blob([slice]).stream() };
  },
};

const OOB = process.env.R2_OOB === 'short' ? 'short' : 'throw';
function countingBucket(ops) {
  return {
    async head(key) { ops.heads += 1; return R2_BUCKET.head(key); },
    async get(key, options) {
      ops.gets += 1;
      ops.getRanges.push(options?.range && !(options.range instanceof Headers) ? options.range : null);
      const object = await R2_BUCKET.get(key, options, process.env.R2_SWAP === '1' && ops.gets > 1 ? 2 : 1);
      if (object && object.body) {
        const source = object.body.getReader();
        object.body = new ReadableStream({
          async pull(controller) { const { done, value } = await source.read(); if (done) controller.close(); else controller.enqueue(value); },
          async cancel(reason) { ops.cancels += 1; await source.cancel(reason); },
        });
      }
      return object;
    },
  };
}
const log = fs.createWriteStream(logFile, { flags: 'a' });

http.createServer(async (req, res) => {
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
  const request = new Request(`http://${req.headers.host}${req.url}`, { method: req.method, headers });
  const ops = { heads: 0, gets: 0, cancels: 0, getRanges: [] };
  const env = { R2_BUCKET: countingBucket(ops), TOKEN_SECRET: 'probe-secret' };
  let response;
  try { response = await worker.fetch(request, env, {}); } catch (e) { response = new Response('adapter error ' + e, { status: 599 }); }
  const out = {};
  response.headers.forEach((v, k) => { out[k] = v; });
  let bytes = 0;
  res.writeHead(response.status, out);
  if (response.body && req.method !== 'HEAD') {
    for await (const chunk of response.body) { bytes += chunk.length; res.write(chunk); }
  }
  res.end();
  log.write(JSON.stringify({ t: Date.now(), method: req.method, url: req.url, range: req.headers.range ?? null, ifNoneMatch: req.headers['if-none-match'] ?? null, ifRange: req.headers['if-range'] ?? null, status: response.status, contentRange: out['content-range'] ?? null, contentLength: out['content-length'] ?? null, etag: out.etag ?? null, cacheControl: out['cache-control'] ?? null, bodyBytes: bytes, r2: { heads: ops.heads, gets: ops.gets, cancels: ops.cancels, getRanges: ops.getRanges }, oob: OOB, strict: process.env.R2_STRICT === '1', swap: process.env.R2_SWAP === '1' }) + '\n');
}).listen(Number(portArg), '127.0.0.1', () => console.log('listening', portArg, 'wav bytes', wav.length));
