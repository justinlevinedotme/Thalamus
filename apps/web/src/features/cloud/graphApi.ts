import { apiFetch } from "../../lib/apiClient";
import type { AppEdge, AppNode, NodeGroup } from "../../store/graphStore";

export type GraphPayload = {
  nodes: AppNode[];
  edges: AppEdge[];
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

type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

export async function listGraphs(): Promise<GraphRecord[]> {
  const response = await apiFetch<PaginatedResponse<GraphRecord>>("/graphs");
  return response.items;
}

export async function getGraph(graphId: string): Promise<GraphRecord> {
  return apiFetch<GraphRecord>(`/graphs/${graphId}`);
}

export async function createGraph(title: string, payload: GraphPayload): Promise<GraphRecord> {
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
