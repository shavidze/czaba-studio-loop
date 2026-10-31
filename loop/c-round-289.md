# C round 289: FIX-PD-1b (F7 English demo names + SR-230-6 group heading)

**Verdict: PASS.** `browserVerified` = `realVerified` = true. No bugs.

## Environment and method
- `env-status.json`: round 289, store 200. Dev :5173 serves A's live tree; HEAD is `c345def`.
- A's tree has 4 modified files and 2 new ones.
  - The live-tree sha256 was recorded at the start (`c-round-289/sha-start.txt`) and was unchanged at the end, 6/6.
- **HEAD comparison:** a `git archive c345def` → `/tmp/c289base` dev server on :3289, with its own Vite `cacheDir` `/tmp/c289head-vitecache` (L38).
  - The `cacheDir` was set in the scratch `vite.config.ts` only.
  - The first untimed warm-up timed out (cold start, environment-invalid, kept). The next probe ran fully.
- **Browser:** Playwright Chromium. Each row ran at 1440×900 and 1280×720, in a new context with empty storage (0 cookies, `auth_user` null). Probes waited for `Demo collection ready` (L48).
- **Audio:** an init-script tap connects an AnalyserNode to every node that connects to the realtime `AudioContext` destination. The offline export graph is not tapped.

## Rows
| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS | `claims-289.sh` on the `c345def` scratch = `claims-289-output.txt`. The only differences are K1/K2: the scratch has no `.git`. `git rev-parse` in `store` shows HEAD `c345def`, and the K2 baseline was clean at A's start. L29 grep over the task (`l29-grep.txt`, 24 hits): every untagged hit is a heading, a grant row, a spec snippet, an instruction or an outside-store doc reference, not a fact about current store code. Note C-R289-INFO-01: `b-round-288/sketch.patch` is missing |
| SOURCE-SCOPE | PASS | `git status` shows only the §4 paths. `source-diff.txt` matches §3.1 (the 9 literals) and §3.2 (context span removed; contiguous-run `useMemo`; `role=group` + `aria-labelledby` plain `div` heading with the exact classes; the one byte-exact `biome-ignore`; ≥ 2 runs gate; global index for `isFocusTarget`). The `strings.test.ts` array becomes `[]`. `studio-lab-demo.test.ts` changes only the l.248 pin, plus DL-EN, which asserts the full 9-row `[id, title, shortTitle]` table and the Georgian regex on title, shortTitle and collectionLabel. No assertion was removed (L4). The new `library-group-heading-ui.test.tsx` queries by role, accessible name and existing testids, never by class (L12). LG6 was read: it asserts the full `title`s and the short shown titles. Frozen files are unchanged. The `Fragment` delta is accepted: an unused import fails Biome |
| TYPECHECK | PASS | `npm run typecheck` rc 0 (`typecheck.log`) |
| UNIT | PASS | The 15 files: **15 / 255 passed** (`unit.log`). DL-EN and LG1–LG7 are present by name in the verbose output |
| UNIT-MUTANTS | PASS | C's own `mutants-c.py` on the rsync scratch `/tmp/c289mut` (`mutants-c.json`, `mut-M*.log`). M1 (≥ 1 run) → LG3, LG4, LG5 red. M2 (context span back) → LG1, LG5. M3 (merge by first appearance) → LG7. M4 (heading `tabIndex={0}`) → LG2. M5 (`bass` back to Georgian) → DL-EN. The scratch sha was restored and the live tree never changed |
| B-NAMES | PASS | `probe/main-a.json`, both viewports. The 9 `title`s are exactly the §3.1 titles; Soft impact and Slow rise are unchanged. The shown short titles are `Full mix, Pulse, Bass, Pad, Melody`. The tree shows `Synthetic demo · Night Pulse`. **0** Georgian lines and **0** Georgian `title`/`aria-*`/`alt`/`placeholder` attributes, against HEAD 8 lines + 10 attributes (C's scan; B counted 9) |
| B-GROUPS | PASS | Exactly 2 groups, named `CZABA public previews + synthetic SFX` then `Synthetic demo · Night Pulse`. 0 context spans. Headings are not truncated, at 59.5 / 43 px. Option heights: previews 66.5, SFX 47.25, synthetic 47.25 (HEAD 80.25). In-group gaps are 4 px; the boundary gap is 51. `scrollHeight` 614 (HEAD 669). The values are identical at 1440 and 1280. The ARIA snapshot (`probe/drag-a.json`) shows `listbox "Sounds"` → 2 `group`s → options. Headings are DIVs with no role and `tabIndex` −1 |
| B-KEYS | PASS | ArrowDown ×8 / ArrowUp ×8, 250 ms apart. The visit order is `middle-east … stem-lead` and back, never a heading. Every step is `:focus-visible`, with the ring `outline 1px solid rgb(201,164,106)/0.8`. All 17 steps lie inside the list's client box at both viewports (HEAD is identical) |
| B-STATES | PASS | (a) 5 ids, 0 groups. (b) `Pulse Bass Pad Melody`, titles `Night Pulse · <part>`, 0 groups. (c) `zzz` → the empty output, 0 groups. (d) `night` → 5, 0 groups. (e) `bass` → `demo-stem-bass`, 0 groups. (f) `synthetic` → 9, 2 groups. Single-run lists render their options as direct listbox children |
| B-JOURNEY | PASS | The status equals the expected sentence byte-for-byte. Undo shows `Undo: Add — Night Pulse · Bass`, with title `… (Ctrl+Z)`. The clip is `Night Pulse · Bass`; the footer reads `Clip: Night Pulse · Bass · start 00:00.000 · length 00:16.000 …`. Position goes 00:00.000 → 00:01.471 after 1.5 s of Play. **Real output:** analyser RMS 0.045–0.053 (peak ≈ 0.09) during playback, and 0 after Stop. 0 Georgian after add, in the export dialog and at the end. **Export WAV** `czaba-studio-lab.wav`: RIFF/WAVE, PCM 24-bit, 2 ch, 48 kHz, 768000 frames = 16.000 s (the clip length), peak 0.217, RMS 0.080, 99.99 % non-zero samples. It is **bit-identical to the HEAD export** at both viewports. Shots: `journey-added-*`, `journey-playing-*`, `export-dialog-*` |
| B-SCREEN | PASS | Fresh load, `All`, empty search, default width. Count = titles + context + headings: **HEAD 9+5+0 = 14 → A 9+0+2 = 11**. No new element outside the list. Screenshots `shots/all-{head,a}-*.png` and `list-{head,a}-*.png` |
| G289-AUTH | PASS | `probe/auth-dev.json`, `shots/auth/`, both viewports, 0 cookies. `/studio-lab` shows the workspace and the `Demo collection — no sign-in required` badge, with `auth_user` null. `/studio/middle-east` shows `Sign in required`, with 0 `audio[src]` and no workspace. The token API returns 401 with no header and 403 `Unable to verify ownership` with a fake bearer (standard mock running). Without the mock, the fake bearer gets 500 with no token (fails closed) |
| DOC-216 | PASS | l.4 is byte-exact `**სტატუსი:** Completed (C round 289 PASS)`. The 7 H2s follow TEMPLATE's order. The cited ids DL-EN, DL-VAL, ST47, ST51 and LG1–LG7 exist in the tests; M1–M5 are in A's `a-round-289/mutants.sh` and `mutate.py`, with logs `M1..M5.log` |
| gate | not claimed | The full suite, build, Biome, `verify` and `test:e2e:smoke` are gate rows |

**BLOCKED (backend unavailable in cloud):** the buyer-side purchased view (one run, no heading). Unit LG5 carries it.

## Neighbouring behaviour
- **Drag:** dragging `Pad` from inside a group onto the Music lane adds `Night Pulse · Pad` at 00:01.000, at both viewports (`probe/drag-a.json`, `shots/drag-*`).
- Keys, search, the preview title, the notice, and the first-run and tempo text are covered above. Uncaught page errors (`pageerror`): 0. Console messages were not captured.

## Ableton (reported separately)
- **CZABA requirement:** met.
- **Ableton conformity:** a deliberate difference. The group heading is listed in task §2.
- Live's search-result location behaviour stays **unconfirmed** until LIVE-MEAS-BROWSER-SEARCH-LOCATION. C does not claim "Live does the same".

## Signals for B (no bugs)
- **C-R289-INFO-01:** `b-round-288/sketch.patch`, cited in §5, does not exist.
- **C-R289-INFO-02:** with a single-collection search from All (`bass`), the card shows only `Bass`. Under `All` the tree lists both collections, so it does not say which one `Bass` belongs to. The only cues are the option's `title` tooltip on hover, its accessible description `Night Pulse · Bass` for screen readers, and the preview panel's full title after selection. This matches B-STATES (e) exactly, but it is weaker than the §1 promise "you can always see which collection it belongs to". It could join SABA-Q-FIXPD1B-NAMES / SR-275-6 as a question (`shots/search-bass-a-*.png`).
- A's review Lows (L1 remount, L2 stale ST47/ST51 names, L4 Mtavruli) go to B for triage. No browser symptom of L1 was seen.

## Cleanup
- The HEAD server :3289 and C's mock :5199 are stopped. The mock was down at the start.
- :5173 still returns 200.
