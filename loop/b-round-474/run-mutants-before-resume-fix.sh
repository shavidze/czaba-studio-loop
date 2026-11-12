#!/usr/bin/env bash
# B round 474: mutants for round 475 rows. usage: run-mutants.sh <ABSOLUTE copy of a tree holding the sketch, committed or not> <ABSOLUTE out-dir>
# Restores from a pristine snapshot of app/ taken at start (no git), so it works on A's uncommitted tree copy.
M=$1; O=$2
case "$M" in /*) ;; *) echo "copy path must be absolute"; exit 2;; esac
case "$O" in /*) ;; *) echo "out-dir must be absolute"; exit 2;; esac
[ "$(realpath "$M")" = "/home/runner/czaba-project/store" ] && { echo "refusing to run on the store tree"; exit 2; }
mkdir -p "$O"; cd "$M" || exit 2
P="$M/.mutant-pristine-app"; rm -rf "$P" && cp -a "$M/app" "$P" || exit 2
restore() { rm -rf "$M/app" && cp -a "$P" "$M/app"; }
run() { id=$1; file=$2; npx vitest run "$file" > "$O/mutant-$id.log" 2>&1; echo "$id rc=$? red=$(sed 's/\x1b\[[0-9;]*m//g' "$O/mutant-$id.log" | grep -oE '× (UT[0-9b]+|LT[0-9]+[a-z]?)' | sort -u | tr '\n' ' ')"; restore; }
T=app/lib/__tests__/store-undefined-tokens.test.ts
python3 -I -c "p='app/styles/app.css';s=open(p).read();s=s.replace('color: var(--color-foreground);\n  line-height: 1;','color: var(--color-text-primary);\n  line-height: 1;',1);open(p,'w').write(s)"; run M-UT1-TEXT-PRIMARY $T
python3 -I -c "p='app/routes/search.tsx';s=open(p).read();s=s.replace('var(--color-muted)','var(--color-text-muted)');open(p,'w').write(s)"; run M-UT1-TEXT-MUTED $T
python3 -I -c "p='app/components/product/ProductCard.tsx';s=open(p).read();s=s.replace(\"'bg-background/70 text-foreground'\",\"'bg-primary/90 text-primary-foreground'\");open(p,'w').write(s)"; run M-UT2-BADGE $T
python3 -I -c "p='app/components/product/ProductCard.tsx';s=open(p).read();s=s.replace('<h3 className=\"font-semibold text-foreground mb-2\">','<h3 className=\"font-semibold text-foreground mb-2 group-hover:text-primary\">');open(p,'w').write(s)"; run M-UT2-TITLE $T
python3 -I -c "p='app/components/auth/UserDropdown.tsx';s=open(p).read();s=s.replace('text-text-muted','text-text-faint',1);open(p,'w').write(s)"; run M-UT2-SWAP-DEAD-TOKEN $T
python3 -I -c "p='app/routes/search.tsx';s=open(p).read();s=\"import { UserDropdown } from '~/components/auth/UserDropdown';\nexport const keep = UserDropdown;\n\"+s;open(p,'w').write(s)"; run M-UT2b-REMOUNT $T
python3 -I -c "p='app/styles/app.css';s=open(p).read();s=s.replace('.nav-loading-bar {\n  display: none;\n}','.nav-loading-bar {\n  position: fixed;\n  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-hover));\n}');open(p,'w').write(s)"; run M-UT5-NAVBAR $T
python3 -I -c "p='app/lib/__tests__/helpers/token-resolve.ts';s=open(p).read();s=s.replace('return reads.filter((read) => !declared.has(read.token) && !resolver.definesProperty(read.token));','return reads.filter((read) => !declared.has(read.token));');open(p,'w').write(s)"; run M-HELPER-NO-RESOLVER $T
python3 -I -c "p='app/lib/__tests__/helpers/token-resolve.ts';s=open(p).read();s=s.replace('return new Set(unique.filter((candidate) => classSelectorPattern(candidate).test(output)));','return new Set(unique);');open(p,'w').write(s)"; run M-HELPER-ALWAYS-EMITS $T
python3 -I -c "p='app/lib/__tests__/helpers/token-resolve.ts';s=open(p).read();s=s.replace('const leadingDigit = /^[0-9]/.test(candidate)','const leadingDigit = /^$/.test(candidate)');open(p,'w').write(s)"; run M-HELPER-NO-DIGIT-ESCAPE $T
python3 -I -c "p='app/styles/app.css';s=open(p).read();s=s.replace('color: var(--color-foreground);\n  line-height: 1;','color: var(--color-text-primary);\n  line-height: 1;',1);open(p,'w').write(s)"; run M-LT-CODE4-HEADPIN app/lib/__tests__/store-live-teal.test.ts
rm -rf "$P"
