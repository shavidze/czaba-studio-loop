import json
import os
import shutil
import sys

ROOT = '/home/runner/czaba-project/tmp/studio-real-loop'
PATH = ROOT + '/backlog.json'
DONE = ROOT + '/b-round-479/update-backlog-fix.done'
BY = '2026-11-12 B round 479 -> 480 planning (RETRO 480, advisor closing check)'
if os.path.exists(DONE):
    print('refused: .done marker exists')
    sys.exit(0)
with open(PATH, encoding='utf-8') as fh:
    b = json.load(fh)
if 'D-29z1707' in {d['id'] for d in b['decisions_log_b']}:
    print('already applied')
    sys.exit(0)
shutil.copyfile(PATH, ROOT + '/b-round-479/backlog-before-fix.json')
b['version'] += 1
b['updated'] = BY
b['decisions_log_b'].append({'id': 'D-29z1707', 'date': '2026-11-12', 'by': BY, 'decision': (
    'Advisor closing-check corrections for RETRO 480: RETRO480-SINGLE-RUNNER-CONTROL stays 1x (its only case is round 469); '
    'FIREFOX-CHECKS/SAFARI-CHECKS/HIREUS-EMAIL-CLIENTS keep the non-blocking open_root / open_tech_lead_manual class; '
    'SIG-R477-DOCS-OUTSIDE-DESIGN, B-R471-SKETCH-UNREVIEWED, B-R472-LINE-GRANTS and ARCH-CHECKPOINT-STYLE-SCAN ruled; '
    'staleness check widened to fonts: DESIGN_TOKENS.md l.57-59 and TAILWIND_FIRST.md l.101/105 (Playfair/Inter) and '
    'docs/design/DESIGN_SYSTEM.md l.750-761 are stale against app.css (Instrument Sans / IBM Plex Mono) -> input to '
    'DPG-FONT-RESOLVE (loop doc) and ROOT-REQ-DPG-PRIMITIVES-PATCH (.claude); L47 clause reworded "once an announcer exists" '
    '(edit-lessons-4.py).')})

for c in b['retro_candidates']:
    if c.get('id') == 'RETRO480-SINGLE-RUNNER-CONTROL':
        c['status'] = c['status'].replace('round 469 BLOCKED is the same class (2x); stays a counter to RETRO 495 (lessons byte limit)',
                                          'still 1x (round 469 is its only case); stays a counter to RETRO 495 (D-29z1707)')

pref = {'FIREFOX-CHECKS': 'open_root (D-29z1707; does not block): ', 'SAFARI-CHECKS': 'open_tech_lead_manual (D-29z1707; does not block): ',
        'HIREUS-EMAIL-CLIENTS': 'open_tech_lead_manual (D-29z1707; does not block): '}
for f in b['open_findings']:
    if f.get('id') in pref:
        f['status'] = pref[f['id']] + f['status']
    if f.get('id') == 'B-R471-SKETCH-UNREVIEWED':
        f['status'] = 'ruled (D-29z1707): process record; covered by RC-R471-L58-SKIPPED and the RETRO 495 counter l58-check 15/15 | ' + f['status']
    if f.get('id') == 'B-R472-LINE-GRANTS':
        f['status'] = 'ruled (D-29z1707): covered by L26 whole-doc accuracy grant; no recurrence 473-479 | ' + f['status']

for s in b['architecture_signals']:
    if s.get('id') == 'SIG-R477-DOCS-OUTSIDE-DESIGN':
        s['status'] = ('checked at RETRO 480 (D-29z1707): docs/technical/overview.md 3, components/ui-components.md 1, '
                       'docs/prompts/modules/design-system.prompt.md 1 teal/cyan lines (b-round-479/primitive-staleness.txt); '
                       'input to the DPG docs follow-up after P1, not tasked now | ' + s['status'])

for r in b['architecture_checkpoint_requests']:
    if r.get('id') == 'ARCH-CHECKPOINT-STYLE-SCAN':
        r['status'] = ('deadline round 480 passed unanswered (D-29z1707): SYS-R465-DEAD-CSS-MATCHER planned without it (D-29z1706); '
                       'request stays open for root | ' + r['status'])

for r in b['root_requests_b']:
    if r.get('id') == 'ROOT-REQ-DPG-PRIMITIVES-PATCH':
        r['note'] = r['note'] + (' | RETRO 480 (D-29z1707): still unapplied at bbb3193 (DESIGN_TOKENS.md l.9, l.26, l.108 teal); '
                                 'also fonts: DESIGN_TOKENS.md l.57-59 and TAILWIND_FIRST.md l.101/105 name Playfair Display / Inter, '
                                 'app.css has Instrument Sans / IBM Plex Mono (b-round-479/primitive-staleness.txt)')

for e in b['post_current_stage_queue']:
    if e.get('id') == 'DPG-FIX':
        p = e.get('p1_progress_d29z1697')
        if isinstance(p, dict):
            p['DPG-FONT-RESOLVE'] = (str(p.get('DPG-FONT-RESOLVE', '')) + ' | input (D-29z1707): docs/design/DESIGN_SYSTEM.md l.750-761 '
                                     '"Why Playfair Display + Inter?" is stale against app.css l.113-115')

with open(PATH, 'w', encoding='utf-8') as fh:
    json.dump(b, fh, indent=2, ensure_ascii=True)
open(DONE, 'w').write('applied v%d\n' % b['version'])
print('applied', b['version'])
