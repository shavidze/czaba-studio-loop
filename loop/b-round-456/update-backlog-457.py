# B round 456 -> 457 backlog edit: close round 456 as C FAIL (STOPPED, routed to B), rule on A-R456-REVIEW-M1, dispatch round 457. Idempotent via marker.
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
B = os.path.join(L, 'b-round-456')
mark = os.path.join(B, 'update-backlog-457.done')
if os.path.exists(mark):
    sys.exit('already applied')
p = os.path.join(L, 'backlog.json')
b = json.load(open(p, encoding='utf-8'))
assert b['version'] == 448, b['version']
BY = '2026-11-11 B round 456 -> 457 planning'
b['version'] = 449
SHA = open(os.path.join(B, 'sketch-457-delta.sha256')).read().split()[0]

def find(lst, fid):
    r = [f for f in b[lst] if f.get('id') == fid]
    assert len(r) == 1, (lst, fid, len(r))
    return r[0]

r456 = [r for r in b['rounds'] if r.get('round') == 456][0]
r456['status'] = 'c_fail_stopped_routed_to_b'
r456['result'] = 'C round 456 FAIL (STOPPED, routed to B; lesson L22 short route): C1-C4, C6 counts, C7 (browser, studio + purchase protection at 1440/1280), C8, C9 passed; C5 mutants not run, C6 assert map not written; bug A-R456-REVIEW-M1 Medium (origin B spec) confirmed by C (c-round-456/flip-probe-c.log); browserVerified/realVerified true; gate 456 skipped (C taskStatus FAIL); nothing published. Tree keeps A\'s round-456 work (sketch-456 byte-exact + doc 298 l.4 + doc 299), 5 dirty paths.'

b['open_findings'].append({'id': 'A-R456-REVIEW-M1', 'severity': 'medium', 'origin': 'B spec (LT7 unmounted verdict new in the round-456 sketch; matcher pre-existing)', 'confirmedBy': 'C round 456 (c-round-456.json, flip-probe-c.log)', 'status': 'ruled + in_progress (D-29z1621): accepted Medium; fix in the walker only (mountGraphImports = raw + comment-stripped matcher union, side-effect imports, import.meta.url workers, export * as N), GT5b switched to the same edges, permanent guard LT9; round 457 sketch delta sha ' + SHA[:8] + ' (tech-lead v3 APPROVE, b-round-456/sketch-review.md)', 'title': 'Mount walker drops import/export statements with a comment inside the braces (ScrollReveal reported unmounted); same class: worker new URL edges, side-effect imports, export * as N', 'evidence': 'a-round-456.md STOP; c-round-456/flip-probe-c.log; b-round-456/probe/sweep-sketch456.txt, flips-288-to-v2.txt', 'added': BY})
for iid, title in [('A-R456-REVIEW-L1', 'ImportBinding.exported holds the local alias for import { A as B }; a name such as local/alias would fit both uses (sketch-pinned)'), ('A-R456-REVIEW-L2', 'cssRuleBodies matches the last compound of a selector while cssRuleBlocksListing/cssRuleSelectorCount need an exact comma part; names do not show the difference (AGENT_DISCOVERABLE_CODE rule 2)')]:
    b['deferred_low_polish'].append({'id': iid, 'severity': 'low', 'origin': 'A code-reviewer round 456', 'status': 'deferred_low_polish (D-29z1620); owner ARCH-CHECKPOINT-STYLE-SCAN follow-up or the polish pass', 'title': title, 'evidence': 'a-round-456.md code-reviewer findings', 'added': BY})
b['open_findings'].append({'id': 'INFO-A-R456-PREFLIGHT-LATE', 'severity': 'info', 'origin': 'A round 456 self-report', 'status': 'logged (D-29z1620)', 'title': 'A read the pre-flight skill after applying the sketch, not first', 'evidence': 'a-round-456.md A steps'})

f = find('open_findings', 'A-R454-REVIEW-M-DEAD-UNCHECKED')
f['status'] = 'in_progress (D-29z1621): round 457 re-dispatch (round 456 C FAIL on A-R456-REVIEW-M1; LT7 verdicts held at HEAD, walker made sound + LT9) | ' + f['status']
for lst, fid in [('deferred_low_polish', 'TL-R454-L-BRACE-PREFIX-HEADER'), ('deferred_low_polish', 'A-R453-REVIEW-L-GS-TEST-GAPS'), ('deferred_low_polish', 'A-R454-REVIEW-L3'), ('deferred_low_polish', 'A-R454-REVIEW-L4'), ('deferred_low_polish', 'B-R455-DOC298-STATUS-LINE')]:
    f = find(lst, fid)
    f['status'] = 'in_progress (D-29z1621): carried to round 457 (round 456 not published) | ' + f['status']
f = find('deferred_low_polish', 'TL-R455-WALKER-LIMITS')
f['status'] = 'narrowed (D-29z1621): comment-in-brace, side-effect, import.meta.url, export * as and ?query forms now followed or flagged by LT9 in round 457; remaining: JSX use not modelled, commented-out imports fail closed | ' + f['status']
c = find('architecture_checkpoint_requests', 'ARCH-CHECKPOINT-STYLE-SCAN')
c.setdefault('signals', []).append({'added': BY, 'source': 'A round-456 code-reviewer Architecture note', 'note': 'style-scan.ts holds two subsystems (CSS rule reader, import-graph walker); reviewer suggests helpers/import-graph.ts; keep regex approach. Round 457 adds mountGraphImports/unfollowedLocalSpecifiers to the walker part. Signal only, not scheduled.'})
s13 = find('open_findings', 'SABA-B-13')
s13['status'] = 'scheduled (D-29z1621): STORE-2b-ENTRANCE right after 2b-3c-2a passes C (round 457 re-dispatch); REGRESSION-2026-11-13 first if planned on/after 11-13 | ' + s13['status']
q = [q for q in b['post_current_stage_queue'] if q['id'] == 'STORE-REDESIGN'][0]
sp = [s for s in q['stages'] if s['id'] == 'STORE-2'][0]['split_2b_d29z1583']
sp['STORE-2b-3c-2a'] = 're-dispatched round 457 (D-29z1621): round 456 C FAIL (STOPPED on A-R456-REVIEW-M1) | ' + sp['STORE-2b-3c-2a']
q['status'] = 'in_progress (D-29z1621): round 457 = STORE-2b-3c-2a re-dispatch (walker ruling A-R456-REVIEW-M1); then REGRESSION-2026-11-13 if planned on/after 11-13, SABA-B-13 entrance, 2b-3c-2b, 2b-3d, 2b-4, STORE-2c..5 | ' + q['status']

b['decisions_log_b'].append({'id': 'D-29z1620', 'date': '2026-11-11', 'by': BY, 'decision': 'Round 456 closed from evidence: C round 456 FAIL (STOPPED, routed to B, L22 short route; browserVerified/realVerified true on C7), gate 456 skipped, nothing published; no item becomes done. A-R456-REVIEW-L1/L2 -> deferred_low_polish; INFO-A-R456-PREFLIGHT-LATE logged. Tree keeps A\'s round-456 work (5 paths).'})
b['decisions_log_b'].append({'id': 'D-29z1621', 'date': '2026-11-11', 'by': BY, 'decision': 'L10 ruling on A-R456-REVIEW-M1: accepted Medium (origin B spec). B swept the whole class (comment-in-brace, worker new URL, side-effect import, export * as N, ?query). Fix in the walker only: mountGraphImports union (raw + comment-stripped matcher cannot fail open), resolveSpecifier strips query/hash/trailing slash, GT5b importsDeadModule uses the same edges (6th grant store-gradient-text.test.ts), new LT9 guard with empty reasoned allow-list. Reached 288 -> 294 strict superset; LT7 verdicts unchanged. tech-lead v1 APPROVE-WITH-CHANGES (8 findings applied), v2 APPROVE-WITH-CHANGES (N1 filter fail-open, N2 GT5b weaker: Medium, fixed; N3 Low fixed), v3 APPROVE on sha ' + SHA[:8] + ' (b-round-456/sketch-review.md). Pinned: covering 4/27, full suite 284/4151 rc 0, mutants 34 lines (BASE, C1 green; M1-M32 red), expect live-teal 62, lint 205, tsc rc 0. Round 457 = STORE-2b-3c-2a re-dispatch; order after unchanged.'})
b['rounds'].append({'round': 457, 'task': 'current-task.md', 'decision': 'D-29z1621', 'type': 'STORE-2b-3c-2a re-dispatch: walker ruling A-R456-REVIEW-M1 (test-only)', 'status': 'dispatched', 'note': 'baseline db95f40 (gate 455 commit; gate 456 skipped); tree has round-456 sketch + docs; delta b-round-456/sketch-457-delta.patch.txt sha ' + SHA[:8] + '; grants b-round-456/grants-457.txt (6)'})
b['current_task'] = 'Round 457: STORE-2b-3c-2a re-dispatch, mount walker ruling A-R456-REVIEW-M1 (current-task.md, D-29z1621)'
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(mark, 'w').write('ok\n')
print('applied 457')
