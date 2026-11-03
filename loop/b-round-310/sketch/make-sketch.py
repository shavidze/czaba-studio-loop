import sys
base = sys.argv[1]
def sub(text, old, new):
    assert text.count(old) == 1, old
    return text.replace(old, new)
block = open(base + '/head-helper-block.js.txt').read()
block = sub(block, """function r2RangeOf(spec) {
  if (spec.suffix !== undefined) return spec.suffix === 0 ? null : { suffix: spec.suffix };
  return spec.end === null ? { offset: spec.start } : { offset: spec.start, length: spec.end - spec.start + 1 };
}""", """function r2RangeOf(spec) {
  if (spec.suffix !== undefined) {
    if (spec.suffix === 0) return null;
    return Number.isSafeInteger(spec.suffix) ? { suffix: spec.suffix } : { offset: 0 };
  }
  if (spec.end === null) return { offset: spec.start };
  const length = spec.end - spec.start + 1;
  return Number.isSafeInteger(length) ? { offset: spec.start, length } : { offset: spec.start };
}""")
block = sub(block, """      object = await env.R2_BUCKET.get(r2Key);
      if (!object) return null;
      headers.set('Content-Type', contentType);
      headers.set('Accept-Ranges', 'bytes');
      if (object.httpEtag) headers.set('ETag', object.httpEtag);
      else headers.delete('ETag');
      headers.set('Content-Length', object.size.toString());""", """      object = await env.R2_BUCKET.get(r2Key);
      if (!object) return null;
      if (object.httpEtag) headers.set('ETag', object.httpEtag);
      else headers.delete('ETag');
      if (etagMatches(request.headers.get('If-None-Match'), object.httpEtag)) {
        await releaseBody(object);
        return new Response(null, { status: 304, headers });
      }
      headers.set('Content-Type', contentType);
      headers.set('Accept-Ranges', 'bytes');
      headers.set('Content-Length', object.size.toString());""")
block = sub(block, """  headers.set('Content-Type', contentType);
  if (allowRange) headers.set('Accept-Ranges', 'bytes');
  const rangeAllowed = spec !== null && ifRangeHolds(object.httpEtag);
  if (spec && !rangeAllowed && !isHead && wanted) {
    await releaseBody(object);
    object = await env.R2_BUCKET.get(r2Key);
    if (!object) return null;
    if (object.httpEtag) headers.set('ETag', object.httpEtag);
    else headers.delete('ETag');
  }
""", """  const rangeAllowed = spec !== null && ifRangeHolds(object.httpEtag);
  if (spec && !rangeAllowed && !isHead && wanted) {
    await releaseBody(object);
    object = await env.R2_BUCKET.get(r2Key);
    if (!object) return null;
    if (object.httpEtag) headers.set('ETag', object.httpEtag);
    else headers.delete('ETag');
    if (etagMatches(request.headers.get('If-None-Match'), object.httpEtag)) {
      await releaseBody(object);
      return new Response(null, { status: 304, headers });
    }
  }
  headers.set('Content-Type', contentType);
  if (allowRange) headers.set('Accept-Ranges', 'bytes');
""")
open(base + '/helper-block.js.txt', 'w').write(block)
head = open(base + '/head-helper-block.js.txt').read()
for f in ['sketch-r2-proxy.js.txt', 'sketch-r2-worker.js.txt']:
    t = open(base + '/' + f).read()
    assert t.endswith(head)
    open(base + '/' + f, 'w').write(t[: len(t) - len(head)] + block)
print('ok')
