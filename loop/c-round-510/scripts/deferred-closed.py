# RETRO 510: deferred_low_polish entries closed in the window: status begins with closed/fixed/done/resolved and the first D-29z id in that leading status segment is in 1772..1843. Run from the loop root.
import json, re
d = json.load(open('b-round-509/backlog-retro-input.json'))
n = []
for x in d['deferred_low_polish']:
    s = str(x.get('status', ''))
    seg = s.split(' | ')[0]
    if re.match(r'\s*(closed|fixed|done|resolved)', seg, re.I):
        m = re.findall(r'D-29z(\d+)', seg)
        if m and 1772 <= int(m[0]) <= 1843:
            n.append(x['id'])
print('deferred closed in window 495-509:', len(n)); print('\n'.join(n))
