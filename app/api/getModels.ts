import { ModelsPayload } from "@/app/types/payloads";
import { fetchWithAuth } from "@/lib/api/client";

export async function getModels(token?: string): Promise<ModelsPayload> {
  const startTime = performance.now();
  try {
    const response = await fetchWithAuth(`/api/config/models`, {
      method: "GET",
      token,
    });

    if (!response.ok) {
      console.error(
        `Error fetching models! status: ${response.status} ${response.statusText}`
      );
      return {
        models: {},
        error: "Error fetching models",
      };
    }

    const data: ModelsPayload = await response.json();
    return data;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return {
      models: {},
      error: "Error fetching models",
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `models/get took ${(performance.now() - startTime).toFixed(2)}ms`
      );
    }
  }
}
