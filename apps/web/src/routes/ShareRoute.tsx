import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

import { getSharedGraph } from "../features/share/shareApi";
import type { GraphPayload } from "../features/cloud/graphApi";

export default function ShareRoute() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [graphTitle, setGraphTitle] = useState<string>("Shared graph");
  const [payload, setPayload] = useState<GraphPayload | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Missing share token.");
      setLoading(false);
      return;
    }
    let ignore = false;
    const load = async () => {
      try {
        const shared = await getSharedGraph(token);
        if (!shared || ignore) {
          setError("This share link is invalid or expired.");
          return;
        }
        const data = shared.data as GraphPayload | undefined;
        setGraphTitle(shared.title || "Shared graph");
        setPayload({ nodes: data?.nodes ?? [], edges: data?.edges ?? [] });
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Unable to load share link");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      ignore = true;
    };
  }, [token]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{graphTitle}</h1>
          <p className="text-xs text-slate-500">Read-only shared view</p>
        </div>
        <Link className="text-sm text-slate-600 underline" to="/docs">
          Back to docs
        </Link>
      </header>

      <div className="flex-1 p-4">
        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Loading share link...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-white p-6 text-sm text-red-600">
            {error}
          </div>
        ) : (
          <div className="h-[calc(100vh-6rem)] rounded-lg border border-slate-200 bg-white">
            <ReactFlow
              nodes={payload?.nodes ?? []}
              edges={payload?.edges ?? []}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              zoomOnScroll
              panOnScroll
              fitView
            >
              <Background gap={24} size={1} />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>
        )}
      </div>
    </div>
  );
}
