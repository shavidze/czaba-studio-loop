import sys, re, subprocess, hashlib
# usage: it-bodies.py <repo> <rev-or-WORKTREE>; prints per-file row count + sha256 of all it(...) blocks
repo, rev = sys.argv[1], sys.argv[2]
files = ['schedule-failure-ui.test.tsx', 'master-hold-tick.test.tsx', 'decoded-buffer-eviction-ui.test.tsx', 'apply-schedule-rollback.test.ts']
for f in files:
    path = 'app/lib/arrangement/__tests__/' + f
    if rev == 'WORKTREE':
        text = open(repo + '/' + path).read()
    else:
        text = subprocess.run(['git', '-C', repo, 'show', f'{rev}:{path}'], capture_output=True, text=True, check=True).stdout
    blocks = re.findall(r"^  it\('.*?^  }\);$", text, re.S | re.M)
    h = hashlib.sha256('\n\x00\n'.join(blocks).encode()).hexdigest()
    print(f, len(blocks), h[:16])
