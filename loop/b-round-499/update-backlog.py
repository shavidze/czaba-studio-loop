import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; B=f'{L}/b-round-499'
if os.path.exists(f'{B}/update-backlog.done'): sys.exit('already applied')
p=f'{L}/backlog.json'; b=json.load(open(p))
assert b['version']==492, b['version']
WHO='2026-11-13 B round 499 -> 500 planning'
b['version']=493; b['updated']='2026-11-13'
b['current_task']=("Round 500: DPG-BUTTON-CLEANUP-2 stage 2b-1 re-dispatch: A applies the delta b-round-499/sketch-500.patch.txt (sha 79835ecd) on its round-499 tree "
 "(SE1 /store error Try again DOM row in product-price-cards.test.tsx; pair order, type=button and reload pin in the 2b-1 test; ErrorDisplay Try Again type=button; DESIGN_SYSTEM wording; doc 321 round-500 text); "
 "C runs the full C0-C14 in the browser (current-task.md)")
for r in b['rounds']:
    if r.get('round')==499:
        r['status']='C FAIL (short route L22; browserVerified false); gate 499 skipped'
        r['result_note']='A STOP on reviewer Medium A-R499-CR-STORE-TRY-UNPINNED (origin B spec); C confirmed; C0/C12/C13/C14 PASS; A tree kept for round 500 (D-29z1792)'
b['rounds'].append({'round':500,'task':'current-task.md','decision':'D-29z1793','type':'DPG-BUTTON-CLEANUP-2 stage 2b-1 re-dispatch (delta: SE1 /store pin + reviewer Lows)','status':'dispatched','note':'baseline 82e118a + A round-499 tree; delta b-round-499/sketch-500.patch.txt sha 79835ecd; tech-lead APPROVE'})
dec=[
 ('D-29z1792',"Round 499 not accepted: C FAIL on the L22 short route (A STOP on an unruled reviewer Medium), browserVerified/realVerified false; gate 499 skipped. Baseline stays 82e118a; A's round-499 tree (5 M + 2 untracked) is kept and round 500 applies a delta on it. Stage 2b-1 not done; no item moves to done."),
 ('D-29z1793',"A-R499-CR-STORE-TRY-UNPINNED (Medium, origin B spec, confirmedBy C round 499) ruled option (a): new DOM row SE1 in product-price-cards.test.tsx renders StorePage through the real loader with getProducts rejected and asserts one alert, one link, 'Try again', href /store and the exact primary lg pill class; mutants N10-N13, N17 red. Option (b) rejected: the gate runs no browser rows. Counted as an L58 planning FAIL for RETRO 510 (round-499 matrix pinned this site by source substring only; tech-lead had rated it Info). Remedy: site x attribute matrix in b-round-499/sketch-review.md."),
 ('D-29z1794',"A's round-499 reviewer Lows fixed in the round-500 delta inside already-granted files, each closing with C round 500 PASS: A-R499-CR-PAIR-ORDER (isBefore in B2B-1..3; N16, N18), A-R499-CR-TRYAGAIN-TYPE (type=button; B2B-3/4; N15), A-R499-CR-DS-SAME-RULE (DESIGN_SYSTEM l.1193 explicit rule), A-R499-CR-DOC321-WORDING (D1 heights from measure/summary.txt, build line from the re-run build, coverage sentence). Reload handler pinned by B2B-5 source pin (N14); click not possible in jsdom (pre-ruled #8)."),
 ('D-29z1795',"Consults for round 500: tech-lead adversarial review of the frozen delta sha 79835ecd -> APPROVE, no Medium; Lows TL-R500-SE1-SPY-FINALLY, TL-R500-LINK-MOCK-DROPS-PROPS, TL-R500-DOC321-D1-WORDING -> deferred_low_polish; icon identity -> confirmedBy A-R498-CR-ICON-ASSERT; duplicate literal oracle and the L28 status line -> pre-ruled. No product-designer (no UX change; §1 reference carried). No architecture checkpoint (small change, one owner; SIG-R498-BUTTONLINK-WRAPPER stays a signal, re-evaluate at 2b-3)."),
]
for i,t in dec:
    b['decisions_log_b'].append({'id':i,'date':'2026-11-13','by':WHO,'decision':t})
of=b['open_findings']
def find(i):
    for f in of:
        if f.get('id')==i: return f
    return None
new_open=[
 ('A-R499-CR-STORE-TRY-UNPINNED','medium','B spec','open (D-29z1793): ruled option (a); fixed in b-round-499/sketch-500.patch.txt (SE1 + mutants N10-N13, N17); closes with C round 500 C9/C10 PASS',"No test pinned the /store error 'Try again' link's builder args or `to` (B2B-5 checked only a source substring)",'a-round-499.md STOP; c-round-499.json bugs[0]'),
 ('A-R499-CR-PAIR-ORDER','low','B spec','open (D-29z1794): fixed in sketch-500 (isBefore B2B-1..3; N16, N18); closes with C round 500 PASS','No row asserted the order of the EmptyState and error-page button pairs','a-round-499.md reviewer Lows'),
 ('A-R499-CR-TRYAGAIN-TYPE','low','pre-existing','open (D-29z1794): fixed in sketch-500 (type=button; B2B-3/4; N15); closes with C round 500 PASS','ErrorDisplay Try Again <Button> had no type="button"','a-round-499.md reviewer Lows'),
 ('A-R499-CR-DS-SAME-RULE','low','B spec','open (D-29z1794): fixed in sketch-500 (DESIGN_SYSTEM l.1193 explicit rule phrase); closes with C round 500 C11','DESIGN_SYSTEM Ghost "Use for": „იგივე წესი“ read ambiguously after the 404 text-link sentence','a-round-499.md reviewer Lows'),
 ('A-R499-CR-DOC321-WORDING','low','A','open (D-29z1794): fixed in sketch-500 (doc 321 D1 heights, build line, coverage sentence); closes with C round 500 C11','Doc 321 l.30 D1 height cause, build line rc wording and l.83 coverage sentence overstated or imprecise','a-round-499.md Doc 321 Lows; b-round-498/measure/summary.txt'),
]
for i,sev,orig,st,title,ev in new_open:
    assert find(i) is None, i
    e={'id':i,'severity':sev,'origin':orig,'status':st,'title':title,'evidence':ev,'added':WHO}
    if i=='A-R499-CR-STORE-TRY-UNPINNED': e['confirmedBy']=['C round 499 (c-round-499.json bugs[0])']
    of.append(e)
f=find('B-R498-DOC320-L28'); f['status']='open (D-29z1792): round 499 C11 not run (short route); fix stays in the tree; closes with C round 500 C11 | '+f['status']
f=find('DPG-BUTTON-CLEANUP-2'); f['status']='in_progress (D-29z1792, D-29z1793): 2b-1 C FAIL round 499 (unpinned /store link, A STOP), re-dispatched as round 500 delta; 2b-2, 2b-3, 2c-2e, NONBRAND remain | '+f['status']
f.setdefault('substages_d29z1789',{})['2b-1']='round 499 C FAIL (short route); round 500 delta b-round-499/sketch-500.patch.txt; scanner 109/44 unchanged'
dl=b['deferred_low_polish']
for i,title,ev in [
 ('TL-R500-SE1-SPY-FINALLY',"SE1's console.error spy is restored inline; it leaks into later tests only when SE1's own assert fails (wrap in try/finally or afterEach restoreAllMocks)",'b-round-499/sketch-review.md finding 1'),
 ('TL-R500-LINK-MOCK-DROPS-PROPS',"product-price-cards.test.tsx Remix Link mock forwards only to/className/children, so an added reloadDocument/replace/prefetch prop on the /store Try again link passes SE1 (C6 NAV covers it in the browser)",'b-round-499/sketch-review.md finding 2'),
 ('TL-R500-DOC321-D1-WORDING',"Doc 321 D1 phrase „denied წყვილში 52-დან“ could name the 52 px element directly",'b-round-499/sketch-review.md finding 5'),
]:
    assert not any(d.get('id')==i for d in dl), i
    dl.append({'id':i,'severity':'low','origin':'B spec','status':'deferred_low_polish (D-29z1795): pre-ruled in task 500','title':title,'evidence':ev,'added':WHO})
hit=[d for d in dl if d.get('id')=='A-R498-CR-ICON-ASSERT']+[f for f in of if f.get('id')=='A-R498-CR-ICON-ASSERT']
assert hit, 'icon id'
for h in hit:
    h.setdefault('confirmedBy',[]).append('tech-lead round-500 sketch review finding 3 (D-29z1795)')
b.setdefault('retro_candidates',[])
rc=b['retro_candidates']
entry={'id':'RC-R499-L58-PLANNING-FAIL','round':499,'note':'L58 planning FAIL: reviewer Medium on B sketch (A-R499-CR-STORE-TRY-UNPINNED); one site of three pinned by source substring only; remedy: site x attribute matrix per sketch review (D-29z1793). Second occurrence after RC-R496-SKETCH-TEST-STRENGTH (B-side mutants did not cover every site attribute). Count at RETRO 510.','added':WHO}
if isinstance(rc,list): rc.append(entry)
else: rc[entry['id']]=entry
open(p,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
open(f'{B}/update-backlog.done','w').write('ok')
print('ok', b['version'])
