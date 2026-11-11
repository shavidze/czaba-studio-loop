"""B round 448 -> 449 planning backlog update. Idempotent (update-backlog.done)."""
import json, os, sys
LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
B = f'{LOOP}/b-round-448'
DONE = f'{B}/update-backlog.done'
if os.path.exists(DONE):
    sys.exit('already applied')
p = f'{LOOP}/backlog.json'
b = json.load(open(p, encoding='utf-8'))
by = '2026-11-11 B round 448 -> 449 planning'
b['version'] += 1
b['updated'] = '2026-11-11'
of = b['open_findings']
ofi = {e.get('id'): e for e in of}
dl = b['deferred_low_polish']
C448 = ('C round 448 PASS (c-round-448.json, browserVerified/realVerified true, C1-C6 + C8-C13 PASS, C7 real mail send BLOCKED no Brevo key, 0 bugs, '
        'l57-check OK), gate 448 published 48e16b8 (review COMMIT OK, verify green: 281 files / 4119 tests)')

q = next(e for e in b['post_current_stage_queue'] if e['id'] == 'STORE-REDESIGN')
st2 = next(s for s in q['stages'] if s['id'] == 'STORE-2')
sp = st2['split_2b_d29z1583']
sp['STORE-2b-2b'] = f'done (D-29z1593): {C448} | ' + sp.get('STORE-2b-2b', '')
sp['STORE-2b-3'] = ('split (D-29z1594) into 2b-3a..2b-3d; B re-greps each stage at its own planning (the round-449 rule-usage script counts rules, not consumers, and is not a claim) | '
                    + sp.get('STORE-2b-3', ''))
sp['STORE-2b-3a'] = ('dispatched round 449 (D-29z1595): gradient text - --gradient-text token, .text-glow (app.css + base/utilities.css), .hero-title-glow and the '
                     'gradient lines of the dead .product-detail-title; class token removed from 7 live TSX sites (8 words: hero CZABA, Releases, Studio, Inner Circle, '
                     'about Cinema + Stand For, 404 Sound, LeadMagnet eyebrow); emphasised word = heading light ink (product-designer option A); new test GT1-GT5')
sp['STORE-2b-3b'] = ('not_started: glow shadows - --shadow-glow / --shadow-glow-accent (no obsidian override) and their TSX users (ui/Button, ui/IconButton, chat x3, '
                     'VideoShowcase is dead, frozen GlobalPlayhead), hover-glow / btn-primary / button-primary / audio-player glows; needs Studio rows (ui/Button in /studio-lab?)')
sp['STORE-2b-3c'] = ('not_started: remaining live teal CSS rules in app.css and base/utilities.css (audio-preview-inline-button, audio-player-*, interactive-card, '
                     'light-flicker-effect, waveform-bar.active, track-row-waveform, not-found-grid, code-0/code-4, command-palette, artist-photo-glow, newsletter glows); '
                     'A-R447-REVIEW-L2 (inline boxShadow scan) joins here')
sp['STORE-2b-3d'] = ('not_started: dead tokens and rules (crystal-*, premium-*, glow-primary/secondary, video-sync, gradient-hero, gradient-glow, the 0-consumer rule '
                     'blocks) -> with LEGACY-DEAD-STORE-COMPONENTS removal, not a restyle')
st2['status'] = ('in_progress (D-29z1593..D-29z1595): 2a done; 2b-1 done (446); 2b-2a done (447); 2b-2b done (448); 2b-3 split a-d, 2b-3a dispatched round 449; '
                 '2b-3b..d, 2b-4, 2c, 2d not_started | ' + st2['status'])
q['status'] = 'in_progress (D-29z1595): STORE-2b-2b done (448, 48e16b8); round 449 = STORE-2b-3a (gradient text) | ' + q['status']

r448 = next(r for r in b['rounds'] if r.get('round') == 448)
r448['status'] = 'c_pass_published'
r448['result'] = C448 + ' (D-29z1593)'

h = ofi['B-R447-HIREUS-EMAIL-LIGHT-CLIENT']
h['status'] = 'closed (D-29z1593): C round 448 C3 PASS - tree 0/12 failing in light and dark clients (min 7.06:1), HEAD reproduces 10/12 and 1/12; gate 448 published 48e16b8; mail-client half = TLM-R448-HIREUS-EMAIL-CLIENTS | ' + h['status']
t = ofi['TLM-R448-HIREUS-EMAIL-CLIENTS']
t.setdefault('confirmedBy', []).append('gate 448 reviewer Low 1 (gates/round-448/review.md: no real-client check)')
a = ofi['B-R447-AUTH-ROW-PREMISE']
a['status'] = ('updated (D-29z1593): C round 448 O4 saw "Sign in required" on both trees in a second run after a blank first HEAD run, so "blank in the cloud" was a cold start, '
               'not a stable fact; round 449 C row warms the route first (L38) and records the text on HEAD and tree; 0 audio[src] / 0 media requests stay the assert | ' + a['status'])
o3 = ofi['INFO-C447-O3-HERO-PIXEL-DIFF']
o3['status'] = ('closed (D-29z1593): C round 448 C10 - 1280 HEAD-vs-HEAD 0 px; 1440 HEAD-vs-HEAD 292111 px (y81-867), so a full-page diff of / at 1440 is not a control (L37); '
                'attributed to animation; home rows from round 449 measure element paint and boxes, not full-page pixels | ' + o3['status'])
of.append({'id': 'INFO-C448-PAGE-PROBE-TIMEOUT', 'severity': 'info', 'origin': 'C observation (round 448 O3)',
           'title': 'The /hire-us page probe needed animations disabled and a 120 s screenshot timeout on the dev server (default 60 s timed out)',
           'status': 'logged (D-29z1593): round 449 probes use animations disabled + 120 s screenshot timeout', 'evidence': 'c-round-448.json notes O3', 'added': by})
lg = ofi['LEGACY-DEAD-STORE-COMPONENTS']
lg['title'] += ('; + app/components/home/ArtistBioSection.tsx, TestimonialsSection.tsx, VideoShowcase.tsx (0 importers outside the home barrel; text-glow class kept, allow-listed in '
                'store-gradient-text GT3 and guarded by GT5) and the dead CSS rule .loading-brand (consumer PianoLoadingAnimation, 0 importers; allow-listed in GT1). '
                'TestimonialsSection holds keep-list content ("Netflix Original Score"): its removal needs Saba (SABA-Q-TESTIMONIALS-UNMOUNTED). When a component is deleted, '
                'remove its allow-list entries (store-teal-sweep, store-gradient-text) in the same task (gate 448 review proposal; tech-lead round-449 Architecture note) (D-29z1594)')
lg['evidence'] += '; b-round-448/claims-449-planning-output.txt K5, K5b'
of.append({'id': 'SABA-Q-TESTIMONIALS-UNMOUNTED', 'severity': 'info', 'origin': 'B (round 449 planning)',
           'title': ('Keep-list item "testimonials and stats" ("2,500+ Happy Customers", "Netflix Original Score"): TestimonialsSection has not been mounted on any page since '
                     'a208b4c (2026-10-02, before the 2026-10-25 keep-list); only the "2,500+" stat renders, on /about. Question: re-mount the testimonials on the home page '
                     '(placement decided in STORE-3/4), or confirm the /about stats are the kept item?'),
           'status': 'awaiting_user (D-29z1594): asked once in b-round-448.md For Saba; nothing removed or re-mounted until Saba answers',
           'evidence': 'b-round-448/claims-449-planning-output.txt K5, K17', 'added': by})
of.append({'id': 'SABA-Q-LEADMAGNET-EYEBROW-TONE', 'severity': 'info', 'origin': 'B (product-designer consult, round 449 planning)',
           'title': 'LeadMagnet popup eyebrow "CZABA" loses its gradient and takes light ink #ECE6DA (restyle-only keep-list); the designer would prefer caption grey #A39B8E there. Keep light ink or mute it?',
           'status': 'awaiting_user (D-29z1595): light ink ships', 'added': by})
of.append({'id': 'TLM-R449-WEBKIT-HEADING-INK', 'severity': 'info', 'origin': 'environment (no WebKit on the cloud runner)',
           'title': 'Tech Lead manual: in Safari, the 8 emphasised heading words (home hero CZABA, Latest Releases, CZABA Studio, Join the Inner Circle, about x2, 404, LeadMagnet eyebrow) are visible light ink, not transparent',
           'status': 'open_tech_lead_manual (D-29z1595): deadline RETRO 465 (L46); does not block', 'added': by})
dl.append({'id': 'A-R448-REVIEW-M1-GOLDEN', 'severity': 'low', 'origin': 'B spec (round 448 sketch had no golden/text-order test; found by A code-reviewer)',
           'status': ('deferred_low_polish (D-29z1593): reviewer graded Medium; B re-grades Low - HE4 pins that all 5 submitted values appear escaped, HE5 pins the action wiring and '
                      'C4 verified the template structure against HEAD once (10-line diff = B expectation); what stays unpinned is label text/order in an internal owner e-mail. '
                      'RETRO 450 candidate (B spec origin)'),
           'title': 'No golden or visible-text-order test pins buildHireUsInquiryEmailHtml to the HEAD template; HE5 compares the builder with itself',
           'evidence': 'a-round-448.md For B; c-round-448.json notes O6', 'repro': 'app/lib/__tests__/hire-us-inquiry-email.test.ts at 48e16b8',
           'fix': 'one visible-text sequence assertion (labels + values in order)', 'added': by})
dl.append({'id': 'A-R448-REVIEW-L2', 'severity': 'low', 'origin': 'B spec (round 448 sketch; found by A code-reviewer)',
           'status': 'deferred_low_polish (D-29z1593)', 'confirmedBy': ['C round 448 notes for B (c-round-448.md)'],
           'title': 'HE9 falls back to #000 on #fff (21:1) when a colour cannot be resolved, so HE9 alone could pass vacuously (HE8 catches it)',
           'evidence': 'a-round-448.md code-reviewer L2', 'repro': 'app/lib/__tests__/hire-us-inquiry-email-contrast.test.ts at 48e16b8', 'fix': 'fail on an unresolved colour instead of falling back', 'added': by})
for lid, title, fix in [
    ('TL-R449-L3-SCAN-ROOTS', 'store-gradient-text GT1 scans app.css and styles/base only; legacy Studio CSS (studio.css, pages/studio.css; frozen) and TSX bg-clip-text utilities are unscanned (0 hits today)', 'extend the scan roots when those files are unfrozen or removed'),
    ('TL-R449-D1-LOADING-BRAND-CLASS', 'store-gradient-text GT5 guards the PianoLoadingAnimation component but not the .loading-brand class; a live className="loading-brand" would bring gradient text back with every test green (today only PianoLoadingAnimation.tsx:49)', 'allow loading-brand only in PianoLoadingAnimation.tsx (GT3-style), or delete the rule with the LEGACY removal'),
    ('TL-R449-D2-BARREL-ALIAS', 'store-gradient-text GT5 excludes barrel files wholesale, so an aliased re-export (export { ArtistBioSection as Bio }) would pass (fails open, unlikely)', 'scan barrels for aliased re-exports of the dead names'),
    ('TL-R449-L4-PARSER-QUOTES', 'store-gradient-text parser files a hit under the wrong selector when a quoted { or ; precedes it (fails safe: the hit is still reported; 0 such strings today)', 'skip quoted strings in the segment scanner'),
]:
    dl.append({'id': lid, 'severity': 'low', 'origin': 'B sketch (tech-lead sketch review, round 449 planning)', 'status': 'deferred_low_polish (D-29z1595)',
               'title': title, 'evidence': 'b-round-448/sketch-review.md', 'repro': 'app/lib/__tests__/store-gradient-text.test.ts in b-round-448/sketch-449.patch.txt', 'fix': fix, 'added': by})
b['architecture_signals'].append({'id': 'SIG-R449-DEAD-ALLOWLIST-TWO-TESTS', 'added': by, 'decision': 'D-29z1595', 'source': 'b-round-448/sketch-review.md (tech-lead Architecture note)',
    'signal': 'the dead-component allow-list (reason LEGACY-DEAD-STORE-COMPONENTS) now lives in store-teal-sweep and store-gradient-text; deleting the components is cheaper than guarding them in more tests',
    'status': 'signal only; attached to LEGACY-DEAD-STORE-COMPONENTS; not scheduled'})
b['retro_candidates'].append({'id': 'RETRO450-B-SKETCH-NO-GOLDEN', 'added': by, 'decision': 'D-29z1593',
    'text': 'Round 448: B sketch extracted a template with no golden/text-order test; A reviewer graded it Medium, C covered it by the C4 structure diff. Candidate rule: an extraction task pins the extracted output to HEAD bytes or visible text order.'})
b['retro_candidates'].append({'id': 'RETRO450-B-INVENTORY-TOOL-FIRST-PASS', 'added': by, 'decision': 'D-29z1594',
    'text': 'Round 449 planning: the first token-usage grep put -- before --include (so the filters became file names) and -glow matched text-glow/hover-glow; the advisor caught it before any claim used it. Candidate rule: an inventory command is checked on one known hit and one known miss before its numbers are written down (L1 already says this for scanners).'})
b['decisions_log_b'] += [
    {'id': 'D-29z1593', 'date': '2026-11-11', 'by': by, 'decision': (f'Round 448 accepted: {C448}; STORE-2b-2b done; B-R447-HIREUS-EMAIL-LIGHT-CLIENT closed (C3). '
        'A-R448-REVIEW-M1-GOLDEN re-graded Low with reason (HE4/HE5 + C4) -> deferred_low_polish, RETRO 450 candidate; A-R448-REVIEW-L2 deferred (confirmedBy C). '
        'TLM-R448 confirmedBy gate Low 1. B-R447-AUTH-ROW-PREMISE updated (cold start, C O4). INFO-C447-O3 closed (animation; 1440 full-page / diff is not a control). '
        'INFO-C448-PAGE-PROBE-TIMEOUT logged. l57-check on c-round-448.json OK (claimCheckMinutes null).')},
    {'id': 'D-29z1594', 'date': '2026-11-11', 'by': by, 'decision': ('STORE-2b-3 split into 2b-3a gradient text, 2b-3b glow shadows, 2b-3c remaining live teal CSS, 2b-3d dead tokens/rules '
        '(70 teal hits in app.css + glow/blur rules: not one checkable round). Gradient text first: self-contained, no Studio consumer, obsidian block untouched, fully '
        'browser-measurable. ArtistBioSection, TestimonialsSection, VideoShowcase and PianoLoadingAnimation (.loading-brand) are dead (0 importers outside barrels) -> '
        'not restyled (round-447 rule), allow-listed with exact counts and guarded by GT5; added to LEGACY-DEAD-STORE-COMPONENTS. Keep-list testimonials unmounted since '
        'a208b4c -> SABA-Q-TESTIMONIALS-UNMOUNTED (awaiting_user).')},
    {'id': 'D-29z1595', 'date': '2026-11-11', 'by': by, 'decision': ('Dispatch round 449 = STORE-2b-3a on 48e16b8 with B sketch b-round-448/sketch-449.patch.txt v3 '
        '(sha256 288ad78b..., tech-lead v2 APPROVE-WITH-CHANGES -> Medium 1 regex and Medium 2 importer guard fixed in v3 -> delta review in sketch-review.md). '
        'product-designer option A (emphasised word = heading light ink; brass rejected). Browser pre-check: 24 rows (8 words x 1440/1280/375) HEAD teal-gradient ink 34-80 % '
        '-> sketch #ECE6DA, 0 teal, contrast >= 13.6, boxes identical; LeadMagnet dialog text/tags/box equal; /studio-lab 0 px HEAD-vs-HEAD and HEAD-vs-sketch at 1440/1280. '
        'Mutants M1-M11 red as predicted (M6 green control). Sketch v3 full suite 282 files / 4124 tests green, typecheck rc 0, lint 205 = HEAD, build rc 0 (b-round-448/precheck-*.log). TLM-R449-WEBKIT-HEADING-INK; SABA-Q-LEADMAGNET-EYEBROW-TONE.')},
]
b['rounds'].append({'round': 449, 'task': 'current-task.md', 'decision': 'D-29z1595', 'type': 'STORE-2b-3a (gradient text leaves the Store; emphasised heading word = light ink)',
                    'status': 'dispatched', 'note': 'baseline 48e16b8 (gate 448 published); B sketch b-round-448/sketch-449.patch.txt (sha256 in sketch-review.md); claims b-round-448/claims-449.sh; grants b-round-448/grants-449.txt; covering b-round-448/covering-449.txt'})
b['current_task'] = 'Round 449: STORE-2b-3a (gradient text removed from the Store; 8 emphasised heading words in light ink) on 48e16b8 (current-task.md)'
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(DONE, 'w').write(by + '\n')
print('applied v', b['version'])
