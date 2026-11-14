# Round 516 mutants. Usage: python3 -I mutants-516.py <store-tree-with-sketch> <outDir>
# Each mutant edits one granted file in place, runs the N4 rows (+ B2E-6, LM dialog), records red/green, and restores the file byte-equal.
import json, os, subprocess, sys
root = os.path.abspath(sys.argv[1])
out = os.path.abspath(sys.argv[2])
os.makedirs(out, exist_ok=True)
SO = 'app/components/home/SpecialOffersSection.tsx'
LM = 'app/components/marketing/LeadMagnetPopup.tsx'
TESTS = ['app/lib/__tests__/store-button-cleanup-n4.test.tsx', 'app/lib/__tests__/store-button-cleanup-2e.test.tsx',
         'app/lib/__tests__/store-lead-magnet-dialog.test.tsx']
GIFT = "                to=\"/gift-cards\"\n                className={buildButtonClassName({\n                  variant: 'secondary',"
MUTANTS = [
    ('M1', 'gift link variant secondary -> ghost', SO, GIFT, GIFT.replace("'secondary'", "'ghost'")),
    ('M2', 'gift link loses w-fit', SO, "                  className: 'w-fit',\n                })}\n              >\n                Browse Gift Cards",
     "                  className: '',\n                })}\n              >\n                Browse Gift Cards"),
    ('M3', 'View Collection back to the hand-rolled literal', SO,
     "                to=\"/store\"\n                className={buildButtonClassName({\n                  variant: 'secondary',\n                  size: 'lg',\n                  className: 'w-fit',\n                })}",
     "                to=\"/store\"\n                className=\"w-fit cursor-pointer rounded-lg border border-outline bg-elevated px-6 py-3 font-medium transition-colors hover:border-outline-hover hover:bg-outline\""),
    ('M4', 'View Collection target /store -> /collections', SO, 'to="/store"', 'to="/collections"'),
    ('M5', 'Close back at top-6 right-6', LM, 'className="absolute top-4 right-4"', 'className="absolute top-6 right-6"'),
    ('M6', 'Close size lg -> md', LM, 'size="lg"\n        label="Close"', 'size="md"\n        label="Close"'),
    ('M7', 'Close glyph 24 -> 32', LM, '<X size={24} />', '<X size={32} />'),
    ('M8', 'Close variant ghost -> default', LM, 'variant="ghost"\n        size="lg"\n        label="Close"', 'variant="default"\n        size="lg"\n        label="Close"'),
    ('M9', 'Close loses closeButtonRef', LM, '      <IconButton\n        ref={closeButtonRef}\n', '      <IconButton\n'),
    ('M10', 'Close loses onClick', LM, '        label="Close"\n        onClick={close}\n', '        label="Close"\n'),
    ('M12', 'View Collection rendered as a plain <a href> (whole element)', SO,
     '              <Link\n                to="/store"\n                className={buildButtonClassName({\n                  variant: \'secondary\',\n                  size: \'lg\',\n                  className: \'w-fit\',\n                })}\n              >\n                View Collection\n              </Link>',
     '              <a\n                href="/store"\n                className={buildButtonClassName({\n                  variant: \'secondary\',\n                  size: \'lg\',\n                  className: \'w-fit\',\n                })}\n              >\n                View Collection\n              </a>'),
    ('M11', 'Close back to a hand-rolled button', LM,
     '      <IconButton\n        ref={closeButtonRef}\n        type="button"\n        variant="ghost"\n        size="lg"\n        label="Close"\n        onClick={close}\n        className="absolute top-4 right-4"\n      >\n        <X size={24} />\n      </IconButton>',
     '      <button\n        ref={closeButtonRef}\n        type="button"\n        onClick={close}\n        className="absolute top-6 right-6 text-foreground/60 hover:text-foreground transition-colors cursor-pointer"\n        aria-label="Close"\n      >\n        <X size={32} />\n      </button>'),
]
summary = {}
for mid, what, rel, old, new in MUTANTS:
    p = os.path.join(root, rel)
    orig = open(p, encoding='utf-8').read()
    assert orig.count(old) == 1, (mid, orig.count(old))
    try:
        open(p, 'w', encoding='utf-8').write(orig.replace(old, new))
        r = subprocess.run(['npx', 'vitest', 'run', '--reporter=verbose', *TESTS], cwd=root, capture_output=True, text=True, timeout=600)
        log = r.stdout + r.stderr
        open(os.path.join(out, mid + '.log'), 'w').write(log)
        failed = sorted({ln.strip().split(' > ')[-1][:80] for ln in log.splitlines() if ln.strip().startswith(('×', '✗')) or ' FAIL ' in ln and '>' in ln})
        summary[mid] = {'what': what, 'rc': r.returncode, 'red': r.returncode != 0, 'failedRows': failed}
    finally:
        open(p, 'w', encoding='utf-8').write(orig)
json.dump(summary, open(os.path.join(out, 'mutants-summary.json'), 'w'), indent=1, ensure_ascii=False)
print(json.dumps({k: (v['red'], len(v['failedRows'])) for k, v in summary.items()}))
