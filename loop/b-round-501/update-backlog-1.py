import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; B=f'{L}/b-round-501'
if os.path.exists(f'{B}/update-backlog-1.done'): sys.exit('already applied')
p=f'{L}/backlog.json'; b=json.load(open(p))
assert b['version']==495, b['version']
WHO='2026-11-14 B round 501 -> 502 planning'
b['version']=496; b['updated']='2026-11-14'
for r in b['rounds']:
    if r.get('round')==501:
        r['status']='C PASS (browserVerified/realVerified true, 0 bugs); gate 501 published 3bb55d4 (both remotes)'
        r['result_note']='C0-C14 PASS (c-round-501.json); C11 full doc-ledger trace for doc 322 (after-state numbers C-measured; HEAD-side numbers from B head.out only); C10 25 mutants RED'
dec=[
 ('D-29z1802',"Round 501 accepted from C evidence only: c-round-501.json taskStatus PASS, browserVerified/realVerified true, bugs []; gate-round-501.json status published, commit 3bb55d4 (both remotes). DPG-BUTTON-CLEANUP-2 stage 2b-2 is verified (C round 501): free-downloads Download, newsletter Subscribe, Hire Us Send Message on Button. INFO-C500-DOC321-LEDGER-TRACE closed: its requirement carried into round 501 C11, which ran the full ledger trace for doc 322 (doc 321 numbers stay not C-traced; history doc, no action). C11 note: doc 322 HEAD-side numbers (150x50, 140x56, 58px) rest on B's probe/head.out, not re-measured by C; info only."),
 ('D-29z1803',"Round 501 A reviewer Lows, C forB and gate 501 review mapped (L7): new deferred Lows A-R501-CR-ST5-STRING-PIN, A-R501-CR-B2B2-6-ONE-BUTTON (L8: owner = the NONBRAND stage that moves 'Send Download Link'; that stage updates the B2B2-6 count pin), A-R501-CR-LUCIDE-CLASS, A-R501-CR-FORM-METHOD; INFO-C501-MUTANT-HARNESS-RELPATH (info, B harness usage: logdir must be absolute; round-502 mutant script resolves it). Gate 501 Low #1 (visual changes of hire-us/newsletter) = the task-501 listed deviations D2/D3/D5, C1/C4 measured them: no id. Gate Low #2 (Button.tsx isLoading Loader2 lacks motion-reduce:animate-none) -> new deferred Low GATE501-L2-BUTTON-ISLOADING-MOTION-REDUCE (Button.tsx is the shared owner; fix in a stage that owns Button.tsx). Gate info #3 -> confirmedBy TL-R501-FD-ARIA-CONTROLS; its 'Send Download Link' half is NONBRAND (SABA-Q-501-SEND-LINK-VARIANT). Gate architecture note (shared tag-scanner helper for the per-stage tests) -> new signal SIG-R501-SHARED-BUTTON-SCANNER, decide at stage-2 close-out (not scheduled). A's DESIGN_TOKENS.md stale note -> confirmedBy SABA-PROP-DESIGN-TOKENS-PRIMITIVE-STALE (.claude/** root-only via ROOT-REQ-DPG-PRIMITIVES-PATCH)."),
]
for i,t in dec:
    assert not any(d['id']==i for d in b['decisions_log_b'])
    b['decisions_log_b'].append({'id':i,'date':'2026-11-14','by':WHO,'decision':t})
of=b['open_findings']; dl=b['deferred_low_polish']
def find(i):
    for k in (of,dl):
        for f in k:
            if f.get('id')==i: return f
    raise KeyError(i)
f=find('INFO-C500-DOC321-LEDGER-TRACE'); f['status']='closed (D-29z1802): round 501 C11 ran the full ledger trace (doc 322) | '+f['status']
f=find('DPG-BUTTON-CLEANUP-2')
f['status']='in_progress (D-29z1802): 2b-2 C-verified (C round 501 PASS, published 3bb55d4); next 2b-3 (round 502), then 2c-2e, NONBRAND | '+f['status']
f.setdefault('substages_d29z1789',{})['2b-2']='C round 501 PASS (browserVerified true), published 3bb55d4; scanner 104/41'
find('TL-R501-FD-ARIA-CONTROLS').setdefault('confirmedBy',[]).append('gate 501 review info #3 (D-29z1803)')
find('SABA-PROP-DESIGN-TOKENS-PRIMITIVE-STALE').setdefault('confirmedBy',[]).append('a-round-501.md: .claude/primitives/DESIGN_TOKENS.md l.9 brand #13D9CC (Teal), l.108 Teal + Orange (D-29z1803)')
new=[
 (dl,{'id':'A-R501-CR-ST5-STRING-PIN','severity':'low','origin':'A','status':'deferred_low_polish (D-29z1803)','title':'ST5 (store-theme-tokens.test.ts:676-680) pins the exact <Button ...> source line of hire-us; a Biome reflow or prop reorder turns it red with no visual change; ST5 title "all nine fills" wording','evidence':'a-round-501.md code-reviewer Low'}),
 (dl,{'id':'A-R501-CR-B2B2-6-ONE-BUTTON','severity':'low','origin':'A','status':'deferred_low_polish (D-29z1803): owner = NONBRAND stage that moves free-downloads "Send Download Link" onto Button; that sketch updates the B2B2-6 count (L8)','title':"store-button-cleanup-2b2.test.tsx:293 asserts openingTags(free-downloads,'Button') length 1; it goes red when NONBRAND migrates 'Send Download Link'",'evidence':'a-round-501.md code-reviewer Low'}),
 (dl,{'id':'A-R501-CR-LUCIDE-CLASS','severity':'low','origin':'A','status':'deferred_low_polish (D-29z1803)','title':'B2B2 spinner asserts use the lucide-loader-circle class (:252, :280); a lucide upgrade that renames it turns them red','evidence':'a-round-501.md code-reviewer Low'}),
 (dl,{'id':'A-R501-CR-FORM-METHOD','severity':'low','origin':'A','status':'deferred_low_polish (D-29z1803): pre-existing','title':'Form/FetcherForm mocks in the 2b-2 test drop method="post"; no test checks the POST wiring of newsletter / hire-us','evidence':'a-round-501.md code-reviewer Low'}),
 (dl,{'id':'GATE501-L2-BUTTON-ISLOADING-MOTION-REDUCE','severity':'low','origin':'gate reviewer','status':'deferred_low_polish (D-29z1803): fix in a stage that owns Button.tsx (shared owner)','title':"Button.tsx:135 isLoading Loader2 has animate-spin without motion-reduce:animate-none (the 2b-2 call-site spinners have it)",'evidence':'gates/round-501/review.md Low #2'}),
 (of,{'id':'INFO-C501-MUTANT-HARNESS-RELPATH','severity':'info','origin':'C','status':'info (D-29z1803): B harness usage; round-502 mutant script resolves the logdir to an absolute path','title':'b-round-500/mutants-501.py takes a relative logdir but runs with cwd=tree, so a relative logdir loses the evidence','evidence':'c-round-501.json forB, notes'}),
 (of,{'id':'SIG-R501-SHARED-BUTTON-SCANNER','severity':'info','origin':'gate reviewer','status':'signal (D-29z1803): architecture note, not scheduled; decide at DPG-BUTTON-CLEANUP-2 close-out together with SIG-R498-BUTTONLINK-WRAPPER','title':'Per-stage tests carry copies of a brace-aware tag scanner (openingTags/hasSolidBrass; IL3 in store-internal-links.test.ts); one shared test helper or lint rule would stop the growth','evidence':'gates/round-501/review.md Architecture note; task 501 pre-ruled Low #4'}),
]
for lst,e in new:
    assert not any(d.get('id')==e['id'] for d in dl+of), e['id']
    e['added']=WHO; lst.append(e)
open(p,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
# feature-status
fp=f'{L}/feature-status.md'; s=open(fp,encoding='utf-8').read()
old_next='  - **შემდეგი: round 501 = DPG-BUTTON-CLEANUP-2, ეტაპი 2b-2 — მუშავდება'
assert s.count(old_next)==1
line=("  - **Round 501 = DPG-BUTTON-CLEANUP-2, ეტაპი 2b-2 — C PASS; ეტაპი 2b-2 მზადაა (D-29z1802).** C round 501: C0–C14 PASS, `browserVerified`/`realVerified` true, 0 ბაგი (`c-round-501.json`); gate 501 გამოქვეყნდა `3bb55d4`-ზე (ორივე remote). free downloads „Download“ (pill 152×48), newsletter „Subscribe“ (124×56) და Hire Us „Send Message“ (832×48) ახლა `Button`-ია; კონტრასტი 8.32 / 10.28; scanner 104/41. ახალი deferred Low-ები: A-R501-CR-ST5-STRING-PIN, A-R501-CR-B2B2-6-ONE-BUTTON (NONBRAND), A-R501-CR-LUCIDE-CLASS, A-R501-CR-FORM-METHOD, GATE501-L2-BUTTON-ISLOADING-MOTION-REDUCE; სიგნალი SIG-R501-SHARED-BUTTON-SCANNER (D-29z1803).\n"
      "  ძველი: ")
s=s.replace(old_next, line+old_next.lstrip().replace('  - ',''),1)
open(fp,'w',encoding='utf-8').write(s)
open(f'{B}/update-backlog-1.done','w').write('ok')
print('ok', b['version'])
