# A — Round 109: SSR HTML carries no NUL bytes (C-R23-01 + C-R38-01, Medium)
STATUS: IMPLEMENTED — code-reviewer done, findings addressed; awaiting C
Date: 2026-10-23. Base HEAD `32a6b08` (start status empty, frozen list 542 OK, entry.server.tsx = snapshot `24623172`).

## Changed files (end state: 2 M + 3 ??) — sha256 in `a-round-109/end-hashes.txt`
- M `app/entry.server.tsx`: diff vs snapshot = removed `import { PassThrough } from 'node:stream';`, added `import { createNulByteStripStream } from '~/lib/ssr/strip-nul-bytes.server';` (end of import block), `const body = new PassThrough();` → `const body = createNulByteStripStream();`. Nothing else.
- ?? `app/lib/ssr/strip-nul-bytes.server.ts`: `stripNulBytes(chunk: Buffer): Buffer` (fast path `indexOf(0) === -1` returns the same object; otherwise count → `Buffer.allocUnsafe(exact)` → span `copy`); `createNulByteStripStream(): Transform` (non-Buffer chunk → `TypeError` via callback; strings are already Buffers through Writable `decodeStrings`; all-NUL chunk → `callback()` with nothing pushed; output allocated with `Buffer.alloc`; no cross-chunk buffering, no logging).
- ?? `app/lib/ssr/__tests__/strip-nul-bytes.server.test.ts`: SN1, SN2a (pure fn), SN2b (stream), SN3–SN7 (8 tests). SN7 is written (fully typed `EntryContext` literal, no `as`/`any`/`@ts-`).
- ?? `docs/implementation/2026/quarter-IV/094-studio-ssr-nul-bytes.md` (new, TEMPLATE sections, Georgian).
- M `docs/implementation/2026/quarter-IV/093-studio-self-disabling-button-focus.md`: l.4 only → `**სტატუსი:** Round 108 — C PASS, გამოქვეყნებულია `32a6b08`-ში (gate 108; D-29z73; C-R107-01, FL-HISTORY, FL-ZOOM).` (`git diff --stat` 1+/1−).

Deviation to note: one `// biome-ignore lint/a11y/useButtonType` on the fixture's `createElement('button', …)` line. Its reason reads: adding attributes shifts react-dom's 2048-byte view boundaries and can hide the NUL repro. It keeps B's fixture shape byte-identical.
Second deviation from §1: I removed the string-conversion branch (`Buffer.from(chunk, encoding)`) per reviewer M1. It was unreachable under Writable `decodeStrings: true`, and SN4 was renamed to match. See the code-reviewer section. The repo already has precedent for justified `biome-ignore` comments, e.g. ArrangementLoopBrace.tsx.

## Commands and results (actually run)
- `npm run typecheck` → exit 0 (`a-round-109/typecheck.log`).
- `npm run lint -- --max-diagnostics=500` → exit 0, 218 warnings + 1 info repo-wide, **0** in the owned files (grep `entry\.server|lib/ssr` = 0) (`lint.log`). Before the biome-ignore there was 1 useButtonType warning in the test, now 0.
- `npx biome check <3 owned code/test files>` (no `--write`) → exit 0, "No fixes applied", 0 diagnostics (`biome-owned.log`).
- All checks below were re-run after the review fixes (12:44–12:45 UTC); the results are as listed.
- Targeted list (`targeted-list.txt`, 3 files): `app/lib/__tests__/product-presentation.test.tsx`, `app/lib/arrangement/__tests__/ssr-layout-effect.test.tsx`, `app/lib/ssr/__tests__/strip-nul-bytes.server.test.ts` → `npx vitest run $(cat …)`: **3 files / 20 tests passed** (`targeted.log`).
- Full suite / `npm run verify` / build: NOT run (gate rows by speed rules).

## Fail-before (scratch `a-round-109/mut/store`, node_modules symlink, Vitest `cacheDir` = `a-round-109/mut/.vite-cache`; entry = B snapshot; module = identity Transform, same exports)
- Red: SN2a, SN2b, SN3, SN4, SN6, SN7. Green: SN1, SN5. This matches B's expectation (SN2, SN3, SN4, SN6 and SN7 red; SN1 and SN5 green).
- Raw: `mut/results/fail-before.json`; summary `mut/results/summary.json`; driver `mut/mutate.py`.

## Mutations (scratch; control 8/8 green before AND after)
| Mutation | Red tests |
|---|---|
| m1 identity transform (entry final) | SN2a, SN2b, SN3, SN4, SN6, SN7 (B expected SN2, SN3, SN6; SN4 and SN7 are red as well) |
| m2 decode → `replace(/\0/g,'')` → re-encode | SN3 |
| m3 remove only the first NUL per chunk | SN2a, SN2b, SN3, SN6, SN7 |
| m4 entry back to `new PassThrough()` (module final) | SN7 (killed in unit tests) |

## Self-check against dev server :5173 (A evidence, not C acceptance)
`a-round-109/ssr/` ran `node ../../b-round-108/probe/ssr-baseline.cjs` at 12:39 UTC and again at 12:45 UTC, after the review fixes (both identical). Table: `ssr/self-check-table.json`.
| Path | UA | runs | bytes (B) | NUL (B) | te / events | sha256 == B sha256Stripped |
|---|---|---|---|---|---|---|
| /studio-lab | chrome, bot | 2+2 | 69303 (69307) | 0 (4) | chunked / 36 | true ×4 |
| / | chrome, bot | 2+2 | 39970 (39970) | 0 (0) | chunked / 20 | true ×4 |
| /products | chrome, bot | 2+2 | 10002 | 0 (0) | chunked / 5 | true ×4 |
| /about | chrome, bot | 2+2 | 18492 | 0 (0) | chunked / 10 | true ×4 |
| /studio/middle-east | chrome, bot | 2+2 | 4315 | 0 (0) | chunked / 3 | true ×4 |
No browser (Playwright) run by A; AX-NOJS/AX-HYDRATED/REG-* are C's.

## Scope / protected checks (end)
- `git status --short --untracked-files=all` = exactly the 5 paths (2 M + 3 ??).
- The frozen list checks 542/542 OK.
- The protected hashes are unchanged: fa2cf0bc 13914809 caa388e7 0995ae78 741c2341 ddb70919 c4793004 b804dc00 56f5b76f bf9ee257 23468664 280fe7f2.
- package.json and the lockfile are unchanged. No commit, push, stash or `--write`. No server was started or stopped.

## Acceptance criteria A truly passed
- §1 module and entry wiring as specified; SN1–SN7 written; fail-before list; m1–m4 red, killing their target tests as specified (m1 also turns SN4 and SN7 red, and m3 turns SN7 red; reported in the table); targeted vitest green; typecheck and lint clean, and Biome is clean on the owned files; scope is 2M+3??; frozen 542/542; doc 093 l.4 only; doc 094 written.
- None of C's browser rows are claimed.

## Known gaps
- PROD-SSR-NUL (production build) was not run; it is a gate row.
- The ownership of `app/entry.server.tsx` and `app/lib/ssr/` rests on B's reading of the user's decision. Root may refuse it at the gate (doc 094 states this).

## Exact next C checks
NUL-HTTP (5 paths × Chrome/Googlebot × 2, expect 0 NUL, /studio-lab 69 303 bytes), NUL-EQUIV (sha256 vs B `sha256Stripped`), STREAM-KEPT (chunked, events >1; A saw 36), AX-NOJS 1280/1440, AX-HYDRATED 1280/1440, REG-FLOW, REG-PAGES, PX-NET, REG-HYD, G109-3, AN-REVIEW (re-run m1–m3 with own strings), T109-TARGETED, DOC-094 / DOC-093-L4, SOURCE-UNCHANGED.

## Code-reviewer (real `code-reviewer` subagent; score 8.5/10; no Critical or High)
The reviewer had no shell, so it reviewed by reading only. A ran all the tests and checks above. Dispositions:
- **M1 (`toChunkBuffer` dead code):** FIXED.
  - With `decodeStrings: true` and a non-object stream, Writable already converts strings and Uint8Arrays to Buffer before `_transform`. The string, Uint8Array and fallback branches therefore never ran, and `Buffer.from(str, 'buffer')` would have thrown.
  - The helper is removed; a `Buffer.isBuffer` guard with `TypeError` remains.
  - SN4 is renamed to "…after Writable string decoding". This deviates from the task's literal "string converted with `Buffer.from(chunk, encoding)`" wording, because that branch was unreachable. SN4 is still red in fail-before and m1.
- **L1 (duplicate SN2 IDs):** FIXED; now SN2a (pure) and SN2b (stream).
- **L2:** SN5 now uses `toBeGreaterThan(0)`. The `typeof renderToPipeableStream` guard is KEPT: the advisor recommended it to catch a browser-build resolution.
- **L3:** FIXED; the SN5 title now says "remove createNulByteStripStream when this fails".
- **L4:** FIXED; the biome-ignore reason no longer cites an external file.
- **L5 (SN7 in a test file named after the module):** KEPT, because the B task fixes the single test path. SN7 is the entry-wiring integration test; B may later move it to `app/__tests__/entry.server.test.tsx`.
- **L6 (`new Promise<Response>` in entry.server.tsx:18):** DECLINED, because it is outside the owned lines (import block and l.27 only). It is proposed to B.
- **L7:** FIXED; `Buffer.allocUnsafe` → `Buffer.alloc`.
- **Alternative (`node:string_decoder`):** the reviewer says to keep the byte Transform. Doc 094's rejection text is corrected: only per-chunk `toString` decoding breaks split characters; StringDecoder works but adds state and decode/encode cost.
- **Pre-existing, outside this diff, for B:** `setTimeout(abort, ABORT_DELAY)` is never cleared, and `responseStatusCode = 500` in `onError` after resolve has no effect.
- **Stream semantics (the reviewer's analysis plus A's check):**
  - PassThrough is a pass-through Transform: destroy, error and close are the same.
  - React `pipe()` drain/error/close and the Remix `StreamPump.cancel` → `destroy` path are unchanged.
  - A measured identical defaults: readable and writable HWM 65536, allowHalfOpen true.

Architecture note (verbatim):
> none — a stateless `.server.ts` helper in `app/lib/ssr/`, wired in by `entry.server.tsx` (which still owns the pipeline), shows none of the four risk signals. Keep it where it is.
