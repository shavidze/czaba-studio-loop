"""Usage: python3 -I edit-tests.py <store-root>  (applies the round-463 test-file edits; fails loudly if an anchor is missing)"""
import sys, re
root = sys.argv[1]
def sub(path, old, new, count=1):
    p = f'{root}/{path}'; s = open(p, encoding='utf-8').read()
    n = s.count(old)
    assert n == count, (path, old[:80], n)
    open(p, 'w', encoding='utf-8').write(s.replace(old, new))
GT = 'app/lib/__tests__/store-gradient-text.test.ts'
sub(GT, """const GRADIENT_TEXT_ALLOW_LIST: StyleScanAllowList = {
  'styles/app.css .loading-brand': {
    hits: 3,
    reason: 'dead rule: its only consumer PianoLoadingAnimation was deleted (STORE-2b-3d-1)',
  },
};
""", "const GRADIENT_TEXT_ALLOW_LIST: StyleScanAllowList = {};\n")
sub(GT, "  sendOrderEmail: 'lib/email.server.ts',", "  sendOrderPaidEmail: 'lib/email.server.ts',")
LT = 'app/lib/__tests__/store-live-teal.test.ts'
dead_keys = ['@keyframes playButtonPulse', '.audio-player-progress.is-playing', '.hover-glow:hover', '.interactive-card:hover', '.product-detail-add-to-cart:hover',
             '.newsletter-button-large:hover', '.testimonial-card:hover', '.loading-brand',
             '.pack-card-3d:hover > div', '.about-image-overlay', '.value-card:hover', '.glass-card:hover']
s = open(f'{root}/{LT}', encoding='utf-8').read()
start = s.index('const TEAL_RULE_ALLOW_LIST')
end = s.index('};\n', start) + 3
block = s[start:end]
def drop_entry(block, key):
    m = re.search(r"\n  '" + re.escape(key) + r"': \{.*?\},(?=\n)", block, flags=re.S)
    assert m, key
    return block[:m.start()] + block[m.end():]
for k in dead_keys: block = drop_entry(block, 'styles/app.css ' + k)
for k in ['.hover-glow:hover', '.interactive-card:hover']: block = drop_entry(block, 'styles/base/utilities.css ' + k)
s = s[:start] + block + s[end:]
open(f'{root}/{LT}', 'w', encoding='utf-8').write(s)
sub(LT, """const TEAL_TOKEN_READ_ALLOW_LIST: StyleScanAllowList = {
  'styles/app.css': {
    hits: 2,
    reason: 'dead .product-detail-add-to-cart and .newsletter-button-large (STORE-2b-3d)',
  },
};""", "const TEAL_TOKEN_READ_ALLOW_LIST: StyleScanAllowList = {};")
sub(LT, """const TEAL_TOKEN_READ_RULE_ALLOW_LIST: StyleScanAllowList = {
  'styles/app.css .product-detail-add-to-cart': { hits: 1, reason: 'dead (STORE-2b-3d)' },
  'styles/app.css .newsletter-button-large': { hits: 1, reason: 'dead (STORE-2b-3d)' },
};""", "const TEAL_TOKEN_READ_RULE_ALLOW_LIST: StyleScanAllowList = {};")
sub(LT, """  'styles/app.css': {
    hits: 37,
    reason:
      'dead @theme teal tokens and dead rules (hover-glow, interactive-card, audio-preview-inline-button, audioPlayingPulse, playButtonPulse, product-detail-add-to-cart, newsletter-button-large, testimonial-card, waveform-bar, track-row-waveform, loading-brand, pack-card-3d, about-image-overlay, value-card, glass-card): STORE-2b-3d',
  },
  'styles/base/utilities.css': {
    hits: 6,
    reason:
      'dead .hover-glow and .interactive-card (STORE-2b-3d); .stems-loader-list serves only the frozen legacy Studio StemsLoadingAnimation (legacy removal)',
  },""", """  'styles/app.css': {
    hits: 14,
    reason:
      'dead @theme teal tokens and the dead rules whose class still has a source consumer in a kept file (audio-preview-inline-button, audioPlayingPulse, waveform-bar, track-row-waveform): LEGACY-DEAD remainder after STORE-2b-3d-2',
  },
  'styles/base/utilities.css': {
    hits: 3,
    reason:
      '.stems-loader-list serves only the frozen legacy Studio StemsLoadingAnimation (legacy removal)',
  },""")
for k in ['@keyframes playButtonPulse', '.audio-player-progress.is-playing', '.hover-glow:hover', '.interactive-card:hover', '.product-detail-add-to-cart:hover', '.product-detail-add-to-cart',
          '.newsletter-button-large:hover', '.newsletter-button-large', '.testimonial-card:hover', '.loading-brand',
          '.pack-card-3d:hover > div', '.about-image-overlay', '.value-card:hover', '.glass-card:hover']:
    s = open(f'{root}/{LT}', encoding='utf-8').read()
    line = re.search(r"\n  'styles/app\.css " + re.escape(k) + r"': \[[^\]]*\],", s)
    assert line, k
    s = s[:line.start()] + s[line.end():]
    open(f'{root}/{LT}', 'w', encoding='utf-8').write(s)
for k in ['.hover-glow:hover', '.interactive-card:hover']:
    sub(LT, f"\n  'styles/base/utilities.css {k}': ['{k[1:].split(':')[0]}'],", "")
sub(LT, "    'loading-brand': {},\n", "")
sub(LT, "  playButtonPulse: 'is-playing',\n", "")
print('ok')
