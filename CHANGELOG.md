# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **Test framework**: Vitest + @testing-library/react with 21 passing tests
  - graphStore tests: nodes, edges, history, selection (15 tests)
  - Button component tests (6 tests)
  - Scripts: `npm test`, `npm run test:watch`, `npm run test:coverage`
- Dark mode toggle button in Header component (sun/moon icons)
- Interactive React Flow demo graphs on landing page with 3 tabbed examples:
  - Tournament bracket (fantasy sports style with winner/loser paths)
  - Mind Map (radial layout with colored spokes)
  - Flowchart (process flow with Yes/No decision labels)
- PreviewNode component for landing page demo graphs
- FeatureCard component with intersection observer animations
- UseCaseCard component for use case showcase section
- Trust bar section highlighting key features (instant start, export, share, auto-layout)

### Changed

- Redesigned landing page with modern hero section, features grid, and use cases
- Replaced static SVG preview with real React Flow interactive demo
- Updated Header to include theme toggle after authentication buttons
- Wrapped addEntry/saveEntries in useCallback for NodeKeyNode and PathKeyNode to fix React hooks dependency warnings
- Refactored MeAccountGeneralRoute email preferences handler to use .finally() instead of try/catch
- **Refactored graphStore.ts** (1,778 → 1,319 lines): extracted types, defaults, and utils to `store/graph/` modules
- **Refactored GraphCanvas.tsx** (996 → 624 lines): extracted hooks (useSpatialIndex, useEdgeLookup, useCanvasKeyboard) and components (CustomMarkerDefs, GroupBackgrounds)
- **Auth component consolidation**: created `components/auth/` module with shared components:
  - `PasswordInput` - Input with integrated show/hide toggle
  - `PasswordStrengthIndicator` - Visual requirements checklist (inline/boxed variants)
  - `AuthPageLayout` - Shared layout wrapper with horizon glow
  - Eliminated duplicate PASSWORD_REQUIREMENTS constant
  - Reduced ResetPasswordRoute by 33% (361 → 241 lines)
  - Reduced ForgotPasswordRoute by 22% (177 → 138 lines)

### Removed

- Unused dependency @floating-ui/dom from web package
- Unused devDependency tsx from api package
- Orphaned emoji-picker.tsx component (never imported)
- Legacy route files: LoginRoute.tsx, SignupRoute.tsx, ProfileRoute.tsx (superseded by AuthRoute and /me routes)
- Dead code: unused template functions (loadTemplates, saveAsTemplate, deleteTemplate) from composerStore
- Console.log statements from email.ts and KitchenSinkRoute.tsx
- Unused imports across 12 files (Welcome.tsx, schema.ts, sessions.ts, GraphCanvas.tsx, MapStyleInspector.tsx, ComposerLayout.tsx, speed-dial.tsx, AuthRoute.tsx, helperLines/utils.ts, icon-picker.tsx)

### Fixed

- Added "type": "module" to root package.json to fix Node ESM warning
- Fixed all ESLint warnings (reduced from 28 to 5 acceptable warnings)
