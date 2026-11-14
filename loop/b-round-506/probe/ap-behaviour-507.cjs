// behaviour probe: real preview audio, Mute toggle, pointer focus, press centre, Close. usage: BASE=.. node ap-behaviour-507.cjs <out.json>
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs'); const BASE = process.env.BASE || 'http://127.0.0.1:5173';
(async () => { const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const res = [];
  for (const [w, h] of [[1440, 900], [1280, 720], [375, 812]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' }); await ctx.addInitScript(() => { window.__media = []; const op = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { if (!window.__media.includes(this)) window.__media.push(this); return op.apply(this, arguments); }; });
    const p = await ctx.newPage(); const errors = [];
    p.on('pageerror', e => errors.push(String(e)));
    await p.goto(BASE + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(6000); await p.keyboard.press('Escape');
    await p.evaluate(() => { const x = document.querySelector('button[aria-label="Play preview"]'); x.scrollIntoView({ block: 'center' }); x.click(); });
    await p.waitForSelector('button[aria-label="Close player"]'); await p.waitForTimeout(2500);
    const audio = () => p.evaluate(() => { const a = [...document.querySelectorAll('audio')]; const m = a[0] || (window).__czabaAudio; return { count: a.length }; });
    const media = async () => p.evaluate(() => { const els = (window.__media || []).filter(e => e.tagName === 'AUDIO' && !(e.currentSrc || '').includes('hero-music')); return els.map(e => ({ t: Math.round(e.currentTime * 100) / 100, paused: e.paused, vol: e.volume, muted: e.muted, src: (e.currentSrc || '').split('/').pop() })); });
    const r = { w, errors };
    r.mediaA = await media(); await p.waitForTimeout(1000); r.mediaB = await media();
    const mute = p.locator('button[aria-label="Mute"]'); await mute.click(); await p.waitForTimeout(300);
    r.afterMute = { unmute: await p.locator('button[aria-label="Unmute"]').count(), title: await p.locator('button[aria-label="Unmute"]').getAttribute('title'), media: await media(), fv: await p.evaluate(() => document.activeElement.matches(':focus-visible')), active: await p.evaluate(() => document.activeElement.getAttribute('aria-label')) };
    await p.locator('button[aria-label="Unmute"]').click(); await p.waitForTimeout(300);
    r.afterUnmute = { mute: await p.locator('button[aria-label="Mute"]').count(), media: await media() };
    const close = p.locator('button[aria-label="Close player"]'); const bb = await close.boundingBox();
    await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.waitForTimeout(250);
    r.pressed = await p.evaluate(() => { const e = document.querySelector('button[aria-label="Close player"]'); const x = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { cy: Math.round((x.y + x.height / 2) * 10) / 10, cx: Math.round((x.x + x.width / 2) * 10) / 10, scale: cs.scale, transform: cs.transform, translate: cs.translate }; });
    r.restCentre = { cy: Math.round((bb.y + bb.height / 2) * 10) / 10, cx: Math.round((bb.x + bb.width / 2) * 10) / 10 };
    await p.mouse.up(); await p.waitForTimeout(500);
    r.afterClose = { closeCount: await close.count(), media: await media() };
    await p.evaluate(() => { const x = document.querySelector('button[aria-label="Play preview"]'); x.scrollIntoView({ block: 'center' }); x.click(); });
    await p.waitForSelector('button[aria-label="Close player"]'); await p.waitForTimeout(800);
    await p.locator('button[aria-label="Previous track"]').focus(); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Shift+Tab');
    r.kbdCloseFocused = await p.evaluate(() => document.activeElement && document.activeElement.getAttribute('aria-label'));
    if (r.kbdCloseFocused !== 'Close player') { await p.locator('button[aria-label="Close player"]').focus(); }
    await p.keyboard.press('Enter'); await p.waitForTimeout(500);
    r.activeAfterClose = await p.evaluate(() => { const a = document.activeElement; return a ? { tag: a.tagName, label: a.getAttribute('aria-label'), text: (a.textContent || '').trim().slice(0, 40) } : null; });
    r.closedByKeyboard = (await p.locator('button[aria-label="Close player"]').count()) === 0;
    res.push(r); await ctx.close(); }
  fs.writeFileSync(process.argv[2], JSON.stringify(res, null, 1)); console.log(JSON.stringify(res).slice(0, 2500)); await b.close(); })();
