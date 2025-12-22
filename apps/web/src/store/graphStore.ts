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
} from "reactflow";

import { getLayoutedElements, type LayoutOptions } from "../lib/autoLayout";

export type RelationshipDirection = "forward" | "backward" | "both" | "none";
export type RelationshipType = "causes" | "supports" | "contradicts" | "related";
export type NodeKind = "idea" | "question" | "evidence" | "goal" | "text" | "shape";

export type NodeShape = "rounded" | "pill" | "circle" | "square";
export type NodeSize = "sm" | "md" | "lg";

export type NodeHandle = {
  id: string;
};

export type EdgePadding = "none" | "sm" | "md" | "lg";

export type NodeIcon =
  | { type: "emoji"; value: string }
  | { type: "lucide"; value: string }
  | { type: "simple"; value: string };

export type NodeGroup = {
  id: string;
  label: string;
  color: string;
};

export type NodeStyle = {
  color: string;
  shape: NodeShape;
  size: NodeSize;
  edgePadding?: EdgePadding;
  textColor?: string;
  bodyTextColor?: string;
  icon?: NodeIcon;
  iconColor?: string;
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

type GraphNodeData = {
  label: string;
  body?: string;
  kind: NodeKind;
  style?: NodeStyle;
  sourceHandles?: NodeHandle[];
  targetHandles?: NodeHandle[];
  groupId?: string;
};

type GraphSnapshot = {
  nodes: Node<GraphNodeData>[];
  edges: Edge<RelationshipData>[];
  groups: NodeGroup[];
};

type GraphState = {
  nodes: Node<GraphNodeData>[];
  edges: Edge<RelationshipData>[];
  groups: NodeGroup[];
  graphTitle: string;
  selectedEdgeId?: string;
  selectedNodeId?: string;
  editingNodeId?: string;
  flowInstance: ReactFlowInstance | null;
  isFocusMode: boolean;
  focusNodeId?: string;
  historyPast: GraphSnapshot[];
  historyFuture: GraphSnapshot[];
  canUndo: boolean;
  canRedo: boolean;
  setNodes: (nodes: Node<GraphNodeData>[]) => void;
  setEdges: (edges: Edge<RelationshipData>[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setGraphTitle: (title: string) => void;
  selectEdge: (edgeId?: string) => void;
  selectNode: (nodeId?: string) => void;
  startEditingNode: (nodeId: string) => void;
  stopEditingNode: () => void;
  setFlowInstance: (instance: ReactFlowInstance | null) => void;
  setFocusNode: (nodeId?: string) => void;
  clearFocus: () => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateNodeBody: (nodeId: string, body: string) => void;
  updateNodeStyle: (nodeId: string, style: Partial<NodeStyle>) => void;
  updateNodeHandles: (
    nodeId: string,
    sourceCount: number,
    targetCount: number
  ) => void;
  setNodeKind: (nodeId: string, kind: NodeKind) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
  updateEdgeData: (edgeId: string, data: Partial<RelationshipData>) => void;
  updateEdgeStyle: (edgeId: string, style: Partial<EdgeStyle>) => void;
  addNode: (input?: {
    position?: { x: number; y: number };
    label?: string;
    kind?: NodeKind;
  }) => void;
  addNodeAtCenter: (kind?: NodeKind) => void;
  duplicateNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  reconnectEdge: (
    oldEdge: Edge<RelationshipData>,
    newConnection: Connection
  ) => void;
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
  distributeNodesHorizontally: () => void;
  distributeNodesVertically: () => void;
  sendNodeToFront: (nodeId: string) => void;
  sendNodeToBack: (nodeId: string) => void;
  undo: () => void;
  redo: () => void;
};

const nodeStyleDefaults: Record<NodeKind, NodeStyle> = {
  idea: { color: "#E2E8F0", shape: "rounded", size: "md" },
  question: { color: "#FDE68A", shape: "circle", size: "md" },
  evidence: { color: "#BBF7D0", shape: "rounded", size: "sm" },
  goal: { color: "#BFDBFE", shape: "pill", size: "lg" },
  text: { color: "transparent", shape: "rounded", size: "md" },
  shape: { color: "#F1F5F9", shape: "rounded", size: "lg" },
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

const cloneGraph = (
  nodes: Node<GraphNodeData>[],
  edges: Edge<RelationshipData>[],
  groups: NodeGroup[]
): GraphSnapshot => structuredClone({ nodes, edges, groups });

const normalizeNodes = (nodes: Node<GraphNodeData>[]) =>
  nodes.map((node) => {
    const kind = node.data?.kind ?? "idea";
    // Map kind to React Flow node type
    const nodeType = node.type ?? (kind === "text" ? "text" : kind === "shape" ? "shape" : "editable");
    return {
      ...node,
      type: nodeType,
      data: {
        label: node.data?.label ?? "Untitled",
        body: node.data?.body,
        kind,
        style: node.data?.style ?? nodeStyleDefaults[kind],
        sourceHandles: node.data?.sourceHandles,
        targetHandles: node.data?.targetHandles,
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

const setHistory = (past: GraphSnapshot[], future: GraphSnapshot[]) => ({
  historyPast: past,
  historyFuture: future,
  canUndo: past.length > 0,
  canRedo: future.length > 0,
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

type MarkerConfig = { type: MarkerType; color?: string; width?: number; height?: number } | string | undefined;

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
export const getMarkerId = (markerType: EdgeMarkerType, color: string, size: EdgeMarkerSize): string => {
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
        [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
        []
      ),
    })),
  setGraphTitle: (graphTitle) => set({ graphTitle }),
  selectEdge: (edgeId) => set({ selectedEdgeId: edgeId }),
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  startEditingNode: (nodeId) => set({ editingNodeId: nodeId }),
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
          node.id === nodeId
            ? { ...node, data: { ...node.data, label } }
            : node
        ),
        ...setHistory(
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
          node.id === nodeId
            ? { ...node, data: { ...node.data, body: normalizedBody } }
            : node
        ),
        ...setHistory(
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
          node.id === nodeId
            ? { ...node, data: { ...node.data, style: nextStyle } }
            : node
        ),
        ...setHistory(
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
                ...markerForDirection(
                  nextData.direction ?? "forward",
                  nextStyle.color,
                  nextStyle
                ),
              }
            : edge
        ),
        ...setHistory(
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
          []
        ),
      };
    }),
  addNode: (input) => {
    const id = crypto.randomUUID();
    const kind = input?.kind ?? "idea";
    // Map kind to React Flow node type
    const nodeType = kind === "text" ? "text" : kind === "shape" ? "shape" : "editable";
    const defaultLabel = kind === "text" ? "Heading" : kind === "shape" ? "" : "New node";
    const nextNode: Node<GraphNodeData> = {
      id,
      type: nodeType,
      position: input?.position ?? { x: 0, y: 0 },
      // Shape nodes need initial dimensions for resizing
      ...(kind === "shape" ? { style: { width: 200, height: 120 } } : {}),
      data: {
        label: input?.label ?? defaultLabel,
        kind,
        style: nodeStyleDefaults[kind],
      },
    };
    set((state) => ({
      nodes: [...state.nodes, nextNode],
      ...setHistory(
        [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
        [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
        edges: state.edges.filter(
          (e) => e.source !== nodeId && e.target !== nodeId
        ),
        selectedNodeId:
          state.selectedNodeId === nodeId ? undefined : state.selectedNodeId,
        ...setHistory(
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
        selectedEdgeId:
          state.selectedEdgeId === edgeId ? undefined : state.selectedEdgeId,
        ...setHistory(
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
            ...markerForDirection(
              nextData.direction ?? "forward",
              nextStyle.color,
              nextStyle
            ),
          };
        }),
        ...setHistory(
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
          []
        ),
      };
    }),
  deleteSelectedNodes: () =>
    set((state) => {
      const selectedNodeIds = new Set(
        state.nodes.filter((n) => n.selected).map((n) => n.id)
      );
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
          []
        ),
      };
    }),
  autoLayout: async (options) => {
    const state = get();
    if (state.nodes.length === 0) {
      return;
    }
    const { nodes: layoutedNodes } = await getLayoutedElements(
      state.nodes,
      state.edges,
      options
    );
    set({
      nodes: layoutedNodes,
      ...setHistory(
        [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
      const existingGroupIds = new Set(
        selectedNodes.map((n) => n.data.groupId).filter(Boolean)
      );
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
          node.selected
            ? { ...node, data: { ...node.data, groupId } }
            : node
        ),
        groups: [...state.groups, newGroup],
        ...setHistory(
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
          []
        ),
      };
    }),
  sendNodeToFront: (nodeId) =>
    set((state) => {
      const nodeIndex = state.nodes.findIndex((n) => n.id === nodeId);
      if (nodeIndex === -1 || nodeIndex === state.nodes.length - 1) {
        return {};
      }
      const node = state.nodes[nodeIndex];
      const nextNodes = [
        ...state.nodes.slice(0, nodeIndex),
        ...state.nodes.slice(nodeIndex + 1),
        node,
      ];
      return {
        nodes: nextNodes,
        ...setHistory(
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
          []
        ),
      };
    }),
  sendNodeToBack: (nodeId) =>
    set((state) => {
      const nodeIndex = state.nodes.findIndex((n) => n.id === nodeId);
      if (nodeIndex === -1 || nodeIndex === 0) {
        return {};
      }
      const node = state.nodes[nodeIndex];
      const nextNodes = [
        node,
        ...state.nodes.slice(0, nodeIndex),
        ...state.nodes.slice(nodeIndex + 1),
      ];
      return {
        nodes: nextNodes,
        ...setHistory(
          [...state.historyPast, cloneGraph(state.nodes, state.edges, state.groups)],
          []
        ),
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
        cloneGraph(state.nodes, state.edges, state.groups),
        ...state.historyFuture,
      ];
      return {
        nodes: previous.nodes,
        edges: previous.edges,
        groups: previous.groups,
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
        cloneGraph(state.nodes, state.edges, state.groups),
      ];
      return {
        nodes: next.nodes,
        edges: next.edges,
        groups: next.groups,
        ...setHistory(nextPast, nextFuture),
      };
    }),
}));
