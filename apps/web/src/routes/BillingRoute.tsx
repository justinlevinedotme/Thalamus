/**
 * @file BillingRoute.tsx
 * @description Billing page component for subscription management. Displays current plan
 * information and upgrade options via the UpgradeCard component.
 */

import Footer from "../components/Footer";
import UpgradeCard from "../features/billing/UpgradeCard";

export default function BillingRoute() {
  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <div className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Billing</h1>
            <p className="text-sm text-muted-foreground">
              Manage your plan or upgrade for longer retention.
            </p>
          </div>
          <UpgradeCard />
        </div>
      </div>
      <Footer />
    </div>
  );
}
