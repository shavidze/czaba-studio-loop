import sys
p, a, b = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(p).read()
assert s.count(a) == 1, ('pattern count', s.count(a))
open(p, 'w').write(s.replace(a, b))
