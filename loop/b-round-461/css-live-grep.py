# usage: python3 -I css-live-grep.py <store root>   -> whole-token hits of the 12 removed utilities in live app source (tests excluded)
import os, re, sys
R = sys.argv[1]
classes = ['h-[400px]','hover:bg-foreground/20','left-[15%]','md:group-hover:opacity-100','md:opacity-0','opacity-30','opacity-[0.03]','origin-top','right-[15%]','shadow-teal-500/50','w-[1px]','w-[3px]']
files = []
for d, _, fs in os.walk(os.path.join(R, 'app')):
    if '__tests__' in d: continue
    files += [os.path.join(d, f) for f in fs if f.endswith(('.ts', '.tsx', '.css'))]
print('whole-token hits (start/space/quote/backtick before, not a variant colon) in live app source, tests excluded')
for c in classes:
    pat = re.compile(r'(?:^|[\s\'"`])' + re.escape(c) + r'(?=$|[\s\'"`])', re.M)
    hits = sorted(os.path.relpath(f, R) for f in files if pat.search(open(f, encoding='utf-8').read()))
    print(f'{c}: {len(hits)} {" ".join(hits)}'.rstrip())
