import sys
p = sys.argv[1] + '/app/components/arrangement/ArrangementVideoDock.tsx'
s = open(p).read()
old = '          data-video-role="standby"\n'
assert s.count(old) == 1, 'anchor'
s = s.replace(old, old + "          data-probe={document.body.childElementCount > 0 ? undefined : 'detached'}\n", 1)
open(p, 'w').write(s); print('mutant v applied (server-only attribute on the standby <video>, after the library in tree order)')
