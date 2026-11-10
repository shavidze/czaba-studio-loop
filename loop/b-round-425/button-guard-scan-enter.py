# Enter-specific held-key scanner (B round 425; replaces b-round-421/button-guard-scan.py, which counted any 'repeat' text,
# e.g. a Space-only fold guard, as an Enter guard). Parses each whole JSX <button ...> opening tag (L13). For onKeyDown:
# an inline arrow is read in the tag; a named handler is resolved to its `const <name> = ` / `function <name>(` body in the same file.
# ENTER-GUARD: the handler calls preventRepeatedEnterKeyDown or tests 'Enter' together with .repeat.
# Usage: python3 -I button-guard-scan-enter.py <files...>
import re, sys
def tag_end(src, i, opener='{', closer='}'):
    depth, q = 0, None
    while i < len(src):
        c = src[i]
        if q:
            if c == q and src[i-1] != '\\': q = None
        elif c in '\'"`' and depth > 0: q = c
        elif c == opener: depth += 1
        elif c == closer: depth -= 1
        elif c == '>' and depth == 0 and src[i-1] != '=': return i
        i += 1
    return i
def body_of(src, name):
    m = re.search(r'(?:const\s+' + re.escape(name) + r'\s*=|function\s+' + re.escape(name) + r'\s*\()', src)
    if not m: return None
    i = src.index('{', src.index('=>', m.end()) if '=>' in src[m.end():m.end()+400] else m.end())
    depth = 0; j = i
    while j < len(src):
        if src[j] == '{': depth += 1
        elif src[j] == '}':
            depth -= 1
            if depth == 0: return src[i:j+1]
        j += 1
    return None
def enter_guard(text):
    return 'preventRepeatedEnterKeyDown' in text or ("'Enter'" in text and 'repeat' in text)
for path in sys.argv[1:]:
    src = open(path, encoding='utf-8').read()
    for m in re.finditer(r'<button\b', src):
        e = tag_end(src, m.end()); tag = src[m.start():e+1]
        line = src.count('\n', 0, m.start()) + 1
        kd = re.search(r'onKeyDown=\{', tag)
        if not kd: cls = 'NONE'
        else:
            k = tag.index('{', kd.start()); depth = 0; j = k
            while j < len(tag):
                if tag[j] == '{': depth += 1
                elif tag[j] == '}':
                    depth -= 1
                    if depth == 0: break
                j += 1
            handler = tag[k+1:j].strip()
            if re.fullmatch(r'[A-Za-z_][A-Za-z0-9_]*', handler) and handler != 'preventRepeatedEnterKeyDown':
                b = body_of(src, handler); text = b if b else ''
                cls = 'ENTER-GUARD' if enter_guard(text) else ('KEYDOWN-NO-ENTER' if b else 'KEYDOWN-UNRESOLVED')
            else:
                cls = 'ENTER-GUARD' if enter_guard(handler) else 'KEYDOWN-NO-ENTER'
        label = re.search(r'(aria-label|data-testid|title)=\{?["\']?([^"\'}\n]{0,60})', tag)
        print(f"{path}:{line}\t{cls}\t{label.group(2) if label else '-'}")
