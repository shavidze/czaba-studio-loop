# Mutant runner for round 513 (N3 cookie banner). Usage: python3 -I mutants-513.py <scratch-root> <log-dir>
# Each mutant edits app/components/common/CookieConsent.tsx in the scratch copy (never the store), runs the
# CookieConsent test file, records the failing row titles, and restores the file.
import json
import os
import re
import subprocess
import sys

root, logdir = sys.argv[1], sys.argv[2]
os.makedirs(logdir, exist_ok=True)
target = os.path.join(root, 'app/components/common/CookieConsent.tsx')
test = 'app/components/common/__tests__/CookieConsent.test.tsx'
orig = open(target, encoding='utf-8').read()

ACCEPT = '<Button variant="secondary" size="sm" shape="pill" onClick={handleAccept}>'
DECLINE = '<Button variant="secondary" size="sm" shape="pill" onClick={handleDecline}>'
MUTANTS = {
    'M1-accept-primary': (ACCEPT, '<Button variant="primary" size="sm" shape="pill" onClick={handleAccept}>'),
    'M2-decline-default-shape': (DECLINE, '<Button variant="secondary" size="sm" onClick={handleDecline}>'),
    'M3-accept-md': (ACCEPT, '<Button variant="secondary" size="md" shape="pill" onClick={handleAccept}>'),
    'M4-order-swap': (
        DECLINE + '\n            Decline\n          </Button>\n          ' + ACCEPT + '\n            Accept\n          </Button>',
        ACCEPT + '\n            Accept\n          </Button>\n          ' + DECLINE + '\n            Decline\n          </Button>',
    ),
    'M5-close-accepts': ('label="Close"\n          onClick={handleDecline}', 'label="Close"\n          onClick={handleAccept}'),
    'M6-close-label': ('label="Close"', 'label="Dismiss"'),
    'M7-close-no-smhidden': ('className="absolute top-2 right-2 sm:hidden"', 'className="absolute top-2 right-2"'),
    'M8-close-icon-18': ('<X size={16} />', '<X size={18} />'),
    'M9-handlers-swap': (
        DECLINE + '\n            Decline',
        '<Button variant="secondary" size="sm" shape="pill" onClick={handleAccept}>\n            Decline',
    ),
    'M10-hand-rolled-accept': (
        ACCEPT + '\n            Accept\n          </Button>',
        '<button\n            onClick={handleAccept}\n            className="px-5 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-neutral-100 transition-colors"\n          >\n            Accept\n          </button>',
    ),
    'M11-no-pageview': ("      window.fbq('track', 'PageView');\n", ''),
    'M12-close-variant-default': ('<IconButton\n          variant="ghost"', '<IconButton\n          variant="default"'),
    'M13-decline-calls-fbq': (
        '  const handleDecline = () => {\n    setAnalyticsConsent(false);\n',
        "  const handleDecline = () => {\n    setAnalyticsConsent(false);\n    if (typeof window.fbq === 'function') {\n      window.fbq('consent', 'grant');\n    }\n",
    ),
}
summary = {}
for name, (old, new) in MUTANTS.items():
    if orig.count(old) != 1:
        summary[name] = {'error': f'anchor count {orig.count(old)}'}
        continue
    open(target, 'w', encoding='utf-8').write(orig.replace(old, new))
    try:
        p = subprocess.run(['npx', 'vitest', 'run', '--reporter=verbose', test], cwd=root, capture_output=True, text=True, timeout=600)
        out = re.sub(r'\x1b\[[0-9;]*m', '', p.stdout + p.stderr)
        open(os.path.join(logdir, f'mutant-{name}.log'), 'w', encoding='utf-8').write(out)
        red = sorted(set(m.group(1).strip() for m in re.finditer(r'^\s*[×✗] .*?> ([^>]+?)(?:\s+\d+ms)?$', out, re.M)))
        summary[name] = {'rc': p.returncode, 'red': red}
    finally:
        open(target, 'w', encoding='utf-8').write(orig)
assert open(target, encoding='utf-8').read() == orig
json.dump(summary, open(os.path.join(logdir, 'mutants-summary.json'), 'w'), indent=1, ensure_ascii=False)
print(json.dumps(summary, indent=1, ensure_ascii=False))
