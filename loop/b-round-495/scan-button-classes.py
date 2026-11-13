import re,sys,pathlib
root=pathlib.Path(sys.argv[1]); 
pat=re.compile(r'(?<![\w-])(btn-[a-z][\w-]*|button(?:-(?:primary|secondary))?)(?![\w-])')
ctx=re.compile(r'className|class=|cn\(|clsx\(|classes|Class\b|`')
hits=[]
for p in sorted(root.rglob('*')):
    if p.suffix not in ('.tsx','.ts','.js','.jsx','.mjs') or '__tests__' in p.parts: continue
    for i,l in enumerate(p.read_text(errors='ignore').splitlines(),1):
        for m in pat.finditer(l):
            tok=m.group(1)
            if tok=='button':
                # bare word: only inside a class string (quote-delimited list of classes)
                if not re.search(r'''(className\s*=\s*\{?\s*["'`]|cn\(|clsx\()[^"'`]*["'`]?[^"'`]*(?<![\w-])button(?![\w-])''', l): continue
                if re.search(r'type=["\']button', l) and not re.search(r'''className=["'`][^"'`]*(?<![\w-])button(?![\w-])''', l): continue
            hits.append(f'{p.relative_to(root.parent)}:{i}:{tok}')
print('\n'.join(hits)); print('TOTAL',len(hits))
