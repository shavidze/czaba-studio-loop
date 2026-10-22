import json
P = 'backlog.json'
b = json.load(open(P))
assert b['version'] == 86, b['version']
b['version'] = 87
b['updated'] = '2026-10-22 (B round 87 review -> round 88 task, D-29z53)'
b['current_task'] = ('current-task.md (round 88: D-29z53 - fix R87-PROGRESS-BELOW-FOLD-1280: Export dialog status + progress + '
    'overload warning + buttons wrapped in one sticky bottom-0 bg-surface footer (DOM/Tab order unchanged) + focusin guard so a '
    'focused control is never hidden behind the footer; new export-dialog-footer.test.tsx FT1-FT4; doc 077 l.4 + 3 additions. '
    'Baseline HEAD 971141d + uncommitted round-87 tree (7 M + 10 ??), frozen b-round-87-r88-tree-sha256.txt 505)')
b['baseline_tree_at_round88'] = {
    'head': '971141d67a1dd33da8f1165de1d895bd62b4e022', 'status': '7 M + 10 ?? (round-87 work, gate 87 skipped: C FAIL)',
    'frozen_list': 'b-round-87-r88-tree-sha256.txt', 'entries': 505, 'snapshots': 'b-round-87-r88-snapshots',
    'protected': '4/4', 'a_round87_end_hashes': 'match',
}
items = {it['id']: it for it in b['items']}
s20 = items['SRW-20']
s20['status'] = ('in_progress (stage 1 C PASS r85, published 51e024a; stage 2 C PASS r86, published 971141d; stage 3a C round 87 '
    'FAIL: 18/18 rows PASS both viewports browserVerified=true realVerified=true, one medium bug R87-PROGRESS-BELOW-FOLD-1280 '
    '-> fix round 88 D-29z53; stage 3b cancel planned; R20-X4 open; none deferred)')
for a in s20['acceptance']:
    if a['id'] == 'R20-X4':
        a['status'] = ('open (responsiveness part measured C round 87: 5M WAV max rAF 105-107 ms, MP3 97-111 ms vs 445 ms baseline; '
                       'progress visible at 1440 but below the fold at 1280 -> round 88; cancel part = stage 3b)')
for st in s20['stages']:
    if st.get('stage') == '3a':
        st.update({
            'status': 'c_fail_bug (fix dispatched round 88)', 'browserVerified': True, 'realVerified': True,
            'c_round87_passed': ['PX-WAV5', 'PX-MP35', 'PX-PHASES', 'PX-WORKER', 'PX-WAV-SAME', 'PX-MP3-SAME', 'PX-BOTH',
                'PX-REUSE', 'PX-CDNFAIL', 'PX-RETRY (1440)', 'PX-RANGE-SHORT', 'PX-KEYS', 'PX-X3 (1280)', 'PX-NET', 'REG-HYD',
                'G87-3 (fake-Bearer 403 sub-check blocked: backend unavailable in cloud)', 'T87-TARGETED', 'SOURCE-UNCHANGED'],
            'c_round87_extra': ['EXTRA-WORKER-FAIL (1440) PASS: worker aborted -> exact worker alert, 0 files, no main-thread fallback'],
            'c_round87_bugs': ['R87-PROGRESS-BELOW-FOLD-1280 (medium)'],
            'c_round87_not_run': ['production-bundle worker / MP3 (no preview server in the cloud)'],
            'gate87': 'skipped (C taskStatus FAIL); not published',
            'fix_round': 88, 'fix_decision': 'D-29z53',
            'evidence': ['c-round-87.md', 'c-round-87.json', 'gates/gate-round-87.json', 'a-round-87.md'],
        })
s20['files'] = sorted(set(s20.get('files', []) + ['app/lib/arrangement/__tests__/export-dialog-footer.test.tsx']))

upd = {
    'GATE86-S1-POLLER-RETRY': ('c_pass for /studio-lab (C round 87 PX-RETRY 1440: timeout alert at exactly 120 000 ms, no late load, '
        'second MP3 completed in 7.5 s in the same page); awaiting publication with round 88; purchased path stays FFMPEG-LOAD-POLLER-HANG'),
    'GATE86-S3-TIMEOUT-COVERAGE': ('import part c_pass (C round 87 PX-RETRY, timer from the encoder-loading message); conversion has no '
        'fixed limit by decision - Cancel in stage 3b; awaiting publication'),
    'PROD-MP3-UNVERIFIED': ('open evidence (gate 87 skipped, so not tried; re-requested for gate 88: build + preview + one MP3 export, '
        'now also the export-wav worker)'),
}
for f in b['open_findings']:
    if f.get('id') in upd:
        f['status'] = upd[f['id']]
known = {f.get('id') for f in b['open_findings']}
new = [
    {'id': 'R87-PROGRESS-BELOW-FOLD-1280', 'severity': 'medium', 'status': 'scheduled round 88 (D-29z53: sticky footer + focus guard)',
     'to': 'A', 'title': ('at 1280x720 the Export progress label is cut off and the <progress> bar and busy button sit below the '
     'dialog panel fold during an export (panel clientHeight 646, scrollHeight 758); pre-existing 12 px overflow at 971141d'),
     'evidence': 'c-round-87.md, c-round-87.json bugs[0], c-round-87/vis-1280x720.json, wheel-1280x720.json, shots/progress-1280x720-*.png'},
    {'id': 'R87-L-TIMEOUT-RELOAD-TEXT', 'severity': 'low', 'status': 'open - Lows batch', 'to': 'Lows batch',
     'title': ('the 120 s MP3 timeout text still says "გადატვირთე გვერდი" (reload the page), but since round 87 a retry works in the '
     'same page (C PX-RETRY) - copy no longer accurate; change needs ArrangementContext.tsx + export-mp3 l.64 + export-progress-ui l.67 constants'),
     'evidence': 'c-round-87.md Observations; c-round-87.json observations[1]'},
    {'id': 'R87-O-PROGRESS-FILL-COLOUR', 'severity': 'info', 'status': 'Tech Lead headed-Chrome check (R87-T)', 'to': 'Tech Lead',
     'title': ('headless Linux Chromium paints the <progress> fill #008000 on #808080 although computed accent-color is the brand '
     'token rgb(18,217,200); same classes as SfxSceneExport'), 'evidence': 'c-round-87.json observations[0]'},
    {'id': 'A-R87-L5-CACHED-ENCODER-AFTER-FAILED-CONVERSION', 'severity': 'low', 'status': 'scheduled stage 3b (with Cancel)', 'to': 'A (3b)',
     'title': 'a failed conversion leaves the cached lab encoder in place (same as the frozen util)', 'evidence': 'a-round-87.md code-reviewer L5'},
    {'id': 'A-R87-L7-PROGRESS-MONOTONIC', 'severity': 'low', 'status': ('watch: store does not enforce non-decreasing values; C round 87 '
     'PX-PHASES observed 0 decreases at both viewports; re-checked round 88 PX-PHASES-R'), 'to': 'watch',
     'title': 'progress store does not enforce non-decreasing fractions within a phase', 'evidence': 'a-round-87.md L7; c-round-87.json PX-PHASES'},
    {'id': 'A-R87-LOW-PU-ORDER', 'severity': 'low', 'status': 'open - Lows batch', 'to': 'Lows batch',
     'title': 'export-progress-ui PU tests depend on order (only the first PU4 opens the delayed-import gate)', 'evidence': 'a-round-87.md code-reviewer Low'},
    {'id': 'ARCH-EXPORT-MP3-ORCHESTRATION', 'severity': 'info', 'status': ('signal (not scheduled) under ARCH-EXPORT-PIPELINE; input to '
     'checkpoint q14 at the SRW-20 boundary after 3b'), 'to': 'B/root',
     'title': ('round-87 code-reviewer Architecture note: exportMp3 (ArrangementContext.tsx:2726-2881) changed in rounds 85-87 and 3b '
     'again; proposal after 3b: move timer/import/reset/abort orchestration into a lib/arrangement/ module, useArrangement() shape and PU/MX tests unchanged'),
     'evidence': 'a-round-87.md Architecture note (verbatim)'},
]
for n in new:
    if n['id'] not in known:
        b['open_findings'].append(n)
for r in b['rounds']:
    if r.get('round') == 87:
        r['status'] = 'c_fail (18/18 rows PASS, browserVerified=true; bug R87-PROGRESS-BELOW-FOLD-1280 medium); gate 87 skipped'
b['rounds'].append({
    'round': 88, 'task': 'current-task.md', 'decision': 'D-29z53', 'status': 'dispatched',
    'items': ['R87-PROGRESS-BELOW-FOLD-1280: sticky Export footer (status, progress, warning, buttons) + focusin guard'],
    'note': ('baseline HEAD 971141d + uncommitted round-87 tree 7 M + 10 ??; frozen b-round-87-r88-tree-sha256.txt 505/505; '
             'snapshots b-round-87-r88-snapshots; protected 4/4; expected 7 M + 11 ??'),
    'owned': ['app/components/arrangement/ArrangementExportDialog.tsx (F1 footer + F2 focus guard)',
              'app/lib/arrangement/__tests__/export-dialog-footer.test.tsx (new)',
              'docs/implementation/2026/quarter-IV/077-studio-lab-export-progress-and-worker.md (l.4 + 3 additions)'],
    'c_ids': ['VIS-IDLE', 'VIS-RENDER', 'VIS-SCROLL', 'VIS-DONE', 'VIS-ERROR', 'VIS-VIDEO', 'FOCUS-NOT-OBSCURED', 'PX-PHASES-R',
              'PX-KEYS-R', 'PX-WAV5-R', 'PX-NET', 'REG-HYD', 'G88-3', 'T88-TARGETED', 'SOURCE-UNCHANGED'],
})
b['advisor_used_by_B'] = 'round 87 review (2026-10-22): advisor consulted before writing; advice followed (bug-only round, sticky footer, timeout copy -> Lows)'
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print('ok', b['version'])
