export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type, Range',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    try {
      if (!env.R2_BUCKET) {
        return new Response('Error: R2_BUCKET binding not configured', { status: 500, headers: corsHeaders });
      }

      if (path === '/' || path === '') {
        return new Response('CZABA R2 Proxy. Use /preview/, /studio/, or /download/', { headers: corsHeaders });
      }

      if (path.startsWith('/preview/')) {
        return await handlePreview(request, path, env, corsHeaders);
      }

      if (path.startsWith('/studio/')) {
        return await handleProtected(request, path, 'Studio-Assets', env, corsHeaders);
      }

      if (path.startsWith('/download/')) {
        return await handleProtected(request, path, 'Downloads', env, corsHeaders);
      }

      if (path.startsWith('/originals/')) {
        return await handleProtected(request, path, 'OriginalRecordings', env, corsHeaders);
      }

      if (path.startsWith('/recordings/')) {
        return await handleProtected(request, path, 'Recordings', env, corsHeaders);
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });

    } catch (error) {
      return new Response('Internal Error', { status: 500, headers: corsHeaders });
    }
  }
};

async function handlePreview(request, path, env, corsHeaders) {
  const parts = path.replace('/preview/', '').split('/');
  const productHandle = parts[0];
  const fileName = decodeURIComponent(parts.slice(1).join('/'));
  const r2Key = productHandle + '/Preview/' + fileName;

  const object = await env.R2_BUCKET.get(r2Key);

  if (!object) {
    return new Response('File Not Found: ' + r2Key, { status: 404, headers: corsHeaders });
  }

  const headers = new Headers(corsHeaders);
  headers.set('Content-Type', getContentType(fileName));
  headers.set('Cache-Control', 'public, max-age=86400');
  headers.set('Content-Length', object.size.toString());
  headers.set('Accept-Ranges', 'bytes');

  return new Response(request.method === 'HEAD' ? null : object.body, { headers });
}

async function handleProtected(request, path, folder, env, corsHeaders) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') ||
                (request.headers.get('Authorization') || '').replace('Bearer ', '');

  if (!token) {
    return new Response('Unauthorized - Token required', { status: 401, headers: corsHeaders });
  }

  if (!env.TOKEN_SECRET) {
    return new Response('Error: TOKEN_SECRET not configured', { status: 500, headers: corsHeaders });
  }

  const validation = await validateToken(token, env.TOKEN_SECRET);
  if (!validation.valid) {
    return new Response('Unauthorized - ' + validation.reason, { status: 401, headers: corsHeaders });
  }

  const purpose = { Downloads: 'download', 'Studio-Assets': 'studio', Recordings: 'recording', OriginalRecordings: 'original' }[folder];
  const prefix = { download: '/download/', studio: '/studio/', recording: '/recordings/', original: '/originals/' }[purpose];
  const parts = path.replace(prefix, '').split('/');
  const productHandle = parts[0];
  const fileName = decodeURIComponent(parts.slice(1).join('/'));

  const r2Key = productHandle + '/' + folder + '/' + fileName;
  if (validation.productHandle !== productHandle || validation.purpose !== purpose ||
      !validation.resourceKeys.includes(r2Key) || !isSafeFileName(fileName)) {
    return new Response('Forbidden', { status: 403, headers: corsHeaders });
  }

  const rangeHeader = ['recording', 'original'].includes(purpose) ? request.headers.get('Range') : null;
  const object = await env.R2_BUCKET.get(r2Key, rangeHeader ? { range: request.headers } : undefined);

  if (!object) {
    return new Response('File Not Found: ' + r2Key, { status: 404, headers: corsHeaders });
  }

  const headers = new Headers(corsHeaders);
  headers.set('Content-Type', getContentType(fileName));
  headers.set('Cache-Control', 'private, no-store');
  headers.set('Content-Length', object.size.toString());

  if (['recording', 'original'].includes(purpose)) {
    headers.set('Accept-Ranges', 'bytes');
    if (rangeHeader && object.range) {
      const suffix = object.range.suffix;
      const offset = suffix === undefined ? object.range.offset ?? 0 : Math.max(0, object.size - suffix);
      const length = Math.min(object.range.length ?? object.size - offset, object.size - offset);
      headers.set('Content-Range', 'bytes ' + offset + '-' + (offset + length - 1) + '/' + object.size);
      headers.set('Content-Length', length.toString());
      return new Response(request.method === 'HEAD' ? null : object.body, { status: 206, headers });
    }
  }

  if (folder === 'Downloads') {
    headers.set('Content-Disposition', 'attachment; filename="' + fileName + '"');
  }

  return new Response(request.method === 'HEAD' ? null : object.body, { headers });
}

function isSafeFileName(fileName) {
  return typeof fileName === 'string' && fileName.length > 0 && fileName.length <= 255 &&
    !/[\\/\x00-\x1f\x7f]/.test(fileName) && fileName !== '.' && fileName !== '..';
}

async function validateToken(token, secret) {
  try {
    const { version, purpose, productHandle, userId, expiresAt, resourceKeys, signature } = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(token), character => character.charCodeAt(0))));
    const maxLifetime = purpose === 'studio' ? 2 * 60 * 60 * 1000 : purpose === 'original' ? 5 * 60 * 1000 : 15 * 60 * 1000;
    if (version !== 2 || !['download', 'studio', 'recording', 'original'].includes(purpose) ||
        typeof productHandle !== 'string' || !/^[a-z0-9-]+$/.test(productHandle) ||
        typeof userId !== 'string' || !userId || !Number.isSafeInteger(expiresAt) ||
        expiresAt <= Date.now() || expiresAt > Date.now() + maxLifetime ||
        !Array.isArray(resourceKeys) || resourceKeys.length === 0 || resourceKeys.length > 100 ||
        !resourceKeys.every(key => typeof key === 'string') || typeof signature !== 'string') {
      return { valid: false, reason: 'Invalid token scope or expiry' };
    }
    const data = JSON.stringify([version, purpose, productHandle, userId, expiresAt, resourceKeys]);
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const signatureBytes = Uint8Array.from(atob(signature), character => character.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, signatureBytes, encoder.encode(data));
    return valid ? { valid: true, productHandle, purpose, resourceKeys } : { valid: false, reason: 'Invalid signature' };
  } catch {
    return { valid: false, reason: 'Invalid token' };
  }
}

function getContentType(fileName) {
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  return { mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac', zip: 'application/zip', pdf: 'application/pdf' }[ext] || 'application/octet-stream';
}
