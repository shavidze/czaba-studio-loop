import json
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b=json.load(open(P))
D='2026-10-28'; ADD='2026-10-28 B round 227 -> 228 planning'
assert b['version']==212
b['version']=213; b['updated']=D
b['current_task']=('current-task.md (round 228, D-29z278..D-29z284; SABA-B-8 CALM-1b: key in every transport tooltip + matching aria-keyshortcuts from shortcuts.ts (one source), '
 'B-R225-BACK-TO-START-KEY (Home), C-R227-01 (fit chip/title: no time selection), C-R227-02 (doc 177); baseline d32464e clean; frozen 1070; 12 grants; L23 pre-check 8 files 23 red -> test-only R1 swaps -> 13 files 270 green). Next: CALM-2 unless REGRESSION due (on/after 2026-10-30).')
for r in b['rounds']:
    if r.get('round')==226:
        r['status']='published (with round 227)'; r['result']+=' | published with round 227 in d32464e (gate 227)'
    if r.get('round')==227:
        r['status']='published'
        r['result']=('C PASS (14 rows, browserVerified=true, realVerified=true, 2 Low C-R227-01/02); gate 227 published d32464ea264e94f7b0aa98c5b64934340c275d33 to both remotes (verify 205/205 files, 2973 tests); review 8.5/10 with 6 suggestions GATE227-S1..S6')
b['rounds'].append({'round':228,'task':'current-task.md','decision':'D-29z278..D-29z284','status':'dispatched','type':'SABA-B-8 CALM-1b (stage 2 of 2) + B-R225-BACK-TO-START-KEY + C-R227-01 + C-R227-02',
 'note':'baseline d32464e, clean tree; frozen 1070 (b-round-227-r228-tree-sha256.txt); 12 grants (b-round-227-r228-grants.txt); root 4; L23 pre-check /tmp/b228: 8 files 23 red (title literals + ST8 list) -> after test-only fixes 13 files 270 green (b-round-227/l23-precheck-1b.txt)',
 'next':'C PASS + gate PASS -> CALM-1 done, DUX-R-2 closed; next CALM-2 unless REGRESSION due (on/after 2026-10-30); RETRO at 230','added':ADD})
CL=b['closed_findings_d29z163']
def close(fid, how, rnd=227):
    for lst in (b['open_findings'],):
        for f in list(lst):
            if f.get('id')==fid:
                lst.remove(f); f['status']=how; f['closed_round']=rnd; CL.append(f); return
    raise SystemExit('missing '+fid)
close('GATE226-B1','closed: fixed in round 227 (structure assertions), C round 227 PASS C-UNIT-227, gate 227 verify 205/205 green, published d32464e')
close('C-R226-02',"closed: fixed in round 227 (keys 'Waveform Zoom menu'), C-ROWS-227/C-WZ-227 PASS, published d32464e")
close('C-R226-03',"closed: fixed in round 227 (fit keys overview / ruler), C-FIT-227 PASS, published d32464e; wording refined by C-R227-01 in round 228")
b['open_findings'] += [
 {'id':'C-R227-01','severity':'low','origin':'C round 227','title':"fit chip 'Double-click the ruler (no selection)' is imprecise: with a clip selected and no time selection the ruler double-click still fits (C probe d)",'status':'open - fixed in round 228 (owned shortcuts.ts: (no time selection); fitTitle aligned, L4)','evidence':'c-round-227/out/c227-*.json C-FIT-227 d0/d1','added':ADD},
 {'id':'C-R227-02','severity':'low','origin':'C round 227','title':'doc 177 l.74/l.109 still say SC1-SC3; changed-files list omits track-layout.test.tsx','status':'open - fixed in round 228 (whole doc 177 granted, stage 2 of 2)','evidence':"grep -n 'SC1–SC3' doc 177 -> l.74, l.109",'added':ADD},
 {'id':'A-R227-REVIEW-L3-WZ-VISIBLE-NAME','severity':'info','origin':'A round 227 code-reviewer Low 3','title':"'Waveform Zoom menu' names the accessible name, but the select visibly shows only 1x/2x...; a sighted user hovers to see 'Waveform Zoom'",'status':'info - not verified as a bug by C; CALM-2 copy-pass candidate (B decides at CALM-2 planning)','evidence':'a-round-227.md Code review','added':ADD},
 {'id':'GATE227-S1-ESC-DEFAULTPREVENTED','severity':'info','origin':'root gate 227 review S1','title':'Esc closing the sheet relies on the floating-video branch checking defaultPrevented; a future Escape branch without it would also run','status':'signal - input to ARCH-CHECKPOINT-CALM-DIALOG-KEYMAP (activeDialogRef proposal); not scheduled','evidence':'gates/round-227/review.md S1','added':ADD},
 {'id':'GATE227-S3-TRUNCATE-PIN','severity':'info','origin':'root gate 227 review S3','title':"track-layout case title says 'truncated' but no longer checks the truncate class",'status':'rejected (D-29z283): a class pin is what caused GATE226-B1 (L8/L12); truncation is a browser row (C-SLOT-227 measured it); jsdom does not lay out','evidence':'gates/round-227/review.md S3','added':ADD},
 {'id':'GATE227-S6-FIND-NONOPTIONAL','severity':'info','origin':'root gate 227 review S6','title':'findStudioShortcut returns | undefined for a typed id union; a throwing non-optional version would fail the build on a wrong id','status':'signal, not scheduled (round 228 helpers fall back safely; candidate for the checkpoint)','evidence':'gates/round-227/review.md S6','added':ADD},
]
b['deferred_low_polish'] += [
 {'id':'GATE227-S2-SLASH-CODE-FALLBACK','severity':'low','status':'deferred_low_polish (D-29z283); touches frozen StudioWorkspace.tsx; the code fallback was Saba-approved for non-US layouts (calm-studio-review s2.1) - the fix must keep Georgian working (use code only when key is not printable)','title':"the Shift+Slash code fallback opens the sheet on QWERTZ ('_') and AZERTY ('§') and blocks their default outside text fields",'source':'gates/round-227/review.md S2','repro':'German layout, focus body, press Shift + the key left of right Shift','added':ADD},
 {'id':'GATE227-S5-SHEET-EMPTY-NOT-ANNOUNCED','severity':'low','status':'deferred_low_polish (D-29z283); ArrangementShortcutSheet.tsx not granted in round 228','title':"the sheet 'Nothing matches' text is not announced (no role=status / aria-live)",'source':'gates/round-227/review.md S5','repro':'open ?, type zzzz, screen reader hears nothing','added':ADD},
]
for f in b['deferred_low_polish']:
    if f.get('id')=='C-R226-04':
        f['status']=('deferred_low_polish (D-29z282): CALM-1b needs no StudioWorkspace.tsx change, so the D-29z275 precondition failed; fixed in the polish pass (ArrangementRuler + SW release clause, one clause + one test, with a Live reference check then). '+f['status'])
for f in b['open_findings']:
    if f.get('id')=='B-R225-BACK-TO-START-KEY':
        f['status']='open - fixed in round 228 (backToStartTitle from the shortcut source: Back to start (Home))'
b['architecture_signals'] += [
 {'id':'GATE227-S4-SHEET-RENDER-COST','signal':'gate 227 review S4: findStudioShortcut on every workspace render and the closed ArrangementShortcutSheet re-renders with the workspace (memo candidate)','status':'signal for STUDIO-PERFORMANCE (PERF-HARNESS b-ii re-baseline can measure it); not scheduled','added':ADD},
 {'id':'GATE227-ARCH-ACTIVE-DIALOG-REF','signal':'gate 227 review Architecture note: one activeDialogRef replacing exportOpenRef, shortcutSheetOpenRef and exportKeyEventRef plus a shared dialog focus hook','status':'signal - appended to ARCH-CHECKPOINT-CALM-DIALOG-KEYMAP input (b-round-225-checkpoint-request.md); not scheduled','added':ADD},
]
for q in b['post_current_stage_queue']:
    if q.get('id')=='SABA-B-8-CALM-STUDIO':
        q['status']='in_progress: CALM-1a done (published d32464e, gate 227); CALM-1b = round 228 (D-29z278); CALM-2 next (its L23 pre-check and covering set must include track-layout.test.tsx, D-29z283), RETRO at 230, CALM-3 after RETRO; REGRESSION takes precedence on/after 2026-10-30; then STUDIO-PERFORMANCE b-ii'
        for s in q['stages']:
            if s['id']=='CALM-1a':
                s['status']='done: C round 226 PASS (browserVerified=true) + round 227 fix-up C PASS (browserVerified=true, realVerified=true); gate 227 published d32464e'
            if s['id']=='CALM-1b':
                s['status']='in_progress (round 228 dispatched, D-29z278..D-29z284)'
            if s['id']=='CALM-2':
                s['status']='not_started (note D-29z283: include track-layout.test.tsx in L23 pre-check and covering set; candidates A-R227-REVIEW-L3-WZ-VISIBLE-NAME)'
    if q.get('id')=='STUDIO-PERFORMANCE':
        q['status']='in_progress, paused for SABA-B-8 (CALM-1b 228, CALM-2, RETRO 230, CALM-3); next PERF task b-ii after CALM-3 (D-29z278) | '+q['status']
b['decisions_log_b'] += [
 {'id':'D-29z278','date':D,'text':'Round 227 closed from evidence: C PASS (14 rows, browserVerified=true, realVerified=true, 2 Low) and gate 227 published d32464e (verify 205/205). CALM-1a done; GATE226-B1, C-R226-02, C-R226-03 closed. Round 228 = CALM-1b on baseline d32464e with a clean tree. REGRESSION not due (regression-last 2026-10-27, due on/after 2026-10-30).'},
 {'id':'D-29z279','date':D,'text':"CALM-1b title format: '<label> (<first key>)' read from shortcuts.ts (studioShortcutTitle); aria-keyshortcuts lists every working key (studioShortcutAria). 'Ctrl/Cmd' -> 'Ctrl' in transport titles to match the sheet (its subline says Ctrl means Cmd on Mac); Meta is carried in aria-keyshortcuts. Recorded deviation K3."},
 {'id':'D-29z280','date':D,'text':'aria-keyshortcuts values (WAI-ARIA/MDN syntax; handler accepts ctrlKey||metaKey, SW l.1798): Space, Home, Control+L Meta+L, Control+Z Meta+Z, Control+Shift+Z Meta+Shift+Z Control+Y Meta+Y, Control+E Meta+E, Delete Backspace. Z/X keep their hard-coded values; NS5 proves parity with the zoom-range row. Fit has none. Meta variants: Tech Lead manual check on a Mac.'},
 {'id':'D-29z281','date':D,'text':"C-R227-01 fixed in round 228: fit keys ['Double-click the overview', 'Double-click the ruler (no time selection)'] and fitTitle 'Fit — the entire project is visible (double-click the overview, or the ruler with no time selection)' (L4). C-R227-02 fixed by granting the whole doc 177 (L34), whose l.4 becomes Completed (C round 228 PASS)."},
 {'id':'D-29z282','date':D,'text':'C-R226-04 stays in deferred_low_polish: the D-29z275 precondition (StudioWorkspace.tsx granted anyway) fails in round 228; a focus-behaviour change in two frozen files would add a second feature stage. No Live reference search was made because the precondition failed. It is fixed in the polish pass.'},
 {'id':'D-29z283','date':D,'text':"Rulings: A round-227 D1 (row.children length 2 in the track-layout case) kept - MU-4 value, no class token; CALM-2/CALM-3 must include track-layout.test.tsx in L23 and covering set. Gate 227 review: S1, S4, S6 and the Architecture note -> signals (checkpoint/perf inputs); S2 and S5 -> deferred_low_polish (Lows in files not granted); S3 rejected (a class pin caused GATE226-B1; truncation is browser row C-SLOT)."},
 {'id':'D-29z284','date':D,'text':'Round 228 scope: 12 grants (shortcuts.ts, strings.ts, ArrangementTransport.tsx, shortcuts/strings/navigation-strings-ui tests with new SC5/ST-K1/NS5, five tests under one swap ruling R1, doc 177). StudioWorkspace.tsx, ArrangementShortcutSheet.tsx and track-layout.test.tsx frozen. B L23 pre-check: 8 files 23 red -> test-only R1 swaps -> 13 files 270 green.'},
]
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok', b['version'], len(b['open_findings']), len(b['deferred_low_polish']))
