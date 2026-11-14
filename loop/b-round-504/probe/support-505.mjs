// usage: BASE=http://127.0.0.1:5173 node support-505.mjs <outdir> <label>
// Round 505 (DPG-BUTTON-CLEANUP-2 stage 2d, chat on /support). -STUBBED rows (L36): page.route answers
// POST /api/chat/sessions and POST /api/chat/sessions/{id}/messages; the SignalR hub (/hubs/chat) is aborted,
// so connect() fails as in the cloud and the session stays set. Client path only. Anonymous (no auth_user).
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const label = process.argv[3] || 'run';
fs.mkdirSync(out, { recursive: true });
const BASE = process.env.BASE || 'http://127.0.0.1:5173';
const ORIGIN = new URL(BASE).origin;
const CORS = { 'access-control-allow-origin': ORIGIN, 'access-control-allow-credentials': 'true', 'access-control-allow-headers': 'authorization, content-type, x-session-id', 'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS' };
const json = (r, body) => r.request().method() === 'OPTIONS' ? r.fulfill({ status: 204, headers: CORS }) : r.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify({ success: true, data: body }) });
const SESSION = { id: 'stub-session', userId: null, guestName: 'Test', guestEmail: 't@example.invalid', pageUrl: '', status: 'active', createdAt: '2026-01-01T00:00:00Z', closedAt: null, messages: [] };
let msgN = 0;
function lum(c) { const m = c.match(/\d+(\.\d+)?/g).map(Number); const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]); }
function contrast(a, b) { if (!a || !b || /rgba\(0, 0, 0, 0\)/.test(b)) return null; const x = lum(a), y = lum(b); return Math.round(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)) * 100) / 100; }
const READ = (e) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); const svg = e.querySelector('svg'); const sr = svg && svg.getBoundingClientRect();
  return { tag: e.tagName, type: e.getAttribute('type'), title: e.getAttribute('title'), ariaLabel: e.getAttribute('aria-label'), disabled: e.disabled ?? null, cls: e.className, text: e.innerText.trim(), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
    bg: cs.backgroundColor, color: cs.color, border: `${cs.borderTopWidth} ${cs.borderTopStyle}`, font: `${cs.fontSize} / ${cs.fontWeight} / ${cs.lineHeight}`, padding: cs.padding, radius: cs.borderTopLeftRadius, shadow: cs.boxShadow,
    transform: cs.transform, opacity: cs.opacity, cursor: cs.cursor, pointerEvents: cs.pointerEvents, svg: svg ? { color: getComputedStyle(svg).color, w: Math.round(sr.width), h: Math.round(sr.height) } : null,
    form: (() => { const f = e.closest('form'); if (!f) return null; const fr = f.getBoundingClientRect(); return { w: Math.round(fr.width), h: Math.round(fr.height) }; })() }; };
async function measure(page, el, name, outPrefix, opts = {}) {
  const item = { name };
  await el.scrollIntoViewIfNeeded().catch(() => {}); await page.waitForTimeout(500);
  item.rest = await el.evaluate(READ); item.restContrast = contrast(item.rest.color, item.rest.bg);
  if (opts.restOnly) return item;
  const bb = await el.boundingBox(); const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
  await page.mouse.move(cx, cy); await page.waitForTimeout(400);
  item.hit = await page.evaluate(([x, y]) => { const a = document.elementFromPoint(x, y); const l = a && a.closest('button'); return { top: a ? a.tagName : null, label: l ? (l.getAttribute('aria-label') || l.innerText.trim()) : null }; }, [cx, cy]);
  const hov = await el.evaluate(READ); item.hover = { bg: hov.bg, color: hov.color, shadow: hov.shadow, transform: hov.transform, cursor: hov.cursor }; item.hoverContrast = contrast(hov.color, hov.bg);
  await page.mouse.down(); await page.waitForTimeout(250);
  const pr = await el.evaluate(READ); item.press = { transform: pr.transform, opacity: pr.opacity, bg: pr.bg, focusVisible: await el.evaluate((e) => e.matches(':focus-visible')) };
  await page.evaluate(() => document.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); }, { capture: true, once: true }));
  await page.mouse.move(2, 2); await page.mouse.up(); await page.waitForTimeout(300);
  await el.evaluate((e) => e.blur()); await page.keyboard.press('Escape'); await el.evaluate((e) => e.focus()); await page.waitForTimeout(250);
  item.focus = await el.evaluate((e) => { const cs = getComputedStyle(e); return { focusVisible: e.matches(':focus-visible'), active: document.activeElement === e, outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, offset: cs.outlineOffset }; });
  const pad = 8; const fb = await el.boundingBox();
  await page.screenshot({ path: `${outPrefix}-${name.replace(/\W+/g, '_')}-focus.png`, clip: { x: Math.max(0, fb.x - pad), y: Math.max(0, fb.y - pad), width: fb.width + 2 * pad, height: fb.height + 2 * pad } }).catch(() => {});
  await el.evaluate((e) => e.blur()); await page.mouse.move(2, 2); await page.waitForTimeout(250);
  return item;
}
const activeInfo = (page) => page.evaluate(() => { const a = document.activeElement; return a ? { tag: a.tagName, id: a.id || null, label: a.getAttribute('aria-label') || a.getAttribute('placeholder') || (a.innerText || '').trim().slice(0, 40) } : null; });
const browser = await chromium.launch();
const res = [];
for (const [w, h] of [[1440, 900], [1280, 720], [375, 812]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().split('T')[0], dismissed: true, submitted: true })); sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} });
  const page = await ctx.newPage();
  const errors = []; const posts = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  await page.route(/\/hubs\/chat/, (r) => r.abort());
  await page.route(/\/api\/chat\/sessions\/[^/]+\/messages/, (r) => { if (r.request().method() === 'POST') { posts.push('messages:' + JSON.parse(r.request().postData() || '{}').message); msgN += 1; return json(r, { id: `m${msgN}`, sessionId: 'stub-session', senderType: 'User', content: JSON.parse(r.request().postData() || '{}').message, createdAt: '2026-01-01T00:00:00Z' }); } return json(r, []); });
  await page.route(/\/api\/chat\/sessions(\?|$)/, (r) => { if (r.request().method() === 'POST') { posts.push('sessions'); return json(r, SESSION); } return json(r, SESSION); });
  await page.route(/\/api\/cart(\?|$)/, (r) => json(r, { id: 1, items: [], itemCount: 0, subtotal: 0, discountAmount: 0, giftCardAmount: 0, total: 0 }));
  const row = { vp: `${w}x${h}`, steps: {} };
  const P = `${out}/${label}-${w}`;
  try { const resp = await page.goto(BASE + '/support', { waitUntil: 'load', timeout: 60000 }); row.status = resp && resp.status(); } catch { row.status = 'goto-error'; }
  await page.waitForTimeout(1500);
  const live = page.locator('button').filter({ hasText: 'Live Chat' });
  row.liveCount = await live.count();
  await live.first().click(); await page.waitForTimeout(800);
  row.steps.activeAfterLiveChat = await activeInfo(page);
  const start = page.locator('button').filter({ hasText: /^\s*Start Chat\s*$/ });
  row.startCount = await start.count();
  if (row.startCount === 1) {
    row.start = await measure(page, start.first(), 'Start_Chat', P);
    await page.locator('form').filter({ has: start }).screenshot({ path: `${P}-guestform.png` }).catch(() => {});
    // empty submit by click
    await start.first().click(); await page.waitForTimeout(300);
    row.steps.emptyErrors = await page.locator('p.text-destructive').allInnerTexts();
    row.steps.postsAfterEmpty = [...posts];
    await page.fill('#guest-name', 'Test'); await page.fill('#guest-email', 'bad'); await page.locator('#guest-email').press('Enter'); await page.waitForTimeout(300);
    row.steps.badEmailErrors = await page.locator('p.text-destructive').allInnerTexts(); row.steps.fieldValues = [await page.inputValue('#guest-name'), await page.inputValue('#guest-email')];
    await page.fill('#guest-email', 't@example.invalid');
    const sb = await start.first().boundingBox();
    await page.mouse.click(sb.x + sb.width / 2, sb.y + sb.height / 2);
    await page.waitForTimeout(1500);
    row.steps.postsAfterStart = [...posts];
    row.steps.activeAfterStart = await activeInfo(page);
    row.steps.guestFormGone = (await page.locator('#guest-name').count()) === 0;
  }
  const send = page.locator('button[aria-label="Send message"]');
  row.sendCount = await send.count();
  if (row.sendCount === 1) {
    row.sendEmpty = await measure(page, send.first(), 'Send_empty', P, { restOnly: true });
    const sbE = await send.first().boundingBox(); await page.mouse.move(sbE.x + sbE.width / 2, sbE.y + sbE.height / 2); await page.waitForTimeout(300);
    row.sendEmptyHover = await send.first().evaluate((e) => { const cs = getComputedStyle(e); const a = document.elementFromPoint(e.getBoundingClientRect().x + 5, e.getBoundingClientRect().y + 5); return { cursor: cs.cursor, bg: cs.backgroundColor, topIsButton: !!(a && a.closest('button') === e) }; });
    await page.mouse.move(2, 2); await page.waitForTimeout(400);
    const ta = page.locator('textarea[placeholder="Type a message..."]');
    await ta.fill('hello');
    row.sendReady = await measure(page, send.first(), 'Send_ready', P);
    await page.locator('form').filter({ has: send }).screenshot({ path: `${P}-chatinput.png` }).catch(() => {});
    const before = posts.length;
    const b1 = await send.first().boundingBox(); await page.mouse.click(b1.x + b1.width / 2, b1.y + b1.height / 2); await page.waitForTimeout(800);
    row.steps.clickSend = posts.slice(before);
    row.steps.activeAfterClickSend = await activeInfo(page);
    row.steps.sendDisabledAfterSend = await send.first().evaluate((e) => e.disabled);
    row.steps.taValueAfter = await ta.inputValue();
    const b2 = posts.length; await ta.fill('enter-msg'); await ta.press('Enter'); await page.waitForTimeout(800);
    row.steps.enterSend = posts.slice(b2);
    const b3 = posts.length; await ta.fill('dbl'); const bb = await send.first().boundingBox(); await page.mouse.dblclick(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.waitForTimeout(800);
    row.steps.dblSend = posts.slice(b3);
    const b4 = posts.length; await ta.fill('   '); await send.first().click({ force: true, timeout: 2000 }).catch(() => {}); await page.waitForTimeout(500);
    row.steps.whitespaceSend = posts.slice(b4);
    row.steps.messagesShown = await page.locator('text=/^(hello|enter-msg|dbl)$/').count();
    const b5 = posts.length; await ta.fill('kbd'); await ta.focus(); await page.keyboard.press('Tab'); await page.waitForTimeout(200);
    row.steps.kbdTabTarget = await activeInfo(page);
    await page.keyboard.press('Enter'); await page.waitForTimeout(800);
    row.steps.kbdSend = posts.slice(b5);
    row.steps.kbdAfter = await page.evaluate(() => { const a = document.activeElement; const cs = a ? getComputedStyle(a) : null; return a ? { tag: a.tagName, focusVisible: a.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth}`, source: document.documentElement.dataset.focusSource || null } : null; });
    await page.screenshot({ path: `${P}-kbd-after-send.png` }).catch(() => {});
    await page.screenshot({ path: `${P}-chat-after.png` }).catch(() => {});
  }
  row.docOverflowX = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  row.errors = errors.filter((e) => !/Failed to load cart|ERR_CONNECTION_REFUSED|ERR_TUNNEL|favicon|hubs\/chat|chat hub|negotiat|Failed to complete negotiation|WebSocket|ERR_FAILED/i.test(e)).slice(0, 6);
  res.push(row); await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().split('T')[0], dismissed: true, submitted: true })); sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} });
  const page = await ctx.newPage(); const posts = [];
  await page.route(/\/hubs\/chat/, (r) => r.abort());
  await page.route(/\/api\/chat\/sessions(\?|$)/, async (r) => { if (r.request().method() === 'POST') { posts.push('sessions'); await new Promise((res) => setTimeout(res, 1500)); } return json(r, SESSION); });
  await page.route(/\/api\/cart(\?|$)/, (r) => json(r, { id: 1, items: [], itemCount: 0, subtotal: 0, discountAmount: 0, giftCardAmount: 0, total: 0 }));
  await page.goto(BASE + '/support', { waitUntil: 'load', timeout: 60000 }); await page.waitForTimeout(1500);
  await page.locator('button').filter({ hasText: 'Live Chat' }).first().click(); await page.waitForTimeout(800);
  await page.fill('#guest-name', 'Test'); await page.fill('#guest-email', 't@example.invalid');
  await page.locator('button').filter({ hasText: /^\s*Start Chat\s*$/ }).first().click();
  await page.waitForTimeout(200);
  await page.locator('button').filter({ hasText: 'Back to support options' }).first().focus();
  const during = await activeInfo(page);
  await page.waitForTimeout(2500);
  res.push({ vp: 'inflight 1440x900', posts: [...posts], during, send: await page.locator('button[aria-label="Send message"]').count(), after: await activeInfo(page) });
  await ctx.close();
}
for (const [w, h] of [[1440, 900], [375, 812]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().split('T')[0], dismissed: true, submitted: true })); sessionStorage.setItem('czaba_entrance_seen', '1'); localStorage.setItem('auth_user', JSON.stringify({ id: 7, email: 'buyer@example.invalid', firstName: 'Test' })); } catch {} });
  const page = await ctx.newPage(); const posts = [];
  await page.route(/\/hubs\/chat/, (r) => r.abort());
  await page.route(/\/api\/chat\/sessions(\?|$)/, (r) => { if (r.request().method() === 'POST') posts.push('sessions'); return json(r, SESSION); });
  await page.route(/\/api\/cart(\?|$)/, (r) => json(r, { id: 1, items: [], itemCount: 0, subtotal: 0, discountAmount: 0, giftCardAmount: 0, total: 0 }));
  await page.goto(BASE + '/support', { waitUntil: 'load', timeout: 60000 }); await page.waitForTimeout(1500);
  const live = page.locator('button').filter({ hasText: 'Live Chat' }); await live.first().click(); await page.waitForTimeout(1500);
  const sig = { vp: `signed-in ${w}x${h}`, guestForm: await page.locator('#guest-name').count(), send: await page.locator('button[aria-label="Send message"]').count(), posts: [...posts], active: await activeInfo(page) };
  res.push(sig); await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/${label}.json`, JSON.stringify(res, null, 1));
for (const r of res) {
  if (r.vp.startsWith('signed-in') || r.vp.startsWith('inflight')) { console.log('==', JSON.stringify(r)); continue; }
  console.log(`== ${r.vp} status ${r.status} live ${r.liveCount} start ${r.startCount} send ${r.sendCount} overflowX ${r.docOverflowX} errors ${JSON.stringify(r.errors)}`);
  for (const k of ['start', 'sendEmpty', 'sendReady']) { const i = r[k]; if (!i) continue; const a = i.rest;
    console.log(`  ${k}: ${a.tag} type ${a.type} title ${a.title} aria ${a.ariaLabel} dis ${a.disabled} ${a.w}x${a.h} bg ${a.bg} color ${a.color} font ${a.font} pad ${a.padding} radius ${a.radius} shadow ${a.shadow} op ${a.opacity} pe ${a.pointerEvents} cursor ${a.cursor} svg ${JSON.stringify(a.svg)} form ${JSON.stringify(a.form)} c ${i.restContrast}` + (i.hover ? ` | hover ${i.hover.bg} sh ${i.hover.shadow} T ${i.hover.transform} cur ${i.hover.cursor} c ${i.hoverContrast} | press op ${i.press.opacity} T ${i.press.transform} fv ${i.press.focusVisible} | focus ${i.focus.focusVisible} ${i.focus.outline} off ${i.focus.offset} | hit ${JSON.stringify(i.hit)}` : '')); }
  console.log('  sendEmptyHover', JSON.stringify(r.sendEmptyHover));
  console.log('  steps', JSON.stringify(r.steps));
}
