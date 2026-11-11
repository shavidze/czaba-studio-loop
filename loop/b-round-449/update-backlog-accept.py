"""B round 449 -> 450 planning, part 1: accept round 449. Idempotent (update-backlog-accept.done)."""
import json, os, sys
LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
B = f'{LOOP}/b-round-449'
DONE = f'{B}/update-backlog-accept.done'
if os.path.exists(DONE):
    sys.exit('already applied')
p = f'{LOOP}/backlog.json'
b = json.load(open(p, encoding='utf-8'))
by = '2026-11-11 B round 449 -> 450 planning'
b['version'] += 1
b['updated'] = '2026-11-11'
of = b['open_findings']
ofi = {e.get('id'): e for e in of}
dl = b['deferred_low_polish']
dli = {e.get('id'): e for e in dl}
C449 = ('C round 449 PASS (c-round-449.json, browserVerified/realVerified true, C1-C7 + C9-C13 PASS, C8 WebKit BLOCKED no WebKit on the cloud runner, 0 bugs, '
        'l57-check OK b-round-449/l57-check-c449.txt), gate 449 published a8599a2 (review COMMIT OK, score 9/10, verify green)')

q = next(e for e in b['post_current_stage_queue'] if e['id'] == 'STORE-REDESIGN')
st2 = next(s for s in q['stages'] if s['id'] == 'STORE-2')
sp = st2['split_2b_d29z1583']
sp['STORE-2b-3a'] = f'done (D-29z1597): {C449} | ' + sp.get('STORE-2b-3a', '')
sp['STORE-2b-3b'] = ('not_started; next feature stage after RETRO 450 (or after REGRESSION-2026-11-13 if planned on/after 2026-11-13). Adds row GT1b (TSX gradient-text scan: '
                     'Tailwind bg-clip-text/text-transparent, [background-clip:text], inline WebkitBackgroundClip/WebkitTextFillColor; dead CinemaCurtainLoader allow-listed) '
                     'closing A-R449-REVIEW-GT1-TSX; B first identifies what paints at /studio-lab 1440 y309-311 (INFO-C449-C9-HEAD-CONTROL-FLAKE) before writing Studio pixel rows | '
                     + sp.get('STORE-2b-3b', ''))
st2['status'] = 'in_progress (D-29z1597): 2b-3a done (449, a8599a2); 2b-3b..d, 2b-4, 2c, 2d not_started | ' + st2['status']
q['status'] = 'in_progress (D-29z1597): STORE-2b-3a done (449, a8599a2); round 450 = RETRO 450; next stage STORE-2b-3b | ' + q['status']

r449 = next(r for r in b['rounds'] if r.get('round') == 449)
r449['status'] = 'c_pass_published'
r449['result'] = C449 + ' (D-29z1597)'

of.append({'id': 'A-R449-REVIEW-GT1-TSX', 'severity': 'medium', 'origin': 'B spec (round 449 sketch GT1 scans CSS only; found by A code-reviewer)',
           'title': ('store-gradient-text GT1 scans CSS only; gradient text re-introduced in TSX (Tailwind bg-clip-text + text-transparent, [background-clip:text], '
                     'inline WebkitBackgroundClip/WebkitTextFillColor) would pass every test'),
           'status': ('scheduled (D-29z1597): row GT1b of STORE-2b-3b (the stage that next owns store-gradient-text / store-teal-sweep). B grep at a8599a2: the only TSX hit is '
                      'app/components/loading/CinemaCurtainLoader.tsx:208-210 (inline style), whose only references are the two barrels (components/loading/index.ts:3, '
                      'components/common/index.ts:3) - dead, so no live regression; it is allow-listed in GT1b and removed with LEGACY-DEAD-STORE-COMPONENTS'),
           'evidence': 'a-round-449.md code-reviewer Medium; c-round-449.json notes; b-round-449/checkpoint.md (grep)', 'added': by})
l3 = dli['TL-R449-L3-SCAN-ROOTS']
l3['title'] += ' [correction D-29z1597: TSX is NOT 0 hits - the dead CinemaCurtainLoader.tsx:208-210 inline style clips text; the TSX half moves to A-R449-REVIEW-GT1-TSX / GT1b in 2b-3b; this Low keeps the frozen studio.css half]'
l3.setdefault('confirmedBy', []).append('A round 449 code-reviewer Low (studio.css outside GT1 scope)')
dli['TL-R449-L4-PARSER-QUOTES'].setdefault('confirmedBy', []).append('A round 449 code-reviewer Low (parser ignores CSS strings)')
ofi['TLM-R449-WEBKIT-HEADING-INK'].setdefault('confirmedBy', []).append('gate 449 review suggestion 1 (Safari/WebKit not verified); C round 449 C8 BLOCKED')
ofi['SABA-Q-LEADMAGNET-EYEBROW-TONE'].setdefault('confirmedBy', []).append('gate 449 review info 4')
lg = ofi['LEGACY-DEAD-STORE-COMPONENTS']
lg.setdefault('confirmedBy', []).append('gate 449 review Low 3 (ArtistBioSection:27, TestimonialsSection:97, VideoShowcase:72 keep an orphan text-glow class; delete with the components)')
lg.setdefault('signals', []).append('gate 449 Architecture proposal (D-29z1597): one bounded cleanup task deleting ArtistBioSection, TestimonialsSection (needs SABA-Q-TESTIMONIALS-UNMOUNTED), '
                                    'VideoShowcase, PianoLoadingAnimation, CinemaCurtainLoader and .loading-brand, removing their allow-list entries in store-teal-sweep and '
                                    'store-gradient-text; candidate home STORE-2b-3d. Signal only, not scheduled by this note')
for lid, title, fix in [
    ('A-R449-REVIEW-L-FILL-REGEX', 'store-gradient-text fill regex misses transparent spelled rgb(0 0 0 / 0) or rgba(0,0,0,0)', 'match any zero-alpha colour'),
    ('A-R449-REVIEW-L-TEST-HYGIENE', ('store-gradient-text: allow-list key is selector text without the file; `in ALLOW_LIST` instead of Object.hasOwn; two identical allow-list types; '
                                     'NM2 local var still named glow; store-header-footer.test.tsx:124 asserts absence of .text-glow, now trivially true'),
     'one hygiene pass when the file is next owned (2b-3b GT1b)'),
    ('GATE449-S2-BARE-SPANS', 'seven touched files keep className-less <span> wrappers around the emphasised words (kept on purpose for DOM/box parity and NM2)',
     'if emphasis becomes semantic, use <em> or a token class in the same change as NM2'),
]:
    dl.append({'id': lid, 'severity': 'low', 'origin': 'B spec (round 449 sketch; found by ' + ('gate reviewer' if lid.startswith('GATE') else 'A code-reviewer') + ')',
               'status': 'deferred_low_polish (D-29z1597)', 'title': title,
               'evidence': 'gates/round-449/review.md' if lid.startswith('GATE') else 'a-round-449.md code-reviewer Lows',
               'repro': 'store a8599a2', 'fix': fix, 'added': by})
of.append({'id': 'INFO-C449-C9-HEAD-CONTROL-FLAKE', 'severity': 'info', 'origin': 'environment',
           'title': ('C round 449 C9: /studio-lab HEAD-vs-HEAD pixel control differed by 8 px at 1440 (y309-311) in runs 1 and 2, 0 px in run 3; tree-vs-HEAD 0 px in all runs. '
                     'Same class as the round-448 planning run-1 anomaly'),
           'status': 'logged (D-29z1597): does not affect the 449 PASS; before 2b-3b Studio pixel rows B identifies what paints there (caret/insert-marker blink or status text) and masks or waits for it',
           'evidence': 'c-round-449/c9*.json', 'added': by})
of.append({'id': 'ROOT-REQ-ENV-MOCK-API-HEALTH', 'severity': 'info', 'origin': 'environment',
           'title': ('env-status.json checks only the store (:5173); in round 449 the mock API (:5199) was down for both A and C, each started node mock-api/server.mjs by hand. '
                     'Request: add a :5199 /api/products health field to env-status.json and keep the mock API up for the whole round'),
           'status': 'open_root (D-29z1597): non-blocking; tasks keep the "start it if down" precondition', 'evidence': 'a-round-449.md step 6; c-round-449.md header; env-status.json', 'added': by})
b['decisions_log_b'].append({'id': 'D-29z1597', 'date': '2026-11-11', 'by': by, 'decision': (
    f'Round 449 accepted: {C449}; STORE-2b-3a done. A-R449-REVIEW-GT1-TSX kept Medium and scheduled as row GT1b of 2b-3b (B grep: only hit is the dead CinemaCurtainLoader, '
    'so no live regression); TL-R449-L3 text corrected (TSX was not 0 hits). A Lows: parser strings -> confirmedBy TL-R449-L4, studio.css -> confirmedBy TL-R449-L3, '
    'A-R449-REVIEW-L-FILL-REGEX and A-R449-REVIEW-L-TEST-HYGIENE deferred. Gate 449: Low 1 -> confirmedBy TLM-R449-WEBKIT-HEADING-INK; Low 2 -> GATE449-S2-BARE-SPANS deferred; '
    'Low 3 + Architecture proposal -> LEGACY-DEAD-STORE-COMPONENTS (confirmedBy + signal); info 4 -> confirmedBy SABA-Q-LEADMAGNET-EYEBROW-TONE; info 5 (star-brand-audit) stays with STORE-5. '
    'INFO-C449-C9-HEAD-CONTROL-FLAKE and ROOT-REQ-ENV-MOCK-API-HEALTH logged.')})
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(DONE, 'w').write(by + '\n')
print('ok v', b['version'])
