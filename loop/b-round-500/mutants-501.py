# usage: python3 -I mutants-501.py <tree-with-sketch-applied> <logdir>
# Each mutant edits one file in <tree> (a COPY, never store/), runs the two stage tests, records failing rows, restores.
import json, os, subprocess, sys
tree, logdir = sys.argv[1], sys.argv[2]
os.makedirs(logdir, exist_ok=True)
FD = 'app/routes/free-downloads.tsx'; NL = 'app/components/home/NewsletterSection.tsx'; HU = 'app/routes/hire-us.tsx'
TESTS = ['app/lib/__tests__/store-button-cleanup-2b2.test.tsx', 'app/lib/__tests__/store-theme-tokens.test.ts']
FD_OPEN = '              <Button\n                type="button"\n                size="lg"\n                shape="pill"\n                aria-expanded={isExpanded}\n'
NL_OPEN = '<Button type="submit" size="lg" disabled={isSubmitting} className="h-14">'
HU_OPEN = '<Button type="submit" size="lg" fullWidth disabled={isSubmitting}>'
HU_SPIN = '<Loader2 size={18} className="animate-spin motion-reduce:animate-none" />\n                  <span>Sending...</span>'
NL_SPIN = '<Loader2 size={18} className="animate-spin motion-reduce:animate-none" />\n                  <span>Subscribing...</span>'
MUTANTS = [
  ('M1', FD, '                shape="pill"\n                aria-expanded', '                aria-expanded'),
  ('M2', FD, FD_OPEN, FD_OPEN.replace('                type="button"\n', '')),
  ('M3', FD, '                aria-expanded={isExpanded}\n', ''),
  ('M4', FD, FD_OPEN, FD_OPEN.replace('size="lg"', 'size="md"')),
  ('M5', FD, 'onClick={() => setIsExpanded(!isExpanded)}', 'onClick={() => setIsExpanded(true)}'),
  ('M6', NL, NL_OPEN, NL_OPEN.replace(' className="h-14"', '')),
  ('M7', NL, NL_OPEN, NL_OPEN.replace(' disabled={isSubmitting}', '')),
  ('M8', NL, NL_OPEN, NL_OPEN.replace('size="lg"', 'size="lg" shape="pill"')),
  ('M9', NL, NL_SPIN, NL_SPIN.replace(' motion-reduce:animate-none', '')),
  ('M10', NL, NL_OPEN, NL_OPEN.replace('type="submit"', 'type="button"')),
  ('M11', NL, NL_OPEN, NL_OPEN.replace('disabled={isSubmitting}', 'isLoading={isSubmitting}')),
  ('M12', HU, HU_OPEN, HU_OPEN.replace(' fullWidth', '')),
  ('M13', HU, HU_SPIN, '<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />\n                  <span>Sending...</span>'),
  ('M14', HU, HU_OPEN, HU_OPEN.replace(' disabled={isSubmitting}', '')),
  ('M15', HU, HU_OPEN, HU_OPEN.replace('size="lg"', 'variant="secondary" size="lg"')),
  ('M16', HU, HU_OPEN, '<button\n              type="submit"\n              disabled={isSubmitting}\n              className="w-full py-4 bg-brand hover:bg-brand/90 text-brand-foreground font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"\n            >'),
  ('M17', NL, NL_OPEN, '<button type="submit" disabled={isSubmitting} className="h-14 bg-brand px-8">'),
  ('M18', HU, HU_OPEN, '<Button type="submit" size="lg" fullWidth disabled={isSubmitting} className="bg-brand text-foreground">'),
  ('M19', HU, HU_SPIN, HU_SPIN.replace(' className="animate-spin motion-reduce:animate-none"', '')),
  ('M20', FD, FD_OPEN + '                onClick={() => setIsExpanded(!isExpanded)}\n              >', '              <button\n                onClick={() => setIsExpanded(!isExpanded)}\n                className="px-6 py-3 bg-brand hover:bg-brand/90 text-background font-medium rounded-full transition-colors flex items-center gap-2 cursor-pointer"\n              >'),
  ('M26', HU, '<Send size={18} />', '<Mail size={18} />'),
  ('M27', HU, '<Send size={18} />\n                  <span>Send Message</span>', '<span>Send Message</span>\n                  <Send size={18} />'),
  ('M28', FD, '<Download size={18} />\n                <span>Download</span>', '<span>Download</span>\n                <Download size={18} />'),
  ('M30', HU, HU_SPIN, HU_SPIN.replace('<Loader2 size={18}', '<Send size={18}')),
  ('M31', HU, '<p className="text-center text-dim text-sm">We typically respond within 24 hours.</p>', '<p className="text-center text-dim text-sm bg-brand">We typically respond within 24 hours.</p>'),
]
results = []
for mid, rel, old, new in MUTANTS:
    path = os.path.join(tree, rel)
    src = open(path).read()
    if src.count(old) != 1:
        results.append((mid, 'APPLY-FAILED', [])); continue
    mutated = src.replace(old, new)
    if mid == 'M20':
        mutated = mutated.replace('                <span>Download</span>\n              </Button>', '                <span>Download</span>\n              </button>')
    if mid == 'M26':
        mutated = mutated.replace("import { Check, Film, Gamepad2, Loader2, Mic, Music, Send } from 'lucide-react';", "import { Check, Film, Gamepad2, Loader2, Mail, Mic, Music, Send } from 'lucide-react';")
    if mid in ('M16', 'M17'):
        closing = '            </Button>\n          </fetcher.Form>' if mid == 'M17' else None
        if mid == 'M17':
            mutated = mutated.replace(closing, '            </button>\n          </fetcher.Form>')
        else:
            mutated = mutated.replace('              )}\n            </Button>\n\n            <p className="text-center', '              )}\n            </button>\n\n            <p className="text-center')
    open(path, 'w').write(mutated)
    try:
        out = os.path.join(logdir, f'mutant-{mid}.json')
        p = subprocess.run(['npx', 'vitest', 'run', '--reporter=json', f'--outputFile={out}', *TESTS], cwd=tree, capture_output=True, text=True, timeout=300)
        failed = []
        try:
            data = json.load(open(out))
            for f in data['testResults']:
                for a in f['assertionResults']:
                    if a['status'] != 'passed':
                        failed.append(a['title'].split(':')[0])
            if data.get('numFailedTestSuites'):
                failed.append(f"SUITE-FAILED x{data['numFailedTestSuites']}")
        except Exception as e:
            failed.append(f'NO-JSON {e}')
        open(os.path.join(logdir, f'mutant-{mid}.log'), 'w').write(p.stdout[-4000:] + p.stderr[-4000:])
        results.append((mid, 'RED' if failed else 'GREEN', failed))
    finally:
        open(path, 'w').write(src)
with open(os.path.join(logdir, 'summary.txt'), 'w') as fh:
    for mid, st, failed in results:
        line = f'{mid} {st} {",".join(sorted(set(failed)))}'
        print(line); fh.write(line + '\n')
