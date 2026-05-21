---
name: ui-styling
description: Create beautiful, accessible user interfaces with shadcn/ui components (built on Radix UI + Tailwind), Tailwind CSS utility-first styling, and canvas-based visual designs. Use when building user interfaces, implementing design systems, creating responsive layouts, adding accessible components (dialogs, dropdowns, forms, tables), customizing themes and colors, implementing dark mode, generating visual designs and posters, or establishing consistent styling patterns across applications.
argument-hint: "[component or layout]"
license: MIT
metadata:
  author: claudekit
  version: "1.2.0"
---

# UI Styling Skill

Comprehensive skill for creating beautiful, accessible user interfaces combining shadcn/ui components, Tailwind CSS utility styling, and canvas-based visual design systems.

## Workflow Routing

| User intent | Action | Reference / script |
|-------------|--------|-------------------|
| Add shadcn/ui components | Run `python scripts/shadcn_add.py` with `--project-root` | — |
| Generate Tailwind config | Run `python scripts/tailwind_config_gen.py` | — |
| Component catalog and composition | Read reference | `references/shadcn-components.md` |
| Theme, CSS variables, dark mode | Read reference | `references/shadcn-theming.md` |
| Accessibility for interactive UI | Read reference | `references/shadcn-accessibility.md` |
| Tailwind utilities and layout | Read reference | `references/tailwind-utilities.md` |
| Responsive breakpoints | Read reference | `references/tailwind-responsive.md` |
| Tailwind v4 `@theme` / customization | Read reference | `references/tailwind-customization.md` |
| Canvas posters / visual design | Read reference | `references/canvas-design-system.md` |
| UX style, palette, or product fit | Escalate | `references/skill-escalation.md` → `ui-ux-pro-max` |
| Design token architecture | Escalate | `references/skill-escalation.md` → `design-system` |
| Brand colors or voice | Escalate | `references/skill-escalation.md` → `brand` |

## Reference

- shadcn/ui: https://ui.shadcn.com/llms.txt
- Tailwind CSS: https://tailwindcss.com/docs

## When to Use This Skill

Use when:
- Building UI with React-based frameworks (Next.js, Vite, Remix, Astro)
- Implementing accessible components (dialogs, forms, tables, navigation)
- Styling with utility-first CSS approach
- Creating responsive, mobile-first layouts
- Implementing dark mode and theme customization
- Building design systems with consistent tokens
- Generating visual designs, posters, or brand materials
- Rapid prototyping with immediate visual feedback
- Adding complex UI patterns (data tables, charts, command palettes)

## Core Stack

### Component Layer: shadcn/ui
- Pre-built accessible components via Radix UI primitives
- Copy-paste distribution model (components live in your codebase)
- TypeScript-first with full type safety
- Composable primitives for complex UIs
- CLI-based installation and management

### Styling Layer: Tailwind CSS
- Utility-first CSS framework
- Build-time processing with zero runtime overhead
- Mobile-first responsive design
- Consistent design tokens (colors, spacing, typography)
- Automatic dead code elimination

### Visual Design Layer: Canvas
- Museum-quality visual compositions
- Philosophy-driven design approach
- Sophisticated visual communication
- Minimal text, maximum visual impact
- Systematic patterns and refined aesthetics

## Quick Start

### Component + Styling Setup

**Install shadcn/ui with Tailwind:**
```bash
npx shadcn@latest init
```

CLI prompts for framework, TypeScript, paths, and theme preferences. This configures both shadcn/ui and Tailwind CSS.

**Add components:**
```bash
npx shadcn@latest add button card dialog form
```

**Use components with utility styling:**
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function Dashboard() {
  return (
    <div className="container mx-auto p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">View your metrics</p>
          <Button variant="default" className="w-full">
            View Details
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Alternative: Tailwind-Only Setup

**Vite projects:**
```bash
npm install -D tailwindcss @tailwindcss/vite
```

```javascript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
export default { plugins: [tailwindcss()] }
```

```css
/* src/index.css */
@import "tailwindcss";
```

## Tailwind Version Routing

- **Tailwind v3**: use `shadcn-theming.md` → `tailwind.config.ts` with `extend.colors` using `hsl(var(--))` pattern
- **Tailwind v4**: use `tailwind-customization.md` → `@theme` directive in CSS

Check the project's `package.json` for `"tailwindcss": "^3.x"` or `"^4.x"` to determine which applies.

## Component Library Guide

**Comprehensive component catalog with usage patterns, installation, and composition examples.**

See: `references/shadcn-components.md`

Covers:
- Form & input components (Button, Input, Select, Checkbox, Date Picker, Form validation)
- Layout & navigation (Card, Tabs, Accordion, Navigation Menu)
- Overlays & dialogs (Dialog, Drawer, Popover, Toast, Command)
- Feedback & status (Alert, Progress, Skeleton)
- Display components (Table, Data Table, Avatar, Badge)

## Theme & Customization

**Theme configuration, CSS variables, dark mode implementation, and component customization.**

See: `references/shadcn-theming.md`

Covers:
- Dark mode setup with next-themes
- CSS variable system
- Color customization and palettes
- Component variant customization
- Theme toggle implementation

## Accessibility Patterns

**ARIA patterns, keyboard navigation, screen reader support, and accessible component usage.**

See: `references/shadcn-accessibility.md`

Covers:
- Radix UI accessibility features
- Keyboard navigation patterns
- Focus management
- Screen reader announcements
- Form validation accessibility

## Tailwind Utilities

**Core utility classes for layout, spacing, typography, colors, borders, and shadows.**

See: `references/tailwind-utilities.md`

Covers:
- Layout utilities (Flexbox, Grid, positioning)
- Spacing system (padding, margin, gap)
- Typography (font sizes, weights, alignment, line height)
- Colors and backgrounds
- Borders and shadows
- Arbitrary values for custom styling

## Responsive Design

**Mobile-first breakpoints, responsive utilities, and adaptive layouts.**

See: `references/tailwind-responsive.md`

Covers:
- Mobile-first approach
- Breakpoint system (sm, md, lg, xl, 2xl)
- Responsive utility patterns
- Container queries
- Max-width queries
- Custom breakpoints

## Tailwind Customization

**Config file structure, custom utilities, plugins, and theme extensions.**

See: `references/tailwind-customization.md`

Covers:
- @theme directive for custom tokens
- Custom colors and fonts
- Spacing and breakpoint extensions
- Custom utility creation
- Custom variants
- Layer organization (@layer base, components, utilities)
- Apply directive for component extraction

## Visual Design System

**Canvas-based design philosophy, visual communication principles, and sophisticated compositions.**

See: `references/canvas-design-system.md`

Covers:
- Design philosophy approach
- Visual communication over text
- Systematic patterns and composition
- Color, form, and spatial design
- Minimal text integration
- Museum-quality execution
- Multi-page design systems

## Utility Scripts

**Python automation for component installation and configuration generation.**

### shadcn_add.py
Add shadcn/ui components with dependency handling:
```bash
python scripts/shadcn_add.py button card dialog
```

### tailwind_config_gen.py
Generate tailwind.config.js with custom theme:
```bash
python scripts/tailwind_config_gen.py --colors brand:blue --fonts display:Inter
```

> Run any script with `--help` for full option reference. Always pass `--project-root <path>` to ensure scripts operate on the correct project directory, especially in monorepos.

## Mandatory Behaviors

Before delivering any UI code:
1. Install components via `npx shadcn@latest add <component>` — never copy-paste component code manually.
2. Consult `references/shadcn-accessibility.md` for the relevant component type before finalizing any interactive element.
3. Apply dark-mode variants (`dark:`) to every themed element when dark mode is in scope.
4. Use `FormField` + `zodResolver` for all form validation — do not write manual validation logic.
5. Determine the Tailwind version (v3 vs v4) before configuring themes — see "Tailwind Version Routing" section above.
6. Always pass `--project-root $(pwd)` when invoking Python automation scripts.

## Common Patterns

**Form with validation:**
```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.log)} className="space-y-6">
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full">Sign In</Button>
      </form>
    </Form>
  )
}
```

**Responsive layout with dark mode:**
```tsx
<div className="min-h-screen bg-white dark:bg-gray-900">
  <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Content
          </h3>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
```

## Examples

**Example 1: Add components to a Next.js app**
```
User: "Add shadcn dialog, form, and table to this project"
→ python scripts/shadcn_add.py dialog form table --project-root .
→ Consult references/shadcn-accessibility.md for dialog and form patterns
```

**Example 2: Tailwind theme for a Vite React app**
```
User: "Generate a Tailwind config with brand blue and Inter"
→ python scripts/tailwind_config_gen.py --colors brand:#2563eb --fonts sans:Inter,system-ui
→ Route v3 vs v4 theming per package.json (see Tailwind Version Routing)
```

**Example 3: Escalate UX direction before coding**
```
User: "What style fits a fintech dashboard?"
→ Read references/skill-escalation.md; hand off to ui-ux-pro-max for palette/style
→ Return here to implement shadcn + Tailwind from recommendations
```

## References

| File | Contains |
|------|----------|
| `references/shadcn-components.md` | Component catalog and composition |
| `references/shadcn-theming.md` | Themes, CSS variables, dark mode |
| `references/shadcn-accessibility.md` | ARIA, keyboard, focus patterns |
| `references/tailwind-utilities.md` | Core utility classes |
| `references/tailwind-responsive.md` | Breakpoints and responsive layout |
| `references/tailwind-customization.md` | Tailwind v4 `@theme` and extensions |
| `references/canvas-design-system.md` | Canvas visual design philosophy |
| `references/skill-escalation.md` | Ownership boundaries and escalation paths |
| `assets/canvas-fonts/` | Bundled OFL fonts for canvas compositions |

## External Resources

- shadcn/ui Docs: https://ui.shadcn.com
- Tailwind CSS Docs: https://tailwindcss.com
- Radix UI: https://radix-ui.com
- Tailwind UI: https://tailwindui.com
- Headless UI: https://headlessui.com
- v0 (AI UI Generator): https://v0.dev
