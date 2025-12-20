import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactFlow, {
  Background,
  Controls,
  type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";

import { getSharedGraph } from "../features/share/shareApi";
import type { GraphPayload } from "../features/cloud/graphApi";

export default function ShareRoute() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [graphTitle, setGraphTitle] = useState<string>("Shared graph");
  const [payload, setPayload] = useState<GraphPayload | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance | null>(
    null
  );

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
          setDebugInfo(
            JSON.stringify(
              { token, shared, message: "RPC returned no rows" },
              null,
              2
            )
          );
          setError("This share link is invalid or expired.");
          return;
        }
        const data = shared.data as GraphPayload | undefined;
        setGraphTitle(shared.title || "Shared graph");
        setPayload({ nodes: data?.nodes ?? [], edges: data?.edges ?? [] });
        setDebugInfo(
          JSON.stringify(
            {
              token,
              id: shared.id,
              title: shared.title,
              nodes: data?.nodes?.length ?? 0,
              edges: data?.edges?.length ?? 0,
            },
            null,
            2
          )
        );
      } catch (err) {
        if (!ignore) {
          setDebugInfo(
            JSON.stringify(
              {
                token,
                error: err instanceof Error ? err.message : err,
              },
              null,
              2
            )
          );
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

  useEffect(() => {
    if (!flowInstance || !payload?.nodes?.length) {
      return;
    }
    flowInstance.fitView({ padding: 0.2, duration: 300 });
  }, [flowInstance, payload]);

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
          <div className="relative h-[calc(100vh-6rem)] rounded-lg border border-slate-200 bg-white">
            <div className="h-full w-full">
              <ReactFlow
                className="h-full w-full"
                nodes={payload?.nodes ?? []}
                edges={payload?.edges ?? []}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                zoomOnScroll
                panOnScroll
                fitView
                onInit={setFlowInstance}
              >
                <Background gap={24} size={1} />
                <Controls showInteractive={false} />
              </ReactFlow>
            </div>
            {payload?.nodes?.length === 0 ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400">
                No nodes yet
              </div>
            ) : null}
          </div>
        )}
        {debugInfo ? (
          <pre className="mt-4 overflow-auto rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600">
            {debugInfo}
          </pre>
        ) : null}
      </div>
    </div>
  );
}
