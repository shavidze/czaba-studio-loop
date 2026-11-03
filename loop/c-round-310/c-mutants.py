import sys, shutil, subprocess, pathlib
store, scratch, out = map(pathlib.Path, sys.argv[1:4])
files = ['workers/r2-proxy.js', 'cloudflare/r2-worker.js']
muts = {
 'C-MU-THROW-REREAD-KEEPS-HEAD-ETAG': ("      if (object.httpEtag) headers.set('ETag', object.httpEtag);\n      else headers.delete('ETag');\n      headers.set('Content-Length', object.size.toString());", "      headers.set('Content-Length', object.size.toString());"),
 'C-MU-416-KEEPS-CONTENT-TYPE': ("  headers.delete('Content-Type');\n  headers.delete('Content-Length');\n  return new Response(null, { status: 416", "  headers.delete('Content-Length');\n  return new Response(null, { status: 416"),
 'C-MU-416-NO-RELEASE': ("  if (range && range.unsatisfiable) {\n    await releaseBody(object);", "  if (range && range.unsatisfiable) {"),
 'C-MU-HEAD-416-PUBLIC': ("  headers.set('Cache-Control', 'no-store');", "  if (!headers.has('X-Never')) headers.set('Cache-Control', headers.get('Cache-Control'));"),
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
