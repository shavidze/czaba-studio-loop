import json, sys
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b=json.load(open(P))
assert b['version']==424, b['version']
assert b['decisions_log_b'][-1]['id']=='D-29z1559'
WHEN='2026-11-10 B round 438 -> 439 planning'
b['version']=425; b['updated']='2026-11-10'
b['current_task']="Round 439: SYS-R435-SOURCE-SCAN-HELPER re-do v4.1 (C-R438-01 NF2 wrapper narrowing + string-markup guards; delta b-round-438/sketch-439-delta.patch.txt sha 4596eec7) on 142918b + round-438 tree (current-task.md)"
for r in b['rounds']:
    if r.get('round')==438:
        r['task']='tasks/round-438.md'; r['status']='C FAIL (C-R438-01 Medium, origin B spec); gate 438 skipped; A STOP on reviewer M1 (L11)'
b['rounds'].append({"round":439,"task":"current-task.md","decision":"D-29z1562","type":"SYS-R435-SOURCE-SCAN-HELPER re-do (test-only, v4.1 delta)","status":"dispatched","note":"baseline 142918b + round-438 tree (v3 + doc 285); delta b-round-438/sketch-439-delta.patch.txt (sha 4596eec7); full b-round-438/sketch-439.patch.txt (sha adef9028); claims b-round-438/claims-439.sh"})
for t in b['systemic_tasks']:
    if t['id']=='SYS-R435-SOURCE-SCAN-HELPER':
        t['status']='in_progress (D-29z1562): round 438 C FAIL (C-R438-01); re-dispatched round 439 with v4.1 delta | '+t['status']
        t['closes']=t['closes']+['C-R438-01-NF2-WRAPPER-TAG-NARROWING','A-R438-REVIEW-L1-PG2-STRING-MARKUP']
of=b['open_findings']
of.append({"id":"C-R438-01-NF2-WRAPPER-TAG-NARROWING","severity":"medium","origin":"B spec","status":"scheduled (D-29z1561): fixed by the round-439 v4.1 delta (NF2 any-tag query + raw guard); closes with C round 439 PASS","title":"ported NF2 selects only lowercase <input>; a wrapper such as <Input type=\"number\" /> made HEAD's NF2 red but passes the v3 sketch","evidence":"c-round-438.json; c-round-438/m17-*.log; a-round-438/m17/; b-round-438/mutants/ (M17 HEAD rc1, v3 rc0, v4.1 rc1)","repro":"add app/components/arrangement/ArrangementMutantM17.tsx rendering <Input type=\"number\" className=\"x\" />; npx vitest run app/lib/arrangement/__tests__/studio-number-field.test.ts","added":WHEN,"confirmedBy":["A round 438 code-reviewer M1 (A-R438-REVIEW-M1-NF2-TAG-NARROWING)"]})
of.append({"id":"A-R438-REVIEW-L1-PG2-STRING-MARKUP","severity":"low","origin":"A","status":"scheduled (D-29z1561): fixed by the round-439 v4.1 delta (PG2 + IN1 raw-count guards; M19, M20, M21b); closes with C round 439 PASS","title":"HEAD's <progress text match also caught markup inside strings; the v3 PG2 sees only JSX and createElement","evidence":"a-round-438.md (code-reviewer L1); b-round-438/mutants/ M19","added":WHEN})
dl=b['deferred_low_polish']
for e in [
 {"id":"A-R438-REVIEW-L2-DS4-SF2-TEXT-CONTAINMENT","severity":"low","origin":"A","status":"deferred_low_polish (D-29z1561)","title":"DS4 and SF2 test containment on the whole tag text (node.getText()), so a JSX comment or data- attribute could satisfy them; equal to HEAD","evidence":"a-round-438.md (code-reviewer L2)","repro":"add a data-x=\"[scrollbar-width:thin]\" attribute to a Modal tag without the class; DS4 stays green","added":WHEN},
 {"id":"A-R438-REVIEW-L3-PARSE-DIAGNOSTICS","severity":"low","origin":"A","status":"deferred_low_polish (D-29z1561)","title":"the ThisNodeHasError guard in helpers/source-scan.ts misses scanner diagnostics that set no node flag; npm run typecheck covers it","evidence":"a-round-438.md (code-reviewer L3)","repro":"an unterminated template literal in an arrangement file: the helper may parse it without throwing","added":WHEN},
 {"id":"TL-R439-N1-NF2-RAW-SPELLING","severity":"low","origin":"B spec","status":"deferred_low_polish (D-29z1561)","title":"NF2 raw guard counts type=\"number\" by regex while the AST also counts type={ \"number\" } / type = \"number\"; such a tag plus a string markup in the same file cancel out","evidence":"b-round-438/tech-lead-review-v41.md L-new-1","repro":"in one arrangement file write <input type={ \"number\" } .../> and '<input type=\"number\">' in a string; NF2 counts stay equal","added":WHEN},
]: dl.append(e)
for s in b['architecture_signals']:
    if s.get('id')=='SIG-R438-OTHER-SCANNERS':
        s.setdefault('confirmedBy',[]).append("a-round-438.md code-reviewer Architecture note: element classification (number/radio/search) lives in each suite's tag filter; proposal: one 'all JSX tags with a literal type' query + pinned non-input owners, moving NF2, RD2, SF2 onto it (NF2 done in v4.1) - D-29z1561")
b['retro_candidates'].append({"id":"B-R438-REVERSE-DIRECTION-MATRIX","round":438,"text":"B's round-438 mutant matrix only tested where HEAD was wrong (false reds/passes), never what HEAD caught that the port drops; A's reviewer found the NF2 wrapper narrowing (C-R438-01, origin B spec). Candidate lesson for RETRO 450: a port/refactor of a test needs a reverse-direction mutant per old pattern (HEAD red -> new red).","added":WHEN,"status":"candidate for RETRO 450"})
D=b['decisions_log_b']
D.append({"id":"D-29z1560","date":"2026-11-10","by":WHEN,"decision":"Round 438 not accepted: c-round-438.json FAIL (browserVerified/realVerified true), 1 Medium C-R438-01-NF2-WRAPPER-TAG-NARROWING (origin B spec; C reproduced A's M17 independently: HEAD rc1, sketch rc0). Gate 438 skipped; baseline stays 142918b; the store tree keeps A's round-438 work (v3 sketch + doc 285). SYS-R435 stays in_progress; its closes take effect only on a later C PASS. C's auth/play/export rows on the v3 tree are evidence only."})
D.append({"id":"D-29z1561","date":"2026-11-10","by":WHEN,"decision":"Ruling on A-R438-REVIEW-M1 / C-R438-01: option (2), a v4.1 sketch (not 'accept the narrowing', which would lose a HEAD assertion). v4.1: helper any-tag query (allJsxOpeningTags/scanAllJsxOpeningTags, name field; jsxOpeningTags filters it), SS9; NF2 any-tag + non-input pin [] + raw guard; PG2 and IN1 raw-count guards. Mutants M17-M23 and M21b, H10 (b-round-438/mutants/); typecheck rc0, lint 205, covering 7/24, full 273/4029 rc0. tech-lead v4 and v4.1 approve-with-lows (b-round-438/sketch-review.md). A-R438-REVIEW-L1 fixed; -L2 and -L3 and TL-R439-N1 deferred Lows; A's Architecture note confirmedBy on SIG-R438-OTHER-SCANNERS. Ruling (h): DS4 '<Modal' text in strings is not ported (no runtime meaning)."})
D.append({"id":"D-29z1562","date":"2026-11-10","by":WHEN,"decision":"Dispatch round 439 = SYS-R435 re-do with the v4.1 delta on the round-438 tree (baseline HEAD 142918b; gate 438 skipped). Order after it unchanged: REGRESSION-2026-11-13 at the first planning on or after 2026-11-13; SYS-1; SYS-3; STORE-REDESIGN 2b..5; ARCH-SPLIT (frontend-architect checkpoint via root first; ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS open); REVIEW-RECOMMENDATIONS; T12-ADVANCED; phase 2 under the skip rule. RETRO-450 candidate B-R438-REVERSE-DIRECTION-MATRIX; lessons.md not edited now."})
open(P,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
print('ok v',b['version'])
