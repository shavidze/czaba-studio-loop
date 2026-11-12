import { createHash } from 'node:crypto';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { generateR2Token, isSafeR2FileName } from '~/lib/r2-tokens.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const product = url.searchParams.get('product');
  const recording = url.searchParams.get('recording');
  const headers = { 'Cache-Control': 'no-store' };
  if (
    !product ||
    !recording ||
    !/^[1-9]\d{0,8}$/.test(product) ||
    !/^[1-9]\d{0,8}$/.test(recording)
  )
    return new Response('Invalid recording', { status: 400, headers });
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ') || authorization.length <= 7)
    return new Response('Sign in required', { status: 401, headers });
  try {
    const access = await fetch(
      `${process.env.API_URL || 'http://localhost:5199'}/api/products/${product}/recordings/${recording}/original-access`,
      {
        headers: { Authorization: authorization },
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!access.ok)
      return new Response('Original recording unavailable for this license', {
        status: [401, 403, 404].includes(access.status) ? access.status : 502,
        headers,
      });
    const result: {
      success: boolean;
      data?: { recordingId: number; productHandle: string; fileName: string };
    } = await access.json();
    const data = result.data;
    if (
      !result.success ||
      !data ||
      data.recordingId !== Number(recording) ||
      typeof data.productHandle !== 'string' ||
      !/^[a-z0-9-]+$/.test(data.productHandle) ||
      typeof data.fileName !== 'string' ||
      !isSafeR2FileName(data.fileName) ||
      !data.fileName.endsWith('.wav')
    )
      return new Response('Original unavailable', { status: 502, headers });
    const userId = createHash('sha256').update(authorization).digest('hex');
    const token = generateR2Token(data.productHandle, userId, 'original', [data.fileName]);
    const worker =
      process.env.VITE_R2_WORKER_URL || 'https://czaba-r2-proxy.sabashavidze.workers.dev';
    return new Response(null, {
      status: 302,
      headers: {
        ...headers,
        'Referrer-Policy': 'no-referrer',
        Location: `${worker}/originals/${data.productHandle}/${encodeURIComponent(data.fileName)}?token=${encodeURIComponent(token)}`,
      },
    });
  } catch {
    return new Response('Unable to load original recording', { status: 502, headers });
  }
}
