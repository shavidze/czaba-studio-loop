import sys
name, path = sys.argv[1], sys.argv[2]
s = open(path).read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (name, a)
    s = s.replace(a, b)
if name == 'MU-a':
    rep("      if (shortcutSheetOpenRef.current) {\n", "      if (shortcutSheetOpenRef.current && isShortcutSheetKey) {\n")
elif name == 'MU-b':
    block = """      if (isShortcutSheetKey) {
        if (
          event.repeat ||"""
    i = s.index(block); j = s.index("        setIsShortcutSheetOpen(true);\n        return;\n      }\n", i) + len("        setIsShortcutSheetOpen(true);\n        return;\n      }\n")
    moved = s[i:j]; s = s[:i] + s[j:]
    anchor = "      if (\n        exportOpenRef.current ||"
    k = s.index(anchor); s = s[:k] + moved + s[k:]
elif name == 'MU-c-open':
    rep("          event.repeat ||\n          (event.target instanceof Element", "          (event.target instanceof Element")
elif name == 'MU-c-close':
    rep("if (isShortcutSheetKey && !event.repeat && !isTypingTarget(event.target))", "if (isShortcutSheetKey && !isTypingTarget(event.target))")
elif name == 'MU-d':
    rep("        opener.focus();\n        return;\n      }\n      fallbackFocusRef.current?.focus();\n", "        return;\n      }\n")
elif name == 'MU-e':
    rep("      event.preventDefault();\n      target.focus();\n", "      return;\n")
elif name == 'MU-f':
    rep("          {clipLaneDrag ? (\n            <p\n              className=\"min-w-0 flex-1 truncate text-muted\"", "          {clipLaneDrag && !selectedClip ? (\n            <p\n              className=\"min-w-0 flex-1 truncate text-muted\"")
open(path, 'w').write(s)
