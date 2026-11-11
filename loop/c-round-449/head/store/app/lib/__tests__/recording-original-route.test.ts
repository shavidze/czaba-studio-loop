import { createHash, createHmac } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loader } from '../../routes/api.recording-original';

const fetchMock = vi.fn<typeof fetch>();
const metadata = {
  recordingId: 2,
  productHandle: 'shopping-mall-ambience',
  fileName: 'premium-02_Construction.wav',
};
beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('R2_TOKEN_SECRET', 'original-test-secret');
  vi.stubEnv('VITE_R2_WORKER_URL', 'https://audio.example');
  vi.stubEnv('API_URL', 'https://api.example');
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});
const args = (authorization = 'Bearer owner-token', query = 'product=1&recording=2') => ({
  request: new Request(`https://store.example/api/recording-original?${query}`, {
    headers: authorization ? { Authorization: authorization } : {},
  }),
  params: {},
  context: {},
});

const expectNoToken = (response: Response, status: number) => {
  expect(response.status).toBe(status);
  expect(response.headers.get('Location')).toBeNull();
  expect(response.headers.get('Cache-Control')).toBe('no-store');
};

describe('Original recording delivery', () => {
  it.each([
    '',
    'Bearer ',
    'Bearer',
    'Basic owner-token',
  ])('rejects missing or invalid bearer authorization %s before contacting the backend', async (authorization) => {
    expectNoToken(await loader(args(authorization)), 401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([
    'product=1&recording=../secret',
    'product=0&recording=2',
    'product=-1&recording=2',
    'product=1&recording=0',
    'product=1&recording=1000000000',
    'product=1',
    'recording=2',
  ])('rejects invalid identifiers %s before contacting the backend', async (query) => {
    expectNoToken(await loader(args('Bearer owner-token', query)), 400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([401, 403, 404, 500, 429])('issues no token after backend denial %s', async (status) => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status }));
    expectNoToken(await loader(args()), [401, 403, 404].includes(status) ? status : 502);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('redirects authorized originals directly to an exact-key five-minute Worker token', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ success: true, data: metadata }));
    const start = Date.now();
    const response = await loader(args());
    expect(response.status).toBe(302);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer');
    const destination = new URL(response.headers.get('Location') || '');
    expect(destination.origin).toBe('https://audio.example');
    expect(destination.pathname).toBe(
      '/originals/shopping-mall-ambience/premium-02_Construction.wav',
    );
    const payload = JSON.parse(
      Buffer.from(destination.searchParams.get('token') || '', 'base64').toString(),
    );
    expect(payload.version).toBe(2);
    expect(payload.purpose).toBe('original');
    expect(payload.productHandle).toBe(metadata.productHandle);
    expect(payload.resourceKeys).toEqual([
      'shopping-mall-ambience/OriginalRecordings/premium-02_Construction.wav',
    ]);
    expect(payload.userId).toBe(createHash('sha256').update('Bearer owner-token').digest('hex'));
    expect(payload.expiresAt).toBeGreaterThanOrEqual(start + 300000);
    expect(payload.expiresAt).toBeLessThanOrEqual(Date.now() + 300000);
    const signedFields = JSON.stringify([
      payload.version,
      payload.purpose,
      payload.productHandle,
      payload.userId,
      payload.expiresAt,
      payload.resourceKeys,
    ]);
    expect(payload.signature).toBe(
      createHmac('sha256', 'original-test-secret').update(signedFields).digest('base64'),
    );
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      'https://api.example/api/products/1/recordings/2/original-access',
      expect.objectContaining({ headers: { Authorization: 'Bearer owner-token' } }),
    );
    expect(await response.text()).toBe('');
  });
  it.each([
    null,
    {},
    { success: false, data: metadata },
    { success: true },
    { success: true, data: 'https://storage.example/original.wav' },
    { success: true, data: { ...metadata, recordingId: 3 } },
    { success: true, data: { ...metadata, recordingId: '2' } },
    ...['', '../other', 'mall/other', 'https://other.example', 'Mall'].map((productHandle) => ({
      success: true,
      data: { ...metadata, productHandle },
    })),
    ...[
      '',
      '../original.wav',
      'folder/original.wav',
      'folder\\original.wav',
      'bad\nname.wav',
      'original.mp3',
    ].map((fileName) => ({ success: true, data: { ...metadata, fileName } })),
  ])('issues no token for malformed or mismatched metadata %#', async (body) => {
    fetchMock.mockResolvedValueOnce(Response.json(body));
    expectNoToken(await loader(args()), 502);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('fails closed when token signing is unconfigured', async () => {
    vi.stubEnv('R2_TOKEN_SECRET', '');
    fetchMock.mockResolvedValueOnce(Response.json({ success: true, data: metadata }));
    expectNoToken(await loader(args()), 502);
  });
  it('issues no token for invalid upstream JSON', async () => {
    fetchMock.mockResolvedValueOnce(new Response('invalid JSON'));
    expectNoToken(await loader(args()), 502);
  });
  it('issues no token after an upstream connection failure', async () => {
    fetchMock.mockRejectedValueOnce(new Error('unavailable'));
    expectNoToken(await loader(args()), 502);
  });
});
