COMMIT: OK

I read the diff and the files it touches, and checked the shared helper against each call site. I did not rerun the tests or the browser probe. I'm relying on C's PASS and `verify.log` for those.

**Findings, ranked (none block the commit):**

1. **Low – `app/lib/arrangement/__tests__/held-enter-source-scan.test.ts:9-14`: false positive in the scan.**
   - The second branch of the regex also matches `!event.repeat && event.key === 'Enter'`, which is a legitimate fresh-Enter-only guard. HS1 would then fail on correct code.
   - No such code exists today.
   - Fix: add `(?<![!\w.?])` before `REPEAT` in the reversed branch, and add a negative case to HS2. Doc 277 already lists this as a TODO.

2. **Low – `ArrangementMarkerRow.tsx:974-983`: no row pins a repeated Escape.**
   - The name editor still calls `preventDefault` and `stopPropagation` before the guard. A repeated Enter therefore stays inside the editor and doesn't reach the Studio shortcuts, which is the same as at HEAD.
   - A repeated Escape still settles the editor, as it did at HEAD.
   - HK3 only covers Enter. Fix: add one HK3b row for a repeated Escape. This is optional.

3. **Info – `app/lib/arrangement/__tests__/held-enter-source-scan.test.ts:20,25`: the scan can't see some forms.**
   - It skips `__tests__` directories and `*.test.*` files.
   - It does not catch bracket access (`e['key']`), a parenthesised operand, or a named constant in place of `'Enter'`.
   - Doc 277 documents all of these limits, and none appear in `app/` or `perf/` today.
   - Fix: let the planned checkpoint compare this scan with a lint rule.

**What I checked:**
- **Behaviour at the call sites** (`ArrangementMarkerRow.tsx:783`, `:846`, `:858`, `:870`, `:978`; `ArrangementLibraryMenu.tsx:104`): the helper in `studio-repeat-safe.ts` is the old inline check, `key === 'Enter' && repeat` then `preventDefault`. It adds only the boolean return value.
  - The flag handler still returns first.
  - The library menu helper call is still the last statement. Space, Escape, Tab and the arrow keys still return earlier.
  - `onKeyDown={preventRepeatedEnterKeyDown}` is a stable module-level reference, so it adds no render cost.
  - The pre-existing `if (!event.repeat)` check on Space at `ArrangementLibraryMenu.tsx:99` is untouched.
- **Event ordering and leaks:** no listeners, timers, refs or effects were added or moved, and no focus calls were added. The browser probe in doc 277 reports `firstEqualsHead True` in all 8 cells.
- **TypeScript:** no `any`, no assertions and no suppression directives. The helper takes `KeyboardEvent<HTMLElement>`, which the `HTMLButtonElement` and `HTMLDivElement` handlers satisfy.
- **Tailwind and tokens:** no class or style changes.
- **Accessibility:** unchanged. `aria-label`, `aria-keyshortcuts` and the focus rings are the same.
- **Auth, purchase and download code:** not touched. The nine paths are two arrangement components, three test files and four docs. Only line 4 of docs 274–276 changed.
- **Tests:** HK1–HK4 assert both `defaultPrevented` (via `fireEvent`'s return value) and the resulting state. HK3 checks the editor stays open and no marker or undo entry exists, which gets around the editor always calling `preventDefault`. The scan test is `@vitest-environment node` and only reads the files.
- **Docs:** doc 277 follows the required template sections, and the docs are in Georgian.

**Architecture note:**
- **Signal:** repeated cost in one region. Held-Enter handling has now taken five rounds (422, 426, 427, 428, 429) across the Studio components. The shared helper (`studio-repeat-safe.ts:3`) ends the copy-paste.
- **Keep:** the helper and the per-button opt-in `onKeyDown={preventRepeatedEnterKeyDown}`. It is small, the public hook shape and the audio timing are untouched, and the tests pin per-press behaviour. Extracting a wrapper component now would add prop plumbing and gain nothing.
- **Proposal for the planner, as one bounded task (ARCH-CHECKPOINT-SYS-2, already in doc 277):**
  - Decide between a Biome or lint rule and the source-scan test.
  - Decide whether the delegated menu form `if (!event.repeat)` (GridMenu, MarkerMenu, DetailPanel, GroupHeader) should get its own sibling helper.
  - Decide whether a shared held-Enter test helper (SIG-R427-HELD-ENTER-TEST-HELPER) is worth it.
  - Acceptance: all current HK, HS, HM and HP rows stay green, and no change to per-press behaviour.
- **Scope of this note:** it covers this diff only. I have not audited the whole module.