# B round 421 -> 422 backlog update (v397 -> v398). Run once from the loop root: python3 -I b-round-421/update-backlog.py
import json, os, sys
DONE = 'b-round-421/update-backlog.done'
if os.path.exists(DONE):
    sys.exit('already applied (' + DONE + ')')
p = 'backlog.json'
b = json.load(open(p, encoding='utf-8'))
if b.get('version') != 397:
    sys.exit(f"expected version 397, found {b.get('version')}")
BY = '2026-11-09 B round 421 -> 422 planning'
b['version'] = 398
b['updated'] = '2026-11-09 (B round 421 -> 422 planning: round 421 accepted and published 4786c13; SYS-2 stage 1 (held Enter on the transport and marker flag) dispatched as round 422)'
b['current_task'] = 'Round 422: SYS-2 stage 1 (held Enter acts once on Split, Follow, Back to start, Loop, Zoom to range and the marker flag); sketch b-round-421/sketch-422.patch.txt (current-task.md)'
b['advisor_used_by_B'] = 'round 421 -> 422 planning: advisor available and consulted after orientation and before close; tech-lead reviewed the sketch (b-round-421/sketch-review.md)'
b['decisions_log_b'].extend([
    {'id': 'D-29z1471', 'date': '2026-11-09', 'by': BY,
     'decision': 'Round 421 accepted from C evidence only: C PASS (c-round-421.json: 8 rows passed, 0 bugs, browserVerified/realVerified true; fake-bearer auth path BLOCKED backend-unavailable, kept as open backend evidence); gate 421 published 4786c13 on both remotes. SYS-R418-PREVIEW-LIFECYCLE done; its 8 ids close (rows PL1-PL9, PC12); C-R420-CLAIMS-K22-ARCHIVE-AGAIN and C-R420-CLAIMS-K8-K24-YOUTUBE-REQUEST-CONSUMED close (C row 1 PASS). A-R421-REVIEW-L1-DECODED-STOP-ROW (Low, test coverage) goes to deferred_low_polish. A-421 architecture note (useLibraryPreviewController) recorded as a signal, not a task. Baseline for round 422 = 4786c13.'},
    {'id': 'D-29z1472', 'date': '2026-11-09', 'by': BY,
     'decision': 'REGRESSION-2026-11-10 is not due at this planning (regression-last 2026-11-07, today 2026-11-09: 2 days < 3). It is due at the first planning on or after 2026-11-10, now the 422 -> 423 planning; its done-since window extends to round 422.'},
    {'id': 'D-29z1473', 'date': '2026-11-09', 'by': BY,
     'decision': 'SYS-2 re-anchored at 4786c13 (premise re-check, L7/L29): Play, Stop, Undo, Redo, Delete, Zoom back, Export and the marker add/prev/next buttons and rename field already prevent a repeated Enter; ARCH-R107-SHARED-ENTER-GUARD no longer gates dispatch (L46 default long passed; the existing preventRepeatedEnterKeyDown convention is the shared guard). SYS-2 splits in two stages, full scope kept. Stage 1 = round 422: Split, Follow, Back to start, Loop, Zoom to range (ArrangementTransport.tsx) + the marker flag (handleFlagKeyDown, ArrangementMarkerRow.tsx); rows HE1-HE6 in transport-centre-ui.test.tsx; sketch sha 7002efc1 (tech-lead approve-with-lows; TL-R422-04/05/06 fixed in the sketch). Fit stays unguarded (TH5 lock from round 98; idempotent). Stage 2 = the remaining A-R107 sweep (scan b-round-421/data/button-guard-scan.txt): lane/group/master Mute and Solo, metronome, video dock expand/return/close, folds, detail toggle, Snap/Env and grid menu items, library notice/folder rows, group name editor held Enter, held Escape on the marker editor; each site gets a ruling (guard, or idempotent-exclusion) in its task. Doc 272.'},
    {'id': 'D-29z1474', 'date': '2026-11-09', 'by': BY,
     'decision': 'Order inside SYS-1..3: SYS-2 stage 1 first (a real-browser keyboard defect: held Enter flips Follow and Loop and restarts playback, reproduced at HEAD in b-round-421/probe/head), then SYS-2 stage 2, SYS-1 (test-only selector hygiene; all six anchors still present at 4786c13), SYS-3 (IME; 0 isComposing in arrangement). REGRESSION-2026-11-10 goes first at the 422 -> 423 planning. STEM-LANES goes first as soon as Saba answers AGREE-STEM-LANES. Then STORE-2b..5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, phase 2 (skip rule). Next RETRO round 435.'},
])
for r in b['rounds']:
    if r.get('round') == 421 and r.get('status') == 'dispatched':
        r['status'] = 'c_pass_published (D-29z1471): C PASS c-round-421.json; gate 421 published 4786c13'
b['rounds'].append({'round': 422, 'task': 'current-task.md', 'decision': 'D-29z1473', 'type': 'SYS-2 stage 1 (runtime + tests)', 'status': 'dispatched',
                    'note': 'baseline 4786c13 clean; frozen b-round-421/r422-frozen-sha256.txt (1317); grants b-round-421/grants-422.txt (4); sketch b-round-421/sketch-422.patch.txt sha 7002efc1; review b-round-421/sketch-review.md; claims b-round-421/claims-422.sh'})
n = 0
for t in b['systemic_tasks']:
    if t.get('id') == 'SYS-R418-PREVIEW-LIFECYCLE':
        t['status'] = 'done (D-29z1471): C round 421 PASS (browserVerified true), gate 421 published 4786c13 | ' + t['status']; n += 1
    if t.get('id') == 'SYS-2':
        t['status'] = 'in_progress (D-29z1473): stage 1 dispatched round 422 (transport Split/Follow/Back to start/Loop/Zoom to range + marker flag); stage 2 = remaining A-R107 sweep | ' + t['status']
        t['stages_d29z1473'] = {'stage1': 'round 422: ArrangementTransport.tsx Split, Follow, Back to start, Loop, Zoom to range; ArrangementMarkerRow.tsx handleFlagKeyDown; rows HE1-HE6', 'stage2': 'remaining sites of b-round-421/data/button-guard-scan.txt (NONE / KEYDOWN-NO-REPEAT lines outside the transport), each ruled guard or idempotent-exclusion; held Escape on the marker editor; group name editor', 'fit': 'excluded (TH5 lock, idempotent)'}; n += 1
if n != 2:
    sys.exit('systemic task ids not found')
ids8 = ['TL-R418-L1-UNMOUNT-NO-BUMP', 'GATE418-L4-FALLBACK-MICROTASK-UNMOUNT', 'TL-R418-L4-COLLECTION-CHANGE-PREVIEW', 'TL-R418-L2-READTIME-START-FALLBACK',
        'TL-R418-L3-OFFSET-RAW-READ', 'A-R418-REVIEW-L1-READTIME-STALE-START', 'A-R418-REVIEW-L2-OFFSET-RAW-READ', 'A-R418-REVIEW-L3-PC12-TITLE']
seen = set()
for f in b['deferred_low_polish']:
    if f.get('id') in ids8:
        f['status'] = 'closed (D-29z1471): C round 421 PASS, gate 421 published 4786c13 | ' + f['status']; seen.add(f['id'])
    if f.get('id') == 'GATE107-S1-MARKER-FLAG-HELD-ENTER':
        f['status'] = 'in round 422 (D-29z1473; row HE6); closes on its C PASS | ' + f['status']; seen.add(f['id'])
    if f.get('id') == 'A-R107-SWEEP-HELD-ENTER-TOOLBAR':
        f['status'] = 'in_progress (D-29z1473): transport part in round 422 (HE1-HE5); rest in SYS-2 stage 2 | ' + f['status']; seen.add(f['id'])
if seen != set(ids8) | {'GATE107-S1-MARKER-FLAG-HELD-ENTER', 'A-R107-SWEEP-HELD-ENTER-TOOLBAR'}:
    sys.exit('missing ids')
c2 = 0
for f in b['open_findings']:
    if f.get('id') in ('C-R420-CLAIMS-K22-ARCHIVE-AGAIN', 'C-R420-CLAIMS-K8-K24-YOUTUBE-REQUEST-CONSUMED'):
        f['status'] = 'closed (D-29z1471): C round 421 row 1 PASS (K14 all located, K20 reads AGREE + search result) | ' + f['status']; c2 += 1
if c2 != 2:
    sys.exit('C-R420 ids not found')
b['deferred_low_polish'].append({'id': 'A-R421-REVIEW-L1-DECODED-STOP-ROW', 'severity': 'low', 'origin': 'A', 'status': 'deferred_low_polish',
    'title': 'no row checks that an already-playing decoded-buffer library preview gets source.stop when the collection changes (the code path is the same stopLibraryPreview line PL1/PL2 pin)',
    'evidence': 'a-round-421.md Reviewer findings; doc 271 TODO; c-round-421.json notes', 'repro': 'read library-preview-stream.test.tsx PL1-PL3', 'added': BY})
b['architecture_signals'].append({'id': 'SIG-R421-PREVIEW-CONTROLLER-HOOK', 'added': BY, 'decision': 'D-29z1471', 'source': 'a-round-421.md For B (Architecture note)',
    'signal': 'ArrangementContext collection effect now also owns part of the library preview lifecycle (previewTokenRef, previewPlayerRef, streamFallbackRef, startLibraryPreviewRef; rounds 416/418/421). Reviewer: keep for now. Candidate: internal useLibraryPreviewController hook; acceptance = useArrangement() surface unchanged, PC/PS/PL/EV12 bodies unchanged, MU-COLLECTION-NO-STOP still red on PL1/PL2.',
    'attached_to': 'ARCH-CHECKPOINT-PREVIEW-AFTER-13C (b-round-393/root-request-arch-checkpoint-preview.md, still requested of root; not scheduled)'})
for i, (sev, txt, rule) in enumerate([
    ('info', 'flag guard before the target/modifier early return is safe; repeated Ctrl+Enter also prevented', 'accepted'),
    ('info', 'no Enter path reads defaultPrevented; no stopPropagation added', 'accepted'),
    ('info', 'every HE row can fail and checks a positive first-press effect', 'accepted'),
    ('low', 'HE4 not.toBe(null) was vacuous', 'fixed in the sketch: not.toBe(before.undo)'),
    ('low', "HE2 toContain('\"loop\"') was weak", 'fixed in the sketch: line removed'),
    ('low', 'HE5 snapshot cannot observe a repeat (idempotent zoom)', 'fixed in the sketch: title says so; prevented keydown is the observable'),
    ('info', 'timeout headroom about 45x', 'accepted'),
    ('info', 'transport coverage complete except Fit (TH5 lock)', 'accepted'),
    ('low', 'needs an implementation doc', 'doc 272 is in the task'),
], start=1):
    b['open_findings'].append({'id': f'TL-R422-0{i}', 'severity': sev, 'origin': 'B pre-check', 'title': txt, 'evidence': 'b-round-421/sketch-review.md',
                               'status': f'closed (D-29z1473): {rule}', 'added': BY})
for rg in b['regression_rounds']:
    if rg.get('id') == 'REGRESSION-2026-11-10':
        rg['planning_note_d29z1472'] = 'not due at the 421 -> 422 planning (2026-11-09); due at the 422 -> 423 planning if on or after 2026-11-10; window extends to round 422'
open(p, 'w', encoding='utf-8').write(json.dumps(b, ensure_ascii=True, indent=2))
open(DONE, 'w').write('applied\n')
print('backlog v398 written')
