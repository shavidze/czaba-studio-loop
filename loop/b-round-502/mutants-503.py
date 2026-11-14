# usage: python3 -I mutants-503.py <copy-of-store-tree-with-sketch> <absolute-log-dir>
# Applies each mutant to the copy, runs the 2b-3 test file, records the failing rows, restores the file.
import hashlib, os, re, subprocess, sys

copy, logs = sys.argv[1], sys.argv[2]
os.makedirs(logs, exist_ok=True)
TEST = 'app/lib/__tests__/store-button-cleanup-2b3.test.tsx'
CART = 'app/routes/cart.tsx'
REC = 'app/routes/recordings.$productId.tsx'
SHOW = 'app/components/home/StudioShowcase.tsx'
UP = "className={buildButtonClassName({ size: 'sm', className: 'min-h-11 shrink-0' })}"
SC = "className={buildButtonClassName({ shape: 'pill', className: 'mb-6 min-h-11' })}"
BR = "<Link to=\"/store\" className={buildButtonClassName({ size: 'lg', shape: 'pill' })}>"
MUTANTS = [
    ('M1', CART, UP, 'className="px-3 py-1.5 bg-brand text-black text-sm font-medium rounded hover:bg-brand/90 transition-colors flex items-center gap-1.5"', ['B2B3-1', 'B2B3-6']),
    ('M2', CART, UP, "className={buildButtonClassName({ size: 'md', className: 'min-h-11 shrink-0' })}", ['B2B3-1']),
    ('M3', CART, UP, "className={buildButtonClassName({ size: 'sm', className: 'min-h-11' })}", ['B2B3-1']),
    ('M4', CART, UP, "className={buildButtonClassName({ size: 'sm', className: 'shrink-0' })}", ['B2B3-1']),
    ('M5', CART, "{ownershipStatus.type === 'owns_same' && (", "{ownershipStatus.type !== 'not_owned' && (", ['B2B3-2']),
    ('M6', REC, SC, 'className="mb-6 inline-flex min-h-11 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-background hover:bg-brand-hover"', ['B2B3-3', 'B2B3-6']),
    ('M7', REC, SC, "className={buildButtonClassName({ className: 'mb-6 min-h-11' })}", ['B2B3-3']),
    ('M8', REC, SC, "className={buildButtonClassName({ shape: 'pill', className: 'min-h-11' })}", ['B2B3-3']),
    ('M9', REC, "{catalog.licenseType.toLowerCase() === 'universal' && catalog.recordings.length > 0 && (", "{catalog.licenseType.toLowerCase() === 'universal' && (", ['B2B3-4']),
    ('M10', SHOW, BR, '<Link to="/store" className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 font-semibold text-background transition-[background-color,transform] duration-200 hover:bg-brand-hover hover:[transform:scale(1.05)] active:[transform:scale(0.98)]">', ['B2B3-5', 'B2B3-6']),
    ('M11', SHOW, BR, "<Link to=\"/store\" className={buildButtonClassName({ shape: 'pill' })}>", ['B2B3-5']),
    ('M12', SHOW, BR, "<Link to=\"/store\" className={buildButtonClassName({ size: 'lg', shape: 'pill', className: 'hover:[transform:scale(1.05)]' })}>", ['B2B3-5']),
    ('M13', SHOW, "            <span>Browse the Collection</span>\n            <ArrowRight size={18} />\n", "            <ArrowRight size={18} />\n            <span>Browse the Collection</span>\n", ['B2B3-5']),
    ('M14', CART, "            <ArrowUp className=\"w-4 h-4\" />\n            Upgrade\n", "            Upgrade\n            <ArrowUp className=\"w-4 h-4\" />\n", ['B2B3-1']),
    ('M15', TEST, "return /(?:^|[\\s\"'`])bg-brand(?:[\\s\"'`]|$)/.test(tag);", 'return tag.length < 0;', ['B2B3-7']),
    ('M16', TEST, "      } else if (char === '>' && depth === 0) {", "      } else if (char === '>') {", ['B2B3-7']),
]
FILES = [CART, REC, SHOW, TEST]
def digest():
    return [hashlib.sha256(open(os.path.join(copy, f), 'rb').read()).hexdigest() for f in FILES]
before = digest()
summary = []
for mid, rel, old, new, expected in MUTANTS:
    path = os.path.join(copy, rel)
    src = open(path, encoding='utf8').read()
    if src.count(old) != 1:
        summary.append(f'{mid} APPLY-FAIL count={src.count(old)}')
        continue
    open(path, 'w', encoding='utf8').write(src.replace(old, new))
    try:
        run = subprocess.run(['npx', 'vitest', 'run', '--reporter=verbose', TEST], cwd=copy, capture_output=True, text=True, timeout=600)
        out = re.sub(r'\x1b\[[0-9;]*m', '', run.stdout + run.stderr)
        open(os.path.join(logs, f'mutant-{mid}.log'), 'w', encoding='utf8').write(out)
        red = sorted({m.group(1) for m in re.finditer(r'(?:×|✗|FAIL)\s.*?(B2B3-\d)', out)})
    finally:
        open(path, 'w', encoding='utf8').write(src)
    ok = run.returncode != 0 and red == sorted(expected)
    summary.append(f"{mid} rc {run.returncode} red {','.join(red) or '-'} expected {','.join(sorted(expected))} {'OK' if ok else 'MISMATCH'}")
    print(summary[-1], flush=True)
summary.append(f'restored rc {0 if digest() == before else 1}')
open(os.path.join(logs, 'summary.txt'), 'w', encoding='utf8').write('\n'.join(summary) + '\n')
print(summary[-1])
