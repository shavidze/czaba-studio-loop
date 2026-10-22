import json, sys
p = sys.argv[1]
b = json.load(open(p, encoding='utf-8'))
items = {it['id']: it for it in b['items'] if isinstance(it, dict) and 'id' in it}
c82 = ['FD-HANDLES','FD-IN','FD-OUT','FD-LIVE (music, per section-5 signal rule)','FD-MIDSTART (music; paired comparison discriminates)','FD-LIMITS','FD-UNDO','FD-EDITS','FD-PLAY-EDIT','FD-NEIGHBOURS','FD-CLIPGAIN','X1-STATUS','REG-HYD','G82-3 (fake-Bearer 403 sub-check blocked: backend unavailable in cloud)','T82-TARGETED','SOURCE-UNCHANGED']
s = items['SRW-18']
for st in s['stages']:
    if st.get('stage') == '1':
        st['status'] = 'c_pass_published'
        st['c_round82_passed'] = c82
        st['c_round82_bugs'] = []
        st['browserVerified'] = True
        st['realVerified'] = True
        st['notBrowserVerified'] = []
        st['published'] = 'bdc2067627b8390679caeda1a7e3d25db41452e9'
        st['evidence'] = ['c-round-82.md', 'c-round-82.json', 'gates/gate-round-82.json', 'gates/round-82/review-result.json']
    if st.get('stage') == '2':
        st.update({
            'status': 'dispatched', 'round': 83, 'decision': 'D-29z48',
            'scope': 'clip volume envelope: envelope?: {time (source seconds), gain (linear 0..1)}[] on audio clips (omitted when empty); pure envelope.ts (gain at source time, add at line value, move clamped to neighbours/window, remove, shapes); source-anchored so model.ts edits keep it unchanged (non-destructive, hidden points kept); clipboard carries it; per-source envelope GainNode only for clips with points (source -> fade? -> envelope -> clipGain), linear ramps incl. final ramp to window end, live startGraph + export (clipEnvelopes: clipEnvelopeShapes(arrangement),); Env toggle + A key in StudioWorkspace, lane prop, new ArrangementClipEnvelope.tsx (line always drawn, editor in mode, double-click add, drag move, double-click delete, pointercancel/unmount revert, 500 ms drag-then-dblclick guard); fade handles hidden in mode; data-envelope; X1 = GATE82-S1 guard on fade handles; doc 072 l.4 + 3 lines; new doc 073',
            'acceptance': ['R18-A2'],
            'c_ids': ['EN-MODE','EN-ADD','EN-DRAG','EN-DRAWN','EN-EXPORT','EN-LIVE','EN-MIDSTART','EN-EDITS','EN-UNDO','EN-MULTIPLY','EN-PLAY-EDIT','EN-NEIGHBOURS','X1-DBLCLICK','REG-HYD','G83-3','T83-TARGETED','SOURCE-UNCHANGED'],
            'tech_lead': 'R83-T'})
for a in s['acceptance']:
    if a['id'] == 'R18-A1':
        a['status'] = 'pass'
        a['evidence'] = 'C round 82 FD-IN (fade-in export ratio vs ref max err 9.9e-5 over [2,3], 0 outside 0.01; flat part exactly 1), FD-OUT (max err 1.0e-4), FD-CLIPGAIN, FD-LIVE/FD-MIDSTART on music (paired -4.6 dB vs theory -4.44); both viewports; browserVerified true; published bdc2067'
s['status'] = 'in_progress (stage 1 C PASS browserVerified=true, published bdc2067; stage 2 envelope dispatched round 83, D-29z48; none deferred)'
s['files'] = sorted(set(s.get('files', []) + ['app/components/arrangement/ArrangementClipEnvelope.tsx','app/components/arrangement/ArrangementLane.tsx','app/components/arrangement/StudioWorkspace.tsx','app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx']))
s['ableton_round83'] = 'Live 12 manual fetched 2026-10-22 (b-round-82/web/automation-and-editing-envelopes.txt, clip-envelopes.txt; untrusted text): Editing Breakpoints (click segment add, double-click off-segment add, click point delete, drag move, grid snap + Alt bypass, neighbour snap/removal, Shift fine/axis, Alt curve), Locking Envelopes (envelopes move with clips), Edit Menu Commands (clip-track edits carry envelopes), Clip Envelopes (Arrangement clips have modulation envelopes only; absolute automation on track lane), shortcuts 42.7 (A = Automation Mode, F = momentary fade controls). CZABA differences recorded in round-83 task section 4.'

of = b['open_findings']
byid = {f.get('id'): f for f in of if isinstance(f, dict)}
o3 = byid['C-R80-O3-REFUSED-LANE-DRAG-PARTIAL-COMMIT']
o3['status'] = 'closed'
o3['closed_by'] = 'C round 82 X1-STATUS PASS both viewports (status exactly the X1 text with the kept start 1.350; free-lane and back-to-own-lane cases unchanged); published bdc2067'
kf = byid['SRW18-KEYBOARD-FADES']
kf.update({'severity': 'low', 'status': 'open (own backlog entry per gate-82 reviewer #4; covers fade handles and, from round 83, envelope points; accessibility; Lows batch or a dedicated stage, never silently dropped)', 'title': 'fade handles and envelope points are mouse-only: no role, focus or keyboard path', 'evidence': 'current-task.md round 82 F6; gates/round-82/review-result.json #4; round 83 task E7'})
new = [
 {'id': 'GATE82-S1-DBLCLICK-AFTER-FADE-DRAG', 'severity': 'medium (unconfirmed in a browser)', 'status': 'scheduled round 83 X1 (D-29z48): 500 ms drag-then-double-click guard on fade handles; C row X1-DBLCLICK records whether Chromium emits dblclick', 'to': 'round 83', 'title': 'a quick click right after a fade-handle drag may be counted as a double-click and reset the new fade (second history entry)', 'evidence': 'gates/round-82/review-result.json suggestion 1'},
 {'id': 'GATE82-S2-SPLIT-INSIDE-FADE', 'severity': 'low (design signal)', 'status': 'doc 072 line in round 83; behaviour is the C-verified F3 rule; later option: keep ramp gain across the cut or split the ramp proportionally (needs B ruling, not scheduled)', 'to': 'B', 'title': 'split / Delete inside a fade is not sound-neutral: the right part starts at gain 1', 'evidence': 'gates/round-82/review-result.json suggestion 2'},
 {'id': 'GATE82-S3-FADE-HANDLE-HIT-AREA', 'severity': 'low', 'status': 'doc 072 line in round 83 (mouse case); touch case = A-R82-L2 in Lows batch', 'to': 'round 83 doc / Lows batch', 'title': 'hidden (opacity 0) fade handles take the top 10 px of trim strips and body corners; a plain click there starts a no-op fade gesture', 'evidence': 'gates/round-82/review-result.json suggestion 3; a-round-82.md L2'},
 {'id': 'GATE82-S5-OPTIONAL-RAMP-METHODS', 'severity': 'low', 'status': 'Lows batch: upgrade the three frozen FakeParams and make setValueAtTime/linearRampToValueAtTime required', 'to': 'Lows batch', 'title': 'optional ramp methods on ScheduleAudioParam would silently skip fades/envelopes if missing', 'evidence': 'gates/round-82/review-result.json suggestion 5'},
 {'id': 'GATE82-S6-PREVIEW-RESCHEDULE-PER-MOVE', 'severity': 'info', 'status': 'signal: throttle preview reschedule only if users notice clicks; envelope drags inherit it', 'to': 'B', 'title': 'every fade/envelope preview move during playback rebuilds the graph (scheduleKey)', 'evidence': 'gates/round-82/review-result.json suggestion 6; C round 82 FD-PLAY-EDIT 15 -> 20 sources'},
 {'id': 'GATE82-S7-FADE-HANDLE-UNMOUNT-MID-DRAG', 'severity': 'low', 'status': 'Lows batch (ArrangementClip.tsx): keep the handle mounted during a fade gesture or treat lostpointercapture as pointercancel; the round-83 envelope points must revert on unmount (E7)', 'to': 'Lows batch', 'title': 'if the fade handle unmounts mid-drag (zoom < 24 px, fold) the preview stays active until the next gesture', 'evidence': 'gates/round-82/review-result.json suggestion 7'},
 {'id': 'A-R82-OVERLAY-2PX', 'severity': 'low (cosmetic)', 'status': 'Lows batch', 'to': 'Lows batch', 'title': 'fade ramp overlay viewBox uses width while the body is width - 2 px (about 2 px off near the right edge)', 'evidence': 'a-round-82.md known gaps; gate-82 suggestion 8'},
 {'id': 'A-R82-L2-HIDDEN-HANDLE-TOUCH', 'severity': 'low', 'status': 'Lows batch', 'to': 'Lows batch', 'title': 'hidden fade handles still catch presses; no touch-none, so a touch drag can be cancelled', 'evidence': 'a-round-82.md code review L2'},
 {'id': 'C-R82-LIVE-ORACLE-PAIRED', 'severity': 'info', 'status': 'applied in round 83 (EN-LIVE / EN-MIDSTART are paired same-position comparisons)', 'to': 'B', 'title': 'reading-at-t1-vs-t2 live oracles are content-dominated; use paired envelope-vs-control comparisons', 'evidence': 'c-round-82.md signals for B'},
 {'id': 'ENVELOPE-SNAP', 'severity': 'info', 'status': 'signal (Live snaps breakpoints to grid, confirmed text; CZABA stage 2 free like fades); needs a B ruling before scheduling', 'to': 'B', 'title': 'envelope breakpoints do not snap to the grid', 'evidence': 'round 83 task section 4'},
 {'id': 'ENVELOPE-CLEAR', 'severity': 'info', 'status': 'signal (Live Clear Envelope context command); not requested in FB-06', 'to': 'B', 'title': 'no one-step Clear Envelope; points are deleted one by one', 'evidence': 'round 83 task section 4'},
]
existing = set(byid)
for f in new:
    if f['id'] not in existing:
        of.append(f)
b['architecture_signals'].append({'round': 82, 'source': 'a-round-82.md Architecture note + gates/round-82/review-result.json', 'note': 'ArrangementClip.tsx beginGesture/handlePointerMove/finishGesture handle six gesture kinds with per-kind capture element and a separate fade cancel/commit branch; owner file in rounds 80, 81, 82 (and 83). Both reviewers: keep for now (one claim/capture/release lifecycle protects single Undo entries). Proposal: a per-kind handler table {capture, onMove, onRelease, onCancel} behind the same ClipGesture record; acceptance: grid-snap, lane, selection, clip-fades UI and render-budget tests unchanged; value medium, risk medium. Round 83 puts envelope point gestures in a new child component instead of adding kinds. Checkpoint question 11; not scheduled.'})
b['tech_lead_manual_checks'].append({'id': 'R83-T', 'what': 'real Chrome with headphones on /studio-lab: Env mode is easy to find (button and A); adding/dragging/deleting envelope points feels precise at both lane heights; a -12 dB dip sounds smooth; mode off leaves range/seek/fades as before', 'why': 'feel of SRW-18 stage 2 (D-29z48)', 'status': 'open', 'added': 'round 83 planning'})
for g in [
 {'round': 83, 'file': 'app/components/arrangement/StudioWorkspace.tsx', 'scope': 'envelopeMode state + toggle, Env button + data-envelope-mode in arrangement-grid-control, plain a key branch beside g, envelopeMode prop on ArrangementLane', 'basis': 'D-29z48 E5'},
 {'round': 83, 'file': 'app/components/arrangement/ArrangementLane.tsx', 'scope': 'one optional envelopeMode prop passed to ArrangementClipView', 'basis': 'D-29z48 E5'},
 {'round': 83, 'file': 'app/contexts/ArrangementContext.tsx', 'scope': 'one startGraph applySchedule option line clipEnvelopes: clipEnvelopeShapes(arrangement), + its import', 'basis': 'D-29z48 E4'},
 {'round': 83, 'file': 'docs/implementation/2026/quarter-IV/072-studio-lab-clip-fades-stage-1.md', 'scope': 'l.4 status line + at most 3 added lines (GATE82-S2, GATE82-S3, round-83 X1)', 'basis': 'D-29z48 docs'},
]:
    b['narrow_grants'].append(g)
for r in b['rounds']:
    if r.get('round') == 82:
        r['status'] = 'c_pass_published'
        r['result'] = 'C PASS browserVerified=true realVerified=true, 16 rows both viewports, no bugs; fake-Bearer 403 blocked (backend unavailable in cloud); gate 82 published bdc2067 (review 8.5/10)'
b['rounds'].append({'round': 83, 'task': 'current-task.md', 'decision': 'D-29z48', 'status': 'dispatched', 'items': ['SRW-18 stage 2 (FB-06): clip volume envelope (R18-A2)', 'bounded fix X1 = GATE82-S1 drag-then-double-click guard on fade handles', 'doc 072 l.4 + 3 lines'], 'note': 'baseline HEAD bdc2067, clean tree; frozen b-round-82-r83-tree-sha256.txt 471/471; snapshots b-round-82-r83-snapshots (8 files); protected 4/4', 'owned': ['app/types/arrangement.ts (ArrangementClipEnvelopePoint + envelope?)', 'app/lib/arrangement/envelope.ts (new)', 'app/lib/arrangement/clipboard.ts (item field + 3 builders)', 'app/lib/arrangement/graph.client.ts (clipEnvelopes option, envelope node, export line clipEnvelopes: clipEnvelopeShapes(arrangement),)', 'app/contexts/ArrangementContext.tsx (one startGraph line + import)', 'app/components/arrangement/ArrangementClip.tsx (envelopeMode prop, render envelope child, hide fade handles in mode, data-envelope, X1)', 'app/components/arrangement/ArrangementClipEnvelope.tsx (new)', 'app/components/arrangement/ArrangementLane.tsx (one prop)', 'app/components/arrangement/StudioWorkspace.tsx (mode state, Env button, a key, lane prop)', 'app/lib/arrangement/__tests__/envelope.test.ts (new)', 'app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx (new)', 'docs/implementation/2026/quarter-IV/072-studio-lab-clip-fades-stage-1.md (l.4 + 3 lines)', 'docs/implementation/2026/quarter-IV/073-studio-lab-clip-volume-envelope-stage-2.md (new)'], 'c_ids': ['EN-MODE','EN-ADD','EN-DRAG','EN-DRAWN','EN-EXPORT','EN-LIVE','EN-MIDSTART','EN-EDITS','EN-UNDO','EN-MULTIPLY','EN-PLAY-EDIT','EN-NEIGHBOURS','X1-DBLCLICK','REG-HYD','G83-3','T83-TARGETED','SOURCE-UNCHANGED']})
b['baseline_tree_at_round83'] = {'head': 'bdc2067627b8390679caeda1a7e3d25db41452e9', 'status_lines': 0, 'frozen_list': 'b-round-82-r83-tree-sha256.txt', 'entries': 471, 'snapshots': 'b-round-82-r83-snapshots', 'protected': '4/4'}
b['current_task'] = 'current-task.md (round 83: D-29z48 - SRW-18 stage 2 (FB-06, R18-A2): clip volume envelope, source-anchored points {time, gain}, envelope.ts, clipboard carries it, per-source envelope GainNode with linear ramps in live start and export (clipEnvelopes: clipEnvelopeShapes(arrangement),), Env toggle + A key, new ArrangementClipEnvelope.tsx (double-click add at line value, drag, double-click delete, revert on cancel/unmount), fade handles hidden in mode, data-envelope; X1 = GATE82-S1 guard; doc 072 l.4 + 3 lines, new doc 073. Baseline HEAD bdc2067 clean; frozen 471. Next: regression round if round-84 planning falls on/after 2026-10-24, else SRW-19.)'
b['updated'] = '2026-10-22 (B round 82 review -> round 83 task, D-29z48)'
b['version'] = 82
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', len(of))
