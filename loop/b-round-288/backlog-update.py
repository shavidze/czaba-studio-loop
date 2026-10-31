import json
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b=json.load(open(P))
NOW='2026-10-31 B round 288 -> 289 planning'
def f(key,i):
    for x in b[key]:
        if x.get('id')==i: return x
    raise KeyError(i)
q=[x for x in b['post_current_stage_queue'] if x.get('id')=='PD-REVIEW-2026-10-31'][0]
st={s['id']:s for s in q['stages']}
st['FIX-PD-1a2']['status']='done (D-29z707): C round 288 PASS, browserVerified/realVerified true (c-round-288.json 11 rows, both viewports); gate 288 published c345def; closes C-R286-01, C-R286-02, C-R287-01, A-R287-PREMIUM-UNVALIDATED; F9 closed | '+st['FIX-PD-1a2']['status']
st['FIX-PD-1b']['status']='in_progress (D-29z709): dispatched round 289, baseline c345def | not_started'
st['FIX-PD-1b']['files']=['app/data/studio-lab-demo.ts','app/components/arrangement/ArrangementLibrary.tsx','app/data/__tests__/studio-lab-demo.test.ts','app/lib/arrangement/__tests__/strings.test.ts','app/lib/arrangement/__tests__/library-group-heading-ui.test.tsx (new)','docs/implementation/2026/quarter-IV/216-fix-pd-demo-names-group-heading.md (new)']
q['status']='in_progress (D-29z709): FIX-PD-1a2 done (288, c345def); FIX-PD-1b dispatched round 289 | '+q['status']
for i in ('C-R286-01','C-R286-02','C-R287-01','A-R287-PREMIUM-UNVALIDATED'):
    x=f('open_findings',i); x['status']='closed (D-29z707): C round 288 PASS + gate 288 published c345def | '+x['status']
x=f('open_findings','C-R186-01'); x['status']='closed (D-29z707, L7): same F9 root cause; FIX-PD-1a (C round 286 PASS: door-slams $0.00 -> $9.00, 096fa4b) + FIX-PD-1a2 (C round 288 PASS, c345def); backend-only upgrade rule kept as BACKEND-EVIDENCE-F9 | '+x['status']
b['open_findings'].extend([
 {"id":"BACKEND-EVIDENCE-F9","severity":"info","origin":"C","status":"open_backend_evidence (D-29z707): not a reason to call round 288 unverified","title":"F9 rows that need the real backend: owned-Standard upgrade state in the browser (unit VC3/VC4 carry it) and the real-backend 403 for /api/studio-token; also C-R186-01's real /api/products/handle variant check","evidence":"c-round-288.json blocked[]; c-round-286.json blocked[]","added":NOW},
 {"id":"A-R288-ARCH-LEADING-SPANS","severity":"info","origin":"A (code-reviewer Architecture note)","status":"signal (D-29z708): not scheduled; candidate for STORE-4 price component","title":"three hand-matched leading-* 'Price unavailable' spans (store.tsx, ProductCard.tsx, VersionSelector) each copy the known line box by hand; one shared price-label component would hold it","evidence":"a-round-288.md; c-round-288.json signalsForB","added":NOW},
 {"id":"INFO-C288-FIXTURE-COUNT","severity":"info","origin":"C","status":"noted (D-29z708): B task text said 10 active fixtures, the mock has 11; C checked all 11; L29 already covers counts as tagged claims","title":"round-288 task fixture count 10 vs 11","evidence":"c-round-288.md Setup","added":NOW},
 {"id":"SABA-Q-FIXPD1B-NAMES","severity":"info","origin":"B (product-designer)","status":"awaiting_user (D-29z709): non-blocking; round 289 ships the defaults","title":"Demo stem names: 'Pulse' (default) or 'Rhythm' for the pulse stem; 'Melody' (default, translation of მელოდია) or 'Lead' for the lead stem","evidence":"b-round-288.md section 3; tasks round 289","added":NOW},
])
b['decisions_log_b'].extend([
 {"id":"D-29z707","date":"2026-10-31","text":"Round 288 FIX-PD-1a2 fix-up: C PASS (c-round-288.json, 11 rows, browserVerified/realVerified true, no bugs); gate-round-288 published c345def (both remotes). FIX-PD-1a2 done; F9 closed. Closed: C-R286-01, C-R286-02, C-R287-01, A-R287-PREMIUM-UNVALIDATED, and C-R186-01 by L7 (same root cause, door-slams fixed in 286). Backend-only rows kept as BACKEND-EVIDENCE-F9 (open evidence, not unverified). Baseline for round 289 = c345def."},
 {"id":"D-29z708","date":"2026-10-31","text":"C round 288 signals: A-R288-ARCH-LEADING-SPANS recorded as an architecture signal (not scheduled; STORE-4 candidate, joins A-R287-ARCH-ADAPTER-ZERO family); INFO-C288-FIXTURE-COUNT noted (L29 covers it; no new lesson). No frontend-architect checkpoint: one owner, small Store fix-ups, no accumulated structural risk."},
 {"id":"D-29z709","date":"2026-10-31","text":"Dispatch round 289 = FIX-PD-1b (F7 Medium + SR-230-6). Names: Night Pulse; Full mix; stems Pulse/Bass/Pad/Melody; 'Middle East — public preview', 'CZABA hero — public preview'; synthetic collection label 'Synthetic demo · Night Pulse'; other labels and the notice unchanged. Library list: per-option collection line removed; the collection label shows once as a group heading (div role=group aria-labelledby a plain div, never role=heading) only when the filtered results contain >= 2 distinct collectionLabels, grouped by contiguous runs so DOM order = resultIds order. B overrides product-designer's truncate on measured evidence: at the default 144 px list both labels truncate (b-round-288/probe/sketch.json); the heading wraps like the option titles (sketch-wrap: 59.5/43 px, list scrollHeight 669 -> 614). biome-ignore useSemanticElements ruled (fieldset is a form grouping, listbox children must be option/group). Buyer-side change recorded: a purchased single collection loses the per-stem product line; the product name stays in the tree node, the option title attribute and clip names. Name defaults asked once as SABA-Q-FIXPD1B-NAMES (L44). Live measurement LIVE-MEAS-BROWSER-SEARCH-LOCATION requested (non-blocking). No AGREE wait: approved Medium bug fix."},
])
b['retro_policy']['next_due']='round 290 (next planning after round 289 closes) or the end of STUDIO-PERFORMANCE, whichever first (retro 290 window 275-289)'
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok')
