# Round 433 mutants (SABA-B-12 stage 3). usage: python3 -I run.py <base dir = HEAD + sketch-433 applied, node_modules linked> <out dir>
# Writes <out>/<name>.log and <out>/summary.txt; restores the sheet file after every mutant.
import os, re, subprocess, sys
base, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
F = os.path.join(base, 'app/components/arrangement/ArrangementShortcutSheet.tsx')
TESTS = ['app/lib/arrangement/__tests__/shortcut-sheet-ui.test.tsx', 'app/lib/arrangement/__tests__/studio-search-field.test.ts']
good = open(F, encoding='utf-8').read()
head = subprocess.run(['git', '-C', '/home/runner/czaba-project/store', 'show', '1a417fb:app/components/arrangement/ArrangementShortcutSheet.tsx'], capture_output=True, text=True, check=True).stdout
CANCEL = ' [&::-webkit-search-cancel-button]:hidden'
R = [
 ('M1-head-component', None),
 ('M2-native-cancel-shown', [(CANCEL, '')]),
 ('M3-no-refocus', [("    setQuery('');\n    searchRef.current?.focus();", "    setQuery('');")]),
 ('M4-no-held-enter-guard', [("onClick={clearShortcutSearch}\n              onKeyDown={preventRepeatedEnterKeyDown}", "onClick={clearShortcutSearch}")]),
 ('M5-trim-hides-spaces', [("{query ? (", "{query.trim() ? (")]),
 ('M6-not-in-tab-order', [('type="button"\n              onClick={clearShortcutSearch}', 'type="button"\n              tabIndex={-1}\n              onClick={clearShortcutSearch}')]),
 ('M7-library-hadfocus-guard', [("  const clearShortcutSearch = () => {\n    setQuery('');\n    searchRef.current?.focus();", "  const clearShortcutSearch = (event: { currentTarget: EventTarget }) => {\n    const hadFocus = document.activeElement === event.currentTarget;\n    setQuery('');\n    if (hadFocus) {\n      searchRef.current?.focus();\n    }")]),
 ('M8-type-brace-search-unhidden', [('type="search"\n            value={query}', "type={'search'}\n            value={query}"), (CANCEL, '')]),
 ('sketch-green', []),
]
ansi = re.compile(r'\x1b\[[0-9;]*m')
lines = []
try:
    for name, reps in R:
        src = head if reps is None else good
        for o, n in (reps or []):
            assert src.count(o) == 1, (name, o[:40])
            src = src.replace(o, n)
        open(F, 'w', encoding='utf-8').write(src)
        p = subprocess.run(['npx', 'vitest', 'run', *TESTS], cwd=base, capture_output=True, text=True)
        log = ansi.sub('', p.stdout + p.stderr)
        open(os.path.join(out, name + '.log'), 'w', encoding='utf-8').write(log)
        red = sorted({m for l in log.splitlines() if re.match(r'^\s*×', l) for m in re.findall(r'\b(SC[0-9]|SF[0-9]|SS[0-9]+|HQ[0-9])\b', l)})
        tot = next((re.sub(r'\s*\(.*', '', l).strip() for l in log.splitlines() if re.match(r'^\s+Tests ', l)), 'no-tests-line')
        lines.append(f"{name} red: {' '.join(red) if red else 'none'} | {tot}")
finally:
    open(F, 'w', encoding='utf-8').write(good)
open(os.path.join(out, 'summary.txt'), 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print('\n'.join(lines))
