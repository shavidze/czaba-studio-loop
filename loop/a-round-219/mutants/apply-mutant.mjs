import { readFileSync, writeFileSync } from 'node:fs';
const [name, mod, tst, notices] = process.argv.slice(2);
const edits = {
  a: [[mod, 'return combineOrClassifications(parts);', 'return combineAndClassifications(parts);']],
  b: [[mod, " || readTrueProperty(entry, 'dev')) {", ') {']],
  c: [[mod, '  return new SpdxExpressionParser(tokens)', "  if (/GPL/i.test(expression)) {\n    return 'copyleft';\n  }\n  return new SpdxExpressionParser(tokens)"]],
  d: [[mod, '      exception.name === runtimePackage.name && exception.version === runtimePackage.version,', '      exception.name === runtimePackage.name,']],
  e: [[notices, /^\| limiter \| 1\.1\.5 \|.*\n/m, '']],
  f: [[notices, /^\| limiter \| 1\.1\.5 \|.*\n/m, ''], [tst, 'await expect(renderThirdPartyNotices(realLock))', 'expect(renderThirdPartyNotices(realLock))']],
  g: [[mod, /(THIRD_PARTY_LICENSE_EXCEPTIONS: readonly ThirdPartyLicenseException\[\] = \[)[\s\S]*?\n\];/, (_m, head) => `${head}];`]],
};
for (const [path, from, to] of edits[name]) {
  const source = readFileSync(path, 'utf8');
  const next = source.replace(from, to);
  if (next === source) { throw new Error(`mutant ${name}: no change in ${path}`); }
  writeFileSync(path, next);
}
