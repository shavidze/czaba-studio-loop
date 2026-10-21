# B — Round 1 decision record

Date: 2026-10-07 · Author: B (task writer / dispatcher) · Advisor: **available and used** (called once after orientation, before writing anything)

## 1. Inputs read

- `tasks/round-1.md`, a verbatim copy of the previous `current-task.md`. The original was not deleted; it was replaced by the round-2 task.
- `a-round-1.md`, `c-round-1.md`, `c-round-1.json`, `backlog.json`, `docs/technical/studio-real-workspace/plan.md`, `orchestrator-decisions.md`, `c-baseline.md` (video pitfalls P10/P11, tests T8–T10).
- Source, to make round 2 concrete:
  - `ArrangementContext.tsx`, `model.ts`, `schedule.ts`, `graph.client.ts`, `types/arrangement.ts`;
  - `ArrangementLane/Clip/StudioWorkspace.tsx`, `routes/studio-lab.tsx`;
  - `lib/sfx-video.client.ts`;
  - `app/styles/app.css` (lines 279–286, 447–460);
  - the prototype's `syncVideo` and upload/drop code;
  - the Ableton TRN rows.

## 2. Backlog changes (only what C evidenced)

| Item | Before | After | Evidence |
| --- | --- | --- | --- |
| SRW-01 | todo | **done** | C `c-round-1.json`: `taskStatus PASS`, 24/24 passed, `blocked []`. Gates were re-run by C: tsc 0, vitest 517/517, build ok, biome 0 errors, hashes 4× OK. Anonymous load confirmed with no auth or R2 traffic. Purchase protection confirmed: `/api/studio-token` returns 401 for anonymous requests. |
| SRW-01 R1-E1 wording | silent window 3–5 s | 4–5 s | C's note: the 2 s impact at 2 s decays until 4 s. C measured 4–5 s as exact zeros. |
| SRW-02 / 03 / 04 | todo | in_progress (dispatched round 2) | Dispatch only; not done. |
| SRW-19 | `optional: true` | `optional: false` + `scope_decision` | `orchestrator-decisions.md`: FB-07 stays in scope and must not be silently dropped. Scope bookkeeping, not a status claim. |

Every other item is unchanged. **FB-02 is partial:** C passed only Delete Time. Cut and Cut Time (SRW-09) are **not** done. **FB-01 is partial:** the navigation part (SRW-10) remains.

## 3. C's bugs → routing

All four are Low; there are no Critical or High bugs.

| Bug | Decision | Where |
| --- | --- | --- |
| C-R1-01 lookahead pulls the playhead back | Fix with a two-case rule: a fresh start holds at `from` until `startAt`; a continuous reschedule stays continuous. C's suggested "clamp to `from`" alone would step the playhead **forward** about 50 ms on every edit while playing, because `syncPlayback` anchors at the future handoff position. | R2-F1, `transport.ts` + tests |
| C-R1-02 page scrolls 90 px | Root-owned CSS already has `body:has(.studio-container){padding-bottom:0}` (`app.css:458`, plus `:284`). A adds the marker class to the workspace root. No root or CSS edit. | R2-F2 |
| C-R1-03 Undo of Delete Time while playing | **D-12**: keep the current behaviour. Undo does not move the playhead (Ableton-like), and the audio follows the restored timeline, as C confirmed. Rationale: the smallest honest behaviour, consistent with the Ableton grounding. The user may override it. | R2-F4 regression only |
| C-R1-04 status truncated | The status gets its own wrapping row. | R2-F3 |

The root cookie banner covers the footer until it is dismissed. It is root-owned, so it is recorded for the root owner and not assigned to A.

## 4. Round 2 scope and rationale

Round 2 contains the bug fixes plus **SRW-02 + SRW-03 + SRW-04**. This follows the plan's round table and the dependency order: SRW-02 depends on SRW-01, SRW-03 on SRW-02, SRW-04 on SRW-01. The prototype's central flow, "find sound → add → **fit video** → export", is still missing its video step, which is FB-15 and FB-16. Scope was not shrunk: anything A cannot finish must be listed as "not ready", and C fails it.

New binding decisions, recorded in the plan as D-12..D-15:

- **D-13 Video sound.** The `<video>` element is always muted. The file's audio is decoded into an `AudioBuffer` and played on the video lane through the same `applySchedule`. The video lane gets M/S/Volume ("ორიგინალი ხმა"), and solo rules include it. Why: this is the only design where live mute/volume and the WAV export stay identical (D-02, D-11). FB-16 asks for an independent mute while the video keeps playing; a gain change gives exactly that. Two round-1 test contracts change as a result ("video track excluded" and "isTrackAudible false for video"); A must name the edited tests.
- **D-14** No audio decode for videos longer than 20 minutes. This is a memory guard, and the UI states it explicitly.
- **D-15** Single position model. Play resumes where it was paused; Home and ↤ go to 0. Why: the prototype the user already saw works this way, and Ableton's TRN-01 insert-marker split is a recorded ⚖ difference. Picking one variable is the smallest unambiguous contract. R4-P3 was reworded to match.
- **Import rules.** Classify by MIME, or by extension when the MIME is empty; the probe makes the final decision. Audio files are rejected (D-05). Clips are placed sequentially, one undo per file. Only `blob:` URLs are used, with no network.
- **R2-V0 reproduction comes first.** FB-15 is a "confirmed problem to reproduce", so A must record the facts before fixing anything.

## 5. Test media (B-generated, under B-owned `tmp/studio-real-loop/media/`)

All fixtures were generated with the local `ffmpeg 8.0.1` (`lavfi` sources). Checksums are in `media/SHA256SUMS.txt`.

| File | Command essence | sha256 (prefix) |
| --- | --- | --- |
| beeps-6s-vp9-opus.webm | testsrc2 640×360 6 s + `aevalsrc=0.5*sin(2π·1000t)*lt(mod(t,1),0.1)` → libvpx-vp9 + libopus | 2c4f59dd |
| clip-4s-vp9-opus.webm | testsrc 4 s + 500 Hz beeps → VP9/Opus | 400625b3 |
| noaudio-2s-vp9.webm | testsrc 2 s, `-an` | 1fbf7560 |
| beeps-6s-h264-aac.mp4 | same beeps → libx264 + aac | 628ac6bd |
| clip-3s-h264-aac.mov | smptebars 3 s + 750 Hz beeps → H.264/AAC, `-f mov` | e0726003 |
| noaudio-2s-h264.mp4 | copy of `tmp/studio-own-mp4-test.mp4` | 9bfcaeaa |
| broken.mp4 | 200 000 random bytes | 38db94a0 |
| tone-2s.wav | `sine=440` 2 s PCM | 232d15a8 |

All beep fixtures are **stereo** (`aevalsrc` with `c=stereo`, `ffprobe channels=2`). The first set was mono, and the advisor caught it: a mono source passes the pan-0 `StereoPanner` at −3 dB (A's L11), which would have made R3-V3's bit-level oracle fail for the wrong reason. `tone-2s.wav` stays mono because it is only used for the rejection test.

Environment risk: gstack launches Playwright's bundled Chromium (`browser-manager.ts` `chromium.launch`), which may lack H.264/AAC. For that reason the primary positive path and the export oracle (R3-V3) use open-codec WebM. MP4/MOV positive paths become "env-limited → Tech Lead in real Chrome" only if `canPlayType` says so; A records the actual value. Delivery into the page: gstack `upload` onto the hidden input; drops are synthetic `DataTransfer` events built from `input.files`.

## 6. Decision

**CONTINUE.** SRW-01 is done. SRW-02..SRW-20 are unimplemented, and SRW-21 is blocked only for the protected-route mount; its adapter part can proceed. Nothing requires external information, approval or credentials, so BLOCKED does not apply. COMPLETE needs evidence for every scoped feature, so it is not met.

## 7. Files written by B this round

- `tmp/studio-real-loop/tasks/round-1.md` (copy)
- `tmp/studio-real-loop/current-task.md` (round 2)
- `tmp/studio-real-loop/backlog.json` (v2)
- `tmp/studio-real-loop/b-round-1.md`, `tmp/studio-real-loop/b-next.json`
- `tmp/studio-real-loop/media/*` (fixtures + SHA256SUMS.txt)
- `tmp/studio-real-loop/b-scripts/plan-r1.js`, `plan-fb07.js`: helpers used to edit the plan. My first inline edit lost its backtick code spans to shell substitution; the scripts repaired and verified it.
- `docs/technical/studio-real-workspace/plan.md`: D-12..D-15, video import rules, FB-07 row, status.

No app source, protected file or other agent's file was touched.
