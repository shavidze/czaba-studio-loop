# CURRENT TASK — Round 92: SRW-21 stage 1 — purchased-collection adapter and origin-aware workspace copy (D-29z57)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-22
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules win over older text.
- **Previous task:** `tasks/round-91.md` (exact copy, sha256 `441f07fa…`). Rationale: `b-round-91.md`. Decision record: D-29z57 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one feature stage, one owner (A). This is SRW-21 stage 1, the part that does not need the protected purchased route:
  1. a purchased `WorkspaceCollection` adapter (`createPurchasedWorkspaceCollection`), with contract tests and no network or auth;
  2. origin-aware workspace copy: the header, the badge, the three load-status messages and the export file names come from `collection.origin`. `/studio-lab` (origin `demo`) stays **byte-identical**.
  Plus one doc status line (gate-91 S2).

## Why this round
- **C round 91: PASS**, `browserVerified=true`, `realVerified=true`, 0 bugs. **Gate 91: published**, commit `77cd5b668bb55a44afe358dac5b7a716db428260` on both remotes (verify 135/135 files, `tsc` clean, build OK, reviewer 9/10). **SRW-20 is complete.**
- **C has no open bug.** The remaining open items on SRW-03 / SRW-05 / SRW-10 / SRW-11B / SRW-13 / SRW-23 are Tech Lead real-Chrome checks, not A work.
- **Next scope in dependency order:** SRW-21 (it depends on SRW-20). Its route mount stays **blocked**: `app/routes/studio.$productId.tsx` and the studio-token flow belong to the auth owner. The independent half (adapter contract, honest copy, mount guide) can be built now. Under the loop policy, core scope goes before the low-priority Lows batch.
- **B read the source and found that the backlog's R21-I1 expectation "no workspace code change needed" is false.** The workspace hardcodes demo copy:
  - `StudioWorkspace.tsx` l.2136 `CZABA Studio Lab` and l.2141–2143 badge `დემო კოლექცია — ავტორიზაცია არ სჭირდება`;
  - `ArrangementContext.tsx` l.532 `დემო კოლექცია იტვირთება…` and l.3013–3014 (ready / failed);
  - the download names `czaba-studio-lab*.wav/.mp3` (l.2722, l.2910, l.2916).
  A purchased mount would print "demo — no sign-in needed" over purchased stems. Mount readiness that leaves this copy is not readiness, so this round makes the copy collection-driven (D-29z57 R2).
- **Regression round:** due on or after 2026-10-24 (`regression-last.json` = 2026-10-21). Today is 2026-10-22, so not yet.

## Baseline (measured by B, 2026-10-22)
- **HEAD `77cd5b668bb55a44afe358dac5b7a716db428260`** (gate 91 published). `git status --short` is **empty**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-91-r92-tree-sha256.txt`, **513** entries, **513/513 OK**.
  - It covers every tracked `app/**` and `docs/implementation/**` file plus `vite.config.ts`, **except** the three owned existing files below.
  - It includes `app/types/arrangement.ts` (`74b3f1c4`), `app/data/studio-lab-demo.ts` (`69ac90f7`), `app/routes/studio-lab.tsx` (`2ee0d5f5`), every export test (`export-dialog-footer.test.tsx` locks `czaba-studio-lab.wav`), and all protected files.
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-91-r92-tree-sha256.txt`.
- **Snapshots:** `../tmp/studio-real-loop/b-round-91-r92-snapshots/` (`SHA256SUMS.txt`). All are LF with CR=0.

  | File | sha256 prefix | lines | role |
  |---|---|---|---|
  | `app/components/arrangement/StudioWorkspace.tsx` | `d90699d8` | 2514 | owned (W1 only) |
  | `app/contexts/ArrangementContext.tsx` | `2b8b8639` | 3380 | owned (X1–X3 only) |
  | `docs/implementation/2026/quarter-IV/079-studio-lab-export-notes-and-memory.md` | `bd76912d` | 83 | owned (l.4 only) |

- **Protected (frozen, never edited):** `app/routes/studio.$productId.tsx` (`fa2cf0bc`), `app/routes/api.studio-token.ts` (`13914809`), `app/contexts/StudioContext.tsx` (`caa388e7`), `app/utils/ffmpeg.ts` (`0995ae78`), `app/components/ui/Modal.tsx` (`741c2341`), `app/lib/arrangement/mp3-encoder.client.ts` (`ddb70919`), and the auth files `app/lib/auth.ts` (`56f5b76f`), `app/contexts/AuthContext.tsx` (`bf9ee257`), `app/lib/firebase.client.ts` (`23468664`), `app/types/auth.ts` (`280fe7f2`).
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`). Backend `:5199` is unavailable, as expected. Never start or stop servers.
- **Do not change the repository state.**
  - Never stash, reset, checkout, clean or re-create anything.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format through stdin to stdout.
  - Run mutation proofs in a scratch copy (`a-round-92/mut/`), never in `store/`. Set the Vite/Vitest `cacheDir` to the scratch folder; never write into `store/node_modules/.vite`.
  - A mismatch (another HEAD, a dirty tree at start, a changed frozen file) means stop and report.

## 1. What changes (A)

### P1 — new `app/lib/arrangement/collection.ts`
Two exports, both pure. No import from `~/lib/r2.config`, auth, routes or contexts. Type-only imports from `~/types/arrangement` and `~/types/audio` are fine.

**(a) `workspaceCollectionCopy(origin: WorkspaceOrigin): WorkspaceCollectionCopy`**, where `WorkspaceCollectionCopy` is `{ heading: string; badge: string; loading: string; ready: string; failed: (count: number) => string; fileStem: string }`. Exact values:

| field | `demo` (must equal today's text byte for byte) | `purchased` (new) |
|---|---|---|
| heading | `CZABA Studio Lab` | `CZABA Studio` |
| badge | `დემო კოლექცია — ავტორიზაცია არ სჭირდება` | `შეძენილი კოლექცია` |
| loading | `დემო კოლექცია იტვირთება…` | `შეძენილი კოლექცია იტვირთება…` |
| ready | `დემო კოლექცია მზადაა. აირჩიე ხაზი და დაამატე ხმა (Enter ან ＋ დამატება).` | `შეძენილი კოლექცია მზადაა. აირჩიე ხაზი და დაამატე ხმა (Enter ან ＋ დამატება).` |
| failed(n) | `` `დემო კოლექციიდან ${n} წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.` `` | `` `შეძენილი კოლექციიდან ${n} წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.` `` |
| fileStem | `czaba-studio-lab` | `czaba-studio` |

Copy the demo strings from the current source; do not retype them (`…` is U+2026, `＋` is U+FF0B).

**(b) `createPurchasedWorkspaceCollection(input: PurchasedWorkspaceCollectionInput): WorkspaceCollection`**
- Input: `{ productId: string; productTitle: string; stems: readonly AudioStem[]; fetchAudio?: (url: string, init: RequestInit) => Promise<Response> }`. `AudioStem` is the existing type from `~/types/audio` (`id`, `name`, `audioUrl`, `order`). The route already gives each `audioUrl` its `?token=` query, so the adapter adds nothing.
- **Validation (throws an `Error` when the factory is called):** an empty `productId`, an empty `stems` array, or a duplicate stem `id`. An empty collection would leave the provider status on "loading" forever (see §6, signal COLLECTION-EMPTY-STATUS), so the factory refuses it.
- **Result:**
  - `id` = `purchased-${productId}`;
  - `label` = `${productTitle} · შეძენილი სტემები`;
  - `origin` = `'purchased'`;
  - no `notice`;
  - `sources`: sorted by `order` (stable for equal values). Each source is `{ id: stem.id, title: \`${productTitle} · ${stem.name}\`, shortTitle: stem.name, collectionLabel: label, kind: 'stem', origin: 'purchased' }`.
  - The URLs are copied into a private `Map` when the factory runs, so later changes to the input do not affect the collection.
- **`loadSource(source, ctx, signal)`:**
  - An unknown `source.id` rejects with `Error('უცნობი წყარო')` and does **not** call `fetchAudio`.
  - Otherwise it calls `fetchAudio(url, { credentials: 'omit', signal })` exactly once. The init object has exactly these two keys: no `headers`, no `Authorization`, no `method`. The default `fetchAudio` calls the global `fetch` lazily, at call time, not when the module loads (SSR).
  - If `fetch` rejects: when `signal.aborted`, rethrow the original error unchanged; otherwise reject with `Error('ფაილი ვერ ჩაიტვირთა (ქსელი)')`.
  - A response with `!response.ok` rejects with `` Error(`ფაილი ვერ ჩაიტვირთა (${response.status})`) ``.
  - Otherwise it returns `ctx.decodeAudioData(await response.arrayBuffer())`. A decode rejection becomes `Error('ფაილი ვერ გაიშიფრა')`.
  - **No error message may contain the URL, the query string or the token** (the library shows `შეცდომა: {message}`).

### W1 — `StudioWorkspace.tsx`: the header only (l.2135–2143)
- `const collectionCopy = workspaceCollectionCopy(workspace.collection.origin);`, or the same value read where `workspace` is in scope. `collection` is already in the `useArrangement()` value.
- The `<h1>` text node `CZABA Studio Lab ` becomes `{collectionCopy.heading}` followed by the same space and the same `<span>` (`· სამუშაო სივრცე`). The h1 `textContent` for demo must stay exactly `CZABA Studio Lab · სამუშაო სივრცე`.
- The badge `<span>` text becomes `{collectionCopy.badge}`. Same element, same classes.
- Keep the space between the heading and the `<span>` (use `{' '}` if Biome wraps the line). One import line. Nothing else in the file changes: no class, no element, no other text.

### X1–X3 — `ArrangementContext.tsx`
- **X1 status:** l.532 `useState('დემო კოლექცია იტვირთება…')` → `useState(() => workspaceCollectionCopy(collection.origin).loading)`. In the load effect (l.3011–3015), the two literals → `copy.ready` / `copy.failed(failed)` from `workspaceCollectionCopy(collection.origin)`. The effect already depends on `collection`.
- **X2 file names:** l.2722, l.2910 and l.2916 build the names from `fileStem` as `${fileStem}${renderWindow ? '-range' : ''}.wav` / `.mp3`. Read `fileStem` from `workspaceCollectionCopy(collection.origin)` inside `exportWav` / `exportMp3`, and add `collection.origin` to their dependency arrays (l.2748 and l.2953). The demo result is unchanged: `czaba-studio-lab.wav`, `czaba-studio-lab-range.wav`, `czaba-studio-lab.mp3`, `czaba-studio-lab-range.mp3`.
- **X3:** one import line.
- **Nothing else in the context changes:** no guard, timer, message, abort, progress, state order or value shape. In particular `GESTURE_*` statuses, export messages and the `useArrangement()` surface stay identical.

### New tests
- **`app/lib/arrangement/__tests__/collection.test.ts`** (pure; fake `fetchAudio`, fake `ctx` with `decodeAudioData`):
  - **PC1 shape:** `id`, `label`, `origin`, no `notice`; sources sorted by `order` with the exact titles, `kind: 'stem'` and `origin: 'purchased'`. Changing the input array or a stem URL after creation changes nothing.
  - **PC2 validation:** an empty `stems`, a duplicate `id` and an empty `productId` each throw.
  - **PC3 request:** `fetchAudio` is called once with the stem URL and an init that `toStrictEqual({ credentials: 'omit', signal })`, with `init.signal` being the same object (`toBe`).
  - **PC4 decode:** resolves to the fake `decodeAudioData` result, called with the response's `ArrayBuffer`.
  - **PC5 HTTP error:** 401, 403, 404 and 500 each reject with exactly `ფაილი ვერ ჩაიტვირთა ({status})`. The message contains neither the URL nor `token`. Use a URL with `?token=SECRET`.
  - **PC6 network:** a non-aborted rejection gives exactly `ფაილი ვერ ჩაიტვირთა (ქსელი)`. With an aborted signal, the original error object is rethrown (`toBe`).
  - **PC7 decode error:** exactly `ფაილი ვერ გაიშიფრა`.
  - **PC8 unknown id:** `უცნობი წყარო`, and `fetchAudio` is not called.
  - **PC9 copy:** `workspaceCollectionCopy('demo')` equals the six demo values (failed(2)), and `workspaceCollectionCopy('purchased')` equals the six purchased values.
- **`app/lib/arrangement/__tests__/purchased-collection-ui.test.tsx`**: mount `ArrangementProvider` + `StudioWorkspace`. Copy the stubs (`OfflineAudioContext`, `AudioContext`, `ResizeObserver`, …) from an existing workspace UI test such as `grid-snap-ui.test.tsx` or `export-dialog-footer.test.tsx`; never import from a test file. The collection comes from `createPurchasedWorkspaceCollection` with a fake `fetchAudio` and a fake decode (stub the decode context's `decodeAudioData`).
  - **PW1 header:** the h1 `textContent` is exactly `CZABA Studio · სამუშაო სივრცე`, and the badge is exactly `შეძენილი კოლექცია`. The header contains no `დემო` and no `ავტორიზაცია არ სჭირდება`.
  - **PW2 status:** `შეძენილი კოლექცია იტვირთება…` while `fetchAudio` is pending (deferred promises), then exactly the purchased `ready` text once all stems resolve.
  - **PW3 failure:** one stem answers 403. The status is exactly `შეძენილი კოლექციიდან 1 წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`, that library row shows `შეცდომა: ფაილი ვერ ჩაიტვირთა (403)`, and no rendered text contains `SECRET`.
  - **PW4 abort on unmount:** unmount while `fetchAudio` is pending. Every `init.signal` is `aborted`. Resolving the deferred promises afterwards causes no `console.error` (spy) and no thrown error.
  - **PW5 file names:** a purchased WAV export downloads `czaba-studio.wav`, and a range export `czaba-studio-range.wav`. Use the same download-capture technique as `export-dialog-footer.test.tsx` l.344.
  - **PW6 demo lock:** the same harness with a minimal `origin: 'demo'` collection shows `CZABA Studio Lab · სამუშაო სივრცე`, the demo badge and the demo ready text exactly.

**Mutation proofs** (scratch copy; each must turn at least one listed test red):

| ID | Mutation | Expected red |
|---|---|---|
| a | `fetchAudio` called without `signal` | PC3, PW4 |
| b | init gains `headers: { Authorization: 'Bearer x' }` | PC3 |
| c | the HTTP error message includes the URL | PC5, PW3 |
| d | `workspaceCollectionCopy('purchased').badge` returns the demo badge | PC9, PW1 |
| e | the X1 ready literal hardcoded to the demo text again | PW2 (and PW6 stays green) |
| f | X2 `fileStem` hardcoded `czaba-studio-lab` | PW5 |
| g | the factory accepts an empty `stems` | PC2 |
| h | sources not sorted by `order` | PC1 |

### Docs
- `079-studio-lab-export-notes-and-memory.md` **l.4 only** → `**სტატუსი:** C PASS (Round 91), გამოქვეყნდა 77cd5b6 (D-29z56)` (gate-91 S2).
- New `docs/implementation/2026/quarter-IV/080-studio-workspace-purchased-collection-readiness.md`, written per `docs/implementation/TEMPLATE.md` (Georgian, every section). Status line: `**სტატუსი:** Round 92 — C-ის შემოწმებას ელოდება (D-29z57)`. It records:
  - why the copy was demo-hardcoded and what is now origin-driven;
  - the adapter contract (signal, `credentials: 'omit'`, no headers, error texts without URL or token);
  - what is **not** done: the route mount stays blocked by the auth owner, and the purchased Studio still uses StudioContext;
  - signal COLLECTION-EMPTY-STATUS;
  - that VISUAL-A V-0 will later move Studio copy to one English strings module, and that this module is compatible with that.
- New `docs/technical/arrangement-workspace.md` (Georgian, short; the SRW-21 backlog file). It is a mount guide for the future purchased route:
  - build the collection with `createPurchasedWorkspaceCollection` from the loader stems plus the existing token query;
  - wrap the workspace in `ArrangementProvider`;
  - list what must stay as it is: `RequireAuth`, the `/api/studio-token` Bearer request (route-owned, not the adapter), and the purchase check;
  - list the open prerequisites: release by the auth owner, and the hardcoded `middle-east` loader.

### Files (exact grants)
| File | Grant |
|---|---|
| `app/lib/arrangement/collection.ts` | **new** (P1) |
| `app/components/arrangement/StudioWorkspace.tsx` | W1 only (header h1 text node + badge text + one import) |
| `app/contexts/ArrangementContext.tsx` | X1–X3 only (l.532, l.3011–3015, l.2722, l.2910, l.2916, deps l.2748/l.2953, one import) |
| `app/lib/arrangement/__tests__/collection.test.ts` | **new** (PC1–PC9) |
| `app/lib/arrangement/__tests__/purchased-collection-ui.test.tsx` | **new** (PW1–PW6) |
| `docs/implementation/2026/quarter-IV/079-studio-lab-export-notes-and-memory.md` | l.4 only |
| `docs/implementation/2026/quarter-IV/080-studio-workspace-purchased-collection-readiness.md` | **new** |
| `docs/technical/arrangement-workspace.md` | **new** |

**Expected end state: 3 M + 5 ??**, and all 513 frozen entries unchanged.
- `git diff -U0` of the three modified files may touch only the granted lines. Biome may re-wrap inside a granted statement.
- **No route imports `collection.ts`** (`grep -rn "lib/arrangement/collection" app/routes` is empty). The context and the workspace import only `workspaceCollectionCopy`. `/studio-lab` never calls `createPurchasedWorkspaceCollection`, and importing the module makes no request.
- If any frozen test turns red, **stop and report**; do not edit it. B expects every frozen test to stay green, because the demo output is byte-identical.

## 2. Pre-flight for A
- **Primitives:** `AGENT_DISCOVERABLE_CODE.md` (new exports), `API_ERROR_HANDLING.md` (fetch errors), `SECURITY_AUDIT.md` (token in URL, no header, no URL in messages), `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `FORWARDREF_COMPONENT.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`. **Prompts:** `new-service.md`, `new-test.md`, `studio-feature.md`.
- **Verify the baseline before the first edit:** HEAD `77cd5b6`; clean status; frozen 513/513; the three owned hashes; LF/CR.
- **Checks (speed rules):**
  - `npm run typecheck`, `npm run lint`, and a scoped `npx biome check` on the owned code and test files (no `--write`). Save `npx biome lint <owned code/test files>` to `a-round-92/biome-lint-owned.txt`.
  - **Targeted vitest:** the two new files; every test that mounts `StudioWorkspace` or `ArrangementProvider` (grep `StudioWorkspace\|ArrangementProvider` in `app/lib/arrangement/__tests__`); all `export-*.test.*` files; `library.test.ts`. Write the list to `a-round-92/targeted-list.txt`. Do not run the full suite.
- **A's own smoke (not C evidence), 1440×900:** `/studio-lab` header h1/badge text and the ready status exact; one WAV export with download name `czaba-studio-lab.wav`.
- **Code-reviewer: required** (8 files). Ask it explicitly to check the token/URL leak paths and SSR hydration of the status initializer. Pass its Architecture note to B verbatim.

## 3. File ownership (exact)
- **A** owns only the §1 Files table. **C** owns `c-round-92*`. **B** owns the planning artifacts. **Root** owns gates, commits and pushes.
- **Protected (never edited):** see Baseline. In particular, the purchased route is **not** mounted in this round, and `RequireAuth` / studio-token behaviour is untouched.
- **`/studio-lab`** stays the public **demo-only** workspace: demo badge; no purchased audio; no token/R2 requests; the only third-party requests are the unpkg ffmpeg core after an MP3 click (plus the known Google Fonts and the failing root cart call); user video stays local.

## 4. Ableton source table
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Collection adapter (purchased stems load) | none (CZABA store plumbing) | — | **არ ეხება** | PW/PC unit only; C reviews them |
| Workspace heading / badge / status copy | none (CZABA copy) | — | **არ ეხება** | DEMO-COPY, DEMO-LOAD |
| Export file names | none (CZABA download names) | — | **არ ეხება** | EXPORT-NAMES |

## 5. C acceptance (real browser, Playwright Chromium, `/studio-lab` anonymous)

**Setup:** check `env-status.json` and that `:5173` returns 200; one warm-up load (ENV-VITE-REOPTIMIZE-RELOAD: visit `/` alone first, never in parallel with other sessions). Use a fresh incognito context per session. Demo setup is the same as in rounds 90–91 (`c-round-91/tools/lib91.cjs` `setup`).

| ID | Viewport | Action | Pass evidence |
|---|---|---|---|
| DEMO-COPY (primary) | 1280 and 1440 | Load `/studio-lab`, wait for the library to be ready | h1 `textContent` exactly `CZABA Studio Lab · სამუშაო სივრცე`; badge exactly `დემო კოლექცია — ავტორიზაცია არ სჭირდება`; status exactly `დემო კოლექცია მზადაა. აირჩიე ხაზი და დაამატე ხმა (Enter ან ＋ დამატება).`; `document.title` unchanged from the published tree (expected `Studio Lab — დემო სამუშაო სივრცე \| CZABA`; the route is frozen, so a mismatch is a harness fact, not a FAIL); the library notice unchanged (`სტემები სინთეზური დემოა — …` exact, from `studio-lab-demo.ts`). Each of h1/badge is one line, inside the header, not overlapping the Master control (rects). Screenshot each viewport |
| DEMO-LOAD | 1440 | (a) `page.route('**/middle-east.mp3')` holds the response; read the status, then release. (b) A new page with `page.route('**/videos/hero/hero-music.mp3', r => r.abort())` | (a) While held, status exactly `დემო კოლექცია იტვირთება…`; after release, the exact ready text. (b) Status exactly `დემო კოლექციიდან 1 წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`; that library row shows `შეცდომა: …`; the other sources are ready. Together these run all three X1 strings in a real browser |
| EXPORT-NAMES | 1280: WAV project + WAV range; 1440: MP3 project + WAV + MP3 range | Base demo setup (no Ctrl+D needed); range as in the round-85/86 harness | `download.suggestedFilename()` exactly `czaba-studio-lab.wav`, `czaba-studio-lab-range.wav`, `czaba-studio-lab.mp3`, and `czaba-studio-lab-range.wav` + `czaba-studio-lab-range.mp3`. Each file parses (RIFF PCM 24-bit/48k/2ch; MP3 decodes), and the done messages match the round-91 texts |
| PX-NET | all sessions | — | No request to any R2/workers.dev host, `/api/studio-token`, `/api/recording-*` or `/api/download`; 0 `Authorization` headers; no unpkg request before the first MP3 click; no audio request other than the demo files (`/middle-east.mp3`, `/videos/hero/hero-music.mp3`). `collection.ts` is in the graph (the context imports the copy helper), but its adapter only runs when a purchased collection is built, and `/studio-lab` never builds one |
| REG-HYD | all sessions | — | No hydration / `useLayoutEffect` warning (the status initializer runs on SSR and client), no non-noise console error |
| G92-3 | 1440 | Purchase protection | `/studio/middle-east` anonymous → sign-in required, no workspace; `/api/studio-token?…` anonymous → 401; the header link opens `/studio-lab` with the demo badge; fake-Bearer 403 → BLOCKED if the backend is unavailable |
| PC-REVIEW | — | Read `collection.test.ts` and `purchased-collection-ui.test.tsx`; in a scratch copy, re-run A's mutations **b** and **f** | Both turn red as A's table says. Every PC/PW row asserts behaviour (exact values, call arguments, abort state), not only rendering. Say so explicitly: the purchased path is **unit-only, not browser-reachable** (route mount blocked) |
| T92-TARGETED | — | A's `a-round-92/targeted-list.txt` | All pass |
| SOURCE-UNCHANGED | — | Start = end | HEAD `77cd5b6`; 3 M + 5 ??; frozen 513/513; A's end hashes; the `git diff -U0` hunks of the three modified files touch only the granted lines; `grep -rn "lib/arrangement/collection" app/routes` empty; protected hashes as in Baseline |

- **Gate rows** (`gate`, not claimed by C): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke, and the production bundle (PROD-MP3-UNVERIFIED).
- **Not browser-reachable** (unit only; say so): the whole purchased path (P1(b), the purchased copy, the purchased file names). The browser proves only that the demo path through the new code is byte-identical.
- **Neighbour behaviour that could break:** SSR/hydration of the status, export download names (frozen `export-dialog-footer` l.344), the library error row text, and the header layout at 1280.
- **Known and intended (not new bugs):** everything listed in round 91 §5; the 1-LSB WAV jitter (C-R84-L1, harness rule HR-C-R84-L1-EXPORT-JITTER).

## 6. After this round
- **If C PASS:** SRW-21 stage 1 is done, R21-I1 passes as amended (adapter + origin-aware copy), and SRW-21 stays `blocked-partial` only for the route mount (auth owner) and R21-I2 (full regression).
- **Round 93:** if planned on or after 2026-10-24, it is the **regression round**. Otherwise it is the Lows batch, part 1, chosen by B from the open Lows list (export dialog first: gate-91 S1 note → `aria-describedby`, A-R86-L7/L8, GATE90-S3/S4). Then the full regression (R21-I2) → T12 → VISUAL-A-OBSIDIAN. Scope is not reduced.
- **Signal COLLECTION-EMPTY-STATUS (Low, not scheduled):** with `collection.sources.length === 0` the provider's `settle` never runs, so the status stays "loading". The factory refuses empty input; any fix in the provider goes to the Lows batch.
- **Architecture:** the formal SRW-20 boundary checkpoint request (q14) is in `b-round-91-checkpoint-request.md` for root. It is non-blocking. Nothing is extracted in this round.
