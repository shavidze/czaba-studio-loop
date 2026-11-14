# usage: python3 -I mutants-505.py <copy-of-store-tree-with-sketch> <absolute-log-dir>
# Applies each mutant to the copy, runs the 2d test file, records the failing rows, restores the file.
import hashlib, os, re, subprocess, sys

copy, logs = sys.argv[1], sys.argv[2]
os.makedirs(logs, exist_ok=True)
TEST = 'app/lib/__tests__/store-button-cleanup-2d.test.tsx'
GF = 'app/components/chat/GuestForm.tsx'
CI = 'app/components/chat/ChatInput.tsx'
CW = 'app/components/chat/ChatWindow.tsx'
IB = 'app/components/ui/IconButton.tsx'
START = '          <Button type="submit" size="lg" fullWidth>\n'
SEND = '          <IconButton\n            type="submit"\n            variant="brand"\n            size="md"\n            label="Send message"\n            disabled={disabled || !value.trim()}\n          >\n'
MUTANTS = [
    ('M1', GF, START, '          <Button type="submit" size="md" fullWidth>\n', ['B2D-1']),
    ('M2', GF, START, '          <Button type="submit" size="lg">\n', ['B2D-1']),
    ('M3', GF, START, '          <Button size="lg" fullWidth>\n', ['B2D-1']),
    ('M4', GF, START + '            Start Chat\n          </Button>\n', '          <button type="submit" className="w-full px-4 py-3 bg-brand text-background font-semibold rounded-lg">\n            Start Chat\n          </button>\n', ['B2D-1', 'B2D-8']),
    ('M5', CI, '          onTypingStop?.();\n          textareaRef.current?.focus();\n', '          onTypingStop?.();\n', ['B2D-4']),
    ('M6', CI, '      if (focusOnMount && document.activeElement === document.body) {\n', '      if (!focusOnMount) {\n', ['B2D-6', 'B2D-7']),
    ('M7', CW, 'focusOnMount={isOpenedWithGuestForm}', 'focusOnMount={true}', ['B2D-7']),
    ('M8', CW, 'focusOnMount={isOpenedWithGuestForm}', 'focusOnMount={false}', ['B2D-7']),
    ('M9', CI, SEND, SEND.replace('size="md"', 'size="sm"'), ['B2D-3']),
    ('M10', CI, SEND, SEND.replace('            disabled={disabled || !value.trim()}\n', ''), ['B2D-3', 'B2D-4']),
    ('M11', IB, "  brand: ['bg-brand text-background', 'hover:bg-brand-hover', 'shadow-sm'].join(' '),", "  brand: ['bg-brand text-background', 'hover:bg-brand-hover', 'active:scale-95', 'shadow-sm hover:shadow-glow'].join(' '),", ['B2D-0', 'B2D-3', 'B2D-8']),
    ('M12', CI, SEND + '            <Send className="w-5 h-5" />\n          </IconButton>\n', '          <button type="submit" aria-label="Send message" disabled={disabled || !value.trim()} className="p-2.5 rounded-lg bg-brand text-background">\n            <Send className="w-4 h-4" />\n          </button>\n', ['B2D-3', 'B2D-8']),
    ('M13', GF, '      if (validate()) {\n', '      if (validate() || name.length >= 0) {\n', ['B2D-2']),
    ('M14', CI, "        if (e.key === 'Enter' && !e.shiftKey) {\n", "        if (e.key === 'Enter') {\n", ['B2D-5']),
    ('M15', CI, '      if (focusOnMount && document.activeElement === document.body) {\n', '      if (focusOnMount) {\n', ['B2D-9']),
]
FILES = [GF, CI, CW, IB, TEST]
def digest():
    return [hashlib.sha256(open(os.path.join(copy, f), 'rb').read()).hexdigest() for f in FILES]
before = digest()
summary = []
for mid, rel, old, new, expected in MUTANTS:
    path = os.path.join(copy, rel)
    src = open(path, encoding='utf8').read()
    if src.count(old) != 1:
        summary.append(f'{mid} APPLY-FAIL count={src.count(old)}')
        print(summary[-1], flush=True)
        continue
    open(path, 'w', encoding='utf8').write(src.replace(old, new))
    try:
        run = subprocess.run(['npx', 'vitest', 'run', '--reporter=verbose', TEST], cwd=copy, capture_output=True, text=True, timeout=600)
        out = re.sub(r'\x1b\[[0-9;]*m', '', run.stdout + run.stderr)
        open(os.path.join(logs, f'mutant-{mid}.log'), 'w', encoding='utf8').write(out)
        red = sorted({m.group(1) for m in re.finditer(r'(?:×|✗|FAIL)\s.*?(B2D-\d+)', out)})
    finally:
        open(path, 'w', encoding='utf8').write(src)
    ok = run.returncode != 0 and red == sorted(expected)
    summary.append(f"{mid} rc {run.returncode} red {','.join(red) or '-'} expected {','.join(sorted(expected))} {'OK' if ok else 'MISMATCH'}")
    print(summary[-1], flush=True)
summary.append(f'restored rc {0 if digest() == before else 1}')
open(os.path.join(logs, 'summary.txt'), 'w', encoding='utf8').write('\n'.join(summary) + '\n')
print(summary[-1])
