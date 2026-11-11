# C round 446 — STORE-2b-1 LeadMagnet route exclusion: PASS (1 Low)

Real Chromium (Playwright) on tree :5173, HEAD control :5178 (`sketch-server.sh ... none`), mock API :5199. Viewports 1440x900, 1280x720, 375x812. Fresh context per cell, cookies declined. Raw data: `c-round-446/tree-all.json`, `head-all.json`, `tree-header*.json`, `c9-c12.json`, `inflight.json`, `mutants-results.jsonl`; screenshots `c-round-446/shots/`; probes `c-round-446/tools/`.

| Row | Result |
|---|---|
| C1 SOURCE-SCOPE | PASS: git status = 5 granted paths; no root.tsx/AuthModal/ui/Modal change |
| C2 PATCH-IDENTITY | PASS: 4/4 cmp vs `b-round-445/sketch-files` |
| C3 CONTROL-HOME | PASS: popup, viewCount 1, 3 viewports (HEAD same) |
| C4 EXCLUDED-TIMER | PASS: product/cart/checkout success/cancel, 3 viewports, no popup, viewCount absent, scroll room 171..1107 (non-vacuous). HEAD: popup 12/12 |
| C5 EXCLUDED-EXIT | PASS: no popup (HEAD popup) |
| C6 JOURNEY | PASS: no popup after home scroll then product link, 3/3 (HEAD popup 3/3) |
| C7 BACK-HIDE | PASS: popup gone, body overflow/position empty, scrollY 0 = BACKCTL, dismissed false, viewCount 1, after Forward popup on offer step viewCount 2. HEAD: popup still open, body fixed/hidden |
| C8a | PASS: activeElement BODY = BACKCTL, 3 viewports |
| C8b | PASS at 1440/1280 (header link CZABA kept = control); 375: first cell flaked (below), 3 clean reruns PASS |
| C9 KEEP-LIST | PASS: offer and email screenshots byte-identical HEAD vs tree; scrollY 2267 after Close both; body unlocked |
| C10 COVERING | PASS: 4 files, 100 tests |
| C11 MUTANTS | PASS: 14 lines, id/rc/failedRows equal B's |
| C12 STUDIO+AUTH | PASS: /studio-lab add clip, Play clock +1.97 s in 2 s, Stop halts (1440, 1280); anonymous /studio/middle-east "Sign in required", 0 audio[src], 0 media requests, so premium is not bypassed |
| C13 DOCS | PASS: l.4 exact, 7 headings in order, 14 mutant ids, 0 pending |
| C14 CLAIMS | PASS: only K17 differs |
Gate rows (full vitest, typecheck, build, Biome, verify): not claimed.

## Finding
**C-R446-01 (Low, origin A, confirms code-reviewer A-R446-REVIEW-L1):** a submit in flight when Back hides the popup fails afterwards and re-sets `error`; the next open's email step shows the stale message (probe: `inflight.json` emailStale true, 1 request fired, `shots/inflight-1440.png`). Offer step is clean. Rare, no data loss. B to rule whether change 3 covers in-flight failures; else `deferred_low_polish`.

## Flake (not a bug claim)
First tree header-focus cell at 375: no popup and a React "Invalid hook call" warning; ran while three probes and the mutant run were using the dev server. 3 isolated reruns equal B and the control. Unreproduced.

## Not verified
Ableton parity not applicable (Store). B's rulings (b) re-arm window and (c) hide-on-navigate are B proposals pending Saba (`SABA-Q-LEADMAGNET-NAV-RULES`), not verified as Saba decisions. Studio export WAV measurement not applicable (Studio untouched).
