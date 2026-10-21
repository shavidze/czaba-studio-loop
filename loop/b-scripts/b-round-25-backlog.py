import json

p = 'C:/Apps/czaba-project/tmp/studio-real-loop/backlog.json'
b = json.load(open(p, encoding='utf-8'))
assert b['version'] == 26, b['version']
b['version'] = 27
b['updated'] = '2026-10-11 (B: round 25 result -> round 26 dispatch)'
b['current_task'] = (
    'current-task.md (round 26: SRW-13 stage 2a - live Master meter (post-fader AnalyserNode fan-out tap, '
    'getFloatTimeDomainData, fftSize >= 4096, guarded when createAnalyser is absent), peak hold 1.5 s, floor on stop, '
    'latched Master Peak/Clip button (over = the export predicate, only a click clears it; not an edit), 0 renders per frame; '
    'R26-X: hide the export gain note while Master is muted; meter.ts + meter.test.ts + meter-ui.test.tsx; doc 032; D-29q)'
)
b['advisor_used_by_B'] += (
    '; round 25 result -> round 26 dispatch: available, called after orientation and before writing (advice applied: probe the '
    'fake-context breakage first -> B scratch probe b-round-25-probe.txt, required createAnalyser = 28 tsc errors, optional fan-out tap = tsc 0 and 36/36; '
    'fan-out keeps master.outputs [destination]; float time-domain data; over predicate shared with the export; latch only cleared by a click and not an edit; '
    'master meter + latch as one round, per-track meters as stage 2b; C-R23-01 escalation first; R26-X decided now; export byte identity replaced by a 1 LSB/stat rule) '
    'and again after writing'
)

r25 = next(r for r in b['rounds'] if r['round'] == 25)
r25['status'] = 'done'
r25['result'] = (
    'C PASS (c-round-25.md, c-round-25.json): R25-MV (delta -6.000 dB x3, restore 0.000, video drift max 19.6 ms), '
    'R25-MM (<= -60 dBFS 14 ms after the click, -240 from 60 ms, monotone gain decay 3 valid + 1 replaced run, video sound silenced), '
    'R25-ML (newGraphs 0 beyond Play, seam 0 x5), R25-E0 (864 000 frames, FS 1800, RMS -15.481), '
    'R25-EO (alert +5.0 dBFS / 1800 / 5.0 dB; re-export at -5.0 dB FS 0), R25-E6 (median ratio 0.501187), R25-EM (silent file, suffix), '
    'R25-H (12 Master Volume = 12 Volume, synthetic drag 1 entry, audio follows Undo/Redo), R25-K, '
    'R25-L (header 35, transport 49/87, rows/scroller = r24, floating video 8,503), R25-R, R25-S, R25-U (mutations a-d 1/2/1/1 failed), '
    'R25-Doc, G25-1..3 (tsc 0, vitest 1045/1045, build, Biome 218 warnings 0 errors; 50 OK; 54 lines; anonymous clean). No new bug in scope. '
    'Observations: export not bit-deterministic (+-1 LSB, known since round 11) -> byte identity no longer an oracle; '
    'mute + gain note both shown (-> R26-X); 4 px fader box (stage 4). C-R23-01 worsened: 8 NUL, 3 in visible pre-hydration text. '
    'B independent check 2026-10-11: HEAD c5ed47b, 54 lines identical to c-round-25/gates/git-status-end.txt, 50 OK, '
    '11 owned shas = C record, live curl NUL 8.'
)

b['rounds'].append({
    'round': 26,
    'task': 'current-task.md',
    'items': [
        'SRW-13 stage 2a: live Master meter (post-fader fan-out tap, float data, fftSize >= 4096, guarded), peak hold, floor on stop, '
        'latched Master Peak/Clip button (export over predicate, click-only reset, not an edit), 0 renders per frame; '
        'R26-X export dialog gain note hidden while muted; meter.ts, meter.test.ts, meter-ui.test.tsx (>= 14 it); doc 032'
    ],
    'status': 'dispatched',
    'decision': 'D-29q',
    'note': (
        'frozen: b-round-25-tree-sha256.txt (57 files = round-24 list + types/arrangement.ts, model.ts, StudioWorkspace.tsx, '
        'schedule.test.ts, master.test.ts, master-ui.test.tsx, doc 031; B verified 57 OK); snapshots b-round-25-snapshots/ '
        '(graph.client.ts 63f1fdf9, ArrangementContext.tsx 2ec43d1a, ArrangementMaster.tsx d6548d21, ArrangementExportDialog.tsx dda9f265); '
        'expected status 58 lines (54 + 4 enumerated); B probe b-round-25-probe.txt; RF5-3/R3-V1/R3-V4/R11-P3 not re-run (one drift sample in R26-RB)'
    ),
})
b['vitest_floor_round25'] = 1045
b['baseline_tree_at_round25'] = (
    'HEAD c5ed47b + 54 status lines (rounds 6-25), identical to c-round-25/gates/git-status-end.txt (copy b-round-25-git-status.txt); '
    'sha256 of 57 frozen files: b-round-25-tree-sha256.txt; plus the two foreign untracked agent files (root); must not be reverted'
)
b['loop_runner_note'] = (
    'If run-loop.ps1 stops on a -RoundLimit, restart with -StartRound 26 -StartPhase A and a higher -RoundLimit '
    'to dispatch current-task.md (round 26).'
)

s = next(i for i in b['items'] if i['id'] == 'SRW-13')
s['status'] = 'in_progress'
for a in s['acceptance']:
    if a['id'] == 'R13-M3':
        a['status'] = 'pass'
        a['evidence'] = (
            'C round 25: R25-MV (-6.000 dB live), R25-E6 (export ratio 0.501187), R25-MM (Master Mute silences playback incl. video sound), '
            'R25-EM (muted export warns and proceeds; silent real file)'
        )
    if a['id'] == 'R13-M4':
        a['status'] = 'export_part_pass_meter_part_pending'
        a['evidence'] = 'C round 25 R25-EO: role=alert +5.0 dBFS / 1800 samples / reduce Master 5.0 dB; re-export at -5.0 dB FS 0'
        a['round26'] = 'meter part: R26-C0 (latch at 0 dB, +5.0 +-0.5), R26-C6 (no latch at -6 dB), R26-CR, R26-CM'
st = s['stages']
st[0]['status'] = 'done'
st[0]['result'] = 'C PASS round 25 (c-round-25.md); vitest 1045/1045'
old2 = next(x for x in st if x['stage'] == 2)
st.remove(old2)
st.insert(1, {
    'stage': '2a',
    'round': 26,
    'status': 'dispatched',
    'scope': (
        'live Master meter (post-fader AnalyserNode fan-out tap, float data, guarded), peak hold, floor on stop, '
        'latched Master Peak/Clip indicator (export over predicate, click-only reset, not an edit), no per-frame React render '
        '(FB-14 live part, R13-M4 meter part); plus R26-X (export dialog gain note hidden while muted, C round 25 observation)'
    ),
    'acceptance': ['R26-ML', 'R26-MP', 'R26-C0', 'R26-C6', 'R26-CR', 'R26-CM', 'R26-RB', 'R26-X', 'R26-E', 'R26-K',
                   'R26-L', 'R26-R', 'R26-S', 'R26-U', 'R26-Doc', 'G26-1', 'G26-2', 'G26-3'],
})
st.insert(2, {
    'stage': '2b',
    'status': 'todo',
    'scope': (
        'per-track live meters in the lane headers (same meter.ts; one tap per track after its gain stage; folded/tight/full densities; '
        'lane geometry contract rows 81x4 / 53/61/61/61 and scroller numbers; no per-frame React render; T12.20 compatible)'
    ),
})
s['decisions_round26'] = {
    'tap': (
        'optional ApplyScheduleOptions.tap with fan-out master.connect(tap) after the unchanged master.connect(destination); post-fader; '
        'offline export passes no tap. B probe: a required createAnalyser on ScheduleAudioContext = 28 tsc errors in frozen tests; '
        'the optional tap = tsc 0, graph+master tests 36/36'
    ),
    'analyser': 'created by the context once per AudioContext, guarded (frozen fakes lack createAnalyser), getFloatTimeDomainData (byte data clamps and hides overs), fftSize >= 4096',
    'latch': 'over = the export predicate (x > MAX_24BIT_SAMPLE or x < -1); latched until the Master Peak button is clicked; reset is not an arrangement edit (no history, no status)',
    'render': 'meter frames through a separate store/context with DOM writes; ArrangementMaster renders 0 per frame and at most 1 per latch transition',
    'split': 'master meter + latch = one verifiable unit (round 26); per-track meters touch lane geometry and are stage 2b',
    'r26x': 'C round 25 observation: with Master muted the gain note contradicts the silent file; the smallest honest behaviour hides it (one condition in a file A owns this round)',
}
s.setdefault('ux_notes', []).append(
    'C round 25 section 9: the Master fader layout box is 4 px tall like the track faders (small pointer target) -> stage 4 fader UX'
)

f = next(x for x in b['open_findings'] if x.get('id') == 'C-R23-01')
f['round25_record'] = (
    'C round 25: WORSENED to 8 NUL (56 516 B) at 3536/3537, 11728/11729, 26924/26925, 43308/43309; three in visible SSR text before hydration '
    '(header demo badge, library text, Arrangement heading) plus the music aria-label (2x U+FFFD after hydration). Visible text clean after hydration; '
    'Master labels clean. Offsets move with every markup change. B live curl 2026-10-11: 8. Escalated to the Tech Lead as urgent in b-round-25.md; '
    'still not grantable by B (entry.server.tsx outside A ownership, package.json forbidden).'
)
f['urgency'] = 'raised round 25: affects first paint, no-JS and crawlers on /studio-lab; schedule before the next feature round as soon as the Tech Lead answers'

b['tech_lead_manual_checks'].append({
    'id': 'R26-T',
    'what': 'Master meter and Clip indicator in real Chrome with real speakers on lay11 (lights in the 4-6 s overlap at 0 dB, not at -6 dB); meter motion readable',
    'why': 'headless has no listening or visual-motion judgement',
})
b.setdefault('harness_rules', []).append({
    'from_round': 26,
    'rule': (
        'Export comparisons use frames, NaN, header, full-scale count and RMS, or max |delta| <= 1 LSB; byte identity is never an oracle '
        '(pipeline is +-1 LSB non-deterministic; C round 11 l.65, C round 25 section 5.1)'
    ),
})

open(p, 'w', encoding='utf-8', newline='\n').write(json.dumps(b, ensure_ascii=False, indent=2) + '\n')
print('ok', b['version'], len(b['rounds']))
