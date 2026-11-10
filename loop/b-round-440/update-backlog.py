"""B round 440 -> 441 planning backlog update. Idempotent: refuses to run twice (update-backlog.done)."""
import json, os, sys
LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
DONE = f'{LOOP}/b-round-440/update-backlog.done'
if os.path.exists(DONE):
    sys.exit('already applied')
p = f'{LOOP}/backlog.json'
b = json.load(open(p, encoding='utf-8'))
by = '2026-11-10 B round 440 -> 441 planning'
b['version'] = b['version'] + 1
b['updated'] = '2026-11-10'
d = b['deferred_low_polish']
idx = {e.get('id'): e for e in d}
for fid in ['RETRO200-CLASS-SELECTORS', 'GATE146-S4-LRS3-CLASSNAME-PINS', 'C-R127-L1f-SELF-COMPARE-TESTS']:
    e = idx[fid]
    e['status'] = 'closed (D-29z1567): SYS-1 stage 1, C round 440 PASS (c-round-440.json, browserVerified true), gate 440 published 047a0fc | ' + e['status']
    e['closed_round'] = 440
for fid in ['GATE164-OV1-FRAGILE', 'GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR', 'GATE81-S2-UM8-SOURCE-TEXT']:
    e = idx[fid]
    e['status'] = 'in_progress (D-29z1568): SYS-1 stage 2, round 441; closes on C PASS | ' + e['status']
d.append({'id': 'GATE440-L3-DETAIL-LABEL-ALLOWLIST', 'severity': 'low', 'origin': 'B spec',
          'status': 'deferred_low_polish (D-29z1567)',
          'title': 'detail-panel-polish design (d) block finds labels through a text allowlist (DETAIL_INFO_LABEL_TEXTS); a new info-column label would be skipped silently',
          'evidence': 'gates/round-440/review.md Low 3', 'repro': 'add a span label to the Detail info column; detail-panel-polish design (d) stays green',
          'added': by, 'systemic_task': 'SYS-1', 'note': 'gate review: no fix needed; optional fix: assert the full span list of the info column'})
d.append({'id': 'A-R440-REVIEW-L4-L5-LRS3-NITS', 'severity': 'low', 'origin': 'B spec',
          'status': 'deferred_low_polish (D-29z1567)',
          'title': 'library-row-strings-ui LRS3: text-foreground checked outside the per-token loop (:241) and a redundant children[0] font-mono check (:268)',
          'evidence': 'a-round-440.md code-reviewer Lows 4/5', 'repro': 'read the lines', 'added': by, 'systemic_task': 'SYS-1'})
d.append({'id': 'A-R441-PLAN-UM8-GROUP-MUTE', 'severity': 'low', 'origin': 'B spec',
          'status': 'deferred_low_polish (D-29z1568): ruling S2-R3; mutant U1 red on UM8b covers the group rule',
          'title': 'UM8b exercises group Solo only; a group Mute on a group that contains the video lane is not rendered in the export dialog (HEAD file-wide ban on isTrackAudible( not ported)',
          'evidence': 'b-round-440/tech-lead-review-v2.md (d); b-round-440/sketch-review.md', 'repro': 'read UM8b', 'added': by, 'systemic_task': 'SYS-1'})
s = [x for x in b['systemic_tasks'] if x['id'] == 'SYS-1'][0]
s['status'] = ('in_progress (D-29z1568): stage 1 done (C round 440 PASS, gate 440 published 047a0fc); stage 2 dispatched round 441 '
               '(GATE164-OV1-FRAGILE, GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR, GATE81-S2-UM8-SOURCE-TEXT; sketch b-round-440/sketch-441.patch.txt sha 8b53e26d) | ' + s['status'])
for st in s['stages_d29z1565']:
    if st['id'] == 'SYS-1-stage-1':
        st['status'] = 'done (D-29z1567): C round 440 PASS, gate 440 published 047a0fc'
    if st['id'] == 'SYS-1-stage-2':
        st['status'] = 'dispatched (D-29z1568): round 441'
        st['round'] = 441
        st['grants'] = 'ArrangementOverview.tsx (data hooks only) + 5 tests (content-colour-ui, overview-visibility-ui, panel-radius-ui, studio-theme-obsidian, track-group-mix-ui) + doc 287'
s['sys1_other_classname_pins'] += (' | round 441 planning (D-29z1568): Overview source reads that stay (deliberate source contracts, ruling S2-R2): panel-radius-ui PANEL list (l.84-86 exact overlay/frame/root classes) and PNR4 source counts (l.498-501), content-colour-ui l.124/l.336 scans, studio-focus-ring, strings ST27; '
                                   'tech-lead (h): PNR4 child count does not prove each child is a bar; (e) data-overview-lane/bar prefix close to data-overview-clip-id. RETRO-450 question, no new ids')
b['decisions_log_b'] += [
    {'id': 'D-29z1567', 'date': '2026-11-10', 'by': by,
     'decision': 'Round 440 accepted: c-round-440.json PASS (C1-C10, browserVerified/realVerified true, 0 bugs; fake-bearer row BLOCKED backend unavailable in cloud) and gate 440 published 047a0fc (verify 273/4029). SYS-1 stage 1 done; RETRO200-CLASS-SELECTORS, GATE146-S4-LRS3-CLASSNAME-PINS, C-R127-L1f-SELF-COMPARE-TESTS closed. Gate-440 review Lows 1/2 need no fix (intended pins); Low 3 -> GATE440-L3-DETAIL-LABEL-ALLOWLIST and A reviewer nits 4/5 -> A-R440-REVIEW-L4-L5-LRS3-NITS (both deferred_low_polish, origin B spec). A Architecture note (stage-3 proposal for the other className pins) recorded as a backlog signal only (sys1_other_classname_pins, RETRO 450).'},
    {'id': 'D-29z1568', 'date': '2026-11-10', 'by': by,
     'decision': 'Dispatch round 441 = SYS-1 stage 2 on 047a0fc: data hooks only in ArrangementOverview.tsx (arrangement-overview-outline, arrangement-overview-lanes, data-overview-lane, data-overview-bar) and 5 tests. B pre-check: SSR of /studio-lab is empty, so OV1 cannot see the outline overlay -> ruling S2-R1 (overlay exact class list asserted rendered in PNR4; token order no longer pinned by OV1; mutant O2). Full suite on sketch v1 failed overview-visibility-ui OV-E1 (positional children[1] without testid) -> granted and rewritten (L23). Ruling S2-R2: other Overview source reads stay (RETRO 450). Ruling S2-R3: UM8 source asserts replaced by rendered UM8b (group solo Off / Included), group Mute not rendered -> A-R441-PLAN-UM8-GROUP-MUTE. tech-lead reviewed v2 (0 Medium+) and approved delta v3 sha 8b53e26d. Full suite on v3 273/4030 rc 0; 12 covering files 267 tests; 11 mutants x suites on head and sketch (b-round-440/mutants/results.jsonl); browser probe on a sketch dev server: hooks present, Overview pixels 0 px vs HEAD at 1440/1280.'},
    {'id': 'D-29z1569', 'date': '2026-11-10', 'by': by,
     'decision': 'Order after round 441 unchanged from D-29z1566: SYS-1 closes with stage 2; REGRESSION-2026-11-13 at the first planning on or after 2026-11-13; SYS-3; STORE-REDESIGN 2b..5; ARCH-SPLIT (frontend-architect checkpoint via root first); REVIEW-RECOMMENDATIONS; T12-ADVANCED; phase 2 under the skip rule. Next RETRO round 450. No new architecture checkpoint request (data attributes + tests, one owner file).'},
]
for r in b['rounds']:
    if r.get('round') == 440:
        r['status'] = 'done (D-29z1567): C PASS, gate 440 published 047a0fc'
b['rounds'].append({'round': 441, 'task': 'current-task.md', 'decision': 'D-29z1568', 'type': 'SYS-1 stage 2 (Overview data hooks + tests)', 'status': 'dispatched',
                    'note': 'baseline 047a0fc (gate 440 published); sketch b-round-440/sketch-441.patch.txt (sha 8b53e26d); claims b-round-440/claims-441.sh'})
b['current_task'] = 'Round 441: SYS-1 stage 2 (GATE164-OV1-FRAGILE, GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR, GATE81-S2-UM8-SOURCE-TEXT; Overview data hooks; sketch b-round-440/sketch-441.patch.txt sha 8b53e26d) on 047a0fc (current-task.md)'
b['advisor_used_by_B'] = 'round 440 -> 441 planning: advisor available and consulted after orientation (and before hand-off)'
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(DONE, 'w').write('applied\n')
print('ok v', b['version'])
