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
export type NodeKind = "idea" | "question" | "evidence" | "goal";

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
};

type GraphSnapshot = {
  nodes: Node<GraphNodeData>[];
  edges: Edge<RelationshipData>[];
};

type GraphState = {
  nodes: Node<GraphNodeData>[];
  edges: Edge<RelationshipData>[];
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
  updateEdgeControlPoints: (edgeId: string, controlPoints: ControlPoint[]) => void;
  clearAllEdgeLabels: () => void;
  autoLayout: (options?: LayoutOptions) => Promise<void>;
  undo: () => void;
  redo: () => void;
};

const nodeStyleDefaults: Record<NodeKind, NodeStyle> = {
  idea: { color: "#E2E8F0", shape: "rounded", size: "md" },
  question: { color: "#FDE68A", shape: "circle", size: "md" },
  evidence: { color: "#BBF7D0", shape: "rounded", size: "sm" },
  goal: { color: "#BFDBFE", shape: "pill", size: "lg" },
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
  edges: Edge<RelationshipData>[]
): GraphSnapshot => structuredClone({ nodes, edges });

const normalizeNodes = (nodes: Node<GraphNodeData>[]) =>
  nodes.map((node) => {
    const kind = node.data?.kind ?? "idea";
    return {
      ...node,
      type: node.type ?? "editable",
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
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
        [...state.historyPast, cloneGraph(state.nodes, state.edges)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
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
      return {
        nodes: state.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  sourceHandles: sourceCount > 1 ? sourceHandles : undefined,
                  targetHandles: targetCount > 1 ? targetHandles : undefined,
                },
              }
            : node
        ),
        ...setHistory(
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
          []
        ),
      };
    }),
  addNode: (input) => {
    const id = crypto.randomUUID();
    const kind = input?.kind ?? "idea";
    const nextNode: Node<GraphNodeData> = {
      id,
      type: "editable",
      position: input?.position ?? { x: 0, y: 0 },
      data: {
        label: input?.label ?? "New node",
        kind,
        style: nodeStyleDefaults[kind],
      },
    };
    set((state) => ({
      nodes: [...state.nodes, nextNode],
      ...setHistory(
        [...state.historyPast, cloneGraph(state.nodes, state.edges)],
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
        [...state.historyPast, cloneGraph(state.nodes, state.edges)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
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
          [...state.historyPast, cloneGraph(state.nodes, state.edges)],
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
        [...state.historyPast, cloneGraph(state.nodes, state.edges)],
        []
      ),
    });
  },
  undo: () =>
    set((state) => {
      if (state.historyPast.length === 0) {
        return {};
      }
      const previous = state.historyPast[state.historyPast.length - 1];
      const nextPast = state.historyPast.slice(0, -1);
      const nextFuture = [
        cloneGraph(state.nodes, state.edges),
        ...state.historyFuture,
      ];
      return {
        nodes: previous.nodes,
        edges: previous.edges,
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
        cloneGraph(state.nodes, state.edges),
      ];
      return {
        nodes: next.nodes,
        edges: next.edges,
        ...setHistory(nextPast, nextFuture),
      };
    }),
}));
