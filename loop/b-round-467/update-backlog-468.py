import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = os.path.join(L, 'b-round-467/update-backlog-468.done')
if os.path.exists(done): sys.exit('already applied')
p = os.path.join(L, 'backlog.json')
b = json.load(open(p, encoding='utf-8'))
by = '2026-11-12 B round 467 -> 468 planning'
ev467 = 'c-round-467.json PASS (13 rows, 0 bugs, browserVerified/realVerified true); gates/gate-round-467.json published 9ba13ac'
b['version'] = b.get('version', 0) + 1
b['updated'] = '2026-11-12'
closed = {'C-R466-01', 'A-R451-REVIEW-L2-ZERO-OFFSET-UNITS', 'INFO-TL-R451-GLOW-CALC', 'GATE452-L1-GLOW-REGEX-WHOLE-SOURCE'}
hit = set()
for k in ('open_findings', 'deferred_low_polish'):
    for f in b[k]:
        if isinstance(f, dict) and f.get('id') in closed:
            f['status'] = f'closed (D-29z1647): {ev467} | ' + str(f.get('status'))
            f['closed_by'] = 'round 467'; hit.add(f['id'])
missing = closed - hit
q = {e['id']: e for e in b['post_current_stage_queue']}
sr = q['STORE-REDESIGN']
s2 = [s for s in sr['stages'] if s['id'] == 'STORE-2'][0]
sp = s2['split_2b_d29z1583']
sp['STORE-2b-3c-2b'] = f'done (D-29z1647): {ev467} | ' + str(sp['STORE-2b-3c-2b'])
sr['status'] = ('in_progress (D-29z1649): round 467 STORE-2b-3c-2b fix-up C PASS, published 9ba13ac (2b code stages closed; 2b-4 rows live in STORE-3/4 + DP-GATE); '
                'round 468 = SABA-B-15 stage 1 (home scroll frame drops under Lenis, Saba Medium, inserted like SABA-B-14); REGRESSION-2026-11-13 at the first planning on/after 2026-11-13; then STORE-2c .. STORE-5 | ' + sr['status'])
s2['saba_b15_insert_d29z1649'] = 'round 468 (D-29z1649): SABA-B-15 stage 1 inserted before STORE-2c (Saba Medium on a mounted Store screen; grants app/hooks/useSmoothScroll.ts + new test + doc 305; STOP on a cause outside the grant)'
b['deferred_low_polish'].append({'id': 'A-R467-REVIEW-L1', 'severity': 'low', 'origin': 'B spec', 'status': 'deferred_low_polish (D-29z1647)',
    'title': 'Doc 304 l.5 says "2 ტესტ ფაილი, ეს დოკუმენტი" but its changed-files list also names doc 299', 'evidence': 'a-round-467.md Reviewer findings; c-round-467.md Notes (C: cosmetic)',
    'repro': 'docs/implementation/2026/quarter-IV/304-store-2b-3c-2b-glow-scanner-forms.md l.5 vs l.40-43', 'added': by})
new = [
 {'id': 'SABA-B-15', 'severity': 'medium', 'origin': 'pre-existing', 'status': 'dispatched round 468 (D-29z1649): stage 1 bisect + fix in useSmoothScroll.ts or STOP for a grant',
  'title': 'Store scroll is not smooth and soft (Saba 2026-11-12, named /free-downloads on czaba-store-test.vercel.app)',
  'evidence': 'b-round-467/probe/scroll-prod-9ba13ac-cpu1.json: / median moving frames >33.4 ms 9 (1440) / 8 (1280), long frames 50-96 ms attributed to useSmoothScroll.ts raf (scroll-dev-9ba13ac-cpu1.json); /free-downloads 0 at both viewports (not reproduced in headless Chromium)',
  'repro': 'node b-round-467/probe/store-scroll-probe.cjs <prod build url> <out.json> 1 (LeadMagnet suppressed)', 'why_we_missed': 'STORE C rows measured LCP/CLS at load only; no scroll frame-timing row; PERF harness is /studio-lab only; rule merged into lessons L18',
  'requested': 'agent-workflow.md "Saba feedback, 2026-11-12: Scroll is not smooth"', 'added': by},
 {'id': 'TLM-R468-SABA-SCROLL-DEVICE', 'severity': 'medium', 'origin': 'environment', 'status': 'open_tech_lead_manual (D-29z1649): deadline RETRO 480 (L46); does not block (2026-10-23 root clarification class)',
  'title': "Saba's own device: /free-downloads and / scroll on the Vercel preview after round 468 lands (mouse wheel and trackpad; Chrome DevTools Performance trace if still not smooth)", 'added': by},
 {'id': 'SABA-Q-CTRLK-CONTENT', 'severity': 'info', 'origin': 'pre-existing', 'status': 'awaiting_user (D-29z1648): agent-workflow.md marks it "Pending Saba decision + design review"; question in user-review/questions-round-467.md Q1; product-designer consult before any task',
  'title': 'Ctrl+K palette should offer more than the header (search, recent, shortcuts, etc.)', 'added': by},
 {'id': 'SABA-Q-GIFTCARDS-HEADER', 'severity': 'info', 'origin': 'pre-existing', 'status': 'awaiting_user (D-29z1648): R57 (round 188) moved Gift Cards out of the header (footer + CommandPalette entry kept); Saba asks whether it needs its own header place; user-review/questions-round-467.md Q2',
  'title': 'Gift Cards has no separate place in the header - should it?', 'added': by},
 {'id': 'SABA-B-16-LOGO-OLD-COLORS', 'severity': 'medium', 'origin': 'pre-existing', 'status': 'open (D-29z1648): input to the first DP-GATE review (root, ROOT-REQ-DP-GATE-FIRST); which asset is unconfirmed: header wordmark is text-foreground (R59), so candidates are public/favicon.ico, public/og-image.jpg (public/** global_forbidden -> root) and the SpotlightLoader wordmark; user-review/questions-round-467.md Q3',
  'title': 'Logo still uses the old colours, not Obsidian & Brass (Saba 2026-11-12, "Known issues for the first review")', 'added': by},
]
b['open_findings'].extend(new)
b['root_requests_b'].append({'id': 'ROOT-REQ-DP-GATE-FIRST', 'added': by, 'note': 'STORE-2b code stages are closed (round 467 C PASS, 9ba13ac). Per "Design philosophy acceptance gate (Saba, 2026-11-11)": root may run the first design-philosopher + product-designer review on the Store pages. Inputs: SABA-B-16-LOGO-OLD-COLORS (logo colours, Saba known issue), the 2026-11-12 review stance (objectively critical, not polite; judge colour range and design hard), STORE-2b-4 rows. B plans each finding below 10/10 as a task. Non-blocking for the loop.'})
dl = b['decisions_log_b']
dl.append({'id': 'D-29z1647', 'date': '2026-11-12', 'by': by, 'decision': f'Round 467 accepted: {ev467}. Closed C-R466-01, A-R451-REVIEW-L2-ZERO-OFFSET-UNITS, INFO-TL-R451-GLOW-CALC, GATE452-L1-GLOW-REGEX-WHOLE-SOURCE; STORE-2b-3c-2b done; A-R467-REVIEW-L1 -> deferred_low_polish; fake-bearer row stays open backend evidence. L7 grep: no other open id with the pre-check root cause (TL-R466-L1/L2 stay deferred: different claims).'})
dl.append({'id': 'D-29z1648', 'date': '2026-11-12', 'by': by, 'decision': 'Saba 2026-11-12 items recorded (L42): SABA-B-15 (scroll, Medium), SABA-Q-CTRLK-CONTENT and SABA-Q-GIFTCARDS-HEADER (awaiting_user), SABA-B-16-LOGO-OLD-COLORS (Medium, DP-GATE input), review stance on ROOT-REQ-DP-GATE-FIRST; questions in user-review/questions-round-467.md; lessons L18 gains the scroll-frame clause (merged, still 60 lines).'})
dl.append({'id': 'D-29z1649', 'date': '2026-11-12', 'by': by, 'decision': 'Round 468 = SABA-B-15 stage 1 ahead of STORE-2c (SABA-B-14 precedent). B probe on a 9ba13ac production build reproduced / (median frames >33.4 ms 9/8, Lenis raf long frames) but not /free-downloads. No sketch: cause unknown; A bisects in a scratch copy, fixes only in useSmoothScroll.ts, else STOP for a grant; bound median <= 2 is A\'s STOP gate, HEAD build is the red mutant (L58 ruling). Regression not due (2026-11-10 + 3 = 2026-11-13 > planning date 2026-11-12).'})
b['rounds'].append({'round': 468, 'task': 'current-task.md', 'decision': 'D-29z1649', 'type': 'SABA-B-15 stage 1: Store home scroll frame drops under Lenis (bisect + fix)', 'status': 'dispatched', 'note': 'baseline 9ba13ac clean; grants app/hooks/useSmoothScroll.ts, app/hooks/__tests__/useSmoothScroll.test.ts (new), doc 305 (new); probe b-round-467/probe/store-scroll-probe.cjs; claims b-round-467/claims-468.sh'})
for r in b['rounds']:
    if r.get('round') == 467: r['status'] = 'done (D-29z1647): C PASS, published 9ba13ac'
b['current_task'] = 'Round 468: SABA-B-15 stage 1 - Store home scroll frame drops under Lenis, bisect + fix (current-task.md, D-29z1649)'
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(done, 'w').write('ok\n')
print('version', b['version'], 'closed', sorted(hit), 'missing', sorted(missing))
