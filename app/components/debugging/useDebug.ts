import { getDebug } from "./api";
import { DebugResponse } from "./types";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";

export function useDebug() {
  const { getAuthToken } = useAuthenticatedFetch();

  const fetchDebug = async (
    conversation_id: string,
  ): Promise<DebugResponse> => {
    const token = await getAuthToken();
    const debug = await getDebug(conversation_id, token || undefined);
    return debug;
  };

  return {
    fetchDebug,
  };
}
