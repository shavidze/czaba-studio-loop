import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'
mark=os.path.join(L,'b-round-486/update-backlog-1.done')
if os.path.exists(mark): sys.exit('already applied')
p=os.path.join(L,'backlog.json'); b=json.load(open(p,encoding='utf-8'))
by='2026-11-13 B round 486 -> 487 planning'
D=b['decisions_log_b']
assert D[-1]['id']=='D-29z1733', D[-1]['id']
def find(key, fid):
    for f in b[key]:
        if f.get('id')==fid: return f
    raise KeyError(fid)
# D-29z1734: C round 486 evidence
D.append({"id":"D-29z1734","date":"2026-11-13","by":by,"decision":"C round 486 PASS (c-round-486.json: 16 rows passed incl. OC-TAB/KEYS/MOUSE/AX-STUBBED, OC-PIXEL 12/12 0 px, OC-PRESS, OC-SELECT, OC-UNIT 68/68 + 9 mutants identical to B; browserVerified/realVerified true; 0 bugs; l57-check OK) and gates/gate-round-486.json published bb82154 on both remotes (its head field says 0341229; commit field and git rev-parse are the truth). B-R480-ORDER-CARD-KEYBOARD -> done for the client path; OWN-BACKEND (real .NET orders) stays open evidence for a backend-enabled check, does not block. Reviewer and gate notes (L7, no new ids where an id exists): code-reviewer Medium 'no unit guard for select-text / active:transform-none! / [--focus-offset:-2px]' (ruled by task 486 s4) and gate review L1/L2 -> confirmedBy on B-R486-FOCUS-OFFSET-GUARD, whose fix now also names the two classes; A-reviewer Lows 'no unit assert that the hidden panel holds no focusables' and 'OC1 does not assert the h3 holds only the button' -> new Low A-R486-REVIEW-L1-OC-TEST-GAPS (deferred_low_polish). Gate L3 (collapsed panels render up to 50 orders' items) -> note on SIG-R486-DISCLOSURE-PRIMITIVE. A-reviewer side note (FORWARDREF_COMPONENT / DESIGN_TOKENS focus examples contradict store-focus-ring STF2) -> retro_candidates for the RETRO 495 primitive-staleness check (primitives are root/Saba files). Architecture note (keep; no shared Disclosure yet) recorded as signal only."})
f=find('open_findings','B-R480-ORDER-CARD-KEYBOARD')
f['status']='done (D-29z1734): C round 486 PASS (client path, stubbed auth/orders; OWN-BACKEND BLOCKED backend unavailable in cloud, open evidence), published bb82154 | '+f['status']
g=find('deferred_low_polish','B-R486-FOCUS-OFFSET-GUARD')
g.setdefault('confirmedBy',[]).extend(['A-R486 code-reviewer Medium (ruled by task 486 s4; a-round-486.md)','gates/round-486/review.md L1, L2'])
g['fix']+=' ; also pin select-text and active:transform-none! on the order-card toggle (source guard in store-focus-ring.test.ts; not a jsdom cascade assert, L12)'
b['deferred_low_polish'].append({"id":"A-R486-REVIEW-L1-OC-TEST-GAPS","severity":"low","origin":"B spec","status":"deferred_low_polish (D-29z1734)","title":"account-orders-card OC tests: no assert that the hidden panel holds no focusables; OC1 does not assert the h3 holds only the button","evidence":"a-round-486.md code-reviewer Lows 2 and 3","fix":"add both asserts to app/lib/__tests__/account-orders-card.test.tsx","added":by})
for s in b['architecture_signals']:
    if s.get('id')=='SIG-R486-DISCLOSURE-PRIMITIVE':
        s['note']=s.get('note','')+' | gate 486 L3: panels are always rendered (hidden), so up to 50 orders render their items up front; revisit if the page size grows (D-29z1734).'
rc=b.setdefault('retro_candidates',[])
entry={"id":"RC-R486-PRIMITIVE-FOCUS-EXAMPLES","added":by,"note":"A-round-486 code-reviewer: the focus examples in .claude/primitives FORWARDREF_COMPONENT.md / DESIGN_TOKENS.md (focus-visible:ring-2, outline-none) contradict store-focus-ring STF2 (one shared :focus-visible rule). Check at RETRO 495 (DPG rule 5, primitive staleness); proposal for Saba only."}
if isinstance(rc,list): rc.append(entry)
else: rc['RC-R486-PRIMITIVE-FOCUS-EXAMPLES']=entry
for r in b['rounds']:
    if r.get('round')==486:
        r['status']='passed'; r['note']+='; C round 486 PASS browserVerified true; gate published bb82154 (D-29z1734)'
b['version']=b['version']+1; b['updated']='2026-11-13'
json.dump(b,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
open(mark,'w').write('ok\n'); print('v',b['version'])
