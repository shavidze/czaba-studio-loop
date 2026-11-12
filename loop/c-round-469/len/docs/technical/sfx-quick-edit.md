# Sound Effects Quick Edit

კოლექციის მფლობელი ჩანაწერების კატალოგში (`/recordings/:productId`) ირჩევს **Quick Edit**-ს. რედაქტორი დამოუკიდებელია მუსიკალური Studio-სგან. SFX-ის Universal ლიცენზიაზე გადასვლისას არსებული Standard და Premium მყიდველებიც ინარჩუნებენ წვდომას.

## 12-წამიანი მონაკვეთის მომზადება

1. გახსენი Shopping Mall Ambience-ის ჩანაწერი.
2. Selection start ჩაწერე `1`, Selection end — `13`. დროები წამებშია; სიზუსტე მილიწამამდეა.
3. შეცვალე Level, Fade In და Fade Out.
4. Play selection მხოლოდ მონაკვეთს უკრავს. Seek გადადის მონაკვეთში; Loop selection იმეორებს მას.
5. Undo აბრუნებს წინა ცვლილებას; Reset აღადგენს სრულ ჩანაწერს, საწყის დონეს და ნულოვან Fade-ებს.
6. Download WAV ჩამოტვირთავს 24-bit PCM WAV-ს, ორიგინალის sample rate-ითა და არხებით. სახელი შეიცავს ჩანაწერის სათაურსა და მონაკვეთის საზღვრებს.

## ორიგინალი და წვდომა

Backend-ის `original-access` endpoint ამოწმებს მოქმედ SFX საკუთრებას და ჩანაწერის შესაბამის პროდუქტსა და ვარიანტს. გადახდისა და დაბრუნების სტატუსი მოდის არსებული DownloadService-დან. მუსიკის ლიცენზიების იერარქია შენარჩუნებულია.

ორიგინალი ინახება `{handle}/OriginalRecordings/premium-{sourceKey}.wav` მისამართზე. `premium-` არსებული ფაილების ტექნიკური სახელია; Universal ლიცენზია იმავე ორიგინალს იყენებს. შეკუმშულ ასლზე fallback არ არსებობს.

Remix-ის `/api/recording-original` endpoint საკუთრების შემოწმების შემდეგ გასცემს 302 გადამისამართებას Cloudflare Worker-ის `/originals/` მისამართზე. `original` დანიშნულების HMAC ტოკენი მოქმედებს ხუთი წუთით და მხოლოდ ერთ ზუსტ `OriginalRecordings` ფაილზე. WAV პირდაპირ Worker-იდან მოდის `private, no-store` რეჟიმში; დიდი აუდიო აღარ გაივლის Vercel-ს და ეს გზა S3 გასაღებებს აღარ ეყრდნობა. რედაქტორი კითხულობს PCM WAV-ის სემპლებს პირდაპირ, sample rate-ის გადაყვანის გარეშე. Gain და ხაზოვანი Fade ერთ დამუშავებაში გამოიყენება; 24-bit-ზე დამრგვალებული იგივე სემპლები გამოიყენება მოსმენასა და ექსპორტში. გადაჭარბებული დონე იზღუდება WAV-ის დიაპაზონში. Fade-ის ხანგრძლივობა დამუშავებისას მონაკვეთის სიგრძით იზღუდება. საწყისი ფაილი უცვლელია.

## Shopping Mall-ის ორიგინალების მიწოდება

მოქმედი R2 კონფიგურაციით გაუშვი პროექტის root-იდან:

```powershell
python backend/scripts/provision-sfx-originals.py tmp/sfx-shopping-mall/manifest.json --settings backend/Czaba.Api/appsettings.Development.json
```

სკრიპტი შეძენილი ორიგინალი არქივიდან ამოღებულ WAV-ებს ატვირთავს, ზომას და SHA-256 metadata-ს ამოწმებს; განსხვავებულ არსებულ ფაილს არ გადაწერს. საჭიროა Python `boto3`. გასაღებები მოდის settings ფაილიდან და არ იბეჭდება.

## შემოწმება

```powershell
cd store
npx vitest run app/lib/__tests__/sfx-edit.test.ts app/lib/__tests__/recording-original-route.test.ts app/lib/__tests__/recording-stream-route.test.ts app/hooks/__tests__/useRecordingPlayer.test.ts
npx tsc --noEmit
npm run build
```

Backend-ში:

```powershell
cd backend
dotnet test Czaba.Application.Tests --filter FullyQualifiedName~ProductRecordingServiceTests
dotnet build
```

ტესტი ამოწმებს 96 kHz stereo 12-წამიან შედეგს, Gain/Fade-ებს, ორიგინალის უცვლელობას და მოსასმენი სემპლების ექსპორტთან ზუსტ თანხვედრას. ცალკე მოწმდება საკუთრების გარეშე წვდომის უარყოფა და ორიგინალის არქონისას შეკუმშული ასლის გამოუყენებლობა.

გრძელი ორიგინალი სრულად იტვირთება ბრაუზერის მეხსიერებაში. რეალურ მობილურ მოწყობილობაზე დიდი ფაილის ჩატვირთვა დამატებით უნდა შემოწმდეს. რამდენიმე ხმის შერევა და Scene Builder ამ ეტაპზე არ შედის.
