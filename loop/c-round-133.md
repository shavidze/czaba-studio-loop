# C — Round 133 verification: VISUAL-A V-0.2c3 (lane-move and track-group texts in English)

Verifier: C · Date: 2026-10-24 · Baseline `b25507e` · env-status: store 200 (10:32Z)
**Verdict: PASS.** `browserVerified` = `realVerified` = true. Bugs: 1 Low that was already present before this round (C-R133-L1 → `deferred_low_polish`). No source change during C's phase.

## Offline rows
| ID | Result | Evidence |
|---|---|---|
| T133-TARGETED | PASS. The same 18 files, **349/349 green**. Per-file counts equal A's (strings 22, grid-snap-ui 20, status-announcement-ui 33, grid-snap-edit 25, clip-fades-ui 16, track-groups-ui 14, track-group-collapse-ui 22, selection 25, groups 11, track-group-collapse 7, track-group-mix 10, track-group-mix-ui 10, group-volume-db 9, fader-touch 7, marker-snap 25, grid-snap-clip-edges 44, grid-snap-loop-drop 36, delete-selection-ui 13) | `c-round-133/out/vitest-targeted.log` |
| SOURCE-SCOPE | PASS. HEAD `b25507e`. `git status` = 11 ` M` + 1 `??` (doc 109). Frozen list (934) is OK at the start and the end. A's 12 end hashes still match at the end of C's phase. `git diff b25507e` on the 5 protected files is empty | shell output, see below |
| AN-REVIEW | PASS. Detail below | `c-round-133/out/src.diff`, `tests.diff` (C's own `diff -u` against `b-round-132/r133-granted-start/`) |

### AN-REVIEW detail
- **`strings.ts`:** only the two appended objects. The texts equal §1.1 byte for byte. The file still has no import.
- **`selection.ts`:** only the import, `GROUP_MOVE_BLOCKED_MESSAGE` and the five `CLIP_LANE_REFUSAL_MESSAGES` values. Type and key order are unchanged. `planClipLaneMove` is untouched.
- **`groups.ts`:**
  - only the import, `TRACK_GROUP_COLLAPSE_EMPTY_MESSAGE`, the six map values, `trackGroupCreatedMessage`'s return, and the `names`/ternary in `trackGroupDissolvedMessage`;
  - the `groups.length === 1` branch stays in the caller;
  - the prefix line is unchanged.
- **Doc 108:** only l.4, with the exact text.
- **Tests:**
  - `it` counts are 19→22 (strings) and unchanged elsewhere;
  - no `skip`/`only`/`todo`;
  - the hunks are the hand-written English literals with the same matchers, the added forward-rule expects (TG-UI4–8, TC-UI1), the TG5 title words, and ST20–ST22.
- **Meaning check** (Georgian side by side with the English): no fact is dropped.
  - L1 has both reasons. L2 keeps track + moves in time. L4 says only the time changes. L5 has `(0)` + the track does not change.
  - G2 has Ctrl+click, Shift+click and track name. G1/G7 have "click the group name". G5/G6 keep the reason after the dash.
  - G8 has the name + members. G10/G11 keep the singular/plural difference.
  - G1 adds the word "first" (B's text). No fact is added.
- **Doc 109:** it has all the TEMPLATE sections in Georgian and covers R1, R2, R3, R5, R6, the glossary and the mutations. Its status line still says C is pending, which is expected.
- **Shell writes:** A lists them (temporary `sed -i` mutations, restored and checked by sha256). C's hashes confirm the end state.

## Browser rows (Playwright Chromium, fresh context per session, `/studio-lab`)
### GROUP: PASS at both viewports (1440 `c133-1440-r2-group.json`, 1280 `c133-1280-r1-group.json`)
| Step | Status (exact at both viewports) | Effect observed |
|---|---|---|
| (a) Ctrl+G, nothing selected | `To group tracks, select them first — Ctrl+click or Shift+click a track name.` | rows `video,music,stems,sfx`; selection empty; Undo label unchanged (`Undo`) |
| (b) music, Shift+click stems, Ctrl+G | `Group “ჯგუფი 1” created: მუსიკა, სტემები.` | group row `ჯგუფი 1` (depth 0) before music, stems; Undo `Undo: Group Tracks`; Undo/Redo restore/recreate |
| (c) video + Ctrl+click music, Ctrl+G | `The video track cannot be grouped.` | rows, selection (`video,music`) and Undo unchanged |
| (d) music + Ctrl+click SFX, Ctrl+G | `Only adjacent tracks can be grouped together — the selection skips a track.` | rows, selection (`music,sfx`) and Undo unchanged |
| (e) music only, U | `To fold a group, select it first — click the group name.` | nothing folds; rows unchanged |
| (f) group name, U, U | (no status is set; see C-R133-L1) | folds (music/stems hidden, `video,group,sfx`), then unfolds (rows restored) |
| (g) group name, Ctrl+Shift+G | `Group “ჯგუფი 1” ungrouped.` | rows flat; Undo `Undo: Ungroup Tracks`; music, stems selected |
| (h) music only, Ctrl+Shift+G | `To ungroup, select a group — click the group name.` | rows and Undo unchanged |

The MutationObserver recorded exactly one status change per command. Screenshots: `shots/group-*-1440-r2.png`, `group-*-1280-r1.png`. Viewed: b-created 1440 (an indented group row above music/stems, with the English status in the footer) and f-folded 1280 (the group is collapsed and the stale refusal text is still in the footer).

### LANE: PASS at both viewports (1440 `c133-1440-r3-lane.json`, 1280 `c133-1280-r1-lane.json`)
Setup: snap off; library add with Enter: music@1 (synth mix, 16 s), stems@2 (bass, 16 s), SFX@20 (at 1280, @2 because of the tool's off-screen ruler click).
- **(a)** Drag music right by 1 s, then down onto stems, and hold.
  - During the drag: status `No room here`; hint paragraph `No room here · Shift — დრო ჩაიკეტება, შეიცვლება მხოლოდ ხაზი`; refusal span `No room here · `; an amber blocked ghost on stems at 00:02.000.
  - After release: `No room here — კლიპი ბოლო თავისუფალ ადგილას დარჩა: მუსიკა, start 00:02.000.` (the R3 shape). The clip stays on music at 2.000, the last free place.
- **(b)** Drag the music clip onto the video lane.
  - During the drag: status and refusal span `Audio does not move to the video track` (no final period).
  - After release: the same composite, `… — კლიპი ბოლო თავისუფალ ადგილას დარჩა: მუსიკა, start 00:02.500.` The clip stays on music, and the video lane gets no clip.
- **(c1)** Stems + SFX selected; drag stems down one lane.
  - During the drag: `There is no track for part of the group — only the time changes.`
  - After release: both clips keep their tracks, and the time moves +0.5 s as dragged. The release status is the frozen `გადატანა (2): 2 კლიპი გადავიდა 00:00.500-ით მარჯვნივ.` (item (e), V-0.4).
- **(c2)** Music + stems selected; drag stems down to SFX and 2.5 s left.
  - During the drag: first `Group move stopped — …` (the time clamp), then `Part of the group would go before the start of the timeline (0) — the track does not change.`
  - After release the status stays the same. Both clips stay on their tracks at 0.
- **(d)** Music + stems selected; ← pressed 26 times (0.1 s steps from 2.0).
  - Both clips reach 0 on press 20.
  - Presses 20–25 each show `Group move stopped — a neighbouring clip or the start of the timeline.` The status region mutates twice per blocked press (clear + set), so the text is re-announced once per press.
- The effects match `planClipLaneMove` (unchanged code).
- Screenshots viewed: `lane-a-during-1440-r3.png`, `lane-a-during-1280-r1.png`, `lane-c1-during-1280-r1.png`.

### GEO-COUNT: PASS at both viewports (`out/geo-count.json`, 59 steps)
- `geo-count.json` was recomputed after the runs from the saved statuses, with one subtraction set for all four runs. The 1440 GROUP run used an earlier tool version without the demo-ready subtraction, so its saved `start` step shows raw 50. Subtracting by name gives net 0.
- Net Georgian in the status region is **0** on every step and in every observed status change.
- The refusal span has 0 Georgian whenever it is present.
- Items subtracted by name:
  - the load-time demo-ready status;
  - `ჯგუფი 1`, `მუსიკა`, `სტემები`;
  - the R3 tail `კლიპი ბოლო თავისუფალ ადგილას დარჩა`;
  - the Shift hint (outside the span);
  - the frozen move-history labels/statuses `Undo: კლიპის გადატანა`, `Undo: გადატანა (2)`, `გადატანა (2): 2 კლიპი გადავიდა …`. These are item (e) in the task but are not named in the GEO-COUNT list.

### LAYOUT: PASS at both viewports (`out/layout130-*-r1.json`, `out/layout-compare.json`)
- S0: 0 boxes differ by more than 1 px (111/111 at 1440, 103/103 at 1280).
- S1/S2: the only differences are text-keyed entries.
  - The status footer key (Georgian create text → English) has an **identical box**: 0,831,1440,69 at 1440 and 0,651,1280,69 at 1280.
  - The Export dialog buttons (`Export WAV`, `Done`) are narrower. Their text changed in earlier V-0 rounds, not in this one.
- The lane-move hint during a refused drag is one line: h 16 px = line-height, width 371 px (a), 514 px (b), 283 px (no refusal). `scrollWidth` equals the viewport width, so there is no horizontal overflow.
- The footer is 20 px taller during the group drags (c) because of the existing `2 კლიპი მონიშნულია` line. That is structure, not text.

### REG-132 (1440): PASS
`Tempo 90 BPM · 4/4 — bars ruler updated. Grid only: audio is not stretched.` (exact).

### G133-3 (alone, last): PASS
- A fresh context with no credentials opens `/studio-lab` with the workspace and the demo badge.
- `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`, at 1440 and 1280 (`shots/g133-3-protected-1280.png` viewed).
- `GET /api/studio-token?product=middle-east&file=stem1.wav` returns **401** (`Please sign in to access Studio.`).
- The fake-Bearer 403 check is **BLOCKED (backend unavailable in cloud)**.

### PX-NET / REG-HYD: PASS
Every valid session has 0 forbidden requests, 0 `Authorization` headers, 0 hydration errors and 0 `pageerror`. The only noise is the known cart noise (2 per session).

## Screenshots viewed
- Viewed and checked against the measured data:
  - group b/c/d/f/g/h (both viewports covered);
  - lane a (1440, 1280), b, c1, c2, d;
  - g133-3 lab 1440 and protected 1280.
- Each one shows the exact English status in the footer and the described effect, for example:
  - c: video + music selected, no group row;
  - b: an amber blocked ghost on the video lane, and the clip stays on music;
  - c2: both clips at 0 on music/stems;
  - d: both clips at 0 with `Group move stopped — …`.
- **Superseded:** `lane-*-1440-r1/r2.png` (r3 is final).

## Invalid runs and tool reruns
- **ENV-FIRST-LOAD:** `c133 1440 r1 group` crashed on the first load ("Invalid hook call" + hydration warning; no status region). It was discarded (`out/INVALID-envfirstload-…json`), and the replacement r2 was clean.
- **Tool error in LANE (d), 1440 r1/r2:** my tool clicked over an existing two-clip selection and toggled stems off. Steps (a)–(c) in those runs were valid and identical to r3. The final (d) evidence is r3 (1440) and r1 (1280). A separate probe (`tools/probe-d.cjs`) confirmed Ctrl+click multi-select and the blocked nudge.

## Bugs
- **C-R133-L1 (Low; present before this round, not a regression):**
  - A successful fold/unfold (U on a selected group) sets no status, so the previous refusal `To fold a group, select it first — click the group name.` stays visible while the group is folded.
  - Steps: create a group; select a track and press U (refusal); click the group name and press U.
  - Evidence: `shots/group-f-folded-1280-r1.png`.
  - Code: `StudioWorkspace.tsx` `toggleSelectedTrackGroupsCollapse` only sets the status on refusal.
  - Related backlog signal: **TRACK-FOLD-U** (U on a normal lane gives a confusing status). This is a related surface, not a duplicate.
  - → `deferred_low_polish`.

## Notes for B
1. GATE133-LANE-RELEASE-MIXED covers **L3 too**, not only overlap. Releasing over the video lane gives `Audio does not move to the video track — კლიპი ბოლო თავისუფალ ადგილას დარჩა: მუსიკა, start 00:02.500.`
2. Refused **group** lane drags (out-of-range, before-start) show no refusal span in the hint; the text appears only in the status. This was already the case before this round. Info only.
3. Add the frozen move-history labels (`კლიპის გადატანა`, `გადატანა (n)`, `… კლიპი გადავიდა …`) to future GEO-COUNT subtraction lists until V-0.4.
4. The reviewer's Architecture note (shared ST helper, wider Georgian range, comment stripper) belongs to the pre-V-0.3 checkpoint addendum (f).

## Ableton
- CZABA requirement: met.
- Ableton correspondence: **not applicable / unconfirmed** beyond the reused command names (Group Tracks / Ungroup Tracks, fold; Live 12 §18.3, capture `b-round-78/ableton-mixing-20261022.txt`). This round changed text only, and the U shortcut stays CZABA's own.

## Gate rows (not claimed)
Full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL → root gate.

## C writes
- Only `tmp/studio-real-loop/c-round-133.{md,json}` and `c-round-133/{tools,out,shots}/`.
- Tools were copied from `c-round-132/tools` and `c-round-123/tools/h3.cjs`, with paths adapted. New tools: `c133.cjs` and `probe-d.cjs`.
- No `store/` writes.
