const X=require('./h80.cjs');const{L,sleep}=X;
(async()=>{const s=await L.open('1440x900');const p=s.page;await L.fresh(p);
 const inp=p.locator('[data-testid=arrangement-video-input]').first();console.log('inputs',await p.locator('[data-testid=arrangement-video-input]').count());
 await inp.setInputFiles('/home/runner/czaba-project/tmp/studio-real-loop/media/beeps-6s-h264-aac.mp4');await p.waitForSelector('[data-testid=arrangement-video]',{timeout:30000});await sleep(3000);
 console.log(JSON.stringify(await X.clips(p)));
 const S=await X.setup(p);console.log(JSON.stringify(S.clips),S.snap);
 console.log(await p.evaluate(()=>[...document.querySelectorAll('[data-track-id=video] button')].map(b=>b.getAttribute('title')+'|'+b.getAttribute('aria-label')).join('\n')));
 await s.browser.close();})();
