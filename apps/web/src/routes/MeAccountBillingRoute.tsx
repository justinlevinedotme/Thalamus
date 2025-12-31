/**
 * @file MeAccountBillingRoute.tsx
 * @description Billing settings page within the /me hub. UI shell for future
 * billing functionality.
 */

import { AlertTriangle, CreditCard, Loader2 } from "lucide-react";

import { useProfileData } from "../features/account/useProfileData";

export default function MeAccountBillingRoute() {
  const { profile, loading } = useProfileData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and payment methods
        </p>
      </div>

      {/* Not Functional Notice */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-medium">Billing is not yet available</p>
            <p className="mt-1 text-amber-700 dark:text-amber-300">
              This feature is coming soon. You're currently on the{" "}
              <span className="font-medium capitalize">{profile?.plan || "free"}</span> plan.
            </p>
          </div>
        </div>
      </div>

      {/* Current Plan Section */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <CreditCard className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-medium text-foreground">Current Plan</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              You're on the{" "}
              <span className="font-medium capitalize">{profile?.plan || "free"}</span> plan.
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">{profile?.maxGraphs || 20}</span>{" "}
                graphs allowed
              </p>
              <p>
                <span className="font-medium text-foreground">{profile?.retentionDays || 365}</span>{" "}
                days retention
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upgrade Placeholder */}
      <section className="rounded-lg border border-dashed border-border bg-secondary/50 p-6 text-center">
        <CreditCard className="mx-auto h-8 w-8 text-muted-foreground" />
        <h3 className="mt-3 font-medium text-foreground">Upgrade to PLUS</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get more graphs, longer retention, and access to templates.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">Coming soon</p>
      </section>
    </div>
  );
}
