# Refine Workflow

Iterative improvement of an existing HTML visualization based on user feedback, audit findings, or new content additions. The agent modifies the existing file rather than regenerating from scratch.

## When to Use

- User requests specific changes to an existing visualization
- Audit findings need to be applied
- New content needs to be added to an existing page
- Style or layout adjustments are needed

## Inputs

- Path to an existing HTML visualization file
- Change request: user feedback, audit report, or new content

## Refinement Categories

### Category 1: Content Changes

Adding, removing, or modifying content sections:

1. **Read** the existing HTML file
2. **Identify** the target section(s) using HTML landmarks and comments
3. **Apply** content changes while preserving surrounding structure
4. **Verify** the section integrates with navigation (update anchors if needed)
5. **Run** Stage 4 self-critique on modified sections

### Category 2: Style Changes

Modifying visual appearance:

1. **Read** the existing HTML file
2. **Identify** which CSS custom properties or rules need changing
3. **Prefer token-level changes** (modify `:root` variables) over individual element overrides
4. **Test** dark mode compatibility if colors are changed
5. **Verify** responsive behavior at all breakpoints

Common style operations:
- **Color palette**: Update `:root` custom properties for primary, secondary, accent
- **Typography**: Adjust `--font-family`, `--font-scale-*` variables
- **Spacing**: Modify `--space-*` tokens
- **Dark mode**: Adjust `[data-theme="dark"]` overrides
- **Animation**: Modify transition durations, easing functions

### Category 3: Component Changes

Swapping, adding, or reconfiguring visual components:

1. **Read** the existing HTML file
2. **Consult** `references/component-map.md` for the new component pattern
3. **Replace** or add the component HTML + associated CSS + JS
4. **Ensure** new component follows existing design tokens
5. **Update** navigation if new sections are added
6. **Run** full self-critique pass

### Category 4: Interactivity Changes

Adding or modifying JavaScript behavior:

1. **Read** the existing HTML file, focus on `<script>` section
2. **Identify** existing event listeners and state management
3. **Add** new functionality without breaking existing behavior
4. **Preserve** theme toggle and scroll animation logic
5. **Test** keyboard accessibility for new interactive elements

### Category 5: Audit Fix Application

Applying fixes from an audit report:

1. **Read** the audit report (`{name}.audit.md`, usually beside the HTML)
2. **Parse** the auto-fix list
3. **Apply fixes in priority order**: Critical → Warnings → Suggestions
4. **After each fix**, verify it doesn't break other functionality
5. **Re-run audit** on modified file to confirm improvements

## Refinement Process

### Step 1: Understand the Request

Parse the change request into concrete modifications:

```
Change Analysis:
- Category: {content|style|component|interactivity|audit-fix}
- Scope: {specific section|global|multiple sections}
- Risk: {low: style-only|medium: structure change|high: component swap}
- Estimated sections affected: {count}
```

### Step 2: Locate Target

Read the HTML file and find the exact elements to modify:
- Use HTML comments, section IDs, and landmarks as anchors
- Identify CSS rules that govern the target area
- Identify JS functions that handle target interactivity

### Step 3: Apply Changes

Use `StrReplace` tool for precise edits:
- **Never regenerate the entire file** for localized changes
- **Preserve existing structure** outside the change scope
- **Maintain design token usage** — don't introduce hardcoded values
- **Keep the self-contained constraint** — don't add new external dependencies unless truly needed

### Step 4: Validate

After applying changes, run the Stage 4 self-critique checklist:

```
Post-Refine Validation:
- [ ] Change applied correctly
- [ ] Surrounding sections unaffected
- [ ] Dark mode still works
- [ ] Responsive layout intact at all breakpoints
- [ ] No new JavaScript errors
- [ ] Navigation links still work
- [ ] Accessibility not degraded
```

### Step 5: Report

Summarize what was changed:

```markdown
## Refinement Summary

**File**: {path}
**Changes Applied**:
1. {description of change 1}
2. {description of change 2}

**Validation**: {pass/warn with details}
**Preview**: Open {path} in browser to verify
```

## Multi-Pass Refinement

When multiple changes are requested:

1. **Group** changes by category
2. **Order** by risk (low → high) to preserve a working state
3. **Apply** each group, validating after each
4. **If a change breaks something**, revert that change and report the conflict
5. **Final validation** after all changes are applied

## Transition Back to Audit

After significant refinements (component swaps, structural changes), recommend running the full audit workflow to generate an updated quality score.
