# B round 352 -> 353: post-run patch of backlog.json text after L58 was restored to 2908 bytes (was applied inline once; saved here for traceability, D-29z1131). Not re-runnable in effect: the replaced strings no longer exist.
import json
b = json.load(open('backlog.json'))
for d in b['decisions_log_b']:
    if d['id'] == 'D-29z1131':
        d['text'] = d['text'].replace('2803 -> 2799 bytes', '2803 -> 2908 bytes (the old unruled-Medium planning-FAIL rule and its A-R327 evidence restored; tech-lead had asked for no growth, retro-353 section 7)')
for r in b['retro_candidates']:
    if r['id'] == 'RC-R305-LESSON-CHAR-CAP':
        r['status'] = r['status'].replace('L58 2799 bytes', 'L58 2908 bytes')
b['retro_policy']['signals_for_next_retro'][0] = b['retro_policy']['signals_for_next_retro'][0].replace('L58 2799', 'L58 2908')
json.dump(b, open('backlog.json', 'w'), indent=2)
