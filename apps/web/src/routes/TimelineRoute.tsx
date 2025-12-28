import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  GripVertical,
  Layers,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";

import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { getGraph, updateGraph, createGraph, type GraphPayload } from "../features/cloud/graphApi";
import { useAuthStore } from "../store/authStore";
import { useTimelineStore } from "../features/timeline/timelineStore";
import { TimelineCanvas } from "../features/timeline/components";
import type {
  AxisType,
  TimelineData,
  TimelineNode,
  TimelineEdge,
} from "../features/timeline/types";

export default function TimelineRoute() {
  const { graphId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    nodes,
    edges,
    tracks,
    axisConfig,
    gridSettings,
    dataVersion,
    setNodes,
    setEdges,
    setTracks,
    setAxisConfig,
    setGridSettings,
    addTrack,
    removeTrack,
    updateTrack,
    reset,
  } = useTimelineStore();

  const [graphTitle, setGraphTitle] = useState("Untitled Timeline");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [newTrackLabel, setNewTrackLabel] = useState("");
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedVersionRef = useRef<number>(0);

  const canSave = Boolean(user);
  // Use type assertion since timeline data structure differs from standard GraphPayload
  const payload = useMemo(
    () =>
      ({
        nodes: nodes as unknown as GraphPayload["nodes"],
        edges: edges as unknown as GraphPayload["edges"],
        timeline: {
          tracks,
          axisConfig,
          gridSettings,
        } as TimelineData,
      }) as unknown as GraphPayload,
    [nodes, edges, tracks, axisConfig, gridSettings]
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
      reset();
      setGraphTitle("Untitled Timeline");
      // Add default track
      addTrack("Track 1");
      return;
    }

    const loadGraph = async () => {
      try {
        const graph = await getGraph(graphId);
        if (graph) {
          setGraphTitle(graph.title);
          // Cast to timeline-specific data structure
          const data = graph.data as unknown as {
            nodes?: TimelineNode[];
            edges?: TimelineEdge[];
            timeline?: TimelineData;
          };
          if (data.nodes) setNodes(data.nodes);
          if (data.edges) setEdges(data.edges);
          if (data.timeline) {
            if (data.timeline.tracks) setTracks(data.timeline.tracks);
            if (data.timeline.axisConfig) setAxisConfig(data.timeline.axisConfig);
            if (data.timeline.gridSettings) setGridSettings(data.timeline.gridSettings);
          }
          lastSavedVersionRef.current = dataVersion;
        }
      } catch (error) {
        console.error("Failed to load graph:", error);
        setLoadError("Failed to load timeline");
      }
    };

    void loadGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphId]);

  // Handle add track
  const handleAddTrack = () => {
    const label = newTrackLabel.trim() || `Track ${tracks.length + 1}`;
    addTrack(label);
    setNewTrackLabel("");
  };

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
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Panel - Track Manager */}
          {showLeftPanel && (
            <div className="w-64 border-r border-border bg-muted/30 flex flex-col z-10">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Tracks ({tracks.length})
                </h3>
              </div>

              {/* Add track form */}
              <div className="p-3 border-b border-border flex gap-2">
                <Input
                  value={newTrackLabel}
                  onChange={(e) => setNewTrackLabel(e.target.value)}
                  placeholder="New track name..."
                  className="h-8 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTrack();
                  }}
                />
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleAddTrack}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Track list */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {tracks.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-2">
                    No tracks yet. Add a track to get started.
                  </p>
                ) : (
                  tracks.map((track, index) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-2 p-2 rounded-md bg-background border border-border group"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: track.color ?? "#64748b" }}
                      />
                      <span className="flex-1 text-sm truncate">{track.label}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => removeTrack(track.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Toggle Left Panel */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowLeftPanel(!showLeftPanel)}
                className="absolute top-1/2 -translate-y-1/2 z-20 bg-background border border-border rounded-r-md p-1 hover:bg-muted"
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
          <div className="flex-1 relative">
            <TimelineCanvas />
          </div>

          {/* Toggle Right Panel */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowRightPanel(!showRightPanel)}
                className="absolute top-1/2 -translate-y-1/2 z-20 bg-background border border-border rounded-l-md p-1 hover:bg-muted"
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
            <div className="w-72 border-l border-border bg-muted/30 flex flex-col z-10">
              <div className="p-3 border-b border-border">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Axis Configuration
                </h3>
              </div>
              <div className="flex-1 p-3 space-y-4 overflow-y-auto">
                {/* Axis Type */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Axis Type</label>
                  <Select
                    value={axisConfig.type}
                    onValueChange={(value: AxisType) => setAxisConfig({ type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time">Time-based</SelectItem>
                      <SelectItem value="number">Number scale</SelectItem>
                      <SelectItem value="milestone">Milestones</SelectItem>
                      <SelectItem value="custom">Custom labels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tick count */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Tick Count</label>
                  <Input
                    type="number"
                    min={2}
                    max={50}
                    value={axisConfig.tickCount ?? 10}
                    onChange={(e) => setAxisConfig({ tickCount: parseInt(e.target.value) || 10 })}
                    className="h-8"
                  />
                </div>

                {/* Show grid */}
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Show Grid</label>
                  <input
                    type="checkbox"
                    checked={axisConfig.showGrid ?? true}
                    onChange={(e) => setAxisConfig({ showGrid: e.target.checked })}
                    className="h-4 w-4"
                  />
                </div>

                {/* Number-specific config */}
                {axisConfig.type === "number" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Start Value
                      </label>
                      <Input
                        type="number"
                        value={axisConfig.startValue ?? 0}
                        onChange={(e) =>
                          setAxisConfig({ startValue: parseFloat(e.target.value) || 0 })
                        }
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">End Value</label>
                      <Input
                        type="number"
                        value={axisConfig.endValue ?? 100}
                        onChange={(e) =>
                          setAxisConfig({ endValue: parseFloat(e.target.value) || 100 })
                        }
                        className="h-8"
                      />
                    </div>
                  </>
                )}

                {/* Snap settings */}
                <div className="pt-4 border-t border-border space-y-3">
                  <h4 className="text-xs font-medium text-muted-foreground">Snap Settings</h4>
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-muted-foreground">Snap to Axis</label>
                    <input
                      type="checkbox"
                      checked={gridSettings.snapToAxis}
                      onChange={(e) => setGridSettings({ snapToAxis: e.target.checked })}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-muted-foreground">Snap to Track</label>
                    <input
                      type="checkbox"
                      checked={gridSettings.snapToTrack}
                      onChange={(e) => setGridSettings({ snapToTrack: e.target.checked })}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
