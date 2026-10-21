import sys

p = sys.argv[1]
s = open(p, encoding='utf-8').read()


def rep(a, b):
    global s
    if a not in s:
        print('MISSING:', a[:80])
        return
    s = s.replace(a, b)


rep('2. **The detail panel is found through an explicit ref** instead of `scroller.nextElementSibling`. This needs a `forwardRef` on `ArrangementDetailPanel`, because the project is on React 18.',
    '2. **The detail panel is found through an explicit ref** instead of `scroller.nextElementSibling`. The ref is passed through a `panelRef` prop, following the `asideRef`/`bodyRef` precedent in `ArrangementLibrary`. It is **not** a `forwardRef` (see §2.2 for why).')
rep('- `ArrangementDetailPanel.tsx` (§2.2, only the `forwardRef` wrap);',
    '- `ArrangementDetailPanel.tsx` (§2.2: only the optional `panelRef` prop and `ref={panelRef}` on the root `<section>`);')
rep('   - `FORWARDREF_COMPONENT.md` (the `forwardRef` wrap; follow its pattern, including `displayName` if the primitive requires it);',
    '   - `FORWARDREF_COMPONENT.md` (component edit). This round deliberately does **not** use `forwardRef`; record why in doc 030 (§2.2);')

start = s.index('### 2.2 Explicit detail-panel ref')
end = s.index('### 2.3 Tests')
s = s[:start] + '''### 2.2 Explicit detail-panel ref (`StudioWorkspace.tsx` l.447, l.474; `ArrangementDetailPanel.tsx` l.68, l.402, l.607)

This is a no-behaviour refactor.

**Why not `forwardRef`** (B, D-29o, after reading the frozen tests):
- `render-budget.test.tsx` (frozen) counts renders through a fake devtools hook, keyed by `fiber.type.name` for **function** types. It asserts that `ArrangementDetailPanel` renders 0 times per Play frame and more than 0 after a selection change (l.240, l.420, l.560).
- A `forwardRef` export makes the fiber type an object. The count under that name would then be 0, and that frozen test would fail.
- An inline `forwardRef(...)` would also make Biome re-indent the ~250-line body, so the diff could not be audited.
- The codebase already passes DOM refs as ordinary props: `ArrangementLibrary`'s `asideRef?: RefObject<HTMLElement>` and `bodyRef` (l.134–135, l.362, l.435).

**Exact change:**
- **`ArrangementDetailPanel.tsx`:**
  - add `panelRef?: RefObject<HTMLElement>;` to `ArrangementDetailPanelProps` (l.68), plus the `RefObject` type import if it is missing;
  - add `panelRef` to the destructured parameters of `export function ArrangementDetailPanel` (l.402), so it is not spread into `contentProps`;
  - add `ref={panelRef}` on the root `<section data-testid="arrangement-detail-panel">`;
  - nothing else changes: the name, the function form, the hooks, the markup and the classes stay. `detail-panel.test.tsx`'s `CapHarness` (frozen; it passes no ref) must still compile and pass.
- **`StudioWorkspace.tsx`:**
  - add `const detailPanelRef = useRef<HTMLElement>(null);` and pass `panelRef={detailPanelRef}` to `<ArrangementDetailPanel>`;
  - in `refreshTrackLaneLayout`, `const panel = detailPanelRef.current;`;
  - in `handleDetailPanelTransitionEnd`, compare `event.target === detailPanelRef.current`;
  - the `instanceof HTMLElement` guards may become null checks with the same meaning;
  - nothing else changes: the metrics, the animation check, the `useCallback` dependencies (a ref is stable) and the wrapper's `onTransitionEnd`.
- After the change, `nextElementSibling` must not appear anywhere in `StudioWorkspace.tsx`.
- `render-budget.test.tsx` and `detail-panel.test.tsx` stay unchanged and green.

''' + s[end:]

rep("   - Then, for **each** of the three separators (the music lane's `role=separator` named `მუსიკა სიმაღლე`, `arrangement-detail-separator` and `arrangement-library-separator`):",
    "   - Then, for **each** of the three separators: the music lane's `role=separator` named `მუსიკა სიმაღლე`, `arrangement-detail-separator` and `arrangement-library-separator`. The library separator renders only while the library is expanded. If the fixture starts with it collapsed, expand it in the test before focusing that separator. For each one:")
rep("""3. **R24-F (red on old code).**
   - Render `ArrangementDetailPanel` alone, with the minimal props, inside the same provider/fixture style the file already uses, and with a `createRef<HTMLElement>()`.
   - Assert that `ref.current` is the element with `data-testid="arrangement-detail-panel"`.
   - On the old code, React 18 does not forward the ref, so `ref.current` is `null` (paste any console warning in the red output).
   - If rendering it alone needs disproportionate scaffolding, assert it through `mountTrackLayout` instead. In that case, add a test-only observation that does not touch source files, and explain the choice in the report.""",
    """3. **R24-F (red on old code).**
   - Render `ArrangementDetailPanel` alone with the minimal props, as `detail-panel.test.tsx`'s `CapHarness` does (the provider, `selection={null}` and so on), plus `panelRef={createRef<HTMLElement>()}`.
   - Assert that `ref.current` is the element with `data-testid="arrangement-detail-panel"`.
   - On the old code the unknown prop is ignored, so `ref.current` is `null` and the test fails.
   - The red run is a vitest run. tsc on the test file is expected to fail until the prop exists; say so in the report.""")
rep('| `app/components/arrangement/ArrangementDetailPanel.tsx` | A | §2.2: the `forwardRef` wrap on the export and `ref` on the root `<section>` only |',
    '| `app/components/arrangement/ArrangementDetailPanel.tsx` | A | §2.2 only: the optional `panelRef` prop (its type, the destructuring, and the `RefObject` import if needed) and `ref={panelRef}` on the root `<section>` |')
rep("""- `StudioWorkspace.tsx` changes only:
  - the Home condition;
  - the `detailPanelRef` declaration;
  - its two read sites;
  - `ref=` on `<ArrangementDetailPanel>`.
- `ArrangementDetailPanel.tsx` changes only the `forwardRef` wrap (the signature lines, the closing, `displayName` if used) and `ref` on the root `<section>`.""",
    """- `StudioWorkspace.tsx` changes only:
  - the Home condition;
  - the `detailPanelRef` declaration;
  - its two read sites;
  - `panelRef=` on `<ArrangementDetailPanel>`.
- `ArrangementDetailPanel.tsx` changes only:
  - the `panelRef` line in the props interface;
  - the `RefObject` import, if it was missing;
  - `panelRef` in the destructured parameters;
  - `ref={panelRef}` on the root `<section>`.

  Nothing in the function body is re-indented. It is still a plain function named `ArrangementDetailPanel`, with no `forwardRef`.""")
rep('  - removing the `ref` on the `<section>` makes R24-F fail;',
    '  - removing `ref={panelRef}` from the `<section>` makes R24-F fail;')
rep('- the ref refactor (why `nextElementSibling` was fragile);',
    '- the ref refactor: why `nextElementSibling` was fragile, and why a `panelRef` prop was used instead of `forwardRef` (render-budget counts renders by name, the body would be re-indented, and `asideRef` is the precedent);')
a = "- Biome 0 errors on `./app` (read-only). The warning count must not exceed round 23's 218 warnings + 1 info."
rep(a, a + '\n- `render-budget.test.tsx` and `detail-panel.test.tsx` are green **and unchanged** (their sha256 is in the frozen list).')
open(p, 'w', encoding='utf-8').write(s)
print('forwardRef count', s.count('forwardRef'))
