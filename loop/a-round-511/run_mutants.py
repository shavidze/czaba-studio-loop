import json
import re
import subprocess
import sys

ROOT = '/tmp/n2-mut'
TARGET = f'{ROOT}/app/components/product/PurchaseHeader.tsx'
TESTS = [
    'app/lib/__tests__/store-button-cleanup-n2.test.tsx',
    'app/lib/__tests__/store-button-cleanup-2c.test.tsx',
    'app/lib/__tests__/store-theme-tokens.test.ts',
]
PRISTINE = open(TARGET, encoding='utf-8').read()
BUY_CLASS = 'className="min-w-[120px] whitespace-nowrap aria-disabled:opacity-50 aria-disabled:cursor-not-allowed!"'


def seg(src, start, end, old, new):
    i = src.index(start)
    j = src.index(end, i)
    part = src[i:j]
    assert part.count(old) >= 1, (start, old)
    return src[:i] + part.replace(old, new, 1) + src[j:]


BUY = ('variant="buy"', '</Button>')
STUDIO = ('to={recordingsHref}', 'Open in Studio')
CASE2 = ('Already Owned', 'Upgrade to Premium')
CART = ('function CartButton', 'alreadyInCart\n')


def g(src, old, new):
    assert src.count(old) == 1, old
    return src.replace(old, new)


MUTANTS = [
    ('M1', 'Buy Now variant buy -> primary', lambda s: g(s, 'variant="buy"', 'variant="primary"'), ['N2-1', 'B2C-7']),
    ('M2', 'Buy Now drops aria-disabled:opacity-50', lambda s: g(s, BUY_CLASS, BUY_CLASS.replace(' aria-disabled:opacity-50', '')), ['N2-1']),
    ('M3', 'Buy Now aria-disabled removed', lambda s: g(s, 'aria-disabled={isPriceUnknown || undefined}', ''), ['N2-2']),
    ('M4', 'Buy Now aria-describedby removed', lambda s: g(s, 'aria-describedby={isPriceUnknown ? priceReasonId : undefined}', ''), ['N2-2']),
    ('M5', 'Buy Now disabled removed', lambda s: seg(s, *BUY, 'disabled={isDisabled}', ''), ['N2-3', 'N2-4']),
    ('M6', 'Buy Now adds isLoading', lambda s: g(s, 'variant="buy"', 'variant="buy"\n            isLoading={isBuyingNow}'), ['N2-3']),
    ('M7', 'Buy Now type removed', lambda s: g(s, 'type="button"\n            variant="buy"', 'variant="buy"'), ['N2-1']),
    ('M8', 'Buy Now onClick swap to handleAddToCart', lambda s: seg(s, *BUY, 'onClick={handleBuyNow}', 'onClick={handleAddToCart}'), ['N2-8']),
    ('M9', 'Open in Studio secondary -> primary', lambda s: seg(s, *STUDIO, "variant: 'secondary'", "variant: 'primary'"), ['N2-5']),
    ('M10', 'Open in Studio lg -> md', lambda s: seg(s, *STUDIO, "size: 'lg'", "size: 'md'"), ['N2-5']),
    ('M11', 'Case-2 Downloads to /account', lambda s: seg(s, *CASE2, 'to="/account/downloads"', 'to="/account"'), ['N2-6']),
    ('M12', 'Case-2 Downloads gets Upgrade class (primary)', lambda s: seg(s, *CASE2, "variant: 'secondary',\n                size: 'lg',\n                className: 'whitespace-nowrap',", "size: 'lg',\n                className: 'min-w-[160px] whitespace-nowrap',"), ['N2-6']),
    ('M13', 'CartButton rounded-md -> rounded-lg', lambda s: seg(s, *CART, 'rounded-md', 'rounded-lg'), ['N2-7']),
    ('M14', 'CartButton font-semibold -> font-medium', lambda s: seg(s, *CART, 'font-semibold', 'font-medium'), ['N2-7']),
    ('M15', 'Buy Now adds pointer-events-none', lambda s: g(s, BUY_CLASS, BUY_CLASS[:-1] + ' pointer-events-none"'), ['N2-1']),
    ('M16', 'Open in Studio to -> /account/downloads', lambda s: g(s, 'to={recordingsHref}', 'to="/account/downloads"'), ['N2-5']),
    ('M17', 'Case-2 Downloads secondary -> ghost', lambda s: seg(s, *CASE2, "variant: 'secondary'", "variant: 'ghost'"), ['N2-6']),
    ('M18', 'Case-2 Downloads lg -> md', lambda s: seg(s, *CASE2, "size: 'lg'", "size: 'md'"), ['N2-6']),
    ('M19', 'Buy Now size lg -> md', lambda s: g(s, 'variant="buy"\n            size="lg"', 'variant="buy"\n            size="md"'), ['N2-1']),
    ('M20', 'Buy Now onClick removed', lambda s: seg(s, *BUY, 'onClick={handleBuyNow}', ''), ['N2-8']),
    ('M21a', 'CartButton px-6 -> px-5', lambda s: seg(s, *CART, 'px-6', 'px-5'), ['N2-7']),
    ('M21b', 'CartButton text-base removed', lambda s: seg(s, *CART, ' text-base', ''), ['N2-7']),
    ('M22', 'Buy Now drops aria-disabled:cursor-not-allowed!', lambda s: g(s, BUY_CLASS, BUY_CLASS.replace(' aria-disabled:cursor-not-allowed!', '')), ['N2-1']),
    ('M23', 'Buy Now adds text-foreground', lambda s: g(s, BUY_CLASS, BUY_CLASS[:-1] + ' text-foreground"'), ['N2-1', 'ST5']),
    ('MA1', 'Buy Now natively disabled when price unknown (focus loss)', lambda s: seg(s, *BUY, 'disabled={isDisabled}', 'disabled={isDisabled || isPriceUnknown}'), ['N2-2']),
    ('MA2', 'buy tag becomes PrimaryButton (variant=buy kept)', lambda s: g(s, '<Button\n            type="button"\n            variant="buy"', '<PrimaryButton\n            type="button"\n            variant="buy"').replace('import { Button, buildButtonClassName }', 'import { Button, PrimaryButton, buildButtonClassName }').replace('          </Button>\n        </div>\n      </div>\n      {isPriceUnknown', '          </PrimaryButton>\n        </div>\n      </div>\n      {isPriceUnknown'), ['ST5']),
]


def failing_rows(report):
    rows = set()
    for file_result in report.get('testResults', []):
        for assertion in file_result.get('assertionResults', []):
            if assertion.get('status') != 'passed':
                match = re.match(r'(N2-\d|B2C-\d+|ST\d+)', assertion.get('title', ''))
                rows.add(match.group(1) if match else assertion.get('title', ''))
    return sorted(rows)


results = []
only = sys.argv[1:]
for mid, desc, edit, expected in MUTANTS:
    if only and mid not in only:
        continue
    mutated = edit(PRISTINE)
    assert mutated != PRISTINE, mid
    open(TARGET, 'w', encoding='utf-8').write(mutated)
    out = f'/tmp/n2-mutscripts/{mid}.json'
    subprocess.run(['npx', 'vitest', 'run', '--reporter=json', f'--outputFile={out}', *TESTS], cwd=ROOT, capture_output=True, timeout=300)
    try:
        red = failing_rows(json.load(open(out)))
    except (OSError, ValueError):
        red = ['RUN-ERROR']
    missing = [row for row in expected if row not in red]
    status = 'RED-OK' if not missing else 'MISSING:' + ','.join(missing)
    results.append((mid, desc, expected, red, status))
    print(f'{mid}\t{desc}\texpected={",".join(expected)}\tred={",".join(red)}\t{status}', flush=True)
open(TARGET, 'w', encoding='utf-8').write(PRISTINE)
