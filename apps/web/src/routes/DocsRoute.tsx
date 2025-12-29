/**
 * @file DocsRoute.tsx
 * @description User's documents dashboard showing all saved graphs. Provides graph listing,
 * creation, deletion, and navigation to the editor. Includes quota display and cloud
 * sync functionality.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, Trash2 } from "lucide-react";

import Footer from "../components/Footer";
import Header from "../components/Header";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import {
  createGraph,
  deleteGraph,
  emptyGraphPayload,
  listGraphs,
  type GraphRecord,
} from "../features/cloud/graphApi";
import { useAuthStore } from "../store/authStore";

function formatRelativeDate(value: string): string {
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
  if (diffDays < 365) return `Expires in ${Math.floor(diffDays / 30)} months`;
  return `Expires ${date.toLocaleDateString()}`;
}

function GraphPreview({ graph }: { graph: GraphRecord }) {
  const nodes = graph.data?.nodes ?? [];
  const edges = graph.data?.edges ?? [];

  if (nodes.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
        Empty graph
      </div>
    );
  }

  // Calculate bounds to fit nodes in the preview
  const positions = nodes.map((n) => n.position);
  const minX = Math.min(...positions.map((p) => p.x));
  const maxX = Math.max(...positions.map((p) => p.x));
  const minY = Math.min(...positions.map((p) => p.y));
  const maxY = Math.max(...positions.map((p) => p.y));

  const padding = 20;
  const width = maxX - minX + padding * 2 || 100;
  const height = maxY - minY + padding * 2 || 100;

  // Scale to fit in preview area
  const scale = Math.min(140 / width, 80 / height, 1);
  const offsetX = (150 - width * scale) / 2 - minX * scale + padding * scale;
  const offsetY = (90 - height * scale) / 2 - minY * scale + padding * scale;

  return (
    <svg className="h-full w-full" viewBox="0 0 150 90">
      {/* Edges */}
      {edges.map((edge) => {
        const source = nodes.find((n) => n.id === edge.source);
        const target = nodes.find((n) => n.id === edge.target);
        if (!source || !target) return null;

        const x1 = source.position.x * scale + offsetX + 4;
        const y1 = source.position.y * scale + offsetY + 4;
        const x2 = target.position.x * scale + offsetX + 4;
        const y2 = target.position.y * scale + offsetY + 4;

        return (
          <line key={edge.id} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#CBD5E1" strokeWidth={1} />
        );
      })}
      {/* Nodes */}
      {nodes.map((node) => {
        const x = node.position.x * scale + offsetX;
        const y = node.position.y * scale + offsetY;
        const color = node.data?.style?.color ?? "#E2E8F0";

        return (
          <rect
            key={node.id}
            x={x}
            y={y}
            width={8}
            height={8}
            rx={2}
            fill={color}
            stroke="#94A3B8"
            strokeWidth={0.5}
          />
        );
      })}
    </svg>
  );
}

export default function DocsRoute() {
  const navigate = useNavigate();
  const { user, status } = useAuthStore();
  const [graphs, setGraphs] = useState<GraphRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GraphRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newGraphName, setNewGraphName] = useState("");
  const [creating, setCreating] = useState(false);
  const isAuthenticated = status === "authenticated";

  const refresh = async () => {
    try {
      setLoading(true);
      const data = await listGraphs();
      setGraphs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load graphs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      void refresh();
      return;
    }
    setLoading(false);
  }, [isAuthenticated]);

  const handleOpenCreate = () => {
    setNewGraphName("");
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (creating) return;
    try {
      setCreating(true);
      const title = newGraphName.trim() || "Untitled Graph";
      const graph = await createGraph(title, emptyGraphPayload());
      setCreateOpen(false);
      navigate(`/docs/${graph.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create graph");
    } finally {
      setCreating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteGraph(deleteTarget.id);
      setDeleteTarget(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete graph");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-card">
      <Header />
      <div className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {isAuthenticated ? "Your graphs" : "Thalamus workspace"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isAuthenticated
                  ? `${graphs.length}/20 saved. Each graph keeps a one-year retention window.`
                  : "Start a graph in the browser. Saving and sharing require an account."}
              </p>
            </div>
            {isAuthenticated ? (
              <button
                className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
                type="button"
                onClick={handleOpenCreate}
                disabled={graphs.length >= 20}
              >
                New graph
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  className="rounded-lg border border-border px-4 py-2 text-sm text-foreground"
                  to="/editor"
                >
                  Start a graph
                </Link>
                <Link
                  className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
                  to="/login"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {isAuthenticated ? (
            loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : graphs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">
                No graphs yet. Create one to get started.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {graphs.map((graph) => (
                  <div
                    key={graph.id}
                    className="group relative overflow-hidden rounded-xl border border-border bg-background shadow-sm transition hover:border-muted-foreground/30 hover:shadow-[0_0_40px_-10px_rgba(0,212,255,0.25)]"
                  >
                    {/* Preview area */}
                    <button
                      type="button"
                      className="block h-24 w-full cursor-pointer border-b border-border bg-secondary p-2"
                      onClick={() => navigate(`/docs/${graph.id}`)}
                    >
                      <GraphPreview graph={graph} />
                    </button>

                    {/* Delete button - top right corner */}
                    <button
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-background/80 text-muted-foreground opacity-0 backdrop-blur-sm transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      type="button"
                      onClick={() => setDeleteTarget(graph)}
                      aria-label="Delete graph"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {/* Card content */}
                    <div className="p-3">
                      <button
                        type="button"
                        className="block w-full cursor-pointer text-left"
                        onClick={() => navigate(`/docs/${graph.id}`)}
                      >
                        <h3 className="truncate text-sm font-semibold text-foreground">
                          {graph.title || "Untitled Graph"}
                        </h3>
                      </button>

                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeDate(graph.updated_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatExpiryDate(graph.expires_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">
              You can sketch ideas immediately, then export when you are ready.
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Create graph dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create new graph</DialogTitle>
            <DialogDescription>Give your graph a name to get started.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleCreate();
            }}
          >
            <Input
              value={newGraphName}
              onChange={(e) => setNewGraphName(e.target.value)}
              placeholder="Untitled Graph"
              className="mt-2"
              autoFocus
            />
            <DialogFooter className="mt-4">
              <button
                type="button"
                className="rounded-lg border border-border px-4 py-2 text-sm text-foreground transition hover:bg-secondary"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete graph?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title || "Untitled Graph"}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
