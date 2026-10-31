import sys
p = sys.argv[1] + '/app/components/arrangement/ArrangementLibrary.tsx'
s = open(p).read()
old = "      data-source-id={source.id}\n    >"
assert s.count(old) == 1, 'anchor'
s = s.replace(old, "      data-source-id={source.id}\n      data-probe={document.body.childElementCount > 0 ? 'mounted' : 'detached'}\n    >", 1)
open(p, 'w').write(s)
print('mutant h applied')
