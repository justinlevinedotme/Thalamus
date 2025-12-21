import Footer from "../components/Footer";
import UpgradeCard from "../features/billing/UpgradeCard";

export default function BillingRoute() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Billing</h1>
          <p className="text-sm text-slate-500">
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
