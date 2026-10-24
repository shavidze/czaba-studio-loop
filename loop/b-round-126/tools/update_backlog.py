import json
import sys

PATH = sys.argv[1]
with open(PATH, encoding='utf-8') as fh:
    b = json.load(fh)

TODAY = '2026-10-24'
EV = 'c-round-126.json / c-round-126.md; user-review/design-ux-review.md sections 4-6, 9'

GRANTED_SOURCE = [
    'app/components/arrangement/ArrangementExportDialog.tsx',
    'app/lib/arrangement/export-progress.ts',
    'app/lib/arrangement/export-cancel.ts',
    'app/lib/arrangement/export-wav.client.ts',
    'app/lib/arrangement/graph.client.ts (formatExportOverloadWarning l.405-413 and the empty-project Error l.460 only)',
    'app/contexts/ArrangementContext.tsx (MASTER_MUTED_EXPORT_SUFFIX l.204, the bodies of exportWav l.3021-3098 and exportMp3 l.3099-3308, one import line)',
]
GRANTED_TESTS = [
    'export-cancel-ui.test.tsx', 'export-cancel.test.ts', 'export-dialog-a11y-copy.test.tsx',
    'export-dialog-focus-restore.test.tsx', 'export-dialog-focus.test.tsx', 'export-dialog-footer.test.tsx',
    'export-dialog-hold-enter.test.tsx', 'export-dialog-tab-stops.test.tsx', 'export-mp3.test.tsx',
    'export-progress-ui.test.tsx', 'export-progress.test.ts', 'export-range-ui.test.tsx',
    'export-toolbar-hold-enter.test.tsx', 'export-wav.test.ts', 'master-ui.test.tsx (export lines only)',
    'master.test.ts (overload lines only)', 'meter-ui.test.tsx (l.571 export Master line only)',
    'video-fades-ui.test.tsx (export dialog note lines and the export dialog Close button only)',
]

queue = b['post_current_stage_queue']
va = next(q for q in queue if q.get('id') == 'VISUAL-A-OBSIDIAN')
va['status'] = ('in_progress: step 1 DESIGN-UX-REVIEW done (rounds 125-126, C PASS browserVerified=true, reviewComplete=true; '
                'D-29z90/D-29z91); V-0 stage 1 (Export strings) = round 127 (D-29z92)')
split = va['design_ux_review_split_d29z90']
split['part2_result_round126'] = {
    'c': 'c-round-126.json / c-round-126.md',
    'review': 'user-review/design-ux-review.md (title covers both parts; sections 1 final verdict, 4, 5, 6, 8, 9 index, questions for Saba)',
    'taskStatus': 'PASS', 'browserVerified': True, 'realVerified': True, 'allRowsRan': True, 'reviewComplete': True,
    'sectionsDone': ['D3', 'D4', 'D5'], 'sectionsSpilled': [],
    'd3a': 'panel 120 px = D-29b fallback at 1280 (with group SFX 5/61 px visible, without group 33 px); wheel/scrollbar/collapse reach it in 1 action -> friction (pre-ruled line 2), DUX-R-3; not a bug',
    'bugs': 'DUX-B-2/3/4 (all Low) -> deferred_low_polish',
    'recommendations': 'DUX-R-3..9 -> design_ux_recommendations awaiting_user; DUX-R-1 extended to the group Volume readout',
    'top5': ['DUX-R-5 (fitsVisualA)', 'DUX-R-3', 'DUX-R-1 (+group)', 'DUX-R-4', 'DUX-R-6'],
    'part1Integrity': '126 table rows + 8 verdict bullets present (c-round-126/out/part1-integrity.json)',
    'b_spot_checks': ('WAV headers parsed by B: d3cfirst-bc-1440 4864896 frames (101.352 s) and d3cfb-1280 7217877 frames, 48 kHz/24-bit/2 ch; '
                      'shots/D3A-S1-withGroup-real-2026-10-24T0431.png opened: at 1280 the SFX lane shows only a top sliver above the 120 px detail panel, as C describes; '
                      'd3a-summary.json panelPx 120 / ariaValueNow 120; g126-3.json 401 + Sign in required + 0 audio[src]'),
}
va['design_ux_review_status'] = 'done (round 126 C PASS reviewComplete=true; D-29z92)'
va['forward_constraints_d29z92'] = [
    'V-1: the planned outline token #24211E would lower the text-field boundary below today 1.51:1 (DUX-B-3); V-1 must give fields a >= 3:1 boundary or another visible cue, and RV-2 measures it',
    'V-1: the spec places the scoped token overrides in app.css, which is app/styles/app.css under global_forbidden_files app/styles/**; the V-1 task needs a narrow B grant (only a [data-studio-theme="obsidian"] block), justified by the user-approved spec; no other style file',
    'V-0 last stage: add lang="en" on the Studio workspace root (WCAG 3.1.2; the Store html lang stays) and re-capture bbox-baseline-{1280,1440} as the RV-1 reference for V-1..V-3',
    'DUX-R-5 (content vs accent colour, fitsVisualA) joins V-1 only if Saba approves it in design-ux-decisions.md',
]
va['v0_plan_d29z92'] = {
    'decision': 'D-29z92',
    'checkpoint': 'no root answer to b-round-124-checkpoint-request.md Q1 at round 127 planning (no result file in gates/ or the loop folder); B uses the recorded fallback: one module app/lib/arrangement/strings.ts, plain constants plus small formatter functions, one owner group per round',
    'module_contract': {
        'path': 'app/lib/arrangement/strings.ts',
        'shape': 'one exported const object per area, named studio<Area>Strings (stage 1: studioExportStrings); properties are plain English strings or small pure formatter functions (named params object when 3+ same-type params); no React nodes, no locale switching, no runtime language state, no type assertions',
        'existing_exports': 'existing exported message constants (ARRANGEMENT_EXPORT_CANCELLED_MESSAGE, ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE, ...) keep their names and are defined from the module',
        'tests': 'tests reference the module (value or formatter) instead of literals; strings.test.ts is the only place that pins the English literals; assertion strength unchanged',
        'guard': 'strings.test.ts scans the migrated source files (comments stripped) for Georgian codepoints; each later stage adds its files to that list',
    },
    'stages': [
        {'stage': 'V-0.1', 'round': 127, 'area': 'Export (dialog, progress, cancel, WAV worker messages, overload warning, export status messages in ArrangementContext exportWav/exportMp3)', 'status': 'dispatched'},
        {'stage': 'V-0.2', 'area': 'ArrangementContext remaining status/refusal/history-label strings + the message helpers it calls (groups.ts, selection.ts, library.ts, video.ts, video.client.ts, tempo.ts, metronome.ts, view.ts)', 'status': 'planned'},
        {'stage': 'V-0.3', 'area': 'workspace chrome: StudioWorkspace.tsx (incl. the Georgian aria-label selector l.324), ArrangementTransport, ArrangementTempoRow, ArrangementMarkerRow, ArrangementMarkerMenu, ArrangementLoopBrace, ArrangementRuler, ArrangementOverview, grid-divisions.ts, waveform-zoom.ts', 'status': 'planned'},
        {'stage': 'V-0.4', 'area': 'lanes and detail: ArrangementLane, ArrangementClip, ArrangementClipEnvelope, ArrangementGroupHeader, ArrangementTrackMeter, ArrangementMaster, ArrangementDetailPanel; default track names (video/audio/music/stems/SFX) are UI copy', 'status': 'planned'},
        {'stage': 'V-0.5', 'area': 'library and video dock and route: ArrangementLibrary, ArrangementLibraryPreview, ArrangementVideoDock, app/routes/studio-lab.tsx, studio-lab-demo.ts UI labels (collection/folder/badge/description copy; sound titles stay), collection.ts messages; lang="en" on the Studio root; final RV-4 grep; RV-1 baseline re-capture', 'status': 'planned'},
    ],
    'estimate_note': 'the spec estimated 2-3 rounds; the measured inventory (Studio source ~30 files, tests ~58 files) needs 5 bounded stages; scope unchanged',
    'inventory_rules': {
        'in_scope': 'every user-visible string rendered by /studio-lab: text, aria-label, title, placeholder, status/announcement, alert, history (Undo/Redo) labels, default track/group names created by the app',
        'user_content_unchanged': 'sound titles, file names, user-typed marker/group names (M2: user content is not translated); demo sound titles in studio-lab-demo.ts are sound names',
        'comments': 'Georgian code comments are not UI copy (CLAUDE.md allows Georgian context comments); RV-4 scans strip comments',
        'out_of_scope': 'Store-wide files (cart, analytics, icons, loaders not rendered by /studio-lab, root.tsx), the protected purchased route studio.$productId.tsx and the frozen legacy app/components/studio/** and StudioContext.tsx (global_forbidden_files)',
    },
    'rv1_rule_v0': 'during V-0 a size change of an element caused only by its own copy length (or a wrap/height change of its container caused by that copy) is the RV-1 V-0 text-width exception; C attributes every >1 px delta to a changed text node; anything else is a finding',
}
for acc in va['acceptance']:
    if acc['id'] == 'RV-4':
        acc['status'] = 'in_progress: V-0.1 Export area round 127; per-stage source scan in strings.test.ts'

dlp = b['deferred_low_polish']
existing = {e.get('id') for e in dlp}
new_lows = []
for bug in [
    {'id': 'DUX-B-2', 'title': 'under-24 px pointer targets without spacing: library/detail separators (4-6 px hit = box) and lane height handles, library folder fold 16 px wide; 24 px circles intersect neighbours (1440 S0 6/S1 5, 1280 S0 8/S1 8)', 'contract': 'WCAG 2.2 AA 2.5.8 (project: Low unless it blocks use); keyboard arrows work',
     'evidence': 'c-round-126/out/d3c/d3c-hit-2026-10-24T0443.json, d3c-hit2-*.json, c-round-126/out/d3c/wcag258-spacing.json',
     'repro': 'fresh /studio-lab at 1440x900 or 1280x720, S0 or S1; elementFromPoint around the separators and the folder fold; apply the 2.5.8 24 px circle test',
     'related': ['ROOT-R65-L2', 'ROOT-R73-S3-MARKER-BUTTON-SIZE', 'GATE83-L2-POINT-HIT-AREA']},
    {'id': 'DUX-B-3', 'title': 'text-field boundary contrast 1.51:1 (border-outline rgb(48,53,65) on surface rgb(17,19,24); field fill vs surface 1.07:1, so the border is the only cue) on BPM, library search and detail fields',
     'contract': 'WCAG 2.2 AA 1.4.11 non-text contrast 3:1 (project-adopted)', 'evidence': 'c-round-126/out/d3c/d3c-first-1440-*.json boundaries; shots/D3C-S0-1440-2026-10-24T0440.png',
     'repro': 'fresh /studio-lab S0; sample the field border pixel vs the surface outside', 'note': 'VISUAL-A V-1 outline #24211E would lower it further: forward constraint on V-1 (forward_constraints_d29z92)'},
    {'id': 'DUX-B-4', 'title': 'text-muted meta text on the selected library row 4.38:1 (rgb(129,136,152) on rgb(17,39,42), 12 px), both viewports',
     'contract': 'WCAG 2.2 AA 1.4.3 (project-adopted)', 'evidence': 'c-round-125/out/contrast-baseline.json byToken.text-muted.failSamples (same commit 608187f)',
     'repro': 'fresh /studio-lab S0; read the selected library row type/duration colour and background', 'note': 'separate from DUX-B-1 (dim); expected to be re-measured in V-1 RV-2'},
]:
    if bug['id'] in existing:
        continue
    bug.update({'severity': 'low', 'status': 'open', 'source': 'C round 126 DESIGN-UX-REVIEW part 2 (c-round-126.json bugs)', 'regression': 'no (baseline 608187f)', 'added': TODAY + ' B round 126->127 planning (2026-10-23 bug gate: Lows deferred to the polish pass after VISUAL-A)'})
    dlp.append(bug)
    new_lows.append(bug['id'])

recs = b['design_ux_recommendations']
rec_ids = {r.get('id') for r in recs}
authority = recs[0]['authority']
c126 = json.load(open(PATH.replace('backlog.json', 'c-round-126.json'), encoding='utf-8'))
for r in c126['recommendations']:
    if r['id'] == 'DUX-R-1':
        r1 = next(x for x in recs if x['id'] == 'DUX-R-1')
        r1['extension_round126'] = 'part 2 extends it to a visible, typeable group Volume readout (F-3; group dB only in title today) - merges GROUP-VOLUME-VISIBLE-READOUT'
        continue
    if r['id'] in rec_ids:
        continue
    entry = dict(r)
    entry.update({'status': 'awaiting_user', 'source': 'C round 126 DESIGN-UX-REVIEW part 2 (c-round-126.json recommendations; user-review/design-ux-review.md section 5)', 'authority': authority,
                  'not_a_bug': 'a recommendation, not a DUX-B; priority is C\'s suggestion for Saba, not a scheduling order'})
    if r['id'] == 'DUX-R-3':
        entry['links'] = ['C-R125-OBS-1280-SFX-LANE-UNDER-PANEL', 'SRW-11B D-29b']
    if r['id'] == 'DUX-R-6':
        entry['links'] = ['WCAG 2.1.1 question for Saba (not adopted as a contract by B; DUX-R-6 stays a recommendation unless Saba or root adopts it)']
    if r['id'] == 'DUX-R-5':
        entry['visual_a_note'] = 'fitsVisualA true: if approved it joins V-1 (colour); not scheduled before the answer'
    recs.append(entry)

of = b['open_findings']
def finding(fid):
    return next((f for f in of if f.get('id') == fid), None)
updates = {
    'C-R125-OBS-VOLUME-DEADZONE-6PX': 'closed - harness artifact (C round 126 F-6: the part-1 press at x=459 hit the input right border; any press inside moves from the first px, 0.58-0.66 dB/px)',
    'C-R125-OBS-CTRL-ALT-PASTE-SPLIT': 'judged round 126 F-5: shortcutLetter() matches event.code; a layout-faithful AltGr event (key €/@, code KeyE/KeyV) splits/pastes with timeline focus, does nothing in 4 text fields (8/8), 1-step Undo -> acceptable (info). Signal ALTGR-SHORTCUT-GUARD recorded, not scheduled',
    'C-R125-OBS-1280-SFX-LANE-UNDER-PANEL': 'ruled round 126 D3-A: panel 120 = D-29b fallback, reachable by wheel/scrollbar in 1 action -> friction, not a bug -> DUX-R-3 (awaiting_user)',
    'C-R124-OBS-EXPORT-RANGE-UNDER-FOOTER': 'judged round 126 F-2: acceptable (active range card 13 px under the footer, ArrowDown/wheel reveal it; disabled hint card belongs to ARCH-R101-MODALBODY-PADDING-SLOT / GATE102-S3-TALL-CARD-NO-CAP)',
    'GROUP-VOLUME-VISIBLE-READOUT': 'merged into DUX-R-1 (round 126 F-3; awaiting_user)',
    'WAVEFORM-ZOOM-DISCOVERABILITY': 'merged into DUX-R-2 (round 126 F-7; awaiting_user)',
}
for fid, status in updates.items():
    f = finding(fid)
    if f is not None:
        f['status'] = status
if finding('ALTGR-SHORTCUT-GUARD') is None:
    of.append({'id': 'ALTGR-SHORTCUT-GUARD', 'severity': 'info', 'status': 'signal (not scheduled; no CZABA contract; C round 126 F-5)',
               'title': 'Ctrl-letter shortcuts match event.code and do not exclude altKey, so a Windows AltGr character (Ctrl+Alt) with timeline focus splits (E) or pastes (V); Undo restores it in one step; text fields are unaffected',
               'proposal': 'low-cost guard: ignore Ctrl+Alt when event.key is not an ASCII letter (C notesForB); needs a B task with tests if ever scheduled',
               'evidence': 'c-round-126/out/d3b/d3b-altgr2-2026-10-24T0435.json, d3b-altgr-2026-10-24T0458.json'})
ph1 = finding('ARCH-CHECKPOINT-PHASE1-BOUNDARY')
if ph1 is not None and 'round 127 planning' not in ph1.get('status', ''):
    ph1['status'] = ph1['status'] + ' | round 127 planning: b-round-124-checkpoint-request.md (V-0 Q1 + restated Q2-Q4) still unanswered; V-0.1 uses the recorded fallback (D-29z92); non-blocking, not re-requested'

for r in b['rounds']:
    if r.get('round') == 126:
        r['status'] = 'completed'
        r['result'] = ('C PASS browserVerified=true realVerified=true allRowsRan=true reviewComplete=true; D3/D4/D5 done, 0 spilled; D3-A friction (panel 120 fallback) -> DUX-R-3; '
                       'DUX-B-2/3/4 Low -> deferred_low_polish; DUX-R-3..9 awaiting_user; A no-op OK; SOURCE-SCOPE start/end OK (608187f, 937); G126-3 OK (fake-Bearer 403 blocked: backend unavailable in cloud); gate 126 skipped (no real changes)')
if not any(r.get('round') == 127 for r in b['rounds']):
    b['rounds'].append({'round': 127, 'task': 'current-task.md', 'decision': 'D-29z92', 'status': 'dispatched', 'items': ['VISUAL-A-OBSIDIAN / V-0.1 Export strings'],
                        'note': 'V-0 stage 1: new app/lib/arrangement/strings.ts (studioExportStrings) + English copy for the Export feature (dialog, progress, cancel, WAV worker, overload warning, export status messages); 6 granted source files (two narrow), 18 granted test files (literal -> module reference only), new strings.test.ts and doc 104; baseline 608187f; frozen b-round-126-r127-tree-sha256.txt (913)'})

b['current_task'] = ('current-task.md (round 127: D-29z92 - VISUAL-A V-0 stage 1, Export strings to English via the new app/lib/arrangement/strings.ts; A owns 6 source files (graph.client.ts and ArrangementContext.tsx narrow), '
                     '18 test files (literal -> module reference only), new strings.test.ts and doc 104; C verifies the Export dialog in every reachable state at both viewports; baseline clean 608187f; frozen b-round-126-r127-tree-sha256.txt (913))')
b['baseline_tree_at_round127'] = {
    'head': '608187fdf279d9b579c279f3c536b27be74c0eea',
    'working_tree': 'clean (git status --porcelain empty at B round 127 planning 2026-10-24 ~05:10Z); gate 126 skipped (no real changes); gate 122 published 608187f',
    'frozen_list': 'tmp/studio-real-loop/b-round-126-r127-tree-sha256.txt', 'entries': 913,
    'excluded': GRANTED_SOURCE + ['app/lib/arrangement/__tests__/' + t for t in GRANTED_TESTS],
    'new_files_granted': ['app/lib/arrangement/strings.ts', 'app/lib/arrangement/__tests__/strings.test.ts', 'docs/implementation/2026/quarter-IV/104-studio-v0-export-strings.md'],
}
b['updated'] = TODAY + ' (B round 126 -> 127 planning, D-29z92)'

with open(PATH, 'w', encoding='utf-8') as fh:
    json.dump(b, fh, ensure_ascii=False, indent=1)
    fh.write('\n')
print('new lows', new_lows, 'deferred total', len(dlp), 'recs', [r['id'] for r in recs])
