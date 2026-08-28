---
name: Mission Control Narrative
colors:
  surface: '#161b22'
  surface-dim: '#10141a'
  surface-bright: '#353940'
  surface-container-lowest: '#0a0e14'
  surface-container-low: '#181c22'
  surface-container: '#1c2026'
  surface-container-high: '#262a31'
  surface-container-highest: '#31353c'
  on-surface: '#dfe2eb'
  on-surface-variant: '#b9ccb2'
  inverse-surface: '#dfe2eb'
  inverse-on-surface: '#2d3137'
  outline: '#84967e'
  outline-variant: '#3b4b37'
  surface-tint: '#00e639'
  primary: '#ebffe2'
  on-primary: '#003907'
  primary-container: '#00ff41'
  on-primary-container: '#007117'
  inverse-primary: '#006e16'
  secondary: '#dcfdff'
  on-secondary: '#00373a'
  secondary-container: '#00f1fd'
  on-secondary-container: '#006a6f'
  tertiary: '#fff8f4'
  on-tertiary: '#442b10'
  tertiary-container: '#ffd5ae'
  on-tertiary-container: '#7a5b3c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#72ff70'
  primary-fixed-dim: '#00e639'
  on-primary-fixed: '#002203'
  on-primary-fixed-variant: '#00530e'
  secondary-fixed: '#6ff6ff'
  secondary-fixed-dim: '#00dce6'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f53'
  tertiary-fixed: '#ffdcbd'
  tertiary-fixed-dim: '#e7bf99'
  on-tertiary-fixed: '#2c1701'
  on-tertiary-fixed-variant: '#5d4124'
  background: '#10141a'
  on-background: '#dfe2eb'
  surface-variant: '#31353c'
  border-subtle: '#30363d'
  text-muted: '#8b949e'
  alert-critical: '#ff3131'
typography:
  display-lg:
    fontFamily: hankenGrotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: hankenGrotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: hankenGrotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: hankenGrotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: hankenGrotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-lg:
    fontFamily: jetbrainsMono
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.01em
  data-md:
    fontFamily: jetbrainsMono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-caps:
    fontFamily: jetbrainsMono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for high-stakes information environments, evoking the precision and urgency of a mission control center. It targets professional analysts and news-watchers who require immediate clarity and data density without cognitive overload.

The aesthetic blends **Modern Minimalism** with **High-Tech Data-Driven** elements. It prioritizes functional beauty—where every line and pixel serves a purpose. Visual interest is generated through the contrast between deep obsidian surfaces and vibrant, luminous "signals" that denote activity and urgency. The overall mood is serious, authoritative, and technologically advanced.

## Colors

The palette is anchored by a deep-space background (`#0d1117`), providing a low-strain environment for long-duration monitoring. 

- **Signal Green (#00ff41):** Used for primary actions, "Active" status indicators, and positive data trends.
- **Electric Cyan (#00f3ff):** Reserved for secondary data points, interactive highlights, and information-level tags.
- **Surface & Border:** UI elements use a layered approach with `#161b22` for card surfaces, defined by thin 1px borders (`#30363d`) rather than shadows to maintain a flat, technical profile.
- **Functional Accents:** A critical red is included for high-magnitude events or emergency alerts.

## Typography

This design system utilizes a dual-font strategy to distinguish between narrative content and technical data.

- **Hanken Grotesk:** A sharp, contemporary sans-serif used for headlines and body copy. It provides a professional, approachable feel that balances the technicality of the interface.
- **JetBrains Mono:** Employed for all numerical values, timestamps, coordinates, and system labels. The monospaced nature ensures that columns of numbers align perfectly, facilitating rapid scanning and comparison.
- **Styling Note:** Use all-caps with increased letter spacing for `label-caps` to denote category headers and metadata tags.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a strictly enforced 4px baseline shift. This ensures "dense but breathable" data visualization.

- **Grid:** A 12-column system is used for desktop, collapsing to 1 column for mobile.
- **Density:** Information density is high. Use 16px (4 units) for internal card padding and 8px (2 units) for spacing between related data points.
- **Alignment:** Elements must be hard-aligned to the grid to maintain the "instrument panel" aesthetic. Avoid centered layouts; prefer left-aligned or justified-to-edge configurations for data readouts.

## Elevation & Depth

In a mission-control environment, depth is achieved through **Tonal Layering** and **Line-work** rather than traditional shadows.

- **Stacking:** The base layer is `#0d1117`. Floating panels or cards use `#161b22`. 
- **Borders:** Every surface transition is marked by a 1px solid border (`#30363d`). This creates a blueprint-like precision.
- **Active State Elevation:** To highlight an active or "hovered" element, increase the border brightness to the primary accent color (`#00ff41`) or apply a very subtle inner glow (0px 0px 4px) of the same hue.

## Shapes

The shape language is disciplined and geometric. 

- **Corners:** A subtle 6px - 8px radius is applied to cards and large containers to soften the technical edge just enough for modern usability.
- **Interactive Elements:** Small buttons and inputs use the same 6px radius.
- **Status Pills:** Badges and tags use a full "pill" radius (100px) to distinguish them from structural containers and indicate they are discrete, metadata-rich objects.

## Components

- **Buttons:** Primary buttons use a solid `Signal Green` fill with black text. Secondary buttons are outlined with `Electric Cyan` and use monospace labels.
- **Input Fields:** Dark background (`#090909`), 1px border, and a monospace cursor. The active state changes the border color to `Electric Cyan`.
- **Pill Badges:** Used for magnitudes (e.g., "7.2 RICHTER") or tags. They feature a low-opacity background tint of the status color with a high-contrast text label.
- **Cards:** Minimalist containers. Title bars within cards should have a subtle bottom border and use `label-caps` for the header.
- **Data Tickers:** Scrolling news or event feeds should use `body-sm` for the text and `data-md` for the timestamp, separated by a vertical bar (`|`).
- **Activity Gauges:** Use thin 2px lines for sparklines and progress bars, utilizing the `Signal Green` to `Electric Cyan` gradient for non-critical metrics.