import { useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Panel,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type ReactFlowInstance,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useTimelineStore } from "../timelineStore";
import type { TimelineNode, TimelineEdge } from "../types";
import { timelineNodeTypes } from "../nodeTypes";
import { TimelineLine } from "./TimelineLine";
import { EventComposer } from "./EventComposer";
import { TimelineContextMenu, type TimelineContextMenuState } from "./TimelineContextMenu";

// Constants for layout - simplified single line
export const TIMELINE_Y = 200; // Y position of the central timeline
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
  const [composerAbove, setComposerAbove] = useState(true);

  // Track original Y positions when drag starts (to lock Y movement)
  const dragStartYRef = useRef<Record<string, number>>({});

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
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Determine if clicking above or below timeline
      const isAbove = position.y < TIMELINE_Y;

      // Use default track or create one if needed
      const track = tracks[0];
      if (!track) return;

      // Open composer for new event
      setEditingNodeId(null);
      setComposerTrackId(track.id);
      setComposerPosition(position);
      setComposerAbove(isAbove);
      setComposerOpen(true);
    },
    [tracks, screenToFlowPosition]
  );

  // Handle node changes - lock Y position, only allow X movement
  const handleNodesChange = useCallback(
    (changes: NodeChange<TimelineNode>[]) => {
      const processedChanges = changes.map((change) => {
        if (change.type === "position" && change.position) {
          const nodeId = change.id;

          // Store original Y when drag starts
          if (change.dragging && !(nodeId in dragStartYRef.current)) {
            const node = nodes.find((n) => n.id === nodeId);
            if (node) {
              dragStartYRef.current[nodeId] = node.position.y;
            }
          }

          // Get the locked Y position (use stored value, or find from current nodes)
          let lockedY = dragStartYRef.current[nodeId];
          if (lockedY === undefined) {
            const node = nodes.find((n) => n.id === nodeId);
            lockedY = node?.position.y ?? change.position.y;
          }

          let newX = change.position.x;

          // Snap to grid if enabled
          if (gridSettings.snapToAxis && change.dragging) {
            const gridStep = CANVAS_WIDTH / (axisConfig.tickCount ?? 10);
            newX = Math.round(newX / gridStep) * gridStep;
          }

          // Clamp X to canvas bounds
          newX = Math.max(0, Math.min(newX, CANVAS_WIDTH - 40));

          // Clear stored Y AFTER we've used it for the final position
          if (!change.dragging && nodeId in dragStartYRef.current) {
            delete dragStartYRef.current[nodeId];
          }

          // Lock Y to original position
          return {
            ...change,
            position: { x: newX, y: lockedY },
          };
        }
        return change;
      });

      onNodesChange(processedChanges as NodeChange<TimelineNode>[]);
    },
    [nodes, gridSettings, axisConfig, onNodesChange]
  );

  // Handle node drag stop - update axis position
  const handleNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: TimelineNode) => {
      const axisPosition = Math.max(0, Math.min(1, node.position.x / CANVAS_WIDTH));

      if (node.data.type === "event") {
        updateNodeData(node.id, { axisPosition });
      } else if (node.data.type === "span") {
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
    (data: {
      label: string;
      description?: string;
      isSpan: boolean;
      duration?: number;
      dateLabel?: string;
    }) => {
      const track = tracks[0];
      if (!track) return;

      const axisPosition = Math.max(0, Math.min(1, composerPosition.x / CANVAS_WIDTH));

      if (editingNodeId) {
        updateNodeData(editingNodeId, {
          label: data.label,
          description: data.description,
          dateLabel: data.dateLabel,
        });
      } else {
        if (data.isSpan && data.duration) {
          const endPosition = Math.min(1, axisPosition + data.duration / 100);
          addSpan(track.id, axisPosition, endPosition, data.label);
        } else {
          addEvent(
            track.id,
            axisPosition,
            data.label,
            composerAbove ? "above" : "below",
            data.dateLabel
          );
        }
      }

      setComposerOpen(false);
      setEditingNodeId(null);
      setIsCreatingSpan(false);
    },
    [tracks, composerPosition, composerAbove, editingNodeId, addEvent, addSpan, updateNodeData]
  );

  // Context menu handlers
  const handlePaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const track = tracks[0];

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
      setComposerAbove(flowPosition.y < TIMELINE_Y);
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
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
        selectNodesOnDrag={false}
        nodesDraggable={true}
        nodesConnectable={false}
      >
        {/* Central timeline line */}
        <TimelineLine canvasWidth={CANVAS_WIDTH} yPosition={TIMELINE_Y} />

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
            <span className="text-muted-foreground/70">Double-click to add event</span>
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
