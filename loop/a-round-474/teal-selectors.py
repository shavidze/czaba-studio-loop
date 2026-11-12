import re,sys
css=open(sys.argv[1]).read()
sels=set()
for m in re.finditer(r'([^{}]+)\{',css):
    for s in m.group(1).split(','):
        if re.search(r'teal|cyan|13d9cc',s,re.I) and s.strip().startswith('.'): sels.add(s.strip())
print('\n'.join(sorted(sels)))
