import json, shutil, sys
p = sys.argv[1]
shutil.copyfile(p, p + '.bak-before-b-round-21')
d = json.load(open(p, encoding='utf-8'))
by = {x['id']: x for x in d['items']}
ev = 'c-round-21.md'
d['version'] = 23
d['updated'] = '2026-10-11 (B: round 21 result -> round 22 dispatch)'
d['current_task'] = 'current-task.md (round 22: C-R21-01 only - fast de-click mute in graph.client.ts setTrackGain: MUTE_TIME_CONSTANT 0.003 for gain changes to/from 0, volume keeps 0.015, last target seeded at construction; amended R3-V2 mute oracle with W = 35 ms anchored on the spied setTargetAtTime; D-29m)'
d['advisor_used_by_B'] += '; round 21 -> 22 (2026-10-11): available, called once before writing (advice applied: spy-anchored oracle, W derived from tau, keep the 40-100 ms repro run, ramp-exists check, seeded last-target map, 45-line status, pre-split A round-11 follow-ups by file)'

s03 = by['SRW-03']
for b in s03['open_bugs']:
    if b.get('id') == 'C-R12-01':
        b['status'] = 'resolved'
        b['resolved_evidence'] = 'C round 21 RF5-3 3/3 PASS; decision table row 2: every pre-arm rate != 1 write outside settle had |d_dock| > 0.02 in all 3 valid runs (min 0.020129 / 0.020342 / 0.020696; margin 0.13 ms). Closed as a harness-reference artifact (c-round-21.md §2.5, runs/F_*.json). The decision table stays the rule for any future RF5-3: a write at |d_dock| <= 0.02 is a new D-19 bug.'
s03['open_bugs'].append({
    'id': 'C-R21-01', 'severity': 'low',
    'title': 'mute tail: after a track mute the sound stays on the master ~120 ms (GAIN_TIME_CONSTANT 0.015 via setTargetAtTime); R3-V2 literal FAIL (-52.3 dBFS when the mute lands 40 ms before a beep, -86.3 at 98 ms)',
    'status': 'open',
    'evidence': 'c-round-21/runs/r3v2-V2_2.txt, r3v2-V2_4.txt, r3v2-V2_5.txt; c-round-21.md §2.2, §3; store/app/lib/arrangement/graph.client.ts:7,163',
    'routed_to': 'round 22 (D-29m): MUTE_TIME_CONSTANT 0.003 for gain changes to/from 0, volume keeps 0.015, last target seeded at construction; amended R3-V2 mute oracle (W = 35 ms from the spied setTargetAtTime; repro run 40-100 ms before a beep) plus R22-M2 ramp-exists'})
s03['evidence_round21'] = {'passed': ['RF5-3 3/3 (H2, 0 replacements)', 'R3-V4 (D-19 form)'], 'failed': ['R3-V2 -> C-R21-01 (other sub-items PASS in V2_5)'], 'closed': ['C-R12-01'], 'ref': ev + ' §2.2, §2.3, §2.5'}
s03['next_round_note'] = 'Round 22 fixes C-R21-01 (graph.client.ts setTrackGain only). SRW-03 stays regression_open while C-R6-02 (Tech Lead quiet Chrome, R3-V1 D layout) and C-R21-01 are open. RF7-3 real Chrome remains mandatory.'

by['SRW-02']['evidence_round21'] = {'passed': ['R2-V1 (milestone quick for FB-15)'], 'note': 'MP4/MOV positive path env-limited -> Tech Lead real Chrome; acceptance is by metadata probe, not canPlayType (amendment)', 'ref': ev + ' §2.1'}
by['SRW-05']['evidence_round21'] = {'passed': ['R5-L3 (seam 0 ms, 3 wraps, brace past projectEnd keeps wrapping)', 'R5-E1 (maxDiff 0)'], 'ref': ev + ' §2.4', 'note': 'status unchanged verified_except_manual: Tech Lead quiet-Chrome RF7-3'}
s11 = by['SRW-11B']
s11['evidence_round21'] = {'passed': ['R11-P1b (1440, 1280)', 'R11-P1c', 'R11-P2 (1440, 1280)', 'R11-P3 (4 configs, D-29f formula, delta <= 0.02) + sync F5 3/3', 'R11-P4 (13 shots)', 'R11-U 176/176'], 'info': 'R3-V1 mode D: max .0183, LoAF 0 (not a C-R8-01 verdict)', 'note': 'body rect changed since round 15 (body.b 664 vs 684 at 1440); the D-29f formula is the oracle and matched', 'ref': ev + ' §2.6, §2.7'}
s11['next_round_note'] = 'Milestone regression complete (run 1 round 20, run 2 round 21: SRW-11B end to end PASS). Remaining: C-R8-01 (Tech Lead quiet Chrome, with L2/L3), A round-11 follow-ups split by file (round 23 ArrangementLane.tsx: aria-controls, ring-inset, silent fold refusal + :661 reason text; round 24 StudioWorkspace.tsx: Home on separators, nextElementSibling), M1/L8 (after the Tech Lead run or with SRW-13).'

r = d['regression_debt_g6r']
r['status'] = 'closed (round 21): all run-2 IDs run; only R3-V2 failed -> C-R21-01 (round 22 re-checks it as R22-M1/R22-V)'
r['run2_result'] = {'result': 'C taskStatus FAIL only on R3-V2 (C-R21-01, Low); no not-run ID (c-round-21.md §0, §2; c-round-21.json)', 'passed': ['R2-V1', 'R3-V4', 'R5-L3', 'R5-E1', 'RF5-3 (3/3)', 'R11-P1b', 'R11-P1c', 'R11-P2', 'R11-P3 (+ F5 sync 3/3)', 'R11-P4', 'R11-U'], 'failed': ['R3-V2 -> C-R21-01'], 'closed_bugs': ['C-R12-01 (decision table row 2, margin 0.13 ms)'], 'info_only': ['R3-V1 mode D'], 'invalid_replaced': 'c-round-21.md §4 (R11-P3 1440/288 harness selector; R3-V2 V2_1 harness label; V2_2-V2_4 unmute timing = click latency, mute halves valid)'}
r['acceptance_amendments'] += [
    "R11-P1c: the range inputs apply inside the clip with NO history entry (tasks/round-8.md l.205); round-21 task text 'one history entry' was B's wording error; the app matches the original (c-round-21.md §5). Future regressions use this text.",
    "R2-V1 MP4/MOV: accepted when the real metadata-load probe succeeds (plan.md SRW-02 rule), not by canPlayType; Chromium reads .mov although canPlayType('video/quicktime') is empty - not a bug (c-round-21.md §2.1, §5). The positive MP4/MOV path stays a Tech Lead real-Chrome check.",
    "R3-V2 mute side (D-29m, B wording correction, level unchanged): while muted, every beep window that starts at or after t_m + W has master RMS < -80 dBFS, where t_m is the timeline time of the spied setTargetAtTime(0, ...) call of the mute and W = 35 ms (0 -> -80 dBFS = 9.21 tau at tau 3 ms = 27.6 ms + one 128-frame quantum, rounded up); windows inside [t_m, t_m + W) are information only. One valid run must have the mute 40-100 ms before a beep onset. The unmute side (audible within 100 ms) is unchanged."]

for x in d['rounds']:
    if x.get('round') == 21:
        x['status'] = 'done'
        x['result'] = 'C FAIL only on R3-V2 -> C-R21-01 (Low); all other run-2 IDs PASS; C-R12-01 closed; milestone regression complete'
d['rounds'].append({'round': 22, 'task': 'current-task.md', 'items': ['C-R21-01: fast de-click mute (graph.client.ts setTrackGain), graph.test.ts red-first, doc 028'], 'status': 'dispatched', 'decision': 'D-29m', 'note': 'frozen: b-round-21-tree-sha256.txt (49 files = round-20 list minus graph.client.ts); expected status 45 lines; sync IDs not re-run (no dock/scheduler/transport change)'})

for x in d['planned_rounds']:
    if x.get('milestone') == 'after SRW-11B + polish':
        x['status'] = 'run 1 C PASS (round 20); run 2 done (round 21: only R3-V2 -> C-R21-01); fix rounds: 22 = C-R21-01, 23 = ArrangementLane.tsx follow-ups + :661, 24 = StudioWorkspace.tsx follow-ups'
d['planned_rounds'].insert(len(d['planned_rounds']) - 1, {'round': '22-24', 'items': ['22: C-R21-01 (D-29m)', '23: A round-11 follow-ups in ArrangementLane.tsx (aria-controls on the fold button, ring-inset on the track name, silent fold refusal during a gesture gets a reason) + ArrangementLane.tsx:661 reason text', '24: A round-11 follow-ups in StudioWorkspace.tsx (Home on separators must not seek, panel via an explicit ref instead of nextElementSibling)'], 'note': 'bounded milestone fix rounds; then SRW-13'})

tl = d.get('tech_lead_manual_checks')
entry = {'id': 'R22-T', 'what': 'mute/unmute click-freeness by ear in real Chrome with headphones (tau 3 ms de-click)', 'why': 'headless has no listening check'}
if isinstance(tl, list):
    tl.append(entry)
elif isinstance(tl, dict):
    tl['R22-T'] = entry
indent = int(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2] != 'none' else None
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=indent)
print('ok', d['version'], len(d['rounds']), type(tl).__name__)
