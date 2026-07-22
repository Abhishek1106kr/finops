# UI Design System & Guidelines (`UI.md`)

This document defines the official design system, visual style, design tokens, and UI layout rules for this project. All AI agents, models, and developers working on this codebase **MUST** strictly follow these design specifications to maintain a consistent, premium, and cohesive user interface.

---

## 1. Design Philosophy & Vision

* **Editorial Minimalist & Modern SaaS**: Clean typography, spacious layouts, soft organic colors, and high-contrast focal points.
* **Warm & Welcoming Aesthetics**: Move away from cold, plain white backgrounds (`#FFFFFF`) or pure harsh blacks (`#000000`). Use warm cream off-white canvas backgrounds paired with rich charcoal text and subtle pastel accent blocks.
* **Refined Micro-Interactions**: Smooth hover transitions, elevated floating cards, pill-shaped buttons, and clean line iconography.
* **Mobile-First & Fully Responsive**: Seamless degradation from multi-column desktop hero layouts to elegant single-column mobile flows.

---

## 2. Color Palette & Design Tokens

Use these exact color values and CSS custom properties across the application.

```css
:root {
  /* Canvas Backgrounds */
  --bg-primary: #FAF7F2;          /* Warm Cream / Off-White main background */
  --bg-secondary: #F3EFEA;        /* Slightly darker warm neutral container fill */
  --bg-surface-white: #FFFFFF;    /* Pure white for floating pills and popovers */

  /* Text & Foregrounds */
  --text-primary: #121212;        /* Deep Carbon Charcoal for headings & primary text */
  --text-secondary: #5A5A5C;      /* Muted Graphite for body, captions, & secondary links */
  --text-muted: #8C8C8E;          /* Muted gray for placeholders & meta information */
  --text-inverse: #FFFFFF;        /* Crisp white text on dark buttons/badges */

  /* Pastel Accent Card Fills */
  --accent-lavender: #F3E6F7;     /* Soft Lavender / Pink Pastel hero card fill */
  --accent-lavender-border: #E8D3EE;
  --accent-sage: #C7E8BC;         /* Soft Mint / Sage Green hero image accent card fill */
  --accent-sage-border: #B2DEA4;
  --accent-subtle-yellow: #FFF7D6; /* Warm highlight yellow badge fill */

  /* UI Elements & Controls */
  --btn-primary-bg: #121212;      /* Black solid fill button */
  --btn-primary-text: #FFFFFF;
  --btn-primary-hover: #2D2D2D;
  --border-subtle: rgba(18, 18, 18, 0.08); /* Subtle crisp borders */
  --border-strong: rgba(18, 18, 18, 0.16);

  /* Indicator Status Colors */
  --status-success: #22C55E;     /* Green dot/pill indicator */
  --status-warning: #F59E0B;
  --status-error: #EF4444;

  /* Typography */
  --font-family-sans: 'Inter', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-display: 'Space Grotesk', 'Plus Jakarta Sans', 'Inter', sans-serif;

  /* Border Radius System */
  --radius-pill: 9999px;         /* Fully rounded pills for buttons & tags */
  --radius-xl: 24px;             /* Hero cards and primary visual containers */
  --radius-lg: 16px;             /* Secondary cards & modals */
  --radius-md: 12px;             /* Floating badges & dropdown menus */
  --radius-sm: 8px;              /* Input fields & small badges */

  /* Elevation & Shadows */
  --shadow-subtle: 0 4px 20px rgba(0, 0, 0, 0.04);
  --shadow-floating: 0 12px 32px rgba(0, 0, 0, 0.08);
  --shadow-pill: 0 2px 8px rgba(0, 0, 0, 0.06);

  /* Transitions */
  --transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-smooth: 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## 3. Typography Hierarchy

| Level | Size (Desktop) | Size (Mobile) | Weight | Line Height | Letter Spacing | Styling / Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Title (H1)** | 64px - 72px | 38px - 44px | 400 - 500 | 1.05 - 1.1 | -0.03em | Primary Hero Headline, clean sentence case |
| **Section Title (H2)** | 36px - 44px | 28px - 32px | 400 - 500 | 1.15 | -0.02em | Section headers & sub-hero titles |
| **Subtitle / H3** | 20px - 24px | 18px - 20px | 500 | 1.3 | -0.01em | Card titles, key callouts |
| **Body Large** | 18px - 20px | 16px | 400 | 1.5 | normal | Lead paragraphs, testimonials |
| **Body Regular** | 15px - 16px | 14px - 15px | 400 | 1.5 | normal | Default content, descriptions |
| **Caption / Nav** | 13px - 14px | 12px - 13px | 400 - 500 | 1.4 | 0.01em | Navigation links, footer, author labels |
| **Pill / Button** | 14px | 13px - 14px | 500 | 1 | 0.01em | Interactive buttons, badges |

---

## 4. Grid & Layout Architecture

### 4.1 Page Container & Spacing
* **Max Content Width**: `1240px` (centered with `margin: 0 auto`).
* **Page Padding (Desktop)**: `40px` horizontal, `32px` top navigation offset.
* **Page Padding (Mobile)**: `20px` horizontal, `16px` top navigation offset.
* **Vertical Section Gap**: `80px` to `120px` (Desktop), `48px` to `64px` (Mobile).

### 4.2 Layout Blueprint (Reference UI breakdown)

1. **Navigation Header**:
   - **Left**: Asterisk / Spark Logo (`✳`) + `/ support@grew.mail` identifier tag.
   - **Center (Desktop)**: Horizontal nav link row (`Automation`, `Solutions`, `Pricing`, `Email Templates`, `FAQ`).
   - **Right**: Secondary link / language toggle + Solid Pill CTA (`Try Now` or `Try Demo ↗`).
   - **Mobile**: Minimal header with Logo on left, `En 🌐`, `Login`, and Pill CTA `Try Demo ↗` on right.

2. **Hero Headline Section**:
   - Large Left-Aligned Hero Title: *"Grow Your Business, No Matter The Size."*
   - Sub-grid with Logo Spark Icon + Two multi-column link lists (`Websites`, `Social Media`, `Newsletters` \| `Marketing API`, `Release Notes`).

3. **Hero Visual Cards Grid**:
   - **Primary Main Card (Lavender Fill `#F3E6F7`)**:
     - Large rounded container (`border-radius: 24px`).
     - Contains clean vector/line art diagrams, floating white pill badge (`Organic +58.50% ~ $25,920`), mail illustration, and dark circular action node with spark icon.
   - **Secondary Accent Card (Sage Fill `#C7E8BC`)**:
     - Tall portrait rounded container (`border-radius: 24px`).
     - Minimal monochrome portrait photo or accent visual.
   - **Mobile View**: Cards stack vertically into full-width hero visual blocks.

4. **Testimonial & Social Proof Section**:
   - Subheading title (*"Try Our Flexible Plans — Grew Mail~Plan Will Launch"*).
   - Testimonial Quote: *"We received a great amount of leads In just 2 weeks timeline!"*
   - Author metadata: Avatar stack (overlapping circular portrait images) + `Roger, Design Lead @Agency`.

---

## 5. Component Specifications

### 5.1 Primary Action Buttons (Pill Buttons)
```css
.btn-pill-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  font-family: var(--font-family-sans);
  font-size: 14px;
  font-weight: 500;
  padding: 10px 22px;
  border-radius: var(--radius-pill);
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: all var(--transition-fast);
}

.btn-pill-primary:hover {
  background-color: var(--btn-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-pill);
}
```

### 5.2 Floating Badge Cards (White UI Pills)
Floating elements inside cards (e.g., metric callouts):
```css
.floating-pill {
  background-color: var(--bg-surface-white);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 8px 16px;
  box-shadow: var(--shadow-subtle);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-primary);
}
```

### 5.3 Hero Pastel Visual Cards
```css
.hero-card-lavender {
  background-color: var(--accent-lavender);
  border-radius: var(--radius-xl);
  padding: 32px;
  position: relative;
  overflow: hidden;
}

.hero-card-sage {
  background-color: var(--accent-sage);
  border-radius: var(--radius-xl);
  overflow: hidden;
  position: relative;
}
```

### 5.4 Avatar Stack
- Overlapping 36px circular avatar images (`margin-left: -10px`).
- Border: `2px solid var(--bg-primary)` to separate avatar rings cleanly.

---

## 6. Iconography & Visual Style Guidelines

1. **Spark / Asterisk Icon (`✳` / Multi-ray Star)**:
   - Used as brand logo mark, hero accent, and button indicator.
   - Clean 8-ray geometric star line icon.
2. **Minimalist Black-Line Illustrations**:
   - Thin black outlines (`#121212`, 1.5px - 2px stroke).
   - Soft filled shapes (white, sage, lavender).
3. **Arrows**:
   - Use clean directional arrows (`↗`, `→`, or custom SVG line arrows) for interactive CTAs.

---

## 7. Responsive Breakpoints

```css
/* Breakpoint System */
/* Desktop */      @media (min-width: 1024px) { ... }
/* Tablet */       @media (min-width: 768px) and (max-width: 1023px) { ... }
/* Mobile */       @media (max-width: 767px) { ... }
```

### Mobile Layout Adaptations:
* Collapse navigation into clean header bar with `Try Demo ↗` pill.
* Stack display title to fit smaller screen sizes gracefully without overflow.
* Change hero grid from `grid-template-columns: 2.2fr 1fr` to single stacked column.
* Testimonial quote & avatar stack aligned vertically with full mobile padding.

---

## 8. Implementation Rules for Developers & AI Models

1. **Always use CSS Custom Properties** (`var(--bg-primary)`, `var(--text-primary)`, etc.) rather than hardcoding hex codes in components.
2. **Typography Rule**: Maintain low-weight font hierarchy for headlines (`font-weight: 400` or `500`) to retain the sophisticated editorial look. Avoid standard heavy `font-weight: 700` bolding for headers.
3. **Border Radius Rule**: All primary buttons and pill badges **must** use `border-radius: 9999px`. Visual cards must use `24px` radius.
4. **No Generic Colors**: Never use default web blues, plain reds, or flat white backgrounds unless specified in design tokens.
5. **Interactive Feedback**: Every interactive button, link, or card must have defined hover and active states (smooth transition, subtle vertical shift `-1px` or `-2px`, and background shift).
