import json, sys
P = sys.argv[1]
b = json.load(open(P, encoding='utf-8'))
b['version'] = 138
b['updated'] = '2026-10-24 B round 145 -> 146 planning (D-29z111)'
b['advisor_used_by_B'] = 'round 145 -> 146 planning: advisor available and used (before writing; reconcile on flex-wrap probe; before finishing)'
b['current_task'] = ('current-task.md (round 146: D-29z111 - V-0.5a fix-up: library "▶ Playing" marker as its own line in the option, '
    'outside the meta row (C-R145-01 + ABL-B-1); DL-VAL exact DM1-DM4 pins (A-R145-REVIEW-DM-VALUES); PC2 exact purchased guard messages '
    '(A-R145-REVIEW-GUARD-TEXTS); doc 119; baseline = round-145 working tree on HEAD 9a67abd (gate 145 skipped); frozen 960; grants 5; '
    'C: PLAY-MARKER, LAYOUT-LIB with predicted boxes, LAYOUT-REST, LIB-ROW-TEXT-SMOKE, G146-3, PX-NET)')
for e in b['rounds']:
    if e.get('round') == 145:
        e['status'] = ('c_fail_low (C round 145 FAIL browserVerified=true realVerified=true: all rows PASS except LAYOUT-LIB (vi) = C-R145-01 Low; '
            'gate 145 skipped "C taskStatus FAIL"; changes kept uncommitted in the tree, published with round 146 after C PASS)')
        e['result_evidence'] = 'c-round-145.md, c-round-145.json, gates/gate-round-145.json, a-round-145.md'
        e['c_rows_passed'] = ['T145-TARGETED','SOURCE-SCOPE','AN-REVIEW','LIB-ROW-TEXT','LIB-LABELS','LIB-SEARCH','LAYOUT-REST','G145-3','PX-NET','REG-HYD']
        e['c_rows_failed'] = ['LAYOUT-LIB (vi) - C-R145-01']
        e['c_rows_blocked'] = ['PURCHASED-LABEL (backend unavailable in cloud)', 'G145-3 fake-Bearer 403 (backend unavailable in cloud)']
b['rounds'].append({'round': 146, 'task': 'current-task.md', 'decision': 'D-29z111', 'status': 'dispatched',
    'items': ['V-0.5a fix-up: C-R145-01 + ABL-B-1 (marker own line, PM1)', 'A-R145-REVIEW-DM-VALUES (DL-VAL)', 'A-R145-REVIEW-GUARD-TEXTS (PC2 exact)'],
    'note': '5 existing grants (ArrangementLibrary.tsx PM1, library-row-strings-ui.test LRS3, studio-lab-demo.test DL-VAL + 4 titles, collection.test PC2, doc 119); baseline = round-145 working tree (15 M + 2 ??) on HEAD 9a67abd; frozen 960; mutations m97-m100; flex-wrap rejected by B probe b-round-145/out/flexprobe.json'})
b['baseline_tree_at_round146'] = {'head': '9a67abd78b41162262c0882544dbdd4544afef1b',
    'tree': 'dirty: round-145 A changes uncommitted (15 M + 2 ??), byte-equal to tmp/studio-real-loop/a-round-145/end-sha256.txt (B sha256sum -c OK at planning)',
    'frozen_list': 'tmp/studio-real-loop/b-round-145-r146-tree-sha256.txt (960)', 'grants': 'tmp/studio-real-loop/b-round-145-r146-grants.txt (5, no new)',
    'start_hashes': 'tmp/studio-real-loop/b-round-145-r146-granted-start-sha256.txt', 'start_copies': 'tmp/studio-real-loop/b-round-145/r146-granted-start/',
    'layout_baseline': 'tmp/studio-real-loop/b-round-144/out/libbase-{1440,1280}.json; predicted previewing boxes in current-task.md section 4 LAYOUT-LIB (ii)'}
q = b['post_current_stage_queue']
va = [x for x in q if x.get('id') == 'VISUAL-A-OBSIDIAN'][0]
va['status'] += '; V-0.5a round 145 C FAIL (Low C-R145-01 only) -> round 146 fix-up (D-29z111); gate 145 skipped'
for s in va['v0_plan_d29z92']['stages']:
    if s['stage'] == 'V-0.5':
        s['status'] = 'split_d29z110: V-0.5a bug (round 145 C FAIL on Low C-R145-01; fix-up round 146, D-29z111); V-0.5b, V-0.5c planned'
        for sub in s.get('substages_d29z110', []):
            if sub['stage'] == 'V-0.5a':
                sub['status'] = 'bug: C round 145 FAIL (LAYOUT-LIB (vi), C-R145-01 Low); every other row PASS with browser evidence; fix-up round 146 (D-29z111); not c_pass until C round 146 PASS'
                sub['round'] = [145, 146]
        s['rulings_d29z111'] = {
            'R1_section7_gap': 'C FAIL only on a Low the round caused -> bounded fix-up, same owner (not a waiver): the criterion was the round own, the round worsened it, nothing publishes without C PASS; row added to future section 7 tables',
            'R2_fix_choice': 'marker as its own line (last child of the option button, whitespace-nowrap), rendered only while previewing; flex-wrap on the meta row rejected by B real-Chromium probe (error span jumps to its own line: b-round-145/out/flexprobe.json)',
            'R3_m91': 'round-145 m91 expected-red list was a B spec error: failed-source-refusal and status-announcement-ui fixtures reject with hand-written LOADER_ERROR; fixtures stay hand-written (GATE132-S4); nothing scheduled',
            'R4_scope': 'three items: C-R145-01(+ABL-B-1), A-R145-REVIEW-DM-VALUES, A-R145-REVIEW-GUARD-TEXTS'}
of = b['open_findings']
def upd(i, **kw):
    for f in of:
        if f.get('id') == i:
            f.update(kw); return f
    return None
upd('ABL-B-1', status='scheduled round 146 with C-R145-01 (D-29z111; round owns ArrangementLibrary.tsx, cheap; 2026-10-23 early-fix rule); closes on C PASS')
upd('ARCH-R142-LIBRARY-SEARCH-KEYWORDS', status='implemented round 145 KW1; C LIB-SEARCH PASS round 145 (browser); closes on publication with round 146')
of.append({'id': 'C-R145-01', 'severity': 'low', 'status': 'scheduled round 146 (D-29z111 R1/R2); closes on C PASS',
    'title': "library preview row marker '▶ Playing' overflows the 126 px option by 12 px more than baseline and is clipped to '▶ Play' while audio plays (worsens ABL-B-1)",
    'source': 'c-round-145.json bugs[0]', 'evidence': 'c-round-145/shots/lib-previewing-1440.png, c-round-145/shots/previewing-1280.png, c-round-145/out/layout145-{1440,1280}.json, overflow145-{1440,1280}.json',
    'repro': "fresh /studio-lab 1440x900 or 1280x720; click 'Soft impact'; press the preview play button; marker span [257,y,42,32], list scrollWidth 155 > clientWidth 134; visible '▶ Play'",
    'regression': 'worsening of ABL-B-1 caused by round 145 LR1 text', 'links': ['ABL-B-1', 'V-0.5a']})
of.append({'id': 'A-R145-REVIEW-DM-VALUES', 'severity': 'low', 'status': 'scheduled round 146 (DL-VAL)', 'title': 'no unit assertion pins the exact DM1-DM4 values (label, notice, both collectionLabels); ST47 only proves they are not Georgian', 'source': 'a-round-145.md code-reviewer Low 1'})
of.append({'id': 'A-R145-REVIEW-GUARD-TEXTS', 'severity': 'low', 'status': 'scheduled round 146 (PC2 exact)', 'title': 'collection.test PC2 l.143/153/156 check the purchased guard errors only with toThrow(Error)', 'source': 'a-round-145.md code-reviewer Low 2'})
of.append({'id': 'B-R145-M91-SPEC', 'severity': 'info', 'status': 'ruled (D-29z111 R3): spec error, no task', 'title': 'round-145 m91 expected failed-source-refusal / status-announcement-ui red; their fixtures reject with hand-written LOADER_ERROR', 'source': 'a-round-145.md, c-round-145.json notesForB'})
of.append({'id': 'GATE-145-SKIPPED', 'severity': 'info', 'status': 'open: round-145 changes uncommitted; publish together with round 146 after C PASS', 'source': 'gates/gate-round-145.json'})
of.append({'id': 'G145-3-FAKE-BEARER-403', 'severity': 'info', 'status': 'open backend-only evidence (backend unavailable in cloud)', 'source': 'c-round-145.json blocked'})
of.append({'id': 'C-R145-OBS-LIBRARY-PLAYHEAD', 'severity': 'info', 'status': 'not a bug (C): arrangement-library-playhead shows the arrangement playhead and stays 00:00.000 during a library preview', 'source': 'c-round-145.json notesForB'})
for d in b['deferred_low_polish']:
    if d.get('id') == 'ABL-B-1':
        d['status'] = 'scheduled round 146 (D-29z111) with C-R145-01; leaves deferred_low_polish on C PASS'
    if d.get('id') == 'C-R142-02':
        d['status'] = 'implemented round 145 (KW1); C LIB-SEARCH PASS round 145 in the browser (stems/Stems/STEMS/stem -> 4 stems); round 145 not published (gate skipped) -> closes when rounds 145+146 publish after C round 146 PASS'
b['architecture_signals'].append({'id': 'ARCH-R145-STRINGS-22ND-OBJECT', 'round': 145, 'source': 'a-round-145.md code-reviewer Architecture note',
    'note': 'strings.ts gets its 22nd studio*Strings object (~680 lines); reviewer: keep (leaf rule test-enforced, no new coupling); appended to the pending strings-split checkpoint request (round-145 addendum); not scheduled'})
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', b['version'], len(b['deferred_low_polish']))
