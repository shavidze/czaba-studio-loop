# B round 426 -> 427: builds the SYS-2 stage 2b-i source sketch on a scratch tree. Usage: python3 -I make-sketch.py <scratch-root>
import sys, re
root = sys.argv[1].rstrip('/') + '/app/components/arrangement/'
INLINE = re.compile(r"onKeyDown=\{\(event\) => \{\n\s*if \(event\.key === 'Enter' && event\.repeat\) \{\n\s*event\.preventDefault\(\);\n\s*\}\n\s*\}\}")
def edit(name, fn):
    p = root + name
    s = open(p, encoding='utf-8').read()
    t = fn(s)
    assert t != s, name
    open(p, 'w', encoding='utf-8').write(t)
def once(s, old, new, n=1):
    assert s.count(old) == n, (old, s.count(old))
    return s.replace(old, new)
def add_import(s):
    anchor = "import { STUDIO_FOCUS_RING_INSET_CLASS"
    line = "import { preventRepeatedEnterKeyDown } from './studio-repeat-safe';\n"
    if line in s:
        return s
    # insert after the last relative import line
    lines = s.split('\n')
    last = max(i for i, l in enumerate(lines) if l.startswith('import ') or l.startswith("} from '"))
    lines.insert(last + 1, line.rstrip('\n'))
    return '\n'.join(lines)
def fold_inline(s, n):
    assert len(INLINE.findall(s)) == n, len(INLINE.findall(s))
    return INLINE.sub('onKeyDown={preventRepeatedEnterKeyDown}', s)

def detail(s):
    s = fold_inline(s, 2)
    s = once(s, "  const handleToggleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {\n    if (event.key !== ' ') {",
                "  const handleToggleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {\n    if (preventRepeatedEnterKeyDown(event)) {\n      return;\n    }\n    if (event.key !== ' ') {")
    return add_import(s)
edit('ArrangementDetailPanel.tsx', detail)

def preview(s):
    return add_import(fold_inline(s, 2))
edit('ArrangementLibraryPreview.tsx', preview)

def library(s):
    s = re.sub(r"  const preventRepeatedLibraryEnter = \(event: KeyboardEvent<HTMLButtonElement>\) => \{\n    if \(event\.key === 'Enter' && event\.repeat\) \{\n      event\.preventDefault\(\);\n    \}\n  \};\n\n", '', s)
    assert 'const preventRepeatedLibraryEnter' not in s
    s = s.replace('onKeyDown={preventRepeatedLibraryEnter}', 'onKeyDown={preventRepeatedEnterKeyDown}')
    s = once(s, "                    dismissLibraryNotice(collection.id);\n                    librarySearchInputRef.current?.focus();\n                  }}\n",
                "                    dismissLibraryNotice(collection.id);\n                    librarySearchInputRef.current?.focus();\n                  }}\n                  onKeyDown={preventRepeatedEnterKeyDown}\n")
    s = once(s, "                onClick={() => setNodeId(LIBRARY_ALL_NODE_ID)}\n",
                "                onClick={() => setNodeId(LIBRARY_ALL_NODE_ID)}\n                onKeyDown={preventRepeatedEnterKeyDown}\n")
    s = once(s, "                        onClick={() => toggleCollection(entry.id)}\n",
                "                        onClick={() => toggleCollection(entry.id)}\n                        onKeyDown={preventRepeatedEnterKeyDown}\n")
    s = once(s, "                        onClick={() => setNodeId(entry.id)}\n",
                "                        onClick={() => setNodeId(entry.id)}\n                        onKeyDown={preventRepeatedEnterKeyDown}\n")
    s = once(s, "                            onClick={() => setNodeId(folder.id)}\n",
                "                            onClick={() => setNodeId(folder.id)}\n                            onKeyDown={preventRepeatedEnterKeyDown}\n")
    return add_import(s)
edit('ArrangementLibrary.tsx', library)

def dock(s):
    s = once(s, "            onClick={() => onVideoExpandedChange(false)}\n            aria-label={VIDEO_RETURN_LABEL}\n",
                "            onClick={() => onVideoExpandedChange(false)}\n            onKeyDown={preventRepeatedEnterKeyDown}\n            aria-label={VIDEO_RETURN_LABEL}\n")
    s = once(s, "            onClick={() => onVideoExpandedChange(!isVideoExpanded)}\n",
                "            onClick={() => onVideoExpandedChange(!isVideoExpanded)}\n            onKeyDown={preventRepeatedEnterKeyDown}\n")
    s = once(s, "              onClick={() => onVideoExpandedChange(false)}\n              aria-label={studioVideoDockStrings.closeLabel}\n",
                "              onClick={() => onVideoExpandedChange(false)}\n              onKeyDown={preventRepeatedEnterKeyDown}\n              aria-label={studioVideoDockStrings.closeLabel}\n")
    return add_import(s)
edit('ArrangementVideoDock.tsx', dock)

def workspace(s):
    s = once(s, "                      onClick={toggleSnap}\n", "                      onClick={toggleSnap}\n                      onKeyDown={preventRepeatedEnterKeyDown}\n")
    s = once(s, "                      onClick={toggleEnvelopeMode}\n", "                      onClick={toggleEnvelopeMode}\n                      onKeyDown={preventRepeatedEnterKeyDown}\n")
    return add_import(s)
edit('StudioWorkspace.tsx', workspace)
print('sketch ok')
