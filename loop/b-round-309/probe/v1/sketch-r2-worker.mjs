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
  const response = await servePublicObject(request, r2Key, env, corsHeaders, 'public, max-age=86400', getContentType(fileName), true);
  return response ?? new Response('File Not Found: ' + r2Key, { status: 404, headers: corsHeaders });
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

const PUBLIC_EXPOSE_HEADERS = 'ETag, Content-Range, Accept-Ranges, Content-Length';

function etagMatches(header, httpEtag) {
  if (!header || !httpEtag) return false;
  const opaque = (tag) => tag.trim().replace(/^W\//, '');
  return header.split(',').some((tag) => tag.trim() === '*' || opaque(tag) === opaque(httpEtag));
}

function parseRangeSpec(header) {
  const match = /^bytes=(\d*)-(\d*)$/.exec((header || '').trim());
  if (!match || (match[1] === '' && match[2] === '')) return null;
  if (match[1] === '') return { suffix: Number(match[2]) };
  const start = Number(match[1]);
  if (match[2] !== '' && Number(match[2]) < start) return null;
  return { start, end: match[2] === '' ? null : Number(match[2]) };
}

function resolveRangeSpec(spec, size) {
  if (size === 0) return { unsatisfiable: true };
  if (spec.suffix !== undefined) {
    if (spec.suffix === 0) return { unsatisfiable: true };
    const length = Math.min(spec.suffix, size);
    return { offset: size - length, length };
  }
  if (spec.start >= size) return { unsatisfiable: true };
  const end = spec.end === null ? size - 1 : Math.min(spec.end, size - 1);
  return { offset: spec.start, length: end - spec.start + 1 };
}

function r2RangeOf(spec) {
  if (spec.suffix !== undefined) return spec.suffix === 0 ? null : { suffix: spec.suffix };
  return spec.end === null ? { offset: spec.start } : { offset: spec.start, length: spec.end - spec.start + 1 };
}

async function releaseBody(object) {
  if (object && object.body && typeof object.body.cancel === 'function') await object.body.cancel();
}

function unsatisfiableResponse(headers, size) {
  headers.set('Cache-Control', 'no-store');
  headers.set('Content-Range', 'bytes */' + size);
  headers.delete('Content-Type');
  headers.delete('Content-Length');
  return new Response(null, { status: 416, headers });
}

async function servePublicObject(request, r2Key, env, corsHeaders, cacheControl, contentType, allowRange) {
  const isHead = request.method === 'HEAD';
  const spec = allowRange ? parseRangeSpec(request.headers.get('Range')) : null;
  const wanted = spec ? r2RangeOf(spec) : null;
  const headers = new Headers(corsHeaders);
  headers.set('Access-Control-Expose-Headers', PUBLIC_EXPOSE_HEADERS);
  headers.set('Cache-Control', cacheControl);
  let object;
  if (isHead) {
    object = await env.R2_BUCKET.head(r2Key);
  } else {
    try {
      object = await env.R2_BUCKET.get(r2Key, wanted ? { range: wanted } : undefined);
    } catch (error) {
      if (!wanted) throw error;
      const meta = await env.R2_BUCKET.head(r2Key);
      if (!meta) return null;
      if (!resolveRangeSpec(spec, meta.size).unsatisfiable) throw error;
      if (meta.httpEtag) headers.set('ETag', meta.httpEtag);
      return unsatisfiableResponse(headers, meta.size);
    }
  }
  if (!object) return null;
  if (object.httpEtag) headers.set('ETag', object.httpEtag);
  if (etagMatches(request.headers.get('If-None-Match'), object.httpEtag)) {
    await releaseBody(object);
    return new Response(null, { status: 304, headers });
  }
  headers.set('Content-Type', contentType);
  if (allowRange) headers.set('Accept-Ranges', 'bytes');
  const ifRange = request.headers.get('If-Range');
  const rangeAllowed = spec !== null && (!ifRange || (object.httpEtag && !ifRange.startsWith('W/') && ifRange.trim() === object.httpEtag));
  if (spec && !rangeAllowed && !isHead && wanted) {
    await releaseBody(object);
    object = await env.R2_BUCKET.get(r2Key);
    if (!object) return null;
    if (object.httpEtag) headers.set('ETag', object.httpEtag);
    else headers.delete('ETag');
  }
  const range = rangeAllowed ? resolveRangeSpec(spec, object.size) : null;
  if (range && range.unsatisfiable) {
    await releaseBody(object);
    return unsatisfiableResponse(headers, object.size);
  }
  if (range) {
    headers.set('Content-Range', 'bytes ' + range.offset + '-' + (range.offset + range.length - 1) + '/' + object.size);
    headers.set('Content-Length', range.length.toString());
    return new Response(isHead ? null : object.body, { status: 206, headers });
  }
  headers.set('Content-Length', object.size.toString());
  return new Response(isHead ? null : object.body, { headers });
}
