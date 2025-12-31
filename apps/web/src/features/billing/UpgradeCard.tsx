/**
 * @file UpgradeCard.tsx
 * @description Subscription upgrade card component that prompts users to unlock premium features
 */

export default function UpgradeCard() {
  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <h2 className="text-lg font-semibold text-foreground">Upgrade to PLUS</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Unlock more graphs, more saved nodes, longer retention, and priority support.
      </p>
      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
        <li>50 graphs (vs 20)</li>
        <li>50 saved nodes (vs 20)</li>
        <li>Unlimited retention</li>
      </ul>
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
