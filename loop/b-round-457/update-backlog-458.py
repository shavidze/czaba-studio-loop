# B round 457 -> 458 backlog edit: close round 457 as C FAIL (STOPPED, routed to B), rule on A-R457-REVIEW-M1, dispatch round 458. Idempotent via marker.
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
B = os.path.join(L, 'b-round-457')
mark = os.path.join(B, 'update-backlog-458.done')
if os.path.exists(mark):
    sys.exit('already applied')
p = os.path.join(L, 'backlog.json')
b = json.load(open(p, encoding='utf-8'))
assert b['version'] == 449, b['version']
BY = '2026-11-12 B round 457 -> 458 planning'
b['version'] = 450
b['updated'] = '2026-11-12'
SHA = open(os.path.join(B, 'sketch-458-delta.sha256')).read().split()[0]

def find(lst, fid):
    r = [f for f in b[lst] if f.get('id') == fid]
    assert len(r) == 1, (lst, fid, len(r))
    return r[0]

r457 = [r for r in b['rounds'] if r.get('round') == 457][0]
r457['status'] = 'c_fail_stopped_routed_to_b'
r457['result'] = 'C round 457 FAIL (STOPPED, routed to B; L22 short route): C1 SOURCE-SCOPE, C2 CLAIMS, C3 APPLY, C4 COVERING (4/27), C7 browser (studio + purchase protection at 1440/1280) passed; C5, C6, C8, C9, C10 not run; bug A-R457-REVIEW-M1 Medium (origin B spec) reproduced by C (c-round-457/probe-replay.txt); browserVerified/realVerified true; gate 457 skipped (C taskStatus FAIL); nothing published. Tree keeps round-456 sketch + round-457 delta + doc 299 (6 dirty paths = grants).'

b['open_findings'].append({'id': 'A-R457-REVIEW-M1', 'severity': 'medium', 'origin': 'B spec (walker resolution from the round-456 sketch; trailing-slash strip from the round-457 delta; /index strip at HEAD)', 'confirmedBy': 'C round 457 (c-round-457.json, c-round-457/probe-replay.txt)', 'status': 'ruled + in_progress (D-29z1623): accepted Medium; three-form resolution (module / directory = file and index / index = index only) measured against Vite (b-round-457/probe/vite-resolution.txt) and tsc (A round 457); string-aware comment arm + clause grammar fallback close P4b/P5 (reviewer Low #2); lookahead fix closes reviewer Low #3; LT10 added; round 458 delta sha ' + SHA[:8] + ' (tech-lead APPROVE, b-round-457/sketch-review.md); stop-loss: next zero-occurrence walker form = Low, an app occurrence / verdict flip / third Medium = parser-based walker task', 'title': 'Mount walker resolves a directory specifier (~/lib/u/ or ~/lib/u/index) to a same-name sibling file; leaves of the directory barrel unreached with LT9 green (latent: one sibling pair lib/utils, no importer); same class P4b/P5 name loss', 'evidence': 'a-round-457.md STOP; a-round-457/probe-dir-slash.txt; c-round-457/probe-replay.txt; b-round-457/probe/probe-457-on-sketch458.txt', 'added': BY})
for iid, title in [('A-R457-REVIEW-L4', 'store-live-teal.test.ts duplicate assertion bodies.length === count (repeats the line above)'), ('A-R457-REVIEW-L5', 'style-scan.ts unfollowedLocalSpecifiers: target === null unreachable (literal regex guarantees a local prefix); stale-entry check vacuous while the allow-list is empty'), ('TL-R458-L1', 'walker: a regex literal containing /* or a backtick blinds both comment-stripping arms (name loss when a later import has a comment inside its braces and the same target is imported earlier); zero occurrences in app (walker-forms.py)'), ('TL-R458-L2', "walker: '.', '..' and .../. specifiers classified as plain module (Node/tsc treat as directory); zero occurrences in app"), ('TL-R458-L3', 'walker: explicit ./u.tsx loses to a sibling u.ts (pre-existing); no such pairs in app'), ('TL-R458-L4', 'LT7 tokenPattern lookbehind still rejects a leading _ ([x_playButtonPulse]); fails closed'), ('TL-R458-TRIPWIRE-GUARD', 'tech-lead amendment: turn the walker limit forms (comment inside import braces with regex-literal hazard, directory/dot specifiers) into a CI guard test instead of the C8b manual counter')]:
    b['deferred_low_polish'].append({'id': iid, 'severity': 'low', 'origin': 'A code-reviewer round 457' if iid.startswith('A-') else 'tech-lead review of sketch-458 (B consult)', 'status': 'deferred_low_polish (D-29z1622); owner ARCH-CHECKPOINT-STYLE-SCAN follow-up, the parser-walker escalation, or the polish pass', 'title': title, 'evidence': 'a-round-457.md code-reviewer findings' if iid.startswith('A-') else 'b-round-457/sketch-review.md', 'added': BY})

f = find('open_findings', 'A-R456-REVIEW-M1')
f['status'] = 'in_progress (D-29z1623): round 458 re-dispatch (round 457 C FAIL on A-R457-REVIEW-M1; round-457 delta stays applied) | ' + f['status']
f = find('open_findings', 'A-R454-REVIEW-M-DEAD-UNCHECKED')
f['status'] = 'in_progress (D-29z1623): round 458 re-dispatch | ' + f['status']
for lst, fid in [('deferred_low_polish', 'TL-R454-L-BRACE-PREFIX-HEADER'), ('deferred_low_polish', 'A-R453-REVIEW-L-GS-TEST-GAPS'), ('deferred_low_polish', 'A-R454-REVIEW-L3'), ('deferred_low_polish', 'A-R454-REVIEW-L4'), ('deferred_low_polish', 'B-R455-DOC298-STATUS-LINE')]:
    f = find(lst, fid)
    f['status'] = 'in_progress (D-29z1623): carried to round 458 (round 457 not published) | ' + f['status']
f = find('deferred_low_polish', 'TL-R455-WALKER-LIMITS')
f['status'] = 'extended (D-29z1623): + TL-R458-L1..L4; stop-loss: further zero-occurrence forms are Lows here; app occurrence / verdict flip / third Medium-class finding => parser-based walker task | ' + f['status']
c = find('architecture_checkpoint_requests', 'ARCH-CHECKPOINT-STYLE-SCAN')
c.setdefault('signals', []).append({'added': BY, 'source': 'A round-457 code-reviewer Architecture note + B', 'note': 'third consecutive round on style-scan.ts walker (456, 457, 458); reviewer suggests helpers/mount-graph.ts with LT8/LT9/LT10 as acceptance; escalation path parser-based walker. Bounded frontend-architect checkpoint requested: b-round-457/checkpoint-request-addendum.md. Non-blocking.'})
s13 = find('open_findings', 'SABA-B-13')
s13['status'] = 'scheduled (D-29z1623): STORE-2b-ENTRANCE after 2b-3c-2a passes C (round 458 re-dispatch); REGRESSION-2026-11-13 first if planned on/after 11-13 | ' + s13['status']
q = [q for q in b['post_current_stage_queue'] if q['id'] == 'STORE-REDESIGN'][0]
sp = [s for s in q['stages'] if s['id'] == 'STORE-2'][0]['split_2b_d29z1583']
sp['STORE-2b-3c-2a'] = 're-dispatched round 458 (D-29z1623): round 457 C FAIL (STOPPED on A-R457-REVIEW-M1) | ' + sp['STORE-2b-3c-2a']
q['status'] = 'in_progress (D-29z1623): round 458 = STORE-2b-3c-2a re-dispatch v3 (walker ruling A-R457-REVIEW-M1); then REGRESSION-2026-11-13 if planned on/after 11-13, SABA-B-13 entrance, 2b-3c-2b, 2b-3d, 2b-4, STORE-2c..5 | ' + q['status']
b['retro_candidates'].append({'id': 'RETRO465-B-WALKER-STOP-LOSS', 'added': BY, 'note': 'Two consecutive C FAILs (456, 457) on Medium findings in the same regex walker, both origin B spec, missed by three tech-lead reviews. Candidate lesson: a test-only analyser that gates a verdict gets a stop-loss at its first re-dispatch (zero-occurrence forms = Low; occurrence/flip/third Medium = parser replacement), and B measures every real resolver the analyser imitates (Vite and tsc disagreed on ./u/).'})

b['decisions_log_b'].append({'id': 'D-29z1622', 'date': '2026-11-12', 'by': BY, 'decision': 'Round 457 closed from evidence: C round 457 FAIL (STOPPED, routed to B, L22 short route; browserVerified/realVerified true on C7), gate 457 skipped, nothing published; no item becomes done. A-R457-REVIEW-L4/L5 and tech-lead TL-R458-L1..L4 + TL-R458-TRIPWIRE-GUARD -> deferred_low_polish. Reviewer Low #2 (P4b/P5) and #3 (lookahead _) fixed in round 458; #6 doc sentence fixed by doc 299 rewrite.'})
b['decisions_log_b'].append({'id': 'D-29z1623', 'date': '2026-11-12', 'by': BY, 'decision': 'L10 ruling on A-R457-REVIEW-M1: accepted Medium (origin B spec), confirmedBy C 457. B measured Vite (./u/ -> file, ~/../u/ -> index, ./u/index -> index; b-round-457/probe/vite-resolution.txt); tsc (A) ./u/ -> index. Fix: resolveSpecifier returns {target, form}; scriptFilesFor follows module = file then index, directory = file and index, index = index only; LT9 compares form|target; third union arm withoutCommentsOutsideStrings with IMPORT_CLAUSE_GRAMMAR whole-module fallback (that arm only; on all arms it over-reached by 2 files via "// Barrel export" comments); LT7 lookahead (?![A-Za-z0-9-]); new LT10. Reached set identical to round 456 (294); LT7 verdicts unchanged. tech-lead APPROVE on sha ' + SHA[:8] + '. Pinned on sketch: covering 4/28, full 284/4152 rc 0, mutants 40 lines (BASE, C1 green; M1-M38 red; M21/M22/M28/M30 re-anchored to the 3-arm union, M33-M38 new), expect live-teal 75, lint 205, tsc rc 0, biome rc 0. Stop-loss adopted with tech-lead. Root asked for a bounded frontend-architect checkpoint (b-round-457/checkpoint-request-addendum.md, non-blocking). Round 458 = STORE-2b-3c-2a re-dispatch v3; order after unchanged.'})
b['rounds'].append({'round': 458, 'task': 'current-task.md', 'decision': 'D-29z1623', 'type': 'STORE-2b-3c-2a re-dispatch v3: walker ruling A-R457-REVIEW-M1 (test-only)', 'status': 'dispatched', 'note': 'baseline db95f40 (gate 455 commit; gates 456/457 skipped); tree has round-456 sketch + round-457 delta + docs; delta b-round-457/sketch-458-delta.patch.txt sha ' + SHA[:8] + '; grants b-round-457/grants-458.txt (6)'})
b['current_task'] = 'Round 458: STORE-2b-3c-2a re-dispatch v3, walker ruling A-R457-REVIEW-M1 (current-task.md, D-29z1623)'
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(mark, 'w').write('ok\n')
print('applied 458')
