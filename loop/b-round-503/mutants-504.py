# usage: python3 -I mutants-504.py <copy-of-store-tree-with-sketch> <absolute-log-dir>
# Applies each mutant to the copy, runs the 2c test file, records the failing rows, restores the file.
import hashlib, os, re, subprocess, sys

copy, logs = sys.argv[1], sys.argv[2]
os.makedirs(logs, exist_ok=True)
TEST = 'app/lib/__tests__/store-button-cleanup-2c.test.tsx'
PH = 'app/components/product/PurchaseHeader.tsx'
DL = "              className={buildButtonClassName({\n                size: 'lg',\n                className: 'min-w-[160px] whitespace-nowrap',\n              })}\n"
UPG = "              <Button\n                type=\"button\"\n                size=\"lg\"\n                onClick={onSelectPremium}\n"
UNL = "            <Button\n              type=\"button\"\n              size=\"lg\"\n              onClick={handleBuyNow}\n              disabled={isDisabled}\n"
MUTANTS = [
    ('M1', PH, DL, '              className="group px-6 py-3 bg-brand text-background font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 min-w-[160px] hover:bg-brand-hover"\n', ['B2C-1', 'B2C-2', 'B2C-8']),
    ('M2', PH, DL, "              className={buildButtonClassName({\n                size: 'lg',\n                shape: 'pill',\n                className: 'min-w-[160px] whitespace-nowrap',\n              })}\n", ['B2C-1', 'B2C-2']),
    ('M3', PH, "              to=\"/account/downloads\"\n              className={buildButtonClassName({\n", "              to=\"/account\"\n              className={buildButtonClassName({\n", ['B2C-1']),
    ('M4', PH, UPG, "              <Button\n                type=\"button\"\n                size=\"md\"\n                onClick={onSelectPremium}\n", ['B2C-3']),
    ('M5', PH, UPG, "              <Button\n                type=\"button\"\n                size=\"lg\"\n                onClick={handleBuyNow}\n", ['B2C-3']),
    ('M6', PH, UNL, "            <Button\n              type=\"button\"\n              size=\"lg\"\n              onClick={handleBuyNow}\n", ['B2C-5', 'B2C-6']),
    ('M7', PH, UNL, "            <Button\n              type=\"button\"\n              size=\"lg\"\n              onClick={handleBuyNow}\n              disabled={isDisabled}\n              isLoading={isBuyingNow}\n", ['B2C-5']),
    ('M8', PH, "      await buyNow(productId, productVariantId);\n", "      await buyNow(productId);\n", ['B2C-4']),
    ('M9', PH, 'className="group px-6 py-3 bg-buy text-brand-foreground', 'className="group px-6 py-3 bg-buy text-background', ['B2C-7']),
    ('M10', PH, "    if (!isAuthenticated) {\n      showToast('Please sign in to continue with your purchase', 'info');\n      openModal('signin');\n      return;\n    }\n", '', ['B2C-7']),
    ('M13', PH, UPG, "              <Button\n                size=\"lg\"\n                onClick={onSelectPremium}\n", ['B2C-3']),
    ('M11', TEST, "return /(?:^|[\\s\"'`])bg-brand(?:[\\s\"'`]|$)/.test(tag);", 'return tag.length < 0;', ['B2C-9']),
    ('M12', TEST, "      } else if (char === '>' && depth === 0) {", "      } else if (char === '>') {", ['B2C-9']),
]
FILES = [PH, TEST]
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
        red = sorted({m.group(1) for m in re.finditer(r'(?:×|✗|FAIL)\s.*?(B2C-\d)', out)})
    finally:
        open(path, 'w', encoding='utf8').write(src)
    ok = run.returncode != 0 and red == sorted(expected)
    summary.append(f"{mid} rc {run.returncode} red {','.join(red) or '-'} expected {','.join(sorted(expected))} {'OK' if ok else 'MISMATCH'}")
    print(summary[-1], flush=True)
summary.append(f'restored rc {0 if digest() == before else 1}')
open(os.path.join(logs, 'summary.txt'), 'w', encoding='utf8').write('\n'.join(summary) + '\n')
print(summary[-1])
