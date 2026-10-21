# C — Round 49 verification: SRW-14 stage 2 (FB-13), D-29z14 — snap for trim edges and clip-body ranges, Alt bypass/enable, GROUP-LANE-REFUSAL-TEXT, LANE-RANGE-OVERLAY-60

Verifier: C (independent) · 2026-10-16 21:11 → 2026-10-17 10:55 +04 · Task: `current-task.md` (Round 49)
Evidence: `c-round-49/runs/`, `c-round-49/shots/`, `c-round-49/gates/`, `c-round-49/tests/`, tools in `c-round-49/tools/`, checkpoint `c-round-49/checkpoint.md`.
I re-ran every check myself and did not rely on A's numbers. I made no edits to app source, no commits, installs or deploys, and did not start or stop the dev server.

**taskStatus: PASS.** Every acceptance ID I ran passed. Two new **Low** findings are test gaps; the behaviour itself is correct in the browser. They go to B and do not block the round.

## 0. Environment

- **HEAD:** `05e1bc075456c35dde33c1eecbcfc2f676af9ef4` at the start (21:11) and at the end (10:55).
- **`/studio-lab`:** 200 throughout. The dev server is root's; I did not touch it.
- **node.exe:** 35 → 57 over the session. Each run file records its own count.
- **Machine suspend.** The machine was suspended for about 13 h while `npm run verify` was running (21:13 → 10:30). Vite reports the build as `built in 791m 46s` for that reason. verify still exited 0, and every test and assertion completed.
- **REAL-mouse (PW).** Drags used standalone Playwright (`store/node_modules/playwright`, installed chromium, fresh context, no credentials). This is the pending deviation **GSTACK-NO-MOUSE**. It is never called gstack.
- **gstack (REAL click / press / select):**
  - The gstack CLI daemon failed to start once ("Server failed to start within 15 s", 21:13) during G49-3. Under the harness rule I then used the approved `server-node.mjs` fallback, started from `tmp/studio-real-loop/` with `BROWSE_PARENT_PID=0`:
    - anonymous: state `c-round-49/anon/c-browse.json`, PID 56072, log `runs/daemon-anon.log`;
    - main: state `c-round-49/c-browse.json`, PID 9912, log `runs/daemon-main.log`.
  - I stopped both myself with `taskkill /T`; neither is running now. I never ran `$B restart`.
- **Setup.** Layout L49 = L47 (video at 0, music 7–23, Soft impact on SFX 4–6, 40 px/s). It is built by the round-31…34 setup chain evaluated in the page; this is SYNTHETIC setup only. `window.__c` is provided by that chain and is used only for reads, plus one `__c.place` for the stem in the group fixture (SYNTHETIC, labelled).

## 1. G49-2 — tree integrity: **PASS**

- **Status.** `git status --short` shows exactly the 7 paths of §3.1, at the start and at the end.
- **Frozen list.** `sha256sum -c b-round-48-r49-tree-sha256.txt` → 0 non-OK (399 OK), at the start and at the end.
- **Protected files:** 4/4 OK at the start and at the end.
- **Snapshots.** `SHA256SUMS.txt` in the snapshot folder is 5/5 OK, so the diff baseline is genuine.

## 2. R49-S — static: **PASS**

The full diff is in `gates/snap-diff.txt` (copy in `runs/r49s-diff.txt`). It was made with `diff -u --strip-trailing-cr` against `b-round-48-r49-snapshots/`, and `git diff` agrees.

- **`grid.ts`:** one inserted export, `resolveSnapStep` (11 lines). Every existing line is byte-identical. It implements the §0.1 table exactly: a number with no bypass gives `snapSeconds`; bypass gives `null`; `null` with no bypass gives `null`; `null` with bypass gives `gridSeconds ?? null`.
- **`selection.ts`:** exactly the 3 spots.
  - The union gains `'before-start'`. Biome's line width wraps the union to several lines, and the LF format check is clean.
  - The message text is byte-exact to §0.4.
  - The member loop checks `trackId === undefined` → `'out-of-range'` first, then `start < -ARRANGEMENT_EPS` → `'before-start'`.
- **`ArrangementClip.tsx`:**
  - the import;
  - the optional `gridSeconds?: number` prop, with no default;
  - `step = resolveSnapStep(snapSeconds, gridSeconds, event.altKey)`, read on each move; `snapStep = timeLocked ? null : step`;
  - group refusal: `'before-start'` or `'out-of-range'` → `publishLaneGhosts(gesture, [])`, while the other refusals are unchanged;
  - trim: `requested = step === null ? roundTime(edge+delta) : snapTimeToGrid(edge+delta, step)`, with the clamp and blocked logic unchanged;
  - range: both ends snapped, then clamped; zero width with a step → `setTimeRange(null)`.

  The hunks lie at l.7, 83, 226, 357, 391–404, 467–470 and 490–496. `beginGesture` (l.254), `finishGesture` (l.504) and `DRAG_THRESHOLD_PX` (l.23) have no hunk.
- **`ArrangementLane.tsx`:** one prop line, `gridSeconds={gridSeconds}`, and one class, `bg-foreground/60` → `/30`.
- **Doc 044:** l.4 and l.63 only.
  - Both lines are exact to §0.5.
  - The new l.63 path exists: `tmp/claude-cloud-r47-quarantine/tmp/studio-real-loop/root-r47-review-findings.md`, 3412 B.
- **Line endings: no churn.**
  - CRLF: `grid.ts` 74/74, `ArrangementClip.tsx` 659/659, `ArrangementLane.tsx` 922/922, doc 044 106/106.
  - LF: `selection.ts` (221 lines, 0 CRLF), the new test (644 lines) and doc 045 (118 lines).
- **Banned content.** I grepped the diff and the new test for `any`, `@ts-ignore`, `as` assertions, `//` comments, hex/rgb colours, fake timers and snapshots: 0 hits. The new test has 22 `it`, and the only new export is `resolveSnapStep`.
- **Doc 045** has every TEMPLATE section, one Mermaid diagram, the §4.8 Ableton table (two rows marked დაუდასტურებელი), and a TODO listing stages 3–5 and R49-T.

## 3. G49-1 — gates: **PASS**

| Gate | Result | Evidence |
|---|---|---|
| tsc | exit 0 | `gates/tsc.txt` |
| full vitest (inside `npm run verify`) | **83 files / 1418 tests passed, 0 failed** (1396 + 22) | `gates/verify.txt` l.1379–1380 |
| build | client and SSR built; `verify exit 0` | `gates/verify.txt` (the 791 min is the suspend) |
| `npm run verify` | **exit 0** | `gates/verify.txt` |
| Biome `./app` (read-only) | 8 errors / 218 warnings / 1 info. All 8 errors are `format` errors on exactly the baseline list (ArrangementClip, ArrangementLane, StudioWorkspace, auth-bugs.test, grid.test, render-budget.test, grid.ts, auth.ts) | `gates/biome-app.txt`, `gates/biome-app-errors.txt` |
| `biome lint` on the 4 owned sources + the new test | 0 diagnostics, exit 0 | `gates/biome-owned.txt` |
| `biome format` (stdin) on LF copies of the 5 code files | no changes in any of them; the CRLF errors are EOL-only | `gates/biome-format-lf.txt` |

- **Frozen suites (§4.7):** all of them are part of the 83-file full run, which had 0 failures. I did not run them as a separate focused batch.
- **C-R48-01:** did not reproduce (render-budget green).

## 4. G49-3 — anonymous workspace and purchase protection: **PASS**

I used gstack with the fallback daemon in a fresh anonymous state, at 1440×900. Output: `runs/g49-3-fallback.txt`. The first attempt with the CLI daemon is kept in `runs/g49-3.txt`; it was incomplete because the daemon died.

- **`/studio-lab` direct:**
  - the workspace is shown;
  - `auth_user=null` and the cookie is empty;
  - the badge reads `დემო კოლექცია — ავტორიზაცია არ სჭირდება` (`shots/anon-direct.png`).
- **Via the header link "Studio Lab":** `/studio-lab`, workspace shown, anonymous.
- **Requests from the session (REAL add, then Space play/stop):**
  - **0** requests to `studio-token`, `recording-*`, `/api/download` or R2 (`bad=0` in all 3 network logs);
  - no `Authorization` header (`anon-session-req.json` lists only a GA beacon, with `auth:null`);
  - the only other request is the allowed `GET localhost:5199/api/cart`.
- **Token request:** anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → **401** `{"error":"Please sign in to access Studio."}`.
- **`/studio/middle-east`:** `Sign in required`, with no workspace (`shots/anon-studio-me.png`).
- **Premium auth is not bypassed.**
- The fake Bearer request still returns 500. This is the known root item; it is unchanged.

## 5. R49-U — unit tests and mutations: **PASS** (two Low test gaps → B)

- **New file:** 22/22 green, both in verify and in my scratch base run.
- **Red run, reproduced by C** (`runs/red-run-c.txt`): the 4 snapshot sources plus the final test in my scratch give **16 red / 6 green**. The green set is exactly {SE2, SE5, SE10, SE14b, SE15, SE18}, and SE1 fails on the missing export. This matches A's `red-run-final.txt`. The extra greens beyond §2.2 are SE5 and SE14b, which A explains (§2). The explanation holds: SE5's fixture gives 7.05 with or without snap (see (n) below).
- **Mutation setup:**
  - scratch: `c-round-49/scratch/mut/` (a copy of `app/` plus a `node_modules` junction, created with `mklink /J` and removed with `cmd /c rmdir`; `store/node_modules` is intact, 618 entries);
  - tool: `tools/mutate.cjs`, which requires an exact single match and is CRLF-aware;
  - runner: `tools/run-mut.sh`; output: `runs/mutations.txt`.
- **Each run** covers `grid-snap-edit` plus my supplement `tests/c49-supplement.test.tsx`, which has 3 cases:
  - **C49-N1:** snapped left trim where the line lies past an off-grid source start;
  - **C49-N2:** the range reappears after a zero-width move;
  - **C49-N3:** Alt with Snap on gives free range ends.

  On the real code the base run is 25/25 green.

| # | Mutation | Killed by (A's file) | C supplement | Verdict |
|---|---|---|---|---|
| (a) | trim ignores the step | SE3, SE4, SE6 | — | killed |
| (b) | range ignores the step | SE7, SE8, SE9, SE13 | N2 | killed |
| (c) | range anchor not snapped | SE7, SE8, SE9, SE13 | N2 | killed |
| (d) | zero-width null branch removed | SE9 | — | killed |
| (e) | click seek snapped | SE10 | — | killed |
| (f) | `resolveSnapStep` ignores bypass | SE1, SE11, SE12, SE12b, SE13, SE14 | N3 | killed |
| (g) | Alt-enable uses a fixed 1 s | SE1, SE12b | — | killed (SE12 itself cannot see it at division 1; SE12b is the §2.2(g) 0.25 sub-case) |
| (h) | move reads `snapSeconds` | SE11, SE12, SE12b, SE14 | — | killed |
| (i) | Shift no longer wins | SE15 | — | killed |
| (j) | `before-start` folded into `out-of-range` | SE16, SE17, SE17b | — | killed |
| (k) | ghosts published for `before-start` | SE17, SE17b | — | killed |
| (l) | overlay `/60` | SE19 | — | killed |
| **(m)** C | `resolveSnapStep(null, g, true)` → `null` | SE1, **SE12**, SE12b, SE13 | — | killed |
| **(n)** C | trim snaps the **clamped** result (free clamp → snap → re-clamp) | **none** (SE5 stays green) | **N1** | killed only by C's case → **C-R49-01** |
| (p) C extra | `out-of-range` ghosts still published (only `before-start` suppressed) | **none** | none | **survives** → **C-R49-02** |

**Why SE5 cannot distinguish (n).** The model re-clamps every request. In SE5, snapping first gives snap(6.3) = 6 → clamp → 7.05. Clamping first gives 7.05 → snap → 7 → re-clamp → 7.05. Both orders end at the same place. The orders differ only when the request lies beyond the limit but the clamped limit rounds to the far side of it.

C49-N1 is such a fixture: source start 7.6, request 7.45, step 1.
- Real code: snap → 7 → clamp → **7.600**, blocked status.
- Mutation (n): clamp → 7.6 → snap → **8**, not blocked.

The real browser confirms the correct order (TR-LIMIT2, §6).

## 6. R49-TRIM — REAL-mouse (PW): **PASS**

Run file: `runs/r49-1440x900-TR-*.txt`. Each case reads `data-clip-start`, the model table (`__c.tbl`), the status line, the Undo title and the detail panel.

| ID | Steps | Result |
|---|---|---|
| TR-OFF | Snap off; Soft impact right edge −15 px | end **5.625**, start 4. One entry `Trim — მარჯვენა კიდე`; Ctrl+Z → 6 |
| TR-1 | header +12 px (Snap off) → 4.3 / end 6.3; REAL `g`; right edge −30 px (request 5.55) | during the drag and after it: end **6.000**, start 4.3 unchanged; status `Trim — მარჯვენა კიდე: start 00:04.300, length 00:01.700`; detail `სიგრძე 00:01.700`. Undo `Trim — მარჯვენა კიდე`; one Ctrl+Z → end 6.3 and Undo `კლიპის გადატანა`, so **one entry** |
| TR-L | Snap on; music left edge +24 px (+0.6 s) | start **8.000**, source offset **1.000** (detail `წყაროდან 00:01.000`), end 23. One entry |
| TR-LIMIT | Soft impact moved to 4.3 (source start 4.3, off-grid); Snap on; left edge −40 px (request 3.3 → line 3) | stays at **4.300** (the source start); status `Trim შეჩერდა: წყაროს დასაწყისი, მეზობელი კლიპი ან მინიმალური სიგრძე (0.05 წმ).`; no history entry (nothing changed) |
| TR-LIMIT2 (C extra) | moved to 4.6, free left trim to 4.9 (source start 4.6); Snap on; left edge −18 px (request 4.45) | stops at **4.600** with the blocked status. The snap-then-clamp order is confirmed in the real browser |
| TR-025 | division 0.25 (programmatic Playwright `selectOption`; the REAL select path is UI-5), Snap on; SFX right edge −16 px (→ 5.6); music left edge +17 px (→ 7.425) | end **5.5** and start **7.5**, both multiples of 0.25 |
| TR-1280 | TR-1 at 1280×720 (`runs/r49-1280x720-*.txt`) | identical: end 6.000, one entry |

## 7. R49-RANGE and R49-ALT — REAL-mouse (PW): **PASS**

Run file: `runs/r49-1440x900-RG-1_…_AL-MID.txt`.

| ID | Result |
|---|---|
| RG-1 | Snap on; body drag 7.3 → 9.6 → range **{7, 10, music}**. Overlay label `00:07.000 – 00:10.000 · 3.000 წმ`; detail panel `საიდან 7`, `სადამდე 10`. Undo unchanged, so **no history entry**. Same at 1280×720 |
| RG-CLAMP | drag 7.3 → x 1438 (beyond 23 s) → end **23** |
| RG-ZERO | 7.3 → 7.45 → `range null`, no overlay element, no status written. In the same drag, moving on to 9.6 brings the range back as {7, 10} |
| RG-CLICK | after a range: REAL-mouse click at 7.3 → range **null**, position **7.3** (`00:07.300`), unsnapped as specified (stage 3 later) |
| RG-OFF | Snap off → **{7.3, 9.6}** (free) |
| RG-USE | Ctrl+Shift+L → `allTracks:true`; all 4 lanes show `data-range-start/end` 7.000/10.000. The class is `bg-foreground/30` with **computed alpha 0.3** (oklab … / 0.3) and none is `/60` (`shots/RG-USE-all-lanes-*.png`). Ctrl+L → loop **7–10** (brace aria `Loop 00:07.000 — 00:10.000`), Undo `Loop შეიქმნა`. Ctrl+Z → loop null, range null, clips unchanged (this undoes the loop entry). Same at 1280×720 |
| AL-1 | Snap on; Alt held **before** mousedown; +30 px → **4.750** (free). Alt pressed **after** mousedown → also 4.750. Snap stays `on`. One entry |
| AL-2 | Snap off, division 1; Alt; +56 px (1.4 s) → **5.000**. Afterwards `data-snap="off"`; then a move without Alt of +15 px → 5.375 (free again) |
| AL-3 | Snap on; Alt; right trim −15 px → end **5.625** (free) |
| AL-4 | Snap off; Alt; range 7.3 → 9.6 → **{7, 10}**. Also Snap on + Alt → {7.3, 9.6} (bypass for range) |
| AL-MID | Snap on; a move without Alt at +15 px shows 4.000 (snapped). Alt down with no move: still 4.000 (Alt takes effect on the next move, as specified). Alt and +30 px → **4.750**. Release → 4.75; one Ctrl+Z → 4.0, so **one entry** |
| AL-FOCUS (record only) | After Alt release, a Space press via **PW keyboard** (CDP; not the gstack REAL path): playing true at pos 0.55, second Space → false; `document.hasFocus()` true, active element BODY. A CDP key cannot trigger Chrome's app-menu accelerator, so the real question stays **R49-T(2)** |
| SN-SHIFT (C extra) | Snap on; Shift+Alt after mousedown; drag onto the music lane → lane changes, start **4.3** unchanged (the time lock wins over Alt) |

## 8. R49-GROUP — REAL-mouse (PW): **PASS**

Run file: `runs/r49-1440x900-GR-*.txt`. Setup: Soft impact deleted (REAL), and the stem `პულსი` placed on stems at 0.4 via `__c.place` (SYNTHETIC setup). Music is selected with a REAL click and the stem with Ctrl+click (sel 2).

| ID | Result |
|---|---|
| GR-BEFORE, Snap off | music drag −292 px (−7.3 s), down one lane. Read before release: **ghosts `[]`**, status exactly `ჯგუფის ნაწილი დროის დასაწყისამდე (0) გავიდოდა — ხაზი არ იცვლება.` Commit: **music 6.6 / stem 0.0, lanes unchanged** (time only), Undo `გადატანა (2)`; one Ctrl+Z restores exactly, so **one entry** |
| GR-BEFORE, Snap on | same drag: ghosts `[]`, the same `before-start` text. After release: **no change** and Undo unchanged (**no entry**); status `გადატანა (2): ცვლილება არ მოხდა — ისტორია არ შეიცვალა.` |
| GR-OK | dx −12 px. Snap off: ghosts `6.700@stems`, `0.100@sfx`, and the lane move is committed. Snap on: ghosts **`7.000@stems`, `0.400@sfx`**, and it is committed (music→stems 7, stem→sfx 0.4). One entry each |
| GR-OVERLAP | Soft impact kept on SFX, so the stem → sfx target is occupied. **Blocked ghosts** are shown (`(blocked)` on stems and sfx), with status `აქ ადგილი არ არის`. Snap off commits time-only (−0.3); Snap on: no change, no entry. The path is unchanged |
| GR-OUT (C extra) | music + Soft impact grouped; music dragged one lane down, so the SFX member has no lane → `out-of-range`: **ghosts `[]`**, status `ჯგუფის ნაწილისთვის ხაზი არ არსებობს — მხოლოდ დრო იცვლება.` Snap off commits time-only +0.5; Snap on commits +1.0 (snapped). The text is now true. Behaviour is correct, but no test pins it (C-R49-02) |

C-R47-01 stays **accepted** as A-R47-GROUP-LANE-DELTA (B, D-29z13): a cross-lane group still keeps its lane. Its residual, **GROUP-LANE-REFUSAL-TEXT** (wrong cause text, ghosts drawn at the valid places), is **closed** by GR-BEFORE.

## 9. R49-S1 — stage-1 re-check on the reconciled code (`05e1bc0` + round 49): **PASS**

All of these were **re-run this round on the reconciled tree**, not cited from rounds 47/48.

| ID | Method | Result |
|---|---|---|
| SN-1 | REAL-mouse (PW) click on Snap, header +56 px | **5.000**; one entry |
| SN-GROUP | free +12 px → 4.3; Ctrl+click music; `g`; drag +40 px | **5.000 / 7.700**, Undo `გადატანა (2)`, one Ctrl+Z restores, so **one entry** |
| SN-LANE | 4.3 + G; drag onto the music lane +20 px | ghost **`5.000@music`**, final music **5.000**, Undo `გადატანა ხაზზე — მუსიკა` |
| NU-1 | gstack REAL click + `press g` + Arrow keys (`runs/s1-gstack.txt`) | **5 / 4 / 3**, Undo `კლიპის ჩაჩოჩება`. Ctrl+Z ×3 → 4 / 5 / 4 (one entry each); root's F3 `getArrangement()` anchor holds |
| UI-1 | gstack, measured in the real browser at both viewports | **1440×900:** cell **224 × 28** at (288, 191), sticky; toolbar **49** px; toggle and select **h 24** (the reconciled `h-6`) inside the 28 px cell, 2 px margin above and below; the select's scrollWidth equals its clientWidth (**73**), so the text is not clipped; the select ends 90 px inside the cell. With Snap on, the toggle is `border-accent bg-accent/20`; `ring-2` applies only on focus-visible, and the cell is `overflow: visible`. The "ring not clipped" claim is **inferred from computed style**: I did not render or screenshot a focus-visible ring (`shots/UI-1-snap-on-1440-crop.png` shows the pressed state without focus). **1280×720:** the same cell, toolbar **87** (the 2-row baseline) |
| UI-5 | gstack REAL `select … 0.25` | control `data-grid-seconds="0.25"`, all 4 lanes 0.25; the select offers **exactly 7** options (10, 5, 2, 1, 0.5, 0.25, 0.1) |
| LN-1 | PW screenshot luminance (`runs/lines-1440x900.txt`) | lit columns in the empty stems row at **552, 592, 632, 672, 712, 752, 792**: every 40 px = the 1 s ticks, Δ 0 px. LN-2 (0.1 s hidden at 40 px/s) and LN-3 (Snap on, same lines) also re-pass. "Lanes without `gridSeconds` have no `data-grid-*`" is covered by unit GS15, inside the green full run |
| **AU-1** | PW: video Mute (REAL click), `g`, Soft impact +80 px → **6.000** (status `start 00:06.000`), Export → WAV, decode of the blob (`runs/au-1440x900-au.txt`) | **RIFF/WAVE**, PCM 24-bit, 48 kHz, stereo, 1 104 000 frames = **23.000 s**. First sample above −40 dBFS in [3.5, 6.9): **6.000 s** (±0.010 met exactly). Peak in [3.5, 5.99): **digital silence** (−∞ dBFS, well below −60). NaN 0. Full-scale samples 2 (known DEMO-SFX-FULL-SCALE). **AU-2 (live graph):** playback from 5.5 — the SFX meter stays −∞ through pos 5.94 and is 0.0 dB at 6.09, then decays. The real-time output follows the moved clip |

## 10. REG — directly related regressions: **PASS**

- **REG-HYD:** a fresh load, then 3 s of console, at both viewports (`runs/reg-hyd.txt`). There is **no** hydration-mismatch, React `Warning:` or `useLayoutEffect` line. The only error lines are the allowed `/api/cart` `ERR_CONNECTION_REFUSED` and "Failed to load cart".
- **C-R23-01 record.** SSR `/studio-lab` ×3: 66 062 bytes, **NUL = 3 at offsets 11729, 28025, 28026**; U+FFFD = 0 (`runs/ssr.txt`). The offsets are the same as in round 47. On the client the symptom is still `ბიბ�ლიოთეკის დაკეცვა` in an aria-label. Not fixed; this is a record only.
- **Undo atomicity** (one entry per trim, move, group move and Alt drag; none for a range or a refused move), **Shift time lock**, **click-to-seek**, the **trim blocked texts** and the **overlay look** are covered in §6–§9.
- **Render cost of a drag:** `render-budget.test.tsx` is green in the full run. I did not measure it separately in the browser.

## 11. Ableton two-verdict table (§4.8)

Source: Live 12 Reference Manual §6.7 / 6.9 / 6.10. B fetched the text on 2026-10-16 (`b-round-46/ableton-6.7-6.10-20261016.txt`). **C did not watch any video and did not use a Live installation.**

| Behaviour | CZABA requirement | Ableton conformance |
|---|---|---|
| A resized clip edge snaps to the grid | **PASS** (TR-1, TR-L, TR-025, TR-1280) | **Confirmed** (text 6.10 / 6.7) |
| Time selection inside a clip snaps | **PASS** (RG-1, RG-CLAMP, RG-OFF) | **Confirmed** (text 6.9 / 6.10) |
| Alt bypasses snap; with the grid off it enables it temporarily | **PASS** (AL-1…AL-4, AL-MID; SE11–SE14) | **Confirmed** (text 6.10, 42.5) |
| Snap to other clips' edges / locators | stage 4 / SRW-16. The current off-grid limit stop is **PASS** (TR-LIMIT, TR-LIMIT2) | **Deliberate difference (staged)** |
| Ctrl+Alt+Shift contents drag | n/a (no slide gesture) | **Not applicable** |
| The bar moves a clip; the waveform selects time | **PASS** (unchanged structure; RG-*, SN-*) | **Confirmed** |
| No range after a zero-width snap | **PASS** (RG-ZERO) | **Unconfirmed** (CZABA decision) |
| A click in a clip sets a point | **PASS** as a deliberate staged difference: unsnapped seek (RG-CLICK) | **Deliberate difference** (insert-marker snap is stage 3) |
| Off-grid start under Snap: absolute line | **PASS** (SN-1, F1 accepted) | **Unconfirmed** |
| Alt release and Chrome's app menu | recorded only (AL-FOCUS) | **Not applicable** to Ableton; Tech Lead R49-T(2) |

## 12. New findings → B

- **C-R49-01 (Low, test gap): no committed test distinguishes snap-then-clamp from clamp-then-snap for trim.**
  - Mutation (n) survives all 22 cases of `grid-snap-edit`.
  - Only C's C49-N1 kills it: fixture `clipAt('m1','music',7.7,3,0.1)`, Snap 1, left trim −10 px → expected start 7.6 with the blocked text. The mutated result is 8 and not blocked.
  - The behaviour is correct in the browser (TR-LIMIT2).
  - Proposal: add C49-N1 to `grid-snap-edit.test.tsx` in a later round. The case text is in `c-round-49/tests/c49-supplement-cases.tsx.txt`.
- **C-R49-02 (Low, test gap): the UI `out-of-range` "no ghosts" branch is unpinned.**
  - Mutation (p) (ghosts suppressed only for `before-start`) survives both suites. SE16 covers the pure plan only.
  - The browser shows the correct result (GR-OUT: no ghosts, out-of-range text, time-only commit).
  - Proposal: a UI case with a group whose bottom-lane member is dragged one lane down, asserting no `data-ghost-start` and the out-of-range text.
- **Environment (root):**
  - **ENV-BROWSE-DAEMON** recurred: the CLI daemon failed at 21:13, and the fallback worked.
  - The machine suspended about 13 h during verify.
  - **GSTACK-NO-MOUSE** is still pending acceptance.

## 13. Carried items (honest; not PASS, unchanged unless stated)

- **Closed this round:** GROUP-LANE-REFUSAL-TEXT (GR-BEFORE; the residual of C-R47-01, which itself stays accepted as A-R47-GROUP-LANE-DELTA) and LANE-RANGE-OVERLAY-60 (RG-USE, alpha 0.3).
- **Open C bugs:**
  - C-R48-01 (did not reproduce this round; still open);
  - C-R41-01;
  - C-R27-01, which includes RF3-1, RF3-2 and R5-L6;
  - C-R6-02 and C-R8-01 (Tech Lead quiet Chrome);
  - C-R23-01 (NUL 3, unchanged) and C-R38-01.
- **Accepted (B):** FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R43-EXACT-5DB, A-R43-REVIEW-W66, A-R43-REVIEW-ROOTFONT, A-R45-SSR4, A-R46-RESTORE-SELECTION, A-R47-GROUP-LANE-DELTA, F1 (D-29z14).
- **Open Low:** R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE (2 full-scale samples in AU-1), L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS, VIDEO-CLIP-TRANSLUCENT-GRID, DETAIL-RESET-SHRINK, SHIFT-BEFORE-DOWN-NOTE.
- **A's architecture note (for B):** trim and range snapping are inline in `handlePointerMove`. Pure `trimEdgeOnGrid` / `rangeEndsOnGrid` helpers are proposed before stage 4, and these would also make C-R49-01 cheap to pin. Also ARCH-CHECKPOINT-SRW13 and ARCH-CHECKPOINT-SRW14-PREFS.
- **Root items:**
  - the open list in `publication-checkpoint.json` → `round48Reconciliation.open` is C-R47-01 (accepted; its residual GROUP-LANE-REFUSAL-TEXT is closed now), C-R48-01, "F1 jitter absolute snap decision" (→ R49-T(1)) and "bounded edit preferences review before stage 3" (ARCH-CHECKPOINT-SRW14-PREFS);
  - the fake Bearer → 500 (re-observed);
  - the CRLF Biome errors on the auth files;
  - GSTACK-ACL;
  - SRW-21;
  - machine load.

  `root-pre-push-review.md` (2026-10-07) is the old round-12 review; this round adds nothing to it.
- **Tech Lead manual checks:** R23-1, R23-2, R38-T, R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT, R47-T, and **R49-T**:
  1. real-mouse select-clicks with 10 s and 1 s grids (F1);
  2. real Chrome: Alt+drag → release Alt → Space plays and the app menu does not open;
  3. the feel of trim/range snapping, including A's note that toggling Alt during a range drag re-snaps the anchor.
- **Not re-run this round, so not PASS:** video sync and C-R27-01; the full find sound → add → fit video → export flow (only the AU-1 export slice was run); the FB-01..FB-16 stage regression; `npm run test:e2e:smoke` (root only).

## 14. Commit readiness (for root)

The 7 paths are stable and verified:
- `M` ArrangementClip.tsx, ArrangementLane.tsx, grid.ts, selection.ts and doc 044;
- `??` grid-snap-edit.test.tsx and doc 045.

There is no foreign change. Doc 045's status line still reads "C-ის შემოწმებას ელოდება"; B or A may update it to reflect this PASS before the commit, at root's discretion. C-R49-01 and C-R49-02 are Low test gaps and do not block a commit.
