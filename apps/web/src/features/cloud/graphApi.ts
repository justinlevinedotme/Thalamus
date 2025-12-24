import type { Edge, Node } from "reactflow";

import { apiFetch } from "../../lib/apiClient";
import type { NodeGroup, RelationshipData } from "../../store/graphStore";

export type GraphPayload = {
  nodes: Node[];
  edges: Edge<RelationshipData>[];
  groups?: NodeGroup[];
};

export type GraphRecord = {
  id: string;
  title: string;
  data: GraphPayload;
  updated_at: string;
  expires_at: string | null;
};

export const emptyGraphPayload = (): GraphPayload => ({
  nodes: [],
  edges: [],
  groups: [],
});

export async function listGraphs(): Promise<GraphRecord[]> {
  return apiFetch<GraphRecord[]>("/graphs");
}

export async function getGraph(graphId: string): Promise<GraphRecord> {
  return apiFetch<GraphRecord>(`/graphs/${graphId}`);
}

export async function createGraph(
  title: string,
  payload: GraphPayload
): Promise<GraphRecord> {
  return apiFetch<GraphRecord>("/graphs", {
    method: "POST",
    body: JSON.stringify({ title, data: payload }),
  });
}

export async function updateGraph(
  graphId: string,
  title: string,
  payload: GraphPayload
): Promise<GraphRecord> {
  return apiFetch<GraphRecord>(`/graphs/${graphId}`, {
    method: "PUT",
    body: JSON.stringify({ title, data: payload }),
  });
}

export async function deleteGraph(graphId: string): Promise<void> {
  await apiFetch(`/graphs/${graphId}`, {
    method: "DELETE",
  });
}
