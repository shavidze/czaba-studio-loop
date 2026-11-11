import type { LoaderFunctionArgs } from '@remix-run/node';

const ALLOWED_AUDIO_HOSTS = [
  'czaba-r2-proxy.sabashavidze.workers.dev',
  'pub-7b0efa7da5324b45a8eb64027c6d08ac.r2.dev',
];

function isAllowedAudioUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
    return ALLOWED_AUDIO_HOSTS.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`),
    );
  } catch {
    return false;
  }
}

/**
 * Audio Proxy Route
 * Proxies allowed audio URLs to avoid CORS issues during development
 * Usage: /api/proxy/audio?url=https://czaba-r2-proxy.sabashavidze.workers.dev/preview/...
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const audioUrl = url.searchParams.get('url');

  if (!audioUrl) {
    return new Response('Missing url parameter', { status: 400 });
  }

  if (!isAllowedAudioUrl(audioUrl)) {
    return new Response('URL not allowed. Only approved audio domains are permitted.', {
      status: 403,
    });
  }

  try {
    const response = await fetch(audioUrl);

    if (!response.ok) {
      return new Response(`Failed to fetch audio: ${response.statusText}`, {
        status: response.status,
      });
    }

    const buffer = await response.arrayBuffer();

    // Return with CORS headers
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'audio/mpeg',
        'Content-Length': buffer.byteLength.toString(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year in dev
      },
    });
  } catch {
    return new Response('Failed to proxy audio', { status: 500 });
  }
}

// Handle OPTIONS preflight requests
export async function options() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
