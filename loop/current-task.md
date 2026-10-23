# CURRENT TASK — Round 109: the server-rendered HTML carries no NUL bytes (C-R23-01 + C-R38-01, Medium)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-23 (B planned at ~12:20 UTC, `date -u`)
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner, speed rules and the **2026-10-23 bug-gate decision** in your prompt. Those rules take precedence over older text.
- **Previous task:** `tasks/round-108.md` (exact copy). Rationale: `b-round-108.md`. Decision record: **D-29z74** in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one bug with one root cause, which shows up in two places: C-R23-01 (NUL bytes in the SSR stream) and C-R38-01 (the same bytes land inside `aria-label`s). One code path, one implementer (A).
- **Why now:**
  - The user decision of 2026-10-23 says: fix the open Medium findings first, then open T12.
  - C-R23-01 is the oldest open Medium. It is the only one that A can fix and C can verify on the cloud runner.
  - The other Mediums need a quiet machine, a touch device or WebKit (see `b-round-108.md`). They are planned as a C-only measurement round.

## The defect (B measured it at `32a6b08`, 2026-10-23 ~12:25 UTC)
- **Where it shows:** `GET /studio-lab` returns 69 307 bytes with **4 NUL bytes**, at offsets 6142/6143 and 26810/26811. Evidence: `b-round-108/probe/ssr-baseline-result.json`.
  - The first pair sits inside the ⌫ button's `aria-label` (`…კლიპის წა\0\0შლა…`).
  - The second pair sits in the heading text (`Arrangement · \0\0მთლიანი პროექტი`).
  - In attribute values the browser parser turns each NUL into U+FFFD (C rounds 23–38).
- **Other pages:** `/`, `/products`, `/about` and `/studio/middle-east` have 0 NUL today, with either user agent. Any Georgian SSR page is exposed as soon as its markup shifts a chunk boundary (offsets moved in rounds 24–26).
- **Cause (react-dom 18.3.1 server):** `writeStringChunk` encodes a short string chunk into a 2048-byte view. When the chunk does not fit, it flushes the **whole** view, including the bytes it never wrote (zeros), and not `subarray(0, writtenBytes)`.
  - The text itself is complete. The only damage is the extra 0x00 bytes.
  - B repro, in Node with no app code: `b-round-108/probe/nul-repro2.cjs` and `nul-repro3.cjs`.
    - 400 `<button aria-label="წაშლა {i}">ა</button>` → 5 NUL. The same with ASCII → 0.
    - With the NULs removed, the output is **byte-identical to `renderToString`** of the same element.
- **Why a byte filter is safe:** 0x00 is never a UTF-8 lead or continuation byte, so dropping it cannot split or change a character. Valid HTML never contains a raw NUL.

## Decision (D-29z74)
- **The smallest honest fix:** a NUL-stripping `Transform` between React's `pipe()` and the response body in `app/entry.server.tsx`.
- **Rejected:**
  - **React 19.** It needs `package.json`/lockfile (globally forbidden) and puts the whole store under regression.
  - **`renderToString`.** It changes streaming and Suspense behaviour on every route.
  - **Decode, `replace(/\0/g, '')`, re-encode per chunk.** A 3-byte character can straddle chunks; mutation m2 must prove this.
- **Ownership note, stated honestly:**
  - `app/entry.server.tsx` is **not** in `global_forbidden_files` and is not one of the protected auth/purchase files. However, plan §6 does not list it among A's files.
  - Rounds 23–108 waited for a Tech Lead choice that never came.
  - The new directory `app/lib/ssr/` is also outside plan §6's A list and is granted on the same reading.
  - B grants it now **on B's reading of the user's 2026-10-23 instruction** ("fix the open Medium findings first, then open T12"). This is **not** an explicit user grant of this file. Root may refuse it at the gate. In that case the round stays unpublished and C-R23-01 goes back to the user as a question. It is not counted as fixed.

## Baseline (measured by B, 2026-10-23 ~12:25 UTC)
- **HEAD `32a6b0827bc061a4fc06e64ea6e0740b8a85f239`** (gate 108 published). `git status --short` is **empty**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-108-r109-tree-sha256.txt`, **542** entries.
  - It is the round-108 list (539), minus `app/entry.server.tsx`, plus the four round-108 paths that are not owned again (published; doc 093 is owned for l.4, so it is not in the list).
  - Check it with `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-108-r109-tree-sha256.txt`. B checked it: OK.
- **Snapshot:** `../tmp/studio-real-loop/b-round-108-r109-snapshots/entry.server.tsx` (sha256 `24623172…`, 54 lines, LF, CR=0). Fail-before runs against it.
- **Owned files:**

  | File | Permission |
  |---|---|
  | `app/entry.server.tsx` (`24623172`) | **owned, narrow:** the import block (l.1–6) and the single line `const body = new PassThrough();` (l.27). That line becomes the stripping stream. `import { PassThrough } from 'node:stream';` may go if it is no longer used. Byte-identical: `ABORT_DELAY`, the `isbot` choice of `onAllReady`/`onShellReady`, `createReadableStreamFromReadable`, the headers, `resolve`/`reject`, `onShellError`, `onError`, `pipe(body)` and `setTimeout(abort, …)`. |
  | `app/lib/ssr/strip-nul-bytes.server.ts` | **owned (new).** The `.server.ts` suffix keeps it out of the client bundle. |
  | `app/lib/ssr/__tests__/strip-nul-bytes.server.test.ts` | **owned (new).** |
  | `docs/implementation/2026/quarter-IV/094-studio-ssr-nul-bytes.md` | **owned (new doc, whole).** |
  | `docs/implementation/2026/quarter-IV/093-studio-self-disabling-button-focus.md` | **owned, one line:** l.4, the status line only. It must say that round 108 is C PASS and published in `32a6b08` (gate 108). Every other line stays byte-identical (GATE108-S4). |

- **Expected end state:** `git status --short --untracked-files=all` = **2 M + 3 ??** (exactly the five paths above).
- **Protected (frozen, never edited; B re-checked at `32a6b08`):**
  - `app/routes/studio.$productId.tsx` (`fa2cf0bc`), `app/routes/api.studio-token.ts` (`13914809`), `app/contexts/StudioContext.tsx` (`caa388e7`), `app/utils/ffmpeg.ts` (`0995ae78`), `app/components/ui/Modal.tsx` (`741c2341`), `app/lib/arrangement/mp3-encoder.client.ts` (`ddb70919`), `app/root.tsx` (`c4793004`), `app/entry.client.tsx` (`b804dc00`);
  - the auth files: `app/lib/auth.ts` (`56f5b76f`), `app/contexts/AuthContext.tsx` (`bf9ee257`), `app/lib/firebase.client.ts` (`23468664`), `app/types/auth.ts` (`280fe7f2`);
  - `package.json` and the lockfile (no new dependency).
- **Servers:** `:5173/studio-lab` returns 200 (B's probes at ~12:25 UTC). The backend `:5199` is unavailable, as expected. Never start or stop servers.
  - The dev server reloads `entry.server.tsx` on change; A and C read the result through it.
  - A production-server run is a gate/Tech Lead row (PROD-SSR-NUL).
- **Do not change the repository state:**
  - Never stash, reset, checkout, clean, commit or re-create anything.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format through stdin to stdout.
  - Run fail-before and mutations in a scratch copy (`a-round-109/mut/`, with a `node_modules` symlink and the Vitest `cacheDir` inside scratch), never in `store/`.
  - Stop and report if, at the start, HEAD differs, the status is not empty, or a frozen file changed.

## 1. What changes (A)
Read first:
- `AGENT_DISCOVERABLE_CODE.md`, `API_ERROR_HANDLING.md` (stream errors), `SECURITY_AUDIT.md` (this runs on every SSR response);
- `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
- `.claude/prompts/new-service.md` and `.claude/prompts/new-test.md`, and `docs/implementation/TEMPLATE.md`.

No UI or style change.

### The module (`app/lib/ssr/strip-nul-bytes.server.ts`)
- **Export:** a factory with a discoverable name, e.g. `createNulByteStripStream(): Transform` (A picks the final name per `AGENT_DISCOVERABLE_CODE.md`). Optionally also export a pure `stripNulBytes(chunk: Uint8Array): Uint8Array` that the stream uses.
- **Bytes only:**
  - Never `toString`, decode, or use `TextDecoder` on the stream.
  - A string chunk (if one ever arrives) is converted with `Buffer.from(chunk, encoding)` before filtering.
- **Fast path:** if `indexOf(0) === -1`, push the chunk unchanged.
- **Otherwise:** count the zeros, allocate the exact output length and copy the non-zero spans. Do **not** use `Buffer#filter`/`Array.from`: they are slow, and `filter` returns a plain `Uint8Array` via species.
  - A chunk that is all zeros pushes nothing (or an empty chunk). It never throws.
- **No buffering across chunks:** each chunk is pushed in its own `transform` call. Backpressure stays with Node's `Transform`, and React keeps streaming.
- **Nothing else changes:** no logging, no headers, no error swallowing. A stream error propagates the way it did through `PassThrough`.

### `entry.server.tsx`
- Replace `new PassThrough()` with the factory call. Nothing else in the function changes.

### Tests (`app/lib/ssr/__tests__/strip-nul-bytes.server.test.ts`)
- First line `// @vitest-environment node` (as `app/lib/arrangement/__tests__/ssr-layout-effect.test.tsx` does; the default environment is jsdom).
- Exact assertions only (`toBe`, `toEqual`, `Buffer.equals(...)` with `toBe(true)`). No `as` (including `as const`), no `@ts-` and no `any`.

Cases:
- **SN1:** a chunk without NUL comes out byte-identical.
- **SN2:** NUL at the start, in the middle, at the end, two consecutive, and a chunk that is only NULs. Each output is exact (`[0x61,0,0x62]` → `[0x61,0x62]`, and so on).
- **SN3:** chunk straddling (defensive: React's own chunks never split a character, because the zeros sit at the end of a view; SN3 exists to kill m2). Each piece is its own `write()` call; never `Buffer.concat` before writing. Write the UTF-8 bytes of `წაშლა` split into several chunks, with `0x00 0x00` written as its own chunk **between the bytes of one character**. The concatenated output decodes to exactly `წაშლა` with no U+FFFD.
- **SN4:** a string chunk `'a\u0000b'` gives `ab`.
- **SN5 (upstream control):**
  - Use the real `renderToPipeableStream` from `react-dom/server`, with B's fixture: `<div>` with 400 `<button aria-label={'წაშლა ' + i}>ა</button>`, rendered with `onAllReady`.
  - Piped into a plain `PassThrough`, it yields **NUL > 0**. Title it as the react-dom 18.3.1 defect control: if it ever goes green-without-NUL, the upstream bug is gone.
- **SN6 (the fix oracle):** the test file is `.ts`, so the fixture is built with `createElement`, byte-for-byte B's shape (`div` → 400 `button`, props `{ key: i, 'aria-label': 'წაშლა ' + i }`, child `'ა'`). The equality oracle was verified only for that shape.
  - The same fixture piped through the stripper yields **0 NUL**.
  - The output string is **exactly equal** to `renderToString(fixture)`. B checked that this equality holds for the stripped bytes; `nul-repro3.cjs` prints `strippedEqualsRenderToString: true`.
- **SN7 (entry wiring; optional only if it cannot be typed honestly):**
  - Call the default export of `~/entry.server` with `vi.mock('@remix-run/react', …)`. Mock `RemixServer` so it renders the SN5 fixture, then read the `Response` body.
  - Assert NUL 0 and the exact `renderToString` text.
  - If `EntryContext` cannot be built without `as`/`any`, skip SN7 and say so. C's NUL-HTTP rows are then the wiring oracle.

**Fail-before** (scratch; `entry.server.tsx` = snapshot; the module is an identity `Transform` with the same export):
- B expects SN2, SN3, SN4 and SN6 red (and SN7 if written), and SN1 and SN5 green.
- Report the exact list.

**Mutations** (scratch only; one unmutated control before and after; record the red tests):
- **m1:** an identity transform → SN2, SN3, SN6 red.
- **m2:** decode each chunk to a string, `replace(/\0/g, '')`, re-encode → SN3 red (U+FFFD at the split).
- **m3:** remove only the first NUL of each chunk → SN2 (two consecutive) red.
- **m4:** `entry.server.tsx` back to `new PassThrough()` → SN7 red. If SN7 was skipped, write "survives in unit tests; killed by C's NUL-HTTP".

### Docs
- **Doc 094 (new):** follow `docs/implementation/TEMPLATE.md`, in Georgian with English technical terms.
  - **Status:** round 109 waits for C (D-29z74).
  - **Context:** C-R23-01 and C-R38-01, B's measurement at `32a6b08` and the repro.
  - **Approach:** the byte filter, why it is lossless, and the rejected alternatives (React 19, `renderToString`, string replace).
  - **Ownership note:** B's reading of the 2026-10-23 decision; root may refuse.
  - **Problems and solutions, Testing:** fail-before, m1–m4 and the targeted count.
  - **TODO:** remove the filter once react-dom is upgraded (SN5 shows it); PROD-SSR-NUL gate row.
- **Doc 093:** l.4 only (see Baseline).

### Checks A runs (speed rules)
- `npm run typecheck`.
- `npm run lint` with 0 diagnostics in the owned files (`--max-diagnostics` and grep, as in round 108).
- `npx biome check` on the 3 owned code/test files, without `--write`.
- **Targeted vitest:**
  - Build the list: `grep -rlE "entry\.server|react-dom/server|strip-nul-bytes" app --include=*.test.ts --include=*.test.tsx | sort > ../tmp/studio-real-loop/a-round-109/targeted-list.txt`.
  - Run it: `npx vitest run $(cat ../tmp/studio-real-loop/a-round-109/targeted-list.txt)`.
  - Report the files and the counts.
- Do **not** run the full suite or `npm run verify` (gate).
- **Code-reviewer:** run it (4+ files change). Ask it to check stream error/abort propagation and backpressure. Pass its Architecture note through verbatim.
- **Self-check (A evidence, not C acceptance):** `mkdir -p ../tmp/studio-real-loop/a-round-109/ssr && cd ../tmp/studio-real-loop/a-round-109/ssr && node ../../b-round-108/probe/ssr-baseline.cjs` (the script writes into its working directory). Report NUL per page and whether each `sha256Stripped` equals B's.

## 2. Acceptance — what C checks
**Environment:** the dev server at `:5173`, real Chromium (Playwright), and Node `http` for raw bytes. Every browser session is a fresh incognito context with no credentials.

| ID | Steps | PASS when |
|---|---|---|
| **NUL-HTTP** (primary) | <ul><li>Node `http.get` (raw bytes, no decoding), two runs each.</li><li>User agents: Chrome (`onShellReady` path) and Googlebot (`onAllReady` path); use B's strings in `b-round-108/probe/ssr-baseline.cjs`.</li><li>Paths: `/studio-lab`, `/`, `/products`, `/about`, `/studio/middle-east`.</li></ul> | <ul><li>Status 200, `content-type` `text/html`, **0 NUL bytes** in every response.</li><li>`/studio-lab` is expected to be 69 303 bytes (B's 69 307 minus 4). A different size with NUL 0 is judged under NUL-EQUIV's diff rule, not here.</li></ul> |
| **NUL-EQUIV** (primary) | Same responses. Compare each body's sha256 with B's `sha256Stripped` per path in `b-round-108/probe/ssr-baseline-result.json`. | <ul><li>Equal for all 5 paths × 2 UAs: the fix removed exactly the NULs and nothing else.</li><li>If a hash differs, diff the bodies. Only dev-server asset URL/version strings (`?v=…`, `/node_modules/.vite/deps/…`) may differ, because Vite re-optimizes deps (C round 108 infra note). Any other difference is a FAIL. Report the diff.</li></ul> |
| **STREAM-KEPT** | `/studio-lab`, Chrome UA. | `transfer-encoding: chunked` and more than one data event; B saw 36. Record the count. |
| **AX-NOJS** (1280 and 1440) | A browser context with `javaScriptEnabled: false` on `/studio-lab`. | <ul><li>`document.documentElement.outerHTML` contains no U+FFFD and no U+0000.</li><li>The ⌫ button's `aria-label` is exactly `⌫ წაშლა — კლიპის წაშლა — სიცარიელე დარჩება`.</li><li>The heading contains `Arrangement · მთლიანი პროექტი`.</li><li>Screenshot.</li></ul> |
| **AX-HYDRATED** (1280 and 1440) | Normal session on `/studio-lab`, Decline, wait for the library. | <ul><li>No `[aria-label]`, `[title]` or text node contains U+FFFD.</li><li>The ⌫ `aria-label` is as above. This was C-R38-01's 2× U+FFFD.</li></ul> |
| **REG-FLOW** (1280) | Focus the Middle East row, press Enter, Fit, Play for 2 s, Pause, then a real WAV export. | <ul><li>One clip is added.</li><li>The playhead advances.</li><li>The WAV is RIFF/WAVE, 24-bit, 48 kHz, stereo, with a duration matching the project, and no NaN.</li><li>Delete the file after measuring.</li></ul> |
| **REG-PAGES** (1280) | Open `/`, `/products` and `/about` in the browser. | They render with no pageerror and no hydration warning. Expected backend-down console noise is not a finding. |
| **PX-NET** | all sessions | 0 page-originated requests to `/api/studio-token`, R2, `/api/recording-*` or `/api/download`; 0 `Authorization` headers. |
| **REG-HYD** | all sessions | <ul><li>No hydration warning, no pageerror, no non-noise console error.</li><li>A first-load failure after a dep re-optimization (C round 108 infra note): retry once and record both.</li></ul> |
| **G109-3** | anonymous, run alone, after all rows | <ul><li>The header link opens `/studio-lab` with the workspace and the demo badge.</li><li>`/studio/middle-east` shows sign-in, no workspace and 0 `audio[src]`.</li><li>`/api/studio-token` returns 401.</li><li>The fake-Bearer sub-check is BLOCKED (backend unavailable in cloud) and goes under `blocked`.</li></ul> |
| **AN-REVIEW** (offline) | Review A's tests. | <ul><li>The fail-before list matches §1, or A explains the difference.</li><li>C re-runs m1, m2 and m3 with its own mutation strings and gets the same red tests.</li><li>SN3 writes separate chunks (no concat before `write()`).</li><li>SN6 compares against `renderToString`, not just "no NUL".</li><li>Exact assertions only; no `as`, `@ts-` or `any`.</li></ul> |
| **T109-TARGETED** | `npx vitest run $(cat a-round-109/targeted-list.txt)`, in scratch with its own `cacheDir`. | All pass. C re-runs the grep and reports any missing file. |
| **DOC-094 / DOC-093-L4** (offline) | Read doc 094; diff doc 093 against `32a6b08`. | <ul><li>Doc 094 has the TEMPLATE sections, the "lossless byte filter" reasoning, the rejected alternatives and the ownership note.</li><li>In doc 093 only l.4 changed, and it names round 108 as C PASS and published in `32a6b08`.</li></ul> |
| **SOURCE-UNCHANGED** | start and end | <ul><li>HEAD `32a6b08`; the start status is empty and the end status is **2 M + 3 ??** (`--untracked-files=all`).</li><li>The frozen list checks 542/542.</li><li>The `entry.server.tsx` diff against the snapshot touches only the import block and the `body` line.</li><li>The protected hashes are unchanged.</li></ul> |

- **Gate rows** (C does not claim them; list them under `gate`): full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, **PROD-SSR-NUL** (production build served: NUL 0 on `/studio-lab`).
- **Neighbouring behaviour that could break:**
  - **Streaming / Suspense deferral:** STREAM-KEPT and the bot vs browser UA in NUL-HTTP.
  - **Hydration:** REG-HYD and AX-HYDRATED.
  - **Every SSR page:** NUL-EQUIV covers 5 pages byte-exact.
  - **Purchase protection:** G109-3.
  - **Studio audio:** REG-FLOW.

## 3. Ableton correspondence
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Server HTML byte integrity | None (web delivery, not a DAW behaviour) | — | CZABA requirement: Georgian SSR text and labels arrive intact | არ ეხება |

## 4. Report (A)
Write `a-round-109.md` and `a-round-109/a-round-109-summary.json` as you go (the harness writes `a-round-109-result.json`). Include:
- the changed files with end sha256 (`a-round-109/end-hashes.txt`);
- the exact commands and their results;
- the fail-before list;
- the m1–m4 table;
- the code-reviewer findings with your disposition, and its Architecture note verbatim;
- the self-check NUL table;
- the exact next C checks.

If you stop early, write a checkpoint with the next step.
