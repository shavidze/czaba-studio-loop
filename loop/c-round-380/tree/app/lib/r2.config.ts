/**
 * Cloudflare R2 URL Configuration
 *
 * All R2 assets go through our Cloudflare Worker proxy for:
 * - Path-based access control
 * - Token validation for protected content
 * - CORS headers
 *
 * URL Structure:
 * - /preview/{handle}/{file}  → Public (no token)
 * - /studio/{handle}/{file}   → Protected (token required)
 * - /download/{handle}/{file} → Protected (token required)
 */

// Cloudflare Worker proxy URL (from .env - works on both client and server)
const getWorkerUrl = () => {
  // Server-side (Remix loader)
  if (typeof process !== 'undefined' && process.env?.VITE_R2_WORKER_URL) {
    return process.env.VITE_R2_WORKER_URL;
  }
  // Client-side (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_R2_WORKER_URL) {
    return import.meta.env.VITE_R2_WORKER_URL;
  }
  // Fallback
  return 'https://czaba-r2-proxy.sabashavidze.workers.dev';
};

export const R2_WORKER_URL = getWorkerUrl();

// Legacy direct R2 URL (for detection and transformation)
export const R2_DIRECT_URL = 'https://pub-7b0efa7da5324b45a8eb64027c6d08ac.r2.dev';

/**
 * Get public preview audio URL
 * No token required - these are public samples
 */
export function getPreviewUrl(productHandle: string, fileName: string = 'preview.mp3'): string {
  return `${R2_WORKER_URL}/preview/${productHandle}/${encodeURIComponent(fileName)}`;
}

/**
 * Get studio stem URL (requires token on server)
 * For client-side, token should be passed as query param
 */
export function getStudioUrl(productHandle: string, fileName: string, token?: string): string {
  const baseUrl = `${R2_WORKER_URL}/studio/${productHandle}/${encodeURIComponent(fileName)}`;
  return token ? `${baseUrl}?token=${token}` : baseUrl;
}

/**
 * Get download URL (requires token on server)
 * For client-side, token should be passed as query param
 */
export function getDownloadUrl(productHandle: string, fileName: string, token?: string): string {
  const baseUrl = `${R2_WORKER_URL}/download/${productHandle}/${encodeURIComponent(fileName)}`;
  return token ? `${baseUrl}?token=${token}` : baseUrl;
}

/**
 * Standard file names used in R2
 */
export const R2_FILES = {
  PREVIEW_AUDIO: 'preview.mp3',
  DOWNLOAD_STANDARD: 'standard.zip',
  DOWNLOAD_PREMIUM: 'premium.zip',
  LICENSE_PDF: 'license.pdf',
} as const;

export function normalizePreviewUrl(value?: string): string {
  if (!value) return '';
  try {
    const url = new URL(value);
    if (url.origin !== new URL(R2_WORKER_URL).origin) return value;
    const match = url.pathname.match(/^\/([^/]+)\/Preview\/([^/]+)$/);
    if (match) url.pathname = `/preview/${match[1]}/${match[2]}`;
    return url.toString();
  } catch {
    return value;
  }
}
