import { ConfigPayload } from "@/app/types/payloads";
import { fetchWithAuth } from "@/lib/api/client";

export async function getConfig(
  token?: string
): Promise<ConfigPayload> {
  const startTime = performance.now();
  try {
    const response = await fetchWithAuth(`/api/config`, {
      method: "GET",
      token,
    });

    if (!response.ok) {
      console.error(
        `Get Config error! status: ${response.status} ${response.statusText}`
      );
      return {
        error: `Get Config error! status: ${response.status} ${response.statusText}`,
        config: null,
        frontend_config: null,
        warnings: [],
      };
    }

    const data: ConfigPayload = await response.json();
    return data;
  } catch (error) {
    console.error("Get Config error:", error);
    return {
      error: error as string,
      config: null,
      frontend_config: null,
      warnings: [],
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `get config took ${(performance.now() - startTime).toFixed(2)}ms`
      );
    }
  }
}
