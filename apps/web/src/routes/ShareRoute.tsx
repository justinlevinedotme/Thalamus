/**
 * @file ShareRoute.tsx
 * @description Public page for viewing shared graphs via token. Displays a read-only React
 * Flow canvas with the shared graph content. Handles loading states and invalid/expired links.
 */

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ReactFlow, Background, Controls, type ReactFlowInstance } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { getSharedGraph } from "../features/share/shareApi";
import type { GraphPayload } from "../features/cloud/graphApi";

export default function ShareRoute() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [graphTitle, setGraphTitle] = useState<string>("Shared graph");
  const [payload, setPayload] = useState<GraphPayload | null>(null);
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance | null>(null);

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
        if (ignore) {
          return;
        }
        if (!shared) {
          setError("This share link is invalid or expired.");
          return;
        }
        const data = shared.data as GraphPayload | undefined;
        setGraphTitle(shared.title || "Shared graph");
        setPayload({ nodes: data?.nodes ?? [], edges: data?.edges ?? [] });
        setError(null);
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

  useEffect(() => {
    if (!flowInstance || !payload?.nodes?.length) {
      return;
    }
    flowInstance.fitView({ padding: 0.2, duration: 300 });
  }, [flowInstance, payload]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{graphTitle}</h1>
          <p className="text-xs text-muted-foreground">Read-only shared view</p>
        </div>
        <Link
          className="text-sm text-muted-foreground underline hover:text-foreground"
          to="/me/files"
        >
          Back to files
        </Link>
      </header>

      <div className="flex-1 p-4">
        {loading ? (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            Loading share link...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/50 bg-card p-6 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <div className="relative h-[calc(100vh-6rem)] rounded-lg border border-border bg-card">
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
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                No nodes yet
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
