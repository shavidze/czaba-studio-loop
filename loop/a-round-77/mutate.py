import sys
p, a, b = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(p, encoding='utf-8').read()
assert s.count(a) == 1, (p, a, s.count(a))
open(p, 'w', encoding='utf-8', newline='').write(s.replace(a, b))
