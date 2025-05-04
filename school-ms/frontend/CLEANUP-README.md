# Code Cleanup Instructions

This document outlines the steps to clean up redundant code in the School Management System frontend.

## The Problem

The codebase currently has multiple issues:

1. **Duplicate File Types**: Many components exist in both JavaScript (.js, .jsx) and TypeScript (.ts, .tsx) versions.
2. **TypeScript Migration In Progress**: The codebase appears to be in the middle of a migration from JavaScript to TypeScript.
3. **Debug Code Mixed With Production Code**: Many components have embedded debugging functionality.
4. **Inconsistent Import Paths**: Import paths reference both .js and .tsx files inconsistently.

## Cleanup Process

### Step 1: Analyze Duplicate Files

Run the analysis script to identify duplicate files:

```bash
npm run cleanup:analyze
```

This will create a `cleanup-log.txt` file in the project root that identifies:
- Files with multiple versions (e.g., both .js and .tsx)
- Which version should be kept (usually TypeScript)
- Files still needing TypeScript conversion

### Step 2: Remove Duplicate Files

After reviewing the log file and ensuring you're comfortable with the planned changes, run:

```bash
npm run cleanup:execute
```

This will delete the duplicate files, keeping only the preferred version (usually TypeScript).

### Step 3: Fix Import Paths

After removing duplicates, you may need to update import paths throughout the codebase. The TypeScript compiler should help identify these issues.

### Step 4: Removed Embedded Debug Code

Debug functionality has been extracted to dedicated utilities:

- `src/utils/debugUtils.ts`: Contains utility functions for debug mode and API testing
- `src/components/debug/ApiTestDialog.tsx`: A reusable dialog for API diagnostics

Component files have been updated to use these utilities instead of embedding debug code directly.

## Manual Cleanup Notes

Some files still need manual attention:

1. **Check TypeScript Configuration**: `tsconfig.json` has been updated to handle both JS and TS during migration.
2. **Complete Type Definitions**: Some components may need additional type definitions.
3. **Review JS to TS Conversions**: For remaining .js/.jsx files that need conversion to TypeScript.

## Future Maintenance Guidelines

To keep the codebase clean going forward:

1. **TypeScript Only**: All new components should be written in TypeScript (.ts/.tsx).
2. **Proper Type Definitions**: Always include interface/type definitions for props and state.
3. **Separate Debug Code**: Keep diagnostic/debug features in the debug folder and utilities.
4. **Consistent Import Paths**: Use consistent import extensions (.tsx for components).