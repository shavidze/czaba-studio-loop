# C round 39: SRW-13 4b-2 group 1 (D-29z4) verification

Verifier: C · 2026-10-14 15:06–15:53 (+04) · Task: `current-task.md` round 39 · A: `a-round-39.md`.

Source read-only. No commits/pushes. Browser: gstack browse with `c-browse.json`, anonymous context, synthetic demo media only. Evidence: `c-round-39/` (`gates/`, `runs/`, `shots/`, `mut/`, scripts `lib39.sh`, `st*.sh`, `pm.sh`, `kept-tab.sh`, `mn.sh`, `rest.sh`).

## Verdict: **FAIL (one low bug, C-R39-01)**

The logic of all three fixes works in the real Studio:
- the refusal status is restored after a gesture;
- the marker follows the unsaved text, including the kept text;
- the pending order is correct (unit-only).

**The only failing criterion is the marker's visibility (PM-1 / PM-1280).** At the default 144 px open height, the 3-line text overflows its scroll container by 15 px. The last word "აბრუნებს" is hidden at both 1440×900 and 1280×720, so the user sees "შეუნახავია — Enter ინახავს, Esc".
- A disclosed this in advance. It is not a regression.
- The fix lies outside A's ownership (text, slot width or default height).

Everything else C ran passes.

## Environment

- The first 40 min ran under **CPU 100%**: 21–26 `bun.exe`, 19 `icacls`, 13–30 `node.exe`, none started by C.
  - The gstack daemon failed to start several times (15 s limit), and `restart` hung until ~15:43.
  - The first `npm run verify` (15:21–15:40) is **invalid**: 77 failures, a vitest "worker timeout" and 1059 s.
  - After the load dropped (bun 0–1), everything was re-run.
- node.exe for each run is in each `runs/*.txt` (13–30).

## Gates

| Gate | Result | Evidence |
|---|---|---|
| G39-2 start | HEAD `6c7b4bb`; A's 5 lines + root's 17 `?? .codex/agents/*.toml`; tree **380 OK**; shas 91fa12d6 / 4249f4f3 / 9d9f2122 / 7bf223eb / f2cd4b53 = A; protected 4/4 OK; node 8; server 200 | `gates/g39-2-start.txt` |
| G39-2 end | Identical (15:52); node 25 | `gates/g39-2-end.txt` |
| G39-1 tsc | exit 0 | `gates/tsc.txt` |
| G39-1 vitest | Under load: 1310/1312. The 2 failures are the known flakes: `track-layout` "folds a lane…" 5170 ms timeout and `render-budget` l.547 `getLivePosition` 0.001 ≠ 0. Alone, 3×: 43/43 each. **After the load dropped, `npm run verify`: exit 0, 71 files, 1312/1312 (1290 + 22), build ✓** | `gates/vitest-full.txt`, `biome-and-reruns.txt`, `verify-2-summary.txt` |
| G39-1 build | ✓ (8.98 s under load; 2.97 s inside verify) | `gates/build.txt` |
| G39-1 Biome `./app` | Exactly 2 errors, `app\lib\auth.ts` format + `auth-bugs.test.ts` format (root CRLF), plus 218 warnings and 1 info. A's 3 files: `Checked 3 files … No fixes applied` | `gates/biome-app.txt`, `biome-and-reruns.txt` |
| G39-1 frozen suites | From the clean `verify-2` run: `pending-status` 22, `fader-guards` **71**, `fader-click` **26**, `gesture-guard` 19, `track-pan` 26, `master-ui` 18, `clip-gain` 28, `detail-panel` 24, `detail-panel-polish` 16, `track-layout` 36, `delete-selection-ui` 13, `ArrangementContext.test` 21 (+ `render-budget` 7), all ✓. The separate 16-file run under load: 393/395, same 2 flakes | `gates/verify-2.txt`, `gates/related.txt` |
| G39-3 | PASS (below) | `runs/g3-anon.txt` |

## R39-S: static (PASS)

`gates/snap-context.diff`, `snap-panel.diff`, `snap-doc037.diff`. **Every hunk is in scope.**

**`ArrangementContext.tsx`**
- `lastNonRefusalStatusRef` + `useLayoutEffect([status])` right after the unchanged `useState` line;
- the functional restore in the count-0 branch;
- `if (!volumeBeforeRef.current) flushPendingMaster();` after the refusal guard, with `flushPendingMaster` added to the deps.

**`ArrangementDetailPanel.tsx`**
- `clipGainPendingId`;
- `isClipGainPending`;
- the input's `aria-describedby` / `data-pending` / `cn(…, 'border-warning')`;
- the pending `<p className="text-warning">`.

**Doc 037:** status line + 1 TODO line.

No `any`, `@ts-ignore`, type assertion, `//` comment or hardcoded colour; tokens only.

## R39-ST: refusal status returns (PASS)

REAL clicks/keys; the separator 41 gesture and the window `pointerup`/`blur` are SYNTHETIC. Reads:
- **sync** = inside the dispatch;
- **t0** = the next task;
- **t150** = ≥150 ms later.

| Case | Before (S) | During | After release | Entries / gesture |
|---|---|---|---|---|
| ST-1 ×4 (1440, 3 timed) | `„Soft impact“ დაემატა…` / `Undo: Volume` | `რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.` | sync: blocked (React has not rendered yet); **t0 = t150 = S** | 0 / false |
| ST-2 (REAL Mute, then REAL Ctrl+Z held) | `„Soft impact“ დაემატა…` | `Undo/Redo drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.`, past 4 kept | S. Then REAL ruler + Ctrl+Z → `Undo: Mute — მუსიკა`, past 3 | 0 / false |
| ST-3 (DC-G replay; SYNTHETIC DR-V → 0.75, then SYNTHETIC dblclick) | `Undo: Mute — მუსიკა` (DR-V sets no status) | blocked; value 0.75; readout `C disabled=true` | S | 0 / false |
| ST-4 (REAL Master click, SYNTHETIC window blur) | `Undo: Volume` | blocked | t0 = t150 = S; Master 0 | 0 / false |
| ST-5 (REAL click music Volume → blocked → **REAL click `ვიდეოს გაფართოება`** while held) | `Undo: Volume` | blocked → `ვიდეო გაფართოვდა ბიბლიოთეკის თავზე…` | the new status **stays** at t0 and t150 | 0 / false |
| ST-6 (no refusal) | `Undo: Volume` | unchanged | unchanged | 0 |
| ST-1280 | `Undo: Volume` | blocked | t0 = t150 = S | 0 / false |

Evidence: `runs/st-1440.txt`, `st-1440-b.txt`, `st-pm-1280.txt`.

**Round-38 contrast:** in `c-round-38.md` §6, the blocked status persisted after DC-G and MN-G. It no longer does.

## R39-PM: unsaved Clip Gain marker

| Case | Result | Evidence |
|---|---|---|
| PM-1 (1440) | `data-pending="true"`; exact text (`exact:true`); `aria-describedby` = `:r5:` = the pending `<p>` id; class `border border-warning` (no `border-outline`); computed border `rgb(245, 158, 11)`; text colour `rgb(245, 158, 11)`. **Geometry:** panel 144 → 144 px, panel top 687 → 687, first lane top 235 → 235 (±0). **Visibility: FAIL.** The `<p>` is 3 lines (48 px, w 128). Its scroll container is 107 px (`clientHeight` 107, `scrollHeight` 122), so its bottom 846 > container bottom 831: **15 px clipped**, and "აბრუნებს" is hidden → **C-R39-01**. Also, while the field has focus, the 2 px teal focus outline `rgb(18, 217, 200)` covers the orange border. It is visible only after blur (`shots/pm-kept-tab-1440.png`) | `runs/pm-1440.txt`, `shots/pm1-1440.png`, `pm1-panel-1440.png` |
| PM-1280 | Same: attributes OK; panel 144 → 144, lane top 123 → 123; **15 px clipped** (C-R39-01) | `runs/st-pm-1280.txt`, `shots/pm1-1280.png`, `pm1-panel-1280.png` |
| PM-2 | REAL Enter: +1 `Clip Gain`; status `Clip Gain: Soft impact — +3.0 dB.`; no marker; `aria-describedby` null; border `rgb(48, 53, 65)` | **PASS** |
| PM-3 | Type `5` → marker; REAL Escape → `3.0`, no marker, 0 entries | **PASS** |
| PM-RAW | Stored 3.0; type `3` → marker; REAL Tab → 0 entries, `3.0`, no marker | **PASS** |
| PM-KEPT (B's literal steps) | Type `6` → separator 41 → REAL click Master: blocked, `6` + marker, 0 entries; after `pointerup` 41: `Undo: Clip Gain` (not blocked), marker stays ✓. **But B's premise does not hold:** since round 38, a refused fader press keeps focus in the field (`focus: Clip Gain (dB)`, as MN-CR36). So the field was never blurred during the gesture, and the next REAL click on music Volume blurs it outside a gesture → **+1 `Clip Gain` +6.0 dB**. That is CR-1 behaviour, not a bug. B's expected "0 entries" assumed the round-37 focus jump. → **C-R39-INFO-KEPT-PREMISE** (B: fix the step) | `runs/pm-1440.txt`, `shots/pm-kept-1440.png` |
| PM-KEPT-TAB (C variant: a REAL Tab while 41 is held, i.e. a real blur during the gesture) | Blocked; field `6` + marker; 0 entries. After `pointerup`: `Undo: Clip Gain`, marker stays. REAL click music Volume → **0 entries**, marker stays, status **not** blocked (round 37 KEPT-2 had a stale blocked status). REAL click field + REAL Tab → +1 `Clip Gain`, `Clip Gain: Soft impact — +6.0 dB.`, no marker | **PASS** (`runs/kept-mn-1440.txt`, `shots/pm-kept-tab-1440.png`) |
| PM-VID | Video header: field disabled; no pending element; `aria-describedby` `:r7:` = the reason id (`ვიდეო კლიპს Clip Gain არ აქვს…`) | **PASS** |

## R39-PO: pending preview order (unit-only, PASS)

- PO1–PO4 are green on the live source, 22/22 (`runs/mut-control.txt`).
- **PO1 is red on the snapshot source** (`runs/mut-red-snapshot.txt`, a scratch copy outside `store/`).
- Mutation (g) is caught by PO1; (h) by PO4.
- **Unit-only, not browser-verified** (as the task requires).

## R39-U: tests and mutations (PASS)

The red run on the snapshot sources gives **15 red / 7 green**. That matches A, and matches B's list + S1-same-act:
- red: S1, S1-same-act, S2, S4, S5, S5b, S7, S8, S9, PM1–PM4, PM6, PO1;
- green: S3, S3-same-act, S6, PM5, PO2, PO3, PO4.

Mutations: fresh scratch copy `c-round-39/mut/app`, restored and verified identical (`RESTORE IDENT`); node_modules junction removed. All of them are caught:

| # | Mutation | Caught by |
|---|---|---|
| (a) | No restore at count 0 | S1, S1-same-act, S2, S4, S5, S5b, S7, S8, S9 |
| (b) | Restore even when not a refusal | **S3-same-act only.** S3 does not catch it, so A's correction of the §4.7 table is confirmed |
| (b2) | Remember only the status from before the gesture | S5b |
| (c) | Restore at 2→1 | S4 |
| (d) | Edit refusal only | S2, S5 |
| (e) | Marker always false | PM1, PM2, PM3, PM4, PM6, S9 |
| (f) | Marker also when the text is equal | PM1, PM2, PM3, PM4, PM6 |
| (g) | No `flushPendingMaster` in `previewTrackVolume` | PO1 |
| (h) | Flush before the refusal guard | PO4 |

## R39-MN (PASS)

| Case | Result |
|---|---|
| MN-1 | SYNTHETIC DR-V: status `Undo: Clip Gain` before = after; +1 `Volume` (0.75) |
| MN-2 | REAL click music Volume / Master: values 1 / 0 unchanged, 0 entries, focus on the fader |
| MN-3 (MN-CR36) | Type `3` → separator 41 → REAL Master: the field keeps focus and `3` + marker, blocked, 0 entries. After `pointerup`: `Undo: Clip Gain`. REAL Enter: +1, `Clip Gain: Soft impact — +3.0 dB.` |
| MN-4 | REAL Tab ×2 from Mute onto music Volume + REAL ArrowLeft → +1 `Volume` 0.99 (`runs/cr-k-1440.txt`). REAL click Master + ArrowDown → +1 `Master Volume` −0.5. REAL ruler + Ctrl+Z ×2 → `Undo: Master Volume`, then the earlier entry, in reverse order. Note: the first Tab route (from the ruler) did not reach the fader in 12 Tabs. An ArrowLeft with focus on a button then nudged the selected clip (`კლიპის ჩაჩოჩება`), which is existing global nudge behaviour and was undone |
| MN-5 | Separator 41 → REAL Apply: blocked, range null. After release: the prior status `Undo: კლიპის ჩაჩოჩება`, 0 entries. Apply without a gesture → `მონიშვნა: 00:04.000 — 00:06.000 · SFX.` |

## R39-CR, R39-K (PASS)

**R39-CR**
- **CR-1:** `3` → REAL music Volume → `[…, Clip Gain]` only, focus on music Volume, status `Clip Gain: … +3.0 dB.` (not blocked).
- **CR-4:** `3` → REAL music header → +1 `Clip Gain`, focus BODY → REAL Delete deletes the music clip.
- **PG-DEL:** SFX selected → REAL music Volume → REAL Delete → nothing deleted, 0 entries.
- **D-20:** ST-2.
- Also re-run, PASS: R38 CR-2a/2b/3/5.

**R39-K**
- Mute, Solo and Master Mute: 1 entry each.
- Clip Gain Enter +1 / 0 dB reset +1 / Escape 0.
- The 0 dB reset with a typed `5`: +1, the marker is gone, the gain is unset.
- Lane drag (SYNTHETIC): 111 → 141 px, 0 entries.
- REAL Space with focus on music Volume: plays, and a second Space stops it.

## R39-Doc (PASS)

- Doc 038 has every section required by §2.4:
  - context with C/B evidence;
  - the contract tables;
  - rejected a–d;
  - the layout decision (visible), with the measured clipping disclosed;
  - files;
  - problems: re-claim edge, same-batch edge, unreachable no-gesture refusal, clipping, SSR, live region;
  - the red/green table and mutations;
  - C IDs;
  - the Ableton table;
  - TODO for groups 2–4.
- It matches the code.
- Doc 037: only the 2 allowed lines changed.

## G39-3: anonymous access (PASS)

- **Header link** (`Studio LabDemo`) and **direct** `/studio-lab` in a fresh context:
  - `auth_user` null, cookie empty, workspace present;
  - badge `დემო კოლექცია — ავტორიზაცია არ სჭირდება`.
- **Network:** 0 requests to `studio-token` / `recording-` / `/api/download` / R2. Media = `hero-music.mp3`, `middle-east.mp3` only. Plus the allowed `GET localhost:5199/api/cart`.
- `/studio/middle-east`: "Sign in required", no workspace.
- **During R39-ST/PM** (`runs/g3-session.txt`): auth hook `c-round-35/scripts/authhook.js` on `fetch` + XHR `setRequestHeader`, then a replay of separator 41 + a REAL Volume refusal + release, Clip Gain `3` + REAL Enter, REAL Mute, and REAL Space play/stop.
  - `authreq []`: no `Authorization` header from workspace code.
  - The network log over that replay is empty (0 requests).
- The whole session's network log (468 lines, `runs/network-session.txt`): bad = 0, media = only the 2 demo MP3s. API = only the allowed `localhost:5199/api/cart`. The hosts are fonts and the GA/GTM consent-denied hosts.
- `curl` anonymous `/api/studio-token` → **401**. Fake Bearer → **500** (carried, root item; no token).

## C-R23-01 / C-R38-01 record (carried, unchanged)

- `curl /studio-lab`: 63 611 bytes, **5 NUL at 11729, 28025, 28026, 58745, 58746**. Identical to round 38; A's byte changes did not move them.
- Hydrated DOM now: 1 U+FFFD label, `ბიბ�ლიოთეკის დაკეცვა`. The range inputs currently read clean, `range-ის დასაწყისი (წამი)`, after client re-renders. In round 38 the range label had 2 U+FFFD.

Evidence: `runs/c-r23-01-record.txt`, `c-r23-01-dom.txt`.

## Ableton: two verdicts per row (§4.8)

I confirmed that both of B's captures contain the quoted text.

| Behaviour | CZABA requirement | Ableton compliance |
|---|---|---|
| History follows the order of actions (pending Master committed before a new Volume preview) | **PASS**, unit-only (PO1–PO4, mutations g, h) | **დადასტურებული** as a principle (§5.4.2 "in the order they occurred", Live 12, captured 2026-10-14) |
| A refusal message disappears when its condition ends | **PASS** (R39-ST) | **დაუდასტურებელი**: §3.2 does not say when messages clear. This is a CZABA decision |
| An unsaved value-box entry is marked | Semantics **PASS**; visibility **FAIL** (C-R39-01) | **დაუდასტურებელი**: no source. CZABA requirement C-R37-01 |

## Bugs and info for B

**C-R39-01: low (UX; not a regression; disclosed by A)**
- **Steps:**
  1. Open `/studio-lab` at 1440×900 or 1280×720.
  2. Expand the detail panel (default 144 px).
  3. Select Soft impact and type `3` in Clip Gain.
- **Expected:** the pending text `შეუნახავია — Enter ინახავს, Esc აბრუნებს` is fully visible (PM-1).
- **Actual:**
  - In the `w-32` slot the text wraps to 3 lines. The 3rd line ("აბრუნებს") sits 15 px below the content's scroll viewport (`clientHeight` 107, `scrollHeight` 122) and is visible only after scrolling.
  - While the field has focus, the teal focus ring hides the orange border.
- **Options for B:**
  - Within A's §2.2 ownership: the contract's own `sr-only` + `title` fallback (§0.1 layout rule). A declined it, because the *outer* panel height does not change. That is a literal reading; the clause was meant to prevent exactly this overflow. If used, sighted users lose the text, so B should weigh it.
  - Outside A's ownership: shorter text, a wider slot, a taller default height, or a different placement.

**C-R39-INFO-KEPT-PREMISE: info, task wording**
- PM-KEPT assumed that the REAL Master click during the gesture blurs the field. Since round 38 it keeps focus, so the later Volume click commits (CR-1).
- Future rounds should use the PM-KEPT-TAB sequence: a REAL Tab while the gesture is held.

**Also noted (no new bug):**
- A's review follow-ups: an SSR-safe layout effect, and a live region for the marker.
- A Volume commit sets no status, so after ST-3 the line shows the older `Undo: Mute — მუსიკა` while the newest history entry is `Volume`. This is by contract.

## Not run this round (not PASS)

- Exports and WAV integrity.
- PUI geometry beyond the detail panel.
- Video sync and C-R27-01.
- The full find sound → add → fit video → export flow.
- The FB-01..FB-16 stage regression.
- `npm run test:e2e:smoke` (root only).

## Carried (unchanged)

**Open C bugs**
- C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome);
- C-R23-01 + C-R38-01 (Tech Lead);
- C-R30-01.

**Low items**
- R26-M1;
- 4b-2 groups 2–4;
- A-R38-TEST-ORDER, R9-REVIEWER-M1-L8, PREVIEW-VOLUME-IDENTITY, A-R34-REVIEW-RESIDUALS;
- DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, LIB-SEP-REASON;
- DOC034/035/036/015 notes, EXPORT-DIALOG-FOCUS-RESTORE.

**Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`)
- the 17 `.codex/agents/*.toml` files;
- e2e smoke;
- SRW-21;
- Lenis on `/studio/*`;
- portable instruction paths;
- the export hard-clip at 0 dBFS;
- the auth CRLF Biome errors;
- the `frontend-architect.md` grant;
- the Modal focus gap;
- GA scroll with consent denied;
- fake Bearer → 500;
- the CDP allowlist;
- `Content-Type` charset;
- dev-server availability;
- **the machine load (a bun/icacls storm) that made the gstack daemon and vitest unreliable for ~40 min.**

**Tech Lead:** R38-T (incl. A-R38-REVIEW-TOUCH), R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11.

**Checkpoint readiness:** the code is functionally sound. Round 39 is **not** C PASS because of C-R39-01. B decides whether to:
- fix it in a small follow-up before the checkpoint; or
- accept it as a known low and checkpoint.
