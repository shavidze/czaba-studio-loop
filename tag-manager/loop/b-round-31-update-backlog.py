import json
p='backlog.json'
b=json.load(open(p,encoding='utf-8'))
F={f['id']:f for f in b['findings']}
I={i['id']:i for i in b['items']}
D={d['id']:d for d in b['decisions']}
C31="C R31 PASS (R31-1..R31-6, realVerified=true; c-round-31.md/.json), published 7355d78, review COMMIT OK"

it=I['TM-B33']
it['status']='done'; it['realVerified']=True
it['commit']='7355d78cecfd24bc895c29b3cc84b8e905283d58'
it.setdefault('evidence',[]).extend([
 "C R31: red 241/16 on bf83c7d src ((o1)-(o7),(o9)-(o15) fail on the symptom, (o16)/(f1) on the missing export, (o8) green) -> green 257/257 (14 files), each new test alone 1 passed; GM-1..GM-19 + extra GM-7b all killed with the expected killers; gate verifyCommand exit 0, Biome 0/8 same list, renderer 257, main 93/93, E2E 7/7, --retries=0 7/7; real app old (bf83c7d) vs new with delay/reject/scan harness: L, J, S, C scenarios show each old symptom and none on the new build (Close prompt in 53 ms); sha256 of s.wav/f.wav unchanged, music-metadata exif:ICAT and ffprobe ICAT = R31Slow/R31Fast in all 8 runs; pageErrors empty; drop and Rescan->Open unit-only (stated); docs R31-6 PASS (every file:line grep-verified)",
 "root gate round 31: published 7355d78, review COMMIT OK (gates/round-31/review.md), 3 low + architecture note"])
D['D-38']['status']='verified (C R31 PASS), published 7355d78 (TM-B33)'

F['RR-R29-03']['status']='closed'; F['RR-R29-03']['closed_by']='TM-B33 (D-38), '+C31
F['A-R30-01']['status']='closed'; F['A-R30-01']['closed_by']='round 31 docs: entry 12 names (k7) (C R31-6 PASS, 1 match), published 7355d78'

route="TM-B34 round 32 (D-39): B red reproduction b-round-31-exp/"
F['RR-R28-03']['status']='in_progress'; F['RR-R28-03']['routed_to']=route+" (v1)(v2)(v3)(v4); listed-path rule, not a lock"
F['A-R19-02']['status']='in_progress'; F['A-R19-02']['routed_to']=route+" (v1)(v2)(v3)"
F['RR-R30-01']['status']='in_progress'; F['RR-R30-01']['routed_to']=route+" (v4); NOT the folderLoadId hint: B mutant SM-3 (save keyed on folderLoadId) breaks D-35 (r1)(r2)(r3)(r6)(r7)(k6) because Rescan also calls beginFolderLoad()"

new=[
 {"round":31,"id":"RR-R31-01","source":"root-review (gates/round-31/review.md low 1)","severity":"low","status":"in_progress",
  "title":"tests/renderer/stores/file-store.test.ts:2-3 imports isFolderLoadCurrent in a second statement from ~/stores/file-store; merge into one import",
  "routed_to":"TM-B34 round 32 rider (one-line test tidy, b-round-31-exp/file-store-import.diff.txt)"},
 {"round":31,"id":"RR-R31-02","source":"root-review (gates/round-31/review.md low 2), A R31 CR-2 / qa-engineer info","severity":"low","status":"in_progress",
  "title":"App.tsx:50-55 schema-wait loop runs after beginFolderLoad() and never checks isFolderLoadCurrent: a superseded drop keeps polling up to 5 s and then calls scanFolder for the old folder (result discarded by the :59 guard; wasted IPC)",
  "routed_to":"TM-B34 round 32 (D-39c), (v9) red on 7355d78"},
 {"round":31,"id":"RR-R31-03","source":"root-review (gates/round-31/review.md low 3)","severity":"info","status":"open",
  "title":"file-store.ts:155-158 beginFolderLoad does set then get(); a simpler form computes next = get().folderLoadId + 1, set, return next. Correct as is (Zustand set is synchronous)",
  "routed_to":"signal (optional refactor; not planned)"},
 {"round":31,"id":"RR-R31-04","source":"root-review (gates/round-31/review.md architecture note)","severity":"info","status":"open",
  "title":"Architecture signal: the load sequence (begin, stop player, scan, guard, chunked read, guard, apply, toast, guarded finally) is copied in handleOpenFolder, handleRescan and App openFolder; one loadFolder(path, { onError }) helper with the load id inside would end the three-copy edits and the docs line drift; App's schema wait could become an awaited 'schema ready' promise cancelled by a newer load",
  "routed_to":"signal (with RR-R29-02 / RR-R30-03 / RR-R28-05 / RR-R25-04)"},
 {"round":31,"id":"A-R31-01","source":"A R31 qa-engineer (a-round-31.md), unconfirmed by C","severity":"low","status":"in_progress",
  "title":"handleSchemaChanged (MetadataPanel.tsx:209-254) reads the old folder's files and replaces the whole metadata map: Done in the schema editor, then Open Folder B (or Close Folder) while the schema re-read is pending -> B's files lose their entries (no Tagged, empty form) and a rejected re-read shows a stale 'Failed to read N files'. Display-only: an empty form saves only typed fields (writeTagsToFile skips undefined)",
  "routed_to":"TM-B34 round 32 (D-39b): B reproduced red on 7355d78, (v6)(v7)(v8); severity low (QA said medium; B: display-only, nothing on disk)"},
 {"round":31,"id":"C-R31-01","source":"C R31 signal (CR-6, also A R31 code-review CR-6)","severity":"low","status":"in_progress",
  "title":"Test gap: Close Folder during a pending scan, and during a pending drop load, have no unit test (only Close during a pending Open Folder read, (o5)); both Close mutants are killed by (o5)",
  "routed_to":"TM-B34 round 32 pins (o17)(o18), green on 7355d78"},
 {"round":31,"id":"A-R31-02","source":"A R31 code-review CR-7","severity":"info","status":"open",
  "title":"App-based overlap tests use waitMs(100) to let the drop load start; small flakiness risk under load (same pattern as folder-read-rejected-chunk.test.ts)",
  "routed_to":"record; revisit if a renderer run flakes"},
 {"round":31,"id":"B-R31-01","source":"B R31 mutant SM-3 (b-round-31-exp/mutants.log)","severity":"info","status":"open",
  "title":"Fact: keying the save's re-read store write on folderLoadId (round 30 'Next' hint) breaks D-35 (r1)(r2)(r3)(r6)(r7)(k6), because Rescan and same-folder Open Folder also call beginFolderLoad(); keying on a folderPath snapshot breaks (v5) (parent folder still lists the file). D-39 uses 'path is still listed in files'",
  "routed_to":"record (design fact behind D-39)"},
 {"round":31,"id":"B-R31-02","source":"B R31 mutant SM-9","severity":"info","status":"open",
  "title":"Equivalent mutant: App schema-wait guard after the loop instead of inside survives (scanFolder is still skipped); the only difference is up to 5 s of idle 50 ms polling. Not observable through the store or IPC",
  "routed_to":"record; C states it as equivalent in R32-3"},
]
for f in new: b['findings'].append(f)

b['items'].append({"id":"TM-B34","type":"bug","severity":"low",
 "source":"RR-R28-03 / A-R19-02 / RR-R30-01 (save re-read), A-R31-01 (schema re-read), RR-R31-02 (App schema wait); B R31 red reproduction (b-round-31-exp/)",
 "title":"Late re-reads after a folder switch (D-39): a save's re-read adds the old folder's paths to the new folder's metadata (shown as current after reopening with a rejected read); a schema re-read replaces the new folder's metadata with the old folder's and shows a stale toast; a superseded drop still scans after the schema wait",
 "status":"in_progress","round":32,"depends_on":["TM-B33"],"decisions":["D-39"],
 "findings":["RR-R28-03","A-R19-02","RR-R30-01","A-R31-01","RR-R31-02","RR-R31-01","C-R31-01"],
 "acceptance":[
  "R32: MetadataPanel handleSave writes the re-read into the store only for paths still listed in useFileStore files (single and batch); handleSchemaChanged takes folderLoadId at start and returns without store write, editor change or toast when it is no longer current; App openFolder schema-wait loop returns when the load is superseded; toasts of handleSave unchanged; file-store.ts unchanged",
  "tests (v1)-(v9) in tests/renderer/components/reread-after-folder-switch.test.ts + pins (o17)(o18) in folder-read-overlap.test.ts + file-store.test.ts import merge: on 7355d78 src 8 red ((v1)-(v4),(v6)-(v9)), (v5)(o17)(o18) green (260 passed / 8 failed); 268 in 15 files after; mutants SM-1..SM-8 killed, SM-9 equivalent",
  "real app (C, old 7355d78 vs new, harness delays meta:read for slow/ and meta:read-batch for slow/): V (save re-read lands after Open Folder fast, reopen slow with rejected read -> old shows stale Tagged R32Slow, new shows no entry + toast), SC/SJ (schema Done then Open Folder fast -> old: f.wav loses Tagged / stale toast; new keeps R32Fast); sha256 + ffprobe + music-metadata",
  "docs/bugs/001 entry 15 fixed by D-39; D-39 bullet; header/README 15/7/5; STATE_MANAGEMENT one D-39 line",
  "gate: verifyCommand green, renderer 268, main 93, E2E 7/7, --retries=0 7/7, Biome 0/8 same list"],
 "realVerified":False,
 "evidence_b":"B R31 (b-round-31-exp/): on 7355d78 src 8 red ((v1)-(v4),(v6)-(v9)) on the symptom, (v5)(o17)(o18) green (red-run.log 260 passed / 8 failed of 268); prototype (prototype.diff.txt) 268/268 in 15 files, Biome 0/8 same list, tsc web + test clean; SM-1..SM-8 killed, SM-9 equivalent (mutants.log)"})

b['decisions'].append({"id":"D-39","status":"planned R32 (TM-B34)",
 "decision":"Late re-reads after a folder switch (renderer only). (a) MetadataPanel handleSave: write, markPathsWritten, the stats refresh, the re-read and every toast stay as they are; the re-read result is written into the store (updateFileMetadata) only for paths still listed in useFileStore.getState().files at that moment (single: if (isListedPath(path)); batch: savedEntries also filtered by isListedPath). Not keyed on folderLoadId: Rescan and same-folder Open Folder also take a load id, and D-35 needs the save's re-read in those cases (B R31 SM-3). Not keyed on folderPath: a parent folder that still lists the file must get the saved value (v5). (b) handleSchemaChanged takes useFileStore.getState().folderLoadId at start; after the chunk loop, if !isFolderLoadCurrent(loadId) it returns: no setMetadata, no editor change, no toast. Any later folder load reads with the new schema already. (c) App openFolder: inside the schema-wait loop, after each 50 ms wait, a superseded load returns (no scan IPC). file-store.ts unchanged; D-34/D-35/D-36/D-37/D-38 unchanged.",
 "contract_with":"none (renderer display only)"})

for r in b['rounds']:
    if r['round']==31:
        r['status']='PASS (C R31-1..R31-6, realVerified=true, bugs 0); root gate published 7355d78 (round 31), review COMMIT OK; TM-B33 done'
        r['findings']=sorted(set(r.get('findings',[])+['RR-R31-01','RR-R31-02','RR-R31-03','RR-R31-04','A-R31-01','A-R31-02','C-R31-01','B-R31-01','B-R31-02']))
b['rounds'].append({"round":32,"task":"TM-B34 late re-reads after a folder switch (D-39): save re-read listed-path rule, schema re-read load-id guard, App schema-wait guard; pins (o17)(o18); docs/bugs/001 entry 15","status":"planned",
 "baseline":"7355d78cecfd24bc895c29b3cc84b8e905283d58 (clean)","items":["TM-B34"],
 "findings":["RR-R28-03","A-R19-02","RR-R30-01","A-R31-01","RR-R31-02","RR-R31-01","C-R31-01"]})
b['current_task']="Round 32: TM-B34 late save/schema re-reads and superseded drop after a folder switch (D-39) on baseline 7355d78"
json.dump(b,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
print('ok')
