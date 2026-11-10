# B round 425 -> 426 backlog update (v401 -> v402). Run once from the loop root: python3 -I b-round-425/update-backlog.py
import json, os, sys
DONE = 'b-round-425/update-backlog.done'
if os.path.exists(DONE):
    sys.exit('already applied (' + DONE + ')')
p = 'backlog.json'
b = json.load(open(p, encoding='utf-8'))
if b.get('version') != 401:
    sys.exit(f"expected version 401, found {b.get('version')}")
BY = '2026-11-10 B round 425 -> 426 planning'
b['version'] = 402
b['updated'] = '2026-11-10 (B round 425 -> 426 planning: round 425 C PASS; REGRESSION-2026-11-10 closed, regression-last 2026-11-10/425; round 426 = SYS-2 stage 2a on f6c76f4)'
b['current_task'] = 'Round 426: SYS-2 stage 2a - a held Enter acts once on the lane, group, master and tempo-row buttons; shared preventRepeatedEnterKeyDown module; SoftDisabledButtonProps cannot carry onKeyDown (current-task.md; sketch b-round-425/sketch-426.patch.txt)'
b['advisor_used_by_B'] = 'round 425 -> 426 planning: advisor available and consulted after orientation and before close'
b['decisions_log_b'].extend([
    {'id': 'D-29z1487', 'date': '2026-11-10', 'by': BY,
     'decision': 'Round 425 accepted from C evidence only: C PASS (c-round-425.json: 0 failed, 0 inconclusive, 0 notRun, browserVerified/realVerified true, L57 OK in b-round-425/l57-check-c425.txt). B spot-checked two evidence files: c-round-425/out/g390-auth.json (pass true; /studio-lab anonymous workspace + badge, auth_user null; /studio/middle-east Sign in required, 0 audio[src]; token API 401 no header / 400 bare / 403 fake bearer from the mock) and c-round-425/out/rvm-1440.json (load 0 empty body, loads 1-3 Sign in required). The fake-bearer row is BLOCKED (backend unavailable in cloud) and stays open backend evidence. Gate 425 skipped (no real changes), so the baseline stays f6c76f4 (gate 424 published). REGRESSION-2026-11-10 closes (parts 1 and 2 done); regression-last.json = {date 2026-11-10, round 425}; the next regression is due at the first planning on or after 2026-11-13.'},
    {'id': 'D-29z1488', 'date': '2026-11-10', 'by': BY,
     'decision': 'C-R425-01 (empty /studio/middle-east on one cold dev load) ruled Low, origin environment-suspected, deferred_low_polish. Evidence: 1 of 12 C dev loads (round 390 had 1 of 6, inside a long chain, not a first load), 0 of 8 production loads, and 0 of 4 fresh-context dev loads by B on this job (b-round-425/probe/rvm-cold-1440.json, one deps hash 14574dd5, no 504). Its signature (Invalid hook call + null useState + hydration fallback) is the two-React-copies pattern of a Vite dev dependency re-optimisation; that cause is an inference, not confirmed (no server log captured), and is recorded as a hypothesis. Task 425 section 3 wrote "an empty auth-guard page is Medium": B reads that as a reproducible failure in a user-reachable (production) build; the production build is clean and nothing is exposed (0 audio[src], auth_user null on every load). Next regression row R-RVM: production build authoritative (8 loads per viewport) plus 4 cold dev loads that record the ?v= deps hashes and the Vite log; a production reproduction is Medium.'},
    {'id': 'D-29z1489', 'date': '2026-11-10', 'by': BY,
     'decision': 'Round 426 = SYS-2 stage 2a (task 425 section 10 row 1: no Medium+, STEM-LANES unanswered: AGREE-STEM-LANES.md has no answer and no STEM-LANES-transcripts.md). Scope by owner (D-29z1478 sizing): ArrangementLane (Mute, Solo, fold, active-track name, video import full and compact, Pan reset), ArrangementGroupHeader (fold, name button, name input repeat, Mute, Solo), ArrangementMaster (Mute, peak reset), ArrangementTempoRow (metronome). Rulings: one shared module studio-repeat-safe.ts with preventRepeatedEnterKeyDown(event): boolean (decides SIG-R422-REPEAT-SAFE-BUTTON-PROPS: one helper, not a props spread); the Transport private copy and the Export inline copy fold onto it; SoftDisabledButtonProps gains onKeyDown?: never plus runtime HM15 asserts (closes A-R422-REVIEW-L1); Pan reset is guarded too (TL-R425-02: a refused reset keeps focus); the group name input ignores a repeated Enter/Escape (defensive, TL-R425-04). Fit stays unguarded (TH5). The marker flag inline guard and every other inline copy fold in stage 2b with a grep row (TL-R425-06). B pre-check: the round-421 scanner counted a Space-only fold guard as an Enter guard (group fold); the Enter-specific scanner b-round-425/button-guard-scan-enter.py replaces it (INFO-B425-SCANNER-SPACE-AS-ENTER); stage 2b sizing is re-counted from b-round-425/data/scan-all-head.txt (62 buttons: 23 ENTER-GUARD, 7 KEYDOWN-NO-ENTER, 32 NONE at f6c76f4). Reference: no Ableton behaviour (Chromium auto-repeat activation), conformance does not apply. Sketch reviewed by tech-lead (approve-with-lows, b-round-425/sketch-review.md).'},
    {'id': 'D-29z1490', 'date': '2026-11-10', 'by': BY,
     'decision': 'C round 425 lookups ruled: (a) EVICT stop-count re-pinned to 0 stop() calls on the evicted preview (round 393 streaming preview through a media element, no AudioBufferSource); HEAP-RETAINERS-PROD live counts [2,5,16,16,16,16,16] verified on f6c76f4 and kept. (b) R340-CROSS-LANE rendered-fiber counts 44/67 vs 40/63: attributed to round 424, which put an inner subscriber component under each lane shell (c-round-424.md row 4: shell 0, Memo(lane) 0, inner 59 per fade). Hypothesis: +1 fiber per mounted lane, not extra work; recorded as INFO-C425-CROSS-LANE-FIBERS; the next regression re-pins 44/67 and checks the per-lane count; not scheduled. (c) R389-PLAY-STORE Follow scrollLeft +5 px (1280) / +2 px (1440), constant per viewport, not attributed to a named round: Low finding C-R425-02-FOLLOW-SCROLL-OFFSET, deferred_low_polish, re-pinned at the next regression with an attribution step. (d) INFO-C425-DEV-REOPT: harness fact, the next regression starts with one warm-up MP3 export on the dev server. (e) WAVEFORM third-decimal path diffs attributed to precomputed peaks (PERF-15; 0 diffs with /peaks 404), refusal copy to C-R391-01, r300 empty starts to round 393; record only.'},
])
ok = 0
for r in b['rounds']:
    if r.get('round') == 425 and r.get('status') == 'dispatched':
        r['status'] = 'c_pass (D-29z1487): C PASS c-round-425.json, browserVerified true; 1 Low (C-R425-01) deferred; gate 425 skipped (no real changes)'; ok += 1
if ok != 1:
    sys.exit('round 425 entry not found')
b['rounds'].append({'round': 426, 'task': 'current-task.md', 'decision': 'D-29z1489', 'type': 'SYS-2 stage 2a (lane, group, master, tempo-row held Enter)', 'status': 'dispatched',
                    'note': 'baseline f6c76f4 clean; sketch b-round-425/sketch-426.patch.txt; claims b-round-425/claims-426.sh'})
n = 0
for rr in b['regression_rounds']:
    if rr.get('id') == 'REGRESSION-2026-11-10':
        rr['status'] = 'done (D-29z1487): part 1 rounds 423-424 PASS, part 2 round 425 PASS (browserVerified true, 1 Low); regression-last.json = 2026-11-10 / 425; next due on or after 2026-11-13 | ' + rr['status']
        rr['carry_to_next_regression_d29z1490'] = [
            'R-RVM (D-29z1488): /studio/middle-east on the production build, 8 fresh-context loads per viewport (authoritative), plus 4 cold dev loads recording ?v= deps hashes and the Vite log',
            'R-CROSS-LANE-FIBERS (D-29z1490 b): re-pin rendered 44/67 and record the mounted-lane count',
            'R-FOLLOW-OFFSET (D-29z1490 c): re-pin Follow scrollLeft and try to attribute C-R425-02',
            'R-DEV-WARMUP (D-29z1490 d): start with one warm-up MP3 export on the dev server',
            'R-EVICT-PIN (D-29z1490 a): EVICT expects 0 stop() calls; HEAP [2,5,16,16,16,16,16]',
            'Base copies: c-round-425/{tools,t258,t301,t301x,wk,t389} (delete stale result files before running)']
        n += 1
if n != 1:
    sys.exit('REGRESSION-2026-11-10 not found')
b['regression_rounds'].append({'id': 'REGRESSION-2026-11-13', 'decision': 'D-29z1487', 'status': 'planned: due at the first planning on or after 2026-11-13',
    'scope': 'C re-verifies in the browser the key acceptance of every item done since REGRESSION-2026-11-10 (round 426 onward) plus one short check per earlier done item, both viewports; npm run test:e2e:smoke; carries carry_to_next_regression_d29z1490 of REGRESSION-2026-11-10; A fixes only what C finds',
    'added': BY})
seen = set()
for coll in ('systemic_tasks',):
    for s in b[coll]:
        if s.get('id') == 'SYS-2':
            s['status'] = 'in_progress (D-29z1489): stage 2a dispatched as round 426 (lane/group/master/tempo row + shared helper + soft-disabled type guard); stage 2b next (library, video dock, detail panel, grid menu, marker menu and editor Escape, export dialog, shortcut sheet, narrow screen, footer; fold every inline Enter-repeat copy onto preventRepeatedEnterKeyDown with a grep row, TL-R425-06) | ' + s['status']
            seen.add('SYS-2')
for s in b['architecture_signals']:
    if s.get('id') == 'SIG-R422-REPEAT-SAFE-BUTTON-PROPS':
        s['status'] = 'decided in round 426 sketch (D-29z1489): one module-level helper studio-repeat-safe.ts preventRepeatedEnterKeyDown(event): boolean, composable inside existing handlers; no props spread | ' + s['status']
        seen.add(s['id'])
for f in b['deferred_low_polish']:
    if f.get('id') == 'A-R422-REVIEW-L1-ONKEYDOWN-SPREAD-ORDER':
        f['status'] = 'in_progress (D-29z1489): round 426 adds onKeyDown?: never to SoftDisabledButtonProps + HM15 runtime/type asserts (mutant MU-SPREAD-TYPE) | ' + f['status']; seen.add(f['id'])
    if f.get('id') == 'A-R107-SWEEP-HELD-ENTER-TOOLBAR':
        f['status'] = 'in_progress (D-29z1489): lane/group/master/tempo part in round 426 (HM1-HM15); rest in SYS-2 stage 2b | ' + f['status']; seen.add(f['id'])
if seen != {'SYS-2', 'SIG-R422-REPEAT-SAFE-BUTTON-PROPS', 'A-R422-REVIEW-L1-ONKEYDOWN-SPREAD-ORDER', 'A-R107-SWEEP-HELD-ENTER-TOOLBAR'}:
    sys.exit('ids not found: ' + str(seen))
for lid, sev, origin, title, ev, repro in [
    ('C-R425-01-RVM-COLD-DEV-EMPTY', 'low', 'environment (suspected)', 'one cold dev-server load of /studio/middle-east rendered an empty body (Invalid hook call, null useState, hydration fallback); production 8/8 clean; B 4/4 dev clean', 'c-round-425/out/rvm-1440.json load 0; c-round-425/out/rvm-prod-*.json; b-round-425/probe/rvm-cold-1440.json; D-29z1488', 'fresh browser context, first load of /studio/middle-east on a freshly started dev server (c-round-390/tools/mepage.cjs)'),
    ('C-R425-02-FOLLOW-SCROLL-OFFSET', 'low', 'C regression row (unattributed)', 'after Follow, the timeline scrollLeft is 5 px (1280) / 2 px (1440) larger than the round-389 oracle, constant per viewport; behaviour otherwise equal', 'c-round-425.md Lookups (R389-PLAY-STORE follow probe); c-round-425/t389/out/follow-*', 'c-round-389/tools/follow-probe.mjs at both viewports vs c-round-389 oracle'),
    ('INFO-B425-SCANNER-SPACE-AS-ENTER', 'info', 'B pre-check', 'b-round-421/button-guard-scan.py labelled any onKeyDown mentioning repeat as GUARD; the group fold guards only a repeated Space, so it was counted as an Enter guard; replaced by b-round-425/button-guard-scan-enter.py', 'b-round-425/data/scan-2a-head.txt (group fold KEYDOWN-NO-ENTER)', 'run both scanners on ArrangementGroupHeader.tsx at f6c76f4')]:
    b['deferred_low_polish'].append({'id': lid, 'severity': sev, 'origin': origin, 'status': 'deferred_low_polish (D-29z1488/D-29z1490)', 'title': title,
        'evidence': ev, 'repro': repro, 'added': BY})
b['open_findings'].append({'id': 'INFO-C425-CROSS-LANE-FIBERS', 'severity': 'info', 'origin': 'C regression lookup', 'status': 'open (D-29z1490): record only; re-pin at REGRESSION-2026-11-13',
    'title': 'R340-CROSS-LANE dev-fiber rendered counts 44/67 vs 40/63 after round 424 (inner lane subscriber component)', 'evidence': 'c-round-425.md Lookups; c-round-424.md row 4', 'added': BY})
open(p, 'w', encoding='utf-8').write(json.dumps(b, ensure_ascii=True, indent=2))
open(DONE, 'w').write('applied v402\n')
print('ok v402')
