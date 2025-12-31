/**
 * @file MeSavedNodesRoute.tsx
 * @description Saved Nodes page within the /me hub. UI shell for future
 * composed node saving functionality.
 */

import { AlertTriangle, Box } from "lucide-react";

export default function MeSavedNodesRoute() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Saved Nodes</h1>
        <p className="text-sm text-muted-foreground">
          Manage your saved composed nodes for reuse across graphs
        </p>
      </div>

      {/* Not Functional Notice */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-medium">Saved Nodes is not yet available</p>
            <p className="mt-1 text-amber-700 dark:text-amber-300">
              This feature is coming soon. You'll be able to save composed nodes and reuse them
              across your graphs.
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <section className="rounded-lg border border-dashed border-border bg-secondary/50 p-8 text-center">
        <Box className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 font-medium text-foreground">No saved nodes yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          When this feature launches, you'll be able to save composed nodes from the editor and
          access them here for quick reuse.
        </p>
      </section>
    </div>
  );
}
