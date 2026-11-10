"""B round 441 -> 442 planning backlog update. Idempotent: refuses to run twice (update-backlog.done)."""
import json, os, sys
LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
DONE = f'{LOOP}/b-round-441/update-backlog.done'
if os.path.exists(DONE):
    sys.exit('already applied')
SKETCH_SHA = open(f'{LOOP}/b-round-441/sketch-442.sha256').read().split()[0]
p = f'{LOOP}/backlog.json'
b = json.load(open(p, encoding='utf-8'))
by = '2026-11-10 B round 441 -> 442 planning'
b['version'] = b['version'] + 1
b['updated'] = '2026-11-10'
d = b['deferred_low_polish']
idx = {e.get('id'): e for e in d}
for fid in ['GATE164-OV1-FRAGILE', 'GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR', 'GATE81-S2-UM8-SOURCE-TEXT']:
    e = idx[fid]
    e['status'] = 'closed (D-29z1570): SYS-1 stage 2, C round 441 PASS (c-round-441.json, browserVerified true), gate 441 published 5d81795 | ' + e['status']
    e['closed_round'] = 441
d.append({'id': 'A-R441-REVIEW-L1-OUTLINE-ORDER', 'severity': 'low', 'origin': 'B spec',
          'status': 'deferred_low_polish (D-29z1570): B checked the file at 5d81795 - A\'s reviewer is right: in the full state PNR4 (panel-radius-ui) and DXC4 (content-colour-ui) assert only parentElement === overview; only OV-E1 (overview-visibility-ui, empty state) pins lanes.previousElementSibling === baseline. A dropped HEAD pin (L4) from B\'s round-441 sketch; no mutant swaps outline and lanes',
          'title': 'PNR4/DXC4 no longer pin outline-before-lanes order in the full Overview state; an outline moved after the lanes (painting over bars) stays green',
          'evidence': 'a-round-441.md code-reviewer Low 1; c-round-441.md note; gates/round-441/review.md (its "sibling relations" note covers OV-E1 only)',
          'repro': 'move the outline overlay after the lanes container in ArrangementOverview.tsx; PNR4 and DXC4 stay green',
          'fix': "one line in PNR4: expect(lanes.previousElementSibling).toBe(outlines[0]); plus a swap mutant",
          'added': by, 'systemic_task': 'SYS-1', 'retro_input': 'RETRO 450: B sketch dropped a pin (L4 sweep did not compare positional pins in the full state)'})
d.append({'id': 'GATE441-L1-VIDEO-CLIENT-MOCK-FILEWIDE', 'severity': 'low', 'origin': 'B spec',
          'status': 'deferred_low_polish (D-29z1570)',
          'title': 'track-group-mix-ui.test.tsx mocks video.client file-wide for UM8b; a future video test in the file gets bare vi.fn() returns',
          'evidence': 'gates/round-441/review.md Low 1', 'repro': 'read track-group-mix-ui.test.tsx l.27-32 and 650-662 at 5d81795',
          'added': by, 'systemic_task': 'SYS-1', 'note': 'gate reviewer: cleanup is safe (restoreAllMocks); optional note or own file'})
d.append({'id': 'GATE441-L2-UM8B-POLL-LOOP', 'severity': 'low', 'origin': 'B spec',
          'status': 'deferred_low_polish (D-29z1570)',
          'title': 'UM8b waits for ready with a bounded 20-tick setTimeout(0) poll instead of testing-library waitFor',
          'evidence': 'gates/round-441/review.md Low 2', 'repro': 'read track-group-mix-ui.test.tsx l.664-672 at 5d81795',
          'added': by, 'systemic_task': 'SYS-1'})
s1 = [x for x in b['systemic_tasks'] if x['id'] == 'SYS-1'][0]
s1['status'] = 'done (D-29z1570): stage 1 (C round 440, gate 047a0fc) + stage 2 (C round 441 PASS browserVerified/realVerified true, gate 441 published 5d81795); doc 286 + 287 Completed | ' + s1['status']
for st in s1['stages_d29z1565']:
    if st['id'] == 'SYS-1-stage-2':
        st['status'] = 'done (D-29z1570): C round 441 PASS, gate 441 published 5d81795'
s3 = [x for x in b['systemic_tasks'] if x['id'] == 'SYS-3'][0]
s3['status'] = ('in_progress (D-29z1571): stage 1 dispatched round 442 (sketch b-round-441/sketch-442.patch.txt sha ' + SKETCH_SHA[:8] +
                '; closes ROOT-R65-L5, A-R165-IME-ENTER and the unfiled range/Clip Gain/group sites on C PASS); stage 2 next | ' + s3['status'])
s3['stages_d29z1571'] = [
    {'id': 'SYS-3-stage-1', 'round': 442,
     'scope': 'inline editors: BPM (ArrangementTempoRow), marker name (ArrangementMarkerRow), group name (ArrangementGroupHeader), Detail From/To and Clip Gain (ArrangementDetailPanel) via one helper isImeCompositionKeyDown (new studio-ime-composition.ts) + ime-composition-ui.test.tsx + doc',
     'closes': ['ROOT-R65-L5', 'A-R165-IME-ENTER'], 'also_fixes_unfiled': s3.get('also_fixes_unfiled', []),
     'browser_evidence_head': 'b-round-441/probe/ime-sites-head-*.json: real Chromium CDP Input.imeSetComposition + real Enter/Escape keydown (isComposing true) commits or cancels all 9 cells at HEAD',
     'status': 'dispatched (D-29z1571): round 442'},
    {'id': 'SYS-3-stage-2',
     'scope': 'focus-source.ts (A-R203-REVIEW-M1 isComposing/Unidentified, A-R203-REVIEW-I1 AltGraph printable; check the ctrlKey/altKey early return ordering), Library search (Escape clears and ArrowDown moves during composition, ArrangementLibrary handleSearchKeyDown), shortcut-sheet search Escape (ui/Modal.tsx document Escape listener closes the sheet mid-composition; Modal has store-wide consumers incl. protected legacy files -> tech-lead question: Modal guard vs sheet-local capture guard)',
     'closes': ['A-R203-REVIEW-M1', 'A-R203-REVIEW-I1'],
     'optional_attach': s3.get('optional_attach'),
     'status': 'queued (D-29z1571): next round after stage 1 C PASS'},
]
fidx = {e.get('id'): e for e in b['open_findings']}
for fid in ['ROOT-R65-L5', 'A-R165-IME-ENTER']:
    e = idx[fid]
    e['status'] = 'in_progress (D-29z1571): SYS-3 stage 1, round 442; closes on C PASS | ' + e['status']
for fid in ['A-R203-REVIEW-M1', 'A-R203-REVIEW-I1']:
    e = fidx[fid]
    e['status'] = 'queued (D-29z1571): SYS-3 stage 2 | ' + e['status']
b['architecture_signals'].append({'id': 'SIG-R441-SOURCE-PIN-RULING', 'added': by, 'decision': 'D-29z1570',
    'source': 'gates/round-441/review.md Architecture note; a-round-441.md (none)',
    'signal': 'decide per remaining Overview source pin (PANEL list, PNR2/PNR4 source counts, content-colour scans) whether it stays a source contract or becomes a rendered assertion; mutants O2 and D1H stay red',
    'status': 'signal only; RETRO-450 question (with S2-R2 and sys1_other_classname_pins); not scheduled'})
b['decisions_log_b'] += [
    {'id': 'D-29z1570', 'date': '2026-11-10', 'by': by,
     'decision': 'Round 441 accepted: c-round-441.json PASS (C1-C10, browserVerified/realVerified true, 0 bugs; fake-bearer row BLOCKED backend unavailable in cloud) and gate 441 published 5d81795 on both remotes. SYS-1 done (stages 1+2). GATE164-OV1-FRAGILE, GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR, GATE81-S2-UM8-SOURCE-TEXT closed. A-R441-REVIEW-L1-OUTLINE-ORDER ruled from the file (A\'s reviewer right; Low, origin B spec, deferred). Gate-441 Lows 1/2 -> GATE441-L1/L2 deferred. Gate Architecture note -> SIG-R441-SOURCE-PIN-RULING (signal only, RETRO 450).'},
    {'id': 'D-29z1571', 'date': '2026-11-10', 'by': by,
     'decision': 'Dispatch round 442 = SYS-3 stage 1 on 5d81795 (IME composition guard on 5 inline editor handlers via isImeCompositionKeyDown = nativeEvent.isComposing || keyCode 229; guard after stopPropagation and before preventDefault in Marker/Group editors). SYS-3 split in two stages (no scope dropped): stage 2 = focus-source M1/I1 + Library search + shortcut sheet/Modal Escape. B pre-check: real Chromium CDP composition repro at HEAD (9/9 cells), sketch 11/11 tests, 14/14 mutants red, covering 60 files 1114 tests, typecheck rc 0, lint 205 = HEAD. Platform half (macOS/Windows IME, Safari, Android) -> Tech Lead manual row TLM-SYS3-IME-PLATFORMS, deadline RETRO 450 (L46).'},
    {'id': 'D-29z1572', 'date': '2026-11-10', 'by': by,
     'decision': 'Order after round 442: SYS-3 stage 2; REGRESSION-2026-11-13 at the first planning on or after 2026-11-13 (takes precedence over stage 2 if due); STORE-REDESIGN 2b..5 (direction A); ARCH-SPLIT (frontend-architect checkpoint via root first); REVIEW-RECOMMENDATIONS; T12-ADVANCED; phase 2 under the skip rule. Next RETRO round 450.'},
]
b.setdefault('tech_lead_manual_checks', [])
tlm = b['tech_lead_manual_checks']
row = {'id': 'TLM-SYS3-IME-PLATFORMS', 'added': by, 'decision': 'D-29z1571', 'deadline': 'RETRO 450 (L46)',
       'steps': 'On macOS (Japanese/Chinese IME, Safari and Chrome) and Windows (Microsoft IME): in /studio-lab type in the BPM field, marker name, group name, Detail From and Clip Gain with an IME, confirm a candidate with Enter, cancel one with Escape. Expected: the composition commits/cancels inside the field and the field stays open and focused; a second Enter commits the editor. Android soft keyboard: a plain Enter in the BPM field still commits (keyCode 229 risk).',
       'status': 'open (after round 442 C PASS)'}
if isinstance(tlm, list):
    tlm.append(row)
else:
    tlm['TLM-SYS3-IME-PLATFORMS'] = row
for r in b['rounds']:
    if r.get('round') == 441:
        r['status'] = 'done (D-29z1570): C PASS, gate 441 published 5d81795'
b['rounds'].append({'round': 442, 'task': 'current-task.md', 'decision': 'D-29z1571', 'type': 'SYS-3 stage 1 (IME composition guard on inline editors)', 'status': 'dispatched',
                    'note': 'baseline 5d81795 (gate 441 published); sketch b-round-441/sketch-442.patch.txt (sha ' + SKETCH_SHA[:8] + '); claims b-round-441/claims-442.sh'})
b['current_task'] = 'Round 442: SYS-3 stage 1 (ROOT-R65-L5, A-R165-IME-ENTER + unfiled Detail range/Clip Gain/group sites; IME composition guard; sketch b-round-441/sketch-442.patch.txt sha ' + SKETCH_SHA[:8] + ') on 5d81795 (current-task.md)'
b['advisor_used_by_B'] = 'round 441 -> 442 planning: advisor available and consulted after orientation (and before hand-off)'
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(DONE, 'w').write('applied\n')
print('ok v', b['version'])
