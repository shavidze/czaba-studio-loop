# B round 453 -> 454 backlog edit A: close round 453 on C's independent evidence. Idempotent via marker.
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
mark = os.path.join(L, 'b-round-453', 'update-backlog-454a.done')
if os.path.exists(mark):
    sys.exit('already applied')
p = os.path.join(L, 'backlog.json')
b = json.load(open(p, encoding='utf-8'))
assert b['version'] == 444, b['version']
BY = '2026-11-11 B round 453 -> 454 planning'
b['version'] = 445
b['updated'] = BY
for r in b['rounds']:
    if r.get('round') == 453:
        r['status'] = 'c_pass_published (D-29z1611): C round 453 PASS (c-round-453.json: C1-C13 PASS + C4b, browserVerified/realVerified true, 0 bugs, mutants 21 = B) + gate 453 published db641ec (review COMMIT OK 8/10, verify green)'
q = [q for q in b['post_current_stage_queue'] if q['id'] == 'STORE-REDESIGN'][0]
q['status'] = 'in_progress (D-29z1611): round 453 STORE-2b-3b done (published db641ec); 2b-3c split at round-454 planning (D-29z1612) | ' + q['status']
s2 = [s for s in q['stages'] if s['id'] == 'STORE-2'][0]
s2['status'] = 'in_progress (D-29z1611): 2b-3a done (449), 2b-3b done (453, db641ec); 2b-3c..d, 2b-4, 2c, 2d not_started | ' + s2['status']
sp = s2['split_2b_d29z1583']
sp['STORE-2b-3b'] = 'done (D-29z1611): C round 453 PASS (c-round-453.json, browserVerified/realVerified true, C1-C13 + C4b PASS, 0 bugs; fake-bearer, isLoading and legacy ownership halves BLOCKED backend unavailable in cloud), gate 453 published db641ec (review COMMIT OK 8/10, verify green) | ' + sp['STORE-2b-3b']
b['decisions_log_b'].append({'id': 'D-29z1611', 'date': '2026-11-11', 'by': BY, 'decision': 'Round 453 closed on C evidence: C round 453 PASS (C1-C13 + C4b; browserVerified/realVerified true; 0 bugs; C10 mutants identical to B 21 lines; C11 legacy stubbed playhead/Export hover teal 40px -> none; C12 studio-lab + anonymous purchase protection equal to HEAD). Gate 453 published db641ec on both remotes. STORE-2b-3b done. Backend halves (fake-bearer, isLoading, legacy ownership) stay open backend evidence, not failures. A reviewer Medium (DESIGN_TOKENS.md:89 still recommends shadow-glow; button.md:13, DESIGN_SYSTEM.md:1078/1155 stale) ruled: the primitive and design docs are STORE-5 scope by the Saba-approved spec row STORE-5 (DESIGN_TOKENS.md to Obsidian & Brass, no glow); no user-visible effect and GS1/GS2 fail any re-added shadow-glow, so recorded as Low A-R453-REVIEW-L-DESIGN-DOCS-STALE owner STORE-5 with an interim warning line in every STORE-2b task until then. A reviewer Lows (GS patterns miss shadow-glow-accent utility; second CSS rule parser; GS3 lacks .button-primary fill assert) -> owner STORE-2b-3c-0 (style-scan helper sub-stage); box-shadow transitions app.css 1743/2212 -> 2b-3d. Gate findings 1 info, 2-3 Low (frozen/dead inert shadow-glow class names) -> 2b-3d / legacy removal, 4 info (C measured hover fill 201,164,106 -> 217,184,127 with text 8.32/10.28; product-designer Q1 chose fill-only hover), 5 info (brand-tinted glows outside grant) -> 2b-3c/2b-3d inventory. Architecture notes (app.css size + duplicated :root brand-foreground; export one nesting-aware cssRuleBodies from style-scan) recorded as signals SIG-R453-APPCSS-SIZE and SIG-R453-CSSRULEBODIES, not auto-scheduled.'})
b['open_findings'] += [
 {'id': 'GATE453-I1-PURCHASEHEADER-COSMETIC', 'severity': 'info', 'origin': 'gate reviewer round 453', 'status': 'closed_info (D-29z1611): cosmetic class removal only, C7 measured; no purchase logic touched', 'evidence': 'gates/round-453/review.md finding 1', 'title': 'PurchaseHeader.tsx:426 only purchase-area touch, cosmetic'},
 {'id': 'GATE453-I4-BRAND-HOVER-DELTA', 'severity': 'info', 'origin': 'gate reviewer round 453', 'status': 'closed_info (D-29z1611): C4 measured hover fill rgb(201,164,106) -> rgb(217,184,127), text 8.32 -> 10.28; product-designer Q1 (round-453 planning) chose fill-only hover', 'evidence': 'gates/round-453/review.md finding 4; c-round-453/glow-compare.txt', 'title': '.btn-primary hover is now a fill change only'},
 {'id': 'GATE453-I5-BRAND-TINT-GLOWS-OUTSIDE-GRANT', 'severity': 'info', 'origin': 'gate reviewer round 453', 'status': 'scheduled (D-29z1611): STORE-2b-3c live / 2b-3d dead inventory (B re-greps at 454 planning)', 'evidence': 'gates/round-453/review.md finding 5', 'title': 'brand-tinted box-shadow rules (app.css ~2269-2275) and glow-pulse keyframes remain'},
]
b['deferred_low_polish'] += [
 {'id': 'A-R453-REVIEW-L-DESIGN-DOCS-STALE', 'severity': 'low', 'origin': 'A code-reviewer round 453 (reported Medium)', 'status': 'owner STORE-5 (D-29z1611): spec row STORE-5 updates DESIGN_TOKENS.md/DESIGN_SYSTEM.md (Saba-approved spec); downgraded: docs only, GS1/GS2 fail any re-added shadow-glow; interim warning line in each STORE-2b task', 'evidence': 'a-round-453.md code-reviewer section', 'repro': '.claude/primitives/DESIGN_TOKENS.md:89 recommends shadow-glow; docs/design/components/button.md:13; docs/design/DESIGN_SYSTEM.md:1078,1155'},
 {'id': 'A-R453-REVIEW-L-GS-TEST-GAPS', 'severity': 'low', 'origin': 'A code-reviewer round 453', 'status': 'owner STORE-2b-3c-0 style-scan helper sub-stage (D-29z1611)', 'evidence': 'a-round-453.md code-reviewer Lows', 'repro': 'store-glow-shadow.test.ts:18-19 patterns miss a shadow-glow-accent utility; :65-81 ruleBodiesFor skips nested braces and quoted braces (second CSS parser beside helpers/style-scan.ts); GS3 does not assert .button-primary fill (a brass linear-gradient without --gradient-primary passes)'},
 {'id': 'A-R453-REVIEW-L-BOXSHADOW-TRANSITION', 'severity': 'low', 'origin': 'A code-reviewer round 453', 'status': 'owner STORE-2b-3d (D-29z1611)', 'evidence': 'a-round-453.md', 'repro': 'app.css ~1743 and ~2212 transition box-shadow that no longer changes'},
 {'id': 'GATE453-L2-L3-INERT-GLOW-CLASSNAMES', 'severity': 'low', 'origin': 'gate reviewer round 453', 'status': 'owner STORE-2b-3d (dead: IconButton, ChatButton, VideoShowcase) / legacy Studio removal (frozen GlobalPlayhead) (D-29z1611); C11 measured the frozen playhead brass line without halo', 'evidence': 'gates/round-453/review.md findings 2-3', 'repro': 'shadow-glow class names remain on 4 allow-listed files and generate no CSS'},
]
for sid, note in [('SIG-R453-APPCSS-SIZE', 'gate 453 architecture note: app/styles/app.css ~3,900 lines with a duplicated :root token block (~l.65 and ~l.3885) and repeated STORE-2b rounds on one region; keep for now (deletions only). Signal, not scheduled; candidate for ARCH-SPLIT planning.'), ('SIG-R453-CSSRULEBODIES', 'A round-453 code-reviewer architecture note: export one nesting-aware cssRuleBodies(css, selector) from helpers/style-scan.ts and switch GS3 to it, with nesting and quoted-brace self-tests. Signal; considered at STORE-2b-3c-0 planning.')]:
    b['architecture_signals'].append({'id': sid, 'added': BY, 'source': 'round 453', 'note': note})
b['current_task'] = 'Round 454: see current-task.md (D-29z1612)'
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(mark, 'w').write('ok\n')
print('applied 454a')
