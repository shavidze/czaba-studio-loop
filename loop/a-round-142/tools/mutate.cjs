const fs = require('node:fs');
const [file, from, to] = process.argv.slice(2);
const src = fs.readFileSync(file, 'utf8');
const count = src.split(from).length - 1;
if (count !== 1) { console.error(`MUTATION ANCHOR COUNT ${count} in ${file}`); process.exit(2); }
fs.writeFileSync(file, src.replace(from, to));
console.log(`mutated ${file}`);
