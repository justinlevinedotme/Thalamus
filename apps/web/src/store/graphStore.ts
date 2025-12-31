/**
 * @file graphStore.ts
 * @description Central Zustand store for the graph editor. Manages all graph state including
 * nodes, edges, selection, node groups, and undo/redo history. Provides actions for node
 * manipulation, edge connections, layout operations, and persistence.
 */

import { create } from "zustand";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type ReactFlowInstance,
} from "@xyflow/react";

import { getLayoutedElements, type LayoutOptions } from "../lib/autoLayout";

export type RelationshipDirection = "forward" | "backward" | "both" | "none";
export type RelationshipType = "causes" | "supports" | "contradicts" | "related";
export type NodeKind =
  | "idea"
  | "question"
  | "evidence"
  | "goal"
  | "text"
  | "shape"
  | "pathKey"
  | "nodeKey"
  | "composed";

export type NodeShape = "rounded" | "pill" | "circle" | "square";
export type NodeSize = "sm" | "md" | "lg";

export type NodeHandle = {
  id: string;
};

export type EdgePadding = "none" | "sm" | "md" | "lg";

// Grid settings for snap-to-grid and grid visibility
export type GridSize = 12 | 24 | 36 | 48;
export type GridStyle = "dots" | "lines";

export type GridSettings = {
  snapEnabled: boolean;
  gridVisible: boolean;
  gridSize: GridSize;
  gridStyle: GridStyle;
};

export type NodeIcon =
  | { type: "emoji"; value: string }
  | { type: "lucide"; value: string }
  | { type: "simple"; value: string };

export type NodeGroup = {
  id: string;
  label: string;
  color: string;
};

export type NodeBorderStyle = "solid" | "dashed" | "dotted";

export type NodeStyle = {
  color: string;
  shape: NodeShape;
  size: NodeSize;
  edgePadding?: EdgePadding;
  textColor?: string;
  bodyTextColor?: string;
  icon?: NodeIcon;
  iconColor?: string;
  separatorColor?: string; // For key nodes separator line
  // Border properties
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: NodeBorderStyle;
};

export type EdgeCurvature = "bezier" | "smoothstep" | "straight";
export type EdgeLineStyle = "solid" | "dashed";
export type EdgeMarkerType = "arrow" | "arrowclosed" | "circle" | "diamond" | "none";
export type EdgeMarkerSize = "xs" | "sm" | "md" | "lg";

export type EdgeLabelStyle = {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  showBorder: boolean;
};

export type ControlPoint = {
  x: number;
  y: number;
};

export type EdgeStyle = {
  color: string;
  thickness: number;
  curvature: EdgeCurvature;
  lineStyle: EdgeLineStyle;
  labelStyle?: EdgeLabelStyle;
  controlPoints?: ControlPoint[];
  markerStart?: EdgeMarkerType;
  markerEnd?: EdgeMarkerType;
  markerSize?: EdgeMarkerSize;
};

export type RelationshipData = {
  relationType?: RelationshipType;
  direction?: RelationshipDirection;
  style?: EdgeStyle;
};

// Node data type - extends Record<string, unknown> for v12 compatibility
export type GraphNodeData = {
  label: string;
  body?: string;
  kind: NodeKind;
  style?: NodeStyle;
  sourceHandles?: NodeHandle[];
  targetHandles?: NodeHandle[];
  groupId?: string;
  [key: string]: unknown; // Index signature for v12 compatibility
};

// App-wide node type for React Flow v12
export type AppNode = Node<GraphNodeData>;

// Edge type alias for app
export type AppEdge = Edge<RelationshipData>;

type GraphSnapshot = {
  nodes: AppNode[];
  edges: AppEdge[];
  groups: NodeGroup[];
  gridSettings: GridSettings;
};

type GraphState = {
  nodes: AppNode[];
  edges: AppEdge[];
  groups: NodeGroup[];
  gridSettings: GridSettings;
  graphTitle: string;
  selectedEdgeId?: string;
  selectedNodeId?: string;
  editingNodeId?: string;
  flowInstance: ReactFlowInstance<AppNode, AppEdge> | null;
  isFocusMode: boolean;
  focusNodeId?: string;
  historyPast: GraphSnapshot[];
  historyFuture: GraphSnapshot[];
  canUndo: boolean;
  canRedo: boolean;
  // Version counter for efficient dirty detection - increments on every data change
  dataVersion: number;
  setNodes: (nodes: AppNode[]) => void;
  setEdges: (edges: AppEdge[]) => void;
  onNodesChange: (changes: NodeChange<AppNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<AppEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  setGraphTitle: (title: string) => void;
  selectEdge: (edgeId?: string) => void;
  selectNode: (nodeId?: string) => void;
  startEditingNode: (nodeId: string) => void;
  stopEditingNode: () => void;
  setFlowInstance: (instance: ReactFlowInstance<AppNode, AppEdge> | null) => void;
  setFocusNode: (nodeId?: string) => void;
  clearFocus: () => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateNodeBody: (nodeId: string, body: string) => void;
  updateNodeStyle: (nodeId: string, style: Partial<NodeStyle>) => void;
  updateNodeHandles: (nodeId: string, sourceCount: number, targetCount: number) => void;
  updateNodeLayout: (nodeId: string, layout: unknown) => void;
  setNodeKind: (nodeId: string, kind: NodeKind) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
  updateEdgeData: (edgeId: string, data: Partial<RelationshipData>) => void;
  updateEdgeStyle: (edgeId: string, style: Partial<EdgeStyle>) => void;
  addNode: (input?: {
    position?: { x: number; y: number };
    label?: string;
    kind?: NodeKind;
    layout?: unknown; // ComposedNodeLayout for composed nodes
  }) => void;
  addNodeAtCenter: (kind?: NodeKind) => void;
  duplicateNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  reconnectEdge: (oldEdge: AppEdge, newConnection: Connection) => void;
  connectNodes: (sourceId: string, targetId: string) => void;
  updateAllNodeStyles: (style: Partial<NodeStyle>) => void;
  updateAllEdgeStyles: (style: Partial<EdgeStyle>) => void;
  updateSelectedNodesStyle: (style: Partial<NodeStyle>) => void;
  deleteSelectedNodes: () => void;
  updateEdgeControlPoints: (edgeId: string, controlPoints: ControlPoint[]) => void;
  clearAllEdgeLabels: () => void;
  autoLayout: (options?: LayoutOptions) => Promise<void>;
  groupSelectedNodes: () => void;
  ungroupNodes: (groupId: string) => void;
  setGroups: (groups: NodeGroup[]) => void;
  setGridSettings: (settings: Partial<GridSettings>) => void;
  snapAllNodesToGrid: () => void;
  distributeNodesHorizontally: () => void;
  distributeNodesVertically: () => void;
  alignNodesLeft: () => void;
  alignNodesRight: () => void;
  alignNodesCenter: () => void;
  alignNodesTop: () => void;
  alignNodesBottom: () => void;
  alignNodesMiddle: () => void;
  sendNodeToFront: (nodeId: string) => void;
  sendNodeToBack: (nodeId: string) => void;
  selectGroupNodes: (groupId: string) => void;
  undo: () => void;
  redo: () => void;
  copySelectedNodes: () => void;
  cutSelectedNodes: () => void;
  pasteNodes: () => void;
  getSelectedGroupId: () => string | undefined;
};

// Default text color for nodes (dark gray for readability on light backgrounds)
const DEFAULT_NODE_TEXT_COLOR = "#1f2937"; // gray-800

const nodeStyleDefaults: Record<NodeKind, NodeStyle> = {
  idea: { color: "#E2E8F0", shape: "rounded", size: "md", textColor: DEFAULT_NODE_TEXT_COLOR },
  question: { color: "#FDE68A", shape: "circle", size: "md", textColor: DEFAULT_NODE_TEXT_COLOR },
  evidence: { color: "#BBF7D0", shape: "rounded", size: "sm", textColor: DEFAULT_NODE_TEXT_COLOR },
  goal: { color: "#BFDBFE", shape: "pill", size: "lg", textColor: DEFAULT_NODE_TEXT_COLOR },
  text: { color: "transparent", shape: "rounded", size: "md" }, // text nodes inherit color
  shape: {
    color: "#DBEAFE",
    shape: "rounded",
    size: "lg",
    borderColor: "#3B82F6",
    borderWidth: 2,
    borderStyle: "solid",
    textColor: DEFAULT_NODE_TEXT_COLOR,
  },
  pathKey: {
    color: "#FFFFFF",
    shape: "rounded",
    size: "md",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderStyle: "solid",
    textColor: DEFAULT_NODE_TEXT_COLOR,
  },
  nodeKey: {
    color: "#FFFFFF",
    shape: "rounded",
    size: "md",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderStyle: "solid",
    textColor: DEFAULT_NODE_TEXT_COLOR,
  },
  composed: {
    color: "#FFFFFF",
    shape: "rounded",
    size: "md",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderStyle: "solid",
    textColor: DEFAULT_NODE_TEXT_COLOR,
  },
};

const defaultEdgeStyle: EdgeStyle = {
  color: "#94A3B8",
  thickness: 2,
  curvature: "smoothstep",
  lineStyle: "solid",
};

const defaultEdgeData: RelationshipData = {
  relationType: "related",
  direction: "forward",
  style: defaultEdgeStyle,
};

const MAX_HISTORY_SIZE = 50;

// Default grid settings
const defaultGridSettings: GridSettings = {
  snapEnabled: false,
  gridVisible: true,
  gridSize: 24,
  gridStyle: "lines",
};

// Shallow clone for performance - avoid structuredClone overhead
const cloneGraph = (
  nodes: Node<GraphNodeData>[],
  edges: Edge<RelationshipData>[],
  groups: NodeGroup[],
  gridSettings: GridSettings
): GraphSnapshot => ({
  nodes: nodes.map((n) => ({
    ...n,
    data: { ...n.data, style: n.data.style ? { ...n.data.style } : undefined },
    position: { ...n.position },
  })),
  edges: edges.map((e) => ({
    ...e,
    data: e.data
      ? {
          ...e.data,
          style: e.data.style ? { ...e.data.style } : undefined,
        }
      : undefined,
  })),
  groups: groups.map((g) => ({ ...g })),
  gridSettings: { ...gridSettings },
});

const getNodeType = (kind: NodeKind): string => {
  switch (kind) {
    case "text":
      return "text";
    case "shape":
      return "shape";
    case "pathKey":
      return "pathKey";
    case "nodeKey":
      return "nodeKey";
    case "composed":
      return "composed";
    default:
      return "editable";
  }
};

const normalizeNodes = (nodes: Node<GraphNodeData>[]) =>
  nodes.map((node) => {
    const kind = node.data?.kind ?? "idea";
    // Map kind to React Flow node type
    const nodeType = node.type ?? getNodeType(kind);
    return {
      ...node,
      type: nodeType,
      data: {
        ...node.data, // Preserve all existing data including layout
        label: node.data?.label ?? "Untitled",
        body: node.data?.body,
        kind,
        style: node.data?.style ?? nodeStyleDefaults[kind],
        sourceHandles: node.data?.sourceHandles,
        targetHandles: node.data?.targetHandles,
        groupId: node.data?.groupId,
      },
    };
  });

const normalizeEdges = (edges: Edge<RelationshipData>[]) =>
  edges.map((edge) => {
    const mergedStyle = {
      ...defaultEdgeStyle,
      ...edge.data?.style,
    };
    const mergedData = {
      relationType: edge.data?.relationType ?? "related",
      direction: edge.data?.direction ?? "forward",
      style: mergedStyle,
    };
    return {
      ...edge,
      data: mergedData,
      ...markerForDirection(mergedData.direction, mergedStyle.color, mergedStyle),
    };
  });

// Track version for dirty detection - incremented when setHistoryWithVersion is used
let currentDataVersion = 0;

const setHistory = (past: GraphSnapshot[], future: GraphSnapshot[]) => ({
  historyPast: past.length > MAX_HISTORY_SIZE ? past.slice(-MAX_HISTORY_SIZE) : past,
  historyFuture: future.length > MAX_HISTORY_SIZE ? future.slice(0, MAX_HISTORY_SIZE) : future,
  canUndo: past.length > 0,
  canRedo: future.length > 0,
  dataVersion: ++currentDataVersion,
});

const shouldCommitNodeChanges = (changes: NodeChange[]) =>
  changes.some((change) => {
    if (change.type === "select") {
      return false;
    }
    if (change.type === "position") {
      return !change.dragging;
    }
    return true;
  });

const shouldCommitEdgeChanges = (changes: EdgeChange[]) =>
  changes.some((change) => change.type !== "select");

type MarkerConfig =
  | { type: MarkerType; color?: string; width?: number; height?: number }
  | string
  | undefined;

const markerSizeToScale = (size: EdgeMarkerSize): number => {
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

// Generate a unique marker ID based on type, color and size
export const getMarkerId = (
  markerType: EdgeMarkerType,
  color: string,
  size: EdgeMarkerSize
): string => {
  // Encode color to be URL-safe (remove #)
  const colorId = color.replace("#", "");
  return `marker-${markerType}-${colorId}-${size}`;
};

const markerForDirection = (
  direction: RelationshipDirection,
  color: string,
  style?: EdgeStyle
): {
  markerStart?: MarkerConfig;
  markerEnd?: MarkerConfig;
} => {
  const markerSize = markerSizeToScale(style?.markerSize ?? "md");
  const size = style?.markerSize ?? "md";

  // Get custom marker types from style, with fallbacks based on direction
  const getStartMarkerType = (): EdgeMarkerType | undefined => {
    if (style?.markerStart) {
      return style.markerStart === "none" ? undefined : style.markerStart;
    }
    // Default behavior based on direction
    if (direction === "backward" || direction === "both") {
      return "arrowclosed";
    }
    return undefined;
  };

  const getEndMarkerType = (): EdgeMarkerType | undefined => {
    if (style?.markerEnd) {
      return style.markerEnd === "none" ? undefined : style.markerEnd;
    }
    // Default behavior based on direction
    if (direction === "forward" || direction === "both") {
      return "arrowclosed";
    }
    return undefined;
  };

  if (direction === "none" && !style?.markerStart && !style?.markerEnd) {
    return { markerStart: undefined, markerEnd: undefined };
  }

  const startType = getStartMarkerType();
  const endType = getEndMarkerType();

  // For built-in arrow types, use React Flow's MarkerType
  // For custom types (circle, diamond), use custom marker IDs
  const getMarkerConfig = (type: EdgeMarkerType | undefined): MarkerConfig => {
    if (!type) return undefined;

    if (type === "arrow") {
      return { type: MarkerType.Arrow, color, width: markerSize, height: markerSize };
    }
    if (type === "arrowclosed") {
      return { type: MarkerType.ArrowClosed, color, width: markerSize, height: markerSize };
    }
    // For circle and diamond, use custom marker ID
    // React Flow expects just the marker ID, it will wrap it in url(#...) internally
    return getMarkerId(type, color, size);
  };

  return {
    markerStart: getMarkerConfig(startType),
    markerEnd: getMarkerConfig(endType),
  };
};

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  groups: [],
  graphTitle: "Untitled Graph",
  selectedEdgeId: undefined,
  selectedNodeId: undefined,
  editingNodeId: undefined,
  flowInstance: null,
  isFocusMode: false,
  focusNodeId: undefined,
  historyPast: [],
  historyFuture: [],
  canUndo: false,
  canRedo: false,
  dataVersion: 0,
  gridSettings: defaultGridSettings,
  setNodes: (nodes) =>
    set({
      nodes: normalizeNodes(nodes),
      ...setHistory([], []),
    }),
  setEdges: (edges) =>
    set({
      edges: normalizeEdges(edges),
      ...setHistory([], []),
    }),
  onNodesChange: (changes) =>
    set((state) => {
      const nextNodes = applyNodeChanges(changes, state.nodes);
      if (!shouldCommitNodeChanges(changes)) {
        return { nodes: nextNodes };
      }
      return {
        nodes: nextNodes,
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  onEdgesChange: (changes) =>
    set((state) => {
      const nextEdges = applyEdgeChanges(changes, state.edges);
      if (!shouldCommitEdgeChanges(changes)) {
        return { edges: nextEdges };
      }
      return {
        edges: nextEdges,
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  onConnect: (connection) =>
    set((state) => ({
      edges: addEdge(
        {
          ...connection,
          label: "relationship",
          data: { ...defaultEdgeData, style: { ...defaultEdgeStyle } },
          ...markerForDirection(
            defaultEdgeData.direction ?? "forward",
            defaultEdgeStyle.color,
            defaultEdgeStyle
          ),
        },
        state.edges
      ),
      ...setHistory(
        [
          ...state.historyPast,
          cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
        ],
        []
      ),
    })),
  setGraphTitle: (graphTitle) => set({ graphTitle }),
  setGridSettings: (settings) =>
    set((state) => ({
      gridSettings: { ...state.gridSettings, ...settings },
      dataVersion: ++currentDataVersion,
    })),
  snapAllNodesToGrid: () =>
    set((state) => {
      const gridSize = state.gridSettings.gridSize;
      const snappedNodes = state.nodes.map((node) => ({
        ...node,
        position: {
          x: Math.round(node.position.x / gridSize) * gridSize,
          y: Math.round(node.position.y / gridSize) * gridSize,
        },
      }));
      return {
        nodes: snappedNodes,
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  selectEdge: (edgeId) => set({ selectedEdgeId: edgeId }),
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  startEditingNode: (nodeId) =>
    set((state) => ({
      editingNodeId: nodeId,
      selectedNodeId: nodeId,
      // Ensure the node is selected in React Flow's state
      nodes: state.nodes.map((node) => ({
        ...node,
        selected: node.id === nodeId,
      })),
    })),
  stopEditingNode: () => set({ editingNodeId: undefined }),
  setFlowInstance: (instance) => set({ flowInstance: instance }),
  setFocusNode: (nodeId) =>
    set({
      focusNodeId: nodeId,
      isFocusMode: Boolean(nodeId),
    }),
  clearFocus: () => set({ focusNodeId: undefined, isFocusMode: false }),
  updateNodeLabel: (nodeId, label) =>
    set((state) => {
      const target = state.nodes.find((node) => node.id === nodeId);
      if (!target || target.data.label === label) {
        return {};
      }
      return {
        nodes: state.nodes.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, label } } : node
        ),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  updateNodeBody: (nodeId, body) =>
    set((state) => {
      const target = state.nodes.find((node) => node.id === nodeId);
      if (!target) {
        return {};
      }
      const normalizedBody = body.trim() || undefined;
      if (target.data.body === normalizedBody) {
        return {};
      }
      return {
        nodes: state.nodes.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, body: normalizedBody } } : node
        ),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  updateNodeStyle: (nodeId, style) =>
    set((state) => {
      const target = state.nodes.find((node) => node.id === nodeId);
      if (!target) {
        return {};
      }
      const nextStyle = {
        ...nodeStyleDefaults[target.data.kind],
        ...target.data.style,
        ...style,
      };
      return {
        nodes: state.nodes.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, style: nextStyle } } : node
        ),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  updateNodeHandles: (nodeId, sourceCount, targetCount) =>
    set((state) => {
      const target = state.nodes.find((node) => node.id === nodeId);
      if (!target) {
        return {};
      }
      const sourceHandles = Array.from({ length: sourceCount }, (_, i) => ({
        id: `${nodeId}-s-${i}`,
      }));
      const targetHandles = Array.from({ length: targetCount }, (_, i) => ({
        id: `${nodeId}-t-${i}`,
      }));
      // undefined = 1 handle (default), [] = 0 handles, array = multiple handles
      const getHandles = (count: number, handles: NodeHandle[]) => {
        if (count === 0) return [];
        if (count === 1) return undefined;
        return handles;
      };
      return {
        nodes: state.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  sourceHandles: getHandles(sourceCount, sourceHandles),
                  targetHandles: getHandles(targetCount, targetHandles),
                },
              }
            : node
        ),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  updateNodeLayout: (nodeId, layout) =>
    set((state) => {
      const target = state.nodes.find((node) => node.id === nodeId);
      if (!target) {
        return {};
      }
      return {
        nodes: state.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  layout,
                  label: (layout as { name?: string })?.name || node.data.label,
                },
              }
            : node
        ),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  setNodeKind: (nodeId, kind) =>
    set((state) => {
      const target = state.nodes.find((node) => node.id === nodeId);
      if (!target || target.data.kind === kind) {
        return {};
      }
      return {
        nodes: state.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  kind,
                  style: nodeStyleDefaults[kind],
                },
              }
            : node
        ),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  updateEdgeLabel: (edgeId, label) =>
    set((state) => {
      const target = state.edges.find((edge) => edge.id === edgeId);
      if (!target) {
        return {};
      }
      const nextLabel = label.trim();
      const normalizedLabel = nextLabel.length > 0 ? nextLabel : undefined;
      if (target.label === normalizedLabel) {
        return {};
      }
      return {
        edges: state.edges.map((edge) =>
          edge.id === edgeId ? { ...edge, label: normalizedLabel } : edge
        ),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  updateEdgeData: (edgeId, data) =>
    set((state) => {
      const target = state.edges.find((edge) => edge.id === edgeId);
      if (!target) {
        return {};
      }
      const nextData = {
        ...target.data,
        ...data,
        style: {
          ...defaultEdgeStyle,
          ...target.data?.style,
          ...data.style,
        },
      };
      return {
        edges: state.edges.map((edge) => {
          if (edge.id !== edgeId) {
            return edge;
          }
          return {
            ...edge,
            data: nextData,
            ...markerForDirection(
              nextData.direction ?? "forward",
              nextData.style?.color ?? defaultEdgeStyle.color,
              nextData.style
            ),
          };
        }),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  updateEdgeStyle: (edgeId, style) =>
    set((state) => {
      const target = state.edges.find((edge) => edge.id === edgeId);
      if (!target) {
        return {};
      }
      const nextStyle = {
        ...defaultEdgeStyle,
        ...target.data?.style,
        ...style,
      };
      const nextData = { ...target.data, style: nextStyle };
      return {
        edges: state.edges.map((edge) =>
          edge.id === edgeId
            ? {
                ...edge,
                data: nextData,
                ...markerForDirection(nextData.direction ?? "forward", nextStyle.color, nextStyle),
              }
            : edge
        ),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  addNode: (input) => {
    const id = crypto.randomUUID();
    const kind = input?.kind ?? "idea";
    // Map kind to React Flow node type
    const nodeType = getNodeType(kind);
    const getDefaultLabel = () => {
      switch (kind) {
        case "text":
          return "Heading";
        case "shape":
          return "";
        case "pathKey":
          return "Path Key";
        case "nodeKey":
          return "Node Key";
        case "composed":
          return "Composed Node";
        default:
          return "New node";
      }
    };
    // Get initial dimensions for resizable nodes
    const getInitialStyle = () => {
      switch (kind) {
        case "shape":
          return { width: 200, height: 120 };
        case "pathKey":
          return { width: 200, height: 150 };
        case "nodeKey":
          return { width: 200, height: 150 };
        default:
          return undefined;
      }
    };
    const nextNode: Node<GraphNodeData> = {
      id,
      type: nodeType,
      position: input?.position ?? { x: 0, y: 0 },
      style: getInitialStyle(),
      data: {
        label: input?.label ?? getDefaultLabel(),
        kind,
        style: nodeStyleDefaults[kind],
        ...(input?.layout ? { layout: input.layout } : {}),
      },
    };
    set((state) => ({
      nodes: [...state.nodes, nextNode],
      ...setHistory(
        [
          ...state.historyPast,
          cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
        ],
        []
      ),
    }));
  },
  addNodeAtCenter: (kind) => {
    const flowInstance = get().flowInstance;
    const canvas = document.getElementById("graph-canvas");
    if (!flowInstance || !canvas) {
      get().addNode({ kind });
      return;
    }
    const bounds = canvas.getBoundingClientRect();
    const position = flowInstance.screenToFlowPosition({
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
    });
    get().addNode({ kind, position });
  },
  duplicateNode: (nodeId) => {
    const state = get();
    const node = state.nodes.find((n) => n.id === nodeId);
    if (!node) {
      return;
    }
    const newId = crypto.randomUUID();
    const offset = 50;
    const newNode: Node<GraphNodeData> = {
      ...structuredClone(node),
      id: newId,
      position: {
        x: node.position.x + offset,
        y: node.position.y + offset,
      },
      selected: false,
    };
    set({
      nodes: [...state.nodes, newNode],
      selectedNodeId: newId,
      ...setHistory(
        [
          ...state.historyPast,
          cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
        ],
        []
      ),
    });
  },
  deleteNode: (nodeId) =>
    set((state) => {
      const nodeExists = state.nodes.some((n) => n.id === nodeId);
      if (!nodeExists) {
        return {};
      }
      return {
        nodes: state.nodes.filter((n) => n.id !== nodeId),
        edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
        selectedNodeId: state.selectedNodeId === nodeId ? undefined : state.selectedNodeId,
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  deleteEdge: (edgeId) =>
    set((state) => {
      const edgeExists = state.edges.some((e) => e.id === edgeId);
      if (!edgeExists) {
        return {};
      }
      return {
        edges: state.edges.filter((e) => e.id !== edgeId),
        selectedEdgeId: state.selectedEdgeId === edgeId ? undefined : state.selectedEdgeId,
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  reconnectEdge: (oldEdge, newConnection) =>
    set((state) => {
      if (!newConnection.source || !newConnection.target) {
        return {};
      }
      // Check if the new connection would create a duplicate edge
      const wouldDuplicate = state.edges.some(
        (e) =>
          e.id !== oldEdge.id &&
          ((e.source === newConnection.source && e.target === newConnection.target) ||
            (e.source === newConnection.target && e.target === newConnection.source))
      );
      if (wouldDuplicate) {
        return {};
      }
      return {
        edges: state.edges.map((edge) => {
          if (edge.id !== oldEdge.id) {
            return edge;
          }
          return {
            ...edge,
            id: `${newConnection.source}-${newConnection.target}`,
            source: newConnection.source,
            target: newConnection.target,
            sourceHandle: newConnection.sourceHandle ?? undefined,
            targetHandle: newConnection.targetHandle ?? undefined,
          };
        }),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  connectNodes: (sourceId, targetId) =>
    set((state) => {
      // Check if edge already exists between these nodes
      const edgeExists = state.edges.some(
        (e) =>
          (e.source === sourceId && e.target === targetId) ||
          (e.source === targetId && e.target === sourceId)
      );
      if (edgeExists) {
        return {};
      }
      // Check both nodes exist
      const sourceExists = state.nodes.some((n) => n.id === sourceId);
      const targetExists = state.nodes.some((n) => n.id === targetId);
      if (!sourceExists || !targetExists) {
        return {};
      }
      const newEdge: Edge<RelationshipData> = {
        id: `${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        label: "relationship",
        data: { ...defaultEdgeData, style: { ...defaultEdgeStyle } },
        ...markerForDirection(
          defaultEdgeData.direction ?? "forward",
          defaultEdgeStyle.color,
          defaultEdgeStyle
        ),
      };
      return {
        edges: [...state.edges, newEdge],
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  updateAllNodeStyles: (style) =>
    set((state) => {
      if (state.nodes.length === 0) {
        return {};
      }
      return {
        nodes: state.nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            style: {
              ...nodeStyleDefaults[node.data.kind],
              ...node.data.style,
              ...style,
            },
          },
        })),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  updateAllEdgeStyles: (style) =>
    set((state) => {
      if (state.edges.length === 0) {
        return {};
      }
      return {
        edges: state.edges.map((edge) => {
          const nextStyle = {
            ...defaultEdgeStyle,
            ...edge.data?.style,
            ...style,
          };
          const nextData = { ...edge.data, style: nextStyle };
          return {
            ...edge,
            data: nextData,
            ...markerForDirection(nextData.direction ?? "forward", nextStyle.color, nextStyle),
          };
        }),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  updateSelectedNodesStyle: (style) =>
    set((state) => {
      const selectedNodes = state.nodes.filter((n) => n.selected);
      if (selectedNodes.length === 0) {
        return {};
      }
      return {
        nodes: state.nodes.map((node) =>
          node.selected
            ? {
                ...node,
                data: {
                  ...node.data,
                  style: {
                    ...nodeStyleDefaults[node.data.kind],
                    ...node.data.style,
                    ...style,
                  },
                },
              }
            : node
        ),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  deleteSelectedNodes: () =>
    set((state) => {
      const selectedNodeIds = new Set(state.nodes.filter((n) => n.selected).map((n) => n.id));
      if (selectedNodeIds.size === 0) {
        return {};
      }
      // Remove selected nodes and any edges connected to them
      const nextNodes = state.nodes.filter((n) => !selectedNodeIds.has(n.id));
      const nextEdges = state.edges.filter(
        (e) => !selectedNodeIds.has(e.source) && !selectedNodeIds.has(e.target)
      );
      return {
        nodes: nextNodes,
        edges: nextEdges,
        selectedNodeId: undefined,
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  updateEdgeControlPoints: (edgeId, controlPoints) =>
    set((state) => {
      const target = state.edges.find((edge) => edge.id === edgeId);
      if (!target) {
        return {};
      }
      const nextStyle = {
        ...defaultEdgeStyle,
        ...target.data?.style,
        controlPoints,
      };
      const nextData = { ...target.data, style: nextStyle };
      return {
        edges: state.edges.map((edge) =>
          edge.id === edgeId
            ? {
                ...edge,
                data: nextData,
              }
            : edge
        ),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  clearAllEdgeLabels: () =>
    set((state) => {
      const hasLabels = state.edges.some((edge) => edge.label);
      if (!hasLabels) {
        return {};
      }
      return {
        edges: state.edges.map((edge) => ({
          ...edge,
          label: undefined,
        })),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  autoLayout: async (options) => {
    const state = get();
    if (state.nodes.length === 0) {
      return;
    }
    const { nodes: layoutedNodes } = await getLayoutedElements(state.nodes, state.edges, options);
    set({
      nodes: layoutedNodes,
      ...setHistory(
        [
          ...state.historyPast,
          cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
        ],
        []
      ),
    });
  },
  groupSelectedNodes: () =>
    set((state) => {
      const selectedNodes = state.nodes.filter((n) => n.selected);
      if (selectedNodes.length < 2) {
        return {};
      }
      // Check if any selected nodes are already in a group
      const existingGroupIds = new Set(selectedNodes.map((n) => n.data.groupId).filter(Boolean));
      if (existingGroupIds.size > 0) {
        // Don't allow grouping nodes that are already grouped
        return {};
      }
      const groupId = crypto.randomUUID();
      const groupColors = [
        "#E0E7FF", // indigo-100
        "#DBEAFE", // blue-100
        "#D1FAE5", // emerald-100
        "#FEF3C7", // amber-100
        "#FCE7F3", // pink-100
        "#E5E7EB", // gray-200
      ];
      const colorIndex = state.groups.length % groupColors.length;
      const newGroup: NodeGroup = {
        id: groupId,
        label: `Group ${state.groups.length + 1}`,
        color: groupColors[colorIndex],
      };
      return {
        nodes: state.nodes.map((node) =>
          node.selected ? { ...node, data: { ...node.data, groupId } } : node
        ),
        groups: [...state.groups, newGroup],
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  ungroupNodes: (groupId) =>
    set((state) => {
      const groupExists = state.groups.some((g) => g.id === groupId);
      if (!groupExists) {
        return {};
      }
      return {
        nodes: state.nodes.map((node) =>
          node.data.groupId === groupId
            ? { ...node, data: { ...node.data, groupId: undefined } }
            : node
        ),
        groups: state.groups.filter((g) => g.id !== groupId),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  setGroups: (groups) =>
    set({
      groups,
      ...setHistory([], []),
    }),
  distributeNodesHorizontally: () =>
    set((state) => {
      const selectedNodes = state.nodes.filter((n) => n.selected);
      if (selectedNodes.length < 2) return {};

      // Sort nodes by x position
      const sorted = [...selectedNodes].sort((a, b) => a.position.x - b.position.x);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];

      // Calculate total width span
      const startX = first.position.x;
      const endX = last.position.x + (last.width ?? 150);
      const totalSpan = endX - startX;

      // Calculate total width of all nodes
      const totalNodeWidth = sorted.reduce((sum, n) => sum + (n.width ?? 150), 0);

      // Calculate gap between nodes
      const totalGap = totalSpan - totalNodeWidth;
      const gapBetween = totalGap / (sorted.length - 1);

      // Build new positions
      const newPositions: Record<string, number> = {};
      let currentX = startX;
      for (const node of sorted) {
        newPositions[node.id] = currentX;
        currentX += (node.width ?? 150) + gapBetween;
      }

      return {
        nodes: state.nodes.map((node) =>
          newPositions[node.id] !== undefined
            ? { ...node, position: { ...node.position, x: newPositions[node.id] } }
            : node
        ),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  distributeNodesVertically: () =>
    set((state) => {
      const selectedNodes = state.nodes.filter((n) => n.selected);
      if (selectedNodes.length < 2) return {};

      // Sort nodes by y position
      const sorted = [...selectedNodes].sort((a, b) => a.position.y - b.position.y);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];

      // Calculate total height span
      const startY = first.position.y;
      const endY = last.position.y + (last.height ?? 50);
      const totalSpan = endY - startY;

      // Calculate total height of all nodes
      const totalNodeHeight = sorted.reduce((sum, n) => sum + (n.height ?? 50), 0);

      // Calculate gap between nodes
      const totalGap = totalSpan - totalNodeHeight;
      const gapBetween = totalGap / (sorted.length - 1);

      // Build new positions
      const newPositions: Record<string, number> = {};
      let currentY = startY;
      for (const node of sorted) {
        newPositions[node.id] = currentY;
        currentY += (node.height ?? 50) + gapBetween;
      }

      return {
        nodes: state.nodes.map((node) =>
          newPositions[node.id] !== undefined
            ? { ...node, position: { ...node.position, y: newPositions[node.id] } }
            : node
        ),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  alignNodesLeft: () =>
    set((state) => {
      const selectedNodes = state.nodes.filter((n) => n.selected);
      if (selectedNodes.length < 2) return {};

      // Find the leftmost x position
      const minX = Math.min(...selectedNodes.map((n) => n.position.x));

      return {
        nodes: state.nodes.map((node) =>
          node.selected ? { ...node, position: { ...node.position, x: minX } } : node
        ),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  alignNodesRight: () =>
    set((state) => {
      const selectedNodes = state.nodes.filter((n) => n.selected);
      if (selectedNodes.length < 2) return {};

      // Find the rightmost edge (x + width)
      const maxRight = Math.max(...selectedNodes.map((n) => n.position.x + (n.width ?? 150)));

      return {
        nodes: state.nodes.map((node) =>
          node.selected
            ? { ...node, position: { ...node.position, x: maxRight - (node.width ?? 150) } }
            : node
        ),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  alignNodesCenter: () =>
    set((state) => {
      const selectedNodes = state.nodes.filter((n) => n.selected);
      if (selectedNodes.length < 2) return {};

      // Find the average center x position
      const centers = selectedNodes.map((n) => n.position.x + (n.width ?? 150) / 2);
      const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length;

      return {
        nodes: state.nodes.map((node) =>
          node.selected
            ? { ...node, position: { ...node.position, x: avgCenter - (node.width ?? 150) / 2 } }
            : node
        ),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  alignNodesTop: () =>
    set((state) => {
      const selectedNodes = state.nodes.filter((n) => n.selected);
      if (selectedNodes.length < 2) return {};

      // Find the topmost y position
      const minY = Math.min(...selectedNodes.map((n) => n.position.y));

      return {
        nodes: state.nodes.map((node) =>
          node.selected ? { ...node, position: { ...node.position, y: minY } } : node
        ),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  alignNodesBottom: () =>
    set((state) => {
      const selectedNodes = state.nodes.filter((n) => n.selected);
      if (selectedNodes.length < 2) return {};

      // Find the bottommost edge (y + height)
      const maxBottom = Math.max(...selectedNodes.map((n) => n.position.y + (n.height ?? 50)));

      return {
        nodes: state.nodes.map((node) =>
          node.selected
            ? { ...node, position: { ...node.position, y: maxBottom - (node.height ?? 50) } }
            : node
        ),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  alignNodesMiddle: () =>
    set((state) => {
      const selectedNodes = state.nodes.filter((n) => n.selected);
      if (selectedNodes.length < 2) return {};

      // Find the average center y position
      const centers = selectedNodes.map((n) => n.position.y + (n.height ?? 50) / 2);
      const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length;

      return {
        nodes: state.nodes.map((node) =>
          node.selected
            ? { ...node, position: { ...node.position, y: avgCenter - (node.height ?? 50) / 2 } }
            : node
        ),
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  sendNodeToFront: (nodeId) =>
    set((state) => {
      const nodeIndex = state.nodes.findIndex((n) => n.id === nodeId);
      if (nodeIndex === -1) {
        return {};
      }
      // Find the max zIndex and set this node above it
      const maxZIndex = Math.max(0, ...state.nodes.map((n) => n.zIndex ?? 0));
      const node = state.nodes[nodeIndex];
      const nextNodes = [
        ...state.nodes.slice(0, nodeIndex),
        ...state.nodes.slice(nodeIndex + 1),
        { ...node, zIndex: maxZIndex + 1 },
      ];
      return {
        nodes: nextNodes,
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  sendNodeToBack: (nodeId) =>
    set((state) => {
      const nodeIndex = state.nodes.findIndex((n) => n.id === nodeId);
      if (nodeIndex === -1) {
        return {};
      }
      // Find the min zIndex and set this node below it
      const minZIndex = Math.min(0, ...state.nodes.map((n) => n.zIndex ?? 0));
      const node = state.nodes[nodeIndex];
      const nextNodes = [
        { ...node, zIndex: minZIndex - 1 },
        ...state.nodes.slice(0, nodeIndex),
        ...state.nodes.slice(nodeIndex + 1),
      ];
      return {
        nodes: nextNodes,
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      };
    }),
  selectGroupNodes: (groupId) =>
    set((state) => {
      // Select all nodes that belong to this group
      const groupNodeIds = new Set(
        state.nodes.filter((n) => n.data.groupId === groupId).map((n) => n.id)
      );
      if (groupNodeIds.size === 0) {
        return {};
      }
      return {
        nodes: state.nodes.map((node) => ({
          ...node,
          selected: groupNodeIds.has(node.id),
        })),
      };
    }),
  undo: () =>
    set((state) => {
      if (state.historyPast.length === 0) {
        return {};
      }
      const previous = state.historyPast[state.historyPast.length - 1];
      const nextPast = state.historyPast.slice(0, -1);
      const nextFuture = [
        cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
        ...state.historyFuture,
      ];
      return {
        nodes: previous.nodes,
        edges: previous.edges,
        groups: previous.groups,
        gridSettings: previous.gridSettings,
        ...setHistory(nextPast, nextFuture),
      };
    }),
  redo: () =>
    set((state) => {
      if (state.historyFuture.length === 0) {
        return {};
      }
      const next = state.historyFuture[0];
      const nextFuture = state.historyFuture.slice(1);
      const nextPast = [
        ...state.historyPast,
        cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
      ];
      return {
        nodes: next.nodes,
        edges: next.edges,
        groups: next.groups,
        gridSettings: next.gridSettings,
        ...setHistory(nextPast, nextFuture),
      };
    }),
  copySelectedNodes: () => {
    const state = get();
    const selectedNodes = state.nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) {
      return;
    }
    // Store copied nodes in localStorage for cross-tab support
    const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));
    // Also copy edges that connect selected nodes
    const relevantEdges = state.edges.filter(
      (e) => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target)
    );
    const clipboard = {
      nodes: structuredClone(selectedNodes),
      edges: structuredClone(relevantEdges),
    };
    localStorage.setItem("thalamus-clipboard", JSON.stringify(clipboard));
  },
  cutSelectedNodes: () => {
    const store = get();
    store.copySelectedNodes();
    store.deleteSelectedNodes();
  },
  pasteNodes: () => {
    const clipboardData = localStorage.getItem("thalamus-clipboard");
    if (!clipboardData) {
      return;
    }
    try {
      const clipboard = JSON.parse(clipboardData) as {
        nodes: Node<GraphNodeData>[];
        edges: Edge<RelationshipData>[];
      };
      if (!clipboard.nodes || clipboard.nodes.length === 0) {
        return;
      }
      // Create new IDs for pasted nodes
      const idMap = new Map<string, string>();
      const offset = 50;
      const newNodes = clipboard.nodes.map((node) => {
        const newId = crypto.randomUUID();
        idMap.set(node.id, newId);
        return {
          ...node,
          id: newId,
          position: {
            x: node.position.x + offset,
            y: node.position.y + offset,
          },
          selected: true,
          // Clear groupId for pasted nodes (they won't belong to original group)
          data: {
            ...node.data,
            groupId: undefined,
          },
        };
      });
      // Remap edge connections to new node IDs
      const newEdges = clipboard.edges
        .map((edge) => {
          const newSource = idMap.get(edge.source);
          const newTarget = idMap.get(edge.target);
          if (!newSource || !newTarget) {
            return null;
          }
          return {
            ...edge,
            id: `${newSource}-${newTarget}`,
            source: newSource,
            target: newTarget,
          };
        })
        .filter((e): e is Edge<RelationshipData> => e !== null);

      set((state) => ({
        // Deselect existing nodes and add new ones
        nodes: [...state.nodes.map((n) => ({ ...n, selected: false })), ...newNodes],
        edges: [...state.edges, ...newEdges],
        ...setHistory(
          [
            ...state.historyPast,
            cloneGraph(state.nodes, state.edges, state.groups, state.gridSettings),
          ],
          []
        ),
      }));
    } catch {
      // Invalid clipboard data
    }
  },
  getSelectedGroupId: () => {
    const state = get();
    const selectedNodes = state.nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) {
      return undefined;
    }
    // Get unique group IDs from selected nodes
    const groupIds = new Set(selectedNodes.map((n) => n.data.groupId).filter(Boolean));
    // Return the group ID if all selected nodes are in the same group
    if (groupIds.size === 1) {
      return Array.from(groupIds)[0];
    }
    return undefined;
  },
}));
