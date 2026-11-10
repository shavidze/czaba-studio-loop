# Test-only delta on top of sketch v1 fc3d0b63 (tech-lead TL-R427-01/02 + row-id collision HS1/HS2 with grid-snap-ui). Run on the v1 scratch before biome --write.
import re, sys
root = sys.argv[1]
T = root + '/app/lib/arrangement/__tests__/'
def sub(name, pat, new):
    p = T + name; s = open(p, encoding='utf-8').read()
    s2, n = re.subn(pat, new, s)
    if n != 1:
        raise SystemExit(f'{name}: {n} hits for {pat[:70]!r}')
    open(p, 'w', encoding='utf-8').write(s2)
sub('shortcut-sheet-ui.test.tsx', r"\n(\s*)pressHeldEnter\(search, true\);\n", r"\n\1expect(pressHeldEnter(search, true)).toBe(true);\n")
sub('shortcut-sheet-ui.test.tsx', r"it\('HS1 ", "it('HQ1 ")
sub('shortcut-sheet-ui.test.tsx', r"it\('HS2 ", "it('HQ2 ")
sub('export-cancel-ui.test.tsx', r"it\('HX1 held Enter on the Export button starts one render; the repeats are prevented',",
    "it('HX1 a repeated Enter that reaches the Export button before a fresh press is prevented; the fresh Enter starts one render and disables the button',")
sub('export-cancel-ui.test.tsx', r"(\n\s*)expect\(controls\)\.toHaveLength\(1\);\n\s*for \(let held = 0; held < 3; held\+\+\) \{\n\s*await act\(async \(\) => \{\n\s*expect\(pressHeldEnter\(primary, true\)\)\.toBe\(false\);\n\s*await Promise\.resolve\(\);\n\s*\}\);\n\s*\}\n\s*expect\(controls\)\.toHaveLength\(1\);\n",
    r"\1expect(controls).toHaveLength(1);\1expect(primary.disabled).toBe(true);\n")
print('ok')
