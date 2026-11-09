# C round 420 — RETRO 420 verification (HEAD 6609dfa, no app code)

**Verdict: PASS** (2 Low environment findings, row 5 partial). `browserVerified` true. JSON: `c-round-420.json`; l57-check rc 0.

| # | Row | Result | Evidence |
|---|---|---|---|
| 1/12 | SOURCE-SCOPE start/end | PASS: 0 status lines; r420 manifest (1319) rc 0; protected manifest rc 0 | commands run in store/ |
| 2 | G420-AUTH (browser, 1440x900 + 1280x720) | PASS: fresh context, auth_user null, /studio-lab opens; /studio/middle-east "Sign in required", 0 audio[src]; anonymous studio-token = 401. Fake-bearer path BLOCKED (no backend) | `c-round-420/browser.json`, `protected-*.png`, `lab-open-*.png` |
| 3 | STUDIO-SMOKE-420 (browser) | PASS: clip 0→1 via Enter; position 00:00.000→00:01.462 (1440) / 00:01.471 (1280) after 1.5 s; frozen after Stop (1.602→1.602, 1.572→1.572); Export dialog opens (WAV/MP3/WAV+MP3 shown) and closes | `browser.json`, `playing-*.png`, `export-*.png` |
| 4 | RT-SCREEN | PASS: re-ran capture with mock API (200): lines 138/168/118/144 and outside 97/124/86/101, exactly B's; journey clips at left 512/1152/1792 (top 441/462), status "Night Pulse · Melody added to the Stems track at 00:48.000 (nearest free spot)"; PNG viewed matches review text (Stems lane, 2+ clips in view, stems one after another) | `c-round-420/screens/screen420.json`, 12 PNGs |
| 5 | CLAIMS | PARTIAL/FAIL on the literal criterion: K8 MISSING youtube-request.json, K22 TL-R419-L1-OPEN-INVARIANT MISSING, K24 FileNotFoundError (stderr 3 lines). Causes: root consumed the youtube request (reference/youtube/STEM-LANES.md exists); optimizer archived the closed TL-R419-L1 (status closed in archive/findings-archived.json). Both Low, origin environment. All other K lines equal | `claims.out`, `claims.err` |
| 6 | RT-NUM | PASS: scripts copied with output path rewritten, run, cmp: cost, classify, gate-reviews, l57-coverage, manifest-fields, exp-fields, fails-detail, awaiting-user, retro420-deadlines, stops, deferred-totals, open-medium-plus byte-equal. Differences explained: collect.txt/rounds json 419 B cost 14.33 (B's own planning round 420, result file written after B's snapshot; cost.py attributes B(N)=result N-1 so retro numbers unaffected); archived-mediums +1 line (A-R419-REVIEW-CR-2-5-DOC, closed, later archive). Recomputed: 45.81/63.35=72.3 %, (45.81-11.66)/(63.35-13.06)=67.9 %, medians 15.51/11.74, A PASS 3.69, 6 C Lows, 15 deferred (A7 C4 gate4), gate reviews 0/8.5+4/9+4, L57 4/4, retro-416 comparison 18.97/13.85/5.53 | `c-round-420/data/` |
| 7 | RT-CAUSE | PASS: K23 (four fixed tracks in route, 0 "group" in route and demo data) reproduced; C-R417-L58 and K21 (417 INCOMPLETE, 418/419 OK) reproduced; Math.random hit is the app-file-name text in b-round-418/make-sketch-src.py; opinions labelled tech-lead/product-designer in retro §5/§7 | claims.out, tools run |
| 8 | RT-IDS | PASS with note: all ids present; TL-R419-L1-OPEN-INVARIANT only in the archive (closed) | archive/findings-archived.json |
| 9 | RT-LESSONS | PASS: 60 lines; diff hunks only 3c3 and 12c12; l.3 pointer + sentence; L7 keeps the old evidence and adds the confirmedBy clause + round-418 evidence | diff vs lessons-before-420.md |
| 10 | RT-CHECKERS | PASS: l57 on c-round-419 rc 0; l58 on current-task "no sketch" rc 0; tasks 417 INCOMPLETE, 418 OK, 419 OK = [K21] | tool output |
| 11 | RT-SABA | PASS: SR items and Q1–Q5 are candidates/questions with defaults; AGREE note names the false "Stems group exists" premise; RC-R420-COST-COUNTER recorded as adopted retro counter, not a project rule; no project rule change proposed | files read |

## Bugs (Low, origin environment, to B)
- **C-R420-CLAIMS-K22-ARCHIVE-AGAIN:** claims K22 (and any claims id list) must also read `archive/findings-archived.json`, like K14 since D-29z1451. Fix: make id lookups archive-aware once, for all future claims scripts.
- **C-R420-CLAIMS-K8-K24-YOUTUBE-REQUEST-CONSUMED:** a root-consumed request file must not be a claims input; test the AGREE note instead. Info: AGREE-STEM-LANES row 5 says the YouTube search is not there yet, but `reference/youtube/STEM-LANES.md` exists now (transcripts file does not).

## Not verified / out of scope
- Export WAV / audio-graph / sample integrity: not measured. A RETRO round changes no source and only the dialog open/close and play/stop position were tested. Not claimed.
- Reference-first, Ableton conformance, screen budget: do not apply (RETRO).
- Full vitest/typecheck/build/verify: gate rows, not claimed.
