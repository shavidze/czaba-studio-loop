# C — Round 108 verification: a self-disabling button hands focus to its partner (D-29z73)

Verifier: C · 2026-10-23 (~11:55–12:05 UTC) · **Verdict: PASS** (`browserVerified=true`, `realVerified=true`), with one new Low finding (C-R108-01). No source edits, commits or server start/stop.

Environment: `env-status.json` round 108, store 200. Real Chromium (Playwright, installed browser). Every row used a fresh incognito context with no credentials on `http://127.0.0.1:5173/studio-lab`, with Decline clicked and the library settled first. Tools: `c-round-108/tools/` (`fl108.cjs` is my own row script; the rest are adapted copies of C r107 tools). Outputs: `c-round-108/out/`. Screenshots: `c-round-108/shots/`.

## Source state (SOURCE-UNCHANGED: PASS)
- HEAD is `fc086179…`. Status is **3 M + 2 ??**, exactly the five owned paths, at both start and end. The frozen list checks **539/539** at start and end. A's `end-hashes.txt` matches at the end.
- Diff against B's snapshots:
  - **DetailPanel:** `clipGainInputRef` + `resetClipGain` (l.384–404), the `ref` on the input, and the 0 dB `onClick`.
  - **Transport:** the import line, one new import, the refs/arm/effect/guard after l.73, and Undo, Redo, ⌫ and ↩ Zoom (arm + keydown guard). Fit gets a `ref` only.
  - Play, ↤, the position block, Split, Loop, Follow, the slider, ⇔, Export, `commitClipGain` and `handleClipGainKeyDown` are untouched. Every hunk is inside the narrow ranges.
- **Infra note:** `store/node_modules/.vite/deps/_metadata.json` mtime changed to 12:01 UTC during my phase, so the dev server re-optimized its deps on a page load. My vitest runs used a scratch `cacheDir`. All my sessions had 0 pageerrors and 0 hydration warnings.

## Browser rows (real Chromium)
| ID | VP | Result | Evidence (exact) |
|---|---|---|---|
| FL-GAIN-KEYBOARD | 1280, 1440 | PASS | <ul><li>Tab → `arrangement-detail-clip-gain-reset`.</li><li>Enter: one span `Clip Gain: Middle East — საჯარო preview — 0.0 dB.`, 0 dB disabled, active `arrangement-detail-clip-gain-input`, value `0.0`.</li><li>Enter 2: one span `Clip Gain უცვლელია: 0.0 dB.`, clips 1, no `დაემატა`, Undo `Undo: Clip Gain`.</li><li>`out/gain-kb-*.json`, `shots/fl-gain-keyboard-*.png`</li></ul> |
| FL-GAIN-HOLD | 1280 | PASS | <ul><li>13 downs (12 repeats) → exactly one span `… — 0.0 dB.`, no `უცვლელია`/`დაემატა`.</li><li>Focus on the input, clips 1.</li></ul> |
| FL-GAIN-MOUSE | 1280 | PASS | <ul><li>Gain `1.0` committed; mouse click into the input, then a mouse click on 0 dB.</li><li>Gain `0.0`, active still the input, one `… — 0.0 dB.` span, clips 1.</li></ul> |
| FL-UNDO | 1280, 1440 | PASS | <ul><li>2 clips. Enter 1: 1 clip, focus Undo.</li><li>Enter 2: 0 clips, Undo disabled, focus `Redo: დამატება — Middle East — საჯარო preview`.</li><li>Enter 3: 1 clip at `0.000`, Redo still enabled. Status `Redo: დამატება — Middle East — საჯარო preview`, no `დაემატა`.</li><li>`shots/fl-undo-*.png`</li></ul> |
| FL-UNDO-HOLD | 1280 | PASS | <ul><li>3 clips; a hold of 13 downs (12 repeats) gives exactly one undo (3 → 2). Focus stays on Undo, and the only span is `Undo: დამატება …`.</li><li>A separate Enter gives 1 clip.</li></ul> |
| FL-REDO | 1280 | PASS | <ul><li>Enter 1: 1 clip, Redo disabled, focus `Undo: დამატება …`, status `Redo: დამატება …`.</li><li>Enter 2: 0 clips, Redo enabled, status `Undo: დამატება …` (an undo, not a library add).</li></ul> |
| FL-DELETE | 1280, 1440 | PASS | <ul><li>Enter 1: 0 clips, focus `Undo: კლიპის წაშლა`, status `კლიპი წაიშალა; სიცარიელე დარჩა.`</li><li>Enter 2: 1 clip at `0.000`, Redo enabled with title `Redo: კლიპის წაშლა`, status `Undo: კლიპის წაშლა`.</li><li>`shots/fl-delete-*.png`</li></ul> |
| FL-ZOOMBACK | 1280 | PASS | <ul><li>The recipe (`=` then `+`, 7.4 → 11.6 px/s) enabled ↩ Zoom.</li><li>Enter 1: view restored (40 px/s, `წინა ხედი აღდგა.`), ↩ Zoom disabled, focus `arrangement-fit`. One press was enough, so the recipe had no difference.</li><li>Enter 2: one trusted Fit click (7.4 px/s, `Fit: მთლიანი პროექტი ჩანს (01:41.352). X აბრუნებს.`), clips unchanged.</li></ul> |
| FL-UNDO-MOUSE | 1280 | PASS | <ul><li>Two real mouse clicks give 0 clips. The active element is the `Redo: …` button (Chromium focused the clicked Undo, then the handoff ran).</li><li>Enter → redo: 1 clip, status `Redo: დამატება …`.</li><li>No BODY finding.</li></ul> |
| HK-UNDO-STILL-REPEATS | 1280 | PASS | Ctrl+Z, 1 down + 2 repeats → the clip is back at 0.000 (`out/undo-repeats-1280x720.json`). |
| R12-L2-ENTER-ADD | 1280 | PASS | Enter on the Middle East row → 1 clip, `„Middle East — საჯარო preview“ დაემატა მუსიკა ხაზზე 00:00.000-ზე.` |
| HE-MARKER-ADD | 1280 | PASS | Same checks as r107: the editor stays open and focused through the hold; `Intro` gives one marker (`out/marker-add-1280x720.json`). |
| SR-TEXT-REG | 1280 | PASS | Every field equals `c-round-107/out/textreg-1280x720.json` except `startedUtc` and the `t` timestamps. Texts and order are identical. |
| PX-NET | all | PASS | Every session: 0 requests to studio-token, R2, recording or download URLs, and 0 `Authorization` headers. |
| REG-HYD | all | PASS | Every session, including the first load: 0 hydration warnings, 0 pageerrors, 0 non-noise console errors. |
| G108-3 | 1280, 1440 (alone, last) | PASS | <ul><li>The header link `Studio LabDemo` opens `/studio-lab`, with the workspace and the demo badge.</li><li>`/studio/middle-east`: sign-in shown, 0 workspace, 0 `audio[src]`.</li><li>Anonymous `/api/studio-token` → 401 `Please sign in to access Studio.`</li><li>localStorage has no auth key.</li><li>The fake-Bearer sub-check is **BLOCKED** (backend unavailable in cloud).</li></ul> |
| User flow smoke (extra) | 1280 | PASS | <ul><li>Find sound → drag 3 demo sources (music, stem, SFX) → Fit → real WAV export: `WAV შეიქმნა: 01:41.702, 24-bit · 48 kHz · stereo.`</li><li>File RIFF/WAVE PCM, 2 ch, 48000 Hz, 24-bit, 4,881,696 frames = 101.702 s, NaN 0, RMS 0.1746.</li><li>The stats are identical to C r107. The 486 full-scale samples / peak 1 are also identical to r107: pre-existing and not from this round.</li><li>The WAV was deleted after measuring.</li></ul> |

## Extra probe → C-R108-01 (Low, new)
- **Steps:** focus ↩ Zoom after the recipe and hold Enter (1 down + 10 repeats).
- **Result:**
  - One zoom-back happens and focus moves to Fit.
  - Then **10 Fit actions** follow (10 Fit spans).
  - Afterwards ↩ Zoom needs **10 presses** to return to the pre-hold 40 px/s view. The first 9 each restore an identical 7.4 px/s Fit view.
- **Cause:** D-29z73 F2 on Fit is not implemented. A stopped that part because the frozen test `export-toolbar-hold-enter.test.tsx:269–272` (**TH5**) pins "a repeated Enter on Fit is not prevented". I confirmed TH5 says exactly that.
- **Impact:** view only; arrangement data is unchanged and there are 0 errors.
- **B decision needed:** amend TH5 or drop Fit from F2.
- **Status:** not an A failure. F2-Fit and m9 are **not** listed as passed.
- **Evidence:** `out/zoomback-hold-1280x720.json`.

## Offline rows
- **AN-REVIEW: PASS.**
  - A's fail-before list (FL1, FL3, FL4, FL5, FL6, FL9, FL10 red; FL2, FL7, FL8 green) matches §1, and A explains FL10.
  - I re-ran 5 mutations in scratch `c-round-108/mut/` with my own strings (`tools/mut108.py`; the control is 10/10 green before and after):

    | Mutation | My change | Red (failing line) |
    |---|---|---|
    | m1 | `&& false` on the 0 dB focus | FL1 (l.281) |
    | m3 | effect ignores `source.disabled` | FL3 (l.306) and FL4 (l.321) |
    | m5 | ⌫ arms a `null` partner | FL5 (l.335) |
    | m7 | arm without the held-focus check | FL7 (l.357) |
    | m8 | remove the Undo keydown guard | FL9 (l.388) |

  - These are the same red tests as A's (m3 lines 306/321 match).
  - Handoff assertions use `toBe(<partner>)`.
  - Grep found no `as`, `@ts-`, `any` or `not.toBe`. FL6 also uses `toHaveBeenCalledTimes(1)`, which is an exact count.
  - Scratch cleanup: the `mut/` app copy, cache and symlink were removed after the runs; the logs `out/mut108-*.log` and `out/targeted.log` are kept as evidence.
  - FL9 omits Fit; it does not pin the gap.
- **T108-TARGETED: PASS.**
  - The re-run grep gives the same 66 files as A's list.
  - Run in scratch (app byte-identical to store, same config plus `cacheDir`): **66 files, 1126 tests pass**.
- **DOC-092-L4: PASS.** Only l.4 changed. It now reads `Round 107 — C PASS, გამოქვეყნებულია fc08617-ში (gate 107; …)`.
- **DOC-093: PASS.**
  - The TEMPLATE sections are present: date, status, project, კონტექსტი, მიდგომა, არქიტექტურა, შეცვლილი ფაილები, პრობლემები, ტესტირება, TODO.
  - The F1 partner table, "held focus" and "only on exhaustion" are stated.
  - F2 is stated, including the honest note that Fit was not done because of TH5.
  - The rejected alternatives (aria-disabled, global listener, Enter-on-body) are named.
  - Testing has fail-before and m1–m10, with m9 marked not run.

## Gate rows (not claimed)
Full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

## Ableton correspondence
Both behaviours are **არ ეხება** (a CZABA accessibility requirement). No Live source was consulted, and no Live claim is made.

## For B
1. **C-R108-01 (Low):** the TH5 vs Fit F2 decision. It goes to `deferred_low_polish` unless B decides it now.
2. **A-reported, not browser-reproduced by C:**
   - a stale arm after a repeated gesture refusal (Low);
   - running out of history with Ctrl+Z while Undo is focused still drops focus to BODY (info).
3. **Reviewer sweep hits (not C-verified):** Library ◀/▶ and × search-clear unmount without refocus; a possible video-dock placeholder; pan reset focuses its slider unconditionally.
4. **Infra:** the dev server's deps re-optimized at 12:01 UTC during C (a watch item for REG-HYD on first loads).
5. **The regression round is due** at the next B planning on or after 2026-10-24.
