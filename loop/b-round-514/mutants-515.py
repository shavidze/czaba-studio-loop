import subprocess, sys, json, os, shutil
root = sys.argv[1]; out = sys.argv[2]; os.makedirs(out, exist_ok=True)
P = os.path.join(root, 'app/components/common/CookieConsent.tsx')
T = 'app/components/common/__tests__/CookieConsent.test.tsx'
orig = open(P).read()
M = {
 'M1-no-skip': ("    skipPrevious ? null : previous,", "    previous,"),
 'M2-skip-keyboard-too': ("const skipPrevious = !fromKeyboard && previous", "const skipPrevious = previous"),
 'M3-no-onblur': ("      onBlur={handleBannerBlur}\n", ""),
 'M4-blur-always-clears': ("    if (to instanceof Node && event.currentTarget.contains(to)) return;\n", ""),
 'M5-no-header-button': ("'header a[href], header button'", "'header a[href]'"),
 'M6-no-textarea': ("  'textarea',\n", ""),
 'M7-skip-select-too': ("  'textarea',\n", "  'textarea',\n  'select',\n"),
 'M8-no-contenteditable': ("  '[contenteditable]:not([contenteditable=\"false\"])',\n", ""),
 'M9-checkbox-skipped': (":not([type=\"checkbox\"])", ""),
 'M10-no-text-input': ("  'input:not(", "  'x-none:not("),
 'M11-contenteditable-false-skipped': ("  '[contenteditable]:not([contenteditable=\"false\"])',\n", "  '[contenteditable]',\n"),
}
summary = {}
for name, (a, b) in M.items():
    assert orig.count(a) >= 1, name
    open(P, 'w').write(orig.replace(a, b))
    r = subprocess.run(['npx', 'vitest', 'run', T], cwd=root, capture_output=True, text=True, env={**os.environ, 'NO_COLOR': '1', 'FORCE_COLOR': '0'})
    log = r.stdout + r.stderr
    open(os.path.join(out, name + '.log'), 'w').write(log)
    import re
    clean = re.sub(r'\x1b\[[0-9;]*m', '', log)
    failed = sorted({m.group(1) for m in re.finditer(r'(?:×|FAIL)[^\n]*?(R51[45]-[A-Z]\d)', clean)})
    summary[name] = {'rc': r.returncode, 'red': r.returncode != 0, 'failedRows': failed}
    print(name, r.returncode, failed, flush=True)
open(P, 'w').write(orig)
json.dump(summary, open(os.path.join(out, 'mutants-summary.json'), 'w'), indent=1)
