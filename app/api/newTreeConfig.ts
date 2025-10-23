import { TreeConfigPayload } from "@/app/types/payloads";
import { fetchWithAuth } from "@/lib/api/client";

export async function newTreeConfig(
  conversation_id: string | null | undefined,
  token?: string
): Promise<TreeConfigPayload> {
  const startTime = performance.now();
  try {
    if (!conversation_id) {
      return {
        error: "No conversation id",
        config: null,
      };
    }
    const response = await fetchWithAuth(
      `/tree/config/${conversation_id}/new`,
      {
        method: "POST",
        token,
      }
    );

    if (!response.ok) {
      console.error(
        `New Tree Config error! status: ${response.status} ${response.statusText}`
      );
      return {
        error: `New Tree Config error! status: ${response.status} ${response.statusText}`,
        config: null,
      };
    }

    const data: TreeConfigPayload = await response.json();
    return data;
  } catch (error) {
    console.error("New Tree Config error:", error);
    return {
      error: error as string,
      config: null,
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `New Tree Config took ${(performance.now() - startTime).toFixed(2)}ms`
      );
    }
  }
}
