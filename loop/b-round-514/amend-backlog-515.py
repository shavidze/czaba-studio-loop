# B round 514 -> 515 planning, same planning amendment of v521 (advisor closing check). Run once from the loop root.
import json, os, re
P = 'backlog.json'
DONE = 'b-round-514/amend-backlog-515.applied'
assert not os.path.exists(DONE)
b = json.load(open(P, encoding='utf-8'))
assert b['version'] == 521
def find(lst, i):
    return next((f for f in lst if isinstance(f, dict) and f.get('id') == i), None)
c1 = find(b['open_findings'], 'C-R514-01')
c1['status'] = ('dispatched round 515 (D-29z1871): the round-515 sketch addresses it with the banner onBlur clearing (same file, cheap, round owns it); '
                'unit R515-T3/T7 + Chromium simulation P2 only; the real Safari/iOS half joins SAFARI-CHECKS, so this id stays open after C PASS until that manual check')
t = find(b['tech_lead_manual_checks'], 'TLM-R515-PHONE-KEYBOARD')
t['what'] = ('iPhone Safari and Android Chrome, Vercel preview, fresh storage: tap the home newsletter email field (keyboard opens), type, then tap Accept on the cookie banner. '
             'Guarantee checked: the banner never moves focus into a text field and the keyboard does not reopen after it closed; the field keeps its text; the page does not jump. '
             'Record (not assert): whether the keyboard stays open on a browser that does not focus a tapped button (focus is left where it is by design, R514-F9)')
g = find(b['open_findings'], 'GATE514-M1-POINTER-FIELD-KEYBOARD')
g['status'] = g['status'].replace('the on-screen keyboard half is a real-device manual row TLM-R515-PHONE-KEYBOARD (Chromium cannot show it)',
                                  'the on-screen keyboard half is a real-device manual row TLM-R515-PHONE-KEYBOARD (Chromium cannot show it; the row checks "never reopened by the banner", records the iPhone outcome)')
for f in (c1, g):
    assert not re.search(r'closed|done|resolved', f['status'], re.I), f['id']
d = find(b['decisions_log_b'], 'D-29z1871')
d['amendment'] = 'Same planning (advisor closing check): C-R514-01 status worded as "sketch addresses it" (not yet applied); TLM-R515-PHONE-KEYBOARD asserts only that the banner never reopens the keyboard and records the iPhone outcome; full vitest on the sketch 306/4435 rc 0 (b-round-514/precheck-full.log); header/banner route conditions claimed as K23.'
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(DONE, 'w').write('ok\n')
print('amended v521')
