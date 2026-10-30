// C round 256: SABA-B-9 stage 1 (C, independent). usage: node c256.cjs <rowRegex> [onlyVp]
const path = require('node:path');
const fs = require('node:fs');
var crypto = require('node:crypto');
const src = fs.readFileSync('/home/runner/czaba-project/tmp/studio-real-loop/c-round-255/c255.cjs', 'utf8');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
var BASE = 'http://127.0.0.1:5173';
var outDir = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-257/browser';
const helpers = src.slice(src.indexOf('const sleep'), src.indexOf('const st = (page)'));
eval(helpers.replace('const sleep', 'var sleep').replace('const SHA', 'var SHA').replace(/async function (\w+)/g, 'var $1 = async function').replace(/const (INIT|readWav|wavInfo|blur) =/g, 'var $1 ='));
const helpers2 = src.slice(src.indexOf('const geo = (page)'), src.indexOf('const ROWS')).split('\n').filter((l) => !/^const (HEADB|MEDIA|INK) =/.test(l)).join('\n');
eval(helpers2.replace(/^async function (\w+)/gm, 'var $1 = async function').replace(/^const (\w+) =/gm, 'var $1 ='));
const HEADB = 'http://127.0.0.1:5180';
const MEDIA = '/home/runner/czaba-project/tmp/studio-real-loop/media/beeps-6s-vp9-opus.webm';
const filter = process.argv[2] ? new RegExp(process.argv[2]) : null;
const onlyVp = process.argv[3] || null;
const resultFile = path.join(outDir, 'c257.json');
const R = fs.existsSync(resultFile) ? JSON.parse(fs.readFileSync(resultFile, 'utf8')) : { rows: {} };
const save = () => fs.writeFileSync(resultFile, JSON.stringify(R, null, 1));
const ck = (m) => fs.appendFileSync(path.join(outDir, '..', 'checkpoint.txt'), `${new Date().toISOString().slice(11, 19)} ${m}\n`);

const st = (page) => page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const a = document.activeElement;
  const play = [...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Play');
  return {
    t: Math.round(performance.now()),
    ph: Number(q('[data-testid="arrangement-playhead-handle"]')?.getAttribute('aria-valuenow')),
    pos: q('[data-testid="arrangement-position"]')?.textContent ?? null,
    m: q('[data-insert-marker]')?.getAttribute('data-insert-marker') ?? null,
    playing: !!q('button[aria-label="Pause"]') || play?.dataset.playing === 'true',
    dp: play?.dataset.playing ?? null,
    pauseBtns: document.querySelectorAll('button[aria-label="Pause"]').length,
    status: q('[data-testid="arrangement-status"]')?.textContent ?? null,
    statusN: window.__statusLog?.length ?? 0,
    undo: [...document.querySelectorAll('button')].find((b) => /^Undo/.test(b.getAttribute('aria-label') || b.textContent.trim()))?.getAttribute('title') ?? null,
    active: a && a !== document.body ? (a.getAttribute('data-testid') || '') + '|' + (a.getAttribute('aria-label') || a.textContent.trim() || a.tagName).slice(0, 50) : 'BODY',
    rms: +Math.max(0, ...(window.__rms ? window.__rms() : [0])).toFixed(5),
  };
});
const toolbarOf = (page) => page.evaluate(() => {
  let t = document.querySelector('[data-testid="arrangement-transport"]');
  if (!t) { const fit = document.querySelector('[data-testid="arrangement-fit"]'); t = document.querySelector('[data-testid="arrangement-position"]'); while (t && !(t.classList.contains('flex-wrap') && t.contains(fit))) t = t.parentElement; }
  t?.setAttribute('data-c257-toolbar', '1');
  return !!t;
});
const geometry = (page) => page.evaluate(() => {
  const q = (id) => document.querySelector(`[data-testid="${id}"]`);
  const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), r: +b.right.toFixed(1), b: +b.bottom.toFixed(1) }; };
  const root = document.querySelector('[data-c257-toolbar]');
  const groups = { edit: q('arrangement-transport-edit'), centre: q('arrangement-transport-centre'), view: q('arrangement-transport-view') };
  const out = { vw: innerWidth, toolbar: r(root), rootOverflow: root.scrollWidth - root.clientWidth };
  if (groups.centre) {
    out.rects = Object.fromEntries(Object.entries(groups).map(([k, e]) => [k, r(e)]));
    out.groupOverflow = Object.fromEntries(Object.entries(groups).map(([k, e]) => [k, e.scrollWidth - e.clientWidth]));
    const c = out.rects.centre; out.centreOffset = +((c.x + c.w / 2) - (out.toolbar.x + out.toolbar.w / 2)).toFixed(1);
    const ov = (a, b) => !(a.r <= b.x || b.r <= a.x || a.b <= b.y || b.b <= a.y);
    out.overlaps = [ov(out.rects.edit, c), ov(c, out.rects.view), ov(out.rects.edit, out.rects.view)];
    out.rowTops = Object.fromEntries(Object.entries(out.rects).map(([k, v]) => [k, v.y]));
    const name = (e) => e.getAttribute('data-testid') === 'arrangement-position' || e.querySelector?.('[data-testid="arrangement-position"]') ? 'CLOCK' : (e.tagName === 'BUTTON' ? (e.getAttribute('aria-label') || e.textContent.trim()) : (e.querySelector('input,button') ? (e.querySelector('input')?.getAttribute('aria-label') || e.textContent.trim().slice(0, 30)) : (e.getAttribute('role') === 'separator' || e.children.length === 0 ? 'SEP' : e.textContent.trim().slice(0, 30))));
    out.childOrder = Object.fromEntries(Object.entries(groups).map(([k, e]) => [k, [...e.children].map(name)]));
  }
  out.controls = [...root.querySelectorAll('button,input')].map((e) => e.getAttribute('aria-label') || e.textContent.trim() || e.tagName);
  const pos = q('arrangement-position'); const clock = pos.parentElement;
  out.clock = { h: r(clock).h, posH: r(pos).h, line: parseFloat(getComputedStyle(pos).lineHeight), y: r(clock).y };
  out.header = r(root.parentElement?.firstElementChild === root ? null : root.previousElementSibling);
  out.tops = { library: r(q('arrangement-library'))?.y, dock: r(q('arrangement-video-dock'))?.y, videoBox: r(q('arrangement-video-box')), ruler: r(q('arrangement-ruler'))?.y, firstLane: r(document.querySelector('[data-track-id]'))?.y, scroller: r(q('arrangement-timeline-scroller')) };
  out.master = r(q('arrangement-master') || document.querySelector('[data-testid^="arrangement-master"]'));
  return out;
});

