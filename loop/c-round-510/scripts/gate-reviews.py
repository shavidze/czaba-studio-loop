# RETRO 435: replaces the b-round-419 copy, whose '### Critical/Suggestions' parser counted 0 for reviews that use
# '## Findings' or bare numbered lists (421, 427-429, 431, 434). Counts top-level numbered items before the first
# '## What I checked' / '## Architecture note' heading, and tags each by its first severity word.
import re, os, collections
tot = collections.Counter()
for n in range(495, 510):
    f = f'gates/round-{n}/review.md'
    if not os.path.exists(f): print(n, 'no review.md (gate skipped)'); continue
    t = open(f).read()
    commit = re.search(r'COMMIT: ?\**\s*([A-Z]+)', t); score = re.search(r'Score:?\s*\**\s*([0-9.]+)\s*/\s*10', t)
    head = re.split(r'\n#+\s*(What I checked|Architecture note|Checked)', t)[0]
    items = re.findall(r'^\d+\.\s+(.{0,60})', head, re.M)
    sev = collections.Counter()
    for it in items:
        m = re.search(r'\b(Critical|High|Medium|Low|Info)\b', it, re.I)
        sev[m.group(1).lower() if m else 'unlabelled'] += 1
    tot.update(sev)
    print(n, 'commit', commit.group(1) if commit else None, 'score', score.group(1) if score else None, 'items', len(items), dict(sev))
print('total numbered review items', sum(tot.values()), dict(tot))
