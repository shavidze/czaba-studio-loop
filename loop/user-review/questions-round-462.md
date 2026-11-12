# კითხვა Saba-სთვის — round 462 (STORE-2b-3d-1)

## SABA-Q-ARTISTBIO-STATS. ArtistBioSection-ის სტატისტიკა (keep-list)
`questions-retro-450.md` Q6-ში B-მ დაწერა, რომ keep-list-ის შინაარსი მხოლოდ TestimonialsSection-შია. ეს არ იყო ზუსტი. `ArtistBioSection.tsx` ერთადერთი კომპონენტია, რომელიც აჩვენებს `NEWSLETTER_STATS`-ის სტატისტიკას: „Downloads“, „Products“ და „10K+ Happy Producers“. ის არცერთ გვერდზე არ ჩანს, რადგან route-ები მას არ იყენებს. keep-list კი ამბობს: „all other stats and claims“ — არ წაიშალოს და არ შეიცვალოს.

ამიტომ round 462 ArtistBioSection-ს **არ შლის**. წაიშლება მხოლოდ დანარჩენი 6 ფაილი: VideoShowcase, PianoLoadingAnimation, PianoCurtainLoader, CinemaCurtainLoader, audio/Timeline და `email.server.ts`. ArtistBioSection და TestimonialsSection შენს პასუხს ელოდება.

**კითხვა:**
- (a) წავშალოთ ArtistBioSection. ეს სტატისტიკა ისედაც არსად ჩანს.
- (b) დავტოვოთ, რომ შემდეგ STORE-3-ში ან STORE-5-ში თავიდან გამოვიყენოთ ახალ დიზაინში.
- (c) „10K+ Happy Producers“ About გვერდზე გადავიტანოთ. იქ ახლა „2,500+ Happy Customers“ წერია. ეს ორი რიცხვი ერთმანეთს ეწინააღმდეგება.

**Default:** (b). ფაილი რჩება და ლუპი არ ჩერდება.
