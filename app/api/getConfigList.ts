import { ConfigListPayload } from "@/app/types/payloads";
import { fetchWithAuth } from "@/lib/api/client";

export async function getConfigList(
  token?: string
): Promise<ConfigListPayload> {
  const startTime = performance.now();
  try {
    const response = await fetchWithAuth(`/user/config/list`, {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
      token,
    });

    if (!response.ok) {
      console.error(
        `Get Config List error! status: ${response.status} ${response.statusText}`
      );
      return {
        error: `Get Config List error! status: ${response.status} ${response.statusText}`,
        configs: [],
        warnings: [],
      };
    }

    const data: ConfigListPayload = await response.json();
    return data;
  } catch (error) {
    console.error("Get Config List error:", error);
    return {
      error: error as string,
      configs: [],
      warnings: [],
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `config/list took ${(performance.now() - startTime).toFixed(2)}ms`
      );
    }
  }
}
