# B round 420 -> 421 mutant runner for SYS-R418-PREVIEW-LIFECYCLE.
# Usage: python3 -I run.py <scratch> <bdir>
#   <scratch>: a git repo made from `git archive 6609dfa` (node_modules symlinked), committed, nothing applied.
#   <bdir>: a directory holding sketch-421.patch.txt; logs and summary.txt go to <bdir>/mutants/.
# Each mutant: reset scratch to its commit, apply the sketch, apply the mutation, run the stream test file,
# record which PC/PS/PL rows are red. 'SKETCH' is the unmutated sketch (all green expected).
import os, re, subprocess, sys
scratch, bdir = sys.argv[1], sys.argv[2]
out = os.path.join(bdir, 'mutants'); os.makedirs(out, exist_ok=True)
patch = os.path.join(bdir, 'sketch-421.patch.txt')
C = 'app/contexts/ArrangementContext.tsx'
P = 'app/lib/arrangement/preview.client.ts'
TEST = 'app/lib/arrangement/__tests__/library-preview-stream.test.tsx'
def sh(cmd):
    return subprocess.run(cmd, cwd=scratch, shell=True, capture_output=True, text=True)
sh('git checkout -q -- app && git clean -qfd -e node_modules -- app')
# HEAD-base guard: the unapplied scratch must not hold the sketch's setStart.
if 'setStart' in open(os.path.join(scratch, P), encoding='utf-8').read():
    sys.exit('scratch is not the HEAD base (setStart present)')
MUTANTS = [
    ('SKETCH', []),
    ('MU-HEAD-SRC', 'revert-src'),
    ('MU-COLLECTION-NO-STOP', [(C, '        collectionControllerRef.current = null;\n      }\n      stopLibraryPreview();\n', '        collectionControllerRef.current = null;\n      }\n')]),
    ('MU-NO-SET-START', [(P, '        playing.setStart(start);\n', '')]),
    ('MU-TICK-FALLBACK-START', [(P, '          const now = readTime(armedAt);\n', '          const now = readTime();\n')]),
    ('MU-OFFSET-RAW-READ', [(P, '        return active.readTime();\n', '        return active.element.currentTime;\n')]),
    ('MU-SEEK-KEEPS-OLD-HANDLER', [(P, '        playing.setErrorHandler(onStreamError);\n', '')]),
]
summary = []
for name, edits in MUTANTS:
    sh('git checkout -q -- app && git clean -qfd -e node_modules -- app')
    r = sh(f'git apply {patch}')
    if r.returncode != 0:
        sys.exit('sketch does not apply: ' + r.stderr)
    if edits == 'revert-src':
        sh(f'git checkout -q -- {C} {P}')
    else:
        for path, old, new in edits:
            fp = os.path.join(scratch, path)
            s = open(fp, encoding='utf-8').read()
            if s.count(old) != 1:
                sys.exit(f'{name}: site not found once in {path}')
            open(fp, 'w', encoding='utf-8').write(s.replace(old, new))
    r = sh(f'timeout 600 npx vitest run {TEST} 2>&1')
    log = r.stdout + r.stderr
    open(os.path.join(out, f'{name}.log'), 'w', encoding='utf-8').write(log)
    red = sorted(set(re.findall(r'×\S*\s+(P[CSL]\d+)\b', log)), key=lambda x: (x[:2], int(x[2:])))
    tests = re.search(r'Tests\s+.*', log)
    summary.append(f'{name}: red {",".join(red) if red else "none"} | {re.sub(chr(27)+r"\[[0-9;]*m", "", tests.group(0)) if tests else "no summary"}')
sh('git checkout -q -- app && git clean -qfd -e node_modules -- app')
open(os.path.join(out, 'summary.txt'), 'w', encoding='utf-8').write('\n'.join(summary) + '\n')
print('\n'.join(summary))
