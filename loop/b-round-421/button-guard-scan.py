# Lists every JSX <button ...> opening tag in the given files and whether its own tag carries an onKeyDown
# (and whether that handler text mentions 'repeat' or preventRepeatedEnterKeyDown). Parses the whole tag (L13).
import re, sys
for path in sys.argv[1:]:
    src = open(path, encoding='utf-8').read()
    for m in re.finditer(r'<button\b', src):
        i, depth, q = m.end(), 0, None
        while i < len(src):
            c = src[i]
            if q:
                if c == q and src[i-1] != '\\': q = None
            elif c in '\'"`' and depth > 0: q = c
            elif c == '{': depth += 1
            elif c == '}': depth -= 1
            elif c == '>' and depth == 0 and src[i-1] != '=': break
            i += 1
        tag = src[m.start():i+1]
        line = src.count('\n', 0, m.start()) + 1
        kd = 'onKeyDown' in tag
        guard = kd and ('preventRepeatedEnterKeyDown' in tag or 'repeat' in tag)
        label = re.search(r'(aria-label|data-testid|title)=\{?["\']?([^"\'}\n]{0,60})', tag)
        print(f"{path}:{line}\t{'GUARD' if guard else ('KEYDOWN-NO-REPEAT' if kd else 'NONE')}\t{label.group(2) if label else '-'}")
