name=$1; rm -rf /tmp/c284/mu-$name; mkdir /tmp/c284/mu-$name; (cd /tmp/c284/a && tar --exclude=node_modules --exclude=build -cf - .) | tar -xf - -C /tmp/c284/mu-$name; ln -s /home/runner/czaba-project/store/node_modules /tmp/c284/mu-$name/node_modules
cd /tmp/c284/mu-$name && python3 /tmp/c284/mutants.py $name || exit 9
timeout 900 npx vitest run app/lib/arrangement/__tests__/waveform-outline-path.test.tsx app/lib/arrangement/__tests__/clip-gain-waveform.test.tsx app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx > /tmp/c284/mu-$name.txt 2>&1
echo "== $name rc $?"; sed 's/\x1b\[[0-9;]*m//g' /tmp/c284/mu-$name.txt | grep -E "^ +(×|FAIL)" | head -12; sed 's/\x1b\[[0-9;]*m//g' /tmp/c284/mu-$name.txt | grep -E "Tests "
rm -rf /tmp/c284/mu-$name
