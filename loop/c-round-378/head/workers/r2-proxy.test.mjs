import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import proxy from './r2-proxy.js';
import alternate from '../cloudflare/r2-worker.js';

const secret = 'unit-test-secret';
function tokenFor(purpose, files, overrides = {}) {
  const payload = {
    version: 2, purpose, productHandle: 'mall', userId: 'buyer',
    expiresAt: Date.now() + (purpose === 'original' ? 4 : 10) * 60 * 1000,
    resourceKeys: files.map(file => `mall/${{ download: 'Downloads', studio: 'Studio-Assets', recording: 'Recordings', original: 'OriginalRecordings' }[purpose]}/${file}`),
    ...overrides,
  };
  const { version, productHandle, userId, expiresAt, resourceKeys } = payload;
  const data = JSON.stringify([version, purpose, productHandle, userId, expiresAt, resourceKeys]);
  payload.signature = createHmac('sha256', secret).update(data).digest('base64');
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

for (const [name, worker] of [['proxy', proxy], ['alternate', alternate]]) {
  async function request(path, token, options = {}) {
    const reads = [];
    const env = { TOKEN_SECRET: secret, R2_BUCKET: { get: async (key, getOptions) => {
      reads.push(key);
      return getOptions?.range ? { body: 'le', size: 4, range: { offset: 2, length: 2 } } : { body: 'file', size: 4 };
    } }, ...options };
    const headers = options.headers || {};
    const response = await worker.fetch(new Request(`https://r2.example/${path}?token=${encodeURIComponent(token)}`, { headers }), env);
    return { response, reads };
  }
  test(`${name}: exact purchased file succeeds`, async () => {
    const { response, reads } = await request('download/mall/standart.zip', tokenFor('download', ['standart.zip']));
    assert.equal(response.status, 200);
    assert.deepEqual(reads, ['mall/Downloads/standart.zip']);
    assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  });
  for (const path of ['download/mall/premium.zip', 'studio/mall/standart.zip', 'download/other/standart.zip', 'download/mall/folder%2Fstandart.zip']) {
    test(`${name}: denies token reuse at ${path}`, async () => {
      const { response, reads } = await request(path, tokenFor('download', ['standart.zip']));
      assert.equal(response.status, 403);
      assert.equal(reads.length, 0);
    });
  }
  test(`${name}: Studio allows only signed files`, async () => {
    const token = tokenFor('studio', ['Bass Drum.wav', 'Violin.wav']);
    assert.equal((await request('studio/mall/Bass%20Drum.wav', token)).response.status, 200);
    assert.equal((await request('studio/mall/other.wav', token)).response.status, 403);
    assert.equal((await request('download/mall/premium.zip', token)).response.status, 403);
  });
  test(`${name}: supports UTF-8 resource names`, async () => {
    const file = 'ხმა.wav';
    const result = await request(`studio/mall/${encodeURIComponent(file)}`, tokenFor('studio', [file]));
    assert.equal(result.response.status, 200);
    assert.deepEqual(result.reads, [`mall/Studio-Assets/${file}`]);
  });
  for (const overrides of [{ version: 1 }, { expiresAt: Date.now() - 1 }, { expiresAt: 'never' }, { expiresAt: Date.now() + 86400000 }, { resourceKeys: null }]) {
    test(`${name}: rejects malformed scope ${JSON.stringify(overrides)}`, async () => {
      const { response, reads } = await request('download/mall/standart.zip', tokenFor('download', ['standart.zip'], overrides));
      assert.equal(response.status, 401);
      assert.equal(reads.length, 0);
    });
  }
  test(`${name}: rejects tampered resource and missing secret`, async () => {
    const original = tokenFor('download', ['standart.zip']);
    const payload = JSON.parse(Buffer.from(original, 'base64').toString());
    payload.resourceKeys = ['mall/Downloads/premium.zip'];
    const tampered = Buffer.from(JSON.stringify(payload)).toString('base64');
    assert.equal((await request('download/mall/premium.zip', tampered)).response.status, 401);
    assert.equal((await request('download/mall/standart.zip', original, { TOKEN_SECRET: undefined })).response.status, 500);
  });
  test(`${name}: recording token opens only its signed recording`, async () => {
    const token = tokenFor('recording', ['01_Parking.m4a']);
    const ok = await request('recordings/mall/01_Parking.m4a', token);
    assert.equal(ok.response.status, 200);
    assert.deepEqual(ok.reads, ['mall/Recordings/01_Parking.m4a']);
    assert.equal(ok.response.headers.get('Accept-Ranges'), 'bytes');
    assert.equal(ok.response.headers.get('Content-Type'), 'audio/mp4');
    assert.equal(ok.response.headers.get('Cache-Control'), 'private, no-store');
    for (const path of ['recordings/mall/02_Food_Court.m4a', 'recordings/other/01_Parking.m4a', 'studio/mall/01_Parking.m4a', 'download/mall/premium.zip']) {
      const denied = await request(path, token);
      assert.equal(denied.response.status, 403, path);
      assert.equal(denied.reads.length, 0);
    }
  });
  test(`${name}: recording path rejects download and Studio tokens`, async () => {
    assert.equal((await request('recordings/mall/01_Parking.m4a', tokenFor('studio', ['01_Parking.m4a']))).response.status, 403);
    assert.equal((await request('recordings/mall/premium.zip', tokenFor('download', ['premium.zip']))).response.status, 403);
  });
  test(`${name}: recording token lifetime is capped at fifteen minutes`, async () => {
    const token = tokenFor('recording', ['01_Parking.m4a'], { expiresAt: Date.now() + 60 * 60 * 1000 });
    const { response, reads } = await request('recordings/mall/01_Parking.m4a', token);
    assert.equal(response.status, 401);
    assert.equal(reads.length, 0);
  });
  test(`${name}: recording supports byte ranges for seeking`, async () => {
    const token = tokenFor('recording', ['01_Parking.m4a']);
    const { response } = await request('recordings/mall/01_Parking.m4a', token, { headers: { Range: 'bytes=2-3' } });
    assert.equal(response.status, 206);
    assert.equal(response.headers.get('Content-Range'), 'bytes 2-3/4');
    assert.equal(response.headers.get('Content-Length'), '2');
  });
  test(`${name}: downloads ignore Range and keep full responses`, async () => {
    const { response } = await request('download/mall/standart.zip', tokenFor('download', ['standart.zip']), { headers: { Range: 'bytes=2-3' } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Content-Range'), null);
  });
  test(`${name}: original uses exact private scope and byte ranges`, async () => {
    const token = tokenFor('original', ['premium-02.wav']);
    const ok = await request('originals/mall/premium-02.wav', token);
    assert.equal(ok.response.status, 200);
    assert.deepEqual(ok.reads, ['mall/OriginalRecordings/premium-02.wav']);
    assert.equal(ok.response.headers.get('Content-Type'), 'audio/wav');
    assert.equal(ok.response.headers.get('Cache-Control'), 'private, no-store');
    const range = await request('originals/mall/premium-02.wav', token, { headers: { Range: 'bytes=2-3' } });
    assert.equal(range.response.status, 206);
    assert.equal(range.response.headers.get('Content-Length'), '2');
    for (const path of ['originals/mall/other.wav', 'originals/other/premium-02.wav', 'recordings/mall/premium-02.wav', 'download/mall/premium-02.wav', 'originals/mall/folder%2Fpremium-02.wav']) {
      const denied = await request(path, token);
      assert.equal(denied.response.status, 403);
      assert.equal(denied.reads.length, 0);
    }
  });
  test(`${name}: originals reject other purposes, excessive expiry and missing files`, async () => {
    for (const purpose of ['download', 'studio', 'recording']) {
      const denied = await request('originals/mall/premium-02.wav', tokenFor(purpose, ['premium-02.wav']));
      assert.equal(denied.response.status, 403);
      assert.equal(denied.reads.length, 0);
    }
    const excessive = tokenFor('original', ['premium-02.wav'], { expiresAt: Date.now() + 360000 });
    assert.equal((await request('originals/mall/premium-02.wav', excessive)).response.status, 401);
    const missing = await request('originals/mall/premium-02.wav', tokenFor('original', ['premium-02.wav']), { R2_BUCKET: { get: async () => null } });
    assert.equal(missing.response.status, 404);
  });
  const BYTES = new Uint8Array(100).map((_, i) => i);
  const ETAG = '"etag-1"';
  async function publicRequest(path, { method = 'GET', headers = {}, missing = false, outOfRange = 'throw', failGet = false, changedOnSecondRead = false, empty = false, cancelRejects = false } = {}) {
    const DATA = empty ? new Uint8Array(0) : BYTES;
    const reads = [];
    const heads = [];
    const opened = [];
    const env = { TOKEN_SECRET: secret, R2_BUCKET: {
      head: async (key) => {
        heads.push(key);
        return missing ? null : { size: DATA.length, etag: 'etag-1', httpEtag: ETAG };
      },
      get: async (key, options) => {
        reads.push({ key, range: options?.range ?? null, onlyIf: options?.onlyIf ?? null });
        if (failGet) throw new Error('R2 unavailable');
        if (missing) return null;
        const second = changedOnSecondRead && reads.length > 1;
        const etag = second ? 'etag-2' : 'etag-1';
        const range = options?.range;
        let slice = DATA;
        if (range && [range.offset, range.length, range.suffix].some((value) => value !== undefined && !Number.isSafeInteger(value))) throw new TypeError('R2 range value is not a safe integer');
        if (range) {
          const offset = range.suffix !== undefined ? Math.max(0, DATA.length - range.suffix) : range.offset;
          if (offset >= DATA.length && outOfRange === 'throw') throw new Error('R2 invalid range');
          const end = range.length === undefined ? DATA.length : Math.min(DATA.length, offset + range.length);
          slice = DATA.slice(Math.min(offset, DATA.length), end);
        }
        const state = { cancelled: false };
        opened.push(state);
        const body = new ReadableStream({ start(controller) { controller.enqueue(slice); controller.close(); }, cancel() { state.cancelled = true; if (cancelRejects) throw new Error('cancel failed'); } });
        return { body, size: DATA.length, etag, httpEtag: `"${etag}"`, range };
      },
    } };
    const response = await worker.fetch(new Request(`https://r2.example/${path}`, { method, headers }), env);
    const body = response.body ? new Uint8Array(await response.arrayBuffer()) : null;
    return { response, body, reads, heads, opened };
  }
  test(`${name}: PR1 preview 200 carries ETag and exposes headers`, async () => {
    const { response, body } = await publicRequest('preview/mall/a.wav');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('ETag'), ETAG);
    assert.equal(response.headers.get('Cache-Control'), 'public, max-age=86400');
    assert.equal(response.headers.get('Content-Length'), '100');
    assert.equal(body.length, 100);
    assert.equal(response.headers.get('Access-Control-Expose-Headers'), 'ETag, Content-Range, Accept-Ranges, Content-Length');
  });
  test(`${name}: PR2 matching If-None-Match gives 304 from one R2 get with the body released`, async () => {
    for (const extra of [{ Range: 'bytes=0-9' }, {}]) {
      for (const inm of [ETAG, `W/${ETAG}`, `"x", ${ETAG}`, '*']) {
        const { response, body, reads, heads, opened } = await publicRequest('preview/mall/a.wav', { headers: { 'If-None-Match': inm, ...extra } });
        assert.equal(response.status, 304, inm);
        assert.equal(body, null);
        assert.equal(reads.length, 1);
        assert.equal(heads.length, 0);
        assert.deepEqual(opened.map((o) => o.cancelled), [true]);
        assert.equal(response.headers.get('ETag'), ETAG);
        assert.equal(response.headers.get('Cache-Control'), 'public, max-age=86400');
        assert.equal(response.headers.get('Content-Length'), null);
        assert.equal(response.headers.get('Content-Type'), null);
        assert.equal(response.headers.get('Content-Range'), null);
        assert.equal(response.headers.get('Access-Control-Allow-Origin'), '*');
      }
    }
    assert.equal((await publicRequest('preview/mall/a.wav', { headers: { 'If-None-Match': '"other"' } })).response.status, 200);
  });
  test(`${name}: PR3 single range gives 206 with Content-Range`, async () => {
    const cases = [['bytes=10-19', 'bytes 10-19/100', 10, 10], ['bytes=90-', 'bytes 90-99/100', 90, 10], ['bytes=-5', 'bytes 95-99/100', 95, 5], ['bytes=95-500', 'bytes 95-99/100', 95, 5]];
    for (const [range, contentRange, first, length] of cases) {
      const { response, body, reads, heads } = await publicRequest('preview/mall/a.wav', { headers: { Range: range } });
      assert.equal(reads.length, 1);
      assert.equal(heads.length, 0);
      assert.equal(response.status, 206, range);
      assert.equal(response.headers.get('Content-Range'), contentRange);
      assert.equal(response.headers.get('Content-Length'), String(length));
      assert.equal(body.length, length);
      assert.equal(body[0], first);
    }
  });
  test(`${name}: PR4 unsatisfiable range gives a no-store 416 with no body bytes in both R2 out-of-range modes`, async () => {
    for (const outOfRange of ['throw', 'short']) {
      for (const range of ['bytes=100-', 'bytes=500-600', 'bytes=-0']) {
        const { response, body, reads, heads, opened } = await publicRequest('preview/mall/a.wav', { headers: { Range: range }, outOfRange });
        const label = `${outOfRange} ${range}`;
        assert.equal(response.status, 416, label);
        assert.equal(response.headers.get('Content-Range'), 'bytes */100', label);
        assert.equal(response.headers.get('Cache-Control'), 'no-store', label);
        assert.equal(response.headers.get('Content-Length'), null, label);
        assert.equal(response.headers.get('Content-Type'), null, label);
        assert.equal(response.headers.get('ETag'), ETAG, label);
        assert.equal(body, null, label);
        assert.equal(reads.length, 1, label);
        assert.ok(opened.every((o) => o.cancelled), label);
        const threw = outOfRange === 'throw' && range !== 'bytes=-0';
        assert.equal(heads.length, threw ? 1 : 0, label);
        assert.equal(opened.length, threw ? 0 : 1, label);
      }
    }
  });
  test(`${name}: PR5 invalid or multi range and If-Range mismatch give the full 200`, async () => {
    for (const headers of [{ Range: 'bytes=5-2' }, { Range: 'bytes=0-1,5-6' }, { Range: 'items=0-1' }, { Range: 'bytes=0-9', 'If-Range': '"other"' }, { Range: 'bytes=0-9', 'If-Range': `W/${ETAG}` }]) {
      const { response, body } = await publicRequest('preview/mall/a.wav', { headers });
      assert.equal(response.status, 200, JSON.stringify(headers));
      assert.equal(body.length, 100);
      assert.equal(response.headers.get('Content-Range'), null);
    }
    assert.equal((await publicRequest('preview/mall/a.wav', { headers: { Range: 'bytes=0-9', 'If-Range': ETAG } })).response.status, 206);
  });
  test(`${name}: PR6 HEAD reads no body`, async () => {
    const full = await publicRequest('preview/mall/a.wav', { method: 'HEAD' });
    assert.equal(full.response.status, 200);
    assert.equal(full.response.headers.get('Content-Length'), '100');
    assert.equal(full.reads.length, 0);
    const part = await publicRequest('preview/mall/a.wav', { method: 'HEAD', headers: { Range: 'bytes=0-9' } });
    assert.equal(part.response.status, 206);
    assert.equal(part.response.headers.get('Content-Length'), '10');
    assert.equal(part.reads.length, 0);
  });
  test(`${name}: PR7 missing preview keeps its 404 text`, async () => {
    const { response, body } = await publicRequest('preview/mall/none.wav', { missing: true });
    assert.equal(response.status, 404);
    assert.equal(new TextDecoder().decode(body), 'File Not Found: mall/Preview/none.wav');
  });
  test(`${name}: PR8 studio stays private no-store and ignores If-None-Match`, async () => {
    const token = tokenFor('studio', ['a.wav']);
    const ok = await publicRequest(`studio/mall/a.wav?token=${encodeURIComponent(token)}`, { headers: { 'If-None-Match': ETAG } });
    assert.equal(ok.response.status, 200);
    assert.equal(ok.response.headers.get('Cache-Control'), 'private, no-store');
    assert.equal(ok.response.headers.get('ETag'), null);
    assert.equal(ok.heads.length, 0);
    const bad = await publicRequest('studio/mall/a.wav?token=bad', { headers: { 'If-None-Match': ETAG } });
    assert.equal(bad.response.status, 401);
    assert.equal(bad.reads.length + bad.heads.length, 0);
  });
  test(`${name}: PR10 every public GET makes exactly one R2 get and no head`, async () => {
    const cases = [[{}, null], [{ Range: 'bytes=50-' }, { offset: 50 }], [{ Range: 'bytes=10-19' }, { offset: 10, length: 10 }], [{ Range: 'bytes=-5' }, { suffix: 5 }], [{ Range: 'bytes=0-1,5-6' }, null]];
    for (const [headers, range] of cases) {
      const { response, reads, heads, opened } = await publicRequest('preview/mall/a.wav', { headers });
      assert.ok(response.status === 200 || response.status === 206, JSON.stringify(headers));
      assert.equal(heads.length, 0, JSON.stringify(headers));
      assert.deepEqual(reads.map((r) => r.range), [range], JSON.stringify(headers));
      assert.deepEqual(reads.map((r) => r.onlyIf), [null]);
      assert.deepEqual(opened.map((o) => o.cancelled), [false]);
    }
    const head = await publicRequest('preview/mall/a.wav', { method: 'HEAD', headers: { Range: 'bytes=0-9' } });
    assert.equal(head.heads.length, 1);
    assert.equal(head.reads.length, 0);
  });
  test(`${name}: PR11 short R2 range body length equals Content-Length`, async () => {
    for (const range of ['bytes=95-500', 'bytes=-500', 'bytes=99-']) {
      const { response, body } = await publicRequest('preview/mall/a.wav', { headers: { Range: range }, outOfRange: 'short' });
      assert.equal(response.status, 206, range);
      assert.equal(body.length, Number(response.headers.get('Content-Length')), range);
    }
  });
  test(`${name}: PR12 If-Range mismatch releases the range read and serves the full current object`, async () => {
    const { response, body, reads, heads, opened } = await publicRequest('preview/mall/a.wav', { headers: { Range: 'bytes=0-9', 'If-Range': ETAG }, changedOnSecondRead: false });
    assert.equal(response.status, 206);
    assert.equal(reads.length + heads.length, 1);
    assert.equal(body.length, 10);
    assert.equal(opened.length, 1);
    const stale = await publicRequest('preview/mall/a.wav', { headers: { Range: 'bytes=0-9', 'If-Range': '"old"' }, changedOnSecondRead: true });
    assert.equal(stale.response.status, 200);
    assert.equal(stale.body.length, 100);
    assert.equal(stale.response.headers.get('Content-Range'), null);
    assert.equal(stale.response.headers.get('ETag'), '"etag-2"');
    assert.deepEqual(stale.reads.map((r) => r.range), [{ offset: 0, length: 10 }, null]);
    assert.deepEqual(stale.opened.map((o) => o.cancelled), [true, false]);
    assert.equal(stale.heads.length, 0);
  });
  test(`${name}: PR13 an R2 get failure on a satisfiable range stays a 500`, async () => {
    const { response, body, heads } = await publicRequest('preview/mall/a.wav', { headers: { Range: 'bytes=0-9' }, failGet: true });
    assert.equal(response.status, 500);
    assert.equal(new TextDecoder().decode(body), 'Internal Error');
    assert.equal(heads.length, 1);
    const whole = await publicRequest('preview/mall/a.wav', { failGet: true });
    assert.equal(whole.response.status, 500);
    assert.equal(whole.heads.length, 0);
  });
  test(`${name}: PR14 out-of-range preconditions: If-None-Match wins, a failed If-Range serves the full object`, async () => {
    for (const outOfRange of ['throw', 'short']) {
      const fresh = await publicRequest('preview/mall/a.wav', { headers: { Range: 'bytes=500-', 'If-None-Match': ETAG }, outOfRange });
      assert.equal(fresh.response.status, 304, outOfRange);
      assert.equal(fresh.body, null);
      assert.equal(fresh.response.headers.get('Content-Type'), null);
      assert.equal(fresh.response.headers.get('Content-Range'), null);
      assert.equal(fresh.reads.length, 1);
      assert.equal(fresh.heads.length, outOfRange === 'throw' ? 1 : 0);
      assert.ok(fresh.opened.every((o) => o.cancelled));
      const stale = await publicRequest('preview/mall/a.wav', { headers: { Range: 'bytes=500-', 'If-Range': '"old"' }, outOfRange });
      assert.equal(stale.response.status, 200, outOfRange);
      assert.equal(stale.body.length, 100);
      assert.equal(stale.response.headers.get('Content-Length'), '100');
      assert.equal(stale.response.headers.get('Content-Range'), null);
      assert.equal(stale.response.headers.get('Cache-Control'), 'public, max-age=86400');
      assert.deepEqual(stale.reads.map((r) => r.range), [{ offset: 500 }, null]);
      assert.equal(stale.heads.length, outOfRange === 'throw' ? 1 : 0);
    }
  });
  test(`${name}: PR15 empty object ranges give 416 and a failing body cancel still gives 304`, async () => {
    for (const outOfRange of ['throw', 'short']) {
      for (const range of ['bytes=0-', 'bytes=-5']) {
        const { response, body, opened } = await publicRequest('preview/mall/a.wav', { headers: { Range: range }, outOfRange, empty: true });
        assert.equal(response.status, 416, `${outOfRange} ${range}`);
        assert.equal(response.headers.get('Content-Range'), 'bytes */0');
        assert.equal(response.headers.get('Cache-Control'), 'no-store');
        assert.equal(response.headers.get('ETag'), ETAG);
        assert.equal(body, null);
        assert.ok(opened.every((o) => o.cancelled), `${outOfRange} ${range}`);
      }
    }
    const rejected = await publicRequest('preview/mall/a.wav', { headers: { 'If-None-Match': ETAG }, cancelRejects: true });
    assert.equal(rejected.response.status, 304);
    assert.deepEqual(rejected.opened.map((o) => o.cancelled), [true]);
  });
  test(`${name}: PR16 a length or suffix beyond a safe integer goes to R2 as an open offset and gives the clamped 206; a start beyond the object gives the 416`, async () => {
    const huge = '9'.repeat(400);
    const cases = [[`bytes=0-${huge}`, { offset: 0 }, 'bytes 0-99/100', 0], [`bytes=10-99999999999999999999`, { offset: 10 }, 'bytes 10-99/100', 10], [`bytes=-${huge}`, { offset: 0 }, 'bytes 0-99/100', 0], ['bytes=-99999999999999999999', { offset: 0 }, 'bytes 0-99/100', 0], ['bytes=10-9007199254741000', { offset: 10, length: 9007199254740991 }, 'bytes 10-99/100', 10]];
    for (const outOfRange of ['throw', 'short']) {
      for (const [range, sent, contentRange, first] of cases) {
        const label = `${outOfRange} ${range.slice(0, 32)}`;
        const { response, body, reads, heads } = await publicRequest('preview/mall/a.wav', { headers: { Range: range }, outOfRange });
        assert.equal(response.status, 206, label);
        assert.deepEqual(reads.map((r) => r.range), [sent], label);
        assert.equal(heads.length, 0, label);
        assert.equal(response.headers.get('Content-Range'), contentRange, label);
        assert.equal(response.headers.get('Content-Length'), String(100 - first), label);
        assert.equal(body.length, 100 - first, label);
        assert.equal(body[0], first, label);
      }
      const far = await publicRequest('preview/mall/a.wav', { headers: { Range: `bytes=${huge}-` }, outOfRange });
      assert.equal(far.response.status, 416, outOfRange);
      assert.equal(far.response.headers.get('Content-Range'), 'bytes */100');
      assert.equal(far.response.headers.get('Cache-Control'), 'no-store');
      assert.deepEqual(far.reads.map((r) => r.range), [{ offset: Infinity }], outOfRange);
      assert.equal(far.heads.length, 1, outOfRange);
    }
  });
  test(`${name}: PR17 the If-Range re-read answers If-None-Match and takes its ETag from the second object`, async () => {
    for (const outOfRange of ['throw', 'short']) {
      for (const range of ['bytes=0-9', 'bytes=500-']) {
        const label = `${outOfRange} ${range}`;
        const served = await publicRequest('preview/mall/a.wav', { headers: { Range: range, 'If-Range': '"old"' }, outOfRange, changedOnSecondRead: true });
        assert.equal(served.response.status, 200, label);
        assert.equal(served.response.headers.get('ETag'), '"etag-2"', label);
        assert.equal(served.body.length, 100, label);
        assert.equal(served.reads.length, 2, label);
        const fresh = await publicRequest('preview/mall/a.wav', { headers: { Range: range, 'If-Range': '"old"', 'If-None-Match': '"etag-2"' }, outOfRange, changedOnSecondRead: true });
        assert.equal(fresh.response.status, 304, label);
        assert.equal(fresh.body, null, label);
        assert.equal(fresh.response.headers.get('ETag'), '"etag-2"', label);
        assert.equal(fresh.response.headers.get('Content-Type'), null, label);
        assert.equal(fresh.response.headers.get('Content-Length'), null, label);
        assert.equal(fresh.response.headers.get('Content-Range'), null, label);
        assert.equal(fresh.response.headers.get('Accept-Ranges'), null, label);
        assert.equal(fresh.response.headers.get('Cache-Control'), 'public, max-age=86400', label);
        assert.equal(fresh.reads.length, 2, label);
        assert.ok(fresh.opened.length > 0 && fresh.opened.every((o) => o.cancelled), label);
      }
    }
  });
  test(`${name}: PR18 HEAD answers If-None-Match with 304 from one head`, async () => {
    const fresh = await publicRequest('preview/mall/a.wav', { method: 'HEAD', headers: { 'If-None-Match': ETAG, Range: 'bytes=0-9' } });
    assert.equal(fresh.response.status, 304);
    assert.equal(fresh.response.headers.get('ETag'), ETAG);
    assert.equal(fresh.response.headers.get('Content-Type'), null);
    assert.equal(fresh.heads.length, 1);
    assert.equal(fresh.reads.length, 0);
    assert.equal(fresh.response.headers.get('Content-Length'), null);
  });
  if (name === 'proxy') {
    test(`${name}: PR9 cover image ETag and 304, 404 text kept, no range`, async () => {
      const first = await publicRequest('mall/cover.jpg');
      assert.equal(first.response.status, 200);
      assert.equal(first.response.headers.get('ETag'), ETAG);
      assert.equal(first.response.headers.get('Cache-Control'), 'public, max-age=604800');
      assert.equal(first.heads.length, 0);
      assert.equal(first.reads.length, 1);
      const revalidated = await publicRequest('mall/cover.jpg', { headers: { 'If-None-Match': ETAG } });
      assert.equal(revalidated.response.status, 304);
      assert.deepEqual(revalidated.opened.map((o) => o.cancelled), [true]);
      assert.equal((await publicRequest('mall/cover.jpg', { headers: { Range: 'bytes=0-9' } })).response.status, 200);
      const missing = await publicRequest('mall/cover.jpg', { missing: true });
      assert.equal(missing.response.status, 404);
      assert.equal(new TextDecoder().decode(missing.body), 'Image Not Found');
    });
  }
}
