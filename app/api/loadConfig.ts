import { ConfigPayload } from "@/app/types/payloads";
import { fetchWithAuth } from "@/lib/api/client";

export async function loadConfig(
  config_id: string | null,
  token?: string
): Promise<ConfigPayload> {
  const startTime = performance.now();
  try {
    if (!config_id) {
      return {
        error: "No config id",
        config: null,
        frontend_config: null,
        warnings: [],
      };
    }

    const response = await fetchWithAuth(
      `/api/config/${config_id}/load`,
      {
        method: "GET",
        token,
      }
    );

    if (!response.ok) {
      console.error(
        `Loading Config error! status: ${response.status} ${response.statusText}`
      );
      return {
        error: `Loading Config error! status: ${response.status} ${response.statusText}`,
        config: null,
        frontend_config: null,
        warnings: [],
      };
    }
    const data: ConfigPayload = await response.json();

    return data;
  } catch (error) {
    console.error("Loading Config error:", error);
    return {
      error: error as string,
      config: null,
      frontend_config: null,
      warnings: [],
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Loading Config took ${(performance.now() - startTime).toFixed(2)}ms`
      );
    }
  }
}
