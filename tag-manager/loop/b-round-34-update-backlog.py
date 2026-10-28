import json
p='/home/runner/czaba-project/tmp/tag-manager-loop/backlog.json'
b=json.load(open(p,encoding='utf-8'))
if any(f['id']=='C-R34-01' for f in b['findings']): raise SystemExit('already applied')
F={f['id']:f for f in b['findings']}
I={i['id']:i for i in b['items']}
D={d['id']:d for d in b['decisions']}
C34="C R34 PASS (R34-1..R34-6, realVerified=true; c-round-34.md/.json), published 3035ffc, review COMMIT OK"

it=I['TM-B36']
it['status']='done'; it['realVerified']=True
it['commit']='3035ffca98bbb8af4020c3a799b0d5b20515dacf'
it.setdefault('evidence',[]).extend([
 "C R34: red 279 passed / 2 failed on 9f5ac51 SchemaEditor.tsx with A's tests ((e1) :166:37 and (e2) :179:37 'expected undefined to be QTyped', setup assertions passed); A's tree 281/281 (17 files); alone (C runner) (e1) 3687, (e2) 3954, (e3) 2889, (e4) 3667, (e5) 3551, (w8) 3819 ms; mutants SM-1/SM-3/SM-4/SM-5 killed by (e1)(e2), SM-2 by (e3), DM-3 by (w8) (metadata assertion :361:46), C's CM-6/CM-8 killed, CM-7 (effect deps removed) equivalent with C's argument; gate verifyCommand exit 0, Biome 0/8 same list, renderer 281, main 93/93, E2E 7/7, --retries=0 7/7; real app old 9f5ac51 vs new: Q (old: reopened editor closes itself at +4012 ms, QTyped lost; new: stays open with QTyped, Add Field lists R34note + QTyped, Done closes in 31 ms, pending re-read applied: f.wav Category R34Fast + R34note input), QD (old closes at +3252 ms; new stays open with QTyped), N closes 136/137 ms; sha256 unchanged; ffprobe + music-metadata ICAT R34Fast/R34Slow; no R34note/QTyped in files; pageErrors empty; (e5) unit-only and StrictMode proven by (e2)(e3) only (stated); docs R34-6 PASS, README 17/9/5 recounted",
 "root gate round 34: published 3035ffc, review COMMIT OK (gates/round-34/review.md): 0 critical/high/medium, 4 low, 1 architecture note"])
D['D-41']['status']='verified (C R34 PASS), published 3035ffc (TM-B36)'

for fid in ['C-R33-02','QA-R33-01','C-R33-01','RR-R33-03','A-R33-04']:
    F[fid]['status']='closed'; F[fid]['closed_by']='TM-B36 (D-41), '+C34
F['RR-R33-03']['closed_by']+="; wording corrected by A/code-reviewer: a rejected loadSchema sets isLoaded true at once (App.tsx:37-39), the up-to-5 s wait happens only while loadSchema is slow or unfinished (B-R34-01)"
F['A-R33-02']['routed_to']='part (2) closed by TM-B36 (D-41, '+C34+'); part (1) = QA-R33-02 -> TM-B37 round 35 (D-42)'
F['A-R33-02']['status']='in_progress'
for fid in ['RR-R33-01','QA-R33-02']:
    F[fid]['status']='in_progress'
    F[fid]['routed_to']='TM-B37 round 35 (D-42: Done disabled + Applying... while pending, editing area locked by fieldset disabled, Back stays enabled; B R34 red (b-round-34-exp/))'
F['B-R32-01']['routed_to']='TM-B37 round 35 (D-42 gives the pending Done a visible Applying... state; wait length itself unchanged by design, D-40)'
F['QA-R33-03']['routed_to']='record; with D-42 (round 35) a never-settling scan shows Applying... until Back / Open Folder / Close Folder (TM-B37)'

new=[
 {"round":34,"id":"C-R34-01","source":"C R34-5 real app (c-round-34/r34-5-old-Q-03-after-wait.png, r34-5-new-Q-03-after-wait.png, r34-5-*-Q.json)","severity":"low","status":"open",
  "title":"Stale selection after a folder switch: while Open Folder fast's scan is pending, a click on a row of the old listing (s.wav) selects /slow/s.wav again; after fast loads the toolbar shows '1 selected · 1 files' with no highlighted row (path not in the new list); old build's panel shows 'Select a file to edit metadata'. Pre-existing on 9f5ac51 and A's tree, not caused by D-41",
  "routed_to":"TM-B39 (new item, todo low): needs a decision between pruning selectedPaths to listed paths when a load applies vs clearing selection on apply; after TM-B37"},
 {"round":34,"id":"C-R34-02","source":"C R34-2 (c-round-34/r34-2-alone.log, r34-2-red.log)","severity":"low","status":"open",
  "title":"Renderer test timing margin: on C's runner (e1)-(e5), (w8) take 2.9-3.95 s alone (5 s default timeout); A's qa-engineer saw an (e1) timeout under load. B R34 measurement (b-round-34-exp/): the same 6 MetadataPanel+FolderBrowser tests take 11.8 s with screen.getByRole button lookups and 0.84 s with a querySelectorAll('button') text lookup; B's first full-suite run of the prototype had cascading failures (later 3 full runs 287/287), so getByRole accessible-name computation is the likely cause (hypothesis, measured on one file only)",
  "routed_to":"TM-B38 (new item, test-only, todo low): replace getByRole in the slow component suites with a shared fast button helper; the round 35 test file already uses the fast lookup"},
 {"round":34,"id":"QA-R34-01","source":"A R34 qa-engineer probe P2 (a-round-34/qa-notes.md); B R34 red (b-round-34-exp/ (b5))","severity":"low","status":"in_progress",
  "title":"Two concurrent schema re-reads are last-writer-wins with the older schema: Done #1 (Qone, slow read) -> Back -> reopen -> add Qtwo -> Done #2 -> #2 lands, editor closes -> #1 lands last -> metadata/form lose qtwo values until the next Rescan/Done; display only (save skips undefined, metadata.ts:171). MetadataPanel handleSchemaChanged has only the folderLoadId guard",
  "routed_to":"TM-B37 round 35 (D-43: latest-Done-wins schemaReadIdRef in MetadataPanel); B reproduced red on 3035ffc: (b5) metadata lacks qtwo"},
 {"round":34,"id":"RR-R34-01","source":"root-review (gates/round-34/review.md low 1)","severity":"low","status":"in_progress",
  "title":"SchemaEditor handleSave: if onSave rejects, the await throws, onClose is never called and the promise from the Done click is unhandled (pre-existing; handleSchemaChanged does not reject today)",
  "routed_to":"TM-B37 round 35 (D-42: catch -> editor stays open, Done re-enabled; (b4) red on 3035ffc as an Unhandled Rejection)"},
 {"round":34,"id":"RR-R34-02","source":"root-review (gates/round-34/review.md low 2)","severity":"low","status":"in_progress",
  "title":"Clicking Done several times still starts several re-reads (no busy state / re-entrancy guard); deferred to TM-B37","routed_to":"TM-B37 round 35 (= QA-R33-02)"},
 {"round":34,"id":"RR-R34-03","source":"root-review (gates/round-34/review.md low 3)","severity":"info","status":"closed",
  "title":"(w8) pin for C-R33-01 was bundled into the round 34 commit; commit message should mention it","closed_by":"root note for its own commit message; nothing for agents"},
 {"round":34,"id":"RR-R34-04","source":"root-review (gates/round-34/review.md low 4)","severity":"info","status":"closed",
  "title":"Docs line refs (SchemaEditor.tsx :37, :39-44, :139, :140, :148) and README counts checked correct","closed_by":"observation, no action"},
 {"round":34,"id":"RR-R34-05","source":"root-review (gates/round-34/review.md architecture note)","severity":"info","status":"open",
  "title":"Architecture signal: MetadataPanel could own the whole 'save schema -> re-read -> close' flow and return a token or AbortSignal per open editor session; SchemaEditor would only render isSaving and stop tracking mount state. Suggested together with TM-B37",
  "routed_to":"signal. B R34: round 35 keeps the smaller D-42 (local isApplying in SchemaEditor) + D-43 (latest-wins id in MetadataPanel) because D-41 is freshly verified and each instance's pending state is already isolated by D-41; revisit if a third Done-flow guard is needed"},
 {"round":34,"id":"C-R34-03","source":"C R34 note; A R34 code-reviewer finding 2","severity":"info","status":"open",
  "title":"(e5)'s name says 'the panel stays on the form', but Open Folder clears the selection so the panel shows the empty state",
  "routed_to":"TM-B38 (test-only hygiene round): rename (e5) and the docs/bugs/001 entry 17 test name together"},
 {"round":34,"id":"B-R34-01","source":"B R34 (own error)","severity":"info","status":"closed",
  "title":"B's round 34 task wording for RR-R33-03 ('if the schema fails to load at startup') was wrong: a rejected loadSchema sets isLoaded true at once (App.tsx:37-39); only a slow or unfinished loadSchema keeps a drop waiting up to 5 s. A and code-reviewer corrected the docs; C confirmed against the code",
  "closed_by":"corrected in docs/bugs/001 by A in round 34 (C R34-6 PASS)"},
 {"round":34,"id":"B-R34-02","source":"B R34 measurement (b-round-34-exp/)","severity":"info","status":"open",
  "title":"TESTING.md rule candidate: in component suites that render FolderBrowser + MetadataPanel, screen.getByRole('button', {name}) costs ~1.5-2 s per test; a querySelectorAll('button') text lookup takes ~0.14 s per test",
  "routed_to":"TM-B38 (with C-R34-02); primitive change needs its own round ownership"},
 {"round":34,"id":"B-R34-03","source":"B R34 analysis of D-42/D-43","severity":"low","status":"open",
  "title":"Known limit kept by D-42/D-43: Done #1 pending, Back, reopen, add a field, and do NOT press Done again: if #1 was still waiting for a folder load, its re-read takes the schema after the wait and includes the new field; if #1's read was already running, the new field is not read until the next Done/Rescan (display only). Same as before round 35",
  "routed_to":"documented in docs/bugs/001 entry 18 by TM-B37 round 35; no code change"},
]
for f in new: b['findings'].append(f)

for r in b['rounds']:
    if r['round']==34:
        r['status']='PASS (C R34-1..R34-6, realVerified=true, bugs 2 low: C-R34-01, C-R34-02); root gate published 3035ffc (round 34), review COMMIT OK; TM-B36 done'
        r['findings']=sorted(set(r.get('findings',[])+[f['id'] for f in new]))

it=I['TM-B37']
it['status']='in_progress'; it['round']=35
it['decisions']=['D-42','D-43']
it['findings']=sorted(set(it['findings']+['QA-R34-01','RR-R34-01','RR-R34-02','B-R34-03']))
it['source']+="; QA-R34-01 (concurrent re-reads, last-writer-wins), RR-R34-01 (onSave reject unhandled)"
it['acceptance']=[
 "R35: SchemaEditor isApplying state: Done click sets it, Done is disabled and reads 'Applying...' while onSave is pending, the editing area (Active Fields controls, Hidden Standard Fields, Add Custom Field) sits in <fieldset disabled={isApplying}>, Back stays enabled; onSave reject -> editor stays open, Done enabled again, no unhandled rejection (D-42)",
 "MetadataPanel handleSchemaChanged takes a schemaReadIdRef id at its start and drops its result when a later Done started (D-43); every other src file unchanged",
 "tests (b1)-(b6) in tests/renderer/components/schema-editor-done-busy.test.ts: on 3035ffc src (b1)(b2)(b5) red on the symptom and (b4) red as an Unhandled Rejection, (b3)(b6) green; 287/287 in 18 files after; mutants BM-1..BM-5, DM-8, DM-10 killed, BM-6/DM-9 argued",
 "real app (C, old 3035ffc vs new): P (Done during a pending Open Folder: new shows disabled 'Applying...', locked inputs, Back enabled; a second Done click starts no extra read-batch IPC), X (QA-R34-01 with a per-call read-batch delay: new keeps Qtwo values, old loses them), N; sha256 + ffprobe + music-metadata",
 "docs/bugs/001 entry 18 (D-42/D-43, B-R34-03 limit), D-42 and D-43 bullets; README row count",
 "gate: verifyCommand green, renderer 287, main 93, E2E 7/7, --retries=0 7/7, Biome 0/8 same list"]
it['evidence_b']="B R34 (b-round-34-exp/): red-run.log on 3035ffc src: 284 passed / 3 failed of 287 ((b1) Done not disabled, (b2) 'expected 3 to be 2' reads of b, (b5) metadata lacks qtwo) + 1 Unhandled Rejection from (b4); prototype.diff.txt green-run.log 287/287 in 18 files (three full runs), Biome 0/8, tsc web + test clean; mutants.log: BM-1 (b1)(b2), BM-2 (b1), BM-3 (b4), BM-4 (b1), BM-5 (b1)(b2), DM-8 (b5), DM-10 (b5); BM-6 and DM-9 survive (argued equivalent)"

b['items'].append({"id":"TM-B38","type":"test","severity":"low",
 "source":"C-R34-02 (timing margin), B-R34-02 (getByRole cost), C-R34-03 ((e5) name)",
 "title":"Renderer component test speed and hygiene: replace screen.getByRole button lookups in the slow FolderBrowser + MetadataPanel suites with a shared fast helper so each test runs well under the 5 s default timeout; rename (e5); TESTING.md note",
 "status":"todo","depends_on":["TM-B37"],"decisions":[],
 "findings":["C-R34-02","B-R34-02","C-R34-03"],
 "acceptance":["to be planned after TM-B37: per-test durations before/after on the same runner, no timeout raised, assertions unchanged (mutation spot-check), test-only (reference-first exempt)"],
 "realVerified":False})
b['items'].append({"id":"TM-B39","type":"bug","severity":"low",
 "source":"C-R34-01 (C R34-5 real app)",
 "title":"Stale selection after a folder switch: a row of the old listing clicked during a pending Open Folder stays in selectedPaths after the new folder applies (toolbar '1 selected', no highlighted row)",
 "status":"todo","depends_on":["TM-B37"],"decisions":[],
 "findings":["C-R34-01"],
 "acceptance":["to be planned: red reproduction first; decision between pruning selectedPaths to listed paths on apply vs clearing; reference check (Explorer/Mp3tag selection on folder change) because the visible selection behaviour changes"],
 "realVerified":False})

b['decisions'].append({"id":"D-42","status":"planned R35 (TM-B37)",
 "decision":"Schema editor Done busy state (renderer only, SchemaEditor.tsx). A local isApplying state is set on Done; while it is true Done is natively disabled and reads 'Applying...' (same pattern as Save Tags: disabled + 'Saving...', MetadataPanel.tsx:369-372), and the editing area is wrapped in <fieldset disabled={isApplying} className='min-w-0 space-y-4 disabled:opacity-60'>, so no field can be added, removed, toggled or reordered while the re-read runs. Back (header, outside the fieldset) stays enabled: it is the escape and D-41 keeps the pending re-read harmless. If onSave rejects, the editor stays open and isApplying returns to false (no unhandled rejection). Reference: Mp3tag blocks with a 'Writing tag-data' progress dialog; W3C APG list: HTML disabled when the control should not stay focusable. Deviation: native disabled drops focus (GitLab/ARIA posts prefer aria-disabled + aria-busy); kept for consistency with Save Tags and because Back stays focusable",
 "contract_with":"none (renderer display only)"})
b['decisions'].append({"id":"D-43","status":"planned R35 (TM-B37)",
 "decision":"Latest Done wins (renderer only, MetadataPanel.tsx). handleSchemaChanged increments schemaReadIdRef at its start and, after its reads, returns without touching the store when a later handleSchemaChanged has started (checked together with isFolderLoadCurrent). Why: with D-41 a second editor can start a second re-read while the first is pending; the older one landing last overwrote the newer schema's values (QA-R34-01). Known limit B-R34-03 stays: a field added in a reopened editor without pressing Done again is read only if the pending re-read was still waiting for a folder load",
 "contract_with":"none (renderer display only)"})

b['rounds'].append({"round":35,"task":"TM-B37 schema editor Done busy state and latest-Done-wins re-read (D-42, D-43): Applying... + disabled Done, locked editing area, Back enabled, onSave reject handled, stale concurrent re-read dropped","status":"planned",
 "baseline":"3035ffca98bbb8af4020c3a799b0d5b20515dacf (clean)","items":["TM-B37"],"findings":["RR-R33-01","QA-R33-02","A-R33-02","QA-R34-01","RR-R34-01","RR-R34-02","B-R32-01","QA-R33-03","B-R34-03"]})
b['current_task']="Round 35: TM-B37 schema editor Done busy state and latest-Done-wins re-read (D-42, D-43) on baseline 3035ffc"
json.dump(b,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
print('ok')
