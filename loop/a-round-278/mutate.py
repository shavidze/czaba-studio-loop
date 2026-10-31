import sys, pathlib
path, old, new = sys.argv[1], sys.argv[2], sys.argv[3]
p = pathlib.Path(path); s = p.read_text()
n = s.count(old)
if n < 1: sys.exit(f"pattern not found in {path}")
p.write_text(s.replace(old, new))
print(f"mutated {path}: {n} occurrence(s)")
