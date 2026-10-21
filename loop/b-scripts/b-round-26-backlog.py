import io
import json

p = 'backlog.json'
b = json.load(io.open(p, encoding='utf-8'))
assert b['version'] == 27
b['version'] = 28
b['updated'] = '2026-10-11 (B: round 26 result -> round 27 dispatch)'
b['current_task'] = (
    'current-task.md (round 27: SRW-13 stage 2b - live per-track meters in the lane headers: optional '
    'ApplyScheduleOptions.trackTaps with a post-panner fan-out connect after panner.connect(master); per-track stereo taps '
    '(splitter + 2 analysers, fftSize 4096, guarded) created after the master tap; keyed track meter store with one publish '
    'per frame; floor on stop; latched over-0 warning per track (warning token + shape cue + sr-only text), cleared by the '
    'single Master Peak reset; absolute bar in the header bottom padding band, zero layout change; 0 renders per frame; '
    'narrow amendment of the five exact tap-count lines in meter-ui.test.tsx; track-meter.test.ts + track-meter-ui.test.tsx '
    '(>= 16 it, incl. the unmount-unsubscribe gap M2c); doc 033; D-29r)')
b['advisor_used_by_B'] += (
    '; round 26 result -> round 27 (2026-10-11): available, called once after orientation and before writing; advice '
    'applied (probe render-budget/track-layout/meter-ui before choosing the UI contract, post-panner tap after '
    'panner.connect(master), per-channel taps with a cost oracle, zero-row geometry, single reset point, solo-based '
    'per-track oracles, R26-T text and time-to-floor oracle corrections, Soft impact as a Tech Lead decision, M1 as a later '
    'hardening item)')

r26 = next(r for r in b['rounds'] if r['round'] == 26)
r26['status'] = 'done'
r26['result'] = (
    'C PASS (c-round-26.md, c-round-26.json): R26-ML (meter vs tap -0.042..+0.029 dB, delta -6.0 x3; video-only beeps '
    '-5.9), R26-MP (hold 1500-1513 ms, 0 hold violations, Pause floors in the same task, Peak text kept), R26-C0 (latch at '
    '~2.0 s, +5.0 vs tap +4.995, 3/3), R26-C6 (-1.0 vs tap -1.005, clear, 3/3), R26-CR (click reset, no history, persists '
    'through Pause/Play, Master Volume, reschedule, Undo/Redo; reset while playing restarts), R26-CM (floor 2.36-2.57 s, '
    'no latch, tap digital zero), R26-RB (0 renders per frame; 1 meter render at latch and at reset; drift 20.1 ms), '
    'R26-X, R26-E (864 000 frames, FS 1800, RMS -15.481; 0 analysers on the OfflineAudioContext), R26-K, R26-L (header 35, '
    'transport 49/87, rows/scroller = r25, floating video 8,503), R26-R, R26-S, R26-U (mutations a-d 2/2/1/3 failed), '
    'R26-Doc, G26-1..3 (tsc 0, vitest 1072/1072, build, Biome 218 warnings 0 errors; 57 OK; 58 lines; anonymous clean). '
    'No new bug in scope. Observations: R26-T text (Clip lights ~2.0 s, +5.0 max at 4.0 s); time-to-floor oracle = '
    '(L0+60)/20 s + 0.1 s; demo Soft impact alone reaches full scale (+0.0 Clip; export 2 samples) -> Tech Lead decision; '
    'Master hold tick 1 px at >= +6 dBFS (low, stage 4); A M1 rAF-gap sampling and M2c unmount test (M2c -> round 27 '
    'tests). C-R23-01: 4 NUL at 28013/28014, 44397/44398 (offsets moved again). B independent check 2026-10-11: HEAD '
    'c5ed47b, 58 lines identical to c-round-26/gates/git-status-end.txt, 57 OK, 8 owned shas = C record, live curl NUL 4 '
    'at the same offsets.')
b['rounds'].append({
    'round': 27,
    'task': 'current-task.md',
    'items': [
        'SRW-13 stage 2b: live per-track meters in the lane headers (post-panner fan-out taps, per-track stereo analysers, '
        'keyed store, floor on stop, latched over-0 warning per track cleared by the single Master Peak reset, zero layout '
        'change, 0 renders per frame); track-meter.test.ts + track-meter-ui.test.tsx (>= 16 it); narrow meter-ui.test.tsx '
        'count amendment; doc 033'],
    'status': 'dispatched',
    'decision': 'D-29r',
    'note': (
        'frozen: b-round-26-tree-sha256.txt (60 files = round-25 list minus ArrangementLane.tsx, plus ArrangementMaster.tsx, '
        'ArrangementExportDialog.tsx, meter.test.ts, doc 032; B verified 60 OK); snapshots b-round-26-snapshots/ (meter.ts '
        'ed52f465, graph.client.ts ff6c7d2e, ArrangementContext.tsx 32108f28, ArrangementLane.tsx cdaf07f4, '
        'meter-ui.test.tsx afef9745); expected status 62 lines (58 + 4 enumerated); RF5-3/R3-V1/R3-V4/R11-P3 not re-run '
        '(one drift sample in R27-RB)'),
})
b['vitest_floor_round26'] = 1072
b['baseline_tree_at_round26'] = (
    'HEAD c5ed47b + 58 status lines (rounds 6-26), identical to c-round-26/gates/git-status-end.txt (copy '
    'b-round-26-git-status.txt); sha256 of 60 frozen files: b-round-26-tree-sha256.txt; plus the two foreign untracked '
    'agent files (root); must not be reverted')
b['loop_runner_note'] = (
    'If run-loop.ps1 stops on a -RoundLimit, restart with -StartRound 27 -StartPhase A and a higher -RoundLimit to '
    'dispatch current-task.md (round 27).')
b['harness_rules'].append({
    'from_round': 27,
    'rule': (
        'Time-to-floor oracle for any meter that loses its signal: (L0 + 60) / 20 s + 0.1 s, L0 = its level at the moment '
        'of muting (C round 26 section 7; release 20 dB/s). Per-track meter truth is measured with Solo against the '
        'post-master tap; never use "track <= Master" (a mix can partly cancel).'),
})

s13 = next(x for x in b['items'] if x['id'] == 'SRW-13')
m4 = next(a for a in s13['acceptance'] if a['id'] == 'R13-M4')
m4['status'] = 'pass'
m4['evidence'] = m4['evidence'] + (
    '; C round 26: R26-C0 (live latch +5.0 vs tap +4.995, 3/3), R26-C6 (no latch at -6 dB, 3/3), R26-CR (click-only '
    'reset, not an edit), R26-CM, R26-E (export unchanged, FS 1800)')
for st in s13['stages']:
    if st['stage'] == '2a':
        st['status'] = 'done'
        st['result'] = 'C PASS round 26 (c-round-26.md); vitest 1072/1072'
    elif st['stage'] == '2b':
        st['status'] = 'dispatched'
        st['round'] = 27
        st['scope'] = (
            'per-track live meters in the lane headers: optional trackTaps, post-panner fan-out after '
            'panner.connect(master) (T12.20 track output stage; reflects pan from stage 4); per-track stereo taps created '
            'after the master tap, guarded; keyed store, one publish per frame, floor on stop; latched over-0 warning per '
            'track (export predicate; warning token, not destructive, per T12.22; shape cue; sr-only text), cleared by the '
            'single Master Peak reset (no new Tab stops; not an edit); absolute bar in the header bottom padding band '
            '(zero layout change at folded/tight/regular/full); 0 renders per frame, <= 1 per track latch transition; '
            'narrow meter-ui.test.tsx exact-count amendment')
        st['acceptance'] = [
            'R27-TL', 'R27-TI', 'R27-TM', 'R27-TV', 'R27-TW', 'R27-TO', 'R27-TR', 'R27-TF', 'R27-RB', 'R27-E', 'R27-K',
            'R27-L', 'R27-R', 'R27-S', 'R27-U', 'R27-Doc', 'G27-1', 'G27-2', 'G27-3']
    elif st['stage'] == 4:
        st['scope'] += '; Master hold tick fully visible at >= +6 dBFS (C round 26 section 9, low)'
s13['ux_notes'].append(
    'C round 26 section 9: the Master hold tick shows only 1 px at a level >= +6 dBFS (translateX 100% under '
    'overflow-hidden) -> stage 4 polish; the round-27 track meter must not repeat it')
s13['decisions_round27'] = {
    'tap': (
        'optional ApplyScheduleOptions.trackTaps; panner.connect(tap) after the unchanged panner.connect(master), so '
        'outputs[0] stays the master (frozen graph.test.ts l.108-117 walks outputs[0]); post-panner = the track output '
        'stage (T12.20) and reflects pan from stage 4; the offline export passes no trackTaps'),
    'analysers': (
        'one stereo tap per track (splitter + 2 analysers, fftSize 4096, float data), created after the master tap and '
        'guarded like it; 5 stereo taps with lay11; cost oracle in R27-RB (drift <= r26 + 10 ms, 0 renders)'),
    'latch': (
        'same over predicate; per T12.22 a track over is a warning (warning token, shape cue, sr-only text), not the '
        'destructive Main Output Clip; one reset point (the existing resetMasterPeak, called by the frozen Master Peak '
        'button) clears master and track latches, so there are no new Tab stops; not an edit'),
    'geometry': (
        'absolute bar in the existing header bottom padding band (pb-1.5), every density; no new row, no inline header '
        'style; all row/scroller/floating-video numbers and every header control rect unchanged'),
    'test_amendment': (
        'B probe: meter-ui.test.tsx asserts exactly 1 splitter / 2 analysers at l.348, 351, 362, 363, 376; per-track taps '
        'on the same AudioContext break exactly these lines. A may change only these five lines, to exact formulas '
        '(1 + tracks, 2 + 2 x tracks); master-specific assertions stay word-for-word'),
    'deferred_reviewer_items': (
        'A round 26 M2c (unmount-unsubscribe test) is required in round 27 tests; M1 (rAF-gap sampling) is an open low '
        'hardening item after stage 4 (AudioWorklet needs a module URL; public/** forbidden)'),
}

for x in b['open_findings']:
    if x['id'] == 'C-R23-01':
        x['round26_record'] = (
            'C round 26: 4 NUL (57 605 B) at 28013/28014 (visible text "Arrangement · ") and 44397/44398 (music lane '
            'aria-label, 2x U+FFFD after hydration). The header badge and library text are clean only because the offsets '
            'moved again; not a fix. All Master labels clean in SSR and DOM. B live curl 2026-10-11: 4 at the same '
            'offsets. Still awaiting the Tech Lead.')
b['open_findings'].append({
    'id': 'R26-M1',
    'severity': 'low',
    'status': 'scheduled',
    'note': (
        'A round 26 code-reviewer M1: meters sample once per rAF from 4096-sample analysers (85 ms at 48 kHz); a frame '
        'stall over ~85 ms or a hidden tab can miss an over. C round 26 max rAF gap 18.5-28.8 ms. The export alert stays '
        'authoritative for the file. A gap-free path (AudioWorklet) needs a module URL and public/** is forbidden, so it '
        'is a hardening item after SRW-13 stage 4, before the final regression; the Tech Lead may accept it instead.'),
    'evidence': 'a-round-26.md section 4 (M1); c-round-26.md section 17.5',
})
b['open_findings'].append({
    'id': 'DEMO-SFX-FULL-SCALE',
    'severity': 'low',
    'status': 'open_tech_lead_decision',
    'note': (
        'The stock demo SFX "Soft impact" alone reaches full scale: at Master 0 dB the live Master Peak shows +0.0 Clip '
        'and the export clamps 2 samples (reduce 0.1 dB). Consistent by construction (one predicate); a 24-bit export '
        'really clamps 1.0 by 1 LSB, so the predicate stays (changing it would invalidate R25-EO/R26-C0). lib/sfx-* is '
        'frozen.'),
    'ask': (
        'Tech Lead: (a) a narrow lib/sfx-* / demo-synth grant to normalise demo peaks to <= MAX_24BIT_SAMPLE, or (b) '
        'accept. Not blocking; round 27 uses it as an R27-TO fixture.'),
    'evidence': 'c-round-26.md section 17.3',
})
b['open_findings'].append({
    'id': 'MASTER-HOLD-TICK-EDGE',
    'severity': 'low',
    'status': 'scheduled',
    'note': (
        'Master hold tick shows only 1 px at a level >= +6 dBFS (bar fully red then). SRW-13 stage 4 polish '
        '(ArrangementMaster.tsx frozen in round 27).'),
    'evidence': 'c-round-26.md section 9',
})

found = False
for c in b['tech_lead_manual_checks']:
    if isinstance(c, dict) and c.get('id') == 'R26-T':
        c['what'] = (
            'Master meter and Clip indicator in real Chrome with real speakers on lay11: at 0 dB the Clip lights at ~2.0 s '
            '(stems enter) and +5.0 is the max at ~4.0 s; at -6 dB it does not light; meter motion readable (text '
            'corrected per C round 26 section 17.1)')
        found = True
assert found
b['tech_lead_manual_checks'].append({
    'id': 'R27-T',
    'what': (
        'per-track meters in real Chrome: readable at every density (folded/tight/regular/full); the track over cue '
        '(warning) is distinguishable from the Master Clip (destructive); the hover title shows the Peak'),
    'why': 'headless has no visual-motion judgement',
})

pr = b['planned_rounds'][-1]
assert pr.get('round') == '25-29'
pr['items'] = [
    '25: SRW-13 stage 1 Master Volume/Mute + export overload report (D-29p) - C PASS',
    '26: SRW-13 stage 2a live Master meter + latched Master Peak/Clip + R26-X (D-29q) - C PASS',
    '27: SRW-13 stage 2b per-track meters (zero-layout geometry contract) (D-29r) - dispatched',
    '28: SRW-13 stage 3 FB-04 clip gain',
    '29: SRW-13 stage 4 FB-05 pan + fader-click UX + round-9 M1/L8 + Master hold tick',
    'C-R23-01 goes first as soon as the Tech Lead answers (round 26: 4 NUL, offsets moved again, one in visible SSR text)',
    'then SRW-14..20 in dependency order, R26-M1 hardening, SRW-21 adapter contract, full regression + root check, T12',
]

io.open(p, 'w', encoding='utf-8', newline='\n').write(json.dumps(b, ensure_ascii=False, indent=2) + '\n')
print('ok', b['version'])
