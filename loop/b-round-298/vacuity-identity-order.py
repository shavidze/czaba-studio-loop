import sys
p = sys.argv[1] + '/app/lib/arrangement/__tests__/studio-link-hydrate-ssr-ui.test.tsx'
s = open(p).read()
n = s.count('.reverse()')
assert n == 1, n
open(p, 'w').write(s.replace('.reverse()', '', 1)); print('vacuity: identity order in ssr file')
