## 2025-05-23 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** This app extensively uses icon-only buttons for map tools and playback controls. These buttons were originally implemented without `aria-label` attributes, relying sometimes on `title` or nothing at all, making them inaccessible to screen readers.
**Action:** Always ensure that icon-only buttons have an explicit `aria-label` attribute describing the action. When creating reusable button components (like `ToolButton` or `ControlButton`), mandate a `label` prop that populates the `aria-label`.
