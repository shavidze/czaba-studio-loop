# Saba-სთვის კითხვები — round 472 (B, 2026-11-12)

## Q1. მთავარ გვერდზე TestimonialsSection აღარ ჩანს (D-29z1670)

- **ფაქტი:** `app/components/home/TestimonialsSection.tsx` არსებობს, მაგრამ არც ერთი route არ იყენებს. C round 472-მა მთავარ გვერდზე ვერ იპოვა (HEAD-ზეც და ახალ ხეზეც).
- **საიდან:** შენმა commit-მა `a208b4c` („fix(store): restore previews and secure product purchasing flows“, 2026-10-02) `_index`-იდან ამოიღო — redesign-მდე. ლუპს ის არ წაუშლია.
- **keep-list:** „testimonials and stats“ შენარჩუნებული უნდა იყოს. Stats (`2,500+ Happy Customers` და სხვ.) `/about`-ზე ჩანს და უცვლელია.
- **კითხვა:** მთავარ გვერდზე testimonials-ის ბლოკი დავაბრუნოთ (STORE-3-ის რედიზაინში, მხოლოდ restyle), თუ 2026-10-02-ის ამოღება შეგნებული იყო და ასე დარჩეს?
- **default, სანამ არ გიპასუხებ:** ასე რჩება (არაფერი იცვლება); STORE-3-ის დაგეგმვისას ისევ გკითხავ.
