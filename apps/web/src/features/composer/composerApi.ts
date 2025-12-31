/**
 * @file composerApi.ts
 * @description API client for saved node templates (composer). Provides CRUD operations
 * for user-created node templates with quota management.
 */

import { apiFetch } from "../../lib/apiClient";
import type { ComposedNodeLayout } from "./types";

export type SavedNode = {
  id: string;
  name: string;
  description: string | null;
  layout: ComposedNodeLayout;
  createdAt: string | null;
  updatedAt: string | null;
};

export type SavedNodesQuota = {
  used: number;
  max: number;
  plan: string;
};

export type SavedNodesListResponse = {
  items: SavedNode[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  quota: SavedNodesQuota;
};

/**
 * List user's saved nodes with pagination
 */
export async function listSavedNodes(
  options: { limit?: number; offset?: number } = {}
): Promise<SavedNodesListResponse> {
  const params = new URLSearchParams();
  if (options.limit) params.set("limit", String(options.limit));
  if (options.offset) params.set("offset", String(options.offset));

  const query = params.toString();
  const url = query ? `/saved-nodes?${query}` : "/saved-nodes";

  return apiFetch<SavedNodesListResponse>(url);
}

/**
 * Get a single saved node by ID
 */
export async function getSavedNode(id: string): Promise<SavedNode> {
  return apiFetch<SavedNode>(`/saved-nodes/${id}`);
}

/**
 * Create a new saved node
 */
export async function createSavedNode(data: {
  name: string;
  description?: string;
  layout: ComposedNodeLayout;
}): Promise<SavedNode> {
  return apiFetch<SavedNode>("/saved-nodes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing saved node
 */
export async function updateSavedNode(
  id: string,
  data: {
    name?: string;
    description?: string;
    layout?: ComposedNodeLayout;
  }
): Promise<SavedNode> {
  return apiFetch<SavedNode>(`/saved-nodes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Delete a saved node
 */
export async function deleteSavedNode(id: string): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(`/saved-nodes/${id}`, {
    method: "DELETE",
  });
}
