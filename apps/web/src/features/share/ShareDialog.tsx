/**
 * @file ShareDialog.tsx
 * @description Dialog component for generating and managing shareable links for graphs
 */

import { useEffect, useMemo, useState } from "react";

import { Input } from "../../components/ui/input";
import { createShareLink } from "./shareApi";

type ShareDialogProps = {
  open: boolean;
  graphId?: string;
  onClose: () => void;
};

export default function ShareDialog({ open, graphId, onClose }: ShareDialogProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const shareUrl = useMemo(() => {
    if (!shareToken) {
      return "";
    }
    return `${window.location.origin}/share/${shareToken}`;
  }, [shareToken]);

  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setShareToken(null);
      setExpiresAt(null);
      setError(null);
    }
  }, [open]);

  const handleGenerate = async () => {
    if (!graphId) {
      setError("Save the graph before creating a share link.");
      return;
    }
    try {
      setStatus("loading");
      const result = await createShareLink(graphId);
      setShareToken(result.token);
      setExpiresAt(result.expires_at);
      setStatus("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create share link");
      setStatus("error");
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) {
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-lg bg-background border border-border p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Share link</h2>
            <p className="text-sm text-muted-foreground">
              Links expire after 7 days. Anyone with the link can view the graph.
            </p>
          </div>
          <button
            className="text-sm text-muted-foreground hover:text-foreground"
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {shareToken ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Share URL
              </label>
              <Input readOnly value={shareUrl} />
              <div className="flex items-center gap-2">
                <button
                  className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
                  type="button"
                  onClick={handleCopy}
                >
                  Copy link
                </button>
                {expiresAt ? (
                  <span className="text-xs text-muted-foreground">
                    Expires {new Date(expiresAt).toLocaleString()}
                  </span>
                ) : null}
              </div>
            </div>
          ) : (
            <button
              className="w-full rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              type="button"
              onClick={handleGenerate}
              disabled={status === "loading"}
              aria-label="Generate share link"
            >
              {status === "loading" ? "Generating..." : "Generate share link"}
            </button>
          )}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
