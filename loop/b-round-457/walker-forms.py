# usage: python3 -I walker-forms.py <store-root>; counts the walker's limit forms in non-test app scripts (read-only)
import os, re, sys
root = os.path.join(sys.argv[1], 'app')
files = []
for d, _, fs in os.walk(root):
    if '__tests__' in d.split(os.sep):
        continue
    files += [os.path.join(d, f) for f in fs if f.endswith(('.ts', '.tsx'))]
brace_comment = dir_form = dot_spec = regex_star = 0
hits = []
for p in sorted(files):
    s = open(p, encoding='utf-8').read()
    rel = os.path.relpath(p, root)
    for m in re.finditer(r'\b(?:import|export)\b[^;]*?\{([^{}]*)\}\s*from\s*[\'"]', s):
        if '//' in m.group(1) or '/*' in m.group(1):
            brace_comment += 1; hits.append('brace_comment ' + rel)
    for m in re.finditer(r'[\'"]((?:~/|\.\.?/)[^\'"\n]*)[\'"]', s):
        if re.search(r'(/|/index(\.(ts|tsx|js|jsx))?)$', m.group(1)):
            dir_form += 1; hits.append('dir_form ' + rel + ' ' + m.group(1))
    for m in re.finditer(r'\bfrom\s*[\'"](\.{1,2}|(?:\.\.?/)*\.\.?)[\'"]', s):
        dot_spec += 1; hits.append('dot_spec ' + rel + ' ' + m.group(1))
    if any(h == 'brace_comment ' + rel for h in hits) and re.search(r'/\*|`', re.sub(r'/\*[\s\S]*?\*/|//[^\n]*', ' ', s)):
        regex_star += 1; hits.append('brace_comment_file_with_star_or_backtick ' + rel)
print(f'files={len(files)} brace_comment={brace_comment} dir_form={dir_form} dot_spec={dot_spec} brace_comment_files_with_star_or_backtick={regex_star}')
for h in hits[:20]:
    print('  ' + h)
