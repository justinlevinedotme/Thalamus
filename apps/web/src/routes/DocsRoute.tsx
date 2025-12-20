import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  createGraph,
  deleteGraph,
  emptyGraphPayload,
  listGraphs,
  type GraphRecord,
} from "../features/cloud/graphApi";
import { useAuthStore } from "../store/authStore";

const formatDate = (value: string) => new Date(value).toLocaleString();

export default function DocsRoute() {
  const navigate = useNavigate();
  const { user, status } = useAuthStore();
  const [graphs, setGraphs] = useState<GraphRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const handleCreate = async () => {
    try {
      const graph = await createGraph("Untitled Graph", emptyGraphPayload());
      navigate(`/docs/${graph.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create graph");
    }
  };

  const handleDelete = async (graphId: string) => {
    try {
      await deleteGraph(graphId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete graph");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {isAuthenticated ? "Your graphs" : "Thalamus workspace"}
            </h1>
            <p className="text-sm text-slate-500">
              {isAuthenticated
                ? `${graphs.length}/20 saved. Each graph keeps a one-year retention window.`
                : "Start a graph in the browser. Saving and sharing require an account."}
            </p>
          </div>
          {isAuthenticated ? (
            <button
              className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
              type="button"
              onClick={handleCreate}
              disabled={graphs.length >= 20}
            >
              New graph
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700"
                to="/editor"
              >
                Start a graph
              </Link>
              <Link
                className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
                to="/login"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {isAuthenticated ? (
          loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : graphs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              No graphs yet. Create one to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {graphs.map((graph) => (
                <div
                  key={graph.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {graph.title || "Untitled Graph"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Updated {formatDate(graph.updated_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-xs"
                      type="button"
                      onClick={() => navigate(`/docs/${graph.id}`)}
                    >
                      Open
                    </button>
                    <button
                      className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600"
                      type="button"
                      onClick={() => handleDelete(graph.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            You can sketch ideas immediately, then export when you are ready.
          </div>
        )}
      </div>
    </div>
  );
}
