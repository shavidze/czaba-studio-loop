import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; B=f'{L}/b-round-507'
if os.path.exists(f'{B}/update-backlog-508.done'): sys.exit('already applied')
p=f'{L}/backlog.json'; b=json.load(open(p))
assert b['version']==510, b['version']
b['version']=511; b['updated']='2026-11-14'
WHO='2026-11-14 B round 507 -> 508 planning'; ADD=WHO
SHA=open(f'{B}/sketch-sha.txt').read().split()[0]
def find(lst,i):
    r=[x for x in b[lst] if x.get('id')==i]; assert len(r)==1,(lst,i); return r[0]
d33=("Round 507 result from C evidence only: c-round-507.json taskStatus FAIL, browserVerified/realVerified false. A STOPped (L10) on A-R507-CR-1-N1-2-SWAP-MUTANT (Medium, code-reviewer): in store-button-cleanup-n1.test.tsx N1-2 all four clicks precede count-only asserts, so a Previous/Next handler swap stays green "
     "(A applied M7 on v2: 5/5 green, a-round-507/mutant-swap.log; C re-read the source and confirmed). Product handlers are correct; the gap is test strength and originated in B's mutant matrix (no pure-swap mutant). "
     "C ran only C0 (scope: 2 M + 2 untracked), C11 (anonymous /studio/1 and /account/downloads 'Sign in required', /studio-lab demo 9 clips at 1440/1280, 0 page errors) and C12 (claims, no MISSING); C1-C10 not run, so NONBRAND N1 is NOT verified (V2: browserVerified=false -> its browser half is scheduled again). "
     "Gate 507 skipped (C FAIL): nothing published, baseline stays 3021b30; the store worktree keeps sketch v2 (preserve partial work, no revert). C's remark 'Low is defensible' is data; B does not downgrade: the fix is small and inside round-owned files.")
d34=(f"Round 508 = NONBRAND N1 re-dispatch with a sketch v3 DELTA on top of the applied v2 (b-round-507/sketch-508-delta.patch.txt sha {SHA[:8]}); A must not re-apply v2. Changes only the n1 test and doc 328: "
     "N1-2 asserts after every click that only that control's action ran once and the other five (incl. togglePlayPause, seek) ran 0 times, then the same for Unmute (fixes A-R507-CR-1); new N1-6 pins the 20px volume icon at volume 0 (Unmute) and 0.3 (fixes Low A-R507-CR-2, owned file, cheap); "
     "doc 328 l.4 'C round 508 PASS' (L28), l.44 app.css path -> app/styles/app.css + app/styles/base/utilities.css (fixes Low A-R507-CR-4), N1-2/N1-6 lines and mutant matrix M0-M10 (b-round-507/mutants-508.txt). "
     "AudioPlayer.tsx and DESIGN_SYSTEM.md are byte-identical to v2 (sha 8231a981 / 0f01b243), so the b-round-506/probe/sketch oracles stay valid for C1-C6. "
     "B pre-check on /home/runner/b507-scratch (archive 3021b30 + v2 + delta): tsc rc0, lint 175 warnings, Biome 2 files 1 warning, covering 8 files 87/87 (slowest LT7 802 ms), full 304 files / 4385 tests rc0, build rc0, mutants M0-M10 OK incl. M7 prev/next swap and M8 close/next swap red on N1-2, M9/M10 red on N1-6, restored rc0; "
     "fresh archive + v2 + delta reproduces r508-post-sketch-sha.txt and r508-tree-sha256.txt rc0; in store/ r508-pre-sha (= r507-post) rc0 and git apply --check rc0 at planning. A-R507-CR-3 (ghost press behaviour not in DESIGN_SYSTEM ghost paragraph) -> deferred Low (round limit: three related items).")
d35=("B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD moves from round 508 to round 509 (bug-first): round 508 must finish N1 because the store tree already carries v2 and N1's browser half never ran (V2). The sidebar bug still needs a product-designer target ruling and ROOT-REQ-MOCK-STEMS-AND-FREE-FIXTURE for its browser half. "
     "Retro signal RC-R507-SWAP-MUTANT recorded for RETRO 510 (not a lessons.md edit now): handler-wiring jsdom rows need a pure-swap mutant per pair of same-shaped handlers.")
for i,t in (('D-29z1833',d33),('D-29z1834',d34),('D-29z1835',d35)):
    assert not any(d['id']==i for d in b['decisions_log_b'])
    b['decisions_log_b'].append({'id':i,'date':'2026-11-14','by':WHO,'decision':t})
r=find('rounds',None) if False else [r for r in b['rounds'] if r.get('round')==507]; assert len(r)==1
r[0]['status']='C FAIL (A STOP on A-R507-CR-1-N1-2-SWAP-MUTANT; browserVerified/realVerified false; C0/C11/C12 only); gate 507 skipped, nothing published'
r[0]['result_note']='re-dispatched as round 508 with sketch v3 delta (D-29z1833/D-29z1834)'
b['open_findings'].append({'id':'A-R507-CR-1-N1-2-SWAP-MUTANT','severity':'medium','origin':'B pre-check (mutant matrix lacked a pure-swap mutant); found by A code-reviewer, confirmed by C round 507',
  'status':'scheduled (D-29z1834): round 508 sketch v3 delta (N1-2 per-click asserts; mutants M7/M8 red on B scratch)','title':'store-button-cleanup-n1.test.tsx N1-2 passes when two controls swap handlers (count-only asserts after all clicks)',
  'evidence':'a-round-507.md; a-round-507/mutant-swap.log; c-round-507.json bugs[0]; b-round-507/mutants-508.txt','added':ADD})
b['open_findings'].append({'id':'A-R507-CR-2-N1-4-ICON-STATES','severity':'low','origin':'A review','status':'scheduled (D-29z1834): round 508 N1-6 (owned file, cheap)',
  'title':'N1-4 checks the volume icon size only at volume 0.7; Unmute (0) and low-volume (<0.5) icons unchecked','evidence':'a-round-507.md For B','added':ADD})
b['open_findings'].append({'id':'A-R507-CR-4-DOC328-CSS-PATH','severity':'low','origin':'A review','status':'scheduled (D-29z1834): round 508 doc 328 l.44',
  'title':"doc 328 cites `app.css`; the global button:active rule is in app/styles/app.css:230 and app/styles/base/utilities.css:18",'evidence':'a-round-507.md For B; B grep at 508 planning','added':ADD})
b['deferred_low_polish'].append({'id':'A-R507-CR-3-GHOST-PRESS-DOC','severity':'low','origin':'A review','status':'deferred_low_polish (D-29z1834)',
  'title':"DESIGN_SYSTEM.md ghost paragraph (l.1216 at v2) does not describe ghost's press behaviour (active:scale-95 stacking with the global :active scale 0.98), while the brand paragraph does",
  'evidence':'a-round-507.md For B','repro':'read docs/design/DESIGN_SYSTEM.md IconButton ghost line vs IconButton.tsx ghost classes','added':ADD})
x=find('open_findings','DPG-BUTTON-CLEANUP-2-NONBRAND')
x['status']='in_progress (D-29z1833/D-29z1834): round 507 N1 C FAIL (test-strength STOP, browser rows not run); round 508 = N1 re-dispatch with sketch v3 delta | '+x['status']
x=find('open_findings','B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD')
x['status']='scheduled (D-29z1835): round 509 bug-first (moved from 508; N1 must close first) | '+x['status']
b['retro_candidates'].append({'id':'RC-R507-SWAP-MUTANT','round':507,'note':'A STOP / C FAIL because B mutant matrix had no pure-swap mutant for same-shaped handlers (A-R507-CR-1). Third test-strength sketch gap after RC-R496-SKETCH-TEST-STRENGTH and RC-R499-L58-PLANNING-FAIL. Candidate L52 clause: every handler-wiring row needs a swap mutant per pair; assert after each action. Count at RETRO 510.','added':ADD})
b['current_task']=(f"Round 508: DPG-BUTTON-CLEANUP-2-NONBRAND stage N1 re-dispatch. Store tree already has v2; A applies only b-round-507/sketch-508-delta.patch.txt (sha {SHA[:8]}): n1 test N1-2 per-click asserts + N1-6, doc 328 l.4/44/51/54/56. "
    "C runs C0-C12 at 1440/1280/375 with real preview audio (C9 = mutants M0-M10)")
q=[x for x in b['post_current_stage_queue'] if x.get('id')=='DPG-FIX'][0]
q['status']=('in_progress (D-29z1833..D-29z1835): round 507 N1 C FAIL (test-strength STOP); round 508 = N1 re-dispatch (sketch v3 delta); 509 B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD (bug-first); then NONBRAND N2-N9, PD-R498-404-SECONDARY-ALIGN, stage-2 close-out, rest of P1, DP gate, P2; '
             'REGRESSION first when planned on/after 2026-11-16; RETRO 510 | '+q['status'])
b['rounds'].append({'round':508,'task':'current-task.md','decision':'D-29z1834','type':'DPG-BUTTON-CLEANUP-2-NONBRAND stage N1 re-dispatch (sketch v3 delta: N1-2 per-click asserts, N1-6, doc 328)','status':'dispatched',
  'note':f'baseline HEAD 3021b30 with v2 applied in the worktree; delta b-round-507/sketch-508-delta.patch.txt sha {SHA[:8]}; pre-check b-round-507/precheck-*.log; mutants b-round-507/mutants-508.txt; browser oracles b-round-506/probe/sketch (AudioPlayer unchanged)'})
open(p,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
open(f'{B}/update-backlog-508.done','w').write('ok'); print('ok',b['version'])
