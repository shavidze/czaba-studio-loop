const fs = require('fs');
const p = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
let t = fs.readFileSync(p, 'utf8');
const from = 'თუ selected-clip-ის გარდა სხვა ხაზი footer-ის სიმაღლეს ცვლის, A აჩერებს და B-ს ატყობინებს.';
const to = 'რეზერვის შემდეგ კლიპის არჩევა/მოხსნა footer-ის სიმაღლეს Δ 0-ით უნდა ტოვებდეს. თუ ეს ვერ მიიღწევა, A აჩერებს და B-ს ატყობინებს.\n  - Range-ის, ≥ 2 კლიპის და lane-move-ის ხაზები D-29c (2)-ის ფარგლებს გარეთაა. A და C მათ ზომავენ და ჩაწერენ. ისინი D-29d-ის „placement-ის შემდეგ ყუთი არ მოძრაობს“ წესის ცნობილი შედეგია, და მომხმარებელს ყუთის გადატანა შეუძლია. თუ ამ ხაზების გამო preview-ის control (wave ან toggle), ◀, ძებნა ან separator იფარება, ეს B-სთვის ახალი ბაგია.';
if (t.split(from).length !== 2) throw new Error('match');
t = t.replace(from, to);
fs.writeFileSync(p, t);
console.log('ok');
