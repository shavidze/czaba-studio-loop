import io
import json

p = 'b-round-26.md'
s = io.open(p, encoding='utf-8').read()
old = '**Advisor:** ხელმისაწვდომი იყო. B-მა ერთხელ გამოიძახა orientation-ის შემდეგ, წერამდე. რჩევა გამოყენებულია:'
new = '**Advisor:** ხელმისაწვდომი იყო. B-მა ორჯერ გამოიძახა: ერთხელ orientation-ის შემდეგ, წერამდე, და ერთხელ დაწერილი task-ის შესამოწმებლად. პირველი რჩევა გამოყენებულია:'
assert s.count(old) == 1
s = s.replace(old, new)
old2 = '**სარეზერვო ასლები შესწორებამდე:**'
add = '''მეორე გამოძახების (review) შედეგად current-task-ში ოთხი რამ გასწორდა:
1. M2c-ის unmount ტესტი დაკვირვებადი გახდა. Store-ის subscribe wrapper-ით იწერება unsubscribe spy-ები და მოწმდება, რომ თითოეული ზუსტად ერთხელ გამოიძახება. ძველი ვერსია vacuous იქნებოდა. დაემატა mutation (f).
2. R27-TF: tight მხოლოდ ვიდეოს ხაზზეა მიღწევადი, რადგან audio-ს min 60 px-ია. სიმჭიდროვეები ასე ნაწილდება: 1440 → full 81; 1280 ღია detail-ით → video 53 tight, audio 61 regular; fold → 36.
3. R27-L: header-ის control-ების rect-ის შემოწმება თვითკმარია. C rect-ებს meter-ით ზომავს, შემდეგ meter-ს runtime-ში `remove()`-ით აშორებს და rect-ები იდენტური უნდა იყოს.
4. Advisor-ის გამოძახებების რაოდენობა ამ ანგარიშში და backlog-ში გასწორდა.

'''
assert s.count(old2) == 1
s = s.replace(old2, add + old2)
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)

b = json.load(io.open('backlog.json', encoding='utf-8'))
old3 = 'round 26 result -> round 27 (2026-10-11): available, called once after orientation and before writing; advice applied'
assert old3 in b['advisor_used_by_B']
b['advisor_used_by_B'] = b['advisor_used_by_B'].replace(
    old3,
    'round 26 result -> round 27 (2026-10-11): available, called twice (after orientation before writing, and to review '
    'the written task); first advice applied')
b['advisor_used_by_B'] += (
    '; review call fixed: an observable M2c unmount test via subscribe-wrapper unsubscribe spies plus mutation (f); '
    'R27-TF density reachability (tight only on the video lane: 1280 detail-open 53/61, folded 36, 1440 full 81); a '
    'self-contained R27-L rect check (runtime remove() of the meter, rects identical); the advisor count')
r27 = b['rounds'][-1]
assert r27['round'] == 27
io.open('backlog.json', 'w', encoding='utf-8', newline='\n').write(json.dumps(b, ensure_ascii=False, indent=2) + '\n')

n = json.load(io.open('b-next.json', encoding='utf-8'))
n['nextTask'] = n['nextTask'].replace('R27-U (mutations a-e)', 'R27-U (mutations a-f)')
n['nextTask'] = n['nextTask'].replace(
    '(>= 16 it, including the unmount-unsubscribe gap M2c)',
    '(>= 16 it, including an observable unmount-unsubscribe test for M2c)')
n['nextTask'] = n['nextTask'].replace('R27-TF (densities)', 'R27-TF (full 81 at 1440; tight video 53 / regular 61 at 1280 detail-open; folded 36)')
io.open('b-next.json', 'w', encoding='utf-8', newline='\n').write(json.dumps(n, ensure_ascii=False, indent=2) + '\n')
print('ok')
