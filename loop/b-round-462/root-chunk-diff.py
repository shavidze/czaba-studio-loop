"""Usage: python3 -I root-chunk-diff.py <head build dir> <tree build dir>
Compares the client root-*.js chunk of two remix builds after asset-hash normalization; prints every non-equal span
and whether it is a 1-2 character identifier rename. Last line: non-identifier-changes=<n>."""
import re, difflib, os, sys
def get(d):
    a = f'{d}/client/assets'; f = [x for x in os.listdir(a) if x.startswith('root-') and x.endswith('.js')]
    assert len(f) == 1, f
    return re.sub(r'-[A-Za-z0-9_-]{8}\.(js|css)', r'-HASH.\1', open(f'{a}/{f[0]}', encoding='utf-8').read())
h, t = get(sys.argv[1]), get(sys.argv[2])
ops = [o for o in difflib.SequenceMatcher(None, h, t, autojunk=False).get_opcodes() if o[0] != 'equal']
print('non-equal opcodes', len(ops)); bad = 0
for o in ops:
    a, b = h[o[1]:o[2]], t[o[3]:o[4]]
    ok = bool(re.fullmatch(r'[A-Za-z_$]{1,2}', a) and re.fullmatch(r'[A-Za-z_$]{1,2}', b))
    bad += not ok
    print(o[0], repr(a), '=>', repr(b), 'identifier' if ok else 'OTHER')
print(f'non-identifier-changes={bad} length head={len(h)} tree={len(t)}')
