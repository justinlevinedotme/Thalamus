# Update Kitchen Sink

Scan the codebase for UI components and update the Kitchen Sink page to include any missing ones.

---

## What This Does

When you run `/update-kitchensink`, I:

1. **Scan Component Directories** - Check `apps/web/src/components/**` and `apps/web/src/features/**` for UI components
2. **Analyze KitchenSinkRoute** - Read the current kitchen sink page to see what's already included
3. **Identify Missing Components** - Compare and find components not yet showcased
4. **Update the Page** - Add missing components with placeholder data
5. **Report Results** - List what was added and any components that need special setup

---

## Instructions

### Phase 1: Discovery

1. **Scan UI primitives**:
   - List all files in `apps/web/src/components/ui/`
   - Identify exported components from each file

2. **Scan custom components**:
   - Check `apps/web/src/components/` (non-ui)
   - Check `apps/web/src/features/*/components/` for feature-specific components

3. **Scan for patterns**:
   - Search for Dialog, Modal, Alert, Warning patterns in route files
   - Identify any composite UI patterns used in the app

### Phase 2: Analysis

1. **Read KitchenSinkRoute**:
   - Read `apps/web/src/routes/KitchenSinkRoute.tsx`
   - Extract list of currently showcased components

2. **Compare**:
   - Create a list of missing components
   - Categorize by: primitives, custom, dialogs/modals, patterns

### Phase 3: Update

1. **For each missing component**:
   - Determine if it can be rendered standalone with placeholder data
   - If yes: add to appropriate section in KitchenSinkRoute
   - If no: add to "Components Requiring Setup" section with notes

2. **Maintain structure**:
   - Keep existing section organization
   - Add new sections if needed for new component categories
   - Use consistent styling (Section/Subsection wrappers)

3. **Use placeholders**:
   - Never make real API calls
   - Use PLACEHOLDER_USER, PLACEHOLDER_PROFILE patterns
   - Mock any required state with useState

### Phase 4: Verify

1. **Run type check**: `npx tsc --noEmit` in apps/web
2. **Run lint**: `npm run lint`
3. **Report any errors** that need manual resolution

---

## Output Format

After completing, report:

```
## Kitchen Sink Update Complete

### Added Components
- [list of newly added components]

### Components Requiring Manual Setup
- [component name]: [reason why it couldn't be auto-added]

### Errors (if any)
- [any type/lint errors that need attention]
```

---

## Tips

- Prefer showing components in their most common/useful states
- Include disabled, loading, and error states where applicable
- Group related components together
- Add state toggles for components with multiple visual states (like the delete dialog)
- Don't add components that are purely internal/helper components

---

_Generated for Thalamus project_
