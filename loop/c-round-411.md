# C round 411 — PERF-15b-i: FAIL (A stopped on A-R411-REVIEW-M1; behaviour itself verified)

Reduced verification, because A's report ends in a STOP (L11/L22). The product behaviour was still checked in the real browser.

## Bug for B
**A-R411-REVIEW-M1 (Medium, confirmed by C by code reading).**
- `scripts/peaks/generate-demo-peaks.mjs` l.19: `new AudioContext()` without `sampleRate`, so output depends on the host device rate.
- `app/data/__tests__/studio-lab-demo.test.ts` PS17 l.376 hardcodes 44100 and ignores the meta's `sampleRate`.
- A regeneration on a 48 kHz host would turn PS17 red. Not executed (no 48 kHz host here), so it is a code-reading finding.
- Committed assets and runtime are unaffected. Options: B's (a) re-rate Low, or (b) v6 with `{sampleRate: 44100}` and PS17 reading the meta rate. C's view: (b) is cheap and fixes the determinism the doc promises ("byte-identical regeneration").
- Note: PS17 also checks a 48 kHz tolerance via `at48k`, which suggests the intent was rate-independence; the assertion at 44100 on the meta length is what breaks.

## Verified in the real browser (Playwright, own context, no credentials), `:5173`
| Row | Result | Evidence |
|---|---|---|
| 3 WAVEFORM-BEFORE-READY, 1440x900 and 1280x720 | PASS: held rects 96, aria-disabled true, opacity 0.4, cursor not-allowed, tabIndex -1, title "Preview — wait for the sound to load". Ready: 96, false, title null, pointer, 0. middleEastBegins 0, heroBegins 0, peaks requests exactly the 2 files, 0 page errors | `probe-real-*.json/png` |
| 4 FALLBACKS | PASS: 404 held 0 rects then 96 and 1 begin. 8bit held 96, then 1 begin. 0 page errors; both viewports | `probe-404-*`, `probe-8bit-*` |
| 5a lane probe | PASS: ok, 8/8 steps, 0 page errors, both viewports | `lane-*.json` |
| 7 AUTH | PASS: demo `/studio-lab` auth_user null, no "Sign in required"; `/studio/middle-east` shows "Sign in required" with 0 audio[src]; token API 401 without auth. Premium is not bypassed. First attempt hit a cold-route blank page (env, L38) and was retried with a longer wait. Fake-bearer BLOCKED: backend unavailable | `auth.json`, `auth.mjs`, `auth-premium.png` |
| 6 unit (covering only) | 24 files, 425/425 | `covering.txt` |
| 10 SCREEN BUDGET | PASS: 1 insertion, 0 deletions, `title=` line only | git diff |
| 1 frozen | 1300 entries, 0 mismatches | sha256sum -c |

Held/ready heights equality (row 3) was not separately compared by C; only the probe's recorded values were read for rects and attributes.

## Not run
Row 2 patch-identity, row 5b (410 probe), mutants 10/10, row 8 docs checks, row 9 Ableton table review, row 11 claims-at-end and l57-check, protected hashes. These are not claimed. Gate rows (full vitest, typecheck, build, verify) are the root gate's.

## Ableton
Reference 5.1.2 (grayed-out waveform while not ready): behaviour matches in rows 3/4 (dimmed, not seekable), but the full table review (row 9) was not done: status unverified.

## Next for B
Rule on M1. If (b), the delta is only the generator and PS17; C then runs the whole task in one pass (rows 3/4/5/7 already behave as specified on this tree).
