import { fetchWithAuth } from "@/lib/api/client";
import { BasePayload } from "@/app/types/payloads";

export async function deleteFeedback(
  conversation_id: string,
  query_id: string,
  token?: string
): Promise<BasePayload> {
  const startTime = performance.now();
  try {
    const response = await fetchWithAuth(`/feedback/remove`, {
      method: "POST",
      body: JSON.stringify({
        conversation_id,
        query_id,
      }),
      token,
    });

    if (!response.ok) {
      console.error(
        `Delete Feedback error! status: ${response.status} ${response.statusText}`
      );
      return {
        error: "Failed to delete feedback",
      };
    }

    const data: BasePayload = await response.json();
    return data;
  } catch (error) {
    console.error("Delete Feedback error:", error);
    return {
      error: "Failed to delete feedback",
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `delete feedback took ${(performance.now() - startTime).toFixed(2)}ms`
      );
    }
  }
}
