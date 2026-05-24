---
name: LAPS Signal Lab
colors:
  laps-navy: "#193A59"
  laps-blue: "#0B4E8D"
  laps-light: "#74B5F2"
  laps-ghost: "#E0F0FF"
  laps-white: "#FFFFFF"
  border: "oklch(0.9 0.02 240)"
  background: "oklch(1 0 0)"
  foreground: "oklch(0.25 0.05 250)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.25 0.05 250)"
  primary: "oklch(0.36 0.10 250)"
  primary-foreground: "oklch(1 0 0)"
  secondary: "oklch(0.96 0.02 240)"
  secondary-foreground: "oklch(0.25 0.05 250)"
  muted: "oklch(0.96 0.02 240)"
  muted-foreground: "oklch(0.5 0.04 250)"
  accent: "oklch(0.85 0.08 240)"
  accent-foreground: "oklch(0.25 0.05 250)"
  ring: "oklch(0.5 0.1 250)"
typography:
  sans:
    fontFamily: "'Montserrat', system-ui, sans-serif"
    weights: [300, 400, 500, 600, 700, 800]
  display:
    fontFamily: "'Space Grotesk', 'Montserrat', system-ui, sans-serif"
    letterSpacing: "-0.02em"
    weights: [400, 500, 600, 700]
radii:
  sm: "calc(0.625rem - 4px)"
  md: "calc(0.625rem - 2px)"
  DEFAULT: "0.625rem"
  lg: "0.625rem"
  xl: "calc(0.625rem + 4px)"
  2xl: "1rem"
  3xl: "1.5rem"
  full: "9999px"
spacing:
  container: "max-w-7xl"
  section: "py-24"
  gap-md: "1rem"
  gap-lg: "1.5rem"
motion:
  wave-flow: "18s linear infinite"
  float-soft: "float -6px up, 50% timing"
  transition: "all gently with hover lifting (-translate-y-1)"
shadows:
  ambient: "0 2px 20px rgba(25, 58, 89, 0.08)"
  soft: "0 12px 40px rgba(11, 78, 141, 0.12)"
  elevated: "0 20px 60px -20px rgba(11, 78, 141, 0.4)"
---

## Brand & Style
The LAPS (Laboratório de Aquisição e Processamento de Sinais) design system is built to convey a rigorous academic and technological presence while remaining approachable, modern, and high-tech. The aesthetic is definitively "Modern Scientific," merging organic data visualizations with crisp, corporate reliability.

The interface leverages significant whitespace to reduce cognitive load, utilizing subtle tinted borders and shadows to establish a deep sense of quality and precision.

## Colors
The palette is deeply rooted in oceanic and scientific hues, prioritizing trust (Navy) and technological energy (Light Blue). It leans heavily into a monochromatic blue scale to maintain a serene, rational environment.

- **Primary Colors:** `laps-navy` (#193A59) grounds the application, serving as the core text and structural color. `laps-blue` (#0B4E8D) and `laps-light` (#74B5F2) drive actions and energetic highlights.
- **Backgrounds:** `laps-ghost` (#E0F0FF) provides a highly aerated, low-contrast canvas for elevated components, allowing standard `white` cards to pop gently.
- **Accents:** Vivid, highly-saturated but soft gradients (often from Laps Blue to Laps Light) are used strategically to guide the eye or represent data flow.

## Typography
The system employs a dual-typeface strategy to balance academic tradition with computational modernity.

- **Display (Headings):** **Space Grotesk** is utilized for primary headings and prominent data points (like numbers in statistics). Its geometric, slightly brutalist proportions give the system a distinctly "engineering" and "machine learning" flair.
- **Sans (Body & Labels):** **Montserrat** provides exceptional legibility and geometric balance for body copy, buttons, and metadata. It remains highly readable at smaller scales.

## Layout & Spacing
The layout relies on a structured, responsive grid (typically 4-column mobile, 12-column desktop up to a `max-w-7xl` container). 

- **Breathing Room:** Generous internal padding (p-6, p-8) and massive section margins (`py-24` or `py-28`) define the experience. Elements are never crowded.
- **Alignment:** Content is often logically clustered within "containers" utilizing left-aligned typography but centered overarching section headers to define rhythm.

## Elevation & Depth (Shadows)
Elevation is achieved using deeply tinted, ambient shadows rather than stark grays or blacks.
- **Tinted Shadows:** Shadows use the `laps-blue` and `laps-navy` colors as their base (e.g., `rgba(11, 78, 141, 0.12)` or `rgba(25, 58, 89, 0.08)`). This prevents the UI from looking "dirty" and instead gives it a luminous, glowing dimensionality.
- **Hover Lifts:** Interactive cards and elements "lift" gently (`-translate-y-1`) while increasing shadow spread and opacity to simulate tactile physical response.

## Shapes & Motion
- **Radii:** The shape language is universally "soft technical." Most background panels and cards use a `rounded-2xl` (16px) or `rounded-3xl` (24px) radius, while the base components use `0.625rem` (10px). Inner elements typically match with concentric radii to maintain geometric harmony.
- **Data as Motion:** The system incorporates generative backgrounds (like the `NeuralMesh` or `WaveStrip` and `ValuesGraph`) that are constantly in stochastic or fluid movement. This actively illustrates "signals" and "processing" in the background, reinforcing the lab's core thesis without cluttering the foreground UI.
