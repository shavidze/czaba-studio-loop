import json, sys
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b=json.load(open(P))
assert b['version']==422 and b['decisions_log_b'][-1]['id']=='D-29z1553', 'unexpected start state'
BY='2026-11-10 B round 437 -> 438 planning'
def find(i):
    for sec in ('open_findings','deferred_low_polish','systemic_tasks','architecture_signals'):
        for e in b[sec]:
            if e.get('id')==i: return e
    raise KeyError(i)
def dec(i,text): b['decisions_log_b'].append({'id':i,'date':'2026-11-10','by':BY,'decision':text})
# D-29z1554 round 437 accepted
for i in ('STUDIO-VIS-7','STUDIO-VIS-10','SABA-LANE-RESIZE-HANDLE'):
    e=find(i); e['status']='done (D-29z1554): C round 437 PASS (browserVerified/realVerified true; c-round-437.json C3-C7, C13), gate 437 published 142918b | '+e['status']
for r in b['rounds']:
    if r.get('round')==437:
        r['status']='C PASS (browserVerified); gate 437 published 142918b'; r['task']='tasks/round-437.md'
dec('D-29z1554','Round 437 (COPY-PD-VIS stage 2) accepted: c-round-437.json PASS, 14 rows, browserVerified/realVerified true, 1 Low (C-R437-01, pre-existing); B re-ran tools/l57-check.py (L57 OK, b-round-437/l57-check-c437.txt); gate 437 published 142918b to both remotes (review COMMIT OK 8/10). STUDIO-VIS-7, STUDIO-VIS-10 and SABA-LANE-RESIZE-HANDLE are done; COPY-PD-VIS is complete except COPY-PD items parked in REVIEW-RECOMMENDATIONS. Fake-bearer token row stays open evidence (backend unavailable in cloud).')
# D-29z1555 C-R437-01
b['deferred_low_polish'].append({'id':'C-R437-01','severity':'low','origin':'pre-existing','status':'deferred_low_polish (D-29z1555)','title':'Play pressed while the just-added clip is still decoding does not start playback once decode settles; the user must press Play again','corrected_actual':'C wrote "no status message"; B probe at planning (b-round-437/probe/play-status.json, both viewports) shows the status line reads "Loading <title>..." at ~50 ms and "<title> is ready." at ~260 ms, data-playing stays false; the second press plays. This is the round-382 F-13b-i contract (Play refused while a placed source decodes, ArrangementContext startPlaybackAt awaiting branch), not a regression of round 437','candidate':'UX candidate, behaviour change: resume Play once the awaited decode settles if no other transport action happened in between; needs Saba (L44) before scheduling; Ableton has no equivalent (samples are loaded before play)','evidence':'c-round-437/play4.json, play7.mjs; b-round-437/probe/play-status.json','added':BY})
dec('D-29z1555','C-R437-01 ruled Low and deferred: B probe shows the decoding and ready status texts are shown (C\'s "no status" is corrected); Play-after-decode not resuming is the deliberate F-13b-i refusal contract. Auto-resume is a behaviour change recorded as a Saba question candidate, not scheduled.')
# D-29z1556 gate-437 review + A round-437 notes
def low(i,origin,title,evidence,extra=None):
    e={'id':i,'severity':'low','origin':origin,'status':'deferred_low_polish (D-29z1556)','title':title,'evidence':evidence,'added':BY}
    if extra: e.update(extra)
    b['deferred_low_polish'].append(e)
low('GATE437-S1-DETAIL-SEPARATOR-NO-DRAG','gate reviewer','Detail separator hairline is hover-only: if the pointer outruns the handle during a Detail resize drag the line disappears while the drag continues (the lane handle keeps /40 via isHeightDragging); add a drag state and a test when the hairline recipe is shared (SIG-R437-SEPARATOR-HAIRLINE)','gates/round-437/review.md suggestion 1; a-round-437.md CR-1/CR-2 (same issue; B rules: hover-only was the round-437 spec, not a regression)',{'confirmedBy':['a-round-437.md CR-1','a-round-437.md CR-2']})
low('GATE437-S4-EXIT-ARROW-FOCUS','gate reviewer','CZABA exit link: the muted arrow lights up on hover but not on keyboard focus; add group-focus-visible:text-foreground for parity (header and narrow screen)','gates/round-437/review.md suggestion 4')
low('GATE437-S5-BUSY-LABEL-CONTRAST','gate reviewer','Export button busy state (disabled, opacity-70): label-on-fill contrast not measured at 70 % over the panel (rest 8.32:1 measured by C3)','gates/round-437/review.md suggestion 5')
low('A-R437-REVIEW-CR3-UNUSED-HAIRLINE-EDGE','A','expectHairlineHover test helper has an unused after:top-0 edge branch','a-round-437.md CR-3')
low('A-R437-REVIEW-CR6-EXIT-GAP','A','header exit link uses gap-0.75, the narrow-screen one gap-1 (pre-existing; NG1b compares colour tokens only)','a-round-437.md CR-6')
for i,src in (('GATE431-REVIEW-L3-STRING-COUNT-PINS','gates/round-437/review.md suggestion 6 (class and source string pins break on cosmetic reordering)'),('SIG-R437-SEPARATOR-HAIRLINE','gates/round-437/review.md Architecture note (keep; extract STUDIO_HAIRLINE_HANDLE_CLASS only if Saba extends the thin line to the other edges)')):
    e=find(i); e.setdefault('confirmedBy',[]).append(src)
dec('D-29z1556','Gate 437 review (COMMIT OK 8/10) and A round-437 notes recorded: GATE437-S1-DETAIL-SEPARATOR-NO-DRAG (= A CR-1/CR-2, one id), GATE437-S4-EXIT-ARROW-FOCUS, GATE437-S5-BUSY-LABEL-CONTRAST, A-R437-REVIEW-CR3-UNUSED-HAIRLINE-EDGE, A-R437-REVIEW-CR6-EXIT-GAP -> deferred_low_polish; suggestion 2 (::after clipping) measured by C5, no id; suggestion 3 is the recorded doc-144 override; suggestion 6 and the Architecture note are confirmedBy on GATE431-REVIEW-L3-STRING-COUNT-PINS and SIG-R437-SEPARATOR-HAIRLINE. A CR-4: lessons.md L61 "pointer capture keeps :hover" replaced by the measured fact (window listeners, not pointer capture); 60 lines kept.')
# D-29z1557 sketch review
low('TL-R438-02-MIXFADER-SPREAD-ORDER','B spec','ArrangementMixFader <input>: {...props} comes after type="range"; Omit<\'type\'> guards only at compile time (a JSX spread of a wider object can still pass type at runtime); move the spread before type and pin it in IN1 (app change, not a test-only round)','b-round-437/tech-lead-review-v1.md finding 2; b-round-437/sketch-review.md')
low('TL-R438-04-HS1-TEXT-REGEX','B spec','held-enter-source-scan HS1 is still a text regex over .ts/.tsx: a match inside a comment or string counts as a violation (false red only); port to the parser helper','b-round-437/sketch-review.md (v2-4, carried in v3)')
low('TL-R438-N1-INITIALIZER-PROPERTY-NAMES','B spec','source-scan helper variableInitializersUsing counts property-access names (theme.STUDIO_NUMBER_FIELD_CLASS would pass); add the same isPropertyAccessExpression guard as identifierUsesOutsideImports (H9 class)','b-round-437/sketch-review.md v3-N1')
low('TL-R438-N2-IDENTIFIER-KEYS','B spec','source-scan helper identifierUsesOutsideImports counts object-literal keys and qualified type names (unlikely in real code)','b-round-437/sketch-review.md v3-N2')
low('TL-R438-N3-CN-OVERRIDE','B spec','NF2 carrier accepts cn(inputClass, ...) with any later arguments; a later Tailwind class could override the shared number class (current ArrangementDetailPanel code is fine)','b-round-437/sketch-review.md v3-N3')
for sid,sig in (('SIG-R438-OTHER-SCANNERS','studio-focus-ring, studio-theme-obsidian, panel-radius-ui and strings tests carry their own recursive source walkers (duplication, not a hole); port them and HS1 to the shared parser helper in a later test-only round'),('SIG-R438-IDENTIFIER-PREDICATE','the two identifier helpers (identifierUsesOutsideImports, variableInitializersUsing) should share one "real identifier use" predicate so they cannot drift (TL-R438-N1/N2)')):
    b['architecture_signals'].append({'id':sid,'added':BY,'decision':'D-29z1557','source':'b-round-437/sketch-review.md (tech-lead)','signal':sig,'status':'signal only; not scheduled'})
e=find('GATE431-REVIEW-L3-STRING-COUNT-PINS'); e.pop('systemic_task',None); e['status']='deferred_low_polish (D-29z1522); not closed by SYS-R435 (DXA7/DXL8 string counts live in other suites, not a scanner; D-29z1557)'
e=find('GATE434-S2-DS4-SOURCE-SCAN-SCOPE'); e['status']='in_progress (D-29z1557): subfolder half closes with round 438 (M11); the StudioDialog render-test half stays with the ARCH-SPLIT checkpoint | '+e['status']
q=[x for x in b['post_current_stage_queue'] if x['id']=='ARCH-SPLIT'][0]
q['rules'].append('Source-scan pins (D-29z1557): the shared parser helper (app/lib/arrangement/__tests__/helpers/source-scan.ts) walks app/components/arrangement recursively, and the owner lists in NF2, RD2, IN1, PG2, SF2 and DS4 pin exact relative paths; each split stage updates those pins in the same change (a moved file goes red on purpose, L8)')
dec('D-29z1557','Sketch for round 438 (SYS-R435-SOURCE-SCAN-HELPER): engine switched from a hand-written walker (v1 9c8f5d9f, tech-lead Medium: quote overrun) to the TypeScript parser (ts.createSourceFile, ThisNodeHasError -> path:line); v3 1b88d0ec approved-with-lows by tech-lead (b-round-437/sketch-review.md, reviewed equals dispatched). Rulings: NF2 per-tag carrier + AST definition + hand-off checks; IN1 split from RD2; MixFader spread allowed as a compile-time guard only (TL-R438-02 filed); scope app/components/arrangement recursive, studio/ legacy untouched; HS1 stays text regex (TL-R438-04). Closes 10 deferred Lows on C PASS (A-R429-REVIEW-SCAN-NEGATED-REPEAT, A-R430-REVIEW-NF2-TYPE-BOUNDARY/-SIDE-EFFECT-IMPORT/-CLASSNAME-CONST, A-R431-REVIEW-L1/L2/L3, A-R432-REVIEW-RV432-5-PG2-SPREAD, A-R433-REVIEW-SF2-SCANNER-BLIND-SPOTS) plus the subfolder half of GATE434-S2; GATE431-REVIEW-L3 is not closed (other suites). New Lows TL-R438-02/-04/-N1/-N2/-N3 deferred; signals SIG-R438-OTHER-SCANNERS, SIG-R438-IDENTIFIER-PREDICATE; ARCH-SPLIT rule added. Mutants M1-M16 (HEAD vs sketch) and H1-H9 (helper) in b-round-437/mutants/; full suite on the v3 sketch in b-round-437/full-suite-sketch.log.')
# D-29z1558 dispatch
st=find('SYS-R435-SOURCE-SCAN-HELPER')
st['status']='in_progress (D-29z1558): dispatched round 438 (sketch b-round-437/sketch-438.patch.txt v3) | '+st['status']
st['closes']=[c for c in st['closes'] if c!='GATE431-REVIEW-L3-STRING-COUNT-PINS']
st['closes_note']='GATE434-S2-DS4-SOURCE-SCAN-SCOPE closes for its subfolder half only (D-29z1557)'
for i in st['closes']:
    if i=='GATE434-S2-DS4-SOURCE-SCAN-SCOPE': continue
    e=find(i); e['status']='in_progress (D-29z1558): closing in round 438 (SYS-R435), mutant in current-task.md section 2 | '+e['status']
b['rounds'].append({'round':438,'task':'current-task.md','decision':'D-29z1558','type':'SYS-R435-SOURCE-SCAN-HELPER (test-only, TS-parser source-scan helper)','status':'dispatched','note':'baseline 142918b clean; sketch b-round-437/sketch-438.patch.txt (sha 1b88d0ec); claims b-round-437/claims-438.sh'})
b['current_task']='Round 438: SYS-R435-SOURCE-SCAN-HELPER (shared TS-parser source-scan helper; six scanners ported; closes 10 deferred Lows) on 142918b (current-task.md)'
b['version']=423; b['updated']='2026-11-10'
dec('D-29z1558','Dispatch round 438 = SYS-R435-SOURCE-SCAN-HELPER on baseline 142918b (gate 437 published). Order after it: REGRESSION-2026-11-13 at the first planning on or after 2026-11-13 (with REG-PERF-FULL-SUITE); SYS-1; SYS-3; STORE-REDESIGN 2b..5; ARCH-SPLIT (frontend-architect checkpoint via root first); REVIEW-RECOMMENDATIONS; T12-ADVANCED; phase 2 under the skip rule. STEM-LANES jumps ahead once Saba answers. Next RETRO round 450. No new architecture checkpoint request: test-only round on a new test helper; ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS stays open before ARCH-SPLIT.')
open(P,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
print('ok part1')
