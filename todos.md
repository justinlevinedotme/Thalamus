# Thalamus Development Tasks

## Landing Page Redesign

- [x] Add dark mode toggle to Header component
- [x] Replace static SVG preview with interactive React Flow demo
- [x] Create Tournament bracket demo graph (fantasy sports style)
- [x] Create Mind Map demo graph (radial layout)
- [x] Create Flowchart demo graph (process flow with Yes/No labels)
- [x] Add tabbed navigation for demo graph switching
- [x] Create FeatureCard component with intersection observer animations
- [x] Create UseCaseCard component for use cases section
- [x] Add trust bar section with key feature highlights
- [x] Update hero section with animated CTAs
- [x] Add features section with 6 feature cards
- [x] Add use cases section with 6 use case cards
- [x] Add final CTA section
- [x] Commit and push landing page changes
- [x] Test mobile responsiveness
- [x] Review and polish demo graph layouts

## Codebase Refactoring (Deep Cleanup)

### Phase 1: Split graphStore.ts (1,778 → 1,319 lines) ✅

- [x] Extract types to `apps/web/src/store/graph/types.ts` (238 lines)
- [x] Extract constants/defaults to `apps/web/src/store/graph/defaults.ts` (69 lines)
- [x] Extract utils to `apps/web/src/store/graph/utils.ts` (178 lines)
- [x] Refactor main `graphStore.ts` to use extracted modules
- [x] Verify all imports across codebase work correctly
- [x] Run typecheck and lint

### Phase 2: Extract hooks from GraphCanvas.tsx (996 → 624 lines) ✅

- [x] Extract `useSpatialIndex` hook (68 lines)
- [x] Extract `useEdgeLookup` hook (13 lines)
- [x] Extract `useCanvasKeyboard` hook (48 lines)
- [x] Extract `CustomMarkerDefs` to separate file (106 lines)
- [x] Extract `GroupBackgrounds` to separate file (96 lines)
- [x] Verify GraphCanvas still renders correctly
- [x] Run typecheck and lint

### Phase 3: Add Test Framework ✅

- [x] Install vitest + @testing-library/react + jsdom
- [x] Configure vitest in apps/web (vitest.config.ts)
- [x] Add test scripts (test, test:watch, test:coverage)
- [x] Write graphStore tests (15 tests)
- [x] Write Button component tests (6 tests)
- [x] All 21 tests passing

### Phase 4: Auth Component Consolidation ✅

- [x] Audit auth-related components (AuthRoute, login forms, etc.)
- [x] Create `apps/web/src/components/auth/` directory
- [x] Extract shared auth components:
  - `constants.ts` - PASSWORD_REQUIREMENTS, validatePassword, isPasswordValid
  - `PasswordInput.tsx` - Input with show/hide toggle
  - `PasswordStrengthIndicator.tsx` - Visual password requirements checklist
  - `AuthPageLayout.tsx` - Shared layout with horizon glow + header/footer
- [x] Update imports across auth routes (AuthRoute, ResetPasswordRoute, ForgotPasswordRoute)
- [x] Run typecheck and lint - 0 errors, 21 tests passing

## Future Improvements

- [ ] Add more demo graph types (org chart, timeline, etc.)
- [ ] Add edge marker showcase (arrows, circles, diamonds)
- [ ] Add node shape variations in demos
- [ ] Optimize animations for performance
- [ ] Add A/B testing for conversion optimization
