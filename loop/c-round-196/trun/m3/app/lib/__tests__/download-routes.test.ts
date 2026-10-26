import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loader as downloadLoader } from '../../routes/api.download';
import { loader as studioLoader } from '../../routes/api.studio-token';

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

function owned(licenseType: string, isAvailable = true, category = 'Track') {
  fetchMock.mockResolvedValue(
    new Response(
      JSON.stringify({
        success: true,
        data: {
          products: [{ handle: 'mall', licenseType, isAvailable, category }],
        },
      }),
      { headers: { 'Content-Type': 'application/json' } },
    ),
  );
}

function args(path: string, authorization = 'Bearer verified-token') {
  return {
    request: new Request(`https://store.example${path}`, {
      headers: { Authorization: authorization },
    }),
    params: {},
    context: {},
  };
}

describe('download authorization', () => {
  it('denies Premium archive to a Standard purchaser', async () => {
    owned('Standard');
    expect((await downloadLoader(args('/api/download?product=mall&type=premium'))).status).toBe(
      403,
    );
  });
  it.each(['Premium-ish', '', 'Unknown'])('denies unrecognized entitlement %s', async (license) => {
    owned(license);
    expect((await downloadLoader(args('/api/download?product=mall&type=standard'))).status).toBe(
      403,
    );
  });
  it('denies unavailable historical variants', async () => {
    owned('Premium', false);
    expect((await downloadLoader(args('/api/download?product=mall&type=premium'))).status).toBe(
      403,
    );
  });
  it('issues only the purchased archive key', async () => {
    owned('Standard');
    const response = await downloadLoader(args('/api/download?product=mall&type=standard'));
    expect(response.status).toBe(200);
    const data = await response.json();
    if (!('downloadUrl' in data)) throw new Error('Expected an authorized download URL');
    const token = new URL(data.downloadUrl).searchParams.get('token') || '';
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    expect(payload.resourceKeys).toEqual(['mall/Downloads/standart.zip']);
    expect(payload.purpose).toBe('download');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});

describe('Studio authorization', () => {
  it.each([
    '',
    'Unknown',
    'Premium-ish',
    'Universal',
  ])('denies unsupported Studio entitlement %s', async (license) => {
    owned(license);
    expect((await studioLoader(args('/api/studio-token?product=mall&file=stem.wav'))).status).toBe(
      403,
    );
  });
  it('denies unavailable purchases, other products, and non-music purchases', async () => {
    owned('Standard', false);
    expect((await studioLoader(args('/api/studio-token?product=mall&file=stem.wav'))).status).toBe(
      403,
    );
    owned('Standard');
    expect((await studioLoader(args('/api/studio-token?product=other&file=stem.wav'))).status).toBe(
      403,
    );
    owned('Standard', true, 'Sfx');
    expect((await studioLoader(args('/api/studio-token?product=mall&file=stem.wav'))).status).toBe(
      403,
    );
  });
  it('denies unauthenticated and failed backend verification', async () => {
    expect(
      (await studioLoader(args('/api/studio-token?product=mall&file=stem.wav', ''))).status,
    ).toBe(401);
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    expect((await studioLoader(args('/api/studio-token?product=mall&file=stem.wav'))).status).toBe(
      403,
    );
  });
  it('denies path escape before reading ownership', async () => {
    expect(
      (await studioLoader(args('/api/studio-token?product=mall&file=..%2FDownloads%2Fpremium.zip')))
        .status,
    ).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([
    'Standard',
    'Premium',
  ])('signs exact Studio files for %s purchasers', async (license) => {
    owned(license);
    const response = await studioLoader(
      args('/api/studio-token?product=mall&file=Drums.wav&file=Bass.wav'),
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    if (!('token' in data)) throw new Error('Expected an authorized Studio token');
    const payload = JSON.parse(Buffer.from(data.token, 'base64').toString());
    expect(payload.purpose).toBe('studio');
    expect(payload.resourceKeys).toEqual([
      'mall/Studio-Assets/Drums.wav',
      'mall/Studio-Assets/Bass.wav',
    ]);
    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), {
      headers: { Authorization: 'Bearer verified-token' },
    });
  });
});

describe('Universal SFX authorization', () => {
  it('signs the full quality archive for Universal owners', async () => {
    owned('Universal');
    const response = await downloadLoader(args('/api/download?product=mall&type=universal'));
    expect(response.status).toBe(200);
    const data = await response.json();
    if (!('downloadUrl' in data)) throw new Error('Expected download URL');
    const token = new URL(data.downloadUrl).searchParams.get('token') || '';
    expect(JSON.parse(Buffer.from(token, 'base64').toString()).resourceKeys).toEqual([
      'mall/Downloads/premium.zip',
    ]);
  });
  it.each([
    'Standard',
    'Premium',
    'Universal-ish',
  ])('rejects Universal requests from %s entitlement', async (license) => {
    owned(license);
    expect((await downloadLoader(args('/api/download?product=mall&type=universal'))).status).toBe(
      403,
    );
  });
  it('rejects unavailable Universal ownership', async () => {
    owned('Universal', false);
    expect((await downloadLoader(args('/api/download?product=mall&type=universal'))).status).toBe(
      403,
    );
  });
  it('does not grant musical stem access to Universal owners', async () => {
    owned('Universal');
    expect((await studioLoader(args('/api/studio-token?product=mall&file=stem.wav'))).status).toBe(
      403,
    );
  });
});
