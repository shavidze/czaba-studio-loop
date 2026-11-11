#!/usr/bin/env bash
# usage: email-structure-diff.sh <head.html> <tree.html> : hex colours -> HEX, then unified diff (no context)
N() { sed -E 's/#[0-9a-fA-F]{3,6}\b/HEX/g' "$1"; }
diff -U0 <(N "$1") <(N "$2") | grep -E '^[+-]' | grep -vE '^(\+\+\+|---) '
