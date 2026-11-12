import json
import os
import shutil
import sys

ROOT = '/home/runner/czaba-project/tmp/studio-real-loop'
PATH = ROOT + '/backlog.json'
DONE = ROOT + '/b-round-479/update-backlog-retro.done'
BY = '2026-11-12 B round 479 -> 480 planning (RETRO 480)'
DATE = '2026-11-12'
if os.path.exists(DONE):
    print('refused: .done marker exists')
    sys.exit(0)
with open(PATH, encoding='utf-8') as fh:
    b = json.load(fh)
if 'D-29z1703' in {d['id'] for d in b['decisions_log_b']}:
    print('already applied')
    sys.exit(0)
shutil.copyfile(PATH, ROOT + '/b-round-479/backlog-before-retro.json')

b['version'] += 1
b['updated'] = BY
b['current_task'] = ('Round 480: RETRO 480 (window 465-479) + whole-screen and journey review; no app code; '
                     'C verifies traceability, auth guard, Studio smoke, screen capture (current-task.md)')

dec = [
    ('D-29z1703', 'RETRO 480 data, window 465-479: scripts b-round-479/*.py, misc-outputs.sh, stops-head.sh (copies of the RETRO 465 '
     'scripts, window changed) on b-round-479/backlog-retro-input.json (v467, after round-479 acceptance) and '
     'archive-findings-snapshot.json; outputs b-round-479/data/. 15 rounds $214.36 (B 133.40 = 62.2 %, A 68.69, C 12.27); '
     'round median 15.29, B median 9.38; C PASS 10, FAIL 466/471/472/476, BLOCKED 469; STOPs 466/471/472/475/476; '
     'C bugs 11; new deferred 43 (union); gate reviews 8 / 35 items, 1 Medium (479); L57 10/15; L58 13/14 (471).'),
    ('D-29z1704', 'GATE479-M1-ROUTE-ANNOUNCE ruling (tech-lead, b-round-479/consult-tech-lead.md §3): fixable outside root.tsx with '
     'a RouteAnnouncer in app/components/layout (Header renders on every non-/studio route, root.tsx:136-143). Scheduled as '
     'systemic task CLIENT-NAV-CONTRACT = round 482 (after REGRESSION-2026-11-13 = round 481). At the round-482 planning B '
     'pre-runs on a sketch in the browser: title timing, the fallback on the 7 routes without meta (title, else main h1), '
     'and Studio -> Store remount (module-level flag). If any fails, ROOT-REQ-ROUTE-ANNOUNCER (RouteAnnouncer in root.tsx '
     'after <Outlet/> + meta on the 7 routes) instead. B-R478-DEAD-MUSIC-LINK = round 483 (account.orders only; meets its '
     'L46 deadline). Then DPG-BUTTON-CLEANUP.'),
    ('D-29z1705', 'L46 rulings at RETRO 480 (user-review/questions-retro-480.md Q1-Q7): Firefox five checks -> task FIREFOX-CHECKS '
     'blocked on ROOT-REQ-PLAYWRIGHT-FIREFOX (Q3); Safari list -> task SAFARI-CHECKS blocked on Saba macOS (Q4); '
     'TLM-R448-HIREUS-EMAIL-CLIENTS -> task HIREUS-EMAIL-CLIENTS blocked on Brevo/Saba (Q4); TLM-R468-SABA-SCROLL-DEVICE '
     'first RETRO -> Q1, deadline RETRO 495; IME (already an open blocked task) and STUDIO-PERFORMANCE parked remainders '
     '(design choices) -> deadline RETRO 495; LeadMagnet timer -> Q2 (keep-list, unchanged). Screen review '
     'user-review/screen-review-480.md: SR-480-1..3 (all Low, awaiting_user); Studio line counts equal RETRO 465.'),
    ('D-29z1706', 'RETRO 480 lessons and rulings: lessons.md 59,870 -> 57,484 B, 60 lines (edit-lessons.py, -2, -3; tech-lead tier 1 '
     '+ part of tier 2, B glosses on L29/L56); L47 + "Reload -> client nav" clause; L10 + "One STOP threshold" clause. '
     'All RETRO480-* and RC-R47x retro candidates ruled (retro-480.md §7). Systemic task CLIENT-NAV-CONTRACT (round 482). '
     'SYS-R465-DEAD-CSS-MATCHER trigger "round 480" reached without root answer -> planned after DPG P1. '
     'Counters for RETRO 495 (tech-lead) in retro_policy.signals_for_next_retro. Next RETRO round 495.'),
]
for i, t in dec:
    b['decisions_log_b'].append({'id': i, 'decision': t, 'date': DATE, 'by': BY})

b['retro_runs'].append({
    'round': 480, 'decision': 'D-29z1706', 'window': '465-479', 'report': 'retros/retro-480.md',
    'lessons': 'lessons.md (60 lines, 59870 -> 57484 B): L47 reload->client-nav clause; L10 one-STOP-threshold clause; '
               'evidence trimmed L23/L29/L37/L56/L57/L58; diff b-round-479/lessons-diff.txt',
    'data': 'b-round-479/*.py + misc-outputs.sh + stops-head.sh on b-round-479/backlog-retro-input.json (v467); outputs b-round-479/data/',
    'screen': 'user-review/screen-review-480.md (SR-480-1..3); captures b-round-479/screens/',
    'questions': 'user-review/questions-retro-480.md Q1-Q7',
    'systemic': 'CLIENT-NAV-CONTRACT (round 482); SYS-R465-DEAD-CSS-MATCHER planned after DPG P1',
    'consults': {'tech-lead': 'used (b-round-479/consult-tech-lead.md)', 'product-designer': 'used (b-round-479/consult-product-designer.md)',
                 'advisor': 'used (approach + closing check)', 'qa-engineer': 'not in the B consult list; not called',
                 'consequence-tester': 'not in the B consult list; not called', 'design-philosopher': 'not in the B consult list; not called',
                 'first-visit-host': 'not in the B consult list; not called'},
    'trigger': '15 rounds since RETRO 465',
    'status': 'dispatched (round 480)',
})
rp = b['retro_policy']
rp['next_due'] = ('round 495 or the end of the next queue entry, whichever first (retro 495 window 480-494) (D-29z1706) | '
                  + rp['next_due'])
rp['signals_for_next_retro'].insert(0, (
    'retro-480: counters for RETRO 495 (tech-lead): C FAIL + BLOCKED <= 2 of 15; rounds with a STOP <= 2 and 0 STOPs on an unruled '
    'sketch Medium; l58-check 15/15 and l57-check >= 14/15; lessons.md <= 57,500 B and no line over 4,800 B; fix-up chain length <= 1; '
    'new deferred Lows <= 35 and >= 10 closed. RETRO 465 counters result: round median 15.29 MET (<= 18), B median 9.38 MET (<= 13), '
    'B share 62.2 % MET (<= 68), C FAIL 4 MISSED (<= 2), deferred 43 MISSED (<= 35; 36 without the 7 added at this planning), '
    'l58 13/14 MISSED, lessons 59,870 B MISSED before the trim (57,484 after), tech-lead reviews per sketch MET, one-off .py MET.'))

ruled = {
    'RETRO480-PINNED-SKETCH-MICRO-FIX': 'three more cases (466, 471, 476); tech-lead: the rule exists (L58), enforcement is missing; proposal stays with Saba (retro-480 §12)',
    'RETRO480-COLLECTOR-UNDERCOUNT': 'window 465-479: union 43 = added-method 43; no undercount',
    'RETRO480-LOOK-CONTROL': 'already in L58 (D-29z1654)',
    'RETRO480-SINGLE-RUNNER-CONTROL': 'round 469 BLOCKED is the same class (2x); stays a counter to RETRO 495 (lessons byte limit)',
    'RC-R471-L58-SKIPPED': 'RETRO 495 counter l58-check 15/15',
    'RC-R472-DOC-GRANT-LINES': 'covered by L26 (l.49); no recurrence 473-479',
    'RC-R473-POLICY-COUNT-STALE': 'B measured on the tree (L29); DP-gate report should name its commit (retro-480 §12)',
    'RC-R474-POLICY-LIST-VS-RESOLVER': 'B measured on the resolver (L29)',
    'RC-R475-STOP-CLAUSE': 'L10 clause "One STOP threshold" (RETRO 480)',
    'RC-R476-SKETCH-RULE-REVIEW': 'RETRO 495 counter: 0 STOPs on an unruled sketch Medium',
    'RC-R478-DOCS-NO-SKETCH': 'accepted variant for prose-doc rounds when the checker is proven red by a mutant (round 478 C PASS)',
    'RC-R479-CLIENT-NAV-FOCUS': 'L47 clause "Reload -> client nav" + CLIENT-NAV-CONTRACT',
}
seen = set()
for c in b['retro_candidates']:
    cid = c.get('id', '')
    if cid in ruled:
        c['status'] = 'ruled (D-29z1706): ' + ruled[cid] + (' | ' + c['status'] if c.get('status') else '')
        seen.add(cid)
missing = set(ruled) - seen
if missing:
    print('MISSING retro candidates', missing)
    sys.exit(1)

for n, what, png, typ in [
    (1, 'Studio "<- CZABA" exit link is the plain text colour while the Store header logo is brass since round 476; the logo changes colour product page -> Studio', 'b-round-479/screens/journey480-1b-studio-arrival-*', 'visual'),
    (2, 'round brass play button sits on the cover art brand mark on the product page (maybe mock cover only)', 'b-round-479/screens/journey480-1-product-*', 'layout (Saba)'),
    (3, '"Demo collection - no sign-in required" is a bordered rounded box like the Export button; looks clickable, does nothing', 'b-round-479/screens/screen480-full-*', 'visual'),
]:
    b['screen_review_candidates'].append({
        'id': 'SR-480-%d' % n, 'decision': 'D-29z1705', 'severity': 'low', 'what': what, 'png': png, 'type': typ,
        'source': 'user-review/screen-review-480.md; b-round-479/consult-product-designer.md',
        'status': 'awaiting_user (D-29z1705): candidate; nothing implemented until Saba answers', 'added': BY})

TLM = {
    'FIREFOX-CHECKS': (['TLM-PERF15-FIREFOX', 'TLM-SABA-B-12-FIREFOX-SAFARI', 'TLM-R454-FIREFOX-SAFARI-SCROLLBAR',
                        'TLM-R455-FIREFOX-SEEK-THUMB', 'TLM-R459-FIREFOX-SAFARI-ENTRANCE'],
                       'blocked (D-29z1705): needs ROOT-REQ-PLAYWRIGHT-FIREFOX; C runs all five in one round once Firefox is installed; questions-retro-480.md Q3',
                       'Firefox halves of five manual checks, opened as one task by L46 after two RETROs without an answer'),
    'SAFARI-CHECKS': (['TLM-SABA-B-12-FIREFOX-SAFARI', 'TLM-R449-WEBKIT-HEADING-INK', 'TLM-R454-FIREFOX-SAFARI-SCROLLBAR',
                       'TLM-R459-FIREFOX-SAFARI-ENTRANCE', 'A-R73-SAFARI-FLAG-FOCUS'],
                      'blocked (D-29z1705): needs Saba on macOS Safari; questions-retro-480.md Q4',
                      'Safari halves of the manual list, opened as one task by L46'),
    'HIREUS-EMAIL-CLIENTS': (['TLM-R448-HIREUS-EMAIL-CLIENTS'],
                             'blocked (D-29z1705): needs Brevo and a test send to Gmail/Outlook/Apple Mail (Saba); questions-retro-480.md Q4',
                             'Hire-Us internal e-mail in real clients, opened as a task by L46'),
}
for tid, (ids, st, title) in TLM.items():
    b['open_findings'].append({'id': tid, 'severity': 'medium', 'origin': 'environment', 'status': st, 'title': title,
                               'covers': ids, 'evidence': 'retros/retro-480.md §8', 'added': BY})

newdl = {'TLM-PERF15-FIREFOX': 'FIREFOX-CHECKS', 'TLM-SYS3-IME-PLATFORMS': None, 'TLM-R454-FIREFOX-SAFARI-SCROLLBAR': 'FIREFOX-CHECKS/SAFARI-CHECKS',
         'TLM-R455-FIREFOX-SEEK-THUMB': 'FIREFOX-CHECKS', 'TLM-R459-FIREFOX-SAFARI-ENTRANCE': 'FIREFOX-CHECKS/SAFARI-CHECKS',
         'TLM-R468-SABA-SCROLL-DEVICE': None}
for t in b['tech_lead_manual_checks']:
    i = t.get('id')
    if i in newdl:
        note = 'RETRO 495 (D-29z1705)' + ('; tracked by task ' + newdl[i] if newdl[i] else '')
        if 'deadline' in t:
            t['deadline'] = note + ' | ' + str(t['deadline'])
        else:
            t['status'] = note + ' | ' + str(t.get('status', ''))

upd = {
    'GATE479-M1-ROUTE-ANNOUNCE': 'scheduled (D-29z1704): CLIENT-NAV-CONTRACT round 482 (B pre-runs title timing, meta fallback, remount on a sketch); else ROOT-REQ-ROUTE-ANNOUNCER',
    'B-R478-DEAD-MUSIC-LINK': 'scheduled (D-29z1704): round 483, account.orders.tsx -> /store (L46 deadline met)',
    'TLM-R468-SABA-SCROLL-DEVICE': 'L46 question to Saba (D-29z1705; questions-retro-480.md Q1); new deadline RETRO 495; does not block',
    'SABA-B-15': 'closes with TLM-R468-SABA-SCROLL-DEVICE (questions-retro-480.md Q1, deadline RETRO 495) (D-29z1705)',
    'TLM-SABA-B-12-FIREFOX-SAFARI': 'tracked by tasks FIREFOX-CHECKS and SAFARI-CHECKS (D-29z1705)',
    'TL-R444-L1-REAL-IME-SEARCH-CLEAR': 'open blocked task unchanged; deadline RETRO 495 (D-29z1705; questions-retro-480.md Q6)',
    'TLM-R448-HIREUS-EMAIL-CLIENTS': 'tracked by task HIREUS-EMAIL-CLIENTS (D-29z1705)',
    'TLM-R449-WEBKIT-HEADING-INK': 'tracked by task SAFARI-CHECKS (D-29z1705)',
    'A-R73-SAFARI-FLAG-FOCUS': 'tracked by task SAFARI-CHECKS (D-29z1705)',
}
for f in b['open_findings']:
    if f.get('id') in upd:
        f['status'] = upd[f['id']] + ' | ' + f['status']

b['systemic_tasks'].append({
    'id': 'CLIENT-NAV-CONTRACT', 'added': BY, 'decision': 'D-29z1704',
    'status': 'planned for round 482 (after REGRESSION-2026-11-13); B pre-runs title timing, meta fallback and Studio->Store remount on a sketch (L58)',
    'what': 'RouteAnnouncer in app/components/layout (title, fallback main h1; not on /studio*), releaseLinkFocus try/finally, '
            'skip target=_blank/reloadDocument, runtime defaultPrevented test, slow-loader note in doc 311 successor',
    'closes': ['GATE479-M1-ROUTE-ANNOUNCE', 'GATE479-L2-TABINDEX-FINALLY', 'A-R479-L1-TARGET-BLANK',
               'A-R479-L3-DEFAULTPREVENTED-UNTESTED', 'A-R479-L2-SLOW-LOADER-FOCUS', 'RC-R479-CLIENT-NAV-FOCUS'],
    'conditional': 'B-R479-LEADMAGNET-TIMER-CLIENT-NAV only if Saba picks a behaviour change in questions-retro-480.md Q2; default keep closes it by ruling',
    'source': 'b-round-479/consult-tech-lead.md §3 and §5',
})
for d in b['deferred_low_polish']:
    if d.get('id') in ('GATE479-L2-TABINDEX-FINALLY', 'A-R479-L1-TARGET-BLANK', 'A-R479-L3-DEFAULTPREVENTED-UNTESTED', 'A-R479-L2-SLOW-LOADER-FOCUS'):
        d['systemic_task'] = 'CLIENT-NAV-CONTRACT'
for s in b['systemic_tasks']:
    if s.get('id') == 'SYS-R465-DEAD-CSS-MATCHER':
        s['status'] = ('trigger reached (D-29z1706): round 480 without a root answer on ARCH-CHECKPOINT-STYLE-SCAN; planned after DPG P1 '
                       '(the current stage) | ' + s['status'])

for e in b['post_current_stage_queue']:
    if e.get('id') == 'DPG-FIX':
        e['status'] = ('in_progress (D-29z1704): round 480 RETRO, 481 REGRESSION, 482 CLIENT-NAV-CONTRACT (GATE479-M1), '
                       '483 B-R478-DEAD-MUSIC-LINK, then DPG-BUTTON-CLEANUP | ' + e['status'])

b['root_requests_b'].append({
    'id': 'ROOT-REQ-CSS-AST-READER', 'added': BY,
    'note': 'tech-lead (retro-480 §5/§12): the regex CSS-scanner Low class (TL-R465-*, A-R466-REVIEW-*, SR-472-*, A-R472-REVIEW-L4, '
            'A-R473-*, TL-R464-*, A-R464-REVIEW-*) needs an AST reader; postcss is only transitive and package.json is root-only. '
            'Proposal for root/Saba; not tasked in the loop.'})

b['rounds'].append({'round': 480, 'task': 'current-task.md', 'decision': 'D-29z1706', 'type': 'RETRO 480 (window 465-479)',
                    'status': 'dispatched', 'note': 'baseline HEAD bbb3193 clean; claims b-round-479/claims-480.sh; manifest b-round-479/r480-tree-sha256.txt (1391)'})

with open(PATH, 'w', encoding='utf-8') as fh:
    json.dump(b, fh, indent=2, ensure_ascii=True)
open(DONE, 'w').write('applied v%d\n' % b['version'])
print('applied', b['version'])
