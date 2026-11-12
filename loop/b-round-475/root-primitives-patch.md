# ROOT-REQ-DPG-PRIMITIVES-PATCH: exact replacement text (B, round 475 → 476 planning, 2026-11-12)

`.claude/**` is forbidden for the loop. Per the retro rule, this text is a **proposal for Saba/root**. Root applies it outside the loop.

- **Source of the values:** `app/styles/app.css` `@theme` at edeba5a:
  - `--color-brand: #c9a46a` (l.63);
  - `--color-accent: #c9a46a` (l.66);
  - `--color-background: #0e0d0c`;
  - `--color-surface: #161412`;
  - `--color-foreground: #ece6da`.
- **Scan:** `b-round-475/scan/claude-lines.txt` lists 17 hue hits under `.claude/`.
- **Why it matters beyond the docs (C-R474-02):** Tailwind v4 scans markdown under `.claude/**` and `docs/**`, so the example class `bg-[#13D9CC]` is emitted into Store CSS. Rewriting the examples removes that emission.
- **Alternative:** an `@source not` rule in `app.css`. The loop can grant that.

## primitives/DESIGN_TOKENS.md
| Line | Old | New |
|---|---|---|
| 9 | `` | `brand` | #13D9CC (Teal) | Primary actions, links | `` | `` | `brand` | #C9A46A (Brass) | Primary actions, links, meaning (selected, active) | `` |
| 10 | `` | `accent` | #F9A80C (Orange) | Secondary accent, highlights | `` | `` | `accent` | #C9A46A (Brass, same as brand) | Legacy alias; prefer `brand` | `` |
| 11 | `` | `background` | Dark theme | Page background | `` | `` | `background` | #0E0D0C (Obsidian) | Page background | `` |
| 12 | `` | `surface` | Elevated dark | Cards, modals | `` | `` | `surface` | #161412 | Cards, modals | `` |
| 13 | `` | `foreground` | 94% lightness | Primary text | `` | `` | `foreground` | #ECE6DA (warm ink) | Primary text | `` |
| 26 | `<div style={{ background: '#13D9CC' }} />` | `<div style={{ background: '#C9A46A' }} />` |
| 27 | `<div className="bg-[#F9A80C]" />` | `<div className="bg-[#C9A46A]" />` |
| 107 | `- Blue undertone backgrounds` | `- Warm obsidian backgrounds (no blue undertone)` |
| 108 | `- Teal + Orange complementary scheme` | `- Obsidian & Brass: one warm accent, used for meaning` |
| 110 | `- Glow effects for premium feel` | `- No glow effects; depth comes from surface steps and hairline borders` |

## primitives/TAILWIND_FIRST.md
| Line | Old | New |
|---|---|---|
| 15 | `<div style={{ padding: '16px', background: '#13D9CC' }} />` | `<div style={{ padding: '16px', background: '#C9A46A' }} />` |
| 18 | `<div className="bg-[#13D9CC]" />` | `<div className="bg-[#C9A46A]" />` |

## Other `.claude` hits (same swap: `#13D9CC` → `#C9A46A`, `#F9A80C` → `#C9A46A`)
- `HOW_TO_USE_PRIMITIVES.md` l.154 and l.161: `bg-[#13D9CC]` → `bg-[#C9A46A]`.
- `skills/tailwind-v4/SKILL.md`:
  - l.19: `| `brand` | #C9A46A | Primary actions |`;
  - l.31: `bg-[#C9A46A]`.
- `skills/tailwind-v4/references/component-patterns.md` l.16: `--color-brand: #c9a46a;`.
- `prompts/new-component.md` l.72: `bg-brand           // Primary actions (#C9A46A)`.
- `references/accessibility-patterns.md` l.10: `bg-brand (#C9A46A) on dark backgrounds`.
- `agents/design-philosopher.md` l.59: `a monochrome base + one deliberate accent (brass #C9A46A)`.
- `agents/design-auditor.md` l.21: `` Brand: `bg-brand` (#C9A46A); `bg-accent` is a legacy alias of the same brass ``.
- **Studio waveform examples:**
  - `prompts/studio-feature.md` l.335–336 and `agents/studio-specialist.md` l.59 describe the frozen legacy Studio, which is still teal.
  - Their answer belongs with SABA-Q-DPG-LEGACY-STUDIO-TEAL. Root changes them only when Saba answers.

## Check after applying
```
python3 -I tmp/studio-real-loop/b-round-473/scan/hue-scan-v2.py store/.claude /tmp/x.txt
```
Expected `TOTAL 3`: the three legacy-Studio waveform lines. Before applying, it is 17.
