import sys
p, m = sys.argv[1], sys.argv[2]
s = open(p).read()
helper_new = """function getFieldSortKey(value: FieldValue | undefined): string {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : '';
  }
  return String(value ?? '');
}"""
assert helper_new in s
uses = """        const aStr = getFieldSortKey(aVal);
        const bStr = getFieldSortKey(bVal);
        return aStr.localeCompare(bStr) * dir;"""
assert uses in s
if m == 'M1':
    s = s.replace(uses, """        const aStr = Array.isArray(aVal) ? (aVal[0] ?? '') : String(aVal ?? '');
        const bStr = Array.isArray(bVal) ? (bVal[0] ?? '') : String(bVal ?? '');
        return aStr.localeCompare(bStr) * dir;""")
elif m == 'M2':
    s = s.replace("return typeof value[0] === 'string' ? value[0] : '';", "return String(value[0] ?? '');")
elif m == 'M3':
    s = s.replace(uses, """        if (typeof aVal === 'number' || typeof bVal === 'number') {
          return 0;
        }
""" + uses)
elif m == 'M4':
    s = s.replace("return typeof value[0] === 'string' ? value[0] : '';", "const found = value.find((v) => typeof v === 'string'); return typeof found === 'string' ? found : '';")
elif m == 'M5':
    s = s.replace(uses, """        try {
          const aStr = Array.isArray(aVal) ? (aVal[0] ?? '') : String(aVal ?? '');
          const bStr = Array.isArray(bVal) ? (bVal[0] ?? '') : String(bVal ?? '');
          return aStr.localeCompare(bStr) * dir;
        } catch {
          return 0;
        }""")
open(p, 'w').write(s)
