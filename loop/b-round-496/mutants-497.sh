#!/usr/bin/env bash
# usage: mutants-497.sh <tree with the round-497 addendum applied>; each mutant must turn its test red
set -u; T="$1"; cd "$T" || exit 2
run(){ id="$1"; file="$2"; py="$3"; test="$4"; cp "$file" /tmp/m497.bak
  python3 -I -c "import sys,pathlib;p=pathlib.Path(sys.argv[1]);s=p.read_text();$py;p.write_text(s)" "$file"
  if npx vitest run "$test" >/tmp/m497.log 2>&1; then echo "$id GREEN (mutant survived)"; else echo "$id RED"; fi
  cp /tmp/m497.bak "$file"; }
G=app/lib/__tests__/store-glow-shadow.test.ts; B=app/lib/__tests__/store-button-cleanup.test.tsx
run N1 app/styles/base/utilities.css "s+='\n.btn-primary:focus-visible { outline: 0; }\n'" $G
run N2 app/styles/app.css "s+='\na.button { color: red; }\n'" $G
run N3 app/styles/app.css "s+='\n.btn-secondary { color: red; }\n'" $G
run N4 app/components/ui/Button.tsx "s=s.replace(\"'hover:bg-outline hover:border-outline-hover',\",\"'hover:bg-outline',\",1)" $B
run N5 app/components/ui/Button.tsx "s=s.replace(\"lg: 'px-6 py-3 text-base gap-2'\",\"lg: 'px-6 py-3 text-base gap-3'\",1)" $B
run N6 app/components/ui/Button.tsx "s=s.replace(\"    fullWidth && 'w-full',\n    isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',\n    className,\",\"    className,\n    fullWidth && 'w-full',\n    isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',\",1)" $B
run N7 app/components/ui/Button.tsx "s=s.replace(\"'bg-destructive text-brand-foreground',\",\"'bg-destructive text-foreground',\",1)" $B
run N8 'app/routes/$.tsx' "s=s.replace('hover:text-brand','hover:text-brand bg-brand',1)" $B
