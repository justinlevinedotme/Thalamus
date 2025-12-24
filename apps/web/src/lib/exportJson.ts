import type { Edge, Node } from "reactflow";

import type { RelationshipData } from "../store/graphStore";

type GraphExport = {
  title: string;
  exportedAt: string;
  nodes: Node[];
  edges: Edge<RelationshipData>[];
  version: number;
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function exportGraphJson(
  title: string,
  nodes: Node[],
  edges: Edge<RelationshipData>[]
) {
  const payload: GraphExport = {
    title,
    exportedAt: new Date().toISOString(),
    nodes,
    edges,
    version: 2,
  };

  const fileName = `${slugify(title || "graph")}.json`;
  downloadFile(JSON.stringify(payload, null, 2), fileName, "application/json");
}
