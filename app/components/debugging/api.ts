import { DebugResponse } from "./types";
import { fetchWithAuth } from "@/lib/api/client";

export async function getDebug(conversation_id: string, token?: string) {
  const res = await fetchWithAuth(`/util/debug`, {
    method: "POST",
    body: JSON.stringify({ conversation_id }),
    token,
  });

  const data: DebugResponse = await res.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data;
}
