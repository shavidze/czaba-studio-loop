# A round 137 — VISUAL-A V-0.3d: rest of StudioWorkspace + Waveform Zoom in English

Status: **A done; C round 137 pending.** No commit/push/stash/checkout/install/--write/check:fix.

## Start checks
- HEAD 7d9fed0f434b506b42e0d3bc86346202a28273f2; `git status --short` empty.
- Frozen list (939) `sha256sum -c --quiet` OK; 12 grant start hashes OK; start copies OK.
- Pre-grep: `a-round-137/pre-grep.txt` (19 §1.1 phrases over app/** and e2e/**). StudioWorkspace 23 lines and waveform-zoom.ts l.22 matched §0 exactly; all 23 pin lines matched §0; e2e/ 0. Non-granted hits are only the §0 false matches, plus two DIFFERENT texts that are not §1.1 texts (so no stop): `ArrangementGroupHeader.tsx:241` aria-label `ჯგუფის სახელი — {name}` and `routes/studio-lab.tsx:8` meta title `Studio Lab — დემო სამუშაო სივრცე`. -> for B: assign to V-0.4 / V-0.5.

## Changed files (exactly the 14 granted)
- M `app/lib/arrangement/strings.ts`: WS keys appended to studioVideoStrings (expanded, expandedLibraryOpened, returnedLibraryCollapsed, returnedCompact, returnedLibraryRecollapsed), studioViewStrings (waveformZoomLabel, waveformZoomTitle(percent), waveformZoomStatus(percent)), studioLaneMoveStrings (shiftHint, shiftLockedHint), studioTrackGroupStrings (renameEmpty, renamed). New after studioMarkerStrings: studioClipEnvelopeStrings (modeOn, modeOff, toggleOnTitle, toggleOffTitle) and studioWorkspaceStrings (headingSuffix, rangeReadout({start,end,length}), rangeDeleteHint, clipsSelected(count), clipLabel, selectedClipTitle({title,start,length,offset})); local non-exported interfaces StudioWorkspaceRangeText / StudioWorkspaceClipText. Existing keys byte-identical; no import.
- M `app/components/arrangement/StudioWorkspace.tsx`: import + §1.1 lines only. l.325 selector (now l.331) byte-identical. Local names and the two exports kept. Biome wrap of the all-lanes span: `{studioEditStrings.allTracks} ·{' '}`.
- M `app/lib/arrangement/waveform-zoom.ts`: import `./strings` + l.22 body.
- M `__tests__/strings.test.ts`: import specifiers (+ StudioWorkspace aliases, waveformZoomStatus, 2 new objects); additive map entries; ratchet constant deleted; ST25 block deleted and retitled; new describe 'V-0.3d workspace strings' ST31–ST33.
- M 7 pin files (exact granted lines; hand-written English; same matchers): floating-video l.129/131/132/133/134 (l.134 Biome-wrapped into 2 lines), track-groups-ui l.613/627, clip-envelope-ui l.120/121/352/356, purchased-collection-ui l.31/37, waveform-zoom.test l.435/476/478/485, all-lane-clipboard l.495 (retitled)/502/504/513/515, track-layout l.865.
- M `docs/implementation/2026/quarter-IV/112-studio-v0-marker-strings.md`: l.4, l.115, l.119 only (GATE136-DOC112-STATUS).
- ?? `__tests__/workspace-strings-ui.test.tsx` (WSU1, WSU2).
- ?? `docs/implementation/2026/quarter-IV/113-studio-v0-workspace-strings.md` (Georgian; status In Progress, C round 137 pending).

## `it` counts (grep `^\s*it\(`; it.each rows not expanded)
before -> after: strings 30->33, floating-video 32->32, track-groups-ui 14->14, clip-envelope-ui 24->24, purchased-collection-ui 6->6, waveform-zoom 9->9, all-lane-clipboard 14->14, track-layout 36->36, workspace-strings-ui new 2. (`a-round-137/it-counts-{before,after}.txt`)

## Checks actually run
- `npm run typecheck` exit 0 (`a-round-137/typecheck.log`). The first run failed (TS2322, selectedTitle string|null); fixed, see deviation 1.
- `npm run lint` exit 0 (218 warnings + 1 info repo-wide, 0 in owned files).
- Read-only `npx biome check` on the 12 changed code/test files: 0 diagnostics.
- `npx vitest run` on 16 files (9 named: strings, floating-video, track-groups-ui, clip-envelope-ui, purchased-collection-ui, waveform-zoom, all-lane-clipboard, track-layout, workspace-strings-ui; 7 neighbours: gesture-guard, delete-selection-ui, detail-panel, status-announcement-ui, marker-strings-ui, track-group-collapse-ui, navigation-strings-ui): **303/303 passed**, 0 failed -> `a-round-137/vitest.json`. Per file: all-lane-clipboard 14, clip-envelope-ui 25, delete-selection-ui 13, detail-panel 24, floating-video 45, gesture-guard 19, marker-strings-ui 3, navigation-strings-ui 5, purchased-collection-ui 6, status-announcement-ui 33, strings 33, track-group-collapse-ui 22, track-groups-ui 14, track-layout 36, waveform-zoom 9, workspace-strings-ui 2. `vitest.json` was regenerated on the final end tree (after all edits; end-sha256 still OK).
- Not run (gate): full suite, `npm run verify`, build, e2e.

## Mutations (each applied, run, restored; sha256 vs `a-round-137/pre-mutation-sha256.txt` OK) — `a-round-137/mutations/`
| ID | Red tests |
|---|---|
| m45 WS2 locked->fixed | ST20 (laneMove map), WSU1 |
| m46 ternary swapped | WSU1 |
| m47 WS6 trailing `.` removed | ST14, ST32, floating-video x4 (C-R13-02 return-status tests) |
| m48 WS8 `… remains` | ST31, ST33 (equality), track-groups-ui TG6 (l.627) |
| m49 WS16 trailing `.` removed | ST31, ST32, waveform-zoom WZ1 (l.435) |
| m50 WS18 drops `length` | ST31, all-lane-clipboard both range tests (l.504, l.515) |
| m51 `clip selected` | ST31, WSU2 |
| m52 Georgian letter inline in WS17 | ST33 (+ purchased-collection-ui PW1/PW6) |

## Forward rule GATE130-S3 (WS key -> hand-written UI literal)
WS1–2 WSU1 · WS3–7 floating-video consts · WS8–9 track-groups-ui l.613/627 · WS10–13 clip-envelope-ui l.120/121/352/356 · WS14–15 waveform-zoom.test l.476/478/485 · WS16 waveform-zoom.test l.435 · WS17 purchased-collection-ui l.31/37 · WS18/WS20 all-lane-clipboard l.504/515 · WS19 all-lane-clipboard l.502/504 · WS21 WSU2 · WS22–23 track-layout l.865 (+ title===textContent) and WSU2.

## Code review (real code-reviewer subagent)
PASS, **9/10**, 0 Critical/High/Medium. Findings: (1) Low, floating-video l.134 Biome wrap is 2 lines: disclosed here for AN-REVIEW. (2) Low, spec defect: gesture-guard has no StudioWorkspace mount (see deviation 2). (3) Low/info: strings.test now imports StudioWorkspace for ST32 (accepted; optional later move). (4) Low: doc 113 WS14–16 row wrong for WS14. **Fixed** (split row). (5) Info: studio-lab.tsx:8 and ArrangementGroupHeader.tsx:241 Georgian. For B to assign.
**Architecture note (for B/root, not acted on):** strings.ts and especially strings.test.ts change every round 133–137 with exhaustive per-area maps; keep strings.ts as is (leaf, additive, one object per area); the existing checkpoint request (`b-round-136-checkpoint-request.md`) should weigh splitting the test per area before the module.

## Deviations
1. `title: selectedTitle ?? selectedClip.sourceId` in the WS23 call. selectedTitle is typed `string | null` but is never null inside the `selectedClip` branch. The fallback can't be reached and matches the file's own l.2128 pattern, so no type assertion was needed. The old template literal hid this.
2. The WSU harness is all-lane-clipboard's StudioWorkspace mount and global stubs, plus gesture-guard's row getBoundingClientRect, pointer-capture stubs and drag steps (copied, not imported). gesture-guard l.296–336 does not mount StudioWorkspace. WSU2 selects via `selectClips([...])`, the context's existing multi-select path, not a Ctrl+click.
3. WSU1 also asserts that the clip lands on stems at start 2 (Shift case). This is extra.

## Shell writes
Only the 14 granted store paths (python replace / Write), and the loop folder `a-round-137/` (pre-grep, logs, vitest.json, mutations/, hashes, diff.patch) plus this report. /tmp/sw0.tsx is a scratch copy outside the store.

## End state
`git status --short`: 12 ` M` + 2 `??` (the granted paths) and nothing else. Frozen list OK. Protected `git diff 7d9fed0` empty. End hashes: `a-round-137/end-sha256.txt` (14 paths).

## B acceptance criteria met (A side)
- §2 ownership; §3.1 ST31–33 (strings 30->33); §3.2 pins; §3.3 WSU1–2; §3.4 mapping; §3.5 m45–m52 all red as specified; §4 checks (start/end integrity, pre-grep, typecheck, lint, biome, targeted vitest, reviewer).
- NOT claimed: any §5 browser row (C's), gate rows.

## Known gaps
- No browser check by A. In jsdom the range-readout spacing comes from JSX, so C must check the real `textContent` (§9).
- Mixed state for one round (accepted, R4): lane overlay `ყველა ხაზი`, dock buttons, detail-panel range status.

## Exact next C checks
T137-TARGETED (16-file list above, expect 303/303); SOURCE-SCOPE (end-sha256.txt); AN-REVIEW (note the floating-video l.134 2-line wrap, the all-lanes span wrap, the `??` fallback); HEADING `CZABA Studio Lab · Workspace`; LANE-HINT; VIDEO-STATUS; GROUP-RENAME (`Group name: “Drums”.` / `The name is empty — “Drums” is kept`); ENVELOPE; WAVEFORM-ZOOM; RANGE-READOUT (both exact §1.1 lines); SELECTION; GEO-COUNT; LAYOUT at 1280 with the all-tracks readout; REG-136; G137-3; PX-NET / REG-HYD.
