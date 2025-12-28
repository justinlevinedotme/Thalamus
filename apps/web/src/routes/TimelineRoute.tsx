import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, Layers, Plus, Settings, X } from "lucide-react";

import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { getGraph, updateGraph, createGraph } from "../features/cloud/graphApi";
import { useAuthStore } from "../store/authStore";
import { useGraphStore } from "../store/graphStore";

export default function TimelineRoute() {
  const { graphId } = useParams();
  const navigate = useNavigate();
  const { user, status } = useAuthStore();
  const {
    nodes,
    edges,
    groups,
    graphTitle,
    setGraphTitle,
    setNodes,
    setEdges,
    setGroups,
    dataVersion,
    gridSettings,
    setGridSettings,
  } = useGraphStore();

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedVersionRef = useRef<number>(0);

  const canSave = Boolean(user);
  const payload = useMemo(
    () => ({ nodes, edges, groups, gridSettings }),
    [edges, groups, nodes, gridSettings]
  );

  // Save handler
  const handleSave = useCallback(async () => {
    if (!user) return;
    try {
      setSaveStatus("saving");
      if (graphId) {
        await updateGraph(graphId, graphTitle, payload);
      } else {
        const graph = await createGraph(graphTitle, payload);
        navigate(`/timeline/${graph.id}`);
      }
      setSaveStatus("saved");
      setLastSavedAt(new Date());
      lastSavedVersionRef.current = dataVersion;
      setTimeout(() => setSaveStatus("idle"), 1500);
    } catch (error) {
      console.error(error);
      setSaveStatus("error");
    }
  }, [user, graphId, graphTitle, payload, navigate, dataVersion]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? event.metaKey : event.ctrlKey;

      // Cmd/Ctrl + S - Save
      if (modKey && event.key === "s") {
        event.preventDefault();
        if (canSave) {
          void handleSave();
        }
        return;
      }
    },
    [canSave, handleSave]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Auto-save on changes
  useEffect(() => {
    if (!canSave || !graphId) return;
    if (dataVersion === lastSavedVersionRef.current) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      void handleSave();
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [canSave, graphId, dataVersion, handleSave]);

  // Load graph on mount
  useEffect(() => {
    if (!graphId) {
      // New timeline - reset state
      setNodes([]);
      setEdges([]);
      setGroups([]);
      setGraphTitle("Untitled Timeline");
      return;
    }

    const loadGraph = async () => {
      try {
        const graph = await getGraph(graphId);
        if (graph) {
          setGraphTitle(graph.title);
          const data = graph.data as {
            nodes?: typeof nodes;
            edges?: typeof edges;
            groups?: typeof groups;
            gridSettings?: typeof gridSettings;
          };
          if (data.nodes) setNodes(data.nodes);
          if (data.edges) setEdges(data.edges);
          if (data.groups) setGroups(data.groups);
          if (data.gridSettings) setGridSettings(data.gridSettings);
          lastSavedVersionRef.current = dataVersion;
        }
      } catch (error) {
        console.error("Failed to load graph:", error);
        setLoadError("Failed to load timeline");
      }
    };

    void loadGraph();
  }, [graphId, setNodes, setEdges, setGroups, setGraphTitle, setGridSettings, dataVersion]);

  if (loadError) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Card className="p-6 max-w-md">
          <h2 className="text-lg font-semibold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{loadError}</p>
          <Button onClick={() => navigate("/timeline")} variant="outline">
            Create New Timeline
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
        {/* Top Toolbar */}
        <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Clock className="h-5 w-5" />
              <span className="font-medium">Timeline</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <input
              type="text"
              value={graphTitle}
              onChange={(e) => setGraphTitle(e.target.value)}
              className="bg-transparent border-none outline-none text-foreground font-medium w-48"
              placeholder="Untitled Timeline"
            />
          </div>

          <div className="flex items-center gap-2">
            {saveStatus === "saving" && (
              <span className="text-xs text-muted-foreground">Saving...</span>
            )}
            {saveStatus === "saved" && <span className="text-xs text-green-500">Saved</span>}
            {saveStatus === "error" && (
              <span className="text-xs text-destructive">Save failed</span>
            )}
            {!user && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Sign in to save</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Track Manager */}
          {showLeftPanel && (
            <div className="w-64 border-r border-border bg-muted/30 flex flex-col">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Tracks
                </h3>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 p-3">
                <p className="text-xs text-muted-foreground">
                  No tracks yet. Add a track to get started.
                </p>
              </div>
            </div>
          )}

          {/* Toggle Left Panel */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowLeftPanel(!showLeftPanel)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background border border-border rounded-r-md p-1 hover:bg-muted"
                style={{ left: showLeftPanel ? "256px" : "0" }}
              >
                {showLeftPanel ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {showLeftPanel ? "Hide tracks" : "Show tracks"}
            </TooltipContent>
          </Tooltip>

          {/* Canvas Area */}
          <div className="flex-1 relative bg-muted/10">
            {/* Placeholder for TimelineCanvas */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Clock className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h2 className="text-lg font-medium text-muted-foreground mb-2">Timeline Canvas</h2>
                <p className="text-sm text-muted-foreground/70 max-w-md">
                  The timeline canvas will render here. Add tracks on the left, configure the axis
                  on the right, and place events along the timeline.
                </p>
              </div>
            </div>
          </div>

          {/* Toggle Right Panel */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowRightPanel(!showRightPanel)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background border border-border rounded-l-md p-1 hover:bg-muted"
                style={{ right: showRightPanel ? "288px" : "0" }}
              >
                {showRightPanel ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              {showRightPanel ? "Hide settings" : "Show settings"}
            </TooltipContent>
          </Tooltip>

          {/* Right Panel - Axis Configuration */}
          {showRightPanel && (
            <div className="w-72 border-l border-border bg-muted/30 flex flex-col">
              <div className="p-3 border-b border-border">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Axis Configuration
                </h3>
              </div>
              <div className="flex-1 p-3 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Axis Type</label>
                  <p className="text-sm mt-1">Time-based axis</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Range</label>
                  <p className="text-sm mt-1 text-muted-foreground">Not configured</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
