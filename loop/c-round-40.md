# C — Round 40 verification (D-29z5: the detail panel content fits its height)

Verifier: C · 2026-10-14 · 17:02–18:05 (+04:00) · HEAD `6c7b4bb` at the start and the end.

## 0. Verdict

**taskStatus: PASS.** Every contracted round-40 ID passed on C's own runs: G40-1..3, R40-S, R40-U, R40-Doc, R40-PM (PM-1, PM-1280, PM-2, PM-3, PM-KEPT-TAB, PM-RAW, PM-RESET, PM-TAB, PM-R30), R40-INFO, R40-MN 1–6, R40-CR and R40-K.

There is **one new C-evidenced bug, C-R40-01 (Low)**. It comes from the measurement-only item DETAIL-REASON-FIT (R40-RS):
- the disabled Clip Gain reason wraps to 3 lines and is clipped below the visible content box;
- the range reason is clipped in the 1280 group state;
- the content does scroll, but no scrollbar is visible, so the end of the sentence ("ხაზის Volume/Mute") is hidden.

By §4.2 this item gets no PASS/FAIL this round, because A ran no code for it. It is a pre-existing layout and is **not a round-40 regression**: the reason `<p>`s are byte-identical to the snapshot.

Environment:
- The dev server was **down** (curl 000, no listener on :5173) from A's 16:55 check until **17:18**, when root restarted it. C did not start or stop servers, and did the offline items first.
- The gstack browse daemon was unstable once, during G40-3: the server failed to start within 15 s and a `restart` hung. G40-3 was re-captured in a clean context at 18:03 (§7).
- `node.exe` was 20 at the gates, 21–23 during the browser runs, and 27–32 at the end (browse restarts).

Harness labels:
- **REAL** = `$B click` at the element centre, `$B press` or `$B type`.
- **SYNTHETIC**, labelled at each use:
  - the separator gesture (pointer id 41) and window `pointerup`;
  - the `lh.js` lane-height drag;
  - `scrollTop = max` (used to prove that scrolling reaches the end);
  - `.focus()` on the separator (MN-6);
  - `blur()`.
- C instrumentation: the `window.__c` reader (setup chain `c-round-34/reset.sh`), `c-round-35/scripts/authhook.js`, and the new geometry reader `c-round-40/scripts/geo40.js`.
- No source instrumentation. Mutations ran in a scratch copy outside `store/`.

## 1. Results by ID

| ID | Result | Evidence |
|---|---|---|
| G40-1 | **PASS** | `tsc` 0. 11 related suites: 283/283, including `detail-panel-fit` 7, `pending-status` 22, `fader-guards` 71, `fader-click` 26. `npm run verify` exit 0: 72 files, **1319/1319** (= 1312 + 7), both builds OK. Biome `./app`: exactly 2 errors (the baseline CRLF `format` errors on `app/lib/auth.ts` and `auth-bugs.test.ts`, confirmed by a scoped run), 218 warnings, 1 info. Scoped Biome on the 2 owned TS/TSX files: clean. node.exe 20 (`gates/summary.txt`, `verify.txt`, `related.txt`, `biome-app.txt`, `biome-scoped.txt`) |
| G40-2 | **PASS** | Start and end are identical (`gates/g40-2-start.txt`, `g40-2-end.txt`). HEAD `6c7b4bb`. 383/383 OK. Protected 4/4 OK. `git status` = round 39's 5 paths + `?? detail-panel-fit.test.tsx` + root's 17 `.codex` lines, as §3.2 expects. Live shas: panel `dbcd5c2f…`, doc 038 `947d9f83…`, test `dac18003…`. `.kilo/` appears only as an ignored path (`!! .kilo/`), not in `git status` |
| G40-3 | **PASS** | See §7 |
| R40-S | **PASS** | `gates/snap-panel.diff`: only the §2.1 items (the 3 constants with `HINT = FULL.slice(LABEL.length)`; `shrink-0` on the 3 info `truncate` `<p>`s; the input `title` and `border-warning focus-visible:ring-warning`; the row wrapper `flex items-center gap-1`; the moved marker `<p>` with `min-w-0 truncate text-warning`, `title`, the label text node and the `sr-only` span). The `0 dB` button is identical modulo indent (`diff -w`). The reason `<p>`s are unchanged. `gates/r40-s-static.txt`: no `//`, `any`, `@ts-`, type assertion, hex colour, arbitrary value or inline style in the added lines or the new test (the one grep hit is the word "as" in an `it` title) |
| R40-U | **PASS** | `runs/mutations.txt`; scratch copy `c-round-40/mut/`; suite = `detail-panel-fit` + `pending-status` + `clip-gain` (57). Control 57/57. The **snapshot source** (`b-round-39-snapshots`) fails exactly **F1, F2, F3, F4, F8**, so A's red run is reproduced. Mutations a–i each fail exactly the expected test (§6). After the run the copy was restored and was identical (`RESTORE IDENT`); the `node_modules` junction was removed with `rmdir`, and `store/node_modules` is intact |
| R40-Doc | **PASS (with carried notes)** | `gates/snap-doc038.diff` changes only the §2.2 parts: the status line; the layout section (A's reviewer fix #1 prefix + the round-40 paragraph); the problem entry → solution; the new `## Round 40 …` section; one TODO line. The Ableton table matches §4.8 row by row (unconfirmed / not applicable / not applicable). **Carried, not A's fault (outside the §2.2 allowed parts):** l.45 still says the full text appears "under `0 dB`"; TODO l.230 ("ჯგუფი 2 (round 40 …)") and l.233–234 (C-R30-01 under polish; "ნიშნის მესამე ხაზის ჩამოჭრა") are stale |
| R40-PM | **PASS** | §2 |
| R40-RS | **recorded (no verdict)** → **C-R40-01 Low** | §3 |
| R40-INFO | **PASS** | §4 |
| R40-MN | **PASS** | §5 |
| R40-CR | **PASS** | §5 |
| R40-K | **PASS** | §5 |

## 2. R40-PM — the marker fits (REAL inputs)

Layout L40: the demo video at 0, `სრული მიქსი` on music at 7, `Soft impact` on SFX at 4. Every viewport was a **fresh load**: `viewport`, then `goto`, then the setup chain. The panel was opened by a REAL toggle click after checking `aria-expanded`.

| Case | Geometry / state | Verdict |
|---|---|---|
| **PM-1** 1440×900 (`runs/pm-1440.txt`, `shots/pm1-1440.png`, `pm1-panel-1440.png`) | Before: panel 144, lane 235, scroller `clientHeight`/`scrollHeight` 107/107. After the REAL type `3`: `data-pending="true"`, scroller **107/107 (+0)**, panel 144, lane 235. Marker `<p>` rect 1348.2–1418 × 780–796: **w 69.8 (≥ 69), h 16 (1 line)**, `scrollWidth` 70 = `clientWidth` 70 (not truncated). It is inside the Clip Gain column (x 1300–1428) and inside the scroller (y 724–831). `0 dB` button 776–800, w 44.2, unchanged before and after. `aria-describedby` = `:r5:` = the marker id; `textContent` = the full string; first text node `შეუნახავია`; the `title` on the marker and on the input = the full string. Focused input `box-shadow` contains **`rgb(245, 158, 11) 0px 0px 0px 2px`**; border `rgb(245, 158, 11)` | **PASS** |
| PM-1 note | The literal "same top ±2 px" is **not** met: the button top is 776, the marker top 780 (Δ4). That is the geometric result of the contract-mandated `items-center` (h-6 button vs a 16 px line). The centres are equal (788 = 788), and the marker and the button share the same flex parent. C judges "same row" as met; B should restate the criterion as "same centre ±2 px" | info for B |
| **PM-1280** 1280×720, fresh load (`runs/pm-1280.txt`, `shots/pm1-1280.png`) | Fresh-load geometry is **panel 142, lane 273**. Round 39's 144/123 came from a resize without a reload (`c-round-39/rest.sh`), so it is not the canonical state; A's 142/273 was in fact canonical. Scroller **105/105 → 105/105 (+0)**. Marker 1188.2–1258 × 602–618, 69.8×16, `scrollWidth` = `clientWidth` = 70; inside the column (1140–1268) and the scroller (546–651). Ring `rgb(245, 158, 11)` | **PASS** |
| PM-2 | REAL Enter → +1 `Clip Gain`; status `Clip Gain: Soft impact — +3.0 dB.`; no marker; input `title` null; ring `rgb(18, 217, 200)` (brand); button still 776–800; scroller 107/107 | **PASS** |
| PM-3 | REAL type `5` (marker shown) → REAL Escape → `3.0`, no marker, 0 entries | **PASS** |
| PM-RAW | Stored `3.0`, REAL type `3` → marker shown → REAL Tab → 0 entries, `3.0`, no marker; focus → `0 dB` | **PASS** |
| PM-RESET | Stored `3.0`, type `5` → REAL click `0 dB` → +1, `gainDb` unset, `0.0`, no marker | **PASS** |
| PM-TAB | Gain stored (`0 dB` enabled): field → **`Clip Gain-ის განულება (0 dB)`** → the next focusable is C's harness file input `#c-stage`, then BODY. So `0 dB` is the last app control (round-30 order unchanged). With the gain unset, `0 dB` is disabled and skipped | **PASS** |
| PM-KEPT-TAB | Type `6` → SYNTHETIC pd41 → **REAL Tab** while held → the refusal status shows, the field keeps `6` with the marker, 0 entries → SYNTHETIC pu41 → the status returns to `Undo: Clip Gain`. The marker is still 69.8×16 and the scroller 107/107. Then a REAL click into the field + REAL Tab → +1 `Clip Gain: Soft impact — +6.0 dB.`, no marker | **PASS** |
| **PM-R30** 1280×720, the C-R30-01 state (`runs/info-1280.txt`, `shots/pm-r30-1280.png`) | Music selected (REAL); range 9–11 via REAL inputs + REAL Apply → `მონიშვნა: 00:09.000 — 00:11.000 · მუსიკა.`; panel **122**, content `clientHeight` **85**. REAL type `3`: scroller `scrollHeight` **96 → 96 (+0)**. Marker 602–618 (1 line, 69.8 w, `scrollWidth` = `clientWidth`), visible inside 546–631 without scrolling. The range stays shown. REAL Escape → no marker, 0 entries | **PASS** |

Reviewer Low #4 (`0 dB` without `shrink-0`): measured. The button stays 44.2 px wide at both viewports with the marker shown. The marker is 69.8 px, far from the ~80 px risk point. No finding today, and it stays a B option.

## 3. R40-RS — reason lines (measurement only; B's probe numbers are B's)

- **B's "before"** (`b-round-39/measure-reason-1440.txt`, B's, not re-measured on the old markup): video reason 345.5 px nowrap, group 320.6 px; 3 lines (48 px) in the 128 px slot; the range reason 2 lines.
- C's live measurements (`runs/rsinfo-1280.txt`, `runs/rs-1440.txt`, `runs/rs-none-1280.txt`, `runs/mn6-1440.txt`).
- "Clipped" = the reason `<p>` bottom − the scroller's visible bottom (top + `clientHeight`).

| State | Viewport, panel | Scroller client / scroll | Clip Gain reason h / lines / **clipped** | Range reason h / lines / **clipped** |
|---|---|---|---|---|
| RS-VID (REAL video header) | 1440, 144 | 107 / 128 | 48 / 3 / **21 px** | — |
| RS-GRP (REAL ruler click + REAL Ctrl+A, 3 clips) | 1440, 144 | 107 / 128 | 48 / 3 / **21 px** | 32 / 2 / 0 |
| RS-NONE (REAL click on an empty SFX lane area) | 1440, 144 | 107 / 107 | 16 / 1 / 0 | 16 / 1 / 0 |
| RS-VID | 1280, 142 | 105 / 128 | 48 / 3 / **23 px** | — |
| RS-GRP (same method) | 1280, **122** (the group footer shrinks the panel) | 85 / 128 | 48 / 3 / **43 px** | 32 / 2 / **21 px** |
| RS-NONE | 1280, 142 | 105 / 105 | 16 / 1 / 0 | 16 / 1 / 0 |
| video at the 120 px minimum (MN-6) | 1440, 120 | 83 / 128 | 48 / 3 / **45 px** | — |

Notes:
- In every clipped state `scrollHeight > clientHeight`, and C's SYNTHETIC `scrollTop = max` brings the reasons fully into view (clipped 0). Screenshot `shots/rs-vid-1440-crop.png` shows the real default view: the reason's 2nd line is cut and the 3rd line (`ხაზის Volume/Mute`) is invisible, with **no scrollbar visible in the headless-Chrome screenshot**. The scroller has no scrollbar styling in `app/styles` (only the waveform `scrollbar-width: none` rules). Headless shell may use overlay scrollbars, so whether desktop Chrome shows a classic gutter was **not measured**.
- REAL Escape does **not** clear a selection (RS-NONE needed a click on an empty lane area). That is existing behaviour, not a bug claim.

→ **C-R40-01 (Low, new C evidence, pre-existing layout).** See the JSON for steps. Per §4.2, B designs it separately: shorter strings, or a placement that keeps the reason reachable for keyboard and touch users. `truncate` remains rejected (f).

## 4. R40-INFO — info column (C-R30-01)

| State | Info `<p>`s (top–bottom, h) | Overlap | Scroll | Verdict |
|---|---|---|---|---|
| **1280, music + range 9–11 shown** (the C-R30-01 state: panel 122, content 85) — `shots/info-music-range-1280.png` | 554–570, 572–588, 590–606, 608–624, 626–642; each **16 px** | none (`bottom ≤ next top`) | `scrollHeight` **96 > 85** (round 30: 85 = 85 with overlap). SYNTHETIC `scrollTop = max` (11) → the last line 615–631 ends exactly at the visible bottom 631 (`shots/info-music-range-scrolled-1280.png`) | **PASS** |
| 1280, SFX selected afterwards | A REAL clip-header click clears the range (`setTimeRange(null)` for non-range gestures), so the panel returns to 142. Info 5 × 16 px, no overlap, 105/105 | none | n/a | **PASS** (recorded: a header click clears the range. "SFX + range shown" is still reachable via REAL Apply on the SFX clip (MN-5 gave range 4–6), but the browse daemon was unresponsive after 18:05, so that literal state was **not measured**. The music + range state above is structurally the same, because the info column, the scroller and the Clip Gain column do not depend on which clip is selected) |
| 1280, group (REAL Ctrl+A, 3 clips; panel 122, content 85) — `shots/rs-grp-1280.png`, `info-grp-scrolled-1280.png` | `3 კლიპი` 554–570, `ხაზები …` 572–588 (16 px), `დასაწყისი …` 590–606, group note 608–640 (2 lines) | none | 128 > 85; `scrollTop = max` (43) brings everything into view | **PASS** |
| 1440, SFX / video / group | 5 × 16 px, no overlap at every state | none | — | **PASS** |

Compared with `c-round-30/shots/gui-1280x720.png`:
- the overlap of the title and the `ხაზი` line is gone;
- the column now scrolls;
- the cut 5th line has no visible scrollbar (the same affordance gap as C-R40-01, recorded there).

## 5. R40-MN, R40-CR, R40-K (1440×900; `runs/mn-1440.txt`, `mn6-1440.txt`, `crk-1440.txt`)

| ID | Result | Verdict |
|---|---|---|
| MN-1 (ST-1) | SYNTHETIC pd41 + REAL click on music Volume → the refusal status, 0 entries → SYNTHETIC pu41 → the status returns (`t0` = the previous status) | PASS |
| MN-2 (CR-1) | Clip Gain `3` → REAL click on music Volume → +1 `Clip Gain` (tail `[…, Clip Gain]`), focus `Volume — მუსიკა` | PASS |
| MN-3 (CR-4) | Clip Gain `3` → REAL click on the music header → +1 `Clip Gain`, focus BODY → REAL Delete deletes the music clip (`კლიპი წაიშალა; სიცარიელე დარჩა.`) | PASS |
| MN-4 (PG-DEL) | SFX selected → REAL music Volume → REAL Delete → 0 entries, all 3 clips present | PASS |
| MN-5 | REAL Apply without a gesture → `მონიშვნა: 00:04.000 — 00:06.000 · SFX.`, 0 entries, panel 144 → 144 | PASS |
| MN-6 | SYNTHETIC `.focus()` on the separator (a REAL click did not focus it) → REAL ArrowDown to **120** (`aria-valuemin` 120), 0 history entries. SFX + REAL type `3`: marker **1 line** (804–820, 69.8×16, `scrollWidth` = `clientWidth`), scroller `scrollHeight` 96 → 96 (+0, client 83, scrolls). The panel was left at 168 afterwards; that is browser-local only, and the context was later restarted | PASS |
| CR PM-VID | Video selected: input disabled, `aria-describedby` = the reason id, `title` = the reason, no marker | PASS |
| CR ST-2 | REAL Mute → SYNTHETIC pd41 → REAL Ctrl+Z refused (`Undo/Redo drag-ის დროს …`) → SYNTHETIC pu41 → the status returns to the previous one → REAL ruler + Ctrl+Z undoes Mute | PASS |
| K | Mute / Solo / Master Mute: 1 entry each, `aria-pressed` true. REAL Space with focus on music Volume → playing (pos 15.51); second Space → stopped. SYNTHETIC lane-height drag 81 → 111 px, 0 entries, faders unchanged | PASS |

## 6. Mutation table (R40-U)

| # | Mutation (scratch copy) | Failing test(s) | Expected | OK |
|---|---|---|---|---|
| snapshot | the round-39 `ArrangementDetailPanel.tsx` | F1, F2, F3, F4, F8 | = A's red run | ✓ |
| a | marker moved out of the button row (`mut-a.diff`) | F2 | F2 | ✓ |
| b | no `sr-only`, the full text in one span | F1 | F1 | ✓ |
| c | no `title` on the marker | F1 | F1 | ✓ |
| d | no `focus-visible:ring-warning` | F4 | F4 | ✓ |
| e | `ring-warning` also when not pending | F4 | F4 | ✓ |
| f | `truncate` on the Clip Gain reason | F5 | F5 | ✓ |
| g | label in an inline `<span className="truncate">`, `truncate` removed from the `<p>` | F1 | F1 | ✓ |
| h | no `shrink-0` on the lane line | F8 | F8 | ✓ |
| i | the input `title` = the full string even when not pending | F3 | F3 | ✓ |

`pending-status` (22) and `clip-gain` (28) stayed green under every mutation.

## 7. G40-3 — anonymous access and the premium boundary

Runs: `runs/g3-anon.txt` (first; its direct capture was later overwritten), `g3-anon-2.txt` (the header link), the 18:03 clean re-capture (`anon-direct.json`, `network-anon-direct.txt`, `anon-studio-me.json`), and `g3-session.txt`.

- **Header link** (home → the visible `Studio Lab` link at 826,40; the preceding `$B restart` printed "failed to start within 15s", so this context's freshness is **unverified**; `auth_user` null and the empty cookie hold regardless):
  - `/studio-lab`, `auth_user` null, no cookie, workspace shown, badge `დემო კოლექცია — ავტორიზაცია არ სჭირდება`;
  - 47 requests: 0 to `studio-token` / `recording-` / `/api/download` / R2;
  - media only `middle-east.mp3`, `hero-music.mp3`.
- **Direct** (18:03, in a confirmed new daemon: the state file was re-created at 18:02):
  - same result;
  - 164 requests, 0 forbidden;
  - media = the 2 demo MP3s;
  - API = only the root `GET localhost:5199/api/cart` (allowed);
  - other hosts: Google Fonts, plus GA/GTM (root, allowed).
- **Session** (workspace interactions with `authhook.js`): `authreq []`, so no `Authorization` header from workspace code; 0 forbidden requests.
- **Premium:**
  - an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → **401** `Please sign in to access Studio.`;
  - a fake Bearer → **500** `Unable to prepare Studio access`, no token (known root item: fake Bearer → 500);
  - `/studio/middle-east` → **Sign in required**, no workspace (`shots/anon-studio-me.png`).
- **Premium auth is not bypassed.**

**C-R23-01 / C-R38-01 record** (Tech Lead, carried; not a round-40 regression):
- `curl /studio-lab`: **63 654 bytes** (round 39: 63 611), **5 NUL** at **11729, 28025/28026, 58745/58746**, the same offsets as round 39.
- The NULs sit inside the SSR attribute/text bytes:
  - 11729 in the library-collapse `aria-label` (`ბიბ\0ლიოთეკის …`);
  - 28025 in `Arrangement · \0\0…`;
  - 58745 inside the **`range-ის დ\0\0ასაწყისი (წამი)`** `aria-label`.
- Hydrated DOM: **2 U+FFFD labels** (round 39: 1): `ბიბ�ლიოთეკის დაკეცვა` and `range-ის დ��ასაწყისი (წამი)`.
- The source files and the Vite-served modules (`curl …/ArrangementDetailPanel.tsx`, `…/ArrangementLibrary.tsx`) are valid UTF-8 with 0 NUL and 0 U+FFFD (`runs/mod-*.js`).
- So the corruption is in the dev SSR transport at fixed byte offsets. Round 40's +43 bytes moved the content under the fixed 58745 offset into a new label; A's code did not corrupt it.

## 8. Ableton two-verdict table (§4.8; no new browsing, no video)

| Behaviour | CZABA requirement | Ableton conformance |
|---|---|---|
| An unsaved value-box entry is marked | **Met** (R40-PM: marker, `data-pending`, warning border and ring) | **Unconfirmed**: no source found in the Live 12 manual §3.2 capture (`b-round-37/ableton-live-concepts-20261013.txt`). C does not claim Ableton does this |
| The hint is shortened to one visible word; the full text is on hover and for screen readers | **Met** (`title` on the marker and the input; `sr-only` remainder; `aria-describedby` text = the full string) | **Not applicable**: CZABA layout decision D-29z5 |
| Info lines never overlap; the panel scrolls instead | **Met** (R40-INFO) | **Not applicable**: CZABA layout fix C-R30-01 |

## 9. Not run this round (by §4.7; not PASS)

Exports and WAV integrity; video sync and C-R27-01; the full find sound → add → fit video → export flow; the FB-01..FB-16 stage regression. None of them were touched by this round's single-file layout change.

## 10. Carried items and follow-ups for B

**New:**
- **C-R40-01 (Low):** the disabled Clip Gain reason (and, in the 1280 group state, the range reason) is clipped below the visible content box. The amounts are 21 / 23 / 43 / 45 px (range reason 21 px), and there is no visible scroll affordance. It needs its own design round (shorter strings or another placement; not `truncate`).
- **Criterion wording:** PM-1's "same top ±2 px" contradicts the contract's `items-center`. Use the "same centre" wording next time.
- **Baseline correction:** the canonical fresh-load geometry at 1280×720 is panel 142 / first lane 273 (round 39's 144/123 was a resize without a reload).
- **Doc 038 stale lines** (outside A's §2.2 permission): l.45 "`0 dB` ღილაკის ქვემოთ" and TODO l.230/233/234. Fold them into DOC polish.
- **Optional hardening** (A's reviewer, not required): `shrink-0` on `0 dB`; F4 does not pin `ring-2`.
- **Environment:**
  - the dev server was down 16:55–17:18 (root restarted it);
  - the gstack browse daemon failed to start within 15 s twice, one `restart` hung for 10 min, and after 18:05 it stopped responding (a 10-min `js` call timed out). `stop` timed out after 60 s, but its state file `c-browse.json` is gone. No foreign `bun`/`chrome-headless-shell` process was killed. The final node.exe was 37;
  - node.exe 20 → 32.

**Round 40 checkpoint readiness:** C PASS on the contract. The 3 round-40 paths are ready for a root checkpoint together with round 39's 5 (exact shas above). C-R40-01 is open and is not a regression.

**Open (carried, unchanged):**
- C bugs: C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome); C-R23-01 + C-R38-01 (record above).
- Low items: R26-M1; 4b-2 groups 2–4 (rounds 41–43); A-R38-TEST-ORDER, R9-REVIEWER-M1-L8, PREVIEW-VOLUME-IDENTITY, A-R34-REVIEW-RESIDUALS; DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, LIB-SEP-REASON, SSR-LAYOUT-EFFECT-WARN; the DOC034/035/036/015 notes; EXPORT-DIALOG-FOCUS-RESTORE.
- Root items (`root-pre-push-review.md`, `publication-checkpoint.json`):
  - the 17 `.codex/agents/*.toml` files; the ignored `.kilo/`;
  - `npm run test:e2e:smoke` (root only);
  - SRW-21 (the purchased loader hardcodes middle-east);
  - Lenis on `/studio/*`;
  - portable instruction-file paths;
  - the export hard-clip at 0 dBFS;
  - the CRLF Biome errors on the auth files;
  - the `frontend-architect.md` grant;
  - the `Modal.tsx` focus gap;
  - GA `scroll` with consent denied;
  - fake Bearer → 500;
  - the CDP allowlist;
  - `Content-Type` without a charset;
  - the root review's open M/L items (M1 lookahead driver, M2 render load, M3 doc 012; L1 undo during a gesture; L2 hold-window reschedule; L3 Delete key repeat; L4 `setPointerCapture` throw; L6 the export dialog text; L7 unbounded history; L8 the unwrapped `new AudioContext`);
  - the dev server's availability and the machine load.
- Tech Lead manual checks: R38-T (including A-R38-REVIEW-TOUCH), R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11.
