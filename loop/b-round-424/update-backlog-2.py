# B round 424 -> 425, second pass after the close advisor call (v401, no version bump). Run once from the loop root.
import json, os, sys
DONE = 'b-round-424/update-backlog-2.done'
if os.path.exists(DONE):
    sys.exit('already applied')
p = 'backlog.json'
b = json.load(open(p, encoding='utf-8'))
if b.get('version') != 401 or b['decisions_log_b'][-1]['id'] != 'D-29z1486':
    sys.exit('unexpected backlog state')
n = 0
for d in b['decisions_log_b']:
    if d['id'] == 'D-29z1484':
        old = 'in one round: C time for rounds 389 + 390 was 1.03 h + 0.34 h (metrics/rounds.csv), well under the 350-minute job; PARTIAL resumes from progress.json.'
        assert old in d['decision']
        d['decision'] = d['decision'].replace(old, 'in one round: metrics/rounds.csv shows 1.03 h + 0.34 h for C rounds 389 + 390, but rounds 341 + 342 ran the same round-340 template in 3.16 h + 0.44 h, so the round may take up to about 4.6 h of a 350-minute job; a time-limit stop is PARTIAL and resumes from progress.json (outcome table). Oracles: each round-390 row compares with the evidence path that row cites in c-round-390.md (c-round-390/out, t258/out, t301, t301x) or the older oracle it used; round-389 pins taken before rounds 391-422 (HEAP live counts, EVICT one stop()) are record with ruling; a diff C attributes to a named round 391-424 goes to lookups for B to rule, an unattributed diff is a finding.'); n += 1
    if d['id'] == 'D-29z1485':
        old = 'its intent, no layout shift on focus, is the RS-4B sub-check, which round 425 runs on the same tree; not carried again.'
        assert old in d['decision']
        d['decision'] = d['decision'].replace(old, 'its intent, no layout shift on focus, is partly covered by the RS-4B sub-check (/ and a product page); the AuthModal empty submit and /store are not; round 425 adds a record-only box capture R425-NOSHIFT-BOXES (product page, AuthModal before and after the empty submit, /store, both viewports) that becomes the next regression oracle; not carried again.'); n += 1
if n != 2:
    sys.exit('decisions not found')
for r in b['architecture_checkpoint_requests']:
    if r.get('id') == 'ARCH-CHECKPOINT-STEM-LANES':
        r['note_d29z1486'] = 'attach SIG-R424-BOUNDARY-FIBER-GUARD: the ArrangementLane shell/inner boundary was reshaped twice (409, 424); STEM-LANES touches the same lane code, so the checkpoint should say where per-gesture subscriptions live and whether a unit fiber-count guard is required for boundary changes'; n += 1
if n != 3:
    sys.exit('ARCH-CHECKPOINT-STEM-LANES not found')
open(p, 'w', encoding='utf-8').write(json.dumps(b, ensure_ascii=True, indent=2))
open(DONE, 'w').write('applied\n')
print('ok')
