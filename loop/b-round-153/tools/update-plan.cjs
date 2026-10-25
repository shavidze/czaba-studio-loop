const fs = require('fs'); const P = '/home/runner/czaba-project/docs/technical/studio-real-workspace/plan.md';
const lines = fs.readFileSync(P, 'utf8').split('\n');
const h = lines.findIndex((l) => l.startsWith('**D-29z118 — Round 152-ის შედეგი'));
const o = lines.findIndex((l) => l.startsWith('**D-29z118:** round 153-ში'));
if (h < 0 || o < 0) throw new Error('anchor');
const block = [
  '**D-29z119 — Round 153-ის შედეგი; V-2b-1 — მზადაა; Round 154: V-2b-2 (წონები 600/700 → 500 და დარჩენილი timecode-ები mono-ზე).**',
  '',
  'C round 153 (`tmp/studio-real-loop/c-round-153.md`, `c-round-153.json`) — **PASS**, `browserVerified`/`realVerified` — true, ბაგი 0; gate 153 გამოქვეყნდა `037e25f`. RV-1-LABELS: 0 ვერტიკალური, 0 პანელი, 6 ჰორიზონტალური follower (მაქს. 26 px); LABEL-STYLE ორივე ეკრანზე; fake-Bearer 403 — BLOCKED (backend cloud-ში არ არის).',
  '- **R1 — წონები:** UI sans მხოლოდ 400/500. `app/components/arrangement/**`-ის ყველა `font-semibold`/`font-bold` (h1, Library h2, ჯგუფის სახელი და mix ღილაკები, Master Mute, ხაზის M/S) → `font-medium`; peak-ის over მდგომარეობის `font-medium` იშლება (mono 400). B-ის სიმულაცია (`tmp/studio-real-loop/b-round-153/out/v2b2sim-*.json`): მხოლოდ h1 dw −2 და „· Workspace“ dx −2, 0 ვერტიკალური, 0 clip. Plex Mono 300 არ ემატება.',
  '- **R2 — mono მხოლოდ spec-ის სიით (timecode, BPM, dB, საიდან/სადამდე):** ბიბლიოთეკის ხანგრძლივობები (შიდა span), ბიბლიოთეკის playhead, ruler-ის და tempo-row-ის ეტიკეტები (8 zoom-ზე 0 გადაფარვა, `rulerprobe-*.json`), clip-gain reset „0 dB“, ghost-ის დაწყების დრო. Sans რჩება: zoom readout (mono-ში 70 px > `w-16`), მთვლელები, 4/4, pan (TH8), select-ები. ბიბლიოთეკის preview-ის ხანგრძლივობა mono-ზე სათაურს ახლად წყვეტს (slack 0 → −6 px, `previewprobe-*.json`) → B-R153-PREVIEW-DUR, `awaiting_user` (a–c). საიდან/სადამდე წინადადებებში (range, არჩეული კლიპი, Export scope) → V-2b-3, შემდეგი ეტაპი (არ გადადებულა). მომხმარებელს შეუძლია უარყოს.',
  '- **R3 — Export-ის სათაური (24 px / 600)** დაცული `Modal.tsx`-დან მოდის; V-2b-DISPLAY-ის კითხვას უერთდება.',
  '- **R4 — css2 URL უცვლელია.** Instrument Sans 600/700 და Plex Mono 500-ის მოხსნა მხოლოდ C-ის WEIGHT-INVENTORY მტკიცებულებით (მთელ `/studio-lab` გვერდზე 0 მომხმარებელი; `body:has()` Instrument Sans-ს cookie banner-საც აძლევს).',
  '- **R5 — ტექსტის შინაარსი უცვლელია;** მხოლოდ კლასები და ერთი `<span className="font-mono">` ბიბლიოთეკის ხანგრძლივობის გარშემო (meta row-ის 2 შვილი და ზუსტი კლასი რჩება).',
  '- **R6 — round 154:** A — W1–W6, N1–N6, TH10, `render-budget` l.528, LRS-ის დამატებითი assertion-ები, doc 124 (სტატუსი), ახალი doc 125; მუტაციები m137–m140; C — WEIGHT-STYLE, MASTER-OVER, MONO-STYLE, RV-1-V2B2 (პროგნოზი: მხოლოდ gain reset dw +3), NO-CLIP/OVERLAP, LANE-GHOST, WEIGHT-INVENTORY, FONTS-SCOPED, FUNC-SMOKE, G154-3.',
  '- **R7 — შედეგი წინასწარ (round 155):** 2026-10-27-დან — ჯერ რეგრესია; C FAIL Medium+ ან რაუნდის საკუთარ row-ზე → შეზღუდული გასწორება; C PASS → V-2b-2 მზადაა (ბრაუზერის მტკიცებულებით), round 155 = V-2b-3 (+ css2-ის შემცირება, თუ WEIGHT-INVENTORY 0-ს აჩვენებს); V-2-ის საზღვარზე frontend-architect checkpoint-ის მოთხოვნა root-ს.',
  '',
];
const own = '**D-29z119:** round 154-ში A-ს ეკუთვნის 13 არსებული ფაილი და 1 ახალი (`tmp/studio-real-loop/b-round-153-r154-grants.txt`, `b-round-153-r154-new-files.txt`): `StudioWorkspace.tsx`, `ArrangementLibrary.tsx`, `ArrangementGroupHeader.tsx`, `ArrangementMaster.tsx`, `ArrangementLane.tsx`, `ArrangementLibraryPreview.tsx`, `ArrangementRuler.tsx`, `ArrangementTempoRow.tsx`, `ArrangementDetailPanel.tsx` (თითო კლასი/W-N row), `studio-theme-obsidian.test.tsx` (TH10), `render-budget.test.tsx` (l.528), `library-row-strings-ui.test.tsx` (assertion-ები), doc 124 (სტატუსი), ახალი doc 125. გაყინულია 959 (`b-round-153-r154-tree-sha256.txt`).';
lines.splice(o, 0, own);
lines.splice(h, 0, ...block);
fs.writeFileSync(P, lines.join('\n')); console.log('ok', h, o);
