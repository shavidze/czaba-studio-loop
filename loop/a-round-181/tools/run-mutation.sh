#!/usr/bin/env bash
set -u
ID="$1"
TARGET="$2"
PERL_EXPR="$3"
L=/home/runner/czaba-project/tmp/studio-real-loop
A=$L/a-round-181
M=$A/mutations
BACKUP=$A/out/$ID.backup
cp "$TARGET" "$BACKUP"
perl -0pi -e "$PERL_EXPR" "$TARGET"
diff -u --label "a/$TARGET" --label "b/$TARGET" "$BACKUP" "$TARGET" > "$M/$ID.diff"
if [ ! -s "$M/$ID.diff" ]; then
  echo "MUTATION $ID DID NOT APPLY"
  cp "$BACKUP" "$TARGET"
  exit 2
fi
npx vitest run $(cat "$L/b-round-180-r181-vitest-base.txt") --reporter=json --outputFile="$A/out/$ID-vitest.json" > "$A/out/$ID-vitest.log" 2>&1
cp "$BACKUP" "$TARGET"
RESTORE=$(sha256sum -c --quiet "$A/end-sha256.txt" >/dev/null 2>&1 && echo OK || echo FAIL)
node -e '
const fs = require("fs");
const [id, target, json, out, restore] = process.argv.slice(1);
let r;
try { r = JSON.parse(fs.readFileSync(json, "utf8")); } catch (e) { r = null; }
const files = {};
const failedTests = [];
if (r) {
  for (const f of r.testResults) {
    const rel = f.name.replace(/^.*\/store\//, "");
    const failed = f.assertionResults.filter((a) => a.status === "failed").map((a) => a.title);
    files[rel] = { status: f.status, failed: failed.length, passed: f.assertionResults.filter((a) => a.status === "passed").length, message: f.assertionResults.length === 0 ? (f.message || "").slice(0, 400) : undefined };
    for (const t of failed) failedTests.push(rel.split("/").pop() + " :: " + t);
  }
}
const summary = { id, target, restoreSha: restore, totals: r ? { passed: r.numPassedTests, failed: r.numFailedTests, total: r.numTotalTests } : null, redFiles: Object.keys(files).filter((k) => files[k].status !== "passed"), failedTests, files };
fs.writeFileSync(out, JSON.stringify(summary, null, 2) + "\n");
console.log(JSON.stringify({ id, restore, totals: summary.totals, redFiles: summary.redFiles, failedTests }, null, 1));
' "$ID" "$TARGET" "$A/out/$ID-vitest.json" "$M/$ID.json" "$RESTORE"
rm -f "$BACKUP"
