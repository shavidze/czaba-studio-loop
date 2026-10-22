import { readFileSync, writeFileSync } from 'node:fs';
const [, , root, id] = process.argv;
const dialog = `${root}/app/components/arrangement/ArrangementExportDialog.tsx`;
const mod = `${root}/app/lib/arrangement/dialog-tab-stops.ts`;
const swap = (file, from, to) => {
  const text = readFileSync(file, 'utf8');
  if (!text.includes(from)) throw new Error(`pattern missing for ${id}: ${from}`);
  writeFileSync(file, text.replace(from, to));
};
const muts = {
  a: () => swap(dialog, '} else if (!event.shiftKey && lastStop.includes(active)) {', '} else if (!event.shiftKey && active === focusable[focusable.length - 1]) {'),
  b: () => swap(mod, "element.type === 'radio' && element.name !== ''", "element.type === 'radio'") || swap(mod, 'return element.name;', "return 'radio';"),
  c: () => swap(mod, 'return checkedRadio ?? stop[0] ?? null;', 'return stop[0] ?? null;'),
  d: () => swap(dialog, '} else if (event.shiftKey && firstStop.includes(active)) {\n        target = dialogTabStopFocusTarget(lastStop);', '} else if (event.shiftKey && firstStop.includes(active)) {\n        target = focusable[focusable.length - 1] ?? null;'),
  e: () => swap(dialog, '} else if (!event.shiftKey && lastStop.includes(active)) {\n        target = dialogTabStopFocusTarget(firstStop);\n      }', '} else if (!event.shiftKey && lastStop.includes(active)) {\n        target = dialogTabStopFocusTarget(firstStop);\n      } else {\n        const index = stops.findIndex((stop) => stop.includes(active));\n        const next = stops[index + (event.shiftKey ? -1 : 1)];\n        target = next ? dialogTabStopFocusTarget(next) : null;\n      }'),
  f: () => swap(dialog, 'target = dialogTabStopFocusTarget(event.shiftKey ? lastStop : firstStop);', 'target = event.shiftKey ? (focusable[focusable.length - 1] ?? null) : dialogTabStopFocusTarget(firstStop);'),
};
muts[id]();
console.log(`applied ${id}`);
