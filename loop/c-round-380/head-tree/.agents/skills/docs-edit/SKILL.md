---
name: docs-edit
description: Conventions for editing markdown documentation files in the Czaba project. Use from main chat instead of dispatching a docs agent.
---

# Docs Edit

markdown ფაილების რედაქტირება პირდაპირ chat-ში — docs agent-ის გარეშე.

## პროცესი

1. **Read** — წაიკითხე სამიზნე ფაილი მთლიანად სანამ რაიმეს შეცვლი
2. **Identify** — დაადგინე რომელ section-ს ეხება ცვლილება
3. **Edit** — შეცვალე მხოლოდ relevant section, structure გაუხელი
4. **Verify** — გადაამოწმე headings hierarchy, links, table formatting

## Czaba დოკუმენტაციის სტანდარტი

- **ენა:** ქართული. ტექნიკური ტერმინები ინგლისურად.
- **ფაილები:** `docs/` ფოლდერებში, არა კოდში
- **Headings:** H1 = ფაილის სათაური, H2 = ძირითადი სექციები, H3 = ქვესექციები
- **Tables:** alignment სვეტების მიხედვით
- **Code blocks:** ენა ყოველთვის (` ```bash`, ` ```csharp`, ` ```tsx`)
- **Implementation docs:** `docs/implementation/{year}/quarter-{I|II|III|IV}/`
- **Plan docs:** `docs/plans/{year}/quarter-{I|II|III|IV}/`
- **Bug docs:** `docs/bugs/{year}/quarter-{I|II|III|IV}/`

## არ გააკეთო

- ახალი section-ები ისე, რომ ძველი სტრუქტურა არ გაიგე
- Style-ის შეცვლა content-ის ნაცვლად
- docs-ის ჩაწერა კოდში comments-ის სახით
