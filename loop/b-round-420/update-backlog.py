# B round 420 -> 421 backlog update (v396 -> v397). Run once from the loop root: python3 -I b-round-420/update-backlog.py
import json, os, sys
DONE = 'b-round-420/update-backlog.done'
if os.path.exists(DONE):
    sys.exit('already applied (' + DONE + ')')
p = 'backlog.json'
b = json.load(open(p, encoding='utf-8'))
if b.get('version') != 396:
    sys.exit(f"expected version 396, found {b.get('version')}")
BY = '2026-11-09 B round 420 -> 421 planning'
b['version'] = 397
b['updated'] = '2026-11-09 (B round 420 -> 421 planning: RETRO 420 accepted; SYS-R418-PREVIEW-LIFECYCLE dispatched as round 421)'
b['current_task'] = 'Round 421: SYS-R418-PREVIEW-LIFECYCLE (preview lifecycle: collection change/unmount stop + token bump, guarded reads, setStart; closes 8 Lows); sketch b-round-420/sketch-421.patch.txt (current-task.md)'
b['advisor_used_by_B'] = 'round 420 -> 421 planning: advisor available and consulted after orientation and before close; tech-lead reviewed the frozen sketch (b-round-420/sketch-review.md)'
decisions = [
    {'id': 'D-29z1467', 'date': '2026-11-09', 'by': BY,
     'decision': 'Round 420 (RETRO 420) accepted: C PASS (c-round-420.json; 11 rows passed, row 5 CLAIMS partial for two environment Lows; browserVerified/realVerified true). Gate 420 skipped (no real changes), so the round-421 baseline stays 6609dfa. RETRO 420 is complete; next RETRO round 435.'},
    {'id': 'D-29z1468', 'date': '2026-11-09', 'by': BY,
     'decision': 'C-R420-CLAIMS-K22-ARCHIVE-AGAIN and C-R420-CLAIMS-K8-K24-YOUTUBE-REQUEST-CONSUMED: the class is removed in B tooling: tools/find-ids.py (backlog + archive id lookup) is the one lookup every claims script calls; a root-consumed request file is never a claims input (lessons L56 clause replaced, still 60 lines). AGREE-STEM-LANES.md row 5 now cites reference/youtube/STEM-LANES.md, names B picks #1-#4 and asks root for their transcripts. Both close on C round 421 CLAIMS row (claims-421.sh K14/K20).'},
    {'id': 'D-29z1469', 'date': '2026-11-09', 'by': BY,
     'decision': 'SYS-R418-PREVIEW-LIFECYCLE dispatched as round 421 (sketch b-round-420/sketch-421.patch.txt, sha 8d5fc47d; tech-lead approve). Rulings: (1) the collection effect teardown calls stopLibraryPreview (token bump + stop + id clear + pin release) on collection change and provider unmount; a preview of the old collection stops when the collection changes (new stop trigger: its source may no longer be in the library; unreachable in /studio-lab where the collection is a module constant; jsdom PL1-PL3 prove it, browser R11 proves ordinary re-renders do not stop it); (2) setStart beside setErrorHandler, readTime(fallback = start) follows a same-url seek; (3) the watchdog tick read falls back to armedAt (a throwing read at the tick is a stall at the armed time); (4) getLibraryPreviewOffset uses the guarded read and returns the latest seek offset on a throwing getter, never throws; null still means no preview; (5) PC12 retitled to its body; PL9 drives seek-then-stall in jsdom; (6) whether a preview stops the transport is unchanged (Q-PREVIEW-STOPS-TRANSPORT awaiting_user); (7) TL-R418-L1/GATE418-L4 close as a defence on the same line (PL4 lock row; no observable effect by design, TL-R421-01). Doc 271.'},
    {'id': 'D-29z1470', 'date': '2026-11-09', 'by': BY,
     'decision': 'Order: 421 SYS-R418-PREVIEW-LIFECYCLE -> 422 REGRESSION-2026-11-10 (due at the first planning on or after 2026-11-10; scope = rounds 391-401 items + scope_additions + every item done since, 402-421) -> STEM-LANES S1..S4 once AGREE-STEM-LANES is answered (else SYS-1..3, then STORE-2b..5 per the skip-while-waiting rule; STEM-LANES first when the answer arrives) -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 (skip rule). Next RETRO round 435. ARCH-CHECKPOINT-STEM-LANES stays requested of root.'},
]
b['decisions_log_b'].extend(decisions)
for r in b['rounds']:
    if r.get('round') == 419 and r.get('status') == 'dispatched':
        r['status'] = 'c_pass_published (D-29z1462): C PASS c-round-419.json; gate 419 published 6609dfa'
have = {r.get('round') for r in b['rounds']}
if 420 not in have:
    b['rounds'].append({'round': 420, 'task': 'tasks/round-420.md', 'decision': 'D-29z1462..D-29z1466, D-29z1467', 'type': 'RETRO 420 (no app code)',
                        'status': 'c_pass (D-29z1467): C PASS c-round-420.json; gate 420 skipped (no real changes)', 'note': 'baseline 6609dfa; window 416-419'})
b['rounds'].append({'round': 421, 'task': 'current-task.md', 'decision': 'D-29z1469', 'type': 'SYS-R418-PREVIEW-LIFECYCLE (runtime + tests)', 'status': 'dispatched',
                    'note': 'baseline 6609dfa clean (gate 420 skipped); frozen b-round-420/r421-frozen-sha256.txt (1316); grants b-round-420/grants-421.txt (4); sketch b-round-420/sketch-421.patch.txt; review b-round-420/sketch-review.md; claims b-round-420/claims-421.sh'})
for rr in b['retro_runs']:
    if rr.get('round') == 420:
        rr['c_verdict'] = 'C PASS round 420 (c-round-420.json; D-29z1467); row 5 CLAIMS partial for two environment Lows (D-29z1468)'
found = 0
for t in b['systemic_tasks']:
    if isinstance(t, dict) and t.get('id') == 'SYS-R418-PREVIEW-LIFECYCLE':
        t['status'] = 'dispatched round 421 (D-29z1469); closes its 8 ids on C PASS | was: ' + t['status']
        found += 1
if found != 1:
    sys.exit('SYS-R418-PREVIEW-LIFECYCLE not found once')
ids8 = ['TL-R418-L1-UNMOUNT-NO-BUMP', 'GATE418-L4-FALLBACK-MICROTASK-UNMOUNT', 'TL-R418-L4-COLLECTION-CHANGE-PREVIEW', 'TL-R418-L2-READTIME-START-FALLBACK',
        'TL-R418-L3-OFFSET-RAW-READ', 'A-R418-REVIEW-L1-READTIME-STALE-START', 'A-R418-REVIEW-L2-OFFSET-RAW-READ', 'A-R418-REVIEW-L3-PC12-TITLE']
rows = {'TL-R418-L1-UNMOUNT-NO-BUMP': 'PL4 lock + PL1/PL2 same line', 'GATE418-L4-FALLBACK-MICROTASK-UNMOUNT': 'PL4 lock + PL1/PL2 same line',
        'TL-R418-L4-COLLECTION-CHANGE-PREVIEW': 'PL1, PL2, PL3', 'TL-R418-L2-READTIME-START-FALLBACK': 'PL6, PL7', 'TL-R418-L3-OFFSET-RAW-READ': 'PL8',
        'A-R418-REVIEW-L1-READTIME-STALE-START': 'PL6', 'A-R418-REVIEW-L2-OFFSET-RAW-READ': 'PL8', 'A-R418-REVIEW-L3-PC12-TITLE': 'PC12 title + PL9'}
seen = set()
for f in b['deferred_low_polish']:
    if isinstance(f, dict) and f.get('id') in ids8:
        f['status'] = f"in round 421 (D-29z1469; rows {rows[f['id']]}); closes on its C PASS | " + f['status']
        seen.add(f['id'])
if seen != set(ids8):
    sys.exit('missing ids: ' + str(set(ids8) - seen))
new_findings = [
    {'id': 'C-R420-CLAIMS-K22-ARCHIVE-AGAIN', 'severity': 'low', 'origin': 'environment', 'title': 'claims-420 K22 did not read archive/findings-archived.json (TL-R419-L1 archived between B and C)',
     'evidence': 'c-round-420.json; c-round-420/claims.out', 'status': 'fixed in B tooling (D-29z1468): tools/find-ids.py, L56 clause; closes on C round 421 CLAIMS row (K14)', 'added': BY},
    {'id': 'C-R420-CLAIMS-K8-K24-YOUTUBE-REQUEST-CONSUMED', 'severity': 'low', 'origin': 'environment', 'title': 'claims-420 K8/K24 read youtube-request.json after root consumed it; AGREE-STEM-LANES row 5 was stale',
     'evidence': 'c-round-420.json; c-round-420/claims.err', 'status': 'fixed in B tooling (D-29z1468): request files are no claims input (L56); AGREE row 5 updated; closes on C round 421 CLAIMS row (K20)', 'added': BY},
]
for i, (sev, txt, rule) in enumerate([
    ('low', 'PL4 (unmount) passes at HEAD for another reason; no row proves the unmount bump', 'accepted as lock row; same line as the collection bump (MU-COLLECTION-NO-STOP)'),
    ('low', 'PL3 is double-guarded (abort + token) and stays green under MU-COLLECTION-NO-STOP', 'accepted as lock row; named so in the task'),
    ('low', 'PL5 re-renders only with the same collection object', 'covered by browser R11 (Snap + zoom while previewing; equal to HEAD)'),
    ('low', 'PL7 depends on jsdom honouring element.currentTime = 3', 'MU-TICK-FALLBACK-START turns PL7 red; no action'),
    ('low', 'the change needs an implementation doc', 'doc 271 is in the task'),
], start=1):
    new_findings.append({'id': f'TL-R421-0{i}', 'severity': sev, 'origin': 'B pre-check', 'title': txt, 'evidence': 'b-round-420/sketch-review.md',
                         'status': f'closed (D-29z1469): {rule}', 'added': BY})
existing = {f.get('id') for f in b['open_findings'] if isinstance(f, dict)}
for f in new_findings:
    if f['id'] in existing:
        sys.exit('duplicate ' + f['id'])
    b['open_findings'].append(f)
for rg in b['regression_rounds']:
    if rg.get('id') == 'REGRESSION-2026-11-10':
        rg['planning_note_d29z1470'] = 'due at the round 421 -> 422 planning if it runs on or after 2026-11-10; extend its scope with every item done in rounds 402-421 (one short check each, both viewports)'
open(p, 'w', encoding='utf-8').write(json.dumps(b, ensure_ascii=True, indent=2))
open(DONE, 'w').write('applied\n')
print('backlog v397 written')
