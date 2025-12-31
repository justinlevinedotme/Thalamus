/**
 * @file shareApi.ts
 * @description API client for share link operations including creation, listing,
 * revocation, and retrieval of shared graphs
 */

import { apiFetch, ApiError } from "../../lib/apiClient";

export type ShareLinkRecord = {
  token: string;
  expires_at: string;
};

export type ShareLinkListItem = {
  id: string;
  token: string;
  graphId: string;
  graphTitle: string;
  expiresAt: string | null;
  createdAt: string | null;
};

export type SharedGraphData = {
  id: string;
  title: string;
  data: unknown;
  updated_at: string;
};

export async function createShareLink(graphId: string): Promise<ShareLinkRecord> {
  return apiFetch<ShareLinkRecord>(`/graphs/${graphId}/share`, {
    method: "POST",
  });
}

export async function listShareLinks(): Promise<ShareLinkListItem[]> {
  return apiFetch<ShareLinkListItem[]>("/share-links");
}

export async function revokeShareLink(id: string): Promise<void> {
  await apiFetch(`/share-links/${id}`, {
    method: "DELETE",
  });
}

export async function getSharedGraph(token: string): Promise<SharedGraphData | null> {
  try {
    return await apiFetch<SharedGraphData>(`/share/${token}`);
  } catch (error) {
    // Return null for 404 errors (expired or invalid token)
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
