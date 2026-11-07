# C round 382 — PERF-13b-i (decoded audio cache): **FAIL** (2 Medium findings)

`browserVerified` = true (all browser rows ran, both viewports). Env: `env-status.json` attempt 1. Evidence folder: `c-round-382/`.

## Row results
| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS: 11 status lines = grants (A's tree), unchanged at start/end; frozen + protected sha rc 0 | `status-start/end.txt` |
| FIXTURE-ONLY | PASS: 0 C-DEMO files changed | `git diff --stat` empty |
| CLAIMS | PASS: 0 MISSING; differences explained (K2, K3–K5 rename to `decodedBuffers`, K7, K8–K11/K29/K30 line shifts, K16/K17 doc 248, K21 guard strings, K28 effect-closing line gone because deps changed); K31, K32 unchanged | `claims.txt` |
| UNIT | PASS: 12 files / 121 tests (2 new + 10 C-DEMO); perf lib 3 files / 54 tests; DC1–DC7, EV1–EV9, PL1–PL7 present | `unit.log`, `perf-lib.log` |
| MUTANTS-UNIT | PASS: 16/16 red on the named row, `restored` | `mutants-unit.log` |
| HARNESS-MUTANTS | PASS: NO-DECODE-WRAP → `pcm registry did not count its decode probe`; STRONG-REFS → `pcm registry kept a dropped probe` | `mutants-browser.log` |
| PERF-RES (prod build) | asserts PASS 22/22, 0 failures; export bytes 29,189,420 / 58,378,796 (1×, 6×) as HEAD; **record values differ**: ready 86.9 MiB / 8 / decode 55.1 (expected 31.9 / 7 / 0); after-Add 69.0 / 8 (as expected); after-export delta −18.0 (expected +37.1). The difference is explained per buffer (the 150.37 s hero buffer) but its cause is a defect → C-R382-01 | `latest-resources.json`, `res-rows.txt` |
| EVICT-BROWSER | **FAIL** (a) and (b); (c) PASS without a preview | below |
| PLAY-REFUSE-BROWSER | PASS (CPU 6×, window caught 4/4 at ~300–370 ms): no start, status exactly `“CZABA hero — public preview” has not loaded yet.`; second Space after decode starts the hero source (150.37 s) and the track meter reads −36.2/−46.1 dB within 313–346 ms | `playrefuse.json`, `shots/playrefuse-*` |
| EXPORT-BROWSER | PASS: Add middle-east then Export at once; WAV sha256 `5fadd97a…8202` identical to HEAD control (built from `git archive HEAD`), both viewports; 24-bit 48 kHz stereo, 101.352 s, no NaN; after Undo + GC ×2 the source is evicted | `exp.json`, `exp-*.wav` |
| G382-AUTH | PASS: fresh context `auth_user` null, `/studio-lab` workspace (9 options); `/studio/middle-east` “Sign in required”, 0 `audio[src]`; token API 401 without a token, no token in body. Fake bearer → 500 under `blocked` (no backend) | `auth.json` |
| DOCS | PASS on form (l.4 byte-exact, headings in order, every DC/EV/MU named exists, 0 `pending` hits). Content note: doc says preview releases on Stop; browser contradicts (C-R382-02) | |

## EVICT-BROWSER detail (prod and dev gave the same numbers; 1440×900 and 1280×720)
- (a) FAIL. Live after GC ×2 at ready (and 10 s later): `[2,5,16,16,16,16,16,150.37]` s. The 150.37 s buffer is alive; only the 101.35 s one is released.
- (b) Preview of middle-east: audio starts (source start 101.35 s, 276 ms) and the buffer is live while playing: PASS. After Stop + 6 s + GC ×2 it is **still live**: FAIL. Preview hero afterwards: hero live, middle-east gone → exactly one MP3 buffer (the most recent) is always retained.
- (c) Without a preview: Add → 101.35 live; Undo → none live; Redo → live again; add hero → both live: PASS. After a preview, Add + Undo leaves it live.

## Findings (to B)
- **C-R382-01 (Medium).** Hero 150.37 s buffer (55.07 MiB) retained at ready; ready PCM 86.9 MiB, perf-plan target ≤ 60 MB not met. The cache logic itself is correct (DC4), so the holder is outside the cache. Hypothesis only: the last peaks job / last decode result. Needs a heap-snapshot retainer check.
- **C-R382-02 (Medium).** A preview leaves its buffer alive after Stop and after Undo; doc 248/EV9 claim otherwise. Same mechanism as C-R382-01; B may merge. The K32 premise "other holders release it" is wrong by measurement for these two paths.

## Open ruling for B (A's STOP, not a C bug)
Collection reset `clear()` also drops non-evictable video-audio buffers (code-reviewer M2). Unreachable in production today (module-constant collection), so I could not reproduce it in a browser; the `clear()` vs "preview/export pins" question is also open.

## Observations
- Refusal text stays after the second Space starts playback (per the L51 ruling; not a bug).
- Neighbour risk §5: export asserts stay green (peak backing Δ ≤ 0.2 MiB 1×, long task 0 at 6×).
- Not run: full suite / verify (gate rows).

Next for B: fix both retention holders (or rule that one retained MP3 is accepted and change the target), then re-run PERF-RES and EVICT-BROWSER (a)/(b); C rows that passed need only a quick re-check.
