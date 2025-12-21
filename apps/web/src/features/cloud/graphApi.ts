import type { Edge, Node } from "reactflow";

import { supabase } from "../../lib/supabaseClient";
import type { RelationshipData } from "../../store/graphStore";

export type GraphPayload = {
  nodes: Node[];
  edges: Edge<RelationshipData>[];
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
});

export async function listGraphs() {
  const { data, error } = await supabase
    .from("graphs")
    .select("id,title,data,updated_at,expires_at")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as GraphRecord[];
}

export async function getGraph(graphId: string) {
  const { data, error } = await supabase
    .from("graphs")
    .select("id,title,data,updated_at,expires_at")
    .eq("id", graphId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as GraphRecord;
}

export async function createGraph(title: string, payload: GraphPayload) {
  const { data, error } = await supabase
    .from("graphs")
    .insert({
      title,
      data: payload,
    })
    .select("id,title,data,updated_at,expires_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as GraphRecord;
}

export async function updateGraph(
  graphId: string,
  title: string,
  payload: GraphPayload
) {
  const { data, error } = await supabase
    .from("graphs")
    .update({ title, data: payload })
    .eq("id", graphId)
    .select("id,title,data,updated_at,expires_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as GraphRecord;
}

export async function deleteGraph(graphId: string) {
  const { error } = await supabase.from("graphs").delete().eq("id", graphId);

  if (error) {
    throw new Error(error.message);
  }
}
