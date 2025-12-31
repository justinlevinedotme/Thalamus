/**
 * @file MeAccountPrivacyRoute.tsx
 * @description Data & Privacy settings page within the /me hub. Allows users to
 * request account deletion and manage their data.
 */

import { useState } from "react";
import { AlertTriangle, Download, Loader2, Shield, Trash2 } from "lucide-react";

import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useProfileData } from "../features/account/useProfileData";
import { apiFetch, ApiError } from "../lib/apiClient";

const DELETION_REASONS = [
  { value: "no-longer-needed", label: "I no longer need the service" },
  { value: "found-alternative", label: "I found a better alternative" },
  { value: "too-expensive", label: "It's too expensive" },
  { value: "missing-features", label: "Missing features I need" },
  { value: "too-complicated", label: "Too complicated to use" },
  { value: "privacy-concerns", label: "Privacy concerns" },
  { value: "temporary-account", label: "This was a temporary account" },
  { value: "other", label: "Other reason" },
];

export default function MeAccountPrivacyRoute() {
  const { profile, loading, hasPendingDeletion, setHasPendingDeletion } = useProfileData();

  // Data export states
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Account deletion states
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deletionReason, setDeletionReason] = useState("");
  const [deletionFeedback, setDeletionFeedback] = useState("");
  const [deletionTotpCode, setDeletionTotpCode] = useState("");
  const [deletionRequires2FA, setDeletionRequires2FA] = useState(false);
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [deletionError, setDeletionError] = useState<string | null>(null);
  const [deletionSubmitted, setDeletionSubmitted] = useState(false);

  const handleExportData = async () => {
    try {
      setExportLoading(true);
      setExportError(null);
      setExportSuccess(false);

      const response = await apiFetch<Record<string, unknown>>("/profile/data-export");

      // Create blob and trigger download
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const dateStr = new Date().toISOString().split("T")[0];
      a.download = `thalamus-data-export-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      // Clear success message after 5 seconds
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Failed to export data");
    } finally {
      setExportLoading(false);
    }
  };

  const handleRequestDeletion = async () => {
    try {
      setDeletionLoading(true);
      setDeletionError(null);

      const reasonLabel = DELETION_REASONS.find((r) => r.value === deletionReason)?.label;

      await apiFetch("/profile/deletion-request", {
        method: "POST",
        body: JSON.stringify({
          reason: reasonLabel || null,
          additionalFeedback: deletionFeedback.trim() || null,
          totpCode: deletionTotpCode || undefined,
        }),
      });

      setDeletionSubmitted(true);
      setHasPendingDeletion(true);
    } catch (err) {
      if (err instanceof ApiError && err.requires2FA) {
        setDeletionRequires2FA(true);
        setDeletionError(null);
      } else {
        setDeletionError(err instanceof Error ? err.message : "Failed to submit deletion request");
      }
    } finally {
      setDeletionLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    try {
      setDeletionLoading(true);
      setDeletionError(null);
      await apiFetch("/profile/deletion-request", {
        method: "DELETE",
      });
      setHasPendingDeletion(false);
      setDeleteAccountOpen(false);
    } catch (err) {
      setDeletionError(err instanceof Error ? err.message : "Failed to cancel deletion request");
    } finally {
      setDeletionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return <div className="py-12 text-center text-muted-foreground">Unable to load profile</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Data & Privacy</h1>
        <p className="text-sm text-muted-foreground">Manage your data and account deletion</p>
      </div>

      {/* Data Export Section */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <Download className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <h2 className="text-lg font-medium text-foreground">Export Your Data</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Download a copy of all your data in JSON format.
            </p>
            <div className="mt-3 rounded-md bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground">Export includes:</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-muted-foreground">
                <li>Profile information (name, email, plan)</li>
                <li>Email preferences</li>
                <li>All graphs with full diagram data</li>
                <li>Share links and tokens</li>
                <li>Linked OAuth accounts</li>
              </ul>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button variant="outline" onClick={handleExportData} disabled={exportLoading}>
                {exportLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparing export...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Data Export
                  </>
                )}
              </Button>
              {exportSuccess && (
                <span className="text-sm text-green-600 dark:text-green-400">
                  Export downloaded successfully
                </span>
              )}
            </div>
            {exportError && <p className="mt-2 text-sm text-destructive">{exportError}</p>}
          </div>
        </div>
      </section>

      {/* Delete Account Section */}
      <section className="rounded-lg border border-red-200 bg-card p-6 dark:border-red-800">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Trash2 className="mt-0.5 h-5 w-5 text-red-500" />
            <div>
              <h2 className="text-lg font-medium text-foreground">Delete Account</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be
                undone.
              </p>
            </div>
          </div>
          {hasPendingDeletion ? (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                Pending
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeletionError(null);
                  setDeleteAccountOpen(true);
                }}
              >
                View Request
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-950/50"
              onClick={() => {
                setDeletionReason("");
                setDeletionFeedback("");
                setDeletionTotpCode("");
                setDeletionRequires2FA(false);
                setDeletionError(null);
                setDeletionSubmitted(false);
                setDeleteAccountOpen(true);
              }}
            >
              Delete Account
            </Button>
          )}
        </div>
      </section>

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteAccountOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteAccountOpen(false);
            setDeletionError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              {hasPendingDeletion ? "Deletion Request Pending" : "Delete Account"}
            </DialogTitle>
            <DialogDescription>
              {hasPendingDeletion
                ? "Your account deletion request is being processed. You can cancel it if you've changed your mind."
                : "This will permanently delete your account, all your graphs, and shared links. This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {deletionSubmitted ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">Content Deleted</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    All your graphs and shared links have been permanently deleted. Your account
                    will be fully removed within 30 days.
                  </p>
                </div>
              </div>
            ) : hasPendingDeletion ? (
              <div className="space-y-4">
                <div className="rounded-md bg-amber-50 p-4 dark:bg-amber-950/50">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <p className="font-medium">Pending Deletion</p>
                      <p className="mt-1">
                        Your account is scheduled for deletion. All your data will be permanently
                        removed once processed.
                      </p>
                    </div>
                  </div>
                </div>
                {deletionError && <p className="text-sm text-red-600">{deletionError}</p>}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md bg-red-50 p-4 dark:bg-red-950/50">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                    <div className="text-sm text-red-800 dark:text-red-200">
                      <p className="font-medium">This action is immediate and irreversible</p>
                      <ul className="mt-2 list-inside list-disc space-y-1 text-red-700 dark:text-red-300">
                        <li>All your graphs will be permanently deleted</li>
                        <li>All shared links will stop working immediately</li>
                        <li>Your account settings and preferences will be removed</li>
                        <li>Your account will be fully removed within 30 days</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deletion-reason">Why are you leaving? (optional)</Label>
                  <Select value={deletionReason} onValueChange={setDeletionReason}>
                    <SelectTrigger id="deletion-reason">
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {DELETION_REASONS.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deletion-feedback">Additional feedback (optional)</Label>
                  <Textarea
                    id="deletion-feedback"
                    value={deletionFeedback}
                    onChange={(e) => setDeletionFeedback(e.target.value)}
                    placeholder="Help us improve by sharing more details about your experience..."
                    rows={3}
                  />
                </div>

                {deletionRequires2FA && (
                  <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/50">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-amber-600" />
                      <Label
                        htmlFor="deletion-totp"
                        className="text-sm font-medium text-amber-800 dark:text-amber-200"
                      >
                        Two-Factor Authentication Required
                      </Label>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Enter the 6-digit code from your authenticator app to confirm deletion.
                    </p>
                    <Input
                      id="deletion-totp"
                      value={deletionTotpCode}
                      onChange={(e) =>
                        setDeletionTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="000000"
                      className="text-center font-mono text-lg tracking-widest"
                      maxLength={6}
                      autoComplete="one-time-code"
                      inputMode="numeric"
                    />
                  </div>
                )}

                {deletionError && <p className="text-sm text-red-600">{deletionError}</p>}
              </div>
            )}
          </div>
          <DialogFooter>
            {deletionSubmitted ? (
              <Button type="button" variant="outline" onClick={() => setDeleteAccountOpen(false)}>
                Close
              </Button>
            ) : hasPendingDeletion ? (
              <>
                <Button type="button" variant="outline" onClick={() => setDeleteAccountOpen(false)}>
                  Close
                </Button>
                <Button type="button" disabled={deletionLoading} onClick={handleCancelDeletion}>
                  {deletionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {deletionLoading ? "Cancelling..." : "Cancel Request"}
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => setDeleteAccountOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={
                    deletionLoading || (deletionRequires2FA && deletionTotpCode.length !== 6)
                  }
                  onClick={handleRequestDeletion}
                >
                  {deletionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {deletionLoading
                    ? "Deleting..."
                    : deletionRequires2FA
                      ? "Confirm Deletion"
                      : "Delete My Account"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
