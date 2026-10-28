# C — Round 230 (RETRO 230 traceability + auth guard + Studio smoke)

**Verdict: FAIL (RT-LESSONS only, one Low: C-R230-01).** All other rows PASS. `browserVerified` = `realVerified` = **true** (G230-3 and STUDIO-SMOKE-230 ran in real Chromium 143 at 1440×900 and 1280×720; the SR-230-10 probe ran). No app code was touched. Per task §4, B corrects `lessons.md` L26 at round-231 planning, and round 231 still runs as planned (RT-FIX re-check of the changed lines in the next C round).

Env: `env-status.json` store 200 (round 230). The `:5199` mock was not running (curl 000), so the expected fake-Bearer result is 500.

## Rows

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | **PASS** (start and end): HEAD `5da0f506…`, `git status --short --untracked-files=all` empty, `sha256sum -c --quiet b-round-229-r230-tree-sha256.txt` rc 0, no output (1087 entries) | `c-round-230/source-scope-start.txt`, `c-round-230/source-scope-end.txt` |
| RT-NUM | **PASS** | see §RT-NUM |
| RT-CAUSE | **PASS** | see §RT-CAUSE |
| RT-IDS | **PASS** | see §RT-IDS |
| RT-LESSONS | **FAIL** (C-R230-01, Low) | see §RT-LESSONS |
| RT-SABA | **PASS** | see §RT-SABA |
| RT-SCREEN | **PASS** (with notes N3/N4 for B) | see §RT-SCREEN |
| G230-3 (browser) | **PASS**, both viewports | `c-round-230/out2/g230.json`, `out2/g-*-lab.png`, `out2/g-*-guard.png` |
| STUDIO-SMOKE-230 (browser) | **PASS**, both viewports, 2 runs | `c-round-230/out/g230.json`, `out2/g230.json`, `out*/smoke-*-{before-drag,after-drag,after-undo}.png` |
| Gate rows (full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke) | **gate**: not run by C (speed rule); there is no diff | `gates/gate-round-230.json` (root) |

## G230-3: auth guard (fresh anonymous context per viewport; script `c-round-230/g230.cjs`)
| Check | 1440×900 | 1280×720 |
|---|---|---|
| `/studio-lab` HTTP 200, workspace (`arrangement-ruler`) shown, demo badge "Demo collection — no sign-in required" | yes | yes |
| `localStorage.auth_user` | null | null |
| `/studio/middle-east`: "Sign in required", `audio[src]` count, workspace | yes, 0, absent | yes, 0, absent |
| `GET /api/studio-token?product=middle-east&file=stem1.wav`, no header | 401 `{"error":"Please sign in to access Studio."}` | 401 |
| same, `Authorization: Bearer fake.c230.token` | 500 `{"error":"Unable to prepare Studio access"}` (no `:5199` mock, as in round 229) | 500 |
| token issued | **no** | **no** |
| page errors | 0 | 0 |

Attempt note: in run 1 (`out/`), the 1440 guard hit the 90 s "Add enabled" wait on the first cold load of the session (dev-server warm-up). That attempt was environment-invalid and is kept as evidence. Run 2 (`out2/`) passed at both viewports, and run 1's 1280 guard also passed.

## STUDIO-SMOKE-230: real-mouse fade drag, Undo, CALM-2a state
Steps: fresh `/studio-lab` → Add (first demo item, Middle East preview) → click the clip body (select) → `page.mouse` down on `arrangement-clip-fade-in-handle` → move +60 px, then +120 px in 24 steps → up → export WAV → Ctrl+Z → export WAV.

| Measure | 1440×900 (runs 1, 2) | 1280×720 (runs 1, 2) |
|---|---|---|
| CALM-2a: `arrangement-loop-strip` text / `arrangement-bars-ruler` text | "" / "" | "" / "" |
| Loop button `title`, disabled | `Loop: make a time selection first (Ctrl+L)`, true | same |
| handle opacity / cursor (selected) | 1 / ew-resize | 1 / ew-resize |
| `data-fade-in` before → mid-drag → after | 0.000 → 1.500 → 3.000 | 0.000 → 1.500 → 3.000 |
| Undo title after the add → after the drag | `Undo: Add — Middle East — საჯარო preview (Ctrl+Z)` → `Undo: Fade In (Ctrl+Z)` | same |
| after Ctrl+Z: fade-in, Undo title, clips | 0.000, back to `Undo: Add — …` (exactly one entry popped), 1 clip | same |
| WAV (24-bit, 48 kHz, stereo, 4,864,896 frames = 101.352 s = the dialog's "01:41.352") RMS 0–50 ms / 50–100 ms / 1–2 s, faded | −100.89 / −52.88 / −27.52 dB | same |
| same, after Undo | −65.21 / −21.59 / −21.54 dB | same |
| page errors | 0 | 0 |

So the fade reaches the rendered audio (about 6 dB down at 1–2 s inside a 3 s fade, silent at the start), and Undo restores the unfaded audio. The mid-drag value shows a live preview, and the drag commits a single history entry ("Fade In").

## RT-NUM: every number recomputed
Method: I copied the 11 analysis scripts to `c-round-230/rt/`, rewrote `b-round-229/` to `c-round-230/rt/`, and copied `backlog-before-230.json` there (same sha256). I ran them from the loop root with `python3 -I`. I did **not** run `update-backlog.py`, so `backlog.json` was not touched by C. All outputs are byte-identical to B's (`cost.txt`, `retro-numbers.txt`, `fails-detail.txt`, `gate-reviews.txt`, `classify.txt`/`-out.json`, `window-findings.txt`, `l28-status.txt`, `experiments.txt`, `window-mediums.txt`, `deferred-totals.txt`, `open-medium-plus.txt`, `cost-rows.json`), with one explained exception: `collect.txt`/`rounds-215-229.json` round 229 `b_cost` is now 13.2 (was 0). That is because `b-round-229-result.json` (the round-230 planning) was written after B ran. The retro excludes it by design (§0 l.11), and `cost.py` uses the shifted file, so `cost.txt` is identical.

Matched: 15 rounds; C PASS/FAIL 13/2 (215, 216); bV false none; gate published 12 (217–225, 227–229), skipped 2 (215, 216), failed 1 (226); B/A/C/total $147.49/$120.58/$89.76/$357.83; FAIL rounds $49.07; median $22.52; top-5 226 36.49, 216 32.54, 223 32.37, 224 30.50, 218 28.92; phase medians B 10.58 (5.78–13.00), A 7.60 (0.53–13.80), C 5.40 (3.95–11.74); top-6 phases as listed; A avg FAIL/PASS 6.65/8.25; re-do 217 13.48 + 225 20.19 + 227 16.60 = $50.27; C bugs 22 (medium 2, low 20); gate review 63 items in 12 reviews (`ls gates/round-2{15..29}/review.md` = 12: 217–225, 227–229); open_findings window 42 (C 19, gate 17, A 3, B 2, root 1) and categories as §4; deferred window 25 (gate 14, A 6, C 4, B 1); closed_findings_d29z163 window 9 (3 Medium); deferred total 353 (11 closed/folded, 342 other); open Medium+ 3 (all pre-window); C STOP cost 223 $7.65; experiments: 0 window status findings (only C-R215-02 and GATE217-S4 match the regex), docs 169–178 l.4 (doc 170 stale), no "timed out" in gates 215/216/226 logs; retro-215 comparison figures (11/4, $28.54, $10.49, ~$12, 4 re-do $101.46) are in `retros/retro-215.md` l.27–51, 136; rounds per stage match the `tasks/round-215..229.md` titles; `grep -rn 'In Progress (stage' docs/implementation` at HEAD = 170, 176, 178.

## RT-CAUSE
- 215: `c-round-215.json` C-R215-01 says "only 10 review.md exist … The 69 is correct". Matches.
- 216: `c-round-216.md` l.22 is `DOC-216 FAIL (Low, C-R216-01)`; `b-round-216.md` l.13 is the mem-polls deterministic label FAIL; l.41 is the quoted ruling, verbatim. C-R216-02's expected/actual text names "task §2.5" and "the frozen pattern", so the "ambiguous task text" class is supported.
- gate 226: `verify.log` l.2000 is the `track-layout.test.tsx` "reserves the selected-clip row…" FAIL; `tasks/round-227.md` l.75–80 holds the D1 fact, and l.80 is quoted verbatim.
- STOP 223: `a-round-223.md` l.3–4 quote is verbatim. (The backlog id is `C-R223-01-GATE214-S2-PREMISE`; the retro shortens it to C-R223-01. This is unambiguous.)
- §4.2: `tasks/round-229.md` §0.2 l.75 has the vacuous T10 note. §4.4: `c-round-229.json` notes C-N229-S3-METHOD (Escape). SABA-B-7 claim: `grep -c` gives 0 and 0.
- Inferences are labelled (*დასკვნა* in §3; "Hypothesis"/uncertain where used).
- Info N1: §2 l.55 calls GATE217-S4 "doc 162 text, not status". The finding is on doc 162 **l.4** (it dropped an "open: C-R205-01" note), so it is status-line text, though not a stale status. The count 0 is right; the wording is loose.

## RT-IDS
- SYS-5 `closes`: C-R229-01 (deferred_low_polish, open, alias GATE229-S1; there is no separate GATE229-S1 entry), ROOT-R66-L3 (deferred, open; "disabled reason only in title", disabled-reason half), C-R130-ADD-DISABLED-NO-REASON (deferred; Add disabled with no reason). All exist, are open, and are in class. `sys5-disabled-grep.txt` count 41 reproduces at HEAD.
- Queue: `… SABA-B-8-CALM-STUDIO, SABA-B-7-ENVELOPE-DB, STUDIO-PERFORMANCE …`. The scope matches the policy: bottom −∞, the same curve when scheduling (no exponential to 0), dB readout, stored points keep their gain, and the four C checks verbatim. Severity Medium.
- Doc 170 at `5da0f50` l.4 = `**სტატუსი:** In Progress (stage 1 of 2; C round 218 PASS)`. `c-round-221.json` taskStatus PASS; `tasks/round-221.md` = PERF-16b-ii.
- L7: `retro_runs[1]` status starts "done: C round 216 RT-FIX-216 PASS"; `c-round-216.json` `passed` contains `RT-FIX-216` (that round's taskStatus was FAIL on other rows).

## RT-LESSONS
- 52 records (`awk NR`), `wc -l` 51 (no final newline; see N2), ≤ 60. Exactly three `## ` parts (l.5, 29, 43).
- Diff vs `b-round-229/lessons-before-230.md`: the header, L23, L26, L28, L29, the new L41/L42 and removed blank lines differ. L38 differs only by the missing final newline (N2); its content is unchanged.
- Cited sources: B-R228-VACUOUS-DELETED-EXPORT, B-R229-DOC170-STATUS, C-N229-S3-METHOD, C-R216-01 and B-R229-SABA-B-7-UNRECORDED exist in `backlog.json`; each says what the lesson claims (see RT-CAUSE/RT-IDS).
- **C-R230-01 (Low), FAIL:** amended **L26** says the doc's `## ` headings "contain every `## ` heading of `docs/implementation/TEMPLATE.md`, in order (`grep -n '^## '` on both)". TEMPLATE.md has 8 `## ` headings, and the first is `## Prompt — როგორ ვწეროთ Implementation Doc` (l.3), which is authoring instructions. `grep -rl '^## Prompt' docs/implementation | grep -v TEMPLATE` gives 0 of 178 docs. Applied as written, the check fails every compliant doc, so the lesson is not correctly checkable. This independently confirms A's lesson feedback (`a-round-230.md`). Fix: exclude the `## Prompt` section (the seven headings from `## კონტექსტი` to `## TODO / შემდეგი ნაბიჯები`, in order as a subsequence).
- L28 (amended): workable for C. M is determinable (doc 170 → `c-round-221.json` PASS for the final stage), and the grep is concrete.
- Consults: none run (optional). The lessons were judged directly.

## RT-SABA
- `retro-230.md` §12 heading says "only proposals, nothing applied", and every item is phrased as a proposal or pending. `screen-review-230.md` l.5 says nothing is implemented before Saba answers. SOURCE-SCOPE shows no rule or config file changed.
- SABA-B-8 → L39 (lessons l.138) and `tasks/round-226.md` l.93 `### 1.1 Why we missed it`. SABA-B-7 → L41 (l.139) and L42 (l.140) exist.

## RT-SCREEN
- All 4 PNGs and `screen230.json`/`screens.mjs` exist; I opened every PNG.
- SR-230-1…10 are each visible as described: footer "Clip: … source offset" line (1440 with details open; 1280 collapsed); the name repeated in the details header and body; "The source file stays unchanged"; the Zoom group (ZOOM, slider, 40 px/s, ↔, ↶ Zoom, Fit), with the 1280 toolbar wrapped to 2 rows (Follow/Zoom/Export on row 2); the demo chip; "Synthetic demo · ღამის პულსი" on the synthetic cards; "Active track: Music · playhead 00:00.000"; "Music · active"; the new clip off-screen at 01:43.352 with no scroll; status "added to the Music track", first-run status "Choose a track and add a sound".
- `backlog.json` → `screen_review_candidates`: SR-230-1…10, all `awaiting_user`.
- Probe: `node ../tmp/studio-real-loop/b-round-229/screens/probe-active-track.mjs` from `store/` → output byte-identical to `probe-active-track.txt` (label "Stems — set as the active track", pressed true, status "… added to the Stems track at 00:00.000."). Evidence: `c-round-230/probe-active-track.c.txt`.
- None of the candidates is in CALM-2b/CALM-3 scope (backlog SABA-B-8 entry, task §4) or on Saba's policy keep-list.
- N3 (info for B): SR-230-9 says the view shows "~0:22" at both sizes; at 1280×720 the ruler ends near 0:18. The core claim (clip off-screen, no auto-scroll) holds at both.
- N4 (low/info for B, disclosure): SR-230-1, -4, -7 and -8 re-open elements that `docs/technical/studio-real-workspace/calm-studio-review.md` already assessed: l.44 selected-clip line **keep** (the only contextual line); l.50 "40 px/s" **keep** (maybe hover); l.46 "Active track…" and "· active" **keep both, reword the library line** ("Adds to Music at 00:00.000"); §4 "must not remove: … Active track indication". SR-230-8 (visually hide "· active") goes against that recommendation. These are design-review recommendations, not on Saba's policy keep-list, so this is not a row FAIL. But the packet asks Saba to decide without showing him the earlier advice. Add a "previously reviewed" column or note before he answers.

## Notes for B
- N2 (info): `lessons.md` has no final newline (B's edit), so `wc -l` gives 51 while there are 52 lines, and L38 differs byte-wise. Restore the newline when L26 is corrected.
- N5 (info): the round-1 1440 guard timeout (cold dev server, 90 s) is environment-only; it did not repeat.
- Root pre-push review / publication checkpoint: none newer for this round; nothing to publish from `store/`.

## Ableton conformity
Not applicable (RETRO round; no Ableton parity claimed). The fade-handle smoke is a regression check, not a parity claim.
