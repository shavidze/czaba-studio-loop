# A — Round 19 report: C-R18-01, Georgian detail labels + `w-72` info column (D-29j)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-11 · Task: `current-task.md` (round 19)

This is A's evidence, not a verdict. **No acceptance ID is claimed as PASS**; C decides.

> STATUS: A done. Design (d) is implemented (five texts + `w-72`). The §1.4 stop condition did not fire. Everything is pending C.

## 1. Pre-flight gate

**Assumptions**
- Only `ArrangementDetailPanel.tsx` changes in `app/`: five text nodes and one width token (`w-56` → `w-72`). Nothing else.
- `w-72` is not in the compiled CSS before the edit; Tailwind v4 compiles it once the source uses it. Pre-code it is measured as inline page-state `style.width = '288px'` (D-29j).
- The tests are appended to `detail-panel-polish.test.tsx`; the 13 existing tests stay byte-identical.
- Doc 027 gets a status update and a (d) section, all "pending C".

**Baseline before the first edit**
- `sha256sum -c b-round-18-tree-sha256.txt`: 50/50 OK (`a-round-19/gates/sha-start.txt`).
- `a-round-19/gates/frozen-start.txt`: 47/47 OK (every entry except the three owned files).
- Backups `a-round-19/bak/*.base.*`: panel `9ba5fa3b…`, polish test `58cbe600…`, doc 027 `d1691838…`, all equal to the b-round-18 list.

### 1.4 Measurements at 288 px (before any source edit)

Setup: `a-browse.json`, server `127.0.0.1:5173`, C's `lay11`, script `a-round-19/scripts/m19.js`, driver `a-round-19/measure.sh`. Raw: `a-round-19/runs/pre-*.txt` and `pre-*-{single,group}.json`. Page state: the five new texts plus inline `style.width = '288px'` on the info column, restored afterwards; `restored: true` and `fonts: loaded` on all 8 rows. The W480 deselect problem from round 18 is avoided by a click on an empty SFX lane point before each single selection (`desel … hdr=არაფერია არჩეული`), so every row's `header` matches its label.

| Viewport / lib / state | Panel | Today (w-56): lines · scrollH/clientH · waveform | 288 + new texts: lines (oh) · truncate oh · scrollH/clientH · waveform |
|---|---|---|---|
| 1440 / 288 / single | 144 | 11111 · 107/107 · 704 | 11111 (16×5) · 16,16 · 107/107 · **640** |
| 1440 / 480 / single | 144 | 11111 · 107/107 · 512 | 11111 (16×5) · 16,16 · 107/107 · **448** |
| 1440 / 288 / group | 144 | 1112 · 107/107 · 704 | 1112 (16,16,16,32) · 16 · 107/107 · **640** |
| 1440 / 480 / group | 144 | 1112 · 107/107 · 512 | 1112 · 16 · 107/107 · **448** |
| 1280 / 288 / single | 142 | 11111 · 105/105 · 544 | 11111 (16×5) · 16,16 · 105/105 · **480** |
| 1280 / 480 / single | 142 | 11111 · 105/105 · 352 | 11111 (16×5) · 16,16 · 105/105 · **288** |
| 1280 / 288 / group | 122 | 1112 · 106/85 · 544 | 1112 · 16 · 106/85 · **480** |
| 1280 / 480 / group | 122 | 1112 · 106/85 · 352 | 1112 · 16 · 106/85 · **288** |

- Max-content of the `დასაწყისი … · სიგრძე …` line: 259.81 px (today's `start …` line 220.94) → 28.19 px reserve in 288.
- Range labels vs the 80 px input column: `საიდან, წმ` 64.47, `სადამდე, წმ` 74.13 (today 46.91 / 42.64).
- Stop conditions: none fired (no extra line, truncate rows 16, no scroll increase, waveform ≥ 288 ≥ 128, labels ≤ 80).
- **Price:** waveform −64 px everywhere.

**Smallest version:** six changed lines in the component; no class, constant or style added.

**Files**
- `ArrangementDetailPanel.tsx`: the six §2 edits.
- `detail-panel-polish.test.tsx`: append R19-U tests.
- Doc 027: status, (d) section, TODO.
- This report and `a-round-19/`.

**Success commands:** §7 list. Expected: polish file 13 + new green; frozen tests green; vitest ≥ 996 + new; tsc 0; build OK; Biome 0 errors on owned paths and `./app`; three guard mutations each make a test fail.

## 2. The change and why it is the smallest

- `ArrangementDetailPanel.tsx` has exactly six one-line hunks. The full diff is in `a-round-19/diff-round19-final.txt`.
  - l.294: `w-56` → `w-72`;
  - l.305 and l.327: `start` → `დასაწყისი`;
  - l.313: `offset` → `წყაროდან`;
  - l.348: `start, წმ` → `საიდან, წმ`;
  - l.364: `end, წმ` → `სადამდე, წმ`.
- Only the width token changed among the classes. There is no arbitrary value, inline style, constant or test id. Both `aria-label`s are byte-identical.
- One width token removes all three round-18 stop reasons (D-29j). No smaller change makes the 259.81 px line fit.

## 3. Files actually changed (a subset of §3.2)

| File | Change | sha256 at end |
|---|---|---|
| `app/components/arrangement/ArrangementDetailPanel.tsx` | §2, six lines | `f28e069f…` |
| `app/lib/arrangement/__tests__/detail-panel-polish.test.tsx` | +3 tests, added after l.360 with nothing removed (13 → 16) | `b85c3c96…` |
| `docs/implementation/2026/quarter-IV/027-studio-lab-detail-panel-polish-14b.md` | status line, a new (d) section and the TODO lines | `d2e4e8df…` |
| `tmp/studio-real-loop/a-round-19.md`, `a-round-19/**`, `a-browse.json` | report, runs, gates, shots, backups, guard | — |

**Confirmations**
- **No round-6..18 file was reverted.**
  - `gates/frozen-start.txt` and `gates/frozen-end.txt` are both 47/47 OK against `b-round-18-tree-sha256.txt`, with the three owned files excluded.
  - A full `sha256sum -c` at the end gives 47 OK. The 3 owned files show FAILED, which is expected.
- **Base backups:** `bak/*.base.*` match the b-round-18 hashes (`9ba5fa3b…`, `58cbe600…`, `d1691838…`).
- **`Header.tsx`:** `git diff` against HEAD is empty. `git diff --stat cc1e531` is +21/−0.
- **R9-D3 and the round-18 logic are untouched.** The panel diff contains only the six hunks above.
- **The 13 existing polish tests are byte-identical.** `head -n 360` of the base and current files match under `cmp`, and the diff removes 0 lines.
- **No instrumentation is left.** The grep (`console.|debugger|window.__|data-c16|m19`) finds 0 matches in both owned code files. There are no temp files in `app/`.
- **git status is unchanged in scope.**
  - `gates/git-status-end.txt` has 42 lines, the same set as C's round-18 end.
  - `git diff --stat` covers 18 files, all §3.1 baseline M files.
  - These have no status: `app/styles`, `root.tsx`, `routes/`, `components/animations`, `components/ui`, `public`, `package.json`, `studio-lab-demo.ts`.
  - The `library.ts` diff is empty.
- **Protected files:** 4/4 OK.
- **Foreign files:** `.claude/agents/frontend-architect.md` and `.codex/agents/frontend-architect.toml` were not read and not touched. They are reported to root.

## 4. Command tails (final tree, after the review fixes; full files in `a-round-19/gates/`)

```
$ sha256sum -c ../tmp/studio-real-loop/b-round-18-tree-sha256.txt   (before the first edit)
50 OK
$ npx vitest run detail-panel-polish detail-panel render-budget track-layout
      Tests  78 passed (78)          (16 + 24 + 31 + 7)
$ npx vitest run app/lib/arrangement
 Test Files  25 passed (25)
      Tests  535 passed (535)
$ npx vitest run                      (started 04:25:05, after the regex fix)
 Test Files  57 passed (57)
      Tests  999 passed (999)        (996 + 3; the sfx-library flake did not recur)
$ npx tsc --noEmit
exit 0, no output
$ npx biome check <2 owned code files>
Checked 2 files in 26ms. No fixes applied.
$ npx biome check app/lib/arrangement app/components/arrangement
Checked 56 files in 102ms. No fixes applied.
$ npx biome check ./app
Checked 323 files in 224ms. No fixes applied.
Found 218 warnings.  Found 1 info.   (exit 0; 0 errors; none in owned files)
$ npm run build
built in 2.29s                        (w-72 present in build/client/assets/app-*.css)
$ git diff --stat
 18 files changed, 2857 insertions(+), 385 deletions(-)
$ git diff app/components/layout/Header.tsx
(empty)
$ node protected-baseline check
app/lib/__tests__/download-routes.test.ts OK
app/routes/account.downloads.tsx OK
app/routes/api.studio-token.ts OK
app/routes/studio.$productId.tsx OK
```

**/check**
- `biome check --write` ran only on the two named owned code files. Both runs applied no fixes.
- `npm run check` was not run, because `./app` has 218 warnings outside my files.
- `npm run format` was never run.

## 5. A's browser runs (evidence, not a verdict)

- The runs used the final code only. No store file was edited while they ran.
- Raw output:
  - `runs/post-1440x900.txt` and `runs/post-1280x720.txt`: R19-D2, 8 rows;
  - `runs/post-checks.txt`: R19-D1 and R19-A.
- Every row has `restored: true` and `fonts: loaded`.

### R19-D2 (after the code change, with `w-72` in the source)

Every row is identical to the pre-code 288 px record.

| Viewport / lib / state | Panel | lines (oh) | truncate oh | scrollH/clientH | info / waveform |
|---|---|---|---|---|---|
| 1440 / 288 / single | 144 | 11111 (16×5) | 16,16 | 107/107 | 288 / 640 |
| 1440 / 480 / single | 144 | 11111 | 16,16 | 107/107 | 288 / 448 |
| 1440 / 288 / group | 144 | 1112 (16,16,16,32) | 16 | 107/107 | 288 / 640 |
| 1440 / 480 / group | 144 | 1112 | 16 | 107/107 | 288 / 448 |
| 1280 / 288 / single | 142 | 11111 | 16,16 | 105/105 | 288 / 480 |
| 1280 / 480 / single | 142 | 11111 | 16,16 | 105/105 | 288 / 288 |
| 1280 / 288 / group | 122 | 1112 | 16 | 106/85 | 288 / 480 |
| 1280 / 480 / group | 122 | 1112 | 16 | 106/85 | 288 / 288 |

Range labels: `საიდან, წმ` is 64.47 px and `სადამდე, წმ` is 74.13 px, against the 80 px input column.

### R19-D1

Setup: 1440/288 and 1280/480, single and group. The single state is a real `$B click` on the music clip header. The group adds a Ctrl-click on the stems clip.

- **Info labels:** single `["დასაწყისი","სიგრძე","წყაროდან"]`, group `["დასაწყისი","სიგრძე"]`.
- **Range labels:** `["საიდან, წმ","სადამდე, წმ"]`.
- **aria-labels:** `["range-ის დასაწყისი (წამი)","range-ის დასასრული (წამი)"]`.
- **No Latin label:** `/\b(start|offset|end)\b/` on the `innerText` of `arrangement-detail-content` is false in all 4 states.
- **Single-state `innerText`:** `ღამის პულსი · სრული მიქსი ხაზი მუსიკა დასაწყისი 00:00.000 · სიგრძე 00:16.000 წყაროდან 00:00.000 წყარო უცვლელი რჩება საიდან, წმ სადამდე, წმ მონიშვნა`.
- **Footer (format unchanged):** `კლიპი: ღამის პულსი · სრული მიქსი · start 00:00.000 · length 00:16.000 · source offset 00:00.000`.
  - In the group state the footer shows the last-clicked clip (`… პულსი · start 00:02.000 …`). This is existing behaviour.

### R19-A

Setup: 1440×900, `lay11`, music clip. Each input got a real click and was focused and enabled (`focused=true disabled=false`) before `$B type`.

1. Typing 3.5 / 7.25 and a real click on `მონიშვნა`:
   - status `მონიშვნა: 00:03.500 — 00:07.250 · მუსიკა.`;
   - the fields show `3.5` / `7.25`.
2. Typing 20 / 21 and a real `Enter`:
   - status `მონაკვეთი კლიპის საზღვრებში უნდა იყოს; დასასრული დასაწყისზე მეტი უნდა იყოს.`;
   - the range stays `00:03.500 — 00:07.250`;
   - the fields keep `20` / `21`.
3. The Undo label stayed `Undo: დამატება — Soft impact` throughout.

### Shots (`a-round-19/shots/`)

- `detail-labels-1440-288.png`: single state, taken before typing.
- `detail-labels-1440-288-group.png`: taken after the R19-A invalid Apply. The fields show 20/21 and the status shows the invalid-range message.
- `detail-labels-1280-480.png`: single state. Viewed by A: every label is on one line and the waveform box is 288 px.

## 6. New tests (`detail-panel-polish.test.tsx`, +3) and the guard proof

| Test | What it checks | Why |
|---|---|---|
| (d) single | exact ordered info labels `დასაწყისი/სიგრძე/წყაროდან`; exact range labels; both exact aria-labels; content `textContent` has no `/\b(start\|offset)\b/i` and no `end, წმ` | R19-U (d), single |
| (d) group | the same checks after `selectClips(['music-1','hit-1'])`, with info labels `დასაწყისი/სიგრძე` | R19-U (d), group |
| width | the class tokens of `getByTestId('arrangement-detail-content').firstElementChild` contain `w-72` and not `w-56`; no test id added | R19-U width |

**Guard proof** (`a-round-19/guard-proof.txt`)
- This is the final run, on the final tests.
- The pre-guard copy is `guard/ArrangementDetailPanel.preguard.tsx`. After each mutation the file was restored, and `cmp` confirmed it identical.
- The first run, before the regex `i` fix, is kept as `guard-proof-initial.txt`. Its outcome is the same.

| # | Mutation | Failing tests |
|---|---|---|
| 6 | l.305 `დასაწყისი` → `start` | (d) single |
| 6b | l.364 `სადამდე, წმ` → `end, წმ` | (d) single and (d) group |
| 7 | l.294 `w-72` → `w-56` | width |
| 6c (extra) | l.327 group `დასაწყისი` → `start` | (d) group |
| 6d (extra) | l.313 `წყაროდან` → `offset` | (d) single |

With no mutation: 16/16 pass.

## 7. code-reviewer (actual subagent): both summaries

**Review 1** (full diff): *"The code change is correct and stays exactly in scope. The new tests catch real regressions … All remaining findings are about doc 027 wording: nothing Critical or High, two Medium, the rest Low or Info. Score: 9/10."*

| Finding | Action |
|---|---|
| M1: in doc 027 the round-18 sections contradict the new (d) section (the title, and "mutation 6 does not apply" under ტესტირება) | §3.2 allows edits only to the status line, the (d) section and the TODO lines. So a note now opens the (d) section. It names the stale round-18 sections and what replaces them. Rewriting those sections or the title is for B (§8) |
| M2: the doc said the browser measurement was complete, but only pre-code runs existed | The post-code runs have since been done (§5). The doc points to `runs/post-*` and `shots/` and marks them "verdict არა" |
| L1: "13 ტესტი" in შეცვლილი ფაილები is stale | The (d) section lists the round-19 files with "13 → 16". The note covers this too |
| L2: the gate numbers have no round label | Added "Round 19-ის gate-ები (A)" in the (d) section |
| L3: the regex is case-sensitive | **Fixed:** `/\b(start\|offset)\b/i` |
| Info: `toBeTruthy` after `getByTestId` is redundant | Left as is. It documents the group state and does no harm |

**Review 2** (fix delta): *"All five first-pass findings are fixed or justified within §3.2. The `i` flag causes no false failure. The doc's claims match the evidence files. Two Low provenance nits remain, and no new issue was introduced. Score: 9/10."*

| Low | Action |
|---|---|
| L-a: the full vitest, tsc, Biome and build runs predated the regex fix | They had already been re-run after the fix: full vitest 999/999 (started 04:25:05), tsc 0, Biome and build (§4) |
| L-b: the doc cites `guard-proof.txt`, which held the pre-fix run | `guard-proof.txt` now holds the final run. The first run is `guard-proof-initial.txt` |

`design-philosopher` was not invoked. It is optional here, and D-29i already fixes the texts.

## 8. Deviations

1. **Doc 027's title and round-18 sections were not edited**, because they are outside §3.2.
   - A note in the (d) section marks them as round-18 state.
   - If B wants them relabelled, B can allow it as a one-line follow-up.
2. **Extra guards 6c and 6d** were added after review 1. They prove that the group `start` and the `offset` label are caught as well.
3. **The measurement driver deselects before each single selection**, with a click on an empty point of the SFX lane.
   - This avoids round-18 deviation 5.
   - Every raw row's tag now matches its `header`.
4. **The test file changed after the first guard run** (the regex `i` flag only). The guards were re-run on the final file (§6).
5. **A `python` heredoc I started for a report edit hung.**
   - It is my own background process, and it was left to time out by itself.
   - Nothing else was started or stopped, and the dev server was not touched.

## 9. Not ready (acceptance IDs)

- **None from A's side.** R19-D1, R19-D2, R19-A, R19-U and R19-Doc are all **pending C**. No PASS is claimed.

**For C (exact next checks)**
1. R19-D1 and R19-D2:
   - at 1440×900 and 1280×720, libraries 288 and 480, single and group;
   - compare against §5; the waveform must be within ±1 px of 640 / 448 / 480 / 288.
2. R19-A: the button Apply, then the invalid Enter; the range stays unchanged.
3. R19-U:
   - the 16 tests;
   - guards 6, 6b and 7, plus 6c/6d if wanted;
   - round-18 M1 and M5 as a quick check;
   - the frozen tests `detail-panel`, `render-budget` and `track-layout`: sha unchanged and green.
4. R19-Doc: doc 027's status line, (d) section and note; no unverified PASS.
5. The §6.2 adjacent regressions:
   - R8 detail quick;
   - R18-B: `21.875%` / `23.4375%`, alpha 0.3;
   - R18-W;
   - R16-H1/F1 at 1280: panel 142, footer 69, body Δ0;
   - R9-D3/RF7-P2, with Play started from Home.
6. G19-1..3.

**Carried, unchanged** (`root-pre-push-review.md`, `publication-checkpoint.json`, task §6.5):
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*`;
- portable instruction-file paths;
- the export hard-clip at 0 dBFS (R13-M4, SRW-13);
- the final commit/push only after everything is done;
- the uncommitted round-6..19 tree;
- the `Modal.tsx` focus gap;
- GA sends `scroll` with consent denied;
- the two foreign agent files;
- A round-17 deviation 4;
- the fake Bearer gets a 500, but no token is issued;
- the CDP allowlist denies `Input.dispatchMouseEvent`;
- the publication-checkpoint requirements (library/stems/scrollbars, T12, the final commit/push).

**Not this round:**
- C-R6-02, C-R8-01, RF7-3 and C-R12-01;
- M1/L8, L2/L3 and the A round-11 follow-ups;
- the `ArrangementLane.tsx:661` reason text;
- the 21 regression-debt IDs;
- SRW-13..20, SRW-21 and T12;
- the Tech Lead manual checks, including **R19-T**.
