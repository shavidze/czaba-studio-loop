# C — Round 34 ვერიფიკაცია (FOCUS-TEXT-STALE, CLIP-GAIN-CLICK-DISCARD, A-R33-REVIEW-SCROLLBAR; D-29y)

Verifier: C · 2026-10-13 (15:49–16:20 +04:00) · Server `http://127.0.0.1:5173/studio-lab` 200. Served module contains `releaseEditFocusOnTimelinePointerDown`/`isScrollerGutterPointer` (4 matches, `c-round-34/gates/served-module.txt`) · Browser: gstack `/browse`, state `c-browse.json`, HeadlessChrome 145, anonymous context (`auth_user` null, cookie ''), 1440×900 (+ 1280×720 spot check) · node.exe 6–8 during gates; 7 during the browser runs. Two one-off readings came from other processes: 19 and 11 during CG-6 attempts 3 and 4.

**taskStatus: PASS.** Every round-34 criterion passed with C's own runs. One new bug **outside the round contract** is confirmed in a browser: C-R34-01, which is A's A-R34-REVIEW-1. There is also one Low doc inaccuracy (C-R34-02). Neither blocks this round.

App source was not edited. Mutations ran only in a scratch copy. There was no commit, push or deploy.

| ID | Verdict | Evidence |
|---|---|---|
| G34-1 | PASS | `c-round-34/gates/` (tsc, fader-guards, frozen, vitest-full, build, biome-app, biome-err, g34-1-summary) |
| G34-2 | PASS | `gates/g34-2-end.txt` (+ start in `c-round-34/checkpoint.md`) |
| G34-3 | PASS | `gates/anon-header.json`, `anon-direct.json`, `anon-studio-me.json`, `network-*.txt`, `session-hooks.json`, `curl-token.txt` |
| R34-TS | PASS | `runs/ts-1440.txt`, `ts-1280.txt`, `ts-mustnot.txt` |
| R34-CG | PASS | `runs/cg-1to4.txt`, `cg5.txt`, `cg-unchanged.txt`, `cg6-1..4.txt`, `cg6-tat-times.txt` |
| R34-SB | PASS (gutter synthetic, labelled; empty area **real click**) | `runs/sb-geometry.txt`, `sb-synthetic.txt`, `sb-empty-real.txt`, `sb-empty-real-master.txt` |
| R34-R33 | PASS | `runs/r33-ft.txt`, `r33-g.txt` |
| R34-K | PASS | `runs/k-synthetic.txt`, `k-real.txt`, `k-space.txt` |
| R34-S | PASS | `gates/snap-*.diff` |
| R34-U | PASS | `runs/r34u-summary.txt`, `r34u-mut-*.diff/.txt` |
| R34-Doc | PASS (one Low inaccuracy, C-R34-02) | doc 036 §Round 34 (l.309–385) |
| Export / audio graph / video sync / PUI / C-R27-01 | **not run** | §4.7 of the task: nothing in the audio graph, export, scheduler, video or lane changed. R34-S proves this (only the capture handler and one helper changed). These are not PASS for this round. |

## G34-1 (C ran these itself)
- `npx tsc --noEmit`: exit 0.
- `fader-guards.test.tsx`: **54/54** (37 + 17).
- Frozen + library: **13 files, 237/237**.
  - clip-gain, detail-panel, detail-panel-polish, track-pan, delete-selection-ui, all-lane-clipboard, track-layout, gesture-guard, master-ui, ArrangementContext, render-budget;
  - library: `library.test.ts` + `library-preview.test.tsx`. They do not exercise the search input.
  - Tests that do touch the search (grep for `arrangement-library-search|handleSearchKeyDown|ბიბლიოთეკაში ძიება`, `gates/search-tests-grep.txt`): `delete-selection-ui` (in the list above), `fader-guards` and `floating-video.test.tsx`. floating-video was green in the full 1247 run.
- Full vitest: **69 files, 1247/1247** (1230 + 17). No timeouts.
- `npm run build`: ✓ (2.49 s).
- Biome `./app`: **2 errors**, 218 warnings, 1 info.
  - Both errors are `format` errors on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts` (root's CRLF baseline).
  - `StudioWorkspace.tsx` and `fader-guards.test.tsx` have 0 diagnostics.
- node.exe: 6 → 7.

## G34-2
**Start (15:49) and end (16:14) are identical:**
- HEAD `1cefea1` (root has not committed);
- `git status --short` has the same 9 lines (§3.2);
- `b-round-33-tree-sha256.txt`: 376 OK, 0 not-OK;
- protected files 4/4 OK.

**A's files** (mtime 15:37 / 15:45 / 15:45; none changed during C's run):
- StudioWorkspace `b64a2cf6`;
- fader-guards `11a19bf6`;
- doc 036 `e86072b8`.

## R34-S (static)
**`StudioWorkspace.tsx`:** 3 hunks, +14/−3.
1. New module helper `isScrollerGutterPointer`. It returns false when `target !== currentTarget`; otherwise it returns `clientX − rect.left − clientLeft ≥ clientWidth || clientY − rect.top − clientTop ≥ clientHeight`.
2. The rename to `releaseEditFocusOnTimelinePointerDown`, the predicate `(isRangeInputTarget(focused) || isTypingTarget(focused))`, and the added `!isScrollerGutterPointer(event) &&`.
3. The single JSX use.

Everything else is byte-identical: the keydown handler, the round-32 guard, `isTypingTarget`, `isSliderTarget`, `isRangeInputTarget` and `handleLaneBackgroundPointerDown`.

**`fader-guards.test.tsx`:** append only (+432/−0).

**Doc 036:** the header line plus an append (+58/−1).

**The `+` lines contain:** no `//` comments, no hardcoded colours, no `any` and no `@ts-ignore`.

## R34-TS — search → timeline click → key (real clicks, real keys)

**Method:**
- Each cell: a real click on the search, `type ab`, a real click on the target, then a real Delete or Backspace.
- After each cell: Ctrl+Z and a check that `past` is back to the base and the clip is back with the **same id** (`7fbe8e34`).
- 1440×900 is verified by `innerWidth` in every row. The detail panel is collapsed here, as in the app's persisted state.
- R34-CG ran with the panel expanded. The scroller geometry for both states is in `sb-geometry.txt` (R34-SB).

| Target | activeElement after the click | search / items | Delete | Backspace |
|---|---|---|---|---|
| SFX header | BODY | `ab` / 4 (= after typing) | +1 `კლიპის წაშლა`, 3→2 clips, gap | +1, gap |
| empty SFX lane → header | BODY (lane click: sel [], pos 14.4) | `ab` / 4 | +1 | +1 |
| clip body (waveform) | BODY (selects SFX, pos 5) | `ab` / 4 | +1 | +1 |
| ruler, no selection | BODY, pos 14.4 (seek) | `ab` / 4 | status „წასაშლელად აირჩიე კლიპი…“, 0 entries | 0 entries; text **not** edited (`ab`) |
| ruler, SFX preselected | BODY, seek | `ab` / 4 | +1 | +1 |

- The music and video clips keep their places, so the deletes leave a gap. No click writes an entry (`clickEntries=0`).
- **Must-not** (`ts-mustnot.txt`): the search is focused, `ab` typed, no click. Backspace gives `a`; Delete with the caret at the end does nothing. Clips and `past` (3) are unchanged; focus stays in the search.
- **1280×720 spot check** (`ts-1280.txt`): search → header → Delete and Backspace each delete with +1, and the search stays `ab`.
- `ts-INVALID-vp1280-first.txt` and `ts-ruler-INVALID-vp-unverified.txt` are the first runs. They were made before C checked `innerWidth`; they actually ran at 1280. Same results, kept for transparency.

## R34-CG — the typed Clip Gain value is committed, not lost (real clicks, no Enter)

Each case starts with a real click on the SFX header, a real click into the field, Ctrl+A, then real typing. Before these runs C expanded the detail panel with a real click on `arrangement-detail-toggle`.

| Case | Click | Result |
|---|---|---|
| CG-1 `3` | music header | +1 `Clip Gain` at the click (status „Clip Gain: Soft impact — +3.0 dB.“); SFX `gainDb 3`; music selected; focus BODY. Delete → tail `[Clip Gain, კლიპის წაშლა]`, music deleted |
| CG-1u `3` | music header → SFX header again → one Ctrl+Z | the field shows `3.0` on reselect; **one** Undo returns SFX to no gainDb and the field to `0.0` |
| CG-2 `3` | SFX header itself | +1 `Clip Gain`; Delete → tail `[Clip Gain, კლიპის წაშლა]`, SFX deleted |
| CG-3 `3` | empty SFX lane | +1 `Clip Gain` on SFX; sel []; pos 14.4 |
| CG-4 `0` / `0.0` | music header | 0 entries |
| CG-5 `-`, `1e` (`badInput:true`, `.value ''`) | music header vs **Tab** control | both: status „Clip Gain: შეიყვანე რიცხვი dB-ში (−60…+24).“, 0 entries |
| CG-5 `99` (valid, out of range) | music header vs Tab | both: +1 entry, clamped to **+24.0 dB**, same status |
| Unchanged | Enter +1; `0 dB` reset +1; Escape → text `0.0`, 0 entries, and the next blur 0 | `cg-unchanged.txt` |

### CG-6 — live audio

**Summary first:** inside the window each commit gives **2** clip-gain `setTargetAtTime` calls (the playing source + the already scheduled next-iteration source); outside the window it gives 1 (the pending source). The task's wording "exactly one" assumes playback without a loop. C counts this as PASS; the reason and the wording for B are below the table.


**Setup:**
- Hooks (C instrumentation; no source change): `createGain`, `connect`, `AudioParam.setTargetAtTime`, `AudioBufferSourceNode.start`.
- **Loop deviation:** a 3.5–6.5 range on the SFX lane is refused („მონაკვეთი კლიპის საზღვრებში უნდა იყოს“), because a range must lie inside a clip. The loop is therefore **3.5–6.0** from a range on the video lane, then Ctrl+L.
- Each run: Space, then a real click on the SFX header, a real click into the field, `3`, then a real click on the music header.

| Attempt | pos at commit (hook) | ctx t | Clip-gain `setTargetAtTime(1.412538, τ 0.015)` | New `start` caused by the click | Verdict |
|---|---|---|---|---|---|
| 1 | **3.81** (outside [4,6)) | 5.36 | 1 call: `g12` = the **already scheduled** SFX source (when 5.55, not yet started) | 0 | control (replacement 1/2) |
| 2 | **5.281** | 32.85 | `g25` (**playing**, when 31.57–33.57) + `g27` (pending, next loop iteration, when 34.07) | 0 | valid |
| 3 | **5.459** | 46.56 | `g40` (playing) + `g42` (pending) | 0 | valid |
| 4 | **5.03** | 59.51 | `g55` (playing) + `g57` (pending) | 0 | valid |

- **Budget:** 3 valid runs and 1 replacement, used as the control.
- **No restart:** every `start` after the commit is the scheduler's usual next-iteration lookahead (when +2 s, pos ≈ 4.01 each iteration, also seen in the `next-iter` dumps). No start has `when` ≈ the commit time.
- **New sources carry the new gain:** every SFX source started after the commit has `gv = 1.412538` (`g14, g16, g29, g31, g44, g46, g59, g61`). This is the R30-GL oracle.
- **Every commit also re-targets 5 line/master gains** (`g1..g5` etc.) to `1` with τ 0.015. That is the same sync as in R30-GV; those are not clip-gain nodes.
- **Oracle wording, for B:** §4.2 says "**exactly one** setTargetAtTime on the SFX clip gain path". In loop playback the scheduler holds both the playing source and the next iteration's pending source, so each commit has 1 call **per existing SFX source node**: 2 inside the window, 1 outside.
  - C counts this as PASS. It is the round-30 R30-GL behaviour, accepted then, and it is correct: without the call, the pending source would play at the old gain.
  - Nothing in the audio path changed in this round.
  - B should reword the oracle to "1 per live or scheduled SFX source node, 0 restarts".

## R34-SB — gutter and empty area

**Geometry** (`sb-geometry.txt`):

| Viewport | Detail panel | Scroller rect | client | offset | scrollW | Empty strip below the lanes |
|---|---|---|---|---|---|---|
| 1440×900 | collapsed | 288,191 1152×604 | 1142×604 | 1152×604 | 2344 | **236 px** (lanes bottom 559, scroller bottom 795) |
| 1440×900 | expanded | 288,191 1152×496 | 1142×496 | 1152×496 | 2344 | **128 px** (lanes bottom 559, scroller bottom 687) |
| 1280×720 | expanded | 288,229 992×280 | 982×280 | 992×280 | 2344 | 0 |

- `clientLeft/Top` 0; `scrollbar-gutter: stable`; the scrollbar is styled (`[&::-webkit-scrollbar]:w-2.5/h-2.5`).
- **Unlike the task's assumption, headless reserves a 10 px vertical gutter** (`offsetWidth − clientWidth = 10`).
- The horizontal scrollbar takes **0 px** (`offsetHeight = clientHeight` even though `scrollWidth > clientWidth`). Headless hides scrollbars.
- `elementFromPoint` in the vertical gutter returns the **children** (`arrangement-ruler`, a lane div) at lane heights, and the scroller itself only below the lanes. Without a painted scrollbar, headless hit-tests through the gutter, so a **real** headless click at a lane height would land on a child. This is a headless artifact. The real check is the Tech Lead's R34-T(3).

**Synthetic, labelled** (`sb-synthetic.txt`): `pointerdown`/`pointerup` dispatched on the scroller element itself, then a real Backspace.

| Focus | Point | Focus after | Backspace |
|---|---|---|---|
| search `ab` | gutter x 1435, y 439 (lane height) | search | edits `ab`→`a`, 0 entries |
| search `ab` | gutter x 1435, y 657 (`elementFromPoint` = scroller) | search | `a`, 0 entries |
| music Volume (`focus()`) | gutter y 439 / y 657 | Volume | 0 entries |
| search `ab` | empty area x 588, y 657 (inside the client box, `elementFromPoint` = scroller) | **BODY** | deletes SFX +1, search stays `ab` |
| music Volume | empty area | **BODY** | deletes +1 |

**Empty area, real click** (`sb-empty-real.txt`, `sb-empty-real-master.txt`):
- C folded all 4 lanes with real clicks on `arrangement-track-fold`, so the lanes end at y 379.
- The scroller centre (864, 439) then hit-tests to the scroller itself (`elementFromPoint` checked before every click).
- A real `$B click` on the scroller:
  - search `ab` → **BODY**; Delete and Backspace each delete SFX (+1); the search stays `ab`;
  - Master Volume (`focus()`) → **BODY**; Delete and Backspace each delete (+1).
- Two music-Volume cells are **invalid**: folded lanes hide the track faders, so `focus()` hit null. They were replaced by the Master rows.
- Afterwards C unfolded all 4 lanes with real clicks; lanes bottom is back at 559.

## R34-R33 — round-33 regression
- **FT-1** music Volume (real click; the value jumps, +1 `Volume`) → SFX header → Delete: focus BODY, +1, deleted.
- **FT-2** Master → ruler → Delete: BODY, +1.
- **FT-3** music Pan → empty lane → header → Backspace: BODY, +1.
- **Must-not:** music Volume via `focus()`, no click. Delete and Backspace change nothing; focus stays on Volume.
- **R33-G** (synthetic, Pan id 41 + header id 42, playing): Pan keeps focus; `tatSince42 = []` (0 calls at id 42); 0 entries before the window `pointerup` 41, then +1 `Pan — მუსიკა` (stored −0.4).

## R34-K — adjacent behaviour (a text field focused first)

**Synthetic** (`k-synthetic.txt`):

| Gesture | Field focused | Focus after | Result |
|---|---|---|---|
| SFX drag +40 px | search | BODY | 4 → 5, +1 `კლიპის გადატანა` |
| trim right −20 px | Clip Gain | BODY | 2 → 1.5, +1 |
| marquee over video + SFX | search | BODY | sel 2, 0 entries |
| empty lane click | search | BODY | pos 22.475 |
| loop brace body drag | search | **brace focused** | loop 9–11 → 11.5–13.5, +1 `Loop-ის დიაპაზონი` |

**Real clicks** (`k-real.txt`, `k-space.txt`):
- **Playhead handle:** search `ab` → a real click on the handle → focus `Playhead` → Delete deletes SFX (+1).
- **Space:**
  - the first attempt was **invalid**: it started at 22.475, near the project end (23); playback ended by itself and the second Space restarted it.
  - Rerun from 0: search → header → Space plays (pos 0.998), Space again stops; search stays `ab`.
- **Search clear `×`:** gives `''` and 9 items.
- **Search keys:** Escape clears the search; `soft` + ArrowDown moves focus to the first option (BUTTON).
- **Detail start/end + Apply** (search focused first): range 9–10.5 on music applied.
- **Detail start typed** (no Enter) → header click: focus BODY, 0 entries, range not applied.

**Record only:**
- REC-OUT-1, library item: focus BUTTON, and Delete deletes the SFX clip (+1).
- REC-OUT-2, detail header label: BODY, and Delete deletes.

Both are identical to round 33 (`rec-outside.txt`); B decision 4 is unchanged.

## R34-U — mutations (scratch copy `c-round-34/mut/`, `node_modules` junction)

**Config:** fader-guards, clip-gain, detail-panel, track-pan, gesture-guard (151 tests).

| Mutation | Tests failed | Killed |
|---|---|---|
| control | 0 / 151 | — |
| snap (round-33 `StudioWorkspace.tsx`) | 13: cases 1–6, 8, 9, 11, 12, the R5 boundary test, SC-a, SC-b; 10 and 13 green | — |
| (a) `\|\| isTypingTarget` removed | 12 (1–6, 8, 9, 12, R5, SC-a, SC-b) | ✓ |
| (b) gutter condition removed | 3 (10, 11, R5) | ✓ |
| (c) gutter → `target !== currentTarget` | 2 (12, R5) | ✓ |
| (d) typing → `type === 'search'` | 6 (4–6, 8, 9, SC-b) | ✓ |
| (e) gesture condition removed | 2 (round 33's Pan drag test, the new R6 test) | ✓ |
| (f) `onBlur={() => undefined}` in DetailPanel | 7 (4–6, 8, SC-b + 2 clip-gain blur tests) | ✓ |
| (g) `clientLeft/Top` dropped (A's suggestion) | 1 (R5) | ✓ |

- **Restore:** `diff -rq` between the store's `app` and the scratch copy is IDENT; the junction was removed and `store/node_modules` is untouched.
- **Divergence from A's prediction:** (f) also kills case 8 (an empty text blur that writes status). That is stronger, not weaker.

## G34-3 — anonymous access, premium not bypassed
- **Fresh browser** (`$B restart`): `auth_user` null, cookie ''. localStorage contains only `czaba_spotlight_last_shown` and `czaba_session_id`.
- **Header link** `Studio LabDemo` → `/studio-lab`: the workspace is shown, with the badge „დემო კოლექცია — ავტორიზაცია არ სჭირდება“. There are no `studio-token`/`recording`/`download`/R2-host requests.
  - Known and allowed: `GET /app/lib/r2.config.ts` (dev module), `localhost:5199/api/cart`, GA collect, fonts, `images.unsplash.com`.
  - Media: `/middle-east.mp3`, `/videos/hero/hero-music.mp3`, plus C's `blob:` uploads.
- **Direct open:** the same, 0 forbidden requests.
- **Session hooks** (fetch/XHR/beacon/Authorization), installed in the working session and recorded during one TS cell, CG cases and the k34 drag set: **all 0** (`session-hooks.json`).
- **curl:** anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → **401** „Please sign in to access Studio.“. A fake Bearer → **500** „Unable to prepare Studio access“ with no token (known root item).
- **`/studio/middle-east`:** „Sign in required“, 0 `<audio>`.
- **C-R23-01 record:** `curl /studio-lab` = 63 520 bytes, **2 NUL** at 28013/28014 (identical to round 33).

## R34-Doc
The new section of doc 036 covers everything in §2.2, and it matches the code: the 4 conditions, the gutter geometry, the empty area, decisions 2/4/5/6, the round-33 residual correction, the tests and red-first, and the Ableton note.

**C-R34-02 (Low):** the doc says "headless-ში scrollbar 0 px-ია". C measured a **10 px** vertical gutter in headless; only the horizontal one is 0 px, because the scrollbars are hidden. The text came from B's task; the code is not affected. Fix it in the next doc pass. The doc's "A-R34-REVIEW-1 ბრაუზერში არ შემოწმებულა" is now superseded by C-R34-01.

## Ableton — two separate verdicts (§4.6)
Source: Live 12 Reference Manual §18.1 (`b-round-29/ableton-mixing-20261012.txt`, captured 2026-10-12). C did not open a new source.

| Behaviour | CZABA requirement | Ableton compliance |
|---|---|---|
| A click in the timeline takes the edit context away from a text field | PASS (R34-TS) | **დაუდასტურებელი** (unconfirmed; the source says nothing about this) |
| A typed, uncommitted value box value is committed when the user clicks elsewhere | PASS (R34-CG; range targets excluded, see C-R34-01) | **დაუდასტურებელი** |
| A click on the scrollbar does not take focus from a field | PASS (synthetic R34-SB; real scrollbar = R34-T) | **დაუდასტურებელი** |
| Pan/Volume double-click reset | not checked this round (4b) | not in scope this round (confirmed in §18.1, not yet implemented) |

## Bugs and follow-ups for B (C wrote no code)
1. **C-R34-01 = A-R34-REVIEW-1 (Medium; confirmed in a browser; outside this round's contract)** (`runs/rec-a-r34-review-1.txt`).
   - Steps: SFX selected → Clip Gain `3` typed without Enter → a real click on **music Volume**.
   - Result:
     - the typed `3` is **lost**: SFX has no gainDb and the field shows `0.0`;
     - status „რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.“;
     - Volume jumps to 0.5 with +1 `Volume` entry.
   - The same happens with **Master Volume**, outside the scroller (−27 dB, +1 `Master Volume`).
   - The loss is not silent: a status appears. It still breaks the D-29u contract ("blur commits") for a range target.
   - Suggested by A's reviewer: `!(isRangeInputTarget(focused) && isRangeInputTarget(event.target))`. Master is outside the scroller, so it needs a separate decision.
   - Belongs to 4b or its own small bug round; B decides.
2. **C-R34-02 (Low, doc):** the headless gutter text above.
3. **CG-6 oracle wording:** "exactly one" → "1 per live or scheduled SFX source node, 0 restarts".
4. **R34-T note for the Tech Lead:**
   - headless hides the scrollbar, and hit-testing in the gutter reaches the content. So R34-T(3) (search → drag the scrollbar → type) is the only real check of the gutter rule.
   - A's Firefox overlay-scrollbar variant (R3) is recommended.
   - Rounds 31–34 are now C-verified; round 34 = the 3 lines `StudioWorkspace.tsx`, `fader-guards.test.tsx` and doc 036, on top of the 9 status lines. They are ready for root's checkpoint once root runs its own gates.

## Carried (honest, unchanged; not PASS)
- **C bugs:**
  - C-R27-01, C-R6-02, C-R8-01, C-R23-01 (Tech Lead; NUL record above);
  - C-R30-01 (polish).
- **Low items:**
  - R26-M1;
  - stage 4b: MASTER-HOLD-TICK-EDGE, A-R29-REVIEW-1, FADER-KEY-ENTRIES, A-R31-REVIEW-2, A-R32-REVIEW-1, A-R33-REVIEW-TOUCH (widened to text fields, per doc 036);
  - stage 4c: R9-REVIEWER-M1-L8;
  - DEMO-SFX-FULL-SCALE, L3, LIB-SEP-REASON, R27-T, DOC034-UNREACHABLE-NOTE, DOC035-NOTES;
  - A's review residuals: RTL gutter, overlay scrollbars, right-button press commits.
- **Root** (`root-pre-push-review.md`, `publication-checkpoint.json`):
  - the purchased loader hardcodes middle-east (SRW-21);
  - Lenis on `/studio/*`;
  - portable instruction-file paths;
  - the export hard-clip at 0 dBFS;
  - the CRLF Biome errors on the auth files;
  - `frontend-architect.md` grants Write/Bash;
  - the `Modal.tsx` focus gap;
  - GA `scroll` with consent denied;
  - the fake Bearer gets 500;
  - the CDP allowlist;
  - `Content-Type` without a charset;
  - dev-server availability;
  - the review's open M1/M2/L1–L4 where still applicable.
- **Tech Lead:** `feature-status.md` §5 (R30-T, R31-T, R33-T), **R34-T** (new) and TL-Q-FB05-FB11.
- **Whole-project scope:** the find sound → add → fit video → export flow and FB-01..FB-16 were not re-run this round (bounded policy, §4.7). They stay for the stage regression.
