# C round 302: NAME-AND-HINT-a ("CZABA Studio", Saba Q4) — verdict PASS

browserVerified = realVerified = **true**. Real Playwright Chromium on `http://127.0.0.1:5173`, fresh contexts with no credentials; mock API `mock-api/server.mjs` on :5199 started by C (PID 5448, `c-round-302/mock.pid`). HEAD `aa7a6ef`, A's 12-path working tree. Source untouched by C (`scope-start.txt` == `scope-end.txt`).

## Results

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS: `git status` = exactly the 12 §5 paths; `sha256sum -c` fails only on the 10 modified; all 11 code/test grants `cmp`-equal to `b-round-301/sketch-*`; protected diff rc 0 | `c-round-302/scope-start.txt` |
| CLAIMS | PASS: vs `claims-302-output.txt` differs only in K2 (12), K4 (10 failures), K5/K6/K8/K9 (after-change), K17 (221), K18 (+221); vs `claims-302-after-sketch.txt` K5–K10 identical; K20 all `ok` | `claims-c.txt`, `claims-vs-*.diff` |
| DOC | PASS: `221-name-and-hint.md` l.4 exact; the 7 TEMPLATE headings in order; NM1/NM2/PW1/PW6/PC9 cited and exist in tests | — |
| Unit covering set (C re-run, alone) | PASS: 24 files, 361 tests (19.2 s) | `logs/covering.log` |
| Red proof (log-verified, not re-run) | PASS: `a-round-302/mutant-m0-baseline.log` 91/91 green; m1 red = NM1, NM2; m2 = NM1; m3 = NM2; m4 = NM1, ST31, PW1, PW6; nothing else red in any log; matches §6.4 | `a-round-302/mutant-*.log` |
| N-TITLE-H1 (1440, 1280) | PASS: title `CZABA Studio — Demo collection`; h1 text `CZABA Studio`, 0 children, CDP AX name `CZABA Studio` (role heading); h1 height 20 = line-height 20; h1, exit link and badge tops 7 / 7 / 6 px (within ±1 px) and centres all at y=17, 0 overlaps; badge unchanged | `main.json` vp.*.h1, `shots/j3-studio-*.png` |
| N-RETIRED-TEXT (7 states × 2 viewports) | PASS: 0 matches in innerText, the full CDP AX tree and `document.title` for studio empty, clip added, `?` sheet open, Export dialog open, `/` showcase, `/checkout/success`, `/products/middle-east` (mock); also the 390 narrow screen | `main.json` vp.*.retired |
| N-HOME | PASS: h2 `CZABA Studio`, glow `Studio`, mockup title `CZABA Studio` present; 1 line at 1440/1280/390 and at 1440 reduced motion (opacity 1); no overflow (scrollWidth 1216 = clientWidth); 0 page errors | `shots/j1-home-*.png`, `home-390.png`, `home-reduced-1440.png` |
| N-CHECKOUT | PASS (2 s wait): `Access CZABA Studio anytime`, other two steps unchanged, no overflow, 0 errors | `shots/checkout-*.png` |
| N-NAV | PASS: desktop link `Studio` → `/studio-lab` (1440, 1280); mobile menu at 390 shows `Studio` | `shots/j2-nav-*.png`, `nav-mobile-390.png` |
| N-NARROW (390×844) | PASS: narrow screen shown, no workspace, new title, 0 errors | `shots/narrow-390.png` |
| N-EXPORT-NAME | PASS: download `czaba-studio-lab.wav` (both viewports) | `main.json` vp.*.export |
| N-JOURNEY (1440, 1280) | PASS: `/` showcase → nav Studio → title/h1 → Enter adds 1 clip → Space plays 1.3 s (clock 00:00.000 → 00:01.271, state Playing, playhead +50.8 px) → Stop (Stopped) → Export WAV → `← CZABA` back to `/`. WAV: RIFF/WAVE PCM 24-bit, 48 kHz, stereo, 768000 frames = 16.000 s (= project end), data chunk length consistent, 0 NaN, peak 0.297, RMS −24.9 dBFS, 99.97 % non-zero samples. Names seen: "Studio" (nav) and "CZABA Studio" only | `shots/j1…j6-*.png` |
| N-SCREEN-BUDGET | PASS: round-300 method gives 95 / 78 text-node lines vs baseline 96 / 79. The only diff is `8|CZABA Studio Lab` + `8|· Workspace` → `8|CZABA Studio` (same row). Distinct visual rows 56 / 49, equal to round 300. No increase. With a demo clip: 113 / 95 lines (59 / 51 rows), recorded; no HEAD baseline for that state, and the diff only changes the h1 text | `budget.json`, `budget-clip.json`, `shots/budget*-*.png` |
| RV-EN | PASS: 0 Georgian characters in visible text or AX names on `/studio-lab` (all studio states, both viewports) | `main.json` |
| G302-AUTH | PASS: anonymous `/studio-lab` shows workspace and demo badge, `auth_user` null; `/studio/middle-east` "Sign in required", 0 `audio[src]`; `/api/studio-token?product=middle-east&file=mix.wav` no header → 401, fake Bearer → 403, no token in any body | `auth/g302-auth.json` |
| Purchased heading in a browser | BLOCKED: backend unavailable in cloud (SRW-21 `deferred_user`); unit PW1/PW6 only | — |
| Full vitest / build / verify | gate rows, not claimed | — |

The 0 page errors held in every state. No cloud-noise console errors appeared either.

## Ableton parity
This does not apply. It is a copy-only round, and B found no Live reference for product naming. No parity claim is made.

## Bugs
None.

## Info for B (not bugs)
- **INFO-C302-BUDGET-METHOD.** The task expected 96 / 79, and C measured 95 / 78. The method counts text nodes per row. The removed span was a second node on the h1's row, so the visual row count is unchanged. Future budget baselines should use distinct rows, or note this.
- **INFO-C302-AUTH-NAV-RACE.** The first G302-AUTH attempt crashed: `document.body` was null in `evaluate`. `/studio/middle-east` does 3 main-frame navigations on load. This was a harness timing problem, and the re-run passed. The invalid attempt is kept in `logs/auth.log`.
- **Known item:** `TestimonialsSection` (the "The Mixdown Studio" quote) is mounted by no route (C-R188-I6, `awaiting_user`). So the keep-list quote is not visible on any page, though the source keeps it verbatim.
- A's reviewer Lows and Infos (A-R302-REVIEW-NM1-NARROW, the "CZABA CZABA Studio" read-out) are A's findings. C did not re-classify them.
