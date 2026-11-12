// შესასვლელის სტატიკური ფარდა: <head>-ში, რომ პირველივე კადრი შავი იყოს (SABA-B-13)
export const ENTRANCE_COVER_ID = 'czaba-entrance-cover';
export const ENTRANCE_SESSION_KEY = 'czaba_entrance_seen';
export const ENTRANCE_MIN_TOTAL_MS = 1450;
export const ENTRANCE_MAX_TOTAL_MS = 1900;
export const ENTRANCE_FAILSAFE_MS = 1000;
export const ENTRANCE_EXIT_MS = 250;
export const ENTRANCE_TAKEOVER_EVENT = 'czaba-entrance-takeover';
export const ENTRANCE_REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export const ENTRANCE_COVER_CSS = `@media (prefers-reduced-motion: no-preference){body::before{content:"";position:fixed;inset:0;z-index:60;background:var(--color-black);animation:czaba-entrance-failsafe ${ENTRANCE_EXIT_MS}ms ease-in-out ${ENTRANCE_FAILSAFE_MS}ms forwards}}@keyframes czaba-entrance-failsafe{to{opacity:0;visibility:hidden}}`;

// ერთხელ tab-ზე (D10): ამ ხაზის წაშლით ანიმაცია ყოველ ჩატვირთვაზე ითამაშებს (SABA-Q-ENTRANCE-RELOAD)
const sessionGate = `if(sessionStorage.getItem('${ENTRANCE_SESSION_KEY}')==='1')return;sessionStorage.setItem('${ENTRANCE_SESSION_KEY}','1');`;

export const ENTRANCE_BOOT_SCRIPT = `(function(){try{var c=document.getElementById('${ENTRANCE_COVER_ID}');if(!c||location.pathname!=='/')return;if(window.matchMedia&&window.matchMedia('${ENTRANCE_REDUCED_MOTION_QUERY}').matches)return;${sessionGate}c.setAttribute('data-start',String(performance.now()));c.media='all';var off=function(){document.removeEventListener('keydown',key,true);document.removeEventListener('click',end,true);window.removeEventListener('${ENTRANCE_TAKEOVER_EVENT}',off);};var end=function(){off();c.setAttribute('data-state','skipped');c.media='not all';};var key=function(e){if(e.key==='Escape'||e.key==='Tab')end();};document.addEventListener('keydown',key,true);document.addEventListener('click',end,true);window.addEventListener('${ENTRANCE_TAKEOVER_EVENT}',off);}catch(e){}})();`;

export function EntranceCoverHead() {
  return (
    <>
      <style
        id={ENTRANCE_COVER_ID}
        media="not all"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: ENTRANCE_COVER_CSS }}
      />
      <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: ENTRANCE_BOOT_SCRIPT }} />
    </>
  );
}
