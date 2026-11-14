import json, sys
P = sys.argv[1]
b = json.load(open(P))
assert b['version'] == 515, b['version']
BY = '2026-11-14 B round 509 -> 510 planning (advisor closing check)'
def find(sec, i):
    for x in b[sec]:
        if isinstance(x, dict) and x.get('id') == i: return x
    raise KeyError(i)
st = {'INFO-C505-UNRULED-STOP-PASS': 'closed (D-29z1849): used in retros/retro-510.md section 3 (C wrote PASS on an unruled STOP and gate 505 published before B ruled; L22 not followed) and section 4',
      'INFO-B505-SKETCH-REVIEWER-MEDIUM': 'closed (D-29z1849): used in retros/retro-510.md section 3 (505 row; same test-strength class, lesson L52 RETRO 510 clause)',
      'INFO-B497-C15-UNMEASURED-ASSERT': 'closed (D-29z1849): used in retros/retro-510.md section 4 as the window\'s one L58 recurrence (B asserted an unmeasured number)'}
for i, s in st.items():
    x = find('open_findings', i)
    x['status'] = s + ' | ' + x['status']
for r in b['retro_runs']:
    if r.get('round') == 510:
        r['lessons'] = r['lessons'].replace('57164 -> 57435 B', '57164 -> 57494 B').replace('logs edit-lessons.log, edit-lessons-2.log', 'logs edit-lessons.log, edit-lessons-2.log, edit-lessons-3.log (E7 L26 per input origin + grep open findings restored)')
        r['counters_result'] = r['counters_result'] + '; met 3 of 10 (the STOP counter is one compound target: B-spec half missed, doc half met)'
b['decisions_log_b'].append({"id": "D-29z1849", "date": "2026-11-14", "by": BY, "decision": "Advisor closing-check corrections to RETRO 510: stops-head.sh misses only 496 (not 496 and 505); counters met 3 of 10, not 4; 11 of 15 rounds used a full byte sketch (496, 498-507), not all; round 505 row: C wrote PASS on an unruled STOP and gate 505 published before B ruled (INFO-C505-UNRULED-STOP-PASS); recorded origins quoted (496 A code-reviewer, 499/505 B spec, 507 B pre-check), 'all on B sketch test lines' labelled tech-lead's classification; INFO-B497-C15 = the window's L58 recurrence; root-cause grouping added to retro section 4; lessons E7 restores 'per input origin' and 'greps open findings on touched files' in L26 (57,494 B); B dry-ran the WAV export (b-round-509/probe/play-wav.json: 24-bit stereo 48 kHz, peak 1.0, RMS 0.172 at both viewports) and the ledger-check fixture (b-round-509/probe/ledger-test: no ledger rc 1, ledger rc 0); task rows 3, 6, 9, 10 reworded accordingly."})
b['version'] = 516
b['updated'] = BY
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print('ok v516')
