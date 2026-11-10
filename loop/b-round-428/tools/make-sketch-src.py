# B round 428 -> 429: SYS-2 stage 5 source folds. Usage: python3 -I make-sketch-src.py <scratch>
import sys, os
scr = sys.argv[1]
A = os.path.join(scr, 'app/components/arrangement/')
def edit(name, pairs):
    p = A + name; s = open(p, encoding='utf-8').read()
    for old, new, n in pairs:
        assert s.count(old) == n, (name, old[:60], s.count(old))
        s = s.replace(old, new)
    open(p, 'w', encoding='utf-8').write(s)
ARROW = """          onKeyDown={(event) => {
            if (event.key === 'Enter' && event.repeat) {
              event.preventDefault();
            }
          }}
"""
edit('ArrangementMarkerRow.tsx', [
    ("""    if (event.key === 'Enter' && event.repeat) {
      event.preventDefault();
      return;
    }
    if (event.target !== event.currentTarget""",
     """    if (preventRepeatedEnterKeyDown(event)) {
      return;
    }
    if (event.target !== event.currentTarget""", 1),
    (ARROW, "          onKeyDown={preventRepeatedEnterKeyDown}\n", 3),
    ("""                if (event.key === 'Enter' && event.repeat) {
                  return;
                }
                settleEditor(""",
     """                if (preventRepeatedEnterKeyDown(event)) {
                  return;
                }
                settleEditor(""", 1),
])
edit('ArrangementLibraryMenu.tsx', [
    ("""    if (event.key === 'Enter' && event.repeat) {
      event.preventDefault();
    }
  };""", """    preventRepeatedEnterKeyDown(event);
  };""", 1),
])
for name in ['ArrangementMarkerRow.tsx', 'ArrangementLibraryMenu.tsx']:
    p = A + name; s = open(p, encoding='utf-8').read()
    print(name, 'imports helper' if 'studio-repeat-safe' in s else 'NEEDS IMPORT')
edit('ArrangementMarkerRow.tsx', [("import { STUDIO_FOCUS_RING_EDGE_CLASS, STUDIO_FOCUS_RING_INSET_CLASS } from './studio-focus';\n",
  "import { STUDIO_FOCUS_RING_EDGE_CLASS, STUDIO_FOCUS_RING_INSET_CLASS } from './studio-focus';\nimport { preventRepeatedEnterKeyDown } from './studio-repeat-safe';\n", 1)])
edit('ArrangementLibraryMenu.tsx', [("import { armGridMenuDismissClickSwallow } from './ArrangementGridMenu';\n",
  "import { armGridMenuDismissClickSwallow } from './ArrangementGridMenu';\nimport { preventRepeatedEnterKeyDown } from './studio-repeat-safe';\n", 1)])
print('imports added')
