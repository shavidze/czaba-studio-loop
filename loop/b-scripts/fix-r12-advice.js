const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const edit = (file, pairs) => {
  let t = fs.readFileSync(file, 'utf8');
  for (const [a, b] of pairs) {
    const i = t.indexOf(a);
    if (i < 0 || t.indexOf(a, i + 1) >= 0) throw new Error(`${path.basename(file)} anchor: ${a.slice(0, 70)}`);
    t = t.replace(a, b);
  }
  fs.writeFileSync(file, t);
};

edit(path.join(root, 'current-task.md'), [
  [
    '- **The D-24 stall path keeps its priority.** While settle is armed and |d| > `VIDEO_STALL_DRIFT_SECONDS` (0.12), the result is the steady `videoRateCorrection(d)` (settle does not end). This keeps the steady rule able to reach the 1.5 edge, so a genuine post-swap stall still escalates exactly as today. The 1.45 cap therefore applies only for |d| ≤ 0.12.',
    '- **The D-24 stall path keeps its priority.** While settle is armed, compute the steady rate `videoRateCorrection(d)` first.\n  - If that steady rate is at a stall edge (`isVideoRateAtStallEdge({ drift: d, rate: steady })`, i.e. ≥ `VIDEO_STALL_LAG_RATE` when lagging or ≤ `VIDEO_STALL_LEAD_RATE` when leading), return the steady rate. Settle does not end.\n  - Otherwise return the settle rate.\n  - This makes every stall-edge sample under the steady rule an edge sample under settle, so the escalation sequence is identical and a genuine post-swap stall escalates exactly as today. No separate drift threshold is introduced. The steady rule reaches 1.5 at |d| ≥ 0.11875.',
  ],
  [
    '**≤ 1.45 at every row inside a settle window (swap → +1.0 s) with |d| ≤ 0.12**;',
    '**≤ 1.45 at every row inside a settle window (swap → +1.0 s) with |d| ≤ 0.11** (the steady rule is below 1.5 there)',
  ],
  [
    '- **Stall priority simulation:** a swap followed by a 400 ms freeze. Escalation (`shouldEscalateStall()` true) happens at the same frame as in the steady-rule-only control, or earlier. Settle must not delay D-24.',
    '- **Stall priority simulation:** a swap followed by a 400 ms freeze. Escalation (`shouldEscalateStall()` true) happens at **exactly the same frame** as in the steady-rule-only control, and every sample that is at the stall edge in the control is at the stall edge with settle. Settle must not delay D-24.',
  ],
  [
    '- C also reports the median |d| outside settle, for information. It must be no worse than round 10\'s valid runs.',
    '- C also reports the median |d| outside settle, for information only. The steady-state check is R3-V1 mode N (§6).',
  ],
]);

edit(path.join(root, '..', '..', 'docs', 'technical', 'studio-real-workspace', 'plan.md'), [
  [
    'settle-ის დროს deadband 0.008-ია, K ∈ [8, 9], rate ∈ [0.5, 1.45]',
    'settle-ის დროს deadband 0.008-ია, K ∈ [8, 9], rate ∈ [0.55, 1.45]',
  ],
  [
    '- **D-24-ს უპირატესობა რჩება:** settle-ის დროს, თუ |d| > `VIDEO_STALL_DRIFT_SECONDS` (0.12), გამოიყენება მდგრადი `videoRateCorrection(d)`. ამიტომ swap-ის შემდეგ ნამდვილი stall ისევე escalation-ს იწვევს, როგორც დღეს. 1.45-იანი ზღვარი მხოლოდ |d| ≤ 0.12-ზე მოქმედებს;',
    '- **D-24-ს უპირატესობა რჩება:** settle-ის დროს ჯერ მდგრადი `videoRateCorrection(d)` ითვლება. თუ ის stall-ის კიდეზეა (`isVideoRateAtStallEdge`: ≥ 1.5 ჩამორჩენისას ან ≤ 0.5 წინსწრებისას), იწერება მდგრადი rate, სხვა შემთხვევაში კი settle-ის rate. ამიტომ მდგრადი წესის ყოველი კიდის sample settle-შიც კიდის sample-ია: escalation-ის მიმდევრობა იდენტურია, და swap-ის შემდეგ ნამდვილი stall ისევე escalation-ს იწვევს, როგორც დღეს. მდგრადი წესი 1.5-ს |d| ≥ 0.11875-ზე აღწევს, ამიტომ 1.45-იანი ზღვარი C |d| ≤ 0.11-ზე ამოწმებს;',
  ],
]);

const backlogFile = path.join(root, 'backlog.json');
const b = JSON.parse(fs.readFileSync(backlogFile, 'utf8'));
const s = b.items.find((i) => i.id === 'SRW-03').d19a_amendment_round11_planning;
const old = ' D-24 priority: while armed, |d| > VIDEO_STALL_DRIFT_SECONDS (0.12) uses the steady videoRateCorrection so a genuine post-swap stall still reaches the 1.5 edge and escalates as today; the 1.45 cap applies only for |d| <= 0.12.';
if (!s.rule.includes(old)) throw new Error('backlog anchor');
s.rule = s.rule.replace(
  old,
  ' D-24 priority: while armed, compute the steady videoRateCorrection(d) first; if it is at a stall edge (isVideoRateAtStallEdge: >= 1.5 lagging or <= 0.5 leading) write the steady rate, otherwise the settle rate; so every steady edge sample is an edge sample under settle and escalation timing is identical (steady reaches 1.5 at |d| >= 0.11875; C checks the 1.45 cap at |d| <= 0.11).',
);
s.rule = s.rule.replace('rate in [0.5, 1.45]', 'rate in [0.55, 1.45]');
fs.writeFileSync(backlogFile, `${JSON.stringify(b, null, 2)}\n`);
console.log('advice applied');
