import { fetchWithAuth } from "@/lib/api/client";
import { FeedbackMetadata } from "@/app/components/types";

export async function getFeedback(
  token?: string
): Promise<FeedbackMetadata> {
  const startTime = performance.now();
  try {
    const response = await fetchWithAuth(`/feedback/metadata`, {
      method: "GET",
      token,
    });

    if (!response.ok) {
      console.error(
        `Get Feedback error! status: ${response.status} ${response.statusText}`
      );
      return {
        total_feedback: 0,
        feedback_by_value: {
          positive: 0,
          negative: 0,
          superpositive: 0,
        },
        feedback_by_date: {},
      };
    }

    const data: FeedbackMetadata = await response.json();
    return data;
  } catch (error) {
    console.error("Get Feedback error:", error);
    return {
      total_feedback: 0,
      feedback_by_value: {
        positive: 0,
        negative: 0,
        superpositive: 0,
      },
      feedback_by_date: {},
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `get feedback took ${(performance.now() - startTime).toFixed(2)}ms`
      );
    }
  }
}
