import json, sys
p = sys.argv[1]
b = json.load(open(p, encoding='utf-8'))
items = {it['id']: it for it in b['items'] if isinstance(it, dict) and 'id' in it}
g = items['SRW-17']
passed80 = ["FOLD-BUTTON","FOLD-U","FOLD-NESTED","FOLD-A11Y","FOLD-OVERVIEW","FOLD-FIT","FOLD-SELECTION","FOLD-ACTIVE","FOLD-DRAG-OVER","FOLD-MARQUEE","FOLD-AUDIO","FOLD-UNDO","FOCUS-GROUP","FOCUS-HIDDEN","HINT","REG-TG","REG-LANE-FOLD","REG-ZOOM-KEYS","REG-HYD","G80-3 (fake-Bearer 403 sub-check blocked: backend unavailable in cloud)","T80-TARGETED","SOURCE-UNCHANGED"]
c81 = ['GX-CONTROLS','GX-VOL','GX-MUTE','GX-NESTED','GX-SOLO','GX-HALF','GX-METER','GX-UNDO','GX-UNGROUP','GX-COLLAPSED','GX-NO-RESTART','GX-EXPORT-DIALOG','X1-FOCUS','REG-FOLD','REG-TG','REG-TRACK-MIX','REG-HYD','G81-3','T81-TARGETED','SOURCE-UNCHANGED']
for st in g['stages']:
    if st.get('stage') == '2':
        st['status'] = 'c_pass_published'
        st['c_round80_passed'] = passed80
        st['c_round80_bugs'] = ['C80-1 (low) -> fixed round 81 X1', 'C80-2 (low) -> accepted by B (D-29z46), wording is the C2 contract']
        st['browserVerified'] = True
        st['realVerified'] = True
        st['published'] = '68383fa91f0e58f577b5e33f14d21ff63fb1531c'
        st['evidence'] = ['c-round-80.md', 'c-round-80.json', 'gates/gate-round-80.json', 'gates/round-80/review.md']
if not any(st.get('stage') == '3' for st in g['stages']):
    g['stages'].append({'stage': '3'})
for st in g['stages']:
    if st.get('stage') == '3':
        st.update({'round': 81, 'decision': 'D-29z46', 'status': 'dispatched',
          'scope': 'group Mute/Solo/Volume (model fields optional, omitted at defaults); one pure trackEffectiveGains(arrangement) used by live start, live non-restart sync and export (effective gain per child, no bus nodes, 0 restarts); mute beats solo at every level; exclusive/Ctrl-additive group solo, track exclusive solo clears group solos; half-solo aria-pressed=mixed; group header M/S/Volume (row stays 28 px, no text nodes); group volume gesture = track volume semantics; ungroup drops group mix state; export dialog video line group-aware; X1 = C80-1 blur-then-collapse; narrow UC2 test amendment; doc 070 four lines; doc 071',
          'acceptance': ['R17-G2', 'R17-G3', 'half-solo (Live 12 sec. 18.3 l.112)'],
          'c_ids': c81,
          'tech_lead': 'R81-T (half-solo readability, group -6 dB by ear, child meter falling under a muted group)'})
g['status'] = 'in_progress (stage 1 C PASS published 74eca15; stage 2 C PASS browserVerified published 68383fa; stage 3 dispatched round 81, D-29z46; none deferred)'
g['ableton_round81'] = ('Live 12 sec. 18.3 (b-round-78 capture): l.90 Group Track is a summing container; l.92 group tracks have mixer controls; l.112 a group containing a soloed track or nested group shows a half-colored Solo (all confirmed text). '
                        'sec. 18.1 l.42-43 Track Activator mute, Solo mutes all other tracks, Ctrl/Cmd adds (confirmed text). sec. 18.6 l.169 soloing mutes others except tracks feeding others (confirmed, general). '
                        'CZABA: effective gain per child instead of a bus node (acoustically equal without effects; keeps the round-79 TG-AUDIO zero-restart lock); child meters show post-group level (Live unconfirmed); ungroup drops group mix state (Live: mixer state unstated); group pan not in scope (FB-12 / SRW-17 name Mute/Solo/Volume)')
b['current_task'] = ('current-task.md (round 81: D-29z46 - SRW-17 stage 3: group Mute/Solo/Volume in playback and export via trackEffectiveGains, nesting, half-solo, header controls, ungroup drops mix state, export-dialog video line; bounded fix X1 = C80-1 blur-then-collapse with narrow UC2 test amendment. '
                     'Baseline HEAD 68383fa clean; frozen b-round-80-r81-tree-sha256.txt 461; 11 owned existing files (types, schedule, graph.client, model toggleSolo, groups, ArrangementContext, ArrangementGroupHeader, StudioWorkspace X1, ArrangementExportDialog one expression, track-group-collapse-ui UC2 segment, doc 070 four lines) + new track-group-mix.test.ts, track-group-mix-ui.test.tsx, doc 071. '
                     'Next: regression round if round-82 planning falls on/after 2026-10-24 (includes C-R80-O3 repro row), else C-R80-O3 repro + decision, then SRW-18..20, Lows batch.)')
b['updated'] = '2026-10-22 (B round 80 review -> round 81 task, D-29z46)'
b['version'] = 80
for r in b['rounds']:
    if r.get('round') == 80:
        r['status'] = 'c_pass_published'
        r['result'] = 'C PASS browserVerified=true realVerified=true; 2 Low bugs (C80-1 slider-focus refusal message -> round 81 X1; C80-2 fold label order -> accepted by B D-29z46); observations O1-O5; gate 80 published 68383fa to both remotes (review 8.5/10 COMMIT OK, verify 1900/1900)'
if not any(r.get('round') == 81 for r in b['rounds']):
    b['rounds'].append({'round': 81, 'task': 'current-task.md', 'decision': 'D-29z46', 'status': 'dispatched',
        'items': ['SRW-17 stage 3 (FB-12): group Mute/Solo/Volume in playback and export, nesting, half-solo (R17-G2, R17-G3)', 'bounded fix X1 = C80-1'],
        'note': 'baseline HEAD 68383fa, clean tree; frozen b-round-80-r81-tree-sha256.txt 461/461; snapshots b-round-80-r81-snapshots (11 files); protected 4/4',
        'owned': ['app/types/arrangement.ts (3 optional group fields)', 'app/lib/arrangement/schedule.ts (trackEffectiveGains; isTrackAudible unchanged)', 'app/lib/arrangement/graph.client.ts (optional trackGains input; export call line without pan)', 'app/lib/arrangement/model.ts (toggleSolo only)', 'app/lib/arrangement/groups.ts (new pure exports)', 'app/contexts/ArrangementContext.tsx (group actions, group volume pipeline, 3 gain call sites)', 'app/components/arrangement/ArrangementGroupHeader.tsx (M/S/Volume)', 'app/components/arrangement/StudioWorkspace.tsx (X1 + wiring)', 'app/components/arrangement/ArrangementExportDialog.tsx (one expression)', 'app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx (UC2 l.574-594 only)', 'docs/implementation/2026/quarter-IV/070-studio-lab-track-groups-stage-2-collapse.md (l.4, l.18, l.52, l.70)', 'app/lib/arrangement/__tests__/track-group-mix.test.ts (new)', 'app/lib/arrangement/__tests__/track-group-mix-ui.test.tsx (new)', 'docs/implementation/2026/quarter-IV/071-studio-lab-track-groups-stage-3-mix.md (new)'],
        'c_ids': c81})
tl = b['tech_lead_manual_checks']
if not any(t.get('id') == 'R81-T' for t in tl):
    tl.append({'id': 'R81-T', 'what': 'real Chrome with headphones on /studio-lab: the half-coloured group Solo reads clearly; group Volume 50% sounds like -6 dB against a track at 50%; a child meter falling under a muted group is understandable', 'why': 'feel of SRW-17 stage 3 (D-29z46)', 'status': 'open', 'added': 'round 80 planning'})
of = b['open_findings']
byid = {f.get('id'): f for f in of}
upd = {
 'ARCH-CHECKPOINT-SRW16': 'requested_from_root (B round 78 planning, 2026-10-22; non-blocking); addendum question 8 (round 79) and question 9 (round 80 planning: group volume pipeline in ArrangementContext, row-focus.ts proposal; SRW-17 feature boundary reached with round 81) appended; no root result yet',
 'GATE79-S2-UNGROUP-FOCUS-BODY': 'closed - C round 80 FOLD-UNDO / REG-TG (focus on the first child, not BODY), published 68383fa',
 'GATE79-S3-SHORTCUT-HINT': 'closed - C round 80 HINT, published 68383fa',
 'GATE79-S7-DOC069-STATUS': 'closed - C round 80 O5 (exact granted text), published 68383fa',
 'C-R79-O2-FOCUS-AFTER-GROUP': 'closed - C round 80 FOCUS-GROUP, published 68383fa',
}
for k, v in upd.items():
    if k in byid:
        byid[k]['status'] = v
new = [
 {'id':'C80-1','severity':'low','status':'scheduled round 81 (X1, D-29z46: blur-then-collapse, capture the focused row first; narrow UC2 amendment)','to':'A','title':'U / fold refused with the drag message when a fader in a to-be-hidden row is merely focused and nothing is pending','evidence':'c-round-80.md C80-1; c-round-80/q1-*.json FOLD-U s5c; gates/round-80/review.md #1'},
 {'id':'C80-2','severity':'low','status':'closed - accepted by B (D-29z46): shipped label ჯგუფის დაკეცვა / გახსნა — <name> is the C2 contract (same words, unique accessible name, frozen stage-1 groupName regex); doc 070 l.70 records it in round 81','to':'B','title':'fold button aria-label word order differs from the round-80 C2 text','evidence':'c-round-80.md C80-2; gates/round-80/review.md #2'},
 {'id':'C-R80-O3-REFUSED-LANE-DRAG-PARTIAL-COMMIT','severity':'low (provisional; medium if the refusal is silent)','status':'open - one discriminating repro row scheduled in round 82 (regression round if due, else its own repro round); fix, if any, goes to the ArrangementClip owner in its own round','to':'B','title':'a cross-lane drag refused for overlap (music 101 s onto stems with a clip at 2-18) commits the last same-lane preview (1.025 s) instead of the original 0.35 s or the requested 1.35 s','evidence':'c-round-80.md O3; c-round-80/probe-ghost.json (blocked ghost label present at stems); ArrangementClip.tsx l.497-504 + l.620-627 (blocked path commits getArrangement())'},
 {'id':'C-R80-O1-FIT-CAP-81','severity':'info','status':'acknowledged (existing fit cap)','to':'B','title':'lane fit caps at 81 px; C first used a self-invented fill criterion, re-judged against the written acceptance','evidence':'c-round-80.md O1'},
 {'id':'C-R80-O4-DEMO-FULL-SCALE','severity':'info','status':'acknowledged (same as DEMO-SFX-FULL-SCALE)','to':'B','title':'exports peak 1.0 with 486 full-scale samples in both collapsed and expanded exports','evidence':'c-round-80.md O4'},
 {'id':'GATE80-S3-LABEL-FOCUS-LOOKUP','severity':'low','status':'open - Lows batch / row-focus checkpoint (needs a data-testid on the frozen ArrangementLane name button)','to':'B','title':'trackRowNameButton finds the lane name button by a Georgian label substring; a text change silently breaks focus restore','evidence':'gates/round-80/review.md #3; StudioWorkspace.tsx l.280'},
 {'id':'GATE80-S4-REPEATED-RENDER-WORK','severity':'low','status':'open - Lows batch','to':'B','title':'trackGroupDescendantTrackIds per collapsed group per render; trackRowsLayoutKey not memoised','evidence':'gates/round-80/review.md #4'},
 {'id':'GATE80-S5-DOUBLE-LAYOUT','severity':'low','status':'open - Lows batch (optional)','to':'B','title':'collapse recalculates the lane layout twice and builds the collapsed map twice','evidence':'gates/round-80/review.md #5'},
 {'id':'GATE80-S6-STALE-COLLAPSE-IDS','severity':'info','status':'acknowledged (deliberate C1: Redo restores the collapsed state; ids are random UUIDs)','to':'B','title':'collapsedGroups keeps entries of dissolved groups','evidence':'gates/round-80/review.md #6'},
 {'id':'GATE80-S7-TRACKGROUPROWCOUNT-LEFTOVER','severity':'low','status':'open - Lows batch (export used only by the frozen groups.test.ts)','to':'B','title':'trackGroupRowCount is now only used by a test','evidence':'gates/round-80/review.md #7'},
 {'id':'GATE80-S8-DOC070-STATUS','severity':'low','status':'scheduled round 81 (doc 070 l.4, D-29z46)','to':'A','title':'doc 070 status line still says awaiting C','evidence':'gates/round-80/review.md #8'},
 {'id':'GATE80-S9-CONST-ASSERTION-TEST','severity':'low','status':'open - Lows batch (test file now partly owned in round 81 only for the UC2 segment)','to':'B','title':"'video' as const in track-group-collapse-ui.test.tsx l.451",'evidence':'gates/round-80/review.md #9'},
 {'id':'GATE80-S10-REDO-HIDDEN-SELECTION','severity':'info','status':'acknowledged (documented C7 limitation in doc 070; overview marks the selection)','to':'B','title':'Redo can restore a clip selection inside a collapsed group; Delete would remove a clip only visible as a selected overview block','evidence':'gates/round-80/review.md #10'},
 {'id':'ARCH-R80-ROW-FOCUS','severity':'info','status':'signal - in ARCH-CHECKPOINT-SRW16 addendum question 9; reviewers: keep for now, consider row-focus.ts after stage 3','to':'root','title':'StudioWorkspace gained collapsedGroups, pendingRowFocusRef + dependency-less layout effect and three DOM focus helpers; proposal app/lib/arrangement/row-focus.ts with a lane name testid','evidence':'a-round-80.md Architecture note; gates/round-80/review.md Architecture note'},
 {'id':'A-R80-PREVIEW-FLAG-SIGNAL','severity':'info','status':'resolved by design (D-29z46 X1: blur-then-collapse commits a pending fader preview; no context flag needed)','to':'B','title':'reviewer proposal: a volume/pan preview-pending flag in ArrangementContext','evidence':'a-round-80.md Deviation 3 and Architecture note'},
 {'id':'A-R80-REVIEW-RESIDUALS','severity':'low','status':'open - Lows batch (#8 small repeated work; #9 TrackGroupOverviewBlock placement)','to':'B','title':'A round-80 code-review residuals','evidence':'a-round-80.md Code review'},
 {'id':'GROUP-PAN-NOT-IN-SCOPE','severity':'info','status':'signal (Live group tracks have full mixer controls; FB-12/SRW-17 name Mute/Solo/Volume only; not requested)','to':'B','title':'group rows have no pan control','evidence':'current-task.md round 81 section 4'},
]
for f in new:
    if f['id'] not in byid:
        of.append(f)
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', len(of), b['version'])
