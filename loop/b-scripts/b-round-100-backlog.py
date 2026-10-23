import json
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b=json.load(open(P))
of={x['id']:x for x in b['open_findings'] if isinstance(x,dict) and 'id' in x}
def setf(i,**kw):
    of[i].update(kw)
def addpt(i,pt):
    if i in of: of[i]['data_points']=of[i].get('data_points',[])+[pt]
setf('B-R98-H1-PREVIEW-TOGGLE-HOLD', status='closed - C round 100 PASS browserVerified=true (HOLD-TOGGLE both viewports: 4 keydowns F/T/T/T -> 1 click, one label change, RMS 0.173 at 1.2 s; FRESH-TOGGLE 307/334 ms gaps; WAVE-REG; HOLD-PLUS-REG; HOLD-ROW-REG; AN-REVIEW mutations a/b/c re-run by C); gate 100 published 17d944d', closed_evidence='c-round-100.md, c-round-100.json, gates/gate-round-100.json')
setf('GATE99-S1-DOC087-STATUS', status='closed - C round 100 SOURCE-UNCHANGED (doc 087 l.4 hunk) + gate 100 published 17d944d', closed_evidence='c-round-100.md; gates/gate-round-100.json')
for i in ('GATE89-S4-FOOTER-MX8-COUPLING','GATE89-S6-PROGRESS-VALUETEXT','GATE97-S4-REPEAT-EQ-TRUE-NIT'):
    setf(i, status='dispatched round 101 (D-29z66)', to='A round 101')
addpt('GATE89-S4-FOOTER-MX8-COUPLING','B probe 2026-10-23 b-round-100-probe/probe-strip-result.json: gap below footer 16 px at 1280x720 max scroll (61) and 16 px at 1440x900 with no overflow (every open); runtime pb-0 on ModalBody -> gap 0 both viewports, computed padding-bottom 0px. Fix pb-0 at the call site (Modal.tsx protected); -mx-8/px-8 coupling accepted while Modal.tsx frozen (recorded signal, not a bug)')
setf('A-R88-REVIEW-EDGES', status='open - #4 (16 px strip) + py-4 nit dispatched round 101 with GATE89-S4; #1 (guard measures radio not label card), #2 (mouse focus scroll), #3 (footer growth after focus) stay open for a later focus-scroll round')
addpt('ARCH-R97-EXPORT-FOOTER-KEYBOARD','gate 100 reviewer Signal 3 (keep): held-Enter guard inline at 6 places in 4 files (ArrangementLibraryPreview l.293/l.312, ArrangementTransport l.249, ArrangementExportDialog l.541, ArrangementLibrary l.242, StudioWorkspace l.1961); proposal after the root checkpoint: preventRepeatedEnterClick(event) in app/lib/arrangement for the 4 native <button> sites only; HT1-3, HA6, TH4 unchanged green; C reruns HOLD-* and EXPORT-REG. Round 101 GATE97-S4 makes the 4 button guards textually identical. Addendum (m) to b-round-91-checkpoint-request.md')
if 'ARCH-R93-TEST-HARNESS' in of:
    addpt('ARCH-R93-TEST-HARNESS','round 100 appended HT1-HT3 to library-preview.test.tsx (no new copy); round 101 appends to export-dialog-footer.test.tsx (no new copy)')
new=[
 {'id':'GATE100-S1-SPACE-ON-FOCUSED-TOGGLE','severity':'low','status':'B-observed 2026-10-23 (b-round-100-probe/probe-space-hold-result.json, probe-space-result.json): Space press or hold on the focused ▶ მოუსმინე -> 0 clicks on the toggle, label unchanged, transport Play -> Pause once (global Space = transport, D-29z64 R2); C to confirm in round 101 SPACE-TOGGLE-OBS; not closed until C confirms','to':'C round 101','title':'held Space on the focused preview toggle unobserved (gate 100 review Low #1)','evidence':'gates/round-100/review.md #1; B probe'},
 {'id':'GATE100-S4-DOC088-STATUS','severity':'low','status':'dispatched round 101 (doc 088 l.4)','to':'A round 101','title':'doc 088 l.4 still says awaiting C although C round 100 passed and gate 100 published 17d944d','evidence':'gates/round-100/review.md #4'},
 {'id':'GATE100-S3-JSDOM-NO-KEYDOWN-CLICK','severity':'info','status':'recorded - reviewer: HT1 keyDown return value is the right jsdom proxy; Chromium HOLD-TOGGLE covers real ordering','to':'-','title':'jsdom cannot see the keydown->click step','evidence':'gates/round-100/review.md #3'},
 {'id':'C-R100-N2-PREVIEW-START-FROM-ZERO','severity':'info','status':'recorded - pre-existing, not a regression: ▶ მოუსმინე starts the preview from 0, waveform click/Enter/Space start from the cursor (A reviewer + C N2). Not a finding; candidate UX question for a later SRW-12 polish decision, not scheduled','to':'-','title':'preview toggle starts from 0 while waveform starts from cursor','evidence':'c-round-100.md N2; a-round-100.md reviewer note'},
 {'id':'C-R100-N3-UNTESTED','severity':'info','status':'recorded - Space on focused toggle (-> GATE100-S1, B probe), non-Chromium (GATE97-S2), repeat=false auto-repeat environments (doc 085 boundary)','to':'-','title':'C round 100 untested areas','evidence':'c-round-100.md N3'},
]
for n in new:
    if n['id'] not in of: b['open_findings'].append(n)
s=[x for x in b['items'] if x['id']=='SRW-12'][0]
s['open_bug']='none from C. B-R98-H1-PREVIEW-TOGGLE-HOLD closed by C round 100 (published 17d944d). Status returns to verified_except_manual: Tech Lead R12-L4 (real HTML5 drag), R17-T, R34-T remain. GATE100-S1 (Space on focused toggle) is an observation row in round 101, not a bug.'
s.setdefault('evidence',{}).setdefault('later_rounds',[]).append('c-round-100.md HOLD-TOGGLE both viewports, FRESH-TOGGLE, WAVE-REG (held Enter toggles the preview once; preview audible RMS 0.173)')
for r in b['rounds']:
    if r.get('round')==100:
        r['status']='c_pass_published'
        r['result']='C PASS browserVerified=true realVerified=true (HOLD-TOGGLE both viewports 1 click / one label change / RMS 0.173; FRESH-TOGGLE; WAVE-REG; HOLD-PLUS-REG; HOLD-ROW-REG; EXPORT-REG real WAV 101.352 s; PX-NET; REG-HYD; G100-3 (fake-Bearer BLOCKED backend); AN-REVIEW; T100-TARGETED 4/30; SOURCE-UNCHANGED); 0 bugs; gate 100 published 17d944d (reviewer 9/10)'
b['rounds'].append({'round':101,'task':'current-task.md','decision':'D-29z66','status':'dispatched','items':['GATE89-S4-FOOTER-MX8-COUPLING','A-R88-REVIEW-EDGES#4','GATE89-S6-PROGRESS-VALUETEXT','GATE97-S4-REPEAT-EQ-TRUE-NIT','GATE100-S4-DOC088-STATUS','GATE100-S1-SPACE-ON-FOCUSED-TOGGLE (C observation only)'],
 'note':'Export dialog footer Lows: ModalBody pb-0 + footer py-4 (16 px strip, B-measured both viewports), aria-valuetext = visible progress label, Close guard event.repeat; doc 088 l.4; new doc 089. baseline HEAD 17d944d clean; frozen b-round-100-r101-tree-sha256.txt 532/532; snapshots b-round-100-r101-snapshots; expected 3 M + 1 ??; export-dialog-footer.test.tsx append-only after l.442 (FS1, FV1, FV2). Regression round not due (2026-10-21 -> 2026-10-23 = 2 days); next B planning on/after 2026-10-24 is the regression round.',
 'owned':['app/components/arrangement/ArrangementExportDialog.tsx (l.267 ModalBody className, l.487 footer className, <progress> l.508-514, l.542 Close guard condition)','app/lib/arrangement/__tests__/export-dialog-footer.test.tsx (append-only after l.442)','docs/implementation/2026/quarter-IV/088-studio-preview-toggle-hold-enter.md (l.4)','docs/implementation/2026/quarter-IV/089-studio-export-footer-strip-valuetext.md (new)'],
 'c_ids':['STRIP-1280','STRIP-1440','VIS-RENDER-REG','VALUETEXT','FOCUS-REG','CLOSE-HOLD-REG','SPACE-TOGGLE-OBS','EXPORT-REG','PX-NET','REG-HYD','G101-3','AN-REVIEW','T101-TARGETED','SOURCE-UNCHANGED']})
b['baseline_tree_at_round101']={'head':'17d944da5255248d87a4c35aa9169b25b7b3d812','list':'tmp/studio-real-loop/b-round-100-r101-tree-sha256.txt','count':532,'excluded':['app/components/arrangement/ArrangementExportDialog.tsx','app/lib/arrangement/__tests__/export-dialog-footer.test.tsx','docs/implementation/2026/quarter-IV/088-studio-preview-toggle-hold-enter.md']}
b['current_task']='current-task.md (round 101: D-29z66 - Export dialog footer Lows: GATE89-S4 + A-R88 #4 16 px strip (ModalBody pb-0, footer py-4), GATE89-S6 aria-valuetext, GATE97-S4 event.repeat; GATE100-S4 doc 088 l.4; new doc 089; baseline 17d944d, frozen 532, expected 3 M + 1 ??)'
b['updated']='2026-10-23 (B round 100 -> round 101 planning)'
b['version']=b.get('version',98)+1
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok', b['version'], len(b['open_findings']), len(b['rounds']))
