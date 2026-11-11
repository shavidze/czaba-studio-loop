p = 'app/components/product/PurchaseHeader.tsx'
s = open(p).read()
o = "      }`}\n    >"
assert s.count(o) == 1
s = s.replace(o, "      } ${justAdded ? 'shadow-[0_0_20px_rgba(var(--color-brand-rgb),0.3)]' : ''}`}\n    >")
open(p, 'w').write(s)
