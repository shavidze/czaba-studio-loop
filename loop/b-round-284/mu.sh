#!/bin/bash
# usage: mu.sh NAME [SRC_TREE]  copies SRC_TREE (default /tmp/b284/sketch), applies mutants.py NAME, runs the two covering files
name=$1; src=${2:-/tmp/b284/sketch}; dst=/tmp/b284/mu-$name; D=$(dirname "$0")
rm -rf $dst; mkdir -p /tmp/b284 $dst; (cd $src && tar --exclude=node_modules --exclude=.git -cf - .) | tar -xf - -C $dst; ln -s /home/runner/czaba-project/store/node_modules $dst/node_modules
cd $dst && python3 $D/mutants.py $name || exit 9
timeout 900 npx vitest run app/lib/arrangement/__tests__/view.test.ts app/lib/arrangement/__tests__/tempo-window-ui.test.tsx > /tmp/b284/mu-$name.txt 2>&1
echo "== $name rc $?"; grep -E "×" /tmp/b284/mu-$name.txt | sed 's/\x1b\[[0-9;]*m//g' | sed 's/^ *//' | cut -c1-110 | head -12; grep -E "Tests " /tmp/b284/mu-$name.txt | sed 's/\x1b\[[0-9;]*m//g'
rm -rf $dst
