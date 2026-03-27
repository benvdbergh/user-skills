# HTML → PPTX (via `html2pptx.js`)

Vendored reference for converting HTML slide files into PPTX slides using PptxGenJS + Playwright.

This file is copied from the upstream `claude-office-skills` repo to keep `office-pptx/SKILL.md` short.

---

## Creating HTML slides

Every slide HTML **must** set fixed body dimensions.

- **16:9**: `width: 720pt; height: 405pt`
- **4:3**: `width: 720pt; height: 540pt`
- **16:10**: `width: 720pt; height: 450pt`

Supported elements:

- Text: `<p>`, `<h1>`-`<h6>`
- Lists: `<ul>`, `<ol>` (never manual bullets like `•` / `-`)
- Inline formatting: `<b>`, `<i>`, `<u>`, `<span>` (no margins/padding on spans)
- Shapes: `<div>` with background/border/shadow
- Images: `<img>`
- Placeholders: `class="placeholder"` for chart/table insertion areas

Critical rules:

- All text must be inside `<p>` / `<h*>` / `<ul>` / `<ol>` tags.
- Never use `<br>`.
- Never use CSS gradients (rasterize to PNG first).
- Prefer web-safe fonts.

---

## Using the library

Example:

```javascript
const pptxgen = require('pptxgenjs');
const html2pptx = require('./scripts/html2pptx');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';

const { slide, placeholders } = await html2pptx('slides/slide1.html', pptx);
// Use placeholders[0] with slide.addChart(...) etc.

await pptx.writeFile({ fileName: 'output.pptx' });
```

Notes:

- The library validates dimensions and overflow and throws aggregated errors.
- PptxGenJS uses hex colors **without** `#` (e.g. `"FF0000"`).

