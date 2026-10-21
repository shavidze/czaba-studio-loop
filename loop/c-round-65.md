# C — Round 65 verification: SRW-15 stage 1 (FB-09 + FB-11): project BPM and bars/beats ruler, grid only (D-29z30)

Verifier: C · Date: 2026-10-19 · Task: `current-task.md` (round 65) · A report: `a-round-65.md` (I re-ran everything myself; none of A's claims were taken as evidence).

**Verdict: PASS. `browserVerified: true`.**
- Every §4.6, §4.7 and G65-3 REAL-browser row ran, with the starred rows at both viewports.
- No bug of any severity was found. Six info notes are in §8.
- Round 65 is **commit-ready** for root: 6 paths, listed in §1.

Evidence: `c-round-65/` (`checkpoint.md`, `gates/`, `runs/`, `shots/`, `tools/`, `mut/`, `mutations*.txt`).

## 0. Environment

| When | :5173 `/studio-lab` | :5199 `/api/products` | node.exe |
|---|---|---|---|
| start (~16:20 +04) | 200 | 200 | 7 |
| mid, after the offline items | 200 | 200 | 7 |
| end (16:47) | 200 | 200 | 7 |

`env-status.json`: store 200, backend 200, round 65, attempt 1.

**Browser tools:**
- **REAL-mouse (PW):** standalone Playwright from `store/node_modules` with the installed chromium. Each run used a fresh context with no credentials and no injected helper scripts (`tools/tb65.cjs`, `tools/ru65.cjs`).
- **gstack `/browse`:** own state file `c-round-65/c-browse.json`.
  - The CLI daemon started normally, so no fallback was needed.
  - I stopped it with `browse stop`. The state file is gone and `node.exe` is back to 7.
  - I killed no process.

`node.exe` was recorded at start, mid, end and around verify (7 every time), not after every single PW run.

`c-round-65.json` has the required schema keys plus additive extras (`notRun`, `info`, `evidence`, `commitReady`, `commitPaths`).

ENV-EXT-LOAD-HANG: the selector appeared after 0.8–6.9 s, and I then waited 4 s every time.

## 1. G65-2 — tree: PASS

**Start and end (`gates/g65-2-end.txt`):**
- HEAD `f9d768c` at both.
- `git status --short` is exactly the 6 lines from §3.1:
  - ` M app/components/arrangement/StudioWorkspace.tsx`
  - `??` for `ArrangementTempoRow.tsx`, `tempo.ts`, `tempo.test.ts`, `tempo-ui.test.tsx`, and doc 058.
- Frozen list: 0 not-OK (424/424).
- Protected files 4/4 OK.
- Snapshot `SHA256SUMS.txt` OK.
- The owned files' sha256 prefixes did not change during my run: `6a0b0fef f1483405 2c4bf776 b3c246b1 dd075aae 8a5f68d4`.

**EOL** (byte count, `gates/eol.txt`): all 6 owned files have CR 0 (LF only).

## 2. R65-S — static: PASS

**`diff -u` of StudioWorkspace against the snapshot** (`gates/diff-sw.txt`) contains exactly:
- the two import lines;
- `const [tempoBpm, setTempoBpm] = useState<number | null>(null);`;
- `changeTempo` and `rejectTempo` (`useCallback`, `workspaceRef.current.setStatus(...)`);
- the one added condition `!(event.target instanceof Node && focused.contains(event.target))` in `releaseEditFocusOnTimelinePointerDown`;
- `<ArrangementTempoRow …/>` between the seconds-ruler row and the loop row.

Nothing else changed.

**`tempo.ts`:**
- Pure; its only import is from `./view` (`RULER_LABEL_CHAR_WIDTH_PX`, `RULER_LABEL_OFFSET_PX`, `RULER_LABEL_SPACING_PX`, `RULER_TICK_LINE_PX`).
- Bar and beat times are computed from the index (`(bar × 240) / bpm` and `((4·bar + beat) × 60) / bpm`), never accumulated.
- It has a finite and positive guard on its inputs.

**`ArrangementTempoRow.tsx`:**
- The strip is `memo(ArrangementBarsRulerInner)` with only the props `seconds`, `pxPerSecond` and `bpm`.
- It has no `useArrangement*` or position-store calls and no pointer handlers (the marks are `pointer-events-none`).
- There is no default BPM.
- Colours are tokens only: `border-outline`, `text-muted`, `bg-surface`, `bg-background`, `ring-brand`, `text-foreground`.

**Banned patterns and literals:**
- Greps found no `any`, assertions, `@ts-ignore`, comments, hex/rgb colours, `.skip`, `.only`, `.todo`, `retry` or `setConfig`.
- The UI literals match §0.1 byte for byte (`gates/literals.txt`). `TEMPO_INVALID_MESSAGE` is built from a template and T10 checks it verbatim; in the browser, TB-INVALID saw the exact string.
- Character scan: the new files are clean. The extra characters in StudioWorkspace (`✕ ← → −`) were already in the snapshot.
- **Doc 058:** it has every §2.5 section: date, status, project, context, approach, architecture, files, problems, testing, Ableton and TODO.

## 3. R65-U — unit and mutation: PASS

**Red run** (my scratch copy: `app/` copy, a `node_modules` junction and my own config). Without `tempo.ts` and `ArrangementTempoRow.tsx`, and with the snapshot StudioWorkspace, `Test Files 2 failed`, no tests ran, `Failed to resolve import "../tempo"` (`gates/red-run.txt`). The scratch was restored to match the store byte for byte afterwards.

**Mutations** (`tools/muts65.cjs` + `tools/cmut65.cjs` → `mutations.txt`, `mutations-q2.txt`):
- Each run covered the 6 files from §2.3 (92 tests).
- The unmutated run passed 92/92, twice.
- Every mutation applied to exactly one pattern, and the scratch was restored after each one.

| # | Mutation | Failing tests (C) |
|---|---|---|
| a | 999 bound removed | T3, U5 (**only because of A's extra `'999.5'`**, see §8 INFO-C65-SPEC-999.5) |
| b | `,` not accepted | T2 |
| c | `barStep` always 1 | T7, T9 |
| d | beats when `barStep > 1` | T7, T9 |
| e | right-edge label suppression removed | T7 |
| f | bar time `k × round(240/bpm, 3)` | T5, U2 |
| g | default tempo 120 | U1, U12 |
| h | Escape commits | U6 |
| i | blur does not commit | 10 tests (U2–U9, U11, U12) |
| j | strip fixed at 40 px/s (marks and left) | U11 |
| k | same-value commit writes a status | U9 |
| l | invalid path keeps the typed text | U5 |
| m | `contains` guard removed | U12 |
| n | guard → `!isTypingTarget(focused)` | U12 |
| p (C extra) | parse rounds to 0.1 | T2, T3 |
| q (C extra) | beats labelled from 20 px | T5, T6 |
| r (C extra) | last bar dropped (`lastBar − 1`) | T5 |
| s (C extra) | `changeTempo` writes no status | U2, U4, U7, U8 |

- My first version of (q) was mathematically equivalent to the original (bar ≥ 160 px ⇔ beat ≥ 40 px), so that run was invalid. The corrected (q) was killed.
- (o), "strip above the seconds ruler", is a layout mutation that no unit test is expected to catch. It is covered in the browser by TB-LAYOUT's row-order check (ruler → bars → loop, confirmed).
- **Durations:** the two new files alone ran 22/22 in 4.96 s; the slowest test was U1 at 316 ms (`gates/alone.txt`).

## 4. G65-1 — gates: PASS

- **`npm run verify`, attempt 1:** rc 0 (`gates/verify-1.txt`, `.meta`).
  - Sequence: agents:check, test:agents, lint, typecheck (`tsc --noEmit`), `test:run`, build.
  - **Test Files 91 passed (91), Tests 1605 passed (1605).**
  - Build ran twice (✓ built in 16.25 s and 4.43 s).
  - 0 `Test timed out`.
  - `node.exe` 7 before and after; 16:36:15 → 16:38:33.
- **Biome `./app`, read-only:** **4 errors / 218 warnings / 1 info**. The 4 errors are exactly the baseline CRLF `format` list (`auth-bugs.test.ts`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts`).
- **Biome on the 5 owned code/test files:** 0 diagnostics, rc 0.

## 5. §4.6 — tempo browser rows: all PASS

Runs: `runs/tb65-1440x900-ui_full.txt` (attempt 3, final), `runs/tb65-1280x720-ui_keys.txt` (attempt 2, final), `runs/tb65-1440x900-nostretch.txt`. Typing was REAL keyboard input after REAL mouse clicks into the field.

**Invalid attempts, all caused by my harness and replaced within the budget:**
- **1440 attempt 1:** TB-ZOOM used the rounded zoom readout (97.7) as the exact scale.
  - The oracle now derives the exact px/s from the marks.
  - It checks `|style.left − time × Z_exact| < 0.01`, `|DOM left − style.left| ≤ 1 px`, and `|Z_exact − readout| ≤ 0.05`.
- **1440 attempt 2:** all rows passed except one RU-REG double-click (§6).
- **1280 attempt 1:** TB-KEYS expected `g12 `, but the field correctly held `90g12 ` (the BPM was already set). The harness now clears the field first.

| ID | Result | Measured |
|---|---|---|
| **TB-DEFAULT*** | PASS at 1440 and 1280 | Input `''`, `data-bpm` `''`, 0 marks. The strip text is exactly `ტაქტები: მიუთითე BPM — მხოლოდ ბადე, აუდიო არ იწელება`; the header reads `BPM4/4`. Shots: `shots/tb-default-*.png`. |
| **TB-SET90*** | PASS at 1440 and 1280 | Status verbatim. Z = 40 px/s. Bar `2` at 106.66 px (expected 106.67) and bar `3` at 213.33 px (expected 213.33); every mark sits at time × Z. The field is blurred. Shots: `shots/tb-set90-*.png`. gstack cross-check: same values (`runs/g65-3-direct.txt`). |
| TB-120 | PASS | Bar `2` at 80 px = 2 × 40. 15 bars at 0, 2, 4 … s. Every bar line sits on a seconds-ruler tick (±1 px). |
| **TB-SECONDS*** | PASS at 1440 and 1280, and with clips | The 30 seconds-ruler ticks (left and label) are identical before and after 90. With the fixture, both clip boxes are identical with no BPM and at 90 (left 792 / width 4054.08, left 672 / width 80). |
| **TB-NOSTRETCH (real audio)** | **PASS** | Details below. |
| TB-INVALID | PASS | `1000`, `abc` and `19`. Before each value the Snap status was written (so every check bites). After each value, the status is exactly `ტემპი უნდა იყოს 20–999 BPM (მაგ. 90 ან 92.5) — არ შეიცვალა.`, the field shows `120`, `data-bpm` is `120`, and the marks are unchanged. |
| TB-DECIMAL | PASS | `92,5` → `data-bpm` `92.5`, field `92.5`, status `ტემპი 92.5 BPM · 4/4 — …`. |
| TB-ESC | PASS | With the Snap status written first, typed `70` then Escape: the field is back to `92.5`, the status is still `Snap ჩართულია — ბადე 1 წმ (G)`, the marks are unchanged and the field is blurred. |
| TB-CLEAR | PASS | Status verbatim `ტემპი წაიშალა — …`, 0 marks, the hint is back. |
| **TB-KEYS*** | PASS at 1440 and 1280 | See below. |
| FOCUS-REG | PASS | See below. |
| TB-ZOOM | PASS | See below. |
| TB-UNDO | PASS | See below. |
| **TB-LAYOUT*** | PASS at both viewports | See below. |
| TB-SNAP-REG | PASS | BPM 90, Snap on (REAL `g`), division 1 s. A REAL-mouse (PW) drag of Soft impact from 4.000 by +1.3 s (raw 5.3, close to bar 3 at 5.333) landed on **5.000**: the seconds grid wins, not the bar line. Status `კლიპის გადატანა: start 00:05.000 …`. |

**TB-NOSTRETCH (real audio):**
- **Fixture:** built by REAL-mouse (PW) drops with no BPM:
  - `Soft impact` → SFX at 4, status `„Soft impact“ დაემატა SFX ხაზზე 00:04.000-ზე.`;
  - `Middle East — საჯარო preview` → music at 7.
  - The four exports ran on this untouched fixture. The playback measurement came later, after TB-UNDO (Ctrl+Z removed the Middle East clip) and Redo restored it (clips back to 2), so it ran on the same two clips.
- **Exports:** four real Export → WAV downloads in one session:
  - (a) no BPM;
  - (a2) no BPM again, as a determinism control;
  - (b) BPM 90;
  - (c) BPM 120.
- **The four WAVs are byte-identical:**
  - sha256 `525958b4f0a721f9059b092ece6652538dcf6d8469cbb1f7e2707eb554e97ec6` ×4;
  - 31,205,420 bytes; 24-bit, 48 kHz, stereo; **5,200,896 frames (108.352 s)**;
  - first audible frame **192000 = 4.000 s**; RMS 0.167594; NaN 0;
  - full-scale 32 samples (the known DEMO-SFX-FULL-SCALE);
  - max |Δ| 0 LSB.
- **Export dialog:** the range text `მთელი პროექტი · 0:00 — 01:48.352` was identical all four times.
- **Spec/harness conflict:** §4.6 asks for byte identity, but harness rule r26 says byte identity is never an oracle (±1 LSB non-determinism). I recorded both measures. This time the strict one also holds, so the conflict did not affect the verdict.
- **REAL playback:** Space from 3 s with video Mute on (REAL click, `aria-pressed=true`). The SFX meter onset was at **4.131 s** with no BPM (last `-inf` at 3.990) and **4.009 s** at BPM 90 (last `-inf` at 3.979). Both are inside 4.0 ± 0.15.
- **Files:** `runs/nostretch-1440x900-a-noBPM.wav` and `-c-BPM120.wav` are kept. The other two were deleted after hashing (`runs/nostretch-sha256.txt`).

**TB-KEYS\*:**
- REAL click into the field, then `g`, `1`, `2`, Space. The field holds `g12 `. Snap stays `off`, the division stays `1`, the position stays `00:00.000` (no playback), and the field stays focused.
- Then I typed `9` and did a REAL click inside the focused field (6 px right of centre). The field stayed focused, the status did not change (no invalid status) and `data-bpm` did not change.
- Then End and `0` (field `90`) and Enter: `data-bpm` `90`, the 90 status, and the field is blurred.
- Then a click into the field and Escape (blur): `g` toggles Snap on again (`off → on`).

**FOCUS-REG:**
- **Library search:** typed `so`, then a REAL click on the stems lane: the search loses focus.
- **Volume fader:**
  - Focus was set **programmatically** (labelled as such). A REAL click on the fader thumb would change the volume, so a programmatic focus is the clean way to set this up.
  - A REAL click on the Soft impact clip: the fader loses focus.
  - Delete then removes the clip (2 → 1, status `კლიპი წაიშალა; სიცარიელე დარჩა.`).
- **Reviewer #5 (grid `<select>`):**
  - A REAL click on the focused select keeps it focused. This is intended by §0.1(10).
  - A REAL click on a lane still blurs it.

**TB-ZOOM:**
- BPM 120, REAL `-` presses down to 16.4 px/s (bars 32.8 px apart). Labels `1, 3, 5 … 27` and then `null`; 0 beats.
- REAL `=` presses up to 97.7 px/s (beats 48.8 px apart). Beat labels `1.2, 1.3, 1.4, 2.2 …`.
- Marks are at time × Z at both zooms.

**TB-UNDO:**
- On the empty arrangement the Undo title was `Undo` both before and after 90. Ctrl+Z (title recorded before it: `Undo`) leaves BPM 90.
- With clips: the title `Undo: დამატება — Middle East — საჯარო preview` was the same before and after 90 and 120.
- Ctrl+Z (title recorded before it) removed the Middle East clip and **BPM stayed 120**. Redo restored the clip.

**TB-LAYOUT\*:**
- **Chrome row order:** `grid-control + arrangement-ruler` → `tempo-input + arrangement-bars-ruler` → `arrangement-loop-strip`. Chrome height is 64 px, the same with and without BPM.
- **Transport height** is unchanged: 49 px at 1440 and 87 px at 1280, matching the harness baseline.
- **Lanes are identical with and without BPM:**
  - 1440: video, music, stems and sfx, each 81 px, bottom at 579.
  - 1280: video 65 px, then music, stems and sfx at 81 px each, bottom at 601.
- **Detail panel** is visible and the same with and without BPM: 1440 open at 144 px (687–831), 1280 collapsed at 36 px (615–651), matching the harness rules.
- **`scrollWidth`** equals the viewport (1440 and 1280).
- Shots: `shots/tb-set90-*.png`.

## 6. §4.7 — regressions: PASS

**LB-LOADING-REG (C-R64-01 ruling):** fresh PW context with an empty cache (`runs/tb65-1440x900-loading.txt`).
- At **815 ms** Soft impact reads `Soft impactSFXიტვირთება…` with `draggable=false`.
- A REAL-mouse drag of it to SFX started right away: no ghost, no status change, 0 clips added.
- The item became ready at **3161 ms** (`00:02.000`).
- The same item then dropped normally: `„Soft impact“ დაემატა SFX ხაზზე 00:04.000-ზე.`, 1 clip at 4.000.

**RU-REG:**
- **Measurements:** the final run passed and attempt 1 passed. `tools/ru65.cjs` passed 6/6, with no BPM and with BPM 120.
- **Seconds-ruler click** seeks to 00:03.000.
- **Vertical ruler drag** zooms (91.4 → 77).
- **Double-click on the ruler** Fits (77 → 91.4).
- **One miss:** in 1440 attempt 2 the double-click left the zoom at 77. That is 1 miss in 9 tries, and I could not reproduce it (INFO-C65-RU-DBLCLICK-MISS).
- The bars row sits below the ruler and does not take the ruler's hits: `elementFromPoint` at the click point is `arrangement-ruler`.

**REG-HYD:** no console line contained `hydrat`, `did not match` or `server rendered` on any fresh `/studio-lab` load (5 PW loads plus gstack). The only console errors were the known root `/api/cart` CORS errors.

## 7. G65-3 — anonymous workspace and purchase protection: PASS

gstack, fresh state `c-round-65/c-browse.json` (`runs/g65-3-*.txt`, `shots/g65-3-*.png`):

**Pages:**
- **Direct `/studio-lab`** at 1440: 4 lanes, the badge `დემო კოლექცია — ავტორიზაცია არ სჭირდება`, cookie length 0, BPM row present; at 1280, `scrollWidth` = 1280.
  - `localStorage` has `czaba_session_id` only, with no auth keys (INFO-C65-LS-SESSION).
- **Header link:** the `Studio LabDemo` link from `/` lands on `/studio-lab` with the workspace, the badge and the tempo field.
  - The first try used an ambiguous CSS selector (a harness issue, same as round 64).
  - The try with a snapshot ref `@e7` passed.
- **`/studio/middle-east`:** `Sign in required`, no workspace, no tempo row.

**Network:**
- **gstack:** no `/api/studio-token`, `/api/recording-*` or `/api/download` request. The only backend request is `GET :5199/api/cart` (pending, allowed).
- **R2:** two requests to `czaba-r2-proxy…workers.dev/middle-east/cover.jpg`. Both come from the **homepage** `/` segments, not from the `/studio-lab` segment, and round 64 recorded the same.
- **Every PW run:** `bad 0`, `withAuth 0`. My PW `bad` regex did not match the proxy host (`*-r2-proxy*.workers.dev`; INFO-C65-HARNESS-R2-REGEX), so I ran one extra fresh PW load of `/studio-lab` that lists every request host (`runs/hosts-studio-lab.txt`): only 127.0.0.1:5173, localhost:5199 (cart), Google Fonts, GTM and GA; no R2 or workers.dev request and 0 `Authorization` headers. The gstack `/studio-lab` segment (lines 1–166 of `runs/g65-3-network-final.txt`) also has no proxy request.

**Token rows** (16:46:39, `runs/curl-token.txt`): anonymous **401**; fake Bearer **403**.

## 8. Findings

**No bugs.** Info notes for B:

| ID | Note |
|---|---|
| INFO-C65-SPEC-999.5 | Mutation (a), removing the 999 bound, is killed only by A's additions of `'999.5'` to T3 and U5, which are outside the frozen §2.2 lists. The regex already rejects `1000`. I confirm A's finding. **B:** please adopt `999.5` into the spec lists. |
| INFO-C65-RU-DBLCLICK-MISS | One of 9 ruler double-clicks did not Fit (1440 attempt 2). It could not be reproduced (8/8 afterwards, with and without BPM), and there is no evidence it is tied to round 65; the hit target was the ruler in every logged try. Watch only. |
| INFO-C65-RB-FLAKE | During mutation (q), one `render-budget.test.tsx` test failed (`0.005 to be +0`, the start-hold release) in my scratch while it was under load. It is unrelated to (q): the clean runs passed 92/92 twice and verify passed 1605/1605. |
| INFO-C65-SELECT-FOCUS | Confirmed in the browser: a click on a focused grid `<select>` keeps it focused (intended, §0.1(10), reviewer #5), and a lane click still blurs it. No test covers the select path. Add one to the Lows batch if wanted. |
| INFO-C65-LS-SESSION | On anonymous `/studio-lab`, `localStorage` holds `czaba_session_id` (root cart session; round 64 recorded `[]`). It is not an auth credential and is not workspace code. For root. |
| INFO-C65-HARNESS-R2-REGEX | The `bad` filter in my PW harness (copied from round 64) matches `r2.cloudflarestorage`/`r2.dev` but not the real proxy host `czaba-r2-proxy.sabashavidze.workers.dev`. Round 65 is covered by the host listing; future harnesses should add `r2-proxy|workers.dev`. |
| INFO-C65-ONSET-EDGE | The no-BPM meter onset of 4.131 s is near the +0.15 limit. It comes from meter sampling granularity (about 20 ms polling plus rAF meters). The export shows the sound starting at exactly 4.000 s. |

A's own gaps, still open for the Tech Lead (R65-T): the input is 16 px tall (under the 24 px target), and the empty-strip hint is anchored left, so it scrolls off-screen when the view is scrolled right.

## 9. Ableton (two verdicts per §0.2 row)

| Behaviour | CZABA requirement | Ableton match |
|---|---|---|
| Tempo field in BPM with hundredths | PASS (T1/T2, TB-SET90, TB-DECIMAL) | confirmed: §9.1.1 has hundredths; the location differs (chrome row instead of the Control Bar) |
| Tempo automation | — (not in stage 1) | deliberate difference: one BPM |
| Warping / time-stretch on a tempo change | **PASS: never stretched, WAV byte-identical, onset unchanged** (TB-NOSTRETCH) | deliberate difference (D-10) |
| Beat-time ruler | PASS (T5–T9, TB-ZOOM) | confirmed: §6.1 for the ruler; bars and beats only, display-only strip, gestures stay on the seconds ruler (deliberate difference) |
| Default meter 4/4 | PASS (fixed `4/4` shown) | confirmed: §9.2.4.2 has the 4/4 default; meter changes are not offered (simplification) |
| Range 20–999 | PASS (T1/T3, TB-INVALID) | unconfirmed: CZABA's choice; no Ableton claim |
| Tempo not in Undo | PASS (TB-UNDO) | unconfirmed: CZABA's choice; no Ableton claim |
| No tempo until the user sets one | PASS (TB-DEFAULT, U1) | not applicable: Live always has a tempo |

I did not re-browse the Ableton manual this round; I used B's captures as listed in §0.2. A test PASS here does not by itself show Ableton parity.

## 10. Not run (honest)

- Video sync and C-R27-01 (RF3-1, RF3-2, R5-L6); the "fit video" step of the find → add → fit video → export flow. This round ran find, add (REAL drops) and actual export only.
- The full FB-01..FB-16 stage regression; `npm run test:e2e:smoke` (root's); the round 57–61 menu browser re-run. All are out of scope per §4.10.
- R65-T (real-device feel) is for the Tech Lead.

## 11. Carried items for B and root (from §4.10, `root-pre-push-review.md`, `publication-checkpoint.json`; not touched)

**Root:**
- ROOT-PUSH-R64-SHAVIDZE: push `f9d768c` to `shavidze/czaba-store`.
- ARCH-CHECKPOINT-SRW14-PREFS (a)–(d), which now has the first BPM consumer. It needs deciding before SRW-15 stage 2 (metronome).
- INFO-R61-FAKEBEARER-500 (did not occur; the backend was up).

**root-pre-push-review:**
- Video sync RF3-1, RF3-2, R5-L6 are open.
- R5-L3 is partial.
- R5-L5, R5-E1, R6-S2 and R6-S3 are unit-only.
- **M1:** loop refill is rAF-only, so a hidden tab goes silent.
- **M2:** per-frame position re-render.
- Lows L1–L4 and L6–L8.

**publication-checkpoint:**
- SRW-21: the purchased loader hardcodes `middle-east`.
- Portable instruction paths.
- The SRW-23 scrollbar check at both viewports.
- SRW-11/12 parity.
- T12.

**Lows batch:**
- ROOT-R64-L2…L6.
- ROOT-R64-M1-EDGE-RADIUS (Tech Lead R52-T(1)).
- The rest of the §4.10 open list.

**Next (orientation only):** SRW-15 stage 2 (metronome, R15-T2), then SRW-14 stage 5 (musical divisions).
