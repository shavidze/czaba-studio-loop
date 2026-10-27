# R15-5 / R15-6 build provenance

A-ს tree-ის `out/` აიწყო ჩემი (C) R15-4 გაშვების `test:e2e`-ის build ნაბიჯით (`electron-vite build`, იგივე, რასაც `npm run build` აკეთებს). ცალკე `npm run build` A-ს tree-ზე არ გამიშვია. source არ შეცვლილა (`start-hash.txt` = `end-hash.txt`).

red reference-ისთვის `a4ad852` worktree-ში (`/tmp/c-r15-old`) ცალკე `npm run build` გავუშვი: `old-build.log`, exit 0.

(ეს შენიშვნა ცალკე ფაილშია, რადგან `c-round-15.md`-ის ხელახალი რედაქტირებისას ნებართვა უარყოფილი იყო.)
