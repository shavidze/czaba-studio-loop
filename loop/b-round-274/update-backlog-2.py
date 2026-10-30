import json
P = 'backlog.json'
d = json.load(open(P))
assert d['version'] == 239
T = {'GATE232-S2': ('open_findings', 'L46 deadline passed twice (RETRO 260, RETRO 275) without an answer: the Windows AltGr platform half is a Saba-owned manual item in the final acceptance list (D-29z610); contract half verified C round 264'),
     'GATE244-S4': ('deferred_low_polish', 'L46 deadline passed twice (RETRO 260, RETRO 275) without an answer: the macOS Ctrl+click half is a Saba-owned manual item in the final acceptance list (D-29z610); contract half verified C round 264')}
for i, (pool, text) in T.items():
    for x in d[pool]:
        if x.get('id') == i:
            x['l46_retro275'] = text
json.dump(d, open(P, 'w'), indent=1, ensure_ascii=False)
print('ok')
