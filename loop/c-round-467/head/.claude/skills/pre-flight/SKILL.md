---
name: pre-flight
description: Pre-coding discipline checklist before any non-trivial implementation work. TRIGGER when about to implement a feature, write >30 lines, add a new file, refactor, or introduce abstractions. Forces explicit assumptions, simplicity test, surgical scope, and verifiable success criteria.
---

# Pre-flight Checklist

კოდის წერის წინ გაიარე ეს checklist **ხმამაღლა chat-ში**. ნუ გამოტოვებ ნაბიჯებს.

## 1. Assumptions

ჩამოაყალიბე 2-4 assumption request-ის შესახებ:

> Assumptions:
> - request-ი ნიშნავს X-ს და არა Y-ს
> - არსებული ქცევა არის …
> - success path არის …

თუ რომელიმე assumption ორაზროვანია — **გაჩერდი და იკითხე**. ნუ აირჩევ ჩუმად.

## 2. Simplicity Test

უპასუხე თითოეულს ერთი წინადადებით:

- **Smallest version:** მინიმუმ კოდი, რომელიც ამოხსნის literal ask-ს? (target: <50 ხაზი)
- **No-abstraction check:** ვამატებ class, interface, helper, ან config knob-ს, რომელიც მხოლოდ ერთ ადგილს იყენებს *დღეს*? თუ კი — inline-ში ჩადე.
- **Cut list:** რა თითქმის დავამატე მაგრამ required არ არის? (დაასახელე, შემდეგ გამოტოვე)

## 3. Surgical Scope

თითოეული ფაილისთვის, რომლის შეხებაც გეგმავ, ახსენი *რატომ მოითხოვს ეს request ამ ფაილს*. თუ ვერ ახსნი ერთი ხაზით — scope-creep; გამოტოვე.

Banned drive-bys: reformatting, unrelated rename, dead code cleanup, "while I'm here" refactors. Match existing style.

## 4. Success Criteria (კოდამდე განსაზღვრე)

- **Backend (.NET):** რომელი test filter გაივლის? რომელი request რა status/body-ს დაბრუნებს?
- **Frontend (Remix/React):** რომელი გვერდი შეცდომის გარეშე გახსნის? რომელი action რა შედეგს გამოიღებს?
- **Migration/schema:** generated SQL როგორ გამოიყურება?

თუ ვერ ასახელებ verification command-ს **კოდამდე** — გაჩერდი და განსაზღვრე.

## 5. Verify (შემდეგ)

კოდის დაწერის შემდეგ:
1. გაუშვი §4-ის verification command. "Compiles" ≠ "works".
2. `git status` — მხოლოდ intended ფაილები staged-ში.
3. `git log --oneline -1` — confirm commit hash.

## Output back to user

კოდის წერის წინ გამოაქვეყნე:

> **Pre-flight gate:**
> - Assumptions: …
> - Smallest version: … (~N ხაზი)
> - Files to touch: … (რატომ თითოეული)
> - Success: passes `<command>` returning `<expected>`

შემდეგ გააგრძელე. თუ რომელიმე gate-მა შეკითხვა გააჩინა — გაგრძელებამდე იკითხე.
