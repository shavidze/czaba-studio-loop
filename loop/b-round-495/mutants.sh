#!/usr/bin/env bash
# B's 8 mutants for round 496. Usage: bash mutants.sh <sketch-applied store copy that is a git repo with the sketch committed>
# Never run inside the real store. Each mutant is applied, the two covering files run, then `git checkout -- app` restores.
set -u; D=$1; cd "$D" || exit 1
T="app/lib/__tests__/store-button-cleanup.test.tsx app/lib/__tests__/store-glow-shadow.test.ts"
run(){ name=$1; shift; "$@"; r=$(npx vitest run $T 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E "Tests .*(failed|passed)|FAIL .*>" | head -4 | tr '\n' ' '); echo "$name => $r"; git checkout -q -- app; }
run M1-css-restored sh -c "printf '.btn-primary {\n  color: red;\n}\n' >> app/styles/app.css"
run M2-header-hidden sed -i 's/className="max-lg:hidden"/className="hidden lg:inline-flex"/' app/components/layout/Header.tsx
run M3-builder-order python3 -c "
import pathlib;p=pathlib.Path('app/components/ui/Button.tsx');s=p.read_text();s=s.replace(\"    'transition-all duration-150',\n    'cursor-pointer',\",\"    'cursor-pointer',\n    'transition-all duration-150',\",1);p.write_text(s)"
run M4-consumer-revert sed -i 's#<Link to="/" className={buildButtonClassName({ size: .lg., shape: .pill. })}>#<Link to="/" className="button button-primary">#' app/routes/search.tsx
run M5-hover-opacity sed -i "s/'hover:bg-brand-hover',/'hover:bg-brand-hover hover:opacity-90',/" app/components/ui/Button.tsx
run M6-drop-fullwidth sed -i "s/    fullWidth \&\& 'w-full',//" app/components/ui/Button.tsx
run M7-browse-unstyled sed -i 's/className="inline-flex min-h-12 items-center gap-2 text-foreground hover:text-brand"/className="btn-secondary inline-flex items-center gap-2"/' 'app/routes/$.tsx'
run M8-pill-radius sed -i "s/pill: 'rounded-full'/pill: 'rounded-md'/" app/components/ui/Button.tsx
