import sys, re
p = sys.argv[1]; dep = sys.argv[2]; starts = [int(x) for x in sys.argv[3:]]
s = open(p, encoding='utf-8').read()
lines = s.split('\n')
offsets = [0]
for l in lines: offsets.append(offsets[-1] + len(l) + 1)
edits = []
for st in starts:
    i = offsets[st-1]
    m = re.compile(r'use(Callback|Effect|LayoutEffect|IsomorphicLayoutEffect|Memo)\(').search(s, i)
    j = m.end()  # after '('
    depth = 1; k = j; last_top_arr = None; arr_start = None
    while depth > 0:
        c = s[k]
        if c in '([{':
            if depth == 1 and c == '[': arr_start = k
            depth += 1
        elif c in ')]}':
            depth -= 1
            if depth == 1 and c == ']': last_top_arr = (arr_start, k)
        elif c in '\'"`':
            q = c; k += 1
            while s[k] != q:
                if s[k] == '\\': k += 1
                k += 1
        k += 1
    a, b = last_top_arr
    edits.append((a, b))
for a, b in sorted(edits, reverse=True):
    inner = s[a+1:b]
    items = [x.strip() for x in inner.split(',') if x.strip()]
    assert dep not in items
    items.append(dep); items.sort(key=str.lower)
    s = s[:a+1] + ', '.join(items) + s[b:]
open(p, 'w', encoding='utf-8').write(s)
print('ok', len(edits))
