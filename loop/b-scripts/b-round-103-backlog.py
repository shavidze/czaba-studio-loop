import json, io
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b=json.load(open(P))
assert b['version']==101, b['version']
b['version']=102
b['updated']='2026-10-23 (B round 103 -> round 104 planning)'
b['current_task']=('current-task.md (round 104: D-29z69 - repeated identical status text is announced again (GATE96-S2): '
 'status kept in a pure reducer reduceArrangementStatus (app/lib/arrangement/status-announcement.ts) with a sequence that grows on every setStatus(string); '
 'the <output aria-live=polite> stays mounted and only an inner <span key={statusSequence}> is replaced; the l.1484 functional restore does not bump when unchanged; '
 'doc 091 l.4 (GATE103-S5); new doc 092; baseline 3b6178b clean; frozen b-round-103-r104-tree-sha256.txt 535/535; expected 3 M + 4 ??)')
OF={o['id']:o for o in b['open_findings'] if 'id' in o}
ev103='C round 103 PASS browserVerified=true realVerified=true (c-round-103.json); gate 103 published 3b6178b'
def close(i, how):
    o=OF[i]; o['status']=f'closed round 103 - {how}; {ev103}'
close('GATE89-S3-WORKER-NO-WATCHDOG','C WD-STALL 1280/1440 (alert 30 008.7/30 009.4 ms, terminate 1, 0 downloads), WD-CANCEL (terminate 1 at +35 s, 0 alerts), WD-ERRTEXT exact text, WD-MP3 (0 unpkg), WD-SLOW (CPU 6x, max gap 145 ms), AN-REVIEW m1/m3/m5 red')
close('C-R90-MUT-B-CU4-GAP','CU10 kept: C AN-REVIEW m6 (ArrangementContext l.2915-2917 removed in scratch) red 3/3, unmutated green 3/3')
close('A-R87-LOW-PU-ORDER','C PU-ALONE: -t PU1/PU2/PU3 pass alone with the new file, baseline PU2 red (by assertion, not timeout - B task wording corrected), 8 tests, it bodies byte-identical')
close('GATE102-S5-DOC090-STATUS','C SOURCE-UNCHANGED doc 090 single hunk @@ -4 +4 @@')
new=[
 {'id':'GATE103-S1-PRE-FIRST-PROGRESS-SILENCE','severity':'low','status':'open - conditional, not scheduled: C WD-SLOW measured construction-to-first-progress 145 ms (= the largest gap) at page CPU throttle 6x, 0.5 % of 30 000 ms; worker-thread throttling itself not confirmed (CDP session on the page). Reopen with a worker progress 0 before measureExportOverload if a measurement approaches 10 s (reviewer rule); optional stronger check: throttle the worker target (CDP auto-attach) or a much longer project','to':'B (conditional)','title':'the stall timer is armed before the worker sends anything; module load + measureExportOverload + clamp run silently before the first progress','evidence':'gates/round-103/review.md #1; c-round-103.json measurements WD-SLOW; a-round-103.md reviewer #3'},
 {'id':'GATE103-S2-STALL-SECONDS-DUPLICATED','severity':'info','status':'open - Lows batch nit (EW8f pins both the constant and the text, so drift is caught); build the message from the constant when export-wav.client.ts is next owned','to':'Lows batch','title':'"30" is written in ARRANGEMENT_WAV_WORKER_STALL_TIMEOUT_MS and again in the stalled message','evidence':'gates/round-103/review.md #2; a-round-103.md reviewer #8'},
 {'id':'GATE103-S3-ENGINE-TEXT-UNCAPPED','severity':'low','status':'open - Lows batch (a11y/UX: cap length ~120 chars or map known engine messages; no XSS - React text node); with export-wav.client.ts or the status owner','to':'Lows batch','title':'the worker error text is appended uncapped and possibly in English inside the Georgian role=alert','evidence':'gates/round-103/review.md #3; a-round-103.md reviewer #5; doc 091 TODO'},
 {'id':'GATE103-S4-CU10-MICROTASK-NOTE','severity':'info','status':'recorded - no code: a red CU10 after a refactor of exportMp3 or raceArrangementExportAbort means "recount the microtasks" (the removeEventListener witness fires), not necessarily a regression; see doc 091 CU10 section','to':'B record','title':'CU10 depends on the exact microtask count before cancelExport','evidence':'gates/round-103/review.md #4; a-round-103.md m7'},
 {'id':'GATE103-S5-DOC091-STATUS','severity':'low','status':'dispatched round 104 (doc 091 l.4)','to':'A round 104','title':'doc 091 l.4 still says awaiting C although C round 103 passed and gate 103 published 3b6178b','evidence':'gates/round-103/review.md #5'},
 {'id':'A-R103-EW5-TITLE-NIT','severity':'info','status':'open - Lows batch (test title nit; EW5 title "exact message" is a prefix match now); with the next export-wav.test.ts owner','to':'Lows batch','title':'EW5 title says exact message while the worker text is now appended','evidence':'a-round-103.md reviewer #7; c-round-103.md Return to B 3'},
 {'id':'ARCH-R103-EXPORT-ABORT-CONTRACT-DOC','severity':'info','status':'open - architecture signal, not scheduled; addendum (p) to the pending checkpoint request (b-round-91-checkpoint-request.md); proposal: docs/technical/ note on the export pipeline abort contract (who removes which listener, where signal.aborted is checked), CU1-CU10 unchanged, no code','to':'root/B','title':'exportMp3 cancel/abort ordering in ArrangementContext.tsx has needed microtask-sensitive tests over several rounds (CU4, CU10)','evidence':'gates/round-103/review.md Architecture note Signal 3; Signal 4 (export-wav.client.ts detachWorker) = keep'},
 {'id':'B-R103-T3-WORDING-CORRECTION','severity':'info','status':'closed - B correction recorded: round 103 task said baseline PU2 fails by the 15 s timeout and "same for PU1"; it fails by assertion and PU1/PU3 are green on the baseline (A and C both showed it); not a finding against A','to':'B record','title':'round 103 T3 failure-mode wording was wrong','evidence':'a-round-103.md T3 proof; c-round-103.md Return to B 2'},
 {'id':'C-R103-UNREVIEWED-DELTA','severity':'info','status':'closed - gate 103 review explicitly covers detachWorker and the CU10 witness ("Checked and found sound"); score 9/10','to':'root','title':'A code-reviewer saw only the pre-detachWorker version','evidence':'c-round-103.md Return to B 3; gates/round-103/review.md'},
]
ids={o['id'] for o in b['open_findings'] if 'id' in o}
for n in new:
    assert n['id'] not in ids, n['id']
    b['open_findings'].append(n)
g=OF['GATE96-S2-REPEATED-STATUS-NOT-ANNOUNCED']
g['status']=('dispatched round 104 (D-29z69): pure reducer reduceArrangementStatus (status-announcement.ts), sequence grows on every setStatus(string); '
 'functional restore unchanged text = same object; <output aria-live=polite> stays mounted, inner <span key={statusSequence}> replaced; '
 'B scratch probe b-round-103/probe2: tsc 0, Biome lint 0 new warnings (a useCallback wrapper gave 29 useExhaustiveDependencies warnings), 67 provider test files 1113/1113 green; '
 'real screen-reader announcement = Tech Lead (with GATE102-S1)')
for r in b['rounds']:
    if r['round']==103:
        r['status']='c_pass_published'
        r['result']=('C PASS browserVerified=true realVerified=true (WD-STALL 1280 30 008.7 ms / 1440 30 009.4 ms exact text, terminate 1, 0 downloads; WD-CANCEL terminate 1 at +35 s, 0 alerts; '
          'WD-ERRTEXT exact; WD-MP3 0 unpkg; WD-SLOW CPU 6x one valid WAV, max gap 145 ms; EXPORT-REG WAV 29 189 420 B 101.352 s + MP3 decodes, identical to round 102; CANCEL-REG; PX-NET; REG-HYD; '
          'G103-3 (fake-Bearer BLOCKED backend); PU-ALONE; AN-REVIEW fail-before EW8a/b/c/e/f, m1/m3/m5/m6 red, CU10 3/3; T103-TARGETED 9 files 100/100; SOURCE-UNCHANGED); 0 bugs; '
          'gate 103 published 3b6178b (reviewer 9/10, verify 144 files 2254 tests, build green)')
b['rounds'].append({'round':104,'task':'current-task.md','decision':'D-29z69','status':'dispatched',
 'items':['GATE96-S2-REPEATED-STATUS-NOT-ANNOUNCED','GATE103-S5-DOC091-STATUS'],
 'note':('Repeated identical status text is announced again: pure reducer + sequence; inner keyed span inside the stable <output aria-live>. doc 091 l.4; new doc 092. '
   'baseline HEAD 3b6178b clean; frozen b-round-103-r104-tree-sha256.txt 535/535; snapshots b-round-103-r104-snapshots; expected 3 M + 4 ??. '
   'Regression round not due (2026-10-21 -> 2026-10-23 = 2 days); the next B planning on/after 2026-10-24 is the regression round.'),
 'owned':['app/contexts/ArrangementContext.tsx (status state l.535 -> useReducer; ArrangementContextValue + both value sites add statusSequence; nothing else)',
   'app/components/arrangement/StudioWorkspace.tsx (destructure l.436-450 adds statusSequence; status <output> l.2440-2446 inner keyed span; nothing else)',
   'app/lib/arrangement/status-announcement.ts (new)','app/lib/arrangement/__tests__/status-announcement.test.ts (new)',
   'app/lib/arrangement/__tests__/status-announcement-ui.test.tsx (new)',
   'docs/implementation/2026/quarter-IV/091-studio-export-worker-watchdog.md (l.4)','docs/implementation/2026/quarter-IV/092-studio-status-repeat-announcement.md (new)'],
 'c_ids':['SR-REPEAT-SPACE','SR-REPEAT-FAILED-ROW','SR-REGION-STABLE','SR-DRAG-STREAM','SR-TEXT-REG','PX-NET','REG-HYD','G104-3','AN-REVIEW','T104-TARGETED','SOURCE-UNCHANGED']})
b['baseline_tree_at_round104']={'head':'3b6178b758253d5098cea19f07c43e4799cb9299','list':'tmp/studio-real-loop/b-round-103-r104-tree-sha256.txt','count':535,
 'excluded':['app/contexts/ArrangementContext.tsx','app/components/arrangement/StudioWorkspace.tsx','docs/implementation/2026/quarter-IV/091-studio-export-worker-watchdog.md']}
tl=b['tech_lead_manual_checks']
tl.append({'id':'R104-T','what':'real screen reader (NVDA + Chrome, and VoiceOver/Safari if available): on /studio-lab press Space twice on an empty project and Enter twice on a failed library row - the identical status sentence is spoken both times; during a clamped fade drag the readout does not queue an unreasonable backlog','status':'open (after round 104 C PASS)'})
s=json.dumps(b,ensure_ascii=False,indent=1)
open(P,'w').write(s+'\n')
print('ok', b['version'], len(b['open_findings']), len(b['rounds']))
