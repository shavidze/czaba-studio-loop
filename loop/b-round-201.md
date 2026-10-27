# B: Round 201 → 202 planning (D-29z167)

Date: 2026-10-27, planned from 02:05 UTC · Author: B · Advisor: **available and used**, once after orientation and once after writing (§8).

## 1. Inputs read
- **Loop files:**
  - `context/active-summary.md` (head), `current-task.md` (round 201), `a-round-201.md`, `c-round-201.md`, `c-round-201.json`, `b-next.json`, `b-round-200.md`, `lessons.md`.
  - `backlog.json`, looked up by id only: `SABA-B-4`, `C-R200-01/02`, `C-R196-03`, `GLOBAL-FOCUS-VISIBLE-UNLAYERED`, `rounds[-1]`, `retro_runs`, `post_current_stage_queue`.
- **Gate:** `gates/gate-round-201.json` is **skipped** ("C taskStatus FAIL"), so nothing was published. The baseline stays `5b1a2bb` (gate 199).
- **Regression:** `regression-last.json` is 2026-10-27 / round 199, so the next one is due on or after 2026-10-30. No regression round now.
- **Store tree:** clean at the start of planning (`b-round-201/git-status-at-planning.txt`, 0 bytes).
- **Archive:** `tasks/round-201.md` = the round-201 `current-task.md`. `cmp` was OK, and the archive was created before any new writing.
- **Backups:** `b-round-201/*-before-r202.*` (backlog, feature-status, b-next, current-task, lessons, regression-last, retro-200).

## 2. Acceptance results used (independently evidenced by C)
- **C round 201: FAIL** ("not implemented (A STOP)"), with `browserVerified=false` and `realVerified=false`.
  - **Passed:** SOURCE-SCOPE, G201-3 at both viewports (the purchase protection still holds), and RT-FIX.
  - **Closed on that evidence:**
    - C-R200-01 and C-R200-02 (RT-FIX PASS);
    - RETRO 200 (board → მზადაა; it is a document round, and RT-FIX is its evidence);
    - C-R201-02, a wording Low that B fixed in `lessons.md` L12 and `retros/retro-200.md` §3 row 178 + new §10. The partition and the numbers did not change.
- **No feature item changes status.** Round 201 changed no source, and SABA-B-4 stage 2 has no browser evidence yet.

## 3. Ruling on A's STOP (L10)
- **The collision is real, and B caused it.** `SfxVideoSync.tsx:34–47` is a label with a `focus-within` ring around an `opacity-0` file input. After R94 removes the ring, nothing visible remains (A's probe: 693 → 69 brass px, which is the same as unfocused).
- **B ran a hidden-focusable scan** (`b-round-201/tools/hidden-focusable-scan.py`, the new L1 requirement). At HEAD it finds 6 sites (`out/hidden-focusable-scan-head.txt`):
  - **R98, SfxVideoSync:** the label becomes a `<button type="button">` with the same classes minus the ring. It calls `fileInputRef.current?.click()` on a sibling `hidden` input with `tabIndex={-1}` that keeps its aria-label.
    - **Why:** it needs no STF2 exception, keeps the single shared focus rule, and keeps the look. A's options (a) and (b) need an exception and a second copy of the ring values. Option (c) leaves a Medium WCAG 2.4.7 loss. Option (d) keeps a box-shadow ring.
    - **Evidence:**
      - The Chromium harness (`out/filechooser-probe.json`): Tab lands on the button, which shows a solid 1px brass outline. Enter, Space and mouse each fire `filechooser`, with a fresh page per method. In a first single-page run, Enter showed "none"; that was a harness artifact, and the rerun with fresh pages fired. C uses fresh pages.
      - The scratch copy (R94 sweep + R98 + R99): store inventory 16/6; the 25 covering test files plus 2 more (27 files, 336 tests) green; `tsc --noEmit` clean.
  - **R99, ProductCard.tsx:132:** the md+ hover-only overlay gets `focus-within:opacity-100`.
    - **Browser probe at HEAD** (`out/hidden-focus-probe-head.json`, mock on :5199, 900 ms settle): all 7 "Play preview" buttons on `/` are focused at effective opacity 0, at 1280×720 and 1440×900. Filed as **B-R201-PRODUCTCARD-HIDDEN-PREVIEW** (Medium), fixed in this round.
    - **L4 clause:** the reveal of a parent container is not a focus fill.
  - **R100, VideoShowcase.tsx:** it is imported nowhere, so it never renders. The round-201 CSS-CONTROLS row wrongly placed its sliders on `/`. The row now drops them. The file is not touched. Filed as **B-R201-VIDEOSHOWCASE-UNUSED** (Low, `deferred_low_polish`).
  - **Header.tsx:107:** the signed-in user menu is `opacity-0 invisible group-hover:visible`, so its 4 items can't be reached with the keyboard. That is reachability, not focus style, and the browser can't test it without auth.
    - Filed as **B-R201-HEADER-USERMENU-KEYBOARD**, **Medium** (WCAG 2.1.1; data is safe, and the routes can still be reached by URL).
    - It is scheduled as the next bounded task after this stage (`b-next.remaining`). It is **not** in round 202: it would add an untestable change to a round that is already one full stage.
  - **The 2 honeypots** (`tabIndex={-1}`): not tabbable, no change.
- **"Browse the Collection"** showed effective opacity 0 at 1280 only, on both probe runs (Tab indices 26/27, with a 900 ms settle). It is probably a scroll-reveal transition that had not finished. It is unconfirmed and not filed. C re-checks it after a ≥ 2 s settle; if it holds, it is the same class as B-R201-PRODUCTCARD-HIDDEN-PREVIEW (pre-existing, recorded, does not fail RING-VISIBLE).
- **The STOP rules now name the SfxVideoSync collision as ruled**, so A does not STOP on it twice.

## 4. Decision: round 202 = SABA-B-4 stage 2 re-dispatch
- **Basis:**
  - the round-201 outcome table, row "A STOP" (B rules, then re-dispatches);
  - Saba's binding SABA-B-4 widening;
  - no open Critical, High or Medium finding that reproduces in the cloud outranks it. B-R201-PRODUCTCARD-HIDDEN-PREVIEW is fixed inside this round.
- **Round size:** one feature stage. The three hidden-focusable rulings belong to that stage's "every focusable shows it" requirement. SYS-1 is not pulled forward.
- **Grants:** the same 31 files, byte-identical start copies (`b-round-201-r202-granted-start-sha256.txt` matches the round-201 copies). SfxVideoSync and ProductCard get wider permissions.
- **New files:** 3; the R98 jsdom test is added. Frozen list: 1001 entries, checked OK.
- **The after-count (16/6) comes from the real scanner on the scratch copy**, not from reading the regex. The hidden-focusable scan's after-state (5 sites, ProductCard reveal=True) was measured the same way.
- **New C rows:**
  - HIDDEN-FOCUS (R99);
  - CHOOSE-VIDEO (R98): in-app if `/scenes/:id` renders with the mock; otherwise a harness test, with the in-app half BLOCKED.
- **STF additions:**
  - STF5 now flags `focus-within:ring-2` and passes `focus-within:opacity-100`;
  - a new STF6 guards hidden focusables.
- **Mutants:** m6–m8 are new.
- **Ableton:** does not apply.

## 5. Scope check (unchanged constraints)
- FB-01..FB-16 and the SRW items: unchanged. SRW-21 stays `deferred_user`.
- Professional plugins, effects, pitch and multi-video layers stay out of scope. Grid tempo is not audio stretching.
- Protected auth/purchase files are untouched, and G202-3 re-checks them.
- `/studio-lab` stays demo-only and public.
- The keep-list is checked.
- Saba's queue order is unchanged.
- The ABL-R and DUX-R items stay `awaiting_user`.

## 6. Architecture signals and checkpoint
- Round 201 produced no reviewer note (no code).
- SABA-B-4 stage 2 closes a feature boundary. When round 202 passes, B asks root for the bounded **frontend-architect checkpoint**: `b-round-197.md` §6 + ARCH-R198-FOCUS-REGION, plus one question: "is a shared hidden-file-input button pattern worth extracting (SfxVideoSync now, VideoUploadZone/ArrangementLane already have file inputs)?" It is non-blocking, and SYS-1 is not delayed for it.

## 7. Why not COMPLETE or BLOCKED
- **Not COMPLETE:**
  - SABA-B-4 stage 2 has no browser evidence;
  - still to do: B-R201-HEADER-USERMENU-KEYBOARD, SYS-1..3, STORE-2b..5, REVIEW-RECOMMENDATIONS, STUDIO-PERFORMANCE, T12-ADVANCED and the phase-2 entries;
  - 276 deferred Lows;
  - the backend-blocked evidence and the Tech Lead manual checks.
- **Not BLOCKED:** the ruling is B's to make, and nothing needs external input.

## 8. Advisor
- **After orientation.**
  - **Adopted:**
    - write R98 as a named ruling with behaviour rows (filechooser on Enter, Space and mouse);
    - take the after-count from the real scanner on a scratch copy;
    - add an STF5 opacity fixture;
    - regenerate the frozen artifacts;
    - read the probe before writing;
    - stop B's mock (done: :5199 → 000);
    - use only RT-FIX PASS as evidence;
    - fix the C-R201-02 wording;
    - keep one stage per round.
  - **Not adopted, with evidence:**
    - **Granting VideoShowcase:** the import grep shows it never renders.
    - **Rating the Header menu Low:** B rates it Medium (keyboard users can't reach the account items; WCAG 2.1.1) but keeps it out of this round, as the advisor suggested.
- **Review after writing:** see §10.

## 9. Readiness for root
- Nothing in `store/` changed in this planning step: `git status` is empty and HEAD is `5b1a2bb`. B's scratch copy was at `/tmp/b202-scratch` and was deleted at the end.
- **Round-202 artifacts:**
  - `b-round-201-r202-grants.txt` (31);
  - `b-round-201-r202-new-files.txt` (3);
  - `b-round-201-r202-tree-sha256.txt` (1001, OK);
  - `b-round-201-r202-granted-start-sha256.txt`;
  - `b-round-201/r202-granted-start/`;
  - `b-round-201/tools/{hidden-focusable-scan.py,hidden-focus-probe.cjs,filechooser-probe.cjs}`;
  - `b-round-201/out/*`;
  - `b-round-201/update-backlog.py`.
- **The loop state commit should include:**
  - `tasks/round-201.md`, `current-task.md`;
  - `retros/retro-200.md`, `lessons.md`;
  - `backlog.json` (v187), `feature-status.md`, `b-next.json`;
  - `b-round-201/`.

## 10. Addendum — advisor review after writing (all adopted)
1. **SV5:** it now asserts only `toBeDisabled()`. A synthetic `fireEvent.click` on a button that is disabled only through its fieldset still runs React's `onClick` in jsdom, so the old assertion would have been a false red. "busy → no chooser" moved to A's step-8 browser check.
2. **Step 8:** A also measures the "Choose video" button box against the ref label box, because CHOOSE-VIDEO requires ±0 px and B did not measure it.
3. **"Browse the Collection":** the wording is corrected. It recurred on the 900 ms run at 1280, so C re-checks it after a ≥ 2 s settle, under the existing RING-VISIBLE clause.
4. **`narrow_grants`:** the round-202 entry now uses store paths (SfxVideoSync.tsx, ProductCard.tsx), not a loop-folder file name.
5. **Retracted by the advisor on B's evidence:** granting VideoShowcase, and rating the Header menu Low.
