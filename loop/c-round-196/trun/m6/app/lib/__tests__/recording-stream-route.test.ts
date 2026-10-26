import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loader as recordingStreamLoader } from '../../routes/api.recording-stream';

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('R2_TOKEN_SECRET', 'route-test-secret');
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});

function backendGrants(data: { recordingId: number; productHandle: string; fileName: string }) {
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

function args(path: string, authorization = 'Bearer verified-token') {
  return {
    request: new Request(`https://store.example${path}`, {
      headers: authorization ? { Authorization: authorization } : {},
    }),
    params: {},
    context: {},
  };
}

function decodeToken(streamUrl: string) {
  const token = new URL(streamUrl).searchParams.get('token') || '';
  return JSON.parse(Buffer.from(token, 'base64').toString());
}

describe('recording stream authorization', () => {
  it.each([
    '/api/recording-stream?product=abc&recording=1',
    '/api/recording-stream?product=1&recording=0',
    '/api/recording-stream?product=1',
    '/api/recording-stream?product=-1&recording=2',
  ])('rejects malformed request %s before asking the backend', async (path) => {
    expect((await recordingStreamLoader(args(path))).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('requires a signed-in user', async () => {
    const response = await recordingStreamLoader(
      args('/api/recording-stream?product=1&recording=2', ''),
    );
    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    [401, 401],
    [403, 403],
    [404, 404],
    [500, 502],
  ])('maps backend status %i to %i without issuing a token', async (backendStatus, expected) => {
    fetchMock.mockResolvedValue(new Response(null, { status: backendStatus }));
    const response = await recordingStreamLoader(
      args('/api/recording-stream?product=1&recording=2'),
    );
    expect(response.status).toBe(expected);
    const body = await response.json();
    expect(body).not.toHaveProperty('streamUrl');
  });

  it('signs only the recording authorized by the backend for fifteen minutes', async () => {
    backendGrants({ recordingId: 2, productHandle: 'mall', fileName: '05_Parking.m4a' });
    const start = Date.now();
    const response = await recordingStreamLoader(
      args('/api/recording-stream?product=1&recording=2'),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    const data = await response.json();
    if (!('streamUrl' in data)) throw new Error('Expected a stream URL');
    expect(new URL(data.streamUrl).pathname).toBe('/recordings/mall/05_Parking.m4a');
    const payload = decodeToken(data.streamUrl);
    expect(payload.purpose).toBe('recording');
    expect(payload.productHandle).toBe('mall');
    expect(payload.resourceKeys).toEqual(['mall/Recordings/05_Parking.m4a']);
    expect(payload.expiresAt).toBeLessThanOrEqual(Date.now() + 15 * 60 * 1000);
    expect(payload.expiresAt).toBeGreaterThanOrEqual(start + 15 * 60 * 1000);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5199/api/products/1/recordings/2/stream-access',
      {
        headers: { Authorization: 'Bearer verified-token' },
        signal: expect.any(AbortSignal),
      },
    );
  });

  it('refuses a backend answer for a different recording', async () => {
    backendGrants({ recordingId: 3, productHandle: 'mall', fileName: '05_Parking.m4a' });
    expect(
      (await recordingStreamLoader(args('/api/recording-stream?product=1&recording=2'))).status,
    ).toBe(502);
  });

  it.each([
    '../Downloads/premium.zip',
    'nested/file.m4a',
    '',
  ])('never signs an unsafe file name %s', async (fileName) => {
    backendGrants({ recordingId: 2, productHandle: 'mall', fileName });
    const response = await recordingStreamLoader(
      args('/api/recording-stream?product=1&recording=2'),
    );
    expect(response.status).toBe(500);
    expect(await response.json()).not.toHaveProperty('streamUrl');
  });
});
