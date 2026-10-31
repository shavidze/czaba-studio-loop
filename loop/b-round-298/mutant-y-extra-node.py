import sys
p = sys.argv[1] + '/app/components/arrangement/ArrangementLibrary.tsx'
s = open(p).read()
old = "      data-source-id={source.id}\n    >"
assert s.count(old) == 1, 'anchor'
s = s.replace(old, "      data-source-id={source.id}\n    >\n      {document.body.childElementCount > 0 ? null : <span data-probe=\"detached\" />}", 1)
open(p, 'w').write(s)
print('mutant y applied (server-only extra node)')
