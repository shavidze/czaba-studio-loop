# PERF-14b-i: perf harness-ები clip-ებს model-იდან ითვლის, რომ clip virtualization შეძლოს (round 399–400)

**თარიღი:** 2026-11-08
**სტატუსი:** In Progress (stage 2 of 4; C round 400 PASS)
**შეცვლილი პროექტი:** Store (`perf/lib/page.ts`, `perf/studio-lab-interactions.perf.spec.ts`, `perf/studio-lab-resources.perf.spec.ts`, `perf/studio-lab-scale.perf.spec.ts`, `perf/budgets.interactions.json`, `perf/budgets.resources.json`, `perf/budgets.scale.json`). `app/**` არ შეცვლილა.

## კონტექსტი

PERF-14 ოთხ ეტაპადაა დაყოფილი: 14a (scale harness და lane-ის `data-clip-count`, doc 254), 14b-i (ეს doc), 14b-ii (clip virtualization lane-ში) და 14c (peak pyramid და canvas tiles).

B-ის virtualization sketch-ზე (`tmp/studio-real-loop/b-round-398/sketch-14bii-lane.patch.txt`) lane მხოლოდ page window-ის clip-ებს ხატავს. ამის შემდეგ ორი perf spec ვეღარ სრულდებოდა (`tmp/studio-real-loop/b-round-398/perf-sketch-studio-lab-interactions.log`, `…-resources.log`):

- **interactions:** group setup-ში Ctrl+D-ის შემდეგ `toHaveCount(2)` mount-ებულ clip-ებს ელოდებოდა. ასლი default zoom-ზე 4566 px-ზე იწყება (lane area 512–1440 px, 1440×900), page window-ის გარეთაა და mount-ებული არ არის, ამიტომ pass abort-დებოდა.
- **resources:** Ctrl+D-ის შემდეგ 2 mount-ებულ clip-ს ელოდებოდა; `res.harness.clips-2` = 1 და export 2 არ სრულდებოდა.

ორივე spec-ში clip-ების რაოდენობა DOM-ით იკითხებოდა. Virtualization-ის შემდეგ DOM-ის რიცხვი mount-ებულ clip-ებს ნიშნავს და არა project-ის clip-ებს.

## მიდგომა

D-29z1365 (B): perf grep-ის ყოველი hit interactions და resources spec-ში ზუსტად ერთ კლასს იღებს.

| კლასი | Hit-ის სახე | წესი |
|---|---|---|
| **R-a model fact** | wait ან count, რომელიც ამბობს, რამდენი clip არსებობს edit-ის შემდეგ (Add, Ctrl+D, undo, delete, 30-clip build) | `[data-track-id][data-clip-count]`-ის `data-clip-count`-ების ჯამი ახალი helper-ებით. DOM-ის რიცხვი შეიძლება `detail`-ში დარჩეს, პირობად — არასოდეს |
| **R-b ერთი clip პოზიციით** | locator, რომელიც clip-ს DOM-ის რიგით ან `data-clip-start`-ით ირჩევს click-ის, drag-ის, hover-ის ან გაზომვისთვის | target-ის იდენტობა model-ით (`data-clip-id` ან `data-clip-start`) ფიქსირდება, mount-ის რიგით არასოდეს; interaction-მდე clip lane area-ში შემოდის scroll-ით, measured window-ის გარეთ |
| **R-c განსხვავებული start-ები** | „N განსხვავებული `data-clip-start` == target“ | „≥ 1 mount-ებული clip და თითო mount-ებულ clip-ზე ერთი განსხვავებული start“ |
| **R-d clip-ის არსებობას არ ეხება** | dialog-ები, slider-ები, `toHaveCount` არა-clip element-ზე, ერთადერთი ახალი clip Add-ის შემდეგ scroll 0-ზე, video clip-ები | ცვლილება არ არის |

### R-b′: Ctrl+D-ის ასლის read-ები (D-29z1368, round 400)

Round 399-ის R-b-ის პუნქტი „interaction-მდე clip lane area-ში შემოდის“ **მხოლოდ group copy-სთვის** ამ პირობითი ფორმით შეიცვალა. დანარჩენი R-b hit-ები round 399-ის წესზე რჩება; არცერთს scroll არ დასჭირდა. კოდი B-ის patch-ია (`tmp/studio-real-loop/b-round-399/sketch-400-group-copy.patch.txt`, sha256 `d1b8c17d693409d2…`), `git apply`-ით byte-identical დაემატა: spec-ის sha256 `fc804c3d3868f622…` = `b-round-399/sketch/interactions.sketch.ts`.

| Read | წესი |
|---|---|
| **ასლის id და ასლი მოსვენებულ მდგომარეობაში** (setup; round 402-დან ერთი reveal, A-R400-REVIEW-SPEC-LOWS Low 1/Low 2) | Setup ჯერ Ctrl+D-ს და ორიგინალ clip-ზე Ctrl+click-ს აკეთებს (quiet-ის მოლოდინით), შემდეგ ერთ `readBesideClip`-ს. ჯერ mount-ებული clip-ები სკანირდება (HEAD-ის გზა). მხოლოდ თუ ასლი mount-ებული არ არის: timeline scroller-ი ისე scroll-დება, რომ ორიგინალი clip-ის მარჯვენა კიდე lane area-ს მარცხენა კიდიდან 8 px-ით მარჯვნივ იყოს (Ctrl+D-ის ასლი back-to-back დგას), quiet-ის მოლოდინი, ხელახალი სკანირება. ამავე reveal-ში იკითხება ასლის id და `readClipState(copy)` (stopped) და ინახება `copyAtRest`-ად; შემდეგ შენახული `scrollLeft`-ის აღდგენა (1 px-ის ფარგლებში მოწმდება), quiet-ის მოლოდინი. Round 400-ში ეს ორი ცალკე reveal იყო |
| **`copyBefore`** (ორივე branch, `t0`-მდე) | Live read, როცა ასლი mount-ებულია (HEAD-ის გზა); სხვა შემთხვევაში `copyAtRest`. **`t0`-მდე scroll არცერთ branch-ში არ ხდება**, ამიტომ Follow-ის confound ქრება. Detail: `CopyBeforeSource` = `mounted` / `setup-at-rest` |
| **`ownCopy`** (gesture-ის შიგნით, measured window-ში) | `copy.count() > 0 ? readClipState(copy) : null`. **აქ არასოდეს scroll და არასოდეს მოლოდინი.** Detail `OwnCopyObserved` = `ownCopy !== null`. Check (f) სამ branch-ად (round 402, D-29z1379, TL-R401-SK-M3): (1) ასლი `t0`-ზე mount-ებულია და own-lane read-ზე start არ შეცვლილა → failure (ძველი check); (2) ასლი `t0`-ზე mount-ებულია, მაგრამ own-lane read-ზე `null` → failure „mounted at t0 but not on the own-lane read“; (3) ასლი `t0`-ზე page window-ის გარეთაა და own-lane read-ზე mount-ებულია → failure, რადგან same-lane group member-ები pinned არ არის (ეს pin-ის დაბრუნებას იჭერს). ასლი `t0`-ზე გარეთ და read-ზეც `null` — ეს მოსალოდნელი virtualization გზაა; check (c) release-ის შემდეგ ამტკიცებს, რომ ასლი clip-ის delta-ით გადაადგილდა |
| **`copyReleased` + ასლის lane id**, **`copyReset` + ასლის lane id** (`tEnd`-ის შემდეგ) | Live read, როცა mount-ებულია; სხვა შემთხვევაში პირველი row-ის reveal → read → restore. თუ Follow reveal-მდე `on` იყო და restore-ის შემდეგ სხვაა: `arrangement-follow`-ზე click, blur, quiet და `data-follow-mode` = `on` (სხვაგვარად problem). ყველაფერი `tEnd`-ის შემდეგაა, ყოველი measured window-ის გარეთ |
| **ასლის წაუკითხავი read (h)** | თუ reveal-ის შემდეგაც ასლი არ მოიძებნა, branch ადრე არ ბრუნდება: `resetAfterDrag` და `setLive` მაინც სრულდება და liveness failure `(h)` იწერება, ამიტომ ამ pass-ის `drag-group-live` = 0 |
| **ახალი check (g)** | Playing branch-ში `t0`-მდე წაკითხული `data-follow-mode` უნდა იყოს `on`, სხვაგვარად liveness failure. Detail `FollowAtT0` ორივე branch-ში |

- **HEAD-ზე (virtualization-ის გარეშე) ყოველი read mount-ებულ გზას იღებს:** 0 scroll, 0 Follow click, `CopyReveals` = 0, `OwnCopyObserved` = true, `CopyBeforeSource` = `mounted`. ამიტომ ყოველი deterministic row HEAD-ის ტოლი რჩება.
- **Virtualization-ზე (PERF-14b-ii, doc 256):** `CopyReveals` = 3 თითო pass-სა და branch-ზე და ეს reveal-ების ნამდვილი რაოდენობაა (setup-ის ერთი reveal, release read და reset read; თითო reveal = ერთი scroll და ერთი restore), `OwnCopyObserved` = false, `CopyBeforeSource` = `setup-at-rest` (`tmp/studio-real-loop/b-round-401/perf-sketch-interactions-final.json`). Round 400-ის sketch-ზე setup-ის `copyAtRest` reveal ამ რიცხვში არ ითვლებოდა; round 402-დან ის id-ის reveal-თან ერთადაა.
- **`copyDelta`** წაუკითხავ ასლზე (`copyReleased` = `null`) არის `null` და არა NaN; check (c) `null`-ზე პირდაპირ failure-ს წერს, detail `CopyDelta` ცარიელი სტრიქონია (A-R400-REVIEW-SPEC-LOWS Low 4).
- **A-R400 spec Low 3 შენარჩუნებულია (ruling, D-29z1380):** playback-ის დროს Follow-ის ხელახლა ჩართვამ შეიძლება კანონიერად scroll-ი გამოიწვიოს, ამიტომ 1 px restore check მის წინ რჩება; Low `deferred_low_polish`-შია.
- Detail-ის key-ები branch-ის prefix-ით იწერება: `stoppedCopyReveals` / `playingCopyReveals`, `stoppedOwnCopyObserved` / `playingOwnCopyObserved`, `stoppedCopyBeforeSource` / `playingCopyBeforeSource`, `stoppedFollowAtT0` / `playingFollowAtT0`.

**ახალი helper-ები `perf/lib/page.ts`-ში (მხოლოდ დამატება):**

- `modelClipCount(page)` — ყველა `[data-track-id][data-clip-count]` lane-ის `data-clip-count`-ის ჯამი. Video lane-იც ითვლება; R-a-ს ყოველ wait-ზე video clip არ არსებობს (video setup interactions spec-ის ბოლოს მოდის და teardown-ში ქრება), ამიტომ ჯამი audio clip-ების რიცხვს უდრის. Precondition: collapsed group-ის member lane DOM-ში არ არის, ამიტომ helper მის clip-ებს ვერ დათვლის; არცერთი გამომძახებელი group-ს არ აკეცავს.
- `expectModelClipCount(page, count, timeoutMs?)` — `expect.poll` ამ ჯამზე. `timeoutMs`-ის გარეშე Playwright-ის expect timeout-ს იყენებს, ისევე როგორც წინა `toHaveCount`.

ყველა არსებული export, მათ შორის `audioClips`, უცვლელია.

**Scale spec:** B-ის harness patch (`tmp/studio-real-loop/b-round-398/sketch-399-harness.patch.txt`, sha256 `204e282ad46a827c…`) byte-identical დაემატა: in-window lane area-ს მიხედვით, visible-gap self-check და build self-check „≥ 1 mount-ებული clip, თითოზე ერთი განსხვავებული start“. A-მ `scaleSequence`-ის c ხაზში gap check-ის დაშვება ჩაწერა (back-to-back Control+d build). დეტალები doc 254-ის კონტრაქტის სექციაშია. ერთადერთი განზრახ შეცვლილი deterministic მნიშვნელობა PERF-14a-ს run-თან შედარებით არის `scale.clips.in-window.min-zoom-mid`: 24 (`tmp/studio-real-loop/c-round-398/perf-results/latest-scale.json`) → 19, რადგან in-window ახლა sticky track header-ის ქვეშ მყოფ clip-ებს აღარ ითვლის (C-R398-SIGNAL-M2). c და f ნაბიჯები scroll 0-ზეა, ამიტომ იქ header-ის ქვეშ clip არ არის და მნიშვნელობა არ იცვლება. B-ის HEAD baseline (`tmp/studio-real-loop/b-round-398/perf-head-harness-scale.json`) უკვე harness patch-ით არის გაზომილი და 19-ს შეიცავს. Scale spec-ის DOM hit-ები (მაგ. Add-ის შემდეგ `toHaveCount(1)`) ქვემოთ ცხრილში არ არის, რადგან ის B-ის patch-მა migrate-ა.

**Budget-ები:** row-ის id, kind, mode და budget არ შეცვლილა. Round 400-ში `perf/budgets.interactions.json` საერთოდ არ შეცვლილა (R-b′ ახალ row-ს არ ამატებს; ახალი მნიშვნელობები მხოლოდ `drag-group-live`-ის `detail`-შია). მხოლოდ შემდეგი row-ების `note` შეიცვალა: `interact.harness.clips-30`, `res.harness.clips-2` (ახლა model-იდან), `res.dom.page-2`, `res.dom.ruler-2`, `res.dom.page-per-added-clip` („virtualization-ის დროს ასლი შეიძლება mount-ებული არ იყოს; ეს mount-ებულ element-ებს ითვლის“) და scale-ის in-window და keydown-p95 row-ები (harness patch).

**Superseded doc-ები (L34):** clip-ების wait-ებისა და clip-ის targeting-ის ნაწილში ეს doc ცვლის 168, 169, 175, 176, 194, 195, 207, 208, 209, 210, 222, 223, 231, 232, 233, 234, 240, 247, 248 და 252 doc-ების აღწერას. თავად ის doc-ები თავიანთ round-ებს აღწერს და არ შეცვლილა.

### Per-site ცხრილი

ხაზის ნომრები HEAD-ის (`c3ee1d6`) ფაილისაა (`tmp/studio-real-loop/b-round-398/perf-dom-clip-grep.txt`).

**`perf/studio-lab-interactions.perf.spec.ts` (34 hit):**

| ძველი ხაზი | რა არის | კლასი | ახალი კოდი |
|---|---|---|---|
| 133 | `clipById` | R-b | უცვლელი: target უკვე `data-clip-id`-ით ფიქსირდება |
| 135, 138 | `videoClips`, `videoClipById` | R-d | უცვლელი (video) |
| 173 | `readClipState`-ის `data-clip-start` read | R-b | უცვლელი: id-ით ნაპოვნ clip-ს კითხულობს |
| 186 | `visibleGrabPoint`-ის `toHaveCount(1)` clip-ის შიდა target-ზე | R-d | უცვლელი (არა-clip element) |
| 243, 299 | `closest('[data-clip-id]') === null` viewport-ის წერტილზე | R-d | უცვლელი (ფონის hit test) |
| 902, 904 | group setup: clip-ის `data-clip-id` | R-b | უცვლელი: id დაჭერილია |
| 912 | Ctrl+D-ის შემდეგ `toHaveCount(2)` | R-a | `expectModelClipCount(page, 2)` |
| 914–921 | ასლის id mount-ებული clip-ებიდან, „no Ctrl+D copy“ problem | R-b′ | `findCopyId` + `readBesideClip(page, clip, …, 'group setup')` (`setupGroupClips`): mount-ებული სკანი, unmounted-ზე reveal → scan → restore; `copyIdRevealed` ინახება |
| — (ახალი) | ასლის `copyAtRest` setup-ში | R-b′ | `readBesideClip(…, () => readClipState(copy), …, 'group setup')`, `GroupClips.copyAtRest` |
| 1076 | `measureGroupDrag`: `copyBefore = readClipState(copy)` | R-b′ | `copyMountedBefore ? readClipState(copy) : group.copyAtRest`, scroll-ის გარეშე; `followAtT0 = followMode(page)` `t0`-მდე |
| 1089 | gesture-ის შიგნით `own = readClipState(copy)` | R-b′ | `copy.count() > 0 ? readClipState(copy) : null`; (f) მხოლოდ non-null-ზე |
| 1114, 1116 | release-ის შემდეგ `copyReleased` და ასლის lane id | R-b′ | `readBesideClip`, label „… release read“, `tEnd`-ის შემდეგ, Follow-ის აღდგენით |
| 1173, 1175 | reset-ის შემდეგ `copyReset` და ასლის lane id | R-b′ | `readBesideClip`, label „… reset read“, `resetAfterDrag`-ის შემდეგ |
| 1178 | check (f) | R-b′ | `ownCopy !== null && …`; ახალი (h) წაუკითხავ ასლზე და (g) Follow-ზე `t0`-ში |
| 1222 | detail `OwnCopyStart` | R-b′ | `ownCopy?.start ?? ''`; დაემატა `OwnCopyObserved`, `CopyBeforeSource`, `CopyReveals`, `FollowAtT0` |
| 951 | group teardown `toHaveCount(1)` | R-a | `expectModelClipCount(page, 1)` |
| 973, 980, 986, 988, 1050 | video clip-ები | R-d | უცვლელი |
| 1244, 1337, 1399 | slider-ის `toHaveCount(1)` | R-d | უცვლელი |
| 1586 | `visibleClipHeaderCount`: ხილული name bar-ები | R-d | უცვლელი: ხილული clip ყოველთვის mount-ებულია |
| 1616, 1620 | select same-lane-ის candidate loop | R-b | უცვლელი: candidate ხილული name bar-ით და `data-clip-start`-ით ირჩევა |
| 1771 | build: `toHaveCount(press + 1)` | R-a | `expectModelClipCount(page, press + 1)` |
| 1773 | build: `audioClips(page).count()` → `interact.harness.clips-30` | R-a | `modelClipCount(page)`; mount-ებული რიცხვი `detail.mountedClips`-ში |
| 1774, 1775 | build: 30 განსხვავებული `data-clip-start` | R-c | `mountedClips < 1 \|\| distinctStarts !== mountedClips` → problem |
| 1829 | Add-ის შემდეგ `toHaveCount(1)` | R-a | `expectModelClipCount(page, 1)` |
| 1830 | waveform `toHaveCount(1)` | R-d | უცვლელი |
| 1835, 1836 | Add-ის ერთადერთი clip-ის id, scroll 0 | R-d | უცვლელი |
| 1906 | group-ის fallback: `count() === 2` | R-a | `modelClipCount(page) === 2` |
| 1909 | fallback: `toHaveCount(1)` | R-a | `expectModelClipCount(page, 1)` |

**`perf/studio-lab-resources.perf.spec.ts` (11 hit):**

| ძველი ხაზი | რა არის | კლასი | ახალი კოდი |
|---|---|---|---|
| 504 | dialog `toHaveCount(0)` | R-d | უცვლელი |
| 508 | `duplicateFirstClip`: `audioClips(page).first()` | R-d | უცვლელი: ერთადერთი clip Add-იდან, start 0, scroll 0 |
| 516, 517 | Ctrl+D-ის შემდეგ `toHaveCount(2, { timeout: 10000 })` | R-a | `expectModelClipCount(page, 2, 10000)` |
| 682, 741 | `pcmLiveProblems`-ის `placed` | R-a | `modelClipCount(page)` |
| 703 | Add-ის შემდეგ `toHaveCount(1)` | R-a | `expectModelClipCount(page, 1)` |
| 704 | waveform `toHaveCount(1)` | R-d | უცვლელი |
| 707 | `res.harness.clips-1` | R-d | უცვლელი: ერთადერთი ახალი clip Add-ის შემდეგ scroll 0-ზე; row-ის note („`[data-clip-kind="audio"]` count after Add“) grant-ში არ იყო |
| 716 | `res.dom.clip-subtree`: `first()` | R-d | უცვლელი (იგივე ერთადერთი clip) |
| 783 | `res.harness.clips-2` | R-a | `modelClipCount(page)`; mount-ებული რიცხვი `detail.mountedClips`-ში |

## არქიტექტურა

```mermaid
flowchart LR
    M[Arrangement model] --> L["lane data-clip-count"]
    M --> W[page window filter, 14b-ii]
    W --> D["mounted [data-clip-kind]"]
    L --> H["modelClipCount / expectModelClipCount"]
    H --> RA["R-a waits and counts"]
    D --> RC["R-c distinct starts per mounted clip"]
    D --> RD["R-d single fresh clip, video, sliders"]
```

R-a-ს ყოველი პირობა model-ის რიცხვზეა, ამიტომ virtualization მას არ ცვლის. DOM-ის რიცხვი მხოლოდ R-c-სა და `detail`-ში რჩება.

## შეცვლილი ფაილები

- `perf/lib/page.ts` — `modelClipCount` და `expectModelClipCount` (დამატება).
- `perf/studio-lab-interactions.perf.spec.ts` — R-a/R-c migration (round 399) და B-ის R-b′ patch Ctrl+D-ის ასლზე (round 400).
- `perf/studio-lab-resources.perf.spec.ts` — R-a migration.
- `perf/studio-lab-scale.perf.spec.ts` — B-ის harness patch და c ხაზის დაშვება.
- `perf/budgets.interactions.json`, `perf/budgets.resources.json`, `perf/budgets.scale.json` — მხოლოდ `note`.
- `docs/implementation/2026/quarter-IV/254-perf-scale-harness.md` — l.4 და კონტრაქტის სექცია.
- `docs/implementation/2026/quarter-IV/255-perf-harness-model-count.md` — ეს doc.

## პრობლემები და გადაწყვეტები

- **Problem:** lane-ის `data-clip-count` video lane-ზეც არის, ამიტომ ჯამი video clip-ებსაც ითვლის. → **Solution:** R-a-ს ყოველი wait audio-only მდგომარეობაშია (video setup spec-ის ბოლოსაა და lane ცარიელი უნდა იყოს); doc და report ამას აფიქსირებს.
- **Problem:** `expectModelClipCount`-ის ფიქსირებული timeout `toHaveCount`-ზე მოკლე ან გრძელი შეიძლებოდა ყოფილიყო. → **Solution:** `timeoutMs`-ის გარეშე Playwright-ის expect timeout გამოიყენება; resources-ის Ctrl+D wait-ი თავის 10000 ms-ს ინარჩუნებს.
- **Problem (round 399-ის STOP, დახურულია round 400-ში):** group setup-ში ასლის id mount-ებული clip-ებიდან იკითხება (ძველი ხაზი 914), ხოლო `measureGroupDrag` ასლის მდგომარეობას gesture-მდე, release-ის და Undo-ს შემდეგ კითხულობს. HEAD-ზე ასლი 4566 px-ზე იწყება (lane area 512–1440 px). R-b-ის სიტყვასიტყვით შესრულებას ~4000 px scroll სჭირდება, და playing მდგომარეობაში ხელით scroll Follow-ს აჩერებს: „Follow paused“ რჩება scroll-ის დაბრუნებისა და Home-ის შემდეგაც (`tmp/studio-real-loop/a-round-399/probe/follow-probe.txt`). ეს HEAD-ის მდგომარეობას measured window-მდე ცვლის, რაც D-29z1365-ის „deterministic row-ები HEAD-ის ტოლი“ წესს ეწინააღმდეგება. Round 399-ში ეს ნაწილი არ შეიცვალა (`tmp/studio-real-loop/a-round-399.md`, C-R399-01). → **Solution:** B-ის ruling D-29z1368 (R-b′, ზემოთ ცხრილი): reveal მხოლოდ unmounted ასლზე, `t0`-მდე scroll არასოდეს (`copyAtRest`), gesture-ის შიგნით read მხოლოდ mount-ებულზე, release/reset read-ები `tEnd`-ის შემდეგ Follow-ის აღდგენით. A-მ B-ის patch byte-identical დაამატა.

## ტესტირება

**Round 400 (R-b′, ეს doc-ის მიმდინარე მდგომარეობა):**

- B-ის claims (`tmp/studio-real-loop/b-round-399/claims-400.sh`) დასაწყისში planning output-ის ტოლია (`tmp/studio-real-loop/a-round-400/claims-start.txt`).
- `npm run typecheck` — rc 0 (`tmp/studio-real-loop/a-round-400/typecheck.log`).
- perf/lib vitest (`b-round-334/vitest.perf-lib.config.mjs`) — 3 ფაილი, 54 test PASS (`tmp/studio-real-loop/a-round-400/perf-lib-vitest.log`).
- Interactions spec სამუშაო ხეზე (production build, 1440×900, ცალკე): rc 0, 464 წმ, `complete` true, `failures` [], ექვსივე pass-ის `problems` ცარიელი; 189/189 deterministic row `tmp/studio-real-loop/b-round-398/perf-head-interactions.json`-ის ტოლია (`tmp/studio-real-loop/a-round-400/a4-interactions-compare.txt`). `drag-group-live` და `.6x` ყოველ sample-ში 1; ყოველ pass-ში ორივე branch-ის `CopyReveals` 0, `OwnCopyObserved` true, `CopyBeforeSource` `mounted`, `FollowAtT0` `on` (`tmp/studio-real-loop/a-round-400/a4-group-live-detail.txt`).
- იგივე spec virtualization sketch-ის scratch-ზე (`b-round-398/sketch-14bii-lane.patch.txt`): rc 1, 539 წმ, `complete` true, `abortedAt` null ×6, `problems` [] ×6, 264 row-იდან ყველას 3 non-null sample აქვს. `drag-group-live` და `.6x` ყოველ sample-ში 1; `CopyReveals` 3, `OwnCopyObserved` false, `CopyBeforeSource` `setup-at-rest`, `FollowAtT0` `on` (`tmp/studio-real-loop/a-round-400/a5-group-live-detail.txt`). 10 `interact.drag.group.*` assert-იდან არცერთი არ ვარდება. ერთადერთი failing assert: `interact.zoom.30.out.path-rewrites` median 2, budget == 3 — ცნობილი virtualization-ის ეფექტი, 14b-ii-ის input (`tmp/studio-real-loop/a-round-400/a5-interactions-summary.txt`).

**Round 399 (ისტორია; resources და scale spec-ები, რომლებიც round 400-ში არ შეცვლილა):**

- Perf spec-ები სამუშაო ხეზე: resources rc 0, 46/46 deterministic row HEAD-ის ტოლი; scale rc 0, 17/17, `scale.clips.in-window.min-zoom-mid` = 19 (`tmp/studio-real-loop/a-round-399/a4-*-compare.txt`).
- Virtualization sketch-ის scratch-ზე: scale rc 0 (`scale.dom.page` 950 / 1532 / 1868, `scale.clips.model` 200, problems ცარიელი); resources rc 0 (`res.harness.clips-2` = 2, problems ცარიელი) (`tmp/studio-real-loop/a-round-399/a5-*-summary.txt`).
- Budget-ების JSON diff HEAD-თან: მხოლოდ ჩამოთვლილი row-ების `note` (`tmp/studio-real-loop/a-round-399/budget-shape.txt`).

## TODO / შემდეგი ნაბიჯები

1. **RETRO 401** (window 385–400).
2. **PERF-14b-ii — clip virtualization** (RETRO 401-ის შემდეგ), `sketch-14bii-lane.patch.txt`-იდან, TL-R398-SK-M1 და TL-R398-SK-L1-ის გასწორების შემდეგ; Q-14B-PIN-GROUP-MEMBERS (`OwnCopyObserved` = false virtualization-ზე), scale assert-ების flip და A5-ის failing assert-ების ხელახალი ruling (`interact.zoom.30.out.path-rewrites` 2 vs 3).
3. **PERF-14c — peak pyramid და canvas tiles.**
