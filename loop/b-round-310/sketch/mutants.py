# B round 310 -> 311: apply each mutant to BOTH sketch copies (except MU-ONE-COPY), run node --test, record red rows.
# usage: python3 -I mutants.py <scratch with workers/ cloudflare/> <log dir> <head helper block file>
import subprocess, sys, re, pathlib
S = pathlib.Path(sys.argv[1])
OUT = pathlib.Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)
base = {p: (S / p).read_text() for p in ['workers/r2-proxy.js', 'cloudflare/r2-worker.js']}
REREAD = "    object = await env.R2_BUCKET.get(r2Key);\n    if (!object) return null;\n    if (object.httpEtag) headers.set('ETag', object.httpEtag);\n    else headers.delete('ETag');\n"
CATCH_REREAD = "      object = await env.R2_BUCKET.get(r2Key);\n      if (!object) return null;\n      if (object.httpEtag) headers.set('ETag', object.httpEtag);\n      else headers.delete('ETag');\n"
INM4 = "    if (etagMatches(request.headers.get('If-None-Match'), object.httpEtag)) {\n      await releaseBody(object);\n      return new Response(null, { status: 304, headers });\n    }\n"
INM6 = "      if (etagMatches(request.headers.get('If-None-Match'), object.httpEtag)) {\n        await releaseBody(object);\n        return new Response(null, { status: 304, headers });\n      }\n"
M = {
 # carried from round 310 (same intent, contexts updated where the block moved)
 'MU-HEAD-FIRST': ("  if (isHead) {\n    object = await env.R2_BUCKET.head(r2Key);\n  } else {", "  if (isHead || !(await env.R2_BUCKET.head(r2Key)) || true) {\n    object = isHead ? await env.R2_BUCKET.head(r2Key) : undefined;\n  }\n  if (!isHead) {"),
 'MU-416-PUBLIC': ("  headers.set('Cache-Control', 'no-store');\n", ""),
 'MU-304-NO-RELEASE': ("  if (etagMatches(request.headers.get('If-None-Match'), object.httpEtag)) {\n    await releaseBody(object);\n    return new Response(null, { status: 304, headers });\n  }\n  const rangeAllowed", "  if (etagMatches(request.headers.get('If-None-Match'), object.httpEtag)) {\n    return new Response(null, { status: 304, headers });\n  }\n  const rangeAllowed"),
 'MU-NO-CLAMP': ("Math.min(spec.end, size - 1)", "spec.end"),
 'MU-IFRANGE-NO-REFETCH': ("  if (spec && !rangeAllowed && !isHead && wanted) {\n    await releaseBody(object);\n    object = await env.R2_BUCKET.get(r2Key);\n", "  if (spec && !rangeAllowed && !isHead && wanted) {\n"),
 'MU-THROW-UNHANDLED': ("      if (!wanted) throw error;\n", "      throw error;\n"),
 'MU-CL-FROM-REQUEST': ("    headers.set('Content-Length', range.length.toString());", "    headers.set('Content-Length', String(spec.end === null || spec.end === undefined ? range.length : spec.end - spec.start + 1));"),
 'MU-THROW-NO-INM': ("      if (etagMatches(request.headers.get('If-None-Match'), meta.httpEtag)) {\n        return new Response(null, { status: 304, headers });\n      }\n", ""),
 'MU-THROW-NO-IFRANGE': ("      if (ifRangeHolds(meta.httpEtag)) {", "      if (true) {"),
 'MU-REFETCH-STALE-ETAG': (REREAD, "    object = await env.R2_BUCKET.get(r2Key);\n    if (!object) return null;\n"),
 'MU-INM-STRONG': ("  const opaque = (tag) => tag.trim().replace(/^W\\//, '');", "  const opaque = (tag) => tag.trim();"),
 'MU-RELEASE-THROWS': ("  try {\n    await object.body.cancel();\n  } catch {\n    return;\n  }", "  await object.body.cancel();"),
 # new in round 311
 'MU-UNSAFE-LENGTH': ("  return Number.isSafeInteger(length) ? { offset: spec.start, length } : { offset: spec.start };", "  return { offset: spec.start, length };"),
 'MU-UNSAFE-SUFFIX': ("    return Number.isSafeInteger(spec.suffix) ? { suffix: spec.suffix } : { offset: 0 };", "    return { suffix: spec.suffix };"),
 'MU-UNSAFE-SUFFIX-NULL': ("    return Number.isSafeInteger(spec.suffix) ? { suffix: spec.suffix } : { offset: 0 };", "    return Number.isSafeInteger(spec.suffix) ? { suffix: spec.suffix } : null;"),
 'MU-REREAD-NO-INM': (REREAD + INM4, REREAD),
 'MU-REREAD-304-NO-RELEASE': (REREAD + INM4, REREAD + "    if (etagMatches(request.headers.get('If-None-Match'), object.httpEtag)) {\n      return new Response(null, { status: 304, headers });\n    }\n"),
 'MU-THROW-REREAD-NO-INM': (CATCH_REREAD + INM6, CATCH_REREAD),
 'MU-THROW-REREAD-KEEPS-HEAD-ETAG': (CATCH_REREAD, "      object = await env.R2_BUCKET.get(r2Key);\n      if (!object) return null;\n"),
 'MU-REREAD-304-CONTENT-TYPE': ("    else headers.delete('ETag');\n" + INM4 + "  }\n  headers.set('Content-Type', contentType);\n  if (allowRange) headers.set('Accept-Ranges', 'bytes');\n", "    else headers.delete('ETag');\n    headers.set('Content-Type', contentType);\n    headers.set('Accept-Ranges', 'bytes');\n" + INM4 + "  }\n  headers.set('Content-Type', contentType);\n  if (allowRange) headers.set('Accept-Ranges', 'bytes');\n"),
 # added after the advisor check: red-proof for the PR13/PR15/PR18 asserts that pin existing behaviour
 'MU-HEAD-INM-SKIPPED': ("  if (etagMatches(request.headers.get('If-None-Match'), object.httpEtag)) {\n    await releaseBody(object);\n    return new Response(null, { status: 304, headers });\n  }\n  const rangeAllowed", "  if (!isHead && etagMatches(request.headers.get('If-None-Match'), object.httpEtag)) {\n    await releaseBody(object);\n    return new Response(null, { status: 304, headers });\n  }\n  const rangeAllowed"),
 'MU-UNRANGED-THROW-HEAD': ("      if (!wanted) throw error;\n", "      if (!wanted) {\n        await env.R2_BUCKET.head(r2Key);\n        throw error;\n      }\n"),
 'MU-416-NO-ETAG': ("  headers.set('Cache-Control', 'no-store');\n", "  headers.set('Cache-Control', 'no-store');\n  headers.delete('ETag');\n"),
 'MU-416-NO-RELEASE': ("  if (range && range.unsatisfiable) {\n    await releaseBody(object);\n", "  if (range && range.unsatisfiable) {\n"),
 'MU-ONE-COPY': None,
}
results = []
for name, sub in M.items():
    for p, txt in base.items():
        if sub is None:
            new = txt if p.startswith('workers') else re.sub(r"(?s)const PUBLIC_EXPOSE_HEADERS.*", lambda m: open(sys.argv[3]).read(), txt)
        else:
            assert txt.count(sub[0]) == 1, (name, p, txt.count(sub[0]))
            new = txt.replace(sub[0], sub[1], 1)
        (S / p).write_text(new)
        if sub is not None:
            (OUT / f"{name}.patch.txt").write_text(f"--- {p}\n-{sub[0]}\n+{sub[1]}\n")
    r = subprocess.run(['node', '--test', 'workers/r2-proxy.test.mjs'], cwd=S, capture_output=True, text=True)
    red = sorted(re.sub(r'^not ok \d+ - ', '', l) for l in r.stdout.splitlines() if l.startswith('not ok'))
    results.append(f"{name} -> {len(red)} red: {red}")
    (OUT / f"{name}.log").write_text(r.stdout)
for p, txt in base.items():
    (S / p).write_text(txt)
r = subprocess.run(['node', '--test', 'workers/r2-proxy.test.mjs'], cwd=S, capture_output=True, text=True)
results.append('restored: ' + ' '.join(l for l in r.stdout.splitlines() if l.startswith('# pass') or l.startswith('# fail')))
(OUT / 'sketch-mutants.txt').write_text('\n'.join(results) + '\n')
print('\n'.join(r.split(' red:')[0] for r in results))
