import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Panel,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type ReactFlowInstance,
  BackgroundVariant,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useTimelineStore } from "../timelineStore";
import type { TimelineNode, TimelineEdge } from "../types";
import { timelineNodeTypes } from "../nodeTypes";
import { AxisRenderer } from "./AxisRenderer";
import { TrackLanes } from "./TrackLanes";
import { EventComposer } from "./EventComposer";
import { TimelineContextMenu, type TimelineContextMenuState } from "./TimelineContextMenu";

// Constants for layout
export const TRACK_HEIGHT = 80;
export const TRACK_START_Y = 100;
export const CANVAS_WIDTH = 1000;

interface TimelineCanvasProps {
  onNodeSelect?: (nodeId: string | undefined) => void;
}

// Inner component that has access to useReactFlow
function TimelineCanvasInner({ onNodeSelect }: TimelineCanvasProps) {
  const {
    nodes,
    edges,
    tracks,
    axisConfig,
    gridSettings,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectNode,
    addEvent,
    addSpan,
    updateNodeData,
    setFlowInstance,
  } = useTimelineStore();

  const reactFlowInstance = useReactFlow();
  const { screenToFlowPosition } = reactFlowInstance;

  // Set flow instance on mount
  const handleInit = useCallback(
    (instance: ReactFlowInstance<TimelineNode, TimelineEdge>) => {
      setFlowInstance(instance);
    },
    [setFlowInstance]
  );

  // Context menu state
  const [contextMenu, setContextMenu] = useState<TimelineContextMenuState>(null);

  // Composer state
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerPosition, setComposerPosition] = useState({ x: 0, y: 0 });
  const [composerTrackId, setComposerTrackId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [isCreatingSpan, setIsCreatingSpan] = useState(false);

  // Handle node selection
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: TimelineNode) => {
      selectNode(node.id);
      onNodeSelect?.(node.id);
    },
    [selectNode, onNodeSelect]
  );

  // Handle node double-click to edit
  const handleNodeDoubleClick = useCallback((_event: React.MouseEvent, node: TimelineNode) => {
    setEditingNodeId(node.id);
    setComposerTrackId(node.data.trackId);
    setComposerPosition({ x: node.position.x, y: node.position.y });
    setComposerOpen(true);
  }, []);

  // Handle pane click (deselect)
  const handlePaneClick = useCallback(() => {
    selectNode(undefined);
    onNodeSelect?.(undefined);
  }, [selectNode, onNodeSelect]);

  // Handle double-click on canvas to create new event
  const handlePaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      if (tracks.length === 0) return;

      // Get flow position from screen coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Find which track was clicked
      const trackIndex = Math.floor((position.y - TRACK_START_Y) / TRACK_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(trackIndex, tracks.length - 1));
      const track = tracks[clampedIndex];

      if (!track) return;

      // Calculate axis position (0-1)
      const axisPosition = Math.max(0, Math.min(1, position.x / CANVAS_WIDTH));

      // Open composer for new event
      setEditingNodeId(null);
      setComposerTrackId(track.id);
      setComposerPosition({ x: position.x, y: TRACK_START_Y + clampedIndex * TRACK_HEIGHT });
      setComposerOpen(true);
    },
    [tracks, screenToFlowPosition]
  );

  // Handle node changes with track/axis constraints
  const handleNodesChange = useCallback(
    (changes: NodeChange<TimelineNode>[]) => {
      // Process position changes to constrain to track lanes and axis
      const processedChanges = changes.map((change) => {
        if (change.type === "position" && change.position && change.dragging) {
          const node = nodes.find((n) => n.id === change.id);
          if (node) {
            const trackIndex = tracks.findIndex((t) => t.id === node.data.trackId);
            const trackY = TRACK_START_Y + trackIndex * TRACK_HEIGHT;

            // Snap to axis if enabled
            let newX = change.position.x;
            if (gridSettings.snapToAxis) {
              const gridStep = CANVAS_WIDTH / (axisConfig.tickCount ?? 10);
              newX = Math.round(newX / gridStep) * gridStep;
            }

            // Clamp X to canvas bounds
            newX = Math.max(0, Math.min(newX, CANVAS_WIDTH - 80));

            // Constrain Y to track lane
            const newY = gridSettings.snapToTrack ? trackY : change.position.y;

            return {
              ...change,
              position: { x: newX, y: newY },
            };
          }
        }
        return change;
      });

      onNodesChange(processedChanges as NodeChange<TimelineNode>[]);
    },
    [nodes, tracks, gridSettings, axisConfig, onNodesChange]
  );

  // Handle node drag stop - update axis position in data
  const handleNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: TimelineNode) => {
      const axisPosition = Math.max(0, Math.min(1, node.position.x / CANVAS_WIDTH));

      if (node.data.type === "event") {
        updateNodeData(node.id, { axisPosition });
      } else if (node.data.type === "span") {
        // For spans, update start position and recalculate end
        const width = (node.data.endPosition - node.data.startPosition) * CANVAS_WIDTH;
        const endPosition = Math.min(1, (node.position.x + width) / CANVAS_WIDTH);
        updateNodeData(node.id, { startPosition: axisPosition, endPosition });
      }
    },
    [updateNodeData]
  );

  // Handle edge changes
  const handleEdgesChange = useCallback(
    (changes: EdgeChange<TimelineEdge>[]) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  // Handle new connections
  const handleConnect = useCallback(
    (connection: Connection) => {
      onConnect(connection);
    },
    [onConnect]
  );

  // Handle composer save
  const handleComposerSave = useCallback(
    (data: { label: string; description?: string; isSpan: boolean; duration?: number }) => {
      if (!composerTrackId) return;

      const axisPosition = Math.max(0, Math.min(1, composerPosition.x / CANVAS_WIDTH));

      if (editingNodeId) {
        // Update existing node
        updateNodeData(editingNodeId, {
          label: data.label,
          description: data.description,
        });
      } else {
        // Create new node
        if (data.isSpan && data.duration) {
          const endPosition = Math.min(1, axisPosition + data.duration / 100);
          addSpan(composerTrackId, axisPosition, endPosition, data.label);
        } else {
          addEvent(composerTrackId, axisPosition, data.label);
        }
      }

      setComposerOpen(false);
      setEditingNodeId(null);
      setIsCreatingSpan(false);
    },
    [composerTrackId, composerPosition, editingNodeId, addEvent, addSpan, updateNodeData]
  );

  // Context menu handlers
  const handlePaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      if (tracks.length === 0) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Find which track was clicked
      const trackIndex = Math.floor((position.y - TRACK_START_Y) / TRACK_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(trackIndex, tracks.length - 1));
      const track = tracks[clampedIndex];

      setContextMenu({
        type: "pane",
        trackId: track?.id,
        position: { x: event.clientX, y: event.clientY },
        flowPosition: position,
      });
    },
    [tracks, screenToFlowPosition]
  );

  const handleNodeContextMenu = useCallback((event: React.MouseEvent, node: TimelineNode) => {
    event.preventDefault();
    setContextMenu({
      type: "node",
      nodeId: node.id,
      trackId: node.data.trackId,
      position: { x: event.clientX, y: event.clientY },
      flowPosition: { x: node.position.x, y: node.position.y },
    });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleContextMenuAddEvent = useCallback(
    (trackId: string, flowPosition: { x: number; y: number }) => {
      setEditingNodeId(null);
      setComposerTrackId(trackId);
      setComposerPosition(flowPosition);
      setIsCreatingSpan(false);
      setComposerOpen(true);
    },
    []
  );

  const handleContextMenuAddSpan = useCallback(
    (trackId: string, flowPosition: { x: number; y: number }) => {
      setEditingNodeId(null);
      setComposerTrackId(trackId);
      setComposerPosition(flowPosition);
      setIsCreatingSpan(true);
      setComposerOpen(true);
    },
    []
  );

  const handleContextMenuEditNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      setEditingNodeId(nodeId);
      setComposerTrackId(node.data.trackId);
      setComposerPosition({ x: node.position.x, y: node.position.y });
      setIsCreatingSpan(false);
      setComposerOpen(true);
    },
    [nodes]
  );

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={timelineNodeTypes}
        onInit={handleInit}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeDragStop={handleNodeDragStop}
        onPaneClick={handlePaneClick}
        onDoubleClick={handlePaneDoubleClick}
        onContextMenu={handlePaneContextMenu}
        onNodeContextMenu={handleNodeContextMenu}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
        selectNodesOnDrag={false}
        nodesDraggable={true}
        nodesConnectable={true}
      >
        {/* Track lanes background */}
        <TrackLanes tracks={tracks} trackHeight={TRACK_HEIGHT} canvasWidth={CANVAS_WIDTH} />

        {/* Axis renderer */}
        <AxisRenderer
          config={axisConfig}
          tracks={tracks}
          trackHeight={TRACK_HEIGHT}
          canvasWidth={CANVAS_WIDTH}
        />

        {/* Grid background */}
        {gridSettings.showAxisGrid && (
          <Background
            variant={BackgroundVariant.Lines}
            gap={CANVAS_WIDTH / (axisConfig.tickCount ?? 10)}
            color="rgba(100, 116, 139, 0.1)"
          />
        )}

        {/* Controls */}
        <Controls showInteractive={false} className="!bg-background !border-border" />

        {/* Info panel */}
        <Panel
          position="bottom-left"
          className="!bg-background/80 !border !border-border !rounded-md !p-2"
        >
          <div className="text-xs text-muted-foreground">
            <span>{nodes.length} events</span>
            <span className="mx-2">·</span>
            <span>{tracks.length} tracks</span>
            {tracks.length > 0 && (
              <>
                <span className="mx-2">·</span>
                <span className="text-muted-foreground/70">Right-click to add event</span>
              </>
            )}
          </div>
        </Panel>
      </ReactFlow>

      {/* Event Composer Modal */}
      <EventComposer
        open={composerOpen}
        onOpenChange={setComposerOpen}
        onSave={handleComposerSave}
        editingNode={editingNodeId ? nodes.find((n) => n.id === editingNodeId) : undefined}
        tracks={tracks}
        selectedTrackId={composerTrackId}
        defaultIsSpan={isCreatingSpan}
      />

      {/* Context Menu */}
      <TimelineContextMenu
        menu={contextMenu}
        onClose={handleCloseContextMenu}
        onAddEvent={handleContextMenuAddEvent}
        onAddSpan={handleContextMenuAddSpan}
        onEditNode={handleContextMenuEditNode}
        tracks={tracks}
      />
    </>
  );
}

// Wrapper component that provides ReactFlowProvider context
export default function TimelineCanvas(props: TimelineCanvasProps) {
  return (
    <ReactFlowProvider>
      <div className="h-full w-full relative">
        <TimelineCanvasInner {...props} />
      </div>
    </ReactFlowProvider>
  );
}
