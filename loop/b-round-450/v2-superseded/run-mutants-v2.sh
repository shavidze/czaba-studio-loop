#!/usr/bin/env bash
# usage: SRC=<repo at the sketch commit> OUT=<dir> bash run-mutants.sh
# Each mutant edits a fresh checkout of a shared clone of $SRC, runs the two scan suites, logs the red rows.
set -u
: "${SRC:?}"; : "${OUT:?}"
M=/tmp/b451-mut-$$
mkdir -p "$OUT"
rm -rf "$M"; git clone -q --shared "$SRC" "$M" && ln -s /home/runner/czaba-project/store/node_modules "$M/node_modules" || exit 1
run() {
  id=$1; code=$2
  (cd "$M" && git checkout -q -- . && python3 -I -c "$code") || { echo "$id EDIT-FAILED" | tee -a "$OUT/mutants.txt"; return; }
  (cd "$M" && npx vitest run app/lib/__tests__/store-gradient-text.test.ts app/lib/__tests__/store-teal-sweep.test.ts > "$OUT/mutant-$id.log" 2>&1)
  red=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mutant-$id.log" | grep -aoE '(×|FAIL) .*> (GT[0-9]+b?|TS[0-9]+):' | grep -oE '(GT[0-9]+b?|TS[0-9]+):' | tr -d ':' | sort -u | tr '\n' ' ')
  echo "$id red: ${red:-none}" | tee -a "$OUT/mutants.txt"
}
: > "$OUT/mutants.txt"
E="def e(p,o,n):
 s=open(p).read(); assert s.count(o)==1,(p,o); open(p,'w').write(s.replace(o,n))
"
H=app/lib/__tests__/helpers/style-scan.ts; G=app/lib/__tests__/store-gradient-text.test.ts; T=app/lib/__tests__/store-teal-sweep.test.ts
run BASE "pass"
# HEAD pins (port preserves HEAD)
run P1 "$E
e('$T',\"  'components/loading/CinemaCurtainLoader.tsx': {\n    hits: 7,\n    reason: 'LEGACY-DEAD-STORE-COMPONENTS',\n  },\n\",'')"
run P2 "$E
e('$T','hits: 7,','hits: 6,')"
run P3 "$E
e('app/components/product/ProductCard.tsx','className=\"','className=\"text-teal-500 ',) if False else None
s=open('app/components/product/ProductCard.tsx').read(); open('app/components/product/ProductCard.tsx','w').write(s+'\nexport const TEAL_MUTANT = \"text-teal-500\";\n')"
run P4 "s=open('app/components/loading/SpotlightLoader.tsx').read(); open('app/components/loading/SpotlightLoader.tsx','w').write(s+\"\nexport const CLIP_MUTANT = { WebkitBackgroundClip: 'text' };\n\")"
run P5 "import glob; f=sorted(glob.glob('perf/**/*.ts',recursive=True))[0]; s=open(f).read(); open(f,'w').write(s+'\nexport const TEAL_PERF_MUTANT = \"#13d9cc\";\n')"
run P6 "$E
e('$H','  walk(root);\n  return files.sort();','  walk(root);\n  return files.sort().slice(0, 0);')"
run P7 "$E
e('$G','    hits: 3,\n    reason: \'LEGACY-DEAD-STORE-COMPONENTS (PianoLoadingAnimation','    hits: 2,\n    reason: \'LEGACY-DEAD-STORE-COMPONENTS (PianoLoadingAnimation')"
run P8 "$E
e('$G','ArtistBioSection.tsx\': {\n    hits: 1,','ArtistBioSection.tsx\': {\n    hits: 2,')"
run P9 "$E
e('$H',\"if (entry !== '__tests__') {\",\"if (entry !== '__tests__' && entry !== 'loading') {\")"
# round-448 mutants re-run on the port
run M1 "$E
e('app/styles/base/utilities.css','/* Section title utility */','.text-glow {\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  background-clip: text;\n}\n\n/* Section title utility */')"
run M2 "$E
e('app/styles/app.css','  /* ========== GRADIENTS ========== */\n','  /* ========== GRADIENTS ========== */\n  --gradient-text: linear-gradient(135deg, red 0%, blue 100%);\n')"
run M3 "$E
e('app/routes/_index.tsx','<span>Releases</span>','<span className=\"text-glow\">Releases</span>')"
run M4 "$E
e('app/styles/app.css','\n.loading-subtitle {','\n.hero-fill-trap {\n  -webkit-text-fill-color: transparent;\n}\n\n.loading-subtitle {')"
run M5 "$E
e('app/styles/app.css','  -webkit-background-clip: text;\n  background-clip: text;\n  -webkit-text-fill-color: transparent;\n  letter-spacing: 0.1em;','  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  letter-spacing: 0.1em;')"
run M6 "$E
e('app/styles/app.css','\n.loading-subtitle {','\n/* .x { background-clip: text; } */\n.loading-subtitle {')"
run M7 "$E
e('app/components/home/VideoShowcase.tsx','<span className=\"text-glow\">In Action</span>','<span>In Action</span>')"
run M8 "$E
e('$H','selector: selectors[selectors.length - 1] ?? \'\'','selector: selectors[0] ?? \'\'')"
run M9 "$E
e('app/styles/app.css','\n.loading-subtitle {','\n.clip-variant {\n  background-clip : padding-box, text;\n}\n\n.loading-subtitle {')"
run M10 "$E
e('app/routes/_index.tsx','import {\n  HeroSection,','import {\n  ArtistBioSection,\n  HeroSection,')"
run M11 "$E
e('$H',\"\`(?:-webkit-)?background-clip\\\\\\\\s*:[^;}]*\\\\\\\\btext\\\\\\\\b|\",\"\`(?:-webkit-)?background-clip:\\\\\\\\s*text|\")"
# one mutant per closed id
run N1-GT1-TSX-CLASS "$E
e('app/routes/_index.tsx','<span>Releases</span>','<span className=\"bg-clip-text text-transparent\">Releases</span>')"
run N1b-GT1-TSX-STYLE "$E
e('app/routes/_index.tsx','<span>Releases</span>','<span style={{ WebkitBackgroundClip: \'text\', WebkitTextFillColor: \'transparent\' }}>Releases</span>')"
run N1c-GT1-TSX-ARBITRARY "$E
e('app/routes/_index.tsx','<span>Releases</span>','<span className=\"[background-clip:text]\">Releases</span>')"
run N2-TL-L3-STUDIO-CSS "s=open('app/styles/studio.css').read(); open('app/styles/studio.css','w').write(s+'\n.mutant-clip {\n  -webkit-background-clip: text;\n}\n')"
run N2b-TL-L3-PAGES-CSS "s=open('app/styles/pages/studio.css').read(); open('app/styles/pages/studio.css','w').write(s+'\n.mutant-fill {\n  -webkit-text-fill-color: transparent;\n}\n')"
run N3-A447-L2-INLINE-GLOW "s=open('app/components/product/ProductCard.tsx').read(); open('app/components/product/ProductCard.tsx','w').write(s+\"\nexport const GLOW_MUTANT = { boxShadow: '0 0 30px red' };\n\")"
run N3b-A447-L2-DROP-SHADOW-CLASS "s=open('app/routes/hire-us.tsx').read(); open('app/routes/hire-us.tsx','w').write(s+'\nexport const GLOW_CLASS_MUTANT = \"drop-shadow-[0_0_8px_red]\";\n')"
run N4-A447-L3-PERF-ROOT "$E
e('$T','    const sources = listFiles(PERF_ROOT, SCRIPT_SOURCE_EXTENSIONS);','    const sources = listFiles(APP_ROOT, SCRIPT_SOURCE_EXTENSIONS).filter((p) => p.startsWith(\'perf/\'));')"
run N5-TL-L4-QUOTES "$E
e('$H','  const source = blankQuotedStrings(blankComments(css));','  const source = blankComments(css);')"
run N6-FILL-REGEX-HELPER "$E
e('$H',\"|rgba?\\\\\\\\(\\\\\\\\s*0+\\\\\\\\s*[,\\\\\\\\s]\\\\\\\\s*0+\\\\\\\\s*[,\\\\\\\\s]\\\\\\\\s*0+\\\\\\\\s*[,/]\\\\\\\\s*0*\\\\\\\\.?0*%?\\\\\\\\s*\\\\\\\\)';\",\"';\")"
run N6b-FILL-REGEX-CSS "$E
e('app/styles/app.css','\n.loading-subtitle {','\n.alpha-fill {\n  -webkit-text-fill-color: rgba(0, 0, 0, 0);\n}\n\n.loading-subtitle {')"
run N7-HYGIENE-HASOWN "$E
e('$H','!Object.hasOwn(allowList, key)','!(key in allowList)')"
run N7b-HYGIENE-FILE-KEY "$E
e('app/styles/app.css','  -webkit-background-clip: text;\n  background-clip: text;\n  -webkit-text-fill-color: transparent;\n  letter-spacing: 0.1em;','  letter-spacing: 0.1em;')
e('app/styles/base/utilities.css','/* Section title utility */','.loading-brand {\n  -webkit-background-clip: text;\n  background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n\n/* Section title utility */')"
run N8-GT5-CINEMA-IMPORT "$E
e('app/routes/_index.tsx','import {\n  HeroSection,','import { CinemaCurtainLoader } from \'~/components/loading\';\nimport {\n  HeroSection,')"
run N9-TS6-GLOW-REGEX "$E
e('$H',\"|\\\\\\\\bboxShadow\\\\\\\\s*:\\\\\\\\s*[\\\\'\\\"\`]\\\\\\\\s*0(?:px)?\\\\\\\\s+0(?:px)?\\\\\\\\s\",\"\")"
run N10-GT4b-TSX-REGEX "$E
e('$H','\`(?<![\\\\\\\\w-])bg-clip-text(?![\\\\\\\\w-])|','\`')"
rm -rf "$M"
