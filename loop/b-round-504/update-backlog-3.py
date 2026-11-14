import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; B=f'{L}/b-round-504'
if os.path.exists(f'{B}/update-backlog-3.done'): sys.exit('already applied')
p=f'{L}/backlog.json'; b=json.load(open(p))
assert b['version']==505, b['version']
b['version']=506
WHO='2026-11-14 B round 504 -> 505 planning (closing check)'; ADD=WHO
def find(lst,i):
    r=[x for x in b[lst] if x.get('id')==i]; assert len(r)==1,(lst,i); return r[0]
SHA=open(f'{B}/sketch-sha.txt').read().split()[0]
t=("Closing check (advisor): (1) probe hover leak - the ready Send 'rest' read was taken with the pointer still on it; fixed (pointer moved away), head/sketch re-run: ready Send rest 8.32, hover 10.28. "
   "(2) L47 async settle: on /support GuestForm stays mounted while POST /api/chat/sessions is in flight and ChatInput mounts when it settles (claims K39), so the mount focus is guarded to move only from BODY; "
   "sketch v3 "+SHA[:8]+" adds the guard, B2D-9, mutants M13 (validation bypass), M14 (Shift+Enter), M15 (guard removed); 15/15 mutants red; browser in-flight row (focus moved during a held POST stays put) and browser mutant probe/m15-browser.out (red without the guard). "
   "tech-lead review 3 REQUEST CHANGES reasoned from the dead ChatWidget; review 4 APPROVE on v3 after the live-path evidence. Full suite 302/4373 and build rc 0 on v3 (re-run clean after a scratch overlap). "
   "(3) L31: UT2 (store-undefined-tokens) runs 2356-3654 ms at gates 500-504 (47-73 % of 5 s), pre-existing; exempted from the 2500 ms line with its time recorded; filed B-R505-UT2-TIMEOUT-HEADROOM. "
   "(4) C7 signed-in/Live Chat BODY is record-only (L47: BODY never expected); claims K36-K40 added (DESIGN_SYSTEM l.883, focus-ring l.303, cited artifacts, live async path, UT2 gate times); doc ledger b-round-504/doc-ledger.md (L26); Biome scoped to 7 files. "
   "(5) The two fixed focus losses get ids (dispatched round 505).")
assert not any(d['id']=='D-29z1822' for d in b['decisions_log_b'])
b['decisions_log_b'].append({'id':'D-29z1822','date':'2026-11-14','by':WHO,'decision':t})
b['current_task']=b['current_task'].replace('(sha f2e389b9)',f'(sha {SHA[:8]})')
assert SHA[:8] in b['current_task'], b['current_task'][:200]
r=[x for x in b['rounds'] if x.get('round')==505]; assert len(r)==1
r[0]['note']=f'baseline e3e9e49 clean; sketch b-round-504/sketch-505.patch.txt v3 sha {SHA[:8]}; pre-check b-round-504/precheck-*.log (full 302/4373 rc0, build rc0); mutants M1-M15 OK; probes b-round-504/probe/ (chat rows -STUBBED, focus targets, in-flight guard)'
new=[('B-R505-CHAT-SEND-FOCUS-LOST','low','B pre-check','Clicking or keyboard-activating /support chat "Send message" clears the field, disables the focused button and Chromium drops focus to BODY','b-round-504/probe/head.out activeAfterClickSend/kbdAfter BODY x3','dispatched round 505 (D-29z1822): fix = focus the textarea in handleSubmit; C7 closes it'),
     ('B-R505-GUESTFORM-START-FOCUS-LOST','low','B pre-check','After a successful /support "Start Chat" the guest form unmounts and focus drops to BODY','b-round-504/probe/head.out activeAfterStart BODY x3','dispatched round 505 (D-29z1822): fix = ChatInput focusOnMount (only from BODY) when the window opened with the guest form; C7 closes it')]
for i,s,o,tt,e,st in new:
    assert not any(x.get('id')==i for x in b['open_findings'])
    b['open_findings'].append({'id':i,'severity':s,'origin':o,'status':st,'title':tt,'evidence':e,'added':ADD})
assert not any(x.get('id')=='B-R505-UT2-TIMEOUT-HEADROOM' for x in b['deferred_low_polish'])
b['deferred_low_polish'].append({'id':'B-R505-UT2-TIMEOUT-HEADROOM','severity':'low','origin':'B pre-check','status':'deferred_low_polish (D-29z1822): schedule a test-only split or declared timeout if any gate run exceeds 4000 ms','title':'store-undefined-tokens UT2 runs 2356-3654 ms at gates 500-504 under the 5 s vitest default (47-73 %, L31)','evidence':'gates/round-500..504/verify.log (claims-505 K40)','added':ADD})
x=find('deferred_low_polish','B-R505-LIVECHAT-OPEN-FOCUS'); x['evidence']='b-round-504/probe/head.out and sketch.out steps.activeAfterLiveChat BODY x3 (anonymous) and signed-in rows active BODY x2'
x=find('deferred_low_polish','GATE453-L2-L3-INERT-GLOW-CLASSNAMES'); x['note_d29z1822']='round 505 removes the IconButton inert glow (IconButton leaves the GS2/UT2 dead lists; LEGACY-DEAD-STORE-COMPONENTS remainder, archived id, loses IconButton); ChatButton and GlobalPlayhead halves stay'
x=find('deferred_low_polish','B-R455-GS2-DEAD-LABELS-UNVERIFIED'); x['note_d29z1822']='round 505 drops the IconButton label from GS2 (it is live via ChatInput); the ChatButton label stays'
x=find('deferred_low_polish','GATE498-L2-BARREL-IMPORT'); x.setdefault('confirmedBy',[]).append('round 505 sketch: GuestForm and ChatInput import Button/IconButton from the ~/components/ui barrel (D-29z1822)')
open(p,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
open(f'{B}/update-backlog-3.done','w').write('ok'); print('ok',b['version'])
