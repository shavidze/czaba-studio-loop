import re
import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as fh:
    s = fh.read()


def sub_line(prefix, new_line):
    global s
    pat = re.compile(r"^" + re.escape(prefix) + r".*$", re.M)
    if not pat.search(s):
        raise SystemExit("missing line: " + prefix)
    s = pat.sub(lambda m: new_line, s, count=1)


sub_line(
    "განახლდა: ",
    "განახლდა: 2026-10-27, B round 16. round 16 **გამოქვეყნდა** (`cb2d76b`): TM-B19 done. round 17 = TM-B20 (D-26, file row helper-ები არა-string array ელემენტზე). სტატუსი `done` ხდება მხოლოდ C-ის რეალური (არა offline) მტკიცებულებით.",
)

r16 = (
    "**round 16 დახურულია (C PASS, R16-1…R16-6, realVerified=true, bugs 0):** D-25 დანერგილია. red `5854d45` worktree-ზე ახალი ტესტი → "
    "`ERR_MODULE_NOT_FOUND`, green 17/17; M1–M5 unit ტესტებით, M6 (phase იწყება `window`-ით) რეალური launch-ით მოკლულია. gate 120/93/7, "
    "`--retries=0` 7/7, Biome 9 warning (იგივე სია). real built app, რეალური budget-ები: block → `electron.launch did not finish within 60000 ms` "
    "(cause `TimeoutError`), `exit(3)` → `electron.launch failed: electron.launch: Process failed to launch!` 216 ms-ში, slow renderer JS → "
    "domcontentloaded 15000 ms ტექსტი, hung main → `first window did not appear within 60000 ms` 70 s-ზე, pid catch-მდე უკვე მკვდარია, orphan 0. "
    "red reference `5854d45`-ის build-ზე: ძველი ტექსტები cause-ის გარეშე, hung case-ში pid catch-ზე ცოცხალი (RR-R10-04 დადასტურდა). root gate: "
    "published `cb2d76b`, review COMMIT OK (low-ები → RR-R16-01…04)."
)
anchor = "**round 15 დახურულია"
if "**round 16 დახურულია" not in s:
    s = s.replace(anchor, r16 + "\n\n" + anchor, 1)

old_req = "**თხოვნა root-ს (განახლდა B R15):** მიაბით `Check` run-ის id და შედეგი `5854d45`-ზე ან `a4ad852`-ზე (ან `35ed18b`-ის შემდეგ ნებისმიერ commit-ზე); `gate-round-15.json`-ში Actions run ჯერ არ არის."
new_req = "**თხოვნა root-ს (განახლდა B R16):** მიაბით `Check` run-ის id და შედეგი `cb2d76b`-ზე, `5854d45`-ზე ან `35ed18b`-ის შემდეგ ნებისმიერ commit-ზე; `gate-round-16.json`-ში Actions run ჯერ არ არის."
if old_req not in s and new_req not in s:
    raise SystemExit("missing root request")
s = s.replace(old_req, new_req, 1)

sub_line(
    "| TM-B19 |",
    "| TM-B19 | E2E launch helper-ის დიაგნოსტიკა: (a) wrapped `Error` ორიგინალ შეცდომას კარგავს (RR-R10-01); (b) `electron.launch`-ის `TimeoutError` „first window did not appear“-ად იწერება, სხვა launch შეცდომა „first window failed“-ად (RR-R10-02); (c) `SIGKILL`-ის შემდეგ `exit`-ს არ ელოდება (RR-R10-04); (d) failure path-ებს ტესტი არ აქვს (A-R10-01) | **done** (R16), realVerified=true | **C R16** R16-1…R16-6 PASS: red `5854d45` module missing, green 17/17; M1–M6 მოკლულია (M6 რეალური launch-ით); gate 120/93/7, `--retries=0` 7/7; real launches (block / exit / slow load / hung main / normal) ზუსტი D-25 ტექსტებით, `cause`, pid catch-მდე მკვდარი, orphan 0; red reference `5854d45`-ის build-ზე. published `cb2d76b` | — (RR-R16-01…04, A-R16-01/02 signal-ები) |\n"
    "| TM-B20 | file row helper-ები array ელემენტის ტიპს ენდობიან: `hasAnyTagValue` ისვრის `[null]`/`[5]`/`[{}]`-ზე, `formatFirstFieldValue` არა-string პირველ ელემენტს აბრუნებს (object React row-ს ჩააგდებს) (RR-R5-02, B-R16-01). defensive: რეალური app-იდან ახლა არ მიიღწევა | todo (low), round 17 | B R16 ექსპერიმენტი (`b-round-16-exp-row-display.mts.txt`): რეალური `cb2d76b` module tsx-ით → throw / number / object | round 17: D-26 |",
)

sub_line(
    "| RR-R5-02 |",
    "| RR-R5-02 | low | `file-row-display.ts:11` `item.trim()` ვარაუდობს string ელემენტს; `null` row-ს render-ს ჩააგდებს | TM-B20, round 17 (D-26) |",
)

closed = "**closed** — TM-B19 (D-25), C R16, `cb2d76b`"
for fid in ("RR-R10-01", "RR-R10-02", "RR-R10-04", "A-R10-01", "B-R15-01"):
    pat = re.compile(r"^(\| " + re.escape(fid) + r" \|[^\n]*\| )([^|\n]*)\|$", re.M)
    if not pat.search(s):
        raise SystemExit("missing finding row: " + fid)
    s = pat.sub(lambda m: m.group(1) + closed + " |", s, count=1)

new_rows = [
    "| RR-R16-01 | low | Biome ოთხ R16 ფაილს არ ამოწმებს (`npm run check` = `biome check src/`); მაგ. `electron-launch.ts:5-13` import-ების რიგი შემოწმებული არ არის | signal TM-B06-ზე (RR-R14-05, A-R16-02-თან; Saba) |",
    "| RR-R16-02 | low | `electron-launch.ts:62` `getElectronLaunchArgs` `try`-მდე ეშვება: მისი შეცდომა (ცუდი `TAG_MANAGER_E2E_ELECTRON_REQUIRE` path) phase/elapsed/cause-ის გარეშე იწერება; ინფორმაცია არ იკარგება | signal; optional docs ხაზი |",
    "| RR-R16-03 | low | `electron-launch-failure.ts:79-80` `kill(\"SIGKILL\")` → `false`-ზე მაინც 5 s ელოდება; budget-ში ჯდება. B: `exitCode`/`signalCode` null-ისას `false` ნიშნავს, რომ `exit` ჯერ არ ამოსულა, ამიტომ ლოდინი ძირითადად სწორია | signal (A-R16-01-თან) |",
    "| RR-R16-04 | info | არქიტექტურა: launch-ის დროს main output-ისთვის Electron საკუთარი spawn + CDP საჭიროა; ღირს მხოლოდ თუ CI-ში launch-phase ჩავარდნები გამოჩნდება | signal (RR-R10-03-თან), არა task |",
    "| A-R16-01 | low | `closeFailedTagManagerApp`: `kill()` რომ ისროდეს, listener/timer 5 s დარჩებოდა და kill-ის შეცდომა ორიგინალს ჩაანაცვლებდა; რეალური `ChildProcess.kill(\"SIGKILL\")` არ ისვრის | signal (RR-R16-03-თან) |",
    "| A-R16-02 | info | `tests/`-იანი Biome config-ით `electron-launch.ts` ერთ `organizeImports` assist-ს იძლევა; `5854d45`-ზეც იყო | signal TM-B06-ზე |",
    "| C-R16-01 | info | D-25 წერდა, რომ `ELECTRON_REQUIRE_ENV` re-export-ია; კოდში `electron-launch.ts`-შივე რჩება (byte-identical `getElectronRequireArgs` მას იყენებს) | **closed** — B R16: D-25-ის ტექსტი გასწორდა |",
    "| B-R16-01 | low | `formatFirstFieldValue` `value[0]`-ს ნებისმიერი ტიპით აბრუნებს: `[5]` → number, `[{}]` → object (React child-ად ისვრის); `hasAnyTagValue` `[null]`/`[5]`/`[{}]`-ზე ისვრის. რეალური app-იდან ახლა არ მიიღწევა | TM-B20, round 17 (D-26) |",
]
b15_pat = re.compile(r"^\| B-R15-01 \|[^\n]*$", re.M)
m = b15_pat.search(s)
if "| RR-R16-01 |" not in s:
    s = s[: m.end()] + "\n" + "\n".join(new_rows) + s[m.end():]

d15_pat = re.compile(r"^(\| D-15 \|[^\n]*\| )([^|\n]*)\|$", re.M)
m15 = d15_pat.search(s)
if m15 and "D-26" not in m15.group(2):
    s = d15_pat.sub(lambda m: m.group(1) + m.group(2).rstrip() + " R16: არასწორი ტიპის array ელემენტზე დაზუსტება → D-26 |", s, count=1)

sub_line(
    "| D-25 |",
    "| D-25 | `launchTagManagerApp`-ის შეცდომის ტექსტი phase-ის მიხედვით. launch phase (`electron.launch` ჯერ არ დასრულებულა): `TimeoutError` → `electron.launch did not finish within 60000 ms`; სხვა შეცდომა → `electron.launch failed: <message>`. window phase: `first window did not appear within 60000 ms` / `first window failed before 60000 ms: <message>` (უცვლელი). load phase: `first window appeared but domcontentloaded did not finish within 15000 ms: <message>` (უცვლელი). ყველას რჩება ` (elapsed N ms)` და main output tail; ნასროლ `Error`-ს აქვს `{ cause: originalError }`. `closeFailedTagManagerApp`: `SIGKILL`-ის შემდეგ `exit` event-ს ელოდება `FAILED_APP_KILL_WAIT_MS = 5000`-მდე; უკვე დასრულებულ process-ს არ კლავს. `LAUNCH_HOOK_TIMEOUT_MS` 90000 → 100000 (worst case 60 + 15 + 10 + 5 = 90 s < 100 s). Playwright-ის გარეშე ნაწილი → `tests/e2e/electron-launch-failure.ts` (main-env Vitest); `electron-launch.ts` მისგან re-export-ს აკეთებს `FIRST_WINDOW_TIMEOUT_MS`-ისა და `LAUNCH_HOOK_TIMEOUT_MS`-ის, `ELECTRON_REQUIRE_ENV` კი `electron-launch.ts`-შივე რჩება (B R16 დაზუსტება, C-R16-01). env-ის გარეშე launch args უცვლელია (D-06, D-20). pure fix: reference-first გამონაკლისი. K-4 კონტრაქტს არ ეხება | **done** R16, published `cb2d76b` (TM-B19; C R16-1…R16-6) |\n"
    "| D-26 | D-15-ის დაზუსტება არასწორი ტიპის მონაცემზე (file row helper-ები, `src/renderer/src/lib/file-row-display.ts`). array ელემენტი არაცარიელია მხოლოდ მაშინ, როცა ის string-ია არა-whitespace შიგთავსით; ნებისმიერი არა-string ელემენტი (`null`, number, object, boolean) ცარიელია და შეცდომას არ ისვრის. `formatFirstFieldValue` აბრუნებს `value[0]`-ს მხოლოდ მაშინ, როცა ის string-ია, სხვა შემთხვევაში `''` (`String()` coercion არ არის, შემდეგ string ელემენტს არ ეძებს: `['', 'x']` → `''`, როგორც დღეს). D-15-ის მთლიანი მნიშვნელობის წესები უცვლელია. `FieldValue` ტიპი, main, preload, store-ები უცვლელია. pure fix: reference-first გამონაკლისი. K-4 კონტრაქტს არ ეხება | B R16 close, ტექნიკური, შექცევადი; R17-ში ხორციელდება (TM-B20) |",
)

with open(path, "w", encoding="utf-8") as fh:
    fh.write(s)
print("ok")
