import fs from 'node:fs';
const [,, file, m] = process.argv;
let s = fs.readFileSync(file, 'utf8');
const guard = `      if (infoTags.length === 0) {\n        throw new Error('RIFF INFO tag is not available; custom fields were not written');\n      }\n`;
if (!s.includes(guard)) throw new Error('guard not found');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('miss ' + a); s = s.replace(a, b); };
if (m === 'M1') {
  rep(guard, '      if (infoTags.length > 0) {\n');
  rep("          // InfoTag write failed for this field\n        }\n      }\n    }\n", "          // InfoTag write failed for this field\n        }\n      }\n      }\n    }\n");
} else if (m === 'M2') {
  rep(guard, '');
  rep('    if (customFields.length > 0) {\n', "    if (getRiffInfoTags(file.tag).length === 0) {\n      throw new Error('RIFF INFO tag is not available; custom fields were not written');\n    }\n    if (customFields.length > 0) {\n");
} else if (m === 'M2b') {
  rep(guard, '');
  rep('    file.save();\n  } finally', "    if (getRiffInfoTags(file.tag).length === 0) {\n      throw new Error('RIFF INFO tag is not available; custom fields were not written');\n    }\n    file.save();\n  } finally");
} else if (m === 'M3') {
  rep(guard, '');
  rep('    file.save();\n  } finally', "    file.save();\n    if (customFields.length > 0 && getRiffInfoTags(file.tag).length === 0) {\n      throw new Error('RIFF INFO tag is not available; custom fields were not written');\n    }\n  } finally");
} else if (m === 'M4') {
  rep("custom fields were not written'", "custom fields were not writen'");
}
fs.writeFileSync(file, s);
