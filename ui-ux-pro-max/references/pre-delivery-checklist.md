---
skill: ui-ux-pro-max
type: reference
---

# Pre-Delivery Checklist

Consolidated checklist for App UI (iOS/Android/React Native/Flutter) and general web UI. Run through all sections before delivering any UI code.

---

## UX Validation Pass

- Run `--domain ux "animation accessibility z-index loading"` as a UX validation pass before implementation
- Run through `references/ux-quick-reference.md` **§1–§3** (CRITICAL + HIGH) as a final review
- Test on 375px (small phone) and landscape orientation
- Verify behavior with **reduced-motion** enabled and **Dynamic Type** at largest size
- Check dark mode contrast independently (don't assume light mode values work)
- Confirm all touch targets ≥44pt and no content hidden behind safe areas

---

## Visual Quality

- [ ] No emojis used as icons (use SVG/vector icons instead)
- [ ] All icons come from a consistent icon family and style
- [ ] Official brand assets are used with correct proportions and clear space
- [ ] Pressed-state visuals do not shift layout bounds or cause jitter
- [ ] Semantic theme tokens are used consistently (no ad-hoc per-screen hardcoded colors)

---

## Interaction

- [ ] All tappable elements provide clear pressed feedback (ripple/opacity/elevation)
- [ ] Touch targets meet minimum size (≥44×44pt iOS, ≥48×48dp Android)
- [ ] Micro-interaction timing stays in the 150–300ms range with native-feeling easing
- [ ] Disabled states are visually clear and non-interactive
- [ ] Screen reader focus order matches visual order, and interactive labels are descriptive
- [ ] Gesture regions avoid nested/conflicting interactions (tap/drag/back-swipe conflicts)

---

## Light/Dark Mode

- [ ] Primary text contrast ≥4.5:1 in both light and dark mode
- [ ] Secondary text contrast ≥3:1 in both light and dark mode
- [ ] Dividers/borders and interaction states are distinguishable in both modes
- [ ] Modal/drawer scrim opacity is strong enough to preserve foreground legibility (typically 40–60% black)
- [ ] Both themes are tested before delivery (not inferred from a single theme)

---

## Layout

- [ ] Safe areas are respected for headers, tab bars, and bottom CTA bars
- [ ] Scroll content is not hidden behind fixed/sticky bars
- [ ] Verified on small phone, large phone, and tablet (portrait + landscape)
- [ ] Horizontal insets/gutters adapt correctly by device size and orientation
- [ ] 4/8dp spacing rhythm is maintained across component, section, and page levels
- [ ] Long-form text measure remains readable on larger devices (no edge-to-edge paragraphs)

---

## Accessibility

- [ ] All meaningful images/icons have accessibility labels
- [ ] Form fields have labels, hints, and clear error messages
- [ ] Color is not the only indicator of state or meaning
- [ ] Reduced motion and dynamic text size are supported without layout breakage
- [ ] Accessibility traits/roles/states (selected, disabled, expanded) are announced correctly

---

## Forms (if applicable)

- [ ] All inputs have visible labels (not placeholder-only)
- [ ] Error messages appear below the relevant field with cause + recovery path
- [ ] Required fields are marked (asterisk or equivalent)
- [ ] Submit button shows loading then success/error state
- [ ] Multi-step flows show progress indicator and allow back navigation

---

## Charts & Data (if applicable)

- [ ] Chart type matches the data relationship being shown
- [ ] Legend is visible and positioned near the chart
- [ ] Tooltips/data labels available on hover (web) or tap (mobile)
- [ ] Accessible color palette used; color alone does not convey meaning
- [ ] Empty state and error state handled (not blank chart or broken axis)
