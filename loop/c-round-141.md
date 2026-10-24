# C round 141 — VISUAL-A V-0.4d: default group and track names in English

Verifier: C · 2026-10-24 · Baseline `6ebbf3e` · Target `http://127.0.0.1:5173/studio-lab` (env-status: store 200)
**Verdict: PASS.** `browserVerified` = `realVerified` = **true**. 0 Critical/High/Medium; 1 new Low (C-R141-01 → `deferred_low_polish`). One backend-only sub-check is BLOCKED (fake-Bearer 403).

Evidence: `c-round-141/{tools,out,shots}/`, JSON `c-round-141.json`.

## Rows
Snap at start: `off` in all 6 row sessions (names/gdef/reg × 1440, 1280), from `checks.*-snapAtStart`.

| Row | Result | Evidence |
|---|---|---|
| T141-TARGETED | PASS: 23 files / 293 tests / 0 fail, the same as A | `out/vitest-23.json` |
| SOURCE-SCOPE | PASS. Start and end: the frozen list (944) is OK, A's `end-sha256.txt` is OK, the protected diff vs `6ebbf3e` is empty, and `git status` shows exactly 15 M + 2 ?? granted paths. The full tree sha is identical at C start and end, so no source changed during C's phase | `out/source-scope-{start,end}.txt`, `out/c-{start,end}-tree.txt` |
| AN-REVIEW | PASS. DN1–DN4 are exact and nothing else changed in the 4 source files. The 9 sweep files are byte-identical to `sed s/ჯგუფი/Group/g` of their start copies (token-only, no Biome rewrap). strings.test changes only §3.1. Doc 116 changes only the 3 named lines. The two new files were read too. `default-track-names-ssr.test.tsx` starts with `// @vitest-environment node`. DS1's four labels are hand-written literals and do not import the module under test. DS2 checks only the track-header labels plus the default-group regex, not the whole HTML (§3.3). C confirmed that `String.fromCodePoint(0x10ef,0x10d2,0x10e3,0x10e4,0x10d8) === 'ჯგუფი'` is `true`. Doc 117's status says C round 141 has not run yet. The `ჯგუფი` grep over tests and e2e finds 0 | `out/an-diff-src.txt`, `an-sweep.txt`, `an-diff-strings-test.txt`, `an-diff-docs.txt` |
| TRACK-NAMES | PASS at 1440 and 1280. The aria-labels are `Video/Music/Stems/SFX — set as the active track` and the visible name text is exactly those words (the existing `· active` badge span is excluded). Clicking Music gives `Music — set as the active track, selected`. The Solo label is `Solo — Music (…)`. The add status is `“ღამის პულსი · პადი” added to the Music track at 00:02.000.` The Music meter title is `Music · Peak −15.8 dBFS` during and after playback, and the video meter title is `Video · Peak −∞ dBFS`. Old default names outside R5: 0 | `out/c141-{1440-r2,1280-r1}-all.json`, `shots/names-*.png` |
| GROUP-DEFAULT | PASS at both viewports. See the step list below the table | `shots/group1-*.png`, `group2-*.png`, `group1-outer-after-drums-*.png` |
| GROUP-MIX-REG | PASS. The labels are `Mute — Group 1 (group)`, `Solo — Group 1 (group, Ctrl/Cmd+click = add to solo)` and `Volume — Group 1 (group)`; the Undo title is `Undo: Mute — Group 1`. **Real audio** (analyser tap on destination, window 1.0–2.6 s, ≥96 frames each): group Mute drops −20.74 → −200 dBFS (179.3 dB) at 1440 and 179.3 dB at 1280. Unmute restores to within 0.01 dB (1440) and 0.03 dB (1280) | `measurements.groupMute` |
| GEO-COUNT | PASS. Net Georgian is 0 over 11 steps per viewport, both on the round-140 surface and on a workspace-wide scan (text + aria-label/title/placeholder/valuetext/alt) outside the library, detail panel, video dock and `document.title`. Subtractions are listed below the table | `georgianCounts` |
| LAYOUT | PASS. In S0/S1/S2 at 1440 and 1280, after mapping the old Georgian keys to English, **0 boxes moved >1 px**. That includes the track-name buttons, M/S/fader, the library options and the footer status box. The group row matches the stored round-140 values at both viewports: row h 28, fold/name/M/S 24×24 at x 296/322/403/429, name w 79, fader 48×4 at x 455 | `out/layout-compare.json`, `out/group-row-boxes.json`, `shots/S*-*.png`, `group-row-*.png` |
| REG-140 | PASS at both viewports. The envelope add status is `Envelope: point added — {t} s · 0.0 dB.` and the Master Peak after the click is `Master Peak −∞ dBFS — click to clear` | `shots/reg140-*.png` |
| G141-3 (alone, last) | PASS. `/studio-lab` shows the workspace and the demo badge. `/studio/middle-east` at 1440 and 1280 shows "Sign in required", no workspace and 0 `audio[src]`. `GET /api/studio-token` returns 401 `Please sign in to access Studio.`. **Fake-Bearer 403: BLOCKED (backend unavailable in cloud)** | `out/g141-3.json`, `shots/g141-3-*.png` |
| PX-NET / REG-HYD | PASS. All 6 row sessions plus the layout, group-row and G141-3 sessions had 0 forbidden requests, 0 Authorization headers, 0 hydration errors and 0 pageerror. Only the known cart noise appeared | `net` in each JSON |

**GROUP-DEFAULT steps:**
1. Music + Stems, Ctrl+G → `Group “Group 1” created: Music, Stems.`, aria-label `Group 1 — group, selected`, text `▣Group 1`, fold label `Fold or unfold group — Group 1`.
2. Group 1 + SFX, Ctrl+G → `Group “Group 2” created: Group 1, SFX.` (exact text, members in timeline order).
3. Ctrl+Shift+G → `Group “Group 2” ungrouped.`
4. F2 → the input label is `Group name — Group 1`. Rename to Drums → `Group name: “Drums”.`. Drums + SFX, Ctrl+G → **`Group “Group 1” created: Drums, SFX.`**: the renamed group's number is reused while Drums still exists, and there is no Group 2.
5. Undo ×6 and Redo ×6. The history holds Group Tracks (step 1), Mute and Unmute (the GROUP-MIX-REG toggles, between step 1 and step 2), then Group Tracks, Ungroup Tracks, Rename Group and Group Tracks. So 6 undos go back to just after step 1: every title is English (`Group Tracks`, `Rename Group`, `Ungroup Tracks`, `Mute — Group 1`). Redo restores Drums inside Group 1.

**GEO-COUNT subtractions (R5):**
- the demo-ready load status (V-0.5);
- the demo source titles ღამის პულსი / პადი / ბასი / სრული მიქსი (data, V-0.5);
- the **demo badge** `დემო კოლექცია — ავტორიზაცია არ სჭირდება` (`collection.ts` l.16, collection copy, V-0.5). This one is **not** in §5's explicit list; C added it under R5's "collection messages". B should confirm.

Excluded surfaces: the library (its folder labels are still `მუსიკა`/`სტემები`), the detail panel, the dock and `document.title`.

## Invalid runs (harness, not app)
- 1440 r1, first attempt: a missing `report.cjs` require crashed the script before the browser launched.
- 1440 r1, second attempt (`out/c141-1440-r1-all.json`, 12 fails): two harness defects. The demo badge was not in the subtraction list, and the name-text read included the `· active` badge span. Both were fixed and the row replaced by 1440 r2 (63 OK / 0 fail).
- layout130, first attempt: a missing `h3.cjs` require; no browser run.

## Ableton (rated separately)
| Behaviour | CZABA requirement | Ableton correspondence |
|---|---|---|
| Default group name `Group N`, lowest free number | met | **unconfirmed**: B's Live 12 capture (§18.3) has the title only; no Live claim made |
| Default track names Video/Music/Stems/SFX | met | **unconfirmed / not applicable**: CZABA demo-route data |

## Notes for B
- A's deviations were checked:
  - the ST40 video seed is required by `createArrangement`;
  - the DS2 regex built from codepoints was **verified** by C to equal the literal (B chooses which form to keep);
  - m81b is the valid m81 run.
- **C-R141-01 (Low → `deferred_low_polish`):** after GROUP-DEFAULT step 4 at 1280, the nested group's 5-letter name `Drums` shows as `Dru…` (`shots/group1-outer-after-drums-1280-r1.png`). The header is 224 px; it holds an indent, fold, glyph, M, S and the fader. **Inference, not measured against round 140:** the cause is the existing `flex-1 truncate` with the 12 px nesting indent, not V-0.4d. LAYOUT shows 0 px movement and C did not measure a nested group in round 140. The full name stays in the aria-label.
- Gate rows are not claimed: full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.
