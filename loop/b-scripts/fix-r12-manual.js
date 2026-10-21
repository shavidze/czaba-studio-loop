const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'backlog.json');
const b = JSON.parse(fs.readFileSync(file, 'utf8'));
const m = b.tech_lead_manual_checks;
const entry = { id: 'R11-SB', what: 'auto-fit visible lane area with a real 10 px horizontal scrollbar (clientHeight - ruler - loop strip - row borders)', why: 'headless scrollbar is 0 px' };
if (Array.isArray(m)) {
  if (!m.some((x) => x && x.id === 'R11-SB')) m.push(entry);
} else if (m && typeof m === 'object') {
  m['R11-SB'] = entry;
} else {
  b.tech_lead_manual_checks = [entry];
}
fs.writeFileSync(file, `${JSON.stringify(b, null, 2)}\n`);
console.log('manual check added', Array.isArray(b.tech_lead_manual_checks) ? 'array' : typeof b.tech_lead_manual_checks);
