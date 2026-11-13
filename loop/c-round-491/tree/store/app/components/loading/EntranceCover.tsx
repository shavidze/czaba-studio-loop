// შესასვლელის სტატიკური ფარდა: <head>-ში, რომ პირველივე კადრი შავი იყოს (SABA-B-13)
export const ENTRANCE_COVER_ID = 'czaba-entrance-cover';
export const ENTRANCE_SESSION_KEY = 'czaba_entrance_seen';
export const ENTRANCE_MIN_TOTAL_MS = 3500;
export const ENTRANCE_MAX_TOTAL_MS = 5000;
export const ENTRANCE_FAILSAFE_MS = 2000;
export const ENTRANCE_EXIT_MS = 250;
export const ENTRANCE_OVERLAY_EXIT_MS = 500;
export const ENTRANCE_EXIT_AFTER_TAKEOVER_MIN_MS = 2500;
export const ENTRANCE_SCROLL_SKIP_EVENTS = ['wheel', 'touchmove'] as const;
export const ENTRANCE_TAKEOVER_EVENT = 'czaba-entrance-takeover';
export const ENTRANCE_REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export type EntranceHandshakeState = 'pending' | 'live' | 'skipped' | 'expired';

export interface EntranceHandshake {
  start: number;
  state: EntranceHandshakeState;
}

declare global {
  interface Window {
    __czabaEntrance?: EntranceHandshake;
  }
}

export const ENTRANCE_COVER_CSS = `@media (prefers-reduced-motion: no-preference){body::before{content:"";position:fixed;inset:0;z-index:60;background:var(--color-background);animation:czaba-entrance-failsafe ${ENTRANCE_EXIT_MS}ms ease-in-out ${ENTRANCE_FAILSAFE_MS}ms forwards}}@keyframes czaba-entrance-failsafe{to{opacity:0;visibility:hidden}}`;

// zoom-ის ჟესტი (ctrl+wheel, pinch) ანიმაციას გამოტოვებს, მაგრამ არ იბლოკება (SABA-B-17)
const scrollSkipListenerOn = ENTRANCE_SCROLL_SKIP_EVENTS.map(
  (type) => `window.addEventListener('${type}',scroll,{capture:true,passive:false});`,
).join('');
const scrollSkipListenerOff = ENTRANCE_SCROLL_SKIP_EVENTS.map(
  (type) => `window.removeEventListener('${type}',scroll,true);`,
).join('');

// ერთხელ tab-ზე (D10): ამ ხაზის წაშლით ანიმაცია ყოველ ჩატვირთვაზე ითამაშებს (SABA-Q-ENTRANCE-RELOAD)
const sessionGate = `if(sessionStorage.getItem('${ENTRANCE_SESSION_KEY}')==='1')return;sessionStorage.setItem('${ENTRANCE_SESSION_KEY}','1');`;

// მდგომარეობა window-ზეა: hydration-ის შეცდომისას React <style>-ს ცვლის, window კი რჩება (A-R459-REVIEW-R1)
export const ENTRANCE_BOOT_SCRIPT = `(function(){try{var c=document.getElementById('${ENTRANCE_COVER_ID}');if(!c||location.pathname!=='/')return;if(window.matchMedia&&window.matchMedia('${ENTRANCE_REDUCED_MOTION_QUERY}').matches)return;${sessionGate}var h={start:performance.now(),state:'pending'};window.__czabaEntrance=h;c.setAttribute('data-start',String(h.start));c.media='all';var t;var off=function(){clearTimeout(t);document.removeEventListener('keydown',key,true);document.removeEventListener('click',end,true);${scrollSkipListenerOff}window.removeEventListener('${ENTRANCE_TAKEOVER_EVENT}',off);};var end=function(){off();if(h.state==='pending')h.state='skipped';var n=document.getElementById('${ENTRANCE_COVER_ID}');if(n){n.setAttribute('data-state',h.state);n.media='not all';}};var key=function(e){if(e.key==='Escape'||e.key==='Tab')end();};var scroll=function(e){if(!e.ctrlKey&&!(e.touches&&e.touches.length>1)){if(e.cancelable)e.preventDefault();e.stopPropagation();}end();};document.addEventListener('keydown',key,true);document.addEventListener('click',end,true);${scrollSkipListenerOn}window.addEventListener('${ENTRANCE_TAKEOVER_EVENT}',off);t=setTimeout(off,${ENTRANCE_FAILSAFE_MS + ENTRANCE_EXIT_MS});}catch(e){}})();`;

// client re-render (hydration-ის შეცდომა) ფარდას ჩართულს ტოვებს, სანამ SpotlightLoader არ ჩაიბარებს
function isEntrancePending(): boolean {
  if (typeof window === 'undefined') return false;
  const handshake = window.__czabaEntrance;
  return (
    handshake?.state === 'pending' && performance.now() - handshake.start < ENTRANCE_FAILSAFE_MS
  );
}

export function EntranceCoverHead() {
  return (
    <>
      <style
        id={ENTRANCE_COVER_ID}
        media={isEntrancePending() ? 'all' : 'not all'}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: ENTRANCE_COVER_CSS }}
      />
      <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: ENTRANCE_BOOT_SCRIPT }} />
    </>
  );
}
