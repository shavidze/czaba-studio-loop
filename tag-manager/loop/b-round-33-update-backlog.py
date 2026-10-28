import json
p='/home/runner/czaba-project/tmp/tag-manager-loop/backlog.json'
b=json.load(open(p,encoding='utf-8'))
if any(i['id']=='TM-B36' for i in b['items']): raise SystemExit('already applied')
F={f['id']:f for f in b['findings']}
I={i['id']:i for i in b['items']}
D={d['id']:d for d in b['decisions']}
C33="C R33 PASS (R33-1..R33-6, realVerified=true; c-round-33.md/.json), published 9f5ac51, review COMMIT OK"
it=I['TM-B35']
it['status']='done'; it['realVerified']=True
it['commit']='9f5ac51fa93096b1940b6609db203d92ff53fdfc'
it['acceptance']=[a.replace('DM-3 equivalent','DM-3 survives (not equivalent: C-R33-01 (k1) kills it; pin (w8) planned in round 34)') for a in it['acceptance']]
it.setdefault('evidence',[]).extend([
 "C R33: red 272 passed / 3 failed on ee15e6c MetadataPanel.tsx with A's tests ((w1) :181 A's map under B's list, (w2) :213 'Failed to read 2 files', (w3) :236 r33note missing); A's tree 275/275 (16 files); each new test alone 1.5-2.2 s; DM-1/2/4/5/6/7 killed with the expected killers, DM-3 survives the 117-test set but C's probe (k1) kills it (C-R33-01); gate verifyCommand exit 0 (50 s), Biome 0/8 same list, renderer 275, main 93/93, E2E 7/7, --retries=0 7/7; real app old ee15e6c vs new: W (old: f.wav loses Tagged, Category empty after the slow/ read lands; new: no slow/ read after Done, editor closes at 1.81 s, f.wav Tagged R32Fast), WJ (old: 'Failed to read 1 files'; new: none), R (old: s.wav R33note empty although ffprobe/music-metadata/raw INFO R33N=R33Val; new: R33Val, editor closes 5.51 s after Done), N (editor closes 9/11 ms on both); sha256 unchanged after setup; ffprobe + music-metadata ICAT=R32Fast/R32Slow, R33N=R33Val; no R33note in f.wav; pageErrors empty; (w4)(w5)(w7) unit-only (stated); docs R33-6 PASS (refs.py)",
 "root gate round 33: published 9f5ac51, review COMMIT OK (gates/round-33/review.md): 1 medium (Done no feedback while waiting), 2 low"])
D['D-40']['status']='verified (C R33 PASS), published 9f5ac51 (TM-B35)'
for fid in ['A-R32-01','RR-R32-04']:
    F[fid]['status']='closed'; F[fid]['closed_by']='TM-B35 (D-40), '+C33
F['B-R32-02']['status']='closed'
F['B-R32-02']['closed_by']='corrected by C-R33-01: B\'s equivalence claim was wrong. DM-3 survives the existing tests but is not equivalent; when the superseding load\'s own read rejects (D-36), the D-40 re-read is what fills that folder and DM-3 drops it. Pin (w8) in round 34 (TM-B36)'
F['B-R32-01']['routed_to']='measured by C R33-5 (new build: W editor closes 1.81 s after Done, R 5.51 s; old build W 6.08 s); open as the UX part of TM-B37 (Done gives no feedback while pending, RR-R33-01)'
new=[
 {"round":33,"id":"C-R33-01","source":"C R33-3 (c-round-33/c-dm3-probe.test.ts.txt, mutants.log)","severity":"low","status":"in_progress",
  "title":"Test gap: DM-3 (folderLoadId taken before the D-40 wait) passes all 117 tests of the mutation set but is not equivalent: Done while B's scan is pending, Open Folder C supersedes, C's first readMetadataBatch rejects; A's code fills C via the re-read ({c: C + CN}), DM-3 leaves metadata {}",
  "routed_to":"TM-B36 round 34: pin (w8) in schema-change-during-folder-load.test.ts (B R33 exp: green on 9f5ac51, killed by DM-3)"},
 {"round":33,"id":"C-R33-02","source":"C R33-5 real app (c-round-33/run-new-Q.txt, r33-5-new-Q-*.png, run-old-QD.txt); same as QA-R33-01 and A-R33-02 (second part)","severity":"low","status":"in_progress",
  "title":"A Done still pending (D-40 wait or slow schema re-read) closes a schema editor that the user reopened after Back: SchemaEditor handleSave calls its captured onClose after await onSave(), MetadataPanel's onClose is setShowSchemaEditor(false), so the reopened editor closes by itself and the typed field name is lost. Pre-existing (old build with a slow re-read: closes at 3.3 s); D-40 widened the window to the whole folder load. Nothing on disk changes. A's qa-engineer rated medium, C low",
  "routed_to":"TM-B36 round 34 (D-41): B R33 red (b-round-33-exp/) (e1)(e2) red on 9f5ac51; severity low (display/input only; nothing on disk), first in round 34"},
 {"round":33,"id":"QA-R33-01","source":"A R33 qa-engineer Q1 (a-round-33/qa/qa-d40.test.ts)","severity":"low","status":"in_progress",
  "title":"Duplicate of C-R33-02 (stale onClose closes the reopened schema editor); qa-engineer rated medium",
  "routed_to":"TM-B36 round 34 (with C-R33-02)"},
 {"round":33,"id":"QA-R33-02","source":"A R33 qa-engineer Q2; = A-R33-02 first part","severity":"low","status":"open",
  "title":"Done clicked twice during a pending folder load starts two schema re-reads (readMetadataBatch 3x [b] instead of 2); the result is correct, a reject can show the toast twice",
  "routed_to":"TM-B37 (with RR-R33-01): needs a busy/disabled Done decision (UX, reference-first)"},
 {"round":33,"id":"RR-R33-01","source":"root-review (gates/round-33/review.md medium)","severity":"medium","status":"open",
  "title":"Done gives no feedback while it waits (SchemaEditor.tsx:128-131): during a pending load and re-read the editor stays open, the button is not disabled and has no busy state; on a slow folder it looks like nothing happened and a second click starts another re-read. Suggested fix: a pending flag in handleSave, Done disabled + aria-busy while pending",
  "routed_to":"TM-B37 (UX, reference-first; B R33 first search found mixed guidance: Opquast/a11y blogs prefer aria-disabled + aria-busy over disabled, Mp3tag forum users ask for controls disabled while saving). Not combined with TM-B36 because a pending guard changes what a second Done does while the editor is still editable (a field added during the re-read itself would no longer be read), which needs its own reference and decision"},
 {"round":33,"id":"RR-R33-02","source":"root-review (gates/round-33/review.md low 1)","severity":"low","status":"open",
  "title":"waitForFolderLoadIdle's subscription can outlive MetadataPanel: if the panel unmounts while waiting, the re-read still runs at the next idle state; harmless today (panel always mounted, store calls guarded, QA Q5 pin); fix if that changes: AbortSignal or an unmount flag after the wait",
  "routed_to":"signal (with RR-R32-05 / RR-R31-04 architecture family)"},
 {"round":33,"id":"RR-R33-03","source":"root-review (gates/round-33/review.md low 2)","severity":"low","status":"in_progress",
  "title":"Undocumented D-40 edge: if the schema fails to load at startup, App openFolder (drop) sets isScanning true (App.tsx:47) before its up-to-5 s schema wait (:50-55), so a Done during that drop waits up to 5 s; worth one line in D-40",
  "routed_to":"TM-B36 round 34: one sentence in the docs/bugs/001 D-40 bullet"},
 {"round":33,"id":"A-R33-01","source":"A R33 code-reviewer","severity":"low","status":"open",
  "title":"D-40 relies on handleCloseFolder being synchronous (FolderBrowser.tsx:147 setIsScanning(false) runs before setFiles([])/setMetadata({}) :149-150); an await between them would let the re-read take the old list",
  "routed_to":"signal / rule candidate for STATE_MANAGEMENT (with RR-R32-05)"},
 {"round":33,"id":"A-R33-02","source":"A R33 code-reviewer","severity":"low","status":"in_progress",
  "title":"Done stays clickable while it waits: (1) each click adds a waiter and a re-read (= QA-R33-02); (2) Back, reopen Customize, the pending onClose closes the new editor (= C-R33-02)",
  "routed_to":"part (2) TM-B36 round 34; part (1) TM-B37"},
 {"round":33,"id":"A-R33-03","source":"A R33 code-reviewer","severity":"low","status":"open",
  "title":"Test hygiene: a module-level waitForFolderLoadIdle subscription could leak into the next test if a future test ends with isScanning true (reset-stores sets it false, which resolves the old waiter); (w1)-(w7) all finish their loads",
  "routed_to":"signal; TESTING.md rule candidate"},
 {"round":33,"id":"A-R33-04","source":"A R33 code-reviewer","severity":"low","status":"in_progress",
  "title":"docs/bugs/README.md row 001 '(16 ჩანაწერი; 8 გასწორდა, 5 მათგანი Saba-ს კითხვაა)' reads as if the 5 were among the 8 fixed; they are among the remaining entries",
  "routed_to":"TM-B36 round 34: README row reworded with the new count"},
 {"round":33,"id":"QA-R33-03","source":"A R33 qa-engineer Q3 (pin)","severity":"info","status":"open",
  "title":"A scanFolder that never settles keeps Done waiting forever (no busy indicator); Back, Open Folder and Close Folder still work and end the wait",
  "routed_to":"record (B-R32-01 / TM-B37 family)"},
]
for f in new: b['findings'].append(f)
for r in b['rounds']:
    if r['round']==33:
        r['status']='PASS (C R33-1..R33-6, realVerified=true, bugs 2 low: C-R33-01, C-R33-02); root gate published 9f5ac51 (round 33), review COMMIT OK; TM-B35 done'
        r['findings']=sorted(set(r.get('findings',[])+[f['id'] for f in new]))
b['items'].append({"id":"TM-B36","type":"bug","severity":"low",
 "source":"C-R33-02 / QA-R33-01 / A-R33-02(2) (stale onClose), C-R33-01 (DM-3 test gap), RR-R33-03 (D-40 doc line), A-R33-04 (README wording); B R33 red reproduction (b-round-33-exp/)",
 "title":"Schema editor reopened while Done is pending (D-41): the old Done's onClose closes the reopened editor and the typed field name is lost; plus pin (w8) for C-R33-01 and D-40 doc line for the startup-schema drop wait",
 "status":"todo","round":34,"depends_on":["TM-B35"],"decisions":["D-41"],
 "findings":["C-R33-02","QA-R33-01","A-R33-02","C-R33-01","RR-R33-03","A-R33-04"],
 "acceptance":[
  "R34: SchemaEditor keeps isMountedRef (useRef(false); useEffect sets true, cleanup sets false) and handleSave returns after await onSave() without calling onClose when the editor has unmounted; MetadataPanel.tsx and every other src file unchanged",
  "tests (e1)-(e5) in tests/renderer/components/schema-editor-stale-close.test.ts ((e2)(e3) under React.StrictMode) and (w8) appended to schema-change-during-folder-load.test.ts: on 9f5ac51 src (e1)(e2) red on the symptom, (e3)(e4)(e5)(w8) green (279 passed / 2 failed of 281); 281/281 in 17 files after; mutants SM-1..SM-4 killed, DM-3 killed by (w8)",
  "real app (C, old 9f5ac51 vs new): Q (Done during a pending Open Folder, Back, reopen Customize, type QTyped, scan finishes) -> old: editor closes by itself, QTyped lost; new: editor stays open with QTyped and Done then closes it; QD (same with a slow schema re-read and no load) same result; N (no load) closes at once on both; sha256 + ffprobe + music-metadata",
  "docs/bugs/001 entry 17 fixed by D-41, D-41 bullet, D-40 bullet + RR-R33-03 sentence, entry 16 test list + (w8); README row reworded 17/9/5",
  "gate: verifyCommand green, renderer 281, main 93, E2E 7/7, --retries=0 7/7, Biome 0/8 same list"],
 "realVerified":False,
 "evidence_b":"B R33 (b-round-33-exp/): on 9f5ac51 src (e1)(e2) red ('expected undefined to be QTyped': the reopened editor closed), (e3)(e4)(e5) green; prototype (prototype.diff.txt) 5/5 + (w8) 8/8; mutants.log: SM-1/SM-3/SM-4 killed by (e1)(e2), SM-2 by (e3), DM-3 by (w8)"})
b['items'].append({"id":"TM-B37","type":"bug","severity":"medium",
 "source":"RR-R33-01 (root review medium), QA-R33-02 / A-R33-02(1) (double Done -> double re-read), B-R32-01, QA-R33-03",
 "title":"Schema editor Done gives no feedback while it waits for a folder load and the re-read, and stays re-entrant (each click starts another re-read). UX change: needs a Reference section (tag editors / platform guidance for a pending commit button) and a decision on disabled vs aria-disabled + aria-busy and on edits made while pending",
 "status":"todo","depends_on":["TM-B36"],"decisions":[],
 "findings":["RR-R33-01","QA-R33-02","B-R32-01","QA-R33-03"],
 "acceptance":["to be planned after TM-B36 with a Reference section and Deviations (reference-first rule)"],
 "realVerified":False})
b['decisions'].append({"id":"D-41","status":"planned R34 (TM-B36)",
 "decision":"An unmounted schema editor never closes the panel (renderer only, SchemaEditor.tsx). SchemaEditor keeps isMountedRef = useRef(false); a mount effect sets it true and its cleanup sets it false (StrictMode-safe). handleSave awaits onSave() and returns without onClose() when isMountedRef.current is false. Why: Back unmounts the editor while Done may still wait (D-40) or re-read; reopening Customize Fields mounts a new editor, and the old Done's onClose (setShowSchemaEditor(false)) would close the new one and drop what the user typed. The pending re-read itself still runs and applies (D-40 unchanged). Done's busy state / re-entrancy is TM-B37.",
 "contract_with":"none (renderer display only)"})
b['rounds'].append({"round":34,"task":"TM-B36 schema editor reopened while Done is pending (D-41): unmounted editor never calls onClose; pin (w8) for DM-3; D-40 doc line; README wording","status":"planned",
 "baseline":"9f5ac51fa93096b1940b6609db203d92ff53fdfc (clean)","items":["TM-B36"],"findings":["C-R33-02","QA-R33-01","A-R33-02","C-R33-01","RR-R33-03","A-R33-04"]})
b['current_task']="Round 34: TM-B36 schema editor reopened while Done is pending (D-41) on baseline 9f5ac51"
json.dump(b,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
print('ok')
