# L57 harness-field checker (RETRO 353, D-29z1131). Usage: python3 -I tools/l57-check.py <c-round-N.json> [out-file]
# Exit 0 only when all 12 L57 fields are present (a value or null) and every finding in bugs[] has an origin.
import json, sys
F = ['manifestPaths', 'missingPaths', 'countMismatches', 'claimCheckMinutes', 'assertsSpecified', 'mutantsRecorded',
     'mutantRedOnSketch', 'gateChecksNamed', 'gateChecksRunOnSketch', 'chainHeadGateRunGreen',
     'affectedChecksNamed', 'affectedChecksRunOnSketch']
if len(sys.argv) < 2:
    sys.exit('usage: l57-check.py <c-round-N.json> [out-file]')
c = json.load(open(sys.argv[1]))
absent = [f for f in F if f not in c]
nulls = [f for f in F if f in c and c[f] is None]
no_origin = [b.get('id') for b in (c.get('bugs') or []) if isinstance(b, dict) and not b.get('origin')]
lines = [f'file {sys.argv[1]}', f'absent {len(absent)} {absent}', f'null {len(nulls)} {nulls}',
         f'bugs-without-origin {len(no_origin)} {no_origin}']
ok = not absent and not no_origin
lines.append('L57 OK' if ok else 'L57 INCOMPLETE')
out = '\n'.join(lines) + '\n'
if len(sys.argv) > 2:
    open(sys.argv[2], 'w').write(out)
sys.stdout.write(out)
sys.exit(0 if ok else 1)
