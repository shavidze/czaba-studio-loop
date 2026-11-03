# B round 309 -> 310: apply each mutant to BOTH sketch copies (except MU-ONE-COPY), run node --test, record red rows.
import subprocess, shutil, sys, re, pathlib
S = pathlib.Path(sys.argv[1])
OUT = pathlib.Path(sys.argv[2])
base = {p: (S / p).read_text() for p in ['workers/r2-proxy.js', 'cloudflare/r2-worker.js']}
M = {
 'MU-HEAD-FIRST': ("  if (isHead) {\n    object = await env.R2_BUCKET.head(r2Key);\n  } else {", "  if (isHead || !(await env.R2_BUCKET.head(r2Key)) || true) {\n    object = isHead ? await env.R2_BUCKET.head(r2Key) : undefined;\n  }\n  if (!isHead) {"),
 'MU-416-PUBLIC': ("  headers.set('Cache-Control', 'no-store');\n", ""),
 'MU-304-NO-RELEASE': ("    await releaseBody(object);\n    return new Response(null, { status: 304, headers });", "    return new Response(null, { status: 304, headers });"),
 'MU-NO-CLAMP': ("Math.min(spec.end, size - 1)", "spec.end"),
 'MU-IFRANGE-NO-REFETCH': ("    object = await env.R2_BUCKET.get(r2Key);\n    if (!object) return null;\n    if (object.httpEtag)", "    if (!object) return null;\n    if (object.httpEtag)"),
 'MU-THROW-UNHANDLED': ("      if (!wanted) throw error;\n", "      throw error;\n"),
 'MU-CL-FROM-REQUEST': ("    headers.set('Content-Length', range.length.toString());", "    headers.set('Content-Length', String(spec.end === null || spec.end === undefined ? range.length : spec.end - spec.start + 1));"),
 'MU-ONE-COPY': None,
}
results = []
for name, sub in M.items():
    for p, txt in base.items():
        if sub is None:
            new = txt if p.startswith('workers') else re.sub(r"(?s)const PUBLIC_EXPOSE_HEADERS.*", lambda m: open(sys.argv[3]).read(), txt)
        else:
            assert sub[0] in txt, (name, p)
            new = txt.replace(sub[0], sub[1], 1)
        (S / p).write_text(new)
    r = subprocess.run(['node', '--test', 'workers/r2-proxy.test.mjs'], cwd=S, capture_output=True, text=True)
    red = sorted(re.sub(r'^not ok \d+ - ', '', l) for l in r.stdout.splitlines() if l.startswith('not ok'))
    results.append(f"{name} -> {len(red)} red: {red}")
    (OUT / f"{name}.log").write_text(r.stdout)
for p, txt in base.items():
    (S / p).write_text(txt)
r = subprocess.run(['node', '--test', 'workers/r2-proxy.test.mjs'], cwd=S, capture_output=True, text=True)
results.append('restored: ' + ' '.join(l for l in r.stdout.splitlines() if l.startswith('# pass') or l.startswith('# fail')))
(OUT / 'sketch-mutants.txt').write_text('\n'.join(results) + '\n')
print('\n'.join(results))
