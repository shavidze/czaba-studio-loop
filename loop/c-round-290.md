# C — Round 290 (RETRO 290 traceability + G290-AUTH + STUDIO-SMOKE-290)

**Verdict: FAIL (one Low, RT-CAUSE).** All three browser rows passed at 1440×900 and 1280×720, so `browserVerified` = `realVerified` = true. No source change: SOURCE-SCOPE passed at the start and at the end.
**Env:** env-status.json `{"checkedUtc":"2026-10-31T13:12:55Z","round":290,"store":200}`. I started the mock API (loop `mock-api/server.mjs`) only for the second G290-AUTH run and stopped it afterwards.
**Read first:** `lessons.md` (59 lines, revised for 290).

## Rows

| Row | Result | Evidence (under `c-round-290/` unless stated) |
|---|---|---|
| SOURCE-SCOPE | PASS | `source-scope-start.txt` / `source-scope-end.txt`: HEAD `5a911ff…`, empty status, `sha256sum -c --quiet` rc 0 at both points |
| CLAIMS (K1–K12, run first, verbatim) | PASS | `claims.txt`: every output equals its expected value |
| RT-NUM | PASS | `rt/`. I ran B's 9 scripts on copies with outputs redirected, against a copy of `backlog-before-290.json`. All outputs are byte-identical to B's, except:<ul><li>`cost.txt`: dict order only;</li><li>`collect`: round 289's raw `b_cost` now includes the round-290 planning result, which was written after collect ran. The shifted B cost that `cost.py` uses is unchanged.</li></ul>I also recomputed every listed number by hand (see the JSON) |
| RT-CAUSE | **FAIL** | C-R290-01 (below). Rows 275, 282 and 287 and §9 match their sources. The SWEEP verdict follows retro-275 l.202 |
| RT-IDS | PASS | `rt/rt-ids.txt`. All ids and statuses are as stated. My variant grep (`rt/inventory-c.txt`) found 4 more hits; none needs a disposition (INFO-C290-01) |
| RT-LESSONS | PASS | `rt/lessons-diff-c.txt` (identical to B's) and `rt/lessons-check.txt`: L2/L4 prefixes are byte-identical, no evidence id is lost, 59 lines |
| RT-SABA | PASS | Everything is phrased as a proposal or a question; SR-290-3 and SR-290-10 are questions |
| RT-SCREEN | PASS | I opened the PNGs, and each candidate shows what it describes. SR-290-10 is the pair `journey290-1-product-1440` (Middle East) and `journey290-2-studio-playing-1440`, whose library shows only the public preview and Night Pulse. The re-probe (`stems/stems-probe.json`) matches B's at both viewports:<ul><li>no lane chosen: Bass goes to Music;</li><li>after clicking `Stems`: Pad goes to the Stems track</li></ul> |
| G290-AUTH (browser) | PASS | `auth-nomock.json`, `auth-mock.json`, `shots/auth/`, both viewports:<ul><li>lab: workspace, badge, `auth_user` null;</li><li>guard: "Sign in required", 0 `audio[src]`;</li><li>token API: 401 with no header; with the fake bearer, 500 without the mock (fails closed, no token) and 403 with it</li></ul> |
| STUDIO-SMOKE-290 (browser) | PASS | `smoke290.json`, `shots/smoke-*.png`, both viewports:<ul><li>Bass added to Music;</li><li>position 00:01.471 / 00:01.483 at 1.5 s;</li><li>`data-playing` false→true→false (stopped with Stop);</li><li>real destination RMS 0.049 / 0.043 while playing, 0 after Stop;</li><li>WAV: RIFF/WAVE, 48 kHz, 24-bit stereo, 16.000 s, peak 0.217, no NaN</li></ul> |
| Gate rows | gate | vitest, typecheck, build, Biome, verify, e2e smoke: root gate |

## Bug for B

**C-R290-01 (Low, origin B spec): retro-290 §3, row "276 gate fail", misstates the source.**
- **Retro says:** "3 test ფაილი native `disabled`-ს ამოწმებდა".
- **Source:** `gates/round-276/verify.log` says `Test Files 2 failed | 218 passed`. 3 tests failed in 2 files:
  - NS1, `navigation-strings-ui:222`: the old Split **title**;
  - NS6, l.429: `disabled`;
  - TC9, `transport-centre-ui:404`: `disabled`.
- **Agreeing records:** GATE276-T1 ("2 failed / 218 files, 3 failed / 3291 tests") and B's own `fails-cause-hand.txt`.
- **What is correct:** the cause (task 276 §2.5 ruled only runtime hits), the lesson, and §1's "3 tests".
- **Why the row fails:** the RETRO policy (2026-10-26) requires every number to be traceable to its evidence; this count is not.
- **Fix:** "3 tests in 2 files (two native `disabled`, one old Split title)". RT-FIX re-checks only that line.
- **Evidence:** `rt/gate276-excerpt.txt`.

## Info
- **INFO-C290-01 (B pre-check):** `retro290-mention-ids.txt` missed the hyphenated spelling "RETRO-290", which appears in D-29z692 and in PD-REVIEW `order_rule`. It also missed the `retro_policy` and `final_acceptance` hits. All of them are precedence notes, or the TLM-R274 item already handled in §7, so no disposition is missing.
- **INFO-C290-02 (environment):** the first auth attempt hit the cold dev-server timeout (INFO-C280-AUTH-COLD-START). Once warm, the load took 8.8 s. My first smoke run tried to stop with a second Play click; Play does not toggle (Live-like, SABA-B-9), so that was a mistake in my script, not an app bug.
- **Ableton match:** not applicable (RETRO). Play is not a toggle and Stop is separate. This matches Live's transport (manual 6.3, recorded in SABA-B-9), but I did not re-verify it against Live this round.

## HR-C-MANIFEST-FIELDS
- `manifestPaths` 22 (K8);
- `missingPaths` 0;
- `countMismatches` 1 (C-R290-01);
- `claimCheckMinutes` ≈ 1.

## Outcome (per task §4)
An RT row failed, so B corrects retro-290 §3 at the round-291 planning. The next C round re-checks only that line (RT-FIX), together with FIX-PD-1b2.
