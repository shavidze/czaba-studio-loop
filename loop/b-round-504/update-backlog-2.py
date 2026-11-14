import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; B=f'{L}/b-round-504'
if os.path.exists(f'{B}/update-backlog-2.done'): sys.exit('already applied')
p=f'{L}/backlog.json'; b=json.load(open(p))
assert b['version']==504, b['version']
b['version']=505
WHO='2026-11-14 B round 504 -> 505 planning'; ADD=WHO
REVIEW=sys.argv[1]
def find(lst,i):
    r=[x for x in b[lst] if x.get('id')==i]; assert len(r)==1,(lst,i); return r[0]
d19=("Round 505 = DPG-BUTTON-CLEANUP-2 stage 2d (inventory A4, chat). Liveness: GuestForm and ChatInput are live only via /support -> Live Chat -> ChatWindow (claims-505 K3); "
     "ChatButton is reached only through ChatWidget, which nothing imports (K4): not migrated (not browser-verifiable; pinned by three token tests), stays under LEGACY-DEAD-STORE-COMPONENTS, so A4 is not fully closed. "
     "support.tsx's two hand-rolled buttons (Live Chat card, Back to support options) are NONBRAND; ChatHeader icon buttons out of this stage.")
d20=("Round 505 mapping (product-designer, b-round-504/consult-product-designer.md): Start Chat -> <Button type=submit size=lg fullWidth> (default 8px; md and pill rejected); "
     "Send -> <IconButton type=submit variant=brand size=md label='Send message'> with a 20px icon (IconButton = icon-only component, DESIGN_SYSTEM l.883; Button+icon 48x36 and hand-rolled rejected); "
     "IconButton brand variant drops the retired hover:shadow-glow and its own active:scale-95 (glow and undefined-token tests drop IconButton from their dead allow-lists). "
     "Focus (WCAG 2.4.3, owned code, cheap; Lows fixed early under the 2026-10-23 rule): after a button send focus returns to the textarea; a window opened with the guest form focuses the textarea when the chat appears; signed-in open does not move focus. "
     "Measured HEAD :5173 vs sketch :5174 (b-round-504/probe/): Start Chat 398x50 r12 -> 398x48 r8; Send 36x36 -> 40x40 r12, inert when empty (pointer-events none); focus BODY -> TEXTAREA after Start Chat, mouse send and keyboard send; 1 POST per click/Enter/double-click/keyboard; signed-in open BODY on both. Scanner 96/35 -> 94/33. "
     "Deferred: noValidate+aria-invalid/describedby (B-R505-GUESTFORM-NATIVE-VALIDATION), textarea accessible name (B-R505-CHAT-TEXTAREA-NO-LABEL), focus after Live Chat opens (B-R505-LIVECHAT-OPEN-FOCUS).")
d21=("Round 505 consults and review: product-designer ruled Send/Start Chat/focus/noValidate. "+REVIEW+" "
     "Pre-check on the dispatched sketch: tsc rc 0, lint 179, Biome 6 files clean, covering 6/79 (slowest 2225 ms, UT2), full suite and build rc 0 (b-round-504/precheck-full.log, precheck-build-sketch.log), mutants M1-M12 OK. "
     "First sketch turned store-undefined-tokens UT2/UT2b red (IconButton left the dead list) -> granted (L23). No architecture checkpoint (one feature, chat owner).")
for i,t in (('D-29z1819',d19),('D-29z1820',d20),('D-29z1821',d21)):
    assert not any(d['id']==i for d in b['decisions_log_b'])
    b['decisions_log_b'].append({'id':i,'date':'2026-11-14','by':WHO,'decision':t})
SHA=open(f'{B}/sketch-sha.txt').read().split()[0]
b['current_task']=(f"Round 505: DPG-BUTTON-CLEANUP-2 stage 2d (/support chat): A applies b-round-504/sketch-505.patch.txt (sha {SHA[:8]}): "
    "GuestForm Start Chat -> <Button type=submit size=lg fullWidth>; ChatInput Send -> <IconButton type=submit variant=brand size=md label='Send message'> + focus to the textarea after send and focusOnMount; "
    "ChatWindow focusOnMount only when opened with the guest form; IconButton brand drops glow + scale-95; glow/undefined-token allow-lists; new store-button-cleanup-2d.test.tsx B2D-0..8; DESIGN_SYSTEM row + IconButton paragraph; doc 326. "
    "C runs C0-C14 (current-task.md; chat rows -STUBBED via page.route, focus targets L47)")
q=[x for x in b['post_current_stage_queue'] if x.get('id')=='DPG-FIX'][0]
q['status']=('in_progress (D-29z1819): round 504 2c C PASS (published e3e9e49); round 505 = DPG-BUTTON-CLEANUP-2 2d chat (/support); then 2e LeadMagnet, NONBRAND, rest of P1, DP gate, P2; '
             'REGRESSION first when planned on/after 2026-11-16; RETRO 510 | '+q['status'])
b['rounds'].append({'round':505,'task':'current-task.md','decision':'D-29z1819','type':'DPG-BUTTON-CLEANUP-2 stage 2d (/support chat: Start Chat, Send message, chat focus)','status':'dispatched',
  'note':f'baseline e3e9e49 clean; sketch b-round-504/sketch-505.patch.txt sha {SHA[:8]}; pre-check b-round-504/precheck-*.log; mutants M1-M12 OK; probes b-round-504/probe/ (chat rows -STUBBED, focus targets)'})
assert not any(x.get('id')=='CHAT-REAL-BACKEND' for x in b['open_findings'])
b['open_findings'].append({'id':'CHAT-REAL-BACKEND','severity':'info','origin':'B spec','status':'open_backend (D-29z1819): round 505 chat rows are -STUBBED (POST /api/chat/sessions and messages via page.route, SignalR hub aborted); a real session, SignalR and admin replies need the .NET backend (BLOCKED in cloud)','title':'/support live chat with a real backend session','added':ADD})
x=find('open_findings','B-R478-DEAD-LICENSE-LINK'); x['note_d29z1819']='support.tsx "License Info" card also links to /license (claims-505 planning; same 404); it follows the Footer/terms answer'
new=[('B-R505-GUESTFORM-NATIVE-VALIDATION','low','B pre-check','GuestForm has no noValidate: a bad email ("bad") triggers the browser\'s native validation bubble and the styled "Invalid email address" never shows; the fix is noValidate + aria-invalid + aria-describedby + focus to the first invalid field as one form-accessibility change (product-designer: noValidate alone is worse for screen readers)','b-round-504/probe/native-validity-head.out; consult-product-designer.md (ii)'),
     ('B-R505-CHAT-TEXTAREA-NO-LABEL','low','product-designer','ChatInput textarea has no accessible name beyond its placeholder ("Type a message..."); add aria-label="Message" in a later round','b-round-504/consult-product-designer.md (i)'),
     ('B-R505-LIVECHAT-OPEN-FOCUS','low','B pre-check','Clicking the /support "Live Chat" card unmounts the card grid and focus drops to BODY (anonymous: GuestForm appears; signed-in: chat appears); L47 target not named (likely the Name field / the message field)','b-round-504/probe/head.out and sketch.out (signed-in active BODY; activeAfterStart path)'),
     ('TL-R505-FOCUS-FLAG-AUTH-CHANGE','low','tech-lead','ChatWindow captures "opened with guest form" once per mount: a sign-out while the window stays open (guest form appears, Start Chat) skips the textarea focus; a sign-in while the guest form shows can add a focus move; on /support every open is a new mount','b-round-504/sketch-review.md Review 1 #3'),
     ('TL-R505-ICONBUTTON-SCALE-COMPOUND','info','tech-lead','IconButton default/ghost keep active:scale-95 (Tailwind v4 scale property) which compounds with the global :active transform scale(0.98) to about 0.931; no live user today','b-round-504/sketch-review.md Review 1 answer 3')]
for i,s,o,t,e in new:
    assert not any(x.get('id')==i for x in b['deferred_low_polish'])
    b['deferred_low_polish'].append({'id':i,'severity':s,'origin':o,'status':'deferred_low_polish (D-29z1820)','title':t,'evidence':e,'added':ADD})
open(p,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
open(f'{B}/update-backlog-2.done','w').write('ok'); print('ok',b['version'])
