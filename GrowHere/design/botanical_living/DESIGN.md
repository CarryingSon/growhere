---
name: Botanical Living
colors:
  surface: '#effdef'
  surface-dim: '#d0ded0'
  surface-bright: '#effdef'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e9f7e9'
  surface-container: '#e3f2e3'
  surface-container-high: '#deecde'
  surface-container-highest: '#d8e6d8'
  on-surface: '#121e16'
  on-surface-variant: '#414941'
  inverse-surface: '#27332a'
  inverse-on-surface: '#e6f5e6'
  outline: '#717971'
  outline-variant: '#c1c9bf'
  surface-tint: '#3b6847'
  primary: '#154326'
  on-primary: '#ffffff'
  primary-container: '#2e5b3b'
  on-primary-container: '#a0d1a9'
  inverse-primary: '#a1d2aa'
  secondary: '#795900'
  on-secondary: '#ffffff'
  secondary-container: '#fec643'
  on-secondary-container: '#715300'
  tertiary: '#4e3522'
  on-tertiary: '#ffffff'
  tertiary-container: '#684c37'
  on-tertiary-container: '#e4bea3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bcefc5'
  primary-fixed-dim: '#a1d2aa'
  on-primary-fixed: '#00210d'
  on-primary-fixed-variant: '#225031'
  secondary-fixed: '#ffdf9f'
  secondary-fixed-dim: '#f5be3b'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5c4300'
  tertiary-fixed: '#ffdcc4'
  tertiary-fixed-dim: '#e5bfa5'
  on-tertiary-fixed: '#2b1706'
  on-tertiary-fixed-variant: '#5c412d'
  background: '#effdef'
  on-background: '#121e16'
  surface-variant: '#d8e6d8'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 21px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 17px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers a calm, modern botanical atmosphere tailored for urban plant enthusiasts. It avoids distressed or rustic motifs in favor of crisp contemporary architecture, serene organic geometry, and light-filled breathable surfaces.

The emotional tone balances tranquility and scientific clarity. The interface acts as an ambient field guide—reassuring, gentle, and tactile. Visual tension is deliberately low: high-contrast friction is softened through deep organic inks, generous negative space, and smooth, oversized tap surfaces suited for casual one-handed thumb navigation.

## Colors

The palette balances botanical greens with sunlight and earth pigments against a soft canvas.

### Core Canvas & Surfaces
- **App Canvas / Page Base:** Pale Sage `#EDF1EA` — softens screen glare and establishes an organic, restful background.
- **Card & Sheet Surfaces:** Crisp Botanical White `#FFFFFF` — ensures high legibility and clean layering against the pale sage background.
- **Primary / Brand Action:** Deep Moss Green `#2E5B3B` — used for primary calls-to-action, active bottom navigation states, and dominant brand anchors.
- **Primary Ink / Typography:** Deep Moss Ink `#1E2A21` — replaces harsh pure black with a forest-tinged dark value for soft, high-contrast reading.
- **Muted Ink / Secondary Labels:** Olive Slate `#556859` — secondary metadata, helper text, and inactive states.
- **Subtle Stroke / Border:** Soft Sage Stroke `#D9E2D5` — hair-thin boundaries on pure white containers.

### Domain-Specific Data Tokens

#### Light Exposure Attributes
- **Direktno sonce (Direct Sun):** Sun Amber `#E3AE2A`
- **Svetlo, posredno (Bright Indirect):** Radiant Butter `#F5D366`
- **Srednja svetloba (Medium Light):** Foliage Green `#3E9B4F`
- **Malo svetlobe (Low Light):** Shaded Slate Blue `#7C98A6`

#### Care Difficulty Levels
- **Enostavna (Easy):** Meadow Green `#3E9B4F`
- **Srednja (Moderate):** Clear Stream Blue `#2F6FC4`
- **Zahtevna (Demanding):** Berry Red `#C9372C`

#### Soil & Substrate Information
- **Soil Accent:** Rich Loam Brown `#6B4F3A`
- **Soil Tint Base:** Soft Earth Mist `#F4EDE7`

## Typography

Plus Jakarta Sans is utilized across all tiers to deliver a welcoming, human-centric voice with clear geometric precision.

- **Botanical Names & Headings:** Use bold weights (`fontWeight: 700`) with tight letter spacing for species titles to create authoritative, editorial character.
- **Scientific Names (Latin binomials):** Displayed in `body-sm` or `headline-sm` with standard italic styling and muted ink `#556859`.
- **Micro Tags & Badges:** Use `label-sm` with uppercase transformation and slight tracking (`letterSpacing: 0.04em`) to maintain sharp readability inside small status pills.
- **Reading Rhythm:** Body copy uses a relaxed line height (`1.4`–`1.5`) to promote leisurely reading during light diagnostic walkthroughs.

## Layout & Spacing

The layout is built for native iOS and Android experiences, optimized for thumb reach and natural posture.

- **Column Structure:** Fluid 4-column system on compact screens with a minimum outer canvas margin of `1.25rem` (`20px`) and column gutters of `1rem` (`16px`).
- **Vertical Rhythm:** Screen headers and content modules maintain generous spacing (`space-lg` and `space-xl`) to establish an uncluttered, open feel.
- **Touch Ergonomics:** All actionable elements (buttons, chip selectors, plant list cards) enforce an absolute minimum touch target height of `48px` (ideally `56px` for primary flows).
- **Navigation Dock:** Bottom navigation reserves `64px` base height plus device safe area insets to prevent cramping.

## Elevation & Depth

Visual depth is communicated primarily through crisp white planes layered over pale sage, supplemented by gentle tinted ambient shadows. Heavy drops and harsh artificial drop-shadows are excluded.

- **Level 0 (Canvas Base):** Flat Pale Sage `#EDF1EA`.
- **Level 1 (Surface Cards & Floating Sheets):** Solid `#FFFFFF` elevated with a tinted ambient shadow: `box-shadow: 0 4px 16px -2px rgba(30, 42, 33, 0.05), 0 1px 3px 0 rgba(30, 42, 33, 0.03)` and a 1px border of `#D9E2D5`.
- **Level 2 (Active Cards / Raised Selectors):** `box-shadow: 0 8px 24px -4px rgba(30, 42, 33, 0.08), 0 2px 6px 0 rgba(30, 42, 33, 0.04)`.
- **Level 3 (Modal Bottom Sheets & Floating Actions):** Pure White `#FFFFFF` with `box-shadow: 0 16px 40px -8px rgba(30, 42, 33, 0.16)`.
- **Bottom Navigation Elevation:** Supported by a soft, directional upward glow: `box-shadow: 0 -4px 20px 0 rgba(30, 42, 33, 0.04)` combined with an optional top border of `#E5ECE2`.

## Shapes

The design system embraces deep organic curvature:

- **Buttons & Tags:** Full pill format (`border-radius: 9999px`) to invite touch and reinforce natural contours.
- **Cards & Data Panels:** Substantial `rounded-2xl` (`1.25rem` / `20px`) to `rounded-3xl` (`1.5rem` / `24px`) radii, echoing the soft edges of river stones and indoor foliage.
- **Bottom Navigation Bar & Modals:** Top corners styled with `rounded-3xl` (`24px` to `28px`) for organic transitions over page content.
- **Image Frames:** Plant portrait thumbnails use balanced `rounded-2xl` masking.

## Components

### Buttons
- **Primary Action (Scan / Confirm):** Height of `52px` or `56px`, pill-shaped (`rounded-full`), background `#2E5B3B`, text `#FFFFFF`, font `label-lg`. Pressed state transitions to a deeper moss tone (`#23462D`) with subtle inward scale (`0.98`).
- **Secondary Action:** Pill-shaped, background `rgba(46, 91, 59, 0.1)`, text `#2E5B3B`, zero border.
- **Tertiary / Ghost Action:** Transparent surface, text `#2E5B3B`, subtle underline or standalone icon lockup.

### Chips & Badges
- **Light Level Badges:** Pill-shaped (`rounded-full`), `space-xs` vertical padding, `space-sm` horizontal padding. Displayed as a 12% opacity background of the corresponding light color, populated with the full-strength hue for icon and label.
  - *Direktno sonce:* Background `rgba(227, 174, 42, 0.14)`, text `#B88514`.
  - *Svetlo, posredno:* Background `rgba(245, 211, 102, 0.22)`, text `#9C7C18`.
  - *Srednja svetloba:* Background `rgba(62, 155, 79, 0.14)`, text `#2E753B`.
  - *Malo svetlobe:* Background `rgba(124, 152, 166, 0.16)`, text `#4F6875`.
- **Difficulty Badges:** Compact pills featuring a filled circular status indicator (`6px`) followed by the status label.
  - *Enostavna:* Meadow Green `#3E9B4F`.
  - *Srednja:* Stream Blue `#2F6FC4`.
  - *Zahtevna:* Berry Red `#C9372C`.
- **Soil Characteristic Badges:** Background `#F4EDE7`, text `#6B4F3A`, border `1px solid rgba(107, 79, 58, 0.12)`.

### Cards
- **Plant Profile Card:** White `#FFFFFF` container with `rounded-2xl` corners, 1px `#D9E2D5` border, and Level 1 elevation. Layout includes plant photo (left or top), primary name in `headline-sm`, scientific name in `body-sm`, and a footer row showing sunlight and difficulty chips.
- **Light Sensor Metric Card:** Large focal numerical display (Lux or Foot-Candles) with an interactive sun icon colored `#E3AE2A`, framed with an ambient gradient ring.

### Lists & Rows
- **Plant Inventory Row:** Full-width white card or segmented row on Pale Sage. Left-aligned thumbnail (`56px` with `rounded-xl`), title and room subtitle in center, and quick-action or status indicator on the right. Separators use `#EDF1EA`.

### Form Controls (Checkboxes, Radios, Inputs)
- **Input Fields:** Search and room name fields feature a filled white container, `rounded-2xl`, height `52px`, text `#1E2A21`, placeholder `#7E9183`, and an active focus outline of `2px solid #2E5B3B`.
- **Radio & Selection Controls:** Smooth circular targets with a `24px` diameter. Unselected: `2px solid #D9E2D5`. Selected: `#2E5B3B` fill featuring a centered white dot or checkmark.

### Bottom Navigation Bar
- **Tab Layout:** Fixed at base with 3 dedicated destinations:
  1. **Skeniraj:** Center or primary tab, accentuated by an elevated moss circular icon button (`56px` diameter, `#2E5B3B` fill, `#FFFFFF` camera/light sensor icon).
  2. **Moje rastline:** Left tab, featuring a leaf/pot icon and label.
  3. **Katalog:** Right tab, featuring an open book/botanical grid icon and label.
- **Visual State:** Inactive tabs use `#556859`; active tab uses `#2E5B3B` accompanied by a small active indicator dot beneath the label.