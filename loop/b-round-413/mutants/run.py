"""B round 413->414 worker mutant runner. Usage: S=<scratch with sketch test> OUT=<dir> python3 -I run.py
Applies each mutant to BOTH worker copies (cover-only mutants: proxy only), runs node --test on the sketch
test file and on the HEAD test file (git show HEAD:workers/r2-proxy.test.mjs, copied next to it), restores."""
import os, re, subprocess, json, sys, shutil
S = os.environ['S']; OUT = os.environ['OUT']; os.makedirs(OUT, exist_ok=True)
W = ['workers/r2-proxy.js', 'cloudflare/r2-worker.js']
M = [
 ('MU-414-REREAD-304-NO-CORS', W, "      await releaseBody(object);\n      return new Response(null, { status: 304, headers });\n    }\n  }\n  headers.set('Content-Type', contentType);",
  "      await releaseBody(object);\n      return new Response(null, { status: 304, headers: new Headers({ ETag: object.httpEtag, 'Cache-Control': headers.get('Cache-Control') }) });\n    }\n  }\n  headers.set('Content-Type', contentType);", 'PR17'),
 ('MU-414-CATCH-REREAD-304-NO-CORS', W, "        await releaseBody(object);\n        return new Response(null, { status: 304, headers });\n      }\n      headers.set('Content-Type', contentType);",
  "        await releaseBody(object);\n        return new Response(null, { status: 304, headers: new Headers({ ETag: object.httpEtag, 'Cache-Control': headers.get('Cache-Control') }) });\n      }\n      headers.set('Content-Type', contentType);", 'PR17'),
 ('MU-414-PROTECTED-INM-304', W, "  const rangeHeader = ['recording', 'original'].includes(purpose)",
  "  if (purpose !== 'studio' && request.headers.get('If-None-Match')) return new Response(null, { status: 304, headers: corsHeaders });\n  const rangeHeader = ['recording', 'original'].includes(purpose)", 'PR21'),
 ('MU-414-REREAD-NULL-UNGUARDED', W, "    object = await env.R2_BUCKET.get(r2Key);\n    if (!object) return null;\n    if (object.httpEtag)",
  "    object = await env.R2_BUCKET.get(r2Key);\n    if (object.httpEtag)", 'PR20'),
 ('MU-414-CATCH-REREAD-NULL-UNGUARDED', W, "      object = await env.R2_BUCKET.get(r2Key);\n      if (!object) return null;\n      if (object.httpEtag)",
  "      object = await env.R2_BUCKET.get(r2Key);\n      if (object.httpEtag)", 'PR20'),
 ('MU-414-CATCH-IFRANGE-FIRST-ETAG', W, "      if (ifRangeHolds(meta.httpEtag)) {",
  "      if (ifRangeHolds('\"etag-1\"')) {", 'PR19'),
 ('MU-414-COVER-ACCEPT-RANGES', W[:1], "  if (allowRange) headers.set('Accept-Ranges', 'bytes');",
  "  headers.set('Accept-Ranges', 'bytes');", 'PR9'),
 ('MU-414-SHORT-416-NO-RELEASE', W, "  if (range && range.unsatisfiable) {\n    await releaseBody(object);",
  "  if (range && range.unsatisfiable) {", 'PR16'),
 ('MU-414-RANGE-OWS-ACCEPTED', W, "/^bytes=(\\d*)-(\\d*)$/", "/^bytes\\s*=\\s*(\\d*)-(\\d*)$/", 'PR22'),
 ('MU-414-PROTECTED-ETAG-304', W, "  const headers = new Headers(corsHeaders);\n  headers.set('Content-Type', getContentType(fileName));\n  headers.set('Cache-Control', 'private, no-store');",
  "  if (purpose !== 'studio' && object.httpEtag && etagMatches(request.headers.get('If-None-Match'), object.httpEtag)) return new Response(null, { status: 304, headers: corsHeaders });\n  const headers = new Headers(corsHeaders);\n  headers.set('Content-Type', getContentType(fileName));\n  headers.set('Cache-Control', 'private, no-store');", 'PR21'),
 ('MU-414-PROTECTED-INM-BEFORE-SCOPE', W, "    return new Response('Forbidden', { status: 403, headers: corsHeaders });",
  "    return new Response(request.headers.get('If-None-Match') ? null : 'Forbidden', { status: request.headers.get('If-None-Match') ? 304 : 403, headers: corsHeaders });", 'PR21'),
 ('MU-414-CATCH-HEAD-NULL-UNGUARDED', W, "      const meta = await env.R2_BUCKET.head(r2Key);\n      if (!meta) return null;\n",
  "      const meta = await env.R2_BUCKET.head(r2Key);\n", 'PR20'),
 ('MU-414-CATCH-META-ETAG-DROPPED', W, "      if (meta.httpEtag) headers.set('ETag', meta.httpEtag);\n", "", 'PR19'),
 ('MU-414-RANGE-NO-TRIM', W, ".exec((header || '').trim());", ".exec((header || ''));", 'PR22 (expected equivalent: fetch Headers trims)'),
]
head_test = subprocess.run(['git','-C',os.environ.get('STORE','/home/runner/czaba-project/store'),'show','HEAD:workers/r2-proxy.test.mjs'],capture_output=True,text=True,check=True).stdout
open(os.path.join(S,'workers','r2-proxy.head.test.mjs'),'w').write(head_test)
def run(testfile):
    r = subprocess.run(['node','--test','--test-reporter=tap',testfile],cwd=S,capture_output=True,text=True)
    fails = sorted(set(re.findall(r'^not ok \d+ - (.*)$', r.stdout, re.M)))
    tot = re.search(r'^# tests (\d+)', r.stdout, re.M)
    return r.returncode, fails, tot.group(1) if tot else '?'
lines=[]
for label in ['PRISTINE-BEFORE']:
    for tf in ['workers/r2-proxy.test.mjs','workers/r2-proxy.head.test.mjs']:
        rc,f,t=run(tf); lines.append(f'{label} {tf} rc {rc} tests {t} failed {f}')
for mid, files, old, new, expect in M:
    orig = {}
    ok = True
    for f in files:
        p=os.path.join(S,f); src=open(p).read(); orig[p]=src
        if src.count(old)!=1: ok=False; lines.append(f'{mid} SITE-NOT-UNIQUE in {f} count {src.count(old)}'); break
        open(p,'w').write(src.replace(old,new))
    if ok:
        rc1,f1,_=run('workers/r2-proxy.test.mjs'); rc2,f2,_=run('workers/r2-proxy.head.test.mjs')
        hit = any(expect.split()[0]+' ' in x for x in f1)
        lines.append(f"{mid} expect {expect} | SKETCH {'RED' if rc1 else 'GREEN'} ({len(f1)} failed; expected-row-red {hit}) {[x.split(': ',1)[0]+': '+x.split(': ',1)[1][:4] for x in f1]} | HEAD-TESTS {'RED' if rc2 else 'GREEN(survives)'} ({len(f2)} failed) {[x.split(': ',1)[0]+': '+x.split(': ',1)[1][:4] for x in f2]}")
    for p,src in orig.items(): open(p,'w').write(src)
    with open(os.path.join(OUT,mid+'.diff'),'w') as fh:
        fh.write(f'files: {files}\n--- old\n{old}\n+++ new\n{new}\n')
for tf in ['workers/r2-proxy.test.mjs','workers/r2-proxy.head.test.mjs']:
    rc,f,t=run(tf); lines.append(f'PRISTINE-AFTER {tf} rc {rc} tests {t} failed {f}')
os.remove(os.path.join(S,'workers','r2-proxy.head.test.mjs'))
st=subprocess.run(['git','-C',S,'status','--short'],capture_output=True,text=True).stdout.strip().splitlines()
lines.append(f'SCRATCH-STATUS {len(st)} lines {st}')
open(os.path.join(OUT,'summary.txt'),'w').write('\n'.join(lines)+'\n')
print('\n'.join(lines))
