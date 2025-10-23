import { TreeConfigPayload } from "@/app/types/payloads";
import { fetchWithAuth } from "@/lib/api/client";

export async function getTreeConfig(
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
      `/tree/config/${conversation_id}`,
      {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
        token,
      }
    );

    if (!response.ok) {
      console.error(
        `Get Tree Config error! status: ${response.status} ${response.statusText}`
      );
      return {
        error: `Get Tree Config error! status: ${response.status} ${response.statusText}`,
        config: null,
      };
    }

    const data: TreeConfigPayload = await response.json();
    return data;
  } catch (error) {
    console.error("Get Tree Config error:", error);
    return {
      error: error as string,
      config: null,
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `get tree config took ${(performance.now() - startTime).toFixed(2)}ms`
      );
    }
  }
}
