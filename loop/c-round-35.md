# C — Round 35 ვერიფიკაცია (C-R34-01, C-R34-02; D-29z)

Verifier: C · 2026-10-13 (16:45–17:00 +04:00) · Server `http://127.0.0.1:5173/studio-lab` 200 · Browser: gstack `/browse`, state `c-browse.json`, HeadlessChrome, anonymous context (`auth_user` null, cookie ''), 1440×900 + 1280×720 spot check · node.exe **7** at every gate and run.

**taskStatus: BLOCKED.** A stopped at the §1.4 stop condition and changed nothing in `store/`. C independently confirmed that the stop is genuine, and that C-R34-01 still reproduces in the browser on every range fader. The round needs B's ruling on the frozen test `fader-guards.test.tsx` l.1265/l.1272 before A can land the fix. No app source was edited, and nothing was committed, pushed or deployed.

## 1. Verdict per ID

| ID | Verdict | Evidence |
|---|---|---|
| A stop (§1.4) — genuine? | **Confirmed** (C's own scratch) | `c-round-35/runs/scratch-snapshot-fader-guards.txt`, `scratch-impl-arrangement.txt` |
| R35-CR | **FAIL — C-R34-01 still open** (baseline; no fix landed) | `runs/cr-baseline-1440.txt`, `runs/cr-baseline-1280.txt` |
| R35-OT, R35-CL, R35-R34, R35-K | **not run** — no change landed; nothing to verify | — |
| R35-S | **not run as a diff check** — the 3 owned files equal the snapshots (`b64a2cf6` / `11a19bf6` / `e86072b8`). This means "unchanged", not "PASS". | §4 |
| R35-U (mutations a–f) | **not run** — no handler in `store/`. A ran a–e in its own scratch only (see §3). (f) can only run after the code lands. | — |
| R35-Doc | **not run** — doc 036 is unchanged. C-R34-02 is still open (Low, doc). | sha `e86072b8` |
| G35-1 | **Baseline green, criterion not met** (it needs ≥10 new tests) | `c-round-35/gates/` |
| G35-2 | **PASS** | §4 |
| G35-3 | **PASS** (known 500 for a fake Bearer, carried) | `runs/anon-*.json`, `network-*.txt`, `curl-token.txt` |

## 2. A's stop, checked independently

- **Tree.** C confirmed that `store/` is unchanged:
  - HEAD `1cefea1`;
  - `git status --short` shows the same 9 lines;
  - 376 OK;
  - the 3 owned files match the snapshot shas;
  - protected 4/4.
- **Scratch.** C built its own scratch copy in `c-round-35/scratch/`, separate from A's. It holds `app/` + configs, and `node_modules` was a junction that C removed afterwards.
  - Snapshot: `fader-guards.test.tsx` **54/54**.
  - After applying A's `proposed-StudioWorkspace.diff` (patch applied cleanly) and running `npx vitest run app/lib/arrangement`, the result was **1 failed | 776 passed (777)**. A's 12 new tests were not added, so the total is 777, not A's 789.
  - The only failure: `review: during an active Pan drag a clip header pointerdown keeps the search focus`, at **`fader-guards.test.tsx:1265:38`**: `expected <body> to be <input type="search">`.
  - A's claim is correct. This is the only conflict across the 37 arrangement test files.

**Browser evidence for B's ruling** (`runs/cr-baseline-1440.txt`, last two blocks). This is the current code, with no handler. All clicks are real:
- **search `ab` → real click on music Pan:** `activeElement` = **`Pan — მუსიკა`**, search `ab`, 4 items, 0 entries;
- **search `ab` → real click on Master:** `activeElement` = **`Master Volume`**, search `ab`, +1 `Master Volume`.

In a real browser, the search field **already** loses focus to the range natively. So frozen l.1265/l.1272 assert a state that exists only in jsdom, where focus never moves on pointerdown. The D-29z row "search `ab` → range → focus leaves the search" matches today's real-browser behaviour.

C's reading: A's option 1 does not change real behaviour. That option amends l.1265/l.1272 to `not.toBe(search)` and keeps the test's value: during an active Pan drag, a clip-header press does not edit anything and does not change the clip table. Option 2 would contradict B's own contract. **This is B's decision.**

## 3. R35-CR — baseline (all real `$B click`; C-R34-01 still reproduces)

**Start of every case:**
- layout L35: video 0, `სრული მიქსი` on music at 7, `Soft impact` on SFX at 4, past 3;
- the detail panel is already expanded (`aria-expanded=true`);
- a real click on the SFX header, a real click into Clip Gain, Ctrl+A, then type `3`;
- result: `activeElement` = `Clip Gain (dB)`, field `3`.

| Target (1440×900) | After the click | SFX gainDb | Status | Tail (newest last) | Fader |
|---|---|---|---|---|---|
| music Volume | focus `Volume — მუსიკა`, field `0.0` | `-` (**lost**) | **`რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.`** | `[…, Soft impact, Volume]` | vol 1 → **0.5** (jump) |
| music Pan | focus `Pan — მუსიკა`, field `0.0` | `-` (**lost**) | blocked status | no entry (the click hit the centre, value 0 → 0) | pan 0 |
| Master Volume | focus `Master Volume`, field `0.0` | `-` (**lost**) | blocked status | `[…, Master Volume]` | 0 → **−27** |
| video Volume | focus `Volume — ვიდეოს ორიგინალი ხმა`, field `0.0` | `-` (**lost**) | blocked status | `[…, Volume]` | 1 → **0.5** |
| Zoom (regression) | focus `Zoom (px/წმ)`, field `3.0` | **3** | `Clip Gain: Soft impact — +3.0 dB.` | `[…, Clip Gain]` (+1; Zoom writes no entry) | zoom 678 → 500 |
| **1280×720** spot check: Master | focus `Master Volume`, field `0.0` | `-` (**lost**) | blocked status | `[…, Master Volume]` | 0 → −27 |

After each case: Ctrl+Z back to past 3, and every clip at `-`.

A side observation, already queued in 4b as "the stale refusal status": after the Pan case the status still shows the blocked message, because no entry was written to replace it.

## 4. Gates

- **G35-1** (`c-round-35/gates/`; node.exe 7 → 7):
  - tsc exit 0;
  - the frozen list plus fader-guards: 12 files, **307/307**;
  - full vitest: 69 files, **1247/1247**;
  - build ✓ (2.41 s);
  - Biome `./app`: **2 errors** (`format` on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`, the root CRLF baseline), 218 warnings, 1 info; 0 diagnostics in Studio files.
  - The criterion "1247 + ≥10 new" is **not met**, because no test landed.
- **G35-2:** start and end are the same:
  - HEAD `1cefea1` (root has not committed);
  - 9 status lines;
  - `b-round-34-tree-sha256.txt` → 0 not-OK (376 OK);
  - protected 4/4 OK;
  - owned files `b64a2cf6` / `11a19bf6` / `e86072b8`.
- **G35-3:**
  - **header link:** `Studio LabDemo` was clicked for real from `/`, and the page went to `/studio-lab`. The workspace and the badge „დემო კოლექცია — ავტორიზაცია არ სჭირდება“ are shown; `auth_user` null, cookie ''.
  - **direct open:** the same result.
  - **network** (`network-anon-header.txt`, `network-anon-direct.txt`, `network-session-cr.txt`):
    - no `/api/studio-token`, `/api/recording-*` or `/api/download` request, and no R2 host;
    - media only `/middle-east.mp3`, `/videos/hero/hero-music.mp3` and `blob:`;
    - known extras: `GET localhost:5199/api/cart`, GA/gtag, fonts, the homepage Unsplash image, and the dev module `r2.config.ts`.
  - **Authorization hook** (fetch + XHR, labelled), active during the 1280 R35-CR click: **0** requests with an Authorization header.
  - **The same hook during a synthetic (labelled) music Volume drag:** 1 → 0.75, +1 entry, **0** requests, **0** Authorization headers, and 0 token/recording/download/R2 requests in the network log (`runs/g35-3-drag-auth.txt`).
  - **curl:** anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → **401**; a fake Bearer → **500** `Unable to prepare Studio access`, with no token (a carried root item).
  - `/studio/middle-east` → **"Sign in required"**, no workspace (`shots/anon-studio-me.png`). Premium auth is not bypassed.

## 5. Ableton (§4.6): two verdicts

| Behaviour | CZABA requirement | Ableton compliance |
|---|---|---|
| A typed, uncommitted value box value is committed when a fader is pressed | **FAIL** (C-R34-01 is open; nothing landed) | **Unconfirmed** (no source was captured; §18.1 does not describe it) |
| A fader press jumps to the click point | not this round (4b) | **Unconfirmed** |
| Double-click reset of Pan/Volume | not this round (4b) | Confirmed in source §18.1; not implemented yet |

## 6. Notes for B's re-dispatch (not fixes)

1. **Ruling needed** on frozen `fader-guards.test.tsx` l.1265/l.1272. §2 gives the real-browser evidence for it.
2. **A's mutation (c)** *replaced* round 34's scroller handler instead of adding the new handler next to it. It therefore does not test §4.6(c) as intended. When the code lands, C will run (c) as "handler moved to the scroller, round 34's handler kept".
3. **A's case 6 is stricter than B predicted.** It is red on the snapshot because it also asserts that focus is released.
4. **B's §1.4 list of gesture owners omits the lane-background marquee** (`StudioWorkspace.tsx` ~l.917). It calls `preventDefault`, and round 34 blurs first, so it is not a loss path. The list should still be corrected.
5. **Mutation (f)** (`commitClipGain('blur')` made a no-op) is still open for C, after the code lands.
7. **The R35-CR Pan row expects an entry that a centre click cannot produce.** A real `$B click` at the Pan centre leaves the value at 0 → 0, so no `Pan — მუსიკა` entry is written. The expected tail `[…, Clip Gain, Pan…]` is therefore unreachable with a centre click. B should either accept 0 Pan entries for that row (only the Clip Gain commit is checked) or specify an off-centre press, which must be labelled synthetic.
6. **C-R34-02** (doc l.355, the 10 px gutter) was not applied. It is independent of the ruling and can land with the re-dispatch.

## 7. C-R23-01 record

`curl -s /studio-lab`: **63 520 bytes, 2 NUL at 28013/28014**. This is identical to round 34 (`runs/c-r23-01-record.txt`). The bug is still open and is a Tech Lead item.

## 8. Carried (unchanged; not PASS, not new)

- **Open C bugs:**
  - Tech Lead: C-R27-01, C-R6-02, C-R8-01 and C-R23-01;
  - C-R30-01 (polish);
  - **C-R34-01** (Medium, still reproducing);
  - C-R34-02 (Low, doc).
- **Open low items:**
  - R26-M1;
  - stage 4b: MASTER-HOLD-TICK-EDGE, A-R29-REVIEW-1, FADER-KEY-ENTRIES, A-R31-REVIEW-2, A-R32-REVIEW-1, A-R33-REVIEW-TOUCH and the stale refusal status;
  - R9-REVIEWER-M1-L8;
  - A-R34-REVIEW-RESIDUALS;
  - DEMO-SFX-FULL-SCALE, L3, LIB-SEP-REASON, R27-T, DOC034-UNREACHABLE-NOTE and DOC035-NOTES.
- **Root items** (`root-pre-push-review.md`, `publication-checkpoint.json` oct13Checkpoint at `1cefea1`, task §4.8):
  - rounds 31–34 (9 status lines) are still uncommitted and C-verified;
  - the purchased loader hardcodes middle-east (SRW-21);
  - Lenis on `/studio/*`;
  - portable instruction paths;
  - the export hard-clip at 0 dBFS;
  - the CRLF Biome errors on the auth files;
  - `frontend-architect.md` grants Write/Bash;
  - the `Modal.tsx` focus gap;
  - the GA `scroll` event with consent denied;
  - a fake Bearer gets 500;
  - the CDP allowlist;
  - `Content-Type` without a charset;
  - the dev server's availability.
- **Tech Lead manual checks:** R30-T, R31-T, R33-T, R34-T, **R35-T** (not yet meaningful, because no fix exists) and TL-Q-FB05-FB11.
- **Not re-run this round:** the export, the audio graph, video sync, PUI and the full find sound → add → fit video → export flow, plus FB-01..FB-16. Nothing changed, so these are **not PASS**; they stay for the stage regression.
