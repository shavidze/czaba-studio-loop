#!/bin/bash
# B round 471->472: L58 mutant runs of sketch-472 on the scratch copy (TREE + sketch-472). Run from b-round-471/.
# Reuse: S=<scratch copy of TREE+sketch with node_modules symlink> B=<your output dir> bash mutants.sh
B=${B:-/home/runner/czaba-project/tmp/studio-real-loop/b-round-471}; S=${S:-$B/scratch}; CSS=app/styles/app.css
cd $S || exit 1
cp $CSS $B/app.css.tree
run(){ npx vitest run app/lib/__tests__/self-hosted-fonts.test.ts > $B/mutant-$1.log 2>&1; echo "$1 rc $? $(sed 's/\x1b\[[0-9;]*m//g' $B/mutant-$1.log | grep -E '^ *Tests |× FN' | tr '\n' ' ' | tr -s ' ')"; cp $B/app.css.tree $CSS; }
run control
sed -i "123s/.*/  --font-serif: Georgia, serif;/" $CSS; run georgia-serif
sed -i "124d" $CSS; run no-mono
sed -i "122s/.*/  --font-sans: 'Inter', system-ui, sans-serif;/" $CSS; run sans-inter
sed -i "338s/.*/  font-family: \"Inter\", -apple-system, sans-serif;/" $CSS; run body-dq-inter
git -C /home/runner/czaba-project/store show 5cd9645:$CSS > $CSS; run head-css
python3 -I -c "
p='$CSS';s=open(p).read();i=s.index('[data-studio-theme');j=s.index('--font-sans',i);k=s.index(';',j);open(p,'w').write(s[:j]+'--font-sans: Georgia, serif'+s[k:])"; run obsidian-sans-georgia
python3 -I -c "
p='$CSS';s=open(p).read();s=s.replace(\"  --font-mono: 'IBM Plex Mono'\",\"  /* --font-mono: 'IBM Plex Mono', x; */\n  --font-mono-x: 'IBM Plex Mono'\",1);open(p,'w').write(s)"; run commented-mono
python3 -I -c "
p='$CSS';s=open(p).read();i=s.index('\n@theme {');s=s[:i]+s[i:].replace('\n}','\n }');open(p,'w').write(s)"; run theme-unterminated
