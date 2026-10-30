import subprocess, sys, re, shutil
S = '/tmp/c267-scratch'
W = S + '/app/components/arrangement/StudioWorkspace.tsx'
T = 'app/lib/arrangement/__tests__/meta-shortcuts-ui.test.tsx'
OUT = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-267/mutants'
orig = open(W).read()
DECL = "const commandChord = modifier && !event.altKey && !event.getModifierState('AltGraph');"
assert orig.count(DECL) == 1
mutants = {
    'M-ALT': (DECL, "const commandChord = modifier && !event.getModifierState('AltGraph');"),
    'M-AG': (DECL, "const commandChord = modifier && !event.altKey;"),
    'M-GESTURE': ('((commandChord &&', '((modifier &&'),
    'M-RETURN': ('if (modifier) {\n        return;', 'if (commandChord) {\n        return;'),
    'BRANCH-z': ("if (commandChord && key === 'z')", "if (modifier && key === 'z')"),
    'BRANCH-e': ("if (commandChord && key === 'e')", "if (modifier && key === 'e')"),
    'BRANCH-l': ("if (commandChord && key === 'l')", "if (modifier && key === 'l')"),
    'BRANCH-d': ("if (commandChord && key === 'd')", "if (modifier && key === 'd')"),
    'BRANCH-v': ("if (commandChord && key === 'v'", "if (modifier && key === 'v'"),
}
summary = []
try:
    for name, (a, b) in mutants.items():
        assert orig.count(a) == 1, (name, orig.count(a))
        open(W, 'w').write(orig.replace(a, b))
        p = subprocess.run(['npx', 'vitest', 'run', T, '--reporter=verbose'], cwd=S, capture_output=True, text=True, timeout=600)
        txt = re.sub(r'\x1b\[[0-9;]*m', '', p.stdout + p.stderr)
        open(f'{OUT}-{name}.txt', 'w').write(txt)
        failed = sorted(set(re.findall(r'[×✗]\s+(?:GATE264-S2[^>]*> )?(AG\d[^\n]*?)(?:\s+\d+ms)?$', txt, re.M)))
        tot = re.search(r'Tests\s+(.*)', txt)
        summary.append(f'{name}: rc={p.returncode} {tot.group(1) if tot else "?"} red={failed}')
        print(summary[-1], flush=True)
    open(W, 'w').write(orig)
    p = subprocess.run(['npx', 'vitest', 'run', T], cwd=S, capture_output=True, text=True, timeout=600)
    txt = re.sub(r'\x1b\[[0-9;]*m', '', p.stdout + p.stderr)
    tot = re.search(r'Tests\s+(.*)', txt)
    summary.append(f'CONTROL (unmutated): rc={p.returncode} {tot.group(1) if tot else "?"}')
    print(summary[-1])
finally:
    open(W, 'w').write(orig)
    open(OUT + '-summary.txt', 'w').write('\n'.join(summary) + '\n')
