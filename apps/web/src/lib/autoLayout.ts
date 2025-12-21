import ELK, { type ElkNode, type ElkPort } from "elkjs/lib/elk.bundled.js";
import type { Edge, Node } from "reactflow";

import type { NodeHandle } from "../store/graphStore";

const elk = new ELK();

export type LayoutDirection = "RIGHT" | "DOWN" | "LEFT" | "UP";
export type LayoutAlgorithm = "layered" | "force" | "radial" | "stress";

export type LayoutOptions = {
  direction: LayoutDirection;
  algorithm: LayoutAlgorithm;
  nodeSpacing: number;
  layerSpacing: number;
};

export const defaultLayoutOptions: LayoutOptions = {
  direction: "RIGHT",
  algorithm: "layered",
  nodeSpacing: 80,
  layerSpacing: 100,
};

type NodeDataWithHandles = {
  sourceHandles?: NodeHandle[];
  targetHandles?: NodeHandle[];
};

export async function getLayoutedElements<T extends NodeDataWithHandles, E>(
  nodes: Node<T>[],
  edges: Edge<E>[],
  options: LayoutOptions = defaultLayoutOptions
): Promise<{ nodes: Node<T>[]; edges: Edge<E>[] }> {
  if (nodes.length === 0) {
    return { nodes, edges };
  }

  const elkOptions: Record<string, string> = {
    "elk.algorithm": options.algorithm === "layered" ? "layered" : `org.eclipse.elk.${options.algorithm}`,
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

  // Determine port sides based on layout direction
  const getPortSides = (direction: LayoutDirection) => {
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
  };

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
      const sourceHandleId = edge.sourceHandle ??
        sourceNode?.data?.sourceHandles?.[0]?.id ?? "source";
      const targetHandleId = edge.targetHandle ??
        targetNode?.data?.targetHandles?.[0]?.id ?? "target";

      return {
        id: edge.id,
        sources: [sourceHandleId],
        targets: [targetHandleId],
      };
    }),
  };

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

  return { nodes: layoutedNodes, edges };
}
