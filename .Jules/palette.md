# Palette's Journal

## 2025-02-23 - Icon-only Buttons Ignoring Labels
**Learning:** Components often accept a `label` prop but fail to render it as `aria-label` or `title`, leaving icon-only buttons inaccessible to screen readers.
**Action:** Always verify that `label` props in UI components are actually wired up to `aria-label` (for a11y) and `title` (for tooltips).

## 2025-02-23 - Mobile Bottom Navigation Z-Index Conflicts
**Learning:** Converting a sidebar to a bottom navigation rail on mobile often introduces z-index conflicts with floating action buttons (FABs) or legends positioned at the bottom of the screen.
**Action:** When implementing bottom navigation rails (`fixed` or `absolute bottom-0`), always reposition bottom-aligned floating elements (like map toolbars or legends) to the top or adjust their bottom margin to sit above the rail on mobile breakpoints.
