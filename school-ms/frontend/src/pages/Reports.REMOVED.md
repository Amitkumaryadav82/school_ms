This application previously contained a top-level "Reports" module (src/pages/Reports.tsx) that mixed Academic and Fee reports under a single page. As of 2025-09-20, this page and its navigation entry have been removed per product direction.

Changes applied:
- Removed /reports route from src/App.tsx
- Removed "Reports" item from the left sidebar in src/components/Layout.tsx
- Deleted legacy page files (Reports.tsx, Reports.tsx.bak)

Fee reports remain available from the Fee Management module. Attendance and academic items continue under their dedicated pages/dialogs.
