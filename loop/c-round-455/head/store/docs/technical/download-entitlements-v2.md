# ჩამოტვირთვის უფლებები და R2 ტოკენი v2

## რას ცვლის

Standard-ის მყიდველი იღებს მხოლოდ მისთვის დაშვებული ფაილის ბმულს. URL-ში `standart.zip`-ის `premium.zip`-ით ან `/download/`-ის `/studio/`-თი შეცვლა აღარ მუშაობს. ტოკენი შეიცავს კონკრეტულ R2 key-ებს, დანიშნულებას და ვადას; ეს ყველაფერი HMAC ხელმოწერით მოწმდება.

შეკვეთის შექმნისას backend ამოწმებს, რომ variant ნამდვილად ეკუთვნის არჩეულ პროდუქტს. ფასს და Standard/Premium უფლებას იღებს variant-იდან; კლიენტის `LicenseType` უფლებას ვერ ზრდის. უცნობი variant სახელები checkout-ზე უარყოფილია: მათი უფლებების ინტერპრეტაცია ცალკე შეთანხმებას საჭიროებს.

## გადახდილი შეკვეთები

Download service ითვალისწინებს მხოლოდ Paid შეკვეთებს, რომლებიც არც Refunded და არც Cancelled მდგომარეობაშია. თითოეული პოზიცია უნდა უკავშირდებოდეს პროდუქტის რეალურ variant-ს. ისტორიული, დაკარგული ან უცხო variant ID ავტომატურად Premium უფლებას ვერ მიიღებს. ასეთი ჩანაწერი ჩამონათვალში unavailable რჩება.

რამდენიმე შენაძენისას ყველაზე მაღალი მოქმედი უფლება ინახება: გვიან შეძენილი Standard ადრეულ Premium-ს აღარ ფარავს. ძველი `/api/downloads/{productId}` endpoint-იც იმავე უფლებას იყენებს და ქმნის `{handle}/Downloads/standart.zip` ან `{handle}/Downloads/premium.zip` ბმულს. `standart.zip` არსებული ფაილის სახელია და განზრახ შენარჩუნებულია. კატეგორიის ძველ მისამართზე fallback აღარ არსებობს.

ეს ნაკადი იყენებს აღნიშნულ canonical ZIP სახელებს; სხვა სახელით შენახული ან variant-ის `FileUrl`-ში მითითებული პაკეტის მიწოდება ამ კონტრაქტში ჯერ არ არის მხარდაჭერილი. არქივის გასაღებები განთავსებამდე უნდა გადამოწმდეს. ისტორიული შეძენების ხელით გასწორება უნდა ეყრდნობოდეს გადახდის სანდო მონაცემებს; კლიენტის ძველი LicenseType მტკიცებულება არ არის.

## ტოკენის კონტრაქტი

ხელმოწერილი ტექსტი არის JSON array შემდეგი რიგით:

```json
[2,"download","shopping-mall-ambience","user-reference",1790000000000,["shopping-mall-ambience/Downloads/standart.zip"]]
```

Payload ველები: `version`, `purpose`, `productHandle`, `userId`, `expiresAt`, `resourceKeys`, `signature`. `signature` არის HMAC-SHA256 Base64; მთელი UTF-8 JSON payload ასევე Base64-ით იკოდება და query-ში URL encoding სჭირდება. `userId` ამ ნაკადში გადამოწმებული access token-ის ერთმხრივი SHA-256 reference-ია; ავტორიზაციას backend პასუხი განსაზღვრავს.

- download ვადა: 15 წუთი.
- studio ვადა: 2 საათი.
- Studio endpoint: `GET /api/studio-token?product=handle&file=Drums.wav&file=Bass.wav`.
- თითო ტოკენში მაქსიმუმ 100 კონკრეტული ფაილია.
- ფაილის სახელი ვერ შეიცავს slash-ს, backslash-ს ან საკონტროლო სიმბოლოებს.
- Studio უფლება მხოლოდ შესაბამისი პროდუქტის Premium მყიდველს აქვს; development გამონაკლისი გაუქმებულია.
- ხელმოწერის საიდუმლო სავალდებულოა. კოდში fallback secret არ არსებობს.
- დაცული პასუხები და ტოკენის პასუხები არ ინახება cache-ში.

## განთავსების რიგი

1. გადაამოწმეთ backend-ის ახალი checkout და entitlement ლოგიკა, შესაბამისი მონაცემთა სქემა და არსებული გადახდილი variant კავშირები.
2. Store-ის `R2_TOKEN_SECRET` და Worker-ის `TOKEN_SECRET` უნდა ემთხვეოდეს. მათი მნიშვნელობები არ ჩაწეროთ დოკუმენტებში ან log-ებში.
3. განაახლეთ მოქმედი R2 Worker ახალი კონტრაქტით. ორივე წყარო, `workers/r2-proxy.js` და `cloudflare/r2-worker.js`, ერთნაირად ამოწმებს უფლებებს.
4. განაახლეთ Store issuer და Studio კლიენტი. Worker-ისა და Store-ის განახლებებს შორის ძველი ბმულები დროებით უარყოფილი იქნება; მოემზადეთ მოკლე შეთანხმებული განახლებისთვის.
5. ძველი ბმულები ხელახლა მოითხოვეთ Store-დან. v1 ტოკენების მიღების დაბრუნება უსაფრთხო rollback არ არის; შეცდომისას დახურეთ ჩამოტვირთვა შეკეთებამდე.
6. სატესტო მყიდველით გადაამოწმეთ: Standard წარმატებულია, იმავე ბმულით Premium და Studio უარყოფილია; Premium-ის Studio ტოკენი ჩამოთვლილ stem-ს ხსნის და ZIP-ს ვერ ხსნის.

ამ ცვლილებით Worker ავტომატურად არ განთავსებულა და რეალური გადახდა/ჩამოტვირთვა production-ში არ შესრულებულა.

## ადგილობრივი შემოწმებები

```powershell
node --test workers/r2-proxy.test.mjs
npm run test:run -- app/lib/__tests__/r2-tokens.server.test.ts app/lib/__tests__/download-routes.test.ts
```

Backend-ში `dotnet test` და `dotnet build` ამოწმებს შეკვეთისა და ჩამოტვირთვის უფლებებს. ტესტებში R2 bucket და მონაცემთა ბაზის ჩაწერა ჩანაცვლებულია; ისინი რეალურ storage object-ის არსებობას ვერ ადასტურებს.
