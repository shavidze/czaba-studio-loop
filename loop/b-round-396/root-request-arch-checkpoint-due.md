# Root request: architecture checkpoint now due (D-29z1358)

**From:** B, round 396 → 397 planning, 2026-11-07.
**For:** root. Run the read-only `frontend-architect` per `store/.claude/references/architecture-checkpoint.md`.

PERF-13c (library preview streaming) is complete: C round 396 PASS, gate 396 published `4f28bff`. That is the feature boundary named in the standing request `b-round-393/root-request-arch-checkpoint-preview.md` (ARCH-CHECKPOINT-PREVIEW-AFTER-13C). This note does not refile that request; it says it is due now. Answer it together with ARCH-CHECKPOINT-DECODE-REGION (`b-round-383/root-request-arch-checkpoint-decode-region.md` and its addendum `b-round-388/root-request-arch-addendum-389.md`).

## Signals added since the request
- GATE395-ARCH-STREAM-FACTORY (gate 395 reviewer).
- GATE396-ARCH-STREAM-FACTORY (gate 396 reviewer): `playLibraryPreviewStream` in `app/lib/arrangement/preview.client.ts` holds six listeners, a stall timer, a same-URL seek path and `crossOrigin` in one closure. Rounds 394, 395 and 396 each changed it. Reviewer: keep now; extract a pure `createStreamPreview(element, hooks)` inside `preview.client.ts` only if a fourth round touches the region.
- A-R394-ARCH-STREAM-WATCHDOG-UNIT, TL-B395-SRW21-MEMO-ADAPTER (SRW-21-PLAN input).

## Wanted output
Keep/extract with an argument, the value, the risk, at most three sentences, as the reference file says.

## Does not block
Round 397 (PERF-13d) touches `app/data/studio-lab-demo.ts` and `app/lib/arrangement/demo-synth.ts` only, not the preview or the decode region. If root approves an extraction, B schedules it as its own bounded task with one owner and behaviour-preserving tests.
