import json
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b=json.load(open(P))
of={x['id']:x for x in b['open_findings'] if isinstance(x,dict) and 'id' in x}
def setf(i,**kw):
    of[i].update(kw)
setf('B-R98-HELD-ENTER-MULTI-ADD', status='closed - C round 99 PASS (HOLD-ROW, HOLD-BODY, HOLD-PLUS both viewports 0 -> 1; FRESH-ADD +2/+2/+1; HELD-ARROW-REG; HA1-HA8 fail-before HA1/HA3/HA5/HA8, mutations a,b,c,g re-run by C); gate 99 published e2412db', closed_evidence='c-round-99.md, c-round-99.json, gates/gate-round-99.json')
setf('GATE98-S5-DOC086-STATUS', status='closed - C round 99 SOURCE-UNCHANGED (doc 086 l.4 hunk) + gate 99 published e2412db', closed_evidence='c-round-99.md; gates/gate-round-99.json')
setf('B-R98-H1-PREVIEW-TOGGLE-HOLD', severity='low', status='confirmed by B browser probe (2026-10-23) - dispatched round 100 (D-29z65)', to='A round 100', item='SRW-12',
     evidence='b-round-99-probe/probe-toggle-result.json: held3 = 3 keydowns (repeat false/true/true) on the focused toggle -> 3 clicks, label ▶ მოუსმინე -> ■ შეჩერება -> ▶ მოუსმინე -> ■ შეჩერება; fresh1 = 1 click; gate 99 review Low #2 (fix once reproduced)')
setf('GATE97-S2-CHROMIUM-ONLY-HOLD-ENTER', data_points=of['GATE97-S2-CHROMIUM-ONLY-HOLD-ENTER'].get('data_points',[])+['gate 99 review: Firefox keypress suppression after a cancelled keydown is reasoned from the spec, not tested; doc 087 records it'])
setf('ARCH-R97-EXPORT-FOOTER-KEYBOARD', data_points=of['ARCH-R97-EXPORT-FOOTER-KEYBOARD'].get('data_points',[])+['gate 99 reviewer Signal 3 (keep): repeat-Enter guard at 5 sites after round 99 (3 inline button guards ArrangementTransport l.250, ArrangementLibraryPreview l.308, ArrangementExportDialog l.542; !event.repeat in StudioWorkspace l.1967, ArrangementLibrary l.245); round 100 adds a 6th (preview toggle). Proposal: one bounded shared-helper task in app/lib/arrangement with one unit test, value low, risk low. Not scheduled; addendum (l) to b-round-91-checkpoint-request.md; request the root checkpoint at the SRW-12 held-Enter family boundary (after round 100) or after the Export Lows'])
if 'ARCH-R93-TEST-HARNESS' in of:
    setf('ARCH-R93-TEST-HARNESS', data_points=of['ARCH-R93-TEST-HARNESS'].get('data_points',[])+['A round 99 code-reviewer: held-enter-add.test.tsx copies the fake harness (~60th copy, rAF behaviour differs between files); proposal: shared __tests__/harness module task. Round 100 appends to library-preview.test.tsx instead of a new copy'])
new=[
 {'id':'GATE99-S1-DOC087-STATUS','severity':'low','status':'dispatched round 100 (doc 087 l.4)','to':'A round 100','title':'doc 087 l.4 still says awaiting C although C round 99 passed and gate 99 published e2412db','evidence':'gates/round-99/review.md finding 1; doc 087 l.4 at e2412db'},
 {'id':'GATE99-S3-INLINE-ARROW-KEYDOWN','severity':'info','status':'recorded - keep (reviewer: trivial cost, existing pattern); part of ARCH-R97-EXPORT-FOOTER-KEYBOARD signal','to':'-','title':'inline onKeyDown arrow on + დამატება recreated per render','evidence':'gates/round-99/review.md finding 3'},
 {'id':'C-R99-N1-CONCURRENT-ROUTE-LOAD','severity':'info','status':'recorded - C/B method note: do not run route-loading G rows concurrently with held-key measurements (Vite dep re-optimization reloads clients); written into round 100 setup','to':'C','title':'1440 HOLD-BODY first attempt invalid: page context destroyed during setup','evidence':'c-round-99.json notes N1'},
 {'id':'C-R99-N2-N5-INFO','severity':'info','status':'recorded - N2 WAV full-scale samples = DEMO-SFX-FULL-SCALE pattern; N3 row stops propagation by design; N4 root-pre-push-review/publication-checkpoint stale (round 3), no remaining findings; N5 superseded by B probe (B-R98-H1 confirmed)','to':'-','title':'C round 99 notes N2-N5','evidence':'c-round-99.json notes'},
]
for n in new:
    if n['id'] not in of: b['open_findings'].append(n)
# SRW-12 item
s=[x for x in b['items'] if x['id']=='SRW-12'][0]
s['open_bug']='B-R98-H1-PREVIEW-TOGGLE-HOLD (Low, round 100): held Enter on ▶ მოუსმინე toggles the preview once per auto-repeat (B Chromium probe). B-R98-HELD-ENTER-MULTI-ADD closed by C round 99. When round 100 closes with C PASS, feature-status returns to მოწმდება (Tech Lead R12-L4/R17-T/R34-T remain), the status before round 99.'
s.setdefault('evidence',{}).setdefault('later_rounds',[]).append('c-round-99.md HOLD-ROW/HOLD-BODY/HOLD-PLUS both viewports, FRESH-ADD, HELD-ARROW-REG (held Enter adds one clip)')
# rounds
for r in b['rounds']:
    if r.get('round')==99:
        r['status']='c_pass_published'
        r['result']='C PASS browserVerified=true realVerified=true (HOLD-ROW, HOLD-BODY, HOLD-PLUS both viewports 0 -> 1; FRESH-ADD; HELD-ARROW-REG; SPACE-REG; CLOSE-HOLD-REG; EXPORT-REG real WAV 101.352 s; PX-NET; REG-HYD; G99-3 (fake-Bearer BLOCKED backend); AN-REVIEW; T99-TARGETED 55/969; SOURCE-UNCHANGED); 0 bugs; gate 99 published e2412db (reviewer 9/10)'
b['rounds'].append({'round':100,'task':'current-task.md','decision':'D-29z65','status':'dispatched','items':['B-R98-H1-PREVIEW-TOGGLE-HOLD','GATE99-S1-DOC087-STATUS'],
 'note':'held Enter on the preview toggle toggles once (last held-Enter site on the SRW-12 library panel). baseline HEAD e2412db clean; frozen b-round-99-r100-tree-sha256.txt 531/531; snapshots b-round-99-r100-snapshots; expected 3 M + 1 ??; library-preview.test.tsx granted append-only (no new harness copy); ArrangementLibrary/StudioWorkspace/ArrangementContext/ArrangementExportDialog/ArrangementTransport frozen. Regression round not due (2026-10-21 -> 2026-10-23 = 2 days); next B planning on/after 2026-10-24 is the regression round.',
 'owned':['app/components/arrangement/ArrangementLibraryPreview.tsx (▶ მოუსმინე <button> l.281-303 only: onKeyDown Enter && repeat -> preventDefault)','app/lib/arrangement/__tests__/library-preview.test.tsx (append-only: HT1-HT3 after l.285)','docs/implementation/2026/quarter-IV/087-studio-held-enter-single-add.md (l.4)','docs/implementation/2026/quarter-IV/088-studio-preview-toggle-hold-enter.md (new)'],
 'c_ids':['HOLD-TOGGLE','FRESH-TOGGLE','WAVE-REG','HOLD-PLUS-REG','HOLD-ROW-REG','EXPORT-REG','PX-NET','REG-HYD','G100-3','AN-REVIEW','T100-TARGETED','SOURCE-UNCHANGED']})
b['baseline_tree_at_round100']={'head':'e2412db337e9015def8dc6855358437b900ff51e','list':'tmp/studio-real-loop/b-round-99-r100-tree-sha256.txt','count':531,'excluded':['app/components/arrangement/ArrangementLibraryPreview.tsx','app/lib/arrangement/__tests__/library-preview.test.tsx','docs/implementation/2026/quarter-IV/087-studio-held-enter-single-add.md']}
b['current_task']='current-task.md (round 100: D-29z65 - B-R98-H1-PREVIEW-TOGGLE-HOLD: held Enter on ▶ მოუსმინე toggles the preview once (ArrangementLibraryPreview.tsx l.281-303, onKeyDown Enter && repeat -> preventDefault); HT1-HT3 appended to library-preview.test.tsx; GATE99-S1 doc 087 l.4; new doc 088; baseline e2412db, frozen 531, expected 3 M + 1 ??)'
b['updated']='2026-10-23 (B round 99 -> round 100 planning)'
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok', len(b['open_findings']), len(b['rounds']))
