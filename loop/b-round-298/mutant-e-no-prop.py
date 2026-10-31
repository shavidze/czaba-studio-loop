import sys
p = sys.argv[1] + '/app/routes/studio-lab.tsx'
s = open(p).read()
old = "          initialSelectedSourceId={previewSourceId}\n"
assert s.count(old) == 1, 'anchor'
open(p, 'w').write(s.replace(old, '', 1)); print('mutant e applied')
