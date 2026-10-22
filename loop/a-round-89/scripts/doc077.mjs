import { readFileSync, writeFileSync } from 'node:fs';
const file = process.argv[2];
let text = readFileSync(file, 'utf8');
const lines = text.split('\n');
if (!lines[3].startsWith('**სტატუსი:** Round 88')) throw new Error('l.4 mismatch');
lines[3] = '**სტატუსი:** Round 89 — C round 88: sticky footer PASS (R87-PROGRESS-BELOW-FOLD-1280); ძველი Tab-trap ბაგი R88-FOCUS-ESCAPE-RENDER გასწორდა radio-ჯგუფის Tab stop-ებით, C-ის შემოწმებას ელოდება (D-29z54)';
text = lines.join('\n');
const insertAfter = (anchor, line) => {
  const at = text.indexOf(anchor);
  if (at < 0 || text.indexOf(anchor, at + 1) >= 0) throw new Error(`anchor not unique: ${anchor.slice(0, 40)}`);
  const end = text.indexOf('\n', at);
  text = `${text.slice(0, end + 1)}${line}\n${text.slice(end + 1)}`;
};
insertAfter('- Round 88: `ArrangementExportDialog.tsx` — სტატუსი,', '- Round 89: `ArrangementExportDialog.tsx` — `handleDialogTabKey` Tab stop-ებზე მუშაობს. ახალი pure მოდული: `app/lib/arrangement/dialog-tab-stops.ts` (`groupDialogTabStops`, `dialogTabStopFocusTarget`).');
insertAfter('- **პრობლემა (C round 87, R87-PROGRESS-BELOW-FOLD-1280):**', '- **პრობლემა (C round 88, R88-FOCUS-ESCAPE-RENDER):** რენდერის დროს dialog-ში enabled რჩება მხოლოდ X და ფორმატის radio-ები, ამიტომ trap-ის ბოლო ელემენტი `both` radio იყო. ბრაუზერში radio-ჯგუფი ერთი Tab stop-ია: მონიშნული `wav`-იდან ან `mp3`-იდან Tab ჯგუფს და dialog-საც ტოვებდა, trap კი ელემენტზე დაფუძნებული (`active === last`) იყო და არ ერთვებოდა. → **გადაწყვეტა:** trap Tab stop-ებზე მუშაობს: ერთი `name`-ის radio-ები ერთ stop-შია, ბოლოებზე focus stop-ის მონიშნულ radio-ზე გადადის (მის არქონისას — პირველ წევრზე). შუა Tab-ები ისევ native რჩება, ფორმატის radio-ები კი რენდერის დროს ისევ enabled-ია (D-29z52).');
insertAfter('- Round 88: FT1–FT4 (`export-dialog-footer.test.tsx`)', '- Round 89: TS1–TS2 და TR1–TR6 (`export-dialog-tab-stops.test.tsx`) ამოწმებს stop-ების დაჯგუფებას, target-ს და Tab/Shift+Tab-ს რენდერისას (WAV, MP3, WAV + MP3) და idle-ში. jsdom Tab-ზე focus-ს არ გადაადგილებს, ამიტომ ტესტები `defaultPrevented`-სა და trap-ის მიერ დაყენებულ focus-ს ამოწმებს. ექვსივე mutation proof (B-ის (a)–(f)) და round 88-ის dialog წითელია.');
writeFileSync(file, text);
