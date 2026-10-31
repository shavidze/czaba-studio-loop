import sys
p = sys.argv[1] + '/app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx'
s = open(p).read()
old = "    applyBrowserParsedMutedState(container);\n"
assert s.count(old) == 1, 'anchor'
open(p, 'w').write(s.replace(old, '', 1)); print('mutant r2 applied (NG9 without the jsdom muted shim)')
