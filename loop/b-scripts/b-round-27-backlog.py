import json, io, sys

P = 'C:/Apps/czaba-project/tmp/studio-real-loop/backlog.json'
with io.open(P, encoding='utf-8') as f:
    b = json.load(f)

b['version'] = b.get('version', 28) + 1
b['updated'] = '2026-10-12 (B: round 27 result -> round 28 dispatch)'
b['current_task'] = ('current-task.md (round 28: SRW-24 - Delete/Backspace always leave a gap on any selection; '
                     'Ctrl+Shift+L extends the existing time range to every lane (TimeRange optional all-lanes flag, '
                     'lane-level overlay); Ctrl+Shift+X is the only gap-closing delete; plus C round-27 follow-ups: '
                     'C-R27-01 attribution decision table, C-R27-02 reruns, restated R27-TL oracle, round-27 not-run items)')
b['advisor_used_by_B'] = b.get('advisor_used_by_B', '') + ' | round 27 -> 28 planning (2026-10-12): available; called once before writing (advice applied: delete-selection as round-28 feature, FB-02 flip, C-R27-01 decision table with hardSeek/mute correlation, restated R27-TL oracle, CONTINUE) and once before declaring done'

r27 = next(r for r in b['rounds'] if r['round'] == 27)
r27['status'] = 'c_fail'
r27['c_result'] = {
    'report': 'c-round-27.md / c-round-27.json',
    'taskStatus': 'FAIL',
    'passed': ['G27-1', 'G27-2', 'G27-3', 'R27-TL-music', 'R27-TL-stems', 'R27-TL-video', 'R27-TI-levels', 'R27-TM',
               'R27-TV', 'R27-TW', 'R27-TO-latch', 'R27-TO-cue', 'R27-TR', 'R27-TF', 'R27-RB-render', 'R27-E-file',
               'R27-K-1280', 'R27-L-geometry', 'R27-S', 'R27-U', 'R27-Doc'],
    'failed': ['R27-RB-cost (C-R27-01)'],
    'not_run_server_down': ['R27-K-1440', 'R27-K-space-on-M', 'R27-L-floating-video', 'R27-TO-reset-nonempty-redo',
                            'R27-E-offline-node-count-live', 'R27-R-track-mute-declick', 'R27-R-loop-seam',
                            'R27-R-library-drop', 'R27-TI-video-floor-time', 'C-R23-01-hydration-code-points'],
    'oracle_restated_by_B': 'R27-TL SFX decay windows: literal +/-1.0 dB window max does not fit a transient source with the 20 dB/s release; restated in round-28 task section 4.1 (sustained windows literal; decay windows vs stepMeter release model p95 <= 0.5 dB, max <= 1.0 dB); not PASS until re-scored',
    'vitest': '63 files, 1096/1096 (frozen-8 batch flaky under load: C-R27-02)',
    'b_independent_check_2026_10_12': 'server down (curl 000), so no live re-verification by B; tree only: HEAD c5ed47b, 62 status lines identical to b-round-27-git-status.txt and C gates/git-status-now.txt, b-round-26 list 60 OK, 9 round-27 owned shas = c-round-27/gates/owned-sha-now.txt, 34 node.exe running'
}
b['rounds'].append({
    'round': 28,
    'task': 'current-task.md',
    'items': ['SRW-24: Delete/Backspace (incl. Shift) always leave a gap; Ctrl+Shift+L extends the existing range to every lane (TimeRange optional all-lanes flag, lane overlay); Ctrl+Shift+X only ripple; Split on all-lane range refused; delete-selection.test.ts + delete-selection-ui.test.tsx (>= 16 it); one-line ArrangementContext.test.ts l.567 amendment; doc 034',
              'C follow-ups of round 27: C-R27-01 attribution decision table (r26 layout, hardSeek vs Master Mute correlation), C-R27-02 frozen-8 reruns with node.exe count, restated R27-TL oracle re-score, round-27 not-run items'],
    'status': 'dispatched',
    'decision': 'D-29s',
    'note': 'frozen: b-round-27-tree-sha256.txt (66 files = b-round-26 list minus types/arrangement.ts, StudioWorkspace.tsx, ArrangementTransport.tsx, ArrangementContext.test.ts; plus meter.ts, graph.client.ts, ArrangementTrackMeter.tsx, meter-ui.test.tsx, track-meter.test.ts, track-meter-ui.test.tsx, doc 033, clipboard.test.ts, loop.test.ts, selection.test.ts; B verified 66 OK); snapshots b-round-27-snapshots/ (ArrangementContext.tsx df4484a9, ArrangementLane.tsx f2db8fe2, StudioWorkspace.tsx 750c75e6, ArrangementTransport.tsx f0054cfd, arrangement.ts ac2eed7e, clipboard.ts 514e2f75, ArrangementContext.test.ts 7c93153d); expected status 66 lines (62 + M clipboard.ts + 2 new tests + doc 034); dev server down at dispatch: root must start it before C'
})

srw13 = next(i for i in b['items'] if i['id'] == 'SRW-13')
srw13['status'] = 'in_progress_bug_open'
srw13['decisions_round28'] = ('Round 27 (stage 2b) C FAIL: per-track meters PASS on levels/latch/mute/solo/volume/density/render/geometry/static/mutations (c-round-27.md); '
                              'R27-RB cost oracle FAIL -> C-R27-01 (medium, attribution open, control runs without track reads also fail); '
                              'not-run items owed in round 28 section 4.1. Stage 2b is not done. Stage 3 (FB-04) moves to round 29 because SRW-24 (user decision 2026-10-11) invalidates shipped FB-02 behaviour.')

def sup(item_id, acc_id, note):
    it = next(i for i in b['items'] if i['id'] == item_id)
    a = next(x for x in it['acceptance'] if x['id'] == acc_id)
    a['superseded'] = note

sup('SRW-01', 'R1-B5', 'superseded 2026-10-11 by user (delete-selection-update.md): Delete with a range leaves a gap; the closing behaviour belongs to Ctrl+Shift+X only (SRW-24 R24-1, R24-4)')
sup('SRW-01', 'R1-B12', 'superseded 2026-10-11 by user: the while-playing remap applies to Ctrl+Shift+X (round 28 R28-CX); Delete while playing leaves a gap with no playhead jump (R28-PS)')
sup('SRW-09', 'R9-C5', 'first clause superseded 2026-10-11 by user: Delete with range = gap (SRW-24); the text-field and during-drag clauses still apply')
sup('SRW-02', 'R2-V3', 'the Delete Time part now means Ctrl+Shift+X (Cut Time); the gap delete on video is R24-2 / R28-DV')
sup('SRW-05', 'R5-L5', 'the Delete Time part now means Ctrl+Shift+X (R28-CX loop remap); a gap delete leaves the loop unchanged')
srw09 = next(i for i in b['items'] if i['id'] == 'SRW-09')
srw09['status'] = 'contract_superseded_in_progress'
srw09['note_round28'] = 'FB-02 shipped behaviour (Delete with range = Delete Time) contradicts the user decision of 2026-10-11; SRW-24 implements the new contract in round 28. Cut (gap), Copy, Paste and Cut Time acceptance remain valid.'

if not any(i['id'] == 'SRW-24' for i in b['items']):
    b['items'].append({
        'id': 'SRW-24',
        'round': 28,
        'title': 'Delete/Backspace always leave a gap; Ctrl+Shift+L extends the existing time range to every lane; Ctrl+Shift+X is the only gap-closing delete',
        'fb': ['FB-02'],
        'type': 'behavior-request',
        'source': 'docs/technical/studio-real-workspace/delete-selection-update.md (user, 2026-10-11, points 6 and 7)',
        'depends_on': ['SRW-09', 'SRW-06'],
        'status': 'dispatched',
        'files': ['app/types/arrangement.ts', 'app/lib/arrangement/clipboard.ts', 'app/contexts/ArrangementContext.tsx',
                  'app/components/arrangement/StudioWorkspace.tsx', 'app/components/arrangement/ArrangementTransport.tsx',
                  'app/components/arrangement/ArrangementLane.tsx',
                  'app/lib/arrangement/__tests__/delete-selection.test.ts',
                  'app/lib/arrangement/__tests__/delete-selection-ui.test.tsx',
                  'app/lib/arrangement/__tests__/ArrangementContext.test.ts (l.567 only)',
                  'docs/implementation/2026/quarter-IV/034-studio-lab-delete-keeps-gap.md'],
        'acceptance': [
            {'id': 'R24-1', 'action': 'audio clip 0-10, range 3-5, Delete and (separately) Backspace', 'expected': '0-3 and 5-10 remain, second part offset +5, later clips do not move, no join', 'verify': 'C (round 28 R28-DA/DB, export window proof)'},
            {'id': 'R24-2', 'action': 'same on a video clip, a whole clip, several clips, several lanes', 'expected': 'material outside the selection unchanged', 'verify': 'C (R28-DV/DM)'},
            {'id': 'R24-3', 'action': 'range 3-5, Ctrl+Shift+L, then Delete/Backspace', 'expected': '3-5 gap on every lane, later clip starts unchanged', 'verify': 'C (R28-VL/VD)'},
            {'id': 'R24-4', 'action': 'same selection, Ctrl+Shift+X', 'expected': '2 s removed from the timeline, every later audio/video clip shifts equally, edge clips trimmed with correct offsets', 'verify': 'C (R28-CX)'},
            {'id': 'R24-5', 'action': 'Undo/Redo each action; check playhead, loop, audio/video sync after both kinds', 'expected': 'one history step each, exact restore', 'verify': 'C (R28-UR/PS)'},
            {'id': 'R24-6', 'action': 'Delete/Backspace in a text/number field, empty selection, other UI delete paths', 'expected': 'no unplanned ripple', 'verify': 'C (R28-TF/UI)'}
        ],
        'decisions_round28': 'D-29s: TimeRange optional all-lanes flag (trackId kept as origin lane); gap delete = cutRangeFromArrangement without clipboard; no-op = no history; Ctrl+Shift+L = not an edit; Split on all-lane range refused; detail panel inputs write a single-lane range; Ableton Live 12 manual sections 6.9/6.11/42.5 verified by B with /browse on 2026-10-12'
    })

of = b['open_findings']
def add_finding(fid, entry):
    if not any(x.get('id') == fid for x in of):
        entry['id'] = fid
        of.append(entry)
add_finding('C-R27-01', {'status': 'open', 'severity': 'medium', 'to': 'round 28 C section 4.1 decision table',
                         'evidence': 'c-round-27.md section 7, c-round-27/runs/vm-1..5.txt, vm-ctl-skip-1..2.txt: drift max 81.7/36.2/46.1/20.6/41.6 ms vs oracle 30.1; dock hardSeeks 2/2 every run; control runs without track reads 60.4/130.6 ms; machine 34-42 node.exe'})
add_finding('C-R27-02', {'status': 'open', 'severity': 'low', 'to': 'round 28 C section 4.1 reruns with node.exe count',
                         'evidence': 'c-round-27/gates/vitest-frozen8*.txt: 151/152, 150/152, 152/152 (track-layout fold timeout; render-budget start-hold-release 0.051 vs 0); green alone and in full suite 1096/1096'})
add_finding('L3-REMOVED-TRACK-TAPS', {'status': 'open', 'severity': 'low', 'to': 'before final regression (tracks are a fixed set today)',
                                      'evidence': 'a-round-27.md section 4 L3; doc 033'})
add_finding('machine-load-node-processes', {'status': 'open_root', 'severity': 'info', 'to': 'root: reduce stray node.exe before C phases',
                                            'evidence': 'a-round-27.md section 5 (40-42 node.exe, 22 timeouts in one frozen run); B count 34 on 2026-10-12'})

if 'R28-T' not in b['tech_lead_manual_checks']:
    b['tech_lead_manual_checks'].append('R28-T')
b['vitest_floor_round27'] = 1096
b['baseline_tree_at_round27'] = ('HEAD c5ed47b + 62 status lines (rounds 6-27), identical to c-round-27/gates/git-status-now.txt (copy b-round-27-git-status.txt); '
                                 'sha256 of 66 frozen files: b-round-27-tree-sha256.txt; 9 round-27 owned shas = c-round-27/gates/owned-sha-now.txt; plus the two foreign untracked agent files')
b['loop_runner_note'] = 'If run-loop.ps1 stops on a -RoundLimit, restart with -StartRound 28 -StartPhase A and a higher -RoundLimit to dispatch current-task.md (round 28). Root must start the dev server before the C phase.'
b['planned_rounds'].append({'round': 28, 'item': 'SRW-24 + C round-27 follow-ups'})
b['planned_rounds'].append({'round': 29, 'item': 'SRW-13 stage 3 (FB-04 clip gain, R13-M1), unless the C-R27-01 decision table (row 2/4) requires an A bug round first'})

with io.open(P, 'w', encoding='utf-8') as f:
    json.dump(b, f, ensure_ascii=False, indent=2)
    f.write('\n')
print('ok', b['version'], len(b['items']), len(b['rounds']))
