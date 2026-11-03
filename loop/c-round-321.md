# C — round 321 (RETRO 321 verification)

**Verdict: FAIL.** The cause is three Low traceability findings (C-R321-01/02 carry the row FAILs; -03 is a presentation slip) in B's retro documents (RT-NUM and RT-IDS). The app is fine: no source change, and every browser row PASSES at both viewports. Per task §4, B fixes the files at the round-322 planning and the next C round re-checks only the changed lines (RT-FIX).

- `browserVerified` = `realVerified` = **true**. G321-AUTH, STUDIO-SMOKE-321 and the RT-SCREEN re-run all ran in real Chromium (Playwright) at 1440×900 and 1280×720.
- env-status: `{"checkedUtc":"2026-11-03T20:17:24.3318314Z","round":321,"attempt":1,"store":200}`.
- Mock backend: no instance answered `__mock/health` at the start. I started my own (`c-round-321/mock.log`) and stopped it at the end; the stop was confirmed.

## Rows

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | **PASS** | Start (20:17Z) and end (20:24Z): HEAD `53c5c79676e4…`, `git status --short --untracked-files=all` empty, `sha256sum -c --quiet b-round-320-r321-tree-sha256.txt` rc 0, 1226 entries |
| CLAIMS | **PASS** | Ran `bash b-round-320/claims-321.sh` first. `c-round-321/claims-321-c-output.txt` is byte-equal to `b-round-320/claims-321-output.txt` (diff empty). K8 prints `done`, with no MISSING and empty stderr |
| RT-NUM | **FAIL (Low, C-R321-01, C-R321-03)** | I re-ran all 11 analysis scripts in a sandbox copy (`c-round-321/rerun/`, paths rewritten so B's files stay untouched). Ten outputs are byte-equal. `collect.txt` differs only on round 320's `b_cost`, 0 → 19.02, because `b-round-320-result.json` (the 321 planning) now exists. `cost.py` uses the shifted B file, so `cost.txt` and `cost-rows.json` are equal. Every listed number matches (see below), except the §9 assert claim (C-R321-01) and the §4 "7 + 2" convention slip (C-R321-03) |
| RT-CAUSE | **PASS** | All quoted sources say what §3/§9 say: the `bugs[].origin` of `c-round-305…320.json`; STOP lines `grep -c 'STOP — needs B ruling'` = 1 in a-round-313/318/319 and 0 elsewhere; `tasks/round-318.md` l.102 (range removed from `ArrangementContextValue`); `tasks/round-319.md` l.233 "`mutantRedOnSketch` (on A's tree)"; the tasks 313/314/315/318/320 list only the three new fields after "with the L57 fields"; `gates/round-320/review.md` items 1–6 match §7. The EXP-R305 verdict follows `retros/retro-305.md` §10: stop at B median 12.12 > 11.70; rejection (b) by the chain 312→313→314. Consultant opinions are labelled |
| RT-IDS | **FAIL (Low, C-R321-02)** | Every listed id is present with the stated status (details below). The extra-spelling grep found one RETRO-320 mention with no §8 disposition: D-29z801 |
| RT-LESSONS | **PASS** | 59 lines, three parts. The diff touches only l.3, l.8 (L3), l.38 (L54), +l.41 (L58), −l.52 (L16) and l.59 (L57). L3, L54 and L57 keep their old text as an exact prefix and only append. L3 keeps C-R142-01, C-R145-01 and C-R146-01. The id list equals K13. Line 3 now has 808 bytes and names the before-copy, whose line 3 has 3928 bytes. Limit: the loop git repo is shallow (one commit, made after B's edit), so the before-copy's provenance cannot be checked against history. It is internally consistent (its newest entry is D-29z878) |
| RT-SABA | **PASS** | §12 is headed as proposals. SR-321-2, -3 and -5 are marked "კითხვა". SR-321-5 says that collapsing the monitor or moving the Video lane is a layout change for Saba. RC-R275 is a proposal |
| RT-SCREEN (browser) | **PASS** | I opened B's PNGs (`screen321-full-DEMO-1440x900`, `journey321-3-export-1440x900`). Re-run of an unchanged copy of `capture.mjs` (sha256 equal) with the mock: `laneErrors` none; journey → `/studio-lab?preview=middle-east` with "Middle East — public preview" selected at both viewports; position after Play `00:01.471` at both viewports; persistent lines **97 / 124 / 86 / 101**, an exact match. Each SR candidate checked (below). The first capture attempt timed out on the cold dev compile (L38) and was replaced after a warm-up |
| G321-AUTH (browser) | **PASS** | `c-round-321/g321-auth.json`. Both viewports: `/studio-lab` shows the workspace and the badge "Demo collection — no sign-in required", and `auth_user` is null. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. `/api/studio-token?product=middle-east&file=mix.wav`: no header → 401 `Please sign in to access Studio.`; fake bearer → 403 `Unable to verify ownership` (mock running). Bare URL → 400. No token appears in any body. Attempt 1 timed out on the cold `/studio/middle-east` compile (`g321-auth-attempt1-cold.log`) and was replaced |
| STUDIO-SMOKE-321 (browser) | **PASS** | `smoke321.json` and `stop321.json` at both viewports, details below |

**Gate rows** (not claimed): the full vitest, typecheck, build, Biome, `npm run verify` and the e2e smoke belong to the root gate.

## STUDIO-SMOKE-321 details

All steps ran in a fresh anonymous context, after `Demo collection ready`.

- **Add.** Stems track header, then the `Bass` option, then Enter. The clip "Night Pulse · Bass" lands on `stems` at 0.000.
- **Play.** After 1.5 s the position reads `00:01.491` (1440) and `00:01.471` (1280).
- **Real audio output.**
  - An init-script tap was attached: an analyser on every node connected to `destination`. There was 1 connection.
  - The analyser peak during playback was **0.215** at both viewports, sampled every 100 ms (15 samples, all > 0.07).
- **data-playing.** It is measured in `stop321.json` via the transport **Stop** button, because Play is not a toggle. It reads `false → true`. Stop (transport "Stop", title "Stop (Space)") then gives **`false`**, and the position holds at `00:01.512`.
  - Note: a second click on Play while it plays does not stop. That matches the separate Stop button (SABA-B-9/10a), so it is not a bug.
- **Body drag across the clip.** The readout reads `Time selection: 00:02.000 — 00:16.000 · length 00:14.000 · …` (snap on, grid 1/2). It already updates mid-drag.
- **Export WAV** (Entire project):
  - `suggestedFilename` `czaba-studio-lab.wav`;
  - RIFF/WAVE PCM, 24-bit, 2 ch, **48000 Hz**, **768000 frames = 16.000 s**, data header = actual (4608000 bytes);
  - peak 0.21707, RMS −21.95 dB, 0 non-finite samples.
  - The two viewports give identical WAV stats.
- **Console/page errors:** none, after filtering out the expected cart/connection noise.

## RT-NUM detail (all matching unless noted)

- **Totals and medians.**
  - B/A/C/all: $192.26 / $110.06 / $92.42 / $394.74. Round median $24.46.
  - Phase medians: B $12.12, A $6.84, C $5.42. FAIL rounds $150.14 (19.79 + 27.39 + 18.59 + 24.78 + 32.79 + 26.80).
  - B share 48.7% → 49%.
  - Spot check against the raw result files: `b-round-314-result.json` 21.89; round 318 = 9.91 + 12.99 + (4.26 + 5.63).
- **Groups.**
  - $19.79 / $202.23 / $64.63 / $108.09, which sum to 394.74.
  - Fix-ups: 18.59 / 24.97 / 13.59 / 26.80 / 24.14.
  - STOP rounds: 18.59 + 32.79 + 26.80 = **$78.18**. `RC-R275-STOP-ROUTES-TO-B.status` carries $78.18.
- **Counts.**
  - C PASS/FAIL 10/6; gate 10/6/0.
  - C `bugs[]`: Medium 8, Low 10, recounted directly from the 16 JSONs.
  - Gate reviews: 10 review.md files, 51 findings (50 suggestions + 1 Critical).
  - Origins: C 38+3 = 41, gate 21+8 = 29, A 14+13 = 27, B 2+5 = 7; 75 + 29 = 104.
  - Deferred 574/34; awaiting_user 82; STOPs 3; first stages failing C 3 of 7.
- **§9.**
  - Every running B median from 305 is > $11.70 (305 = 14.23).
  - The manifest fields are absent exactly in 313/315/318/320.
  - L23 is 5058 bytes (`sed -n 16p | wc -c`), line 3 is 808 bytes.

- **§1 and §12 cross-references to retro 305, checked against `retros/retro-305.md` and `b-round-304/retro-numbers.txt`:**
  - 13 / 2: l.64;
  - $18.39: l.38;
  - $52.14: l.39;
  - $9.75: l.40;
  - 1 of 5 first stages: retro-numbers l.12;
  - 70 awaiting: l.206.

  All match.

## SR candidates (RT-SCREEN)

- **SR-321-1.** The real download is `czaba-studio-lab.wav`. The dialog shows no file name. **As described.**
- **SR-321-2.** The only visible exit link is `CZABA -> /` at both viewports, and "View in store" is not visible (`sr23.json`). **As described.**
- **SR-321-3.** The product page contains the exact Provenance sentence. The Studio shows the "Synthetic demo stems — not CZABA catalogue audio." notice. **As described.**
- **SR-321-4.** Amber bar, bold "Stems", "· active", and the footer "Active track: Stems · insert marker 00:00.000". **As described.**
- **SR-321-5.** The Video lane is first, with "No video — use “Your own video” or drop a file here", "Original sound" and "+ Your own video". **As described.**
- **SR-321-6.** The export dialog names no tracks. **As described.**
- **Cut or overflowing text.** None of the six SR candidates claims cut text, so no `scrollWidth` check was needed.

## Findings (to B)

### C-R321-01 (Low, origin B)
`retro-321.md` §9 says: "null არ არის: 16-ივე რაუნდი ასახელებს assert-ებს (7–18)". The source does not support this.

- **What the JSONs say.** Actual `assertsSpecified` in `c-round-305…320.json`: 305 **null** (RETRO); then 5, 19, 2, 9, 15, 18, 14, 3, 3, 9, 7, 1, 7, 7, 8. So 15 of 16 rounds name asserts, and the range is **1–19**.
- **Where "7–18" comes from.** It is the range of the four rounds in `unfailable-assert-fields.txt` (310/311/319/320 = 15/18/7/8), applied to all 16.
- **Verdict.** The "not null" conclusion and the EXP-R305 verdict are unaffected, but the number is untraceable.
- **Evidence:** this file (RT-NUM) and the steps in `c-round-321.json` C-R321-01.

### C-R321-02 (Low, origin B)
The inventory misses D-29z801.

- **What the grep finds.** The extra-spelling grep on `backlog-before-321.json` (`round 32[01]`) hits `decisions_log_b` **D-29z801**: "…next RETRO round 320 or end of STUDIO-PERFORMANCE."
- **The gap.** It is a RETRO-320 mention of the same kind as D-29z827/836/840/844/849. It is not in `retro321-mention-ids.txt`, and it has no disposition in `retro-321.md` §8.
- **The other hits are not gaps.** advisor_used_by_B, current_task, D-29z872, D-29z875, C-R319-01/02/03, INFO-C319-R-ROWS-MISSPEC and PERF-8a refer to round 320 as an implementation round, not the RETRO.

### C-R321-03 (Low, origin B)
A number-presentation slip in §4: "focus/keyboard (7 + 2)".

- Everywhere else in §4 the "x + y" form means open + deferred.
- Under that convention, `classify.txt` gives open focus 7 + keyboard 2 = **9** and deferred focus 1 + keyboard 1 = **2**.
- So the figure should read "9 + 2", or "focus 7 + 1" if it means focus only.

*Withdrawn draft item:* §8's "+789 since RETRO 305 (4,269)" is consistent. `sed -n 16p b-round-304/lessons-before-305.md | wc -c` = 4269 bytes, the same `wc -c` method as K15. The retro-305 word "სიმბოლო" was loose wording around a byte figure. Not a finding.

## L57 fields
manifestPaths 75 (listed in c-round-321.json `manifest`, all exist), missingPaths 0, countMismatches 0, claimCheckMinutes 1. `assertsSpecified`, `mutantsRecorded` and `mutantRedOnSketch` are null: "RETRO: no assert specified".

## For B / root
- A's lesson feedback on L58 (mark rows that were not run on the sketch "record — not run on sketch: <reason>") is useful input.
- No app bug found.
- Policy reminder carried forward: `root-pre-push-review.md` was not re-read this round, because no source changed.
