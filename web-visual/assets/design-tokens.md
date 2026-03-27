# Design Tokens

Standard token system for all web-visual outputs. Copy the `:root` block into every generated HTML file and override specific tokens per-project as needed.

## CSS Custom Properties

```css
:root {
  /* === Color Palette === */
  --color-primary: #2563eb;
  --color-primary-light: #60a5fa;
  --color-primary-dark: #1d4ed8;
  --color-secondary: #7c3aed;
  --color-accent: #06b6d4;

  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  --color-bg: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  --color-surface: #ffffff;
  --color-border: #e2e8f0;

  --color-text: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #94a3b8;
  --color-text-inverse: #ffffff;

  /* === Typography === */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  --font-display: var(--font-sans);

  --font-size-xs: clamp(0.75rem, 1.5vw, 0.8rem);
  --font-size-sm: clamp(0.8rem, 2vw, 0.875rem);
  --font-size-base: clamp(0.95rem, 2.5vw, 1.0625rem);
  --font-size-lg: clamp(1.1rem, 3vw, 1.25rem);
  --font-size-xl: clamp(1.3rem, 3.5vw, 1.5rem);
  --font-size-2xl: clamp(1.6rem, 4vw, 2rem);
  --font-size-3xl: clamp(2rem, 5vw, 2.75rem);
  --font-size-4xl: clamp(2.5rem, 6vw, 3.5rem);

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.65;

  --letter-spacing-tight: -0.025em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.025em;

  /* === Spacing === */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;

  /* === Layout === */
  --max-width: 1200px;
  --max-width-narrow: 720px;
  --max-width-wide: 1440px;
  --content-padding: var(--space-6);
  --section-gap: var(--space-16);

  /* === Borders === */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;
  --border-width: 1px;

  /* === Shadows === */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* === Transitions === */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --duration-slower: 700ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* === Z-Index Scale === */
  --z-base: 0;
  --z-above: 10;
  --z-nav: 100;
  --z-modal: 1000;
  --z-tooltip: 1100;

  /* === Chart Colors (sequential palette for data viz) === */
  --chart-1: #2563eb;
  --chart-2: #7c3aed;
  --chart-3: #06b6d4;
  --chart-4: #10b981;
  --chart-5: #f59e0b;
  --chart-6: #ef4444;
  --chart-7: #8b5cf6;
  --chart-8: #14b8a6;
}
```

## Dark Mode Overrides

```css
[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-bg-tertiary: #334155;
  --color-surface: #1e293b;
  --color-border: #334155;

  --color-text: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;

  --color-primary-light: #93c5fd;

  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3);
}
```

## Base Styles

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text);
  background: var(--color-bg);
}

h1, h2, h3, h4 {
  font-family: var(--font-display);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text);
}

h1 { font-size: var(--font-size-4xl); font-weight: var(--font-weight-bold); }
h2 { font-size: var(--font-size-2xl); font-weight: var(--font-weight-semibold); }
h3 { font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold); }
h4 { font-size: var(--font-size-lg); font-weight: var(--font-weight-medium); }

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-default);
}
a:hover { color: var(--color-primary-dark); }

code {
  font-family: var(--font-mono);
  font-size: 0.9em;
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
}

/* Focus ring for accessibility */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Print styles */
@media print {
  nav, .theme-toggle, .scroll-to-top { display: none !important; }
  body { color: #000; background: #fff; }
  a { color: #000; text-decoration: underline; }
  .chart-container canvas { max-height: 300px; }
}
```

## Usage Guidelines

- **Never hardcode colors** — always use `var(--color-*)` tokens
- **Spacing should use tokens** — avoid arbitrary pixel values
- **Typography uses fluid scale** — the `clamp()` values handle responsive sizing automatically
- **Dark mode is free** — if you use tokens, toggling `data-theme` switches everything
- **Charts use sequential palette** — `--chart-1` through `--chart-8` for data series
- **Customize per-project** by overriding tokens in the generated HTML, not by changing this file
