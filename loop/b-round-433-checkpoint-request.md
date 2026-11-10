# არქიტექტურული checkpoint-ის მოთხოვნა — ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS (B, 2026-11-10, D-29z1535)

**ვისთვის:** root. გაუშვით read-only `frontend-architect` ფაილის `store/.claude/references/architecture-checkpoint.md` მიხედვით.
**დამბლოკავია?** არა. რაუნდი 434 (SABA-B-12 stage 3b, დიალოგის scrollbar) ამ შედეგს არ ელოდება.
**Baseline:** `0c22ac9` (gate 433). SABA-B-12-ის stage 1, 2a, 2b და 3 C-მ გაიარა და გამოქვეყნდა. Stage 3b მიმდინარეობს, stage 4 (selects) REVIEW-RECOMMENDATIONS-შია.

## რატომ ახლა
- რაუნდი 432-მა დაჰპირდა, რომ ეს მოთხოვნა stage 3-ის შემდეგ გაიგზავნებოდა. Stage 3 C round 433-მა გაიარა.
- ხუთმა რაუნდმა (430–434) ერთი და იგივე ნიმუში გაიმეორა: `studio-*.ts` class-constant მოდული, რომელსაც თავისი source-scan ტესტი აქვს.
- გაიმეორა ის A-ს reviewer-ებმაც და gate 431-ის review-მაც (ARCH-SIGNAL-STUDIO-CONTROLS).

## კითხვები (keep ან extract, ღირებულება, რისკი; თითოეულზე მაქსიმუმ 3 წინადადება)
1. **Class-constant მოდულები:** `studio-number-field`, `studio-radio`, `studio-progress`, `studio-scrollbar` (რაუნდი 434-დან `STUDIO_DIALOG_SCROLLBAR_CLASS`-ითაც), `studio-focus-ring` და `studio-soft-disabled`. სჯობს ასე დარჩეს, თუ საჭიროა `StudioRadio`/`StudioProgress`/`StudioSearchField` კომპონენტები ან ერთი `studio-controls` მოდული?
2. **Source-scan ტესტები:** PG2, SF2 და DS4 (რაუნდი 434) — თითოეულს თავისი regex ან tag scanner აქვს. ერთი საერთო JSX tag-scanner helper ხომ არ სჯობს? ცნობილი ბრმა წერტილები: RV432-5 (spread/style), TL-R433 SF2 (`{...props}`).
3. **Search field:** Library-ს და shortcut sheet-ს ძებნის ველი და Clear ღილაკი დუბლირებულია (`ArrangementLibrary.tsx:685-708`, `ArrangementShortcutSheet.tsx:146-168`; TL-R433-06). Refocus-ის წესი განსხვავებულია. საჭიროა თუ არა `StudioSearchField` `refocusPolicy` prop-ით, და როდის: ახლა თუ მესამე ველის გამოჩენისას?
4. **Shared `Modal.tsx`:** რაუნდი 434 მას ამატებს optional `scrollbarClassName` prop-ს (default: `styled-scrollbar`). Studio-ს დიალოგებისთვის ეს საკმარისია, თუ საჭიროა ცალკე `StudioDialog` wrapper (focus trap, Esc, scrollbar)?

## მტკიცებულებები
- `a-round-431.md`, `a-round-433.md` (For B); `gates/round-431/review.md`, `gates/round-433/review.md`.
- `backlog.json`: ARCH-SIGNAL-STUDIO-CONTROLS, TL-R433-06; `b-round-433/sketch-review.md` (TL-R434-*).

## შედეგის შემდეგ
Root შედეგს აფიქსირებს. დამტკიცებული ცვლილება ხორციელდება ცალკე B დავალებით: ერთი owner და ქცევის შემნახველი ტესტები. დამოუკიდებელი რიგი (COPY-PD-VIS, SYS-1, SYS-3, …) შედეგს არ ელოდება.
