#!/usr/bin/env bash
# usage: SRC=<repo at the sketch commit, node_modules linked> OUT=<dir> bash run-mutants.sh
# Each mutant edits a fresh shared clone of $SRC, runs the two covering files, and logs the failing rows.
set -u
: "${SRC:?}"; : "${OUT:?}"
M=/tmp/b453-mut-$$
mkdir -p "$OUT"
rm -rf "$M"; git clone -q --shared "$SRC" "$M" && ln -s /home/runner/czaba-project/store/node_modules "$M/node_modules" || exit 1
run() { # id, python edit
  id=$1; code=$2
  (cd "$M" && git checkout -q -- . && git clean -qfd -e node_modules && python3 -I -c "$code") || { echo "$id EDIT-FAILED" | tee -a "$OUT/mutants.txt"; return; }
  (cd "$M" && npx vitest run app/lib/__tests__/store-glow-shadow.test.ts app/lib/__tests__/store-theme-tokens.test.ts > "$OUT/mutant-$id.log" 2>&1)
  red=$(grep -oE '(×|FAIL).*\b(GS[0-9]|ST[0-9]+)' "$OUT/mutant-$id.log" | grep -oE '\b(GS[0-9]|ST[0-9]+)' | sort -u | tr '\n' ' ')
  echo "$id red: ${red:-none}" | tee -a "$OUT/mutants.txt"
}
: > "$OUT/mutants.txt"
E="def e(p,o,n):
 s=open(p).read(); assert s.count(o)==1,(p,o); open(p,'w').write(s.replace(o,n))
"
run BASE "pass"
run M1 "$E
e('app/styles/app.css','  --shadow-card: ','  --shadow-glow: 0 0 40px hsl(175, 85%, 46%, 0.15);\n  --shadow-card: ')"
run M2 "$E
e('app/components/ui/Button.tsx','    \'shadow-sm\',\n  ].join(\' \'),\n\n  secondary','    \'shadow-sm hover:shadow-glow\',\n  ].join(\' \'),\n\n  secondary')"
run M3 "$E
e('app/styles/app.css','.btn-primary:hover {\n  background: var(--color-brand-hover);\n}','.btn-primary:hover {\n  box-shadow: 0 0 20px -5px rgba(19, 217, 204, 0.5);\n  background: var(--color-brand-hover);\n}')"
run M4 "$E
e('app/styles/app.css','.btn-primary:hover {\n  background: var(--color-brand-hover);\n}','.btn-primary:hover {\n  opacity: 0.9;\n  background: var(--color-brand-hover);\n}')"
run M5 "$E
e('app/styles/app.css','  background: var(--color-brand);\n  color: var(--color-brand-foreground);\n}\n\n.button-primary:hover','  background: var(--color-brand);\n  color: white;\n}\n\n.button-primary:hover')"
run M6 "$E
e('app/styles/app.css','.button-primary {\n  background: var(--color-brand);','.button-primary {\n  background: var(--gradient-primary);')"
run M7 "$E
e('app/components/ui/IconButton.tsx','\'shadow-sm hover:shadow-glow\',','\'shadow-sm\',')"
run M8 "$E
e('app/styles/app.css','.special-offer-bg {','.special-offer-card:hover {\n  box-shadow: var(--shadow-glow);\n}\n\n.special-offer-bg {')"
run M9 "$E
e('app/components/chat/ChatInput.tsx','\'hover:bg-brand-hover\',','\'hover:bg-brand-hover hover:shadow-glow\',')"
run M10 "$E
e('app/styles/app.css','.btn-primary:active {\n  opacity: 0.8;\n}','.btn-primary:active {\n  opacity: 0.8;\n  box-shadow: 0 0 12px rgba(var(--color-brand-rgb), 0.4);\n}')"
run M11 "$E
e('app/styles/app.css','.btn-primary:hover {\n  background: var(--color-brand-hover);\n}','.btn-primary:hover {\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);\n  background: var(--color-brand-hover);\n}')"
run M12 "$E
e('app/styles/app.css','/* Icon Button */','.btn-primary:hover {\n  box-shadow: 0 0 20px rgba(201, 164, 106, 0.5);\n}\n\n/* Icon Button */')"
run M13 "$E
e('app/styles/app.css','.button-primary:hover {\n  background: var(--color-brand-hover);\n}','.button-primary:hover {\n  box-shadow: 0 0 50px hsl(175, 85%, 50%, 0.4);\n  background: var(--color-brand-hover);\n}')"
run M14 "$E
e('app/styles/app.css','/* Icon Button */','@media (hover: hover) {\n  .btn-primary:hover {\n    box-shadow: 0 0 20px rgba(201, 164, 106, 0.5);\n  }\n}\n\n/* Icon Button */')"
run M15 "$E
e('app/styles/app.css','/* Icon Button */','.btn-primary:hover{\n  box-shadow: 0 0 20px rgba(201, 164, 106, 0.5);\n}\n\n/* Icon Button */')"
run M16 "$E
e('app/styles/app.css','/* Icon Button */','.hero .btn-primary:hover, .x {\n  box-shadow: 0 0 20px rgba(201, 164, 106, 0.5);\n}\n\n/* Icon Button */')"
run M17 "$E
e('app/components/chat/ChatInput.tsx','\'hover:bg-brand-hover\',','\'hover:bg-brand-hover hover:shadow-[0_0_20px_rgba(201,164,106,0.5)]\',')"
run M18 "exec(open('/home/runner/czaba-project/tmp/studio-real-loop/b-round-452/mutant-edits/M18.py').read())"
run M19 "exec(open('/home/runner/czaba-project/tmp/studio-real-loop/b-round-452/mutant-edits/M19.py').read())"
run M20 "$E
e('app/styles/app.css','/* Icon Button */','/* .btn-primary:hover { box-shadow: 0 0 20px red; } */\n\n/* Icon Button */')"
rm -rf "$M"
