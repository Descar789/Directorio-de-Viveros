---
name: BuscaViveros
description: Directorio nacional de viveros en México — cálido, editorial, de confianza
colors:
  primary: "#c1502e"
  primary-dark: "#8b3419"
  plum: "#4b2142"
  plum-soft: "#f1e4ee"
  accent: "#9c6a0b"
  accent-soft: "#fbe6dc"
  background: "#ffffff"
  surface: "#ffffff"
  surface-soft: "#f7f6f4"
  foreground: "#2a2019"
  strong: "#3a322c"
  muted: "#7a6f63"
  muted-soft: "#a69a8c"
  border: "#ede1cb"
  border-soft: "#ede9e2"
  on-primary: "#ffffff"
  destructive: "#dc2626"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Work Sans, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Work Sans, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.08em"
rounded:
  sm: "10px"
  md: "18px"
  lg: "28px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.strong}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
  badge:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "18px"
---

# Design System: BuscaViveros

## 1. Overview

**Creative North Star: "El Vivero de Confianza"**

BuscaViveros reads like a well-kept neighborhood nursery, not a startup dashboard: terracotta and warm crema tones, a serif that feels handwritten-but-serious for names and headings, and generous rounded surfaces that photos and plant names sit on. The system exists to let two very different people trust it in the same breath — a buyer scanning for a nearby vivero on their phone, and a nursery owner deciding whether to hand over their business's photos and contact info. Neither should feel like they've landed in a cold SaaS tool or a dated Yellow-Pages listing.

It explicitly rejects: generic uncurated directory tables (no visual care, no photography); cold corporate SaaS chrome (blue-gray, identical cards, B2B-without-soul); and the bright-green-and-Poppins playful direction from the original spec, discarded for feeling childish next to a directory that needs business credibility.

**Key Characteristics:**
- Terracotta primary carries every primary action (WhatsApp CTA, "Registra tu vivero") — it is the one color a user should always recognize as "do this next."
- Ciruela (plum) is reserved, not a workhorse color — used sparingly for depth, never competing with terracotta.
- Newsreader serif headlines paired with Work Sans body — editorial contrast, not two similar sans-serifs.
- Warm, tinted shadows (never pure black) keep elevation feeling like sunlight, not UI chrome.
- Generously rounded surfaces (10–28px) read as tactile and approachable, not sharp/technical.

## 2. Colors

Warm terracotta-and-crema palette with plum as a rare accent — a **Committed** strategy: primary carries the CTAs and key state, neutrals stay tinted warm rather than cool-gray.

### Primary
- **Terracota** (#c1502e): every primary CTA — WhatsApp buttons, "Registra tu vivero gratis," the sticky contact bar. This is the one color that always means "take action here."
- **Terracota Oscuro** (#8b3419): hover/active state for terracotta surfaces. Never a separate meaning, only the pressed state of primary.

### Secondary
- **Ciruela** (#4b2142): rare depth accent — used sparingly (e.g. structural moments, never CTAs). Its softened tint, **Ciruela Suave** (#f1e4ee), is a background wash, not a text color.

### Tertiary
- **Mostaza Oscurecido** (#9c6a0b): accent role, deliberately darkened from the original brighter mustard to clear WCAG AA on crema backgrounds. Its soft tint **Durazno Suave** (#fbe6dc) is a warm highlight background (e.g. featured/destacado wash), never body text.

### Neutral
- **Crema Superficie Suave** (#f7f6f4): the resting page background tone behind cards — a warm off-white, not a cool gray.
- **Tinta Café** (#2a2019): body text (`foreground`) — a warm near-black, never pure `#000`.
- **Café Fuerte** (#3a322c): headings and emphasized text (`strong`).
- **Café Apagado** (#7a6f63): secondary text (`muted`) — meets 4.5:1 on white; never go lighter for "elegance."
- **Café Apagado Claro** (#a69a8c): tertiary/disabled text only (`muted-soft`) — large text or non-critical labels only, not body copy.
- **Borde Crema** (#ede1cb): default border/divider color, warm-tinted rather than cool gray.

### Named Rules
**The One Action Rule.** Terracotta appears exactly where the user should tap next (WhatsApp, "Cómo llegar" hover, registro CTA). It never doubles as a decorative accent — if it's terracotta, it's actionable.

**The Warm-Neutral Rule.** Every gray in this system is a warm gray (`border`, `muted`, `surface-soft` all carry the same crema hue). A cool blue-gray anywhere is a bug, not a variant.

## 3. Typography

**Display Font:** Newsreader (with Georgia, serif fallback)
**Body Font:** Work Sans (with sans-serif fallback)

**Character:** A magazine-editorial serif for names and headlines against a clean, humanist sans for everything functional — the pairing is what makes this feel like a curated publication rather than a form-heavy directory tool.

### Hierarchy
- **Display** (600, `clamp(2rem, 5vw, 3.25rem)`, 1.1 line-height, -0.015em tracking): hero headlines only (home `h1`, empty states' lead line).
- **Headline** (600, 1.75rem, 1.2 line-height): section titles, `/vivero/[slug]` nursery name.
- **Title** (600, 1.0625rem, 1.35 line-height): card titles (ViveroCard nombre), form section headers.
- **Body** (400, 0.9375rem, 1.5 line-height, cap ~70ch): descriptions, form copy, list text.
- **Label** (700, 0.78rem, 1.3 line-height, 0.08em tracking, uppercase): "Contacto" eyebrow in the sticky contact bar, form field microcopy — used sparingly, not as a scaffolding device on every section.

### Named Rules
**The Serif-Means-Named-Thing Rule.** Newsreader is reserved for proper nouns and headlines — a vivero's name, a page's h1/h2. Body copy, buttons, and UI chrome always stay in Work Sans; mixing the serif into UI labels would blur the "this is a real place" signal the serif is doing.

## 4. Elevation

Warm ambient shadows, tinted toward the ink color (`rgba(42,32,25,…)`) rather than neutral black — depth should feel like soft sunlight under a card, not a generic UI drop-shadow. Flat at rest for small elements (badges, chips); shadows appear on cards that float above the page (ViveroCard's editorial variant, the floating info panel over a photo) and intensify slightly on hover.

### Shadow Vocabulary
- **Card Rest** (`box-shadow: 0 8px 20px rgba(42,32,25,0.08)`): default resting elevation for row-style cards and interactive containers.
- **Card Floating** (`box-shadow: 0 14px 30px rgba(42,32,25,0.14)`): the info panel overlapping a photo (ViveroCard editorial variant) — a stronger lift because it's visually detached from the surface below it.

### Named Rules
**The Warm Shadow Rule.** Every shadow in this system uses the ink color (`#2a2019`) as its tint, never neutral/pure black. A gray or black shadow anywhere is off-brand.

## 5. Components

Táctil y cálido: generous rounded corners, solid-fill primary actions that feel like a physical button to press, minimal reliance on thin borders as the only separator.

### Buttons
- **Shape:** rounded corners, 10px on compact/inline buttons, 12px (`rounded-xl`) on full-width form and contact-bar buttons.
- **Primary:** solid terracotta (#c1502e) fill, white text, semibold, min-height 44–48px (WhatsApp CTA, registro CTA). Hover darkens to #8b3419 — never a color hue-shift, only a value-shift.
- **Hover / Focus:** color transitions only (150–200ms), `focus:ring-2 focus:ring-primary` for keyboard focus — visible ring, no color-only focus state.
- **Secondary / Ghost:** outline in terracotta or border color with transparent fill (e.g. "Llamar," "Cómo llegar" in the contact bar) — same rounded/height as primary so the row reads as one family of equal-weight actions.

### Chips (Insignia badges)
- **Style:** pill shape (full rounded), thin warm border (`border-border`), surface background, muted text, small leading icon (14px Lucide).
- **State:** static/display-only in current use — no selected/unselected toggle state yet; if filters gain interactive chips, selected state should fill with `accent-soft` background + `accent`/`strong` text, never invert to primary (primary stays reserved for direct action per the One Action Rule).

### Cards / Containers
- **Corner Style:** 18px (`rounded-[18px]`) for standard cards and floating info panels, 28px (`rounded-[28px]`) for the photo container itself on the editorial ViveroCard variant.
- **Background:** `surface` (white); the page behind it is `surface-soft` so cards read as physically lifted, not just outlined.
- **Shadow Strategy:** see Elevation — Card Rest for row-style cards, Card Floating for the photo-overlap panel.
- **Border:** row-variant cards use a `border-border` outline instead of shadow-lift; don't combine a heavy border AND a heavy shadow on the same card.
- **Internal Padding:** 16–18px standard, scaling to 24px on desktop panel cards.

### Inputs / Fields
- **Style:** `rounded-xl` (12px), 1px `border-border`, `surface` background.
- **Focus:** `focus:ring-2 focus:ring-primary` with `focus:outline-none` — terracotta ring, not blue.
- **Error / Disabled:** disabled buttons drop to `opacity-60`; error states should pair a red border with inline copy naming the fix (per PRODUCT.md's accessibility principle: cause + correction, not just "campo inválido").

### Navigation
- Sticky header on solid terracotta background, white wordmark + icon mark, white/75% nav links brightening to full white on hover. Mobile: full-width dropdown panel on the same terracotta field, not a white overlay — the header never loses its color identity when it expands.
- The sole white-fill CTA ("Registra tu vivero gratis") inverts the primary relationship deliberately: white-on-terracotta stands out precisely because everything else in the header is terracotta-on-terracotta.

### Sticky Contact Bar (signature component)
The `/vivero/[slug]` page's contact actions (WhatsApp, Llamar, Cómo llegar) pin to the bottom of the viewport on mobile, becoming a static right-rail card on desktop (`lg:static lg:flex-col`). This is the page's single most important conversion surface — three equal-height buttons, WhatsApp always first and always solid-filled, the other two outlined.

## 6. Do's and Don'ts

### Do:
- **Do** use terracotta (#c1502e) exclusively for the action the user should take next — never as decoration.
- **Do** tint every shadow toward `#2a2019` (warm ink), never neutral black.
- **Do** pair Newsreader serif with proper nouns and headings only; keep UI chrome in Work Sans.
- **Do** keep every gray warm — check new neutrals against the existing `border`/`muted` hue before adding one.
- **Do** hold body/muted text at ≥4.5:1 contrast on `surface`/`surface-soft` — `muted` (#7a6f63) is the floor, don't go lighter.

### Don't:
- **Don't** design anything that reads as a generic, uncurated directory table — no bare rows of text with no photography or visual hierarchy (PRODUCT.md anti-reference).
- **Don't** reach for cold corporate SaaS chrome — no blue-gray palettes, no identical featureless card grids, no B2B-dashboard-without-soul feel (PRODUCT.md anti-reference).
- **Don't** revive the bright-green + Poppins playful direction — it read childish next to a directory that needs business credibility (PRODUCT.md anti-reference, carried from the original design spec).
- **Don't** use a colored `border-left`/`border-right` stripe as a card accent — use the full rounded card + shadow language instead.
- **Don't** let a secondary/ghost button look weaker than its primary sibling in height or corner radius — the contact-bar buttons must read as one equal-weight family.
