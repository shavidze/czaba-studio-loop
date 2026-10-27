# A round 204: apply each mutant to /tmp/r204-mut, run the HF file, restore. python3 -I mutants.py
import json, re, shutil, subprocess, sys
ROOT = '/tmp/r204-mut'
H = 'app/components/layout/Header.tsx'
S = 'app/components/home/StudioShowcase.tsx'
T = 'app/lib/__tests__/store-hidden-focusables.test.tsx'
CTA_OLD = '''          <Link
            to="/store"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 font-semibold text-background transition-[background-color,transform] duration-200 hover:bg-brand-hover hover:[transform:scale(1.05)] active:[transform:scale(0.98)]"
          >
            <span>Browse the Collection</span>
            <ArrowRight size={18} />
          </Link>
'''
CTA_NEW = '''          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} transition={springFast}>
''' + CTA_OLD + '''          </motion.div>
'''
M = {
 'm1 drop invisible': (H, "'max-h-0 opacity-0 invisible'", "'max-h-0 opacity-0'"),
 'm2 drop aria-expanded on Toggle': (H, '            aria-expanded={isOpen}\n', ''),
 'm3 user-menu onClick removed': (H, '                onClick={() => setIsUserMenuOpen((open) => !open)}\n', ''),
 'm4 Escape without focus()': (H, '                userMenuButtonRef.current?.focus();\n', ''),
 'm5 onBlur closes on any blur': (H, '                if (next instanceof Node && event.currentTarget.contains(next)) return;\n', ''),
 'm6 pointerdown ignores contains': (H, '      if (wrapper && event.target instanceof Node && wrapper.contains(event.target)) return;\n', ''),
 'm7 Logout without close': (H, '''                  onClick={() => {
                    setIsUserMenuOpen(false);
                    signOut();''', '''                  onClick={() => {
                    signOut();'''),
 'm8 motion.div whileTap wrapper restored': (S, CTA_OLD, CTA_NEW),
 'm9 setIsInView(entry.isIntersecting) restored': (S, '''        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }''', '''        setIsInView(entry.isIntersecting);'''),
 'm10 onFocus removed': (S, '      onFocus={() => setIsInView(true)}\n', ''),
}
res = {}
for name, (f, a, b) in M.items():
    p = f'{ROOT}/{f}'; orig = open(p).read()
    assert orig.count(a) == 1, name
    open(p, 'w').write(orig.replace(a, b))
    try:
        r = subprocess.run(['npx', 'vitest', 'run', T, '--reporter=verbose'], cwd=ROOT, capture_output=True, text=True, timeout=300)
        out = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
        failed = sorted(set(re.findall(r'[×✗] .*?(HF\d)', out)))
        res[name] = {'exit': r.returncode, 'failed': failed}
    finally:
        open(p, 'w').write(orig)
    print(name, res[name], flush=True)
json.dump(res, open(sys.argv[1] if len(sys.argv) > 1 else 'mutants.json', 'w'), indent=1)
