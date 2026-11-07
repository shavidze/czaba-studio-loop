import subprocess, pathlib, re, sys
root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/b397-scratch')
out = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else '/home/runner/czaba-project/tmp/studio-real-loop/b-round-396/mutants')
out.mkdir(parents=True, exist_ok=True)
D = 'app/data/studio-lab-demo.ts'
T = 'app/data/__tests__/studio-lab-demo-synth-buffer.test.ts'
muts = {
 'MU-397-SECOND-COPY': ([(D, "buffer.copyToChannel(samples, 1);", "buffer.copyToChannel(new Float32Array(samples), 1);")], [T]),
 'MU-397-MONO': ([(D, "    numberOfChannels: 2,\n", "    numberOfChannels: 1,\n"), (D, "  buffer.copyToChannel(samples, 1);\n", "")], [T]),
 'MU-397-SKIP-RIGHT': ([(D, "  buffer.copyToChannel(samples, 1);\n", "")], [T]),
 'MU-397-WRONG-STEM': ([(D, "return part ? composition.stems[part] : composition.mix;", "return part ? composition.stems.pad : composition.mix;")], [T]),
 'MU-397-NO-YIELD': ([(D, "    await yieldToNextTask();\n", "")], [T]),
 'MU-397-NO-ABORT-CHECK': ([(D, "    signal.throwIfAborted();\n", "")], [T]),
 'MU-397-YIELD-ALL': ([(D, "  const generate = demoSynths[sourceId];\n  return generate ? generate() : null;", "  const generate = demoSynths[sourceId];\n  await yieldToNextTask();\n  return generate ? generate() : null;")], [T]),
}
lines = []
def run(files):
    r = subprocess.run(['npx', 'vitest', 'run', *files], cwd=root, capture_output=True, text=True)
    return r.returncode, re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
rc, txt = run([T]); (out / 'pristine.log').write_text(txt); lines.append(f'pristine rc {rc}')
for mid, (edits, files) in muts.items():
    saved = {}
    for f, old, new in edits:
        p = root / f; s = saved.get(f) or p.read_text(); saved.setdefault(f, s)
        cur = p.read_text(); assert cur.count(old) == 1, (mid, f, old); p.write_text(cur.replace(old, new))
    rc, txt = run(files)
    for f, s in saved.items(): (root / f).write_text(s)
    (out / f'mutant-{mid}.log').write_text(txt)
    failed = sorted(set(re.findall(r'(?:×|FAIL).*?(SB\d+)', txt)))
    lines.append(f"{mid} {'RED' if rc else 'SURVIVED'} rc {rc} rows {','.join(failed)}")
rc, txt = run([T]); lines.append(f'pristine-after rc {rc}')
(out / 'summary.txt').write_text('\n'.join(lines) + '\n'); print('\n'.join(lines))
