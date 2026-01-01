import { describe, it, expect, beforeEach } from "vitest";
import { useGraphStore } from "./graphStore";

describe("graphStore", () => {
  beforeEach(() => {
    useGraphStore.setState({
      nodes: [],
      edges: [],
      groups: [],
      graphTitle: "Untitled Graph",
      selectedNodeId: undefined,
      selectedEdgeId: undefined,
      historyPast: [],
      historyFuture: [],
      canUndo: false,
      canRedo: false,
    });
  });

  describe("nodes", () => {
    it("should start with empty nodes", () => {
      const { nodes } = useGraphStore.getState();
      expect(nodes).toEqual([]);
    });

    it("should add a node", () => {
      const { addNode } = useGraphStore.getState();
      addNode({ label: "Test Node", kind: "idea" });

      const { nodes } = useGraphStore.getState();
      expect(nodes).toHaveLength(1);
      expect(nodes[0].data.label).toBe("Test Node");
      expect(nodes[0].data.kind).toBe("idea");
    });

    it("should add a node with default position", () => {
      const { addNode } = useGraphStore.getState();
      addNode();

      const { nodes } = useGraphStore.getState();
      expect(nodes[0].position).toEqual({ x: 0, y: 0 });
    });

    it("should add a node at specified position", () => {
      const { addNode } = useGraphStore.getState();
      addNode({ position: { x: 100, y: 200 } });

      const { nodes } = useGraphStore.getState();
      expect(nodes[0].position).toEqual({ x: 100, y: 200 });
    });

    it("should delete a node", () => {
      const { addNode, deleteNode } = useGraphStore.getState();
      addNode({ label: "Test Node" });

      const nodeId = useGraphStore.getState().nodes[0].id;
      deleteNode(nodeId);

      const { nodes } = useGraphStore.getState();
      expect(nodes).toHaveLength(0);
    });

    it("should update node label", () => {
      const { addNode, updateNodeLabel } = useGraphStore.getState();
      addNode({ label: "Original" });

      const nodeId = useGraphStore.getState().nodes[0].id;
      updateNodeLabel(nodeId, "Updated");

      const { nodes } = useGraphStore.getState();
      expect(nodes[0].data.label).toBe("Updated");
    });

    it("should duplicate a node", () => {
      const { addNode, duplicateNode } = useGraphStore.getState();
      addNode({ label: "Original", position: { x: 100, y: 100 } });

      const nodeId = useGraphStore.getState().nodes[0].id;
      duplicateNode(nodeId);

      const { nodes } = useGraphStore.getState();
      expect(nodes).toHaveLength(2);
      expect(nodes[1].data.label).toBe("Original");
      expect(nodes[1].position.x).toBe(150);
      expect(nodes[1].position.y).toBe(150);
    });
  });

  describe("edges", () => {
    it("should connect two nodes", () => {
      const { addNode, connectNodes } = useGraphStore.getState();
      addNode({ label: "Node 1" });
      addNode({ label: "Node 2" });

      const nodes = useGraphStore.getState().nodes;
      connectNodes(nodes[0].id, nodes[1].id);

      const { edges } = useGraphStore.getState();
      expect(edges).toHaveLength(1);
      expect(edges[0].source).toBe(nodes[0].id);
      expect(edges[0].target).toBe(nodes[1].id);
    });

    it("should not create duplicate edges", () => {
      const { addNode, connectNodes } = useGraphStore.getState();
      addNode({ label: "Node 1" });
      addNode({ label: "Node 2" });

      const nodes = useGraphStore.getState().nodes;
      connectNodes(nodes[0].id, nodes[1].id);
      connectNodes(nodes[0].id, nodes[1].id);

      const { edges } = useGraphStore.getState();
      expect(edges).toHaveLength(1);
    });

    it("should delete an edge", () => {
      const { addNode, connectNodes, deleteEdge } = useGraphStore.getState();
      addNode({ label: "Node 1" });
      addNode({ label: "Node 2" });

      const nodes = useGraphStore.getState().nodes;
      connectNodes(nodes[0].id, nodes[1].id);

      const edgeId = useGraphStore.getState().edges[0].id;
      deleteEdge(edgeId);

      const { edges } = useGraphStore.getState();
      expect(edges).toHaveLength(0);
    });
  });

  describe("history", () => {
    it("should support undo", () => {
      const { addNode, undo } = useGraphStore.getState();
      addNode({ label: "Test Node" });

      expect(useGraphStore.getState().nodes).toHaveLength(1);
      expect(useGraphStore.getState().canUndo).toBe(true);

      undo();

      expect(useGraphStore.getState().nodes).toHaveLength(0);
    });

    it("should support redo", () => {
      const { addNode, undo, redo } = useGraphStore.getState();
      addNode({ label: "Test Node" });
      undo();

      expect(useGraphStore.getState().nodes).toHaveLength(0);
      expect(useGraphStore.getState().canRedo).toBe(true);

      redo();

      expect(useGraphStore.getState().nodes).toHaveLength(1);
    });
  });

  describe("selection", () => {
    it("should select a node", () => {
      const { addNode, selectNode } = useGraphStore.getState();
      addNode({ label: "Test Node" });

      const nodeId = useGraphStore.getState().nodes[0].id;
      selectNode(nodeId);

      expect(useGraphStore.getState().selectedNodeId).toBe(nodeId);
    });

    it("should clear selection", () => {
      const { addNode, selectNode } = useGraphStore.getState();
      addNode({ label: "Test Node" });

      const nodeId = useGraphStore.getState().nodes[0].id;
      selectNode(nodeId);
      selectNode(undefined);

      expect(useGraphStore.getState().selectedNodeId).toBeUndefined();
    });
  });

  describe("graph title", () => {
    it("should update graph title", () => {
      const { setGraphTitle } = useGraphStore.getState();
      setGraphTitle("My Graph");

      expect(useGraphStore.getState().graphTitle).toBe("My Graph");
    });
  });
});
