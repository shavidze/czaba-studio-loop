import json, sys
P = sys.argv[1]
b = json.load(open(P, encoding='utf-8'))
b['version'] = 137
b['updated'] = '2026-10-24 B round 144 -> 145 planning (D-29z110)'
b['advisor_used_by_B'] = 'round 144 -> 145 planning: advisor available and used (before writing; before finishing)'
b['current_task'] = ('current-task.md (round 145: D-29z110 - VISUAL-A V-0.5a: studioSourceLoadStrings (13 keys: loader errors, purchased label, '
    'Context l.3468 fallback, library row Loading…/Error:/▶ Playing) in collection.ts, studio-lab-demo.ts, ArrangementContext l.3468 and '
    'ArrangementLibrary l.118-126 only; demo collection labels + notice English (sound titles stay, R3); LIB-SEARCH-KEYWORDS '
    '(LIBRARY_KIND_SEARCH_KEYWORDS, closes C-R142-02); doc 118 Completed; new doc 119; baseline HEAD 9a67abd clean; frozen 948; grants 15 + 2 new; '
    'C: LIB-ROW-TEXT, LIB-LABELS, LIB-SEARCH, LAYOUT-LIB vs b-round-144/out/libbase-{1440,1280}.json, LAYOUT-REST, G145-3, PX-NET)')
r = b['rounds']
for e in r:
    if e.get('round') == 144:
        e['status'] = 'c_pass_published (C round 144 PASS browserVerified=true realVerified=true; gate 144 published 9a67abd with rounds 142+143)'
        e['result_evidence'] = 'c-round-144.md, c-round-144.json, gates/gate-round-144.json'
r.append({'round': 145, 'task': 'current-task.md', 'decision': 'D-29z110', 'status': 'dispatched',
    'items': ['VISUAL-A-OBSIDIAN / V-0.5a: library source-load errors + row status + demo labels/notice + LIB-SEARCH-KEYWORDS (C-R142-02)'],
    'note': '15 existing grants + 2 new (library-row-strings-ui.test.tsx, doc 119); baseline HEAD 9a67abd clean; frozen 948; mutations m91-m96; B layout baseline b-round-144/out/libbase-{1440,1280}.json'})
b['baseline_tree_at_round145'] = {'head': '9a67abd78b41162262c0882544dbdd4544afef1b', 'tree': 'clean (git status empty at planning)',
    'frozen_list': 'tmp/studio-real-loop/b-round-144-r145-tree-sha256.txt (948)', 'grants': 'tmp/studio-real-loop/b-round-144-r145-grants.txt (15 + 2 new)',
    'start_hashes': 'tmp/studio-real-loop/b-round-144-r145-granted-start-sha256.txt', 'start_copies': 'tmp/studio-real-loop/b-round-144/r145-granted-start/',
    'layout_baseline': 'tmp/studio-real-loop/b-round-144/out/libbase-{1440,1280}.json (ready/previewing/error; B real Chromium at 9a67abd)'}
q = b['post_current_stage_queue']
va = [x for x in q if x.get('id') == 'VISUAL-A-OBSIDIAN'][0]
va['status'] = va['status'].replace('V-0.4e = round 142 (D-29z107)', 'V-0.4e done (rounds 142-144, C round 144 PASS browserVerified, published 9a67abd) -> V-0.4 complete; V-0.5a = round 145 (D-29z110)')
if 'V-0.5a = round 145' not in va['status']:
    va['status'] += '; V-0.4e done (rounds 142-144, C round 144 PASS browserVerified, published 9a67abd) -> V-0.4 complete; V-0.5a = round 145 (D-29z110)'
for s in va['v0_plan_d29z92']['stages']:
    if s['stage'] == 'V-0.4':
        s['status'] = 'c_pass_published (V-0.4a..e done; V-0.4e rounds 142-144, gate 144 published 9a67abd)'
        for sub in s.get('substages_d29z103', []):
            if sub['stage'] == 'V-0.4e':
                sub['status'] = 'done (c_pass_published): C round 144 PASS browserVerified=true realVerified=true (c-round-144.json); gate 144 published 9a67abd with rounds 142+143'
    if s['stage'] == 'V-0.5':
        s['status'] = 'split_d29z110: V-0.5a dispatched round 145; V-0.5b, V-0.5c planned'
        s['measurement_d29z110'] = {'baseline': '9a67abd', 'source_georgian_lines_non_comment': {
            'ArrangementLibrary.tsx': 19, 'collection.ts': 19, 'studio-lab-demo.ts': 19, 'ArrangementVideoDock.tsx': 17,
            'ArrangementLibraryPreview.tsx': 8, 'ArrangementContext.tsx': 1, 'routes/studio-lab.tsx': 1},
            'total': 82, 'stays_as_sound_titles_R3': 'studio-lab-demo.ts l.13, 35-38, 44, 51, 72, 73 (9 lines)'}
        s['substages_d29z110'] = [
            {'stage': 'V-0.5a', 'round': [145], 'area': 'studioSourceLoadStrings: collection.ts thrown errors + l.67 purchased label, studio-lab-demo.ts thrown errors, ArrangementContext l.3468 fallback, ArrangementLibrary l.118-126 row status (one row never mixes languages, GATE128-S1); studio-lab-demo labels l.11/12/14 + notice l.154; LIB-SEARCH-KEYWORDS (C-R142-02, gate-144 #4); doc 118 Completed (gate-144 #1)', 'status': 'dispatched'},
            {'stage': 'V-0.5b', 'area': 'rest of ArrangementLibrary.tsx (16: All per Live 12 §4.2, fold/unfold per §4.5, search copy, panel labels), ArrangementLibraryPreview.tsx (8), collection.ts status messages l.16-30 (ready message names the preview Add button)', 'status': 'planned'},
            {'stage': 'V-0.5c', 'area': 'ArrangementVideoDock.tsx (17; dock return label uses compact view, D-29z102 R4), routes/studio-lab.tsx meta title + ST40 (gate-141 #3), default-track-names-ssr console.error assertion (gate-141 #2), lang="en" on the Studio root, final RV-4 grep, RV-1 bbox-baseline re-capture', 'status': 'planned'}]
        s['rulings_d29z110'] = {
            'R2_search_keywords': "LIBRARY_KIND_SEARCH_KEYWORDS {music:['music'], stem:['stem','stems'], sfx:['sfx']}; display labels unchanged; Georgian search synonyms not added (not requested; V-0 English-only; ST44) -> signal LIB-SEARCH-GEORGIAN-SYNONYMS",
            'R2b_sfx_collection_label': 'sfx matching the Music previews via the collection label is intended (LIB-03; label truthfully lists SFX)',
            'R3_sound_titles': 'demo sound titles stay (D-29z92); labels, notice and thrown errors move',
            'R4_location': 'studioSourceLoadStrings in strings.ts for shared loader errors and row status; demo labels/notice English literals in the data file',
            'R5_layout': 'RV-1 V-0 text-width exception only inside the library column; text-flow rule in current-task.md section 4'}
of = b['open_findings']
def upd(i, **kw):
    for f in of:
        if f.get('id') == i:
            f.update(kw); return f
    return None
upd('C-R143-01', status='closed (D-29z109 R1 + C round 144 LAYOUT-1440 PASS: placeholder exactly [735.5,759.5,139,16]; published 9a67abd)')
upd('C-R142-01', status='closed: fixed round 143, C PASS rounds 143/144, published 9a67abd')
upd('GATE-142-SKIPPED', status='resolved: rounds 142+143+144 published together as 9a67abd (gate 144)')
upd('GATE-143-SKIPPED', status='resolved: rounds 142+143+144 published together as 9a67abd (gate 144)')
upd('A-R143-REVIEW-LOWS', status='done: R-L1/R-L2 C AN-REVIEW PASS round 144, published 9a67abd; R-L3 info')
upd('ARCH-R142-LIBRARY-SEARCH-KEYWORDS', status='scheduled: round 145 V-0.5a KW1 (D-29z110 R2)')
new = [
    {'id': 'G144-3-FAKE-BEARER-403', 'severity': 'info', 'status': 'blocked: backend unavailable in cloud (open backend evidence)', 'to': 'backend-enabled check', 'evidence': 'c-round-144.json blocked'},
    {'id': 'GATE144-S1-DOC118-STATUS', 'severity': 'low', 'status': 'folded into round 145 (doc 118 is granted; cheap)', 'title': 'doc 118 status/testing line still In Progress after C round 144 PASS', 'evidence': 'gates/round-144/review.md suggestion 1'},
    {'id': 'GATE144-S4-LIB-SEARCH', 'severity': 'low', 'status': 'scheduled round 145 = LIB-SEARCH-KEYWORDS (closes C-R142-02 on C PASS)', 'title': 'stems matches nothing; kind label doubles as search text', 'evidence': 'gates/round-144/review.md suggestion 4'},
    {'id': 'GATE144-S6-DESIGN-D-WEAKER', 'severity': 'info', 'status': 'acknowledged (exact toEqual label checks still cover content)', 'evidence': 'gates/round-144/review.md suggestion 6'},
    {'id': 'ARCH-R144-STRINGS-IMPORTS', 'severity': 'info', 'status': 'signal, reviewer verdict keep (one-way imports into the leaf strings.ts)', 'evidence': 'gates/round-144/review.md Architecture note'},
    {'id': 'LIB-SEARCH-GEORGIAN-SYNONYMS', 'severity': 'info', 'status': 'signal for Saba, not scheduled (D-29z110 R2): Georgian query words (მუსიკა/სტემი/სტემები) no longer match by kind after V-0; adding them would need a Georgian allowance in an English-only source', 'evidence': 'gates/round-144/review.md suggestion 4'},
]
ids = {f.get('id') for f in of}
for n in new:
    if n['id'] not in ids:
        of.append(n)
dl = b['deferred_low_polish']
for f in dl:
    if f.get('id') == 'C-R142-02':
        f['status'] = 'deferred_low_polish -> scheduled round 145 (V-0.5a owns library.ts, LIB-SEARCH-KEYWORDS); closes on C PASS'
dids = {f.get('id') for f in dl}
for d in [
    {'id': 'GATE144-S2-CLIPGAIN-SINGLE-INLINE', 'title': 'ArrangementDetailPanel.tsx l.448/616 build the single-clip Clip Gain status inline instead of a studioDetailStrings formatter', 'severity': 'low', 'status': 'deferred_low_polish', 'source': 'gates/round-144/review.md suggestion 2', 'evidence': 'gates/round-144/review.md', 'repro': 'read ArrangementDetailPanel.tsx l.448 and l.616 at 9a67abd'},
    {'id': 'GATE144-S3-HEIGHT-VALUETEXT-INLINE', 'title': 'ArrangementDetailPanel.tsx l.1115 open-state aria-valuetext `${openHeight} px` is inline while the collapsed branch uses the module', 'severity': 'low', 'status': 'deferred_low_polish', 'source': 'gates/round-144/review.md suggestion 3', 'evidence': 'gates/round-144/review.md', 'repro': 'read ArrangementDetailPanel.tsx l.1115 at 9a67abd'},
    {'id': 'GATE144-S5-PENDING-HINT-PREFIX-SLICE', 'title': 'ArrangementDetailPanel.tsx l.45-47 derives the pending hint by slicing pendingFull after pendingLabel (guarded by ST42)', 'severity': 'low', 'status': 'deferred_low_polish', 'source': 'gates/round-144/review.md suggestion 5', 'evidence': 'gates/round-144/review.md', 'repro': 'read ArrangementDetailPanel.tsx l.45-47 at 9a67abd'}]:
    if d['id'] not in dids:
        dl.append(d)
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', len(of), len(dl))
