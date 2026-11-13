#!/usr/bin/env bash
# usage: bash mutants-499.sh <copy-of-store-tree-with-sketch-applied-and-committed>
# Each mutant edits one file in the copy, runs the 2b-1 test file, expects a non-zero exit (RED), then restores.
set -u
C="$1"
cd "$C" || exit 2
T=app/lib/__tests__/store-button-cleanup-2b.test.tsx
run() {
  local id="$1" file="$2" py="$3"
  python3 -I -c "$py" "$file" || { echo "$id APPLY-FAILED"; git checkout -q -- "$file"; return; }
  if npx vitest run "$T" > "/tmp/m499-$id.log" 2>&1; then echo "$id GREEN (mutant survived)"; else echo "$id RED"; fi
  git checkout -q -- "$file"
}
R='import sys; p=sys.argv[1]; s=open(p).read(); o,n=OLD,NEW; assert s.count(o)>=1, "anchor"; open(p,"w").write(s.replace(o,n,1))'
mk() { printf '%s' "${R/OLD,NEW/$1}"; }
run N1 app/components/ui/EmptyState.tsx "$(mk "\"<Link to={actionHref} className={buildButtonClassName({ size: 'lg', shape: 'pill' })}>\", \"<Link to={actionHref} className=\\\"inline-flex items-center justify-center px-6 py-3 bg-brand text-background rounded-lg font-medium hover:bg-brand/90 transition-colors\\\">\"")"
run N2 app/components/ui/EmptyState.tsx "$(mk "\"className={buildButtonClassName({ variant: 'ghost', size: 'lg', shape: 'pill' })}\", \"className={buildButtonClassName({ variant: 'secondary', size: 'lg', shape: 'pill' })}\"")"
run N3 app/components/ui/EmptyState.tsx "$(mk "\"<Button type=\\\"button\\\" size=\\\"lg\\\" shape=\\\"pill\\\" onClick={onAction}>\", \"<Button size=\\\"lg\\\" shape=\\\"pill\\\" onClick={onAction}>\"")"
run N4 app/components/ui/EmptyState.tsx "$(mk "\"<Button type=\\\"button\\\" size=\\\"lg\\\" shape=\\\"pill\\\" onClick={onAction}>\", \"<Button type=\\\"button\\\" size=\\\"lg\\\" shape=\\\"pill\\\">\"")"
run N5 app/components/errors/ErrorBoundary.tsx "$(mk "\"<Button size=\\\"lg\\\" shape=\\\"pill\\\" onClick\", \"<Button variant=\\\"secondary\\\" size=\\\"lg\\\" onClick\"")"
run N6 app/components/errors/ErrorBoundary.tsx "$(mk "\"className={buildButtonClassName({ variant: 'ghost', size: 'lg', shape: 'pill' })}\", \"className=\\\"inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand hover:bg-brand/90 text-black font-medium rounded-lg transition-colors\\\"\"")"
run N7 app/routes/store.tsx "$(mk "\"<Link to=\\\"/store\\\" className={buildButtonClassName({ size: 'lg', shape: 'pill' })}>\", \"<Link to=\\\"/store\\\" className=\\\"inline-block rounded-lg bg-brand px-5 py-3 text-background\\\">\"")"
run N8 app/routes/store.tsx "$(mk "\"<p className=\\\"text-foreground\\\">The collection could not be loaded.\", \"<p className={'text-foreground bg-elevated'}>The collection could not be loaded.\"")"
run N9 app/components/errors/ErrorBoundary.tsx "$(mk "\"<Home className=\\\"w-4 h-4\\\" />\", \"\"")"
