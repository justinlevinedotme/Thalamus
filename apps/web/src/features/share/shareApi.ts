import { supabase } from "../../lib/supabaseClient";

export type ShareLinkRecord = {
  token: string;
  expires_at: string;
};

export async function createShareLink(graphId: string) {
  const { data, error } = await supabase
    .from("share_links")
    .insert({ graph_id: graphId })
    .select("token,expires_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ShareLinkRecord;
}

export async function getSharedGraph(token: string) {
  const { data, error } = await supabase.rpc("get_shared_graph", {
    share_token: token,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    return null;
  }

  return data[0] as {
    id: string;
    title: string;
    data: unknown;
    updated_at: string;
  };
}
