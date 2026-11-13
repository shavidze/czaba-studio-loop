# B round 484->485: L58 mutants on the CLIENT-NAV sketch. Run from the scratch root: python3 -I <this> <out-dir>
import subprocess, sys, os, shutil
out = sys.argv[1]
RT = 'app/components/animations/RouteTransition.tsx'
RN = 'app/lib/route-name.ts'
T_RN = 'app/lib/__tests__/route-name.test.ts'
LF = 'app/lib/link-focus.ts'
T_RT = 'app/components/animations/__tests__/route-transition.test.tsx'
T_LF = 'app/lib/__tests__/link-focus.test.tsx'
M = [
 ('M1-no-frame', RT, '    const frame = requestAnimationFrame(() => {\n', '    const frame = 0;\n    (() => {\n', T_RT, 'RA2'),
 ('M2-no-h1-fallback', RN, "  const heading = doc.querySelector('.page-transition-wrapper h1');", "  const heading = doc.querySelector('.no-such-wrapper h1');", T_RT, 'RA9'),
 ('M2b-h1-anywhere', RN, "  const heading = doc.querySelector('.page-transition-wrapper h1');", "  const heading = doc.querySelector('h1');", T_RN, 'RN2'),
 ('M11-region-remount', RT, "      <>\n        <RouteAnnouncer message={announcement} />\n        <div key", "      <>\n        <RouteAnnouncer key=\"studio\" message={announcement} />\n        <div key", T_RT, 'RA6'),
 ('M3-no-repeat-mark', RT, "name !== '' && previous === name ? `${name}${REPEAT_MARK}` : name", 'name', T_RT, 'RA4'),
 ('M4-no-same-path-guard', RT, '    if (announcedPathRef.current === pathname) return;\n', '', T_RT, 'RA8'),
 ('M5-no-cancel', RT, '    return () => cancelAnimationFrame(frame);\n', '', T_RT, 'RA7'),
 ('M6-no-finally', LF, '  try {\n    body.focus({ preventScroll: true });\n  } finally {\n    if (!hadTabIndex) body.removeAttribute(\'tabindex\');\n  }', '  body.focus({ preventScroll: true });\n  if (!hadTabIndex) body.removeAttribute(\'tabindex\');', T_LF, 'LF7'),
 ('M7-no-same-document', LF, '  if (!opensInSameDocument(anchor)) return;\n', '', T_LF, 'LF5'),
 ('M8-no-defaultPrevented', LF, '    !event.defaultPrevented &&\n', '', T_LF, 'LF4'),
 ('M9-announce-first-render', RT, '      announcedPathRef.current = pathname;\n      return;\n', '      announcedPathRef.current = \'\';\n', T_RT, 'RA1'),
 ('M10-studio-no-region', RT, '      <>\n        <RouteAnnouncer message={announcement} />\n        <div key', '      <>\n        <div key', T_RT, 'RA6'),
]
if os.path.realpath(os.getcwd()) == '/home/runner/czaba-project/store' or not os.path.isfile('app/lib/route-name.ts'):
    sys.exit('refusing: run only from a sketch-applied scratch copy, never from store/')
os.makedirs(out, exist_ok=True)
summary = []
for mid, f, old, new, test, row in M:
    src = open(f).read()
    if src.count(old) != 1:
        summary.append(f'{mid} PATTERN-COUNT {src.count(old)}'); continue
    shutil.copy(f, f + '.orig')
    open(f, 'w').write(src.replace(old, new))
    r = subprocess.run(['npx', 'vitest', 'run', test], capture_output=True, text=True)
    shutil.move(f + '.orig', f)
    log = r.stdout + r.stderr
    open(os.path.join(out, f'mutant-{mid}.log'), 'w').write(log)
    failed = [l.strip() for l in log.splitlines() if (' ×' in l or '✗' in l or 'FAIL' in l) and ('RA' in l or 'LF' in l)]
    red = any(row + ' ' in l for l in failed)
    summary.append(f'{mid} rc={r.returncode} expected-red={row} red={red} failing={[l[:90] for l in failed][:4]}')
open(os.path.join(out, 'mutants-summary.txt'), 'w').write('\n'.join(summary) + '\n')
print('\n'.join(summary))
