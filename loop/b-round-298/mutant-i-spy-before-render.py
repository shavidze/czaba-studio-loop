import sys
p = sys.argv[1] + '/app/lib/arrangement/__tests__/studio-link-hydrate-ssr-ui.test.tsx'
s = open(p).read()
a = "      const container = mountServerHtml();\n"
b = "      const consoleError = vi.spyOn(console, 'error');\n"
assert s.count(a) == 1 and s.count(b) == 1, 'anchor'
s = s.replace(b, '', 1).replace(a, b + a, 1)
open(p, 'w').write(s); print('mutant i applied (spy before renderToString)')
