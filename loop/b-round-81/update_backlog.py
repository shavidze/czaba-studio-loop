import json, sys
p = sys.argv[1]
b = json.load(open(p, encoding='utf-8'))
items = {it['id']: it for it in b['items'] if isinstance(it, dict) and 'id' in it}
c81 = ['GX-CONTROLS','GX-VOL','GX-MUTE','GX-NESTED','GX-SOLO','GX-HALF','GX-METER','GX-UNDO','GX-UNGROUP','GX-COLLAPSED','GX-NO-RESTART','GX-EXPORT-DIALOG','X1-FOCUS','REG-FOLD','REG-TG','REG-TRACK-MIX','REG-HYD','G81-3 (fake-Bearer 403 sub-check blocked: backend unavailable in cloud)','T81-TARGETED','SOURCE-UNCHANGED']
g = items['SRW-17']
for st in g['stages']:
    if st.get('stage') == '3':
        st['status'] = 'c_pass_published'
        st['c_round81_passed'] = c81
        st['c_round81_bugs'] = ['C81-1 (low, UX signal: nested group names truncate) -> Lows batch + Tech Lead R81-T', 'C81-2 (low, doc 070 l.72) -> round 82 one-line grant']
        st['browserVerified'] = True
        st['realVerified'] = True
        st['notBrowserVerified'] = ['M5 group-Volume pointercancel revert (jsdom UM3 only; not a section-5 row)', 'GX-COLLAPSED audio measured for Mute only; Solo/Volume by attributes and history']
        st['published'] = 'efbed86f644c4faabbdf2044620d089e7537e5bb'
        st['evidence'] = ['c-round-81.md', 'c-round-81.json', 'gates/gate-round-81.json', 'gates/round-81/review.md']
for a in g['acceptance']:
    if a['id'] in ('R17-G2', 'R17-G3'):
        a['status'] = 'pass'
        a['evidence'] = 'C round 81 ' + ('GX-VOL export ratio 0.50000001, 0% -> 0 LSB, live floor' if a['id']=='R17-G2' else 'GX-NESTED G2 muted -> live -inf + export peak 0; inner controls adjustable; ratio 0.24999999')
    if a['id'] == 'R17-G1' and 'status' not in a:
        a['status'] = 'pass'
        a['evidence'] = 'C rounds 79/80 (TG rows, FOLD rows)'
g['status'] = 'c_pass_tech_lead_manual (all stages C PASS browserVerified=true: stage 1 74eca15, stage 2 68383fa, stage 3 efbed86; Tech Lead R79-T/R81-T open; fake-Bearer 403 sub-checks blocked: backend unavailable in cloud)'
s18 = items['SRW-18']
s18['status'] = 'in_progress (stage 1 dispatched round 82, D-29z47; stage 2 envelope next SRW-18 round; none deferred)'
s18['stages'] = [
  {'stage': '1', 'status': 'dispatched', 'round': 82, 'decision': 'D-29z47', 'scope': 'fadeIn?/fadeOut? on audio clips (omitted at 0, in+out<=duration); pure fades.ts; edits F3 (move/copy keep, trim clamps trimmed edge first, split/delete-time/cut drop the fade at new cut edges, range copy keeps only contained edges); per-source fade GainNode only for faded clips with linear ramps (live start + export, mid-start initial value, loop appendPlan); handles 10x10 at body top (hover/selected/fade>0), ramp overlay, data-fade-in/out; one entry per drag, double-click = 0, pointercancel reverts; X1 = C-R80-O3 release status; doc 070 l.72, doc 071 l.4, new doc 072', 'acceptance': ['R18-A1'], 'c_ids': ['FD-HANDLES','FD-IN','FD-OUT','FD-LIVE','FD-MIDSTART','FD-LIMITS','FD-UNDO','FD-EDITS','FD-PLAY-EDIT','FD-NEIGHBOURS','FD-CLIPGAIN','X1-STATUS','REG-HYD','G82-3','T82-TARGETED','SOURCE-UNCHANGED'], 'tech_lead': 'R82-T'},
  {'stage': '2', 'status': 'todo', 'scope': 'clip volume envelope (breakpoints drawn on the clip), playback + export, moves with the clip, survives split/trim', 'acceptance': ['R18-A2']}
]
s18['files'] = sorted(set(s18.get('files', []) + ['app/lib/arrangement/fades.ts', 'app/lib/arrangement/clipboard.ts', 'app/lib/arrangement/model.ts', 'app/contexts/ArrangementContext.tsx']))
s18['ableton_round82'] = 'Live 12 manual sec. 6.8 captured 2026-10-21 (b-round-71/ableton-arrangement-view-20261021.txt): fades at clip edges, hover handles, drag across clip, no overlap of start/end fades, Fade Curve handle, Delete on handle, crossfades, opt-in 4 ms edge fades, fades are clip properties - all confirmed (text). CZABA differences: linear only, double-click reset, no crossfades (clips never overlap), no automatic edge fades, free (no snap) drag; split/trim behaviour unconfirmed in Live -> CZABA rules F3.'
for r in b['rounds']:
    if r.get('round') == 81:
        r['status'] = 'c_pass_published'
        r['result'] = 'C PASS browserVerified=true realVerified=true; 20 rows at both viewports; 2 Low bugs (C81-1 nested group name truncation -> Lows batch + R81-T; C81-2 doc 070 l.72 -> round 82); gate 81 published efbed86 to both remotes (review 8.5/10 COMMIT OK)'
if not any(r.get('round') == 82 for r in b['rounds']):
    b['rounds'].append({'round': 82, 'task': 'current-task.md', 'decision': 'D-29z47', 'status': 'dispatched',
      'items': ['SRW-18 stage 1 (FB-06): clip fade in/out - model, live playback, export, handles (R18-A1)', 'bounded fix X1 = C-R80-O3 release status', 'doc grants C81-2 (doc 070 l.72), GATE81-S1 (doc 071 l.4)'],
      'note': 'baseline HEAD efbed86, clean tree; frozen b-round-81-r82-tree-sha256.txt 467/467; snapshots b-round-81-r82-snapshots (8 files); protected 4/4',
      'owned': ['app/types/arrangement.ts (fadeIn?/fadeOut? on ArrangementClip)', 'app/lib/arrangement/fades.ts (new)', 'app/lib/arrangement/model.ts (trimClipStart, trimClipEnd, splitClipAt, deleteTime bodies)', 'app/lib/arrangement/clipboard.ts (item fields, materialInWindow, copyClipsToClipboard, cutRangeFromArrangement, planClipboardPaste)', 'app/lib/arrangement/graph.client.ts (optional ramp methods, clipFades option, fade node, export line clipFades: clipFadeShapes(arrangement),)', 'app/contexts/ArrangementContext.tsx (one startGraph option line + import)', 'app/components/arrangement/ArrangementClip.tsx (handles, overlay, fade gestures, X1)', 'app/lib/arrangement/__tests__/clip-fades.test.ts (new)', 'app/lib/arrangement/__tests__/clip-fades-ui.test.tsx (new)', 'docs/implementation/2026/quarter-IV/070-studio-lab-track-groups-stage-2-collapse.md (l.72)', 'docs/implementation/2026/quarter-IV/071-studio-lab-track-groups-stage-3-mix.md (l.4)', 'docs/implementation/2026/quarter-IV/072-studio-lab-clip-fades-stage-1.md (new)'],
      'c_ids': s18['stages'][0]['c_ids']})
b['narrow_grants'].append({'round': 82, 'file': 'docs/implementation/2026/quarter-IV/070-studio-lab-track-groups-stage-2-collapse.md', 'scope': 'l.72 only (C81-2)', 'basis': 'C81-2 / A round-81 review L9'})
b['narrow_grants'].append({'round': 82, 'file': 'docs/implementation/2026/quarter-IV/071-studio-lab-track-groups-stage-3-mix.md', 'scope': 'l.4 status line only', 'basis': 'gates/round-81/review.md #1'})
b['narrow_grants'].append({'round': 82, 'file': 'app/contexts/ArrangementContext.tsx', 'scope': 'one startGraph applySchedule option line clipFades: clipFadeShapes(arrangement), + its import', 'basis': 'D-29z47 F4'})
of = {f['id']: f for f in b['open_findings'] if isinstance(f, dict) and 'id' in f}
def upd(i, **kw):
    if i in of: of[i].update(kw)
upd('C80-1', status='closed (C round 81 X1-FOCUS PASS at both viewports; published efbed86)')
upd('GATE80-S8-DOC070-STATUS', status='closed (doc 070 l.4 updated round 81, published efbed86)')
upd('C-R80-O3-REFUSED-LANE-DRAG-PARTIAL-COMMIT', severity='low', status='ruled + scheduled round 82 X1 (D-29z47): the committed last valid place is the FB-03 rule (plan l.170, amber + clip stays at its last valid place); defect = release status that never says where the clip ended; fix = honest release status; committed position unchanged')
upd('C-R28-INFO-NO-EDGE-FADES', status='closed as recorded conscious difference (D-29z47): Live 12 sec. 6.8 automatic 4 ms edge fades are an opt-in setting; CZABA adds no automatic fades; user-drawn fades arrive in SRW-18 stage 1 (round 82)')
upd('A-R80-PREVIEW-FLAG-SIGNAL', status='closed (resolved by round 81 X1, C X1-FOCUS PASS)')
upd('ARCH-CHECKPOINT-SRW16', status='requested_from_root (B round 78 planning, 2026-10-22; non-blocking); addenda q8 (round 79), q9 (round 80), q10 (round 82 planning: MixVolumeTarget volume state machine -> pure lib/arrangement module, gate-81 Architecture note); SRW-16 and SRW-17 boundaries both reached without a root result')
new = [
 {'id': 'C81-1', 'severity': 'low', 'status': 'open - Lows batch + Tech Lead R81-T (UX signal; contract M4 >= 40 px holds; no nesting-depth cap ruled: would shrink FB-12 without user authorisation)', 'to': 'B', 'title': 'nested group names truncate to "ჯგუ…" at depth >= 1 (name button 67 px depth 1, 55 px depth 2), nested groups hard to tell apart; name button title is a constant shortcut hint, not the name', 'evidence': 'c-round-81.md C81-1; c-round-81/shots/controls-nested-*.png; gates/round-81/review.md #7 (about 43 px at depth 3, < 20 px at depth 5)'},
 {'id': 'C81-2', 'severity': 'low', 'status': 'scheduled round 82 (doc 070 l.72 one-line grant)', 'to': 'A', 'title': 'doc 070 l.72 problems section still describes the round-80 slider-focus refusal; X1 now blurs then collapses', 'evidence': 'c-round-81.md C81-2; a-round-81.md review L9'},
 {'id': 'GATE81-S1-DOC071-STATUS', 'severity': 'low', 'status': 'scheduled round 82 (doc 071 l.4)', 'to': 'A', 'title': 'doc 071 status line still says awaiting C', 'evidence': 'gates/round-81/review.md #1'},
 {'id': 'GATE81-S2-UM8-SOURCE-TEXT', 'severity': 'low', 'status': 'open - Lows batch (test file track-group-mix-ui.test.tsx; replace source-text assertion with a rendered dialog check)', 'to': 'B', 'title': 'UM8 asserts dialog source text (isTrackAudibleWithGroups) instead of behaviour', 'evidence': 'gates/round-81/review.md #2; C GX-EXPORT-DIALOG covers the rendered line'},
 {'id': 'GATE81-S3-TRACKGAINS-FALLBACK', 'severity': 'low', 'status': 'open - Lows batch (doc 071 M3 says the fallback is deliberate)', 'to': 'B', 'title': 'applySchedule falls back to group-unaware isTrackAudible when trackGains is omitted', 'evidence': 'gates/round-81/review.md #3 (graph.client.ts l.115-117)'},
 {'id': 'GATE81-S4-HEADER-RENDER-COST', 'severity': 'low', 'status': 'open - Lows batch (only if profiling shows a cost)', 'to': 'B', 'title': 'ArrangementGroupHeader reads the whole useArrangement value; trackEffectiveGains rebuilds the group map per track per volume-drag frame', 'evidence': 'gates/round-81/review.md #4'},
 {'id': 'GATE81-S5-SOLO-COPY', 'severity': 'low', 'status': 'open - Lows batch', 'to': 'B', 'title': 'toggleTrackGroupSolo exclusive branch recreates every group object', 'evidence': 'gates/round-81/review.md #5 (groups.ts l.156-163)'},
 {'id': 'GATE81-S6-BG-LINEAR', 'severity': 'low', 'status': 'open - Lows batch', 'to': 'B', 'title': 'bg-gradient-to-r is the Tailwind v3 name; v4 is bg-linear-to-r', 'evidence': 'gates/round-81/review.md #6 (ArrangementGroupHeader.tsx l.269)'},
 {'id': 'GATE81-S8-CHILD-GROUP-SOLO-DISPLAY', 'severity': 'info', 'status': 'ruled (B, D-29z47): a child group (or lane) audible only because an ancestor is soloed shows its own state (off), the same rule as lane M/S under a muted group; Live display unconfirmed in the capture; Tech Lead R81-T may comment', 'to': 'B', 'title': 'trackGroupSoloState returns off for a group whose parent is soloed', 'evidence': 'gates/round-81/review.md #8'},
 {'id': 'ARCH-R81-VOLUME-STATE-MACHINE', 'severity': 'info', 'status': 'signal - checkpoint request question 10 (b-round-78-checkpoint-request.md); reviewers: keep for now; extract only if a third target kind arrives', 'to': 'root', 'title': 'ArrangementContext MixVolumeTarget volume preview/commit/cancel state machine (volumeTargetKeyRef, cross-flush, six group members) could move to a pure lib/arrangement module; acceptance UM3, UM9, fader-guards, UC2', 'evidence': 'a-round-81.md Architecture note; gates/round-81/review.md Architecture note'},
 {'id': 'A-R81-ORPHAN-SOLO-CONSISTENCY', 'severity': 'info', 'status': 'acknowledged (unreachable from the UI: no path creates an orphan group); GROUPS-NO-MODEL-SANITIZER signal', 'to': 'B', 'title': 'orphan-solo rule applies to audibility only; toggleSolo/toggleTrackGroupSolo still count an orphan soloed group', 'evidence': 'a-round-81.md known gap 7'},
 {'id': 'C-R81-NB-POINTERCANCEL', 'severity': 'info', 'status': 'acknowledged (Playwright cannot raise a real pointercancel; jsdom UM3 only)', 'to': 'B', 'title': 'group Volume pointercancel revert not browser-verified', 'evidence': 'c-round-81.json notBrowserVerified'},
 {'id': 'SRW18-KEYBOARD-FADES', 'severity': 'info', 'status': 'signal for SRW-18 stage 2 planning (not scheduled in stage 1; no keyboard path invented)', 'to': 'B', 'title': 'fade lengths are mouse-only in stage 1', 'evidence': 'current-task.md round 82 F6'},
]
for f in new:
    if f['id'] not in of:
        b['open_findings'].append(f)
b['architecture_signals'].append({'round': 81, 'source': 'a-round-81.md Architecture note + gates/round-81/review.md', 'note': 'ArrangementContext volume pipeline generalised by MixVolumeTarget (volumeTargetKeyRef, cross-flush, six group members). Both reviewers: keep for now. Proposal: one bounded task to move the pending-volume state machine into a pure lib/arrangement module (useArrangement shape unchanged; acceptance UM3, UM9, fader-guards.test.tsx, UC2), only if a third target kind arrives or root approves. Checkpoint question 10; not scheduled.'})
b['tech_lead_manual_checks'].append({'id': 'R82-T', 'what': 'real Chrome with headphones on /studio-lab: fade handles easy to find and grab at both lane heights; a 1 s fade-in and 2 s fade-out sound smooth; handles do not get in the way of trim and range drags', 'why': 'feel of SRW-18 stage 1 (D-29z47)', 'status': 'open', 'added': 'round 82 planning'})
b['version'] = 81
b['updated'] = '2026-10-22 (B round 81 review -> round 82 task, D-29z47)'
b['current_task'] = 'current-task.md (round 82: D-29z47 - SRW-18 stage 1 (FB-06): clip fade in/out - fadeIn?/fadeOut? on audio clips, pure fades.ts, edit rules F3, per-source fade GainNode with linear ramps in live start and export, handles + overlay + data-fade-*, one entry per drag, double-click = 0, pointercancel reverts; bounded fix X1 = C-R80-O3 release status; doc 070 l.72, doc 071 l.4, new doc 072. Baseline HEAD efbed86 clean; frozen b-round-81-r82-tree-sha256.txt 467; 8 owned existing files + fades.ts, clip-fades.test.ts, clip-fades-ui.test.tsx, doc 072. Next: regression round if round-83 planning falls on/after 2026-10-24, else SRW-18 stage 2 (envelope).)'
b['advisor_used_by_B'] = 'round 81 review -> round 82 planning: advisor available and consulted before writing (round shape, O3 discriminator, fade graph traps, dispositions) and after writing (final review).'
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', b['version'], len(b['open_findings']), len(b['rounds']))
