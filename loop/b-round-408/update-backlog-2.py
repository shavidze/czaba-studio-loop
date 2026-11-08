# B round 408 -> 409 planning, part 2: backlog v382 -> v383 (round 409 dispatch). Not re-runnable.
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = f'{L}/b-round-408/update-backlog-2.done'
if os.path.exists(done):
    sys.exit('already applied')
p = f'{L}/backlog.json'
b = json.load(open(p))
assert b['version'] == 382, b['version']
BY = '2026-11-08 B round 408 -> 409 planning'
def pre(o, text):
    o['status'] = text + ' | ' + o.get('status', '')
dec = [
 ('D-29z1418', "PERF-11c-iii-e-ii scope and design (last stage of PERF-11c-iii): ArrangementLane becomes a thin shell (keeps useArrangement(), useArrangementPreviewLaneClips, the lane-drag ghost subscription; derives clips, pxPerSecond, laneSources useMemo over [clips, collection, sourcePeaks, videoSources] (title/peaks/video audio per lane source), sourceDurations whole, laneGhostTitles useMemo, hasArrangementClips) over memo(ArrangementLaneViewInner, areArrangementLaneViewPropsEqual); track compared field by field via LANE_TRACK_FIELD_COMPARES typed over keyof Required<ArrangementTrack> (exclusive Solo rebuilds every track object; a new field is a compile error), all other props Object.is. Content-compared lane sources (sketch v1) dropped: peaks are stored in the same callback that marks the source ready (both load sites), so sourceDurations changes in the same commit and the always-equal mutant survived in jsdom and browser. sourceDurations passed whole (a lane-scoped map would re-render every ArrangementClipView per inner render). Feature-boundary checkpoint requested of root: ARCH-CHECKPOINT-PERF11C-III-BOUNDARY (b-round-408/root-request-arch-checkpoint-perf11c-iii.md; triple 59-key list, shell+memo helper, ArrangementContext ownership), non-blocking; supersedes the scope of ARCH-CHECKPOINT-SYS-R385-ACTIONS."),
 ('D-29z1419', "Consult/review rulings for e-ii: performance-optimizer (b-round-408/consult-performance-optimizer.md): design sound, no saving lost by (a) useMemo lane sources / (b) whole sourceDurations; adopt a compile-time field guard; do not pin shell cost (shells() <= 3). tech-lead pass 1 on v2 bd47148b: APPROVE WITH LOWS; TL-R409-SK-1..4 (field table, title by getAllByTitle, blocked-then-valid ghost, pan row + DROP-PAN mutant) all fixed in v3; SK-5..7 Info closed. tech-lead pass 2 on the dispatched v3 sha 1beedffb: APPROVE, nothing new (b-round-408/sketch-review.md)."),
 ('D-29z1420', "Round 409 dispatched from B's reviewed sketch b-round-408/sketch-409.patch.txt sha256 1beedffbda3eca0f (2 files: ArrangementLane.tsx, render-budget.test.tsx with RB-LEAF7/8/9) + new doc 262 (l.4 'Completed (C round 409 PASS)') + doc 261 l.4 -> 'Completed (C round 409 PASS)'. Evidence on sketch v3: tsc/Biome/lint rc 0; 46 covering files 914/914 (max 2072 ms in a 20000 ms describe; new rows <= 402 ms); full vitest 262/3885 rc 0; mutants 9/9 red + tsc guard rc 2; dev leaf probe 15 steps both viewports: shell [0,12,4,4,0,0,0,4,4,4,4,4,8,4,4] = HEAD, new inner [0,8,4,4,0,0,0,1,1,4,4,0,0,1,1] = loaded replicate, PLAIN-MEMO mutant ends 4,4 on the Solo steps; lane probe v409 (8 steps incl. bass-waveform, exclusive-solo, fixed active-track) ok on HEAD and sketch both viewports, DROP-SOLO-FIELD browser mutant fails solo + exclusive-solo. B-R408-PROBE-ACTIVE-TRACK-VACUOUS fixed in the probe. Baseline 37b1db8 clean; frozen 1299; grants 4."),
]
for did, text in dec:
    b['decisions_log_b'].append({'id': did, 'date': '2026-11-08', 'by': BY, 'decision': text})
q = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
s = [x for x in q['stages'] if x.get('id') == 'PERF-11c-iii-e-ii']
assert len(s) == 1
pre(s[0], 'dispatched (D-29z1420): round 409, b-round-408/sketch-409.patch.txt sha 1beedffbda3eca0f')
q['status'] = 'in_progress (D-29z1420): PERF-11c-iii-e-i done (408, 37b1db8); round 409 = PERF-11c-iii-e-ii (closes PERF-11c-iii); then PERF-15 | ' + q['status']
q['execution_order_d29z1420'] = 'round 409 PERF-11c-iii-e-ii -> PERF-15 -> SYS-R2-FAKE-FIDELITY + SYS-R388 -> SYS-CLOCK-DETERMINISM -> SYS-R369 -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 (direction gate) -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 (skip rule). REGRESSION-2026-11-10 first at the first planning on/after 2026-11-10. RETRO at 416.'
for st in q['stages']:
    if st.get('id') == 'PERF-11c-iii':
        pre(st, 'in_progress (D-29z1420): a..d and e-i done; e-ii = round 409 (last stage)')
n = 0
for f in b['deferred_low_polish']:
    if f.get('id') == 'B-R408-PROBE-ACTIVE-TRACK-VACUOUS':
        pre(f, 'fix_dispatched (D-29z1420): b-round-408/lane/lane-actions-probe.mjs active-track step clicks an unpressed lane and records before/after; closes on C round 409 row 3 PASS'); n += 1
assert n == 1
for o in b['architecture_checkpoint_requests']:
    if o.get('id') == 'ARCH-CHECKPOINT-SYS-R385-ACTIONS':
        pre(o, 'superseded_scope (D-29z1418): the boundary question moves to ARCH-CHECKPOINT-PERF11C-III-BOUNDARY; this entry stays as a pointer')
b['architecture_checkpoint_requests'].append({'id': 'ARCH-CHECKPOINT-PERF11C-III-BOUNDARY', 'decision': 'D-29z1418', 'requested_of': 'root (read-only frontend-architect, store/.claude/references/architecture-checkpoint.md)', 'file': 'b-round-408/root-request-arch-checkpoint-perf11c-iii.md', 'question': 'after round 409 publishes: (1) triple 59-key actions list keep/extract (satisfies, no as const); (2) shell + memo inner pattern: shared helper (typed field-compare) or per-leaf; (3) ArrangementContext.tsx ownership: any one extraction cheaper than its Undo/Redo and audio-timing risk', 'status': 'requested (D-29z1418), non-blocking; loop continues with PERF-15 if no result', 'added': BY})
b['rounds'].append({'round': 409, 'task': 'current-task.md', 'decision': 'D-29z1416..D-29z1420', 'type': 'PERF-11c-iii-e-ii (Lane shell + memo inner; render saving, behaviour-preserving)', 'status': 'dispatched', 'note': 'baseline 37b1db8 clean; frozen b-round-408/r409-frozen-sha256.txt (1299); grants b-round-408/grants-409.txt (4); patch b-round-408/sketch-409.patch.txt sha 1beedffbda3eca0f; claims b-round-408/claims-409.sh', 'added': BY})
b['current_task'] = 'Round 409: PERF-11c-iii-e-ii from B reviewed sketch b-round-408/sketch-409.patch.txt (current-task.md)'
b['version'] = 383
b['updated'] = BY
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('applied v382 -> v383\n')
print('ok v383')
