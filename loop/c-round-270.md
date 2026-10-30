# C round 270: GATE266-S1 + B-R269-DETAIL-ALLTRACKS-DROP + GATE266-S4 / B-R266-CLIPS-SPLIT-COPY

**Verdict: PASS.** `browserVerified` = `realVerified` = true, with 0 bugs and 3 info notes.
- Env: `env-status.json` (store 200, round 270).
- HEAD: `f6ebd2d`. The worktree diff equals A's diff (`c-round-270/a-diff.patch`), and the source did not change during C's phase.
- Browser: Playwright Chromium, a fresh anonymous context per recipe, at 1440×900 and 1280×720.
- Page errors: 0. Console errors: 0 (the expected cart/backend errors are excluded).
- For HEAD comparisons, C used its own scratch copy (`git archive HEAD`) on port :5183. It has been stopped.

## Rows
| Row | Evidence | Result |
|---|---|---|
| SOURCE-SCOPE | `git status`: the 6 granted app/test files plus the untracked doc 201 | PASS |
| HUNK-SCOPE | 3 hunks: the import, the 2 display lines and the keep branch before `const target = selection.clip;`. No class, testid, `disabled` or JSX change | PASS |
| CLAIMS | K1–K11 re-run at HEAD (`claims.txt`); all match, including K10 16/18 → now 22/20. The L29 scan found no untagged code fact that the K-blocks do not cover (§5.1 line refs = K5 output) | PASS |
| TESTS-TARGETED | the 7 §5.3 files: 197/197 (`vitest.json`). Slowest: NS5 2024 ms (< 2500). New rows 106–246 ms | PASS |
| TEST-REWRITES | The partial-overlap test: 2 removed `expect`s are replaced on the same subject by 3 (0.5/4; a re-set to new values → 1/4; the same values re-set → typed 3 kept). BS2/ST6/ST7/NS2 change literals only | PASS |
| MUTANTS (C scratch `/tmp/c270-new`, 4 files, 115 tests) | unmutated 0 red. M-CLAMP-DISPLAY → DP1, DR1, DR2, partial-overlap. M-NO-KEEP → DP1, DR1, DR2, DR3, DR6. M-LANE → DR3. M-RAW-TEXT (start only, and both) → DR6. M-STR-DONE → BS1, BS4, ST6. M-STR-CLIPS → BS2, BS5, ST7. M-STR-TITLE → NS2, ST6. C's extra C-M-KEEP-SETS (`setTimeRange` in the keep branch) → DR1, DR2, DR3, DR6. C's extra C-M-NO-ONCLIP survives (see INFO) | PASS |
| DP-BROWSER | past-start: fields `6.25`/`12.5` = readout 00:06.250—00:12.500. Past-end: `12.5`/`115.102` = 00:12.500—01:55.102. Both viewports. HEAD showed `10`/`12.5` | PASS |
| DP-ENTER | Enter in From, Enter in To, and a Set click: the readout, the lane overlay (`music` 6.250/12.500 and 12.500/115.102) and the fields are unchanged. Status exactly `Time selection: 00:06.250 — 00:12.500 · Music.` (and `00:12.500 — 01:55.102 · Music.`). `activeElement` = `arrangement-detail-start` after Enter (L47). A retyped `6.250` also keeps the selection | PASS |
| STATUS-CLOBBER | status read 1 s after Enter and after Set: same applied text | PASS |
| DP-EDIT | From = 11 → 00:11.000—00:12.500, status "… · Music.". Then From = 9 → status = the `rangeInvalid` text, selection still 11–12.5 | PASS |
| DP-INSIDE | 11.5/14, Enter → unchanged, "· Music." | PASS |
| DP-ALLTRACKS | inside → Ctrl+Shift+L → Enter: the readout keeps "all tracks", 4 lane overlays (video/music/stems/sfx 11.5–14), status `Time selection: 00:11.500 — 00:14.000 · all tracks.` (also at 1 s) | PASS |
| SPLIT-COPY | A: `Clip split at the time selection; the part inside it is selected.`. The ring confirms that the 10–12.5 part is selected, which is true. G: starts 10/11.25/20, `Split at the time selection; the 2 clips inside it are selected.`. 11.25 and 20 are selected, and 20 was not cut, so "clips" is true. Title `Split clips at the time selection (Ctrl+E)`. HEAD had the old strings | PASS |
| SPLIT-BOX | status box 1256/1280 and 1416/1440, one line (h 16), `scrollWidth` = `clientWidth`, not truncated. Identical to HEAD with the longer old text | PASS |
| SCREEN-BUDGET | past-start + open panel: current = HEAD (1440: 125 line boxes / 62 rows; 1280: 113 / 54) | PASS |
| G270-AUTH | `/studio-lab` anonymous: 4 lanes, no `auth_user`, no cookies. `/studio/middle-east`: "Sign in required", 0 `audio[src]`, 0 audio/token requests. `/api/studio-token`: 401 with no header; 500 "Unable to prepare Studio access" with a fake Bearer; no token | PASS |
| DOC-201 (grant row 7; not a §8 id, listed under `checks` in the JSON) | l.4 byte-exact; the 7 TEMPLATE headings in order; every cited id exists (BS3 is cited correctly as the existing test) | PASS |
| gate rows | full vitest, build, Biome, verify, e2e smoke | `gate` (not claimed) |

## Ableton conformance
- Time selection gesture: not applicable (unchanged).
- From/To fields: not applicable (no Live counterpart; CZABA-only).
- Split wording: closer to Live's "Split Clip at Selection" (§42.16, B's citation; C did not re-fetch it).
- CZABA requirement: met. The invariant "Enter/Set never changes the selection silently" held in every recipe.

## Info for B (not bugs)
- **INFO-C270-MUTANT-NO-ONCLIP.** If the `rangeOnClip` term is removed from the keep condition, all tests still pass. This only matters for a selection elsewhere whose start and end equal this clip's bounds exactly. Candidate guard row.
- **INFO-C270-BS3-ID.** The task named the new row "BS3", but BS3 already existed; A renamed it BS5. This is a planning id collision.
- **INFO-C270-ONE-FIELD-EDIT** (reviewer M-1, confirmed). On a past-edge selection, editing one field gives an announced `rangeInvalid`. This follows the contract and is parked under LATER-DETAIL-LANE-RANGE-EDIT (Saba).
- A's L-3 (an all-tracks range anchored on another lane) was not tested this round. It is HEAD behaviour and remains B's candidate.

## Evidence
`c-round-270/`:
- `ui.json`, `split-selection.json`, `mutants.txt`, `vitest.json`, `claims.txt`, `a-diff.patch`;
- scripts in `scripts/`;
- screenshots `pastStart-*`, `pastEnd-*`, `alltracks-*`, `split-G-{current,head}-*`, `auth-*`.
