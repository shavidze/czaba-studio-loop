import subprocess, pathlib, re, sys
root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/b396-scratch')
out = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else '/home/runner/czaba-project/tmp/studio-real-loop/b-round-395/mutants')
out.mkdir(parents=True, exist_ok=True)
C = 'app/lib/arrangement/collection.ts'
P = 'app/lib/arrangement/preview.client.ts'
X = 'app/contexts/ArrangementContext.tsx'
TC = 'app/lib/arrangement/__tests__/collection.test.ts'
TS = 'app/lib/arrangement/__tests__/library-preview-stream.test.tsx'
muts = {
 'MU-396-PURCHASED-NO-PREVIEW': ([(C, "    previewUrl: (source) => stemUrls.get(source.id) ?? null,\n", "")], [TC]),
 'MU-396-PREVIEW-LIVE-INPUT': ([(C, "previewUrl: (source) => stemUrls.get(source.id) ?? null,", "previewUrl: (source) => stems.find((stem) => stem.id === source.id)?.audioUrl ?? null,")], [TC]),
 'MU-396-UNKNOWN-NOT-NULL': ([(C, "previewUrl: (source) => stemUrls.get(source.id) ?? null,", "previewUrl: (source) => stemUrls.get(source.id) ?? '',")], [TC]),
 'MU-396-FALLBACK-ANY-COLLECTION': ([(X, "!(fallback?.collection === collection && fallback.sourceIds.has(sourceId))", "!fallback?.sourceIds.has(sourceId)")], [TS]),
 'MU-394-SYNC-THROW-SEEK': ([(P, "        } catch {\n          active.fail();\n        }", "        } catch (caught) {\n          throw caught;\n        }")], [TS]),
 'MU-396-NO-CROSSORIGIN': ([(P, "      element.crossOrigin = 'anonymous';\n", "")], [TS]),
 'MU-394-STALL-SURVIVES-STOP': ([(P, "        detach: () => {\n          disarmStall();\n", "        detach: () => {\n")], [TS]),
}
lines = []
def run(files):
    r = subprocess.run(['npx', 'vitest', 'run', *files], cwd=root, capture_output=True, text=True)
    return r.returncode, re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
rc, txt = run([TC, TS]); (out / 'pristine.log').write_text(txt); lines.append(f'pristine rc {rc}')
for mid, (edits, files) in muts.items():
    saved = {}
    for f, old, new in edits:
        p = root / f; s = saved.get(f) or p.read_text(); saved.setdefault(f, s)
        cur = p.read_text(); assert cur.count(old) == 1, (mid, f); p.write_text(cur.replace(old, new))
    rc, txt = run(files)
    for f, s in saved.items(): (root / f).write_text(s)
    (out / f'mutant-{mid}.log').write_text(txt)
    failed = sorted(set(re.findall(r'(?:×|FAIL).*?((?:PV|PS)\d+)', txt)))
    lines.append(f"{mid} {'RED' if rc else 'SURVIVED'} rc {rc} rows {','.join(failed)}")
rc, txt = run([TC, TS]); lines.append(f'pristine-after rc {rc}')
(out / 'summary.txt').write_text('\n'.join(lines) + '\n'); print('\n'.join(lines))
