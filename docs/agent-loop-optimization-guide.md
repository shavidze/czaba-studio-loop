# AI Agent Loop Optimization Guide — 10 Techniques

პრაქტიკული გაიდი AI აგენტ ლუპის ოპტიმიზაციისთვის.
გამოყენება: Claude Code, GitHub Actions, ნებისმიერი B→A→C სტილის ლუპი.

---

## 1. Backlog File Diet — ისტორიის არქივირება

**პრობლემა:** ლუპის state ფაილი (backlog.json) იზრდება ყოველ რაუნდთან ერთად. 300 რაუნდის შემდეგ 3+ MB ხდება — აგენტებს ყოველ ჯერზე უწევთ მთელის წაკითხვა.

**გამოსავალი:** ყოველი რაუნდის წინ სკრიპტი ავტომატურად:
- დახურულ/გადაწყვეტილ ბაგებს გადაიტანს archive ფაილში
- ძველ baseline snapshot-ებს არქივში (ბოლო 5 რჩება)
- ძველ გადაწყვეტილებებს არქივში (ბოლო 50 რჩება)

**შედეგი:** −20-25% ფაილის ზომა. არაფერი იშლება — archive ფოლდერში გადადის.

**იმპლემენტაცია:**
```python
# optimize-backlog.py — გაუშვი ყოველი რაუნდის წინ
# 1. findings: closed/done/resolved → archive/findings-archived.json
# 2. baseline_tree_at_roundN: keep last 5 → archive/baselines-archived.json  
# 3. decisions_log: keep last 50 → archive/decisions-archived.json
```

---

## 2. Active View Compaction — აგენტის ხედის შეკუმშვა

**პრობლემა:** აგენტს არ სჭირდება სრული ისტორია — მხოლოდ აქტიური დავალებები და ღია ბაგები.

**გამოსავალი:** active-backlog generator-ი აგრესიულად ფილტრავს:
- დახურული ბაგები → ამოიშლება
- Low/Info severity → ერთხაზიანი (ID + status მხოლოდ)
- Done დავალებები → `{"id": "...", "status": "done"}`
- რაუნდების ისტორია → ბოლო 10

**შედეგი:** −36% active view. აგენტს ნაკლები ტოკენი ეხარჯება კითხვაზე.

**მნიშვნელოვანი:** თუ ლუპის kit-ს აქვს საკუთარი generator, **ჩაანაცვლე** შენი ვერსიით (symlink ან copy), თორე გადაწერს.

---

## 3. Tool Output Truncation — verbose output-ის ფილტრაცია

**პრობლემა:** tool output ტოკენების 30-60%-ს შეადგენს. `npm test`-ის სრული output, `git diff`-ის მთელი ტექსტი — ყველაფერი კონტექსტში ხვდება.

**გამოსავალი:** policy-ში აგენტებს დააწესე:
```
- npm/vitest output: | head -50 ან | grep -E 'FAIL|ERROR'
- git status: მაქს 20 ხაზი ანგარიშში
- git diff: --stat (ფაილების სახელები), არა სრული diff
- სრული output ყოველთვის ფაილში, ანგარიშში მხოლოდ reference
```

**შედეგი:** −50-70% tool output ტოკენები.

---

## 4. Memory Pointer Pattern — დიდი output → ფაილის მითითება

**პრობლემა:** 50 KB screenshot JSON ან test log კონტექსტში ხვდება, ტოკენებს ხარჯავს, და მეტს არაფერი არ აძლევს.

**გამოსავალი:** წესი — **10 KB-ზე მეტი output ფაილში ჩაიწეროს**, კონტექსტში მხოლოდ მითითება:
```
ადრე: "B-MENU PASS: {200 ხაზი JSON data...}"
ახლა: "B-MENU PASS — see c-round-329/rows.json B_MENU"
```

**შედეგი:** −80% C-ის ანგარიშის ზომა კონტექსტში.

---

## 5. Phase Boundary Reset — სუფთა კონტექსტი ფაზებს შორის

**პრობლემა:** თუ B-მ 200 KB წაიკითხა, ეს A-ს კონტექსტშიც რჩება — A-ს არ სჭირდება.

**გამოსავალი:** ყოველი ფაზა (B→A→C) სუფთა კონტექსტით იწყება:
- State მხოლოდ ფაილებით გადაეცემა (current-task.md, a-round-N.md, c-round-N.json)
- Watchdog-ი restart-ის შემდეგ აგენტს ფაილებიდან აგრძელებინებს, არა მეხსიერებიდან
- არცერთი ფაზა არ ეყრდნობა წინა ფაზის კონტექსტს

**შედეგი:** ყოველი ფაზა მინიმალური კონტექსტით იწყება.

---

## 6. MCP Tool Pruning — გამოუყენებელი ხელსაწყოების მოცილება

**პრობლემა:** ყოველი MCP tool-ის schema ყოველ request-თან ერთად იგზავნება. 40 tool = 10-15 KB ყოველ turn-ზე, მაშინაც კი თუ არ იყენებ.

**გამოსავალი:**
1. **Audit:** ბოლო 20 რაუნდში რომელი consult agents გამოიძახა რეალურად
2. **Prune:** გამოუყენებელი agents config-იდან ამოშალე
3. **თვეში ერთხელ:** ხელახლა audit და საჭიროებისამებრ დაამატე

**მაგალითი:** Planner-ს 10 consult agent ჰყავდა, რეალურად 4 იყენებდა → 10 → 4. Verifier-ს 11 ჰყავდა → 3.

**GitHub-ის შედეგი:** −62% token cost ამ მეთოდით.

---

## 7. Token Usage Logging — ხარჯების მონიტორინგი

**პრობლემა:** არ იცი რომელი რაუნდი რამდენს ხარჯავს. ანომალიები (18 turn 4-ის ნაცვლად) ვერ ჩანს.

**გამოსავალი:**
```bash
# run.sh-ში: რაუნდის წინ და შემდეგ usage snapshot
cp ~/.claude/usage.json /tmp/usage-before.json
# ... რაუნდი ...
# save_state-ში: delta ჩაწერე JSONL-ში
python3 -c "before - after → token-usage.jsonl"
```

**თვეში ერთხელ გადახედე:**
- რომელი ფაზა (B/A/C) ყველაზე ძვირია?
- რომელი რაუნდები >2x baseline?
- fix-up რაუნდები vs ჩვეულებრივი

---

## 8. Cheaper Model for Verification — იაფი მოდელი სადაც საკმარისია

**პრობლემა:** Opus 5.5 (ან ექვივალენტი) ყველა ფაზაზე ეშვება. C-ს (ვერიფიკატორი) ძირითადად Playwright სკრიპტები გააქვს და შედარება — ამისთვის Sonnet საკმარისია.

**ღირებულება (Anthropic-ის მეტრიკა):**
| მოდელი | წონა | 
|--------|------|
| Haiku | 0.25× |
| Sonnet | 1× |
| Opus | 5× |

**გამოსავალი:**
```json
"models": {
  "planner": "",           // Opus (default) — დაგეგმვას ძლიერი სჭირდება
  "implementer": "",       // Opus — კოდ-ჯენერაციას ძლიერი სჭირდება
  "verifier": "sonnet",    // Sonnet — ტესტების გაშვება და შედარება
  "reviewer": "sonnet"     // Sonnet — კოდის review
}
```

**შედეგი:** ვერიფიკაციის ხარჯი ×5 ნაკლები. თუ ხარისხი დაეცემა, უბრუნებ Opus-ზე.

---

## 9. Pre-download Context Data — წინასწარ მომზადებული კონტექსტი

**პრობლემა:** ყოველ ფაზაში აგენტი `git status`, `git diff`, `git log` აშვებს — ეს 1-2 LLM turn-ს ხარჯავს (tool call → response → processing).

**გამოსავალი:** runner სკრიპტში (run.sh) ყოველი რაუნდის წინ:
```bash
git status --short > loop/context/git-status.txt
git diff --stat HEAD > loop/context/git-diff-stat.txt
git log --oneline -5 > loop/context/git-log-recent.txt
git rev-parse HEAD > loop/context/head-sha.txt
```

აგენტი ფაილს კითხულობს `Read` tool-ით — არა ბრძანებას აშვებს `Bash`-ით. Read = 0 LLM turns, Bash = 1 turn.

**შედეგი:** −1-2 turn ყოველ ფაზაზე, −3-6 turn ყოველ რაუნდზე.

---

## 10. Fix in Same Round — C FAIL → A fix იმავე რაუნდში

**პრობლემა:** ახლა C FAIL → ახალი რაუნდი (B plan → A fix → C verify). ეს 1 სრულ რაუნდს ხარჯავს 1-ხაზიანი fix-ისთვის.

**გამოსავალი:** თუ C FAIL მხოლოდ harness/test issue-ა (არა app code bug):
- B-ს fix-up plan ემატება იმავე round-ში
- A ასწორებს
- C ხელახლა ამოწმებს
- ერთი round-ის ნაცვლად ერთი retry

**მაგრამ ფრთხილად:** ეს მხოლოდ მარტივი fix-ებისთვის. კომპლექსური bug-ი ცალკე რაუნდს იმსახურებს.

**შედეგი:** −30% სრული რაუნდების რაოდენობა (fix-up rounds ნახევრდება).

---

## შეჯამების ცხრილი

| # | ოპტიმიზაცია | ეფექტი | სირთულე | პრიორიტეტი |
|---|-------------|--------|---------|------------|
| 1 | Backlog file diet | −20-25% state ფაილი | მარტივი | მაღალი |
| 2 | Active view compaction | −36% agent read | საშუალო | მაღალი |
| 3 | Tool output truncation | −50-70% tool tokens | მარტივი (policy) | მაღალი |
| 4 | Memory pointer pattern | −80% inline evidence | მარტივი (policy) | მაღალი |
| 5 | Phase boundary reset | clean context per phase | უკვე არსებობს | საშუალო |
| 6 | MCP tool pruning | −62% (GitHub-ის data) | საშუალო (audit) | მაღალი |
| 7 | Token usage logging | visibility | მარტივი | საშუალო |
| 8 | Cheaper model for C | ×5 იაფი ვერიფიკაცია | მარტივი (config) | მაღალი |
| 9 | Pre-download data | −3-6 turns/round | მარტივი | საშუალო |
| 10 | Fix in same round | −30% rounds | საშუალო (kit) | საშუალო |

## წყაროები
- GitHub: Improving Token Efficiency in Agentic Workflows (2026)
- GitHub Slashes Agent Token Spend up to 62% — InfoQ
- SSD Nodes: Claude Code context management
- ML Mastery: Context Window Management for Long-Running Agents
- Augment: AI Agent Loop Token Costs
- Big Iron: Context Window Management for LLM Agent Loops
- AWS Dev: Memory Pointer Pattern
