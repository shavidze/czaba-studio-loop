# C round 435 — RETRO 435 verification

**Verdict: PASS, 0 bugs, browserVerified/realVerified true.** HEAD 8233840, clean tree at start and end (manifest 1344 rc0, protected rc0). Evidence: `c-round-435/`, JSON `c-round-435.json`, L57 rc 0 (`c-round-435/l57-check.txt`).

| # | Row | Result | Evidence |
|---|---|---|---|
| 1 | SOURCE-SCOPE start | PASS | git status 0 lines; manifests rc0 |
| 2 | G435-AUTH (browser, both viewports) | PASS (attempt 2) | `auth/g428-auth.json`: demo workspace opens, auth_user null; legacy `/studio/middle-east` Sign in required, 0 audio[src]; token API 401 no header, 500 fake Bearer, no token. Attempt 1: cold Vite hydrate error ("useState" null), no workspace, no audio, no bypass; env, kept `auth/attempt1.*` |
| 3 | STUDIO-SMOKE-435 (browser) | PASS | `smoke/smoke.json`: clip added with Enter; clock 0 → ~0.66 → ~1.47 s, Stop holds ~1.56–1.58; Export opens, Esc closes; 0 page errors |
| 4 | RT-SCREEN (browser) | PASS | `screens/screen435.json`: 138/168/118/144 and 97/124/86/101, delta 0; journey clips 512/1152/1792, status "00:48.000 (nearest free spot)"; PNGs show From 48 / To 64 beside Start 00:48.000 and footer "source offset"; no spin arrows on hover (`smoke/spin-hover.png`). Run 1 had no mock API (my start failed); identical, re-run with mock up, then stopped |
| 5 | CLAIMS | PASS | `claims-start.txt` identical to planning output; stderr empty |
| 6 | RT-NUM | PASS | all 8 scripts re-run from `scripts/`, outputs cmp-equal to B's (`data/`); numbers match retro §1, §2, §4, §8, §9 |
| 7 | RT-CAUSE | PASS | D-29z1482/83 in archive; C-R423 origin is labelled hypothesis; tech-lead's "six scanner files", scrollbarUserRequest, L61 found |
| 8 | RT-IDS | PASS (partial depth) | find-ids: only C-R425-01 NOT-FOUND, RVM id present; all named backlog ids present; v419 / D-29z1543. I did not re-read every per-id status or the 11 `systemic_task` tags |
| 9 | RT-LESSONS | PASS | 60 lines, hunks 3c3/24c24/40c40, clauses as stated |
| 10 | RT-CHECKERS | PASS | l57 diff equals B's; backfill equal; l58 current-task rc0; window loop all OK |
| 11 | RT-SABA | PASS | nothing presented as Saba's decision; Q1–Q4 have defaults, Q4 = approved From/To |
| 12 | SOURCE-SCOPE end + L57 | PASS | status 0, manifests rc0, claims-end == start, L57 rc0 |

## Not verified / notes for B
- Audio graph, source timing and export WAV integrity were not measured: this round changes no Studio code, and the smoke test checked only clock/stop and dialog open/close.
- Premium path with a valid Bearer: BLOCKED (backend unavailable in cloud). Firefox/Safari rows: only Chromium available.
- `data/counters-extra.txt` has no generating script (the retro says so). I confirmed confirmedBy 13 by hand: open 1 + deferred 12.
- Studio journey still places stems one after another on one lane (F2, known; STEM-LANES awaits Saba, K25 unchanged).
- The cold-dev hydrate failure recurred once on a legacy route at 1440 (same family as C-R425-01-RVM-COLD-DEV-EMPTY, deferred Low); add as `confirmedBy`, not a new id.
