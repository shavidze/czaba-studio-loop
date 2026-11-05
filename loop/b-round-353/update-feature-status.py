# B round 353 -> 354: feature-status.md update. Run once from the loop root.
import pathlib, sys
P = pathlib.Path('feature-status.md')
DONE = pathlib.Path('b-round-353/update-feature-status.done')
if DONE.exists():
    sys.exit('already applied')
s = P.read_text()
old_head = 'განახლდა: 2026-11-05 · ავტორი: B (round 352 → round 353 დაგეგმვა, D-29z1127…D-29z1134)'
assert s.count(old_head) == 1
s = s.replace(old_head, 'განახლდა: 2026-11-05 · ავტორი: B (round 353 → round 354 დაგეგმვა, D-29z1135…D-29z1139)')
lines = s.split('\n')
i = next(k for k, l in enumerate(lines) if l.startswith('  შემდეგი: **round 353 = RETRO 353**'))
lines[i] = ('  - **Round 353 = RETRO 353 — მზადაა (D-29z1135).** C round 353 PASS, `browserVerified`/`realVerified` true, 0 app bug; C-R353-01/02 (Low, B-ის ტექსტზე) გასწორდა (D-29z1136). gate 353 გამოტოვდა (კოდი არ შეცვლილა); baseline რჩება `a55543b`.\n'
            '  - **Round 354 = PERF-CAND-VIDEO-TRIM-FADE-COST ეტაპი 2 — მუშავდება (D-29z1138/D-29z1139).** 12 video trim/fade row record → assert (C round 350-ის ceil); 10 row record რჩება row-ის kind-ისა და ფაილის წესების გამო (wallclock, release-restarts, video fade release-commits → PERF-CAND-FADE-RELEASE-COMMITS). B-ის sketch: 82/82 assert, 0 NEW. doc 232 l.4 → `C round 354 PASS` ფორმა.\n'
            '  შემდეგი: round 354 → REGRESSION 2026-11-08-დან (ორ ნაწილად) → SYS-R353-DP-TEST-POLISH → PERF-CAND-MASTER-GROUP-FADER-PROPS (საჭიროა ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE; თუ პასუხი არ არის — ჯერ PERF-CAND-FADE-RELEASE-COMMITS ან PERF-9) → PERF-9 … PERF-15 '
            '→ SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5. PERF-DRAG-PREVIEW ჯერ არ არის მზადაა (move-ის გადაკვეთა).')
j = next(k for k, l in enumerate(lines) if l.startswith('| RETRO 353 | **მოწმდება**'))
lines[j] = lines[j].replace('| RETRO 353 | **მოწმდება** (D-29z1130…D-29z1134)', '| RETRO 353 | **მზადაა** (C round 353 PASS, `c-round-353.json`, D-29z1135; D-29z1130…D-29z1134)', 1)
P.write_text('\n'.join(lines))
DONE.write_text('ok\n')
print('ok')
