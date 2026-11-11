"""B round 446 -> 447 planning, advisor follow-up: 2b-2a narrowed to 21/7, stems hits -> STORE-4. Idempotent."""
import json, os, sys
LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
DONE = f'{LOOP}/b-round-446/update-backlog-2.done'
if os.path.exists(DONE):
    sys.exit('already applied')
p = f'{LOOP}/backlog.json'
b = json.load(open(p, encoding='utf-8'))
by = '2026-11-11 B round 446 -> 447 planning (advisor follow-up)'
q = {e['id']: e for e in b['post_current_stage_queue']}
for st in q['STORE-REDESIGN']['stages']:
    if st['id'] == 'STORE-2':
        sp = st['split_2b_d29z1583']
        sp['STORE-2b-2'] = sp['STORE-2b-2'].replace('2b-2a round 447: 23 hits in 9 reachable files (ProductCard, SpecialOffersSection, NewsletterSection, gift-cards, checkout.success, SpotlightLoader, StudioMockup, StemsPlayerModal, StemControl).',
            '2b-2a round 447: 21 hits in 7 reachable files (ProductCard on home ProductSection, SpecialOffersSection, NewsletterSection, gift-cards, checkout.success, SpotlightLoader, StudioMockup). Stems modal (StemsPlayerModal 1, StemControl 1) -> STORE-4 (no mock product renders Play Stems, b-round-446/probe/head-states.json stems=0; SSR loader not stubbable; D8 replaces the modal).')
        sp['STORE-2b-3-inventory-additions_d29z1587'] = sp['STORE-2b-3-inventory-additions_d29z1587'].replace('SpotlightLoader brand spotlight glows (~l.120, ~l.141) and white floor reflection blur (~l.160-176)',
            'SpotlightLoader white "Main spotlight glow" (~l.120-139) and white floor reflection blur (~l.160-176) (the "Secondary glow - brand color" block l.141-158 is the teal halo removed in 2b-2a)')
    if st['id'] == 'STORE-4':
        st['carried_from_2b_2_d29z1587'] = 'stems modal teal: StemsPlayerModal.tsx:66 spinner text-teal-500 -> text-muted; StemControl.tsx:23 Solo bg-teal-500 text-foreground shadow-md -> bg-foreground text-background (as Studio ArrangementLane solo); allow-listed in store-teal-sweep TS1 until then; needs ROOT-REQ-MOCK-API-STEMS for browser rows; PD-R447-STEMCONTROL-ARIA-PRESSED fits here'
b['open_findings'].append({'id': 'ROOT-REQ-MOCK-API-STEMS', 'severity': 'info', 'origin': 'B pre-check (round 447 planning)',
    'title': 'mock-api/server.mjs (root STORE-0 harness) has no product whose page renders "Play Stems" (0 of 6 handles); STORE-4 stems rows (D8 mini-mixer, carried stems-modal teal) need one product with stems tracks in the shape ProductDetailPage expects',
    'status': 'open_root (D-29z1587): request for root before STORE-4; not blocking 2b-2a', 'evidence': 'b-round-446/probe/head-states.json stems', 'added': by})
for r in b['rounds']:
    if r.get('round') == 447:
        r['type'] = 'STORE-2b-2a (teal sweep, reachable Store screens: 21 hits / 7 files)'
        r['note'] += '; HEAD state probe b-round-446/probe/head-states.json (3 viewports)'
for d in b['decisions_log_b']:
    if d['id'] in ('D-29z1587', 'D-29z1588'):
        d['decision'] += ' | Advisor follow-up: 2b-2a narrowed to 21 hits / 7 files; stems modal hits -> STORE-4 (+ ROOT-REQ-MOCK-API-STEMS); ProductCard renders on the home ProductSection (not /store); loader l.141 "Secondary glow" is the teal halo; HEAD hover/loader/checkout/showcase states measured at 3 viewports (head-states.json) so C4-C8 assert against measured HEAD values; card scale read from computed scale (1.02), not transform.'
b['current_task'] = 'Round 447: STORE-2b-2a (hardcoded teal leaves the reachable Store screens; 21 hits / 7 files) on 5df7717 (current-task.md)'
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(DONE, 'w').write('applied\n')
print('ok v', b['version'])
