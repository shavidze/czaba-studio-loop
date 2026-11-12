#!/usr/bin/env bash
# usage: run-mutants.sh <scratch repo at d55ec17 + sketch committed> <out file>
set -u
R="$1"; OUT="$2"; T=app/lib/__tests__/store-dead-css.test.ts; C=app/styles/app.css
cd "$R" || exit 2
run() { NO_COLOR=1 npx vitest run --reporter=verbose $T 2>&1 | sed -nE "s/^ *(✓|×) .*> (DC[0-9]+):.*/\1\2/p" | sed "s/✓/GREEN-/;s/×/RED-/" | tr '\n' ' '; }
: > "$OUT"
echo "BASE $(run)" >> "$OUT"
mut() { local id="$1"; shift; "$@"; if git diff --quiet; then echo "$id NOT-APPLIED" >> "$OUT"; return; fi; echo "$id $(run)" >> "$OUT"; git checkout -q -- . ; }
mut M1-readd-float python3 -c "p='$C';s=open(p).read();open(p,'w').write(s+'\n@keyframes float {\n  50% { transform: translateY(-10px); }\n}\n')"
mut M2-readd-fadeOut-commented python3 -c "p='$C';s=open(p).read();open(p,'w').write(s+'\n/* animation: fadeOut 1s; */\n@keyframes fadeOut {\n  to { opacity: 0; }\n}\n')"
mut M3-no-comment-strip python3 -c "p='$T';s=open(p).read();s=s.replace('function withoutComments(source: string): string {\n  return source','function withoutComments(source: string): string {\n  return source;\n  return source',1);open(p,'w').write(s)"
mut M4-no-arbitrary python3 -c "p='$T';s=open(p).read();s=s.replace('      ANIMATE_ARBITRARY_UTILITY,\n','',1);open(p,'w').write(s)"
mut M5-no-named-utility python3 -c "p='$T';s=open(p).read();s=s.replace('names.add(match[1] ?? \'\');\n    }\n  }\n  return names','void match;\n    }\n  }\n  return names',1);open(p,'w').write(s)"
mut M6-no-theme-var python3 -c "p='$T';s=open(p).read();s=s.replace('|--animate-[\\\\w-]+)','|--never-[\\\\w-]+)',1);open(p,'w').write(s)"
mut M7-no-style-string python3 -c "p='$T';s=open(p).read();s=s.replace('      ANIMATION_STYLE_STRING,\n','',1);open(p,'w').write(s)"
mut M8-string-unaware-strip python3 -c "p='$T';s=open(p).read();s=s.replace('.replace(/(^|[\\s{};,(])\\/\\*[\\s\\S]*?\\*\\//g, \'\$1 \')','.replace(/\\/\\*[\\s\\S]*?\\*\\//g, \' \')',1);open(p,'w').write(s)"
mut M9-string-unaware-line-strip python3 -c "p='$T';s=open(p).read();s=s.replace(r'.replace(/(^|[\s{};,(])\/\/[^\n]*/g', r'.replace(/(^|[^:\w])\/\/[^\n]*/g',1);open(p,'w').write(s)"
