/**
 * @file MeTemplatesRoute.tsx
 * @description Templates page within the /me hub. Shows user's saved templates
 * with PLUS gating - non-PLUS users see upsell content.
 */

import { AlertTriangle, Crown, Layout, Sparkles } from "lucide-react";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useProfileData } from "../features/account/useProfileData";
import { Loader2 } from "lucide-react";

export default function MeTemplatesRoute() {
  const { profile, loading } = useProfileData();
  const isPlusUser = profile?.plan === "plus";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-foreground">My Templates</h1>
        <Badge variant="plus">PLUS</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {isPlusUser
          ? "Create and manage your custom graph templates"
          : "Save and reuse your graph structures as templates"}
      </p>

      {isPlusUser ? (
        <>
          {/* Not Functional Notice (for PLUS users) */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium">Templates is not yet available</p>
                <p className="mt-1 text-amber-700 dark:text-amber-300">
                  This feature is coming soon. As a PLUS member, you'll have access to save and
                  manage your own templates.
                </p>
              </div>
            </div>
          </div>

          {/* Placeholder Content */}
          <section className="rounded-lg border border-dashed border-border bg-secondary/50 p-8 text-center">
            <Layout className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-medium text-foreground">No templates yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              When this feature launches, you'll be able to save graphs as templates and quickly
              start new projects from them.
            </p>
          </section>
        </>
      ) : (
        /* Upsell Content (for non-PLUS users) */
        <section className="overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 dark:border-amber-800 dark:from-amber-950/30 dark:to-yellow-950/30">
          <div className="p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-400">
                <Crown className="h-6 w-6 text-amber-950" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Unlock Templates with PLUS
                </h2>
                <p className="text-sm text-muted-foreground">
                  Save time by creating reusable graph templates
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg bg-white/50 p-4 dark:bg-black/20">
                <Sparkles className="mt-0.5 h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-foreground">Save any graph as a template</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Turn your best work into reusable starting points
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-white/50 p-4 dark:bg-black/20">
                <Layout className="mt-0.5 h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-foreground">Organize your templates</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Keep your templates organized and accessible
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button
                className="bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 hover:from-amber-600 hover:to-yellow-500"
                disabled
              >
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to PLUS (Coming Soon)
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
