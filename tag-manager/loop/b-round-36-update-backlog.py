import json
P='backlog.json'
b=json.load(open(P))
items={i['id']:i for i in b['items']}
fs={f['id']:f for f in b['findings']}
PASS="C R36 PASS (R36-1..R36-6, realVerified=true; c-round-36.md/.json), published 51969a2, review COMMIT OK"

t=items['TM-B38']
t['status']='done'; t['realVerified']=True; t['commit']='51969a270d9642b8d2e9ae4fb9ab309b43fbcece'
t['evidence']=[
 "C R36: ownership 14 owned paths only, frozen --quiet exit 0, dom-queries.ts byte-identical to B proto; git diff -w only lookups/import/local helper/(e5)/(b7)(b8); test counts unchanged, done-busy 6->8; (b7)/(b8) = C (k1)/(k2) apart from helper + name",
 "C R36-3: SM-1 (e1)(e2)(b3), SM-2 (e3), DM-3 (w8), BM-1 (b1)(b2), DM-8 (b5)(b7 'expected STALE1 to be B'), BM-6 (b8) killed; DM-9 survives (argued); red base 3035ffc: (b1)(b2)(b5)(b7) fail + (b4) Unhandled Rejection; HM-1..HM-3 survive, identity probe 257 lookups: matches=1, includes=1, notrim=1, sameAsRole=true -> C-R36-01 low",
 "C R36-4 durations (same runner, interleaved): after 289/289 in 18 files x2; slowest test 402/360 ms; metadata-panel-schema-change 14.2x, schema-change-during-folder-load 10.6x, schema-editor-stale-close 9.3x, reread-after-folder-switch 7.5x; each file alone green",
 "C R36-5 gate: verifyCommand exit 0, Biome 0/8 same list, tsc node/web/test 0 (dom-queries.ts listed), renderer 289, main 93/93, E2E 7/7 real Electron xvfb, --retries=0 7/7; R36-6 docs PASS",
 "root gate round 36: published 51969a2, review COMMIT OK (gates/round-36/review.md): 0 critical/high/medium, 4 low (RR-R36-01..04), 1 architecture note (RR-R36-05)"]

for fid in ['C-R34-02','B-R34-02','C-R34-03','C-R35-02','C-R35-03']:
    f=fs[fid]; f['status']='closed'; f['routed_to']='closed by TM-B38 round 36 ('+PASS+')'

t=items['TM-B39']
t['status']='in_progress'; t['round']=37; t['decisions']=['D-44']
t['acceptance']=[
 "R37: new tests/renderer/components/selection-after-folder-switch.test.ts (x1)-(x7) from b-round-36-exp; red 7/7 on 51969a2 src first (test-on-bugfix)",
 "D-44 fix: file-store.ts line 55 setFiles -> set((state) => withListedSelection(state, files)) + private withListedSelection appended at end of file (lines 1-240 otherwise byte-identical); every other src file frozen",
 "mutants PM-1 (no prune) kills (x1)-(x7), PM-2 (clear) kills (x2)(x6), PM-3 (new array) kills (x6), PM-4 (prune only in FolderBrowser) kills (x2)(x3)",
 "real app old 51969a2 vs new (C): S1 Open Folder other folder + click during delayed scan -> new no 'selected', old '1 selected'; S2 Rescan row survives -> new a2 highlighted '1 selected', old '2 selected'; S3 dirty -> new toast 'Unsaved changes were discarded'; S2-save ffprobe + music-metadata ICAT=R37Kept; sha256; pageErrors empty",
 "docs/bugs/001 entry 20 (Reference R1-R3, Deviations 1-4, D-44, 7 test names), README 20/11/5; entries 1-19 refs byte-identical",
 "gate: verifyCommand green, renderer 296, main 93, E2E 7/7, --retries=0 7/7, Biome 0/8 same list"]
t['evidence_b']="B R36 (b-round-36-exp/): red-run.log on 51969a2 src 7/7 fail on the symptom (e.g. expected ['/fa/a.wav'] to deeply equal []); prototype.diff.txt green-run.log 296/296 in 19 files; tsc web + test clean; Biome 0/8; mutants.log (before (x7) was added): PM-1 kills (x1)-(x6), PM-2 (x2)(x6), PM-3 (x6); grep setState( in src/renderer/src: none; dropped WAVs go through openFolder(parentDir)"
t['reference']="R1 Qt QItemSelectionModel reset() clears selection; R2 Kid3 handbook (folder open fills list; FILE args select); R3 Mp3tag opt-in 'Select files automatically'; R4 Explorer refresh: no official source, anecdotal (current-task.md round 37)"

t=items['TM-B40']
if 'RR-R36-01' not in t['findings']: t['findings'].append('RR-R36-01')
t['source']+= ", RR-R36-01 ((b7) qtwo assertion, rides along because TM-B40 edits schema-editor-done-busy.test.ts)"

if 'TM-B41' not in items:
    b['items'].append({"id":"TM-B41","type":"test","severity":"low",
     "source":"C-R36-01, RR-R36-02, RR-R36-03, RR-R36-04 (round 36 C and root review)",
     "title":"dom-queries helper hygiene: unit tests pinning getButtonByText uniqueness / exact string / trim semantics (kill HM-1..HM-3), RegExp g/y lastIndex reset or rejection, TESTING.md §6: a11y-name checks still use getByRole (RR-R36-02) and 'measured on one runner' instead of the agent name (RR-R36-04)",
     "status":"todo","depends_on":["TM-B40"],"decisions":[],
     "findings":["C-R36-01","RR-R36-02","RR-R36-03","RR-R36-04"],
     "acceptance":["to be planned: new tests/renderer/helpers dom-queries unit test red on HM-1..HM-3 mutants; g/y regex case red first; TESTING.md §6 two-line change (Edit tool, path (b)); no src change"],
     "realVerified":False})

newf=[
 ("C-R36-01","C R36-3 (c-round-36/mutants.log, helper-identity-probe.log)","low","Helper mutants HM-1 (uniqueness throw removed), HM-2 (string === -> includes), HM-3 (no trim) survive 289/289; equivalent on all 257 current lookups (identity probe sameAsRole=true); no test pins dom-queries semantics","TM-B41"),
 ("RR-R36-01","root-review (gates/round-36/review.md low 1)","low","(b7)'s reads[1].schema.some(qtwo) assertion likely cannot tell Done #1's read from Done #2's (both read the schema at run time); outcome check (no STALE1) still right","TM-B40 (edits schema-editor-done-busy.test.ts)"),
 ("RR-R36-02","root-review (gates/round-36/review.md low 2)","low","getButtonByText has no visibility filter and ignores aria-label; safe because of the unique-match throw, but tests no longer show accessible names; add a TESTING.md §6 sentence that a11y-name checks still use getByRole","TM-B41"),
 ("RR-R36-03","root-review (gates/round-36/review.md low 3)","low","getButtonByText RegExp with g/y keeps lastIndex between calls; no current caller uses g/y (C probe)","TM-B41"),
 ("RR-R36-04","root-review (gates/round-36/review.md low 4)","low","TESTING.md §6 names a loop agent ('B-ის გაზომვით'); write 'measured on one runner'","TM-B41"),
 ("RR-R36-05","root-review (gates/round-36/review.md architecture note)","info","Architecture signal: Biome checks only src/ (tests/ unlinted) -> same as TM-B06; a shared clickButton(name) helper would replace ~8 per-suite copies","signal (TM-B06 note; clickButton helper not a task)"),
 ("R36-A-01","A R36 (a-round-36.md), C R36 info","info","getButtonByText does not collapse inner whitespace; unreachable today (C probe sameAsRole=true on all 257 lookups)","record"),
 ("R36-A-02","A R36 (a-round-36.md), C R36 info","info","RegExp g/y lastIndex (= RR-R36-03); unreachable today","TM-B41 (with RR-R36-03)"),
 ("B-R36-01","B R36 (current-task.md round 37 Deviation 2)","info","The old file listing stays clickable while a folder scan is pending; locking/blanking it would be a new UX (Saba-question candidate). D-44 makes such a click unable to outlive the load","signal / Saba question batch"),
]
for fid,src,sev,title,route in newf:
    if fid in fs: continue
    b['findings'].append({"round":36,"id":fid,"source":src,"severity":sev,"status":"open","title":title,"routed_to":route})

t=items['TM-B06']
t.setdefault('notes',[]).append("R36: RR-R36-05 (root review) again notes biome check src/ leaves tests/ unlinted; signal only, scope decision still with Saba")

if not any(d['id']=='D-44' for d in b['decisions']):
    b['decisions'].append({"id":"D-44","status":"planned R37 (TM-B39)","decision":"useFileStore.setFiles(files) keeps selectedPaths to the paths listed in the new files, in their existing order (renderer only, file-store.ts line 55 + private withListedSelection appended at end). When nothing is pruned the update omits selectedPaths (same array identity); load-start clearSelection, selectRange, selectAll and D-31 anchor rules unchanged. Rejected: clearing on apply (drops a deliberate click on a row the same Rescan still lists). Covers Open Folder, Rescan, drop, scan-reject setFiles([]) and Close Folder. Reference R1-R3 (Qt reset, Kid3, Mp3tag opt-in auto-select), Deviations 1-4 in current-task.md round 37","contract_with":"none (renderer selection state only)"})

for r in b['rounds']:
    if r['round']==36:
        r['status']="PASS ("+PASS.replace('C R36 PASS ','')+"), bugs 1 low: C-R36-01; root review 4 low RR-R36-01..04 + RR-R36-05 note; TM-B38 done"
if not any(r['round']==37 for r in b['rounds']):
    b['rounds'].append({"round":37,"task":"TM-B39 selection kept inside the listed files after a folder load (D-44): setFiles prunes selectedPaths; tests (x1)-(x7); docs/bugs/001 entry 20","status":"planned","baseline":"51969a270d9642b8d2e9ae4fb9ab309b43fbcece (clean)","items":["TM-B39"],"findings":["C-R34-01"]})
fs2={f['id']:f for f in b['findings']}
fs2['C-R34-01']['status']='in_progress'; fs2['C-R34-01']['routed_to']='TM-B39 round 37 (D-44)'
b['current_task']="Round 37: TM-B39 selection kept inside the listed files after a folder load (D-44, setFiles prunes selectedPaths) on baseline 51969a2"
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok')
