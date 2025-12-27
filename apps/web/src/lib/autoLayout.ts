import type { Edge, Node } from "reactflow";

import type { NodeHandle } from "../store/graphStore";

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

// Lazy-loaded worker instance
let layoutWorker: Worker | null = null;

function getLayoutWorker(): Worker {
  if (!layoutWorker) {
    layoutWorker = new Worker(new URL("./autoLayout.worker.ts", import.meta.url), {
      type: "module",
    });
  }
  return layoutWorker;
}

// Worker-based layout for non-blocking UI
export async function getLayoutedElements<T extends NodeDataWithHandles, E>(
  nodes: Node<T>[],
  edges: Edge<E>[],
  options: LayoutOptions = defaultLayoutOptions
): Promise<{ nodes: Node<T>[]; edges: Edge<E>[] }> {
  if (nodes.length === 0) {
    return { nodes, edges };
  }

  return new Promise((resolve) => {
    const worker = getLayoutWorker();

    const handleMessage = (e: MessageEvent) => {
      worker.removeEventListener("message", handleMessage);

      // Merge layouted positions back into original nodes to preserve all properties
      const layoutedNodes = nodes.map((node) => {
        const layoutedNode = e.data.nodes.find((n: { id: string }) => n.id === node.id);
        return {
          ...node,
          position: layoutedNode?.position ?? node.position,
        };
      });

      resolve({ nodes: layoutedNodes, edges });
    };

    worker.addEventListener("message", handleMessage);

    // Send serializable data to worker
    worker.postMessage({
      nodes: nodes.map((node) => ({
        id: node.id,
        position: node.position,
        width: node.width,
        height: node.height,
        data: {
          sourceHandles: node.data?.sourceHandles,
          targetHandles: node.data?.targetHandles,
        },
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      })),
      options,
    });
  });
}

// Cleanup function to terminate worker when needed
export function terminateLayoutWorker(): void {
  if (layoutWorker) {
    layoutWorker.terminate();
    layoutWorker = null;
  }
}
