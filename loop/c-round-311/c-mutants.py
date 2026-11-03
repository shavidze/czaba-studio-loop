# C311 own mutants (runner copied from c-round-310/c-mutants.py)
import sys, shutil, subprocess, pathlib
store, scratch, out = map(pathlib.Path, sys.argv[1:4])
files = ['workers/r2-proxy.js', 'cloudflare/r2-worker.js']
muts = {
 'C-MU-REREAD-NO-ETAG-DELETE': ("    if (object.httpEtag) headers.set('ETag', object.httpEtag);\n    else headers.delete('ETag');\n    if (etagMatches", "    if (object.httpEtag) headers.set('ETag', object.httpEtag);\n    if (etagMatches"),
 'C-MU-REREAD-304-NO-CORS': ("      await releaseBody(object);\n      return new Response(null, { status: 304, headers });\n    }\n  }\n  headers.set('Content-Type'", "      await releaseBody(object);\n      return new Response(null, { status: 304, headers: new Headers({ ETag: object.httpEtag, 'Cache-Control': headers.get('Cache-Control') }) });\n    }\n  }\n  headers.set('Content-Type'"),
 'C-MU-SAFE-BOUND-1E15': ("return Number.isSafeInteger(length) ? { offset: spec.start, length }", "return length < 1e15 ? { offset: spec.start, length }"),
 'C-MU-UNSAFE-SUFFIX-OFFSET-1': ("Number.isSafeInteger(spec.suffix) ? { suffix: spec.suffix } : { offset: 0 }", "Number.isSafeInteger(spec.suffix) ? { suffix: spec.suffix } : { offset: 1 }"),
 'C-MU-THROW-REREAD-304-KEEPS-CT': ("      if (etagMatches(request.headers.get('If-None-Match'), object.httpEtag)) {\n        await releaseBody(object);\n        return new Response(null, { status: 304, headers });", "      if (etagMatches(request.headers.get('If-None-Match'), object.httpEtag)) {\n        await releaseBody(object);\n        headers.set('Content-Type', contentType);\n        return new Response(null, { status: 304, headers });"),
}
res = []
for name, (a, b) in muts.items():
    shutil.rmtree(scratch, ignore_errors=True)
    for f in files + ['workers/r2-proxy.test.mjs']:
        (scratch / f).parent.mkdir(parents=True, exist_ok=True); shutil.copy(store / f, scratch / f)
    for f in files:
        p = scratch / f; t = p.read_text(); assert t.count(a) == 1, (name, f); p.write_text(t.replace(a, b))
    d = subprocess.run(['diff', '-u', str(store / files[0]), str(scratch / files[0])], capture_output=True, text=True).stdout
    (out / f'{name}.patch.txt').write_text(d)
    r = subprocess.run(['node', '--test', 'workers/r2-proxy.test.mjs'], cwd=scratch, capture_output=True, text=True)
    (out / f'{name}.log').write_text(r.stdout + r.stderr)
    reds = [l.split(' - ', 1)[1] for l in r.stdout.splitlines() if l.startswith('not ok')]
    res.append(f'{name}: {len(reds)} red: {reds}')
shutil.rmtree(scratch, ignore_errors=True)
for f in files + ['workers/r2-proxy.test.mjs']:
    (scratch / f).parent.mkdir(parents=True, exist_ok=True); shutil.copy(store / f, scratch / f)
r = subprocess.run(['node', '--test', 'workers/r2-proxy.test.mjs'], cwd=scratch, capture_output=True, text=True)
res.append('restored: ' + [l for l in r.stdout.splitlines() if l.startswith('# pass') or l.startswith('# fail')].__str__())
(out / 'c-mutants.txt').write_text('\n'.join(res) + '\n'); print('\n'.join(res))
