# Plans Template

## განთავსება
`docs/plans/{წელი}/quarter-{I|II|III|IV}/NNN-short-description.md`

კვარტალები: I (იან-მარ), II (აპრ-ივნ), III (ივლ-სექ), IV (ოქტ-დეკ)

---

# [გეგმის სახელი]

## სტატუსი

| Field | Value |
|-------|-------|
| **სტატუსი** | `draft` / `approved` / `in-progress` / `completed` |
| **პრიორიტეტი** | `P0` (critical) / `P1` (high) / `P2` (medium) / `P3` (low) |
| **შექმნის თარიღი** | YYYY-MM-DD |
| **ავტორი** | — |

---

## კონტექსტი

რატომ არის ეს საჭირო? რა პრობლემას წყვეტს?

---

## მიდგომა

### ტექნიკური გადაწყვეტილება

რა მიდგომა აირჩიე და რატომ?

### ალტერნატივები

რა ალტერნატივები განიხილე?

---

## საკვანძო ფაილები

| ფაილი | ცვლილება |
|-------|---------|
| `app/components/...` | — |
| `app/contexts/...` | — |
| `app/routes/...` | — |

---

## ნაბიჯები

- [ ] ნაბიჯი 1
- [ ] ნაბიჯი 2
- [ ] ნაბიჯი 3

---

## ვერიფიკაცია

- [ ] `npm run check` — Biome lint + format
- [ ] `npm run build` — TypeScript compilation
- [ ] ვიზუალური ტესტირება
- [ ] Accessibility შემოწმება
- [ ] Mobile responsive
