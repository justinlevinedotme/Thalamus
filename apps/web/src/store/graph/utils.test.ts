import { describe, it, expect } from "vitest";
import { MarkerType } from "@xyflow/react";
import {
  getNodeType,
  normalizeNodes,
  markerSizeToScale,
  getMarkerId,
  markerForDirection,
  normalizeEdges,
  cloneGraph,
} from "./utils";
import type { AppNode, AppEdge, NodeGroup, GridSettings } from "./types";

describe("getNodeType", () => {
  it("returns 'text' for text kind", () => {
    expect(getNodeType("text")).toBe("text");
  });

  it("returns 'shape' for shape kind", () => {
    expect(getNodeType("shape")).toBe("shape");
  });

  it("returns 'pathKey' for pathKey kind", () => {
    expect(getNodeType("pathKey")).toBe("pathKey");
  });

  it("returns 'nodeKey' for nodeKey kind", () => {
    expect(getNodeType("nodeKey")).toBe("nodeKey");
  });

  it("returns 'composed' for composed kind", () => {
    expect(getNodeType("composed")).toBe("composed");
  });

  it("returns 'editable' for idea kind (default)", () => {
    expect(getNodeType("idea")).toBe("editable");
  });

  it("returns 'editable' for unknown kinds", () => {
    expect(getNodeType("unknown" as any)).toBe("editable");
  });
});

describe("markerSizeToScale", () => {
  it("returns 8 for xs", () => {
    expect(markerSizeToScale("xs")).toBe(8);
  });

  it("returns 15 for sm", () => {
    expect(markerSizeToScale("sm")).toBe(15);
  });

  it("returns 35 for lg", () => {
    expect(markerSizeToScale("lg")).toBe(35);
  });

  it("returns 25 for md (default)", () => {
    expect(markerSizeToScale("md")).toBe(25);
  });
});

describe("getMarkerId", () => {
  it("creates marker id from type, color, and size", () => {
    expect(getMarkerId("circle", "#ff0000", "md")).toBe("marker-circle-ff0000-md");
  });

  it("strips # from color", () => {
    expect(getMarkerId("diamond", "#abc123", "lg")).toBe("marker-diamond-abc123-lg");
  });

  it("works with various marker types", () => {
    expect(getMarkerId("diamond", "#000", "xs")).toBe("marker-diamond-000-xs");
    expect(getMarkerId("arrowclosed", "#fff", "sm")).toBe("marker-arrowclosed-fff-sm");
  });
});

describe("markerForDirection", () => {
  const defaultColor = "#888888";

  describe("direction: forward", () => {
    it("returns markerEnd only", () => {
      const result = markerForDirection("forward", defaultColor);

      expect(result.markerStart).toBeUndefined();
      expect(result.markerEnd).toEqual({
        type: MarkerType.ArrowClosed,
        color: defaultColor,
        width: 25,
        height: 25,
      });
    });
  });

  describe("direction: backward", () => {
    it("returns markerStart only", () => {
      const result = markerForDirection("backward", defaultColor);

      expect(result.markerStart).toEqual({
        type: MarkerType.ArrowClosed,
        color: defaultColor,
        width: 25,
        height: 25,
      });
      expect(result.markerEnd).toBeUndefined();
    });
  });

  describe("direction: both", () => {
    it("returns both markers", () => {
      const result = markerForDirection("both", defaultColor);

      expect(result.markerStart).toEqual({
        type: MarkerType.ArrowClosed,
        color: defaultColor,
        width: 25,
        height: 25,
      });
      expect(result.markerEnd).toEqual({
        type: MarkerType.ArrowClosed,
        color: defaultColor,
        width: 25,
        height: 25,
      });
    });
  });

  describe("direction: none", () => {
    it("returns no markers when no style overrides", () => {
      const result = markerForDirection("none", defaultColor);

      expect(result.markerStart).toBeUndefined();
      expect(result.markerEnd).toBeUndefined();
    });
  });

  describe("with custom style", () => {
    it("respects markerSize from style", () => {
      const result = markerForDirection("forward", defaultColor, { markerSize: "lg" } as any);

      expect(result.markerEnd).toEqual({
        type: MarkerType.ArrowClosed,
        color: defaultColor,
        width: 35,
        height: 35,
      });
    });

    it("uses arrow type when specified", () => {
      const result = markerForDirection("forward", defaultColor, { markerEnd: "arrow" } as any);

      expect(result.markerEnd).toEqual({
        type: MarkerType.Arrow,
        color: defaultColor,
        width: 25,
        height: 25,
      });
    });

    it("returns marker id for custom marker types", () => {
      const result = markerForDirection("forward", "#ff0000", {
        markerEnd: "circle",
        markerSize: "sm",
      } as any);

      expect(result.markerEnd).toBe("marker-circle-ff0000-sm");
    });

    it("respects markerStart override", () => {
      const result = markerForDirection("forward", "#000", {
        markerStart: "diamond",
        markerSize: "xs",
      } as any);

      expect(result.markerStart).toBe("marker-diamond-000-xs");
    });

    it("returns undefined for 'none' marker type", () => {
      const result = markerForDirection("forward", defaultColor, {
        markerEnd: "none",
      } as any);

      expect(result.markerEnd).toBeUndefined();
    });
  });
});

describe("normalizeNodes", () => {
  it("adds default label for nodes without one", () => {
    const nodes = [{ id: "1", position: { x: 0, y: 0 }, data: {} }];
    const result = normalizeNodes(nodes as any);

    expect(result[0].data.label).toBe("Untitled");
  });

  it("preserves existing label", () => {
    const nodes = [{ id: "1", position: { x: 0, y: 0 }, data: { label: "My Node" } }];
    const result = normalizeNodes(nodes as any);

    expect(result[0].data.label).toBe("My Node");
  });

  it("defaults kind to idea", () => {
    const nodes = [{ id: "1", position: { x: 0, y: 0 }, data: {} }];
    const result = normalizeNodes(nodes as any);

    expect(result[0].data.kind).toBe("idea");
  });

  it("sets node type based on kind", () => {
    const nodes = [{ id: "1", position: { x: 0, y: 0 }, data: { kind: "text" } }];
    const result = normalizeNodes(nodes as any);

    expect(result[0].type).toBe("text");
  });

  it("preserves existing type if set", () => {
    const nodes = [{ id: "1", position: { x: 0, y: 0 }, type: "custom", data: { kind: "idea" } }];
    const result = normalizeNodes(nodes as any);

    expect(result[0].type).toBe("custom");
  });
});

describe("normalizeEdges", () => {
  it("adds default relationType", () => {
    const edges = [{ id: "e1", source: "1", target: "2" }];
    const result = normalizeEdges(edges as any);

    expect(result[0].data?.relationType).toBe("related");
  });

  it("adds default direction", () => {
    const edges = [{ id: "e1", source: "1", target: "2" }];
    const result = normalizeEdges(edges as any);

    expect(result[0].data?.direction).toBe("forward");
  });

  it("preserves existing data", () => {
    const edges = [
      {
        id: "e1",
        source: "1",
        target: "2",
        data: { relationType: "causes", direction: "both" },
      },
    ];
    const result = normalizeEdges(edges as any);

    expect(result[0].data?.relationType).toBe("causes");
    expect(result[0].data?.direction).toBe("both");
  });

  it("adds markers based on direction", () => {
    const edges = [{ id: "e1", source: "1", target: "2" }];
    const result = normalizeEdges(edges as any);

    expect(result[0].markerEnd).toBeDefined();
  });
});

describe("cloneGraph", () => {
  const nodes: AppNode[] = [
    {
      id: "1",
      position: { x: 100, y: 200 },
      data: { label: "Test", kind: "idea", style: { color: "#fff", shape: "rounded", size: "md" } },
      type: "editable",
    },
  ];

  const edges: AppEdge[] = [
    {
      id: "e1",
      source: "1",
      target: "2",
      data: {
        relationType: "related",
        direction: "forward",
        style: { color: "#000", thickness: 2, curvature: "bezier", lineStyle: "solid" },
      },
    },
  ];

  const groups: NodeGroup[] = [{ id: "g1", label: "Group", color: "#4f46e5" }];

  const gridSettings: GridSettings = {
    gridVisible: true,
    snapEnabled: true,
    gridSize: 24,
    gridStyle: "dots",
  };

  it("creates deep copy of nodes", () => {
    const result = cloneGraph(nodes, edges, groups, gridSettings);

    expect(result.nodes).not.toBe(nodes);
    expect(result.nodes[0]).not.toBe(nodes[0]);
    expect(result.nodes[0].position).not.toBe(nodes[0].position);
    expect(result.nodes[0].data.style).not.toBe(nodes[0].data.style);
  });

  it("creates deep copy of edges", () => {
    const result = cloneGraph(nodes, edges, groups, gridSettings);

    expect(result.edges).not.toBe(edges);
    expect(result.edges[0]).not.toBe(edges[0]);
    expect(result.edges[0].data?.style).not.toBe(edges[0].data?.style);
  });

  it("creates deep copy of groups", () => {
    const result = cloneGraph(nodes, edges, groups, gridSettings);

    expect(result.groups).not.toBe(groups);
    expect(result.groups[0]).not.toBe(groups[0]);
  });

  it("creates deep copy of gridSettings", () => {
    const result = cloneGraph(nodes, edges, groups, gridSettings);

    expect(result.gridSettings).not.toBe(gridSettings);
    expect(result.gridSettings).toEqual(gridSettings);
  });

  it("preserves all values", () => {
    const result = cloneGraph(nodes, edges, groups, gridSettings);

    expect(result.nodes[0].id).toBe("1");
    expect(result.nodes[0].position).toEqual({ x: 100, y: 200 });
    expect(result.nodes[0].data.label).toBe("Test");
    expect(result.edges[0].id).toBe("e1");
    expect(result.groups[0].label).toBe("Group");
  });

  it("handles edges without data", () => {
    const edgesNoData: AppEdge[] = [{ id: "e1", source: "1", target: "2" } as AppEdge];
    const result = cloneGraph(nodes, edgesNoData, groups, gridSettings);

    expect(result.edges[0].data).toBeUndefined();
  });

  it("handles nodes without style", () => {
    const nodesNoStyle: AppNode[] = [
      {
        id: "1",
        position: { x: 0, y: 0 },
        data: { label: "Test", kind: "idea" },
        type: "editable",
      },
    ];
    const result = cloneGraph(nodesNoStyle, edges, groups, gridSettings);

    expect(result.nodes[0].data.style).toBeUndefined();
  });
});
