# B round 465 -> 466 planning: accept round 465 (RETRO), dispatch round 466 STORE-2b-3c-2b.
# Usage: python3 -I b-round-465/update-backlog-466.py <loop root>. Idempotent (.done). Before-copy b-round-465/backlog-before-466.json.
import json, os, shutil, sys
L = sys.argv[1]; P = f'{L}/backlog.json'; DONE = f'{L}/b-round-465/update-backlog-466.done'
if os.path.exists(DONE):
    print('already applied'); sys.exit(0)
shutil.copyfile(P, f'{L}/b-round-465/backlog-before-466.json')
b = json.load(open(P, encoding='utf-8'))
TODAY = '2026-11-12'; BY = '2026-11-12 B round 465 -> 466 planning'
SHA = open(f'{L}/b-round-465/sketch-466.sha256').read().split()[0]
C465 = ('C round 465 PASS (c-round-465.json: rows 1-12 PASS, 0 bugs, browserVerified/realVerified true; fake-bearer premium path BLOCKED '
        'backend unavailable in cloud); gate 465 skipped "no real changes" (HEAD stays 6d321c7)')
b['version'] += 1; b['updated'] = TODAY
def find(lst, i):
    return next((e for e in lst if isinstance(e, dict) and e.get('id') == i), None)
for r in b['rounds']:
    if r.get('round') == 465:
        r['status'] = 'c_pass_gate_skipped_no_source'; r['result'] = C465 + ' (D-29z1642)'
for rr in b['retro_runs'] if isinstance(b['retro_runs'], list) else []:
    if isinstance(rr, dict) and rr.get('round') == 465:
        rr['status'] = 'c_pass (D-29z1642): ' + C465
of = b['open_findings']; dl = b['deferred_low_polish']
DISP = f'dispatched round 466 (D-29z1643): STORE-2b-3c-2b sketch b-round-465/sketch-466.patch.txt sha {SHA[:8]}'
for lst, i, extra in [
    (dl, 'A-R451-REVIEW-L2-ZERO-OFFSET-UNITS', 'TS7 rows 1-8'),
    (of, 'INFO-TL-R451-GLOW-CALC', 'TS7 rows 9-13 (calc/min/max/clamp and concatenated blur); backgroundClip half ruled fail-safe, kept as is (D-29z1643)'),
    (dl, 'GATE452-L1-GLOW-REGEX-WHOLE-SOURCE', 'case-insensitive /shadow/i pre-check, TS8'),
]:
    e = find(lst, i); e['status'] = f'{DISP}; {extra} | ' + e['status']
for i, sev, t, ev in [
    ('TL-R465-L1', 'low', 'TS8 row 1 (margin/padding without shadow) is a no-op: it is 0 with or without the pre-check (every pattern alternative contains the word shadow)', 'b-round-465/sketch-review.md review 1'),
    ('TL-R465-L2', 'low', "new fail-safe over-matches of the zero-offset glow scanner, unpinned and 0 in live sources: '0 0 ' + '0 1px red', '0 0 ' + spread, calc(0px)", 'b-round-465/sketch-review.md review 1'),
    ('TL-R465-L3', 'low', "concat glow with no space before the quote ('0 0' + ' ' + r + 'px red') returns 0", 'b-round-465/sketch-review.md review 1'),
    ('TL-R465-L4', 'low', 'round( and env( blurs are missed (do not widen to any function: 0 0 rgba( would match)', 'b-round-465/sketch-review.md review 1'),
    ('TL-R465-L5', 'low', 'the GLOW-COMPUTED probe case list is hand-copied from TS7 (G5/G6 drop the Tailwind wrapper, G13/N7 pre-evaluated with radius=8): drift risk', 'b-round-465/sketch-review.md review 1'),
    ('TL-R465-L6', 'info', "pre-existing: colour-first shadows ('red 0 0 8px') are missed; two glow layers in one declaration count as 1; 0 live cases", 'b-round-465/sketch-review.md review 1'),
    ('B-R465-TEST-FIXTURE-CSS-LEAK', 'low', 'pre-existing since the TS6 fixtures landed: Tailwind v4 scans app/lib/__tests__, so 5 TS6 className fixture strings of store-teal-sweep.test.ts ship as utilities in the production app.css (e.g. .shadow-[0_0_20px_rgba(1,2,3,0.3)]); fix with the join() form used by TS7 or a Tailwind source exclusion (root/Saba for config)', 'b-round-465/data/head-fixture-leak.txt; b-round-465/build-compare.txt (sketch with join = HEAD)'),
]:
    dl.append({'id': i, 'severity': sev, 'origin': 'B spec' if i.startswith('TL-') else 'pre-existing', 'status': 'deferred_low_polish (D-29z1643)', 'title': t, 'evidence': ev, 'repro': ev, 'added': BY})
sr = next(e for e in b['post_current_stage_queue'] if e.get('id') == 'STORE-REDESIGN')
s2 = next(v for v in sr['stages'] if v.get('id') == 'STORE-2')
split = s2['split_2b_d29z1583']
split['STORE-2b-3c-2b'] = f'{DISP} | ' + split['STORE-2b-3c-2b']
split['STORE-2b-4'] = ('ruled (D-29z1643): no code scope of its own (the name half was NAME-AND-HINT); its F6 visual rows are acceptance rows of '
                       'STORE-3 (hero, Studio block F5) and STORE-4 (product page F3/F10/F1) and of the root DP-GATE review after STORE-2b; not done until those pass | '
                       + split['STORE-2b-4'])
sr['status'] = ('in_progress (D-29z1643): round 465 RETRO 465 done (C PASS, gate skipped no source); round 466 = STORE-2b-3c-2b (test-only glow scanner forms); '
                'round 467 = REGRESSION-2026-11-13 (due from 2026-11-13); then STORE-2c (typography) .. STORE-5 | ' + sr['status'])
reg = find(b['regression_rounds'], 'REGRESSION-2026-11-13')
reg['status'] = ('planned for round 467 (D-29z1643): round 466 is planned on 2026-11-12, before the due date; the round-467 planning carries every scope_additions entry (L6) | '
                 + reg['status'])
dp = find(b['design_philosophy_gate'] if isinstance(b['design_philosophy_gate'], list) else [b['design_philosophy_gate']], 'DP-GATE')
dp.setdefault('notes', []).append({'added': BY, 'note': 'STORE-2b closes when round 466 passes C (2b-4 ruled into STORE-3/4 acceptance). Root: the first DP-GATE review (design-philosopher + product-designer, Store pages) falls due after round 466 passes; B schedules its findings below 10/10 as loop tasks when root files them (D-29z1643).'})
b['current_task'] = 'Round 466: STORE-2b-3c-2b - the zero-offset glow scanner finds every zero spelling, function and concatenated blurs (test-only; current-task.md, D-29z1643)'
b['rounds'].append({'round': 466, 'task': 'current-task.md', 'decision': 'D-29z1643', 'type': 'STORE-2b-3c-2b test-only: helpers/style-scan.ts zero-offset glow forms + store-teal-sweep TS7/TS8', 'status': 'dispatched',
                    'note': f'baseline 6d321c7 (gate 465 skipped, HEAD unchanged since gate 464); manifest b-round-464/r465-tree-sha256.txt (1377) reused; sketch sha {SHA}'})
b['decisions_log_b'].append({'id': 'D-29z1642', 'date': TODAY, 'by': BY, 'decision': (
    f'Round 465 RETRO 465 accepted: {C465}. No finding opened. regression-last.json unchanged (2026-11-10 / 425): the next REGRESSION is due at the first planning on or after 2026-11-13. '
    'No new Saba answer in user-review/ (AGREE-STEM-LANES still awaiting_user); ARCH-CHECKPOINT-STYLE-SCAN still unanswered (deadline round 480).')})
b['decisions_log_b'].append({'id': 'D-29z1643', 'date': TODAY, 'by': BY, 'decision': (
    'Round 466 = STORE-2b-3c-2b, as ordered by D-29z1640 (planning date 2026-11-12 < regression due date). Test-only, grants app/lib/__tests__/helpers/style-scan.ts and '
    'app/lib/__tests__/store-teal-sweep.test.ts. Closes A-R451-REVIEW-L2-ZERO-OFFSET-UNITS, INFO-TL-R451-GLOW-CALC (calc half; the backgroundClip false positive is ruled '
    'fail-safe and kept), GATE452-L1-GLOW-REGEX-WHOLE-SOURCE. Not folded into SYS-R465-DEAD-CSS-MATCHER: different helper (store-dead-css matcher), different trigger, '
    'and two ports in one round is the risk tech-lead named at RETRO 465. B pre-check: HEAD vs sketch counter over 657 sources equal except the fixture file '
    '(b-round-465/data/head-vs-sketch-counts.txt), 11 mutants red, Chromium computed-style probe agrees on 19 fixtures, full suite 285/4188, tech-lead sketch review '
    '(b-round-465/sketch-review.md). STORE-2b-4 ruled into STORE-3/4 acceptance and DP-GATE. Round 467 = REGRESSION-2026-11-13. '
    'Sketch review: tech-lead v1 APPROVE-WITH-CHANGES (unit list widened to [a-z]*), v2 APPROVE on the dispatched sha; Lows TL-R465-L1..L6 and pre-existing B-R465-TEST-FIXTURE-CSS-LEAK deferred. '
    'Signals SIG-R453-CSSRULEBODIES, SIG-R454-HITSBYRULE, SIG-R454-ALLOWLIST-PINS stay signals (not scheduled).')})
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(DONE, 'w').write('applied\n'); print('ok version', b['version'])
