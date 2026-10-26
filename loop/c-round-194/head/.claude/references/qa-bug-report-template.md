# Regression acceptance rule

Acceptance tests assert the intended correct behavior and must fail before the fix and pass after it. A passing reproduction of a known defect is characterization evidence, not a quality gate. Label legacy characterization separately and track its unresolved issue; never count it as a fixed bug. Numeric email domains and minimum-length-only password policies are not automatically defects. Do not change product policy merely to make a test sound stricter.

# QA Bug Report & Tracking Templates

## Bug Report Format

ყოველი ნაპოვნი bug-ისთვის:

```markdown
## BUG-{NNN}: [მოკლე აღწერა]

**Severity:** Critical / High / Medium / Low
**Category:** Security / Logic / UX / Performance / Accessibility

### მდებარეობა
`app/path/file.tsx:LineNumber` — `ComponentName`

### პრობლემა
[რა არის არასწორად და რატომ]

### გამეორების სცენარი
1. [ნაბიჯი 1]
2. [ნაბიჯი 2]
3. [ნაბიჯი 3]

### გავლენა
[რა მოხდება — data loss? security breach? bad UX?]

### გამოსწორების რეკომენდაცია
[კოდის ფრაგმენტი ან მიდგომა]
```

## Bug Tracking

აუდიტის დასრულებისას **სავალდებულოდ** შეინახე ბაგები `docs/bugs/`-ში:

1. შექმენი `docs/bugs/{NNN}-{short-description}.md` (NNN = შემდეგი ნომერი)
2. ყოველ ბაგს მიანიჭე `BUG-{NNN}` ID, severity, სტატუსი
3. განაახლე `docs/bugs/README.md` — ახალი audit ცხრილში
4. Bug-Hunting ტესტები დაწერე `__tests__/bug-hunting/` ფოლდერში

## Bug-Hunting Test Format

```typescript
// ═══════════════════════════════════════════
//  BUG: [აღწერა]
//  Impact: [რა ეშლება მომხმარებელს]
// ═══════════════════════════════════════════
it("should_reject_invalid_input_REGRESSION", () => {
  // Arrange → Act → Assert
  // BUG: [რა ხდება] + FIX: [როგორ გამოსწორდეს]
});
```

**`_REGRESSION` suffix** = ტესტი ამოწმებს სწორ ქცევას და ფიქსამდე უნდა ჩავარდეს. ძველი `_BUG` characterization ფიქსის მტკიცებულება არ არის.

## ტესტის ორი დონე

| დონე | ფოლდერი | მიზანი |
|------|---------|--------|
| **Standard** | `__tests__/` | Happy path + basic error handling |
| **Bug Hunting** | `__tests__/bug-hunting/` | რეალური ბაგების პოვნა და დოკუმენტირება |

## QA Audit Output Format

```markdown
# QA Audit Report — CZABA Store — [თარიღი]

## Summary
- Critical: N
- High: N
- Medium: N
- Low: N
- Files scanned: N
- Routes audited: N

## Findings
[ყოველი bug severity-ს მიხედვით დალაგებული]

## პოზიტიური აღნიშვნები
[რა არის კარგად]

## Top 3 რეკომენდაცია
[ყველაზე მნიშვნელოვანი ცვლილებები]
```
