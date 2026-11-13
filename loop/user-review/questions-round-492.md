# კითხვები Saba-სთვის: round 491 → 492 დაგეგმვა (2026-11-13)

ავტორი: B. მტკიცებულება: `b-round-491/probe/` და `b-round-491.md`. ლუპი პასუხს არ ელოდება. Round 492 „Change Password“ ფანჯარას accessibility-ის თვალსაზრისით ასწორებს. პაროლის შეცვლის ლოგიკას ის არ ეხება.

## Q1. პაროლის შეცვლა ვერასდროს ხერხდება (B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED, High)

- **რა ხდება:** `/account`-ზე „Click to change password“ → სწორი მნიშვნელობები → „Update Password“. `app/lib/auth.ts`-ის `updatePassword` ჯერ მიმდინარე პაროლს login-ით ამოწმებს. ამის შემდეგ ყოველთვის აგდებს შეცდომას „Password change is not yet implemented. Please use the forgot password feature.“ ამიტომ ეს ფუნქცია მომხმარებლისთვის არასდროს მუშაობს.
- **შემოწმება:** B-ის production build, signed-in stub, login stub 200. შეცდომა ჩნდება 1440, 1280 და 375 px-ზე (`b-round-491/probe/headprod-pw.json`, R9).
- **რატომ არ ვასწორებთ თავად:**
  - `auth.ts` დაცული ფაილია;
  - საჭიროა backend-ის (.NET) ავტორიზებული endpoint, რომელიც cloud-ში არ გვაქვს.
- **ვარიანტები:**
  - (a) backend-ში endpoint ემატება, ხოლო `auth.ts`-ის გამოძახებას root ან თქვენ ცვლით ლუპის გარეთ;
  - (b) endpoint-მდე „Click to change password“ forgot-password flow-ზე გადადის, ან იმალება;
  - (c) დარჩეს, როგორც არის. შეცდომა ახლა ხმამაღლა ცხადდება (round 492).
- **რეკომენდაცია:** (a). მანამდე (b) უფრო პატიოსანია, ვიდრე ღილაკი, რომელიც ყოველთვის შეცდომით მთავრდება.
