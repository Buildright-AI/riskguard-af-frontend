import { ConversationPayload } from "@/app/types/payloads";
import { fetchWithAuth } from "@/lib/api/client";

export async function loadConversation(
  conversation_id: string,
  token?: string
) {
  const startTime = performance.now();
  try {
    const response = await fetchWithAuth(
      `/db/load_tree/${conversation_id}`,
      {
        method: "GET",
        token,
      },
    );

    if (!response.ok) {
      console.error(
        `Error fetching saved conversation ${conversation_id}! status: ${response.status} ${response.statusText}`,
      );
      return {
        rebuild: [],
        error: `Error fetching saved conversation ${conversation_id}`,
      };
    }

    const data: ConversationPayload = await response.json();
    return data;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return {
      rebuild: [],
      error: `Error fetching saved conversation ${conversation_id}`,
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `loadConversation ${conversation_id} took ${(performance.now() - startTime).toFixed(2)}ms`,
      );
    }
  }
}
