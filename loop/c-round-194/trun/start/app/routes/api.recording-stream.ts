import { createHash } from 'node:crypto';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { generateR2Token, RECORDING_TOKEN_EXPIRY_MS } from '~/lib/r2-tokens.server';

const API_BASE_URL = process.env.API_URL || 'http://localhost:5199';
const R2_WORKER_URL =
  process.env.VITE_R2_WORKER_URL || 'https://czaba-r2-proxy.sabashavidze.workers.dev';

interface RecordingStreamAccess {
  recordingId: number;
  productHandle: string;
  fileName: string;
}

const RECORDING_DENIAL_MESSAGES: Record<number, string> = {
  401: 'Please sign in to listen to this recording.',
  403: 'Your license does not include this recording.',
  404: 'This recording is not available.',
};

function parseRecordingRouteId(value: string | null): number | null {
  if (!value || !/^\d{1,9}$/.test(value)) return null;
  const id = Number(value);
  return id > 0 ? id : null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const productId = parseRecordingRouteId(url.searchParams.get('product'));
  const recordingId = parseRecordingRouteId(url.searchParams.get('recording'));
  if (!productId || !recordingId) {
    return json(
      { error: 'Invalid product or recording' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ') || authHeader.length <= 7) {
    return json(
      { error: RECORDING_DENIAL_MESSAGES[401] },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/products/${productId}/recordings/${recordingId}/stream-access`,
      { headers: { Authorization: authHeader }, signal: AbortSignal.timeout(10000) },
    );
    if (!response.ok) {
      const status = RECORDING_DENIAL_MESSAGES[response.status] ? response.status : 502;
      return json(
        { error: RECORDING_DENIAL_MESSAGES[status] || 'Unable to verify access right now.' },
        { status, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    const result: { success: boolean; data?: RecordingStreamAccess } = await response.json();
    const access = result.success ? result.data : undefined;
    if (!access || access.recordingId !== recordingId) {
      return json(
        { error: 'Unable to verify access right now.' },
        { status: 502, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    const userId = createHash('sha256').update(authHeader).digest('hex');
    const token = generateR2Token(access.productHandle, userId, 'recording', [access.fileName]);
    const streamUrl = `${R2_WORKER_URL}/recordings/${access.productHandle}/${encodeURIComponent(access.fileName)}?token=${encodeURIComponent(token)}`;
    return json(
      { streamUrl, expiresAt: Date.now() + RECORDING_TOKEN_EXPIRY_MS },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return json(
      { error: 'Unable to prepare this recording.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
