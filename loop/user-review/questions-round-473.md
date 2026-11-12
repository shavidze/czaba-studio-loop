# Saba-სთვის კითხვები — round 473 (B, 2026-11-12)

## Q1. ძველი (ნაყიდი) Studio-ს teal ფერები (SABA-Q-DPG-LEGACY-STUDIO-TEAL, D-29z1675)

- **ფაქტი:** DPG-P0-1-ის (round 474) შემდეგ Store-ის კოდში teal (hue 160–200°) აღარ რჩება. რჩება მხოლოდ ძველ, ნაყიდი ტრეკების Studio-ში (`/studio/$productId`):
  - `app/components/studio/StudioTrack.tsx:155` — waveform-ის progress `hsl(175, 85%, 46%)`;
  - `app/styles/studio.css` და `app/styles/pages/studio.css` — `.slider-thumb-teal` (`#14b8a6`, `#0d9488`), რომელსაც `VideoPlayer.tsx` იყენებს.
- **რატომ არ შეცვალა ლუპმა:** `components/studio/**` დაცულია, ხოლო ძველი Studio 2026-11-10-ის წესით გაყინულია (მასში ცვლილებები არ კეთდება, სანამ ახალი Studio არ ჩაანაცვლებს). ცვლილების browser-ით შემოწმება cloud-ში ვერ ხერხდება (backend და ავტორიზაცია არ არის).
- **კითხვა:** (a) ასე დარჩეს, სანამ ძველი Studio წაიშლება (SRW-21); თუ (b) ლუპმა ეს ფერები brass-ზე გადაიყვანოს (მხოლოდ ფერის მნიშვნელობები; root-ის grant დაცულ ფაილებზე)?
- **default, სანამ არ მიპასუხებ:** (a). DP-gate-ის ანგარიშში ეს სია მკაფიოდ იქნება ჩაწერილი, როგორც შეგნებული გამონაკლისი.

## Q2. „~100 teal“ რიცხვი (ინფორმაციისთვის)

- პირველი DP-gate-ის ანგარიშში ეწერა `app.css`-ში 61 rgba + 14 hsl. ეს რიცხვი ზუსტად ემთხვევა `app.css`-ის ყველა teal ფერს 2026-11-11-ის ვერსიაში (`a8599a2`, STORE-2b-3-მდე) — 61. ამის შემდეგ STORE-2b-მ უკვე 7 rgba + 6 hsl-მდე ჩამოიყვანა, ისიც მკვდარ კოდში. სავარაუდოდ, review ძველ ვერსიას ნახულობდა (მაგ. Vercel-ის preview-ს). დეტალები: `tmp/studio-real-loop/b-round-473/dpg-inventory.md`. root-ს ვთხოვე, მომდევნო gate-ის ანგარიშში commit მიუთითოს (ROOT-REQ-DPG-GATE-REPORT).
