export default function UpgradeCard() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Upgrade</h2>
      <p className="mt-2 text-sm text-slate-500">
        Unlock longer retention, version history, and organization workspaces.
      </p>
      <button
        className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
        type="button"
        aria-label="Go to billing portal"
      >
        Go to billing
      </button>
    </div>
  );
}
