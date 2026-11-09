# B round 418 -> 419 mutant runner for SYS-R369-STEM-CACHE-WRITE-COORDINATOR.
# Usage: python3 -I run.py <scratch> <bdir>
#   <scratch>: a git repo made from `git archive 3579fcc` (node_modules symlinked), committed, nothing applied.
#   <bdir>: a directory holding sketch-419.patch.txt; logs and summary.txt go to <bdir>/mutants/.
# Each mutant: reset scratch, apply the sketch, apply the mutation, run stem-cache.test.ts, record red SC rows.
import os, re, subprocess, sys
scratch, bdir = sys.argv[1], sys.argv[2]
out = os.path.join(bdir, 'mutants'); os.makedirs(out, exist_ok=True)
patch = os.path.join(bdir, 'sketch-419.patch.txt')
S = 'app/lib/arrangement/stem-cache.client.ts'
TEST = 'app/lib/arrangement/__tests__/stem-cache.test.ts'
def sh(cmd):
    return subprocess.run(cmd, cwd=scratch, shell=True, capture_output=True, text=True)
sh('git checkout -q -- app && git clean -qfd -e node_modules -- app')
if 'const deletes = new Set<Promise<void>>();' not in open(os.path.join(scratch, S), encoding='utf-8').read():
    sys.exit('scratch is not the HEAD base (deletes set missing)')
MUTANTS = [
    ('SKETCH', []),
    ('MU-HEAD-SRC', 'revert-src'),
    ('MU-WRITE-NOT-AFTER-DELETE', [(S, 'abandoned, pending?.done ?? Promise.resolve())', 'abandoned, Promise.resolve())')]),
    ('MU-JOIN-IGNORES-OPEN', [(S, "if (pending?.kind === 'write' && pending.open) {", "if (pending?.kind === 'write') {")]),
    ('MU-IDLE-COMMIT-ONLY', [(S, '      while (operations.size > 0) {\n        await Promise.all([...operations.values()].map((operation) => operation.done));\n      }\n', '')]),
    ('MU-IDLE-WRITES-ONLY', [(S, '      while (operations.size > 0) {\n        await Promise.all([...operations.values()].map((operation) => operation.done));\n      }\n',
                              "      while ([...operations.values()].some((operation) => operation.kind === 'write')) {\n        await Promise.all(\n          [...operations.values()]\n            .filter((operation) => operation.kind === 'write')\n            .map((operation) => operation.done),\n        );\n      }\n")]),
    ('MU-NO-VICTIM-LOOP-CHECK', [(S, '    for (const victim of victims) {\n      if (cancelled()) {\n        return;\n      }\n', '    for (const victim of victims) {\n')]),
    ('MU-INTEGRITY-REREAD', 'integrity-reread'),
    ('MU-INTEGRITY-NO-CHECK', [(S, '      if (isStemCacheRecord(value) && value.fileName === held.fileName) {', '      if (isStemCacheRecord(value)) {')]),
    ('MU-INTEGRITY-NO-FILE', [(S, '    await transactionDone(transaction);\n    await removeFile(held.fileName);\n', '    await transactionDone(transaction);\n')]),
    ('MU-NAME-NO-COUNTER', [(S, '${at.toString(36)}-${fileCount.toString(36)}-${Math', '${at.toString(36)}-${Math')]),
    ('MU-PUT-NO-NAME-GUARD', [(S, "      if (previous !== null && previous.fileName === record.fileName) {\n        throw new DOMException('The stem cache file name is already in use.', 'InvalidStateError');\n      }\n", '')]),
    ('MU-NO-CHAIN-START-CHECK', [(S, '    const cancelled = (): boolean => abandoned() || disabled;\n    if (cancelled()) {\n      return;\n    }\n', '    const cancelled = (): boolean => abandoned() || disabled;\n')]),
    ('MU-SERVED-EXTRA-HEADER', [(S, '      return new Response(entry.bytes, { status: 200 });', "      return new Response(entry.bytes, { status: 200, headers: { 'x-cache': 'stem' } });")]),
    ('MU-SERVED-EXTRA-HEADER-HEAD-TEST', 'extra-header-head-test'),
]
EXTRA = [(S, '      return new Response(entry.bytes, { status: 200 });', "      return new Response(entry.bytes, { status: 200, headers: { 'x-cache': 'stem' } });")]
def edit(name, path, old, new, count=1):
    fp = os.path.join(scratch, path)
    s = open(fp, encoding='utf-8').read()
    if s.count(old) != count:
        sys.exit(f'{name}: site found {s.count(old)} times in {path}, expected {count}')
    open(fp, 'w', encoding='utf-8').write(s.replace(old, new))
summary = []
for name, edits in MUTANTS:
    sh('git checkout -q -- app && git clean -qfd -e node_modules -- app')
    r = sh(f'git apply {patch}')
    if r.returncode != 0:
        sys.exit('sketch does not apply: ' + r.stderr)
    if edits == 'revert-src':
        sh(f'git checkout -q -- {S}')
    elif edits == 'integrity-reread':
        edit(name, S, '        await removeIfCurrent(record);\n', '        await remove(key);\n', 2)
    elif edits == 'extra-header-head-test':
        sh(f'git checkout -q -- {TEST}')
        for path, old, new in EXTRA:
            edit(name, path, old, new)
    else:
        for path, old, new in edits:
            edit(name, path, old, new)
    r = sh(f'timeout 600 npx vitest run {TEST} 2>&1')
    log = r.stdout + r.stderr
    open(os.path.join(out, f'{name}.log'), 'w', encoding='utf-8').write(log)
    red = sorted(set(re.findall(r'×\S*\s+(SC\d+)\b', log)), key=lambda x: int(x[2:]))
    tests = re.search(r'Tests\s+.*', log)
    summary.append(f'{name}: red {",".join(red) if red else "none"} | {re.sub(chr(27)+r"\[[0-9;]*m", "", tests.group(0)) if tests else "no summary"}')
sh('git checkout -q -- app && git clean -qfd -e node_modules -- app')
open(os.path.join(out, 'summary.txt'), 'w', encoding='utf-8').write('\n'.join(summary) + '\n')
print('\n'.join(summary))
