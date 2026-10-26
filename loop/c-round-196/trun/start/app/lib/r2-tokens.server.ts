import crypto from 'node:crypto';

const R2_WORKER_URL = process.env.R2_WORKER_URL || 'https://r2.czaba.com';
export const DOWNLOAD_TOKEN_EXPIRY_MS = 15 * 60 * 1000;
export const STUDIO_TOKEN_EXPIRY_MS = 2 * 60 * 60 * 1000;
export const RECORDING_TOKEN_EXPIRY_MS = 15 * 60 * 1000;
export const ORIGINAL_TOKEN_EXPIRY_MS = 5 * 60 * 1000;

type R2TokenPurpose = 'download' | 'studio' | 'recording' | 'original';

const R2_PURPOSE_FOLDERS: Record<R2TokenPurpose, string> = {
  download: 'Downloads',
  studio: 'Studio-Assets',
  recording: 'Recordings',
  original: 'OriginalRecordings',
};

const R2_PURPOSE_EXPIRY_MS: Record<R2TokenPurpose, number> = {
  download: DOWNLOAD_TOKEN_EXPIRY_MS,
  studio: STUDIO_TOKEN_EXPIRY_MS,
  recording: RECORDING_TOKEN_EXPIRY_MS,
  original: ORIGINAL_TOKEN_EXPIRY_MS,
};

export function isSafeR2FileName(fileName: string): boolean {
  return (
    fileName.length > 0 &&
    fileName.length <= 255 &&
    !/[\\/]/.test(fileName) &&
    [...fileName].every(
      (character) => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127,
    ) &&
    fileName !== '.' &&
    fileName !== '..'
  );
}

export function generateR2Token(
  productHandle: string,
  userId: string,
  purpose: R2TokenPurpose,
  fileNames: string[],
): string {
  const secret = process.env.R2_TOKEN_SECRET;
  if (!secret) throw new Error('R2_TOKEN_SECRET not configured');
  if (
    !/^[a-z0-9-]+$/.test(productHandle) ||
    !userId ||
    fileNames.length === 0 ||
    fileNames.length > 100 ||
    !fileNames.every(isSafeR2FileName)
  ) {
    throw new Error('Invalid resource scope');
  }
  const version = 2;
  const expiresAt = Date.now() + R2_PURPOSE_EXPIRY_MS[purpose];
  const folder = R2_PURPOSE_FOLDERS[purpose];
  const resourceKeys = [...new Set(fileNames)].map((file) => `${productHandle}/${folder}/${file}`);
  const data = JSON.stringify([version, purpose, productHandle, userId, expiresAt, resourceKeys]);
  const signature = crypto.createHmac('sha256', secret).update(data).digest('base64');
  return Buffer.from(
    JSON.stringify({ version, purpose, productHandle, userId, expiresAt, resourceKeys, signature }),
  ).toString('base64');
}

export function getStudioAssetUrl(productHandle: string, fileName: string, userId: string): string {
  const token = generateR2Token(productHandle, userId, 'studio', [fileName]);
  return `${R2_WORKER_URL}/studio/${productHandle}/${encodeURIComponent(fileName)}?token=${encodeURIComponent(token)}`;
}

export function getDownloadUrl(productHandle: string, fileName: string, userId: string): string {
  const token = generateR2Token(productHandle, userId, 'download', [fileName]);
  return `${R2_WORKER_URL}/download/${productHandle}/${encodeURIComponent(fileName)}?token=${encodeURIComponent(token)}`;
}

export function getPreviewUrl(productHandle: string, fileName: string): string {
  return `${R2_WORKER_URL}/preview/${productHandle}/${encodeURIComponent(fileName)}`;
}

export function getStudioAssetUrls(
  productHandle: string,
  fileNames: string[],
  userId: string,
): Record<string, string> {
  return Object.fromEntries(
    fileNames.map((fileName) => [fileName, getStudioAssetUrl(productHandle, fileName, userId)]),
  );
}
