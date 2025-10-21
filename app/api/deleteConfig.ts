import { BasePayload } from "@/app/types/payloads";
import { fetchWithAuth } from "@/lib/api/client";

export async function deleteConfig(
  config_id: string | null,
  token?: string
): Promise<BasePayload> {
  const startTime = performance.now();
  try {
    if (!config_id) {
      return {
        error: "No config id",
      };
    }

    const response = await fetchWithAuth(
      `/user/config/${config_id}`,
      {
        method: "DELETE",
        token,
      }
    );

    if (!response.ok) {
      console.error(
        `Deleting Config error! status: ${response.status} ${response.statusText}`
      );
      return {
        error: `Deleting Config error! status: ${response.status} ${response.statusText}`,
      };
    }

    const data: BasePayload = await response.json();

    return data;
  } catch (error) {
    console.error("Deleting Config error:", error);
    return {
      error: error as string,
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Deleting Config took ${(performance.now() - startTime).toFixed(2)}ms`
      );
    }
  }
}
