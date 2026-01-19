# Palette's Journal

## 2025-02-23 - Icon-only Buttons Ignoring Labels
**Learning:** Components often accept a `label` prop but fail to render it as `aria-label` or `title`, leaving icon-only buttons inaccessible to screen readers.
**Action:** Always verify that `label` props in UI components are actually wired up to `aria-label` (for a11y) and `title` (for tooltips).
