import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type ReactFlowInstance,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useTimelineStore } from "../timelineStore";
import type { TimelineNode, TimelineEdge, TimelineTrack } from "../types";
import { timelineNodeTypes } from "../nodeTypes";
import { AxisRenderer } from "./AxisRenderer";
import { TrackLanes } from "./TrackLanes";

// Constants for layout
const TRACK_HEIGHT = 80;
const AXIS_WIDTH = 60;
const CANVAS_WIDTH = 1000;

interface TimelineCanvasProps {
  onNodeSelect?: (nodeId: string | undefined) => void;
}

export default function TimelineCanvas({ onNodeSelect }: TimelineCanvasProps) {
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
    selectedNodeId,
    setFlowInstance,
  } = useTimelineStore();

  // Handle node selection
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: TimelineNode) => {
      selectNode(node.id);
      onNodeSelect?.(node.id);
    },
    [selectNode, onNodeSelect]
  );

  // Handle pane click (deselect)
  const handlePaneClick = useCallback(() => {
    selectNode(undefined);
    onNodeSelect?.(undefined);
  }, [selectNode, onNodeSelect]);

  // Handle node changes with track/axis constraints
  const handleNodesChange = useCallback(
    (changes: NodeChange<TimelineNode>[]) => {
      // Process position changes to constrain to track lanes and axis
      const processedChanges = changes.map((change) => {
        if (change.type === "position" && change.position && change.dragging) {
          const node = nodes.find((n) => n.id === change.id);
          if (node) {
            const trackIndex = tracks.findIndex((t) => t.id === node.data.trackId);
            const trackY = 100 + trackIndex * TRACK_HEIGHT;

            // Snap to axis if enabled
            let newX = change.position.x;
            if (gridSettings.snapToAxis) {
              // Snap to axis grid (quantize position)
              const gridStep = CANVAS_WIDTH / (axisConfig.tickCount ?? 10);
              newX = Math.round(newX / gridStep) * gridStep;
            }

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

  // Initialize flow instance
  const handleInit = useCallback(
    (instance: ReactFlowInstance<TimelineNode, TimelineEdge>) => {
      setFlowInstance(instance);
    },
    [setFlowInstance]
  );

  // Calculate canvas height based on tracks
  const canvasHeight = useMemo(() => {
    return Math.max(400, 100 + tracks.length * TRACK_HEIGHT + 100);
  }, [tracks.length]);

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={timelineNodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onInit={handleInit}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
        selectNodesOnDrag={false}
      >
        {/* Track lanes background */}
        <TrackLanes tracks={tracks} trackHeight={TRACK_HEIGHT} />

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
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
