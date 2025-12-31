/**
 * @file MeSharedLinksRoute.tsx
 * @description Shared Links page within the /me hub. Lists all share links created
 * by the user with ability to revoke them.
 */

import { useCallback, useEffect, useState } from "react";
import { Calendar, Clock, ExternalLink, Link2, Loader2, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import {
  listShareLinks,
  revokeShareLink,
  type ShareLinkListItem,
} from "../features/share/shareApi";

function formatRelativeDate(value: string | null): string {
  if (!value) return "Unknown";
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return date.toLocaleDateString();
}

function formatExpiryDate(value: string | null): string {
  if (!value) return "No expiration";
  const date = new Date(value);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Expires today";
  if (diffDays === 1) return "Expires tomorrow";
  if (diffDays < 30) return `Expires in ${diffDays} days`;
  return `Expires ${date.toLocaleDateString()}`;
}

export default function MeSharedLinksRoute() {
  const [links, setLinks] = useState<ShareLinkListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<ShareLinkListItem | null>(null);
  const [revoking, setRevoking] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listShareLinks();
      setLinks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load share links");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    try {
      setRevoking(true);
      await revokeShareLink(revokeTarget.id);
      setRevokeTarget(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke share link");
    } finally {
      setRevoking(false);
    }
  };

  const getShareUrl = (token: string) => {
    return `${window.location.origin}/share/${token}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Shared Links</h1>
        <p className="text-sm text-muted-foreground">
          Manage your active share links. Revoking a link will immediately stop it from working.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : links.length === 0 ? (
        <section className="rounded-lg border border-dashed border-border bg-secondary/50 p-8 text-center">
          <Link2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 font-medium text-foreground">No shared links</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            When you share a graph from the editor, the link will appear here.
          </p>
        </section>
      ) : (
        <div className="space-y-4">
          {/* Table header */}
          <div className="hidden items-center gap-4 border-b border-border pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:grid sm:grid-cols-[1fr_120px_120px_80px]">
            <span>Graph</span>
            <span>Created</span>
            <span>Expires</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Links list */}
          {links.map((link) => {
            const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();

            return (
              <div
                key={link.id}
                className={`rounded-lg border border-border bg-card p-4 ${isExpired ? "opacity-60" : ""}`}
              >
                {/* Mobile layout */}
                <div className="flex flex-col gap-3 sm:hidden">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {link.graphTitle || "Untitled Graph"}
                      </p>
                      <a
                        href={getShareUrl(link.token)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View shared link
                      </a>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setRevokeTarget(link)}
                      disabled={!!isExpired}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeDate(link.createdAt)}
                    </span>
                    <span className={`flex items-center gap-1 ${isExpired ? "text-red-500" : ""}`}>
                      <Calendar className="h-3 w-3" />
                      {formatExpiryDate(link.expiresAt)}
                    </span>
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden items-center gap-4 sm:grid sm:grid-cols-[1fr_120px_120px_80px]">
                  <div>
                    <p className="font-medium text-foreground">
                      {link.graphTitle || "Untitled Graph"}
                    </p>
                    <a
                      href={getShareUrl(link.token)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View link
                    </a>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatRelativeDate(link.createdAt)}
                  </span>
                  <span
                    className={`text-sm ${isExpired ? "text-red-500" : "text-muted-foreground"}`}
                  >
                    {formatExpiryDate(link.expiresAt)}
                  </span>
                  <div className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setRevokeTarget(link)}
                      disabled={!!isExpired}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Revoke</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Revoke confirmation dialog */}
      <AlertDialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke share link?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately stop the share link for "
              {revokeTarget?.graphTitle || "Untitled Graph"}" from working. Anyone with the link
              will no longer be able to access the graph.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleRevoke}
              disabled={revoking}
            >
              {revoking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                "Revoke Link"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
