# Slide Creation Workflow

## Step 1: Parse Intent
Extract from arguments or conversation:
- **Goal**: investor pitch / sales demo / training / report / product launch
- **Slide count**: default 10 if unspecified
- **Audience**: investors / customers / internal team
- **Tone**: professional / energetic / minimalist

## Step 2: Select Strategy
Search slide-strategies for the best deck structure:

> **Note:** This command requires the `design-system` skill to be installed. If unavailable, use the reference table below directly.

```bash
python .claude/skills/design-system/scripts/search-slides.py "<goal> <audience>" -d strategy
```

If design-system is unavailable, select manually from `references/slide-strategies.md`.

Pick the strategy whose `goal` and `audience` best match the request. Note the `slide_count`, `structure`, and `narrative_arc`.

## Step 3: Plan Slide-by-Slide
For each slide position (1 through N), determine:
- **Layout**: query layout-patterns or select from `references/layout-patterns.md`
- **Copywriting formula**: query copywriting-formulas or select from `references/copywriting-formulas.md`
- **Chart** (if data slide): select chart type from `references/html-template.md` Chart.js section

Output a plan table before generating HTML:
| Slide | Title | Layout | Formula | Chart? |
|---|---|---|---|---|
| 1 | Problem | hero-text | PAS | No |
| 2 | … | … | … | … |

## Step 4: Generate HTML
For each slide, generate HTML following `references/html-template.md`:
- Import `assets/design-tokens.css` as the single source of truth
- Use CSS variables exclusively (`var(--color-primary)`, `var(--slide-bg)`, etc.) — never hardcoded hex
- Use Chart.js for all charts (`<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js">`)
- Include keyboard navigation (arrow keys + click), progress bar, slide counter
- Center content; focus on persuasion and clarity

Assemble all slides into one `.html` file with a `<div class="slides-container">` wrapper.

## Step 5: Validate Output
Run token compliance check if design-system is available:
```bash
python .claude/skills/design-system/scripts/slide-token-validator.py <output.html>
```

Fix any hardcoded color or font values reported.

## Step 6: Present to User
- Report the output file path
- Briefly describe the strategy chosen and narrative arc
- Ask if the user wants to adjust any slides

## Completion Signal
Workflow is complete when:
- A single navigable `.html` file exists at the specified output path
- All slides match the planned count and structure
- No hardcoded values (validator passes or validator unavailable)
