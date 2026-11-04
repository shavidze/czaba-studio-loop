# C round 327: PERF-DRAG-PREVIEW stage b, independent verification

**Verdict: FAIL**, on one Medium finding: **C-R327-01**. It is a real-browser HEAD difference in the `aria-live` status region during a fade drag, and it confirms reviewer finding 1, which A's jsdom probe could not reproduce. Every acceptance row in §2.2 passed as written. `browserVerified` = `realVerified` = true: every browser row ran at both viewports, and export ran.

**A's STOP is still open.** `a-round-327.md` l.1 asks B to rule on A-R327-REVIEW-SAME-TEXT-REMOUNT. C reproduced it in the real browser as **C-R327-02** (Low). C-R327-01 and C-R327-02 have the same trigger, the same root (§1.2.3 flush ordering) and the same repro. B should rule on them together. A's option (b) fixes only C-R327-02; it does not touch the flicker in C-R327-01.

Environment: env-status `store 200` (round 327). A's tree runs on `:5173` (store dev server). HEAD `234ccdd` runs on `:5197`: `git archive` into `/tmp/c327h`, with its own Vite `cacheDir` `/tmp/c327-head-vite-cache` (L38). The scratch copies `/tmp/c327s` (A's tree) and `/tmp/c327h` are used only for unit, mutant and perf runs. Source sha is unchanged from start to end of C's phase (`c-round-327/source-sha-{start,end}.txt`), and the claims are stable (`claims-end.txt` = `claims.txt`).

## Rows
| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS. Output is byte-equal to `a-round-327/claims-after.txt`. Against `claims-327-sketch-output.txt` only K2 `234ccdd 11`, K10 `120 18` (≥ 112/17), K13 (new l.4) and K18 `1 1` differ, all allowed by A-CLAIMS-AFTER. Every other value equals the target: K3 `1 1`, K4 `0 0`, K5 present, K6 `1 2`, K11 `5 12`, K12 `0`, K16 `11 7`, K17 `0 6`, K24 `3 2`, K25 `0 0 0 0`, K8 `11` | `c-round-327/claims.txt`, `claims-end.txt` |
| SOURCE-SCOPE | PASS. `git status --short`: 11 entries (9 M + 2 ??), exactly §3's files. Protected files 11/11 | `source-sha-start.txt` |
| UNIT | PASS ×3 on `/tmp/c327s`. `drag-preview-render` + `status-preview-store`: 21/21 on each run (18 DP rows incl. A's DP16, plus SP1–SP3) | `unit-{1,2,3}.log` |
| MUTANT | PASS. **MU-FADE-PROVIDER** → red only on DP9a. **MU-NO-FLUSH** → red on DP9a, DP11, DP12, DP14, DP15 (+ DP16). C's own: **C-MU-FOOTER-IGNORES-PREVIEW** (footer renders `{status}` while a preview exists) → red on DP9a, DP10, DP12, DP14, DP16. **C-MU-STORE-NO-DEDUPE** (`showPreview` always writes) → red on SP1 and DP10. Restored file 21/21; scratch `app/` equals store `app/` | `mutants/summary.txt`, `mutants/c-mutants.sh`, `mutants/mut-*.log` |
| PERF | PASS. Production build, the interactions spec run alone after the browser warm-ups, rc 0, `failures` [], 167 rows. Asserted: fade stopped/playing `move-components-per-move` **21.633** (≤ 24), `move-components-max` **22** (≤ 24), playing `move-restarts` **0** (== 0); 6× equals 1×. Against C round 325's run on the HEAD tree (K19): 110 equal, 9 lower (all fade, 103.25 → 21.633, 105 → 22), 2 higher: stopped `release-commits` 1 → 2 (and its 6×). Trim, move and range rows are unchanged (no worse row). Playing `release-commits` 1, `releaseComponentsMax` 96 on both. **The second stopped commit's 0 components was not measured by C**: the harness reports only the max (96). The figure is B's probe result. Against A's run: 121 equal, 0 rise, 0 lower | `perf-interactions-atree-results/latest-interactions.json`, `perf-rowcmp-vs-c325.txt`, `perf-rowcmp-vs-a.txt`, `perf-fade-rows.txt` |
| B-FADE-STATUS | PASS, both viewports, A vs HEAD with the same pointer path: 12 steps of 10 px, 3 sub-moves each. Every step's status text is equal ("Fade In: 0.313 s" … "3.750 s"). 3 spans are added per step (one per changed text) and 1 span is present, equal to HEAD. After release: "Fade In: 3.750 s.", Undo "Undo: Fade In (Ctrl+Z)", equal to HEAD. Ctrl+Z → `data-fade-in` 3.750 → 0.000; Redo → 3.750 | `rows-a.json`, `rows-head.json`, `rows-diff.txt` (only INFO lines), `shots/{a,head}-{vp}-fs-{start,mid,released,undo}.png` |
| B-FADE-CANCEL | PASS, both viewports. A blur during the drag returns the fade to 0.000. The Undo title stays "Undo: Add — Night Pulse · Pulse" (no history entry). The status text "Fade In: 1.875 s" equals HEAD. Spans added after the blur: A **0**, HEAD **0** | `rows-*.json` `fadeCancel`, `shots/*-fc-after-blur.png` |
| B-FADE-END-STOP | PASS, both viewports. "Soft impact" is a 2 s clip. Alt-click on the bars ruler did not move the insert marker here (status unchanged), so playback started at 00:00.1, about 2 s before the end. The fade drag began while playing and kept moving past the end. Texts while playing, at the auto-stop (00:02.000) and after release ("Fade In: 1.800 s.") equal HEAD. The transport shows Stopped on both | `rows-*.json` `fadeEndStop`, `shots/*-fe-{before-up,released}.png` |
| B-FADE-PLAYING | PASS, both viewports. A counter on `AudioBufferSourceNode.start` (init script) counted **0** starts during the move and 1 at release, on A and on HEAD. Playback kept running (00:01.160 → 00:03.98 during the drag, then 00:05.29, still Playing) | `rows-*.json` `fadePlaying`, `shots/*-fp-mid.png` |
| B-FADE-EXPORT | PASS. Fade In set to **2.000 s** by a 64 px drag on both trees ("Fade In: 2.000 s."). WAV sha256 is equal: `4a81a96a…acdd5` (16.000 s, 48 kHz, 24-bit, stereo, peak 0.29669, RMS 0–0.5 s 0.0015 vs 2–2.5 s 0.0568, so the fade is audible in the data). A first pair at 3.750 s was also equal (`3a826c70…ce9e`) | `rows-{a,head}-export2s.json`, `rows-*.json` `export` |
| B-VIDEO-FADE | PASS, both viewports. `public/videos/hero/1.mp4` (12.969 s) on the Video lane, with the handle "Video Fade In — picture only…". Every step's text ("Video Fade In: 0.250 s" … "3.000 s"), the added spans, the final "Video Fade In: 3.000 s.", the Undo title and the Undo result are equal to HEAD. Attempt 1 on A used the audio handle testid and timed out (a C script error); replaced | `rows-*.json` `videoFade`, `rows-a-attempt1-videoselector.*`, `shots/*-vf-*.png` |
| G327-AUTH | PASS, both viewports. `/studio-lab` shows the anonymous workspace and the demo badge, with `auth_user` null. `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. `/api/studio-token` with no header → 401; fake bearer → 500 with no token; bare → 400 | `g327-auth.json`, `shots/{lab,legacy}-*.png` |
| DOCS | PASS. Doc 232 l.4 is byte-equal to `**სტატუსი:** In Progress (stage 2 of 3; C round 327 PASS)`. The 7 TEMPLATE headings are in order. Every cited id exists: DP1 is in `preview-store.test.ts` (describe); DP2–DP16, DP5b, DP8a/8b, DP9a/9b and SP1–SP3 are `it(` rows. Doc 168 l.107 is the stage-b paragraph inside the granted block; its numbers equal A §3 and C's run | grep in this round |

## Findings
### C-R327-01 (Medium, origin: B sketch design §1.2.3, applied verbatim by A; the reviewer flagged it as A finding 1). A collection settle mid-drag swaps the stale pre-drag sentence into the `aria-live` status, then re-adds the fade text
- **Steps:** this is a real user whose public previews are still downloading. `probe-settle-remount.mjs` holds the MP3 responses with `page.route` to make the timing deterministic.
- **Reachability window (inference, not measured on a real network):** `public/middle-east.mp3` is 4.05 MB and `hero-music.mp3` 3.61 MB. At 10 Mbit/s they need about 3–6 s after page load. "Add then drag a fade" takes a few seconds, so the window is comparable on an ordinary connection.
- **Other async writers checked:** the video import ("Your own video", `runVideoImport`) is the other async `setStatus` path. Probed (`probe-video-import-{a,head}.json`): its status writes land before the drag or are deferred to the release, equal to HEAD at both viewports. The collection settle is the only async writer found to reach the flicker.
  1. Fresh anonymous context, `/studio-lab`, at 1440×900 and at 1280×720. The public-preview MP3s are still loading; the status reads "Loading the demo collection…".
  2. Select "Pulse" and press Add.
  3. Drag the clip's Fade In handle 40 px and hold the pointer still ("Fade In: 1.250 s").
  4. The last MP3 arrives: the collection settles, which is the `settledCollectionStatus` updater `setStatus`.
- **Expected (§4 "every status write … as at HEAD"):** HEAD shows **0** mutations in `[data-testid="arrangement-status"]` and the same span node.
- **Actual (A's tree, both viewports, 3 of 3 runs):**
  - `-Fade In: 1.250 s`, `+“Night Pulse · Pulse” added to the Music track at 00:00.000. Drag a clip…` (the stale committed text);
  - about 6 ms later, `-“Night Pulse · Pulse” added…`, `+Fade In: 1.250 s` (a new span node).
- An rAF sampler (240 frames) never saw the stale text at a frame boundary. rAF runs before paint, so a 6 ms swap could still fall between a callback and a paint: a visible flash is unlikely but not excluded. But the live region's DOM gets a stale node and then a re-inserted identical text. The project uses key-remount to make screen readers re-announce a text, so a duplicate announcement is likely. Whether a screen reader also speaks the stale sentence is **unverified**: there is no screen reader in the cloud.
- This is the async-lane ordering the reviewer described: the store is cleared (uSES sync render) before the reducer dispatch commits. It is not covered by DP12; A's jsdom ZZ1 could not reach it.
- **Evidence:** `c-round-327/probe-settle-{a,head}.json` (`afterSettle.rec`), `probe-settle-{a,head}-frames.json` (rAF frames), `shots/probe-settle-*-after-settle.png`, `probe-settle-remount.mjs`.

### C-R327-02 (Low, origin: B sketch design §1.1/§1.2.4; this is A-R327-REVIEW-SAME-TEXT-REMOUNT, now confirmed in the browser). After the settle, a same-value move remounts the status span
- **Steps:** as in C-R327-01, then move the pointer only vertically (+6 px), so the fade value stays 1.250.
- **Expected:** HEAD: 0 mutations, same node.
- **Actual:** A: `-Fade In: 1.250 s`, `+Fade In: 1.250 s` (`sameNode=false`), at both viewports. The next real move and the release equal HEAD.
- **Evidence:** `probe-settle-a.json` `afterSameValueMove`.
- **Note for B:** A's option (b) closes C-R327-02 but not C-R327-01. A fix must satisfy both: on a collection settle during a fade drag, 0 mutations in the status region and the same node, both before and after a same-value move, as at HEAD. `probe-settle-remount.mjs` (A vs HEAD) is the browser row for that.

## Info
- INFO-C327-ALT-CLICK-MARKER: in the no-BPM (SFX-only) end-stop setup, the bars ruler is rendered (20 px, BPM field empty), but C's Alt-click on it did not move the insert marker, on A and HEAD alike. C did not establish whether a no-BPM bars ruler is meant to take that click (a seconds-grid project). It may be a C script assumption rather than a product bug. It is not a round-327 change, and the row did not need it.
- INFO-C327-RELEASE-2ND-COMMIT: the stopped `release-commits` = 2 is recorded; the second commit's component count was not measured by C (the harness reports only the max).
- Environment-invalid: the first warm-up of both dev servers timed out on the cold compile; the next load was ready. Both are within the budget.

## Ableton conformance
Not applicable: a perf round, with behaviour held to HEAD.

## Gate rows (not claimed by C)
Full vitest, build, Biome/lint, typecheck, `npm run verify`, e2e smoke.
