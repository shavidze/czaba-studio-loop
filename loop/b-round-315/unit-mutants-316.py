import os
import re
import shutil
import subprocess
import sys

scratch = sys.argv[1]
TESTS = [
    'app/lib/__tests__/self-hosted-fonts.test.ts',
    'app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx',
]
ROOT = 'app/root.tsx'
APP_CSS = 'app/styles/app.css'
FONTS_CSS = 'app/assets/fonts/fonts.css'
LAB = 'app/routes/studio-lab.tsx'
INTER_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');\n"


def p(rel):
    return os.path.join(scratch, rel)


def read(rel):
    with open(p(rel), encoding='utf-8') as f:
        return f.read()


def write(rel, text):
    with open(p(rel), 'w', encoding='utf-8') as f:
        f.write(text)


def sub_once(rel, old, new):
    text = read(rel)
    assert text.count(old) == 1, (rel, old)
    write(rel, text.replace(old, new))


def drop_first_face():
    text = read(FONTS_CSS)
    write(FONTS_CSS, re.sub(r'@font-face \{[^}]*\}\n', '', text, count=1))


def append_byte():
    with open(p('app/assets/fonts/inter-latin.woff2'), 'ab') as f:
        f.write(b'\0')


MUTANTS = [
    ('MU-GOOGLE-LINK-BACK', lambda: sub_once(ROOT, "  { rel: 'stylesheet', href: fontStyles },", "  { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Playfair+Display' },\n  { rel: 'stylesheet', href: fontStyles },")),
    ('MU-INTER-IMPORT-BACK', lambda: write(APP_CSS, INTER_IMPORT + read(APP_CSS))),
    ('MU-SIDE-EFFECT-IMPORT', lambda: sub_once(ROOT, "import fontStyles from './assets/fonts/fonts.css?url';", "import fontStyles from './assets/fonts/fonts.css?url';\nimport './assets/fonts/fonts.css';")),
    ('MU-ROOT-ORDER', lambda: sub_once(ROOT, "  { rel: 'stylesheet', href: fontStyles },\n  { rel: 'stylesheet', href: appStyles },", "  { rel: 'stylesheet', href: appStyles },\n  { rel: 'stylesheet', href: fontStyles },")),
    ('MU-DROP-FACE', drop_first_face),
    ('MU-SWAP-BLOCK', lambda: write(FONTS_CSS, read(FONTS_CSS).replace('font-display: swap;', 'font-display: block;', 1))),
    ('MU-DELETE-WOFF2', lambda: os.remove(p('app/assets/fonts/inter-greek.woff2'))),
    ('MU-ALTER-BYTE', append_byte),
    ('MU-RENAME-FAMILY', lambda: write(FONTS_CSS, read(FONTS_CSS).replace("font-family: 'Instrument Sans';", "font-family: 'Instrument Sans Local';"))),
    ('MU-LICENSE-MISSING', lambda: os.remove(p('app/assets/fonts/licenses/OFL-inter.txt'))),
    ('MU-PRELOAD-NO-CORS', lambda: sub_once(LAB, "    href: instrumentSansLatinFont,\n    as: 'font',\n    type: 'font/woff2',\n    crossOrigin: 'anonymous',", "    href: instrumentSansLatinFont,\n    as: 'font',\n    type: 'font/woff2',")),
    ('MU-PRELOAD-WRONG-FILE', lambda: sub_once(LAB, "import ibmPlexMonoLatinFont from '~/assets/fonts/ibm-plex-mono-latin.woff2?url';", "import ibmPlexMonoLatinFont from '~/assets/fonts/ibm-plex-mono-latin-ext.woff2?url';")),
]

BACKUP = os.path.join(scratch, '.mutant-backup')


def snapshot():
    if os.path.exists(BACKUP):
        shutil.rmtree(BACKUP)
    os.makedirs(BACKUP)
    for rel in [ROOT, APP_CSS, LAB]:
        shutil.copy2(p(rel), os.path.join(BACKUP, rel.replace('/', '__')))
    shutil.copytree(p('app/assets/fonts'), os.path.join(BACKUP, 'fonts'))


def restore():
    for rel in [ROOT, APP_CSS, LAB]:
        shutil.copy2(os.path.join(BACKUP, rel.replace('/', '__')), p(rel))
    shutil.rmtree(p('app/assets/fonts'))
    shutil.copytree(os.path.join(BACKUP, 'fonts'), p('app/assets/fonts'))


def run():
    out = subprocess.run(['npx', 'vitest', 'run', *TESTS], cwd=scratch, capture_output=True, text=True, timeout=600)
    text = re.sub(r'\x1b\[[0-9;]*m', '', out.stdout + out.stderr)
    red = sorted(set(re.findall(r'(?:×|FAIL).*?> ((?:FN|TH)\d+):', text)))
    passed = re.search(r'Tests\s+(.*)', text)
    return red, (passed.group(1).strip() if passed else '?')


snapshot()
try:
    for name, mutate in MUTANTS:
        mutate()
        red, summary = run()
        print(f"{name}: {'red ' + ','.join(red) if red else 'GREEN (survived)'}")
        restore()
finally:
    restore()
red, summary = run()
print(f"restored: {summary}")
shutil.rmtree(BACKUP)
