---
name: ux-designer
description: >-
  Creates professional, industry-appropriate UX and UI designs by combining
  UI UX Pro Max style and design-system intelligence with BMAD UX-designer
  workflows. Use when you need to design or refine user experiences, screens,
  flows, or design systems (including brand themes, color palettes, typography,
  interaction patterns, and accessibility) for web, mobile, or dashboards.
license: MIT
metadata:
  author: PAI
  version: 1.0.0
---

# ux-designer

Skill for end-to-end UX and UI design that blends the design-system intelligence of
UI UX Pro Max with the structured UX design workflow from the BMAD Method.

The skill is optimized for:
- Translating product contexts, requirements, and user journeys into concrete UX artefacts
- Generating or adapting design systems (colors, typography, components, layouts)
- Creating page and flow structures that match industry norms and conversion patterns
- Ensuring accessibility, usability, and brand consistency

It assumes familiarity with concepts and patterns from:
- UI UX Pro Max design system and reasoning rules (styles, industry-specific patterns,
  color palettes, typography pairings, anti-patterns, and pre-delivery checklists).
- BMAD UX-designer and the BMAD Method (UX as a Phase 2 planning workflow following
  a PRD, with traceability back to requirements and constraints).

## When This Skill Should Trigger

The skill should activate when the user:
- Asks to **design, redesign, or improve** a UI, screen, page, flow, or full product experience.
- Requests a **design system, style guide, theme, or brand-aligned UI**.
- Wants **UX deliverables** such as user flows, wireframes in textual form, layout specs,
  or UX acceptance/validation criteria.
- Mentions **brand theme, brand guidelines, colors, typography, or visual style** to apply.
- References **BMAD, design-UX, UX designer, UX flows, UX checklists, or UX quality gates**.

## Brand Theme and Color Theory Handling

When using this skill:

- **If the user provides a brand theme or brand guidelines** (e.g., brand colors, logo colors,
  tone-of-voice, mood words, market positioning, existing design tokens):
  - Treat those as primary constraints.
  - Harmonize them into a coherent palette using color theory (complementary, analogous,
    split-complementary, or triadic schemes as appropriate).
  - Adjust for **WCAG contrast**, legibility, and real-world usage (backgrounds vs text vs accents).
  - Use UI UX Pro Max style rules and industry reasoning to suggest subtle extensions
    (e.g., neutrals, supporting grays, semantic colors) without breaking the brand.
  - Call out anti-patterns explicitly (e.g., too many saturated accents, inaccessible contrasts,
    overuse of neon or AI gradient tropes where they do not fit the industry).

- **If no brand theme is provided**:
  - Infer industry, product type, and audience from the prompt (e.g., SaaS dashboard,
    beauty/wellness, fintech banking, healthcare analytics, creative portfolio).
  - Use UI UX Pro Max reasoning rules to select:
    - A **layout pattern** (e.g., Hero-centric with social proof, Feature-rich SaaS, Trust-centric).
    - One or more **UI styles** (from minimalism, soft UI evolution, bento grids, dark mode, etc.).
    - An **industry-appropriate color palette** with 4–6 core tokens:
      primary, secondary, background, surface, text, and 1–2 accent/CTA colors.
  - Describe the **color mood** (e.g., calming, high-trust, energetic, premium) and justify
    it in terms of brand positioning and user psychology.
  - Explicitly validate contrast ratios and accessibility at a conceptual level and avoid
    common anti-patterns (e.g., low-contrast pastel text, AI gradient overload for finance,
    neon-on-dark for formal or regulatory contexts).

In all cases, the skill should:
- Produce **named design tokens** (e.g., `color.primary`, `color.accent`, `font.heading`)
  so they can be codified easily.
- Provide **rationale** for key choices (why this palette, style, and typography for this product).

## UX Designer Role in the BMAD Method

This skill follows BMAD Method principles for UX:

- **Position in lifecycle**:
  - Primarily used in **BMAD Phase 2 (Planning)**, after a Product Requirements Document (PRD)
    exists or at least a structured problem/solution description.
  - It can also be used in early discovery to sketch provisional UX options, but must label
    those as exploratory vs. PRD-aligned.

- **Required / recommended inputs**:
  - Product context and goals (what is being built, who it serves, business objectives).
  - Key user segments and user journeys (even high-level).
  - Functional requirements and constraints (e.g., platform, devices, technical stack).
  - Any available brand guidelines or themes (colors, typography, logo usage, tone).

- **Traceability**:
  - Every major UX decision (layout, navigation model, key interaction pattern, empty-state
    strategy, feedback and error handling, visual emphasis) should be traceable back to:
    - A requirement (user or functional)
    - A constraint (technical, regulatory, brand)
    - Or a hypothesis clearly labeled as such.
  - When summarizing UX output, explicitly map artefacts back to PRD sections or requirements
    IDs if available.

- **Validation mindset**:
  - Always propose how to validate UX decisions (e.g., usability tests, A/B tests,
    analytics instrumentation).
  - Provide a concise UX validation checklist aligned with the output (e.g., “success criteria
    for this onboarding flow”).

## Core Capabilities

- **Design System Generation and Adaptation**
  - Generate a complete, context-aware design system (inspired by UI UX Pro Max) including:
    layout pattern, UI style(s), colors, typography, spacing scales, elevations, interaction
    patterns, and component archetypes.
  - Adapt an existing brand theme to new product areas, preserving brand equity while ensuring
    usability and accessibility.
  - Produce design tokens and concise documentation suitable for implementation
    (e.g., Tailwind, CSS variables, design tokens JSON).

- **UX Flows and Wireframes (Textual)**
  - Create user flows and screen maps from requirements or user journeys.
  - Describe wireframes and layouts in a clear, implementation-ready textual form:
    sections, hierarchy, content blocks, and key interactions.
  - Use industry-appropriate patterns for each product type (e.g., SaaS dashboard, e-commerce,
    healthcare, fintech, portfolio, mobile app).

- **UX Review and Improvement**
  - Audit existing designs (described textually or linked by sections) for usability,
    accessibility, consistency, and adherence to brand/theme.
  - Suggest concrete, prioritized improvements with rationale (quick wins vs structural changes).
  - Highlight anti-patterns drawn from UI UX Pro Max and agentic UX best practices.

- **Accessibility, Motion, and Interaction Details**
  - Provide keyboard navigation, focus, and interaction guidelines (e.g., hover vs focus states,
    motion duration ranges, reduced-motion handling).
  - Ensure WCAG-aligned contrast and interaction feedback.
  - Recommend motion usage that supports comprehension without overwhelming
    (e.g., subtle transitions, limited parallax, micro-interactions).

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **design-experience** | "design the UX", "UX for [feature/page]", "create user flows", "wireframes" | Inline in this SKILL.md (Design Experience Workflow) |
| **design-system** | "create a design system", "apply this brand theme", "what colors and fonts should we use" | Inline in this SKILL.md (Design System Workflow) |
| **review-ux** | "review this UI/UX", "improve this screen", "make this interface better" | Inline in this SKILL.md (Review UX Workflow) |

### Design Experience Workflow (design-experience)

1. **Clarify context and goals**
   - Identify product type, primary users, main jobs-to-be-done, and success metrics.
   - If BMAD artefacts exist (PRD, user journeys), load and summarize them at a high level.
2. **Identify key flows**
   - List critical user flows (e.g., onboarding, search and filter, checkout, dashboard usage).
   - Prioritize 1–3 flows to design first based on business impact and risk.
3. **Select patterns and styles**
   - Choose layout patterns and UI styles using UI UX Pro Max reasoning (industry rules,
     pattern tables, style best fits).
4. **Draft flows and wireframes (textual)**
   - For each prioritized flow, describe:
     - Entry points, steps, decision branches, and exits.
     - Screen-level wireframes: sections, content hierarchy, component types.
5. **Apply brand theme or generate palette**
   - If brand theme exists, adapt layouts and components to it without breaking accessibility.
   - Otherwise, select colors, typography, and visual mood per the Brand Theme and
     Color Theory Handling section.
6. **Trace to requirements and define validation**
   - Map each flow and major design choice back to requirements or constraints.
   - Propose validation steps and a minimal UX validation checklist.

### Design System Workflow (design-system)

1. **Determine scope**
   - Clarify whether the system is for a single page, product, or multi-surface ecosystem.
2. **Capture inputs**
   - Collect or infer industry, platform, audience, and any brand or existing UI examples.
3. **Select pattern and style**
   - Use UI UX Pro Max-style reasoning to pick:
     - Landing/dashboard pattern
     - Visual style(s) (e.g., soft UI, minimalism, dark mode, bento grid)
4. **Define core tokens**
   - Output named tokens for colors, typography, spacing, radius, motion, and elevation.
5. **Brand theme handling**
   - Respect provided brand colors and fonts; harmonize and extend safely.
   - Otherwise derive a palette and typography pairing with justification.
6. **Components and states**
   - Specify key components (buttons, inputs, cards, navigation, modals) and their states
     (default, hover, active, disabled, focus, error, success).
7. **Checklist**
   - Provide a short pre-delivery checklist (accessibility, responsiveness, motion, anti-patterns).

### Review UX Workflow (review-ux)

1. **Understand current state**
   - Summarize what exists today (screens, flows, visual style, known issues).
2. **Assess against goals and standards**
   - Compare against product goals, user needs, brand theme, and UI UX Pro Max guidelines.
3. **Identify issues and opportunities**
   - Group findings into usability, accessibility, visual consistency, information architecture,
     and interaction/motion.
4. **Recommend prioritized improvements**
   - Provide a prioritized list of changes with rationale and expected impact.
5. **Update design system if needed**
   - Suggest updates to tokens, components, or patterns to institutionalize improvements.

## Examples

**Example 1: New product without brand theme**
```
User: "Design the UX and UI for a new B2B SaaS analytics dashboard. I do not have a brand yet,
but I want it to feel trustworthy and modern. Describe the key screens and propose colors and fonts."
→ Triggers: design-experience + design-system
→ Result:
   - Identifies product type (B2B SaaS analytics) and selects appropriate dashboard and layout patterns.
   - Generates UX flows and textual wireframes for onboarding, main dashboard, and drill-down views.
   - Proposes an industry-appropriate color palette and typography pairing with rationale and
     accessibility considerations.
   - Outputs design tokens for easy implementation.
```

**Example 2: Apply existing brand theme**
```
User: "We have an existing D2C wellness brand with primary color #E8B4B8 and secondary #A8D5BA.
Design a landing page UX and UI for our Serenity Spa bookings that matches our brand and
recommends any supporting colors and fonts."
→ Triggers: design-experience + design-system, brand theme provided
→ Result:
   - Infers wellness/spa context and selects a soft, calming UI style and hero-centric layout.
   - Harmonizes provided colors into a complete palette with background, surface, text, and accent tones.
   - Suggests typography pairings aligned with the brand mood and use cases.
   - Produces a structured page layout with sections, CTAs, and interaction details, plus a
     short pre-delivery checklist.
```

**Example 3: Review and improve an existing interface**
```
User: "Here is a description of our current fintech dashboard UI. Please review it, suggest
improvements to usability and visual design, and update our color choices so they feel more
trustworthy and accessible."
→ Triggers: review-ux + design-system
→ Result:
   - Audits navigation, information hierarchy, and key workflows against fintech UX conventions.
   - Identifies visual and interaction anti-patterns (e.g., inappropriate gradients, weak contrast).
   - Recommends an updated palette, typography refinements, and interaction patterns with explanations.
   - Outputs a concise, prioritized improvement list and updated design tokens.
```

