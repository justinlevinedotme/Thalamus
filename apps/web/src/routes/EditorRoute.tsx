import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Focus, Paintbrush, Plus, Search, X } from "lucide-react";

import { Card } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Kbd } from "../components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import EditorToolbar from "../features/editor/EditorToolbar";
import GraphCanvas from "../features/editor/GraphCanvas";
import MapStyleInspector from "../features/editor/MapStyleInspector";
import NodeStyleInspector from "../features/editor/NodeStyleInspector";
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
  const {
    nodes,
    edges,
    graphTitle,
    setGraphTitle,
    setNodes,
    setEdges,
    addNodeAtCenter,
    selectedNodeId,
    selectedEdgeId,
    isFocusMode,
    clearFocus,
    setFocusNode,
  } = useGraphStore();
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mapStyleOpen, setMapStyleOpen] = useState(false);

  const canSave = Boolean(user);
  const payload = useMemo(() => ({ nodes, edges }), [edges, nodes]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? event.metaKey : event.ctrlKey;

      // Cmd/Ctrl + K - Open search
      if (modKey && event.key === "k") {
        event.preventDefault();
        setSearchOpen(true);
        return;
      }

      // N - Add node
      if (event.key === "n" && !modKey) {
        event.preventDefault();
        addNodeAtCenter("idea");
        return;
      }

      // Escape - Close search
      if (event.key === "Escape" && searchOpen) {
        setSearchOpen(false);
        return;
      }
    },
    [addNodeAtCenter, searchOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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

  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modKeyLabel = isMac ? "⌘" : "Ctrl";

  return (
    <TooltipProvider delayDuration={300}>
      <div className="relative h-screen w-screen overflow-hidden bg-slate-100">
        {/* Full-page canvas */}
        <div className="absolute inset-0">
          <GraphCanvas />
        </div>

        {/* Top toolbar */}
        <div className="absolute left-0 right-0 top-0 z-10">
          <EditorToolbar
            canSave={canSave}
            onSave={handleSave}
            onShare={handleShare}
            saveStatus={saveStatus}
          />
        </div>

        {/* Left floating panel - Tools */}
        <div className="absolute left-4 top-20 z-10">
          {showLeftPanel ? (
            <div className="flex items-start gap-2">
              <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 text-white transition hover:bg-slate-800"
                      type="button"
                      onClick={() => addNodeAtCenter("idea")}
                      aria-label="Add node"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Add Node <Kbd className="ml-1.5">N</Kbd>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="mt-1 flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100"
                      type="button"
                      onClick={() => setSearchOpen(true)}
                      aria-label="Search nodes"
                    >
                      <Search className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Search <Kbd className="ml-1.5">{modKeyLabel}K</Kbd>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="mt-1 flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                      type="button"
                      onClick={() => selectedNodeId && setFocusNode(selectedNodeId)}
                      disabled={!selectedNodeId || isFocusMode}
                      aria-label="Focus on selected node"
                    >
                      <Focus className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Focus on node
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={`mt-1 flex h-10 w-10 items-center justify-center rounded-md transition ${
                        mapStyleOpen
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                      type="button"
                      onClick={() => setMapStyleOpen(!mapStyleOpen)}
                      aria-label="Map style"
                    >
                      <Paintbrush className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Map Style
                  </TooltipContent>
                </Tooltip>
              </div>
              <button
                className="mt-2 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 hover:text-slate-600"
                type="button"
                onClick={() => setShowLeftPanel(false)}
                aria-label="Hide toolbar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 hover:text-slate-600"
              type="button"
              onClick={() => setShowLeftPanel(true)}
              aria-label="Show toolbar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Map Style Inspector Panel */}
        {mapStyleOpen ? (
          <div className="absolute left-20 top-20 z-10 w-72">
            <MapStyleInspector />
          </div>
        ) : null}

        {/* Right floating panel - Inspector */}
        {showRightPanel && (selectedNodeId || selectedEdgeId) ? (
          <div className="absolute right-4 top-20 z-10 w-72">
            <div className="flex items-start gap-2">
              <button
                className="mt-2 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 hover:text-slate-600"
                type="button"
                onClick={() => setShowRightPanel(false)}
                aria-label="Hide panel"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="flex-1 space-y-3">
                {selectedNodeId ? <NodeStyleInspector /> : null}
                {selectedEdgeId ? <RelationshipInspector /> : null}
              </div>
            </div>
          </div>
        ) : !showRightPanel ? (
          <div className="absolute right-4 top-20 z-10">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 hover:text-slate-600"
              type="button"
              onClick={() => setShowRightPanel(true)}
              aria-label="Show panel"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {/* Search Dialog - Spotlight style */}
        <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
          <DialogContent className="top-[20%] translate-y-0 sm:max-w-xl rounded-xl p-0 gap-0 overflow-hidden">
            <DialogHeader className="sr-only">
              <DialogTitle>Search Nodes</DialogTitle>
            </DialogHeader>
            <NodeSearch />
          </DialogContent>
        </Dialog>

        {/* Keyboard shortcuts help - bottom center */}
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
          <Card className="flex items-center gap-4 px-4 py-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Kbd>N</Kbd> Add node
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>{modKeyLabel}</Kbd>
              <Kbd>K</Kbd> Search
            </span>
          </Card>
        </div>

        {/* Exit focus mode - bottom right */}
        {isFocusMode ? (
          <div className="absolute bottom-4 right-4 z-10">
            <button
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm transition hover:bg-slate-50"
              type="button"
              onClick={clearFocus}
              aria-label="Exit focus mode"
            >
              <X className="h-4 w-4" />
              Exit focus mode
            </button>
          </div>
        ) : null}

        {/* Status messages - bottom left */}
        <div className="absolute bottom-4 left-4 z-10 max-w-sm space-y-2">
          {!canSave ? (
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600 shadow-sm">
              <p>Cloud saves are available for account holders.</p>
              <Link
                className="mt-1 inline-block text-slate-900 underline"
                to="/login"
              >
                Sign in to save and share
              </Link>
            </div>
          ) : null}
          {status === "authenticated" && loadError ? (
            <div className="rounded-lg border border-red-200 bg-white p-3 text-sm text-red-600 shadow-sm">
              {loadError}
            </div>
          ) : null}
          {shareMessage ? (
            <div className="rounded-lg border border-amber-200 bg-white p-3 text-sm text-amber-700 shadow-sm">
              {shareMessage}
            </div>
          ) : null}
        </div>

        <ShareDialog
          open={shareOpen}
          graphId={graphId}
          onClose={() => setShareOpen(false)}
        />
      </div>
    </TooltipProvider>
  );
}
