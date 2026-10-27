# Implementation Documentation Rule

კომიტის წინ, თუ ცვლილება მნიშვნელოვანია (არა typo, formatting, კომენტარის წაშლა):

1. **წაიკითხე** `docs/implementation/TEMPLATE.md` — სექციების სტრუქტურა და სტილი
2. **დაადგინე კვარტალი** — მიმდინარე თარიღის მიხედვით:
   - quarter-I (იან-მარ), quarter-II (აპრ-ივნ), quarter-III (ივლ-სექ), quarter-IV (ოქტ-დეკ)
3. **დაადგინე ნომერი** — `docs/implementation/{year}/quarter-{I|II|III|IV}/` ფოლდერში არსებული ფაილების მიხედვით sequential (001, 002, 003...)
4. **შექმენი implementation doc:**
   - Path: `docs/implementation/{year}/quarter-{I|II|III|IV}/{NNN}-{short-description}.md`
   - მაგალითი: `docs/implementation/2026/quarter-I/001-studio-audio-engine.md`
5. **სავალდებულო სექციები** (TEMPLATE.md-ის მიხედვით):
   - თარიღი, სტატუსი, შეცვლილი პროექტი
   - კონტექსტი — რატომ იყო საჭირო ცვლილება
   - მიდგომა — რა გადაწყვეტილება მივიღეთ და რა ალტერნატივები იყო
   - არქიტექტურა — Mermaid დიაგრამები (თუ საჭიროა)
   - შეცვლილი ფაილები — სია (კოდის ფრაგმენტები არა)
   - პრობლემები და გადაწყვეტები — Problem → Solution ფორმატი
   - ტესტირება — რა და როგორ დატესტილდა
   - TODO / შემდეგი ნაბიჯები
6. **ენა:** ქართულად, ტექნიკური ტერმინები ინგლისურად

## გამონაკლისები

ეს ცვლილებები **არ საჭიროებს** implementation doc-ს:

- Typo fix
- Formatting / code style
- კომენტარის წაშლა ან დამატება
- Dependency version bump (მხოლოდ patch)
- `.gitignore` ან config ცვლილება

## არ დაელოდო ინსტრუქციას

კომიტის წინ ავტომატურად შექმენი doc — არ იკითხო "გნებავთ implementation doc?"
