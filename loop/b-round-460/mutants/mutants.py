import sys, subprocess, shutil, re, os
R = sys.argv[1]
OUT = sys.argv[2]
WHOLE = len(sys.argv) > 3 and sys.argv[3] == 'whole'
EC = 'app/components/loading/EntranceCover.tsx'
SL = 'app/components/loading/SpotlightLoader.tsx'
RT = 'app/root.tsx'
TF = 'app/lib/__tests__/store-entrance-loader.test.tsx'
MUTANTS = [
  ('BASE', None, None, None, 'E1b|E9 |E11|E20|E21'),
  ('BASE-ALL', None, None, None, 'E'),
  ('M1', EC, "media={isEntrancePending() ? 'all' : 'not all'}", "media={'not all'}", 'E20 '),
  ('M2', EC, " && performance.now() - handshake.start < ENTRANCE_FAILSAFE_MS", "", 'E20b'),
  ('M3', EC, "if (typeof window === 'undefined') return false;", "if (typeof window === 'undefined') return true;", 'E1b'),
  ('M4', EC, "  if (typeof window === 'undefined') return false;\n", "", 'E1b'),
  ('M5', EC, "        id={ENTRANCE_COVER_ID}\n        media={isEntrancePending() ? 'all' : 'not all'}\n        suppressHydrationWarning\n", "        id={ENTRANCE_COVER_ID}\n        media={isEntrancePending() ? 'all' : 'not all'}\n", 'E21'),
  ('M6', EC, "window.removeEventListener('${ENTRANCE_TAKEOVER_EVENT}',off);", "", 'E9 '),
  ('M7', SL, "    window.dispatchEvent(new Event(ENTRANCE_TAKEOVER_EVENT));\n\n    return () => {", "\n    return () => {", 'E9 '),
  ('M8', EC, "document.removeEventListener('keydown',key,true);", "", 'E9 '),
  ('M9', EC, "c.setAttribute('data-start',String(h.start));", "", 'E21'),
  ('M10', RT, "        <Links />\n        <EntranceCoverHead />\n", "        <EntranceCoverHead />\n        <Links />\n", 'E11'),
]
res = []
for mid, f, a, b, pat in MUTANTS:
    bak = None
    if f:
        p = os.path.join(R, f)
        s = open(p).read()
        n = s.count(a)
        if n != 1:
            res.append(f'{mid}\tSKIP-anchor-count-{n}'); continue
        bak = s
        open(p, 'w').write(s.replace(a, b))
    try:
        r = subprocess.run(['npx', 'vitest', 'run', TF] + ([] if WHOLE else ['-t', pat]), cwd=R, capture_output=True, text=True, timeout=300)
        log = r.stdout + r.stderr
        open(os.path.join(OUT, f'mutant-{mid}.log'), 'w').write(log)
        m = re.search(r'Tests\s+.*?(\d+) failed', re.sub(r'\x1b\[[0-9;]*m', '', log))
        failed = int(m.group(1)) if m else 0
        status = ('GREEN' if r.returncode == 0 else f'RED rc{r.returncode} failed={failed}')
        failing = sorted(set(re.findall(r'(?:×|FAIL).*?> (E\d+b?|L\d+b?) ', re.sub(r'\x1b\[[0-9;]*m', '', log))))
        res.append(f'{mid}\t{pat.strip()}\t{status}' + (('\t' + ','.join(failing)) if WHOLE else ''))
    finally:
        if bak is not None:
            open(os.path.join(R, f), 'w').write(bak)
open(os.path.join(OUT, 'mutants.txt'), 'w').write('\n'.join(res) + '\n')
print('\n'.join(res))
