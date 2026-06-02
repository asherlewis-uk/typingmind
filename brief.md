# TypingMind — Design Constitution

## Register
**Product.** This is an instrument for daily AI chat work, not a brand experience. Operators open this screen repeatedly. The design earns trust through speed, clarity, and consistency — not through creative variation per section.

## Design Direction
**"Quiet Precision"** — Monochrome typographic foundation with a warm copper accent (`oklch(0.62 0.14 55)`). Border-led depth. No gradients. No AI clichés. The accent appears on primary CTAs, focus rings, and links only. Headings, badge dots, and decorative elements stay neutral. Warmth comes from tinted neutrals (dark: 260 hue, light: 80 hue), not saturated surfaces.

## Users
- Developers, researchers, and power users who bring their own API keys
- People who value privacy: conversations stay local, no data leaves their device
- Operators making dozens of queries per session who need speed, not ceremony
- Mobile users on iOS/Android via Capacitor wrapper, plus desktop web users

## Purpose
A unified, offline-first chat frontend for every major AI model (ChatGPT, Claude, Gemini, open-source). Users pay only for API usage, keep conversations private, and manage everything from one interface. Jobs: chat (operate), browse conversation history (monitor), configure models and API keys (configure).

## Voice
- **Direct.** No marketing fluff. "Add model" not "Start your AI journey."
- **Transparent.** Security and privacy claims must be provable: "API keys encrypted on your device" not "We value your privacy."
- **Calm competence.** The interface should feel like a well-maintained tool, not an excited startup.

## Anti-References
- **ChatGPT's consumer polish** — Too much gradient, too many cards, too much "delight" that slows down repeat use
- **Dark terminal monoculture** — TypingMind is dark by default but should never read as "developer terminal." It's a workspace, not a code editor
- **SaaS purple-and-cream** — Generic B2B safe choices that signal nothing
- **AI-app clichés** — Floating neural network illustrations, sparkle emojis, "magic" metaphors. The product is a tool, not a wizard

## Design Principles
1. **Speed over decoration.** Every animation, gradient, and visual flourish must justify itself against response time. The product's job is to get out of the way between the user and the AI.
2. **Privacy made visible.** When data stays local, the interface should make that obvious — not just in copy but in behavior (no spinners that suggest a server round-trip when there is none).
3. **One interface, all models.** Claude shouldn't feel different from ChatGPT in the UI. The model is a selection, not a theme change.
4. **Density with breathing room.** Chat messages need generous line-height and whitespace. Controls need tight, scannable density. Never mix the two.
5. **Mobile is first-class.** Thumb-zone primary actions, Capacitor safe-area awareness, touch targets at minimum 44px. Never amputate a feature for mobile.

## Accessibility
- Light/dark mode supported with full-color OKLCH tokens per mode
- Touch targets at minimum 44×44px on mobile; 48px recommended
- Focus rings visible on all interactive elements (2px copper, 4px glow halo)
- Supports screen reader (`@capacitor/screen-reader`) and text zoom (`@capacitor/text-zoom`)
- `prefers-reduced-motion`: authored fade alternatives (100ms enter, 70ms exit) instead of zeroing
- `prefers-contrast: high`: borders forced to currentColor, shadows zeroed, transparent backgrounds flattened
- Print styles: white background, black text, button outlines instead of fills
- Zoom safety: all text inputs forced to 16px on mobile to prevent iOS focus zoom
- Skip link class available for keyboard navigation
- Density controls: `html[data-density="compact|normal|comfortable"]` adjusts spacing and font size

## Visual Foundation
- **Base background:** `oklch(0.13 0.003 260)` (near-black, warm-tinted)
- **Light background:** `oklch(0.97 0.003 80)` (near-white, warm-tinted)
- **Mode:** Dark by default, light mode available
- **Accent:** `oklch(0.62 0.14 55)` copper. Used on CTAs, focus rings, links, selected states only. Hover: `oklch(0.58 0.13 55)`. Soft: `oklch(0.72 0.08 55)`.
- **Fonts:** Inter (heading/body), system monospace stack (code), KaTeX (math)
- **Depth:** Flat. Shadows at 1-3px hairline. Cards separate via borders.
- **Radius scale:** `6px` (sm), `10px` (md), `16px` (lg), `24px` (xl). Cards use 10px. Circular elements (avatars, model icons, status dots) stay at `9999px`.
- **Type scale:** 12px (xs) → 14px → 16px → 20px → 24px → 32px → 40px → 48px → 60px (4xl). Body measure capped at 64-72ch.
- **Spacing rhythm:** 1 unit (4px) micro, 4 units (16px) component, 9 units (36px) macro
- **Easing curves:** `--ease-out-quart`, `--ease-out-expo`, `--ease-in-out-quart`, `--ease-out-back`

## Design System Files
- **`src/theme-redesign.css`** — Single source of truth for the visual system (2,185 lines, 11 sections)
  1. Design tokens + global overrides
  2. Motion system (17 keyframes, stagger cascade, easing curves, reduced-motion alternatives)
  3. Responsive: viewport gauntlet (320→2560px type + spacing scale)
  4. Responsive: input mode detection (pointer coarse/fine, hover/none)
  5. Responsive: orientation (landscape spacing collapse)
  6. Responsive: thumb zone, container queries, tables, media, density, safe areas
  7. Reduced motion, high contrast, print, zoom
  8. Tactile & utility (active press, selected states, overflow, destructive, touch expansion, toasts, forms, keyboard path, progress, drag, scrollbars)
  9. Typographic system (modular scale, measure constraints, line-height ratios)
  10. State coverage (skeleton pulse, disabled, error, success, warning, empty, loading)
  11. Interaction controls & widgets (checkbox, toggle, tooltip, kbd, search, copy, tags, range, autocomplete, file upload, code blocks, notification badges)
- **`src/capacitor-safe-area.css`** — Mobile safe area and gesture optimizations (unchanged)
- **`src/index.html`** — Links theme-redesign.css after the Next.js bundle stylesheets

## Composition Defaults
The app has three dominant work patterns. Each screen should own one clearly.

- **Operate** (chat view) — Command bar pinned to bottom, conversation stream flowing upward, side panel for conversation list, model selector in reachable header. No hero. No cards. No marketing.
- **Monitor** (conversation management) — Searchable list or feed, tags, folders, timestamps. Dense scanning surface.
- **Configure** (settings, model setup, API keys) — Grouped forms with clear commit areas. No inline editing that loses state. Preview where relevant.

### Responsive Composition Strategy
- **320px** (iPhone SE): Display headings at 1.5rem, body at 14px. Section padding at 24px.
- **375px** (standard phones): Headings at 1.75rem, padding at 32px. Primary actions in thumb zone (sticky bottom). Tables switch to horizontal scroll or stacked cards.
- **768px** (tablet): Headings at 2.25rem. Cards can split to 2fr/1fr grid via container queries.
- **1024px** (laptop): Default scale. Low-priority table columns become visible.
- **1440px** (desktop): Full breathing room.
- **2560px** (ultrawide): Content capped at 1440px max-width, measure locked at 72ch.
- **Density:** User-selectable via `html[data-density]` — compact (14px base), normal (16px), comfortable (17px base)
- **Fixed elements:** All respect `env(safe-area-inset-*)` for notch/camera cutout safety
- **Touch:** 44px minimum targets, hover-only elements hidden on coarse pointers

## Component Rules
- **No cards inside cards.** If content needs structure inside a chat bubble, use type hierarchy and dividers — never nest a card inside a card.
- **Buttons name the action.** "Add model", "Delete conversation", "Export data." Never "OK", "Confirm", "Submit."
- **Empty states teach the space.** "No conversations yet. Start a new chat to begin." with a visible action. Never just "No results."
- **Loading copy names the work.** "Generating response…", "Analyzing image…", "Connecting to Claude…" Never "Loading…"
- **Placeholders are never labels.** Labels above inputs. Placeholders show format or example.

## Interaction States (9 States of Being)
Every component must account for: idle, hover, active, focused, loading, empty, error, disabled, overflow. The CSS system provides utility classes and semantic selectors for each:

- **Idle** — Token-based text/border/surface colors
- **Hover** — `brightness(1.05)` on buttons, `opacity(0.85)` on links (fine pointers only)
- **Active** — `scale(0.98)` ink-bleed press. `scale(0.97)` for press-scale class.
- **Focused** — 2px copper ring + 4px glow halo on `:focus-visible`. Mouse-only clicks stripped via `:focus:not(:focus-visible)`.
- **Loading** — Skeleton pulse animation (1.8s, palette-aware opacity). Copper spinner (800ms rotation).
- **Empty** — `.empty-state` centered block with 48px padding, muted color.
- **Error** — Red border/glow on inputs. `.field-error` message style. Shake animation utility.
- **Disabled** — 0.45 opacity, `not-allowed` cursor, `pointer-events: none`.
- **Overflow** — Text truncation, scroll containment, subtle 6px scrollbar theming.
- **Selected** — `[aria-selected]`, `[aria-current]` get copper tint background + copper border + 600 weight.

### Motion Entrances (transform + opacity only)
- 3-beat entrance: scale 0.95→1.02→1 at 250ms (modals, cards, toasts)
- Slide: 12px directional with fade at 200-250ms (dropdowns, drawers, sheets)
- Exit at ~70% of entrance duration
- Stagger cascade: 20ms increments for grids and lists
- Reduced motion: all spatial movement collapses to 100ms fades (enter) / 70ms (exit)

