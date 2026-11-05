# B round 350 -> 351: feature-status.md update. Run from the loop root: python3 -I b-round-350/update-feature-status.py
import pathlib, shutil, sys

P = pathlib.Path('feature-status.md')
DONE = pathlib.Path('b-round-350/update-feature-status.done')
BK = pathlib.Path('b-round-350/feature-status-before-351.md')
if DONE.exists():
    sys.exit('already applied')
if not BK.exists():
    shutil.copyfile(P, BK)
s = P.read_text()
old_head = 'განახლდა: 2026-11-05 · ავტორი: B (round 349 → round 350 დაგეგმვა, D-29z1111…D-29z1117)'
assert s.count(old_head) == 1
s = s.replace(old_head, 'განახლდა: 2026-11-05 · ავტორი: B (round 350 → round 351 დაგეგმვა, D-29z1118…D-29z1122)')
lines = s.split('\n')
i = next(k for k, l in enumerate(lines) if l.startswith('  - **Round 350 = PERF-CAND-VIDEO-TRIM-FADE-COST ეტაპი 1 — მუშავდება'))
assert lines[i + 1].startswith('  შემდეგი: 350 video dock cost')
lines[i] = ('  - **Round 350 = PERF-CAND-VIDEO-TRIM-FADE-COST ეტაპი 1 — ბაგია (C FAIL, მხოლოდ B-ის spec-ის შეცდომა; D-29z1118).** '
            'კოდი C-მ ბრაუზერით დაადასტურა (`c-round-350.json`, `browserVerified` true): perf 252 row, 70/70 assert, ზუსტად 9 მოსალოდნელი DIFF — '
            'video trim 18.683 → 12.817, fade 8.85 → 2.95, move 15.75 → 9.883 კომპონენტი/move, `durationMs` 458650; names 1440-ზე trim 13, fade 3, move 11; '
            'BEHAVIOUR, RELEASE, PLAY-SYNC (|drift| ≤ 0.014 წმ) და G350-AUTH ორივე viewport-ზე PASS. ჩავარდა მხოლოდ C-R350-01 (Low, B spec): '
            'task-ში დასახელებული mutant M-B2 DP71-ს ვერ აწითლებს (hook shallow-dedup-ითაა). gate 350 გამოტოვებულია, ხე round 351-ისთვის რჩება.')
new = [
    ('  - **Round 351 = ეტაპი 1-ის fix-up — მუშავდება (D-29z1119…D-29z1122).** B-ის ruling (L10): DP71-ს იცავს M-B2′ (render) და A-M5 '
     '(`data-video-opacity`-ის mutation); B-მა scratch-ზე ყველა წყვილი გაუშვა (`b-round-350/mutant-*.log`). A-R350-REVIEW-SEEK-TEST (Medium, ტესტის ხარვეზი) '
     'იხურება DP72-ით — stopped video move-ის preview-ის დროს `<video>`-ის seek ახალ media time-ზე, Undo აბრუნებს; mutant M-B5 წითელი, HEAD-ის dock-ზეც მწვანე. '
     'dock-ის ფაილი ბაიტ-ბაიტ უცვლელია (sha256 `037f62fa…`), ამიტომ round 350-ის ბრაუზერის მტკიცებულება ძალაშია; C ამ რაუნდში უშვებს names smoke-ს, '
     'M-B2′-ის ბრაუზერის mutant-ს და G351-AUTH-ს. ახალი Low-ები (cached tracks, ტესტის nit-ები, 1280-ზე fade handle trim-ს ფარავს) → `deferred_low_polish`.'),
    ('  შემდეგი: 351 fix-up → RETRO 352 (ფანჯარა 336–351; ROOT-REQ-PERF-TIMEOUT Saba-სთვის, თუ ღიაა) → 22 row-ის assert + '
     'PERF-CAND-MASTER-GROUP-FADER-PROPS → PERF-CAND-FADE-RELEASE-COMMITS → PERF-9 … PERF-15 → SYS-R2-FAKE-FIDELITY → '
     'SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5; REGRESSION 2026-11-08-დან. PERF-DRAG-PREVIEW ჯერ არ არის მზადაა.'),
]
lines[i + 1] = new[0]
lines.insert(i + 2, new[1])
P.write_text('\n'.join(lines))
DONE.write_text('ok\n')
print('ok')
