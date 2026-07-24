---
name: BuscaViveros
description: Directorio nacional de viveros en México — cálido, editorial, de confianza
colors:
  primary: "#843728"
  primary-container: "#a24e3d"
  plum: "#844f5e"
  plum-soft: "#f5e1e6"
  accent: "#9c6a0b"
  accent-soft: "#fbe6dc"
  verificado-fg: "#2e7d32"
  verificado-bg: "#e8f3e8"
  verificado-border: "#c3ddc4"
  precargado-fg: "#9a6a15"
  precargado-bg: "#fbf3e3"
  precargado-border: "#ecdaba"
  destacado: "#ffc107"
  background: "#fff8f6"
  surface: "#fff8f6"
  surface-soft: "#fff0ee"
  surface-high: "#f5e5e1"
  foreground: "#221a18"
  strong: "#221a18"
  muted: "#55433f"
  muted-soft: "#88726e"
  border: "#dbc1bc"
  border-soft: "#ecdbd7"
  border-strong: "#88726e"
  on-primary: "#ffffff"
  destructive: "#dc2626"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 3.6rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 500
    lineHeight: 1.15
  title:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1.375rem"
    fontWeight: 500
    lineHeight: 1.2
  body:
    fontFamily: "Work Sans, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Work Sans, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.04em"
rounded:
  photo: "8px"
  card: "8px"
  cardLarge: "12px"
  full: "9999px"
  control: "6px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.control}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-container}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.strong}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  badge-destacado:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.destacado}"
    border: "1px solid {colors.destacado}"
    rounded: "{rounded.control}"
    padding: "4px 10px"
  badge-verificado:
    backgroundColor: "{colors.verificado-bg}"
    textColor: "{colors.verificado-fg}"
    border: "1px solid {colors.verificado-border}"
    rounded: "{rounded.control}"
    padding: "4px 10px"
  badge-precargado:
    backgroundColor: "{colors.precargado-bg}"
    textColor: "{colors.precargado-fg}"
    border: "1px solid {colors.precargado-border}"
    rounded: "{rounded.control}"
    padding: "4px 10px"
  chip:
    backgroundColor: "{colors.surface-high}"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "2px 10px"
  card:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.cardLarge}"
    padding: "24px"
---

# Design System: BuscaViveros

## 1. Overview

**Creative North Star: "El Vivero de Confianza"**

BuscaViveros reads like a well-kept neighborhood nursery presented through a clean, modern product surface: terracotta and warm crema tones, a serif for names and headings, a geometric sans for everything functional. The system exists to let two very different people trust it in the same breath — a buyer scanning for a nearby vivero on their phone, and a nursery owner deciding whether to hand over their business's photos and contact info. Neither should feel like they've landed in a cold SaaS tool or a dated Yellow-Pages listing.

It explicitly rejects: generic uncurated directory tables (no visual care, no photography); cold corporate SaaS chrome (blue-gray, identical cards, B2B-without-soul); and the bright-green-and-Poppins playful direction from the original spec, discarded for feeling childish next to a directory that needs business credibility.

**Key Characteristics:**
- Terracotta carries every primary action as a **solid, filled button** — clear, tappable, unambiguous. Buttons look like buttons.
- Ciruela (plum) is reserved, not a workhorse color — the header logo mark, section accents, the dueño CTA section background.
- Newsreader serif headlines paired with Work Sans body — editorial contrast, geometric-sans functional layer.
- Photography, cards, and controls all share the same rounded language (6–12px) — soft and approachable throughout, no sharp/soft split.
- Soft, low-key shadows (`shadow-sm`) keep elevation subtle rather than dramatic.

## 2. Colors

Warm terracotta-and-crema palette with plum as a rare accent — a **Committed** strategy: primary carries the CTAs and key state, neutrals stay tinted warm rather than cool-gray.

### Primary
- **Terracota** (#843728): every primary CTA button — WhatsApp, "Registra tu vivero," "Buscar." Filled background, white text.
- **Terracota Contenedor** (#a24e3d): hover/active state of the primary button — a lighter, warmer shift, not a darken.

### Secondary
- **Ciruela** (#844f5e): rare depth accent — header wordmark, section links, the dueño CTA background. Its softened tint, **Ciruela Suave** (#f5e1e6), is a background wash, not a text color.

### Tertiary
- **Mostaza Oscurecido** (#9c6a0b): accent role for active/selected chip state. Its soft tint **Durazno Suave** (#fbe6dc) is a warm highlight background, never body text.

### Estatus (3-tier badge system)
- **Verificado**: fg `#2e7d32` / bg `#e8f3e8` / border `#c3ddc4` — a clear green, paired with a `verified` check icon.
- **Pre-cargado**: fg `#9a6a15` / bg `#fbf3e3` / border `#ecdaba` — amber, signals "unclaimed, needs an owner."
- **Destacado**: outline badge in `#ffc107` (amber/gold) with a filled star icon — the paid/premium signal, on a white/surface background, never a competing solid fill.

### Neutral
- **Crema Superficie** (#fff8f6): the page background. **Crema Superficie Suave** (#fff0ee): section band background behind the page. **Crema Superficie Alta** (#f5e5e1): hover/active surface for filters and chips.
- **Tinta** (#221a18): body text (`foreground`/`strong`) — a warm near-black, never pure `#000`.
- **Café Apagado** (#55433f): secondary text (`muted`) — meets 4.5:1 on white; don't go lighter for "elegance."
- **Café Apagado Claro** (#88726e): tertiary/disabled text and stronger borders (`muted-soft` / `border-strong`).
- **Borde Crema** (#dbc1bc): default border/divider on cards and inputs.

### Named Rules
**The Filled-Button Rule.** Primary actions render as a solid terracotta rectangle with white text — no link-style underlines for primary CTAs. Hover shifts the fill to `primary-container`, never adds an underline.

**The Warm-Neutral Rule.** Every gray in this system is a warm gray (`border`, `muted`, `surface-soft` all carry the same crema hue). A cool blue-gray anywhere is a bug, not a variant.

## 3. Typography

**Display Font:** Newsreader (with Georgia, serif fallback)
**Body Font:** Work Sans (with sans-serif fallback)

**Character:** A magazine-editorial serif for names and headlines against a clean geometric sans for everything functional — the pairing keeps the site feeling like a curated publication, not a form-heavy directory tool.

### Hierarchy
- **Display** (500, `clamp(2rem, 5vw, 3.6rem)`, 1.1 line-height): hero headlines only (home `h1`, ficha `h1`).
- **Headline** (500, 1.875rem, 1.15 line-height): section titles ("Estados Piloto," "Viveros Destacados").
- **Title** (500, 1.375rem, 1.2 line-height): card titles (ViveroCard nombre), zona `h1`.
- **Body** (400, 0.9375rem, 1.5 line-height, cap ~70ch): descriptions, form copy, list text.
- **Label** (600, 0.7rem, 1.3 line-height, 0.04em tracking, uppercase): eyebrow text, badge labels — used sparingly.

### Named Rules
**The Serif-Means-Named-Thing Rule.** Newsreader is reserved for proper nouns and headlines — a vivero's name, a page's h1/h2. Body copy, buttons, and UI chrome always stay in Work Sans.

## 4. Elevation

Soft, low-key shadows (`shadow-sm`) rather than dramatic lift — cards read as gently resting on the page, not floating dramatically above it.

### Shadow Vocabulary
- **Card Rest** (`shadow-sm`, warm-tinted): default resting elevation for all cards.
- **Card Hover**: image `scale-105` transform + slightly stronger shadow on hover — motion communicates interactivity more than shadow depth does.

### Named Rules
**The Warm Shadow Rule.** Every shadow uses the ink color (`#221a18`) as its tint, never neutral/pure black.

## 5. Components

### Radius — unified, not split
- **Photos / photo tiles:** 8px.
- **Cards / containers:** 8px standard, 12px for the destacados grid card and the sticky contact card.
- **Controls (buttons, badges, chips, inputs, pills):** 6px. Controls and containers now share one soft, rounded language — no sharp/soft split.
- **Circular exceptions:** the header logo mark and map pins stay circular/teardrop — these are marks/icons, not controls or cards, so the radius rule doesn't apply to them.

### Buttons / Primary Actions
- **Shape:** filled rectangle, `rounded-md` (6px), white text, semibold.
- **Primary:** terracotta fill (WhatsApp CTA, registro CTA, "Buscar"). Hover shifts fill to `primary-container` (lighter/warmer), 150–200ms transition.
- **Secondary / Outline:** for supporting actions (header "Entrar," "Cerca de mí," "Cómo llegar," empty-state actions): `border border-border`, transparent fill, same rounded-md, same height as the adjacent primary button so the row reads as one family.
- **Focus:** `focus:ring-2 focus:ring-primary focus:outline-none` — visible ring, no color-only focus state.

### Badges (status) vs. Chips (category)
- **Status badges** (Destacado/Verificado/Pre-cargado): rounded-md corners, small caps or semibold label + icon, use the estatus tokens above — never invent a fourth color for a new status without adding it to this file first.
- **Category chips** (insignia/filter chips): rounded-md corners, `surface-high` background, `muted`/`strong` text, no border needed. Active/selected state fills with `accent-soft` background + `accent` text — never fills with `primary` (primary stays reserved for direct action).

### Cards / Containers
- **Corner Style:** 8px standard, 12px for destacados/floating info panels — see Radius above.
- **Background:** `surface` (crema); the page behind it is `surface-soft` so cards read as physically distinct.
- **Border:** `border-border` outline plus `shadow-sm` — a light border and a light shadow together read as "card," not heavy on either axis.
- **Internal Padding:** 16–24px standard.

### Inputs / Fields
- **Style:** rounded-md (6px), 1px `border-border`, `surface` background.
- **Focus:** `focus:ring-2 focus:ring-primary` with `focus:outline-none` — terracotta ring, not blue.
- **Error / Disabled:** disabled controls drop to `opacity-60`; error states pair a red border with inline copy naming the fix.

### Navigation (Header)
- Sticky header, `surface` background, `border-b border-border`. Logo mark is a small terracotta circle; wordmark in Newsreader, "viveros" segment in terracotta.
- Nav links in `strong`/`muted`, brightening to `primary` on hover, active link gets a `border-b-2 border-primary` underline.
- The primary nav CTA ("Acceso Profesional" / "Registra tu vivero") is a filled terracotta button — the one place in the header allowed a solid fill, because it's the header's single most important action.

### Sticky Contact Bar (signature component, `/vivero/[slug]`)
Pins to the bottom of the viewport on mobile, becomes a static right-rail card on desktop (`lg:static lg:flex-col`). Still the page's single most important conversion surface — every action here is a filled terracotta button (WhatsApp first), consistent with the Filled-Button Rule.

## 6. Do's and Don'ts

### Do:
- **Do** render primary actions as a solid terracotta button with white text — the Destacado badge stays an outline (not solid) because it's status, not action, and shouldn't compete visually with real buttons.
- **Do** keep photos, cards, and controls on one shared rounded scale (6–12px) — the whole system should feel like one soft, approachable language.
- **Do** tint every shadow toward `#221a18` (warm ink), never neutral black.
- **Do** pair Newsreader serif with proper nouns and headings only; keep UI chrome in Work Sans.
- **Do** keep every gray warm — check new neutrals against the existing `border`/`muted` hue before adding one.
- **Do** hold body/muted text at ≥4.5:1 contrast on `surface`/`surface-soft`.

### Don't:
- **Don't** design anything that reads as a generic, uncurated directory table — no bare rows of text with no photography or visual hierarchy (PRODUCT.md anti-reference).
- **Don't** reach for cold corporate SaaS chrome — no blue-gray palettes, no identical featureless card grids (PRODUCT.md anti-reference).
- **Don't** revive the bright-green + Poppins playful direction — it read childish next to a directory that needs business credibility (PRODUCT.md anti-reference).
- **Don't** mix sharp (0px) and rounded controls in the same view — every control shares the 6px radius now.
- **Don't** invent a fourth status color without adding it to the Estatus table in this file first.
- **Don't** let a secondary/outline control look weaker than an adjacent filled button in height — they must still read as one equal-weight family of actions.
