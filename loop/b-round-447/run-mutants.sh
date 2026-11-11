#!/usr/bin/env bash
# Runs each named mutant on a throwaway copy of the B sketch (/tmp/b448-scratch = cce5eda + sketch-448.patch.txt,
# committed, with a node_modules symlink); logs to b-round-447/mutant-<id>.log (override OUT=<dir> for A/C copies).
set -u
SRC=${SRC:-/tmp/b448-scratch}; OUT=${OUT:-/home/runner/czaba-project/tmp/studio-real-loop/b-round-447}
T="app/lib/__tests__/hire-us-inquiry-email.test.ts app/lib/__tests__/hire-us-inquiry-email-contrast.test.ts app/lib/__tests__/store-teal-sweep.test.ts"
run() { id=$1; shift; rm -rf /tmp/b448-mut && cp -a $SRC /tmp/b448-mut && cd /tmp/b448-mut && python3 -I -c "$1" && (npx vitest run $T 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E '✓|×|FAIL|Tests ' > $OUT/mutant-$id.log); echo "$id: $(grep -c '×' $OUT/mutant-$id.log) failed rows: $(grep '×' $OUT/mutant-$id.log | grep -oE '(HE|TS)[0-9]+' | sort -u | tr '\n' ' ')"; cd /; }
E="p='app/lib/hire-us-inquiry-email.server.ts';s=open(p).read()"
H="p='app/routes/hire-us.tsx';s=open(p).read()"
W="open(p,'w').write(s2);assert s2!=s"
run M1 "$E;s2=s.replace('\${escapeEmailHtml(fields.message)}','\${fields.message}');$W"
run M2 "$E;s2=s.replace('cellspacing=\"0\" bgcolor=\"\${color.background}\" style=\"width: 100%; background-color: \${color.background};\"','cellspacing=\"0\" style=\"width: 100%;\"',1);$W"
run M3 "$E;s2=s.replace(\"brand: '#c9a46a'\",\"brand: '#13d9cc'\");$W"
run M4 "import subprocess;subprocess.run(['git','checkout','cce5eda','--','app/routes/hire-us.tsx'],check=True)"
run M5 "p='app/lib/__tests__/store-teal-sweep.test.ts';s=open(p).read();s2=s.replace(\"'components/audio/Timeline.tsx': { hits: 5,\",\"'components/audio/Timeline.tsx': { hits: 4,\");$W"
run M6 "p='perf/lib/report.ts';s=open(p).read();s2=s+'\nexport const MUTANT_COLOUR = \"bg-teal-500\";\n';$W"
run M7 "$E;s2=s.replace('color: \${color.muted}; font-size: 12px','color: #ffffff; font-size: 12px');$W"
run M8 "$E;s2=s.replace('const valueCell = \`padding: 10px; border-bottom: 1px solid \${color.outline}; color: \${color.foreground};\`','const valueCell = \`padding: 10px; border-bottom: 1px solid \${color.outline}; color: \${color.outline};\`');$W"
run M9 "import re;$E;s2=re.sub(r' ?bgcolor=\"\\\$\{color\.(background|surface)\}\"','',s);s2=re.sub(r' ?background-color: \\\$\{color\.(background|surface)\};','',s2);$W"
run M10 "$H;s2=s.replace(\"budgetLabel: budgetLabels[budget] || 'Not specified',\",\"budgetLabel: budgetLabels[budget] || '',\");$W"
rm -rf /tmp/b448-mut
