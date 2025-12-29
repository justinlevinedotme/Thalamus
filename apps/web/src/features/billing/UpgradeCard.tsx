/**
 * @file UpgradeCard.tsx
 * @description Subscription upgrade card component that prompts users to unlock premium features
 */

export default function UpgradeCard() {
  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <h2 className="text-lg font-semibold text-foreground">Upgrade</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Unlock longer retention, version history, and organization workspaces.
      </p>
      <button
        className="mt-4 rounded-md bg-foreground px-4 py-2 text-sm text-background"
        type="button"
        aria-label="Go to billing portal"
      >
        Go to billing
      </button>
    </div>
  );
}
