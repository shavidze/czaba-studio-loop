import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateR2Token, getDownloadUrl } from '../r2-tokens.server';

afterEach(() => vi.unstubAllEnvs());

describe('R2 token issuer', () => {
  it('fails closed without a configured secret', () => {
    vi.stubEnv('R2_TOKEN_SECRET', '');
    expect(() => generateR2Token('mall', 'buyer', 'download', ['standart.zip'])).toThrow();
  });
  it('binds the exact key and download purpose for fifteen minutes', () => {
    vi.stubEnv('R2_TOKEN_SECRET', 'test-secret');
    const start = Date.now();
    const token = generateR2Token('mall', 'buyer', 'download', ['standart.zip']);
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    expect(payload.version).toBe(2);
    expect(payload.purpose).toBe('download');
    expect(payload.resourceKeys).toEqual(['mall/Downloads/standart.zip']);
    expect(payload.expiresAt).toBeGreaterThanOrEqual(start + 900000);
    expect(payload.expiresAt).toBeLessThanOrEqual(Date.now() + 900000);
  });
  it('binds recording tokens to the Recordings folder for fifteen minutes', () => {
    vi.stubEnv('R2_TOKEN_SECRET', 'test-secret');
    const start = Date.now();
    const token = generateR2Token('mall', 'buyer', 'recording', ['01_Parking.m4a']);
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    expect(payload.purpose).toBe('recording');
    expect(payload.resourceKeys).toEqual(['mall/Recordings/01_Parking.m4a']);
    expect(payload.expiresAt).toBeGreaterThanOrEqual(start + 900000);
    expect(payload.expiresAt).toBeLessThanOrEqual(Date.now() + 900000);
  });
  it('binds original tokens to one OriginalRecordings key for five minutes', () => {
    vi.stubEnv('R2_TOKEN_SECRET', 'test-secret');
    const start = Date.now();
    const token = generateR2Token('mall', 'buyer', 'original', ['premium-01_Parking.wav']);
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    expect(payload.purpose).toBe('original');
    expect(payload.resourceKeys).toEqual(['mall/OriginalRecordings/premium-01_Parking.wav']);
    expect(payload.expiresAt).toBeGreaterThanOrEqual(start + 300000);
    expect(payload.expiresAt).toBeLessThanOrEqual(Date.now() + 300000);
  });
  it.each([
    '../premium.zip',
    'folder/file.wav',
    'folder\\file.wav',
    '',
    '..',
    'bad\nname',
  ])('rejects unsafe filename %s', (file) => {
    vi.stubEnv('R2_TOKEN_SECRET', 'test-secret');
    expect(() => generateR2Token('mall', 'buyer', 'download', [file])).toThrow();
  });
  it('preserves the complete base64 token through URL parsing', () => {
    vi.stubEnv('R2_TOKEN_SECRET', 'test-secret');
    const url = new URL(getDownloadUrl('mall', 'standart.zip', 'buyer'));
    const payload = JSON.parse(
      Buffer.from(url.searchParams.get('token') || '', 'base64').toString(),
    );
    expect(payload.resourceKeys).toEqual(['mall/Downloads/standart.zip']);
  });
});
