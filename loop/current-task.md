# Round 473: STORE-2c-1 doc fix-up (C-R472-01). Doc 306 matches the test, then STORE-2c-1 closes

**Planned by:** B, at the round 472 → 473 planning on 2026-11-12 (`b-round-472.md`).
- The advisor was available and consulted after orientation.
- No sketch is dispatched this round. Doc 306 is the only file that changes.
- The round-472 task is archived unchanged as `tasks/round-472.md`. Its rulings R-471-1…3 and D-29z1662…1666, and its browser rows, still hold.

## Decisions (`backlog.json` `decisions_log_b`)
- **D-29z1667: round 472 result** (C evidence: `c-round-472.md` / `.json`).
  - C FAIL, with `browserVerified` and `realVerified` true. C1–C11, C13 and C14 PASS on the tree. Only C12 (the doc) failed: C-R472-01 (Medium, origin B grant scope).
  - C-R471-01's fix is verified (C10: FN4 is red on `georgia-serif`, `no-mono`, `commented-mono` and `head-css`). It closes when 2c-1 is published.
  - Gate 472 was skipped. HEAD stays `5cd9645`.
  - STORE-2c-1 is **not done**. Its product and browser half is verified at the tree's `app.css` sha `d3af7582d8199712` and test sha `bb46efc7302706ef`. Only the doc remains.
- **D-29z1668: ruling on C-R472-01 and A-R472-REVIEW-M1/L1/L2 (L10).**
  - Doc 306 l.78, l.79 and l.90 get the exact replacement text in the grant row below.
  - **Class fix:** line-number grants lost two rounds, so this round grants **the whole doc for factual corrections**. A reviewer finding of a false statement on another line is fixed and reported, not a STOP, within the limits in the grant row.
  - **Round numbers, line by line:**
    - **l.4 changes** (L28 implicit grant): "C round 472 PASS" is false.
    - **l.48 and l.106 keep "round 472".** C round 472's C5 and browser rows ran and passed, and they are not repeated.
    - **l.94 keeps "round 472".** It records A's round-472 unit run, which happened.
  - A-R472-REVIEW-L3 was fixed in round 472.
  - A-R472-REVIEW-L4 (FN6 does not strip comments) goes to `deferred_low_polish`, owner STORE-2c-4, with SR-472-L1.
- **D-29z1669: DPG-FIX is recorded in the queue** (Saba 2026-11-12, policy section "Design philosophy acceptance gate").
  - It goes ahead of STORE-2c-2 and STORE-3…5. Details are in `b-round-472.md`.
  - It is not dispatched this round. P0 rewrites `app.css`, which carries the unpublished 2c-1 change until this round passes and is published.
- **D-29z1670: the home TestimonialsSection.**
  - No route mounts it. Saba's own commit `a208b4c` (2026-10-02) unmounted it, before the redesign, so this is not a loop regression.
  - It goes to Saba as a question (`user-review/questions-round-472.md` Q1).
  - The `/about` stats are present and intact (C4 of round 472).
- **D-29z1672: evidence gaps C named, plus one unrecorded Saba item.**
  - **SpecialOffers** renders no text on the mock data (C round 472 C4, the same on HEAD). STORE-2c-1 closes with that limit as open evidence.
  - Before DPG P0 touches `SpecialOffersSection.tsx`, the DPG P0 task must give C a way to see it: a `page.route` stub or a mock fixture in `mock-api/` (owner: the B planning of DPG P0).
  - **Saba's 2026-11-10 lane resize handle** (`h-1.5 hover:bg-foreground/50`, Low) was not in the backlog. It is now `SABA-VIS-LANE-RESIZE-HANDLE` in `deferred_low_polish`, owner STUDIO-VIS / REVIEW-RECOMMENDATIONS.
- **D-29z1671: this dispatch.** Regression is not due: `regression-last.json` is dated 2026-11-10 and today is 2026-11-12 [K7].

## Rules
- **Read `lessons.md` first.** These apply especially:
  - L10 (the ruling above), L11 (STOP) and L22;
  - L26 (now including the whole-doc grant rule) and L28 (the l.4 form);
  - L29 (`[K#]` claims) and L57.
- **Claims script:** `bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-472/claims-473.sh`. B's output is in `b-round-472/claims-473-planning-output.txt`.
- **Screen budget:** nothing visible changes.

## Baseline: a dirty tree, not a clean HEAD
- **HEAD** `5cd9645`, published by gate 470. Gates 471 and 472 were skipped [K1, K2].
- **The round-471 + round-472 tree is kept as is** (no revert):
  - exactly 3 status paths: ` M app/lib/__tests__/self-hosted-fonts.test.ts`, ` M app/styles/app.css`, `?? docs/implementation/2026/quarter-IV/306-store-2c-1-font-family-tokens.md`;
  - tracked diff sha `7a5ee8da803b7379` [K1];
  - `app.css` sha `d3af7582d8199712` [K3];
  - test sha `bb46efc7302706ef`; `git apply -R --check` of sketch-472 gives rc 0 [K4];
  - doc 306 sha `242b45e3f214c8f7`, 116 lines [K5];
  - protected rc 0 [K8].

### Grants (exactly this path)
| Path | What |
|---|---|
| `docs/implementation/2026/quarter-IV/306-store-2c-1-font-family-tokens.md` | **Exact replacements:**<br>• **l.4** becomes exactly `**სტატუსი:** In Progress (stage 1 of 4; C round 473 PASS)`<br>• **l.78** becomes exactly ``  - ახალი `TOKEN_FONT_FAMILIES`, `INSTRUMENT_SANS_STACK` და `STORE_THEME_FONT_TOKENS` კონსტანტები;``<br>• **l.79** becomes exactly ``  - FN4 ახლა მხოლოდ კომენტარებისგან გასუფთავებული Store-ის `@theme {` ბლოკის `--font-sans`/`--font-serif`/`--font-mono`-ს ზუსტ მნიშვნელობებს (R-471-1) ამოწმებს, მათ family-ებს ზუსტ სიას უტოლებს და ამოწმებს, რომ თითოეული self-hosted სიაშია; obsidian ბლოკს არ კითხულობს;``<br>• **l.90** becomes exactly ``  **გადაწყვეტა:** `body` ახლა `var(--font-sans)`-ს იყენებს. FN6 ამას ამოწმებს და იმასაც, რომ `app.css`-ში არც Inter წერია, არც Playfair Display, არც ერთმაგი, არც ორმაგი ბრჭყალებით.``<br>**Byte-exact source of each line:** `b-round-472/doc306-l4.txt`, `doc306-l78.txt`, `doc306-l79.txt`, `doc306-l90.txt` (one line each, trailing newline). The file wins over the table rendering. Check: `diff <(sed -n 79p <doc>) b-round-472/doc306-l79.txt`<br>**Accuracy grant (D-29z1668):** A may correct any other line of this doc that is false against the current test file or `app.css`, including a line its reviewer finds false. Each correction stays on its own line. Every such edit is listed, with its line number, in `a-round-473.md`.<br>**Not allowed under the accuracy grant:** changing the seven `## ` headings or their order; changing the line count (116); rewriting "round 472" to 473 on l.48, l.94 or l.106; adding new claims about tests or browser runs |

**Unchanged:** every other file stays byte for byte, in particular:
- `app.css` (`d3af7582…`) and `self-hosted-fonts.test.ts` (`bb46efc7…`);
- every component, the keep-list, and every protected file.

## Reference
Not applicable: this is a docs-only fix-up. The 2c-1 reference section in `tasks/round-471.md` is unchanged.

## 1. A: steps
1. **STOP (L11) if the start state differs from the Baseline.** Run the claims script and compare K1, K3, K4, K5 and K8.
2. **Read `GEORGIAN_DOCS.md`, then edit doc 306** exactly as the grant says.
   - Read the whole doc against `git diff 5cd9645 -- app/lib/__tests__/self-hosted-fonts.test.ts` and against `app.css`.
   - Correct any other false line under the accuracy grant.
3. **Run the checks** and save the logs to `a-round-473/`:
   - `npx vitest run app/lib/__tests__/self-hosted-fonts.test.ts`. This is a sanity check; the source is unchanged.
   - The claims script.

   No typecheck or lint is needed: no source changes.
4. **Ask `code-reviewer`** to read doc 306 against the test file and `app.css` and list every false statement. Fix each one under the accuracy grant.
   - **STOP only when** the fix needs a heading change or a change to a file other than the doc, or the finding is a Medium or higher outside this doc.
   - **Already ruled: report these, do not STOP:** SR-472-L1/L2/L3, `.artist-title`, `<kbd>`/↵, the stale typography comments and primitives, A-R471-REVIEW-INFO-COVERAGE, SIG-R472-FONT-STACK-DUP and A-R472-REVIEW-L4 (D-29z1663, D-29z1666, D-29z1668). Any finding about the test file or `app.css` themselves is reported, never edited: both stay byte-locked.
5. **Report** in `a-round-473.md`:
   - the doc diff (`a-round-473/doc306.diff`);
   - the final K5/K6 lines;
   - each reviewer finding and what was done with it.

## 2. C: what to verify
**Files.** Write `c-round-473.md`, `c-round-473.json` (all L57 fields) and `c-round-473/progress.json` as you go.

**Round-472 browser rows are not repeated.** C1–C10 of round 472 stand because `app.css` and the test are byte-unchanged (the K3/K4 shas). A change in either is a FAIL, and the next round re-runs C1–C10.

| # | Row | Check | PASS means |
|---|---|---|---|
| C1 | SOURCE-SCOPE | `git status --short --untracked-files=all`; `sha256sum app/styles/app.css app/lib/__tests__/self-hosted-fonts.test.ts`; the protected manifest | The same 3 paths. Tracked diff sha `7a5ee8da803b7379`. `app.css` `d3af7582…` and the test `bb46efc7…` are unchanged. Protected rc 0 |
| C2 | DOC vs TEST (semantic, C-R472-01) | Read doc 306 in full next to the test file's FN1–FN6 and `app.css` | **Every statement about FN4/FN6, the constants and the `app.css` lines matches the source.** l.4, l.78, l.79 and l.90 are byte-exact as granted. No line says FN4 reads the whole file or the obsidian block. The seven TEMPLATE headings are in order and the doc still has 116 lines. l.48, l.94 and l.106 still say round 472. Every other edit is listed in `a-round-473.md` and is true. **FAIL** only for a statement that contradicts the test file or `app.css`, or for a granted line that is not byte-exact (`diff <(sed -n Np doc) b-round-472/doc306-lN.txt`). An omission or a wording nit is a Low, recorded, not a FAIL. B's own read found none beyond l.78/l.79/l.90. l.95's "OFL licence" per family is a global licence-dir check in FN4, which is a wording nit |
| C3 | DOC hygiene (L28, L26) | `grep` on doc 306 | 0 hits each for `pending`, "ელოდება", "C5 ამოწმებს" and "მთელ ფაილში". Every test id cited (FN4, FN6) exists in the file |
| C4 | UNIT sanity | `npx vitest run app/lib/__tests__/self-hosted-fonts.test.ts` | All 6 tests pass |
| C5 | BROWSER SMOKE (dev server `http://127.0.0.1:5173`, 1440 and 1280; start the mock API with `node $(realpath mock-api/server.mjs)` from the loop folder if :5199 does not answer) | On `/` and `/store`, read the computed `font-family` of `body` and `h1`. Open `/studio-lab` anonymously and take a screenshot. Open `/studio/middle-east` | Body and h1 start with `"Instrument Sans"`. The Studio demo opens with no sign-in. The premium route shows "Sign in required", with 0 audio `src` |
| C6 | AUTH | `/api/studio-token` without a bearer | 401. The fake-bearer success path is BLOCKED (backend unavailable in cloud) |
| C7 | CLAIMS | `bash b-round-472/claims-473.sh` | Equal to `claims-473-planning-output.txt` except K5/K6 (the doc sha and the granted lines) and K10 ("მთელ ფაილში" and "obsidian ბლოკის ჩათვლით" become 0). The last line is `L58 OK` |
| gate | — | Full verify, code review, publish | Root. Not claimed |

**What could break nearby:** nothing in the source. The risk is a doc edit beyond the grant, which C1 and C2 cover.

## 3. After this round
1. **On C PASS:**
   - STORE-2c-1 is **done**. Its browser evidence is C round 472 (C1–C10) at the same shas; its doc evidence is C round 473.
   - C-R471-01 and C-R472-01 close.
   - The gate publishes rounds 471–473 together.
2. **The next planning:**
   - if it is dated 2026-11-13 or later: REGRESSION-2026-11-13 with its `scope_additions` (D-29z1669 ruling);
   - otherwise: the first DPG-FIX P0 stage, sized from a hue-scan inventory.

   STORE-2c-2 follows DPG P0. Saba's DPG priority overrides the D-29z1660 cap of 3 rounds.
3. **Root, non-blocking:**
   - ROOT-REQ-DPG-GATE-REPORT (the gate report file);
   - ROOT-REQ-DP-GATE-FIRST (with SABA-B-16);
   - ROOT-REQ-ACTIVE-VIEW-STORE-REDESIGN;
   - RETRO 480.
