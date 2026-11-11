p = 'app/routes/store.tsx'
s = open(p).read()
o = "      </div>\n    </Link>\n  );\n}"
assert s.count(o) == 1
s = s.replace(o, "      </div>\n      <div\n        className=\"absolute inset-0 rounded-xl pointer-events-none\"\n        style={{ boxShadow: `0 0 40px ${BRAND_COLOR}25`, opacity: isHovered ? 1 : 0 }}\n      />\n    </Link>\n  );\n}")
open(p, 'w').write(s)
