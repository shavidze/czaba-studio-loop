#!/bin/bash
# usage: mu.sh NAME  (applies python mutation from mutants.py NAME to a fresh copy of sketch)
name=$1; rm -rf /tmp/b283/mu-$name; mkdir /tmp/b283/mu-$name; (cd /tmp/b283/sketch && tar --exclude=node_modules -cf - .) | tar -xf - -C /tmp/b283/mu-$name; ln -s /home/runner/czaba-project/store/node_modules /tmp/b283/mu-$name/node_modules
cd /tmp/b283/mu-$name && python3 /tmp/b283/mutants.py $name || exit 9
timeout 900 npx vitest run app/lib/arrangement/__tests__/waveform-outline-path.test.tsx app/lib/arrangement/__tests__/clip-gain-waveform.test.tsx app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx > /tmp/b283/mu-$name.txt 2>&1
echo "== $name rc $?"; grep -E "^.*×" /tmp/b283/mu-$name.txt | sed 's/\x1b\[[0-9;]*m//g' | head -8; grep -E "Tests " /tmp/b283/mu-$name.txt | sed 's/\x1b\[[0-9;]*m//g'
rm -rf /tmp/b283/mu-$name
