# C round 145 — VISUAL-A V-0.5a verification

**Verdict: FAIL** (one Low: C-R145-01, LAYOUT-LIB rule (vi)). `browserVerified` = `realVerified` = **true**. All rows that can run in the cloud were run in real Playwright Chromium at 1440×900 and 1280×720.
Env: `env-status.json` store 200 (2026-10-24T20:59:49Z). HEAD 9a67abd + A's 17 granted changes.

## Results per row
| Row | Result | Evidence |
|---|---|---|
| T145-TARGETED | PASS — 14 files, 251/251; per-file `it` counts equal A's | `c-round-145/out/vitest.json` |
| SOURCE-SCOPE | PASS — frozen 948 and A end hashes OK at start and end; status = exact grants; protected diff empty; Context = CX1, Library = LR1 only | shell run, see json |
| AN-REVIEW | PASS — §1.1/DM1–4 byte-exact (U+2026, U+2014, U+00B7); R3 titles untouched; doc 118 only 2 lines; doc 119 Georgian and consistent | diff |
| LIB-ROW-TEXT | PASS (text) — delay: `Loading…` ×15 then `01:41.352`; abort: `Music` + `Error: File failed to load (network)`, Enter → English `sourceFailed`, no clip; 404 → `(404)`; junk → `File could not be decoded`; preview: DOM `▶ Playing`, slider 0→1 in ~675 ms, 1 BufferSource, removed after stop; no Georgian in row meta | `out/c145-{1440,1280}.json`, `shots/error-*.png`, `decode-*.png`, `delay-final-*.png` |
| LIB-LABELS | PASS — DM2, DM3 and DM4 exact; folders/chips unchanged; DM1 has no render site on `/studio-lab` | `shots/ready-*.png` |
| LIB-SEARCH | PASS — stems/Stems/STEMS/stem → 4 stems; music → 3; sfx → 4 (R2b); `soft sfx` → soft-impact (AND); `მუსიკა` → 0 + empty; `''` → 9; Enter on bass → clip 0→1, English `clipAdded` | `shots/search-add-*.png` |
| LAYOUT-LIB | **FAIL on (vi)**. Rules (i)–(v) hold: root/tree/list/search/notice/preview d=0; changed text nodes kept box and lines; the only >1 px delta is previewing `meta2` w +12 (rule ii). But the marker now overflows 12 px further and is clipped to `▶ Play` | `out/layout145-*.json`, `out/overflow145-*.json`, `shots/lib-previewing-1440.png`, `shots/previewing-1280.png` |
| LAYOUT-REST | PASS — 102 (1440) / 91 (1280) nodes outside the library, 0 moved > 1 px; library root = libbase | `out/layout145-*.json` |
| PURCHASED-LABEL | BLOCKED — backend unavailable in cloud (unit: collection.test l.84 green) | — |
| G145-3 | PASS — lab opens anonymously with the demo badge; `/studio/middle-east` → Sign in required, no workspace, 0 `audio[src]` (1440 and 1280); token API → 401. Fake-Bearer 403 BLOCKED (backend) | `out/g145-3.json`, `shots/g145-3-*.png` |
| PX-NET / REG-HYD | PASS — 14 contexts: 0 errors, 0 pageerror, 0 forbidden requests, 0 Authorization headers, 0 hydration | json `net` |
| Gate rows | not claimed (full vitest, typecheck, build, Biome, verify, e2e, PROD-*) | gate |

## Bug
**C-R145-01 (Low; regression/worsening of ABL-B-1).** Steps: fresh `/studio-lab` → click the Soft impact option → `▶ მოუსმინე`. The row marker span is 42 px (baseline `▶ ისმის` 30 px). It starts at x 257 inside a 126 px option (148..274) and ends at x 299. While previewing, the list's scrollWidth is 155 against a clientWidth of 134. On screen it reads **`▶ Play`** while audio is playing, so the marker says the opposite of the state. Baseline already clipped (ABL-B-1), but less, and the cut-off text was not misleading. Rule (vi) ("no new horizontal overflow, no clipped row text") fails. The fix needs a class/layout change, which LR1 forbids. V-0.5b, which owns the rest of this file, or a bounded fix-up could do it cheaply.

## Ableton correspondence (rated separately)
- AND search: **confirmed** (Live 12 §4.2), and CZABA's behaviour matches.
- Kind/plural keywords: **conscious simplification**, inference only.
- Row loading/error/playing copy: **unconfirmed**, CZABA-only, no Live claim.

## CZABA requirement met?
Strings, errors, labels, search and auth: yes. Layout in the previewing state: no (C-R145-01).

## Notes for B
- **Verdict gap:** (vi) fails only on a Low. §7 has no row for this, so B must rule in writing: either PASS with C-R145-01 deferred, or V-0.5b or a fix-up takes the clip first. Clip edge ≈ x 278: baseline clipped 9 px (ended at 287), now 21 px (ends at 299). Snap was off at start in both viewports. AudioContext was `running` during the preview.
- m91: confirmed spec issue. failed-source-refusal l.90 has its own `LOADER_ERROR` literal (l.119, l.268), so it cannot turn red.
- code-reviewer Lows on test strength (DM1–DM4 values, purchased guard texts) still stand.
- Invalid run: my first 1440 run used a wrong expected id (`demo-hero`). I fixed the harness and re-ran both viewports.
- Not a bug: `arrangement-library-playhead` shows the arrangement playhead, so it stays at 00:00.000 during the library preview.

Tools: `c-round-145/tools/{lib,c145,layout145,overflow145,g145-3}.cjs`. No writes under `store/`.
