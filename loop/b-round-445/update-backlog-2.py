"""B round 445 -> 446 planning, second pass (advisor follow-up: sketch v3, L44 questions, extra Lows). Idempotent."""
import json, os, sys
LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
B = f'{LOOP}/b-round-445'
DONE = f'{B}/update-backlog-2.done'
if os.path.exists(DONE):
    sys.exit('already applied')
SHA = open(f'{B}/sketch-446.sha256').read().split()[0][:8]
p = f'{LOOP}/backlog.json'
b = json.load(open(p, encoding='utf-8'))
by = '2026-11-11 B round 445 -> 446 planning (second pass)'
b['open_findings'].append({'id': 'SABA-Q-LEADMAGNET-NAV-RULES', 'severity': 'info', 'origin': 'B (L44, round 446 planning)',
    'title': 'Two B choices beyond Saba Q3, asked once: (c) an open LeadMagnet popup is closed (not dismissed) when navigation reaches /products/*, /cart or /checkout* (alternative: leave it open); (b) the 8 s window re-arms on the next allowed page after an excluded page, so a visitor can see the popup where HEAD would not and again after a Back-hide, capped at 10 views per day (alternative: no re-arm once spent)',
    'status': 'awaiting_user (D-29z1585): round 446 implements the defaults (hide; re-arm); a different answer becomes a bounded follow-up', 'added': by})
b['deferred_low_polish'].append({'id': 'TL-R446-L3-LOCAL-STATE', 'severity': 'low', 'origin': 'B pre-check (tech-lead v1 L3, second half)',
    'status': 'deferred_low_polish (D-29z1585): kept in round 446 (the popup stays mounted; same as every hide at HEAD)',
    'title': 'LeadMagnetPopup local email and validationError survive a route hide; if the popup reopens and the visitor reaches the email step again, the old text and message are still there',
    'evidence': 'b-round-445/sketch-review.md pass 1 L3; current-task.md round 446 ruling lines', 'repro': 'type an invalid email on the email step, Back to a product page, return home, reopen, FREE DOWNLOAD',
    'fix': 'reset the local email/validationError when shouldShow turns false for a route hide', 'added': by})
b['deferred_low_polish'].append({'id': 'TL-R446-V3-TITLE', 'severity': 'low', 'origin': 'B spec (sketch v3; found by tech-lead delta review)',
    'status': 'deferred_low_polish (D-29z1585): accepted; the body is stronger than the title',
    'title': 'LMR13 title says "scroll plus 8 s" while the body waits 16 s', 'evidence': 'b-round-445/sketch-review.md pass 3',
    'repro': 'app/lib/__tests__/store-lead-magnet-routes.test.tsx LMR13', 'fix': 'rename to "scroll plus 16 s"', 'added': by})
for r in b['rounds']:
    if r.get('round') == 446:
        r['note'] = 'baseline 4bfebd7 (gate 445 published); sketch b-round-445/sketch-446.patch.txt v3 sha ' + SHA + ' (v2 e068c5c2 + test row LMR13); claims b-round-445/claims-446.sh K1-K27; grants b-round-445/grants-446.txt'
b['decisions_log_b'].append({'id': 'D-29z1585', 'date': '2026-11-11', 'by': by,
    'decision': 'Advisor follow-up before hand-off: sketch v3 sha ' + SHA + ' adds LMR13 (HEAD one-shot timer premise; green on the HEAD hook) - tech-lead test-only delta approve (title nit TL-R446-V3-TITLE deferred); full suite on v3 278/4105, covering 4/100, mutants 14/14 re-run with an argument-taking runner (tree, out, log dir) so C writes only under c-round-446. L50 grep over the 3 granted source files: 12 hits, 4 rulings; new browser cells for the header-link focus origin (sketch: focus back on the header link = control at 3 viewports; HEAD: focus stays on the open popup Close). HEAD-control server mode "none" tested on :5178. L44: B choices (c) hide on navigation and (b) re-arm after an excluded page asked once as SABA-Q-LEADMAGNET-NAV-RULES (awaiting_user; defaults implemented). TL-R446-L3-LOCAL-STATE deferred. C9 keep-list screenshots are a record row (not run on the sketch).'})
b['current_task'] = 'Round 446: STORE-2b-1 (LeadMagnet does not open on /products/*, /cart, /checkout*; sketch b-round-445/sketch-446.patch.txt v3 sha ' + SHA + ') on 4bfebd7 (current-task.md)'
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(DONE, 'w').write('applied\n')
print('ok v', b['version'])
