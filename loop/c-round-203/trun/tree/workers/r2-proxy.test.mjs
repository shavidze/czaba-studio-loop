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
}
