import json
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b=json.load(open(P))
assert b['version']==102, b['version']
b['version']=103
b['updated']='2026-10-23 (B round 104 -> round 105 planning)'
b['current_task']=('current-task.md (round 105: D-29z70 - a held drag no longer repeats the same status sentence (A-R104-REPEAT-DRAG): '
 'reduceArrangementStatus gains a required gestureActive flag; same string while a pointer gesture is claimed returns previous; '
 'the provider passes gestureCountRef.current > 0 from an inline reducer, gestureCountRef moved above useReducer (TDZ otherwise, B-reproduced); '
 'doc 092 l.4/l.60 (GATE104-S3); baseline 3b6178b + round 104 3 M + 4 ?? (gate 104 blocked); frozen b-round-104-r105-tree-sha256.txt 537/537; expected the same 3 M + 4 ??)')
OF={o['id']:o for o in b['open_findings'] if 'id' in o}
ev104='C round 104 PASS browserVerified=true realVerified=true (c-round-104.json); gate 104 BLOCKED (reviewer 7/10: A-R104-REPEAT-DRAG), not published'
OF['GATE96-S2-REPEATED-STATUS-NOT-ANNOUNCED']['status']=(
 'c_pass round 104, NOT published (gate 104 blocked) - carried into round 105 with A-R104-REPEAT-DRAG; '
 'C SR-REPEAT-SPACE 1280/1440 (exact text twice, second press adds a span, <output> same node, AX count 2/2, nothing plays), SR-REPEAT-FAILED-ROW (exact failed text twice, 0 clips), '
 'SR-TEXT-REG, AN-REVIEW m1-m4 red; '+ev104)
OF['GATE103-S5-DOC091-STATUS']['status']='c_pass round 104 (SOURCE-UNCHANGED doc 091 only l.4), NOT published (gate 104 blocked); doc 091 frozen at its round 104 state in round 105; closes at publication'
new=[
 {'id':'A-R104-REPEAT-DRAG','severity':'medium','status':'dispatched round 105 (D-29z70): gesture-aware reduceArrangementStatus (same string while gestureCountRef > 0 -> previous); provider-only, no call-site change; B probe b-round-104/probe: tsc 0, biome 0 diagnostics, 69 files 1123/1123, probe SU5 green','to':'A round 105','title':'round 104 made every identical setStatus(string) during a drag replace the keyed span: a blocked drag announced the same sentence on every pointermove and re-rendered the provider','evidence':'c-round-104.json bugs[0]; c-round-104/out/blocked-1280x720.json (81 moves -> 81 spans, 80 identical), drag-1280x720.json (21 identical Fade In spans); gates/round-104/review.md #1'},
 {'id':'GATE104-S2-LOADING-ANNOUNCED-AT-MOUNT','severity':'low','status':'open - recorded, not scheduled (reviewer accepted it): the mount effect sets copy.loading again, sequence 0 -> 1 (2 in StrictMode), the loading text may be announced once after hydration; optional fix: updater form () => copy.loading in that effect (check the round 94 collection-swap reset first)','to':'Lows batch','title':'the loading text may be announced once after hydration','evidence':'gates/round-104/review.md #2; doc 092 problems section'},
 {'id':'GATE104-S3-DOC092-STATUS','severity':'low','status':'dispatched round 105 (doc 092 l.4 and the l.60 hand-off entry)','to':'A round 105','title':'doc 092 l.4 still says waiting for C and l.60 hands the drag repeat to B','evidence':'gates/round-104/review.md #3; c-round-104.md'},
 {'id':'GATE104-S4-STATUSSEQUENCE-PUBLIC','severity':'info','status':'recorded - no code: statusSequence on the public useArrangement() shape is additive, in both value sites (reviewer: fine)','to':'B record','title':'statusSequence added to the context value','evidence':'gates/round-104/review.md #4'},
 {'id':'ARCH-R104-STATUS-COALESCING','severity':'info','status':'consumed by round 105: the reviewer Architecture note (Signal 4, verdict keep) proposed exactly the gesture-aware coalescing next to gestureCountRef that round 105 implements; no separate checkpoint item','to':'B record','title':'the rule for coalescing repeats during a gesture belongs in the provider, not at 60+ call sites','evidence':'gates/round-104/review.md Architecture note'},
 {'id':'B-R104-SR-REGION-STABLE-SPEC','severity':'info','status':'closed - B correction recorded: round 104 SR-REGION-STABLE assumed Space play/pause sets a status; togglePlayback sets status only for an empty project or play past the end, so only 2 distinct texts can appear; its intent (same node, one child across distinct texts) is folded into round 105 SR-TEXT-REG; not a finding against A','to':'B record','title':'round 104 SR-REGION-STABLE was written wrongly','evidence':'c-round-104.json notPassed[0]; c-round-104/out/stable-1280x720.json'},
 {'id':'B-R104-TDZ-IN-REVIEW-SNIPPET','severity':'info','status':'recorded - B probe: the reviewer snippet (inline reducer reading gestureCountRef at the useReducer call) throws ReferenceError: Cannot access gestureCountRef before initialization because the ref is declared 74 lines later; round 105 moves the ref line above useReducer','to':'B record','title':'the gate 104 fix snippet needs the gestureCountRef declaration moved','evidence':'b-round-104/probe (TDZ run); b-round-104.md'},
]
ids={o['id'] for o in b['open_findings'] if 'id' in o}
for n in new:
    assert n['id'] not in ids, n['id']
    b['open_findings'].append(n)
for r in b['rounds']:
    if r['round']==104:
        r['status']='c_pass_gate_blocked'
        r['result']=('C PASS browserVerified=true realVerified=true (SR-REPEAT-SPACE 1280/1440, SR-REPEAT-FAILED-ROW, SR-DRAG-STREAM 3/3, SR-TEXT-REG, PX-NET, REG-HYD, G104-3 (fake-Bearer BLOCKED backend), '
          'AN-REVIEW, T104-TARGETED 69 files 1122/1122, SOURCE-UNCHANGED; SR-REGION-STABLE not met as written = B spec error); 1 bug A-R104-REPEAT-DRAG (medium); '
          'gate 104 BLOCKED: "reviewer did not return COMMIT: OK" - COMMIT: BLOCK (A-R104-REPEAT-DRAG: this commit adds a Medium regression to an existing flow in order to fix a Low a11y bug ...); verify passed (146 files, 2263 tests, build green); head 3b6178b')
b['rounds'].append({'round':105,'task':'current-task.md','decision':'D-29z70','status':'dispatched',
 'items':['A-R104-REPEAT-DRAG','GATE104-S3-DOC092-STATUS','GATE96-S2-REPEATED-STATUS-NOT-ANNOUNCED (carried, publish together)','GATE103-S5-DOC091-STATUS (carried, publish together)'],
 'note':('Gesture-aware status coalescing: same string while a pointer gesture is claimed returns previous (no commit, no span change). '
   'baseline HEAD 3b6178b + round 104 3 M + 4 ?? (gate 104 blocked); frozen b-round-104-r105-tree-sha256.txt 537/537; snapshots b-round-104-r105-snapshots; expected the same 3 M + 4 ??. '
   'Regression round not due (2026-10-21 -> 2026-10-23 = 2 days); the next B planning on/after 2026-10-24 is the regression round.'),
 'owned':['app/lib/arrangement/status-announcement.ts (required gestureActive parameter)',
   'app/contexts/ArrangementContext.tsx (move gestureCountRef above useReducer; inline reducer argument; two type imports; nothing else)',
   'app/lib/arrangement/__tests__/status-announcement.test.ts (SA1-SA5 third argument false; SA6/SA7)',
   'app/lib/arrangement/__tests__/status-announcement-ui.test.tsx (SU5/SU6; SU1-SU4 byte-identical)',
   'docs/implementation/2026/quarter-IV/092-studio-status-repeat-announcement.md (l.4, l.60, testing, TODO)'],
 'c_ids':['HD-BLOCKED-HOLD','HD-FADE-CLAMP','HD-READOUT-CHANGING','SR-REPEAT-SPACE','SR-REPEAT-FAILED-ROW','SR-TEXT-REG','PX-NET','REG-HYD','G105-3','AN-REVIEW','T105-TARGETED','SOURCE-UNCHANGED']})
b['baseline_tree_at_round105']={'head':'3b6178b758253d5098cea19f07c43e4799cb9299','dirty':'round 104 3 M + 4 ?? (gate 104 blocked)','list':'tmp/studio-real-loop/b-round-104-r105-tree-sha256.txt','count':537,
 'snapshots':'tmp/studio-real-loop/b-round-104-r105-snapshots',
 'excluded':['app/contexts/ArrangementContext.tsx','app/lib/arrangement/status-announcement.ts','app/lib/arrangement/__tests__/status-announcement.test.ts','app/lib/arrangement/__tests__/status-announcement-ui.test.tsx','docs/implementation/2026/quarter-IV/092-studio-status-repeat-announcement.md']}
for t in b['tech_lead_manual_checks']:
    if t['id']=='R104-T':
        t['what']+='; additionally (round 105): hold a blocked clip drag and a clamped fade for ~2 s - the sentence is spoken once, not repeated'
        t['status']='open (after round 105 C PASS and publication)'
s=json.dumps(b,ensure_ascii=False,indent=1)
open(P,'w').write(s+'\n')
print('ok', b['version'], len(b['open_findings']), len(b['rounds']))
