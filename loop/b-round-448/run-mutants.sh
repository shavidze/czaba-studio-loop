#!/usr/bin/env bash
# usage: SRC=<repo at the sketch commit, node_modules linked> OUT=<dir> bash run-mutants.sh
# Each mutant edits a fresh shared clone of $SRC, runs the new test file, and logs the failing rows.
set -u
: "${SRC:?}"; : "${OUT:?}"
M=/tmp/b449-mut-$$
mkdir -p "$OUT"
rm -rf "$M"; git clone -q --shared "$SRC" "$M" && ln -s /home/runner/czaba-project/store/node_modules "$M/node_modules" || exit 1
run() { # id, python edit
  id=$1; code=$2
  (cd "$M" && git checkout -q -- . && python3 -I -c "$code") || { echo "$id EDIT-FAILED" | tee -a "$OUT/mutants.txt"; return; }
  (cd "$M" && npx vitest run app/lib/__tests__/store-gradient-text.test.ts > "$OUT/mutant-$id.log" 2>&1)
  red=$(grep -oE '(×|FAIL).*(GT[0-9])' "$OUT/mutant-$id.log" | grep -oE 'GT[0-9]' | sort -u | tr '\n' ' ')
  echo "$id red: ${red:-none}" | tee -a "$OUT/mutants.txt"
}
: > "$OUT/mutants.txt"
E="def e(p,o,n):
 s=open(p).read(); assert s.count(o)==1,(p,o); open(p,'w').write(s.replace(o,n))
"
run BASE "pass"
run M1 "$E
e('app/styles/base/utilities.css','/* Section title utility */','.text-glow {\n  background: var(--gradient-text);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  background-clip: text;\n}\n\n/* Section title utility */')"
run M2 "$E
e('app/styles/app.css','  /* ========== GRADIENTS ========== */\n','  /* ========== GRADIENTS ========== */\n  --gradient-text: linear-gradient(135deg, hsl(220, 10%, 94%) 0%, hsl(175, 85%, 46%) 100%);\n')"
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
e('app/lib/__tests__/store-gradient-text.test.ts','selector: selectors[selectors.length - 1] ?? \'\'','selector: selectors[0] ?? \'\'')"
run M9 "$E
e('app/styles/app.css','\\n.loading-subtitle {','\\n.clip-variant {\\n  background-clip : padding-box, text;\\n}\\n\\n.loading-subtitle {')"
run M10 "$E
e('app/routes/_index.tsx','import {\\n  HeroSection,','import {\\n  ArtistBioSection,\\n  HeroSection,')"
run M11 "$E
e('app/lib/__tests__/store-gradient-text.test.ts','/(?:-webkit-)?background-clip\\\\s*:[^;}]*\\\\btext\\\\b|-webkit-text-fill-color\\\\s*:\\\\s*(?:transparent|#0000(?:0000)?\\\\b)/gi','/(?:-webkit-)?background-clip:\\\\s*text|-webkit-text-fill-color:\\\\s*transparent/g')"
rm -rf "$M"
