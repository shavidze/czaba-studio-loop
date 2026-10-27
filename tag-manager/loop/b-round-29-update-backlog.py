import json
p='backlog.json'
b=json.load(open(p,encoding='utf-8'))
F={f['id']:f for f in b['findings']}
I={i['id']:i for i in b['items']}
D={d['id']:d for d in b['decisions']}
C29="C R29 PASS (R29-1..R29-6, realVerified=true; c-round-29.md/.json), published 20967a0, review COMMIT OK"

it=I['TM-B31']
it['status']='done'; it['realVerified']=True
it['commit']='20967a001e3b8adc59f99344bc802483e4f8dcce'
it.setdefault('evidence',[]).append(
 "C R29: red 227/8 on b182557 src -> green 235/235 (13 files); MK-1..MK-9c all killed (EX-1 extra mutant survives -> C-R29-01, TM-B32); "
 "gate verifyCommand exit 0, Biome 0/8 same list, renderer 235, main 93/93, E2E 7/7, --retries=0 7/7; real app old (b182557) vs new: "
 "new keeps Tagged + R29Cat and shows 'Failed to read 2 files' (Rescan, Open Folder same folder), other folder lists rows + toast; old empties with no toast; "
 "sha256 unchanged, ffprobe + music-metadata ICAT=R29Cat; docs entry 12/11 file:line grep-verified")
D['D-36']['status']='verified (C R29 PASS), published 20967a0 (TM-B31)'

for fid in ('B-R27-01',):
    F[fid]['status']='closed'; F[fid]['closed_by']='TM-B31 (D-36), '+C29
for fid in ('A-R28-01','A-R28-02','RR-R28-01','RR-R28-02'):
    F[fid]['status']='closed'; F[fid]['closed_by']='TM-B31 docs (docs/bugs/001 entry 11), C R29-6 PASS, published 20967a0'
F['RR-R28-01']['note_b_r29']='Documented as a remaining limit (entry 11). A notice/count for a superseded path with no entry stays a signal, not scoped.'
F['C-R25-01']['routed_to']='record (pure signal, B R29 decision): a defaults-only test of the beforeEach reset depends on run order (RR-R23-01); no task. Removed from remaining.'
F['RR-R15-04']['note_b_r29']='Same wording now also at the folder-read toast (D-36: FolderBrowser.tsx x2, App.tsx) and D-33 (MetadataPanel.tsx:252); reachable with one rejected file ((k4) pins "Failed to read 1 files"). If ever changed: all four sites + (k4) together (RR-R29-01).'
F['RR-R28-03']['note_b_r29']='Related: Open Folder / drop of an empty folder kept the old folder entries (C-R29-02) -> fixed by TM-B32 (D-37, round 30). The save re-read landing after a folder switch stays open here.'

new=[
 {"round":29,"id":"C-R29-01","source":"C R29 mutant EX-1 (c-round-29/mutants.log)","severity":"low","status":"in_progress",
  "title":"Test gap: no test rejects two chunks; mutant failedPaths.splice(0, failedPaths.length, ...chunk) (utils.ts:72, keeps only the last rejected chunk) survives the whole renderer suite (235/235)",
  "routed_to":"TM-B32 round 30: (u3) 151 paths, chunks 1 and 3 reject"},
 {"round":29,"id":"A-R29-01","source":"A R29","severity":"low","status":"in_progress",
  "title":"= C-R29-01 (A found and measured the splice mutant first)","routed_to":"TM-B32 round 30 (u3)"},
 {"round":29,"id":"C-R29-02","source":"C R29-6 code read","severity":"low","status":"in_progress",
  "title":"docs/bugs/001 D-35 bullet and STATE_MANAGEMENT D-35 line say error and empty-folder paths call setMetadata({}); only handleRescan clears on an empty folder (FolderBrowser.tsx:177-179); handleOpenFolder and App openFolder keep the old entries; Rescan's error path keeps files and metadata",
  "routed_to":"TM-B32 round 30 (D-37): code fix (else setMetadata({}) in handleOpenFolder and App openFolder) + exact docs sentence",
  "note_b_r29":"B R29 red reproduction on 20967a0 (b-round-29-exp/): (x1) Open Folder empty -> metadata keeps /music a,b; (x2) App drop empty -> same; (x3) empty then Open Folder /music with rejected read -> stale entries shown as current (vs {} after a non-empty other folder, D-36 (k5)); (x4) Rescan empty -> {} (green). Prototype else-fix: 239/239 renderer. 6ecfb40 added the else to Rescan only; no D-ID chose otherwise. Display-only, low."},
 {"round":29,"id":"A-R29-02","source":"A R29","severity":"low","status":"in_progress","title":"= C-R29-02","routed_to":"TM-B32 round 30"},
 {"round":29,"id":"RR-R29-01","source":"root-review (gates/round-29/review.md low 1)","severity":"low","status":"open",
  "title":"Toast grammar 'Failed to read 1 files' (FolderBrowser.tsx:125,175, App.tsx:77) copies D-33 MetadataPanel.tsx:252; pinned by (k4)",
  "routed_to":"record with RR-R15-04: if fixed, change all four sites and the tests together"},
 {"round":29,"id":"RR-R29-02","source":"root-review (gates/round-29/review.md low 2 + architecture note)","severity":"info","status":"open",
  "title":"Architecture signal: the read-chunks -> applyMetadataRead(generations, failedPaths) -> toast block is repeated three times (FolderBrowser.tsx:111-126, :161-176, App.tsx:63-78); one file-store helper loadFolderMetadata(paths, schema): Promise<{ failures }> would reduce each caller to one line and give one place for a per-read sequence guard (RR-R29-03)",
  "routed_to":"signal (with RR-R28-05 / RR-R25-04); natural place for TM-B33's guard"},
 {"round":29,"id":"RR-R29-03","source":"root-review (gates/round-29/review.md low 3)","severity":"low","status":"open",
  "title":"Two overlapping folder reads (Rescan twice, Rescan during a drop, Open Folder A then B) have no ordering guard: the last to finish wins; e.g. A's late read replaces metadata while B's files are listed. Pre-existing, not worsened by D-36; D-35 guards writes only",
  "routed_to":"TM-B33 (todo): B red reproduction first, then a read-sequence guard composed with D-35 generations"},
]
for f in new: b['findings'].append(f)

b['items'].append({"id":"TM-B32","type":"bug","severity":"low",
 "source":"C R29 (C-R29-01 mutant EX-1, C-R29-02 docs/code read), A R29 (A-R29-01, A-R29-02), B R29 red reproduction (b-round-29-exp/)",
 "title":"Open Folder / drop of an empty folder keeps the old folder's metadata entries (D-37), so a later rejected read of that folder shows them as current; plus the two-rejected-chunk test gap in readMetadataChunked",
 "status":"in_progress","round":30,"depends_on":["TM-B31"],"decisions":["D-37"],
 "findings":["C-R29-01","A-R29-01","C-R29-02","A-R29-02"],
 "acceptance":[
  "R30: FolderBrowser handleOpenFolder and App openFolder call setMetadata({}) when scanFolder returns no WAV (same as handleRescan); success, error and close paths unchanged",
  "tests (e1)-(e4) in folder-read-rejected-chunk.test.ts and (u3) in utils.test.ts: on 20967a0 src (e1)(e2)(e3) red, (e4)(u3) green; all 240 green after the fix; mutants EX-1, EX-2, ME-1..ME-5 killed",
  "real app (C, both builds, harness rejects meta:read-batch): m -> empty -> armed Open Folder m: new build shows no Tagged/empty form + 'Failed to read 2 files' (same as the m -> o control), old build shows the stale R30Cat entry; sha256 unchanged, ffprobe + music-metadata ICAT=R30Cat",
  "docs/bugs/001 entry 13 fixed by D-37, entry 12 names (u3), D-35 bullet's error/empty-folder sentence exact; README 13/5/5; STATE_MANAGEMENT D-35 clause",
  "gate: verifyCommand green, renderer 240 in 13 files, main 93, E2E 7/7, --retries=0 7/7, Biome 0/8 same list"],
 "realVerified":False})
b['items'].append({"id":"TM-B33","type":"bug","severity":"low","source":"root-review round 29 (RR-R29-03)",
 "title":"Overlapping folder reads have no ordering guard: the last read to finish replaces metadata even when a newer Open Folder / Rescan / drop started later",
 "status":"todo","depends_on":["TM-B32"],"findings":["RR-R29-03","RR-R29-02"],
 "acceptance":["B red reproduction first (two deferred readMetadataBatch calls, the older finishing last); then a read-sequence guard that composes with D-35 generations; real-app check old vs new"],
 "realVerified":False})

b['decisions'].append({"id":"D-37","status":"planned R30 (TM-B32)",
 "decision":"An empty folder clears the store metadata in all three folder callers (renderer only): FolderBrowser handleOpenFolder and App openFolder (drop) call setMetadata({}) when scanFolder returns no WAV, as handleRescan already does. No toast. Error paths stay as they are and are documented exactly: Open Folder / drop error -> setFiles([]) + setMetadata({}) + toast; Rescan error -> toast only (files and metadata kept). Reason: Close Folder and Open Folder of a non-empty folder already drop the old folder's entries; keeping them on an empty folder let a later rejected read (D-36 keptPaths) show them as current. Display-only.",
 "contract_with":"none (renderer display only)"})

for r in b['rounds']:
    if r['round']==29:
        r['status']='PASS (C R29-1..R29-6, realVerified=true, 2 low findings C-R29-01/C-R29-02, no acceptance FAIL); root gate published 20967a0 (round 29), review COMMIT OK; TM-B31 done'
        r['findings']=sorted(set(r.get('findings',[])+['C-R29-01','C-R29-02','A-R29-01','A-R29-02','RR-R29-01','RR-R29-02','RR-R29-03']))
b['rounds'].append({"round":30,"task":"TM-B32 empty folder clears metadata in Open Folder / drop (D-37) + (u3) two rejected chunks; docs/bugs/001 entry 13","status":"planned",
 "baseline":"20967a001e3b8adc59f99344bc802483e4f8dcce (clean)","items":["TM-B32"],"findings":["C-R29-01","A-R29-01","C-R29-02","A-R29-02"]})
b['current_task']="Round 30: TM-B32 empty folder clears metadata in Open Folder / drop (D-37) + two-rejected-chunk test (u3) on baseline 20967a0"
F['B-R26-01']['note_b_r29']='publications.jsonl now records 20967a0 as rounds 29-29 and b182557 as 26-28; 6c956b4 still has no publication line of its own. Still open for root.'
json.dump(b,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
print('ok')
