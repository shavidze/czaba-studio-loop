# usage: python3 -I mutants-506.py <copy-of-store-tree-with-sketch> <absolute-log-dir>
# Applies each mutant to the copy, runs the 2e test file and store-theme-tokens, records the failing rows
# (B2E-n and ST5), restores the file.
import hashlib, os, re, subprocess, sys

copy, logs = sys.argv[1], sys.argv[2]
os.makedirs(logs, exist_ok=True)
TESTS = ['app/lib/__tests__/store-button-cleanup-2e.test.tsx', 'app/lib/__tests__/store-theme-tokens.test.ts']
LM = 'app/components/marketing/LeadMagnetPopup.tsx'
FREE = '            <Button\n              type="button"\n              size="lg"\n              fullWidth\n              onClick={handleContinueToEmail}\n              className="max-w-[320px] uppercase tracking-wide"\n            >\n              FREE DOWNLOAD\n            </Button>\n'
CONT = '              <Button\n                type="submit"\n                size="lg"\n                fullWidth\n                disabled={isSubmitting}\n                className="uppercase tracking-wide"\n              >\n'
BACK = '            <Button\n              ref={backToSiteButtonRef}\n              type="button"\n              size="lg"\n              fullWidth\n              onClick={handleBackToSite}\n              className="max-w-[320px] uppercase tracking-wide"\n            >\n'
HEAD_FREE = '            <button\n              type="button"\n              onClick={handleContinueToEmail}\n              className="w-full max-w-[320px] py-4 px-8 bg-brand hover:bg-brand-hover text-background font-semibold uppercase tracking-wide rounded-md transition-colors cursor-pointer"\n            >\n              FREE DOWNLOAD\n            </button>\n'
MUTANTS = [
    ('M1', LM, FREE, FREE.replace('size="lg"', 'size="md"'), ['B2E-1']),
    ('M2', LM, FREE, FREE.replace('              fullWidth\n', ''), ['B2E-1']),
    ('M3', LM, FREE, FREE.replace('              type="button"\n', ''), ['B2E-1']),
    ('M4', LM, FREE, HEAD_FREE, ['B2E-1', 'B2E-6', 'ST5']),
    ('M5', LM, CONT, CONT.replace('                size="lg"\n', '                variant="destructive"\n                size="lg"\n'), ['B2E-2', 'B2E-3']),
    ('M6', LM, CONT, CONT.replace('disabled={isSubmitting}', 'isLoading={isSubmitting}'), ['B2E-3', 'B2E-6']),
    ('M7', LM, CONT, CONT.replace('                disabled={isSubmitting}\n', ''), ['B2E-3']),
    ('M8', LM, CONT, CONT.replace('className="uppercase tracking-wide"', 'className="uppercase tracking-wide bg-destructive"'), ['B2E-2', 'B2E-3', 'B2E-6', 'ST5']),
    ('M9', LM, '    if (!isValidEmail(email)) {\n', '    if (!isValidEmail(email) && email.length < 0) {\n', ['B2E-4']),
    ('M10', LM, BACK, BACK.replace('              ref={backToSiteButtonRef}\n', ''), ['B2E-5']),
    ('M11', LM, BACK, BACK.replace('              onClick={handleBackToSite}\n', ''), ['B2E-5']),
    ('M12', LM, BACK, BACK.replace('size="lg"', 'size="sm"'), ['B2E-5']),
    ('M13', LM, '              BACK TO SITE\n', '              Back to site\n', ['B2E-5', 'B2E-6']),
    ('M14', LM, "{isSubmitting ? 'SENDING...' : 'CONTINUE'}", "{isSubmitting ? 'Sending' : 'CONTINUE'}", ['B2E-3', 'B2E-6', 'ST5']),
]
FILES = [LM] + TESTS
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
        run = subprocess.run(['npx', 'vitest', 'run', '--reporter=verbose'] + TESTS, cwd=copy, capture_output=True, text=True, timeout=900)
        out = re.sub(r'\x1b\[[0-9;]*m', '', run.stdout + run.stderr)
        open(os.path.join(logs, f'mutant-{mid}.log'), 'w', encoding='utf8').write(out)
        red = sorted({m.group(1) for m in re.finditer(r'(?:×|✗)\s.*?\b(B2E-\d+|ST5)\b', out)})
    finally:
        open(path, 'w', encoding='utf8').write(src)
    ok = run.returncode != 0 and red == sorted(expected)
    summary.append(f"{mid} rc {run.returncode} red {','.join(red) or '-'} expected {','.join(sorted(expected))} {'OK' if ok else 'MISMATCH'}")
    print(summary[-1], flush=True)
summary.append(f'restored rc {0 if digest() == before else 1}')
open(os.path.join(logs, 'summary.txt'), 'w', encoding='utf8').write('\n'.join(summary) + '\n')
print(summary[-1])
