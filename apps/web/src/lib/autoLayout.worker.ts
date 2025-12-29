/**
 * @file autoLayout.worker.ts
 * @description Web Worker for computing graph layouts using ELK.js. Offloads expensive
 * layout calculations to a background thread to keep the UI responsive during
 * auto-layout operations.
 */

import ELK, { type ElkNode, type ElkPort } from "elkjs/lib/elk.bundled.js";

const elk = new ELK();

type NodeHandle = { id: string };

type LayoutDirection = "RIGHT" | "DOWN" | "LEFT" | "UP";
type LayoutAlgorithm = "layered" | "force" | "radial" | "stress";

type LayoutOptions = {
  direction: LayoutDirection;
  algorithm: LayoutAlgorithm;
  nodeSpacing: number;
  layerSpacing: number;
};

type WorkerNode = {
  id: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  data?: {
    sourceHandles?: NodeHandle[];
    targetHandles?: NodeHandle[];
  };
};

type WorkerEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
};

type WorkerMessage = {
  nodes: WorkerNode[];
  edges: WorkerEdge[];
  options: LayoutOptions;
};

// Determine port sides based on layout direction
function getPortSides(direction: LayoutDirection) {
  switch (direction) {
    case "RIGHT":
      return { source: "EAST", target: "WEST" };
    case "LEFT":
      return { source: "WEST", target: "EAST" };
    case "DOWN":
      return { source: "SOUTH", target: "NORTH" };
    case "UP":
      return { source: "NORTH", target: "SOUTH" };
  }
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { nodes, edges, options } = e.data;

  if (nodes.length === 0) {
    self.postMessage({ nodes, edges });
    return;
  }

  const elkOptions: Record<string, string> = {
    "elk.algorithm":
      options.algorithm === "layered" ? "layered" : `org.eclipse.elk.${options.algorithm}`,
    "elk.spacing.nodeNode": String(options.nodeSpacing),
    "elk.direction": options.direction,
  };

  // Add layer spacing for layered algorithm
  if (options.algorithm === "layered") {
    elkOptions["elk.layered.spacing.nodeNodeBetweenLayers"] = String(options.layerSpacing);
  }

  // Add specific options for force-based layouts
  if (options.algorithm === "force" || options.algorithm === "stress") {
    elkOptions["elk.force.iterations"] = "300";
  }

  const portSides = getPortSides(options.direction);

  const graph: ElkNode = {
    id: "root",
    layoutOptions: elkOptions,
    children: nodes.map((node) => {
      const sourceHandles = node.data?.sourceHandles ?? [{ id: "source" }];
      const targetHandles = node.data?.targetHandles ?? [{ id: "target" }];

      // Create ports for ELK layout
      const targetPorts: ElkPort[] = targetHandles.map((handle) => ({
        id: handle.id,
        properties: {
          side: portSides.target,
        },
      }));

      const sourcePorts: ElkPort[] = sourceHandles.map((handle) => ({
        id: handle.id,
        properties: {
          side: portSides.source,
        },
      }));

      return {
        id: node.id,
        width: node.width ?? 150,
        height: node.height ?? 50,
        ports: [...targetPorts, ...sourcePorts],
        layoutOptions: {
          "org.eclipse.elk.portConstraints": "FIXED_ORDER",
        },
      };
    }),
    edges: edges.map((edge) => {
      // Find source and target nodes to get their handle IDs
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      // Use specific handle IDs if edge has them, otherwise use first available
      const sourceHandleId =
        edge.sourceHandle ?? sourceNode?.data?.sourceHandles?.[0]?.id ?? "source";
      const targetHandleId =
        edge.targetHandle ?? targetNode?.data?.targetHandles?.[0]?.id ?? "target";

      return {
        id: edge.id,
        sources: [sourceHandleId],
        targets: [targetHandleId],
      };
    }),
  };

  try {
    const layoutedGraph = await elk.layout(graph);

    const layoutedNodes = nodes.map((node) => {
      const layoutedNode = layoutedGraph.children?.find((n) => n.id === node.id);
      return {
        ...node,
        position: {
          x: layoutedNode?.x ?? node.position.x,
          y: layoutedNode?.y ?? node.position.y,
        },
      };
    });

    self.postMessage({ nodes: layoutedNodes, edges });
  } catch (error) {
    // On error, return original positions
    self.postMessage({ nodes, edges, error: String(error) });
  }
};
