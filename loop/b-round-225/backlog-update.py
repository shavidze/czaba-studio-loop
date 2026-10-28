import json
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b=json.load(open(P))
D='2026-10-28'; ADD='2026-10-28 B round 225 -> 226 planning'
b['version']=211; b['updated']=D
b['current_task']=('current-task.md (round 226, D-29z266..D-29z271; SABA-B-8 CALM-1a: ? shortcut sheet (new ArrangementShortcutSheet.tsx on ui/Modal, local focus trap), one source app/lib/arrangement/shortcuts.ts, footer button Shortcuts ?, permanent arrangement-shortcut-hint line removed, lane-move hint in the contextual row; baseline 80fbb3b; frozen 1073; 4 grants + 5 new files; B L23 pre-check 2 red (WSU1, UC12) granted). Next: CALM-1b (round 227: keys in titles + aria-keyshortcuts from the constant) unless REGRESSION due.')
# round 225 close
for r in b['rounds']:
    if r.get('round')==225:
        r['status']='c_pass_published'
        r['result']='C PASS (10 rows, browserVerified=true, realVerified=true, 0 bugs); gate 225 published 80fbb3b on both remotes (D-29z266)'
b['rounds'].append({'round':226,'task':'current-task.md','decision':'D-29z266..D-29z271','status':'dispatched','type':'SABA-B-8 CALM-1a (Studio UI: shortcut sheet, ? key, footer button, permanent shortcut line removed, contextual row)','note':'baseline 80fbb3b; frozen 1073 (b-round-225-r226-tree-sha256.txt); grants 4 (b-round-225-r226-grants.txt); new 5 (b-round-225-r226-new-files.txt); root 4; before-geometry b-round-225/probe-before.json + bbox-before.json (deterministic 0 px); L23 pre-check b-round-225/l23-precheck-1a.txt','next':'PASS + before 2026-10-30 -> round 227 CALM-1b; on/after 2026-10-30 -> REGRESSION then CALM-1b','added':ADD})
def walk(o):
    if isinstance(o,dict):
        yield o
        for v in o.values(): yield from walk(v)
    elif isinstance(o,list):
        for v in o: yield from walk(v)
for o in walk(b['post_current_stage_queue']):
    if o.get('id')=='PERF-HARNESS-SHARED-LIB-b-i':
        o['status']='done (C round 224 PASS bbaea50 + fix-up C round 225 PASS 80fbb3b, browserVerified=true, realVerified=true; D-29z266) | '+o['status']
# close findings
close={'C-R224-01':'closed (C round 225 PASS BUDGETS-DIFF-225 + EQUIV-225 + REPLAY-225: 16 drag commits-per-move rows wallclock, contaminated report 0 failures; published 80fbb3b; D-29z266)',
 'A-R224-REVIEW-TENTHS-NAN':'closed (C round 225 PASS CODE-225 + UNIT-225 G-1..G-6 killed + REPLAY-225 (c) exactly 1 non-finite failure; published 80fbb3b; D-29z266)',
 'C-R224-02':'closed (C round 225 PASS UNIT-225: CM-3 spread > 2 now killed by DC-MIB-EDGE; published 80fbb3b; D-29z266)'}
keep=[]
for f in b['open_findings']:
    if f.get('id') in close:
        f['status']=close[f['id']]; f['closed_round']=225
        b['closed_findings_d29z163'].append(f)
    else:
        keep.append(f)
b['open_findings']=keep
for f in b['open_findings']:
    if f.get('id')=='C-R223-OBS-01':
        f['status']+=' | recurred again C round 225 (first 1440 cold load: useState null + hydration; two fresh contexts clean; smoke 0 page errors)'
    if f.get('id')=='R224-WINDOW-BOUNDARY-WATCH':
        f['note_r225']='C round 225 clean isolated run: drag release-commits [1,1,1] every row, move-components-per-move constant (range/trim 101.283, move 101.383, fade 96.367, 1x and 6x); fade.playing commits-per-move 60x3 (C) vs 59x3 (A) supports D-29z259 (C-R225-OBS-01)'
b['open_findings'] += [
 {'id':'C-R225-OBS-01','severity':'info','origin':'C round 225','title':'windowed drag commit count differs between two clean isolated runs (C 60x3, A 59x3) while render work is constant','status':'info - supports D-29z259 wallclock ruling; attached to R224-WINDOW-BOUNDARY-WATCH','evidence':'c-round-225/det-remaining.log','added':ADD},
 {'id':'C-R225-OBS-02','severity':'info','origin':'C round 225','title':'DC-KINDS pins only the 16 RECLASS rows and the 24 fader rows; an unrelated kind flip (interact.harness.hook-live) survives the unit test (equiv-check-b2 catches it)','status':'info - outside the round-225 contract; candidate scope for PERF-HARNESS-SHARED-LIB-b-ii (pin every kind), not scheduled','evidence':'c-round-225/mutants.log K-3','added':ADD},
 {'id':'B-R225-BACK-TO-START-KEY','severity':'low','origin':'B round 225 -> 226 planning (source read)','title':"transport 'Back to start' title says '(0)' but no 0/Digit0 binding exists; the key is Home (StudioWorkspace l.1993); pinned by navigation-strings-ui NS1 and strings.test ST10",'status':'open - fixed in CALM-1b (round 227; the round owns the title and it costs one literal + 2 test lines, so not deferred)','evidence':'strings.ts l.216; b-round-225/l23-precheck-1b.txt','added':ADD},
 {'id':'R226-PERF-LAYOUT-WATCH','severity':'info','origin':'B round 225 -> 226 planning','title':'CALM-1a makes the timeline scroller 20 px taller; PERF-1b deterministic counts that depend on visible rows may shift','status':'watch - perf not run in round 226; PERF-HARNESS-SHARED-LIB-b-ii re-baselines; a shift there is expected, not a regression, if attributed to the 20 px','evidence':'b-round-225/probe-before.json','added':ADD},
]
for f in b['deferred_low_polish']:
    if f.get('id')=='R77-BUTTON-SHORTCUT-SUPERSET':
        f['note_d29z268']='B verified at CALM-1 planning: this Low is about the prev/next marker buttons announcing Control+ArrowLeft/Right while the key also stops at clip edges; CALM-1 (titles for Undo/Redo/Home etc.) does not close it. Stays in deferred_low_polish (polish pass); calm-studio-review.md section 5 mislabelled it.'
for q in b['post_current_stage_queue']:
    if q.get('id')=='SABA-B-8-CALM-STUDIO':
        q['status']='in_progress: CALM-1a = round 226 dispatched (D-29z267); CALM-1b = 227, CALM-2 = 228, CALM-3 = 229 (REGRESSION takes precedence on/after 2026-10-30; RETRO at round 230); then STUDIO-PERFORMANCE resumes with PERF-HARNESS-SHARED-LIB-b-ii'
        q['closes'][1]='R77-BUTTON-SHORTCUT-SUPERSET: NOT closed by CALM-1 (B verified, D-29z268; different issue - marker buttons announce a superset key)'
        q['why_we_missed_it']='current-task.md round 226 section 1.1; lesson L39 (lessons.md, D-29z270)'
        q['stages']=[
         {'id':'CALM-1a','what':'? shortcut sheet (ArrangementShortcutSheet.tsx on ui/Modal, local focus trap, search), one source shortcuts.ts (43 rows grounded in source), footer button Shortcuts ?, remove arrangement-shortcut-hint line (footer 69 -> 49 px, scroller +20 px), lane-move hint in the contextual row','status':'dispatched round 226 (D-29z267)'},
         {'id':'CALM-1b','what':'keys in every button title (Undo/Redo/Back to start (Home)/Play/Split/Delete/Loop/Z/X/...) + matching aria-keyshortcuts, both derived from shortcuts.ts (title format Ctrl/Cmd+...), sync test over every element with aria-keyshortcuts; fixes B-R225-BACK-TO-START-KEY; grants per b-round-225/l23-precheck-1b.txt (grid-snap-loop-drop, markers-ui, navigation-strings-ui, self-disabling-focus, status-announcement-ui, strings.test, waveform-zoom)','status':'not_started (round 227 planned)'},
         {'id':'CALM-2','what':'copy moves (BPM, Loop, caption note, Overview label, dock empty monitor, detail empty one line, library notice one line + dismiss, first-run status incl. drag/Enter/?); DUX-R-4(a) empty-lane hint only on the active empty lane and only before the first clip','status':'not_started'},
         {'id':'CALM-3','what':'Overview empty-state hairline + full view with first clip (bbox unchanged) + Ctrl+Alt+O toggle remembered and listed in the sheet','status':'not_started'}]
    if q.get('id')=='STUDIO-PERFORMANCE':
        q['status']='in_progress, paused for SABA-B-8 (rounds 226-229): PERF-HARNESS-SHARED-LIB-b-i done (C round 225 PASS, 80fbb3b); next PERF task b-ii after CALM-3 (D-29z262, D-29z267) | '+q['status']
b['architecture_checkpoint_requests'].append({'id':'ARCH-CHECKPOINT-CALM-DIALOG-KEYMAP','request':'b-round-225-checkpoint-request.md','question':'useDialogFocus for ExportDialog/LeadMagnetPopup/ArrangementShortcutSheet (3rd local focus-trap implementation; shared-modal-no-focus-management); Studio keymap module driven by shortcuts.ts vs keep + CALM-1b sync test; ArrangementFooter component before CALM-2','blocking':False,'status':'requested from root (D-29z269)','added':ADD})
b['decisions_log_b'] += [
 {'id':'D-29z266','date':D,'text':'Round 225 closed from C evidence: C PASS (10 rows, browserVerified=true, realVerified=true, 0 bugs), gate 225 published 80fbb3b. PERF-HARNESS-SHARED-LIB-b-i done. Closed: C-R224-01, A-R224-REVIEW-TENTHS-NAN, C-R224-02 (moved to closed_findings_d29z163). Recorded info C-R225-OBS-01/02, C-R223-OBS-01 recurrence, R224-WINDOW-BOUNDARY-WATCH note. PERF-REPORT-TEST-INCLUDE stays open (root-dependent).'},
 {'id':'D-29z267','date':D,'text':'SABA-B-8 CALM-1 split into CALM-1a (round 226: sheet, ?, footer button, line removal, contextual row) and CALM-1b (round 227: keys in titles + aria-keyshortcuts from the same constant). Reason: one feature stage per round; the title change reddens 18 tests in 7 more files (b-round-225/l23-precheck-1b.txt) while 1a reddens only WSU1/UC12. Full scope preserved. CALM-2 = 228, CALM-3 = 229, RETRO 230; REGRESSION precedence on/after 2026-10-30.'},
 {'id':'D-29z268','date':D,'text':"R77-BUTTON-SHORTCUT-SUPERSET is not closed by CALM-1 (different issue; stays deferred). New Low B-R225-BACK-TO-START-KEY: 'Back to start (0)' title names a non-existent key (binding is Home); fixed in CALM-1b."},
 {'id':'D-29z269','date':D,'text':'Shortcut sheet uses ui/Modal (frozen) with a local focus trap copied from ArrangementExportDialog; no focus:outline-none container (SFR2), initial focus in the search field. Third local dialog-focus implementation -> bounded non-blocking frontend-architect checkpoint request b-round-225-checkpoint-request.md (useDialogFocus, keymap module, footer component).'},
 {'id':'D-29z270','date':D,'text':"SABA-B-8 'Why we missed it' written in round-226 task section 1.1; lesson L39 (persistent screen text is a budgeted row) added to lessons.md (55 lines)."},
 {'id':'D-29z271','date':D,'text':"CALM-1a microcopy/contract rulings: subline 'Ctrl means ⌘ on Mac · Alt means ⌥ · Esc closes.' (review's 'Press ? or Esc' would be false with focus in search); aria-keyshortcuts for ? = 'Shift+/' (physical-key inference, no spec example found); PageUp/PageDown row = 'bigger step' (native 10 % of range, B probe 0 -> -6 dB on the 60 dB video fader), not '-6 dB'; number fields: ? does not open the sheet and is not prevented (not 'typed'). Reference: Live 12 manual ch.42 (42.1 Info View Shift?, Overview Ctrl+Alt+O, Esc closes dialog; 42.5; 42.16; 42.20), 2.2.2 Info View (? key, hover name/function), 3.2 Status Bar, fetched 2026-10-28."},
]
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok', b['version'], len(b['open_findings']), len(b['deferred_low_polish']), len(b['closed_findings_d29z163']))
