import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; B=f'{L}/b-round-500'
if os.path.exists(f'{B}/update-backlog.done'): sys.exit('already applied')
p=f'{L}/backlog.json'; b=json.load(open(p))
assert b['version']==493, b['version']
WHO='2026-11-13 B round 500 -> 501 planning'
b['version']=494; b['updated']='2026-11-13'
for r in b['rounds']:
    if r.get('round')==500:
        r['status']='C PASS (browserVerified/realVerified true, 0 bugs); gate 500 published 462570e (both remotes)'
        r['result_note']='C0-C14 PASS (c-round-500.json); C11 core only: doc-ledger number trace not redone line by line (INFO-C500-DOC321-LEDGER-TRACE)'
dec=[
 ('D-29z1797',"Round 500 accepted from C evidence only: c-round-500.json taskStatus PASS, browserVerified/realVerified true, bugs []; gate-round-500.json status published, commit 462570e (both remotes). DPG-BUTTON-CLEANUP-2 stage 2b-1 is verified (C round 500). Closed: B-R498-DOC320-L28 (C11 doc 320 l.4), A-R499-CR-STORE-TRY-UNPINNED (C9 SE1 + C10 N10-N13/N17 RED), A-R499-CR-PAIR-ORDER (C10 N16/N18), A-R499-CR-TRYAGAIN-TYPE (C1 type, C10 N15), A-R499-CR-DS-SAME-RULE (C11), A-R499-CR-DOC321-WORDING (C11 core). A-R500-CR-DOC321-L4-PREWRITTEN is the L28 form, byte-checked by C11: no id. C passed C11-core only (ledger trace not redone): INFO-C500-DOC321-LEDGER-TRACE; doc 321 numbers are not called C-verified."),
 ('D-29z1798',"Gate 500 review (COMMIT OK, 3 Lows + info) mapped to existing ids, no new finding ids (L7): #1 ghost hover/borderless -> confirmedBy PD-R499-GHOST-HOVER-FAINT (its note that buildButtonClassName has no focus-visible class is answered by C round 500 C3: the shared global focus ring paints on Link/<a>/<button>); #2 B2B-5 comment anchor -> confirmedBy A-R500-CR-B2B5-COMMENT-ANCHOR (new deferred Low from A's reviewer, also in c-round-500.json forB); #3 nested <html> -> confirmedBy B-R499-ROOT-ERRORBOUNDARY-NESTED-HTML; architecture note -> confirmedBy SIG-R498-BUTTONLINK-WRAPPER (re-evaluate at 2b-3). C forB nav-499.mjs eval-failed retry: the round-501 harness b-round-500/probe/nav-501.mjs retries once (no id)."),
]
for i,t in dec:
    b['decisions_log_b'].append({'id':i,'date':'2026-11-13','by':WHO,'decision':t})
of=b['open_findings']; dl=b['deferred_low_polish']
def find(i):
    for k in (of,dl):
        for f in k:
            if f.get('id')==i: return f
    raise KeyError(i)
for i,ev in [('B-R498-DOC320-L28','C round 500 C11'),('A-R499-CR-STORE-TRY-UNPINNED','C round 500 C9 SE1 + C10 N10-N13, N17 RED'),('A-R499-CR-PAIR-ORDER','C round 500 C10 N16, N18 RED'),('A-R499-CR-TRYAGAIN-TYPE','C round 500 C1 rest.type + C10 N15 RED'),('A-R499-CR-DS-SAME-RULE','C round 500 C11'),('A-R499-CR-DOC321-WORDING','C round 500 C11 (core)')]:
    f=find(i); f['status']=f'closed (D-29z1797): {ev}; published 462570e | '+f['status']
f=find('DPG-BUTTON-CLEANUP-2')
f['status']='in_progress (D-29z1797): 2b-1 C-verified (C round 500 PASS, published 462570e); next 2b-2 (round 501), then 2b-3, 2c-2e, NONBRAND | '+f['status']
f.setdefault('substages_d29z1789',{})['2b-1']='C round 500 PASS (browserVerified true), published 462570e; scanner 109/44'
for i,src in [('PD-R499-GHOST-HOVER-FAINT','gate 500 review Low #1 (D-29z1798)'),('B-R499-ROOT-ERRORBOUNDARY-NESTED-HTML','gate 500 review Low #3 + a-round-500.md info (D-29z1798)'),('SIG-R498-BUTTONLINK-WRAPPER','gate 500 review architecture note + a-round-500.md Architecture note (D-29z1798)')]:
    find(i).setdefault('confirmedBy',[]).append(src)
assert not any(d.get('id')=='A-R500-CR-B2B5-COMMENT-ANCHOR' for d in dl+of)
dl.append({'id':'A-R500-CR-B2B5-COMMENT-ANCHOR','severity':'low','origin':'B spec','status':'deferred_low_polish (D-29z1798): fix in the next sketch that touches store-button-cleanup-2b.test.tsx (L8: before a comment cleanup in EmptyState/ErrorBoundary); anchor on the actions container class string instead of the JSX comment','title':"B2B-5 in store-button-cleanup-2b.test.tsx anchors on the JSX comment '{/* Actions */}'; a comment cleanup breaks it without a behaviour change",'evidence':'a-round-500.md reviewer Low; c-round-500.json forB','confirmedBy':['gate 500 review Low #2'],'added':WHO})
assert not any(d.get('id')=='INFO-C500-DOC321-LEDGER-TRACE' for d in dl+of)
of.append({'id':'INFO-C500-DOC321-LEDGER-TRACE','severity':'info','origin':'environment','status':'info (D-29z1797): no action; L26 ledger rows stay a C11 requirement in round 501','title':'C round 500 C11 passed the doc 321 headings, l.4 bytes and tokens but did not redo the doc-ledger number trace line by line','evidence':'c-round-500.md C11; c-round-500.json passed C11-core','added':WHO})
open(p,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
open(f'{B}/update-backlog.done','w').write('ok')
print('ok', b['version'])
