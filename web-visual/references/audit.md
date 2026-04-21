# Audit Workflow

Systematic quality validation of a generated HTML visualization. Implements the "self-critique" phase as a standalone workflow that can run independently or as part of compose/refine.

## When to Use

- After compose or refine to verify quality
- User explicitly asks to check accessibility, responsiveness, or code quality
- Before sharing or deploying a visualization

## Inputs

- Path to an existing HTML visualization file

## Audit Dimensions

The audit evaluates five dimensions, each scored on a 0-10 scale:

### 1. Accessibility (WCAG 2.1 AA)

| Check | Criteria | Severity |
|---|---|---|
| Semantic HTML | Proper use of `<header>`, `<nav>`, `<main>`, `<section>`, `<article>` | Critical |
| Heading hierarchy | H1 → H2 → H3 without skips | Critical |
| ARIA labels | Interactive elements have accessible names | Critical |
| Color contrast | Text ≥ 4.5:1, large text ≥ 3:1 against background | Critical |
| Keyboard navigation | All interactive elements reachable via Tab | High |
| Focus indicators | Visible focus styles on interactive elements | High |
| Alt text | Images and charts have descriptive alternatives | High |
| Motion | `prefers-reduced-motion` respected for animations | Medium |
| Language | `<html lang="...">` attribute set correctly | Medium |

### 2. Responsiveness

Test layout integrity at four breakpoints by analyzing CSS:

| Breakpoint | Width | Expected Behavior |
|---|---|---|
| Mobile | 320px | Single column, stacked sections, no horizontal overflow |
| Tablet | 768px | 2-column grid, charts resize properly |
| Desktop | 1024px | Full layout, all components visible |
| Wide | 1440px | Max-width container, no excessive stretching |

Check for:
- Horizontal scroll on mobile (should not occur)
- Text readability at all sizes (min 16px body text on mobile)
- Touch targets ≥ 44x44px on mobile
- Images and charts scale proportionally
- Navigation adapts (hamburger on mobile if needed)

### 3. Code Quality

| Check | Criteria |
|---|---|
| Valid HTML5 | No unclosed tags, proper doctype, charset declaration |
| CSS organization | Custom properties used, no magic numbers, logical grouping |
| JS quality | No `var` (use `const`/`let`), no console.log, error handling present |
| No inline styles | All styling via `<style>` block or CSS classes |
| File size | Total HTML < 500KB (excluding CDN scripts) |
| CDN integrity | External scripts use specific versions, not `@latest` |
| No dead code | No unused CSS rules or unreachable JS functions |

### 4. Visual Consistency

| Check | Criteria |
|---|---|
| Design tokens | All colors, spacing, typography via CSS custom properties |
| Typography scale | Consistent heading sizes following a modular scale |
| Spacing rhythm | Consistent margins/padding using token multiples |
| Color palette | Maximum 5-6 colors plus neutrals, derived from tokens |
| Dark mode | All elements properly themed, no hardcoded colors |
| Print styles | `@media print` present, removes interactive elements |

### 5. Content Fidelity

| Check | Criteria |
|---|---|
| Completeness | All source content sections represented in visualization |
| Accuracy | Data values match source, no transformation errors |
| Hierarchy | Visual prominence matches content importance |
| Readability | Text is legible, not truncated, properly wrapped |
| Interactivity purpose | Every interactive element serves the content |

## Audit Report Format

Generate the report as `{name}.audit.md` in the **same directory as the HTML file** being audited (or a path the user specified for audit output):

```markdown
---
title: Audit Report - {Visualization Name}
type: web-visual-audit
created: {date}
file: {path to HTML file}
overall-score: {average of 5 dimensions}/10
---

# Audit Report: {Visualization Name}

## Score Summary

| Dimension | Score | Status |
|---|---|---|
| Accessibility | {n}/10 | {pass/warn/fail} |
| Responsiveness | {n}/10 | {pass/warn/fail} |
| Code Quality | {n}/10 | {pass/warn/fail} |
| Visual Consistency | {n}/10 | {pass/warn/fail} |
| Content Fidelity | {n}/10 | {pass/warn/fail} |
| **Overall** | **{avg}/10** | **{status}** |

Status thresholds: pass ≥ 8, warn ≥ 6, fail < 6

## Findings

### Critical (must fix)
- {finding with specific line/element reference}

### Warnings (should fix)
- {finding with specific line/element reference}

### Suggestions (nice to have)
- {finding with improvement suggestion}

## Auto-Fix Available

The following issues can be automatically fixed:
- [ ] {issue description} — {proposed fix}
- [ ] {issue description} — {proposed fix}

Apply auto-fixes? (User confirms before changes are made)
```

## Workflow Steps

1. **Read** the HTML file
2. **Parse** the structure: identify HTML elements, CSS rules, JS blocks
3. **Evaluate** each dimension using the criteria tables above
4. **Score** each dimension (0-10) based on findings
5. **Generate** the audit report markdown
6. **Save** next to the HTML (or to the user-specified audit path), e.g. `{html-dir}/{name}.audit.md`
7. **Present** summary to user with option to auto-fix issues
8. If user approves auto-fixes, invoke the **refine** workflow with the fix list

## Scoring Guidelines

- **10**: Perfect, no issues found
- **8-9**: Minor suggestions only, production-ready
- **6-7**: Some warnings that should be addressed
- **4-5**: Significant issues affecting usability
- **2-3**: Major problems, needs rework
- **0-1**: Fundamentally broken
