# B round 464 -> 465 planning, part 1: accept round 464. Usage: python3 -I b-round-464/update-backlog-accept.py <loop root>. Idempotent (.done).
import json, os, sys
L = sys.argv[1]; P = f'{L}/backlog.json'; DONE = f'{L}/b-round-464/update-backlog-accept.done'
if os.path.exists(DONE):
    print('already applied'); sys.exit(0)
b = json.load(open(P, encoding='utf-8'))
TODAY = '2026-11-12'; BY = '2026-11-12 B round 464 -> 465 planning'
C464 = ('C round 464 PASS (c-round-464.json C1-C10, browserVerified/realVerified true, 0 bugs; C7 26/26 page rows + non-vacuity, '
        'C8 /studio-lab anonymous + /studio/middle-east "Sign in required" at 1440 and 1280), gate 464 published 6d321c7 (review COMMIT OK, 9/10, 2 Lows + 2 info + 1 architecture note)')
b['version'] += 1; b['updated'] = TODAY
def find(lst, i):
    return next((e for e in lst if isinstance(e, dict) and e.get('id') == i), None)
for r in b['rounds']:
    if r.get('round') == 464:
        r['status'] = 'c_pass_published'; r['result'] = C464 + ' (D-29z1636)'
of = b['open_findings']; dl = b['deferred_low_polish']; sig = b['architecture_signals']
e = find(of, 'A-R463-REVIEW-M1')
e['status'] = f'closed (D-29z1636): {C464}; C5 mutants M1-M9 red, C6 built keyframes = HEAD minus the 4 | ' + e['status']
for i in ['B-R463-DC2-UNDERSCORE', 'A-R463-REVIEW-L3']:
    e = find(dl, i); e['status'] = f'closed (D-29z1636): C round 464 PASS (passed list), gate 464 published 6d321c7 | ' + e['status']
find(dl, 'TL-R464-L1-COMMENT-AFTER-UNLISTED-CHAR').setdefault('confirmedBy', []).append('GATE464-1 (gate 464 review finding 1)')
e = find(dl, 'TL-R464-L2-MATCHER-FAILS-RED-FORMS'); e.setdefault('confirmedBy', []).extend(['GATE464-2 (gate 464 review finding 2)', 'A-R464-REVIEW-L1 (multi-line comma list)', 'A-R464-REVIEW-L2 (vendor-prefixed, quoted keys, el.style.animation, ternaries)'])
find(sig, 'SIG-R464-PULSE-KEYFRAMES-SHADOW').setdefault('confirmedBy', []).append('GATE464-3 (gate 464 review info 3)')
for i, t, ev, st in [
    ('A-R464-REVIEW-L3', 'DC2/DC4 comment stripper starts after whitespace or ( even inside strings/CSS (url(//...), " // " in JSX text) and can wipe following real uses (fails red); 0 cases in app/**/*.css today', 'a-round-464.md code-reviewer L3', 'deferred_low_polish (D-29z1636): fails red'),
    ('A-R464-REVIEW-L4', 'DC2 named-utility branch takes the animate-<suffix> as the keyframes name (Tailwind resolves via --animate-<suffix>); value tokens such as infinite also count. Fail-silent only if a keyframes shares a utility suffix whose theme maps elsewhere. B check (b-round-464/l4-check.txt): of the 11 kept keyframes only pulse is used solely through this branch (9 animate-pulse uses, Tailwind default --animate-pulse = pulse), which is the correct case', 'a-round-464.md code-reviewer L4; b-round-464/l4-check.txt', 'deferred_low_polish (D-29z1636): fail-silent class, 0 wrong cases today; folds into SYS-R465-DEAD-CSS-MATCHER (retro 465)'),
    ('A-R464-REVIEW-L5', 'DC4 negative {/* dc-jsx-comment-spin */} has no animation context, so it passes without stripping (vacuous); suggest {/* animation: dc-jsx-comment-spin 1s */}', 'a-round-464.md code-reviewer L5', 'deferred_low_polish (D-29z1636): test strength; folds into SYS-R465-DEAD-CSS-MATCHER (retro 465)'),
    ('A-R464-REVIEW-L6', 'No DC4 positives for animationName, double-quote/backtick strings, one-line animation-name', 'a-round-464.md code-reviewer L6', 'deferred_low_polish (D-29z1636): coverage gap'),
]:
    dl.append({'id': i, 'severity': 'low', 'origin': 'B spec (round 464 sketch-pinned matcher; found by A code-reviewer)', 'status': st, 'title': t, 'evidence': ev, 'added': BY})
sig.append({'id': 'SIG-R464-THIRD-COMMENT-STRIPPER', 'status': 'signal (D-29z1636); added to ARCH-CHECKPOINT-STYLE-SCAN', 'note': 'store-dead-css.test.ts adds a third comment stripper next to the two private ones in helpers/style-scan.ts (strip-all, string-aware); gate 464 reviewer: keep for now, extract one shared isUsedInSource helper if DC1/DC2 keep different "used" definitions', 'evidence': 'a-round-464.md Architecture note; gates/round-464/review.md Architecture note', 'added': BY})
cp = find(b['architecture_checkpoint_requests'], 'ARCH-CHECKPOINT-STYLE-SCAN')
cp['signals'].append({'added': BY, 'source': 'A round-464 code-reviewer + gate 464 reviewer Architecture notes', 'note': 'SIG-R463-USED-DEFINED-TWICE and SIG-R464-THIRD-COMMENT-STRIPPER: three comment strippers and two definitions of "used". Re-raised to root at the round-465 planning (still unanswered since D-29z1619); non-blocking.'})
sr = next(e for e in b['post_current_stage_queue'] if e.get('id') == 'STORE-REDESIGN')
split = sr['stages'][2]['split_2b_d29z1583']
split['STORE-2b-3d-3'] = f'done (D-29z1636): {C464} | ' + split['STORE-2b-3d-3']
b['decisions_log_b'].append({'id': 'D-29z1636', 'date': TODAY, 'by': BY, 'decision': (
    f'Round 464 STORE-2b-3d-3 done: {C464}. Closed A-R463-REVIEW-M1 (confirmedBy C-R463-01), B-R463-DC2-UNDERSCORE, A-R463-REVIEW-L3. '
    'Gate 464: finding 1 -> confirmedBy TL-R464-L1, 2 -> confirmedBy TL-R464-L2, info 3 -> confirmedBy SIG-R464-PULSE-KEYFRAMES-SHADOW, info 4 doc OK (no id), Architecture note -> SIG-R464-THIRD-COMMENT-STRIPPER. '
    'A code-reviewer Lows: L1, L2 -> confirmedBy TL-R464-L2 (fail red); L3, L6 deferred; L4 and L5 (fail-silent / test strength, same direction as the Medium) deferred and ruled Low: '
    'B check l4-check.txt shows the only keyframes kept through the named-utility branch is pulse, the correct Tailwind default case. ARCH-CHECKPOINT-STYLE-SCAN re-raised.')})
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(DONE, 'w').write('applied\n'); print('ok version', b['version'])
