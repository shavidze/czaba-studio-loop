# B round 464 -> 465 planning, part 3 (advisor closing check): corrected deferred-Low count, fix-up chains, round-463 unruled Medium. Usage: python3 -I b-round-464/update-backlog-fix.py <loop root>. Idempotent (.done).
import json, os, sys
L = sys.argv[1]; P = f'{L}/backlog.json'; DONE = f'{L}/b-round-464/update-backlog-fix.done'
if os.path.exists(DONE): print('already applied'); sys.exit(0)
b = json.load(open(P, encoding='utf-8')); b['version'] += 1
s = b['retro_policy']['signals_for_next_retro']
old = 'new deferred Lows <= 35 (window 450-464: 52 by added-at planning, b-round-464/data/deferred-added.txt; 49 by id round, classify.txt)'
assert old in s[0]
s[0] = s[0].replace(old, 'new deferred Lows <= 35 (window 450-464: 78 by the union method of b-round-464/data/deferred-added.txt; the added-at method alone gave 52 because many entries have no added field; 49 by id round, classify.txt)')
s[0] = s[0].replace('deferred Lows 52 MISSED (<= 30)', 'deferred Lows 78 MISSED (<= 30); fix-up chains <= 1 MISSED (4 chains: 451-452, 456-458, 459-461, 463-464; two of length 2); unruled-Medium STOP -> short FAIL PARTLY (round 463: A wrote "Needs B ruling (not a STOP)" on A-R463-REVIEW-M1, C PASS with Low C-R463-01, gate 463 published d55ec17 at 08:18Z before B ruled; no visible effect)')
rr = next(r for r in b['retro_runs'] if r.get('round') == 465)
rr['correction'] = 'advisor closing check (D-29z1641): deferred count 52 -> 78 (union method), fix-up-chain and round-463 counter rows added, l4-check.sh saved, L58 heading fixed'
b['decisions_log_b'].append({'id': 'D-29z1641', 'date': '2026-11-12', 'by': '2026-11-12 B round 464 -> 465 planning (RETRO 465, advisor closing check)', 'decision':
    'Corrections before hand-off: new deferred Lows of the window counted by the union of added-at planning, first D-ID 1602..1640 and id round (deferred-added.py: 78; the added-at method alone gave 52); RETRO 450 counter table adds fix-up chains (MISSED, 4 chains, max length 2) and states the round-463 unruled Medium published by gate 463 (PARTLY); l4-check greps saved as b-round-464/l4-check.sh; L58 heading "and the review claim" dropped with its removed sentence, evidence (2x) -> (1x); §3/§5 avoiding-rule column labelled tech-lead opinion; walker cluster ruled (owner STORE-2b-3c-2b / TL-R455-WALKER-LIMITS, not in SYS-R465).'})
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(DONE, 'w').write('applied\n'); print('ok version', b['version'])
