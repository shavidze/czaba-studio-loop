# B round 347 -> 348: DP63 and DP65 gesture loops release the pointer in a finally (GATE347-S2; DP63 same class).
# Usage: python3 -I apply-tests.py <tree-root>
import pathlib, sys

p = pathlib.Path(sys.argv[1]) / 'app/lib/arrangement/__tests__/drag-preview-render.test.tsx'
t = p.read_text()

def wrap(old_body_start, asserts):
    old = (
        "    for (const gesture of gestures) {\n"
        "      const parts = clipParts('c1');\n"
        "      const { root } = parts;\n"
        "      pointerDownAt(gesture.handle(parts), 1, gesture.from);\n"
        "      pointerMoveTo(root, 1, gesture.from + 40);\n"
        + old_body_start +
        "      renderLog.counts.clear();\n"
        "      pointerMoveTo(root, 1, gesture.from + 80);\n"
        "      pointerMoveTo(root, 1, gesture.from + 120);\n"
        + asserts +
        "      pointerUpAt(root, 1, gesture.from + 120);\n"
        "      act(() => live(api).undo());\n"
        "    }\n"
    )
    ind = lambda s: ''.join('  ' + line + '\n' if line else '\n' for line in s.rstrip('\n').split('\n'))
    new = (
        "    for (const gesture of gestures) {\n"
        "      const parts = clipParts('c1');\n"
        "      const { root } = parts;\n"
        "      pointerDownAt(gesture.handle(parts), 1, gesture.from);\n"
        "      let released = false;\n"
        "      try {\n"
        + ind(
            "      pointerMoveTo(root, 1, gesture.from + 40);\n"
            + old_body_start +
            "      renderLog.counts.clear();\n"
            "      pointerMoveTo(root, 1, gesture.from + 80);\n"
            "      pointerMoveTo(root, 1, gesture.from + 120);\n"
            + asserts +
            "      pointerUpAt(root, 1, gesture.from + 120);\n"
            "      released = true;\n"
            "      act(() => live(api).undo());\n"
        ) +
        "      } finally {\n"
        "        if (!released) {\n"
        "          pointerUpAt(root, 1, gesture.from + 120);\n"
        "        }\n"
        "      }\n"
        "    }\n"
    )
    return old, new

dp63_asserts = (
    "      expect(rendersOf('ArrangementClipViewInner'), gesture.label).toBeGreaterThan(0);\n"
    "      expect(rendersOf('GripVertical'), gesture.label).toBe(0);\n"
    "      expect(rendersOf('ChevronDown'), gesture.label).toBe(0);\n"
    "      expect(rendersOf('ChevronRight'), gesture.label).toBe(0);\n"
)
dp65_asserts = (
    "      expect(rendersOf('ArrangementClipViewInner'), gesture.label).toBeGreaterThan(0);\n"
    "      expect(rendersOf('ArrangementMixFader'), gesture.label).toBe(0);\n"
    "      expect(rendersOf('ArrangementDetailClipGain'), gesture.label).toBe(0);\n"
)
for pre, asserts in (('', dp63_asserts), ("      expect(live(api).getSelectedClipIds(), gesture.label).toEqual(['c1']);\n", dp65_asserts)):
    old, new = wrap(pre, asserts)
    assert t.count(old) == 1, ('anchor', t.count(old), asserts[:60])
    t = t.replace(old, new)
p.write_text(t)
print('tests ok')
