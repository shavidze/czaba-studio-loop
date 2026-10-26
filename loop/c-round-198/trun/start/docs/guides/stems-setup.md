# Studio Stems - Setup Guide

## Overview

სტუდიოში სტემების გამოსაჩენად საჭიროა:

1. **R2-ში** ატვირთო სტემების WAV ფაილები
2. **Shopify-ში** პროდუქტზე დაამატო metafields სტემების ინფორმაციით

---

## 1. R2 Bucket სტრუქტურა

```
/{product-handle}/
  /Studio-Assets/
    {file1}.wav
    {file2}.wav
    ...
```

### მაგალითი:

```
/middle-east/
  /Studio-Assets/
    Bass Drum.wav
    Bass.wav
    Didgeridoo.wav
    Dombra Aux Left.wav
    ...
/epic-cinematic/
  /Studio-Assets/
    Drums Main.wav
    Strings Layer.wav
    Brass Section.wav
    ...
```

### წესები:

- ფოლდერის სახელი = პროდუქტის **handle** (URL-ში რაც წერია)
- ფაილებს შეგიძლია ნებისმიერი სახელი დაარქვა
- ფორმატი: `.wav` (აუცილებელი)

---

## 2. Shopify Metafields Setup

### ნაბიჯი 1: Metafield Definition-ების შექმნა

1. გახსენი: **Shopify Admin → Settings → Custom data → Products**
2. დააჭირე **Add definition**

#### Definition 1: stems_folder

| Field             | Value                                               |
| ----------------- | --------------------------------------------------- |
| Name              | Stems Folder                                        |
| Namespace and key | `studio.stems_folder`                               |
| Type              | **Single line text**                                |
| Description       | R2-ში ფოლდერის სახელი (ჩვეულებრივ პროდუქტის handle) |

#### Definition 2: stems

| Field             | Value                      |
| ----------------- | -------------------------- |
| Name              | Stems                      |
| Namespace and key | `studio.stems`             |
| Type              | **JSON**                   |
| Description       | სტემების სია JSON ფორმატში |

---

## 3. პროდუქტზე Metafields-ის დამატება

### ნაბიჯი 1: გახსენი პროდუქტი

**Shopify Admin → Products → [პროდუქტი] → Metafields**

### ნაბიჯი 2: შეავსე Metafields

#### Stems Folder:

```
middle-east
```

#### Stems (JSON):

```json
[
  {
    "file": "Bass Drum.wav",
    "name": "Bass Drum",
    "order": 1
  },
  {
    "file": "Bass.wav",
    "name": "Bass",
    "order": 2
  },
  {
    "file": "Didgeridoo.wav",
    "name": "Didgeridoo",
    "order": 3
  },
  {
    "file": "Dombra Aux Left.wav",
    "name": "Dombra Aux Left",
    "order": 4
  },
  {
    "file": "Dombra Aux Right.wav",
    "name": "Dombra Aux Right",
    "order": 5
  },
  {
    "file": "Dombra Rithm.wav",
    "name": "Dombra Rithm",
    "order": 6
  },
  {
    "file": "Duduk.wav",
    "name": "Duduk",
    "order": 7
  },
  {
    "file": "East Zurna.wav",
    "name": "East Zurna",
    "order": 8
  },
  {
    "file": "Electric Guitar.wav",
    "name": "Electric Guitar",
    "order": 9
  },
  {
    "file": "Electric Guitar 2.wav",
    "name": "Electric Guitar 2",
    "order": 10
  }
]
```

---

## 4. JSON სტრუქტურა

### თითოეული stem ობიექტი:

| Key     | Type   | Description                        | მაგალითი          |
| ------- | ------ | ---------------------------------- | ----------------- |
| `file`  | string | R2-ში ფაილის სახელი (extension-ით) | `"Bass Drum.wav"` |
| `name`  | string | Studio-ში გამოსაჩენი სახელი        | `"Bass Drum"`     |
| `order` | number | რიგითობა (1, 2, 3...)              | `1`               |

### სრული მაგალითი:

```json
[
  { "file": "drums_kick.wav", "name": "Kick Drum", "order": 1 },
  { "file": "drums_snare.wav", "name": "Snare", "order": 2 },
  { "file": "bass_main.wav", "name": "Bass Guitar", "order": 3 },
  { "file": "synth_pad_01.wav", "name": "Atmospheric Pad", "order": 4 }
]
```

**შენიშვნა:** `file` და `name` შეიძლება განსხვავებული იყოს!

---

## 5. URL-ის ფორმირება

Frontend ავტომატურად აგენერირებს URL-ს:

```
https://pub-7b0efa7da5324b45a8eb64027c6d08ac.r2.dev/{stems_folder}/Studio-Assets/{file}
```

### მაგალითი:

```
stems_folder: "middle-east"
file: "Bass Drum.wav"

URL: https://pub-7b0efa7da5324b45a8eb64027c6d08ac.r2.dev/middle-east/Studio-Assets/Bass%20Drum.wav
```

---

## 6. ახალი პროდუქტის დამატების Workflow

### Checklist:

- [ ] **1. R2-ში ფოლდერის შექმნა**

  - შექმენი ფოლდერი: `/{product-handle}/Studio-Assets/`

- [ ] **2. WAV ფაილების ატვირთვა**

  - ატვირთე ყველა stem ფაილი ფოლდერში

- [ ] **3. Shopify-ში პროდუქტის შექმნა**

  - დაამატე პროდუქტი ჩვეულებრივად

- [ ] **4. Metafields-ის შევსება**

  - `stems_folder` = ფოლდერის სახელი
  - `stems` = JSON სტემების სიით

- [ ] **5. ტესტირება**
  - გახსენი: `/studio/{product-handle}`
  - შეამოწმე ყველა stem იტვირთება

---

## 7. Troubleshooting

### პრობლემა: სტემები არ იტვირთება

1. **შეამოწმე R2 URL:**

   - გახსენი პირდაპირ ბრაუზერში
   - `https://pub-7b0efa7da5324b45a8eb64027c6d08ac.r2.dev/{folder}/Studio-Assets/{file}`

2. **შეამოწმე ფაილის სახელი:**

   - JSON-ში `file` უნდა ემთხვეოდეს R2-ში ფაილის სახელს
   - ყურადღება: დიდი/პატარა ასოები, სფეისები

3. **შეამოწმე JSON ვალიდურობა:**
   - გამოიყენე: https://jsonlint.com/

### პრობლემა: 404 Error

- ფოლდერის სახელი არასწორია
- ფაილის სახელი არ ემთხვევა
- R2 Public Access გამორთულია

---

## 8. მომავალი გაუმჯობესებები (TODO)

- [ ] Shopify Admin-ში custom app სტემების მართვისთვის
- [ ] Drag & drop ინტერფეისი სტემების რიგითობისთვის
- [ ] ავტომატური ფაილების ვალიდაცია
