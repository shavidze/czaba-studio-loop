"""Completeness probe (B round 371, row MIGRATION-COMPLETE of round 372).

Usage: python3 -I remove-status-fields.py <store-tree-copy>
On a COPY of a tree (never store/), deletes `status`, `statusSequence` and `statusKey`
from `interface ArrangementContextValue` and from the provider's value object(s) in
app/contexts/ArrangementContext.tsx. Then run `npx tsc --noEmit -p .` in that copy:
every file that still errors reads committed status from the context value.
"""

import re
import sys
from pathlib import Path

path = Path(sys.argv[1]) / 'app/contexts/ArrangementContext.tsx'
lines = path.read_text().split('\n')
out = []
in_interface = False
removed_interface = 0
removed_value = 0
for line in lines:
    if line.startswith('interface ArrangementContextValue {'):
        in_interface = True
    elif in_interface and line.startswith('}'):
        in_interface = False
    if in_interface and re.fullmatch(r'  (status|statusSequence|statusKey): (string|number);', line):
        removed_interface += 1
        continue
    if re.fullmatch(r'\s{6}(status|statusSequence|statusKey),', line):
        removed_value += 1
        continue
    out.append(line)
path.write_text('\n'.join(out))
print(f'removed interface fields: {removed_interface}, value shorthand lines: {removed_value}')
if removed_interface != 3 or removed_value % 3 != 0 or removed_value == 0:
    raise SystemExit('unexpected shape: the probe did not find the fields it expects')
