import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def rep(old, new):
    global s
    assert s.count(old) == 1, old[:80]
    s = s.replace(old, new)

rep("განახლდა: 2026-10-27, B round 14. round 14 **გამოქვეყნდა** (`a4ad852`): TM-B17 done. round 15 = TM-B18 (D-24, წარმატებული write + reject-ებული re-read).",
    "განახლდა: 2026-10-27, B round 15. round 15 **გამოქვეყნდა** (`5854d45`): TM-B18 done. round 16 = TM-B19 (D-25, E2E launch helper-ის დიაგნოსტიკა).")

rep("**round 14 დახურულია (C PASS",
    "**round 15 დახურულია (C PASS, R15-1…R15-7, realVerified=true, bugs 0):** D-24 დანერგილია. red `a4ad852` worktree-ზე 3 failed/10 passed ((j),(k),(l) toast-ის ტექსტზე), green 13/13; M1s, M1b, M2–M5 მოკლულია. gate 120/76/7, `--retries=0` 7/7, Biome 9 warning (იგივე სია). real app: გაშვებულ main-ში `meta:read-batch`/`meta:read` handler throw-ის მქონეთი შეიცვალა (harness, source უცვლელი) → ზუსტად ერთი toast `Tags saved to 2 files, but reloading failed. Rescan to refresh.` / `Tags saved, but reloading failed. Rescan to refresh.`, row-ები უცვლელი, ფორმა ინარჩუნებს მნიშვნელობას, Save ჩართულია; ffprobe + music-metadata `ICAT=R15Batch`/`R15Single`; relaunch-ის შემდეგ ახალი მნიშვნელობები ჩანს. red reference `a4ad852`-ის build-ზე: ნედლი `Error invoking remote method 'meta:read-batch'…`, ფაილები მაინც ჩაწერილი. regression (injection-ის გარეშე) batch/single/`chmod 000` OK. root gate: published `5854d45`, review COMMIT OK (low-ები → RR-R15-01…05).\n\n**round 14 დახურულია (C PASS")

rep("**თხოვნა root-ს (განახლდა B R13):** მიაბით `Check` run-ის id და შედეგი `a652f06`-ზე (ან `35ed18b`…`c3bd412`-ის ნებისმიერ commit-ზე); `gate-round-13.json`-ში Actions run ჯერ არ არის.",
    "**თხოვნა root-ს (განახლდა B R15):** მიაბით `Check` run-ის id და შედეგი `5854d45`-ზე ან `a4ad852`-ზე (ან `35ed18b`-ის შემდეგ ნებისმიერ commit-ზე); `gate-round-15.json`-ში Actions run ჯერ არ არის.")

rep("| TM-B18 | save, სადაც write გავიდა, მაგრამ re-read reject-ს აკეთებს (IPC დონე): `handleSave`-ის ერთი `try` აჩვენებს მხოლოდ rejection-ის ტექსტს, თითქოს save ჩავარდა, თუმცა ფაილები ჩაიწერა. batch (RR-R13-03) და single (B-R14-01) | todo (low), round 15 | B R14 კოდის წაკითხვა (`a4ad852`): `MetadataPanel.tsx` write + re-read ერთ `try`-შია ორივე branch-ში; main-ის read handler-ები per-file catch-ს აკეთებენ, ამიტომ reject მხოლოდ IPC დონეზეა | round 15: D-24 |",
    "| TM-B18 | save, სადაც write გავიდა, მაგრამ re-read reject-ს აკეთებს (IPC დონე): `handleSave`-ის ერთი `try` აჩვენებს მხოლოდ rejection-ის ტექსტს, თითქოს save ჩავარდა, თუმცა ფაილები ჩაიწერა. batch (RR-R13-03) და single (B-R14-01) | **done** (R15), realVerified=true | **C R15** R15-1…R15-7 PASS: red `a4ad852` 3 failed/10 passed, green 13/13; M1s/M1b/M2–M5 მოკლულია; gate 120/76/7, `--retries=0` 7/7; real app handler injection → ზუსტი D-24 toast-ები, store/row-ები უცვლელი, edits რჩება; ffprobe + music-metadata `ICAT=R15Batch`/`R15Single`; red reference `a4ad852`-ზე ნედლი rejection; regression batch/single/`chmod 000`. published `5854d45` | — (RR-R15-01…05, C-R15-01, A-R15-01 signal-ები) |\n"
    "| TM-B19 | E2E launch helper-ის დიაგნოსტიკა: (a) wrapped `Error` ორიგინალ შეცდომას კარგავს (RR-R10-01); (b) `electron.launch`-ის `TimeoutError` „first window did not appear“-ად იწერება, სხვა launch შეცდომა „first window failed“-ად (RR-R10-02); (c) `SIGKILL`-ის შემდეგ `exit`-ს არ ელოდება (RR-R10-04); (d) failure path-ებს ტესტი არ აქვს (A-R10-01) | todo (low), round 16 | B R15 ექსპერიმენტები built app-ზე (`b-round-15.md` E1–E6): ოთხივე path რეალურად მიიღწევა `-r` injector-ით | round 16: D-25 |")

rep("| RR-R10-01 | low | `electron-launch.ts:253` wrapped `Error` ორიგინალ stack-ს კარგავს (`{ cause: error }`) | signal (E2E harness polish) |",
    "| RR-R10-01 | low | `electron-launch.ts:253` wrapped `Error` ორიგინალ stack-ს კარგავს (`{ cause: error }`) | TM-B19, round 16 (D-25) |")
rep("| RR-R10-02 | low | `electron-launch.ts:222` `electron.launch`-ის საკუთარი `TimeoutError` „first window did not appear“-ად იწერება; `launched` flag | signal (A-R10-01-თან ერთად) |",
    "| RR-R10-02 | low | `electron-launch.ts:222` `electron.launch`-ის საკუთარი `TimeoutError` „first window did not appear“-ად იწერება; `launched` flag | TM-B19, round 16 (D-25) |")
rep("| RR-R10-03 | low | `electron-launch.ts:242` main output მხოლოდ `electron.launch`-ის შემდეგ იჭერება (docs-ში წერია) | signal |",
    "| RR-R10-03 | low | `electron-launch.ts:242` main output მხოლოდ `electron.launch`-ის შემდეგ იჭერება (docs-ში წერია) | signal; TM-B19-ში არ შედის: Playwright `app.process()`-ს მხოლოდ launch-ის დასრულების შემდეგ იძლევა |")
rep("| RR-R10-04 | low | `electron-launch.ts:207` `SIGKILL` `exit` event-ს არ ელოდება | signal |",
    "| RR-R10-04 | low | `electron-launch.ts:207` `SIGKILL` `exit` event-ს არ ელოდება | TM-B19, round 16 (D-25) |")
rep("| A-R10-01 | info | `launchTagManagerApp`-ის გამოუცდელი path-ები: `electron.launch`-ის 60 s timeout, `domcontentloaded` 15 s, non-timeout message, `SIGKILL` fallback | signal (RR-R10-02) |",
    "| A-R10-01 | info | `launchTagManagerApp`-ის გამოუცდელი path-ები: `electron.launch`-ის 60 s timeout, `domcontentloaded` 15 s, non-timeout message, `SIGKILL` fallback | TM-B19, round 16 (D-25) |")
rep("| RR-R13-02 | low | `MetadataPanel.tsx:100` `updated as WavMetadata` cast runtime შემოწმების გარეშე; fix = `readMetadataBatch`-ის ტიპი `Record<string, WavMetadata>` `src/preload/index.d.ts`-ში (protected) | signal; user-ის ნებართვა სჭირდება |",
    "| RR-R13-02 | low | `MetadataPanel.tsx:100` `updated as WavMetadata` cast runtime შემოწმების გარეშე | signal; **B R15 re-route:** `src/preload/index.d.ts` უკვე `Promise<Record<string, WavMetadata>>`-ს აბრუნებს, protected ფაილი არ სჭირდება; cast-ების წაშლა renderer-ის cleanup-ია (RR-R15-01/02-თან ერთად) |")
rep("| RR-R13-03 | low | `MetadataPanel.tsx:84-108` თუ `writeMetadataBatch` გავიდა და `readMetadataBatch` reject-ს აკეთებს, catch ზოგად შეცდომას აჩვენებს და store stale რჩება, თუმცა ფაილები ჩაიწერა. main per-file catch-ს აკეთებს, ამიტომ reject მხოლოდ IPC დონეზეა | TM-B18, round 15 (D-24) |",
    "| RR-R13-03 | low | `MetadataPanel.tsx:84-108` თუ `writeMetadataBatch` გავიდა და `readMetadataBatch` reject-ს აკეთებს, catch ზოგად შეცდომას აჩვენებს და store stale რჩება, თუმცა ფაილები ჩაიწერა. main per-file catch-ს აკეთებს, ამიტომ reject მხოლოდ IPC დონეზეა | **closed** — TM-B18 (D-24), C R15, `5854d45` |")
rep("| B-R14-01 | low | single-file save-ს იგივე ფორმა აქვს, რაც RR-R13-03-ს: `writeMetadata` გავიდა, `readMetadata` reject → rejection-ის ტექსტი, თითქოს save ჩავარდა | TM-B18, round 15 (D-24) |",
    "| B-R14-01 | low | single-file save-ს იგივე ფორმა აქვს, რაც RR-R13-03-ს: `writeMetadata` გავიდა, `readMetadata` reject → rejection-ის ტექსტი, თითქოს save ჩავარდა | **closed** — TM-B18 (D-24), C R15, `5854d45` |\n"
    "| RR-R15-01 | low | `MetadataPanel.tsx:88,110` re-read-ის ცარიელი `catch {}` rejection-ის მიზეზს კარგავს | signal; MetadataPanel polish round (D-24-ის ტექსტის ცვლილება = D-24 amendment) |\n"
    "| RR-R15-02 | low | `MetadataPanel.tsx:93-94,120` `updated as WavMetadata` cast-ები ზედმეტია (ტიპი უკვე explicit-ია) | signal; polish round RR-R13-02-თან ერთად |\n"
    "| RR-R15-03 | low | UX: დადასტურებული write + ჩავარდნილი re-read (D-24) → edits dirty რჩება, არჩევანის შეცვლა აჩვენებს `Unsaved changes were discarded` (D-24 known limit) | Saba-ს კითხვა (ქცევა/ტექსტი) |\n"
    "| RR-R15-04 | info | batch toast `Tags saved to 1 files` (`succeeded === 1`, failed ცარიელი). B: batch ≥2 ფაილს მოითხოვს, ამიტომ UI-დან ახლა არ მიიღწევა | signal |\n"
    "| RR-R15-05 | info | არქიტექტურა: pure `resolveSaveOutcome(writeResult, readResult \\| Error)`; ან `writeMetadata*` re-read-ს ერთ IPC call-ში აბრუნებს (preload → protected, Saba) | signal (RR-R12-04, RR-R13-04-თან), არა task |\n"
    "| C-R15-01 | low | error toast (`fixed bottom-20 right-4`) ~3 წამით ფარავს Save ღილაკს (`c-round-15/r15-5-batch-new-2-after-save.png`); ძველი layout | signal; UX/layout round (reference-first) |\n"
    "| A-R15-01 | info | `succeeded: 0` + re-read reject → `0 saved, N failed. Reloading failed. …` — spec-ს ემთხვევა, უხერხულია; ტესტი არ ფარავს | signal (RR-R15-01-თან, D-24 amendment) |\n"
    "| B-R15-01 | info | ფაქტი (B R15 E1–E6): `launchTagManagerApp`-ის ოთხივე failure path რეალურად მიიღწევა `-r` injector-ით; launch timeout-ზე Playwright თვითონ კლავს process-ს | TM-B19, round 16 (C-ის recipe-ები) |")

old_d24_tail = "| B R14 close, ტექნიკური, შექცევადი; R15-ში ხორციელდება (TM-B18) |"
rep(old_d24_tail,
    "| **done** R15, published `5854d45` (TM-B18; C R15-1…R15-7) |\n"
    "| D-25 | `launchTagManagerApp`-ის შეცდომის ტექსტი phase-ის მიხედვით. launch phase (`electron.launch` ჯერ არ დასრულებულა): `TimeoutError` → `electron.launch did not finish within 60000 ms`; სხვა შეცდომა → `electron.launch failed: <message>`. window phase: `first window did not appear within 60000 ms` / `first window failed before 60000 ms: <message>` (უცვლელი). load phase: `first window appeared but domcontentloaded did not finish within 15000 ms: <message>` (უცვლელი). ყველას რჩება ` (elapsed N ms)` და main output tail; ნასროლ `Error`-ს აქვს `{ cause: originalError }`. `closeFailedTagManagerApp`: `SIGKILL`-ის შემდეგ `exit` event-ს ელოდება `FAILED_APP_KILL_WAIT_MS = 5000`-მდე; უკვე დასრულებულ process-ს არ კლავს. `LAUNCH_HOOK_TIMEOUT_MS` 90000 → 100000 (worst case 60 + 15 + 10 + 5 = 90 s < 100 s). Playwright-ის გარეშე ნაწილი → `tests/e2e/electron-launch-failure.ts` (main-env Vitest). env-ის გარეშე launch args უცვლელია (D-06, D-20). pure fix: reference-first გამონაკლისი. K-4 კონტრაქტს არ ეხება | B R15 close, ტექნიკური, შექცევადი; R16-ში ხორციელდება (TM-B19) |")
open(p, "w", encoding="utf-8").write(s)
print("ok")
