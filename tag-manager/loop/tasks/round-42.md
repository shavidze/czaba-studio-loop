# CURRENT TASK — Round 42: TM-T1-DUP — a standard field whose key or RIFF ID is taken by a custom field cannot be toggled on; a warning names the custom field (D-47)

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-28

## Why this round
- **Round 41: C PASS** (R41-1…R41-5, realVerified=true, bugs `[]`), published `a5c6a6b`, review COMMIT OK. No C bug and no critical/high finding is open.
- The BLOCKED round-42 plan is superseded (copy: `tasks/round-42-blocked-superseded.md`). Saba answered Q1–Q6 and Q8 on 2026-10-28 (policy.local.md), and root linked the green Actions `Check` run `40639002695` on `a5c6a6b`. B closed TM-T0, TM-T0-CI, TM-T0-CI-FU, TM-B14 and TM-T1-MIG on that evidence (see `b-round-41.md` §Addendum).
- **This round = Saba's Q2, first in Saba's order.** It is the only open **medium** finding with a decided behaviour: **RR-R3-01 / TM-T1-DUP** (requirement T-1).
  - **Bug (code read at `a5c6a6b`):** `SchemaEditor.tsx:47` builds `enabledStandardKeys` only from fields with `standard: true`.
  - Case (a): an old `schema.json` holds a custom field `{key:'category', riffChunkId:'CATE'}`. The editor offers `+ Category (UCS)`. Clicking it adds a second field with key `category`. One value is then written to both `CATE` and `ICAT`, and React gets duplicate keys.
  - Case (b): an old custom field already uses RIFF ID `ICAT`. Enabling the standard field gives two writers for `ICAT`.
  - New collisions cannot be made through the form (`:91-113` rejects standard keys and reserved IDs), so they come only from an old or hand-edited `schema.json`.
- **Saba's decision (Q2):** hide the standard Category toggle while its key `category` or RIFF ID `ICAT` is already used by a custom field, show a warning, and pin it with a renderer test.
- This is a logic fix in the renderer, so `test-on-bugfix` applies: the failing tests come first.

## Baseline
- HEAD `a5c6a6bd74488a99675d251275e850a684d55ce0`. The working tree is clean (`git status --porcelain --untracked-files=all` is empty). If HEAD differs or the tree is dirty, stop and report.
  - Exception (project release-commit rule): a root `chore(release): vX.Y.Z` commit directly on `a5c6a6b` that changes only the two `version` fields counts as the baseline.
- **Frozen:** every path not listed under File ownership. These stay byte-identical to `a5c6a6b`. Name them in particular:
  - `src/main/**` (including `schema.ts` and `metadata.ts`);
  - `src/shared/types.ts`, `src/renderer/src/stores/**`, `src/renderer/src/lib/utils.ts`;
  - `src/renderer/src/components/metadata-editor/**`;
  - `tests/main/**`, `tests/e2e/**`;
  - `playwright.config.ts`, `vitest.config.*`, `biome.json`, `.github/**`.
- **Protected (never touch):**
  - `src/preload/index.ts`, `src/preload/index.d.ts` (Q8's permission is for round 43, **not** this round);
  - `src/renderer/src/styles/app.css`;
  - `package.json`, `package-lock.json`, `.github/workflows/release.yml`;
  - `.claude/settings*`, `.claude/hooks/**`.

## Reference (reference-first rule: the warning is a new UI element)
- **Primary:** Saba's decision Q2 (policy.local.md, 2026-10-28).
- **R1, Mp3tag:**
  - Source: community.mp3tag.de, "Suggestion: distinct custom vs. standard MP3 tag fields in the Extended Tags window" (https://community.mp3tag.de/t/suggestion-distinct-custom-vs-standard-mp3-tag-fields-in-the-extended-tags-window/59902), with the mapping docs it points to (https://docs.mp3tag.de/mapping).
  - Behaviour described there: a custom field whose name equals a standard ID3v2 frame name is always stored as that standard frame. The mapping option cannot change that.
  - Status: a community observation, not official docs. The fact taken from it is that a tag editor keeps **one** storage slot per name. It never keeps two fields that write the same slot.
- **Kid3, BWF MetaEdit:** B searched ("Mp3tag Kid3 custom field name conflicts with standard field mapping duplicate tag field warning", standard search) and found nothing about colliding custom and standard fields. No reference is invented.
- **In-app precedent:** the existing inline field error (`Input` → `<p className="text-xs text-destructive">`, `ui/input.tsx:27`). The warning uses the existing design token `--color-warning` (`app.css:38`) through the `text-warning` utility, because it is a warning, not an error.

### Deviations (each with its reason)
1. **Mp3tag silently merges into the standard slot. Here the toggle is hidden and a warning is shown.** Reason: Saba's Q2. A silent merge would also move the user's existing values (for example `CATE` → `ICAT`) without telling them.
2. **The rule covers all 13 standard fields, not only Category.** Reason: the same code path has the same collision for any hidden standard field (for example an old custom field with key `publisher`). Special-casing Category would leave the bug open for the others.
   - This generalisation is B's choice. It is listed in D-47 for Saba to confirm (reversible).
3. **A `schema.json` that already holds both the standard and the custom field with the same key is not repaired.** Such a file exists if the user clicked the toggle before this fix. Reason: Saba's Q2 covers the toggle only. The repair (dedupe on load, or keep both and warn) changes stored data, so it needs Saba.
   - Recorded as **B-R42-01** and question **Q18**. C only observes it (R42-6).

## Scope (A)
**Step 0 (test first, `test-on-bugfix`):**
- Add the new tests below to `tests/renderer/components/schema-editor.test.ts`.
- Run them on unchanged `src/` and record the red output in `a-round-42.md`.
- Then make the fix.

**Behaviour (D-47), all in the renderer:**
1. **Conflict rule.** A standard field `S` (from `STANDARD_FIELDS`) is *blocked* when some field `f` in the current schema has `f.standard !== true` and either:
   - `f.key === S.key`, or
   - `S.riffChunkId` is set and `f.riffChunkId === S.riffChunkId` (exact, case-sensitive; the writer uses the string as is, `metadata.ts:179-197`).

   If both match, the reason is `key`. If several fields match, the first one in schema order is named.
2. **Hidden Standard Fields section.**
   - Not-enabled standard fields that are not blocked keep today's chip (`+ <label>`, same classes, same order).
   - Not-enabled standard fields that **are** blocked get no chip. They get one warning line each, in `STANDARD_FIELDS` order, after the chips:
     - `<p className="text-[10px] text-warning">`;
     - exact text for reason `key`: `<S.label> is unavailable: custom field "<f.label>" already uses key "<S.key>".`
     - exact text for reason `riffChunkId`: `<S.label> is unavailable: custom field "<f.label>" already uses RIFF ID "<S.riffChunkId>".`
     - examples: `Category (UCS) is unavailable: custom field "Category" already uses key "category".` and `Category (UCS) is unavailable: custom field "UCS Cat" already uses RIFF ID "ICAT".`
   - The section (title `Hidden Standard Fields`) renders when there is **at least one chip or at least one warning**. Today it renders only when chips exist, and a blocked Category is often the only hidden field.
   - The chips wrapper (`flex flex-wrap gap-1`) renders only when chips exist.
   - The whole section stays inside the existing `<fieldset disabled={isApplying}>`.
3. **Reactive.** Removing the colliding custom field (Trash2) brings the chip back and removes the warning at once, with no reload. Adding is not affected, because the form already rejects standard keys and reserved IDs.
4. **Handler guard.** In `handleToggleStandard`'s enable branch, if `S` is blocked in `useSchemaStore.getState().fields`, return without changing anything (defence in depth against a stale click).
5. **Unchanged:**
   - the disable branch (X on an enabled standard field);
   - `handleAddCustomField`, Done/Back, D-41…D-46 behaviour and every class string not named here;
   - a standard field that is **enabled** while a custom field collides with it (the both-present case, Deviation 3). It gets no warning and no change this round.
6. **Code placement.** A may either:
   - write the rule inline in `SchemaEditor.tsx`, or
   - export a pure helper `findStandardFieldConflict(standardField, fields)` (returns `{ field, reason: 'key' | 'riffChunkId' } | null`) from a new file `src/renderer/src/lib/standard-field-conflicts.ts`. In that case it also adds `tests/renderer/utils/standard-field-conflicts.test.ts` with boundary cases: empty fields, a standard field without `riffChunkId` (publisher/isrc), a match on both key and ID, and two matches.

   Rules for either choice: no code comments, semicolons, no `any`. Follow `AGENT_DISCOVERABLE_CODE.md`, `TYPESCRIPT_STRICT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md` and `TESTING.md`.

**Renderer tests to add (in `schema-editor.test.ts`; all must be red on baseline `SchemaEditor.tsx`):**
- **T-a:** `PRE_T1_STANDARD_FIELDS` + `{key:'category', label:'Category', type:'text', riffChunkId:'CATE'}`.
  - No `+ Category (UCS)` button.
  - The exact key warning is shown, and the `Hidden Standard Fields` title is shown.
  - The store fields are unchanged.
- **T-b:** `PRE_T1_STANDARD_FIELDS` + `{key:'ucs_cat', label:'UCS Cat', type:'text', riffChunkId:'ICAT'}`.
  - No chip, and the exact RIFF ID warning is shown.
- **T-c (reactive):** from the T-a state, **first assert the blocked pre-state** (no `+ Category (UCS)` chip, exact key warning present; this is what makes T-c red on baseline). Then click the custom field's Trash2.
  - `+ Category (UCS)` appears, and the warning is gone.
  - Clicking the chip then gives exactly one field with key `category`, with `standard: true` and `riffChunkId: 'ICAT'`.
- **T-d (generalisation):** `STANDARD_FIELDS` without `publisher`, + `{key:'publisher', label:'Label', type:'text', riffChunkId:'LABL'}`.
  - No `+ Publisher` chip, and the key warning names `Label`.
- The existing 4 tests stay unchanged and green. In particular, the pre-T-1 schema with no collision still lists `+ Category (UCS)`.

**Docs (Georgian, English technical terms):**
- `docs/recording-tag-contract.md`, section `## არსებული schema.json (D-07)`:
  - replace the sentence "ძველ `schema.json`-ში უკვე არსებული custom `ICAT` ველი ღია საკითხია (TM-T1-DUP)." with the D-47 behaviour (key or `ICAT` taken → no `+ Category (UCS)`, warning; remove or rename the custom field to enable it; `ICAT` keeps a single writer);
  - add one line saying that a schema already holding both fields is not repaired (B-R42-01).
- `docs/bugs/001-save-and-selection-known-limits.md`:
  - add **D-47** to the decision list after D-46;
  - add entry `## 23.` in the existing entry format: ID (RR-R3-01, TM-T1-DUP), Severity medium, file:line, reachability, reproduction before the fix (case a and case b), Reference, Deviations 1–3, decision D-47, test file:names, status `გასწორდა (D-47, TM-T1-DUP)`.
- `docs/bugs/README.md`: update the 001 row counts to match the file (expected: 23 entries, 14 fixed). Recompute the "remaining" figure from the file and do not guess it.
- `docs/design/component-specs.md`, SchemaEditor section: add a `**Hidden field warning:**` block with the exact class string `text-[10px] text-warning` and one sentence on when it replaces the chip (D-47). Keep that file's current language (English, Q17 is still open).

**Not in this round:**
- the both-present repair (B-R42-01 / Q18);
- schema validation at load (Q13);
- any `src/main` or preload change;
- Q4/Q5/Q3/Q6/Q8 work.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/renderer/src/components/schema/SchemaEditor.tsx` | conflict rule, warning, handler guard |
| `src/renderer/src/lib/standard-field-conflicts.ts` (new, optional) | pure helper, only if A extracts it |
| `tests/renderer/utils/standard-field-conflicts.test.ts` (new, only with the helper) | helper boundary tests |
| `tests/renderer/components/schema-editor.test.ts` | T-a…T-d |
| `docs/recording-tag-contract.md` | D-07 section sentence |
| `docs/bugs/001-save-and-selection-known-limits.md` | D-47 + entry 23 |
| `docs/bugs/README.md` | 001 row counts |
| `docs/design/component-specs.md` | warning block |

A writes only `a-round-42.md` in the loop folder. C writes `c-round-42.md`/`.json` and evidence under `c-round-42/`.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R42-1 ownership | `git diff --name-only a5c6a6b` + `git status --porcelain --untracked-files=all` | Only owned paths changed. Frozen and protected paths are byte-identical (`git diff --quiet a5c6a6b -- <path>`). No comments added in `src/`. |
| R42-2 tests + code | `npm run test:renderer`; read the diff | T-a…T-d exist with the exact warning strings and pass, and the 4 old tests pass unchanged. Helper tests pass if the helper exists. The handler guard is present in the enable branch. The section and chips render conditions follow Scope 2. |
| R42-3 red proof | Copy the repository (or a `git worktree` of `a5c6a6b`). Put the new test file(s) on baseline `src/` and run `npx vitest run -c vitest.config.renderer.ts tests/renderer/components/schema-editor.test.ts` | T-a, T-b, T-c and T-d fail on baseline (T-c at its pre-state asserts) and pass on A's tree. Log both runs. Only `schema-editor.test.ts` T-a…T-d count for the red proof. If the optional helper exists, its test file fails on baseline with module-not-found; that is not a meaningful red, and C does not count it. |
| R42-4 real app, collision | Built app via Playwright `_electron` under `xvfb-run`, with `XDG_CONFIG_HOME` set to a temp dir and `Electron/schema.json` planted. **(a)** schema = the 12 pre-T-1 standard fields + `{key:'category',label:'Category',type:'text',riffChunkId:'CATE'}`. Open Customize Fields. **(b)** the same with `{key:'ucs_cat',label:'UCS Cat',type:'text',riffChunkId:'ICAT'}`. | For each case: a screenshot with no `+ Category (UCS)` chip and the exact warning visible; the warning's computed `color` = `rgb(245, 158, 11)` (proves `text-warning` is in the built CSS); `pageErrors` empty, and no "same key" console error. Then close the editor, open the fixture folder, select one WAV, type `DOORWood` into the custom field and Save Tags. **Independent readers** (`music-metadata` + `ffprobe -show_entries format_tags -of json` + raw INFO parse), field by field: (a) the raw INFO parse is the authority for `CATE=DOORWood`. All three readers must show **no `ICAT`**. If ffprobe or music-metadata report the unknown 4cc `CATE`, record it as supporting evidence; if they do not show it, that is a reader limit, not a FAIL. (b) exactly **one** `ICAT` sub-chunk = `DOORWood`. Finally in (a), delete the custom field in the editor: the chip appears and the warning is gone (screenshot). |
| R42-5 regression, D-07 / TM-T1-MIG | The same harness with the 12 pre-T-1 standard fields only | `+ Category (UCS)` is listed and no warning is shown. Enable + Done → `schema.json` has 13 keys, and Category shows in the panel after relaunch (screenshots). Save `DOORWood` → ffprobe `ICAT=DOORWood`. |
| R42-6 observation (no pass/fail) | A schema with the standard `category` (ICAT) **and** a custom `{key:'category', riffChunkId:'CATE'}` | Record what happens: Active Fields rows, console duplicate-key errors, the chunks written on save, and what Hide (X) removes. Input for Q18 / B-R42-01. |
| R42-7 gate + docs | Clean `verifyCommand` (`{ npx --yes tsx@4 tests/fixtures/create-fixtures.ts && npm run check && xvfb-run -a npm run test:e2e; }`), plus `xvfb-run -a npx playwright test --retries=0` once | Exit 0. Renderer count = baseline + the new tests, main unchanged, E2E all pass with no retry. Biome 0 errors. Docs: Georgian; D-47 present in 001; entry 23 has the format fields of entry 22; README counts match the file (C counts `## N.` and `**სტატუსი:** გასწორდა`); the recording-tag-contract sentence no longer says "ღია საკითხია (TM-T1-DUP)"; the component-specs class string equals the code. |

`build:win` / `build:mac` stay BLOCKED ("Windows packaging is not available in the cloud"). That is not a FAIL.

## What could break (C re-checks)
- **T1-9 / adding a field:** custom `ICAT` is still rejected, and pre-T-1 Category is still offered when there is no collision (the existing 4 tests, R42-5).
- **Other hidden standard fields:** hide/show of e.g. Title and Publisher with no collision works as before (one real-app toggle in R42-5).
- **D-42/D-45/D-46:** while `Applying...`, the fieldset disables the chips (the warning is plain text); the Done `aria-disabled`/`aria-busy` and the chip hover classes are unchanged.
- **MetadataPanel:** it renders the custom field (`CATE`) as a normal field, and save and re-read keep the value.
- **K-4:** `ICAT`/`IKEY`/`ICMT` raw sizes are unchanged for the contract fixture (the main tests are frozen and must pass).

## Next (orientation only, Saba's order)
1. **Round 43 = Q8**, RR-R19-01 (medium) / B-R18-01: a narrow `fs:stat-files` IPC.
   - Change: `src/main/ipc/channels.ts`, a new handler, `src/preload/index.ts` and `index.d.ts`. The preload part is **only** the new channel.
   - B lists the exact preload diff, and C diffs preload against the baseline.
   - Saves stop awaiting the full recursive rescan.
2. **Q4 → TM-B11 / D-10:** skip empty text and unset numbers, and keep a meaningful `0`. T1-10 must flip (B-R42-02).
3. **Q5 → TM-B05:** a per-file error "audio data is empty, cannot tag", with a test.
4. **Q3 → TM-B08:** docs/test pin only (D-12 decided).
5. **Q6 → TM-B06:** Biome over `tests/**` with a relaxed override.
6. **Q7 → TM-T2-DATA → TM-T2:** still waiting on Saba's UCS list and licence.
7. **Q9–Q17 and the new Q18:** open; scheduled only after Saba answers.
