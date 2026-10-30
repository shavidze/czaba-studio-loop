import json, sys
P='backlog.json'
b=json.load(open(P))
D='2026-10-30'
ADD='2026-10-30 B round 257 -> 258 planning'
def find(lst, i):
    for x in lst:
        if isinstance(x, dict) and x.get('id')==i: return x
    return None
of=b['open_findings']
closed_note='closed (D-29z499): C round 257 PASS browserVerified=true realVerified=true (C-A11Y-257 / C-COLLISION-257 / C-ONSTATE-257), gate 257 published d732d26 | '
for i in ['C-R256-01','C-R256-02','B-R249-PAUSE-LABEL']:
    f=find(of,i); f['status']=closed_note+f['status']; f['closed']=D
q=find(of,'SABA-Q-9-TRANSPORT')
q['title']+=' | (g) below 1408 px the Tab order edit -> centre -> view differs from the visual order (centre row on top): acceptable, or centre first? default keep DOM order (GATE257 review Suggestion 2, D-29z503)'
q['status']='awaiting_user (D-29z483; parts e,f added D-29z492/D-29z496; part g added D-29z503); defaults implemented in rounds 256-257'
tl=find(b['tech_lead_manual_checks'],'TL-Q-VIEWPORT')
tl['status']=tl.get('status','')+' | D-29z500: GATE257-NARROW-TOOLBAR-OVERLAP (toolbar group overlap below 864 px, regression since round 256) added to this question; still open'
new_of=[
 {"id":"GATE257-NARROW-TOOLBAR-OVERLAP","severity":"low","origin":"gate 257 review Suggestion 1 (gates/round-257/review.md; reviewer said Medium unless desktop-only)","title":"below 864 px the non-wrapping edit and view groups of the 2-column toolbar grid overlap (Delete/Split under the Zoom label and slider); HEAD a061d52 wrapped (flex flex-wrap); regression since round 256","repro":"b-round-257/probe/narrow2.json (0 overlap at 1024/900/870; 1 px at 864; 41 px at 800; 48 px at 768) + narrow-768.png; /studio-lab at 768x720","status":"deferred_low_polish (D-29z500): ruled Low, below the project's 1024 px desktop floor (MobileWarning.tsx l.103 MobileBlocker on studio.$productId.tsx l.301), required viewports 1280/1440, TL-Q-VIEWPORT open, precedent C-R41-01; cheap candidate to fold into SABA-B-9 stage 2 if it grants ArrangementTransport.tsx (flex-wrap on the three groups, probe 768/900/1280/1440); C records RP-NARROW in round 258; a new overlap at >= 1024 px would be Medium","added":ADD},
 {"id":"GATE257-KBD-GESTURE","severity":"low","origin":"gate 257 review Suggestion 3","title":"the shortcut sheet renders 'Double-click Stop' inside <kbd> (shortcuts.ts l.40 keys; ArrangementShortcutSheet.tsx l.173-178) although it is a mouse gesture","repro":"open ? sheet, Transport rows, Back to start","status":"deferred_low_polish (D-29z504); candidate for SABA-B-9 stage 2 if it grants shortcuts.ts / the sheet","added":ADD},
 {"id":"GATE257-INDEX-LOOKUP","severity":"low","origin":"gate 257 review Suggestion 4 + Architecture note proposal","title":"navigation-strings-ui.test.tsx l.175 finds Back to start by index (centre.querySelectorAll('button')[3]); GS14 grid-snap-ui l.405-418 checks button order by index","repro":"add a centre button -> NS test breaks for an unrelated reason","status":"deferred_low_polish (D-29z504); candidate for SABA-B-9 stage 2 when it owns those tests (L12)","added":ADD},
 {"id":"GATE257-DOC193-TC","severity":"low","origin":"gate 257 review Suggestion 5 + C-I257-03 (A reviewer)","title":"doc 193 l.93 says transport-centre-ui has TC1-TC9 (now TC1-TC11); l.132 'six tests' vs the round-257 bullet's 'five' M9 count (different scopes per C); approach bullet l.39-43 omits the description","repro":"docs/implementation/2026/quarter-IV/193-saba-b-9-centre-transport.md","status":"open (D-29z504): ruled at the stage-1 close: l.93 is stale and is fixed when SABA-B-9 stage 2 writes doc 193 / its l.4 (L28 multi-stage clause); l.132 vs five = different scopes, no change; approach bullet: one clause added in the same edit","added":ADD},
 {"id":"GATE257-EXPORT-INLINE-HANDLER","severity":"low","origin":"gate 257 review Suggestion 6 (pre-existing code)","title":"ArrangementTransport.tsx l.390-394 Export repeats an inline Enter-repeat handler instead of preventRepeatedEnterKeyDown","repro":"source","status":"deferred_low_polish (D-29z504); candidate for SABA-B-9 stage 2 if it grants ArrangementTransport.tsx","added":ADD},
 {"id":"C-I257-OBS","severity":"info","origin":"c-round-257.json info","title":"C-I257-01 (round-257 task said 80 Tab stops; 1280 has 75 - task text only), C-I257-02 (ariaSnapshot omits descriptions; CDP is the evidence), C-I257-04 (Stop focus outline computes 1px solid at 80% brass in Chromium 143, identical to round 256), C-I257-05 (studio-token 401/500, never 200)","status":"recorded (D-29z499); no action; C-I257-04 is consistent with L9 (engine rounding)","added":ADD},
]
of.extend(new_of)
dl=b['deferred_low_polish']
for f in new_of:
    if f['status'].startswith('deferred_low_polish'): dl.append(f)
sig=b['architecture_signals']
sig.extend([
 {"id":"GATE257-ARCH-TOOLBAR-CHURN","origin":"gates/round-257/review.md Architecture note (Signal 3)","text":"ArrangementTransport.tsx l.130-400 layout and button order reworked across V-3a/b, SRW-14, SABA-B-9; each time ~9 order-dependent test files changed; verdict keep (one owner, one useArrangement read, fitButtonRef handoff); proposal: switch remaining by-index tests (GS14, NS l.175) to by-name per group, no component change","status":"signal (D-29z505); not scheduled; added to ARCH-CHECKPOINT-TRANSPORT-POSITIONS question 7 (b-round-257-checkpoint-addendum.md)","added":ADD},
 {"id":"A-R257-ARCH-A11Y-SPREAD","origin":"c-round-257.md section 5 (forwarded from A's reviewer)","text":"the transport a11y contract is spread over 9-10 test files","status":"signal (D-29z505); not scheduled; question 7 of the transport checkpoint","added":ADD},
])
for r in b['architecture_checkpoint_requests']:
    if r.get('id')=='ARCH-CHECKPOINT-TRANSPORT-POSITIONS':
        r['signals']+=['GATE257-ARCH-TOOLBAR-CHURN','A-R257-ARCH-A11Y-SPREAD']
        r['question']+='; 7 (D-29z505, b-round-257-checkpoint-addendum.md): keep the toolbar test contract as is, or one bounded test-only task moving by-index/order assertions to per-group by-name checks and consolidating the transport a11y contract'
        r['status']='addendum 2 at the SABA-B-9 stage 1 close (D-29z505, b-round-257-checkpoint-addendum.md); non-blocking; REGRESSION 258 and SABA-B-9 stage 2 proceed | '+r['status']
st=b['post_current_stage_queue'][5]
assert st['id']=='SABA-B-9-10-11-TRANSPORT-GRID'
st['status']='in_progress (D-29z499): SABA-B-9 stage 1 done (rounds 256-257; C round 257 PASS browserVerified=true realVerified=true; gate 257 published d732d26); round 258 = REGRESSION-ROUND-2026-10-30 (due); then SABA-B-9 stage 2 (round 259), RETRO 260, SABA-B-11c | '+st['status']
s9=st['stages'][6]; assert s9['id']=='SABA-B-9'
s9['status']='in_progress (D-29z499): stage 1 done (rounds 256-257, C round 257 PASS browserVerified=true, published d732d26); stage 2 (master volume bottom-right) next after REGRESSION 258 | '+s9['status']
rr=b['regression_rounds'][2]; assert rr['id']=='REGRESSION-ROUND-2026-10-30'
rr['status']='dispatched round 258 (D-29z499): C-only browser sweep on d732d26; A no change'
rr['round']=258
rr['decision']='D-29z499'
rr['sa_numbering']='SA-n = index n of scope_additions (0-based), as listed in b-round-257.md section 3 and current-task.md round 258 section 4b'
rr['scope_additions'].append('C-R258 RP-NARROW (D-29z500): toolbar overlap probe 1024/900/864/768, record only')
rounds=b['rounds']
r257=rounds[-1]; assert r257['round']==257
r257['status']='done: C round 257 PASS (browserVerified=true, realVerified=true, 13 rows passed, 0 bugs; closes C-R256-01, C-R256-02, B-R249-PAUSE-LABEL); gate 257 published d732d26 (rounds 256-257) | '+r257['status']
rounds.append({"round":258,"task":"current-task.md","decision":"D-29z499..D-29z506","status":"dispatched","type":"REGRESSION-ROUND-2026-10-30: C-only browser sweep (round 199 sections 3/4/4.S adapted + section 4b post-199 rows RR-*, every scope addition SA-0..SA-42 named), RR-PERF, smoke, auth; A no change","note":"baseline clean HEAD d732d26 (gate 257 published); B probes b-round-257/probe/ (narrow*.json, recipes2.json)","next":"all PASS -> regression-last 258, round 259 SABA-B-9 stage 2 (+ cheap gate-257 Lows if granted), RETRO 260, SABA-B-11c; Medium+ -> round 259 fix-up"})
dec=b['decisions_log_b']
dec.extend([
 {"id":"D-29z499","date":D,"text":"Round 257 accepted on C evidence (c-round-257.json PASS, browserVerified/realVerified true, 0 bugs) and gate 257 published d732d26: SABA-B-9 stage 1 done; C-R256-01, C-R256-02, B-R249-PAUSE-LABEL closed. regression-last 2026-10-27 + 3 days = due on 2026-10-30 (today): round 258 = REGRESSION-ROUND-2026-10-30 on the clean published HEAD, A no change. tasks/round-257.md archived (cmp equal)."},
 {"id":"D-29z500","date":D,"text":"Gate-257 reviewer Suggestion 1 (narrow toolbar overlap, 'Medium unless desktop-only') reproduced by B in Chromium: overlap starts at 864 px (b-round-257/probe/narrow2.json). Ruled Low: below the project's 1024 px MobileBlocker desktop floor, required viewports 1280/1440, TL-Q-VIEWPORT open, precedent C-R41-01. Recorded GATE257-NARROW-TOOLBAR-OVERLAP (deferred_low_polish, regression since 256), C observation RP-NARROW in round 258, cheap fold-in candidate for SABA-B-9 stage 2. Does not displace the due regression."},
 {"id":"D-29z501","date":D,"text":"OBS-R199-LEDGER ruled: RV-EN excludes the studio-lab-demo.ts sound-title ledger (V-0 rounds 147/148, M2) and user-typed text; the round-199 phrase 'demo collection names included' is withdrawn."},
 {"id":"D-29z502","date":D,"text":"Regression bound conflict: C-SHEET-256 (scrollHeight <= 1280) replaces C-SHEET-255 (<= 1260) because round 256 legitimately changed the sheet rows; L4 one-element-one-rule."},
 {"id":"D-29z503","date":D,"text":"Gate-257 Suggestion 2 (Tab order vs visual order below 1408 px) is a deliberate trade-off recorded in doc 193; sent to Saba as SABA-Q-9-TRANSPORT part (g) (L43/L44), default keep DOM order."},
 {"id":"D-29z504","date":D,"text":"Gate-257 Lows: KBD-GESTURE, INDEX-LOOKUP, EXPORT-INLINE-HANDLER -> deferred_low_polish with fold-in into SABA-B-9 stage 2 when it owns the code; DOC193-TC + C-I257-03 ruled at stage-1 close: l.93 stale (fix with stage 2 doc edit), l.132 'six' vs 'five' are different scopes (no change), approach bullet gains one clause in the same edit."},
 {"id":"D-29z505","date":D,"text":"Architecture: gate-257 Signal 3 (toolbar churn) and A/C note (a11y contract over 9-10 test files) recorded as signals and added as question 7 to ARCH-CHECKPOINT-TRANSPORT-POSITIONS (b-round-257-checkpoint-addendum.md); non-blocking, not scheduled."},
 {"id":"D-29z506","date":D,"text":"Consults: advisor used before writing (severity discriminator, regression-row adaptation, L6 carry). B browser probes at d732d26: narrow.json/narrow2.json (toolbar overlap), recipes.json/recipes2.json (fresh state, ruler click, Space/Shift+Space/Home, playhead-handle drag). No Saba answers this planning (AGREE-SABA-B-7 awaiting_user; ableton/design-ux decisions unchanged since earlier plannings). No project agent consulted (no new feature behaviour; regression adapts recorded contracts)."},
])
b['current_task']='current-task.md (round 258, D-29z499..D-29z506; REGRESSION-ROUND-2026-10-30: C-only browser sweep on clean HEAD d732d26; round 199 rows adapted + section 4b post-199 rows; A no change)'
b['updated']='2026-10-30 B round 257 -> 258 planning'; b['version']=b['version']+1
json.dump(b, open(P,'w'), ensure_ascii=False, indent=1)
print('ok', len(of), len(dl))
