# Round 475: DPG-FIX P0 stage 2 (DPG-P0-2): every undefined token in the Store resolves; the card badge gets its chip

**Planned by:** B, at the round 474 → 475 planning on 2026-11-12 (`b-round-474.md`).
- The advisor was available and consulted after orientation.
- `product-designer` ruled on the visible repairs (`b-round-474/pd-p0-2.md`).
- `tech-lead` reviewed the frozen sketch (`b-round-474/sketch-review.md`).
- The round-474 task is archived as `tasks/round-474.md` (byte-identical, `cmp`).

## Decisions (`backlog.json` `decisions_log_b`)
- **D-29z1678: round 474 result.** C PASS with `browserVerified`/`realVerified` true (`c-round-474.json`); gate 474 published `297f5ae`. DPG-P0-1 is C-verified and **awaiting the DP-gate re-review** (Saba's design-gate rule 4), not მზადაა. A's C10 note is ruled: K16, K17 and K18 were direct consequences of the required edits and are accepted deltas (C-R474-01, L10).
- **D-29z1679: P0-2 inventory by the real resolver** (`b-round-474/scan/`). Two scans use Tailwind's own compiler, so they agree with the browser (L52):
  - undefined `var()` reads in non-test `app/**`: **14 at HEAD → 0 on the sketch** [K3];
  - colour utilities Tailwind does not emit: **28 at HEAD → 24 on the sketch** [K4]. The 24 are dead files (18 `UserDropdown`, the glow remnants that the round 449/453 rulings keep), the frozen `GlobalPlayhead`, and one non-class string, `border-color` inside a `transition` value.
  - **Saba's list vs the tree:**
    - `--radius-xs` is **not broken**: Tailwind's default theme defines it as `0.125rem`, the browser resolves it [K6], and only the dead `TrackRow` reads it. It stays unchanged.
    - `--radius_full` has 0 hits at HEAD.
    - The scan found two undefined names Saba's list did not have: `--color-accent-hover` (`.nav-loading-bar`) and `--color-text-muted` (the two stub routes).
- **D-29z1680: rulings** (`product-designer`, `b-round-474/pd-p0-2.md`):
  1. **The non-New card badge** gets `bg-background/70 text-foreground`. Brass stays on "New" only. At HEAD the chip is transparent [K6]. This closes A-R187-PRODUCTCARD-PRIMARY-TOKEN.
  2. **The card image wrapper:** `bg-card` (undefined) becomes `bg-surface`.
  3. **The card title hover** `group-hover:text-primary` (undefined, a no-op) is removed with its `transition-colors`. Brass is for meaning; the card scale stays the hover cue.
  4. **The nav loading bar.** It paints nothing at HEAD, because the undefined `--color-accent-hover` invalidates its `background` [K6].
     - Do **not** switch on a flashing brass bar in a token round.
     - The render line is in protected `app/root.tsx` [K5], so the rule becomes `display: none;` and its keyframes go. The look is unchanged and no layout is taken.
     - Root removes the render line later: ROOT-REQ-NAV-LOADING-BAR-RENDER.
     - The design question goes to Saba once: SABA-Q-PENDING-NAV-FEEDBACK (L44).
  5. **The stub routes** `/search` and `/account/login`: `var(--color-muted)`. The stub rewrite and its copy are a separate task.
  6. **`--color-text-primary`** (5 reads: CommandPalette and `.code-4`) becomes `var(--color-foreground)`. B measured every consumer inheriting `#ece6da` today at both viewports [K7], so 0 px change.
  7. **The dead `.artist-photo-border/-glow`:** `--primary-hue/sat/light` becomes `rgba(var(--color-brand-rgb), …)`. The pink stop stays for DPG-DECORATIVE-PURGE (P2).
  - **No `@theme` token is added, removed or changed.** So DPG rule 2 needs no design-doc edit [K16]. `docs/design/awwwards-improvements.md` describes the bar as a historical proposal (K19) and stays.
- **D-29z1681: dispatch.** See the grants. The tests:
  - a new resolver-backed guard, `store-undefined-tokens.test.ts` UT1–UT5, with the helper `helpers/token-resolve.ts`;
  - the one `.code-4` pin line in `store-live-teal` [K10].

## Rules
- **Read `lessons.md` first.** These apply especially:
  - L1, L2 (DPG clause), L4, L12, L15 and L23;
  - L26, L28, L29 and L31;
  - L52, L56, L58 and L61.
- **Claims:** `bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-474/claims-475.sh`. B's output is in `b-round-474/claims-475-planning-output.txt`; its last line is `L58 OK`. The allowed deltas after A are in `b-round-474/claims-475-allowed-deltas.txt`, which is the script's output on B's sketch-applied tree (L56).
- **Screen budget (L39):** nothing new becomes permanently visible.
  - An existing badge gains a background chip.
  - A no-op hover goes away.
  - Two stub paragraphs turn muted.
  - Persistent text lines are unchanged.
- **One element, one rule (L4):**
  - **The non-New badge:** "PD ruling 1" wins over the "screen budget no change" clause. Its box size must not change.
  - **The `.code-4` pin in `store-live-teal`:** the sketch line wins over "test files unchanged".

## Baseline
- **HEAD `297f5ae`** (gate 474 published), with a clean tree [K1].
- **Sketch:** `b-round-474/sketch-475.patch.txt` (v2, sha `d2385ffc…`, 7 files; `tech-lead` reviewed v1 and the v1 → v2 delta). It applies to HEAD with rc 0 [K2].
- **Per-file sha256 values after applying it:** `b-round-474/sketch-475-files-sha256.txt`.

### Grants (exactly these paths)
| Path | What |
|---|---|
| `app/styles/app.css` | **Only the sketch's hunks, byte for byte** (narrow grant): the `.nav-loading-bar` body becomes `display: none;` and the `navLoadingProgress` keyframes and their comment line are deleted; the two `.artist-photo-*` values; the 5 `var(--color-text-primary)` reads. Every other byte is unchanged, including `@theme` and the obsidian block |
| `app/components/product/ProductCard.tsx` | Only the sketch's three class edits (l.78, l.101, l.113; the h3 collapses to one line under Biome) [K2] |
| `app/routes/search.tsx`, `app/routes/account_.login.tsx` | Only the sketch's one inline-style value each [K2] |
| `app/lib/__tests__/store-live-teal.test.ts` | Only the sketch's one `.code-4` pin line [K10] |
| `app/lib/__tests__/helpers/token-resolve.ts` | New, byte-equal to the sketch. Every review change is already in v2, so A adds nothing |
| `app/lib/__tests__/store-undefined-tokens.test.ts` | New, byte-equal to the sketch (UT1–UT5, with UT2b) |
| `docs/implementation/2026/quarter-IV/308-dpg-p0-2-undefined-tokens.md` | New. It follows TEMPLATE. l.4 is exactly `**სტატუსი:** In Progress (stage 2 of 3; C round 475 PASS)` (L28) |

**Unchanged:** every other file, in particular:
- the protected files (`app/root.tsx` [K5], `components/studio/**`, `public/**`, `.claude/**`, `package.json`);
- the dead files that UT2 allow-lists;
- the keep-list components;
- `app/styles/base/utilities.css`.

## Reference
Not applicable as a reference product. This round adds no new behaviour, and the scope comes from Saba's DPG-FIX P0 list.
- **Design rulings:** `product-designer` (direction A Obsidian & Brass, brass reserved for meaning).
- **Deviation:** the nav loading bar stays invisible (it is already invisible at HEAD). Whether CZABA should show pending-navigation feedback at all goes to Saba as SABA-Q-PENDING-NAV-FEEDBACK. It is not decided by the loop.

## 1. A: steps
1. **STOP (L11) if K1 or K2 differ from B's output.** Read `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `FORWARDREF_COMPONENT.md` (ProductCard), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`.
2. **Apply the sketch:** `git apply -p1 b-round-474/sketch-475.patch.txt`. This is a reviewed sketch, which L60 allows. Check all 7 sha256 values against `sketch-475-files-sha256.txt`. `b-round-474/sketch-review.md` shows each review finding already resolved in v2. If your code-reviewer asks for a change to a granted file, that is a STOP (L11), not an edit.
3. **Write doc 308** (TEMPLATE headings in order, L26). It must:
   - name the resolver scans and their HEAD/sketch counts;
   - name the `--radius-xs` finding (not broken);
   - name the nav-bar interim and the ROOT-REQ;
   - name the TODO: P0-3, SABA-Q-PENDING-NAV-FEEDBACK, the dead-file cleanup (UserDropdown and the glow remnants, LEGACY-DEAD) and the stub-route task.
4. **Run the checks** and save the logs to `a-round-475/`:
   - `npm run typecheck` and `npm run lint`;
   - `npx vitest run $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-474/covering-475.txt)` (16 files [K13]).

   The full suite belongs to the gate. B's sketch run is K12.
5. **Re-run B's mutants on a copy of your tree:** `b-round-474/mutants/run-mutants.sh /abs/path/to/copy /home/runner/czaba-project/tmp/studio-real-loop/a-round-475/mutants` (both paths absolute; the copy needs `node_modules`). Use `cp -a`, never the store tree (the script refuses it and restores from its own pristine snapshot, not git). All 11 must be red, with the same red rows as `b-round-474/mutants/summary.txt`. A line `<id> NOT-APPLIED` means the mutation text was not found in your tree: your edit differs from the sketch at that spot. Report it and show which equivalent mutant you ran instead; it is not a pass. If a run is interrupted, just run the script again: it restores `app/` from its snapshot first.
6. **Run `code-reviewer`** (3+ files). STOP only for a Medium or higher finding that needs a file outside the grant, or that changes a ruled formula (L11).
7. **Report in `a-round-475.md`:** the files and shas, the logs, the mutants and the reviewer findings, including its Architecture note.

## 2. C: what to verify
**Files.** Write `c-round-475.md`, `c-round-475.json` (all L57 fields) and `c-round-475/progress.json` as you go.
- Start the mock API with `node $(realpath mock-api/server.mjs)` from the loop folder if `:5199` does not answer.
- Stub the LeadMagnet (`localStorage czaba_lead_magnet_dismissed`) and skip the entrance (`sessionStorage czaba_entrance_seen=1`) as B's probes do.
- Reuse `b-round-474/probe/probe-head4.mjs` and `probe-card.mjs` (args: base URL and tag).

| # | Row | Check | PASS means |
|---|---|---|---|
| C1 | SOURCE-SCOPE | `git status --short --untracked-files=all` and the protected list | Only the granted paths changed. The 7 sketch files equal `sketch-475-files-sha256.txt`. K9 = 0 |
| C2 | RESOLVER SCANS | K3b and K4b on the live tree | K3b `TOTAL 0`. K4b `TOTAL 24`, with exactly the lines of `b-round-474/scan/tw-undefined-sketch.txt` |
| C3 | TESTS-MEAN-SOMETHING | Read the new test and helper. Run `run-mutants.sh` (absolute paths) on a `cp -a` copy of A's tree, out-dir under `c-round-475/` | 11 of 11 red, with the same red rows as `b-round-474/mutants/summary.txt` [K8]. Each UT row has a mutant that turns it red. The UT2 token lists equal `b-round-474/scan/tw-undefined-sketch.txt`, never wider. UT2 (batched helper) and the scan (one `build()` per token, `tw-undefined-ast.mjs`) agree; they are two oracles (L52) |
| C4 | UNIT | `npx vitest run $(cat b-round-474/covering-475.txt)` | All 16 files pass. Record the UT2 time: it is at most 50 % of 30 s (L31). B's full run on v2 is K14 |
| C5 | NO-CHANGE CONSUMERS (both viewports) | `probe-head4.mjs` on the tree, compared with `b-round-474/probe/probe-head4.json` | Trigger hover, input, close hover, item hover and both `.code-4` read `rgb(236, 230, 218)`, the same as HEAD. Palette and trigger-hover screenshots are pixel-equal to HEAD (`b-round-474/probe/head-*.png`), as they are on B's sketch run (byte-equal). The 404 differs only inside the `.code-0-inner` box (`pulse404` animation). B's HEAD-vs-HEAD control differs in the same box (`probe/ctl-404-*.png`, `diffpng.mjs`: bbox 692–748 × 355–880), so it is a control pair (L37). Any diff outside that box is a FAIL |
| C6 | BADGE (both viewports) | `probe-card.mjs` on `/`: a non-New badge ("Ambient") and the "New" badge | Non-New computed bg `oklab(0.159861 0.001029 0.00248618 / 0.7)`, which is Tailwind v4's form of `bg-background/70`; colour `rgb(236, 230, 218)` [K15]. Every badge box w/h equals HEAD's (`b-round-474/probe/probe-card-head.json`); "New" is unchanged. Contrast with `b-round-474/probe/probe-contrast.mjs`: text vs median chip pixel ≥ 4.5:1 on every visible non-New badge. B's sketch run: 8.91–8.95:1; HEAD: 8.67–8.82:1, because the covers are dark under the chip (`probe-sketch-contrast.json`, `probe-head-contrast.json`). The chip is consistency, not a contrast rescue, and the row only asserts ≥ 4.5 |
| C7 | IMAGE WRAPPER | `b-round-474/probe/probe-rows.mjs` (images aborted) | The card image wrapper's computed bg is `rgb(22, 20, 18)` and its box is 320×320 at both viewports (B's sketch run; HEAD `rgba(0, 0, 0, 0)`) [K15] |
| C8 | TITLE HOVER | `probe-rows.mjs`: the mouse goes to a card **inside the viewport** (bbox check first) | The h3 is `rgb(236, 230, 218)` before and after hover. The card wrapper's computed **`scale`** goes from `none` to `1.02`. Tailwind v4 `scale-*` sets `scale`, not `transform`, so a `transform` read says `none` on HEAD too. 0 elements in `article` have a `bg-`/`text-` class with `primary` or `card` |
| C9 | NAV BAR (pending navigation) | `probe-rows.mjs`: from `/`, hold every `?_data=` request with `page.route` until released, then click the header link named "Collections". While pending, read `.nav-loading-bar` and screenshot the top 4 px | The node exists (root still renders it, K5), computed `display` is `none` and its bbox is null or 0×0. The top 4 px strip is pixel-equal to the strip just before the click. The header bbox is unchanged. Record HEAD as the control: there `display` is `block`, `background-image` is `none` and the width animates (`navLoadingProgress`), with the strip also pixel-equal (`probe-head-rows.json`) |
| C10 | STUB COPY | `/search` and `/account/login` (`probe-rows.mjs`) | The paragraph colour is `rgb(163, 155, 142)` on both (HEAD `rgb(236, 230, 218)`). The heading and button are unchanged |
| C11 | DEAD RULES | On `/store`, inject `<div class="artist-photo-border">` and `<div class="artist-photo-glow">` | The border colour is `rgba(201, 164, 106, 0.3)`. The background-image starts `linear-gradient(135deg, rgba(201, 164, 106, 0.2) 0%,`. The pink stop stays (P2) |
| C12 | JOURNEY (L54) | `/` → click a ProductCard → product page → back | The product page loads with its own h1. The card badge and colours read the same after back |
| C13 | DOC 308 + DPG rule 2 | Headings, l.4, and each claim against the test file (L26). K16 | TEMPLATE headings in order. l.4 exact. Every UT row the doc names exists. K16 = 0 |
| C14 | AUTH | `/studio/middle-east` anonymous, and `/api/studio-token?product=middle-east&file=x` with no bearer | "Sign in required" and 0 audio `src`; 401. The real-owner path is BLOCKED (backend unavailable in cloud) |
| C15 | CLAIMS | `bash b-round-474/claims-475.sh` | Byte-equal to `b-round-474/claims-475-allowed-deltas.txt`, the script's output on B's sketch-applied clone with a doc 308 placeholder. Against the planning output, only K1 (8 status lines), K2b (`reverse-ok`), K3b (`TOTAL 0`), K4b (`TOTAL 24`) and K10 (empty) differ. The last line is `L58 OK` |
| gate | — | Full verify, code review, publish | Root. Not claimed |

**What could break nearby:**
- **Other suites using the `@tailwindcss` compile cost:** UT2 runs about 3 s. C4 and the gate cover this.
- **The CommandPalette and 404 colours:** C5 covers these.
- **The legacy pages that render ProductCard** (`account.downloads.tsx`, protected): sign-in, so BLOCKED. The class change is the same component.
- **The `TrackRow` and `ArtistBioSection` dead rules:** C11 covers these.

## 3. After this round
1. **On C PASS:**
   - DPG-P0-2 becomes C-verified and **awaiting the DP-gate re-review**;
   - A-R187-PRODUCTCARD-PRIMARY-TOKEN closes;
   - the dead UT2 files join LEGACY-DEAD.
2. **The next planning:**
   - **REGRESSION-2026-11-13** first, if the date is 2026-11-13 or later (`regression-last.json` 2026-11-10);
   - then **DPG-P0-3**: SpotlightLoader with SABA-B-16, and the docs (`DESIGN_SYSTEM.md`, plus the primitives patch via root).
   - After P0-3, root's P0 DP-gate re-review.
3. **Root, non-blocking:**
   - ROOT-REQ-NAV-LOADING-BAR-RENDER;
   - ROOT-REQ-DPG-PRIMITIVES-PATCH (now also C-R474-02: `.claude/**` and `docs/**` markdown emits unused teal utilities);
   - ROOT-REQ-DPG-GATE-REPORT;
   - RETRO 480.
