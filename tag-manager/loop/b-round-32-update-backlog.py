import json
p='/home/runner/czaba-project/tmp/tag-manager-loop/backlog.json'
b=json.load(open(p,encoding='utf-8'))
if any(i['id']=='TM-B35' for i in b['items']): raise SystemExit('already applied')
F={f['id']:f for f in b['findings']}
I={i['id']:i for i in b['items']}
D={d['id']:d for d in b['decisions']}
C32="C R32 PASS (R32-1..R32-6, realVerified=true; c-round-32.md/.json), published ee15e6c, review COMMIT OK"
it=I['TM-B34']
it['status']='done'; it['realVerified']=True
it['commit']='ee15e6cfa72f50bb1caecb9075526101e3eb03ec'
it.setdefault('evidence',[]).extend([
 "C R32: red 260 passed / 8 failed on 7355d78 MetadataPanel.tsx+App.tsx with A's tests ((v1)-(v4),(v6)-(v9) fail on the symptom; (v5)(o17)(o18) green) -> green 268/268 (15 files), each new test alone 1 passed; SM-1..SM-8 killed with the expected killers, SM-9 survived and shown equivalent; gate verifyCommand exit 0, Biome 0/8 same list, renderer 268, main 93/93, E2E 7/7, --retries=0 7/7; real app old (7355d78) vs new with read-one/batch delay/reject harness: V, SC, SJ show each old symptom and none on the new build; Tags saved in V on both; sha256 f.wav unchanged, s.wav changed only by the V save; ffprobe ICAT + music-metadata exif:ICAT R32Fast / R32Slow / R32Slow2 field by field; no R32note written; pageErrors empty; (v3)(v5)(v8)(v9) unit-only (stated); docs R32-6 PASS (every MetadataPanel/App file:line resolved by c-round-32/refs.py)",
 "root gate round 32: published ee15e6c, review COMMIT OK (gates/round-32/review.md), 4 low + architecture note"])
D['D-39']['status']='verified (C R32 PASS), published ee15e6c (TM-B34)'
for fid in ['RR-R28-03','A-R19-02','RR-R30-01','A-R31-01','RR-R31-02','RR-R31-01','C-R31-01']:
    F[fid]['status']='closed'; F[fid]['closed_by']='TM-B34 (D-39), '+C32
F['B-R31-02']['status']='closed'; F['B-R31-02']['closed_by']='C R32-3 confirmed SM-9 survives as an equivalent mutant (c-round-32/mutants.log)'
new=[
 {"round":32,"id":"RR-R32-01","source":"root-review (gates/round-32/review.md low 1)","severity":"low","status":"open",
  "title":"MetadataPanel.tsx:60-62,186-188 isListedPath scans the whole files list once per saved path in the batch filter (O(files x paths), ~1e6 comparisons for 1000 x 1000 on the main thread); a Set of listed paths built once per re-read gives the same result",
  "routed_to":"signal (perf nit); see round 33 rider decision in b-round-32.md"},
 {"round":32,"id":"RR-R32-02","source":"root-review (gates/round-32/review.md low 2)","severity":"low","status":"open",
  "title":"refreshSavedFileStats reads folderPath when it runs, so a save finishing after Open Folder B scans folder B; the written-paths filter discards the result (state correct, wasted scan IPC); skip when no written path is still listed (pre-existing, RR-R19-01/RR-R19-03 class)",
  "routed_to":"signal (with RR-R19-01 / RR-R19-03 / B-R18-01; performance is a Saba question)"},
 {"round":32,"id":"RR-R32-03","source":"root-review (gates/round-32/review.md low 3)","severity":"info","status":"open",
  "title":"App.tsx:55 the superseded early return sits before try/finally and so skips setIsScanning(false); correct (only the current load owns isScanning). Record so nobody moves it into the finally",
  "routed_to":"record (design fact of D-39c)"},
 {"round":32,"id":"RR-R32-04","source":"root-review (gates/round-32/review.md low 4)","severity":"low","status":"open",
  "title":"A folder load (Rescan / Open Folder) whose chunked read began with the old schema and lands after the schema re-read applies old-schema data; the schema re-read is not dropped and not repeated (pre-existing, no test)",
  "routed_to":"B R32 reproduction pending (b-round-32-exp/)"},
 {"round":32,"id":"RR-R32-05","source":"root-review (gates/round-32/review.md architecture note)","severity":"info","status":"open",
  "title":"Architecture signal: folder-switch safety rests on three rules (load id for loads and schema re-read, listed path for save re-read, write generations for stale reads); one store action applyLateRead(entries, { loadId?, readGeneration? }) could hold all three so each new async path gets every guard by default",
  "routed_to":"signal (with RR-R31-04 / RR-R29-02 / RR-R30-03 / RR-R28-05 / RR-R25-04)"},
 {"round":32,"id":"A-R32-01","source":"A R32 code-reviewer + qa-engineer (a-round-32.md), C R32 B-note (inference from code, not reproduced by C)","severity":"low","status":"open",
  "title":"handleSchemaChanged takes folderLoadId at start; Done pressed after Open Folder B's beginFolderLoad() but before its setFiles(B) captures B's (current) id while allFiles is still A's list, so the D-39(b) guard cannot fire: when A's schema chunks land after B loaded, setMetadata replaces B's map with A's entries (B loses Tagged / form values; a rejected read shows a stale toast). Display-only. A rated medium",
  "routed_to":"B R32 reproduction pending (b-round-32-exp/)"},
 {"round":32,"id":"A-R32-02","source":"A R32 code-reviewer + qa-engineer (a-round-32.md), not reproduced by C","severity":"low","status":"open",
  "title":"Single save: skipSyncRef.current = true (MetadataPanel.tsx:157) is still set when selectionUnchanged is true but isListedPath(path) is false (updateFileMetadata skipped); the stale skip can swallow one later non-selection sync. Reach: Open Folder B, during B's scan click a.wav again in A's list, setFiles(B), then the save's re-read lands",
  "routed_to":"B R32 reproduction pending (b-round-32-exp/)"},
 {"round":32,"id":"C-R32-01","source":"C R32-2 note","severity":"info","status":"open",
  "title":"(s1) (metadata-panel-schema-change.test.ts) timed out once at 5000 ms when C ran two renderer suites in parallel on the 4-core runner; alone and in the gate 268/268. (v9) depends on the 50 ms schema poll (waitMs(20)/waitMs(150)); both are timing-sensitive under load",
  "routed_to":"record; revisit if a gate run flakes (with A-R31-02)"},
]
for f in new: b['findings'].append(f)
for r in b['rounds']:
    if r['round']==32:
        r['status']='PASS (C R32-1..R32-6, realVerified=true, bugs 0); root gate published ee15e6c (round 32), review COMMIT OK; TM-B34 done'
        r['findings']=sorted(set(r.get('findings',[])+[f['id'] for f in new]))
json.dump(b,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
print('ok')

# ---- part 2: round 33 plan (after B's reproduction in b-round-32-exp/) ----
b=json.load(open(p,encoding='utf-8'))
F={f['id']:f for f in b['findings']}
route="TM-B35 round 33 (D-40): B red reproduction b-round-32-exp/"
F['A-R32-01']['status']='in_progress'; F['A-R32-01']['routed_to']=route+" (w1)(w2) red on ee15e6c; severity low (A said medium; display-only)"
F['RR-R32-04']['status']='in_progress'; F['RR-R32-04']['routed_to']=route+" (w3) red on ee15e6c (Rescan read with the old schema lands after the schema re-read)"
F['A-R32-02']['severity']='info'
F['A-R32-02']['routed_to']="B R32 explore test (b-round-32-exp/, removed from the final set): reproduced the internal state (editingMetadata holds a's re-read while a is not listed, panel shows 'Select a file'), but no user-visible effect: clicking b shows B's form, metadata holds only B. Record; revisit if a visible symptom is found"
new2=[
 {"round":32,"id":"B-R32-01","source":"B R32 prototype (b-round-32-exp/prototype.diff.txt)","severity":"info","status":"open",
  "title":"Under D-40 a Done pressed during a pending folder load keeps the schema editor open until that load finishes and the re-read completes (SchemaEditor awaits onSave, C-R27-01 class); no new text or element",
  "routed_to":"record; C measures the time in R33-5; a non-blocking Done would be a UX change (reference-first, Saba)"},
 {"round":32,"id":"B-R32-02","source":"B R32 mutant DM-3 (b-round-32-exp/mutants.log)","severity":"info","status":"open",
  "title":"Equivalent mutant DM-3: taking folderLoadId before the D-40 wait instead of after survives; a load that starts during the wait begins after the schema change and so already reads with the new schema, so dropping the re-read loses nothing",
  "routed_to":"record; C states it as equivalent in R33-3"},
]
for f in new2: b['findings'].append(f)
b['items'].append({"id":"TM-B35","type":"bug","severity":"low",
 "source":"A-R32-01 (Done between Open Folder B's beginFolderLoad and setFiles), RR-R32-04 (Rescan read with the old schema lands after the schema re-read); B R32 red reproduction (b-round-32-exp/)",
 "title":"Schema change during a pending folder load (D-40): Done pressed while Open Folder B is scanning re-reads A's files under B's (current) load id and replaces B's metadata with A's (stale toast on reject); a Rescan/Open read that began with the old schema lands after the schema re-read and wipes the new field's values",
 "status":"todo","round":33,"depends_on":["TM-B34"],"decisions":["D-40"],
 "findings":["A-R32-01","RR-R32-04"],
 "acceptance":[
  "R33: handleSchemaChanged first awaits waitForFolderLoadIdle() (resolves at once when isScanning is false, else on the first store change with isScanning false), then takes files and folderLoadId from useFileStore.getState(); the D-39 guard, D-33/D-34 and every toast unchanged; the allFiles selector is removed; no other src change",
  "tests (w1)-(w7) in tests/renderer/components/schema-change-during-folder-load.test.ts: on ee15e6c src 3 red ((w1)(w2)(w3)), (w4)-(w7) green (272 passed / 3 failed of 275); 275/275 in 16 files after; mutants DM-1, DM-2, DM-4, DM-5, DM-6, DM-7 killed, DM-3 equivalent",
  "real app (C, old ee15e6c vs new): W/WJ (Done while Open Folder fast is scanning, slow's batch read delayed/rejected -> old: f.wav loses Tagged / stale toast; new: f.wav keeps R32Fast, no slow read after Done), R (Rescan read with the old schema delayed, field R33note/R33N added, Done -> old: R33note empty after the Rescan lands; new: R33Val), N (no load: Done applies at once on both); sha256 + ffprobe + music-metadata",
  "docs/bugs/001 entry 16 fixed by D-40; D-40 bullet; D-39 bullet (b) sentence updated; header/README 16/8/5; STATE_MANAGEMENT one D-40 line + D-39 wording",
  "gate: verifyCommand green, renderer 275, main 93, E2E 7/7, --retries=0 7/7, Biome 0/8 same list"],
 "realVerified":False,
 "evidence_b":"B R32 (b-round-32-exp/): on ee15e6c src 3 red ((w1) metadata = A's map with r33note under B's list; (w2) toast 'Failed to read 2 files'; (w3) r33note missing after the old-schema Rescan read) and (w4)-(w7) green (red-run.log 272 passed / 3 failed of 275); prototype 275/275 in 16 files, Biome 0/8 same list, tsc web + test clean (green-run.log); DM-1/2/4/5/6/7 killed, DM-3 equivalent (mutants.log)"})
b['decisions'].append({"id":"D-40","status":"planned R33 (TM-B35)",
 "decision":"Schema re-read waits for a pending folder load (renderer only). MetadataPanel handleSchemaChanged first awaits a module-level waitForFolderLoadIdle(): it resolves at once when useFileStore isScanning is false, otherwise on the first store change where isScanning is false (subscribe, then unsubscribe). Only then it takes files and folderLoadId from useFileStore.getState() (not the render-closure allFiles) and reads those paths with the current schema. The D-39(b) guard, D-33 (rejected chunk keeps the entry, one toast) and D-34 (write-generation keep) are unchanged. Why wait and not skip: a load whose read began before the field was added reads with the old schema; only a re-read after that load lands puts the new field's values in (RR-R32-04). Why not a files-identity guard: a save's stats refresh replaces the files array (updateFileStats) and would drop a valid re-read ((w7)). Effect: Done during a pending load keeps the editor open until the load and the re-read finish (B-R32-01).",
 "contract_with":"none (renderer display only)"})
for r in b['rounds']:
    if r['round']==32:
        r['findings']=sorted(set(r.get('findings',[])+['B-R32-01','B-R32-02']))
b['rounds'].append({"round":33,"task":"TM-B35 schema change during a pending folder load (D-40): handleSchemaChanged waits for the load, then reads the current files; docs/bugs/001 entry 16","status":"planned",
 "baseline":"ee15e6cfa72f50bb1caecb9075526101e3eb03ec (clean)","items":["TM-B35"],"findings":["A-R32-01","RR-R32-04"]})
b['current_task']="Round 33: TM-B35 schema re-read waits for a pending folder load (D-40) on baseline ee15e6c"
json.dump(b,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
print('ok part2')
