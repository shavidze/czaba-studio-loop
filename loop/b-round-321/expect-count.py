import sys, os, re
store = sys.argv[1] if len(sys.argv) > 1 else '/home/runner/czaba-project/store'
lst = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'selection-test-files.txt')
total = 0
for rel in open(lst).read().split():
    p = os.path.join(store, rel)
    n = len(re.findall(r'\bexpect\(', open(p, encoding='utf-8').read())) if os.path.exists(p) else -1
    total += max(n, 0)
    print(f'{n}\t{rel}')
print(f'TOTAL\t{total}')
