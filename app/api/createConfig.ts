import { ConfigPayload } from "@/app/types/payloads";
import { fetchWithAuth } from "@/lib/api/client";

export async function createConfig(
  token?: string
): Promise<ConfigPayload> {
  const startTime = performance.now();
  try {
    const response = await fetchWithAuth(`/api/config/new`, {
      method: "POST",
      token,
    });

    if (!response.ok) {
      console.error(
        `Creating new Config error! status: ${response.status} ${response.statusText}`
      );
      return {
        error: `Creating new Config error! status: ${response.status} ${response.statusText}`,
        config: null,
        frontend_config: null,
        warnings: [],
      };
    }
    const data: ConfigPayload = await response.json();

    return {
      error: "",
      config: data.config,
      frontend_config: data.frontend_config,
      warnings: data.warnings,
    };
  } catch (error) {
    console.error("Creating new Config error:", error);
    return {
      error: error as string,
      config: null,
      frontend_config: null,
      warnings: [],
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Creating new Config took ${(performance.now() - startTime).toFixed(2)}ms`
      );
    }
  }
}
