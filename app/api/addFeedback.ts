import { fetchWithAuth } from "@/lib/api/client";
import { BasePayload } from "@/app/types/payloads";

export async function addFeedback(
  conversation_id: string,
  query_id: string,
  feedback: number,
  token?: string
): Promise<BasePayload> {
  const startTime = performance.now();
  try {
    const response = await fetchWithAuth(`/feedback/add`, {
      method: "POST",
      body: JSON.stringify({
        conversation_id,
        query_id,
        feedback,
      }),
      token,
    });

    if (!response.ok) {
      console.error(
        `Add Feedback error! status: ${response.status} ${response.statusText}`
      );
      return {
        error: "Failed to add feedback",
      };
    }

    const data: BasePayload = await response.json();
    return data;
  } catch (error) {
    console.error("Add Feedback error:", error);
    return {
      error: "Failed to add feedback",
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `add feedback took ${(performance.now() - startTime).toFixed(2)}ms`
      );
    }
  }
}
