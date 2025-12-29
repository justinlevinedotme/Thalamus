/**
 * @file GraphCanvas.tsx
 * @description Main React Flow canvas component with nodes, edges, backgrounds, controls, spatial indexing, group management, and interaction handlers
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  useViewport,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type OnNodeDrag,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  type AppEdge,
  type AppNode,
  type EdgeMarkerSize,
  type EdgeMarkerType,
  getMarkerId,
  type NodeGroup,
  type NodeKind,
  type RelationshipData,
  useGraphStore,
} from "../../store/graphStore";
import { useEditorSettingsStore } from "../../store/editorSettingsStore";
import { useTheme } from "../../lib/theme";
import { nodeTypes } from "./nodeTypes";
import { getFocusSubgraph } from "../search/focus";
import CanvasContextMenu, { type ContextMenuState } from "./CanvasContextMenu";
import { useHelperLines, HelperLinesRenderer } from "./helperLines";
import { ThalamusLogoIcon } from "../../components/ThalamusLogo";

// Spatial hash for O(1) proximity lookup - divides space into grid cells
const CELL_SIZE = 100; // pixels per cell

type SpatialIndex = {
  cells: Map<string, Set<string>>; // cell key -> node IDs
  nodePositions: Map<string, { x: number; y: number; width: number; height: number }>;
};

function buildSpatialIndex(nodes: Node[]): SpatialIndex {
  const cells = new Map<string, Set<string>>();
  const nodePositions = new Map<string, { x: number; y: number; width: number; height: number }>();

  for (const node of nodes) {
    const width = node.width ?? 144; // 12 × 12 for grid alignment
    const height = node.height ?? 48; // 12 × 4 for grid alignment
    nodePositions.set(node.id, { x: node.position.x, y: node.position.y, width, height });

    // Add node to all cells it overlaps
    const minCellX = Math.floor(node.position.x / CELL_SIZE);
    const maxCellX = Math.floor((node.position.x + width) / CELL_SIZE);
    const minCellY = Math.floor(node.position.y / CELL_SIZE);
    const maxCellY = Math.floor((node.position.y + height) / CELL_SIZE);

    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        const key = `${cx},${cy}`;
        if (!cells.has(key)) {
          cells.set(key, new Set());
        }
        cells.get(key)!.add(node.id);
      }
    }
  }

  return { cells, nodePositions };
}

function queryNearbyNodes(index: SpatialIndex, x: number, y: number, radius: number): string[] {
  const results = new Set<string>();
  const minCellX = Math.floor((x - radius) / CELL_SIZE);
  const maxCellX = Math.floor((x + radius) / CELL_SIZE);
  const minCellY = Math.floor((y - radius) / CELL_SIZE);
  const maxCellY = Math.floor((y + radius) / CELL_SIZE);

  for (let cx = minCellX; cx <= maxCellX; cx++) {
    for (let cy = minCellY; cy <= maxCellY; cy++) {
      const key = `${cx},${cy}`;
      const cellNodes = index.cells.get(key);
      if (cellNodes) {
        for (const nodeId of cellNodes) {
          results.add(nodeId);
        }
      }
    }
  }

  return Array.from(results);
}

// Custom marker definitions for circle and diamond
function CustomMarkerDefs({ edges }: { edges: Array<{ data?: RelationshipData }> }) {
  // Collect unique marker configurations needed - optimized to avoid JSON parse/stringify
  const markerConfigs = useMemo(() => {
    const configMap = new Map<
      string,
      { type: EdgeMarkerType; color: string; size: EdgeMarkerSize }
    >();

    for (const edge of edges) {
      const style = edge.data?.style;
      const color = style?.color ?? "#94A3B8";
      const size = style?.markerSize ?? "md";

      for (const markerType of [style?.markerStart, style?.markerEnd]) {
        if (markerType === "circle" || markerType === "diamond") {
          const key = `${markerType}-${color}-${size}`;
          if (!configMap.has(key)) {
            configMap.set(key, { type: markerType, color, size });
          }
        }
      }
    }

    return Array.from(configMap.values());
  }, [edges]);

  const sizeToValue = (size: EdgeMarkerSize): number => {
    switch (size) {
      case "xs":
        return 8;
      case "sm":
        return 15;
      case "lg":
        return 35;
      default:
        return 25;
    }
  };

  if (markerConfigs.length === 0) return null;

  return (
    <svg style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0 }}>
      <defs>
        {markerConfigs.map(({ type, color, size }) => {
          const id = getMarkerId(type, color, size);
          const markerSize = sizeToValue(size);

          if (type === "circle") {
            return (
              <marker
                key={id}
                id={id}
                markerWidth={markerSize}
                markerHeight={markerSize}
                viewBox={`0 0 ${markerSize} ${markerSize}`}
                refX={markerSize / 2}
                refY={markerSize / 2}
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <circle
                  cx={markerSize / 2}
                  cy={markerSize / 2}
                  r={markerSize / 2 - 1}
                  fill={color}
                />
              </marker>
            );
          }

          if (type === "diamond") {
            const half = markerSize / 2;
            return (
              <marker
                key={id}
                id={id}
                markerWidth={markerSize}
                markerHeight={markerSize}
                viewBox={`0 0 ${markerSize} ${markerSize}`}
                refX={half}
                refY={half}
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${half} 0 L ${markerSize} ${half} L ${half} ${markerSize} L 0 ${half} Z`}
                  fill={color}
                />
              </marker>
            );
          }

          return null;
        })}
      </defs>
    </svg>
  );
}

// Component to render group backgrounds - must be inside ReactFlow
function GroupBackgrounds({ groups, nodes }: { groups: NodeGroup[]; nodes: AppNode[] }) {
  const { x, y, zoom } = useViewport();

  // Only show groups that have at least one selected node
  const activeGroupIds = useMemo(() => {
    const ids = new Set<string>();
    for (const node of nodes) {
      if (node.selected && node.data?.groupId) {
        ids.add(node.data.groupId);
      }
    }
    return ids;
  }, [nodes]);

  const groupBounds = useMemo(() => {
    const bounds: Record<string, { minX: number; minY: number; maxX: number; maxY: number }> = {};

    for (const node of nodes) {
      const groupId = node.data?.groupId;
      if (!groupId || !activeGroupIds.has(groupId)) continue;

      const nodeWidth = node.width ?? 144;
      const nodeHeight = node.height ?? 48;
      const x1 = node.position.x;
      const y1 = node.position.y;
      const x2 = x1 + nodeWidth;
      const y2 = y1 + nodeHeight;

      if (!bounds[groupId]) {
        bounds[groupId] = { minX: x1, minY: y1, maxX: x2, maxY: y2 };
      } else {
        bounds[groupId].minX = Math.min(bounds[groupId].minX, x1);
        bounds[groupId].minY = Math.min(bounds[groupId].minY, y1);
        bounds[groupId].maxX = Math.max(bounds[groupId].maxX, x2);
        bounds[groupId].maxY = Math.max(bounds[groupId].maxY, y2);
      }
    }

    return bounds;
  }, [nodes, activeGroupIds]);

  const padding = 16;

  // Fuschia/pink accent colors for group highlight
  const strokeColor = "#D946EF"; // fuschia-500
  const backgroundColor = "rgba(217, 70, 239, 0.05)"; // very light fuschia
  const labelColor = "#A21CAF"; // fuschia-700

  if (activeGroupIds.size === 0) return null;

  const visibleGroups = groups.filter((g) => activeGroupIds.has(g.id));

  return (
    <Panel position="top-left" className="!pointer-events-none !m-0 !p-0">
      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{
          transform: `translate(${x}px, ${y}px) scale(${zoom})`,
        }}
      >
        {visibleGroups.map((group) => {
          const bound = groupBounds[group.id];
          if (!bound) return null;

          return (
            <div
              key={group.id}
              className="pointer-events-none absolute rounded-xl border-2 border-dashed"
              style={{
                left: bound.minX - padding,
                top: bound.minY - padding,
                width: bound.maxX - bound.minX + padding * 2,
                height: bound.maxY - bound.minY + padding * 2,
                backgroundColor,
                borderColor: strokeColor,
              }}
            >
              <span
                className="absolute -top-5 left-2 whitespace-nowrap text-xs font-medium"
                style={{ color: labelColor }}
              >
                {group.label}
              </span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export default function GraphCanvas() {
  const {
    nodes,
    edges,
    groups,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectEdge,
    selectNode,
    selectedNodeId,
    selectedEdgeId,
    editingNodeId,
    stopEditingNode,
    addNode,
    setFlowInstance,
    undo,
    redo,
    isFocusMode,
    focusNodeId,
    connectNodes,
    reconnectEdge,
    deleteSelectedNodes,
    gridSettings,
  } = useGraphStore();
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<
    AppNode,
    AppEdge
  > | null>(null);
  const lastCenteredNodeId = useRef<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const { helperLines, applyHelperLines, resetHelperLines } = useHelperLines<AppNode>();

  // Track group dragging state
  const groupDragRef = useRef<{
    groupId: string;
    draggedNodeId: string;
    initialPositions: Map<string, { x: number; y: number }>;
  } | null>(null);
  const { helperLinesEnabled, connectionSuggestionsEnabled } = useEditorSettingsStore();
  const { resolvedTheme } = useTheme();
  const [proximityTarget, setProximityTarget] = useState<{
    sourceNodeId: string;
    targetNodeId: string;
    sourceHandlePosition: { x: number; y: number };
    targetHandlePosition: { x: number; y: number };
  } | null>(null);
  const PROXIMITY_THRESHOLD = 80;

  // Spatial index for O(1) proximity lookups - rebuild when nodes change
  const spatialIndex = useMemo(() => buildSpatialIndex(nodes), [nodes]);

  // Edge lookup set for O(1) edge existence checks
  const edgeLookup = useMemo(() => {
    const lookup = new Set<string>();
    for (const edge of edges) {
      lookup.add(`${edge.source}-${edge.target}`);
      lookup.add(`${edge.target}-${edge.source}`);
    }
    return lookup;
  }, [edges]);

  const handleInit = useCallback(
    (instance: ReactFlowInstance<AppNode, AppEdge>) => {
      setReactFlowInstance(instance);
      setFlowInstance(instance);
    },
    [setFlowInstance]
  );

  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: AppEdge) => {
      selectEdge(edge.id);
      selectNode(undefined);
    },
    [selectEdge, selectNode]
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: AppNode) => {
      // Group selection is now handled in handleNodesChange for proper timing
      // This handler just updates our store's selectedNodeId for the inspector
      selectNode(node.id);
      selectEdge(undefined);
    },
    [selectEdge, selectNode]
  );

  const handlePaneClick = useCallback(
    (_event: MouseEvent | React.MouseEvent) => {
      selectEdge(undefined);
      selectNode(undefined);
      stopEditingNode();
      setContextMenu(null);
    },
    [selectEdge, selectNode, stopEditingNode]
  );

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: AppNode) => {
      event.preventDefault();
      // Check if multiple nodes are selected
      const selectedNodes = nodes.filter((n) => n.selected);
      if (selectedNodes.length > 1 && node.selected) {
        // Show selection context menu for multi-selection
        setContextMenu({
          type: "selection",
          position: { x: event.clientX, y: event.clientY },
        });
      } else {
        // Show single node context menu
        setContextMenu({
          type: "node",
          nodeId: node.id,
          position: { x: event.clientX, y: event.clientY },
        });
      }
    },
    [nodes]
  );

  const handleEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    setContextMenu({
      type: "edge",
      edgeId: edge.id,
      position: { x: event.clientX, y: event.clientY },
    });
  }, []);

  const handlePaneContextMenu = useCallback((event: MouseEvent | React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      type: "pane",
      position: { x: event.clientX, y: event.clientY },
    });
  }, []);

  const handleSelectionContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      type: "selection",
      position: { x: event.clientX, y: event.clientY },
    });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const focusedSubgraph = useMemo(
    () => (isFocusMode ? getFocusSubgraph(nodes, edges, focusNodeId) : { nodes, edges }),
    [edges, focusNodeId, isFocusMode, nodes]
  );

  const displayNodes = useMemo(
    (): AppNode[] =>
      focusedSubgraph.nodes.map((node) => ({
        ...node,
        type: node.type ?? "editable",
        data: {
          ...node.data, // Preserve all data including layout for composed nodes
          label: node.data?.label ?? "Untitled",
          body: node.data?.body,
          kind: (node.data?.kind ?? "idea") as NodeKind,
          style: node.data?.style,
          sourceHandles: node.data?.sourceHandles,
          targetHandles: node.data?.targetHandles,
          groupId: node.data?.groupId,
        },
        // Let React Flow manage selection state natively for multi-select support
      })),
    [focusedSubgraph.nodes]
  );

  // Default edge color based on theme
  const defaultEdgeColor = resolvedTheme === "dark" ? "#6b7280" : "#94A3B8";

  const displayEdges = useMemo(
    (): AppEdge[] =>
      focusedSubgraph.edges.map((edge) => {
        const isSelected = edge.id === selectedEdgeId;
        const baseColor = edge.data?.style?.color ?? defaultEdgeColor;
        const baseThickness = edge.data?.style?.thickness ?? 2;
        const lineStyle = edge.data?.style?.lineStyle ?? "solid";
        const labelStyle = edge.data?.style?.labelStyle;

        return {
          ...edge,
          style: {
            stroke: baseColor,
            strokeWidth: isSelected ? baseThickness + 2 : baseThickness,
            strokeDasharray: lineStyle === "dashed" ? "8 4" : undefined,
            filter: isSelected ? "drop-shadow(0 0 3px rgba(100, 116, 139, 0.5))" : undefined,
          },
          // Explicitly pass through marker properties
          markerStart: edge.markerStart,
          markerEnd: edge.markerEnd,
          labelStyle: labelStyle
            ? {
                fill: labelStyle.textColor,
                fontWeight: 500,
              }
            : undefined,
          labelBgStyle: labelStyle
            ? {
                fill: labelStyle.backgroundColor,
                stroke: labelStyle.showBorder ? labelStyle.borderColor : "transparent",
                strokeWidth: labelStyle.showBorder ? 1 : 0,
              }
            : undefined,
          labelBgPadding: [6, 4] as [number, number],
          labelBgBorderRadius: 4,
          className: isSelected ? "react-flow__edge-selected" : undefined,
          type: edge.data?.style?.curvature
            ? edge.data.style.curvature === "bezier"
              ? "default"
              : edge.data.style.curvature
            : edge.type,
          data: {
            relationType: edge.data?.relationType ?? "related",
            direction: edge.data?.direction ?? "forward",
            style: edge.data?.style,
          },
        };
      }),
    [focusedSubgraph.edges, selectedEdgeId, defaultEdgeColor]
  );

  useEffect(() => {
    if (!reactFlowInstance) {
      return;
    }
    if (!selectedNodeId) {
      lastCenteredNodeId.current = null;
      return;
    }
    if (lastCenteredNodeId.current === selectedNodeId) {
      return;
    }
    const selectedNode = nodes.find((node) => node.id === selectedNodeId);
    if (!selectedNode) {
      return;
    }
    reactFlowInstance.fitView({
      nodes: [selectedNode],
      duration: 300,
      padding: 0.4,
    });
    lastCenteredNodeId.current = selectedNodeId;
  }, [nodes, reactFlowInstance, selectedNodeId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (editingNodeId) {
        return;
      }
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) {
          return;
        }
      }

      // Handle delete key - delete all selected nodes
      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        deleteSelectedNodes();
        return;
      }

      // Handle undo/redo
      if (!event.metaKey && !event.ctrlKey) {
        return;
      }
      if (event.key.toLowerCase() !== "z") {
        return;
      }
      event.preventDefault();
      if (event.shiftKey) {
        redo();
      } else {
        undo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelectedNodes, editingNodeId, redo, undo]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeKind = event.dataTransfer.getData("application/reactflow");
      if (!nodeKind || !reactFlowInstance) {
        return;
      }
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNode({ kind: nodeKind as NodeKind, position });
    },
    [addNode, reactFlowInstance]
  );

  // When a grouped node starts dragging, capture initial positions of all group members
  // and select all group nodes so the visual feedback is correct
  const handleNodeDragStart: OnNodeDrag<AppNode> = useCallback(
    (_event, draggedNode) => {
      const groupId = draggedNode.data?.groupId;
      if (!groupId) {
        groupDragRef.current = null;
        return;
      }

      // Find all nodes in this group
      const groupNodes = nodes.filter((n) => n.data?.groupId === groupId);
      if (groupNodes.length <= 1) {
        groupDragRef.current = null;
        return;
      }

      // Store initial positions
      const initialPositions = new Map<string, { x: number; y: number }>();
      for (const node of groupNodes) {
        initialPositions.set(node.id, { ...node.position });
      }

      groupDragRef.current = {
        groupId,
        draggedNodeId: draggedNode.id,
        initialPositions,
      };

      // Select all group nodes for visual feedback
      // This happens after drag starts, so it doesn't affect which nodes React Flow drags,
      // but it shows the user that all group nodes are selected
      const selectionChanges: NodeChange<AppNode>[] = nodes.map((node) => ({
        type: "select" as const,
        id: node.id,
        selected: node.data?.groupId === groupId,
      }));
      onNodesChange(selectionChanges);
    },
    [nodes, onNodesChange]
  );

  const handleNodeDrag: OnNodeDrag<AppNode> = useCallback(
    (_event, draggedNode) => {
      // Handle group dragging - move all group members together
      if (groupDragRef.current && groupDragRef.current.draggedNodeId === draggedNode.id) {
        const { initialPositions, draggedNodeId } = groupDragRef.current;
        const draggedInitialPos = initialPositions.get(draggedNodeId);

        if (draggedInitialPos) {
          // Calculate the delta from the initial position
          const deltaX = draggedNode.position.x - draggedInitialPos.x;
          const deltaY = draggedNode.position.y - draggedInitialPos.y;

          // Apply delta to all other group nodes
          const positionChanges: NodeChange<AppNode>[] = [];
          for (const [nodeId, initialPos] of initialPositions) {
            if (nodeId !== draggedNodeId) {
              positionChanges.push({
                type: "position",
                id: nodeId,
                position: {
                  x: initialPos.x + deltaX,
                  y: initialPos.y + deltaY,
                },
                dragging: true,
              });
            }
          }

          if (positionChanges.length > 0) {
            onNodesChange(positionChanges);
          }
        }
      }

      if (!connectionSuggestionsEnabled || !reactFlowInstance) {
        return;
      }

      // Get internal node from React Flow which has actual handleBounds
      const draggedInternalNode = reactFlowInstance.getInternalNode(draggedNode.id);
      if (!draggedInternalNode) return;

      // Get actual target handle positions from handleBounds (left side of dragged node)
      const draggedTargetBounds = draggedInternalNode.internals.handleBounds?.target ?? [];
      const draggedTargetPositions = draggedTargetBounds.map((handle) => ({
        x: draggedNode.position.x + handle.x + handle.width / 2,
        y: draggedNode.position.y + handle.y + handle.height / 2,
      }));

      // Fallback if no handle bounds yet (node just created)
      if (draggedTargetPositions.length === 0) {
        const draggedHeight = draggedNode.height ?? 48;
        const draggedTargetHandles = draggedNode.data?.targetHandles ?? [{ id: "target" }];
        draggedTargetHandles.forEach((_: unknown, index: number) => {
          draggedTargetPositions.push({
            x: draggedNode.position.x,
            y:
              draggedNode.position.y +
              ((index + 1) / (draggedTargetHandles.length + 1)) * draggedHeight,
          });
        });
      }

      let closestMatch: {
        sourceNodeId: string;
        sourceHandlePos: { x: number; y: number };
        targetHandlePos: { x: number; y: number };
        distance: number;
      } | null = null;

      // Use spatial index to only check nearby nodes - O(1) instead of O(n)
      const nearbyNodeIds = queryNearbyNodes(
        spatialIndex,
        draggedNode.position.x,
        draggedNode.position.y,
        PROXIMITY_THRESHOLD + 200 // Add buffer for node width
      );

      for (const nodeId of nearbyNodeIds) {
        if (nodeId === draggedNode.id) {
          continue;
        }

        // O(1) edge existence check using lookup set
        if (edgeLookup.has(`${nodeId}-${draggedNode.id}`)) {
          continue;
        }

        const node = nodes.find((n) => n.id === nodeId);
        if (!node) continue;

        // Get actual source handle positions from handleBounds (right side)
        const internalNode = reactFlowInstance.getInternalNode(nodeId);
        const sourceBounds = internalNode?.internals.handleBounds?.source ?? [];

        let sourcePositions: { x: number; y: number }[];
        if (sourceBounds.length > 0) {
          // Use actual handle bounds from React Flow
          sourcePositions = sourceBounds.map((handle) => ({
            x: node.position.x + handle.x + handle.width / 2,
            y: node.position.y + handle.y + handle.height / 2,
          }));
        } else {
          // Fallback to calculated positions
          const nodeWidth = node.width ?? 144;
          const nodeHeight = node.height ?? 48;
          const sourceHandles = node.data?.sourceHandles ?? [{ id: "source" }];
          sourcePositions = sourceHandles.map((_, index) => ({
            x: node.position.x + nodeWidth,
            y: node.position.y + ((index + 1) / (sourceHandles.length + 1)) * nodeHeight,
          }));
        }

        // Find the closest source handle to any of the dragged node's target handles
        for (const sourcePos of sourcePositions) {
          for (const targetPos of draggedTargetPositions) {
            const distance = Math.sqrt(
              Math.pow(sourcePos.x - targetPos.x, 2) + Math.pow(sourcePos.y - targetPos.y, 2)
            );
            if (
              distance < PROXIMITY_THRESHOLD &&
              (!closestMatch || distance < closestMatch.distance)
            ) {
              closestMatch = {
                sourceNodeId: nodeId,
                sourceHandlePos: sourcePos,
                targetHandlePos: targetPos,
                distance,
              };
            }
          }
        }
      }

      if (closestMatch) {
        setProximityTarget({
          sourceNodeId: closestMatch.sourceNodeId,
          targetNodeId: draggedNode.id,
          sourceHandlePosition: closestMatch.sourceHandlePos,
          targetHandlePosition: closestMatch.targetHandlePos,
        });
      } else {
        setProximityTarget(null);
      }
    },
    [
      connectionSuggestionsEnabled,
      reactFlowInstance,
      nodes,
      spatialIndex,
      edgeLookup,
      PROXIMITY_THRESHOLD,
      onNodesChange,
    ]
  );

  const handleNodeDragStop: OnNodeDrag<AppNode> = useCallback(
    (_event, _node) => {
      // Clear group drag state
      groupDragRef.current = null;

      if (proximityTarget) {
        connectNodes(proximityTarget.sourceNodeId, proximityTarget.targetNodeId);
        setProximityTarget(null);
      }
      resetHelperLines();
    },
    [connectNodes, proximityTarget, resetHelperLines]
  );

  // Wrap onNodesChange to apply helper lines snapping and group selection
  const handleNodesChange = useCallback(
    (changes: NodeChange<AppNode>[]) => {
      let modifiedChanges: NodeChange<AppNode>[] = changes;

      // Check for selection changes that involve grouped nodes
      // When a grouped node is selected (without shift), select all nodes in the group
      const selectionChanges = changes.filter(
        (c): c is NodeChange & { type: "select"; selected: boolean } => c.type === "select"
      );

      if (selectionChanges.length > 0) {
        // Find nodes being selected (not deselected)
        const nodesBeingSelected = selectionChanges.filter((c) => c.selected);

        if (nodesBeingSelected.length === 1) {
          // Single node selection - check if it's part of a group
          const selectedNodeId = nodesBeingSelected[0].id;
          const selectedNode = nodes.find((n) => n.id === selectedNodeId);
          const groupId = selectedNode?.data?.groupId;

          if (groupId) {
            // Get all nodes in this group
            const groupNodeIds = nodes.filter((n) => n.data?.groupId === groupId).map((n) => n.id);

            // Check if we're deselecting other nodes (single click behavior)
            const nodesBeingDeselected = selectionChanges.filter((c) => !c.selected);
            const isRegularClick = nodesBeingDeselected.length > 0;

            if (isRegularClick) {
              // Add selection changes for all group nodes
              const additionalSelections: NodeChange<AppNode>[] = groupNodeIds
                .filter((id) => id !== selectedNodeId)
                .map((id) => ({
                  type: "select" as const,
                  id,
                  selected: true,
                }));

              // Remove deselection changes for group nodes
              modifiedChanges = changes.filter((c) => {
                if (c.type === "select" && !c.selected) {
                  return !groupNodeIds.includes(c.id);
                }
                return true;
              });

              modifiedChanges = [...modifiedChanges, ...additionalSelections];
            }
          }
        }
      }

      // Apply helper lines snapping, but skip if we're dragging a group
      // (group nodes should move together without individual snapping)
      if (helperLinesEnabled && !groupDragRef.current) {
        modifiedChanges = applyHelperLines(modifiedChanges, nodes);
      }

      onNodesChange(modifiedChanges);
    },
    [applyHelperLines, helperLinesEnabled, nodes, onNodesChange]
  );

  const handleReconnect = useCallback(
    (oldEdge: Edge<RelationshipData>, newConnection: Connection) => {
      reconnectEdge(oldEdge, newConnection);
    },
    [reconnectEdge]
  );

  return (
    <div className="h-full w-full" id="graph-canvas">
      <CustomMarkerDefs edges={edges} />
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={handleReconnect}
        onEdgeClick={handleEdgeClick}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onNodeContextMenu={handleNodeContextMenu}
        onEdgeContextMenu={handleEdgeContextMenu}
        onPaneContextMenu={handlePaneContextMenu}
        onSelectionContextMenu={handleSelectionContextMenu}
        onInit={handleInit}
        nodeTypes={nodeTypes}
        selectionOnDrag
        multiSelectionKeyCode={editingNodeId ? null : "Shift"}
        deleteKeyCode={null}
        selectionKeyCode={editingNodeId ? null : "Shift"}
        panActivationKeyCode={editingNodeId ? null : "Space"}
        disableKeyboardA11y={!!editingNodeId}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onNodeDragStart={handleNodeDragStart}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        panOnScroll
        zoomOnScroll
        minZoom={0.2}
        maxZoom={2}
        fitView
        colorMode={resolvedTheme}
        proOptions={{ hideAttribution: true }}
        snapToGrid={gridSettings.snapEnabled}
        snapGrid={[gridSettings.gridSize, gridSettings.gridSize]}
        defaultEdgeOptions={{ zIndex: 0 }}
        elevateNodesOnSelect={false}
      >
        {gridSettings.gridVisible && <Background gap={gridSettings.gridSize} size={1} />}
        <GroupBackgrounds groups={groups} nodes={nodes} />
        <Controls showInteractive={false} />
        {helperLinesEnabled && <HelperLinesRenderer helperLines={helperLines} />}
      </ReactFlow>
      {/* Proximity Connect Indicator */}
      {proximityTarget &&
        reactFlowInstance &&
        (() => {
          const sourceScreen = reactFlowInstance.flowToScreenPosition(
            proximityTarget.sourceHandlePosition
          );
          const targetScreen = reactFlowInstance.flowToScreenPosition(
            proximityTarget.targetHandlePosition
          );
          const canvasBounds = document.getElementById("graph-canvas")?.getBoundingClientRect();
          if (!canvasBounds) return null;
          const x1 = sourceScreen.x - canvasBounds.left;
          const y1 = sourceScreen.y - canvasBounds.top;
          const x2 = targetScreen.x - canvasBounds.left;
          const y2 = targetScreen.y - canvasBounds.top;
          return (
            <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible">
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#3B82F6"
                strokeWidth={2}
                strokeDasharray="6 4"
              />
              {/* Highlight at source handle */}
              <circle cx={x1} cy={y1} r={8} fill="#3B82F6" opacity={0.2} />
              <circle cx={x1} cy={y1} r={4} fill="#3B82F6" opacity={0.6} />
              {/* Highlight at target handle */}
              <circle cx={x2} cy={y2} r={8} fill="#3B82F6" opacity={0.2} />
              <circle cx={x2} cy={y2} r={4} fill="#3B82F6" opacity={0.6} />
            </svg>
          );
        })()}
      {/* Custom attribution */}
      <div className="absolute bottom-2 right-2 z-10 flex flex-col items-end gap-0.5">
        <span className="text-xs font-medium text-muted-foreground">Thalamus</span>
        <a
          href="https://reactflow.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground/70 transition hover:text-foreground"
        >
          Powered by React Flow
        </a>
      </div>
      {/* Context Menu */}
      <CanvasContextMenu menu={contextMenu} onClose={handleCloseContextMenu} />
    </div>
  );
}
