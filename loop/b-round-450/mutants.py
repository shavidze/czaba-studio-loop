# B round 450 mutant table for sketch 451 v4. usage: python3 -I mutants.py <id>   (run inside the clone root)
import glob, sys
H = 'app/lib/__tests__/helpers/style-scan.ts'
G = 'app/lib/__tests__/store-gradient-text.test.ts'
T = 'app/lib/__tests__/store-teal-sweep.test.ts'
IDX = 'app/routes/_index.tsx'
def rep(p, o, n):
    s = open(p).read(); assert s.count(o) == 1, (p, o, s.count(o)); open(p, 'w').write(s.replace(o, n))
def app(p, t):
    open(p, 'a').write(t)
def perf_first():
    return sorted(glob.glob('perf/**/*.ts', recursive=True))[0]
LOAD = '  -webkit-background-clip: text;\n  background-clip: text;\n  -webkit-text-fill-color: transparent;\n  letter-spacing: 0.1em;'
SUB = '\n.loading-subtitle {'
M = {
 'BASE': lambda: None,
 # HEAD pins
 'P1': lambda: rep(T, "  'components/loading/CinemaCurtainLoader.tsx': {\n    hits: 7,\n    reason: 'LEGACY-DEAD-STORE-COMPONENTS',\n  },\n", ''),
 'P2': lambda: rep(T, 'hits: 7,', 'hits: 6,'),
 'P3': lambda: app('app/components/product/ProductCard.tsx', '\nexport const TEAL_MUTANT = "text-teal-500";\n'),
 'P4': lambda: app('app/components/loading/SpotlightLoader.tsx', "\nexport const CLIP_MUTANT = { WebkitBackgroundClip: 'text' };\n"),
 'P5': lambda: app(perf_first(), '\nexport const TEAL_PERF_MUTANT = "#13d9cc";\n'),
 'P6': lambda: rep(H, '  walk(root);\n  return files.sort();', '  walk(root);\n  return files.sort().slice(0, 0);'),
 'P7': lambda: rep(G, "    hits: 3,\n    reason: 'LEGACY-DEAD-STORE-COMPONENTS (PianoLoadingAnimation", "    hits: 2,\n    reason: 'LEGACY-DEAD-STORE-COMPONENTS (PianoLoadingAnimation"),
 'P8': lambda: rep(G, "ArtistBioSection.tsx': {\n    hits: 1,", "ArtistBioSection.tsx': {\n    hits: 2,"),
 'P9': lambda: rep(H, "if (entry !== '__tests__') {", "if (entry !== '__tests__' && entry !== 'loading') {"),
 # round-448 mutants on the port
 'M1': lambda: rep('app/styles/base/utilities.css', '/* Section title utility */', '.text-glow {\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  background-clip: text;\n}\n\n/* Section title utility */'),
 'M2': lambda: rep('app/styles/app.css', '  /* ========== GRADIENTS ========== */\n', '  /* ========== GRADIENTS ========== */\n  --gradient-text: linear-gradient(135deg, red 0%, blue 100%);\n'),
 'M3': lambda: rep(IDX, '<span>Releases</span>', '<span className="text-glow">Releases</span>'),
 'M4': lambda: rep('app/styles/app.css', SUB, '\n.hero-fill-trap {\n  -webkit-text-fill-color: transparent;\n}\n' + SUB),
 'M5': lambda: rep('app/styles/app.css', LOAD, '  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  letter-spacing: 0.1em;'),
 'M6': lambda: rep('app/styles/app.css', SUB, '\n/* .x { background-clip: text; } */' + SUB),
 'M7': lambda: rep('app/components/home/VideoShowcase.tsx', '<span className="text-glow">In Action</span>', '<span>In Action</span>'),
 'M8': lambda: rep(H, "selector: selectors[selectors.length - 1] ?? ''", "selector: selectors[0] ?? ''"),
 'M9': lambda: rep('app/styles/app.css', SUB, '\n.clip-variant {\n  background-clip : padding-box, text;\n}\n' + SUB),
 'M10': lambda: rep(IDX, 'import {\n  HeroSection,', 'import {\n  ArtistBioSection,\n  HeroSection,'),
 'M11': lambda: rep(H, r"/(?:-webkit-)?background-clip\s*:[^;}]*\btext\b/.source,", r"/(?:-webkit-)?background-clip:\s*text/.source,"),
 # one or more per closed id
 'N1-GT1-TSX-CLASS': lambda: rep(IDX, '<span>Releases</span>', '<span className="bg-clip-text text-transparent">Releases</span>'),
 'N1b-GT1-TSX-STYLE': lambda: rep(IDX, '<span>Releases</span>', "<span style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Releases</span>"),
 'N1c-GT1-TSX-ARBITRARY': lambda: rep(IDX, '<span>Releases</span>', '<span className="[background-clip:_text]">Releases</span>'),
 'N1d-GT1-TSX-STYLE-BLOCK': lambda: app(IDX, '\nexport const STYLE_BLOCK_MUTANT = `.t { -webkit-background-clip: text; }`;\n'),
 'N1e-GT1-TSX-PERF-ROOT': lambda: app(perf_first(), '\nexport const PERF_CLIP_MUTANT = "bg-clip-text";\n'),
 'N2-TL-L3-STUDIO-CSS': lambda: app('app/styles/studio.css', '\n.mutant-clip {\n  -webkit-background-clip: text;\n}\n'),
 'N2b-TL-L3-PAGES-CSS': lambda: app('app/styles/pages/studio.css', '\n.mutant-fill {\n  -webkit-text-fill-color: transparent;\n}\n'),
 'N3-A447-L2-INLINE-GLOW': lambda: app('app/components/product/ProductCard.tsx', "\nexport const GLOW_MUTANT = { boxShadow: '0 0 30px red' };\n"),
 'N3b-A447-L2-DROP-SHADOW-CLASS': lambda: app('app/routes/hire-us.tsx', '\nexport const GLOW_CLASS_MUTANT = "drop-shadow-[0_0_8px_red]";\n'),
 'N3c-A447-L2-WRAPPED-LAYER': lambda: app('app/routes/gift-cards.tsx', "\nexport const GLOW_WRAP_MUTANT = {\n  boxShadow:\n    '0 2px 4px black, 0 0 30px red',\n};\n"),
 'N3d-A447-L2-TEXT-SHADOW': lambda: app('app/components/home/StudioMockup.tsx', "\nexport const TEXT_GLOW_MUTANT = { textShadow: '0 0 12px red' };\n"),
 'N4-A447-L3-PERF-ROOT': lambda: rep(T, '    const sources = listFiles(PERF_ROOT, SCRIPT_SOURCE_EXTENSIONS);', "    const sources = listFiles(APP_ROOT, SCRIPT_SOURCE_EXTENSIONS).filter((p) => p.startsWith('perf/'));"),
 'N5-TL-L4-QUOTES': lambda: rep(H, "token.startsWith('/*') ? token.replace(/[^\\n]/g, ' ') : token.replace(/[{};]/g, ' ')", "token.startsWith('/*') ? token.replace(/[^\\n]/g, ' ') : token"),
 'N5b-TL-L4-COMMENT-IN-STRING': lambda: rep(H, "  const source = blankCommentsAndQuotedDelimiters(css);", "  const source = css\n    .replace(/\\/\\*[\\s\\S]*?\\*\\//g, (c) => c.replace(/[^\\n]/g, ' '))\n    .replace(/\"(?:[^\"\\\\\\n]|\\\\.)*\"|'(?:[^'\\\\\\n]|\\\\.)*'/g, (q) => q.replace(/[{};]/g, ' '));"),
 'N6-FILL-REGEX-HELPER': lambda: rep(H, '|rgba?\\([\\s_]*', '|rgbaNEVER\\([\\s_]*'),
 'N6b-FILL-REGEX-CSS': lambda: rep('app/styles/app.css', SUB, '\n.alpha-fill {\n  -webkit-text-fill-color: rgba(0, 0, 0, 0);\n}\n' + SUB),
 'N7-HYGIENE-HASOWN': lambda: rep(H, '!Object.hasOwn(allowList, key)', '!(key in allowList)'),
 'N7b-HYGIENE-FILE-KEY': lambda: (rep('app/styles/app.css', LOAD, '  letter-spacing: 0.1em;'), rep('app/styles/base/utilities.css', '/* Section title utility */', '.loading-brand {\n  -webkit-background-clip: text;\n  background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n\n/* Section title utility */')),
 'N8-GT5-CINEMA-IMPORT': lambda: rep(IDX, 'import {\n  HeroSection,', "import { CinemaCurtainLoader } from '~/components/loading';\nimport {\n  HeroSection,"),
 'N8b-GT5b-TIMELINE-IMPORT': lambda: rep('app/components/product/AssetRow.tsx', "import { WaveForm } from '~/components/audio';", "import { Timeline, WaveForm } from '~/components/audio';"),
 'N8d-GT5b-RELATIVE-TIMELINE': lambda: rep('app/components/product/AssetRow.tsx', "import { WaveForm } from '~/components/audio';", "import { WaveForm } from '~/components/audio';\nimport { Timeline } from '../audio/Timeline';"),
 'N8e-GT5b-NAMESPACE-BARREL': lambda: rep('app/components/product/AssetRow.tsx', "import { WaveForm } from '~/components/audio';", "import * as Audio from '~/components/audio';\nimport { WaveForm } from '~/components/audio';"),
 'N8f-GT5b-ROOT-BARREL': lambda: rep(IDX, 'import {\n  HeroSection,', "import { Timeline } from '~/components';\nimport {\n  HeroSection,"),
 'N8g-GT5b-RESOLVER-NAMESPACE-OFF': lambda: rep(G, '(entry.namespace || entry.names.includes(dead.exportName))', 'entry.names.includes(dead.exportName)'),
 'N8c-GT5b-EMAIL-IMPORT': lambda: rep(IDX, 'import {\n  HeroSection,', "import { sendEmail } from '~/lib/email.server';\nimport {\n  HeroSection,"),
 'N9-TS6-GLOW-REGEX': lambda: rep(H, "  `drop-shadow\\\\([\\\\s_]*0(?:px)?[\\\\s_]+0(?:px)?[\\\\s_]+${GLOW_BLUR}`,\n", ''),
 'N9b-TS6-RING-GUARD': lambda: rep(H, "const LAYER_START = /(?<=(?:^|[:'\"`,[]|inset)[\\s_]*)/.source;", "const LAYER_START = '';"),
 'N9c-TS3-FRACTIONAL-BLUR': lambda: app('app/components/product/ProductCard.tsx', "\nexport const BLUR_MUTANT = { boxShadow: '0 0 .5rem red' };\n"),
 'N9d-TS6-BLUR-INTEGER-ONLY': lambda: rep(H, "const GLOW_BLUR = /(?:[1-9]|0?\\.\\d*[1-9]|var\\(|\\$\\{)/.source;", "const GLOW_BLUR = /[1-9]/.source;"),
 'N9e-TS6-SPAN-CROSSES-PROPERTY': lambda: rep(H, "const SHADOW_VALUE_SPAN = /(?:[^;},]|,(?!\\s*['\"]?[\\w-]+['\"]?\\s*:)){0,300}?/.source;", "const SHADOW_VALUE_SPAN = /[^;}]*?/.source;"),
 'N10-GT4b-TSX-REGEX': lambda: rep(H, r"  /\[(?:-webkit-)?background-clip:_*text\]/.source,", ''),
 'N10b-GT1b-SETPROPERTY': lambda: app(IDX, "\nexport function clipMutant(el: HTMLElement) {\n  el.style.setProperty('-webkit-background-clip', 'text');\n}\n"),
 'N10c-GT1b-WRAPPED-VALUE': lambda: app(IDX, "\nexport const WRAP_MUTANT = {\n  backgroundClip:\n    'text',\n};\n"),
}
if __name__ == '__main__':
    if sys.argv[1] == '--list':
        print(' '.join(M)); sys.exit(0)
    M[sys.argv[1]]()
