# B round 466 -> 467 planning: record C round 466 FAIL (C-R466-01), rule it, dispatch round 467 fix-up.
# Usage: python3 -I b-round-466/update-backlog-467.py <loop root>. Idempotent (.done). Before-copy b-round-466/backlog-before-467.json.
import json, os, shutil, sys
L = sys.argv[1]; P = f'{L}/backlog.json'; DONE = f'{L}/b-round-466/update-backlog-467.done'
if os.path.exists(DONE):
    print('already applied'); sys.exit(0)
shutil.copyfile(P, f'{L}/b-round-466/backlog-before-467.json')
b = json.load(open(P, encoding='utf-8'))
TODAY = '2026-11-12'; BY = '2026-11-12 B round 466 -> 467 planning'
SHA = open(f'{L}/b-round-466/sketch-467.sha256').read().split()[0]
C466 = ('C round 466 FAIL (c-round-466.json: short route after A STOP on code-reviewer Medium A-R466-REVIEW-M1; C1, C3, C8 (browser 1440/1280), C11 PASS; '
        'C4-C7, C9, C10, C12 not run; bug C-R466-01 Medium origin B spec); gate 466 skipped "C taskStatus FAIL" (HEAD stays 6d321c7)')
b['version'] += 1; b['updated'] = TODAY
def find(lst, i):
    return next((e for e in lst if isinstance(e, dict) and e.get('id') == i), None)
for r in b['rounds']:
    if r.get('round') == 466:
        r['status'] = 'c_fail'; r['result'] = C466 + ' (D-29z1645)'
of = b['open_findings']; dl = b['deferred_low_polish']
DISP = f'round 466 C FAIL (C-R466-01), not closed; re-dispatched round 467 (D-29z1646) on the unchanged 466 tree + delta sketch b-round-466/sketch-467.patch.txt sha {SHA[:8]}'
for lst, i in [(dl, 'A-R451-REVIEW-L2-ZERO-OFFSET-UNITS'), (of, 'INFO-TL-R451-GLOW-CALC'), (dl, 'GATE452-L1-GLOW-REGEX-WHOLE-SOURCE')]:
    e = find(lst, i); e['status'] = f'{DISP} | ' + e['status']
of.append({'id': 'C-R466-01', 'severity': 'medium', 'origin': 'B spec', 'to': 'B', 'added': BY,
           'status': f'dispatched round 467 (D-29z1646): TS8 observes the pattern scan with a String.prototype.matchAll spy; mutant M14-NO-PRECHECK turns TS8 red (b-round-466/mutants/summary.txt); tech-lead APPROVE (b-round-466/sketch-review.md)',
           'title': 'TS8 title claims it pins the /shadow/i pre-check skip, but removing the pre-check leaves TS8 (and all 31 covering tests) green: the pre-check never changes a result. Same finding as A-R466-REVIEW-M1 (code-reviewer) and B\'s own TL-R465-L1',
           'evidence': 'c-round-466/data/nopcheck-vitest.txt; a-round-466/noprecheck-vitest.log; a-round-466.md section 3',
           'repro': 'copy 6d321c7 + sketch-466 files; delete the 3-line pre-check in countZeroOffsetGlowHits; npx vitest run the 4 covering files -> 31/31 pass'})
tl1 = find(dl, 'TL-R465-L1'); tl1['status'] = 'merged into C-R466-01 (D-29z1645; lesson 7: same root cause) | ' + tl1['status']
for i, t, ev in [
    ('A-R466-REVIEW-L1', "TS7 negative fixture margin: '0rem 0 12px' has no 'shadow', so the pre-check returns 0 before any regex runs; it does not test ZERO_LENGTH in a shadow context", 'a-round-466.md section 4'),
    ('A-R466-REVIEW-L2', 'ZERO_LENGTH branches .0 and 00 have no fixture and no mutant', 'a-round-466.md section 4'),
    ('A-R466-REVIEW-L3', 'function and concatenated blurs are tested only in the inline/CSS alternative, not in the Tailwind arbitrary, arbitrary-property or drop-shadow( alternatives', 'a-round-466.md section 4'),
    ('A-R466-REVIEW-L4', "no negative fixture for a ring built by concatenation ('0 0 0 ' + w + 'px red' gives 0 today, unpinned)", 'a-round-466.md section 4'),
    ('A-R466-REVIEW-INFO', "info: signed blur (0 0 +8px) not counted; 08px missed at HEAD; setProperty('box-shadow'), boxShadow = '...' and --tw-shadow not detected (pre-existing)", 'a-round-466.md section 4'),
    ('TL-R466-L1', 'TS8 is tied to countWhole using String.prototype.matchAll; a rewrite to exec/match turns TS8 red with no behaviour change (false fail, not false pass); doc 304 names matchAll', 'b-round-466/sketch-review.md item 4'),
    ('TL-R466-L2', 'TS8 counts scans but does not check which source was scanned (mock.contexts)', 'b-round-466/sketch-review.md item 5'),
]:
    dl.append({'id': i, 'severity': 'info' if i.endswith('INFO') else 'low', 'origin': 'A' if i.startswith('A-') else 'B pre-check',
               'status': 'deferred_low_polish (D-29z1645); TS7 frozen this round (its probe and counts are pinned)' if i.startswith('A-') else 'deferred_low_polish (D-29z1646)',
               'title': t, 'evidence': ev, 'repro': ev, 'added': BY})
acr = find(b['architecture_checkpoint_requests'], 'ARCH-CHECKPOINT-STYLE-SCAN')
acr['signals'].append({'added': BY, 'source': 'A round-466 code-reviewer Architecture note (signal 3)',
                       'note': 'repeated costly edits to style-scan.ts glow regex region (l.56-66); reviewer decision keep. If it changes again: one bounded task moves the glow fixture tables into a shared data list mapping every regex branch to >=1 positive and >=1 negative fixture, and makes the mutant set a repeatable script. Signal only, not scheduled (D-29z1645)',
                       'evidence': 'a-round-466.md section 4'})
sr = next(e for e in b['post_current_stage_queue'] if e.get('id') == 'STORE-REDESIGN')
s2 = next(v for v in sr['stages'] if v.get('id') == 'STORE-2')
split = s2['split_2b_d29z1583']
split['STORE-2b-3c-2b'] = f'{DISP} | ' + split['STORE-2b-3c-2b']
sr['status'] = ('in_progress (D-29z1646): round 466 STORE-2b-3c-2b C FAIL (C-R466-01); round 467 = its fix-up (TS8 spy, delta sketch); '
                'REGRESSION-2026-11-13 = first planning on or after 2026-11-13 (round 468 if that planning is dated 2026-11-13 or later); then STORE-2c .. STORE-5 | ' + sr['status'])
reg = find(b['regression_rounds'], 'REGRESSION-2026-11-13')
reg['status'] = ('moved (D-29z1646): round 467 is the C-R466-01 fix-up (planned 2026-11-12, before the due date); REGRESSION runs at the first planning dated on or after 2026-11-13 and carries every scope_additions entry (L6) | '
                 + reg['status'])
b['current_task'] = 'Round 467: STORE-2b-3c-2b fix-up - TS8 observes the shadow pre-check (C-R466-01, test-only; current-task.md, D-29z1646)'
b['rounds'].append({'round': 467, 'task': 'current-task.md', 'decision': 'D-29z1646', 'type': 'STORE-2b-3c-2b fix-up test-only: store-teal-sweep TS8 spy + docs 299/304 line 4 and doc 304 delta',
                    'status': 'dispatched', 'note': f'baseline 6d321c7 + unpublished round-466 diff (4 paths); delta sketch sha {SHA}; post-image b-round-466/sketch-467-files-sha256.txt'})
b['decisions_log_b'].append({'id': 'D-29z1645', 'date': TODAY, 'by': BY, 'decision': (
    f'Round 466 not accepted: {C466}. C-R466-01 (Medium, B spec) recorded; it is the same root cause as A-R466-REVIEW-M1 and B\'s own TL-R465-L1, which is merged into it (lesson 7). '
    'Ruling on A\'s STOP: option (b), an observable test, not (c) a regrade: the reproduced Medium stands. A-R466-REVIEW-L1..L4 and INFO deferred (TS7 stays frozen: its Chromium probe and counts are pinned). '
    'The code-reviewer architecture note goes to ARCH-CHECKPOINT-STYLE-SCAN as a signal, not a task. The three target findings stay open until a C PASS. regression-last.json unchanged.')})
b['decisions_log_b'].append({'id': 'D-29z1646', 'date': TODAY, 'by': BY, 'decision': (
    'Round 467 = STORE-2b-3c-2b fix-up, superseding the "round 467 = REGRESSION-2026-11-13" line of D-29z1643: C bugs come first and this planning is dated 2026-11-12, before the due date. '
    f'Delta sketch b-round-466/sketch-467.patch.txt (sha {SHA[:8]}, 3 files) on the unpublished round-466 tree (no revert): TS8 spies on String.prototype.matchAll (0 scans for a no-shadow source, a scan for BOX-SHADOW and TextShadow), '
    'docs 299/304 line 4 -> Completed (C round 467 PASS) (L28), doc 304 Problem/Solution + test lines. TS8 stays one it(): covering 4 files / 31 tests. '
    'B pre-check on a scratch copy: M1-M13 unchanged red, new M14-NO-PRECHECK red on TS8; covering 31/31 three times; typecheck and Biome rc 0; tw-doc-leak cssEqual true; build vs HEAD 180 files 0 differing lines; corpus compare cmp-equal to round 465. '
    'tech-lead APPROVE (Lows TL-R466-L1/L2 deferred; the "pending status line" Low is ruled by L28). Lesson L58 extended with the test-title clause (C-R466-01).')})
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(DONE, 'w').write('applied\n'); print('ok version', b['version'])
