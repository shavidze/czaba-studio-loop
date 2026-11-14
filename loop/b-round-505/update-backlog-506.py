import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; B=f'{L}/b-round-505'
if os.path.exists(f'{B}/update-backlog-506.done'): sys.exit('already applied')
p=f'{L}/backlog.json'; b=json.load(open(p))
assert b['version']==506, b['version']
b['version']=507; b['updated']='2026-11-14'
WHO='2026-11-14 B round 505 -> 506 planning'; ADD=WHO
SHA=open(f'{B}/sketch-sha.txt').read().split()[0]
def find(lst,i):
    r=[x for x in b[lst] if x.get('id')==i]; assert len(r)==1,(lst,i); return r[0]
d23=("Round 505 accepted from C evidence only: c-round-505.json taskStatus PASS, browserVerified/realVerified true, C0-C14 passed (chat rows after Start Chat -STUBBED, L36), L57 OK; "
     "gate-round-505.json published d6903a7 (both remotes). DPG-BUTTON-CLEANUP-2 stage 2d (/support chat) is verified; ChatButton stays under LEGACY-DEAD-STORE-COMPONENTS. "
     "Closed on C7 (activeAfterStart and activeAfterClickSend TEXTAREA at 1440/1280/375): B-R505-CHAT-SEND-FOCUS-LOST, B-R505-GUESTFORM-START-FOCUS-LOST. "
     "A's STOP CR-1 (code-reviewer Medium: B2D-7 never focuses Start Chat before the guest form unmounts) ruled Low, deferred (A-R505-CR-1-B2D7-NO-FOCUSED-BUTTON): B re-ran B2D-7 with Start Chat focused and all 15 mutants on a scratch copy (b-round-505/cr1/): 10/10 pass and M1-M15 identical to b-round-504/mutants-505.txt; jsdom moves focus to body when the focused button is removed, and the browser path is C-measured. "
     "Process: C wrote PASS although A's STOP named an unruled reviewer Medium (L22 asks for a short FAIL; RETRO 450 clause) -> INFO-C505-UNRULED-STOP-PASS; B's sketch review missed a reviewer-class Medium on its own test (L58) -> INFO-B505-SKETCH-REVIEWER-MEDIUM; both for RETRO 510. "
     "A's other notes: CR-2 (session ends -> guest form again keeps focusOnMount false) confirmedBy TL-R505-FOCUS-FLAG-AUTH-CHANGE (same captured-once flag); CR-3 duplicated send logic -> deferred Low; CR-4 null activeElement fails safe -> info; "
     "Architecture note (one chat focus point in ChatWindow) -> SIG-R505-CHAT-FOCUS-POINT (signal, decided with B-R505-LIVECHAT-OPEN-FOCUS); stale .claude/primitives/DESIGN_TOKENS.md teal confirmedBy ROOT-REQ-DPG-PRIMITIVES-PATCH. "
     "C limits carried: C3 offset not re-measured -> INFO-C505-C3-OFFSET-UNMEASURED (record row in round 506 C3); doc 326 D1-D4 not C-traced -> INFO-C505-DOC326-LEDGER-PARTIAL (history doc, no action); 4 L57 nulls without reasons -> INFO-C505-L57-NULL-REASONS.")
d24=("Round 506 = DPG-BUTTON-CLEANUP-2 stage 2e (inventory A5, LeadMagnet keep-list restyle). Mapping by product-designer (b-round-505/consult-product-designer.md): FREE DOWNLOAD and BACK TO SITE -> <Button type=button size=lg fullWidth className='max-w-[320px] uppercase tracking-wide'> (BACK TO SITE keeps its ref); "
     "CONTINUE -> <Button type=submit size=lg fullWidth disabled={isSubmitting} className='uppercase tracking-wide'>, primary brass, NOT destructive: this reverses the round-497 inventory line 'the bg-destructive CONTINUE stays' (destructive is the error token; the validation alert above is text-destructive). "
     "Asked once as SABA-Q-506-LM-CONTINUE-COLOUR (user-review/questions-round-506.md, default brass). Button isLoading not used (would replace SENDING... with a spinner + Loading...). Close X left for NONBRAND. Copy, steps, trigger, focus targets unchanged (keep-list). "
     "Measured HEAD :5173 vs sketch :5174 (b-round-505/probe/): 320x57.6 -> 320x48, padding 16/32 -> 12/24, CONTINUE rgb(210,119,106) -> rgb(201,164,106), contrast 6.09 -> 8.32, SENDING pe auto -> none; focus Close / email INPUT / INPUT after a failed submit / BACK TO SITE and Esc equal on both. Scanner 94/33 -> 92/31.")
d25=(f"Round 506 consults and review: product-designer Q1-Q5; tech-lead Review 1 on v1 e859573c APPROVE WITH CONDITIONS (Medium = doc 327 artifacts + L28 line -> artifacts produced, L28 contract; Lows: DESIGN_SYSTEM max-w wording and doc 327 focus wording fixed in v2; B2E-2 redundancy and B2E-6 bg-brand ban pre-ruled), "
     f"Review 2 on v2 {SHA[:8]} APPROVE WITH CONDITIONS (M4 mutant expectation corrected to include ST5, run 1 kept; status form confirmed). Pre-check on v2: tsc rc 0, lint 179, Biome 3 files clean, covering 5/108 (max 214 ms), full suite 303/4379 rc 0, build rc 0, mutants M1-M14 OK, fresh-archive apply checks 4 and 1 rc 0, claims K1-K33 no MISSING, L58 OK. "
     "No architecture checkpoint (one owner, component swap).")
d26=("Round 506 new ids: deferred Lows from the product-designer gate-bait list (record, not fixed: keep-list restyle only): B-R506-LM-EMAIL-NO-LABEL (product-designer said Medium; B rules Low for consistency with B-R505-CHAT-TEXTAREA-NO-LABEL: Chromium names the field from its placeholder, probe activeOnEmail name 'Enter your email address'; fix together as one placeholder-only-fields class), "
     "B-R506-LM-NATIVE-VALIDATION (same class as B-R505-GUESTFORM-NATIVE-VALIDATION, Low), B-R506-LM-WHITE-FIELD, B-R506-LM-WORDMARK, B-R506-LM-EMOJI-ICON; info B-R506-LM-SPLIT-HEADINGS (record only, never reword), B-R506-LM-ARBITRARY-VALUES. "
     "These two a11y classes (placeholder-only field names: chat textarea + LeadMagnet email; native validation before the styled message: GuestForm + LeadMagnet) are a RETRO 510 systemic-task candidate. LEADMAGNET-REAL-SUBSCRIBE is open_backend (Brevo not configured in cloud).")
for i,t in (('D-29z1823',d23),('D-29z1824',d24),('D-29z1825',d25),('D-29z1826',d26)):
    assert not any(d['id']==i for d in b['decisions_log_b'])
    b['decisions_log_b'].append({'id':i,'date':'2026-11-14','by':WHO,'decision':t})
r=[r for r in b['rounds'] if r.get('round')==505]; assert len(r)==1
r[0]['status']='C PASS (browserVerified/realVerified true; chat rows -STUBBED, CHAT-REAL-BACKEND blocked in cloud); gate 505 published d6903a7 (both remotes)'
r[0]['result_note']='C0-C14 PASS (c-round-505.json); A STOP CR-1 ruled Low after the fact (D-29z1823)'
for i in ('B-R505-CHAT-SEND-FOCUS-LOST','B-R505-GUESTFORM-START-FOCUS-LOST'):
    x=find('open_findings',i); x['status']='closed (D-29z1823): C round 505 C7 PASS at 1440/1280/375, published d6903a7 | '+x['status']
x=find('deferred_low_polish','TL-R505-FOCUS-FLAG-AUTH-CHANGE'); x.setdefault('confirmedBy',[]).append('a-round-505.md CR-2: session ends -> guest form again -> Start Chat keeps focusOnMount false, focus to BODY (D-29z1823)')
x=find('root_requests_b','ROOT-REQ-DPG-PRIMITIVES-PATCH'); x.setdefault('confirmedBy',[]).append('a-round-505.md: DESIGN_TOKENS.md still lists brand #13D9CC (Teal) (D-29z1823)')
x=find('open_findings','DPG-BUTTON-CLEANUP-2-NONBRAND'); x['note_d29z1824']='includes the LeadMagnet Close X (NONBRAND per round 506); B2E-6 bans any bg-brand literal in LeadMagnetPopup.tsx (pre-ruled Low #2) - a NONBRAND change there updates B2E-6'
b['architecture_signals'].append({'id':'SIG-R505-CHAT-FOCUS-POINT','added':ADD,'note':'A round 505 code-reviewer Architecture note: keep the captured-once focusOnMount flag; if B-R505-LIVECHAT-OPEN-FOCUS lands, scope one bounded task that moves all chat focus decisions into one focus point in ChatWindow, triggered by the guest-form-to-chat switch. Signal only, not scheduled (D-29z1823).'})
new_def=[('A-R505-CR-1-B2D7-NO-FOCUSED-BUTTON','low','B spec','store-button-cleanup-2d.test.tsx B2D-7 never focuses Start Chat before the guest form unmounts (test realism; jsdom moves focus to body anyway)','a-round-505.md STOP; c-round-505.json bugs[0]; b-round-505/cr1/ (mutant outcomes unchanged)','deferred_low_polish (D-29z1823)'),
         ('A-R505-CR-3-SEND-LOGIC-DUP','low','A review','ChatInput handleSubmit and handleKeyDown duplicate the send logic; a later change could drift (suggested: form.requestSubmit() on Enter)','a-round-505.md CR-3 (ChatInput.tsx:25-52)','deferred_low_polish (D-29z1823)'),
         ('A-R505-CR-4-NULL-ACTIVE','info','A review','ChatInput mount focus checks only document.body; activeElement null skips the focus (fails safe)','a-round-505.md CR-4 (ChatInput.tsx:20)','deferred_low_polish (D-29z1823)'),
         ('B-R506-LM-EMAIL-NO-LABEL','low','product-designer','LeadMagnet email field: accessible name only from its placeholder; no aria-invalid / aria-describedby to the alert (fix with B-R505-CHAT-TEXTAREA-NO-LABEL as one class)','b-round-505/consult-product-designer.md Q4 #1; probe activeOnEmail name','deferred_low_polish (D-29z1826)'),
         ('B-R506-LM-NATIVE-VALIDATION','low','product-designer','LeadMagnet form has no noValidate: the browser email bubble shows before the styled message (same class as B-R505-GUESTFORM-NATIVE-VALIDATION)','b-round-505/consult-product-designer.md Q4 #2','deferred_low_polish (D-29z1826)'),
         ('B-R506-LM-WHITE-FIELD','low','product-designer','LeadMagnet email field bg-white text-black (hardcoded colours, bright slab on Obsidian, 61.6px vs the 48px submit); DP-gate input','b-round-505/consult-product-designer.md Q4 #3; probe emailDialog INPUT 61.6','deferred_low_polish (D-29z1826)'),
         ('B-R506-LM-WORDMARK','low','product-designer','LeadMagnet "CZABA" is a plain tracking span with no logo, font or colour token (relates to SABA-B-16-LOGO-OLD-COLORS); DP-gate input','b-round-505/consult-product-designer.md Q4 #4','deferred_low_polish (D-29z1826)'),
         ('B-R506-LM-EMOJI-ICON','low','product-designer','LeadMagnet success icon is platform emoji (envelope + check), off-brand and not aria-hidden','b-round-505/consult-product-designer.md Q4 #5','deferred_low_polish (D-29z1826)'),
         ('B-R506-LM-SPLIT-HEADINGS','info','product-designer','each LeadMagnet step heading is split into two h2 and the case differs by step; record only, copy is keep-list','b-round-505/consult-product-designer.md Q4 #6','deferred_low_polish (D-29z1826)'),
         ('B-R506-LM-ARBITRARY-VALUES','info','product-designer','LeadMagnet z-[9999], text-[32px]; animate-fade-in reduced-motion behaviour unconfirmed','b-round-505/consult-product-designer.md Q4 #7','deferred_low_polish (D-29z1826)')]
for i,s,o,t,e,st in new_def:
    assert not any(x.get('id')==i for x in b['deferred_low_polish'])
    b['deferred_low_polish'].append({'id':i,'severity':s,'origin':o,'status':st,'title':t,'evidence':e,'added':ADD})
new_open=[('INFO-C505-UNRULED-STOP-PASS','info','C','ruled (D-29z1823): RETRO 510 input','C round 505 wrote PASS while A STOPped on an unruled reviewer Medium (L22 + RETRO 450 clause ask for a short FAIL); gate 505 published before B ruled','c-round-505.md "A\'s STOP"; a-round-505.md'),
          ('INFO-B505-SKETCH-REVIEWER-MEDIUM','info','B spec','ruled (D-29z1823): RETRO 510 input','B\'s round-505 sketch review did not catch a reviewer-class Medium on its own test row (B2D-7), so A met it first (L58)','a-round-505/code-review.md; b-round-504/sketch-review.md'),
          ('INFO-C505-C3-OFFSET-UNMEASURED','info','C','carried (D-29z1823): record row in round 506 C3','C round 505 did not re-measure the 2px focus offset on Start Chat / Send','c-round-505.json notes'),
          ('INFO-C505-DOC326-LEDGER-PARTIAL','info','C','ruled (D-29z1823): history doc, no action; doc 326 D1-D4 numbers are not called C-verified','C11 round 505 partial','c-round-505.json notes'),
          ('INFO-C505-L57-NULL-REASONS','info','C','ruled (D-29z1823): round 506 C14 asks every null to name its reason','c-round-505.json: manifestPaths, missingPaths, claimCheckMinutes, assertsSpecified null without a reason','c-round-505/l57-check.txt'),
          ('LEADMAGNET-REAL-SUBSCRIBE','info','B spec','open_backend (D-29z1826): round 506 success rows are -STUBBED (/api/subscribe via page.route); a real Brevo subscription needs the Brevo key (not configured in cloud)','LeadMagnet subscribe with a real Brevo key','b-round-505/probe/ (unstubbed submit shows Server configuration error)'),
          ('SABA-Q-506-LM-CONTINUE-COLOUR','info','B spec','awaiting_user (D-29z1824): user-review/questions-round-506.md Q1; default brass primary (round 506); one-line revert to variant destructive if Saba wants red','LeadMagnet CONTINUE colour: red (HEAD) or brass (round 506 default)','b-round-505/consult-product-designer.md Q2')]
for i,s,o,st,t,e in new_open:
    assert not any(x.get('id')==i for x in b['open_findings'])
    b['open_findings'].append({'id':i,'severity':s,'origin':o,'status':st,'title':t,'evidence':e,'added':ADD})
b['current_task']=(f"Round 506: DPG-BUTTON-CLEANUP-2 stage 2e (LeadMagnet keep-list restyle): A applies b-round-505/sketch-506.patch.txt (sha {SHA[:8]}): "
    "FREE DOWNLOAD and BACK TO SITE -> <Button type=button size=lg fullWidth className='max-w-[320px] uppercase tracking-wide'>; CONTINUE -> <Button type=submit size=lg fullWidth disabled={isSubmitting} className='uppercase tracking-wide'> (brass, was red); "
    "ST5 LeadMagnet pin -> 0 bg-destructive / 0 bg-brand; new store-button-cleanup-2e.test.tsx B2E-1..6; DESIGN_SYSTEM row; doc 327. C runs C0-C14 (current-task.md; success rows -STUBBED, focus targets L47)")
q=[x for x in b['post_current_stage_queue'] if x.get('id')=='DPG-FIX'][0]
q['status']=('in_progress (D-29z1824): round 505 2d C PASS (published d6903a7); round 506 = DPG-BUTTON-CLEANUP-2 2e LeadMagnet; then NONBRAND (+ LeadMagnet Close X), PD-R498-404-SECONDARY-ALIGN, stage-2 close-out (SIG-R498/SIG-R501), rest of P1, DP gate, P2; '
             'REGRESSION first when planned on/after 2026-11-16; RETRO 510 | '+q['status'])
b['rounds'].append({'round':506,'task':'current-task.md','decision':'D-29z1824','type':'DPG-BUTTON-CLEANUP-2 stage 2e (LeadMagnet: FREE DOWNLOAD, CONTINUE, BACK TO SITE)','status':'dispatched',
  'note':f'baseline d6903a7 clean; sketch b-round-505/sketch-506.patch.txt v2 sha {SHA[:8]}; pre-check b-round-505/precheck-*.log (full 303/4379 rc0, build rc0); mutants M1-M14 OK; probes b-round-505/probe/ (success rows -STUBBED, focus targets)'})
b['advisor_used_by_B']=b.get('advisor_used_by_B')
open(p,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
open(f'{B}/update-backlog-506.done','w').write('ok'); print('ok',b['version'])
