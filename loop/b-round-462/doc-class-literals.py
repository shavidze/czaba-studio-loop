"""Usage: python3 -I doc-class-literals.py <doc.md> <pruned-list.txt>
Counts whole-token literals in a doc of (a) every removed class that no app source renders (classes of removed selector
branches minus generic live classes such as active/container, judged from css-inventory-head.json next to this script),
(b) every removed @keyframes name, (c) the 12 retired Tailwind utilities of round 462 (b-round-461/css-removed-live-grep.txt).
Tailwind v4 scans docs/*.md, so such literals can bring CSS back into the bundle (C-R462-01). Last line: literals=<n>."""
import json, os, re, sys
doc, pruned = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
inv = json.load(open(os.path.join(here, 'css-inventory-head.json')))
dead_classes = {c for b in inv if b.get('dead') for c in b['classes'] if not b['users'].get(c)}
keyframes = [l.split()[-1] for l in open(pruned) if '@keyframes' in l]
util_file = os.path.join(os.path.dirname(here), 'b-round-461', 'css-removed-live-grep.txt')
utilities = [l.rsplit(':', 1)[0].strip() for l in open(util_file).read().splitlines()[1:] if l.strip()]
text = open(doc, encoding='utf-8').read()
hits = []
for name in sorted(dead_classes) + keyframes + utilities:
    n = len(re.findall(r'(?<![\w-])' + re.escape(name) + r'(?![\w-])', text))
    if n: hits.append(f'{name}: {n}')
print('\n'.join(hits))
print(f'checked={len(dead_classes) + len(keyframes) + len(utilities)} literals={len(hits)}')
