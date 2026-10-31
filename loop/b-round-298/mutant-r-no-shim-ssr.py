import sys
p = sys.argv[1] + '/app/lib/arrangement/__tests__/studio-link-hydrate-ssr-ui.test.tsx'
s = open(p).read()
old = "  applyBrowserParsedMutedState(container);\n"
assert s.count(old) == 1, 'anchor'
open(p, 'w').write(s.replace(old, '', 1)); print('mutant r applied (LH3 without the jsdom muted shim)')
