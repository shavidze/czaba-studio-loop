import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; B=f'{L}/b-round-499'
if os.path.exists(f'{B}/update-backlog-2.done'): sys.exit('already applied')
assert os.path.exists(f'{B}/update-backlog.done')
p=f'{L}/backlog.json'; b=json.load(open(p)); assert b['version']==493
WHO='2026-11-13 B round 499 -> 500 planning (advisor closing check)'
b['decisions_log_b'].append({'id':'D-29z1796','date':'2026-11-13','by':WHO,'decision':"Closing-check corrections to task 500: covering (verbose, SE1 listed), full suite 297/4,329 and build re-run on the final sketch tree with doc 321 in its delivered form (L56); C1 states rest.type 'button' on ROOT-ERR-TRY/ROUTE-ERR-TRY (oracle null); C11 token check (65 hits, non-class misses only) and pending grep (0) run by B; ruling #8 reworded from b-round-499/reload-spy-probe.txt (spyOn throws, defineProperty works, not adopted); K24 pins the SE1 literal = PRIMARY_LG_PILL; A's log names listed; task 499 D1 corrected in §1; mutants-500.py creates its log dir (results unchanged); A's round-499 Architecture note -> confirmedBy on SIG-R498-BUTTONLINK-WRAPPER; A-R499-CR-DOC321-WORDING origin set to B spec (the D1 '52 with a border' wording came from task 499 §1)."})
done=set()
for coll in ('open_findings','deferred_low_polish'):
    for f in b[coll]:
        if f.get('id')=='A-R499-CR-DOC321-WORDING':
            f['origin']='B spec'; f['status']=f['status']+' | origin B spec (D-29z1796): D1 wording from task 499 §1; A copied it'; done.add('w')
        if f.get('id')=='SIG-R498-BUTTONLINK-WRAPPER':
            f.setdefault('confirmedBy',[]).append("A round-499 code-reviewer Architecture note ('no signal; the ButtonLink wrapper is pre-ruled #2') (D-29z1796)"); done.add('s')
if 's' not in done:
    sig=b.get('architecture_signals')
    items = sig if isinstance(sig,list) else (list(sig.values()) if isinstance(sig,dict) else [])
    for f in items:
        if isinstance(f,dict) and f.get('id')=='SIG-R498-BUTTONLINK-WRAPPER':
            f.setdefault('confirmedBy',[]).append("A round-499 code-reviewer Architecture note (D-29z1796)"); done.add('s')
assert done=={'w','s'}, done
open(p,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
open(f'{B}/update-backlog-2.done','w').write('ok'); print('ok')
