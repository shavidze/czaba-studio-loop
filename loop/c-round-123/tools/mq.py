import sys,re
f=open(sys.argv[1],encoding='utf8').read()
s=re.split(r'(?<=[.!?])(?=[A-Z0-9])|(?<=\.)\s+',f)
for pat in sys.argv[2:]:
  print('=== ',pat)
  for x in s:
    if re.search(pat,x,re.I): print('-',x.strip()[:400])
