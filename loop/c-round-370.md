# C round 370: PERF-11a — verdict PASS (browserVerified true, 0 bugs)

Evidence in `c-round-370/` (rows in `c-round-370.json`, scripts in `scripts/`, L57 check in `l57-check.txt`).

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS: 8 status lines (4 M + 4 new), same at start and end; frozen sha rc 0 both times; protected sha 0 failing | `status-start/end.txt`, `frozen-start.txt` |
| CLAIMS | PASS: differs from HEAD output only on K2/K3/K4/K5/K8/K11; equals the sketch output except K2 (8 lines) and K11 (doc 237 exists) | `claims-c.txt` |
| ROOT-NARROW | PASS: diff empty | |
| CHAT-SHAPE | PASS: type-only import, `await import` inside `try` (l.137→), one `isHubConnected`, no any/as/'Connected' string | `chat.diff` |
| UNIT | PASS: 4 files 23/23; chat file 4/4 under shuffle seed 42 | `unit.log` |
| MUTANTS-TREE | PASS: a → CL1, CL2, CL4 red; b → RT3 red; c → RT1 (+RT3, RT4) red; d → CL4 red; tree restored byte-equal | `mut/*.log` |
| PERF-BYTES | PASS, run alone: 362,477 / 250,526 / 270,648 (equal to B's sketch) vs budgets 372,000 / 258,000 / 278,000 | `perf-res.log` |
| NO-SIGNALR (browser, prod build, both viewports) | PASS: 0/46 scripts on /studio-lab, 0/42 on / contain the signalr string; the string exists in lazy chunk `index-CJQPnPAn.js` (control) | `nav.json` |
| SSR-OPACITY | PASS: no inline opacity:0 on /studio-lab and /studio/middle-east; `/` keeps `opacity:0;transform:translateY(8px)` | curl on 5190 and 5173 |
| PAINT (record) | FCP−DCL medians 26 ms (1440) / 31.9 ms (1280), noisy; screenshot at FCP+100 shows the workspace, opacity 1 | `screens/paint-fcp100-*.png` |
| FADE | PASS: / → /about wrapper opacity dips to 0.19 / 0.09, ends at 1 | `nav.json` |
| NAV | PASS: / → Studio → "← CZABA" → / at both viewports; only cloud-expected console errors | `nav.json`, `screens/nav-*` |
| G370-AUTH | PASS: auth_user null; /studio/middle-east "Sign in required", 0 workspace, 0 audio[src]; token API 401 without token; fake bearer fail-closed 500, no token/URL in body | `auth.json` |
| STUDIO-SMOKE-370 | PASS at both viewports: Bass added with Enter, position 00:01.471 after 1.5 s, cross-lane move + "Undo: Move to track — SFX (Ctrl+Z)", WAV RIFF/WAVE 24-bit 48 kHz 16.000 s, peak 0.217, 0 NaN, data length consistent; values identical to round 369 | `smoke.json`, `exports/` |
| CHAT | BLOCKED: backend unavailable in cloud (CL2–CL4 cover the client path) | |
| DOCS | PASS: l.4 byte-exact; headings equal TEMPLATE minus `## Prompt`; named tests exist | |
| RT-FIX | PASS: only the retro §10 L58 bullet and lessons.md l.3 changed; lessons.md 60 lines | |

Gate rows (not claimed): full vitest, typecheck, build, Biome, verify, e2e smoke.

Notes: the prod server used the build produced by the perf spec on A's tree; no separate HEAD control build was made (HEAD figures rely on B's logs). PAINT is wallclock and record-only. No bugs found.
