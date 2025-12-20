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
} from "reactflow";

export type RelationshipDirection = "forward" | "backward" | "none";
export type RelationshipType = "causes" | "supports" | "contradicts" | "related";

export type RelationshipData = {
  relationType?: RelationshipType;
  direction?: RelationshipDirection;
};

type GraphState = {
  nodes: Node[];
  edges: Edge<RelationshipData>[];
  graphTitle: string;
  selectedEdgeId?: string;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge<RelationshipData>[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setGraphTitle: (title: string) => void;
  selectEdge: (edgeId?: string) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
  updateEdgeData: (edgeId: string, data: RelationshipData) => void;
  addNode: (position?: { x: number; y: number }) => void;
};

const defaultEdgeData: RelationshipData = {
  relationType: "related",
  direction: "forward",
};

const markerForDirection = (direction: RelationshipDirection): {
  markerStart?: { type: MarkerType };
  markerEnd?: { type: MarkerType };
} => {
  if (direction === "backward") {
    return { markerStart: { type: MarkerType.ArrowClosed } };
  }
  if (direction === "none") {
    return {};
  }
  return { markerEnd: { type: MarkerType.ArrowClosed } };
};

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  graphTitle: "Untitled Graph",
  selectedEdgeId: undefined,
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) }),
  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),
  onConnect: (connection) =>
    set({
      edges: addEdge(
        {
          ...connection,
          label: "relationship",
          data: defaultEdgeData,
          ...markerForDirection(defaultEdgeData.direction ?? "forward"),
        },
        get().edges
      ),
    }),
  setGraphTitle: (graphTitle) => set({ graphTitle }),
  selectEdge: (edgeId) => set({ selectedEdgeId: edgeId }),
  updateEdgeLabel: (edgeId, label) =>
    set({
      edges: get().edges.map((edge) =>
        edge.id === edgeId ? { ...edge, label } : edge
      ),
    }),
  updateEdgeData: (edgeId, data) =>
    set({
      edges: get().edges.map((edge) => {
        if (edge.id !== edgeId) {
          return edge;
        }
        const nextData = { ...edge.data, ...data };
        return {
          ...edge,
          data: nextData,
          ...markerForDirection(nextData.direction ?? "forward"),
        };
      }),
    }),
  addNode: (position) => {
    const id = crypto.randomUUID();
    const nextNode: Node = {
      id,
      position: position ?? { x: 0, y: 0 },
      data: { label: "New node" },
    };
    set({ nodes: [...get().nodes, nextNode] });
  },
}));
