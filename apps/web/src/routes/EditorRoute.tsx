import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import EditorToolbar from "../features/editor/EditorToolbar";
import GraphCanvas from "../features/editor/GraphCanvas";
import RelationshipInspector from "../features/editor/RelationshipInspector";
import NodeSearch from "../features/search/NodeSearch";
import { getGraph, updateGraph, createGraph } from "../features/cloud/graphApi";
import ShareDialog from "../features/share/ShareDialog";
import { useAuthStore } from "../store/authStore";
import { useGraphStore } from "../store/graphStore";

export default function EditorRoute() {
  const { graphId } = useParams();
  const navigate = useNavigate();
  const { user, status } = useAuthStore();
  const { nodes, edges, graphTitle, setGraphTitle, setNodes, setEdges } =
    useGraphStore();
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const canSave = Boolean(user);
  const payload = useMemo(() => ({ nodes, edges }), [edges, nodes]);

  useEffect(() => {
    if (!graphId || !user) {
      return;
    }
    let ignore = false;
    const load = async () => {
      try {
        const graph = await getGraph(graphId);
        if (ignore) {
          return;
        }
        setGraphTitle(graph.title ?? "Untitled Graph");
        setNodes(graph.data?.nodes ?? []);
        setEdges(graph.data?.edges ?? []);
        setLoadError(null);
      } catch (error) {
        if (!ignore) {
          setLoadError(
            error instanceof Error ? error.message : "Failed to load graph"
          );
        }
      }
    };
    void load();
    return () => {
      ignore = true;
    };
  }, [graphId, setEdges, setGraphTitle, setNodes, user]);

  const handleSave = async () => {
    if (!user) {
      return;
    }
    try {
      setSaveStatus("saving");
      if (graphId) {
        await updateGraph(graphId, graphTitle, payload);
      } else {
        const graph = await createGraph(graphTitle, payload);
        navigate(`/docs/${graph.id}`);
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    } catch (error) {
      console.error(error);
      setSaveStatus("error");
    }
  };

  const handleShare = () => {
    if (!user) {
      setShareMessage("Sign in to share this graph.");
      return;
    }
    if (!graphId) {
      setShareMessage("Save the graph before creating a share link.");
      return;
    }
    setShareMessage(null);
    setShareOpen(true);
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <EditorToolbar
        canSave={canSave}
        onSave={handleSave}
        onShare={handleShare}
        saveStatus={saveStatus}
      />
      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        <section className="flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <GraphCanvas />
        </section>
        <aside className="w-80 shrink-0 space-y-4">
          <NodeSearch />
          <RelationshipInspector />
          {!canSave ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
              <p>Cloud saves are available for account holders.</p>
              <Link className="mt-2 inline-block text-slate-900 underline" to="/login">
                Sign in to save and share
              </Link>
            </div>
          ) : null}
          {status === "authenticated" && loadError ? (
            <div className="rounded-lg border border-red-200 bg-white p-4 text-sm text-red-600">
              {loadError}
            </div>
          ) : null}
          {shareMessage ? (
            <div className="rounded-lg border border-amber-200 bg-white p-4 text-sm text-amber-700">
              {shareMessage}
            </div>
          ) : null}
        </aside>
      </div>
      <ShareDialog
        open={shareOpen}
        graphId={graphId}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
