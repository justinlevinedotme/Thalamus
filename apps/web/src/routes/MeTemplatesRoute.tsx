/**
 * @file MeTemplatesRoute.tsx
 * @description My Templates page within the /me hub. Shows user's saved graph templates.
 * This is a placeholder for future graph template functionality.
 */

import { FileText } from "lucide-react";

export default function MeTemplatesRoute() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">Save and reuse full graph templates</p>
        </div>
      </div>

      {/* Coming soon state */}
      <section className="rounded-lg border border-dashed border-border bg-secondary/50 p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 font-medium text-foreground">Coming Soon</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Graph templates will let you save entire graph layouts as reusable starting points.
        </p>
      </section>
    </div>
  );
}
