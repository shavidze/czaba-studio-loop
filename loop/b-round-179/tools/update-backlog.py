import json,sys
P='backlog.json'
b=json.load(open(P))
ADD='2026-10-26 B round 179 -> 180 planning (D-29z145)'
b['updated']='2026-10-26 (B round 179 -> 180 planning, D-29z145)'
b['current_task']=("current-task.md (round 180: D-29z145 - DUX-R-5b-3b drag feedback + R35: Lane library ghost/lane-move ghost valid -> foreground, blocked -> muted; "
 "file-drag ring video foreground / audio muted; drop hint text-foreground; video import compact+full and LibraryPreview Add -> border-outline-strong text-foreground; "
 "DUX-R-5 stage exit INVENTORY-EXIT K7-K12; baseline HEAD 15189d5 (gate 179 published), tree = c-round-179/end-tree-sha256.txt 1003; grants b-round-179-r180-grants.txt (6), new 2, frozen 997; "
 "vitest base b-round-179-r180-vitest-base.txt 13 files 242/242; new drag-feedback-colour-ui DXG1-DXG7; mutations m291-m298; doc 147 Completed, new doc 148)")
b['advisor_used_by_B']=("2026-10-26 round 179 -> 180 planning: advisor available and consulted after orientation (before writing) and at the end; advice followed: proved baseline with sha256sum -c of c-round-179 end tree; "
 "named Ruler l.233 playhead handle (K8) and ExportDialog l.615 primary Export (K9) in the stage-exit K table; R35 keeps a visible border (outline-strong) because both test locks exclude border-transparent; "
 "valid/blocked lightness step (foreground vs muted, 2.21) and refusal hint foreground (W5); active-lane tint R-B 6.65 computed; vitest base widened to 13 files (8 testid suites + 5 colour suites) and run by B (242/242); "
 "C gesture harness pointers (c-round-139 ghostprobe, c-round-80 probe-ghost, round-178 REFUSAL) and synthetic file DragEvent declared runnable; decision files checked by content")
of=b['open_findings']
def find(i):
    for f in of:
        if isinstance(f,dict) and f.get('id')==i: return f
    raise SystemExit('missing '+i)
pub='closed 2026-10-26: C round 179 PASS (c-round-179.json browserVerified=true realVerified=true, 0 bugs); rounds 178+179 published 15189d5 (gates/gate-round-179.json)'
for i in ['C-R178-BADGE-SELECTOR','C-R177-G1-562','GATE177-S5-DOC146-STATUS']:
    f=find(i); f['status']=pub+' | was: '+f['status']; f['closed']=ADD
f=find('B-R174-ACCENT-EQ-BRAND'); f['status']=f['status']+' | round 180 (D-29z145): ghosts/ring valid foreground vs blocked muted (2.21 lightness step), hint foreground; closes on C PASS of round 180'
f=find('ARCH-R178-SIGNAL3'); f['status']=f['status']+' | round 179: reviewer note repeats (sixth mention; whole round 179 spent on selector repair); appended to b-round-173-checkpoint-request.md'
of += [
 {"id":"C-R179-SELECTOR-SWEEP","severity":"info","status":"used by B for round-180 grants: 0 DOM selectors on 5b-3b tokens; 3 className locks granted (affordance-colour-ui l.159, lane-strings-ui l.505, library-row-strings-ui l.578-579/586); l.842/l.874 had no lock -> new DXG suite","evidence":"c-round-179.json info[0]; c-round-179/out/selector-sweep-raw.txt","added":ADD},
 {"id":"C-R179-DOC147-STALE","severity":"info","status":"scheduled round 180 D1 (doc 147 Completed; l.124 TODO and round-178 'B must decide' entry annotated as resolved in round 179)","evidence":"c-round-179.json info[1]; a-round-179.md code review","added":ADD},
 {"id":"C-R179-EXPORT-PEAK","severity":"info","status":"same signal as C-R178-EXPORT-CLIPS-AT-0DB (product question, not scheduled); not duplicated as a task","evidence":"c-round-179.json info[2]","added":ADD},
 {"id":"ARCH-R179-SIGNAL3","severity":"info","status":"architecture signal, not scheduled: shared workspace mount/fakes harness, findCollectionBadge(header) by text, one token-assertion helper for className colour locks; appended to b-round-173-checkpoint-request.md; fresh bounded frontend-architect request after DUX-R-5 C PASS, before M1","evidence":"a-round-179.md Architecture note (verbatim)","added":ADD},
]
for r in b['rounds']:
    if r.get('round')==179:
        r['status']='C PASS (c-round-179.json browserVerified=true realVerified=true, 0 bugs; 1 sub-check BLOCKED backend); published with round 178 as 15189d5 (gate 179)'
b['rounds'].append({"round":180,"task":"current-task.md","decision":"D-29z145","status":"dispatched",
 "items":["DUX-R-5b-3b (Lane ghosts G1-G4, file-drag ring R1, hint H1, R35 import I1/I2, LibraryPreview Add I3)","DUX-R-5 stage exit (INVENTORY-EXIT K7-K12, ENV-VIS)","C-R179-DOC147-STALE (doc 147 Completed)"],
 "note":"baseline HEAD 15189d5 (gate 179 published, clean tree); tree = c-round-179/end-tree-sha256.txt (1003); grants b-round-179-r180-grants.txt (6); new b-round-179-r180-new-files.txt (2); frozen 997 (b-round-179-r180-tree-sha256.txt); start copies b-round-179/r180-granted-start/; vitest base 13 files 242/242 (b-round-179/out/vitest-base-r180.json)","added":ADD})
q=b['post_current_stage_queue']
v=[e for e in q if e['id']=='VISUAL-A-OBSIDIAN'][0]
v['status']=v['status']+(" | round 180 planning (D-29z145): DUX-R-5b-3a done (rounds 178+179, C round 179 PASS browserVerified=true realVerified=true, round-178 browser rows carried by HASH-CARRY, published 15189d5); "
 "C-R178-BADGE-SELECTOR, C-R177-G1-562, GATE177-S5 closed; regression not due (due on/after 2026-10-27); DUX-R-5b-3b = round 180 (last DUX-R-5 slice + stage-exit INVENTORY-EXIT); "
 "on C PASS DUX-R-5 done -> fresh frontend-architect request; round 181 REGRESSION if planned on/after 2026-10-27; then M1, M3, M4, ROOT-RECON-GRID-HARNESS; checkpoint unanswered, fallback (c)")
for i,o in enumerate(v['order']):
    if o.startswith('DUX-R-5 one colour rule'):
        v['order'][i]=o+' | D-29z145: 5b-3a done (rounds 178+179, 15189d5); 5b-3b drag feedback + R35 = round 180 (stage exit)'
v['dux_r5b3b_plan_d29z145']={
 "round":180,
 "edits":{"G1":"Lane l.886 library ghost blocked/refused/notReady -> 'border-muted bg-muted/20 text-muted'",
  "G2":"l.887 library ghost valid -> 'border-foreground bg-foreground/15 text-foreground'",
  "G3":"l.922 lane-move ghost blocked -> 'border-muted bg-muted/20 text-muted'",
  "G4":"l.923 lane-move ghost valid -> 'border-foreground bg-foreground/20 text-foreground'",
  "R1":"l.842 file-drag ring video ring-foreground / audio (refused) ring-muted",
  "H1":"l.874 drop hint text-foreground both branches (conditional removed; plain className if cn left with one fixed string)",
  "I1/I2":"Lane l.723 compact / l.731 full video import border-brand/text-brand -> border-outline-strong/text-foreground",
  "I3":"LibraryPreview l.332 Add -> border-outline-strong/text-foreground",
  "L1":"affordance-colour-ui LATER_STAGE_BRASS_SITES Lane ghost 2 -> 0, TODO removed",
  "L2":"lane-strings-ui l.505-506 import includes/excludes",
  "L3":"library-row-strings-ui l.578-579/586 Add includes/excludes",
  "N1":"new drag-feedback-colour-ui.test.tsx DXG1-DXG7",
  "D1":"doc 147 Completed + C-R179-DOC147-STALE annotations","D2":"new doc 148"},
 "rulings":{"R36":"drag feedback valid = foreground, blocked/refused = muted (5b-2a lightness step 2.21; warning/destructive fail R-B>=45 brass scan); vetoable",
  "R37":"refused file-drop hint text-foreground (W5 precedent: the only message for the refusal); vetoable",
  "R35-recipe":"import/Add keep a visible border: border-outline-strong (W2 badge border, 3.30-3.70) + text-foreground; tests exclude border-transparent so the Preview-toggle recipe is not used; vetoable",
  "K-exit":"Ruler l.233 playhead handle -> K8; ExportDialog l.615 dialog primary Export -> K9 (named explicitly)"},
 "computation":"b-round-179/out/contrast.txt: valid 15.62/14.70, blocked 7.06/6.65, valid vs blocked 2.21, ghost label 14.87/6.76, outline-strong vs surface 3.50 / elevated 3.30 / background 3.70; active lane brand/5 tint R-B 6.65",
 "mutations":"m291-m298",
 "c_rows":"T180-TARGETED, SCOPE-180, AN-REVIEW-180, MUT-180, CC-DRAG, CC-R35, NO-BRASS-DRAG, CONTRAST-DRAG, BEHAVIOUR-DRAG, INVENTORY-EXIT, ENV-VIS, RV1-DUX5B3B, G180-3, FUNC-SMOKE-180, PX-NET/REG-HYD",
 "ableton":"drag feedback colour and add/import colour not captured (parity unverified); behaviour unchanged (not applicable)",
 "user_vetoable":True,"added":ADD}
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok', len(of))
