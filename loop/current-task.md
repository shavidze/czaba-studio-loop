# CURRENT TASK — Round 95: Lows batch part 3a — demo loader error text in Georgian (C-R92-N1) + workspace doc status lines (D-29z60)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-23
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules win over older text.
- **Previous task:** `tasks/round-94.md` (exact copy, sha256 `3db1dd65…`). Rationale: `b-round-94.md`. Decision record: D-29z60 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one Low with a real browser symptom, plus doc status lines. One owner (A).
  1. **C-R92-N1-DEMO-FAILED-TO-FETCH:** when a demo audio file fails on the network, the `/studio-lab` library row shows the raw English browser text `შეცდომა: Failed to fetch`. A decode failure also shows raw browser text (for example `Unable to decode audio data`). The purchased adapter already maps these cases to Georgian (`collection.ts` l.86–111); the demo loader does not.
  2. **GATE94-S4-STALE-DOC-LINES** (+ C round 94 note): doc 082 l.4 still says "awaiting C"; `arrangement-workspace.md` l.44 says "closes after C"; l.45 links only doc 080.

## Why this round
- **C round 94: PASS**, `browserVerified=true`, `realVerified=true`, 0 bugs. **Gate 94: published**, commit `051343983bedf6ff7ec21625a35e94710a895732` on both remotes (reviewer 8.5/10, no Critical or High).
- **C has no open bug.** `regression-last.json` is 2026-10-21. Today is 2026-10-23, which is 2 days, so the regression round is not due yet. **The next round planned on or after 2026-10-24 is the regression round.**
- Rounds 92–94 all changed the `ArrangementContext` load effect, and round 94's main fix could only be proven by unit tests. This round is chosen because C can see it in the browser, and it keeps `ArrangementContext.tsx` frozen. The swap cleanup that the gate-94 reviewer proposed stays in the pre-mount bundle (SRW-21-PREMOUNT). It is still browser-unreachable, so it is not scheduled here.

## Baseline (measured by B, 2026-10-23)
- **HEAD `051343983bedf6ff7ec21625a35e94710a895732`** (gate 94 published). `git status --short` is **empty**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-94-r95-tree-sha256.txt`, **522** entries, **522/522 OK**.
  - It covers every tracked `app/**` and `docs/implementation/**` file plus `vite.config.ts`, **except** the two owned existing files in that tree (`app/data/studio-lab-demo.ts`, doc 082).
  - It includes `ArrangementContext.tsx` (`c98fc743`), `collection.ts` (`e37aed51`), `ArrangementLibrary.tsx` (`a2b6f78d`), `StudioWorkspace.tsx` (`1270f6c5`), `app/routes/studio-lab.tsx` (`2ee0d5f5`), `collection.test.ts`, `collection-load-status.test.tsx` (`215e6113`) and every other `__tests__` file. **No existing test file is granted.**
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-94-r95-tree-sha256.txt`.
- **Snapshots:** `../tmp/studio-real-loop/b-round-94-r95-snapshots/` (`SHA256SUMS.txt`). All are LF with CR=0.

  | File | sha256 prefix | lines | role |
  |---|---|---|---|
  | `app/data/studio-lab-demo.ts` | `69ac90f7` | 136 | owned (E1 only: `loadDemoSource` l.99–126) |
  | `docs/implementation/2026/quarter-IV/082-studio-workspace-collection-load-status.md` | `c44c0b2b` | 76 | owned (l.4 only) |
  | `docs/technical/arrangement-workspace.md` | `a9811b63` | 45 | owned (l.44–45, plus at most one appended bullet) |

- **Protected (frozen, never edited):**
  - `app/routes/studio.$productId.tsx` (`fa2cf0bc`)
  - `app/routes/api.studio-token.ts` (`13914809`)
  - `app/contexts/StudioContext.tsx` (`caa388e7`)
  - `app/utils/ffmpeg.ts` (`0995ae78`)
  - `app/components/ui/Modal.tsx` (`741c2341`)
  - `app/lib/arrangement/mp3-encoder.client.ts` (`ddb70919`)
  - the auth files `app/lib/auth.ts` (`56f5b76f`), `app/contexts/AuthContext.tsx` (`bf9ee257`), `app/lib/firebase.client.ts` (`23468664`), `app/types/auth.ts` (`280fe7f2`).
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`). Backend `:5199` is unavailable, as expected. Never start or stop servers.
- **Do not change the repository state.**
  - Never stash, reset, checkout, clean or re-create anything.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format through stdin to stdout.
  - Run mutation proofs and fail-before in a scratch copy (`a-round-95/mut/`), never in `store/`. Set the Vitest `cacheDir` to the scratch folder. You may reuse `a-round-94/setup-scratch.sh` as a model; do not edit A round 94 files.
  - A mismatch (another HEAD, a dirty tree at start, a changed frozen file) means stop and report.

## 1. What changes (A)

### E1 — `loadDemoSource` error mapping (`app/data/studio-lab-demo.ts` l.99–126 only)
Mirror the purchased adapter (`collection.ts` l.86–111) inside the `if (url)` branch:
1. Wrap `fetch(url, { credentials: 'omit', signal })` in `try/catch`. On catch: if `signal.aborted`, rethrow **the same error object**; otherwise throw `new Error('ფაილი ვერ ჩაიტვირთა (ქსელი)')`.
2. `!response.ok` → `ფაილი ვერ ჩაიტვირთა (${response.status})` (unchanged text).
3. Wrap `await response.arrayBuffer()` in `try/catch` with the same rule as step 1.
4. Wrap `return await ctx.decodeAudioData(data)` in `try/catch`; on catch throw `new Error('ფაილი ვერ გაიშიფრა')`. The `await` must be inside the `try`.

The exact texts must be byte-identical to `collection.ts`. Do not import from `collection.ts` and do not edit it (it is frozen). The duplication is recorded as a nit (GATE95-DUP-ERROR-MAP, not scheduled).

**What must not change:**
- the URL table, `credentials: 'omit'`, passing `signal`, the synthetic path (`synthesizeDemoSamples`, `generateDemoStereoChannels`, `new AudioBuffer`), the text `'უცნობი დემო წყარო'`;
- `studioLabDemoCollection` (id, label, notice, sources, order);
- no new export and no change to the `WorkspaceCollection` type;
- no raw browser text, URL or stack in any thrown message.

**Why this is the smallest honest choice (B decision):** the user sees one Georgian Studio, and the purchased path already uses these exact texts. One wording for both origins avoids two sets of words for the same failure. The status line `failed(n)` and the row prefix `შეცდომა: ` (`ArrangementLibrary.tsx` l.120, frozen) stay as they are.

### New test — `app/data/__tests__/studio-lab-demo.test.ts`
Use the jsdom environment. Stub `fetch` with `vi.stubGlobal` and restore it in `afterEach`. Use a fake context object with a `decodeAudioData` spy. Never import from a test file. Assert exact strings with `toBe`. Do not use type assertions, including `as const`; annotate the type instead.

- **DL1 network:** `fetch` rejects with `new TypeError('Failed to fetch')` and the signal is not aborted. The loader for `demo-middle-east` rejects with an `Error` whose message is exactly `ფაილი ვერ ჩაიტვირთა (ქსელი)`. The message does not contain `Failed to fetch` or `/middle-east.mp3`.
- **DL2 body read:** `response.arrayBuffer()` rejects (not aborted) → exactly the network text.
- **DL3 decode:** `decodeAudioData` rejects with `new DOMException('Unable to decode audio data', 'EncodingError')` → exactly `ფაილი ვერ გაიშიფრა`.
- **DL4 HTTP:** a 404 response → exactly `ფაილი ვერ ჩაიტვირთა (404)`, and `decodeAudioData` is not called.
- **DL5 abort:** abort the controller, then `fetch` rejects with `new DOMException('aborted', 'AbortError')` → the rejection is `toBe` that same error object. Add a second case for an aborted body read.
- **DL6 success:** `fetch` is called exactly once with `('/middle-east.mp3', { credentials: 'omit', signal })` (`toStrictEqual` on the init). `decodeAudioData` receives the same `ArrayBuffer`. The loader returns the decoded buffer (`toBe`). Repeat for `demo-hero-music` → `/videos/hero/hero-music.mp3`.
- **DL7 unknown source:** a source id that is in neither table rejects with exactly `უცნობი დემო წყარო`, and `fetch` is not called.
- **DL8 parity with purchased:** for the network and decode failures, the demo message equals the message from `createPurchasedWorkspaceCollection` (public API, with a `fetchAudio` stub) for the same failure.

**Fail-before:** run the new file in scratch against the baseline snapshot of `studio-lab-demo.ts`. B expects **DL1, DL2, DL3 and DL8 red**. DL4, DL5, DL6 and DL7 lock existing behaviour and pass on both. Report the exact list.

**Mutations (scratch only; each must turn at least one named test red):**
- a: remove the `fetch` try/catch → DL1
- b: drop the `signal.aborted` rethrow in the fetch catch → DL5
- c: remove the decode try/catch → DL3
- d: remove the `arrayBuffer` try/catch → DL2
- e: remove `credentials: 'omit'` → DL6
- f: change one character of the network text → DL1/DL8

Record the red tests per mutation and an unmutated control run.

### Docs
- **Doc 082 l.4:** `**სტატუსი:** C PASS (Round 94), გამოქვეყნდა 0513439 (D-29z59)`, or the same meaning in the doc's style.
- **`docs/technical/arrangement-workspace.md` l.44:** COLLECTION-EMPTY-STATUS and GATE92-S1 were fixed in round 94 and are proven by unit tests; their browser check happens when SRW-21 mounts the purchased route. **l.45:** link both 080 and 082. Optional: one appended bullet saying that the demo and purchased loaders now use the same Georgian error texts (doc 083).
- **New doc** `docs/implementation/2026/quarter-IV/083-studio-lab-demo-loader-error-text.md`, following `docs/implementation/TEMPLATE.md`, in Georgian.

## 2. Checks A runs (speed rules)
- `npm run typecheck`, `npm run lint`
- `npx vitest run app/data/__tests__/studio-lab-demo.test.ts app/lib/arrangement/__tests__/collection.test.ts app/lib/arrangement/__tests__/collection-load-status.test.tsx app/lib/arrangement/__tests__/purchased-collection-ui.test.tsx`. Write that list to `a-round-95/targeted-list.txt`.
- Read-only Biome on the two code files (`npx biome check <files>`).
- **code-reviewer** is required (5 changed or new files). Hand its Architecture note to B verbatim.
- No full suite and no `npm run verify`: those belong to the gate.
- **Expected end state:** `git status --short` shows exactly **3 M** (`app/data/studio-lab-demo.ts`, doc 082, `docs/technical/arrangement-workspace.md`) and **2 ??** (`app/data/__tests__/` and doc 083). The frozen list stays 522/522. Write `a-round-95/end-hashes.txt` with the 5 files.

## 3. What C verifies (browser first, Playwright Chromium, fresh incognito context, no credentials)
Every row runs at **1280×720 and 1440×900** unless noted. Record the exact texts.

| ID | Action | PASS evidence |
|---|---|---|
| **ERR-NET** (primary) | `page.route('**/middle-east.mp3', r => r.abort())`, then load `/studio-lab` | The Middle East row contains exactly `შეცდომა: ფაილი ვერ ჩაიტვირთა (ქსელი)`. `Failed to fetch` appears nowhere in `document.body.innerText`. The status is exactly `დემო კოლექციიდან 1 წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`. All 8 other rows show a duration. Screenshot. |
| **ERR-DECODE** | `route.fulfill({ status: 200, contentType: 'audio/mpeg', body: 'not audio' })` for `/middle-east.mp3` | The row contains exactly `შეცდომა: ფაილი ვერ გაიშიფრა`. No English decoder text is on the page. The status is `failed(1)` as above. |
| **ERR-HTTP** (1280 only) | `route.fulfill({ status: 404 })` | The row contains exactly `შეცდომა: ფაილი ვერ ჩაიტვირთა (404)` (unchanged behaviour). |
| **ERR-BOTH** (1440 only) | abort both demo URLs | Both rows show the network text. The status is exactly `დემო კოლექციიდან 2 წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`. The 7 synthetic rows show durations. |
| **ERR-ADD-REFUSED** (1280 only) | after ERR-NET, select the Middle East row and press Enter, or drag it to a lane | No clip is added (count the clips before and after). Record the status text that appears; it is existing behaviour and does not change this round. |
| **DEMO-LOAD-REG** | normal load | The status reaches exactly the demo `ready` text. All 9 rows show durations. Each demo URL is requested exactly once. |
| **AUDIO-REG** (1440 only) | normal load, add Middle East to a lane, export a WAV of the project | The file parses as RIFF/WAVE at 48 kHz, 2 ch, with RMS > 0 and NaN 0. The clip's real decoded audio is present. |
| **PX-NET** | all sessions | 0 requests to `/api/studio-token`, R2, `/api/recording-*` or `/api/download`; 0 `Authorization` headers. |
| **REG-HYD** | all sessions | No hydration warning, no non-noise console error, no pageerror. |
| **G95-3** | anonymous | The header link opens `/studio-lab` with the workspace and the demo badge. `/studio/middle-east` shows sign-in and no workspace. `/api/studio-token` returns 401. The fake-Bearer sub-check is BLOCKED (backend unavailable in cloud); list it under `blocked`. |
| **AN-REVIEW** | review A's tests | The fail-before list matches §1, or the difference is explained. C re-runs mutations a, b and f in its own scratch and gets the same red tests. Assertions are exact `toBe`/`toStrictEqual`, and the new file has no `as`. |
| **T95-TARGETED** | `npx vitest run $(cat a-round-95/targeted-list.txt)` | All pass. Record the files and test counts. |
| **SOURCE-UNCHANGED** | start and end | HEAD `0513439`; 3 M + 2 ??; frozen 522/522; A's end hashes match; the `git diff -U0` hunks in `studio-lab-demo.ts` are only inside l.99–126; the doc hunks are only at 082 l.4 and workspace doc l.44 onward. |

Gate rows (C does not claim them; list them under `gate`): full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

**Neighbouring behaviour that could break:**
- the success path (no audio, or a doubled fetch);
- abort handling on unmount: an aborted load must not write an error row, and the provider ignores it;
- `credentials: 'omit'`;
- the synthetic sources.

## 4. Ableton correspondence
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Demo loader error text | none | — | CZABA's own web loader text. Ableton has no comparable loader. | არ ეხება |

No Ableton claim is made.

## 5. Report (A)
Write `a-round-95.md` and `a-round-95-result.json` as you go. Include:
- the changed files with their end sha256;
- the exact commands you ran and their results;
- the fail-before list and the mutation table;
- the code-reviewer findings with your disposition, and its Architecture note verbatim;
- the exact next C checks.

If you stop early, write a checkpoint with the next step.
