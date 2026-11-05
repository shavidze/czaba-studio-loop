# B round 349 -> 350: feature-status.md update. Run from the loop root: python3 -I b-round-349/update-feature-status.py "<perf ka>"
import pathlib, sys

P = pathlib.Path('feature-status.md')
DONE = pathlib.Path('b-round-349/update-feature-status.done')
if DONE.exists():
    sys.exit('already applied')
PERF = sys.argv[1]
s = P.read_text()
old_head = 'განახლდა: 2026-11-05 · ავტორი: B (round 348 → round 349 დაგეგმვა, D-29z1106…D-29z1110)'
assert s.count(old_head) == 1
s = s.replace(old_head, 'განახლდა: 2026-11-05 · ავტორი: B (round 349 → round 350 დაგეგმვა, D-29z1111…D-29z1117)')
lines = s.split('\n')
i = next(k for k, l in enumerate(lines) if l.startswith('  - **Round 349 = PERF-CAND-VIDEO-TRIM-FADE-ROWS — მუშავდება'))
assert lines[i + 1].startswith('  შემდეგი: 349 video trim/fade rows')
lines[i] = ('  - **Round 349 = PERF-CAND-VIDEO-TRIM-FADE-ROWS — PASS, ეტაპი დასრულდა (D-29z1111):** C-ის 10 row PASS, '
            '`browserVerified`/`realVerified` true (`c-round-349.json`), ბაგი 0; gate 349 გამოქვეყნდა `7f56989` ორივე remote-ზე. '
            'perf 252 row, 70/70 assert, 22 NEW, 0 DIFF C348-თან, `durationMs` 491771; GRAB-PROBE 3/3, C-ის harness mutant წითელი, '
            'G349-AUTH და VIDEO-SMOKE ორივე viewport-ზე PASS (შესყიდვის დაცვა უცვლელია, `/studio-lab` ანონიმურად იხსნება). '
            'video trim 18.683 კომპონენტი/move, fade 8.85 — PERF-CAND-VIDEO-TRIM-FADE-COST. gate-ის Low-ები → deferred/closed (D-29z1112).')
new = [
    ('  - **Round 350 = PERF-CAND-VIDEO-TRIM-FADE-COST ეტაპი 1 — მუშავდება (D-29z1113…D-29z1116).** video dock (`ArrangementVideoDock`) '
     'ყოველ drag move-ზე აღარ იხატება: preview store-ის subscription dock-ის body-დან reader-ში გადადის (caption/gap — '
     '`useSyncExternalStore` string snapshot-ით, fade overlay — imperative writer, stopped seek — subscription). B-ის names probe: '
     'trim 19 → 13, fade 9 → 3, move 17 → 11 კომპონენტი/move; behaviour probe (frame, gap caption, fade opacity, Undo) HEAD-ის ტოლია; '
     'covering 107 ფაილი 1768/1768. ორივე კონსულტაციის (tech-lead, performance-optimizer) High — release-ის რიგი — გასწორდა: reader '
     '`getArrangement()`-ს კითხულობს (release probe: HEAD და sketch 0 ჩაწერა, პირველი sketch — mutant M-B1 — 1.000-ს წერს). ' + PERF +
     ' row-ები ამ რაუნდში `record` რჩება (L58), assert შემდეგ PERF-CAND-ში. ეკრანზე და ხმაში არაფერი იცვლება. '
     'store-ის მიმართულება (A Obsidian & Brass) დამტკიცდა `aca59b3`-ში — STORE-2b…5 რიგში თავის ადგილზე რჩება (D-29z1117).'),
    ('  შემდეგი: 350 video dock cost → RETRO 351 (ფანჯარა 336–350; ROOT-REQ-PERF-TIMEOUT Saba-სთვის, თუ ღიაა) → 22 row-ის assert + '
     'PERF-CAND-MASTER-GROUP-FADER-PROPS → PERF-CAND-FADE-RELEASE-COMMITS → PERF-9 … PERF-15 → SYS-R2-FAKE-FIDELITY → '
     'SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5; REGRESSION 2026-11-08-დან. PERF-DRAG-PREVIEW ჯერ არ არის მზადაა.'),
]
lines[i + 2:i + 2] = new
P.write_text('\n'.join(lines))
DONE.write_text('ok\n')
print('ok')
