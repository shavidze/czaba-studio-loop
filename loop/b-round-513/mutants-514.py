# Round 514 mutants. Usage: python3 -I mutants-514.py <tree-with-sketch-applied> <logdir>
# Each mutant edits CookieConsent.tsx in the given tree, runs the test file, records red rows, restores the file.
import json, os, re, subprocess, sys
tree, logdir = sys.argv[1], sys.argv[2]
os.makedirs(logdir, exist_ok=True)
P = os.path.join(tree, 'app/components/common/CookieConsent.tsx')
T = 'app/components/common/__tests__/CookieConsent.test.tsx'
orig = open(P, encoding='utf-8').read()
CALL = '    focusAfterCookieDismiss(bannerRef.current, focusBeforeBannerRef.current, event.detail === 0);\n'
M = {
    'M1-decline-no-focus': lambda s: s.replace('    setAnalyticsConsent(false);\n' + CALL, '    setAnalyticsConsent(false);\n'),
    'M2-accept-no-focus': lambda s: s.replace('    setAnalyticsConsent(true);\n' + CALL, '    setAnalyticsConsent(true);\n'),
    'M3-pointer-no-preventScroll': lambda s: s.replace('candidate.focus({ preventScroll: true });', 'candidate.focus();'),
    'M4-keyboard-preventScroll': lambda s: s.replace('    if (fromKeyboard) {\n      candidate.focus();', '    if (fromKeyboard) {\n      candidate.focus({ preventScroll: true });'),
    'M5-no-previous-tracking': lambda s: s.replace('      onFocus={handleBannerFocus}\n', ''),
    'M6-no-overwrite-with-null': lambda s: s.replace('focusBeforeBannerRef.current = from instanceof HTMLElement ? from : null;', 'if (from instanceof HTMLElement) focusBeforeBannerRef.current = from;'),
    'M7-inside-moves-overwrite': lambda s: s.replace('    if (from instanceof Node && event.currentTarget.contains(from)) return;\n', ''),
    'M9-no-element-skip': lambda s: s.replace('    if (!(candidate instanceof HTMLElement)) continue;\n', '    if (candidate === undefined) continue;\n'),
    'M15-no-outside-active-guard': lambda s: s.replace('  if (active && active !== document.body && !banner?.contains(active)) return;\n', ''),
    'M8-no-landed-check': lambda s: s.replace('    if (document.activeElement === candidate) return;', '    return;'),
    'M10-no-logo-selector': lambda s: s.replace("  'header a[href=\"/\"]',\n", ''),
    'M11-no-generic-fallback': lambda s: s.replace("  'header a[href], header button',\n", ''),
    'M12-detail-ignored': lambda s: s.replace('event.detail === 0', 'true'),
    'M13-close-sm': lambda s: s.replace('size="md"\n          label="Close"', 'size="sm"\n          label="Close"'),
    'M14-x-16': lambda s: s.replace('<X size={20} />', '<X size={16} />'),
}
summary = {}
for name, fn in M.items():
    mutated = fn(orig)
    if mutated == orig:
        summary[name] = {'error': 'mutant did not change the file'}
        continue
    open(P, 'w', encoding='utf-8').write(mutated)
    r = subprocess.run(['npx', 'vitest', 'run', '--reporter=verbose', T], cwd=tree, capture_output=True, text=True)
    out = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
    open(os.path.join(logdir, name + '.log'), 'w', encoding='utf-8').write(out)
    red = sorted(set(m.group(1).strip() for m in re.finditer(r'^\s*×.*? > ((?:R514-F\d|N3-\d|CC\w+)[^>\n]*?)(?:\s+\d+ms)?\s*$', out, re.M)))
    summary[name] = {'rc': r.returncode, 'red': red}
open(P, 'w', encoding='utf-8').write(orig)
json.dump(summary, open(os.path.join(logdir, 'mutants-summary.json'), 'w'), indent=1)
print(json.dumps({k: (v.get('rc'), len(v.get('red', [])), v.get('error')) for k, v in summary.items()}))
