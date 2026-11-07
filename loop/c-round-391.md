# C round 391 — PERF-13b-ii: FAIL (A stopped on an open ruling; browser rows otherwise pass)

taskStatus FAIL, browserVerified true. Details/evidence in `c-round-391/` and `c-round-391.json`.

## Source scope
5 files changed (ArrangementContext.tsx, decoded-buffer-eviction-ui.test.tsx, strings.test.ts, strings.ts, perf/budgets.resources.json). Frozen manifest 0 failures, protected 11/11, claims-end == claims-start. Doc 251 absent.

## Browser rows (Playwright, installed Chromium, 1440x900 and 1280x720; probes `probe.mjs`, `probe2.mjs`, `probe3.mjs`, `b6.mjs`)
| Row | Result |
|---|---|
| B1 | PASS. Sequence `Loading “Middle East — public preview”…` → `…is ready.`; source start 101.35 s; 0 pageerror |
| B2 | PASS (status/transport). Space during decode: loading text, data-playing false; after: ready, still stopped; Space again: playing. Level ≥20 dB not measured |
| B3 | PASS. Library row `Error: File could not be decoded`; Space plays; status = failed text |
| B4 | PASS. WAV and MP3: 0 downloads, dialog `Export failed — no file was created. “…” failed to load — details are in the library.` |
| B5 | PASS. RIFF/WAVE 24-bit 48 kHz stereo, 101.35 s, non-silent. Dialog also shows pre-existing overload warning (14 samples clipped) |
| B6 | PASS with mock API (:5199, started/stopped by C). Product → "Try it in the Studio" → `?preview=middle-east` selected → Add → Play (data-playing true) → WAV downloaded |
| PERF-RES | PASS, 1 passed; pcm-live-mib-ready 31.9, decode 0 (assert). Logs `perf-res.log`, `perf-results/` |

## Bugs
- **C-R391-01 (Medium):** superseded preview leaves `Loading “…”…` on the status line indefinitely (reproduced both viewports). This is A's open STOP; the task requires "a stale Loading never stays". Needs B's ruling (A's option i: caller-side owner check + not-error) and the EV9 superseded rewrite, then re-dispatch.
- **C-R391-02 (Low):** export dialog preflight says "There is no clip with sound in the project — … silence" when the only clip failed to decode; contradicts the error shown after clicking.

## Not verified
Preview→Stop-preview stale case (UI gives no Stop during the wait). A's mutant logs not re-run. Gate rows (vitest/typecheck/build/verify) are `gate`.
Ableton: missing-media behaviour matches Live (play, status warning); no "Offline" mark is a recorded deviation; decode wait/export refusal have no Live reference.
