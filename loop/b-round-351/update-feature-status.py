# B round 351 -> 352: feature-status.md update. Run from the loop root: python3 -I b-round-351/update-feature-status.py
import pathlib, shutil, sys

P = pathlib.Path('feature-status.md')
DONE = pathlib.Path('b-round-351/update-feature-status.done')
BK = pathlib.Path('b-round-351/feature-status-before-352.md')
if DONE.exists():
    sys.exit('already applied')
if not BK.exists():
    shutil.copyfile(P, BK)
s = P.read_text()
old_head = 'განახლდა: 2026-11-05 · ავტორი: B (round 350 → round 351 დაგეგმვა, D-29z1118…D-29z1122)'
assert s.count(old_head) == 1
s = s.replace(old_head, 'განახლდა: 2026-11-05 · ავტორი: B (round 351 → round 352 დაგეგმვა, D-29z1123…D-29z1126)')
lines = s.split('\n')
i = next(k for k, l in enumerate(lines) if l.startswith('  - **Round 351 = ეტაპი 1-ის fix-up — მუშავდება'))
assert lines[i + 1].startswith('  შემდეგი: 351 fix-up')
lines[i] = ('  - **Round 351 = ეტაპი 1-ის fix-up — ბაგია (A STOP, C FAIL „STOPPED — routed to B“; D-29z1123).** A-ს code-reviewer-მა იპოვა, '
            'რომ DP72-ს release-სა და Undo-ს შორის assert არ აქვს (C-R351-01, Medium, B spec). C-მ CLAIMS, SOURCE-SCOPE და G351-AUTH (ორივე viewport) გაიარა; '
            'mutant-ები და names smoke არ გაშვებულა, ამიტომ `browserVerified` false. dock უცვლელია (sha256 `037f62fa…`).')
new = [
    ('  - **Round 352 = ეტაპი 1-ის fix-up 2 — მუშავდება (D-29z1124…D-29z1126).** DP72 იღებს release-ისა და Undo-ს ნახევარს: release ახალ seek-ს არ წერს '
     'და committed start = preview start; Undo ახალ ჩანაწერს წერს. B-მა sketch scratch-ზე გაუშვა (74/74, tsc 0, biome სუფთა) და tech-lead-ით გადაახედა (0 Medium+). '
     'mutant-ები: M-B1 → DP72 წითელი release-ზე (round 351-ის DP72 მასზე მწვანე იყო), M-B5 → preview, M-B6 → committed start, M-B7 → Undo. '
     'C უშვებს names smoke-ს, M-B2′-ის ბრაუზერის mutant-ს და G352-AUTH-ს.'),
    ('  შემდეგი: 352 fix-up 2 → RETRO 353 (ფანჯარა 336–352; ROOT-REQ-PERF-TIMEOUT Saba-სთვის, თუ ღიაა) → 22 row-ის assert + '
     'PERF-CAND-MASTER-GROUP-FADER-PROPS → PERF-CAND-FADE-RELEASE-COMMITS → PERF-9 … PERF-15 → SYS-R2-FAKE-FIDELITY → '
     'SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5; REGRESSION 2026-11-08-დან. PERF-DRAG-PREVIEW ჯერ არ არის მზადაა.'),
]
lines[i + 1] = new[0]
lines.insert(i + 2, new[1])
P.write_text('\n'.join(lines))
DONE.write_text('ok\n')
print('ok')
