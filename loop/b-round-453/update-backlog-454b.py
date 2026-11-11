# B round 453 -> 454 backlog edit B: split STORE-2b-3c, dispatch round 454. Idempotent via marker.
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
mark = os.path.join(L, 'b-round-453', 'update-backlog-454b.done')
if os.path.exists(mark):
    sys.exit('already applied')
p = os.path.join(L, 'backlog.json')
b = json.load(open(p, encoding='utf-8'))
assert b['version'] == 445, b['version']
BY = '2026-11-11 B round 453 -> 454 planning'
b['version'] = 446
q = [q for q in b['post_current_stage_queue'] if q['id'] == 'STORE-REDESIGN'][0]
q['status'] = 'in_progress (D-29z1612): round 454 = STORE-2b-3c-1 live teal CSS; then REGRESSION-2026-11-13 (if planned on/after 11-13) or STORE-2b-3c-2 | ' + q['status']
s2 = [s for s in q['stages'] if s['id'] == 'STORE-2'][0]
sp = s2['split_2b_d29z1583']
sp['STORE-2b-3c'] = 'split (D-29z1612) into 2b-3c-1 (live teal CSS, round 454) and 2b-3c-2 (style-scan helper fail-open forms A-R451-REVIEW-L2-ZERO-OFFSET-UNITS + INFO-TL-R451-GLOW-CALC + A-R453-REVIEW-L-GS-TEST-GAPS, test-only, with a golden test; SIG-R453-CSSRULEBODIES considered there) | ' + sp['STORE-2b-3c']
sp['STORE-2b-3c-1'] = 'dispatched round 454 (D-29z1612): live teal removed from app.css/utilities.css only: global AudioPlayer artwork/play/thumb-hover glow layers; ProductCard .light-flicker-effect::after deleted + ::before 40% stop neutral; 404 grid ink, .code-4/.code-0 glows none; palette selected rgba(brand-rgb,.12); .styled-scrollbar thumb outline-strong/muted. Inventory b-round-453/inv (all CSS files, reachability). Sketch v2 sha 359f4208; LT1-LT4 store-live-teal.test.ts; 16 mutants + 2 controls; HEAD vs sketch 19 rows ALL_OK at 1440/1280; scrollbar pixels 15,94,87 -> 115,107,96.'
sp['STORE-2b-3c-2'] = 'not_started (D-29z1612): test-only helper sub-stage; next after round 454 unless REGRESSION-2026-11-13 is due'
d3 = sp.get('STORE-2b-3d', '')
sp['STORE-2b-3d'] = 'not_started (D-29z1612 additions): dead teal CSS left by 2b-3c-1 = @theme --color-glow-primary/--color-video-sync/--gradient-primary/--gradient-hero/--gradient-glow; .hover-glow (app.css + utilities.css), .interactive-card (both), .product-detail-add-to-cart, .newsletter-button-large, .testimonial-card, .track-card-play-button, .waveform-bar, .track-row-waveform*, .loading-brand, .piano-key, .pack-card-3d, .about-image-overlay, .value-card, .glass-card, .premium-card-*, glow-pulse (+ .hero-*-dot), playButtonPulse (+ .is-playing), .audio-preview-inline-button + audioPlayingPulse (inline variant never rendered: K7) + dead .light-flicker-stagger rules; LT3 allow-list (app.css 37, utilities.css 6) shrinks with them | ' + d3
b['rounds'].append({'round': 454, 'task': 'current-task.md', 'decision': 'D-29z1612', 'type': 'STORE-2b-3c-1 live teal CSS', 'status': 'dispatched', 'note': 'baseline db641ec; sketch b-round-453/sketch-454.patch.txt sha 359f4208 (v2; v1 in v1-superseded); grants b-round-453/grants-454.txt (4, narrow app/styles/app.css + app/styles/base/utilities.css); claims b-round-453/claims-454.sh K1-K14; mutants 19 lines'})
b['decisions_log_b'].append({'id': 'D-29z1612', 'date': '2026-11-11', 'by': BY, 'decision': 'Round 454 = STORE-2b-3c-1 (regression not due before 2026-11-13). Inventory rebuilt after the advisor flagged the first scan (multi-line selectors, keyframes, all CSS files, reachability from routes/root/entries with barrel resolution): 5 live teal groups (global AudioPlayer, ProductCard light ::after and ::before 40% stop, 404 grid/code-4/code-0, palette selected row, .styled-scrollbar) measured at HEAD in Chromium. Dead rules -> 2b-3d (list in split STORE-2b-3d), incl. .audio-preview-inline-button (every caller passes variant=overlay). Frozen legacy-only CSS (.stems-loader-list, studio.css slider-thumb-teal) untouched, allow-listed (LT3) until legacy removal; shared .styled-scrollbar change reaches the frozen legacy ExportDialog by CSS only (shared-rule change wins, as round 453). product-designer Q1-Q5: player drop teal layers keep dark offsets, play hover fill-only; delete card ::after; 404 foreground grid, no digit glow, ring keeps brass border; palette brass .12; scrollbar outline-strong/muted. The ::before teal stop (missed by the consult and B v1) -> rgba(236,230,218,.06) in sketch v2. Motion/scale untouched (STORE-2c/2d). Test pins exact block literals (no third CSS parser); helper consolidation in 2b-3c-2. Firefox scrollbar = TLM-R454-FIREFOX-SCROLLBAR (deadline RETRO 465). Narrow grants app/styles/app.css + app/styles/base/utilities.css.'})
b['tech_lead_manual_checks'] = b.get('tech_lead_manual_checks', [])
entry = {'id': 'TLM-R454-FIREFOX-SCROLLBAR', 'added': BY, 'status': 'open (after round 454 C PASS)', 'deadline': 'RETRO 465', 'steps': 'Firefox desktop: /cart with several items and a ConfirmDialog: the scrollbar thumb is neutral grey (#736B60), not teal; visible against the page', 'why': 'no Firefox on the cloud runner (ROOT-REQ-PLAYWRIGHT-FIREFOX)'}
if isinstance(b['tech_lead_manual_checks'], list):
    b['tech_lead_manual_checks'].append(entry)
else:
    b['tech_lead_manual_checks'][entry['id']] = entry
b['current_task'] = 'Round 454: STORE-2b-3c-1 live teal CSS (current-task.md, D-29z1612)'
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(mark, 'w').write('ok\n')
print('applied 454b')
