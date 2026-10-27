# C — Round 200 (RETRO) verification — verdict: **FAIL** (RT-CAUSE; both browser rows PASS)

Role C, 2026-10-27. Task `current-task.md` (D-29z165). Evidence under `c-round-200/`.

## Summary
| Row | Result |
|---|---|
| SOURCE-SCOPE | **PASS** at start and end: HEAD `5b1a2bb`, clean, frozen list OK, `.claude`/`CLAUDE.md` diff empty |
| RT-NUM | **PASS** (one observation, OBS-C200-ROUNDING) |
| RT-CAUSE | **FAIL**: C-R200-01 (Medium). Rounds 127 and 178 are filed as "A self-check" misses, but the A and C reports show A detected the problem and stopped or reported it before handover |
| RT-IDS | **PASS** (one Low wording nit, C-R200-02) |
| RT-LESSONS | **FAIL** on substance for L14 (and partly L12): the cited evidence contradicts the premise. Form is fine: 31 lines, 3 parts, 22 lessons (10/5/7), every cited id exists |
| RT-SABA | **PASS** |
| R200-P1 (browser) | **PASS** at 1440×900 and 1280×720 |
| G200-3 (browser) | **PASS** at 1440×900 and 1280×720; premium auth not bypassed |
| Gate rows | `gate`: full vitest, typecheck, build, Biome, npm run verify, PROD-MP3-UNVERIFIED. Not run by C |

browserVerified = realVerified = **true**: both browser rows ran at both viewports. Ableton: no new behaviour, no parity claimed.

## SOURCE-SCOPE (start)
HEAD 5b1a2bba0c98dcc86564be8441fbdf989cc8f7b8, `git status --short --untracked-files=all` empty, `sha256sum -c --quiet b-round-199-r200-tree-sha256.txt` silent, rc 0 (`out/source-scope-start.txt`).

## R200-P1 (browser) — PASS at 1440×900 and 1280×720
- Harness `p1/c200p1.cjs` = round-180 `c180.cjs` with the K8 playhead masks **removed**, the playhead moved by a ruler click to 10.000 s (aria-valuenow 10, x 512 → 912), the smoke step dropped and a body scan added. Brass = R−B ≥ 45, DPR 2.
- Invalid run (1): `c200p1-1440-1`: cold Vite first load ("Invalid hook call" + 1 hydration replace). Replaced by `c200p1-1440-2`, which was clean.
- CC-R35 boxes (import full/compact, Add enabled/disabled; rest/hover/press): 0 brass, 0 masked, both viewports.
- 5 ghost states: 0 brass at both viewports. The only masked pixels are the K7 selected clip on the no-room ghost (18 144 / 17 892), which matches round 180.
- Ring strips and hint boxes (file drag over Video and Music), **unmasked for the playhead**: strip 16 brass px top and 16 bottom; hint 640 (1440 video and music), 480 (1280 video) and 632 (1280 music). **All of them** are in the playhead column x=912–913.5 (2 css px). 0 elsewhere (`out/p1-colsplit.json`). The Music strip and hint keep only the K7 selected-clip mask (344 / 26 832 at 1440, 26 488 at 1280), the same allowance as round 180.
- Unselected clip bodies (`p1/p1b.cjs`): the default scene has 0 clips. 3 Library clips were added by keyboard (Music 0 s, Stems 4 s, SFX 9 s).
  - Playhead at 10 s: Music and Stems are unselected and crossed by the playhead. Brass sits only in the playhead column (576/568 px), 0 elsewhere.
  - SFX (last added, still selected) is the allowed selection brass.
  - Second state: a stems clip click moves the playhead to 19 s (x=1272) and selects Stems. SFX unselected: 0 brass. Music: column only.
- Overview (whole `arrangement-overview`): 512 brass px, all inside the overview-playhead column, 0 elsewhere, at both viewports in both states.
- Positive control: playhead line 3148/2964 brass px (10 s) and 3176/2992 (19 s), all in its own column.
- Network: 0 bad, only known noise; 0 auth/cookies (anon).
- Superseded, not invalid: `c200p1b-*-1` and `c200p1bsel-*-1` scanned only `arrangement-overview-frame`. Reruns `*-2` add the whole `arrangement-overview`, and their clip-body numbers are identical.
- **OBS-C200-OVERVIEW-FRAME (info, harness):** `[data-testid=arrangement-overview-frame]` is the visible-window box, not the whole overview strip.
  - In the default zoom they coincide. In the `sel` state at 1280 the frame was 148 px wide (x 300–448.8), and the overview playhead at x 449 sat outside it.
  - Round 199's RV-TOKENS overview scan used the frame testid. Next regression round: scan `[data-testid=arrangement-overview]`.
- Evidence folder note: `rvstatic.cjs` was copied and not run, then removed. No rich-scene scan was done this round.

## G200-3 (browser) — PASS at both viewports
The mock ran on :5199 under its own PID 5329 (`mock.log`, health ok, 8 products) and was stopped afterwards. Fresh contexts, no credentials (`out/g200-3.json`, `tools/g200-3.cjs`):
- `/studio-lab` at 1440 and in a separate 1280 context: workspace shown, demo badge "Demo collection — no sign-in required" shown, auth_user null, 0 cookies.
- `/studio/middle-east` at 1440 and 1280: "Sign in required", no workspace, 0 `audio[src]`.
- `GET /api/studio-token` with no header → 401 "Please sign in to access Studio."; with fake Bearer → 403 "Unable to verify ownership". The mock log shows `/api/downloads auth=yes 401`. No Set-Cookie.
- 0 forbidden requests, 0 Authorization headers from the page, 0 pageerror, 0 hydration. Premium auth is not bypassed.

## RT-NUM — PASS
- I ran copies of B's read-only scripts (`collect`, `cost`, `fails`, `fails-detail`, `classify`, `retro-numbers`, `deferred-list`) from the loop root, with outputs redirected to `c-round-200/rt/`. I did **not** run `update-backlog-1/2.py` or `update-fs.py` (they mutate state). B's `b-round-199/*.json|txt` files are unchanged (`rt/b-files-before.sha`).
- These outputs are identical to B's: `cost-rows.json`, `classify-out.json`, `deferred-list.txt`, `fails.txt`, `fails-detail.txt`, `retro-numbers.txt`.
- `rounds-123-199.json` differs only in round 199: `b_cost` 0 → 11.92, `b_hours` 0.35, `b_attempts` 1. That is exactly the delta the retro discloses (§2 note). The cost totals are unchanged because `cost.py` shifts B by one round.
- **cost.py** stdout: 77 rounds; B 598.25 / A 547.08 / C 490.09 / all 1635.42; FAIL rounds [127, 142, 143, 145, 149, 151, 154, 158, 178, 189, 192, 193, 194, 196], cost 331.75; PASS 63; median 21.12; top-5 191 42.71, 196 38.73, 142 31.64, 134 29.94, 197 29.17; gate 59/18; periods 19/1/417.79, 43/8/865.97, 15/5/351.66. All of these match `retro-200.md` §1–2.
- **retro-numbers** stdout: bugs low 48 / medium 12; critical 0, high 0; browserVerified=false only in round 192; the skipped list; deferred 275 / 10 / 265; window 99 = C 38, gate 43, A 17, B 1; all-origin "other" 27; A average 8.50 FAIL vs 6.80 PASS; B 4.65–12.64; C 123–126 1.51–14.48, A 0.31–0.39; C 192 3.22. All match the retro, including its disclosed post-update values (275/10/265, "other" 27).
- **Independent cross-checks** (my own code, not B's scripts):
  - `c-round-N.json` taskStatus gives PASS 63 / FAIL 14, with the same 14 rounds.
  - `gates/gate-round-N.json` status gives published 59 / skipped 18, with the same list. Rounds 123–126 are "no real changes".
  - Medium entries are 12, and the unique ids are 10: C-R196-02 is counted in 196, 197 and 198.
  - `readFileSync` appears in 19 test files.
  - The FAIL share is 0.203 (~20%).
- **§5/§7 numbers:**
  - "backlog 1.8 MB / feature-status 0.56 MB": `b-round-199/backlog-before-r200.json` is 1 825 597 B and `feature-status-before-r200.md` is 562 912 B at analysis. The live files are 1 837 442 / 565 462 B. Match.
  - "ruling-only FAILs 143, 151; 142 partly": `tasks/round-152.md` is "V-2a closure — B rulings on C-R151-1/2/3". Ruling-only, consistent.
- **C-R200-02** (count): see RT-IDS. It is a number mismatch against `backlog.json`, recorded once there.
- **OBS-C200-ROUNDING (info):** summing the raw unrounded `total_cost_usd` gives B 598.26, A 547.11, all 1635.46, FAIL 331.77, and 417.84 for 123–141. These differ by $0.01–0.05 because `collect.py` rounds each phase before `cost.py` sums. Every retro figure equals its named source exactly, so this is not a FAIL. B may add "sum of per-phase values rounded to cents".

## RT-CAUSE — FAIL (C-R200-01, Medium)
I checked each of the 14 rows against `c-round-N.json` `bugs[].actual` (and against `failed[]` for round 192). The quoted facts in the "what happened" column are accurate for all 14. The values check out: 15 granted tests, 4.32 and 1.03, the Instrument Sans " · ", l.912, app.css l.305–314, CLS 0.6158/0.2727/0.0198, PurchaseHeader K0.4, 3.41:1 and the ~1.6 → ~1.2 border, 1.21:1, 1.45:1. The 194 phrase "14 lines below the tag" is the C report's own heading (`c-round-194.md` l.63). The 189 inference is labelled, and so is the taxonomy table as a whole.

**What fails is the origin class of two rows. It feeds §1's headline (7 B + 4 A), the §3 grouping, the §3 taxonomy and lesson L14:**
1. **Round 127 → "A self-check / missing test (127: granted tests not run)".** The evidence says otherwise. `a-round-127.md` l.3: "STATUS: STOP — B ruling needed". Its §3 "BLOCKER P1: two buttons with the accessible name 'Close'" lists the 15 failing tests and their cause: the frozen `Modal.tsx` ✕ plus the §1.1 glossary term "Close". `c-round-127.md` l.3: "This is A's P1, and A stopped for a B ruling." A did run the granted tests and reported them red. The cause is a spec conflict (a glossary term against a frozen file) plus a STOP with no ruling: B-side, the same class as 142/143.
2. **Round 178 → "A self-check, which a browser or test would have caught".** `a-round-178.md` l.43–49: "DEVIATION 2 / BLOCKER: two protected tests go red because of W2. Not fixed (outside ownership); B to rule … W2 … is mandatory in §1, so these failures are forced. Both files are protected." A caught it before handover. The cause was B's task, which made W2 mandatory while it protected the two selector tests, and the deferred A-R147-REVIEW-L2. The row's own class cell ("deferred Low → Medium", L8) is right. Its §3 grouping into the A bucket is not.
- Corrected split, which is my reading of the cited evidence: B dispatch/spec 9 (127, 142, 143, 145, 151, 178, 192, 193, 194), A self-check 2 (154, 158), unmeasured contrast 2 (149, 196), first visit 1 (189). The §1 headline "4 A could have caught before handover" and the taxonomy entry "missing test: 127 (granted tests not run)" are therefore stated as fact but contradicted by the evidence.

## RT-IDS — PASS (C-R200-02 Low wording; strictly an RT-NUM count, but it concerns the SYS-3 entry, so it is listed here)
- Every id that SYS-1/2/3 claims exists in `deferred_low_polish` and is open, Low, and in its class: GATE146-S4-LRS3-CLASSNAME-PINS, GATE164-OV1-FRAGILE, GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR, GATE81-S2-UM8-SOURCE-TEXT, C-R127-L1f-SELF-COMPARE-TESTS, RETRO200-CLASS-SELECTORS, GATE107-S1-MARKER-FLAG-HELD-ENTER, A-R107-SWEEP-HELD-ENTER-TOOLBAR, ROOT-R65-L5 and A-R165-IME-ENTER. The rejected and candidate ids (GATE165-SR-REPEAT, GATE106-S1-…, GATE107-S2-…, A-R105-REVIEW-2-…, GATE75-S5, GATE110-S3) also exist and are open.
- Code at HEAD (grep):
  - **SYS-1:** every cited site matches. library-preview:241 `span.text-foreground`; detail-panel-strings-ui:239/277 `span.text-dim`; detail-panel-polish:369 `span.font-sans`; library-row-strings-ui:252 `span.font-mono`; LRS3 `className).toBe` at l.236/251; OV1 source text at studio-theme-obsidian l.228–235; UM8 source text at track-group-mix-ui l.641–645; the panel-radius positional selector (l.519); export-cancel l.211–215; export-wav l.170/594.
  - **SYS-2:** `preventRepeatedEnterKeyDown` is defined at ArrangementTransport l.122 and used at l.170/185/210/303. The Play/Split/Loop/Follow/Zoom buttons at l.132/196/222/239/283 have no onKeyDown. `handleFlagKeyDown` in the marker row has no Enter branch with a repeat guard.
  - **SYS-3:** `grep isComposing app` (non-test) gives 0 hits. The Enter checks are at TempoRow:201, MarkerRow:836, GroupHeader:246 and DetailPanel:371/464, as cited. `status-announcement.ts` l.18–20 suppresses repeats during a gesture, as claimed.
- **C-R200-02 (Low):** retro §6 SYS-3 says "+ ორი ჩაუწერელი საიტი" (two unrecorded sites). `backlog.json` SYS-3 `also_fixes_unfiled` lists **three**: GroupHeader:246, DetailPanel:371 and :464. That is 3 sites in 2 files. Make the count match.

## RT-LESSONS — FAIL (substance; part of C-R200-01)
- **Basis of the FAIL:** the three literal checks pass (≤ 60 lines, three parts, every cited id exists). The row also requires each lesson to be concrete, checkable and evidenced, and task §5 names a wrong lesson as the main risk. L14's cited evidence contradicts its premise, so I fail the row on substance, not on form.
- Form is fine: 31 lines (≤ 60), exactly the three required parts, 22 lessons (B 10, A 5, C 7, as §7 says), each with an observable check. All 31 cited ids or rounds exist (grep in backlog and c-round reports).
- **L14** ("Run every granted test file, not only the new tests … Evidence: C-R127-01 (15 granted tests red at C)"): the cited evidence shows A **did** run them and reported 15 red as a STOP (`a-round-127.md` l.3, §3). The first clause has no supporting evidence. The second clause (unique accessible names in a dialog) is supported. Its lesson for B is "a glossary term must not collide with a frozen component's label", which belongs in part B.
- **L12** (A part: "before removing or renaming a class token, grep tests and fix every hit in the same round", cited with C-R178-BADGE-SELECTOR): in round 178 A did grep and find the hits. They were in files the task protected, so A could not fix them (`a-round-178.md` l.43–47). The prevention evidenced there is on the B side: grant or unprotect the selector tests when a mandatory class change hits them. The "no styling-class selectors" rule itself stands (L8 and SYS-1).
- A's lesson feedback (a-round-200.md, L14 vs the speed rule) is a separate clarification for B, not a C finding.

## RT-SABA — PASS
§8 title: "მხოლოდ წინადადებები, არაფერი გამოყენებულა" (proposals only, nothing applied). Items 1–3 are phrased "დაემატოს" (should be added); item 4 is a runner proposal for root. `git diff HEAD -- .claude CLAUDE.md` is empty, and the full frozen list is OK at the end.

## SOURCE-SCOPE (end) — PASS
2026-10-27T01:27:57Z: HEAD 5b1a2bb, 0 status lines, `sha256sum -c --quiet` rc 0 (`out/source-scope-end.txt`). Mock stopped (:5199 → 000). C changed nothing in `store/`.

## For B (round-201 planning)
- **C-R200-01:**
  - Correct retro-200 §1 (7/4 → 9/2), the §3 grouping, the taxonomy row for 127 and the 178 bucket.
  - Rewrite L14 (keep the dialog-unique-name clause; drop or re-evidence "run every granted test").
  - Move the B-side lesson from 127/178 into part B ("a mandatory change that breaks frozen or protected tests → grant or rule in the task").
  - L12 and L14 are substantive lesson changes, so the next C re-checks those lines only.
- **C-R200-02:** fix the SYS-3 unrecorded-site count (2 → 3).
- **OBS-C200-ROUNDING:** optional wording.
- None of this blocks SABA-B-4 stage 2 as round 201 (§4 outcome table).
