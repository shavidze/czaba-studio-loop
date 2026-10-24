# C round 136 — V-0.3c marker row and marker menu in English

**Verdict: PASS** · browserVerified = realVerified = true · Real Playwright Chromium (headless), a fresh context per session, at 1440×900 and 1280×720, `http://127.0.0.1:5173/studio-lab`. env-status: store 200 (13:33:40Z). Snap was **off** at the start of every session, and every session started with 0 markers.

## Row results
| ID | Result | Evidence |
|---|---|---|
| T136-TARGETED | PASS: 16 files, 274/274, the same per-file counts as A | `c-round-136/out/vitest-16.json` |
| SOURCE-SCOPE | PASS: 9 ` M` + 2 `??` and nothing else; frozen list (940) OK at the start and the end; the 11 end hashes equal A's `end-sha256.txt`; protected `git diff 70f1e42` empty; no source change during C's phase | shell checks |
| AN-REVIEW | PASS, see below | `diff -u` against `b-round-135/r136-granted-start/` |
| MARKER-HEADER (both) | PASS: the titles are MK16/MK17/MK18; the aria-labels are still `Add marker (M)`, `Previous marker (Ctrl+←)` and `Next marker (Ctrl+→)`; aria-keyshortcuts are `M`, `Control+ArrowLeft` and `Control+ArrowRight` | `c136-*-all.json` rows MARKER-HEADER |
| MARKER-ADD (both) | PASS. (a) A clip on stems, no range (the detail fields are empty); playhead exactly 3.000. `+` opens the field with aria-label `Marker name`; `Intro` + Enter gives `Marker “Intro” added at 00:03.000.` The flag is at 3 s with aria-label `Marker “Intro” — 00:03.000` and title `“Intro” — 00:03.000\n` + MK5 (exact). (b) M at 3 s gives `A marker already exists at this time: “Intro”`; still 1 flag. (c) M at 5 s + Esc gives `Marker not added`; still 1 flag. (d) A range 8–10 on the stems clip with the playhead at 5 s: M + Enter makes the flag `Marker 1` at **8 s** (the range start, not the playhead) with `Marker “Marker 1” added at 00:08.000.` Undo removes the 8 s marker, then the Intro marker; the clips are unchanged | rows MARKER-ADD |
| MARKER-EDIT (both) | PASS. Intro at 3 s and Outro at 6 s. F2 → `Drop` → Enter gives `Marker name: “Drop”.`; Undo gives Intro, Redo gives Drop. F2, clear, Enter gives `The name is empty — “Drop” is kept` and the name is unchanged. Delete gives `Marker “Drop” deleted.`, the flag is gone and focus moves to the neighbour flag `Marker “Outro” — 00:06.000`; Undo restores it | rows MARKER-EDIT |
| MARKER-MOVE (both) | PASS. Alpha at 1 s and Beta at 3 s. ArrowRight gives `Marker “Alpha” moved to 00:01.100.` A direct drag onto 3.0 s leaves Alpha at 1.100. Arrow onto 3.0 s (from 2.9), key held, gives `A marker already exists at this time: “Beta”`, **announced once** (MutationObserver), and Alpha stays at 2.900. ArrowLeft to 0, then held, gives `The marker is at the start of the timeline.`, **announced once**. See notes 1–2 for where B's wording differs | rows MARKER-MOVE |
| MARKER-NAV (both) | PASS. Flags at 3 s and 6 s; no clips (project end 0). At 0: previous (button and Ctrl+←) gives `No more markers before the playhead`. At 8 and 8.5: next (button and Ctrl+→) gives `No more markers after the playhead`, and the playhead stays put. From 4.5 s: previous goes to 3, next to 6 (buttons and keys), and the observer shows no edge status. Note 1: from 1 s, previous goes to 0 (timeline start) by design | rows MARKER-NAV |
| MARKER-MENU (both) | PASS. Right-click on M1 opens a menu with aria-label `Marker “M1”` and the items `Rename (F2)`, `Play from here`, `Delete (Delete)` in order; Esc closes it. Shift+F10 on a focused M2 opens `Marker “M2”` with the same items. Rename opens the field (`Marker name`, value M2). Play from here on M3: the playhead goes from 0 to 6.0+ and advances; real output tap peak 0.297 (119 of 125 frames non-silent); Pause shown, then Space stops it. Delete on M4 gives `Marker “M4” deleted.`, leaving M1, M2 and M3 | rows MARKER-MENU, `out/playtap-*.json` |
| GEO-COUNT (both) | PASS: 39 steps per viewport. The marker surface had 0 Georgian and 0 `«»` **before** any subtraction; status and observer net 0. Subtracted from the status only: the load-time demo-ready status, and the clip-added status (demo title `ღამის პულსი · პულსი` + track name `სტემები`, V-0.4/V-0.5) | JSON `georgianCounts` |
| LAYOUT (both) | PASS. S0/S1/S2 against round 135: **0** deltas >1 px at both sizes, with identical element counts. Against the `c-round-125` baseline, only the earlier text-width deltas of rounds 134/135 remain. With 2–4 flags the marker row has `scrollWidth == clientWidth` in all steps. The menu is 160×94 with items 150 px and no overflow; its right edge is at 767/832 px, inside the viewport at both sizes | `out/layout-compare.json`, `out/layout130-*.json` |
| REG-135 | PASS: Follow title `Follow: the view follows the playback position` | `checks.reg135` |
| G136-3 (alone, last) | PASS: `/studio-lab` shows the workspace and the demo badge. `/studio/middle-east` at 1440 and 1280 shows "Sign in required", no workspace, 0 `audio[src]`. `GET /api/studio-token?…` returns **401** `Please sign in to access Studio.` The fake-Bearer 403 check is **BLOCKED (backend unavailable in cloud)** | `out/g136-3.json`, `shots/g136-3-*.png` |
| PX-NET / REG-HYD | PASS: in all sessions, 0 forbidden requests, 0 Authorization headers, 0 hydration errors, 0 pageerror. Only the known cart noise appeared | `net` in every out JSON |

Gate rows (not claimed by C): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## AN-REVIEW
- `strings.ts`: one EOF hunk adds a local interface `StudioMarkerTimeText` and `studioMarkerStrings` (MK1–MK21, exact §1.1 text). The other objects are byte-identical and the file still imports nothing.
- MarkerMenu: the import, 3 labels and the aria-label, and nothing else.
- MarkerRow: the import plus the §2 lines in the §1.1 caller shapes:
  - the `direction === 1 ? noneAfter : noneBefore` order is the same;
  - l.384 is still a local `const message`, so `status !== message` is unchanged;
  - the `\n` and the hint stay in the caller.
  No handler, condition, key or class changed.
- Tests:
  - the 23 pins are hand-written English literals with the same matchers;
  - the negative pins are now `already exists` and `No more markers`;
  - ST28–ST30 are present;
  - the new file has 3 `it`s (MS1–MS3);
  - no `skip`, `only` or `todo`.
- Meaning check against the Georgian:
  - MK7 keeps the existing name and "at this time";
  - MK8/MK9: `წინ` → after and `უკან` → before, picked as before;
  - MK11 has the name and time; MK12 keeps the old name; MK15 has the name and new time;
  - MK16 names both places and M; MK17/MK18 name each direction and key;
  - MK5 has all six gestures; MK1 has F2; MK3 has Delete.
  All facts survive.
- Doc 111: only l.4 and l.146 changed and l.150 was deleted. Doc 112 is in Georgian with the TEMPLATE sections, and its status names C round 136 as still to come.
- Shell writes: A lists them; mutation backups restored, end hashes verified.

## Ableton correspondence (Live 12 manual §6.4, B's capture `b-round-133/live/arrangement-view.txt`)
Only text changed this round. The "CZABA requirement met" column is the C result above.

| Behaviour | CZABA requirement | Ableton correspondence |
|---|---|---|
| Add at the playhead or at the range start | met | **confirmed**: same two places. "marker" instead of "locator" is a deliberate difference |
| Play from a marker (double-click / menu) | met (menu checked with real output) | **confirmed** (§6.4 double-click). The menu item is a CZABA addition |
| Move by drag or arrows | met | **confirmed** for the gestures. Refusing an occupied time is a CZABA rule and is **unconfirmed** in Live |
| Rename | met | word **confirmed**. F2 instead of Ctrl+R is a **deliberate difference** |
| Delete key / menu | met | **confirmed** |
| Previous / next | met | **deliberate difference**: no launch quantization, and Ctrl+arrows are a CZABA choice |
| Context menu | met | **partly confirmed**. Shift+F10 is an OS convention and not a Live claim |

## Notes for B (no bugs; not a FAIL of A)
1. **NAV task text and the code differ.** "Playhead before the first flag → previous → MK9" does not match the code, which is unchanged since before this round (`adjacentMarkerTarget`). Previous from 1 s jumps to 0 (the timeline start). MK9 appears only at 0. Next likewise goes to the project end first. C tested MK9 at 0 and MK8 with project end 0.
2. **MOVE drag task text and MV5 differ.** A direct drag onto an occupied time leaves the flag in place with **no status**. A stepped drag stops at the last free time: 00:02.794 at both sizes, one Move Marker entry, and Undo reverts it. MK7 appears for the arrow-key conflict. This is pre-existing design, not a V-0.3c change. If wanted, the silent refusal on drag could become a polish or a11y item (info only).
3. **Stale status (info, pre-existing).** After a successful jump between flags, the status line keeps the previous edge status. No new edge status is announced.
4. **Superseded harness run (not ENV-invalid; no replacement budget used).** `c136 1440 r1` had harness mistakes, while the app behaved correctly:
   - the range field holds plain seconds, not mm:ss;
   - the expectations in notes 1–2 came from the task text;
   - Play-from-here was tried in a project with end 0.
   r2 replaced it; 1280 r1 was green on its first run. JSON key `supersededHarnessRuns`; `invalidRuns` is empty.
5. **Action for B.** In the backlog and feature-status entry for V-0.3c, and in any regression checklist, correct the two expectations so the regression round does not hit the same wall:
   - (a) previous/next go to the timeline start or the project end first (and to clip edges on the edge-navigation tracks), so MK9 appears only at 0 and MK8 only at or after the end;
   - (b) a direct drag onto an occupied time is refused silently, a stepped drag keeps the last free time (MV5), and MK7 comes from the arrow-key conflict.
6. **G136-3 is passed only in part:** the lab, the protected route and the token 401 pass. The fake-Bearer 403 check is BLOCKED (backend).
7. **Other Georgian found outside the marker surface (not V-0.3c):**
   - the range readout line `მონიშვნა: … Delete = წაშლა, სიცარიელე რჩება …` (StudioWorkspace, V-0.3d), seen in `add-d`;
   - the header subtitle, the demo badge, the library, the video dock and the detail panel (V-0.4/V-0.5).

## Screenshots opened and described (`c-round-136/shots/`)
| Shot | What it shows |
|---|---|
| `probe2.png` | Fresh empty project with `Markers (+) (◀) (▶)` in the marker row; the playhead at 00:03.000 after the handle steps; end 00:00.000 |
| `add-a-1440-r2.png` | The stems clip 0–16 s; an `Intro` flag (outlined, selected) at 0:03; the status line reads `Marker “Intro” added at 00:03.000.`; Undo reads `Undo: Ad…` |
| `menu-rc-1440-r2.png` | Four flags M1–M4. A context menu at M1 lists `Rename (F2)`, `Play from here` and `Delete (Delete)`, fully inside the view, no clipping |
| `menu-sf10-1280-r1.png` | 1280: the Shift+F10 menu on M2 with the same three items; the first item has a focus ring; the menu is inside the viewport |
| `move-at0-1280-r1.png` | 1280: the `Alpha` flag at 0:00 (focused) and `Beta` at 0:03; the status line reads `The marker is at the start of the timeline.` |
| `g136-3-protected-1440.png` | The lock icon, "Sign in required" and a Sign In button; no workspace |
| `hdr-1280-r1.png` | Fresh project at 1280: `Markers (+) (◀) (▶)`, no flags; the transport wraps to two lines (as in round 135); the demo-ready status |
| `add-a-field-1280-r1.png` | The name field open at 0:03 with the default `Marker 1` selected; the stems clip 0–16 s |
| `add-d-1280-r1.png` | Range 8–10 on the stems clip with the playhead at 0:05. The new flag `Marker 1` is at **0:08** (range start) next to `Intro` at 0:03; status `Marker “Marker 1” added at 00:08.000.`; below it the Georgian range readout (V-0.3d) |
| `edit-empty-1280-r1.png` | The `Drop` flag (selected) at 0:03 and `Outro` at 0:06; status `The name is empty — “Drop” is kept`; Undo reads `Undo: Re…` |
| `edit-delete-1280-r1.png` | Only `Outro` remains and it has the focus ring; status `Marker “Drop” deleted.` |
| `move-drag-direct-1280-r1.png` | `Alpha` is still at about 0:01.1 after the direct drag onto Beta (0:03); the status still shows the earlier `Marker “Alpha” moved to 00:01.100.` (no new status for the refused drag) |
| `nav-edge-1280-r1.png` | Flags N1 0:03 and N2 0:06 with the playhead at 0:08.5; status `No more markers after the playhead` |
| `menu-play-1280-r1.png` | Playing (`❚❚ Pause`, 00:07.050) after Play from here on M3 (0:06); the stems meter and the master meter are active (−10.6 dB) |
| `S1-1280-r1.png` | Layout state S1: a group, video, a loop of 2–4 s and a `Marker 1` flag; the group-created status is English (round 133); no clipping in the marker row |
| `g136-3-lab-1440.png` | Fresh context without credentials: the workspace with the demo badge `დემო კოლექცია — ავტორიზაცია არ სჭირდება` |

Not opened: the other 1440 r2 counterparts, every 1440 r1 shot (superseded run), S0/S2 at both sizes, S1-1440 and `g136-3-protected-1280`. Those rows are covered by the DOM measurements in the out JSON.

## Next
After the gate, V-0.3c can become `c_pass`. Per §8, round 137 = V-0.3d, unless B plans on or after 2026-10-27, when the regression round comes first.
