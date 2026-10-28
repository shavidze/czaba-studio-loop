# Architecture checkpoint request: the export-pipeline boundary after PERF-16 (B, round 221 → 222 planning, D-29z240)

**Status:** requested from root. **Non-blocking.** Round 222 (B-R220-LEGACY-EXPORT-NO-STEMS, selection state in `ExportDialog.tsx` only) does not wait for it, and touches none of the files below. This is the request promised at `b-round-220.md` §6.

**Reviewer:** the read-only `frontend-architect`, following `store/.claude/references/architecture-checkpoint.md`. Root invokes it and records the result. B schedules any approved change as its own bounded task, with one owner and behaviour-preserving tests.

**Boundary:** PERF-16 is complete:
- 16a: round 218, `da5ad69`;
- OSS-LIC: round 219, `c54a534`;
- 16b-i: round 220, `c4e6c9d`;
- 16b-ii: round 221, `6dd45a1`.

Both Studios now encode MP3 through one module. Scope = the tree at `6dd45a1`. Line counts are context only, not a reason to split:
- `app/lib/arrangement/mp3-encoder.client.ts` (141 lines; mediabunny + `@mediabunny/mp3-encoder`; module-wide generation and run counters);
- the WAV path: `export-wav.ts` (73), `export-wav.client.ts` (103) and `export-wav.worker.ts` (33), plus `export-cancel.ts` (46) and `export-progress.ts` (86);
- the legacy facade `app/utils/ffmpeg.ts` (16, legacy name; the rename waits for Saba, SABA-Q-FFMPEG-FILENAME) and `app/utils/audio-encoder.ts` (67);
- the legacy `StudioContext.exportAudio` (l.1105–1200: `OfflineAudioContext` mixdown → `encodeAudioBufferToWav` → `convertWavToMp3`). It is frozen and in `global_forbidden_files`.

## Signals folded in (backlog ids)
- **ARCH-R218-ENCODER-CANCEL-SCOPE** (A round 218, gate 218; ruled D-29z230).
  - Today: `resetArrangementMp3Encoder` cancels every in-flight encode, whichever caller started it. ME12 pins this, and the race is documented in doc 172. The single consumer per page makes it safe today.
  - Gate-220 S2: a per-call `AbortSignal`.
- **ARCH-R220-ENCODER-NEUTRAL-MODULE** (gate 220, A round 220).
  - The legacy context imports from `lib/arrangement/`.
  - Proposal: a neutral `app/lib/audio/mp3-encoder.client.ts` with a per-call signal.
  - The bitrates are listed twice (facade strings vs `ARRANGEMENT_MP3_BITRATES`); the reviewer said to keep that.
- **LEGACY-MP3-PROGRESS / GATE220-S4** (deferred Low). The legacy MP3 progress jumps from 85 to 100.
- **B-R220-LEGACY-EXPORT-NO-STEMS** (round 222). Context only: the legacy dialog's selection state. It is fixed inside the dialog, so it is not a question here.

## Questions
Answer each with keep or extract, its value, its risk, and at most 3 sentences.
1. **Neutral encoder module + per-call cancel.**
   - Should the encoder move to a Studio-neutral module with a per-call `AbortSignal` now, or stay in `lib/arrangement/` until a second concurrent consumer is real?
   - If extract: which edit avoids touching the frozen `ArrangementContext.tsx` and `StudioContext.tsx`? For example, the old export stays as a re-export.
2. **One WAV path.** The lab encodes WAV in a worker (`export-wav.worker.ts`); the legacy Studio encodes on the main thread (`utils/audio-encoder.ts`). Is sharing the worker worth it for the legacy path, given that `StudioContext.tsx` is frozen and protected-adjacent? Or is this keep until SRW-21 mounts the new workspace on the purchased route?
3. **The legacy facade's lifetime.** Once SRW-21 (deferred_user) replaces the purchased Studio, does `app/utils/ffmpeg.ts` + `audio-encoder.ts` + `StudioContext.exportAudio` become dead code to retire in one task? Name the trigger, so the loop does not refactor code that is due to be removed.

## Acceptance for any approved extraction (B will copy it into the task)
- These run unedited and green: ME1–ME12, the export-wav, export-cancel and export-progress tests, TL1–TL9d (third-party licences), and `legacy-export-dialog-stems.test.tsx` (ES1–ES7, after round 222).
- The `useArrangement()` and `useStudio()` shapes are unchanged. No edit to a frozen or protected file without a separate grant.
- Browser:
  - the lab MP3 at 320 kbps: 4,224 frames + Xing, RMS −15.29 dBFS (round 221 LAB-MP3);
  - the legacy MP3 through HR-LEGACY-STUBBED at Low, Medium and High: 168 frames each at 128, 192 and 320 kbps;
  - the WAV frame count diff is 0;
  - PERF-RUN medians: the encoder chunk is not loaded at page load.
- A lab reset no longer cancels a legacy encode (only if Q1 = extract).

## Interaction with the queue
- Non-blocking: PERF-HARNESS-SHARED-LIB and the rest of STUDIO-PERFORMANCE continue.
- The earlier requests are still pending with root: D-29z195 (`b-round-211-checkpoint-request.md`) and `b-round-203/205-checkpoint-request.md`.
