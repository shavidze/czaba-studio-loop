import subprocess, sys, re, pathlib, shutil
S = pathlib.Path('/tmp/a307/scratch')
OUT = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop/a-round-307')
G = 'app/lib/arrangement/graph.client.ts'
R = 'app/lib/arrangement/reschedule.ts'
TESTS = ['app/lib/arrangement/__tests__/reschedule.test.ts', 'app/lib/arrangement/__tests__/graph.test.ts']

def tail_replace(text, marker, a, b):
    i = text.index(marker)
    head, tail = text[:i], text[i:]
    assert tail.count(a) >= 1, a
    return head + tail.replace(a, b, 1)

def once(text, a, b):
    assert text.count(a) == 1, a
    return text.replace(a, b)

prune = """      sources = sources.filter((state) => {
        if (state.ended) {"""

MUTANTS = {
 'MU-DIFF-FADE': (R, lambda t: once(t, "key === 'gainDb' ? undefined", "key === 'gainDb' || key === 'fadeIn' || key === 'fadeOut' ? undefined")),
 'MU-TRACK-SET': (R, lambda t: once(t, "  if (trackIdsInOrder(previous) !== trackIdsInOrder(next)) {\n    return null;\n  }\n", "")),
 'MU-SHAPES-IGNORED': (G, lambda t: once(once(once(once(t,
     "clipFadeTargets.set(clipId, fade);", "void fade;"),
     "clipFadeTargets.delete(clipId);", ""),
     "clipEnvelopeTargets.set(clipId, envelope);", "void envelope;"),
     "clipEnvelopeTargets.delete(clipId);", "")),
 'MU-STOP-NOW': (G, lambda t: once(once(t, "state.stopAt = startAt;", "state.stopAt = ctx.currentTime;"),
     "state.source.stop(startAt);", "state.source.stop(ctx.currentTime);")),
 'MU-SOUNDING-ONLY': (G, lambda t: once(once(once(t,
     "  let disconnected = false;\n", "  let disconnected = false;\n  const mutantStarts = new Map<unknown, number>();\n"),
     "      sources.push(state);\n", "      sources.push(state);\n      mutantStarts.set(state, startAt + (item.when - from));\n"),
     "          !ids.has(state.clipId) ||", "          !ids.has(state.clipId) ||\n          (mutantStarts.get(state) ?? 0) > startAt ||")),
 'MU-NO-PRUNE': (G, lambda t: tail_replace(t, 'replaceClips(clipIds, items', prune, "      sources = sources.filter((state) => {\n        if (state.ended && false) {")),
 'MU-STOP-SKIP-ANY': (G, lambda t: once(t, "(state.stopAt !== null && state.stopAt <= startAt)", "state.stopAt !== null")),
 'MU-STOP-EQUAL': (G, lambda t: once(t, "state.stopAt <= startAt)", "state.stopAt < startAt)")),
 'MU-ID-FILTER': (G, lambda t: once(t, "items.filter((item) => ids.has(item.clipId)),", "items,")),
}

def run(tag):
    p = subprocess.run(['npx', 'vitest', 'run', *TESTS, '--reporter=verbose'], cwd=S, capture_output=True, text=True)
    out = re.sub(r'\x1b\[[0-9;]*m', '', p.stdout + p.stderr)
    (OUT / f'mut-{tag}.log').write_text(out)
    failed = sorted(set(re.findall(r'[×✗]\s+.*?((?:RS|RC)\d+)', out)))
    other = [l for l in out.splitlines() if re.search(r'[×✗]', l) and not re.search(r'(RS|RC)\d+', l)]
    summary = [l for l in out.splitlines() if l.strip().startswith('Tests ')]
    return failed, other, summary

only = sys.argv[1:] or list(MUTANTS)
results = []
f, o, s = run('control')
results.append(('control', f, o, s))
for name in only:
    path, fn = MUTANTS[name]
    src = S / path
    orig = src.read_text()
    mutated = fn(orig)
    src.write_text(mutated)
    subprocess.run(['git', 'diff', '--no-index', str(S / '..' / 'orig.tmp'), str(src)], capture_output=True)
    d = subprocess.run(['diff', '-u', '-', str(src)], input=orig, capture_output=True, text=True).stdout
    (OUT / f'mut-{name}.diff').write_text(d)
    try:
        f, o, s = run(name)
    finally:
        src.write_text(orig)
    results.append((name, f, o, s))
f, o, s = run('restored')
results.append(('restored', f, o, s))
for r in results:
    print(r[0], 'RED:', ' '.join(r[1]) or '-', '| other red:', len(r[2]), '|', ' '.join(r[3]))
