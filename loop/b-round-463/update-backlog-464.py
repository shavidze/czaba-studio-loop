# Usage: python3 -I b-round-463/update-backlog-464.py <loop root>. Idempotent via b-round-463/update-backlog-464.done.
import json, os, sys
L = sys.argv[1]; P = f'{L}/backlog.json'; DONE = f'{L}/b-round-463/update-backlog-464.done'
if os.path.exists(DONE):
    print('already applied'); sys.exit(0)
b = json.load(open(P, encoding='utf-8'))
TODAY = '2026-11-12'; BY = '2026-11-12 B round 463 -> 464 planning'
b['version'] = b['version'] + 1
b['updated'] = TODAY
b['current_task'] = 'Round 464: STORE-2b-3d-3, delete the 4 orphan keyframes + DC2 counts only animation use (A-R463-REVIEW-M1 = C-R463-01, B-R463-DC2-UNDERSCORE, A-R463-REVIEW-L3) (current-task.md, D-29z1635)'
for r in b['rounds']:
    if r.get('round') == 463:
        r['status'] = 'c_pass_published'
        r['result'] = 'C round 463 PASS (c-round-463.json C1-C10, browserVerified/realVerified true; 1 Low C-R463-01 origin B spec = confirmedBy on A-R463-REVIEW-M1); gate 463 published d55ec17 (review COMMIT OK, all Lows) (D-29z1634)'
b['rounds'].append({'round': 464, 'task': 'current-task.md', 'decision': 'D-29z1635', 'type': 'STORE-2b-3d-3: delete 4 orphan @keyframes (float, grain, fadeInUp, fadeOut) + 2 comment headers; DC2 counts only animation declarations/utilities/inline styles, comments stripped; new DC4', 'status': 'dispatched', 'note': 'baseline d55ec17 (gate 463 published); A applies b-round-463/sketch-464.patch.txt sha 940c0993 (v2); grants = b-round-463/grants-464.txt (3 paths)'})
b['narrow_grants'].append({'round': 464, 'decision': 'D-29z1635', 'path': 'app/styles/app.css', 'scope': 'deletions only (45 lines, 0 added), byte-equal to b-round-463/sketch-464-files-sha256.txt: 4 orphan @keyframes + Film Grain and PREMIUM ANIMATIONS comment headers; obsidian block and every other byte unchanged', 'justification': 'STORE-2b-3d-3; A-R463-REVIEW-M1 / C-R463-01; Saba legacy-removal policy 2026-11-10; tech-lead APPROVE WITH CHANGES on v1, Low fixed in v2 (b-round-463/sketch-review.md)'})
def find(lst, i):
    return next((e for e in lst if isinstance(e, dict) and e.get('id') == i), None)
of = b['open_findings']; dl = b['deferred_low_polish']; sig = b['architecture_signals']
e = find(of, 'C-R462-01')
e['status'] = 'closed (D-29z1634): C round 463 C6 cmp-equal build-compare (CSS -274, the 12 utilities among them) and B check b-round-463/c-r462-01-head-utilities.txt (0 of 12 in the d55ec17 build) | ' + e['status']
of.append({'id': 'A-R463-REVIEW-M1', 'severity': 'medium', 'origin': 'B spec', 'status': 'scheduled round 464 (D-29z1635): sketch-464 deletes the 4 orphans and rewrites DC2 (+DC4); closes on C PASS', 'title': 'DC2 (store-dead-css.test.ts) counts a keyframes name as consumed on any whole-word text match (comment, identifier, type field), so 4 keyframes orphaned by round 463 (float, grain, fadeInUp, fadeOut) stayed in app.css and the shipped CSS', 'evidence': 'a-round-463.md code-reviewer M1; c-round-463.md C-R463-01; gates/round-463/review.md finding 1', 'confirmedBy': ['C-R463-01 (C round 463, Low, origin B spec)', 'GATE463-1 (gate 463 review finding 1, Low)'], 'ruling': 'D-29z1634: Medium kept for the test contract (DC2 could not detect an orphan); no visible effect (C7 deadAnim 0/0); C-R463-01 is a confirmation, not a new bug (L7)', 'added': BY})
e = find(dl, 'A-R453-REVIEW-L-BOXSHADOW-TRANSITION')
e['status'] = 'closed (D-29z1634): C round 463 PASS (claims K14 5 -> 0), gate 463 published d55ec17 | ' + e['status']
e = find(dl, 'B-R463-DC2-UNDERSCORE')
e['status'] = 'scheduled round 464 (D-29z1635): DC2 arbitrary-utility branch + DC4 fixture (mutant M4); closes on C PASS | ' + e['status']
e = find(dl, 'TL-R463-L7')
e.setdefault('confirmedBy', []).append('GATE463-2 (gate 463 review finding 2)')
dl.append({'id': 'A-R463-REVIEW-L3', 'severity': 'low', 'origin': 'B spec', 'status': 'scheduled round 464 (D-29z1635): Film Grain and PREMIUM ANIMATIONS headers deleted; the missing blank line before the skeleton header is ruled accepted (keeps the diff pure deletion); closes on C PASS', 'title': 'Section-header comments left over an orphan keyframes / over nothing in app.css after round 463; missing blank line', 'evidence': 'a-round-463.md code-reviewer L3; gates/round-463/review.md finding 4', 'confirmedBy': ['GATE463-4'], 'added': BY})
for i, t, ev in [
    ('A-R463-REVIEW-L1', 'DC1 is weak for one-word state classes (active, playing, selected, visible match Tailwind prefixes, tags, identifiers)', 'a-round-463.md code-reviewer L1'),
    ('A-R463-REVIEW-L2', 'Remaining premium-card / track-row / waveform / artist CSS families have consumers only in unmounted files; DC1 "rendered" = "named in source" (LEGACY-DEAD remainder)', 'a-round-463.md code-reviewer L2; gates/round-463/review.md finding 3'),
    ('A-R463-REVIEW-L4', 'Pre-existing: undefined custom properties used in app.css (--color-accent-hover, --color-text-primary, --radius-xs, --primary-hue/sat/light); global transition/press rules duplicated in app.css and utilities.css; .track-row-waveform:hover declared twice', 'a-round-463.md code-reviewer L4'),
    ('A-R463-REVIEW-L5', 'GT1 title (store-gradient-text.test.ts) still mentions an allow-listed dead rule while the allow-list is {}', 'a-round-463.md code-reviewer L5; gates/round-463/review.md finding 5'),
    ('A-R463-REVIEW-L6', 'M10/DC3 bind only the Lenis classes the fixture uses; listFiles excludes __tests__ dirs but not *.test.* files outside them (related TL-R463-L3)', 'a-round-463.md code-reviewer L6')]:
    dl.append({'id': i, 'severity': 'low', 'origin': 'B spec', 'status': 'deferred_low_polish (D-29z1634)', 'title': t, 'evidence': ev, 'added': BY})
e = find(sig, 'SIG-R463-TAILWIND-DOCS-SOURCE')
e.setdefault('confirmedBy', []).append('GATE463-6 (gate 463 review finding 6)')
sig.append({'id': 'SIG-R463-USED-DEFINED-TWICE', 'status': 'signal (D-29z1634); fold into ARCH-CHECKPOINT-STYLE-SCAN', 'note': '"used" is defined twice (b-round-462/css-prune.py and store-dead-css.test.ts), both text-based and already different (ts/tsx vs js/md); later: one comment-stripped reference helper in helpers/style-scan.ts once the checkpoint allows', 'evidence': 'a-round-463.md Architecture note', 'added': BY})
sig.append({'id': 'SIG-R463-APPCSS-MIXED', 'status': 'signal (D-29z1634): after the LEGACY-DEAD remainder, one bounded split of the surviving app.css (ARCH-SPLIT candidate)', 'note': 'app.css mixes live Lenis/base rules, AudioPlayer, the LEGACY-DEAD remainder, the Studio obsidian block and the frozen stems-loader-list', 'evidence': 'gates/round-463/review.md Architecture note', 'added': BY})
sig.append({'id': 'SIG-R464-PULSE-KEYFRAMES-SHADOW', 'status': 'info signal (D-29z1635), not scheduled', 'note': 'app.css defines its own top-level @keyframes pulse (opacity 0.7) with the same name Tailwind animate-pulse uses; the built CSS has one pulse keyframes, so the project keyframes decides how every animate-pulse element looks; deleting or renaming it is a visible change and needs a design ruling', 'evidence': 'b-round-463.md; /tmp build keyframes list in b-round-463.md', 'added': BY})
sr = next(e for e in b['post_current_stage_queue'] if e.get('id') == 'STORE-REDESIGN')
sr['status'] = 'in_progress (D-29z1635): round 463 STORE-2b-3d-2 done (published d55ec17); round 464 = STORE-2b-3d-3 (4 orphan keyframes + DC2 rule, A-R463-REVIEW-M1); next RETRO 465 (REGRESSION-2026-11-13 first if the round-465 planning is on/after 11-13), then 2b-3c-2b, 2b-4, STORE-2c..5 | ' + sr['status']
split = sr['stages'][2]['split_2b_d29z1583']
split['STORE-2b-3d-2'] = 'done (D-29z1634): C round 463 PASS (c-round-463.json C1-C10, browserVerified/realVerified true), gate 463 published d55ec17 (review COMMIT OK, all Lows) | ' + split['STORE-2b-3d-2']
split['STORE-2b-3d-3'] = 'dispatched round 464 (D-29z1635): delete float, grain, fadeInUp, fadeOut keyframes + 2 comment headers; DC2 counts only animation declarations/utilities/inline styles (comments stripped); DC4 fixtures; sketch b-round-463/sketch-464.patch.txt sha 940c0993 (v2)'
b['decisions_log_b'].append({'id': 'D-29z1634', 'date': TODAY, 'by': BY, 'decision': 'Round 463 STORE-2b-3d-2 done: C PASS (c-round-463.json C1-C10, browserVerified/realVerified true), gate 463 published d55ec17 (review COMMIT OK, 6 Lows + 2 architecture notes). Closed: C-R462-01 (also checked: 0 of 12 utilities in the d55ec17 build), A-R453-REVIEW-L-BOXSHADOW-TRANSITION, GATE453-I5, GATE462-L2. A-R463-REVIEW-M1 kept Medium (test contract), C-R463-01 and GATE463-1 recorded as confirmedBy (L7); A-R463-REVIEW-L1/L2/L4/L5/L6 deferred_low_polish; L3 scheduled; GATE463-2 -> TL-R463-L7, GATE463-6 -> SIG-R463-TAILWIND-DOCS-SOURCE; signals SIG-R463-USED-DEFINED-TWICE, SIG-R463-APPCSS-MIXED. No new Saba/root input (user-review unchanged, workflow doc unchanged).'})
b['decisions_log_b'].append({'id': 'D-29z1635', 'date': TODAY, 'by': BY, 'decision': 'Round 464 = STORE-2b-3d-3 fix-up (current-task.md): sketch-464 (sha 940c0993 (v2)) deletes the 4 orphan @keyframes and 2 comment headers from app.css (45 lines, pure deletion, obsidian unchanged) and rewrites DC2 to count only animation/animation-name/--animate-* declarations, inline animation styles and animate- utilities (comments stripped), plus DC4 fixtures built with join() so Tailwind cannot scan them. Pre-check: covering 14/149 green, tsc 0, lint 192, mutants M1-M8 red (v2 adds M8, string-aware comment stripping per tech-lead Low), prod build server 0 / JS root identifier-only / CSS -4 keyframes 0 added, browser 13 pages x 2 viewports computed-style equal + non-vacuity. Closes on C PASS: A-R463-REVIEW-M1, B-R463-DC2-UNDERSCORE, A-R463-REVIEW-L3. Next: RETRO 465; REGRESSION-2026-11-13 first if the round-465 planning is on/after 2026-11-13 (precedent D-29z1448). Then 2b-3c-2b, 2b-4, STORE-2c..5.'})
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(DONE, 'w').write('applied\n')
print('ok version', b['version'])
